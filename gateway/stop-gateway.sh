#!/bin/bash

# ============================================
# NGINX Gateway Stop Script
# ============================================
# Purpose: Stop the NGINX gateway service
# ============================================

echo "========================================"
echo "🛑 Stopping NGINX Gateway..."
echo "========================================"

# Stop and remove gateway container
docker-compose down

echo ""
echo "✅ NGINX Gateway Stopped"
echo ""
