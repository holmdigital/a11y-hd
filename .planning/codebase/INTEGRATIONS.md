# External Integrations

**Analysis Date:** 2026-05-10

## APIs & External Services

**Accessibility scanning libraries (treated as integrations because they are the engine's domain backbone):**
- **axe-core** ^4.11.1 — Deque's WCAG rules engine, evaluated inside the headless page
  - SDK/Client: `axe-core` (npm)
  - Imported in: `packages/engine/src/core/regulatory-scanner.ts`
  - Auth: none
- **html-validate** 10.4.0 (pinned) — Static HTML conformance checks
  - SDK/Client: `html-validate` (npm)
  - Imported in: `packages/engine/src/core/html-validator.ts`
  - Auth: none
- **Puppeteer** 23.10.4 (pinned) — Headless Chromium driver for live page scanning
  - SDK/Client: `puppeteer` (npm) — bundles a matched Chromium build
  - Imported in: `packages/engine/src/core/regulatory-scanner.ts`
  - Auth: none; downloads browser at install time

**HolmDigital Cloud (optional outbound):**
- HolmDigital Cloud Ingest API — Receives scan results when `--api-key` is provided
  - SDK/Client: native `fetch` (`packages/engine/src/cli/cloud-client.ts`)
  - Endpoint: `${cloudUrl}/api/v1/ingest` (default `https://cloud.holmdigital.se`, configurable per `packages/engine/src/cli/index.ts:87`)
  - Auth: `--api-key` CLI flag / `HD_A11Y_API_KEY` env var → sent as `x-api-key` header
  - Override: `--cloud-url` CLI flag or `cloudUrl` config field

**No LLM / AI provider integrations:**
- No OpenAI, Anthropic, Google, or other generative-AI SDKs are present in any package's dependency tree

## Data Storage

**Databases:**
- None — the project is stateless. Regulatory data ships as static JSON in `packages/standards/data/`

**File Storage:**
- Local filesystem only — scan reports written to caller-provided paths (HTML, PDF, JSON, JUnit, badge SVG)
- PDF generation: `packages/engine/src/reporting/pdf-generator.ts` (uses Puppeteer's `page.pdf()`, no external service)

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None for end-users
- `@holmdigital/engine` CLI → HolmDigital Cloud uses simple API key (`x-api-key` header)
- No OAuth, no session management

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Rollbar, Datadog, etc. in dependencies)

**Logs:**
- Console output via `chalk` and `ora` for CLI feedback (`packages/engine/src/cli/index.ts`)
- GitHub Actions step output for CI (`packages/engine/src/reporting/github-actions.ts` writes `::error` annotations)

## CI/CD & Deployment

**Hosting:**
- npm registry (`https://registry.npmjs.org/`) — primary publish target for all three public packages
- GitHub Pages — for `holmdigital-wiki` (deployed via `.github/workflows/deploy-wiki.yml`)

**CI Pipeline:**
- GitHub Actions, three workflows under `.github/workflows/`:

  **`release.yml`** (push to `master`):
  - `actions/checkout@v4`
  - `actions/setup-node@v4` (Node 20, npm cache)
  - `npm ci`, then ordered builds: standards → components → engine
  - `changesets/action@v1` — Opens / updates the "Version Packages" PR
  - **npm publish via OIDC Trusted Publishing** (`id-token: write` permission) — no `NPM_TOKEN` required; explicitly deletes any `.npmrc` to avoid token leakage
  - Per-package guard: skips `npm publish` if version already exists on npm
  - `repository_dispatch` to `holmdigital/holmdigital-website` and `holmdigital/accessibility-wiki` after engine publish (uses `DISPATCH_TOKEN` secret)

  **`release-wiki.yml`** (tag push `holmdigital-wiki@*`):
  - Builds `holmdigital-wiki` workspace, zips `dist/`, creates a GitHub Release via `softprops/action-gh-release@v1`

  **`deploy-wiki.yml`** (push to `main`):
  - Builds wiki, serves locally via `http-server`, runs `npx hd-a11y-scan ... --ci --lang en` against the build (dogfooding the engine), then deploys via `actions/configure-pages@v5` + `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`

**Release tooling:**
- **Changesets** — `.changeset/config.json` configures `baseBranch: master`, `access: public`, `updateInternalDependencies: patch`, default `@changesets/cli/changelog` changelog generator
- Root script: `npm run release` → `changeset publish --provenance`
- Engine publish uses `--provenance --access public` for npm package provenance attestations

## Environment Configuration

**Required env vars (runtime):**
- None for library consumers
- CLI optional: `HD_A11Y_API_KEY` (cloud ingest)

**Required env vars (CI):**
- `GITHUB_TOKEN` — Provided by Actions automatically
- `DISPATCH_TOKEN` — PAT secret for cross-repo `repository_dispatch` calls in `release.yml`
- npm publish credentials: **not used** — replaced by OIDC Trusted Publishing (`id-token: write`)

**Secrets location:**
- GitHub Actions repository secrets only
- No `.env` files committed; no secrets in source

## Webhooks & Callbacks

**Incoming:**
- None — no server component in this monorepo

**Outgoing:**
- HolmDigital Cloud Ingest (`POST ${cloudUrl}/api/v1/ingest`) from CLI when `--api-key` set
- GitHub `repository_dispatch` events to `holmdigital/holmdigital-website` and `holmdigital/accessibility-wiki` from `release.yml` (engine release notifier)

## Internal (workspace) integrations

These are first-party packages but cross-package boundaries inside this monorepo:

- `@holmdigital/engine` → `@holmdigital/standards` (regulatory mapping; required, workspace `*`)
- `@holmdigital/engine` → `@holmdigital/components` (HTML report rendering; `^2.3.0`)
- `@holmdigital/components` → `@holmdigital/standards` (country/framework metadata for `AccessibilityStatement`; `^2.3.0`)
- Build order is enforced in root `package.json`'s `build` script and in `release.yml` (standards → components → engine)

## Notable absent integrations

- No analytics (PostHog, Segment, GA, etc.)
- No payment / billing SDKs (Stripe, Paddle, etc.)
- No email providers
- No queue / message bus
- No feature flag service
- No cloud SDKs (AWS, GCP, Azure)
- No LLM/AI provider SDKs

---

*Integration audit: 2026-05-10*
