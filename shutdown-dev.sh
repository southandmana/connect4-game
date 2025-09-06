#!/bin/bash

# Connect 4 Game Development Shutdown Script
# Safely saves work and stops all services

echo "🔴 Shutting Down Development Environment..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project directory
cd ~/Desktop/cursor_projects/cursor_test_app_1/connect4-game

# Step 1: Check for uncommitted changes
echo ""
echo "📋 Checking for uncommitted changes..."
CHANGES=$(git status --porcelain)

if [ -n "$CHANGES" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo ""
    read -p "Do you want to commit and push these changes? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Save work before shutdown - $(date '+%Y-%m-%d %H:%M')"
        fi
        
        echo "Committing and pushing..."
        git add .
        git commit -m "$COMMIT_MSG"
        git push origin main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Changes saved and pushed to GitHub${NC}"
            echo "   Will auto-deploy to Vercel in 1-3 minutes"
        else
            echo -e "${RED}❌ Push failed - check your connection${NC}"
            read -p "Continue with shutdown anyway? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Shutdown cancelled"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Proceeding without saving changes${NC}"
        read -p "Are you sure? Your changes will be lost! (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Shutdown cancelled"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes - all work is saved${NC}"
fi

# Step 2: Stop all servers
echo ""
echo "🛑 Stopping development servers..."

# Stop npm dev server (port 5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "  Stopping npm dev server..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo -e "  ${GREEN}✅ Dev server stopped${NC}"
else
    echo "  ℹ️  Dev server not running"
fi


# Stop preview server (port 4173)
if lsof -Pi :4173 -sTCP:LISTEN -t >/dev/null ; then
    echo "  Stopping preview server..."
    lsof -ti:4173 | xargs kill -9 2>/dev/null
    echo -e "  ${GREEN}✅ Preview server stopped${NC}"
else
    echo "  ℹ️  Preview server not running"
fi

# Step 3: Kill any remaining processes and close browser tabs
echo ""
echo "🧹 Cleaning up background processes..."

# Count processes before killing
NODE_COUNT=$(pgrep -f "node.*connect4" | wc -l | tr -d ' ')


if [ "$NODE_COUNT" -gt 0 ]; then
    pkill -f "node.*connect4"
    echo -e "  ${GREEN}✅ Stopped $NODE_COUNT Node.js process(es)${NC}"
else
    echo "  ℹ️  No background processes to clean"
fi

# Step 4: Verify shutdown
echo ""
echo "🔍 Verifying clean shutdown..."

PORTS_IN_USE=""
for PORT in 5173 4173; do
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PORTS_IN_USE="$PORTS_IN_USE $PORT"
    fi
done

if [ -z "$PORTS_IN_USE" ]; then
    echo -e "${GREEN}✅ All ports are free${NC}"
else
    echo -e "${RED}❌ Warning: These ports are still in use:$PORTS_IN_USE${NC}"
    echo "   You may need to manually kill these processes"
fi

# Step 5: Final summary
echo ""
echo "============================================"
echo -e "${GREEN}✅ Shutdown Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  • Git status: $(if [ -n "$CHANGES" ] && [[ $REPLY =~ ^[Yy]$ ]]; then echo "Changes saved & pushed"; else echo "No changes to save"; fi)"
echo "  • Servers stopped: npm, preview"
echo "  • Ports freed: 5173, 4173"
echo ""
echo "💡 To restart tomorrow:"
echo "  ./start-dev.sh"
echo ""
echo "🎯 You can now safely close Cursor with Cmd+Q"
echo "============================================"