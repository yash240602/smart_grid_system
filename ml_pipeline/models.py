import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.optimizers import Adam
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Dict, List, Optional, Union, Any


class VoltagePredictor:
    """
    LSTM-based model for predicting voltage time series in a power grid.
    
    In electrical engineering, voltage prediction is essential for grid stability 
    and protection planning. This model uses a 2-layer LSTM network to capture 
    temporal patterns in voltage measurements.
    """
    
    def __init__(self, 
                 sequence_length: int = 24, 
                 n_features: int = 1, 
                 lstm_units: Tuple[int, int] = (50, 30),
                 dropout_rate: float = 0.2,
                 learning_rate: float = 0.001):
        """
        Initialize the voltage predictor model.
        
        Args:
            sequence_length: Number of time steps in each input sequence
            n_features: Number of features for each time step
            lstm_units: Tuple of units in the first and second LSTM layers
            dropout_rate: Dropout rate for regularization
            learning_rate: Learning rate for Adam optimizer
        """
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.lstm_units = lstm_units
        self.dropout_rate = dropout_rate
        self.learning_rate = learning_rate
        self.model = self._build_model()
        self.history = None
    
    def _build_model(self) -> Model:
        """
        Build the LSTM model architecture.
        
        Returns:
            Compiled Keras model
        """
        model = Sequential()
        
        # First LSTM layer with return sequences for stacking
        model.add(LSTM(units=self.lstm_units[0],
                      return_sequences=True,
                      input_shape=(self.sequence_length, self.n_features)))
        model.add(Dropout(self.dropout_rate))
        
        # Second LSTM layer
        model.add(LSTM(units=self.lstm_units[1],
                      return_sequences=False))
        model.add(Dropout(self.dropout_rate))
        
        # Output layer
        model.add(Dense(units=1))
        
        # Compile the model
        model.compile(optimizer=Adam(learning_rate=self.learning_rate),
                     loss='mean_squared_error')
        
        return model
    
    def prepare_sequences(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare input sequences and target values from time series data.
        
        Args:
            data: Array of voltage measurements
            
        Returns:
            Tuple of (X, y) where X contains input sequences and y contains target values
        """
        X, y = [], []
        
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:i + self.sequence_length])
            y.append(data[i + self.sequence_length])
        
        return np.array(X), np.array(y)
    
    def train(self, 
              X_train: np.ndarray, 
              y_train: np.ndarray, 
              epochs: int = 50, 
              batch_size: int = 32, 
              validation_split: float = 0.2) -> Dict[str, List[float]]:
        """
        Train the model on the provided data.
        
        Args:
            X_train: Training input sequences
            y_train: Training target values
            epochs: Number of training epochs
            batch_size: Batch size for training
            validation_split: Fraction of data to use for validation
            
        Returns:
            Training history
        """
        self.history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        return self.history.history
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions using the trained model.
        
        Args:
            X: Input sequences
            
        Returns:
            Predicted values
        """
        return self.model.predict(X)
    
    def save_model(self, filepath: str) -> None:
        """
        Save the model to a file.
        
        Args:
            filepath: Path to save the model
        """
        self.model.save(filepath)
    
    @classmethod
    def load_model(cls, filepath: str) -> 'VoltagePredictor':
        """
        Load a model from a file.
        
        Args:
            filepath: Path to the saved model
            
        Returns:
            VoltagePredictor instance with loaded model
        """
        predictor = cls()
        predictor.model = tf.keras.models.load_model(filepath)
        return predictor


class AnomalyDetector:
    """
    DBSCAN-based anomaly detector for voltage measurements.
    
    In power systems, anomaly detection helps identify potential issues like
    voltage sags, swells, or other transients that could indicate equipment failure
    or grid instability.
    """
    
    def __init__(self, eps: float = 0.5, min_samples: int = 5):
        """
        Initialize the anomaly detector.
        
        Args:
            eps: Maximum distance between two samples for them to be considered neighbors
            min_samples: Minimum number of samples in a neighborhood for a point to be a core point
        """
        self.eps = eps
        self.min_samples = min_samples
        self.model = DBSCAN(eps=eps, min_samples=min_samples)
        self.scaler = StandardScaler()
    
    def preprocess(self, data: np.ndarray) -> np.ndarray:
        """
        Preprocess the data by scaling features.
        
        Args:
            data: Raw voltage measurements
            
        Returns:
            Scaled data
        """
        # Reshape 1D array to 2D for sklearn
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        
        # Fit and transform the data
        return self.scaler.fit_transform(data)
    
    def detect(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Detect anomalies in voltage data.
        
        Args:
            data: Voltage measurements
            
        Returns:
            Tuple of (labels, anomalies) where:
                - labels: Cluster labels for each point (-1 indicates outliers/anomalies)
                - anomalies: Boolean mask where True indicates an anomaly
        """
        # Preprocess the data
        scaled_data = self.preprocess(data)
        
        # Fit the model and get cluster labels
        labels = self.model.fit_predict(scaled_data)
        
        # Points labeled as -1 are considered anomalies in DBSCAN
        anomalies = labels == -1
        
        return labels, anomalies
    
    def get_anomaly_indices(self, data: np.ndarray) -> List[int]:
        """
        Get the indices of anomalies in the data.
        
        Args:
            data: Voltage measurements
            
        Returns:
            List of indices where anomalies were detected
        """
        _, anomalies = self.detect(data)
        return [i for i, is_anomaly in enumerate(anomalies) if is_anomaly]
    
    def get_anomaly_stats(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Get statistics about detected anomalies.
        
        Args:
            data: Voltage measurements
            
        Returns:
            Dictionary with anomaly statistics
        """
        labels, anomalies = self.detect(data)
        
        # Get anomaly values
        anomaly_indices = self.get_anomaly_indices(data)
        if isinstance(data, np.ndarray) and data.ndim == 1:
            anomaly_values = data[anomaly_indices]
        else:
            anomaly_values = np.array([data[i] for i in anomaly_indices])
        
        # Number of clusters (excluding noise)
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        
        return {
            'total_points': len(data),
            'anomaly_count': sum(anomalies),
            'anomaly_percentage': 100 * sum(anomalies) / len(data),
            'n_clusters': n_clusters,
            'anomaly_indices': anomaly_indices,
            'anomaly_values': anomaly_values.tolist() if len(anomaly_values) > 0 else []
        } 