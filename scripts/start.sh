#!/bin/bash

# Start script for TestOps platform
# This script starts all services using docker-compose

set -e

echo "Starting TestOps platform..."

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Please configure .env file and run again"
        exit 1
    else
        echo "Error: .env.example not found"
        exit 1
    fi
fi

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo "Checking service health..."
docker-compose ps

echo ""
echo "TestOps platform started successfully!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost/api"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
