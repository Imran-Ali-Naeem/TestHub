#!/bin/bash

###############################################################################
# Database Microservice Logs Viewer
# 
# Purpose: View real-time logs from database containers
# Usage: ./logs-db.sh [service_name]
#        ./logs-db.sh         # View all logs
#        ./logs-db.sh mongo   # View MongoDB logs only
###############################################################################

SERVICE_NAME=${1:-}

echo "======================================"
echo "Database Microservice Logs"
echo "======================================"
echo ""

if [ -z "$SERVICE_NAME" ]; then
    echo "📝 Showing logs for all services (press Ctrl+C to exit)..."
    echo ""
    docker-compose logs -f
else
    echo "📝 Showing logs for: $SERVICE_NAME (press Ctrl+C to exit)..."
    echo ""
    docker-compose logs -f "$SERVICE_NAME"
fi
