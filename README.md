# nuxt-ui-v4-migration

Migration to Nuxt UI v4

## Installation

```bash
# Install from registry
codemod run nuxt-ui-v4-migration

# Or run locally
codemod run -w workflow.yaml
```

## Usage

This codemod transforms javascript code by:

- Converting `var` declarations to `const`/`let`
- Removing debug statements
- Modernizing syntax patterns

## Development

```bash
# Test the transformation
npm test

# Validate the workflow
codemod validate -w workflow.yaml

# Publish to registry
codemod login
codemod publish
```

## License

MIT 