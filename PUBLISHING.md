
# Publishing Flow EVM AgentKit to NPM

This guide will walk you through publishing your Flow EVM AgentKit package to the NPM registry.

## Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **NPM CLI**: Ensure you have npm installed and updated
3. **Package Ready**: Your package should be built and tested

## Step-by-Step Publishing Process

### 1. Prepare Your Package

Make sure your package.json has all required fields:

```json
{
  "name": "flow-evm-agentkit",
  "version": "0.1.0",
  "description": "TypeScript SDK for building LLM-integrated autonomous agents on Flow EVM",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": [
    "flow",
    "evm",
    "blockchain",
    "agent",
    "llm",
    "typescript",
    "web3",
    "ai",
    "autonomous"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/flow-evm-agentkit"
  },
  "bugs": {
    "url": "https://github.com/your-username/flow-evm-agentkit/issues"
  },
  "homepage": "https://github.com/your-username/flow-evm-agentkit#readme"
}
```

### 2. Build Your Package

```bash
npm run build
```

This compiles TypeScript to JavaScript and generates type definitions.

### 3. Test Your Package Locally

Test your package locally before publishing:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Test the build
npm run build

# Test the examples
npm run tx-echo
```

### 4. Login to NPM

```bash
npm login
```

Enter your NPM credentials when prompted.

### 5. Check Package Contents

See what will be published:

```bash
npm pack --dry-run
```

This shows you exactly what files will be included in your package.

### 6. Publish to NPM

For the first publication:

```bash
npm publish
```

For subsequent versions, update the version first:

```bash
# Update version (patch, minor, or major)
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0

# Then publish
npm publish
```

### 7. Verify Publication

Check your package on NPM:
- Visit: `https://www.npmjs.com/package/flow-evm-agentkit`
- Test installation: `npm install flow-evm-agentkit`

## Best Practices

### Version Management

Follow [Semantic Versioning (SemVer)](https://semver.org/):
- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

### Files to Include/Exclude

Create a `.npmignore` file to exclude unnecessary files:

```
# Source files
src/
tsconfig.json
.env*

# Development files
*.test.ts
*.spec.ts
jest.config.js

# IDE files
.vscode/
.idea/

# Logs
logs/
*.log

# Examples (optional - you might want to include these)
examples/
```

### Package Quality

Before publishing, ensure:
- ✅ All tests pass
- ✅ Documentation is complete
- ✅ Examples work correctly
- ✅ TypeScript types are exported
- ✅ Dependencies are minimal and necessary

### Security

- Never include private keys or sensitive data
- Use `.env.example` for environment templates
- Include security warnings in documentation

## Publishing Workflow

### Automated Publishing with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Manual Publishing Steps

1. **Update Version**: `npm version patch|minor|major`
2. **Test**: `npm test`
3. **Build**: `npm run build`
4. **Publish**: `npm publish`
5. **Tag**: `git push --tags`

## Post-Publication

### 1. Update Documentation

- Update README with installation instructions
- Add badges for npm version and downloads
- Update examples to use the published package

### 2. Announce

- Share on social media
- Post in relevant communities
- Update your portfolio/website

### 3. Monitor

- Watch for issues and feedback
- Monitor download statistics
- Respond to community questions

## Troubleshooting

### Common Issues

**"Package name already exists"**
- Choose a unique name
- Use scoped packages: `@yourname/flow-evm-agentkit`

**"You do not have permission to publish"**
- Check if you're logged in: `npm whoami`
- Verify package name ownership

**"Build fails before publish"**
- Run `npm run build` locally first
- Fix TypeScript errors
- Ensure all dependencies are installed

### Package Scoping

If the name is taken, use a scoped package:

```json
{
  "name": "@yourname/flow-evm-agentkit",
  "publishConfig": {
    "access": "public"
  }
}
```

Then publish with:
```bash
npm publish --access public
```

## Maintenance

### Regular Updates

- Keep dependencies updated
- Fix reported bugs promptly
- Add new features based on community feedback
- Maintain documentation

### Deprecation

If you need to deprecate a version:

```bash
npm deprecate flow-evm-agentkit@0.1.0 "This version has security issues"
```

---

**Ready to publish?** Follow these steps carefully and your Flow EVM AgentKit will be available to developers worldwide!
