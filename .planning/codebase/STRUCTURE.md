# STRUCTURE

Date: 2026-05-12

## Monorepo Layout
- `/packages` - Contains all monorepo packages.
- `/.planning` - GSD project management and state.
- `/.agent` - Agent configuration and AI capabilities.

## Packages

### `packages/engine`
- `src/cli/` - CLI definitions and entry points.
- `src/core/` - The core virtual DOM and HTML validators.
- `src/reporting/` - Generators for various report types (JUnit, Badges, HTML, PDF).
- `src/i18n/` & `src/locales/` - Internationalization support for reports.
- `src/automation/` - Puppeteer and cloud clients.

### `packages/components`
- `src/` - React components, organized by name (e.g. `src/Button/`, `src/Dialog/`).
- `src/_test/` - Shared test utilities and helper meta-tests.
- `src/_hooks/` - Internal reusable hooks.
- `.storybook/` - Storybook configuration.

### `packages/standards`
- `data/` - JSON schemas and regulatory data (WCAG mappings, local laws).
- `src/` - TypeScript typings and utility exports for consuming the JSON data.
