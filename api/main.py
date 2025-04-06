from fastapi import FastAPI, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, validator, conlist
import numpy as np
import sys
import os
from typing import List, Dict, Any, Optional
import logging
import uvicorn
import json
from datetime import datetime, timedelta
import jwt
from jwt.exceptions import PyJWTError
from passlib.context import CryptContext

# Add parent directory to path to import from other modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import from other project modules
from power_grid.grid import Node, Line, PowerGrid
from ml_pipeline.models import VoltagePredictor, AnomalyDetector

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Grid Optimization API",
    description="API for power grid simulation, load scheduling, and anomaly detection",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files from frontend build
app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

# Authentication settings
SECRET_KEY = "your-secret-key"  # In production, use a secure key from environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Pydantic models for request/response validation
class NodeModel(BaseModel):
    """Pydantic model for a node in the electrical grid."""
    node_id: str
    voltage: float
    
    @validator('voltage')
    def voltage_must_be_positive(cls, v):
        """Validate that voltage is not negative."""
        if v < 0:
            raise ValueError("Voltage cannot be negative")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "node_id": "N1",
                "voltage": 230.0
            }
        }


class LineModel(BaseModel):
    """Pydantic model for a transmission line in the electrical grid."""
    line_id: str
    from_node_id: str
    to_node_id: str
    resistance: float
    
    @validator('resistance')
    def resistance_must_be_positive(cls, v):
        """Validate that resistance is positive."""
        if v <= 0:
            raise ValueError("Resistance must be positive")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "line_id": "L1",
                "from_node_id": "N1",
                "to_node_id": "N2",
                "resistance": 10.0
            }
        }


class GridModel(BaseModel):
    """Pydantic model for an electrical grid."""
    nodes: List[NodeModel]
    lines: List[LineModel]
    
    class Config:
        schema_extra = {
            "example": {
                "nodes": [
                    {"node_id": "N1", "voltage": 230.0},
                    {"node_id": "N2", "voltage": 115.0},
                    {"node_id": "N3", "voltage": 0.0}
                ],
                "lines": [
                    {"line_id": "L1", "from_node_id": "N1", "to_node_id": "N2", "resistance": 10.0},
                    {"line_id": "L2", "from_node_id": "N2", "to_node_id": "N3", "resistance": 5.0}
                ]
            }
        }


class CurrentsResponse(BaseModel):
    """Pydantic model for current calculation response."""
    currents: Dict[str, float]
    total_power: float


class ValidationResponse(BaseModel):
    """Pydantic model for grid validation response."""
    valid: bool
    errors: List[str]


class VoltageDataModel(BaseModel):
    """Pydantic model for voltage time series data."""
    values: conlist(float, min_items=1)
    sequence_length: int = Field(24, ge=1)
    
    class Config:
        schema_extra = {
            "example": {
                "values": [230.1, 229.8, 230.2, 230.0, 229.9],
                "sequence_length": 3
            }
        }


class PredictionResponse(BaseModel):
    """Pydantic model for voltage prediction response."""
    predictions: List[float]


class AnomalyResponse(BaseModel):
    """Pydantic model for anomaly detection response."""
    anomaly_indices: List[int]
    anomaly_values: List[float]
    anomaly_count: int
    anomaly_percentage: float


# Authentication models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(BaseModel):
    username: str
    disabled: Optional[bool] = None


class UserInDB(User):
    hashed_password: str


# Mock user database - in production, use a real database
users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": pwd_context.hash("admin"),
        "disabled": False
    }
}


# Grid visualization models
class GridVisualizationResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]


class RefreshRequest(BaseModel):
    refresh_token: str


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)
    return None


