# Smart Grid Optimization System

A comprehensive power grid management and optimization platform using advanced ML techniques for voltage prediction, anomaly detection, and load scheduling. This project demonstrates how AI/ML can be applied to optimize energy distribution, reduce costs, and prevent outages.

## Demo Project for Course Evaluation

This is a demonstration project focusing on the application of machine learning techniques to the power grid domain. The frontend has been fully implemented with realistic mock data to simulate the functionality of a complete system.

## Features

- **Interactive Grid Visualization**: Real-time visualization of power grid topology with node types (power plants, substations, industrial/commercial users)
- **Voltage Monitoring and Prediction**: Time series visualization with LSTM-based prediction
- **Anomaly Detection**: Identifies unusual patterns in voltage data using DBSCAN clustering
- **Load Scheduling Optimization**: Simulates optimal load scheduling based on priorities and costs
- **Business Impact Metrics**: Shows the real-world impact in terms of cost savings, carbon reduction, and outage prevention
- **Case Studies**: Real-world examples of how similar systems have been deployed

## Technical Components

- **Frontend**: React, TypeScript, D3.js for visualization
- **Data Visualization**: Plotly.js for interactive charting
- **Machine Learning**: LSTM networks and DBSCAN clustering (simulated in frontend)
- **State Management**: React Hooks with TypeScript for type safety
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
smart_grid_system/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API and data services
│   │   │   ├── api.ts      # API interface with mock data
│   │   │   └── mockData.ts # Sample data for demonstration
│   │   ├── views/          # Page components
│   │   │   ├── Dashboard/  # Main dashboard view
│   │   │   ├── Login/      # Authentication view
│   │   │   └── MLInsights/ # ML model details view
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── ml_pipeline/            # ML model implementations (for reference)
│   └── models.py           # LSTM and DBSCAN implementations
├── power_grid/             # Power grid simulation
├── load_scheduler/         # C++ load scheduler
├── api/                    # Backend API (for reference)
├── docs/                   # Documentation
└── README.md               # Project documentation
```

## Installation and Running

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Setup

1. Clone this repository
   ```
   git clone https://github.com/yourusername/smart_grid_system.git
   cd smart_grid_system
   ```

2. Install frontend dependencies
   ```
   cd frontend
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open the application in your browser
   ```
   http://localhost:5173
   ```

## Demo Walkthrough

### Login Page
- Use the demo credentials displayed on the login page:
  - Username: `demo_recruiter`
  - Password: `smart_grid_2024`

### Dashboard
- **Energy Network Map**: Shows the grid topology with different types of nodes
  - Click on any node to see its specific voltage data
  - Red nodes indicate detected anomalies
- **Electricity Monitor**: Shows voltage data with predictions for the next 12 hours
- **Smart Grid Scorecard**: Shows the business impact metrics
- **Success Stories**: Real-world case studies of smart grid implementations
- **How it Works**: Simple explanation of the ML pipeline

### ML Insights Page
- **Machine Learning Components**: Details on the ML models used
  - LSTM for voltage prediction
  - DBSCAN for anomaly detection
- **Technical Architecture**: Overview of the system architecture
- **Key Engineering Challenges**: Explanation of the technical difficulties and solutions

## Evaluation Notes

This project demonstrates the following components that can be evaluated:

1. **Frontend Development Skills**:
   - React component architecture
   - TypeScript type safety
   - Data visualization techniques
   - Responsive design

2. **Machine Learning Concepts**:
   - Time series forecasting using LSTM
   - Anomaly detection using DBSCAN
   - ML pipeline design

3. **Business Value**:
   - Clear presentation of business metrics
   - Case studies with ROI analysis

4. **User Experience**:
   - Intuitive visualization for complex data
   - Simple explanations for complex concepts
   - Kid-friendly explanations paired with technical details

5. **Code Structure**:
   - Organized codebase
   - Separation of concerns
   - Mock data implementation for demonstration

## Project Extension Ideas

For a complete implementation, the following components would be added:

1. **Backend API**: FastAPI service for data processing and ML model serving
2. **Database**: Time series database for voltage data storage
3. **ML Training Pipeline**: Automated training and evaluation of models
4. **Real-time Data Processing**: Integration with grid sensors and SCADA systems

## Technical Documentation

For more detailed information about specific components, refer to:

- [ML_DEMONSTRATION.md](ML_DEMONSTRATION.md) - Details on the ML models
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) - Step-by-step walkthrough for demonstrating the system

## Contact

For any questions regarding this project, please contact:
- Email: your.email@example.com 