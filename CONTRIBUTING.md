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
```

## Contribution Guidelines

### Adding New WCAG Rules ⚖️
**Strict Requirement:** All regulatory contributions MUST be backed by an official government source.

1. Add the rule to `packages/standards/data/rules.en.json`.
2. **Cite your source**: You must include a link to the legislation (e.g., `laws.ghana.gov.gh`) in the Pull Request description.
3. Add translations to other locale files (`rules.sv.json`, etc.).
4. Ensure the rule includes:
   - `wcagCriteria`: Exact Success Criterion (e.g., "1.1.1").
   - `en301549Criteria`: EN 301 549 Clause (e.g., "9.1.1.1").
   - `holmdigitalInsight`: A helpful, non-technical explanation.

### Contributing Components 🧩
We follow a **Compliance-First** design philosophy.

- **No `<div>` Soup**: Use semantic HTML elements (`<nav>`, `<main>`, `<article>`) always.
- **Strict Props**: Don't allow users to break accessibility.
    - *Bad*: `aria-label?: string` (Optional)
    - *Good*: `aria-label: string` (Required if no visible label exists)
- **Forward Regs**: All functional components must use `React.forwardRef`.

### Documentation 📚
Code without documentation is technical debt.
- **New Features**: Must update `README.md` and `docs/`.
- **Bug Fixes**: Should include a reproduction case in the PR description.

### Code Style
- **TypeScript**: Strict mode enabled. No `any` — use `Reflect.set` for global mock writes, `as unknown as T` for partial-fixture widening in tests, `// @ts-expect-error` for intentionally-invalid inputs to negative-path tests.
- **Verify gate**: Run `npm run verify -w @holmdigital/<pkg>` before committing. This runs the full `prepublishOnly` chain: `build && lint && typecheck && check:exports && check:types && test:ci`. All 3 packages are currently lint-clean at zero warnings — keep them that way. `npm publish` will fail if lint or typecheck reports errors.
- **Tests**: 100% coverage for compliance logic.

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

## Code of Conduct 💖

We are committed to making participation in this project a harassment-free experience for everyone, regardless of level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

Examples of unacceptable behavior include:
- The use of sexualized language or imagery.
- Personal attacks, trolling, or insulting/derogatory comments.
- Public or private harassment.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
