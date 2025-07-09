# Nuxt UI v4 Codemod

**Automated migration tool for upgrading from Nuxt UI (and Nuxt UI Pro) to Nuxt UI v4**

Nuxt UI v4 consolidates Nuxt UI and Nuxt UI Pro into a single package. This codemod handles all the breaking changes automatically.

## What it does

- Updates `@nuxt/ui-pro` → `@nuxt/ui` in package.json
- Merges `uiPro` config into `ui` section in nuxt.config.ts and app.config.ts  
- Replaces CSS imports `@import "@nuxt/ui-pro"` → `@import "@nuxt/ui"`
- Updates module registration in nuxt.config.ts

## Usage

```bash
# Run on current directory (dry-run by default)
npx nuxt-ui-v4-codemod

# Run on specific project
npx nuxt-ui-v4-codemod --target /path/to/project

# Apply changes
npx nuxt-ui-v4-codemod --apply

# Verbose output
npx nuxt-ui-v4-codemod --verbose
```

## Example

**Before:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui-pro'],
  uiPro: { license: 'xxx' },
  ui: { global: true }
})
```

**After:**
```typescript
// nuxt.config.ts  
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  ui: { 
    global: true,
    license: 'xxx' 
  }
})
```

## Options

| Option | Description |
|--------|-------------|
| `--target <path>` | Target directory (default: current) |
| `--apply` | Apply changes (default: dry-run) |
| `--verbose` | Show detailed output |

---

Make sure your project is committed to git before running the migration. 