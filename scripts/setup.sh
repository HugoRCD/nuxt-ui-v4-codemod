#!/bin/bash

set -e

echo "🚀 Setting up Nuxt UI v4 migration environment..."

# Check if we're in a Node.js project
if [ ! -f "package.json" ]; then
    echo "❌ Error: No package.json found. Please run this codemod in a Node.js project directory."
    exit 1
fi

# Check for required tools
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ Error: $1 is required but not installed."
        echo "Please install $1 and try again."
        exit 1
    fi
}

echo "📋 Checking required tools..."
check_command "node"
check_command "npm"

# Install jq for JSON manipulation if not present
if ! command -v jq &> /dev/null; then
    echo "📦 Installing jq for JSON processing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install jq
        else
            echo "❌ Error: jq is required. Please install jq (brew install jq on macOS)"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y jq
        elif command -v yum &> /dev/null; then
            sudo yum install -y jq
        else
            echo "❌ Error: jq is required. Please install jq for your Linux distribution"
            exit 1
        fi
    else
        echo "❌ Error: jq is required. Please install jq for your operating system"
        exit 1
    fi
fi

# Create backup directory
BACKUP_DIR=".nuxt-ui-v4-migration-backup-$(date +%Y%m%d_%H%M%S)"
echo "📁 Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup critical files
echo "💾 Creating backups..."
if [ -f "package.json" ]; then
    cp "package.json" "$BACKUP_DIR/"
fi

if [ -f "nuxt.config.ts" ]; then
    cp "nuxt.config.ts" "$BACKUP_DIR/"
fi

if [ -f "nuxt.config.js" ]; then
    cp "nuxt.config.js" "$BACKUP_DIR/"
fi

# Backup CSS files
find . -name "*.css" -not -path "./node_modules/*" -not -path "./.nuxt/*" -not -path "./dist/*" -not -path "./$BACKUP_DIR/*" -exec cp --parents {} "$BACKUP_DIR/" \; 2>/dev/null || true

echo "✅ Setup completed successfully!"
echo "📂 Backup created in: $BACKUP_DIR"
echo "" 