def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except PyJWTError:
        raise credentials_exception
    user = get_user(users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Global objects (in a real app, you might use dependency injection)
power_grid = PowerGrid()
anomaly_detector = AnomalyDetector(eps=0.3, min_samples=5)
voltage_predictor = VoltagePredictor(input_size=24, hidden_size_1=50, hidden_size_2=30)

# Function to convert Pydantic models to internal objects
def create_power_grid(grid_model: GridModel) -> PowerGrid:
    """
    Convert a GridModel to a PowerGrid object.
    
    Args:
        grid_model: Pydantic model of the grid
        
    Returns:
        PowerGrid object
    """
    grid = PowerGrid()
    
    # Add nodes
    for node_model in grid_model.nodes:
        node = Node(node_model.node_id, node_model.voltage)
        grid.add_node(node)
    
    # Add lines
    for line_model in grid_model.lines:
        from_node = grid.get_node(line_model.from_node_id)
        to_node = grid.get_node(line_model.to_node_id)
        
        if from_node is None or to_node is None:
            raise HTTPException(
                status_code=400,
                detail=f"Nodes {line_model.from_node_id} and/or {line_model.to_node_id} not found"
            )
        
        line = Line(line_model.line_id, from_node, to_node, line_model.resistance)
        grid.add_line(line)
    
    return grid


# Authentication endpoints
@app.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@app.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh_request: RefreshRequest):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception
    
    user = get_user(users_db, username=username)
    if user is None:
        raise credentials_exception
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


