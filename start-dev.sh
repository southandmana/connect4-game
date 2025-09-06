#!/bin/bash

# Connect 4 Game Development Startup Script
# This script starts everything you need for development

echo "🎮 Starting Connect 4 Game Development Environment..."
echo "================================================"

# Navigate to project directory
cd ~/Desktop/cursor_projects/cursor_test_app_1/connect4-game

# Show current git status
echo ""
echo "📊 Git Status:"
git status --short

# Check if dev server is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo ""
    echo "⚠️  Dev server already running on port 5173"
    echo "Opening browser..."
else
    echo ""
    echo "🚀 Starting development server..."
    npm run dev &
    
    # Wait for server to start
    echo "Waiting for server to start..."
    sleep 3
fi

# Open browser
echo ""
echo "🌐 Opening browser to http://localhost:5173"
open http://localhost:5173

echo ""
echo "✅ Development environment ready!"
echo ""
echo "📝 Quick Commands:"
echo "  - Stop server: Press Ctrl+C"
echo "  - View live site: https://connect4-game-sand.vercel.app"
echo "  - Git push: git add . && git commit -m 'your message' && git push"
echo ""
echo "🎯 Your game is running at: http://localhost:5173"