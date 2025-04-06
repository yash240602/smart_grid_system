import { useEffect, useState, useCallback, useRef } from 'react'

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  reconnectAttempts?: number
  reconnectInterval?: number
  reconnect?: boolean
  heartbeatInterval?: number // New option for heartbeat
}

type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'UNINSTANTIATED' | 'RECONNECTING'

// Define a constant for mock mode instead of using process.env directly
const MOCK_WEBSOCKET = false; // Set to true to enable mock mode for development

/**
 * Custom hook for managing WebSocket connections with auto-reconnect and improved reliability
 */
export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<WebSocketStatus>('UNINSTANTIATED')
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [errorCount, setErrorCount] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)
  
  // Default options with better defaults
  const defaultOptions = {
    reconnect: true,
    reconnectAttempts: 10,
    reconnectInterval: 2000,
    heartbeatInterval: 30000, // 30 second heartbeat interval
    ...options
  }
  
  // Refs to keep track of reconnect logic
  const reconnectCount = useRef(0)
  const reconnectTimerRef = useRef<number | null>(null)
  const heartbeatTimerRef = useRef<number | null>(null)
  const messageQueueRef = useRef<any[]>([])
  
  // Function to handle sending heartbeat pings
  const sendHeartbeat = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }))
      } catch (err) {
        console.warn('Failed to send heartbeat', err)
      }
    }
  }, [])
  
  // Function to set up heartbeat interval
  const setupHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      window.clearInterval(heartbeatTimerRef.current)
    }
    
    heartbeatTimerRef.current = window.setInterval(() => {
      sendHeartbeat()
    }, defaultOptions.heartbeatInterval)
    
    return () => {
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
    }
  }, [defaultOptions.heartbeatInterval, sendHeartbeat])
  
  // Create WebSocket connection
  const connect = useCallback(() => {
    // Check for mock mode for development/testing
    if (MOCK_WEBSOCKET) {
      console.log('WebSocket in mock mode')
      setStatus('OPEN')
      return null
    }
    
    // Get authentication token
    const token = localStorage.getItem('token')
    if (!token) {
      return null
    }
    
    // Cleanup any existing connection attempt
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    
    if (socketRef.current) {
      try {
        socketRef.current.close()
      } catch (e) {
        // Ignore errors on close
      }
    }
    
    try {
      // Add token to WebSocket URL for authentication
      const wsUrl = `${url}?token=${token}`
      
      // Create WebSocket connection
      const ws = new WebSocket(wsUrl)
      socketRef.current = ws
      setSocket(ws)
      
      // Update status based on WebSocket readyState
      const updateStatus = () => {
        if (!ws) return
        
        switch (ws.readyState) {
          case WebSocket.CONNECTING:
            setStatus('CONNECTING')
            break
          case WebSocket.OPEN:
            setStatus('OPEN')
            reconnectCount.current = 0 // Reset reconnect counter on successful connection
            setErrorCount(0) // Reset error counter
            
            // Process any queued messages
            if (messageQueueRef.current.length > 0) {
              const queue = [...messageQueueRef.current]
              messageQueueRef.current = []
              
              queue.forEach(msg => {
                try {
                  ws.send(JSON.stringify(msg))
                } catch (err) {
                  console.error('Failed to send queued message:', err)
                }
              })
            }
            
            // Set up heartbeat
            setupHeartbeat()
            break
          case WebSocket.CLOSING:
            setStatus('CLOSING')
            break
          case WebSocket.CLOSED:
            setStatus('CLOSED')
            break
          default:
            setStatus('UNINSTANTIATED')
        }
      }
      
      // Set up event listeners with debounced message handling
      let messageBuffer: any[] = []
      let messageTimeout: number | null = null
      
      ws.onopen = (event) => {
        updateStatus()
        if (defaultOptions.onOpen) defaultOptions.onOpen(event)
      }
      
      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          // Handle heartbeat responses separately (don't trigger UI updates)
          if (parsedData.type === 'heartbeat_response') {
            // Just log or handle silently
            return
          }
          
          // Buffer messages and process in batches for better performance
          messageBuffer.push(parsedData)
          
          if (!messageTimeout) {
            messageTimeout = window.setTimeout(() => {
              // Process all buffered messages at once
              if (messageBuffer.length > 0) {
                // Only set the most recent message for UI updates
                setLastMessage(messageBuffer[messageBuffer.length - 1])
                
                // Call onMessage for each message if provided
                if (defaultOptions.onMessage) {
                  messageBuffer.forEach(data => {
                    const syntheticEvent = { ...event, data: JSON.stringify(data) } as MessageEvent
                    defaultOptions.onMessage!(syntheticEvent)
                  })
                }
                
                messageBuffer = []
              }
              messageTimeout = null
            }, 100) // Process messages in 100ms batches
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }
      
      ws.onerror = (event) => {
        const newErrorCount = errorCount + 1
        setErrorCount(newErrorCount)
        
        // Only log errors occasionally to avoid console spam
        if (newErrorCount <= 3 || newErrorCount % 5 === 0) {
          console.error('WebSocket error:', event)
        }
        
        if (defaultOptions.onError) defaultOptions.onError(event)
      }
      
      ws.onclose = (event) => {
        updateStatus()
        
        // Clean up timers
        if (messageTimeout) {
          window.clearTimeout(messageTimeout)
          messageTimeout = null
        }
        
        if (heartbeatTimerRef.current) {
          window.clearInterval(heartbeatTimerRef.current)
          heartbeatTimerRef.current = null
        }
        
        if (defaultOptions.onClose) defaultOptions.onClose(event)
        
        // Auto reconnect logic with exponential backoff
        if (defaultOptions.reconnect && 
            reconnectCount.current < defaultOptions.reconnectAttempts) {
          setStatus('RECONNECTING')
          reconnectCount.current += 1
          
          // Calculate delay with jitter to prevent thundering herd problem
          const baseDelay = defaultOptions.reconnectInterval * Math.pow(1.5, reconnectCount.current - 1)
          const jitter = Math.random() * 1000 // Add up to 1s of random jitter
          const delay = Math.min(baseDelay + jitter, 30000) // Cap at 30 seconds
          
          console.log(`WebSocket reconnecting in ${Math.round(delay/1000)}s (attempt ${reconnectCount.current})`)
          
          // Set timer for reconnection
          reconnectTimerRef.current = window.setTimeout(() => {
            connect()
          }, delay)
        }
      }
      
      return ws
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      return null
    }
  }, [url, defaultOptions, errorCount, setupHeartbeat])
  
  // Initialize WebSocket connection
  useEffect(() => {
    const ws = connect()
    
    // Clean up on unmount
    return () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
      }
      
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current)
      }
      
      if (ws) {
        try {
          ws.close()
        } catch (e) {
          // Ignore errors on close
        }
      }
    }
  }, [connect])
  
  // Reconnect manually with debouncing to prevent rapid reconnection attempts
  const reconnect = useCallback(() => {
    // Prevent multiple rapid reconnection attempts
    if (status === 'RECONNECTING') return
    
    if (socket) {
      try {
        socket.close()
      } catch (e) {
        // Ignore errors on close
      }
    }
    
    reconnectCount.current = 0 // Reset reconnect counter
    setStatus('RECONNECTING')
    
    // Add a slight delay before reconnecting to allow time for cleanup
    reconnectTimerRef.current = window.setTimeout(() => {
      connect()
    }, 500)
  }, [socket, connect, status])
  
  // Improved sendMessage with queuing for better reliability
  const sendMessage = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(data))
        return true
      } catch (err) {
        console.error('Error sending WebSocket message:', err)
        
        // Queue message for retry if not a heartbeat
        if (data.type !== 'heartbeat') {
          messageQueueRef.current.push(data)
        }
        
        return false
      }
    } else if (socket && socket.readyState === WebSocket.CONNECTING) {
      // Queue message if socket is connecting
      messageQueueRef.current.push(data)
      return true
    } else {
      // Queue message and attempt reconnect if socket is closed
      if (data.type !== 'heartbeat') {
        messageQueueRef.current.push(data)
        
        // Try to reconnect if not currently reconnecting
        if (status !== 'RECONNECTING' && defaultOptions.reconnect) {
          reconnect()
        }
      }
      
      return false
    }
  }, [socket, reconnect, status, defaultOptions.reconnect])
  
  // Function to manually close the connection
  const close = useCallback(() => {
    if (socket) {
      // Disable reconnect before closing
      reconnectCount.current = defaultOptions.reconnectAttempts 
      
      try {
        socket.close()
      } catch (e) {
        // Ignore errors on close
      }
    }
  }, [socket, defaultOptions.reconnectAttempts])
  
  return { 
    socket, 
    status, 
    lastMessage, 
    sendMessage, 
    close, 
    reconnect, 
    errorCount,
    // Add queue status for debugging
    queueLength: messageQueueRef.current.length
  }
}

export default useWebSocket