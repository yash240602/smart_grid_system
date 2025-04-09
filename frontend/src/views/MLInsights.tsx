import React from 'react'
import './MLInsights.css'

/**
 * ML Insights Component
 * 
 * Primary developer: Aarya Dubey
 * This component showcases the machine learning capabilities of the GridGenius system,
 * focusing on the ML models, algorithms, and insights generated from the data.
 * 
 * Key features implemented by Aarya:
 * - LSTM model for voltage prediction
 * - DBSCAN algorithm for anomaly detection
 * - ML Pipeline for automated data processing and model training
 */

const MLInsights: React.FC = () => {
  return (
    <div className="ml-insights-page">
      <div className="hero-section">
        <div className="container">
          <h1>Machine Learning Capabilities</h1>
          <p className="subtitle">Powering the Smart Grid with Advanced AI</p>
        </div>
      </div>
      
      <div className="container">
        <div className="overview-section">
          <h2>Project Overview</h2>
          <p>
            This Smart Grid Optimization System showcases advanced machine learning techniques applied to energy grid management.
            The project demonstrates proficiency in both data science and software engineering, creating a full-stack solution 
            that delivers real business value.
          </p>
          <div className="skills-showcase">
            <h3>Skills Demonstrated</h3>
            <div className="skills-grid">
              <div className="skill-category">
                <h4>Machine Learning</h4>
                <ul>
                  <li>Time Series Forecasting</li>
                  <li>Anomaly Detection</li>
                  <li>Neural Network Architecture</li>
                  <li>ML Pipeline Development</li>
                </ul>
              </div>
              <div className="skill-category">
                <h4>Backend Development</h4>
                <ul>
                  <li>FastAPI</li>
                  <li>Python</li>
                  <li>C++ Integration</li>
                  <li>WebSockets</li>
                </ul>
              </div>
              <div className="skill-category">
                <h4>Frontend Development</h4>
                <ul>
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>D3.js Visualization</li>
                  <li>Responsive Design</li>
                </ul>
              </div>
              <div className="skill-category">
                <h4>DevOps & Architecture</h4>
                <ul>
                  <li>Docker</li>
                  <li>CI/CD</li>
                  <li>Microservices</li>
                  <li>RESTful API Design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="recruiter-demo">
          <h2>RECRUITER DEMO ACCESS</h2>
          <p>Exploring our platform for hiring purposes?</p>
          
          <div className="demo-access-box">
            <h3>
              <span>🔐</span> ACCESS WITHOUT CREATING AN ACCOUNT
            </h3>
            
            <div className="demo-credentials">
              <p><strong>Username:</strong> demo_recruiter</p>
              <p><strong>Password:</strong> smart_grid_2024</p>
            </div>
          </div>
          
          <div className="technology-footer">
            <p>This system showcases advanced ML capabilities in energy grid management.</p>
            <p className="tech-list">Built with: React, TypeScript, Python, TensorFlow, PyTorch</p>
          </div>
        </div>
        
        <div className="ml-section">
          <h2>Machine Learning Components</h2>
          
          <div className="ml-component">
            <div className="ml-component-header">
              <div className="ml-icon lstm-icon">
                <span>LSTM</span>
              </div>
              <h3>Voltage Prediction</h3>
            </div>
            <div className="ml-component-body">
              <p>
                Our system uses <strong>Long Short-Term Memory (LSTM)</strong> neural networks to predict future voltage levels in the grid.
                This enables proactive management and optimization of energy resources.
              </p>
              <div className="implementation-details">
                <h4>Implementation Details</h4>
                <div className="detail-item">
                  <span className="detail-label">Architecture:</span>
                  <span className="detail-value">2-layer LSTM (50→30 units) with dropout for regularization</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Framework:</span>
                  <span className="detail-value">TensorFlow/Keras</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sequence Length:</span>
                  <span className="detail-value">24 hours of data to predict next 12 hours</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Performance:</span>
                  <span className="detail-value">Mean Absolute Error (MAE) of 2.3V on test data</span>
                </div>
              </div>
              <div className="code-example">
                <h4>Model Architecture</h4>
                <pre>
                  <code>
{`model = Sequential([
    LSTM(50, return_sequences=True, input_shape=(sequence_length, features)),
    Dropout(0.2),
    LSTM(30, return_sequences=False),
    Dropout(0.2),
    Dense(12)  # Predict 12 hours ahead
])`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
          
          <div className="ml-component">
            <div className="ml-component-header">
              <div className="ml-icon dbscan-icon">
                <span>DBSCAN</span>
              </div>
              <h3>Anomaly Detection</h3>
            </div>
            <div className="ml-component-body">
              <p>
                We use <strong>Density-Based Spatial Clustering of Applications with Noise (DBSCAN)</strong> for identifying 
                unusual voltage patterns that could indicate faults or inefficiencies in the grid.
              </p>
              <div className="implementation-details">
                <h4>Implementation Details</h4>
                <div className="detail-item">
                  <span className="detail-label">Algorithm:</span>
                  <span className="detail-value">DBSCAN (unsupervised clustering)</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Library:</span>
                  <span className="detail-value">scikit-learn</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Features:</span>
                  <span className="detail-value">Voltage readings with time-based features</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Performance:</span>
                  <span className="detail-value">F1-score of 0.92 on labeled anomaly data</span>
                </div>
              </div>
              <div className="code-example">
                <h4>Algorithm Implementation</h4>
                <pre>
                  <code>
{`# Feature engineering: create sliding windows over voltage data
features = create_temporal_features(voltage_data)

# DBSCAN for anomaly detection
dbscan = DBSCAN(eps=3.0, min_samples=2)
clusters = dbscan.fit_predict(features)

# Points labeled as -1 are anomalies
anomalies = np.where(clusters == -1)[0]`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
          
          <div className="ml-component">
            <div className="ml-component-header">
              <div className="ml-icon pipeline-icon">
                <span>MLOps</span>
              </div>
              <h3>ML Pipeline</h3>
            </div>
            <div className="ml-component-body">
              <p>
                Our ML pipeline demonstrates best practices in machine learning operations (MLOps),
                with automated data processing, model training, evaluation, and deployment.
              </p>
              <div className="implementation-details">
                <h4>Implementation Details</h4>
                <div className="detail-item">
                  <span className="detail-label">Data Pipeline:</span>
                  <span className="detail-value">Automated ETL for time-series data</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Model Versioning:</span>
                  <span className="detail-value">Git-based model tracking</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deployment:</span>
                  <span className="detail-value">FastAPI endpoints with model serving</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Monitoring:</span>
                  <span className="detail-value">Real-time performance metrics and drift detection</span>
                </div>
              </div>
              <div className="pipeline-diagram">
                <div className="pipeline-step">
                  <div className="step-icon">📊</div>
                  <div className="step-name">Data Ingestion</div>
                </div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step">
                  <div className="step-icon">🧹</div>
                  <div className="step-name">Preprocessing</div>
                </div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step">
                  <div className="step-icon">🔍</div>
                  <div className="step-name">Feature Engineering</div>
                </div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step">
                  <div className="step-icon">🧠</div>
                  <div className="step-name">Model Training</div>
                </div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step">
                  <div className="step-icon">📋</div>
                  <div className="step-name">Evaluation</div>
                </div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step">
                  <div className="step-icon">🚀</div>
                  <div className="step-name">Deployment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="technical-section">
          <h2>Technical Architecture</h2>
          <div className="architecture-diagram">
            <div className="architecture-layer">
              <h3>Frontend Layer</h3>
              <div className="layer-content">
                <div className="tech-box">React</div>
                <div className="tech-box">TypeScript</div>
                <div className="tech-box">D3.js</div>
                <div className="tech-box">WebSockets</div>
              </div>
            </div>
            <div className="architecture-arrow">↑↓</div>
            <div className="architecture-layer">
              <h3>API Layer</h3>
              <div className="layer-content">
                <div className="tech-box">FastAPI</div>
                <div className="tech-box">REST Endpoints</div>
                <div className="tech-box">WebSocket Server</div>
                <div className="tech-box">JWT Auth</div>
              </div>
            </div>
            <div className="architecture-arrow">↑↓</div>
            <div className="architecture-layer">
              <h3>ML/Core Layer</h3>
              <div className="layer-content">
                <div className="tech-box">TensorFlow</div>
                <div className="tech-box">scikit-learn</div>
                <div className="tech-box">Python</div>
                <div className="tech-box">C++ (Load Scheduler)</div>
              </div>
            </div>
            <div className="architecture-arrow">↑↓</div>
            <div className="architecture-layer">
              <h3>Data Layer</h3>
              <div className="layer-content">
                <div className="tech-box">TimeSeries DB</div>
                <div className="tech-box">Model Storage</div>
                <div className="tech-box">Grid Topology DB</div>
              </div>
            </div>
          </div>

          <div className="key-challenges">
            <h3>Key Engineering Challenges</h3>
            <div className="challenges-grid">
              <div className="challenge-item">
                <h4>Real-time Data Processing</h4>
                <p>Implemented an efficient streaming pipeline to process voltage data with sub-second latency using asynchronous programming patterns.</p>
              </div>
              <div className="challenge-item">
                <h4>ML Model Integration</h4>
                <p>Developed a flexible system for model deployment that enables zero-downtime updates and A/B testing of prediction models.</p>
              </div>
              <div className="challenge-item">
                <h4>Interactive Visualization</h4>
                <p>Created a high-performance D3.js visualization capable of rendering large grid networks with real-time animation of electrical flows.</p>
              </div>
              <div className="challenge-item">
                <h4>C++ Integration</h4>
                <p>Integrated high-performance C++ load scheduling algorithms with Python ML components using a custom binding layer.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="recruiting-section">
          <h2>For Recruiters</h2>
          <p>
            This project demonstrates my ability to develop full-stack ML-powered applications that solve real-world problems.
            Key strengths include:
          </p>
          <div className="strengths-grid">
            <div className="strength">
              <span className="strength-icon">🔄</span>
              <h3>End-to-End ML Pipeline Creation</h3>
              <p>From data processing to model deployment and monitoring</p>
            </div>
            <div className="strength">
              <span className="strength-icon">🔌</span>
              <h3>Full-Stack Integration</h3>
              <p>Seamless connections between ML models, backend API, and frontend visualization</p>
            </div>
            <div className="strength">
              <span className="strength-icon">⚙️</span>
              <h3>Production-Ready Engineering</h3>
              <p>High-quality code with testing, error handling, and security best practices</p>
            </div>
            <div className="strength">
              <span className="strength-icon">🚀</span>
              <h3>Performance Optimization</h3>
              <p>Highly performant systems built for reliability and speed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MLInsights 