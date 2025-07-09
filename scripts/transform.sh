#!/bin/bash

set -e

echo "🔄 Applying Nuxt UI v4 transformations..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters for tracking changes
TOTAL_FILES_PROCESSED=0
TOTAL_CHANGES_MADE=0

# Function to log transformations
log_transformation() {
    local file="$1"
    local description="$2"
    echo -e "${GREEN}✓${NC} ${BLUE}$file${NC}: $description"
    ((TOTAL_CHANGES_MADE++))
}

# Function to process files safely
process_file() {
    local file="$1"
    local temp_file="$file.tmp"
    
    if [ -f "$file" ]; then
        ((TOTAL_FILES_PROCESSED++))
        return 0
    else
        return 1
    fi
}

echo -e "${PURPLE}📦 Step 1: Transforming package.json dependencies${NC}"

# Transform package.json
if [ -f "package.json" ]; then
    echo "Processing package.json..."
    
    # Check if @nuxt/ui-pro exists in dependencies or devDependencies
    if grep -q '"@nuxt/ui-pro"' package.json; then
        # Use jq to safely replace the dependency
        jq '
            if .dependencies and .dependencies["@nuxt/ui-pro"] then 
                .dependencies["@nuxt/ui"] = .dependencies["@nuxt/ui-pro"] |
                del(.dependencies["@nuxt/ui-pro"])
            else . end |
            if .devDependencies and .devDependencies["@nuxt/ui-pro"] then 
                .devDependencies["@nuxt/ui"] = .devDependencies["@nuxt/ui-pro"] |
                del(.devDependencies["@nuxt/ui-pro"])
            else . end |
            if .peerDependencies and .peerDependencies["@nuxt/ui-pro"] then 
                .peerDependencies["@nuxt/ui"] = .peerDependencies["@nuxt/ui-pro"] |
                del(.peerDependencies["@nuxt/ui-pro"])
            else . end
        ' package.json > package.json.tmp && mv package.json.tmp package.json
        
        log_transformation "package.json" "Replaced @nuxt/ui-pro with @nuxt/ui in dependencies"
        ((TOTAL_FILES_PROCESSED++))
    else
        echo "No @nuxt/ui-pro dependency found in package.json"
        ((TOTAL_FILES_PROCESSED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} package.json not found"
fi

echo -e "\n${PURPLE}⚙️  Step 2: Transforming Nuxt configuration files${NC}"

# Transform nuxt.config.ts
transform_nuxt_config() {
    local config_file="$1"
    if [ -f "$config_file" ]; then
        echo "Processing $config_file..."
        
        # Create a more robust sed pattern that handles different quote styles and spacing
        sed -i.bak \
            -e "s/'@nuxt\/ui-pro'/'@nuxt\/ui'/g" \
            -e 's/"@nuxt\/ui-pro"/"@nuxt\/ui"/g' \
            -e "s/\`@nuxt\/ui-pro\`/\`@nuxt\/ui\`/g" \
            "$config_file"
        
        # Check if changes were made
        if ! cmp -s "$config_file" "$config_file.bak"; then
            log_transformation "$config_file" "Replaced @nuxt/ui-pro with @nuxt/ui in modules"
            rm "$config_file.bak"
        else
            echo "No @nuxt/ui-pro references found in $config_file"
            rm "$config_file.bak"
        fi
        ((TOTAL_FILES_PROCESSED++))
    fi
}

transform_nuxt_config "nuxt.config.ts"
transform_nuxt_config "nuxt.config.js"

echo -e "\n${PURPLE}🎨 Step 3: Transforming CSS import statements${NC}"

# Transform CSS files
find . -name "*.css" -not -path "./node_modules/*" -not -path "./.nuxt/*" -not -path "./dist/*" -not -path "./.nuxt-ui-v4-migration-backup-*/*" | while read -r css_file; do
    if [ -f "$css_file" ]; then
        echo "Processing $css_file..."
        
        # Replace @import statements for @nuxt/ui-pro
        sed -i.bak \
            -e 's/@import[[:space:]]*"@nuxt\/ui-pro"/@import "@nuxt\/ui"/g' \
            -e "s/@import[[:space:]]*'@nuxt\/ui-pro'/@import '@nuxt\/ui'/g" \
            -e 's/@import[[:space:]]*url("@nuxt\/ui-pro")/@import url("@nuxt\/ui")/g' \
            -e "s/@import[[:space:]]*url('@nuxt\/ui-pro')/@import url('@nuxt\/ui')/g" \
            "$css_file"
        
        # Check if changes were made
        if ! cmp -s "$css_file" "$css_file.bak"; then
            log_transformation "$css_file" "Replaced @nuxt/ui-pro imports with @nuxt/ui"
            rm "$css_file.bak"
        else
            rm "$css_file.bak"
        fi
        ((TOTAL_FILES_PROCESSED++))
    fi
done

echo -e "\n${PURPLE}🔧 Step 4: Transforming SCSS/SASS import statements${NC}"

# Transform SCSS/SASS files
find . \( -name "*.scss" -o -name "*.sass" \) -not -path "./node_modules/*" -not -path "./.nuxt/*" -not -path "./dist/*" -not -path "./.nuxt-ui-v4-migration-backup-*/*" | while read -r sass_file; do
    if [ -f "$sass_file" ]; then
        echo "Processing $sass_file..."
        
        # Replace @import and @use statements for @nuxt/ui-pro
        sed -i.bak \
            -e 's/@import[[:space:]]*"@nuxt\/ui-pro"/@import "@nuxt\/ui"/g' \
            -e "s/@import[[:space:]]*'@nuxt\/ui-pro'/@import '@nuxt\/ui'/g" \
            -e 's/@use[[:space:]]*"@nuxt\/ui-pro"/@use "@nuxt\/ui"/g' \
            -e "s/@use[[:space:]]*'@nuxt\/ui-pro'/@use '@nuxt\/ui'/g" \
            "$sass_file"
        
        # Check if changes were made
        if ! cmp -s "$sass_file" "$sass_file.bak"; then
            log_transformation "$sass_file" "Replaced @nuxt/ui-pro imports with @nuxt/ui"
            rm "$sass_file.bak"
        else
            rm "$sass_file.bak"
        fi
        ((TOTAL_FILES_PROCESSED++))
    fi
done

echo -e "\n${PURPLE}📜 Step 5: Transforming JavaScript/TypeScript import statements${NC}"

# Transform JS/TS/Vue files
find . \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" \) \
    -not -path "./node_modules/*" \
    -not -path "./.nuxt/*" \
    -not -path "./dist/*" \
    -not -path "./.nuxt-ui-v4-migration-backup-*/*" | while read -r js_file; do
    
    if [ -f "$js_file" ]; then
        echo "Processing $js_file..."
        
        # Replace various import/require patterns
        sed -i.bak \
            -e 's/from[[:space:]]*"@nuxt\/ui-pro"/from "@nuxt\/ui"/g' \
            -e "s/from[[:space:]]*'@nuxt\/ui-pro'/from '@nuxt\/ui'/g" \
            -e 's/import[[:space:]]*"@nuxt\/ui-pro"/import "@nuxt\/ui"/g' \
            -e "s/import[[:space:]]*'@nuxt\/ui-pro'/import '@nuxt\/ui'/g" \
            -e 's/require([[:space:]]*"@nuxt\/ui-pro")/require("@nuxt\/ui")/g' \
            -e "s/require([[:space:]]*'@nuxt\/ui-pro')/require('@nuxt\/ui')/g" \
            -e 's/@nuxt\/ui-pro\//@nuxt\/ui\//g' \
            "$js_file"
        
        # Check if changes were made
        if ! cmp -s "$js_file" "$js_file.bak"; then
            log_transformation "$js_file" "Replaced @nuxt/ui-pro imports with @nuxt/ui"
            rm "$js_file.bak"
        else
            rm "$js_file.bak"
        fi
        ((TOTAL_FILES_PROCESSED++))
    fi
done

echo -e "\n${PURPLE}🔍 Step 6: Looking for additional references${NC}"

# Search for any remaining references to @nuxt/ui-pro (excluding node_modules, .nuxt, dist, and backup)
echo "Searching for any remaining @nuxt/ui-pro references..."
REMAINING_REFS=$(grep -r "@nuxt/ui-pro" . \
    --exclude-dir=node_modules \
    --exclude-dir=.nuxt \
    --exclude-dir=dist \
    --exclude-dir=.nuxt-ui-v4-migration-backup-* \
    --exclude="*.log" \
    2>/dev/null || true)

if [ -n "$REMAINING_REFS" ]; then
    echo -e "${YELLOW}⚠${NC} Found remaining references to @nuxt/ui-pro:"
    echo "$REMAINING_REFS"
    echo -e "${YELLOW}Please review and update these manually if needed.${NC}"
else
    echo -e "${GREEN}✓${NC} No remaining @nuxt/ui-pro references found!"
fi

echo -e "\n${CYAN}📊 Migration Summary${NC}"
echo "────────────────────────────────────────"
echo -e "Files processed: ${BLUE}$TOTAL_FILES_PROCESSED${NC}"
echo -e "Changes made: ${GREEN}$TOTAL_CHANGES_MADE${NC}"
echo ""

if [ $TOTAL_CHANGES_MADE -gt 0 ]; then
    echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo "1. Update your dependencies by running:"
    echo "   npm install @nuxt/ui@latest"
    echo "   npm uninstall @nuxt/ui-pro"
    echo ""
    echo "2. Test your application thoroughly"
    echo "3. Review any remaining manual changes needed"
    echo ""
    echo -e "${PURPLE}💡 Note:${NC} Your original files have been backed up in the .nuxt-ui-v4-migration-backup-* directory"
else
    echo -e "${YELLOW}ℹ️${NC} No @nuxt/ui-pro references found to migrate."
fi

echo -e "\n${GREEN}✅ Transformation completed!${NC}" 