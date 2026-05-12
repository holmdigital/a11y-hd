# STACK

Date: 2026-05-12

## Languages
- TypeScript (v5.7)
- JavaScript (Node.js script runners)
- HTML/CSS (in components)

## Runtimes & Frameworks
- Node.js (>=18.0)
- React (v18.3 / v19.0)
- React DOM (v18.3 / v19.0)

## Build Tools & Bundlers
- tsup (v8.3)
- Vite (via vitest/storybook)
- Changesets (for versioning and releasing)
- @arethetypeswrong/cli / publint (for export checks)

## Key Dependencies
- **Engine**: axe-core (v4.11), puppeteer (v23), commander, cosmiconfig, html-validate, ws, chalk, ora
- **Components**: lucide-react (optional peer dependency)
- **Standards**: Local JSON datasets containing WCAG and EN301549 mappings

## Configuration
- TypeScript config (`tsconfig.json` extended from base)
- ESLint config (`eslint.config.mjs` - flat config with TS and React Hooks)
- Prettier for formatting
