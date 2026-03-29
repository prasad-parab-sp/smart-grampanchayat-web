#!/bin/bash

# SmartGramPanchayat Web - Development Server Startup Script

echo "🏛️ SmartGramPanchayat Web - Angular 17"
echo "========================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
echo "📱 Open http://localhost:4200 in your browser"
echo "🔑 Login credentials:"
echo "   Admin: 'admin' or 'SMART@123'"
echo "   Citizen: Any 10-digit mobile number (e.g., 9876543210)"
echo ""

# Start the Angular development server
npm start