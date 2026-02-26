# External Integrations

**Analysis Date:** 2026-02-26

## APIs & External Services

**HolmDigital Cloud API:**
- Purpose: Upload scan results to HolmDigital's cloud dashboard for monitoring/tracking
- Client: `packages/engine/src/cli/cloud-client.ts`
- Endpoint: `POST {cloudUrl}/api/v1/ingest` (default: `https://cloud.holmdigital.se/api/v1/ingest`)
- Auth: API key via `x-api-key` header
- Config: `--api-key <key>` and `--cloud-url <url>` CLI flags, or via cosmiconfig (`apiKey`, `cloudUrl`)
- Payload format: `CloudPayload` interface (snake_case fields: `compliance_score`, `total_violations`, etc.)
- Error handling: Specific messages for 401 (auth failed), 403 (access denied), network errors
- Optional: Only triggered when `--api-key` is provided

**shields.io:**
- Purpose: Generate compliance badge images
- Client: `packages/engine/src/reporting/badge-generator.ts`
- URL pattern: `https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square`
- Only generates badge for perfect score (100/100)
- No auth required (public service)

**Google Fonts:**
- Purpose: Load Inter font family for HTML/PDF reports
- Used in: `packages/engine/src/reporting/html-template.ts`
- URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`
- No auth required

## Data Storage

**Databases:**
- None. All regulatory data is stored as static JSON files in `packages/standards/data/`
- Rule data: 13 locale-specific files (`rules.en.json`, `rules.sv.json`, `rules.de.json`, `rules.fr.json`, `rules.es.json`, `rules.nl.json`, `rules.no.json`, `rules.fi.json`, `rules.da.json`, `rules.en-gb.json`, `rules.en-us.json`, `rules.en-ca.json`)
- Legal frameworks: `packages/standards/data/legal/frameworks.json`
- National laws: `packages/standards/data/legal/national-laws.json`
- Nordic authorities: `packages/standards/data/legal/nordic-authorities.json`
- Statement tools: `packages/standards/data/legal/statement-tools.json`
- ICT manual checks: `packages/standards/data/ict-manual-checks.json`
- Schema validation: `packages/standards/schema/convergence-schema.json` (JSON Schema Draft-07)

**File Storage:**
- Local filesystem only
- PDF reports written via `--pdf <path>` CLI flag
- Statement documents written via `--statement <path>` CLI flag
- JUnit XML reports written via `--junit <path>` CLI flag

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- No user authentication system
- Cloud integration uses a simple API key (`--api-key` flag)
- API key is sent as `x-api-key` HTTP header to the cloud endpoint

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Bugsnag, etc.)

**Logs:**
- `console.log` / `console.error` for CLI output
- Silent mode (`--json` flag) suppresses non-JSON output via `this.log()` wrapper in `packages/engine/src/core/regulatory-scanner.ts`
- `console.warn` for fallback language warnings

## CI/CD & Deployment

**Hosting:**
- npm registry (public packages published with provenance)
- GitHub (source code)
- Repository: `https://github.com/holmdigital/a11y-hd`

**CI Pipeline:**
- GitHub Actions
- `.github/workflows/release.yml` - Main release pipeline
  - Triggers: Push to `master` branch
  - Steps: Checkout > Node.js 20 setup > npm ci > Build (standards > components > engine) > Changesets version PR > OIDC diagnostic > Publish to npm
  - Publishing: Uses OIDC Trusted Publishing (`id-token: write` permission), publishes each package individually with `--provenance`
  - Concurrency: One workflow per ref
- `.github/workflows/release-wiki.yml` - Wiki release pipeline
  - Triggers: Tags matching `holmdigital-wiki@*`
  - Steps: Build wiki > Create zip artifact > GitHub Release

**NPM Publishing Strategy:**
- Packages are published individually (not via `changeset publish`)
- Each package checked against npm registry before publishing (skip if version already exists)
- Order: standards > components > engine
- Uses `--provenance --access public --registry https://registry.npmjs.org/ --no-workspaces`

## GitHub Actions Integration

