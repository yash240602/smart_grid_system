/**
 * Smart Grid Mockup Data
 * 
 * This file provides realistic mock data for demonstrating the Smart Grid Optimization System
 * to recruiters at companies like NVIDIA, Siemens, Goldman Sachs, and BlackRock.
 */

// GRID DATA: Realistic power grid network structure with nodes representing 
// different types of elements (power plants, industrial users, residential areas, etc.)
export const mockGridData = {
  nodes: [
    // Power Generation Nodes
    { id: "PP1", type: "powerplant", label: "Nuclear Plant", voltage: 500.0, capacity: 1200, renewable: false, lat: 34.12, lng: -118.45 },
    { id: "PP2", type: "powerplant", label: "Coal Plant", voltage: 480.0, capacity: 800, renewable: false, lat: 34.05, lng: -118.22 },
    { id: "PP3", type: "powerplant", label: "Solar Farm", voltage: 420.0, capacity: 400, renewable: true, lat: 34.18, lng: -118.12 },
    { id: "PP4", type: "powerplant", label: "Wind Farm", voltage: 410.0, capacity: 350, renewable: true, lat: 34.25, lng: -118.33 },
    
    // Substation Nodes
    { id: "SUB1", type: "substation", label: "Main Substation", voltage: 400.0, capacity: 2000, lat: 34.10, lng: -118.30 },
    { id: "SUB2", type: "substation", label: "East Substation", voltage: 380.0, capacity: 1200, lat: 34.15, lng: -118.20 },
    { id: "SUB3", type: "substation", label: "West Substation", voltage: 370.0, capacity: 1400, lat: 34.08, lng: -118.38 },
    
    // Industrial Consumers
    { id: "IND1", type: "industrial", label: "Semiconductor Factory", voltage: 360.0, consumption: 450, lat: 34.07, lng: -118.25 },
    { id: "IND2", type: "industrial", label: "Steel Mill", voltage: 350.0, consumption: 680, lat: 34.20, lng: -118.27 },
    { id: "IND3", type: "industrial", label: "Data Center", voltage: 355.0, consumption: 520, lat: 34.12, lng: -118.36 },
    
    // Commercial Areas
    { id: "COM1", type: "commercial", label: "Downtown District", voltage: 330.0, consumption: 320, lat: 34.06, lng: -118.31 },
    { id: "COM2", type: "commercial", label: "Business Park", voltage: 325.0, consumption: 280, lat: 34.09, lng: -118.19 },
    { id: "COM3", type: "commercial", label: "Shopping Mall", voltage: 320.0, consumption: 230, lat: 34.16, lng: -118.28 },
    
    // Residential Areas
    { id: "RES1", type: "residential", label: "North Neighborhood", voltage: 240.0, consumption: 180, lat: 34.22, lng: -118.24 },
    { id: "RES2", type: "residential", label: "East Neighborhood", voltage: 235.0, consumption: 210, lat: 34.19, lng: -118.15 },
    { id: "RES3", type: "residential", label: "South Neighborhood", voltage: 230.0, consumption: 190, lat: 34.04, lng: -118.29 },
    
    // Energy Storage
    { id: "BAT1", type: "storage", label: "Battery Storage 1", voltage: 360.0, capacity: 200, charge: 0.8, lat: 34.11, lng: -118.26 },
    { id: "BAT2", type: "storage", label: "Battery Storage 2", voltage: 350.0, capacity: 180, charge: 0.6, lat: 34.14, lng: -118.34 }
  ],
  
  links: [
    // Connection from Power Plants to Substations
    { id: "L1", source: "PP1", target: "SUB1", resistance: 0.05, capacity: 1200, current: 780, status: "normal" },
    { id: "L2", source: "PP2", target: "SUB1", resistance: 0.06, capacity: 800, current: 620, status: "normal" },
    { id: "L3", source: "PP3", target: "SUB2", resistance: 0.04, capacity: 400, current: 280, status: "normal" },
    { id: "L4", source: "PP4", target: "SUB3", resistance: 0.07, capacity: 350, current: 210, status: "normal" },
    
    // Inter-Substation Connections
    { id: "L5", source: "SUB1", target: "SUB2", resistance: 0.03, capacity: 1000, current: 680, status: "normal" },
    { id: "L6", source: "SUB1", target: "SUB3", resistance: 0.04, capacity: 900, current: 740, status: "high" },
    { id: "L7", source: "SUB2", target: "SUB3", resistance: 0.05, capacity: 800, current: 480, status: "normal" },
    
    // Substation to Industrial Connections
    { id: "L8", source: "SUB1", target: "IND1", resistance: 0.02, capacity: 500, current: 450, status: "high" },
    { id: "L9", source: "SUB2", target: "IND2", resistance: 0.03, capacity: 700, current: 680, status: "critical" },
    { id: "L10", source: "SUB3", target: "IND3", resistance: 0.02, capacity: 600, current: 520, status: "normal" },
    
    // Substation to Commercial Connections
    { id: "L11", source: "SUB1", target: "COM1", resistance: 0.06, capacity: 350, current: 320, status: "normal" },
    { id: "L12", source: "SUB2", target: "COM2", resistance: 0.05, capacity: 300, current: 280, status: "normal" },
    { id: "L13", source: "SUB3", target: "COM3", resistance: 0.05, capacity: 250, current: 230, status: "normal" },
    
    // Substation to Residential Connections
    { id: "L14", source: "SUB2", target: "RES1", resistance: 0.08, capacity: 200, current: 180, status: "normal" },
    { id: "L15", source: "SUB2", target: "RES2", resistance: 0.07, capacity: 230, current: 210, status: "normal" },
    { id: "L16", source: "SUB3", target: "RES3", resistance: 0.09, capacity: 210, current: 190, status: "normal" },
    
    // Battery Storage Connections
    { id: "L17", source: "SUB1", target: "BAT1", resistance: 0.02, capacity: 250, current: 120, status: "normal" },
    { id: "L18", source: "SUB3", target: "BAT2", resistance: 0.03, capacity: 200, current: 90, status: "normal" }
  ]
};

