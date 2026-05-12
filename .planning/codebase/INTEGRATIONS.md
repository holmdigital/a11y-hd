# INTEGRATIONS

Date: 2026-05-12

## External Services & APIs
- **GitHub Actions**: Integrated in `engine/src/reporting/github-actions.ts` for CI reporting.
- **Axe-core**: Embedded in `engine` as the primary regulatory accessibility scanner.
- **Puppeteer**: Used for launching headless Chrome and evaluating pages via WS.

## Internal Dependencies
- `@holmdigital/components` -> depends on `@holmdigital/standards`
- `@holmdigital/engine` -> depends on `@holmdigital/components` and `@holmdigital/standards`

## Datastores & Storage
- No external databases. Uses JSON files in `@holmdigital/standards/data` as the source of truth for regulations (WCAG, EN301549, legal frameworks).
