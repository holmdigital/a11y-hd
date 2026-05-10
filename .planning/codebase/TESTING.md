# Testing Patterns

**Analysis Date:** 2026-05-10

## Test Framework

**Runner:** Vitest 4.0.16 (root `devDependency`, also pinned in every package).

**Config files:**
- `packages/engine/vitest.config.ts` — only checked-in vitest config (defines `__ENGINE_VERSION__` from `package.json`)
- `packages/standards/` — no config file; relies on Vitest defaults
- `packages/components/` — no config file; relies on Vitest defaults

**Globals:** Engine config sets `globals: true`, but tests still explicitly `import { describe, it, expect } from 'vitest'`. Standards/components tests do the same. Treat explicit imports as the convention.

**Environment:**
- Engine: `environment: 'node'` (CLI + scanning code; no DOM needed for unit tests).
- Components: `jsdom` available as devDependency for tests that mount React.
- Standards: Node default (pure data/JSON).

**Run commands (per package):**
```bash
npm run test    -w @holmdigital/engine        # vitest (watch mode)
npm run test:ci -w @holmdigital/engine        # vitest run (one-shot, exit code)
npm run test    -w @holmdigital/standards
npm run test    -w @holmdigital/components
```

**Run all packages from root:**
```bash
npm run test       # fans out via --workspaces --if-present
npm run test:ci    # CI variant
```

**Integration suite (engine only):**
```bash
npm run test:integration -w @holmdigital/engine
# → vitest run --config vitest.integration.config.ts
```

> Note: `vitest.integration.config.ts` is referenced by the script but is not checked into the repo at this time — the script is a forward-declared hook. Add the config when introducing the first integration test.

## Test File Organization

**Location:** Co-located with source. `*.test.ts` lives next to the file under test.

**Engine examples:**
- `packages/engine/src/i18n/index.test.ts`
- `packages/engine/src/reporting/badge-generator.test.ts`
- `packages/engine/src/reporting/junit-generator.test.ts`
- `packages/engine/src/reporting/statement-generator.test.ts`
- `packages/engine/src/core/regulatory-scanner.test.ts`
- `packages/engine/src/cli/cloud-client.test.ts`

**Standards:** Single suite at `packages/standards/src/index.test.ts` (covers exports, frameworks, enforcement bodies, national laws, schema validation).

**Components:** Smoke test at `packages/components/src/index.test.ts` (verifies barrel exports). Per-component DOM tests are not yet present.

**Glob:** Engine config sets `include: ['src/**/*.test.ts', 'src/**/*.spec.ts']`. `*.spec.ts` is allowed but not currently used.

**Excluded from production tsconfig:** `tsconfig.base.json` excludes `**/*.test.ts` and `**/*.spec.ts` so test files never reach `dist`.

## Test Structure

**Standard pattern (from `packages/standards/src/index.test.ts`):**

```ts
import { describe, it, expect } from 'vitest';
import { getNationalLaws, getNationalLawByFramework } from './index';
import type { Country } from './types';

describe('National Laws — US (ADA)', () => {
    it('should return 4 laws for US', () => {
        const usLaws = getNationalLaws('US');
        expect(usLaws).toHaveLength(4);
    });
});
```

**Conventions:**
- Suite name describes the **domain area**, often with an em-dash subtitle: `'National Laws — US (ADA)'`, `'National Laws — EAA microbusiness exemption (Article 4(5))'`.
- Test name starts with `'should …'`.
- Nested `describe` blocks group related assertions (`ENFORCEMENT_BODIES_DETAILED` nested inside `'Enforcement Bodies'`).

## Parameterised Tests (`it.each`)

**Pattern (from `packages/engine/src/reporting/statement-generator.test.ts:73`):**

```ts
const templateFiles = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));

it.each(templateFiles)(
    'should produce output with no leftover placeholders for %s',
    async (file) => {
        const lang = file.replace('.json', '');
        const output = await generateStatementContent(mockResult, lang, 'md', metadata);
        const leftover = output.match(PLACEHOLDER_REGEX);
        expect(leftover, `Found unsubstituted placeholders in ${lang}: ${leftover?.join(', ')}`).toBeNull();
    }
);
```

**Use when:** Same assertion runs across a finite enum (16 locales, 17 countries, 7 EAA private-sector members).

## Drift Guard Tests (project-specific pattern)

**Purpose:** Catch silent data drift where a field's value lags reality.

### inForce drift guard (added in standards 2.5.1)

**Location:** `packages/standards/src/index.test.ts:342-358`.

```ts
it('should have inForce match effectiveDate <= today for ALL national laws', () => {
    const today = new Date();
    const COUNTRIES: Country[] = ['SE','NO','DK','FI','NL','DE','FR','ES','IE','IT','PT','PL','GB','US','CA','AU'];
    const drift: string[] = [];
    for (const country of COUNTRIES) {
        for (const law of getNationalLaws(country)) {
            const isPastEffective = new Date(law.effectiveDate) <= today;
            if (law.inForce !== isPastEffective) {
                drift.push(`${country}/${law.id}: inForce=${law.inForce} but effectiveDate=${law.effectiveDate} (today=${today.toISOString().slice(0,10)})`);
            }
        }
    }
    expect(drift).toEqual([]);
});
```