// VOLTAGE DATA: Time series data showing normal patterns, peak usage, and anomalies
export const generateVoltageTimeSeriesData = (hours = 24, nodeType = "average") => {
  const now = new Date();
  const baseVoltage = nodeType === "residential" ? 235 : 
                     nodeType === "industrial" ? 350 : 
                     nodeType === "substation" ? 380 : 230;
  
  // Variation patterns based on time of day
  const getVariation = (hour: number) => {
    // Morning peak (7-9 AM)
    if (hour >= 7 && hour <= 9) return 0.05;
    // Evening peak (6-8 PM)
    if (hour >= 18 && hour <= 20) return 0.07;
    // Night low (11 PM - 5 AM)
    if (hour >= 23 || hour <= 5) return -0.03;
    // Normal daytime
    return 0.01;
  };
  
  // Add some randomness to make it realistic
  const addNoise = () => (Math.random() * 2 - 1) * 3;
  
  // Create anomalies
  const anomalyIndices: number[] = [];
  if (Math.random() > 0.7) {
    // 30% chance of having anomalies
    const anomalyCount = Math.floor(Math.random() * 3) + 1; // 1-3 anomalies
    for (let i = 0; i < anomalyCount; i++) {
      anomalyIndices.push(Math.floor(Math.random() * hours));
    }
  }
  
  // Generate the time series
  return Array.from({ length: hours }, (_, i) => {
    const hour = (now.getHours() - (hours - 1) + i) % 24;
    const timestamp = new Date(now.getTime() - (hours - 1 - i) * 60 * 60 * 1000).toISOString();
    const variation = getVariation(hour);
    const noise = addNoise();
    const isAnomaly = anomalyIndices.includes(i);
    
    // For anomalies, add a more significant deviation
    const anomalyFactor = isAnomaly ? (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15) : 0;
    
    return {
      timestamp,
      value: baseVoltage * (1 + variation) + noise + anomalyFactor,
      isAnomaly
    };
  });
};

// PREDICTION DATA: Forecast data that shows expected future patterns
export const generatePredictionData = (currentData: any[], hoursAhead = 12) => {
  const lastTimestamp = new Date(currentData[currentData.length - 1].timestamp);
  const baseValue = currentData[currentData.length - 1].value;
  
  // Slight upward or downward trend
  const trend = (Math.random() * 0.04) - 0.02;
  
  return Array.from({ length: hoursAhead }, (_, i) => {
    const timestamp = new Date(lastTimestamp.getTime() + (i + 1) * 60 * 60 * 1000).toISOString();
    const hourOfDay = (lastTimestamp.getHours() + i + 1) % 24;
    
    // Daily patterns
    let pattern = 0;
    if (hourOfDay >= 7 && hourOfDay <= 9) pattern = 5; // Morning peak
    else if (hourOfDay >= 18 && hourOfDay <= 20) pattern = 8; // Evening peak
    else if (hourOfDay >= 23 || hourOfDay <= 5) pattern = -4; // Night low
    
    // Add some randomness for realism
    const noise = (Math.random() * 2 - 1) * 2;
    
    return {
      timestamp,
      value: baseValue + (i * trend * baseValue) + pattern + noise
    };
  });
};

// ANOMALY DETECTION: Simulates ML model for detecting unusual patterns
export const detectAnomalies = (values: number[]) => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  );
  
  // Detect points that are more than 2.5 standard deviations from the mean
  const threshold = 2.5;
  const anomalyIndices = values
    .map((val, idx) => Math.abs(val - mean) > threshold * stdDev ? idx : -1)
    .filter(idx => idx !== -1);
  
  return {
    anomaly_indices: anomalyIndices,
    mean,
    std_dev: stdDev,
    threshold
  };
};

