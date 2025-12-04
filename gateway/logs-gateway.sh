#!/bin/bash

# ============================================
# NGINX Gateway Logs Script
# ============================================
# Purpose: View NGINX gateway logs in real-time
# Usage: ./logs-gateway.sh
# ============================================

echo "========================================"
echo "📋 NGINX Gateway Logs"
echo "========================================"
echo "Press Ctrl+C to exit"
echo ""

docker logs -f testops-gateway