# WebSocket endpoint for real-time updates
@app.websocket("/grid/updates")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    try:
        # Validate token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user = get_user(users_db, username=username)
        if user is None or user.disabled:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except PyJWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    await manager.connect(websocket)
    try:
        # Send initial data
        initial_data = {
            "type": "connection_established",
            "message": "Connected to grid updates WebSocket"
        }
        await manager.send_personal_message(json.dumps(initial_data), websocket)
        
        # In a real implementation, you'd have a loop here that sends real-time updates
        # For now, just wait for client to disconnect
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await manager.send_personal_message(json.dumps({"type": "pong"}), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Grid visualization endpoint
@app.get("/grid/visualization", response_model=GridVisualizationResponse)
async def get_grid_visualization(current_user: User = Depends(get_current_active_user)):
    """
    Get grid nodes and links data for visualization
    """
    try:
        # In a real app, this would come from the database or a real grid
        # Here we'll create a sample grid
        sample_grid = PowerGrid()
        
        # Create nodes
        nodes = [
            Node("N1", 230.0),  # Source
            Node("N2", 115.0),  # Intermediate
            Node("N3", 110.0),  # Intermediate
            Node("N4", 0.0),    # Ground
        ]
        
        for node in nodes:
            sample_grid.add_node(node)
        
        # Create lines
        lines = [
            Line("L1", nodes[0], nodes[1], 10.0),
            Line("L2", nodes[1], nodes[2], 5.0),
            Line("L3", nodes[1], nodes[3], 20.0),
            Line("L4", nodes[2], nodes[3], 15.0),
        ]
        
        for line in lines:
            sample_grid.add_line(line)
        
        # Calculate currents
        currents = sample_grid.calculate_all_currents()
        
        # Format data for visualization
        nodes_data = [
            {
                "id": node.id,
                "voltage": node.voltage
            }
            for node in nodes
        ]
        
        links_data = [
            {
                "id": line.id,
                "source": line.from_node.id,
                "target": line.to_node.id,
                "resistance": line.resistance,
                "current": currents.get(line.id, 0.0)
            }
            for line in lines
        ]
        
        return {"nodes": nodes_data, "links": links_data}
    
    except Exception as e:
        logger.error(f"Error in grid visualization: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# API routes
@app.get("/")
async def root():
    """Root endpoint that returns API information."""
    return {
        "message": "Smart Grid Optimization API",
        "version": "1.0.0",
        "endpoints": {
            "/grid/currents": "Calculate currents in a grid",
            "/grid/validate": "Validate a grid configuration",
            "/ml/predict": "Predict future voltage values",
            "/ml/anomalies": "Detect anomalies in voltage data"
        }
    }


@app.post("/grid/currents", response_model=CurrentsResponse)
async def calculate_currents(grid_model: GridModel):
    """
    Calculate currents in all lines of a grid.
    
    Args:
        grid_model: Grid configuration
        
    Returns:
        Dictionary of line currents and total power
    """
    try:
        # Convert Pydantic model to internal objects
        grid = create_power_grid(grid_model)
        
        # Calculate currents
        currents = grid.calculate_all_currents()
        
        # Calculate total power (P = I²R)
        total_power = 0.0
        for line_id, current in currents.items():
            line = grid.get_line(line_id)
            if line:
                power = current**2 * line.resistance
                total_power += power
        
        return {"currents": currents, "total_power": total_power}
    
    except ValueError as e:
        logger.error(f"Value error in current calculation: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in current calculation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/grid/validate", response_model=ValidationResponse)
async def validate_grid(grid_model: GridModel):
    """
    Validate a grid configuration.
    
    Args:
        grid_model: Grid configuration
        
    Returns:
        Validation result with any errors
    """
    try:
        # Convert Pydantic model to internal objects
        grid = create_power_grid(grid_model)
        
        # Validate the grid
        errors = grid.validate_grid()
        
        return {"valid": len(errors) == 0, "errors": errors}
    
    except ValueError as e:
        logger.error(f"Value error in grid validation: {str(e)}")
        return {"valid": False, "errors": [str(e)]}
    except Exception as e:
        logger.error(f"Error in grid validation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/ml/predict", response_model=PredictionResponse)
async def predict_voltage(data: VoltageDataModel):
    """
    Predict future voltage values based on historical data.
    
    Args:
        data: Voltage data and parameters
        
    Returns:
        Predicted voltage values
    """
    try:
        # Convert to numpy array
        values = np.array(data.values)
        sequence_length = data.sequence_length
        
        # Check if we have enough data
        if len(values) <= sequence_length:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough data points. Need more than {sequence_length} values."
            )
        
        # Create and configure the predictor
        predictor = VoltagePredictor(sequence_length=sequence_length)
        
        # Normalize data
        mean = np.mean(values)
        std = np.std(values)
        values_normalized = (values - mean) / std
        
        # Prepare sequences
        X, _ = predictor.prepare_sequences(values_normalized)
        
        # Reshape for LSTM [samples, time steps, features]
        X = X.reshape(X.shape[0], X.shape[1], 1)
        
        # We're using a pre-trained model here for the example
        # In a real app, you'd either train the model first or load a saved model
        # For simplicity, we'll make a simple prediction without training
        
        # Make predictions (this won't be accurate without training)
        # In a real app, you would use predictor.predict(X)
        # For this example, we'll just use a simple autoregressive model
        predictions = []
        for i in range(min(10, len(X))):  # Predict up to 10 future values
            # Simple prediction: next value is average of last 3 values
            next_val = np.mean(values[-3:])
            predictions.append(next_val)
            values = np.append(values, next_val)
        
        return {"predictions": predictions}
    
    except ValueError as e:
        logger.error(f"Value error in voltage prediction: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in voltage prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/ml/anomalies", response_model=AnomalyResponse)
async def detect_anomalies(data: VoltageDataModel):
    """
    Detect anomalies in voltage data.
    
    Args:
        data: Voltage data
        
    Returns:
        Detected anomalies and statistics
    """
    try:
        # Convert to numpy array
        values = np.array(data.values)
        
        # Detect anomalies
        anomaly_stats = anomaly_detector.get_anomaly_stats(values)
        
        return {
            "anomaly_indices": anomaly_stats["anomaly_indices"],
            "anomaly_values": anomaly_stats["anomaly_values"],
            "anomaly_count": anomaly_stats["anomaly_count"],
            "anomaly_percentage": anomaly_stats["anomaly_percentage"]
        }
    
    except ValueError as e:
        logger.error(f"Value error in anomaly detection: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 