// LOAD SCHEDULING DATA: For optimization scenarios
export const mockLoadSchedulingData = {
  loads: [
    { id: "L1", name: "Data Center Cooling", priority: 1, consumption: 120, shiftable: false },
    { id: "L2", name: "Factory Production Line", priority: 2, consumption: 450, shiftable: false },
    { id: "L3", name: "Office Building HVAC", priority: 3, consumption: 85, shiftable: true, 
      preferred_hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
    { id: "L4", name: "Electric Vehicle Charging", priority: 4, consumption: 70, shiftable: true, 
      preferred_hours: [22, 23, 0, 1, 2, 3, 4, 5] },
    { id: "L5", name: "Water Heating", priority: 5, consumption: 45, shiftable: true },
    { id: "L6", name: "Residential HVAC", priority: 3, consumption: 110, shiftable: true },
    { id: "L7", name: "Mall Lighting", priority: 2, consumption: 60, shiftable: false, 
      preferred_hours: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] },
  ],
  
  generationSources: [
    { id: "G1", name: "Nuclear", capacity: 1200, current: 900, cost: 0.05, co2: 0 },
    { id: "G2", name: "Coal", capacity: 800, current: 400, cost: 0.06, co2: 0.85 },
    { id: "G3", name: "Solar", capacity: 400, current: 350, cost: 0.01, co2: 0, 
      availability: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
    { id: "G4", name: "Wind", capacity: 350, current: 200, cost: 0.02, co2: 0 },
    { id: "G5", name: "Battery", capacity: 380, current: 150, cost: 0.08, co2: 0, 
      charge: 0.7 },
  ],
  
  // Optimization results 
  optimizationResult: {
    cost_savings: 4250,
    co2_reduction: 158,
    peak_reduction: 18,
    load_schedule: [
      { hour: 0, load: 520, solar: 0, wind: 120, nuclear: 300, coal: 0, battery: 100 },
      { hour: 1, load: 490, solar: 0, wind: 100, nuclear: 320, coal: 0, battery: 70 },
      // ... additional hours would be included
    ]
  }
};

// CARBON IMPACT DATA: Environmental metrics
export const mockCarbonImpactData = {
  baseline: {
    daily_emissions: 320, // tons of CO2
    monthly_emissions: 9600,
    emissions_per_kwh: 0.42
  },
  with_optimization: {
    daily_emissions: 250,
    monthly_emissions: 7500,
    emissions_per_kwh: 0.33
  },
  savings: {
    daily_emissions: 70,
    monthly_emissions: 2100,
    percent_reduction: 22,
    equivalent_trees: 50,
    equivalent_cars: 15
  }
};

// COST SAVINGS DATA: Financial impact metrics
export const mockCostSavingsData = {
  baseline: {
    daily_cost: 42500,
    monthly_cost: 1275000,
    cost_per_kwh: 0.11
  },
  with_optimization: {
    daily_cost: 33000,
    monthly_cost: 990000,
    cost_per_kwh: 0.085
  },
  savings: {
    daily_savings: 9500,
    monthly_savings: 285000,
    percent_reduction: 22.4,
    roi: 435, // percentage return on investment
    payback_period: 14 // months
  }
};

// Integration between ML models and grid optimization
export const mockMLIntegrationData = {
  model_performance: {
    voltage_prediction: {
      mae: 2.3,
      rmse: 3.1,
      accuracy: 96.8
    },
    anomaly_detection: {
      precision: 0.94,
      recall: 0.91,
      f1_score: 0.92,
      false_positive_rate: 0.03
    },
    load_forecasting: {
      mae: 18.5,
      rmse: 24.2,
      accuracy: 94.3
    }
  },
  
  business_impact: {
    prevented_outages: 3,
    outage_cost_savings: 125000,
    predictive_maintenance_savings: 85000,
    customer_satisfaction_increase: 14
  }
};

// Real-world case studies
export const mockCaseStudies = [
  {
    name: "NYC Grid Modernization",
    challenge: "Frequent power outages during summer peak hours",
    solution: "Implemented ML-driven load forecasting and demand response",
    result: "Reduced outages by 68% and peak demand by 22%",
    roi: "310% ROI over 3 years"
  },
  {
    name: "California Renewable Integration",
    challenge: "Unstable grid due to intermittent solar generation",
    solution: "Used LSTM prediction models to optimize battery storage deployment",
    result: "Increased renewable utilization by 34% and reduced curtailment by 45%",
    roi: "270% ROI over 2 years"
  },
  {
    name: "Texas Winter Storm Resilience",
    challenge: "Grid failure during extreme weather events",
    solution: "Implemented ML-based anomaly detection and preventive controls",
    result: "Maintained 92% grid availability during similar conditions",
    roi: "520% ROI during first major weather event"
  }
];

// Full mock API response object
export default {
  grid: mockGridData,
  voltageData: generateVoltageTimeSeriesData(),
  predictVoltage: (data: any) => ({
    predictions: generatePredictionData(data.values.map((v: number, i: number) => ({
      timestamp: new Date(Date.now() - (24 - i) * 60 * 60 * 1000).toISOString(),
      value: v
    })), data.sequence_length).map(p => p.value)
  }),
  detectAnomalies,
  loadScheduling: mockLoadSchedulingData,
  carbonImpact: mockCarbonImpactData,
  costSavings: mockCostSavingsData,
  mlIntegration: mockMLIntegrationData,
  caseStudies: mockCaseStudies
}; 