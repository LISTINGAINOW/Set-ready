#!/bin/bash
# Auto-Commit Hook
# Runs after git operations to ensure changes are pushed

cd /Users/joshuafeuer/.openclaw/workspace/setready

# Check for changes
if [[ -n $(git status --porcelain) ]]; then
    echo "[$(date)] Auto-committing changes..."
    git add -A
    git commit -m "Auto-commit: $(date +%Y-%m-%d-%H%M%S)"
    git push origin main
    echo "[$(date)] Changes pushed to origin"
else
    echo "[$(date)] No changes to commit"
fi
