# Smart Grid System Architecture

This document describes the architecture of the Smart Grid Optimization System.

## System Overview

The Smart Grid Optimization System is built using a modular architecture with the following components:

1. **Power Grid Simulation (Python)** - Simulates electrical grid behavior
2. **Load Scheduler (C++)** - Manages load priorities
3. **ML Pipeline (Python)** - Predicts voltages and detects anomalies
4. **API Layer (FastAPI)** - Provides RESTful endpoints

## Architecture Diagram

```mermaid
graph TD
    subgraph "Python Components"
        A[Power Grid Simulation] -->|Grid Data| C[API Layer]
        B[ML Pipeline] -->|Predictions & Anomalies| C
    end
    
    subgraph "C++ Components"
        D[Load Scheduler] -->|Priority Queue| C
    end
    
    C -->|HTTP| E[Client Applications]
    
    subgraph "Infrastructure"
        C -->|Deploy| F[Docker Container]
        F -->|CI/CD| G[GitHub Actions]
    end
```

## Component Details

### Power Grid Simulation

```mermaid
classDiagram
    class Node {
        +string node_id
        -float _voltage
        +set_voltage(float)
        +voltage() float
    }
    
    class Line {
        +string line_id
        +Node from_node
        +Node to_node
        -float _resistance
        +set_resistance(float)
        +resistance() float
        +calculate_current() float
    }
    
    class PowerGrid {
        +Dict~string, Node~ nodes
        +Dict~string, Line~ lines
        +add_node(Node)
        +add_line(Line)
        +get_node(string) Node
        +get_line(string) Line
        +calculate_all_currents() Dict
        +validate_grid() List
    }
    
    PowerGrid "1" *-- "many" Node
    PowerGrid "1" *-- "many" Line
    Line "1" --> "2" Node
```

### Load Scheduler

```mermaid
classDiagram
    class Load {
        +string id
        +double power_requirement
        -int priority
        +getPriority() int
        +setPriority(int)
    }
    
    class LoadComparator {
        +operator()(Load, Load) bool
    }
    
    class LoadScheduler {
        -priority_queue load_queue
        -unordered_map load_map
        -mutex mutex_
        +addLoad(Load) bool
        +removeLoad(string) bool
        +updatePriority(string, int) bool
        +peekTopLoad() Load
        +popTopLoad() Load
        -rebuildQueue() void
    }
    
    LoadScheduler "1" *-- "many" Load
    LoadScheduler --> LoadComparator
```

### ML Pipeline

```mermaid
classDiagram
    class VoltagePredictor {
        +int sequence_length
        +int n_features
        +Tuple lstm_units
        +float dropout_rate
        +float learning_rate
        -Model model
        -_build_model() Model
        +prepare_sequences(ndarray) Tuple
        +train(ndarray, ndarray) Dict
        +predict(ndarray) ndarray
    }
    
    class AnomalyDetector {
        +float eps
        +int min_samples
        -DBSCAN model
        -StandardScaler scaler
        +preprocess(ndarray) ndarray
        +detect(ndarray) Tuple
        +get_anomaly_indices(ndarray) List
        +get_anomaly_stats(ndarray) Dict
    }
```

### API Layer

```mermaid
classDiagram
    class NodeModel {
        +string node_id
        +float voltage
        +voltage_must_be_positive(v)
    }
    
    class LineModel {
        +string line_id
        +string from_node_id
        +string to_node_id
        +float resistance
        +resistance_must_be_positive(v)
    }
    
    class GridModel {
        +List~NodeModel~ nodes
        +List~LineModel~ lines
    }
    
    class CurrentsResponse {
        +Dict~string, float~ currents
        +float total_power
    }
    
    class ValidationResponse {
        +bool valid
        +List~string~ errors
    }
    
    class VoltageDataModel {
        +List~float~ values
        +int sequence_length
    }
    
    class PredictionResponse {
        +List~float~ predictions
    }
    
    class AnomalyResponse {
        +List~int~ anomaly_indices
        +List~float~ anomaly_values
        +int anomaly_count
        +float anomaly_percentage
    }
    
    GridModel "1" *-- "many" NodeModel
    GridModel "1" *-- "many" LineModel
```

## Deployment Architecture

```mermaid
flowchart TD
    A[GitHub Repository] -->|CI/CD| B[GitHub Actions]
    B --> C{Tests Pass?}
    C -->|Yes| D[Build Docker Image]
    C -->|No| E[Fail Build]
    D --> F[Push to Registry]
    F --> G[Deploy Container]
    G --> H[API Service]
```

## Data Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant PowerGrid
    participant ML
    
    Client->>API: POST /grid/currents
    API->>PowerGrid: create_power_grid()
    PowerGrid->>PowerGrid: calculate_all_currents()
    PowerGrid->>API: Return currents
    API->>Client: JSON response
    
    Client->>API: POST /ml/predict
    API->>ML: Create VoltagePredictor
    ML->>ML: prepare_sequences()
    ML->>ML: predict()
    ML->>API: Return predictions
    API->>Client: JSON response
``` 