#!/usr/bin/env node
/**
 * Auto-Commit Script
 * 
 * Runs after each Jason task to commit and push changes automatically
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_PATH = '/Users/joshuafeuer/.openclaw/workspace/setready';

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function runGitCommands() {
  try {
    process.chdir(PROJECT_PATH);
    
    // Check if there are changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      log('No changes to commit');
      return { success: true, committed: false };
    }
    
    // Get timestamp for commit message
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    // Add all changes
    log('Adding changes...');
    execSync('git add -A', { stdio: 'inherit' });
    
    // Commit with timestamp
    log('Committing changes...');
    execSync(`git commit -m "Auto-commit: ${timestamp}"`, { stdio: 'inherit' });
    
    // Push to origin
    log('Pushing to origin...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    log('Changes committed and pushed successfully');
    return { success: true, committed: true };
    
  } catch (error) {
    log(`ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  const result = runGitCommands();
  process.exit(result.success ? 0 : 1);
}

module.exports = { runGitCommands };
