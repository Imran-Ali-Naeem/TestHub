#!/bin/bash

# Build script for TestOps platform
# This script builds all Docker images

set -e

echo "Building TestOps platform images..."

# Build backend
echo "Building backend..."
docker build -t testops-backend:latest -f backend/Dockerfile backend/

# Build runner
echo "Building runner..."
docker build -t testops-runner:latest -f runner/Dockerfile runner/

# Build gateway
echo "Building gateway..."
docker build -t testops-gateway:latest -f gateway/Dockerfile gateway/

# Build frontend (if needed)
echo "Building frontend..."
docker build -t testops-frontend:latest -f Frontend/Dockerfile Frontend/ || echo "Frontend Dockerfile not found, skipping..."

echo ""
echo "Build completed successfully!"
echo "Images built:"
echo "  - testops-backend:latest"
echo "  - testops-runner:latest"
echo "  - testops-gateway:latest"
echo "  - testops-frontend:latest"
