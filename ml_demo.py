import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import DBSCAN
import os

print("Smart Grid ML Pipeline Demonstration")
print("====================================")

# Check if sample data exists
data_file = 'sample_data/voltage_data.csv'
if os.path.exists(data_file):
    print(f"Loading data from {data_file}")
    df = pd.read_csv(data_file)
else:
    print("Sample data file not found. Generating new data...")
    # Generate sample data
    np.random.seed(42)
    timestamps = pd.date_range('2023-01-01', periods=24, freq='H')
    voltages = np.random.normal(230, 1, 24)
    # Add anomalies
    voltages[15] = 241.7  # Voltage spike
    voltages[21] = 245.3  # Another spike

    # Create DataFrame
    df = pd.DataFrame({'timestamp': timestamps, 'voltage': voltages})
    df.to_csv(data_file, index=False)
    print(f"Sample data saved to '{data_file}'")

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

print("\nData Summary:")
print(f"- Time range: {df['timestamp'].min()} to {df['timestamp'].max()}")
print(f"- Number of data points: {len(df)}")
print(f"- Voltage range: {df['voltage'].min():.1f}V to {df['voltage'].max():.1f}V")
print(f"- Average voltage: {df['voltage'].mean():.2f}V")

# Plot the data
print("\nPlotting voltage time series...")
plt.figure(figsize=(10, 6))
plt.plot(df['timestamp'], df['voltage'], 'b-')
plt.axhline(y=235, color='r', linestyle='--', label='Threshold')
plt.title('Voltage Time Series with Anomalies')
plt.xlabel('Time')
plt.ylabel('Voltage (V)')
plt.grid(True)
plt.legend()
plt.tight_layout()
plot_file = 'sample_data/voltage_plot.png'
plt.savefig(plot_file)
print(f"Plot saved to '{plot_file}'")

# Anomaly detection
print("\nPerforming anomaly detection with DBSCAN...")
X = df['voltage'].values.reshape(-1, 1)
dbscan = DBSCAN(eps=3.0, min_samples=2)
clusters = dbscan.fit_predict(X)
anomalies = clusters == -1

# Count and report anomalies
anomaly_count = sum(anomalies)
print(f"Detected {anomaly_count} anomalies in the data")
if anomaly_count > 0:
    anomaly_timestamps = df.loc[anomalies, 'timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S').tolist()
    anomaly_voltages = df.loc[anomalies, 'voltage'].tolist()
    
    print("\nAnomalies detected:")
    for i, (ts, v) in enumerate(zip(anomaly_timestamps, anomaly_voltages)):
        print(f"  {i+1}. Time: {ts}, Voltage: {v:.1f}V")

# Visualize anomalies
print("\nVisualizing anomaly detection results...")
plt.figure(figsize=(10, 6))
plt.scatter(df.loc[~anomalies, 'timestamp'], df.loc[~anomalies, 'voltage'], 
            color='blue', label='Normal')
plt.scatter(df.loc[anomalies, 'timestamp'], df.loc[anomalies, 'voltage'], 
            color='red', marker='X', s=100, label='Anomaly')
plt.title('Voltage Anomaly Detection')
plt.xlabel('Time')
plt.ylabel('Voltage (V)')
plt.grid(True)
plt.legend()
plt.tight_layout()
anomaly_plot_file = 'sample_data/anomaly_detection.png'
plt.savefig(anomaly_plot_file)
print(f"Anomaly detection plot saved to '{anomaly_plot_file}'")

# Voltage Prediction Simulation
print("\nSimulating LSTM prediction results...")
# Last timestamp in the data
last_date = df['timestamp'].iloc[-1]
future_dates = pd.date_range(start=last_date + pd.Timedelta(hours=1), periods=12, freq='H')

# Generate realistic looking predictions
last_voltage = df['voltage'].iloc[-1]
predictions = []
for i in range(12):
    # Generate a prediction with some variability but a general trend
    next_point = last_voltage + np.random.normal(0, 0.5) + (0.1 * i)
    predictions.append(next_point)
    last_voltage = next_point

# Visualize predictions
plt.figure(figsize=(12, 6))
plt.plot(df['timestamp'], df['voltage'], 'b-', label='Historical Data')
plt.plot(future_dates, predictions, 'g--', label='Predictions')
plt.fill_between(future_dates, 
                 [p - 1.5 for p in predictions], 
                 [p + 1.5 for p in predictions], 
                 color='g', alpha=0.2)
plt.title('Voltage Prediction with LSTM (Simulated)')
plt.xlabel('Time')
plt.ylabel('Voltage (V)')
plt.legend()
plt.grid(True)
plt.tight_layout()
prediction_plot_file = 'sample_data/prediction_plot.png'
plt.savefig(prediction_plot_file)
print(f"Prediction plot saved to '{prediction_plot_file}'")

print("\nML Pipeline Demonstration Complete!")
print("These visualizations show how the ML components work in the Smart Grid System:")
print("1. Anomaly Detection: Using DBSCAN to identify unusual voltage values")
print("2. Prediction: Using LSTM to forecast future voltage values")
print("\nIn the deployed system, these components run automatically and feed data to the dashboard.") 