**How it works:**
- Iterates every national law across all 16 supported countries (EU is excluded — meta entry, not a national jurisdiction).
- Computes the expected `inForce` value from `effectiveDate <= today`.
- Collects every mismatch into a string array.
- Asserts the array is empty so a failure surfaces every drifting entry at once.

**When you add a new national law with a future `effectiveDate`:** Set `inForce: false`. The test will start failing on the day after `effectiveDate` passes — that is the signal to flip `inForce: true` and ship a patch release.

**Companion guard (US-only):** `packages/standards/src/index.test.ts:334-340` runs the same check on the four US laws specifically — useful when iterating on US-only changes (Title II/III, Section 508, HHS Section 504).

### Schema validation guard

**Location:** `packages/standards/src/index.test.ts:467-485`.

Validates `data/legal/national-laws.json` against `schema/national-laws-schema.json` using `ajv` at test time. Concatenates every Ajv error so authors see all violations in one run rather than fixing one at a time.

### Placeholder exhaustiveness guard

**Location:** `packages/engine/src/reporting/statement-generator.test.ts:72-100`.

Renders every locale template (16 files) with a mock `ScanResult` and asserts no `{<placeholder>}` tokens remain — guarantees the i18n surface stays in sync with the data model.

## Mocking

**Approach:** Inline literal mocks. No `vi.mock`, no fixture loaders, no MSW.

**Example (`statement-generator.test.ts:14-58`):**
```ts
const mockResult: ScanResult = {
    url: 'https://example.se',
    timestamp: new Date().toISOString(),
    metadata: { engineVersion: '2.1.6', /* … */ },
    reports: [ /* one representative ConvergenceRule violation */ ],
    stats: { passed: 45, critical: 0, high: 1, /* … */ },
    score: 85,
    complianceStatus: 'partial',
    legalSummary: { wadViolations: 1, eaaViolations: 0, eaaDeadlineViolations: 0 },
};
```

**Why inline:** Keeps the contract under test visible in the test file. When `ScanResult` changes, every dependent mock breaks at compile time (strict mode + `isolatedModules`).

**What NOT to mock:** Pure data lookups (`getNationalLawByFramework`, `getEnforcementBody`) — the standards package IS the unit under test. Engine tests import the real `@holmdigital/standards` workspace package.

**Network mocks:** `cloud-client.test.ts` (203 lines) handles HTTP via test-local fakes — no shared mock infrastructure exists.

## Coverage

**Provider:** `v8` (configured in `packages/engine/vitest.config.ts`).

**Reporters:** `text`, `json`, `html`.

**Include / exclude:**
```ts
include: ['src/**/*.ts'],
exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/cli/**']
```

CLI code is excluded from coverage — the CLI is a thin wrapper around `core/` and is exercised manually / via integration scans.

**Run coverage:**
```bash
npx vitest run --coverage  -w @holmdigital/engine
```

**No threshold enforced.** Coverage is informational; the drift-guard tests carry the regulatory contract.

## Unit vs Integration Split

| Layer | Type | Location |
|-------|------|----------|
| Pure data lookups (standards) | Unit | `packages/standards/src/index.test.ts` |
| Reporters, generators, i18n (engine) | Unit | `packages/engine/src/{reporting,i18n}/*.test.ts` |
| Scanner orchestration (engine) | Unit with inline mocks | `packages/engine/src/core/regulatory-scanner.test.ts` |
| Cloud client HTTP layer (engine) | Unit with HTTP fakes | `packages/engine/src/cli/cloud-client.test.ts` |
| Real Puppeteer scans against fixtures | Integration (planned) | `vitest run --config vitest.integration.config.ts` |
| Component DOM behaviour | Integration (only smoke today) | `packages/components/src/index.test.ts` (extend with `@testing-library/react`) |

**E2E:** Not present. CLI is exercised via the npm script `npm run scan:local` against a developer-hosted target.

## Common Patterns

**Async assertions:**
```ts
await expect(generateStatementContent(mockResult, 'xx', 'md', metadata))
    .rejects.toThrow(/template not found for locale "xx"/i);
```
Use `.rejects.toThrow(/regex/i)` so the test stays robust against minor wording changes.

**Discriminated-union narrowing in assertions** (see CONVENTIONS.md):
```ts
expect(large && 'employeeThreshold' in large ? large.employeeThreshold : undefined).toBe(15);
```

**Aggregating drift errors:** Push to a string array and assert `.toEqual([])` so every offending entry surfaces in one run.

**Loop over a typed enum** rather than hard-coding length checks:
```ts
const ALL_COUNTRIES: Country[] = ['SE','NO',/* … */,'EU'];
for (const country of ALL_COUNTRIES) { /* assert per country */ }
```

---

*Testing analysis: 2026-05-10*
