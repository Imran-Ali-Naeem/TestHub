#!/bin/bash

# Environment initialization script
# Sets up the development environment

set -e

echo "Initializing TestOps environment..."

# Create .env file from example
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env file from .env.example"
    else
        echo "Creating .env file..."
        cat > .env << 'EOF'
# Database Configuration
DATABASE_TYPE=postgres
POSTGRES_USER=testops
POSTGRES_PASSWORD=testops123
POSTGRES_DB=testops
DATABASE_URL=postgresql://testops:testops123@postgres:5432/testops

# MongoDB (if using MongoDB instead)
MONGO_USER=testops
MONGO_PASSWORD=testops123
MONGO_DB=testops
MONGO_URL=mongodb://testops:testops123@mongo:27017/testops

# Redis Configuration
REDIS_URL=redis://redis:6379

# Backend Configuration
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENVIRONMENT=development

# Frontend Configuration
VITE_API_URL=http://localhost/api

# Runner Configuration
DISPLAY=:99
EOF
        echo "Created .env file with default values"
    fi
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p logs
mkdir -p runner/output/videos
mkdir -p runner/output/screenshots
mkdir -p runner/logs

# Set execute permissions on scripts
echo "Setting execute permissions on scripts..."
chmod +x scripts/*.sh

echo ""
echo "Environment initialized successfully!"
echo "Please review and update the .env file with your configuration"
echo ""
echo "Next steps:"
echo "1. Review .env file: nano .env"
echo "2. Start services: ./scripts/start.sh"
