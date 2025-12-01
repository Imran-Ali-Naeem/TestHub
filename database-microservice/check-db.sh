#!/bin/bash

###############################################################################
# Database Microservice Status Check Script
# 
# Purpose: Check the status and health of database containers
# Usage: ./check-db.sh
###############################################################################

echo "======================================"
echo "Database Microservice Status"
echo "======================================"
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed"
    exit 1
fi

# Check container status
echo "📊 Container Status:"
docker-compose ps
echo ""

# Check if MongoDB is accessible
echo "🔍 Testing MongoDB Connection:"
if docker exec testops-mongo mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB is running and accessible"
else
    echo "❌ MongoDB is not accessible"
fi
echo ""

# Check if Mongo Express is accessible
echo "🔍 Testing Mongo Express:"
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Mongo Express is running and accessible"
    echo "   URL: http://localhost:8081"
else
    echo "❌ Mongo Express is not accessible"
fi
echo ""

# Show recent logs
echo "📝 Recent Logs (last 10 lines):"
echo ""
echo "--- MongoDB Logs ---"
docker-compose logs --tail=10 mongo
echo ""
echo "--- Mongo Express Logs ---"
docker-compose logs --tail=10 mongo-express
echo ""

# Check database collections
echo "📚 Database Collections:"
docker exec testops-mongo mongosh testops --eval "db.getCollectionNames()" --quiet 2>/dev/null || echo "Could not retrieve collections"
echo ""

# Count users
echo "👥 User Count:"
docker exec testops-mongo mongosh testops --eval "db.users.countDocuments()" --quiet 2>/dev/null || echo "Could not count users"
echo ""

echo "======================================"
echo "Status Check Complete"
echo "======================================"
