#!/usr/bin/env python3
"""
Example usage of the ML pipeline for power grid voltage prediction and anomaly detection.

This example demonstrates:
1. Creating and training an LSTM model for voltage prediction
2. Using DBSCAN for detecting anomalies in voltage measurements
3. Visualizing the results
"""

import numpy as np
import matplotlib.pyplot as plt
from models import VoltagePredictor, AnomalyDetector
from typing import Tuple


def generate_voltage_data(n_samples: int = 1000, 
                         freq: float = 0.1, 
                         noise_level: float = 0.05, 
                         anomaly_prob: float = 0.03) -> np.ndarray:
    """
    Generate synthetic voltage data with some anomalies.
    
    In a real power grid, voltage typically follows a sinusoidal pattern with 
    variations due to load changes and occasional spikes/drops due to faults.
    
    Args:
        n_samples: Number of data points to generate
        freq: Frequency of the sinusoidal component
        noise_level: Level of random noise to add
        anomaly_prob: Probability of introducing an anomaly
        
    Returns:
        Array of voltage values
    """
    # Time vector
    t = np.linspace(0, 10, n_samples)
    
    # Base sinusoidal voltage (e.g., 230V nominal with small variations)
    base_voltage = 230 + 5 * np.sin(2 * np.pi * freq * t)
    
    # Add random noise
    voltage = base_voltage + noise_level * base_voltage * np.random.randn(n_samples)
    
    # Add some anomalies (sudden voltage sags or swells)
    for i in range(n_samples):
        if np.random.random() < anomaly_prob:
            # 50% chance of voltage sag, 50% chance of voltage swell
            if np.random.random() < 0.5:
                # Voltage sag (sudden drop)
                voltage[i] *= 0.7  # 30% drop
            else:
                # Voltage swell (sudden rise)
                voltage[i] *= 1.3  # 30% rise
    
    return voltage


def prepare_data(data: np.ndarray, sequence_length: int = 24, train_split: float = 0.8) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Prepare data for LSTM model training and testing.
    
    Args:
        data: Voltage time series data
        sequence_length: Length of input sequences
        train_split: Fraction of data to use for training
        
    Returns:
        Tuple of (X_train, y_train, X_test, y_test)
    """
    # Normalize the data
    mean = np.mean(data)
    std = np.std(data)
    data_normalized = (data - mean) / std
    
    # Create sequences
    X, y = [], []
    for i in range(len(data_normalized) - sequence_length):
        X.append(data_normalized[i:i + sequence_length])
        y.append(data_normalized[i + sequence_length])
    
    X = np.array(X)
    y = np.array(y)
    
    # Reshape X to [samples, time steps, features]
    X = X.reshape(X.shape[0], X.shape[1], 1)
    
    # Split into train and test sets
    split_idx = int(len(X) * train_split)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    return X_train, y_train, X_test, y_test


def plot_results(actual: np.ndarray, 
                predicted: np.ndarray, 
                anomaly_indices: list, 
                title: str = "Voltage Prediction and Anomaly Detection"):
    """
    Plot the actual vs predicted values and highlight anomalies.
    
    Args:
        actual: Actual voltage values
        predicted: Predicted voltage values
        anomaly_indices: Indices of detected anomalies
        title: Plot title
    """
    plt.figure(figsize=(12, 6))
    
    # Plot actual voltage
    plt.plot(actual, label='Actual Voltage', color='blue', alpha=0.7)
    
    # Plot predicted voltage
    if predicted is not None and len(predicted) > 0:
        # Account for sequence length offset in predictions
        pred_indices = range(len(actual) - len(predicted), len(actual))
        plt.plot(pred_indices, predicted, label='Predicted Voltage', color='green', alpha=0.7)
    
    # Highlight anomalies
    if anomaly_indices and len(anomaly_indices) > 0:
        plt.scatter([i for i in anomaly_indices if i < len(actual)], 
                   [actual[i] for i in anomaly_indices if i < len(actual)],
                   color='red', label='Anomalies', s=50, zorder=5)
    
    plt.title(title)
    plt.xlabel('Time Step')
    plt.ylabel('Voltage (V)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()


def main():
    """Run the example."""
    print("=== Smart Grid ML Pipeline Example ===")
    
    # Generate synthetic voltage data
    print("Generating synthetic voltage data...")
    voltage_data = generate_voltage_data(n_samples=1000, anomaly_prob=0.03)
    
    # Prepare data for LSTM model
    print("Preparing data for LSTM model...")
    sequence_length = 24
    X_train, y_train, X_test, y_test = prepare_data(voltage_data, sequence_length)
    
    # Create and train LSTM model
    print("Training LSTM model for voltage prediction...")
    predictor = VoltagePredictor(sequence_length=sequence_length)
    history = predictor.train(X_train, y_train, epochs=20, batch_size=32)
    
    # Make predictions
    print("Making predictions...")
    y_pred = predictor.predict(X_test)
    
    # Denormalize predictions and actual values
    mean = np.mean(voltage_data)
    std = np.std(voltage_data)
    y_test_denorm = (y_test * std) + mean
    y_pred_denorm = (y_pred.flatten() * std) + mean
    
    # Detect anomalies using DBSCAN
    print("Detecting anomalies with DBSCAN...")
    detector = AnomalyDetector(eps=0.3, min_samples=5)
    anomaly_indices = detector.get_anomaly_indices(voltage_data)
    
    # Get anomaly statistics
    anomaly_stats = detector.get_anomaly_stats(voltage_data)
    print(f"Found {anomaly_stats['anomaly_count']} anomalies "
          f"({anomaly_stats['anomaly_percentage']:.2f}% of data)")
    
    # Visualize results
    # Convert predictions back to the original timeline
    full_predictions = np.zeros_like(voltage_data) * np.nan
    pred_start = len(voltage_data) - len(y_pred_denorm)
    full_predictions[pred_start:] = y_pred_denorm
    
    # Plot results
    plot_results(voltage_data, full_predictions, anomaly_indices, 
                "Voltage Prediction and Anomaly Detection")
    
    print("=== Example completed ===")


if __name__ == "__main__":
    main() 