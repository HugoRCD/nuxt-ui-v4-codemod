#!/bin/bash

set -e

echo "🧹 Cleaning up temporary files..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Remove any leftover .bak files
echo "🗑️  Removing backup files (.bak)..."
find . -name "*.bak" -not -path "./node_modules/*" -not -path "./.nuxt/*" -not -path "./dist/*" -delete 2>/dev/null || true

# Remove any temporary files
echo "🗑️  Removing temporary files (.tmp)..."
find . -name "*.tmp" -not -path "./node_modules/*" -not -path "./.nuxt/*" -not -path "./dist/*" -delete 2>/dev/null || true

# Check if there are any package-lock.json or yarn.lock that need updating
echo -e "\n${PURPLE}📋 Post-migration checklist:${NC}"

echo -e "\n${CYAN}1. Dependencies Update Required:${NC}"
if [ -f "package-lock.json" ]; then
    echo -e "   ${YELLOW}⚠${NC} Found package-lock.json - run ${BLUE}npm install${NC} to update lockfile"
fi

if [ -f "yarn.lock" ]; then
    echo -e "   ${YELLOW}⚠${NC} Found yarn.lock - run ${BLUE}yarn install${NC} to update lockfile"
fi

if [ -f "pnpm-lock.yaml" ]; then
    echo -e "   ${YELLOW}⚠${NC} Found pnpm-lock.yaml - run ${BLUE}pnpm install${NC} to update lockfile"
fi

echo -e "\n${CYAN}2. Manual Steps Required:${NC}"
echo "   📦 Install the new Nuxt UI v4:"
echo "      npm install @nuxt/ui@latest"
echo "      npm uninstall @nuxt/ui-pro"
echo ""
echo "   🧪 Test your application:"
echo "      npm run dev"
echo ""
echo "   🔍 Review breaking changes:"
echo "      Check the Nuxt UI v4 migration guide for component changes"

echo -e "\n${CYAN}3. Files to Review:${NC}"

# Check for common files that might need manual review
review_files=()

# Check for composables that might import from @nuxt/ui-pro
if find . -path "./composables/*.ts" -o -path "./composables/*.js" | head -1 | grep -q .; then
    review_files+=("composables/ - Check for any custom composables using Nuxt UI Pro")
fi

# Check for plugins
if find . -path "./plugins/*.ts" -o -path "./plugins/*.js" | head -1 | grep -q .; then
    review_files+=("plugins/ - Check for any plugins using Nuxt UI Pro")
fi

# Check for middleware
if find . -path "./middleware/*.ts" -o -path "./middleware/*.js" | head -1 | grep -q .; then
    review_files+=("middleware/ - Check for any middleware using Nuxt UI Pro")
fi

# Check for app.config.ts
if [ -f "app.config.ts" ] || [ -f "app.config.js" ]; then
    review_files+=("app.config.ts/js - Review Nuxt UI configuration")
fi

if [ ${#review_files[@]} -gt 0 ]; then
    for file in "${review_files[@]}"; do
        echo "   📄 $file"
    done
else
    echo -e "   ${GREEN}✓${NC} No additional files need manual review"
fi

echo -e "\n${CYAN}4. Common Breaking Changes to Watch For:${NC}"
echo "   🔄 Component prop changes (consult migration guide)"
echo "   🎨 CSS class changes"
echo "   🔧 Composable API changes"
echo "   📱 Layout and theme configuration updates"

# Find the backup directory
BACKUP_DIR=$(find . -maxdepth 1 -name ".nuxt-ui-v4-migration-backup-*" -type d | head -1)

if [ -n "$BACKUP_DIR" ]; then
    echo -e "\n${PURPLE}💾 Backup Information:${NC}"
    echo -e "   ${GREEN}✓${NC} Original files backed up in: ${BLUE}$BACKUP_DIR${NC}"
    echo "   💡 You can restore files from this backup if needed"
    echo "   🗑️  Remove this directory after confirming migration success"
else
    echo -e "\n${YELLOW}⚠${NC} No backup directory found"
fi

echo -e "\n${CYAN}5. Verification Steps:${NC}"
echo "   1. 🔍 Search for any remaining '@nuxt/ui-pro' references:"
echo "      grep -r '@nuxt/ui-pro' . --exclude-dir=node_modules"
echo ""
echo "   2. 🧪 Start your development server:"
echo "      npm run dev"
echo ""
echo "   3. 🎯 Test key functionality:"
echo "      - Component rendering"
echo "      - Theme switching (if applicable)"
echo "      - Form components"
echo "      - Navigation components"

echo -e "\n${GREEN}🎉 Nuxt UI v4 Migration Cleanup Complete!${NC}"
echo -e "\n${PURPLE}📖 Additional Resources:${NC}"
echo "   📚 Nuxt UI v4 Documentation: https://ui.nuxt.com"
echo "   🔄 Migration Guide: https://ui.nuxt.com/getting-started/migration"
echo "   💬 Community Support: https://discord.nuxt.com"

echo -e "\n${GREEN}✅ Cleanup completed successfully!${NC}" 