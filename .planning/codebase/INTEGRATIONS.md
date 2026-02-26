# External Integrations

**Analysis Date:** 2026-02-26

## APIs & External Services

**HolmDigital Cloud API:**
- Purpose: Upload scan results to the HolmDigital Cloud platform for tracking/dashboards
- Client: `packages/engine/src/cli/cloud-client.ts`
- Endpoint: `POST {cloudUrl}/api/v1/ingest` (default: `https://cloud.holmdigital.se`)
- Auth: API key via `x-api-key` header
- Auth source: `--api-key` CLI flag or `apiKey` in `.a11yrc` config
- Payload format: `CloudPayload` (custom JSON with violations, score, metadata)
- Optional integration: only triggered when `--api-key` is provided

**shields.io Badge Service:**
- Purpose: Generate compliance badge images for perfect (100%) scores
- Client: `packages/engine/src/reporting/badge-generator.ts`
- URL pattern: `https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square`
- Auth: None (public API)
- Usage: Badge URL embedded in CLI output, HTML reports, and accessibility statements

**Google Fonts CDN:**
- Purpose: Load Inter font family for HTML/PDF reports
- Client: `packages/engine/src/reporting/html-template.ts`
- URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`
- Auth: None
- Usage: Referenced in generated HTML report `<link>` tags

## Scanning Dependencies (Runtime)

**axe-core (embedded):**
- Purpose: Core accessibility rule engine injected into target web pages
- Integration: `packages/engine/src/core/regulatory-scanner.ts` - `injectAxe()` evaluates `axe-core` source in Puppeteer page context
- Version: 4.10.2 (pinned in `packages/engine/package.json`)
- Pattern: Source string injected via `page.evaluate(axeCore.source)`, then `window.axe.run()` called in-page
- No network calls; bundled library

**html-validate (embedded):**
- Purpose: Structural HTML validation for accessibility-impacting issues
- Integration: `packages/engine/src/core/html-validator.ts` - `HtmlValidate` class wraps the library
- Version: 10.4.0 (pinned)
- Config: Uses `html-validate:recommended` with selective rule disabling
- No network calls; bundled library

**Puppeteer / Chromium:**
- Purpose: Headless browser for page scanning, Virtual DOM building, and PDF generation
- Integration: `packages/engine/src/core/regulatory-scanner.ts` (scanning), `packages/engine/src/reporting/pdf-generator.ts` (PDF output)
- Version: 23.10.4 (pinned)
- Launch args: `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-blink-features=AutomationControlled`
- Optional: `--ignore-certificate-errors` when `--invalid-https-cert` flag is used
- Auto-downloads Chromium binary on npm install

## Data Storage

**Databases:**
- None. This is a CLI tool / library. No persistent database.

**File Storage:**
- Local filesystem only
- Scan results output to stdout (JSON) or written to local files (PDF, HTML, Markdown, JUnit XML)
- Output paths specified via CLI flags: `--pdf <path>`, `--statement <path>`, `--junit <path>`

**Caching:**
- None

**Regulatory Rule Database:**
- Format: Static JSON files bundled in `packages/standards/data/`
- Rule files: `rules.{lang}.json` for 12 locales (en, sv, de, fr, es, nl, no, fi, da, en-gb, en-us, en-ca)
- Legal data: `packages/standards/data/legal/` (frameworks.json, national-laws.json, nordic-authorities.json, statement-tools.json)
- ICT manual checks: `packages/standards/data/ict-manual-checks.json`
- Mapping reference: `packages/standards/data/wcag-to-en301549.json`
- Schema: `packages/standards/schema/convergence-schema.json` (JSON Schema draft-07)
- Validation: `ajv` 8.17.1 used for runtime schema validation

## Authentication & Identity

**Auth Provider:**
- None for the library/CLI itself
- Cloud integration uses API key authentication (`x-api-key` header)
- No OAuth, no session management, no user accounts

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, etc.)

**Logs:**
- Console output only (`console.log`, `console.warn`, `console.error`)
- Silent mode available via `--json` flag (suppresses non-JSON output)
- Colored output via `chalk` for terminal display
- Spinner progress via `ora` for long-running operations

## CI/CD & Deployment

**Hosting:**
- npm registry (public packages published to npmjs.com)
- GitHub repository: `https://github.com/holmdigital/a11y-hd.git`

