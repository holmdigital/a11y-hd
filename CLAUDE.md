# CLAUDE.md - HolmDigital Accessibility Ecosystem

A professional accessibility ecosystem bridging technical code validation (WCAG 2.x) and legal compliance (EN 301 549, DOS Act, Section 508, and more).

## Project Overview

This monorepo contains tools for:
- **Regulatory-compliant accessibility scanning** with automatic mapping to EU/US/national laws
- **Prescriptive React components** that are accessible by default
- **Machine-readable regulatory database** mapping WCAG to legal requirements

### Key Features
- Maps WCAG failures to EN 301 549, DOS-lagen, Section 508, ADA, AODA, BITV, RGAA
- Risk assessment aligned with regulatory enforcement (DIGG, Logius)
- Multi-language support (EN, SV, DE, FR, ES, NL)
- CI/CD integration with exit code 1 on critical violations

## Directory Structure

```
a11y-hd-project/
├── packages/
│   ├── engine/          # @holmdigital/engine - Scanning engine + CLI
│   ├── components/      # @holmdigital/components - React components
│   └── standards/       # @holmdigital/standards - Regulatory database
├── .github/workflows/   # CI/CD workflows
├── .skills/             # AI skill documentation (gitignored)
└── CLAUDE.md            # This file (gitignored)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.7+ |
| Build | tsup |
| Test | Vitest |
| Scanning | axe-core, html-validate, Puppeteer |
| Components | React 18+ |
| Package Manager | npm workspaces |

## Common Commands

### Build
```bash
npm run build                              # Build all packages
npm run build -w @holmdigital/engine       # Build engine only
npm run build -w @holmdigital/components   # Build components only
npm run build -w @holmdigital/standards    # Build standards only
```

### Test
```bash
npm run test -w @holmdigital/engine        # Run engine tests
```

### CLI Usage
```bash
npx hd-a11y-scan <url> [options]
# Options: --lang, --ci, --json, --pdf, --viewport, --api-key
```

### Publishing
```bash
npm publish -w @holmdigital/engine --access public
npm publish -w @holmdigital/standards --access public
npm publish -w @holmdigital/components --access public
```

## Code Conventions

### TypeScript
- Strict mode enabled
- Use `interface` for public APIs, `type` for unions/intersections
- Export types alongside implementations

### Package Structure
- Each package has: `src/`, `dist/`, `package.json`, `README.md`
- Entry points: `src/index.ts`
- Build output: `dist/` (CJS, ESM, DTS)

### Exports Configuration
- Always put `types` FIRST in exports conditions
- Then `import`, then `require`

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.js"
  }
}
```

### Versioning
- Use semantic versioning
- Bump patch for fixes, minor for features, major for breaking changes

## Current Package Versions

| Package | Version | Notes |
|---------|---------|-------|
| @holmdigital/engine | **2.6.1** | Phase 34 plain-language report (`--plain`/`--audience` + `renderPlainReport` + plain PDF) shipped in 2.6.0; 2.6.1 = dependency range bump to components `^3.0.0` (no code change) — published 2026-06-13 |
| @holmdigital/standards | **2.7.0** | Phase 34 `PlainLanguageCopy`/`BusinessImpactLevel` + 10 sv/en plainLanguage rule texts — published 2026-06-13 |
| @holmdigital/components | **3.0.0** | DataTable APG grid suite through 2.7.5 (single-tab-stop, review-driven a11y fixes, sv-pinned collation); **3.0.0 = WR-04 retroactive semver correction, code-identical to 2.7.5** — published 2026-06-13 |

