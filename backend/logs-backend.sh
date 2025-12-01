#!/bin/bash

###############################################################################
# Backend API Logs Viewer
# 
# Purpose: View real-time logs from backend API
# Usage: ./logs-backend.sh
###############################################################################

echo "======================================"
echo "Backend API Logs"
echo "======================================"
echo ""
echo "📝 Showing logs (press Ctrl+C to exit)..."
echo ""

docker-compose logs -f
