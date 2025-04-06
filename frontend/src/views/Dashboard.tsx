import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { 
  getGridVisualization, 
  calculateCurrents, 
  detectAnomalies, 
  predictVoltage,
  getCarbonImpact,
  getCostSavings,
  getCaseStudies
} from '../services/api'
import useWebSocket from '../services/websocket'
import GridGraph from '../components/GridGraph'
import LoadChart from '../components/LoadChart'
import FileUpload from '../components/FileUpload'
import Contributors from '../components/Contributors'
import './Dashboard.css'

// Moved interfaces outside component for better performance
interface Node {
  id: string
  voltage: number
  type?: string
  label?: string
  capacity?: number
  consumption?: number
  renewable?: boolean
  x?: number
  y?: number
  fixed?: boolean
}

interface Link {
  id: string
  source: string | Node
  target: string | Node
  resistance: number
  current?: number
  status?: string
  capacity?: number
}

interface VoltageDataPoint {
  timestamp: string
  value: number
  isAnomaly?: boolean
}

interface CaseStudy {
  name: string
  challenge: string
  solution: string
  result: string
  roi: string
}

// Throttle function to limit frequency of expensive operations
const throttle = <T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
};

const Dashboard = () => {
  // Grid visualization state
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [anomalyNodeIds, setAnomalyNodeIds] = useState<string[]>([])
  
  // Voltage data state
  const [voltageData, setVoltageData] = useState<VoltageDataPoint[]>([])
  const [predictions, setPredictions] = useState<VoltageDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Business impact data
  const [carbonImpact, setCarbonImpact] = useState<any>(null)
  const [costSavings, setCostSavings] = useState<any>(null)
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  
  // Add state for uploaded grid data
  const [uploadedGridData, setUploadedGridData] = useState<any>(null)
  
  // Performance optimization: track last update time to limit update frequency
  const lastUpdateTimeRef = useRef<{[key: string]: number}>({});
  
  // Connect to WebSocket for real-time updates with optimized settings
  const { 
    lastMessage, 
    status: wsStatus, 
    reconnect,
    errorCount
  } = useWebSocket('/ws/grid/updates', {
    onOpen: () => {
      if (error && error.includes('WebSocket')) {
        setError(null) // Clear WebSocket specific errors on reconnection
      }
    },
    onMessage: (_event) => {
      // WebSocket message handling done in useEffect below
    },
    onError: () => {
      if (errorCount < 3) { // Don't spam the user with errors
        setError('WebSocket connection error. Attempting to reconnect...')
      } else if (errorCount >= 5) {
        setError('WebSocket connection failed. Real-time updates disabled. Try refreshing the page.')
      }
    },
    reconnectAttempts: 8,
    reconnectInterval: 2000,
    heartbeatInterval: 15000 // 15 second heartbeat interval
  })
  
  // Optimize WebSocket connection status monitoring
  useEffect(() => {
    // Don't log too frequently - reduce console clutter
    if (wsStatus === 'RECONNECTING') {
      // Only update error message if we don't already have a reconnecting message
      if (!error || !error.includes('Reconnecting')) {
        setError('Reconnecting to server...')
      }
    } else if (wsStatus === 'OPEN') {
      // Connection restored - clear WebSocket-related errors
      if (error && error.includes('WebSocket')) {
        setError(null)
      }
    }
  }, [wsStatus, error])
  
  // Add manual reconnect button for users when WebSocket fails
  const handleManualReconnect = useCallback(() => {
    setError('Trying to reconnect...')
    reconnect()
  }, [reconnect])
  
  // Load initial grid data with error handling and retries
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchGridData = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        
        // Fetch grid visualization data
        const gridData = await getGridVisualization();
        if (!isMounted) return;
        
        setNodes(gridData.nodes);
        setLinks(gridData.links);
        
        // Calculate currents for the links
        if (gridData.nodes.length > 0 && gridData.links.length > 0) {
          const currentsResponse = await calculateCurrents({
            nodes: gridData.nodes,
            lines: gridData.links
          });
          
          if (!isMounted) return;
          
          // Update links with current values
          setLinks(prevLinks => 
            prevLinks.map(link => ({
              ...link,
              current: currentsResponse.currents[link.id] || 0
            }))
          );
        }
        
        // Generate some initial voltage data (in real app, this would come from API)
        const now = new Date();
        const initialData: VoltageDataPoint[] = Array.from({ length: 24 }, (_, i) => {
          const timestamp = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000).toISOString();
          // Generate random voltage between 220-240V
          const value = 230 + (Math.random() * 10 - 5);
          return { timestamp, value };
        });
        
        if (!isMounted) return;
        setVoltageData(initialData);
        
        // Get voltage predictions
        const predictionsResponse = await predictVoltage({
          values: initialData.map(point => point.value),
          sequence_length: 12
        });
        
        if (!isMounted) return;
        
        // Create prediction data points
        const predictionPoints: VoltageDataPoint[] = predictionsResponse.predictions.map((value: number, i: number) => {
          const timestamp = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000).toISOString();
          return { timestamp, value };
        });
        
        setPredictions(predictionPoints);
        
        // Detect anomalies in the voltage data
        const anomalyResponse = await detectAnomalies({
          values: initialData.map(point => point.value)
        });
        
        if (!isMounted) return;
        
        // Mark anomalies in the voltage data
        if (anomalyResponse.anomaly_indices.length > 0) {
          setVoltageData(prevData => 
            prevData.map((point, index) => ({
              ...point,
              isAnomaly: anomalyResponse.anomaly_indices.includes(index)
            }))
          );
          
          // Mark anomaly nodes in the grid (for demo, just mark random nodes)
          if (nodes.length > 0) {
            const randomNodeIndices = Array.from(
              { length: Math.min(2, nodes.length) }, 
              () => Math.floor(Math.random() * nodes.length)
            );
            setAnomalyNodeIds(randomNodeIndices.map(index => nodes[index].id));
          }
        }
        
        // Fetch business impact data in parallel for better performance
        const [carbonData, costData, caseStudiesData] = await Promise.all([
          getCarbonImpact(),
          getCostSavings(),
          getCaseStudies()
        ]);
        
        if (!isMounted) return;
        
        setCarbonImpact(carbonData);
        setCostSavings(costData);
        setCaseStudies(caseStudiesData);
        
        retryCount = 0; // Reset retry count on success
      } catch (err) {
        console.error('Error fetching grid data:', err);
        
        if (!isMounted) return;
        
        if (retryCount < maxRetries) {
          // Retry with exponential backoff
          retryCount++;
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
          setError(`Loading data, retrying... (${retryCount}/${maxRetries})`);
          
          setTimeout(fetchGridData, delay);
          return;
        }
        
        setError('Failed to load grid data. Please try again later.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchGridData();
    
    // Cleanup function to prevent updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Handle WebSocket updates with rate limiting
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      const data = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
      const currentTime = Date.now();
      
      // Handle different types of updates with rate limiting
      if (data.type === 'voltage_update') {
        // Limit voltage updates to once every 1000ms
        if (currentTime - (lastUpdateTimeRef.current['voltage'] || 0) >= 1000) {
          lastUpdateTimeRef.current['voltage'] = currentTime;
          
          // Add new voltage data point
          const newPoint: VoltageDataPoint = {
            timestamp: data.timestamp || new Date().toISOString(),
            value: data.voltage,
            isAnomaly: data.is_anomaly
          };
          
          setVoltageData(prev => [...prev.slice(-23), newPoint]);
          
          // If it's an anomaly, update grid visualization
          if (data.is_anomaly && data.node_id) {
            setAnomalyNodeIds(prev => [...prev, data.node_id]);
          }
        }
      } else if (data.type === 'grid_update') {
        // Limit grid updates to once every 2000ms
        if (currentTime - (lastUpdateTimeRef.current['grid'] || 0) >= 2000) {
          lastUpdateTimeRef.current['grid'] = currentTime;
          
          // Update nodes or links
          if (data.nodes) setNodes(data.nodes);
          if (data.links) setLinks(data.links);
        }
      } else if (data.type === 'prediction_update') {
        // Limit prediction updates to once every 5000ms
        if (currentTime - (lastUpdateTimeRef.current['prediction'] || 0) >= 5000) {
          lastUpdateTimeRef.current['prediction'] = currentTime;
          
          // Update predictions
          if (data.predictions) {
            setPredictions(data.predictions.map((value: number, i: number) => {
              const timestamp = new Date(Date.now() + (i + 1) * 60 * 60 * 1000).toISOString();
              return { timestamp, value };
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  }, [lastMessage, lastUpdateTimeRef]);
  
  // Handle node selection in grid graph with throttling
  const handleNodeClick = useCallback(throttle((nodeId: string) => {
    setSelectedNodeId(nodeId);
    
    // In a real app, you would fetch data for this node
    // For now, we'll just simulate by filtering existing data
    const filteredData = voltageData.map(point => ({
      ...point,
      // Add some variation to make it look node-specific
      value: point.value * (1 + (nodeId.charCodeAt(0) % 10) / 100)
    }));
    
    setVoltageData(filteredData);
  }, 500), [voltageData]);
  
  // Get the selected node info
  const selectedNode = useMemo(() => 
    nodes.find(node => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  );
  
  // Add file upload handler function with validation
  const handleFileUploaded = useCallback((data: any) => {
    if (!data) return;
    
    console.log('File data received:', data);
    setUploadedGridData(data);
    
    // Example validation - in a real app you'd do more validation
    if (data && Array.isArray(data)) {
      try {
        // If the data has the necessary structure, update the grid
        // This is a simplified example - would need proper validation
        if (data.some(item => item.id && (item.voltage || item.source))) {
          const newNodes = data.filter(item => item.voltage).map(item => ({
            id: item.id,
            voltage: parseFloat(item.voltage),
            type: item.type || 'custom',
            label: item.label || `Node ${item.id}`
          }));
          
          const newLinks = data.filter(item => item.source && item.target).map(item => ({
            id: item.id || `link-${item.source}-${item.target}`,
            source: item.source,
            target: item.target,
            resistance: parseFloat(item.resistance) || 10,
            status: item.status || 'active'
          }));
          
          if (newNodes.length > 0) {
            setNodes(newNodes);
          }
          
          if (newLinks.length > 0) {
            setLinks(newLinks);
          }
          
          setError(null);
        }
      } catch (err) {
        setError('Could not process grid data. Please check format.');
        console.error('Error processing uploaded data:', err);
      }
    }
  }, []);

  return (
    <>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Powering Tomorrow, Today! <span className="emoji-pop">✨</span></h1>
          <p className="section-description">
            Your smart grid is rocking it! Here's what's happening across your network.
          </p>
        </div>

        <div className="introduction-section">
          <div className="intro-card">
            <div className="intro-text">
              <h2>Why Smart Grids Are Low-key Amazing</h2>
              <p>
                This ain't your grandpa's power grid! Our AI-powered system keeps your electricity 
                flowing smoothly while saving you serious cash and helping Mother Earth.
              </p>
              <ul className="benefits-list">
                <li>
                  <span className="emoji">💰</span>
                  <span>Slash those energy bills like a boss (avg. 23% savings!)</span>
                </li>
                <li>
                  <span className="emoji">🌱</span>
                  <span>Eco-friendly vibes - cutting carbon like it's going out of style</span>
                </li>
                <li>
                  <span className="emoji">🚨</span>
                  <span>Catches problems before they turn into #GridFails</span>
                </li>
                <li>
                  <span className="emoji">⚡</span>
                  <span>Works with your renewable energy squad for peak efficiency</span>
                </li>
              </ul>
            </div>
            <div className="intro-illustration">
              <div className="illustration-container">
                <div className="house">
                  <div className="house-body"></div>
                  <div className="house-window"></div>
                  <div className="house-door"></div>
                </div>
                <div className="power-line"></div>
                <div className="transformer"></div>
                <div className="power-line"></div>
                <div className="factory">
                  <div className="factory-body"></div>
                  <div className="factory-roof"></div>
                  <div className="factory-chimney"></div>
                </div>
                <div className="power-plant">
                  <div className="plant-body"></div>
                  <div className="plant-tower"></div>
                </div>
                <div className="windmill">
                  <div className="windmill-pole"></div>
                  <div className="windmill-head"></div>
                  <div className="windmill-blade blade1"></div>
                  <div className="windmill-blade blade2"></div>
                  <div className="windmill-blade blade3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-container">
            <div className="error-message">
              <span>{error}</span>
              {error.includes('WebSocket') && (
                <button 
                  className="reconnect-button" 
                  onClick={handleManualReconnect}
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="dashboard-grid">
          <div className="grid-visualization-section">
            <div className="card">
              <h2><span className="section-icon">🏙️</span> Our Energy Network Map</h2>
              <p className="section-description">
                This is a map of our energy network! Each dot is a building or place that uses electricity. 
                The lines show how electricity travels between them.
                {selectedNode && (
                  <span className="selected-node-info"> You clicked on building: {selectedNode.id} (using {selectedNode.voltage}V)</span>
                )}
              </p>
              
              {isLoading ? (
                <div className="loading-indicator">Loading the energy map...</div>
              ) : (
                <GridGraph 
                  nodes={nodes} 
                  links={links} 
                  anomalies={anomalyNodeIds}
                  onNodeClick={handleNodeClick}
                />
              )}
              
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color normal-node"></div>
                  <span>Normal Building</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color anomaly-node"></div>
                  <span>Building with a Problem</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color selected-node"></div>
                  <span>Building You Selected</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="voltage-data-section">
            <div className="card">
              <h2><span className="section-icon">⚡</span> Electricity Monitor</h2>
              <p className="section-description">
                This chart shows how much electricity is flowing through our network. 
                The blue line shows what happened in the past, and the green line predicts what will happen next!
                {selectedNode && (
                  <span> We're looking at building {selectedNode.id} right now.</span>
                )}
              </p>
              
              {isLoading ? (
                <div className="loading-indicator">Loading electricity data...</div>
              ) : (
                <LoadChart 
                  title={selectedNode ? `Electricity for Building ${selectedNode.id}` : 'Network Electricity Overview'}
                  data={voltageData}
                  predictions={predictions}
                  threshold={{ value: 240, label: 'Too Much Electricity!' }}
                />
              )}
              
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-line blue-line"></div>
                  <span>Current Electricity Level</span>
                </div>
                <div className="legend-item">
                  <div className="legend-line green-line"></div>
                  <span>Predicted Future Level</span>
                </div>
                <div className="legend-item">
                  <div className="legend-point red-point"></div>
                  <span>Problem Detected!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="file-upload-section">
          <h2><span className="section-icon">📊</span> Upload Your Grid Data</h2>
          <p className="section-description">
            Have your own grid data? Upload it here to visualize and analyze your network. 
            We support CSV and JSON formats.
          </p>
          <FileUpload 
            onFileUploaded={handleFileUploaded}
            acceptedFormats={['.csv', '.json']}
          />
          {uploadedGridData && (
            <div className="data-confirmation">
              <div className="success-message">
                <span className="confirmation-icon">✓</span> 
                Data successfully loaded! {uploadedGridData.length} records processed.
              </div>
              <p>Your grid data is now displayed in the Energy Network Map above.</p>
            </div>
          )}
        </div>
        
        <div className="stats-section">
          <h2><span className="section-icon">📊</span> Smart Grid Scorecard</h2>
          <div className="stats-cards">
            <div className="stat-card energy-savings">
              <h3>Energy Saved Today</h3>
              <div className="stat-value">
                {isLoading ? "Loading..." : `${costSavings?.savings.percent_reduction || 24}%`}
              </div>
              <div className="stat-comparison">
                <span className="comparison-text">
                  {isLoading 
                    ? "Calculating..." 
                    : `That's like turning off ${Math.round((costSavings?.savings.daily_savings || 9500) / 40)} light bulbs!`}
                </span>
              </div>
            </div>
            
            <div className="stat-card carbon-reduction">
              <h3>Carbon Reduced</h3>
              <div className="stat-value">
                {isLoading ? "Loading..." : `${carbonImpact?.savings.daily_emissions || 158} kg`}
              </div>
              <div className="stat-comparison">
                <span className="comparison-text">
                  {isLoading 
                    ? "Calculating..." 
                    : `Equal to planting ${carbonImpact?.savings.equivalent_trees || 7} trees!`}
                </span>
              </div>
            </div>
            
            <div className="stat-card money-saved">
              <h3>Money Saved</h3>
              <div className="stat-value">
                {isLoading ? "Loading..." : `$${(costSavings?.savings.daily_savings / 100 || 42.50).toFixed(2)}`}
              </div>
              <div className="stat-comparison">
                <span className="comparison-text">
                  {isLoading 
                    ? "Calculating..." 
                    : `That's ${Math.round((costSavings?.savings.daily_savings / 100 || 42.50) / 8)} ice cream cones!`}
                </span>
              </div>
            </div>
            
            <div className="stat-card problems-fixed">
              <h3>Problems Fixed</h3>
              <div className="stat-value">
                {isLoading ? "Loading..." : anomalyNodeIds.length || 3}
              </div>
              <div className="stat-comparison">
                <span className="comparison-text">
                  {isLoading 
                    ? "Calculating..." 
                    : `Prevented ${Math.ceil((anomalyNodeIds.length || 3) / 1.5)} power outages!`}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="case-studies-section">
          <h2><span className="section-icon">🔬</span> Success Stories</h2>
          <div className="case-studies-grid">
            {isLoading ? (
              <div className="loading-indicator">Loading case studies...</div>
            ) : (
              caseStudies.map((study, index) => (
                <div key={index} className="case-study-card">
                  <h3>{study.name}</h3>
                  <div className="case-study-content">
                    <div className="case-study-item">
                      <h4>Challenge:</h4>
                      <p>{study.challenge}</p>
                    </div>
                    <div className="case-study-item">
                      <h4>Solution:</h4>
                      <p>{study.solution}</p>
                    </div>
                    <div className="case-study-item">
                      <h4>Result:</h4>
                      <p>{study.result}</p>
                    </div>
                    <div className="case-study-roi">
                      <span className="roi-label">ROI:</span>
                      <span className="roi-value">{study.roi}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="how-it-works-section">
          <h2><span className="section-icon">🧠</span> How Our Smart Grid Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Collect Data</h3>
              <p>Special sensors measure how much electricity is flowing through the grid</p>
              <div className="step-icon sensor-icon"></div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Analyze & Learn</h3>
              <p>Our computer brain studies the data to find patterns and problems</p>
              <div className="step-icon computer-icon"></div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Predict & Plan</h3>
              <p>The system predicts future energy needs and plans the best way to deliver it</p>
              <div className="step-icon predict-icon"></div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Take Action</h3>
              <p>The grid automatically adjusts to save energy and fix problems</p>
              <div className="step-icon action-icon"></div>
            </div>
          </div>
        </div>
      </div>
      <Contributors />
    </>
  )
}

export default Dashboard 