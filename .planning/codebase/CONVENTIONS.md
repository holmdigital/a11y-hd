# Coding Conventions

**Analysis Date:** 2026-05-10

## TypeScript Configuration

**Base config:** `tsconfig.base.json` — extended by every package.

**Strict mode (all enabled):**
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `forceConsistentCasingInFileNames: true`
- `isolatedModules: true`

**Compiler targets:**
- `target: ES2022`
- `module: ESNext`
- `moduleResolution: bundler`
- `lib: ["ES2022", "DOM", "DOM.Iterable"]`
- `declaration: true`, `declarationMap: true`, `sourceMap: true`

**Per-package overrides:**
- `packages/engine/tsconfig.json` — sets `rootDir: ./src`, `outDir: ./dist`, excludes `**/*.test.ts`
- `packages/standards/tsconfig.json` — adds `resolveJsonModule`, `esModuleInterop` (loads `data/legal/*.json`)
- `packages/components/tsconfig.json` — adds `jsx: "react-jsx"`, excludes `**/*.stories.tsx`

**Rule:** Never lower strictness package-locally. Add `_` prefix to silence `noUnusedParameters` (the project-wide ESLint rule honours `argsIgnorePattern: "^_"`).

## Type Naming Patterns

**`interface` vs `type` (from CLAUDE.md, enforced in `packages/standards/src/types.ts`):**
- Use `interface` for **public API shapes** that consumers extend or implement (e.g. `ConvergenceRule`, `NationalLaw`, `MicrobusinessExemption`).
- Use `type` for **unions, intersections, primitives, discriminated unions** (e.g. `WCAGLevel = 'A' | 'AA' | 'AAA'`, `Country`, `ComplianceDeadlineEntry`).

**Examples in `packages/standards/src/types.ts`:**
```ts
export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA' | 'REHAB';
export type Country = 'SE' | 'NO' | 'DK' | 'FI' | 'NL' | 'DE' | 'FR' | 'ES'
                    | 'IE' | 'IT' | 'PT' | 'PL' | 'GB' | 'US' | 'CA' | 'AU' | 'EU';

export interface ConvergenceRule {
    ruleId: string;
    wcagCriteria: string;
    /* … */
}
```

**Type exports:** Co-locate types with implementations. `packages/standards/src/index.ts` re-exports everything from `./types`. Engine consumers `import type { Country } from '@holmdigital/standards'`.

## Discriminated Union Patterns

**Canonical example — `ComplianceDeadlineEntry` (`packages/standards/src/types.ts:298`):**

```ts
export type ComplianceDeadlineEntry =
    | { populationThreshold: number; deadline: string; description: string }
    | { employeeThreshold: number; deadline: string; description: string };
```

**Consumer rule:** MUST narrow on the discriminant key before reading it. The field present *is* the discriminant.

**Correct usage (from `packages/standards/src/index.test.ts:329` and `:392`):**
```ts
expect(large && 'populationThreshold' in large ? large.populationThreshold : undefined).toBe(50000);
expect(large && 'employeeThreshold' in large ? large.employeeThreshold : undefined).toBe(15);
```

**Wrong:** Reading `large.populationThreshold` directly without `'populationThreshold' in large` — the type system rejects it because the field may not exist on the other variant.

**Discriminated unions are documented inline.** See lines 272–286 of `types.ts`: every threshold key has a JSDoc explaining its comparator semantics (inclusive lower / inclusive upper bound).

## Exports Configuration

