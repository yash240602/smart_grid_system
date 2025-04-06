# Frontend build stage
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Main application stage
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for C++ compilation
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    cmake \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy frontend build from the frontend stage
COPY --from=frontend /app/frontend/dist /app/frontend/dist

# Copy project files
COPY . /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port for API
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app

# Run the application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"] 