> All published to npm 2026-06-13 via CI OIDC Trusted Publishing on master push (`.github/workflows/release.yml`). `latest` dist-tags verified against the registry. **Local npm token in `~/.npmrc` is expired (401)** — never publish locally; push to master and CI publishes. No pending changesets.
>
> **WR-04 RESOLVED (2026-06-13) via option B — corrective major 3.0.0.** The DatePicker `value: string → Date` break shipped undeclared in published 2.7.0 as a minor (verified against npm tarballs: 2.4.0 had `InputHTMLAttributes`/string; 2.7.0 has `value?: Date`). 3.0.0 declares it honestly with **zero code change vs 2.7.5**; CHANGELOG now attributes the break to 2.7.0, adds the missing 2.7.1 entry, and notes that 2.5.0–2.6.1 were internal bumps never published (wire went 2.4.0 → 2.7.0). Phantom `required` prop removed from DatePicker docs (README + docs/reference). **`npm deprecate` DONE (2026-06-13):** 2.7.0/2.7.1/2.7.2 are deprecated on the registry pointing to 3.0.0; 2.7.5 left undeprecated (published engine 2.6.0's `^2.7.2` resolves there). Deprecate needs a **granular token with "bypass 2FA" enabled** — the package's Publishing access is "require 2FA OR granular token with bypass 2fa"; automation/publish classic tokens still hit EOTP, and OIDC only covers `publish`, not `deprecate`.
>
> **PROCESS RULE (post-WR-04):** never hand-edit `version` in package.json — every version change goes through a `.changeset/` file consumed by `changeset version`. The 2.4.0/2.7.3/2.7.4/2.7.5 hand-bumps are exactly the pattern that produced the WR-04 semver drift.

> **PUB-09 closure (Phase 33, 2026-05-12):** All 3 packages now gate `prepublishOnly` on the extended chain `build && lint && typecheck && check:exports && check:types && test:ci`. `npm publish` fails if lint or typecheck reports errors. As of commit `d415d90`, all 3 packages are lint-clean at **zero warnings** — keep it that way; any new `as any`, unused `catch (e)`, or `(x as any).y` write should be replaced at source (use `Reflect.set` for global mock writes, `as unknown as T` for partial-fixture widening in tests, `// @ts-expect-error` for intentionally-invalid inputs to negative-path tests). Changesets live in `.changeset/pub-09-*.md`.

> **ADA Title II gotcha (2026-04-18):** For `country='US'`, `getNationalLawByFramework('ADA', 'US')` returns the first match which is Title II (public scope). For private-sector / Title III lookups use `getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private')`. The engine's `statement-generator.ts` handles this via a dedicated US branch; downstream consumers doing their own law lookup need scope-aware filtering.

> **HHS Section 504 (REHAB) gotcha (2026-05-09, added in 2.5.1):** US has a fourth national law `us-hhs-section-504` covering HHS-funded private organisations (hospitals, FQHCs, research). It uses `euFramework: 'REHAB'` (a non-EU framework value) and `scope: 'private'`. Engine's US private-sector branch in `statement-generator.ts` references both ADA Title III AND Section 504 in the same statement. `complianceDeadlines.largeEntity` carries `employeeThreshold: 15` (not `populationThreshold`) — consumers MUST narrow on the discriminant before reading the threshold field. The published type is a discriminated union: `ComplianceDeadlineEntry`.

> **HHS Section 504 deadline extension (2026-05-16, standards 2.5.4):** HHS Interim Final Rule 2026-09266, published in the Federal Register on 2026-05-11 (docket HHS-OCR-2026-0004, 60-day comment window closing 2026-07-06), extended WCAG 2.1 AA compliance deadlines by one year. Large entity (15+ employees): **2027-05-11** (was 2026-05-11). Small entity (<15 employees): **2028-05-10** (was 2027-05-10). Technical standard, scope, sanctions, and `effectiveDate` (2024-07-08) unchanged. Any marketing/docs claiming "HHS Section 504 takes effect 2026-05-11" is now stale — say 2027-05-11 instead.

> **EAA microbusiness exemption (2026-05-09, added in 2.5.1):** All 7 EAA private-sector entries (SE, FI, DE, NL, IT, PT, PL) now expose `exemptions.microbusiness` with the EAA Article 4(5) exemption: services-providing organisations with <10 employees AND ≤2M EUR turnover are exempt. Both conditions must be met cumulatively. Microenterprises providing PRODUCTS are NOT exempt.

> **inForce drift guard (2026-05-09, added in 2.5.1):** A vitest test now asserts `inForce === (effectiveDate <= today)` for ALL 16 supported countries. If you add a national law with a future `effectiveDate`, set `inForce: false` and the test will flip-validate it for you when the date passes.

## AI Agent Behavior

When working on this project, the AI should:

### Auto-Update Documentation
- Update `CLAUDE.md` when discovering new patterns or conventions
- Update relevant `SKILL.md` files when learning new procedures
- Keep `README.md` files current when features change
- Document problem solutions for future reference

### Skills Management
Skills are located in `.skills/*/SKILL.md`. Create new skills when:
- A task requires multiple steps that are repeated
- Complex procedures need step-by-step documentation
- New integrations or tools are added

### Knowledge Capture
After solving a problem, consider: "Should this be documented?"
- General project info → `CLAUDE.md`
- Specific procedures → `.skills/<name>/SKILL.md`
- User-facing info → `README.md`

### Known Issues & Solutions

#### TS2590: Union type too complex (Heading.tsx)
**Problem**: Dynamic JSX tags with `keyof JSX.IntrinsicElements` cause TypeScript errors.
**Solution**: Use specific union type and `React.createElement`:
```tsx
const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
return React.createElement(Tag, { ref, className, ...props }, children);
```

#### NPM bin warning during publish
**Problem**: `npm warn publish "bin[hd-a11y-scan]" script name was invalid`
**Solution**: This is benign - the bin entry still works correctly after publish.

#### Vitest 4.x Upgrade
**Problem**: Dependabot suggested vitest 2.x to 4.x upgrade; later a critical GHSA in vitest <4.1.0 (UI-server arbitrary file read/execute, dev-only).
**Solution**: Lockfile on vitest 4.1.8 since 2026-06-13 (`npm audit fix`) — all 3 suites green (85+138+649). Safe to keep within `^4`.

#### esbuild dev-toolchain advisories (accepted, dev-only)
**Problem**: `npm audit` reports ~10 high for esbuild 0.27.7 (Deno binary-integrity + dev-server file read) propagating via storybook/tsup/vite.
**Status**: Accepted 2026-06-13 — dev-only toolchain, no Deno usage, does not affect published tarballs. 0.28.1 is outside vite/tsup declared ranges; do NOT `npm audit fix --force` (breaking jumps). Re-check when vite/tsup bump their esbuild range. Runtime-scope vulns (fast-uri, ws, ip-address, brace-expansion) were all fixed 2026-06-13 via `npm audit fix`.


## Reference Resources

When exploring new tools, frameworks, or features, always consult these curated lists for the latest and best options:

- **Node.js**: [awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs) - Curated list of delightful Node.js packages and resources
- **React**: [awesome-react](https://github.com/enaqx/awesome-react) - A collection of awesome things regarding React ecosystem

### AI Behavior: Technology Selection

When building or considering new features:
1. **Always consult** the awesome lists above for current best practices
2. **Prefer** well-maintained, actively developed packages
3. **Evaluate** based on: TypeScript support, bundle size, community adoption
4. **Document** technology choices in CLAUDE.md for future reference

> *Framg�ngarna �r o�ndliga* - The possibilities for success are endless
