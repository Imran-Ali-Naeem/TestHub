#!/bin/bash
# 🛑 THEX Selenium Grid - Stop Script
# Stops Hub + all Chrome/Firefox node containers
#
# Usage:
#   ./stop-selenium-video.sh          # Stop all Grid containers
#   ./stop-selenium-video.sh --rm     # Stop and remove all Grid containers

set -e

echo "🛑 Stopping THEX Selenium Grid System..."
echo ""

cd /home/imran/Projects/THEX || { echo "❌ Project directory not found!"; exit 1; }

echo "📁 Current directory: $(pwd)"
echo ""

# Show what's currently running before stopping
echo "📊 Currently running Grid containers:"
docker ps --filter "name=selenium" --filter "name=chrome-node" --filter "name=firefox-node" \
    --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "   None found"
echo ""

# Stop all Grid containers (Hub + all node replicas)
echo "🛑 Stopping Selenium Hub + all browser nodes..."
docker-compose stop selenium-hub chrome-node firefox-node 2>/dev/null || true

# If --rm flag passed, also remove the containers
if [[ "$1" == "--rm" ]]; then
    echo "🗑️  Removing stopped Grid containers..."
    docker-compose rm -f selenium-hub chrome-node firefox-node 2>/dev/null || true
    echo "✅ Containers removed"
fi

echo ""
echo "✅ Selenium Grid stopped"
echo ""

# Show remaining status
echo "📊 Remaining Selenium containers:"
docker ps -a --filter "name=selenium" --filter "name=chrome-node" --filter "name=firefox-node" \
    --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "   None"
echo ""
echo "💡 To restart Grid with scaling:"
echo "   ./start-selenium-video.sh 5 5     # 5 Chrome + 5 Firefox nodes"
echo ""
echo "💡 To completely remove all containers:"
echo "   ./stop-selenium-video.sh --rm"
