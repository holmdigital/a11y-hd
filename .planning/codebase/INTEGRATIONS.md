# External Integrations

**Analysis Date:** 2026-06-01

## npm Registry — Publishing Flow

**Registry:** `https://registry.npmjs.org/` (public, `--access public`)

**Trust model:** Sigstore provenance via GitHub OIDC + npm Trusted Publishing
- `.github/workflows/release.yml` job has `permissions: id-token: write`
- No `NPM_TOKEN` secret used — auth flows via OIDC exchange against npm Trusted Publisher config
- Workflow includes an OIDC diagnostic step that fails fast if `ACTIONS_ID_TOKEN_REQUEST_URL` is missing
- All publishes use `npm publish --provenance` (provenance attestation visible on npmjs.com package page)

**Hardening in `release.yml`:**
- Deletes every `.npmrc` (project + `~/.npmrc`) before publishing to avoid stale auth/registry overrides
- Removes any `@holmdigital:registry` and `registry` npm config keys
- Idempotent publish: each package is checked via `npm view <pkg>@<version>` and skipped if already on registry
- Per-package publish uses `--no-workspaces` to scope to the package dir

**Published packages:**
- `@holmdigital/standards@2.5.7`
- `@holmdigital/components@2.7.1`
- `@holmdigital/engine@2.5.5`

## Release Flow — Changesets

**Tool:** `@changesets/cli ^2.29.8` (canonical, pure changesets — no semantic-release, no manual version bumps in master)

**Changeset files:** `.changeset/*.md` (e.g. `.changeset/pub-09-*.md`)

**Flow:**
1. Developer adds `.changeset/*.md` describing version bumps (patch/minor/major per package)
2. Push to `master` triggers `release.yml`
3. `changesets/action@v1` opens / updates a "Version Packages" PR (`npx changeset version`)
4. Merging the PR consumes changesets, bumps versions, and updates `CHANGELOG.md`
5. The next `master` push (no remaining changesets) triggers the publish step → `publish_if_needed` for each package in dep order (standards → components → engine)
6. Successful publish triggers downstream `repository_dispatch` and GitHub Release creation → ntfy notification

**Root release script:** `npm run release` → `changeset publish --provenance` (used outside CI if needed)

## GitHub Actions Workflows

All workflows live in `.github/workflows/`.

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `release.yml` | push to `master` | Build all 3 packages, run changesets, publish to npm with provenance, dispatch downstream |
| `notify-release.yml` | GitHub `release: published` | POST to `https://notify.holmdigital.se/vi` with `KARIN_NTFY_TOKEN` — fails build on non-200 |
| `release-wiki.yml` | tag matching `holmdigital-wiki@*` | Build `holmdigital-wiki` workspace, zip `dist`, create GitHub Release with artifact |
| `deploy-wiki.yml` | push to `main` branch | Build wiki, run `hd-a11y-scan` against local server, deploy to GitHub Pages |

**Note on `deploy-wiki.yml`:** triggers on `main`, while `release.yml` triggers on `master`. The engine `npx hd-a11y-scan http://localhost:3000 --ci --lang en` step is a self-dogfooding compliance gate before Pages deploy — any axe-core / html-validate violation blocks the deployment.

**Dependabot:** historically enabled (per `CLAUDE.md` notes on vitest 2→4 and Storybook esbuild PRs). No dedicated `.github/dependabot.yml` inventoried in this pass.

## Downstream Repositories

Dispatched via `repository_dispatch` after a successful engine publish (`release.yml` lines 105–124):

- **`holmdigital/holmdigital-website`** — marketing / docs site (`holmdigital.se`)
- **`holmdigital/accessibility-wiki`** — `wiki.holmdigital.se`

**Dispatch payload:** `event_type: "engine-release"`, `client_payload: { version: "<engine-version>" }`
**Auth:** `secrets.DISPATCH_TOKEN` (PAT with `repo` scope on target repos)
**Gate:** dispatch only fires if `npm view @holmdigital/engine@<v>` resolves (i.e. actually just-published, not skipped)

**Wiki vendoring:** `wiki.holmdigital.se` vendors `@holmdigital/{engine,components,standards}` from this monorepo. Each engine release bumps the wiki's pinned versions and re-runs `hd-a11y-scan` against its own build pre-deploy.

## Mirror

- **Forgejo mirror:** `forgejo.serverdigital.net` — currently **down**. Not used as a publish target; primary remote is GitHub (`github.com/holmdigital/a11y-hd`).

## Cloud Service (Optional)

**HolmDigital Cloud:** `cloud.holmdigital.se`
- Optional opt-in feature of the engine CLI
- Enabled via `npx hd-a11y-scan <url> --api-key <key>`
- Transport: `ws ^8.18.0` (WebSocket) — engine uploads scan reports for storage/sharing
- Not required for any CLI operation — fully functional offline / on-prem

## Notification Service

**ntfy:** `https://notify.holmdigital.se/vi`
- Self-hosted ntfy endpoint
- Triggered by `notify-release.yml` on every published GitHub Release
- Auth: `Bearer ${{ secrets.KARIN_NTFY_TOKEN }}`
- Message: Swedish text "Ny release: <tag>"

## CI Hosting & Deployment Targets

**CI:** GitHub Actions (no external CI provider)
**Package hosting:** npm registry only (no GitHub Packages, no Forgejo registry)
**Docs hosting:** GitHub Pages (wiki, via `deploy-wiki.yml`)
**Website hosting:** external (marketing site repo deploys itself on dispatch)

## Required Secrets (GitHub Actions)

- `GITHUB_TOKEN` — auto-provisioned, used for changesets PR + release artifacts
- `DISPATCH_TOKEN` — PAT for `repository_dispatch` into website + wiki repos
- `KARIN_NTFY_TOKEN` — bearer for self-hosted ntfy
- **No `NPM_TOKEN`** — replaced by OIDC Trusted Publishing

## Webhooks & Callbacks

**Incoming:** none — repo is consumer-only
**Outgoing:**
- `POST api.github.com/repos/{owner}/{repo}/dispatches` to website + wiki repos on engine publish
- `POST notify.holmdigital.se/vi` on GitHub Release publish

---

*Integration audit: 2026-06-01*
