# TESTING

Date: 2026-05-12

## Frameworks
- Uses **Vitest** for unit and integration testing across the monorepo.
- Uses `jsdom` for testing React components.
- `@testing-library/react` and `@testing-library/user-event` for user interaction simulation.

## UI Component Testing Standards
- **Enforced WCAG Coverage Headers:** Every test file must list the WCAG Success Criteria it covers at the top of the file.
- **Tiered Approach:**
  - `Tier 1: Table Stakes`: Component mounting, class merging, ref forwarding, basic prop behaviors.
  - `Tier 2: A11y Differentiators`: Keyboard sequences, focus management, ARIA roles, lack of axe violations.
- **Strict Anti-patterns:**
  - NO DOM snapshot testing.
  - NO CSS class selectors (use `getByRole`).
  - NO internal state probing.
  - NO `data-testid` inside the library itself.
  - Required Space/Enter keyboard equivalence tests for clicks.

## Test Scripts
- `npm run test` -> local vitest execution.
- `npm run test:ci` -> CI execution including `check-wcag-headers.mjs` and CSS-leak checkers.
