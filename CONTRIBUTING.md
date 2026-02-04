# Contributing to HolmDigital

Thank you for your interest in contributing! This document provides guidelines for contributing to the HolmDigital accessibility toolkit.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
# Clone the repository
git clone https://github.com/holmdigital/a11y-hd.git
cd a11y-hd

# Install dependencies
npm install

# Build all packages
npm run build -w @holmdigital/standards
npm run build -w @holmdigital/engine
npm run build -w @holmdigital/components
```

## Development Workflow

### Running Tests
```bash
# Run all tests
npm test -w @holmdigital/engine

# Watch mode
npm test -w @holmdigital/engine -- --watch
```

### Building Packages
```bash
# Build specific package
npm run build -w @holmdigital/engine

# Watch mode for development
npm run dev -w @holmdigital/engine
```

### Running the CLI
```bash
# After building the engine
npx hd-a11y-scan https://example.com --json
```

## Project Structure

```
a11y-hd/
├── packages/
│   ├── engine/          # Core scanning engine
│   ├── standards/       # Regulatory rules database
│   └── components/      # Accessible React components
├── holmdigital-wiki/    # Documentation site
└── holmdigital-website/ # Marketing site
```

## Contribution Guidelines

### Adding New WCAG Rules

1. Add the rule to `packages/standards/data/rules.en.json`
2. Add translations to other locale files (`rules.sv.json`, `rules.de.json`, etc.)
3. Ensure the rule includes all required fields:
   - `ruleId`: axe-core rule identifier
   - `wcagCriteria`: WCAG success criterion (e.g., "1.1.1")
   - `en301549Criteria`: EN 301 549 mapping
   - `holmdigitalInsight`: Risk levels and interpretation

### Adding Translations

1. Edit the locale file in `packages/engine/src/locales/`
2. Ensure all keys from `en.json` are present
3. Test with `npx hd-a11y-scan <url> --lang <code>`

### Code Style

- Use TypeScript for all source files
- Follow existing patterns in the codebase
- Write tests for new functionality
- Run linting before committing

### Versioning & Releases (Important!) 🚨

We use [Changesets](https://github.com/changesets/changesets) to manage versions.

**If your PR contains a user-facing change (bug fix, new feature), you MUST run:**
```bash
npx changeset
```
1. Select the packages you modified.
2. Choose the bump type (`major`, `minor`, or `patch`).
3. Write a summary of your change.

This creates a markdown file in `.changeset/`. Without this, your changes will be merged but **never published to npm**.

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. **Run `npx changeset` (if applicable)**
6. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
7. Push and open a Pull Request

## Reporting Issues

When reporting issues, please include:
- Node.js and npm versions
- Steps to reproduce
- Expected vs actual behavior
- Any error messages or logs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