**Order (CRITICAL — `types` MUST be first):**

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.js"
  }
}
```

Rationale: TypeScript's resolver picks the first matching condition. If `import` or `require` comes before `types`, type lookups fail under `moduleResolution: "bundler"` / `"node16"`.

**Triple-format builds:** Every package ships:
- `./dist/index.js` (CJS)
- `./dist/index.mjs` (ESM)
- `./dist/index.d.ts` (DTS — emitted via `tsup --dts`)

**Sub-path exports (`packages/components/package.json:25-116`):** Each component gets its own export entry so consumers can `import { Button } from '@holmdigital/components/Button'` for tree-shaking. Sub-path entries omit `require` (ESM-only for component subpaths).

**Static asset exports (`packages/standards/package.json:23-24`):**
```json
"./data/*": "./data/*",
"./schema/*": "./schema/*"
```

## Package Structure

**Every package contains:**
```
packages/<name>/
├── src/
│   ├── index.ts          # Single public entry point
│   └── …                 # Domain modules
├── dist/                 # Build output (gitignored, published)
├── package.json
├── tsconfig.json         # Extends ../../tsconfig.base.json
└── README.md
```

**`files` whitelist** in every `package.json` — only `dist`, `README.md`, and (for standards) `data` + `schema` are published.

**`prepublishOnly: "npm run build"`** on the engine guarantees a fresh build before `npm publish`.

## File & Directory Naming

| Element | Pattern | Example |
|---------|---------|---------|
| Source files | `kebab-case.ts` | `regulatory-scanner.ts`, `statement-generator.ts` |
| React components | `PascalCase.tsx` in `PascalCase/` directory | `Button/Button.tsx`, `AccessibilityStatement/AccessibilityStatement.tsx` |
| Tests | co-located `*.test.ts` next to source | `statement-generator.test.ts` |
| Types module | `types.ts` | `packages/standards/src/types.ts` |
| Locales / data | `kebab-case.json` under `locales/` or `data/` | `data/legal/national-laws.json` |
| CLI entry | `cli/index.ts` builds to `dist/cli/index.js` | engine `bin: { hd-a11y-scan: ./dist/cli/index.js }` |

## Function & Variable Naming

- **Functions:** `camelCase` verbs — `getNationalLawByFramework`, `generateStatementContent`, `getEnforcementBody`.
- **Constants (module-scope tables):** `SCREAMING_SNAKE_CASE` — `ENFORCEMENT_BODIES`, `ENFORCEMENT_BODIES_DETAILED`, `TEMPLATES_DIR`.
- **React components:** `PascalCase` — `<Button>`, `<AccessibilityStatement>`.
- **Type / interface names:** `PascalCase` — `ConvergenceRule`, `ComplianceDeadlineEntry`.
- **Country / framework codes:** Uppercase ISO-style — `'SE'`, `'EAA'`, `'WAD'`, `'REHAB'`.
- **Underscore prefix** silences `noUnusedParameters` (ESLint rule: `argsIgnorePattern: "^_"`).

## Import Organization

Observed order in `packages/engine/src/reporting/statement-generator.test.ts`:

1. Vitest globals (`import { describe, it, expect } from 'vitest'`)
2. Node built-ins (`fs`, `path`)
3. Local relative imports (`./statement-generator`, `../core/regulatory-scanner`)
4. Workspace packages (`@holmdigital/standards`)
5. `import type { … }` last when separated

No path aliases — every import is a relative path or a workspace package name.

## Linting & Formatting

**ESLint flat config** at repo root: `eslint.config.mjs`.
- `js.configs.recommended` + `@typescript-eslint/eslint-plugin` recommended rules.
- `@typescript-eslint/no-explicit-any: "warn"` (warn, not error — `any` is tolerated in scanner code).
- `@typescript-eslint/no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }]`.
- Globals: browser + node combined (engine targets both).
- Ignored: `**/dist/**`, `**/node_modules/**`, `**/coverage/**`.

**Prettier:** Listed in root `devDependencies` (`prettier: ^3.4.2`). No checked-in `.prettierrc` — defaults apply.

**Lint commands:**
- `npm run lint` (root) → fans out to all workspaces via `--if-present`.
- Per-package: `npm run lint -w @holmdigital/engine` (runs `eslint src`).

## JSDoc Patterns

**When to use:**
- Every exported `interface` / `type` in `packages/standards/src/types.ts` carries a JSDoc block.
- Discriminant fields and threshold semantics MUST be documented inline (see `types.ts:272-286`).
- Mixed-language doc strings are accepted (Swedish `Åtgärdsinformation`, English semantics).

**Style:**
```ts
/**
 * One tier of a `NationalLaw.complianceDeadlines` map.
 * Discriminated by the threshold field present.
 */
export type ComplianceDeadlineEntry = …
```

- First line: one-sentence summary.
- Bullet body for field-level semantics, comparator conventions, citations.
- Reference statutory provisions inline (e.g. "EAA Article 4(5)", "28 CFR § 35.200(b)").

## Module Design

**Single entry point per package:** `src/index.ts` re-exports everything public. The engine and components additionally publish sub-path entries from `package.json` `exports`.

**No barrel proliferation** — only the top-level `index.ts` is a barrel. Domain folders (`reporting/`, `core/`, `i18n/`) export named symbols directly from each file.

**External dependencies on builds:** Components mark `react` and `@holmdigital/standards` as `--external` in `tsup` to keep peer deps unbundled.

## Versioning Policy

**Semver, managed by Changesets** (`@changesets/cli`, root `release` script: `changeset publish --provenance`).

| Bump | Trigger |
|------|---------|
| **patch** | Bug fixes, type-contract repairs, drift fixes (e.g. standards 2.5.0 → 2.5.1 = REHAB metadata + EAA microbusiness exemption) |
| **minor** | New features, new jurisdictions, additive API surface (e.g. components 2.3.0 → 2.4.0 for WCAG 2.1 AA pass) |
| **major** | Breaking changes to public types, removed exports, renamed APIs |

**Cross-package coordination:** Engine depends on standards via `*` (always latest workspace version). Bumping standards forces an engine patch when the type contract changes.

**Provenance signing:** `--provenance` flag is mandatory on publish — npm provenance attestations link the published tarball to the GitHub Actions run.

## Versioning Hazards (project-specific)

- **Discriminated union additions** (e.g. adding a third variant to `ComplianceDeadlineEntry`) are **breaking** — every consumer narrowing branch needs updating. Bump major.
- **Adding a new `LegalFramework` value** (`'REHAB'`, `'DDA'`) is additive but consumers using exhaustive `switch` on the union see new lint errors. Treat as minor + release note.
- **`inForce` flag flips** when an `effectiveDate` passes — the drift-guard test (see TESTING.md) catches the case where the data file lags reality.

---

*Convention analysis: 2026-05-10*
