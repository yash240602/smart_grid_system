import { useState, useEffect, useMemo, memo } from 'react'
import Plot from 'react-plotly.js'
import './LoadChart.css'

interface DataPoint {
  timestamp: string
  value: number
  isAnomaly?: boolean
}

interface LoadChartProps {
  title?: string
  data: DataPoint[]
  predictions?: DataPoint[]
  yAxisLabel?: string
  threshold?: {
    value: number
    label: string
  }
}

// Memoize the component to prevent unnecessary re-renders
const LoadChart: React.FC<LoadChartProps> = memo(({
  title = 'Voltage Over Time',
  data,
  predictions = [],
  yAxisLabel = 'Voltage (V)',
  threshold
}) => {
  const [plotData, setPlotData] = useState<Plotly.Data[]>([])
  const [layout, setLayout] = useState<Partial<Plotly.Layout>>({})
  
  // Use useMemo to avoid recalculating these values on every render
  const dataTrace = useMemo(() => {
    // Prepare data for the historical values
    const normalData = data.filter(point => !point.isAnomaly)
    
    // Data traces - create only once with memoization
    return {
      x: normalData.map(point => point.timestamp),
      y: normalData.map(point => point.value),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'Actual Values',
      line: { color: '#3498db', width: 2 },
      marker: { size: 6 },
    }
  }, [data])
  
  const anomalyTrace = useMemo(() => {
    const anomalyData = data.filter(point => point.isAnomaly)
    
    // Only create if there are anomalies
    if (anomalyData.length === 0) return null
    
    return {
      x: anomalyData.map(point => point.timestamp),
      y: anomalyData.map(point => point.value),
      type: 'scatter' as const,
      mode: 'markers',
      name: 'Anomalies',
      marker: {
        size: 10,
        color: '#e74c3c',
        symbol: 'circle-open',
        line: { width: 2, color: '#e74c3c' }
      },
    }
  }, [data])
  
  const predictionTrace = useMemo(() => {
    if (predictions.length === 0) return null
    
    // Get the last timestamp from actual data
    const lastActualTimestamp = data.length > 0 ? 
      new Date(data[data.length - 1].timestamp).getTime() : 
      new Date().getTime()
    
    return {
      x: predictions.map((point, i) => {
        // If prediction has timestamp, use it
        if (point.timestamp) return point.timestamp
        
        // Otherwise generate timestamps starting after the last actual data point
        const predictionTime = new Date(lastActualTimestamp)
        predictionTime.setHours(predictionTime.getHours() + i + 1)
        return predictionTime.toISOString()
      }),
      y: predictions.map(point => point.value),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'Predictions',
      line: { 
        color: '#2ecc71', 
        width: 2,
        dash: 'dot'
      },
      marker: { size: 6 },
    }
  }, [predictions, data])
  
  const thresholdTrace = useMemo(() => {
    if (!threshold) return null
    
    return {
      x: [data[0]?.timestamp, data[data.length - 1]?.timestamp],
      y: [threshold.value, threshold.value],
      type: 'scatter' as const,
      mode: 'lines',
      name: threshold.label,
      line: {
        color: '#f39c12',
        width: 2,
        dash: 'dash',
      },
    }
  }, [threshold, data])
  
  // Update chart data when traces change
  useEffect(() => {
    const traces: Plotly.Data[] = [dataTrace as Plotly.Data]
    
    if (anomalyTrace) traces.push(anomalyTrace as Plotly.Data)
    if (predictionTrace) traces.push(predictionTrace as Plotly.Data)
    if (thresholdTrace) traces.push(thresholdTrace as Plotly.Data)
    
    setPlotData(traces)
    
    // Update layout
    setLayout({
      title: {
        text: title,
        font: {
          size: 18,
        }
      },
      xaxis: {
        title: 'Time',
        tickformat: '%H:%M %d-%b',
      },
      yaxis: {
        title: yAxisLabel,
      },
      margin: { l: 50, r: 20, t: 40, b: 50 },
      legend: {
        orientation: 'h',
        y: -0.2,
      },
      autosize: true,
      height: 400,
      hovermode: 'closest',
      plot_bgcolor: '#f8f9fa',
      paper_bgcolor: '#ffffff',
      // Add uirevision to maintain zoom/pan state
      uirevision: 'true',
    })
  }, [dataTrace, anomalyTrace, predictionTrace, thresholdTrace, title, yAxisLabel])
  
  // Memoize the config to prevent recreation on every render
  const plotConfig = useMemo(() => ({
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'] as any[], // Cast to any[] to avoid type issues
    toImageButtonOptions: {
      format: 'png' as const,
      filename: 'voltage_chart',
      scale: 1
    }
  }), [])
  
  return (
    <div className="load-chart">
      <Plot
        data={plotData}
        layout={layout}
        config={plotConfig}
        className="plotly-chart"
        useResizeHandler={true}
        style={{width: "100%", height: "100%"}}
      />
    </div>
  )
})

export default LoadChart 