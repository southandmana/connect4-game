#!/bin/bash

# Connect 4 Game Development Save Script
# Quick save progress without stopping development environment

echo "💾 Saving Connect 4 Development Progress..."
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to project directory
cd ~/Desktop/cursor_projects/cursor_test_app_1/connect4-game

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository!${NC}"
    echo "Make sure you're in the correct project directory."
    exit 1
fi

# Check for uncommitted changes
echo ""
echo "📋 Checking for changes to save..."
CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
    echo -e "${GREEN}✅ No changes to save - everything is already committed!${NC}"
    echo ""
    echo "💡 Your latest commit:"
    git log -1 --pretty=format:"   %h - %s (%cr)" --color=always
    echo ""
    exit 0
fi

# Show what will be saved
echo -e "${YELLOW}📝 Changes to be saved:${NC}"
git status --short
echo ""

# Show a brief diff if there are modified files
MODIFIED_FILES=$(git status --porcelain | grep "^ M" | wc -l | tr -d ' ')
if [ "$MODIFIED_FILES" -gt 0 ]; then
    echo -e "${BLUE}🔍 Preview of changes:${NC}"
    git diff --stat --color=always
    echo ""
fi

# Ask for commit message
echo -e "${YELLOW}💬 Enter commit message:${NC}"
read -p "Message (or press Enter for default): " COMMIT_MSG

# Use default message if none provided
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Save development progress - $(date '+%Y-%m-%d %H:%M')"
    echo -e "${BLUE}Using default message: \"$COMMIT_MSG\"${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Saving changes...${NC}"

# Add all changes
git add .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to stage changes${NC}"
    exit 1
fi

# Commit changes
git commit -m "$COMMIT_MSG"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to commit changes${NC}"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully saved to GitHub!${NC}"
    echo -e "${GREEN}🚀 Vercel will auto-deploy in 1-3 minutes${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    echo "Your changes are committed locally but not backed up online."
    echo "Check your internet connection or try again later."
    exit 1
fi

# Show final status
echo ""
echo "========================================="
echo -e "${GREEN}💾 Save Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  • Changes committed: ✅"
echo "  • Pushed to GitHub: ✅"
echo "  • Auto-deploy triggered: ✅"
echo "  • Development servers: Still running"
echo ""
echo "🎯 Your live site: https://connect4-game-sand.vercel.app"
echo "🔄 Continue coding - your progress is safely saved!"
echo "========================================="