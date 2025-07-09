# Nuxt UI v4 Migration Codemod

Migration from Nuxt UI Pro to Nuxt UI v4

## 🧪 Testing

Test your rules safely before applying them:

```bash
# Run automated tests on fixtures
./test-codemod.sh
```

This script will:
- Test transformations on `fixtures/` directory
- Compare results with expected output
- Restore original state after testing

## 🚀 Usage

### Validate workflow
```bash
npx codemod@next workflow validate -w workflow.yaml
```

### Run on entire project
```bash
npx codemod@next workflow run -w workflow.yaml
```

### Run on specific directory
```bash
npx codemod@next workflow run -w workflow.yaml --param base_path=nuxt-app
```

## 📋 Current Rules

### CSS Import Replacement
- **Rule**: `rules/replace-css-imports.yml`
- **Target**: `@import "@nuxt/ui-pro";` → `@import "@nuxt/ui";`
- **Files**: `**/*.css`, `**/*.scss`, `**/*.sass`

## 🔧 Development

1. Add new rules in `rules/` directory
2. Update `workflow.yaml` with new steps
3. Add test fixtures in `fixtures/`
4. Test with `./test-codemod.sh`
5. Apply to project when ready 