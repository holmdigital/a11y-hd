# CONCERNS

Date: 2026-05-12

## Technical Debt & Ongoing Issues
- **`react-hooks/exhaustive-deps`**: Some pre-existing issues remain unaddressed as they are deferred to a dedicated react-hooks audit plan (Phase 33 scope).
- **Axe-core upgrade**: A brainstorm conversation exists regarding upgrading `axe-core` from `4.10.2` to `4.11.1`.
- **Component Test Completeness**: Tier 3 (full APG conformance for complex widgets like Combobox, DatePicker) is deferred to Phase 24+.
- **CSS Leakage**: The UI toolkit has scripts to verify no Tailwind CSS leaks into the published library (`check-no-tailwind-leak.mjs`).

## Vulnerabilities & Security
- Puppeteer headless environments must always be run in a secured, non-root sandbox when used dynamically against untrusted domains.
