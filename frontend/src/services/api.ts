import axios from 'axios'
import mockData, { 
  mockGridData, 
  detectAnomalies as mockDetectAnomalies 
} from './mockData'

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If 401 response and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          // If no refresh token, logout the user
          localStorage.removeItem('token')
          window.location.href = '/login'
          return Promise.reject(error)
        }
        
        const response = await axios.post('/api/auth/refresh', { refresh_token: refreshToken })
        const { access_token } = response.data
        
        // Save the new token
        localStorage.setItem('token', access_token)
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (err) {
        // If refresh fails, logout the user
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    
    return Promise.reject(error)
  }
)

// ----- MOCK API IMPLEMENTATIONS -----

// Authentication API calls with mock data
export const login = async (username: string, password: string) => {
  // Trim inputs to handle potential extra spaces from copy-pasting
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  
  // Simple auth check for demo purposes
  if (trimmedUsername === 'demo_recruiter' && trimmedPassword === 'smart_grid_2024') {
    return {
      access_token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 1,
        username: 'demo_recruiter',
        role: 'viewer'
      }
    }
  }
  
  // Simulate failed login
  await new Promise(resolve => setTimeout(resolve, 800)); // Add delay for realism
  throw new Error('Invalid credentials')
}

// Grid visualization API calls
export const getGridVisualization = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200))
  return mockGridData
}

// Grid current calculation API calls
export const calculateCurrents = async (_gridModel: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Create a map of currents by link ID
  const currents: {[key: string]: number} = {}
  mockGridData.links.forEach(link => {
    currents[link.id] = link.current || Math.floor(Math.random() * 500) + 100 // Fallback to random if no current defined
  })
  
  return { currents }
}

// Grid validation API calls
export const validateGrid = async (_gridModel: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Check if any links have critical status
  const criticalLinks = mockGridData.links.filter(link => link.status === 'critical')
  
  return {
    valid: criticalLinks.length === 0,
    issues: criticalLinks.map(link => ({
      link_id: link.id,
      source_id: link.source,
      target_id: link.target,
      issue: 'Overloaded connection',
      severity: 'critical'
    }))
  }
}

// Voltage prediction API calls
export const predictVoltage = async (data: any) => {
  // Simulate network delay and ML processing time
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Use our mock prediction function
  return mockData.predictVoltage(data)
}

// Anomaly detection API calls
export const detectAnomalies = async (data: any) => {
  // Simulate network delay and ML processing time
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Use our mock anomaly detection function
  return mockDetectAnomalies(data.values)
}

// Get load scheduling optimization
export const getLoadScheduling = async () => {
  // Simulate network delay and optimization time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return mockData.loadScheduling
}

// Get carbon impact data
export const getCarbonImpact = async () => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return mockData.carbonImpact
}

// Get cost savings data
export const getCostSavings = async () => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return mockData.costSavings
}

// Get ML integration metrics
export const getMLMetrics = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return mockData.mlIntegration
}

// Get case studies
export const getCaseStudies = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockData.caseStudies
}

export default api 