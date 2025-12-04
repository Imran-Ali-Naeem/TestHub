#!/bin/bash

# ============================================
# NGINX Gateway Startup Script
# ============================================
# Purpose: Start the NGINX gateway service
# Prerequisites: 
#   - Backend service must be running
#   - Frontend service must be running on port 3456
# ============================================

echo "========================================"
echo "🚀 Starting NGINX Gateway..."
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

# Check if network exists (created by database-microservice)
if ! docker network ls | grep -q "testops-db-network"; then
    echo "❌ ERROR: testops-db-network does not exist"
    echo "Please start the database service first using:"
    echo "  cd ../database-microservice && ./start-db.sh"
    exit 1
fi

# Check if backend is running
if ! docker ps | grep -q "testops-backend-api"; then
    echo "⚠️  WARNING: Backend service is not running"
    echo "Gateway will start but API calls will fail"
    echo "Start backend with: cd ../backend && ./start-backend.sh"
fi

# Stop existing gateway if running
if docker ps -a | grep -q "testops-gateway"; then
    echo "🔄 Stopping existing gateway..."
    docker stop testops-gateway > /dev/null 2>&1
    docker rm testops-gateway > /dev/null 2>&1
fi

# Start gateway service
echo "🚀 Starting NGINX gateway..."
docker-compose up -d

# Wait for gateway to be healthy
echo "⏳ Waiting for gateway to be ready..."
sleep 3

# Check if gateway is running
if docker ps | grep -q "testops-gateway"; then
    echo ""
    echo "========================================"
    echo "✅ NGINX Gateway Started Successfully!"
    echo "========================================"
    echo ""
    echo "📍 Gateway is running at:"
    echo "   http://localhost:80"
    echo ""
    echo "🔍 Health check:"
    echo "   http://localhost/health"
    echo ""
    echo "🔗 API Routes (proxied to backend:8080):"
    echo "   http://localhost/api/auth/login"
    echo "   http://localhost/api/auth/google"
    echo "   http://localhost/api/users/signup"
    echo "   http://localhost/api/auth/me"
    echo ""
    echo "📝 Logs:"
    echo "   ./logs-gateway.sh"
    echo ""
    echo "🛑 Stop:"
    echo "   ./stop-gateway.sh"
    echo ""
    echo "========================================"
else
    echo ""
    echo "❌ Failed to start gateway"
    echo "Check logs with: docker logs testops-gateway"
    exit 1
fi