**Annotations:**
- `packages/engine/src/reporting/github-actions.ts`
- When running in CI mode (`--ci`), generates GitHub Actions workflow commands for inline annotations
- Maps engine severity to GitHub annotation levels: `critical` -> `error`, others -> `warning`
- Format: `::warning title=[ruleId] wcagCriteria::message (Target: selector)`

**CI/CD Exit Codes:**
- `--ci` flag causes `process.exit(1)` when critical violations are found
- `--threshold <level>` controls what severity triggers failure (`critical`, `high`, `medium`, `low`)

## Browser Integration (Puppeteer)

**Chromium:**
- Auto-downloaded by Puppeteer at install time
- Launched headless with `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-blink-features=AutomationControlled`
- Custom user agent set to mimic Chrome 120 on Windows
- Optional: `--invalid-https-cert` flag adds `--ignore-certificate-errors`, `--allow-insecure-localhost`
- Navigation: 60s timeout, 3 retries with 2s delay
- Network idle: 500ms idle time, 10s timeout, concurrency 2

**axe-core In-Browser:**
- axe-core source is injected into the page via `page.evaluate(axeCore.source)`
- Runs as `window.axe.run(document, { iframes: false })`
- Results are enriched with regulatory context from `@holmdigital/standards`

## Internationalization (i18n)

**CLI Translations:**
- 9 locale files: `packages/engine/src/locales/{en,sv,de,fr,es,fi,dk,no,nl}.json`
- Fallback chain: requested language -> English
- Set via `--lang <code>` CLI flag or cosmiconfig

**Standards Database Translations:**
- 13 locale variants of rules data in `packages/standards/data/`
- Supported languages: en, sv, de, fr, es, nl, no, fi, da, en-gb, en-us, en-ca
- Aliases: `nb` -> no (Norwegian Bokmal), `dk` -> da (Danish)

**Statement Templates:**
- 9 template files: `packages/engine/src/reporting/templates/{en,sv,de,fr,es,fi,no,da,nl}.json`
- Template substitution system with placeholders like `{<webbplats>}`, `{<e-postadress>}`
- Conditional sections via `[ ... ]` syntax
- Choice blocks via `{ A / B / C }` syntax (full/partial/non-compliant)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- Cloud result upload (`POST /api/v1/ingest`) - only when `--api-key` provided

## Configuration Discovery (cosmiconfig)

**Module name:** `a11y`

**Supported config files (searched in order by cosmiconfig):**
- `.a11yrc`
- `.a11yrc.json`
- `.a11yrc.yaml`
- `.a11yrc.yml`
- `.a11yrc.js`
- `.a11yrc.cjs`
- `a11y.config.js`
- `a11y.config.cjs`
- `package.json` (under `"a11y"` key)

**Supported config options:**
- `lang` - Language code (en, sv, de, fr, es, nl, no, fi, da, etc.)
- `ci` - Enable CI mode
- `generateTests` - Generate pseudo-automation test scripts
- `json` - JSON output mode
- `junit` - JUnit XML output path
- `pdf` - PDF report output path
- `statement` - Accessibility statement output path
- `format` - Statement format (html, md)
- `viewport` - Viewport config (string preset or `{width, height}` object)
- `threshold` - Severity threshold (critical, high, medium, low)
- `apiKey` - HolmDigital Cloud API key
- `cloudUrl` - Cloud API URL (default: `https://cloud.holmdigital.se`)
- `invalidHttpsCert` - Allow invalid HTTPS certificates
- `email`, `phone`, `org`, `responseTime`, `country`, `publishDate` - Statement metadata

**Merge priority:** CLI flags > Config file > Defaults

## Environment Variables

**Required env vars:**
- None strictly required for basic operation

**CI-specific secrets (GitHub Actions):**
- `GITHUB_TOKEN` - Used by Changesets action and npm OIDC publishing
- NPM auth handled via OIDC Trusted Publishing (no `NPM_TOKEN` needed)

**Optional runtime:**
- Cloud API key passed via `--api-key` CLI flag (not env var)

---

*Integration audit: 2026-02-26*