**CI Pipeline:**
- GitHub Actions (`D:/claude/a11y-hd/.github/workflows/release.yml`)
- Triggers: push to `master` branch
- Steps: checkout, Node 20 setup, npm ci, sequential build (standards -> components -> engine), changeset versioning, npm publish with OIDC provenance
- Publish gate: only publishes when no changeset files remain (after version bump PR merged)
- Per-package publish: checks if version already exists on npm before attempting publish

**Wiki Release Pipeline:**
- GitHub Actions (`D:/claude/a11y-hd/.github/workflows/release-wiki.yml`)
- Triggers: tags matching `holmdigital-wiki@*`
- Creates GitHub Release with zipped wiki build artifact

**Release Management:**
- Changesets (`D:/claude/a11y-hd/.changeset/config.json`)
- Base branch: `master`
- Access: public
- Publishes with `--provenance` flag (npm OIDC trusted publishing)

## GitHub Actions Integration

**In-Scanner CI Support:**
- `packages/engine/src/reporting/github-actions.ts` generates GitHub Actions workflow annotations
- Maps engine severity to GitHub annotation levels: `critical` -> `error`, others -> `warning`
- Output format: `::error title=...::message` / `::warning title=...::message`
- Activated when `--ci` flag is used in the CLI

## Report Output Formats

**JUnit XML:**
- Generator: `packages/engine/src/reporting/junit-generator.ts`
- Purpose: CI/CD test result integration (Jenkins, GitHub Actions, etc.)
- Triggered via `--junit <path>` CLI flag

**PDF Reports:**
- Generator: `packages/engine/src/reporting/pdf-generator.ts`
- Uses Puppeteer to render HTML to PDF (A4 format)
- Triggered via `--pdf <path>` CLI flag

**HTML Reports:**
- Generator: `packages/engine/src/reporting/html-template.ts`
- Self-contained HTML with inline styles and Google Fonts link
- Used as intermediate for PDF generation, also standalone

**Accessibility Statements:**
- Generator: `packages/engine/src/reporting/statement-generator.ts`
- Formats: HTML (via React SSR `renderToStaticMarkup`) or Markdown
- Templates: `packages/engine/src/reporting/templates/{lang}.json` (9 languages: da, de, en, es, fi, fr, nl, no, sv)
- Uses `@holmdigital/components` `AccessibilityStatement` React component for HTML output
- Triggered via `--statement <path>` CLI flag

## Internationalization (i18n)

**Engine CLI Strings:**
- Implementation: `packages/engine/src/i18n/index.ts`
- Locale files: `packages/engine/src/locales/{lang}.json` (en, sv, de, fr, es, nl, fi, dk, no)
- Pattern: `t('key.path', { param: value })` with `{param}` interpolation
- Fallback chain: requested language -> English

**Regulatory Rules:**
- 12 fully translated rule databases in `packages/standards/data/rules.{lang}.json`
- Language aliases: `nb` -> `no`, `dk` -> `da`

## Configuration Loading

**cosmiconfig Integration:**
- Package: `cosmiconfig` 9.0.0
- Search name: `a11y`
- Supported config locations: `.a11yrc`, `.a11yrc.json`, `.a11yrc.yaml`, `package.json` `"a11y"` field, `a11y.config.js`, etc.
- Priority: CLI flags > config file > defaults
- Implementation: `packages/engine/src/cli/index.ts`

## Environment Configuration

**Required env vars:**
- None required for basic operation

**Optional env vars (CI context):**
- `GITHUB_TOKEN` - Used by changesets action and npm OIDC publishing in GitHub Actions

**CLI Configuration:**
- `--api-key <key>` - HolmDigital Cloud API key (optional, for cloud upload)
- `--cloud-url <url>` - Cloud API URL (default: `https://cloud.holmdigital.se`)
- `--lang <code>` - Language for output (default: `en`)
- `--ci` - CI mode (non-zero exit on critical failures, GitHub Actions annotations)
- Full config supported via `.a11yrc` file (see cosmiconfig integration above)

## Webhooks & Callbacks

**Incoming:**
- None (CLI tool, not a server)

**Outgoing:**
- HolmDigital Cloud ingest API (POST to `/api/v1/ingest`) - only when `--api-key` is provided
- No other outgoing webhooks

---

*Integration audit: 2026-02-26*
