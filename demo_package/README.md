# Smart Grid Optimization System - Demo Package

This package contains demonstration materials for the Smart Grid Optimization System project.

## Contents

1. **`frontend/`** - React frontend code for the grid visualization dashboard
2. **`sample_data/`** - Sample data and ML results for demonstration purposes
3. **`DEMO_SCRIPT.md`** - A script to follow when demonstrating the project

## Running the Demo

### Frontend Demo

1. Make sure Node.js is installed
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser at http://localhost:5173

### Viewing ML Results

The `sample_data/` directory contains:
- Voltage time series data in CSV format
- ML analysis results in markdown format
- Visualization examples

## Demo Tips

1. **Follow the demo script** - It's structured to highlight the key features of the system
2. **Focus on the frontend visualization** - It's the most immediately impressive part
3. **Explain the ML capabilities** - Use the sample data to show how anomaly detection works
4. **Be prepared for the backend questions** - Understand the FastAPI architecture

## For DeepSeek Analysis

If submitting this to DeepSeek or other AI code assistants:

1. Upload the entire package
2. Ask for analysis of:
   - The React component architecture
   - The D3.js visualization implementation 
   - The integration between the frontend and backend
   - The ML pipeline approach

## Next Steps

To turn this into a fully working system, you would need to:
1. Complete the backend implementation
2. Set up a proper database
3. Implement the WebSocket server for real-time updates
4. Train and deploy the ML models

This demo package focuses on the frontend and ML concepts, which can be demonstrated independently.
