#!/bin/bash
# 🚀 THEX Selenium Grid - Start Script
# Starts Selenium Hub + scalable Chrome/Firefox nodes
#
# Usage:
#   ./start-selenium-video.sh              # 1 Chrome + 1 Firefox node (default)
#   ./start-selenium-video.sh 3 3          # 3 Chrome + 3 Firefox nodes
#   ./start-selenium-video.sh 5 5          # 5 Chrome + 5 Firefox nodes (10 parallel slots)

set -e  # Exit on error

# Configurable node counts (defaults: 1 each)
CHROME_NODES=${1:-1}
FIREFOX_NODES=${2:-1}

echo "🎬 Starting THEX Selenium Grid System..."
echo "   Chrome nodes:  $CHROME_NODES"
echo "   Firefox nodes: $FIREFOX_NODES"
echo ""

# Navigate to project directory
cd /home/imran/Projects/THEX || { echo "❌ Project directory not found!"; exit 1; }

echo "📁 Current directory: $(pwd)"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running! Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Ensure video output directory exists with proper permissions
echo "📂 Ensuring output directories..."
mkdir -p runner/output/videos runner/output/screenshots runner/output/reports
chmod -R 777 runner/output/videos/ 2>/dev/null || true

# Stop any existing Grid containers
echo "🛑 Stopping existing Grid containers..."
docker-compose stop selenium-hub chrome-node firefox-node 2>/dev/null || true

# Start Selenium Hub first (nodes depend on it)
echo "🚀 Starting Selenium Hub..."
docker-compose up -d selenium-hub

echo "⏳ Waiting for Hub to become healthy..."
RETRIES=0
MAX_RETRIES=30
while [ $RETRIES -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:4444/status 2>/dev/null | grep -q '"ready": true\|"ready":true'; then
        echo "✅ Selenium Hub is READY!"
        break
    fi
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -eq $MAX_RETRIES ]; then
        echo "❌ Hub failed to start after ${MAX_RETRIES} attempts"
        echo "📋 Check logs: docker logs selenium-hub"
        exit 1
    fi
    sleep 2
done
echo ""

# Start Chrome and Firefox nodes with scaling
echo "🚀 Starting browser nodes (Chrome: $CHROME_NODES, Firefox: $FIREFOX_NODES)..."
docker-compose up -d --scale chrome-node=$CHROME_NODES --scale firefox-node=$FIREFOX_NODES

echo "⏳ Waiting 10 seconds for nodes to register with Hub..."
sleep 10

# Verify nodes registered with Hub
echo "🔍 Checking Grid status..."
GRID_STATUS=$(curl -s http://localhost:4444/status 2>/dev/null || echo '{}')
READY=$(echo "$GRID_STATUS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    nodes = data.get('value', {}).get('nodes', [])
    total_slots = sum(len(n.get('slots', [])) for n in nodes)
    available = sum(1 for n in nodes if n.get('availability') == 'UP')
    print(f'Nodes registered: {len(nodes)} ({available} UP, {total_slots} total slots)')
except:
    print('Could not parse Grid status')
" 2>/dev/null || echo "Could not parse status")
echo "   $READY"

# Check video directory permissions on a node
echo ""
echo "🔐 Checking video permissions on nodes..."
CHROME_CONTAINER=$(docker ps --filter "ancestor=selenium/node-chrome" --format "{{.ID}}" | head -1)
if [ -n "$CHROME_CONTAINER" ]; then
    if docker exec "$CHROME_CONTAINER" touch /videos/permission_test.txt 2>/dev/null; then
        echo "✅ Video directory permissions OK"
        docker exec "$CHROME_CONTAINER" rm /videos/permission_test.txt 2>/dev/null || true
    else
        echo "⚠️  Fixing video directory permissions..."
        sudo chmod -R 777 runner/output/videos/ 2>/dev/null || true
        echo "✅ Permissions fixed!"
    fi
else
    echo "⚠️  No Chrome node container found to check permissions"
fi

# Show running containers
echo ""
echo "📊 Running Selenium containers:"
docker ps --filter "name=selenium" --filter "name=chrome-node" --filter "name=firefox-node" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || \
docker ps | grep -E "CONTAINER|selenium|chrome-node|firefox-node" || echo "No containers found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 SELENIUM GRID READY! ($CHROME_NODES Chrome + $FIREFOX_NODES Firefox nodes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Available Commands:"
echo ""
echo "  # Run single test (sequential, Chrome):"
echo "  docker-compose run --rm runner python src/runner.py \\"
echo "    --email user@test.com --username tester --file test_github.py"
echo ""
echo "  # Run all tests on Chrome + Firefox in parallel:"
echo "  docker-compose run --rm runner python src/runner.py \\"
echo "    --email user@test.com --username tester \\"
echo "    --browsers chrome,firefox --parallel $((CHROME_NODES + FIREFOX_NODES))"
echo ""
echo "  # Scale nodes up/down later:"
echo "  docker-compose up -d --scale chrome-node=5 --scale firefox-node=5"
echo ""
echo "  # View Grid dashboard:"
echo "  echo http://localhost:4444/ui"
echo ""
echo "  # View latest video:"
echo "  ls -lt runner/output/videos/*.mp4 2>/dev/null | head -3"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
