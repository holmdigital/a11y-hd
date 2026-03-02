# Architecture Patterns

**Domain:** TypeScript monorepo stability pass — type safety, version management, locale/template handling
**Researched:** 2026-03-02
**Confidence:** HIGH (based on direct codebase inspection)

---

## Recommended Architecture

### The Three-Change Problem

This milestone resolves three independent architectural failures that share a single root cause: **the dependency layer boundaries are not enforced by the type system**. Engine adds runtime properties to types owned by standards (bypassing the type contract), hardcodes its own version instead of reading it from a canonical source, and the component layer carries template data that belongs in the engine layer.

The fix for each problem follows the same principle: **move ownership to the correct layer and express it through the type system**.

---

## Component Boundaries

### Current Ownership (Broken)

| Concern | Should Own | Currently Owns | Problem |
|---------|-----------|----------------|---------|
| `FailingNode` shape | `@holmdigital/standards` | Nowhere (inlined as `any`) | `enrichResults()` casts output `as any` to smuggle extra fields past `RegulatoryReport` |
| `legalContext` on reports | `@holmdigital/standards` | `ConvergenceRule` only (not `RegulatoryReport`) | `html-template.ts`, `junit-generator.ts`, `regulatory-scanner.ts` all cast `(report as any).legalContext` |
| Engine version string | `package.json` (single source) | 3 separate hardcoded strings | `cloud-client.ts` has `'1.4.4'`, CLI had `'0.1.0'` before recent fix, scanner has `'2.1.1'` fallback |
| Statement templates (9 locales) | `@holmdigital/engine` (JSON files in `src/reporting/templates/`) | Duplicate: also inline in `AccessibilityStatement.tsx` as `TEMPLATES` constant | Component carries `sv`, `en`, `no` templates inline; 6 other locales (da, de, es, fi, fr, nl) exist only in engine JSON |
| Template processing logic | Shared (currently nowhere) | Duplicated: `renderTemplate()` in component, `processText()` in generator | Different variable-substitution order, different conditional-variable support |

### Correct Ownership (Target)

| Concern | Owner | Mechanism |
|---------|-------|-----------|
| `FailingNode` interface | `@holmdigital/standards` → `types.ts` | Explicit interface definition, exported alongside `RegulatoryReport` |
| `EnrichedReport` type (extends `RegulatoryReport`) | `@holmdigital/standards` → `types.ts` | `interface EnrichedReport extends RegulatoryReport` with `failingNodes` and `legalContext` made non-optional |
| `HolmDigitalInsight` language keys | `@holmdigital/standards` → `types.ts` | Remove `[key: string]: any`, add explicit optional keys (`norwegianInterpretation?`, `danishInterpretation?`, etc.) |
| Engine version string | `@holmdigital/engine` → `package.json` | Single runtime read via `getEngineVersion()` in `regulatory-scanner.ts` (already exists) — all other callers import this function |
| Statement templates | `@holmdigital/engine` → JSON files | Remove `TEMPLATES` constant from `AccessibilityStatement.tsx`; component receives template data as a prop |
| Template processing logic | `@holmdigital/engine` (deferred) | Out of scope for this milestone — dedup is a separate concern |

---

## Data Flow

### Type Cascade Flow (Standards → Components → Engine)

```
@holmdigital/standards/src/types.ts
  └─ defines: ConvergenceRule, RegulatoryReport, FailingNode, EnrichedReport, LegalContext
       │
       ├─► @holmdigital/components (imports types for prop definitions)
       │     └─ AccessibilityStatementProps uses Country, LegalContext (already works)
       │
       └─► @holmdigital/engine (imports types for scan pipeline)
             ├─ enrichResults() → produces EnrichedReport[] (not RegulatoryReport[])
             ├─ generateResultPackage() → ScanResult.reports typed as EnrichedReport[]
             ├─ html-template.ts → accesses report.legalContext directly (no cast needed)
             ├─ junit-generator.ts → accesses report.failingNodes directly (no cast needed)
             └─ cloud-client.ts → accesses report.failingNodes directly (no cast needed)
```

**Key change:** `ScanResult.reports` must be typed as `EnrichedReport[]` not `RegulatoryReport[]`. All downstream reporting code then gets type-safe access to `failingNodes` and `legalContext` without casts.

**Backwards compatibility:** `EnrichedReport extends RegulatoryReport`, so any consumer that reads only `RegulatoryReport` fields continues to work unchanged. The extension is additive.

### Version Flow (Engine → All Callers)

```
packages/engine/package.json
  └─ "version": "2.1.5"  ← single source of truth
       │
       └─► packages/engine/src/core/regulatory-scanner.ts
             └─ getEngineVersion() reads package.json at runtime via fs.readFileSync
                  │
                  ├─► CLI: program.version(getEngineVersion())   ← already fixed
                  ├─► ScanMetadata.engineVersion                 ← already correct
                  └─► CloudPayload.engine_version via getEngineVersion() ← already fixed
```

**Status:** `getEngineVersion()` already exists and already reads `package.json`. The CLI already imports and calls it (`program.version(getEngineVersion())`). The cloud client already imports and calls it (`engine_version: getEngineVersion()`). The only remaining problem is the hardcoded `'2.1.1'` fallback string inside `getEngineVersion()` — it should be updated to `'unknown'` to avoid ever reporting a stale version as the fallback.

The `getStandardsVersion()` function in the scanner uses a similar pattern (`require.resolve('@holmdigital/standards/package.json')`). This is correct — no change needed.

### Locale/Template Flow (Engine → Component → Engine)

**Current broken flow:**
```
AccessibilityStatement.tsx
  └─ TEMPLATES constant (sv, en, no inline) ← wrong owner, only 3 locales
       └─ lang guard: locale === 'sv' ? 'sv' : 'en'  ← ignores no, da, de, fi, fr, nl, es

statement-generator.ts
  └─ loads JSON template from disk (9 locales: da, de, en, es, fi, fr, nl, no, sv)
       └─ passes locale prop to AccessibilityStatement
            └─ component ignores locale for 7 of 9 languages
```

**Correct flow:**
```
statement-generator.ts (engine)
  └─ loads JSON template from disk (9 locales)
       └─ passes template data as prop to AccessibilityStatement:
            locale: string              ← existing prop
            templateData?: TemplateData ← new optional prop
       └─ component: if templateData provided, use it; else fall back to built-in sv/en/no

AccessibilityStatement.tsx (component)
  └─ expands lang guard to cover all 9 supported locales
       supportedLocales = { sv: 'sv', en: 'en', no: 'no', nb: 'no', da: 'da',
                            de: 'de', fi: 'fi', fr: 'fr', nl: 'nl', es: 'es' }
  └─ if templateData prop provided, use it directly (skip internal TEMPLATES lookup)
  └─ if templateData not provided, use TEMPLATES[lang] || TEMPLATES.en (current behavior)
```

**Alternative (simpler):** Do not add `templateData` prop yet. Simply expand the `supportedLocales` guard in the component to route `da`, `de`, `fi`, `fr`, `nl`, `es` to `'en'` (explicit fallback) while fixing `no` to actually use the existing `no` template. This is a two-line fix for the immediate bug. The full template-data-as-prop pattern is cleaner but belongs to the dedup refactor (marked out of scope).

**Recommendation:** Use the simpler fix for this milestone. Expand `supportedLocales` to include all 9 locales, mapping unsupported ones explicitly to `'en'` rather than silently falling through. This makes the fallback visible and deliberate, and fixes the Norwegian bug without adding new prop surface area.

---

## Patterns to Follow

### Pattern 1: Extend, Don't Replace

**What:** Add new fields to existing interfaces using extension rather than modifying the base interface.

**When:** When the base type is used by external consumers who must not be broken.

**Approach:**
```typescript
// In packages/standards/src/types.ts

export interface FailingNode {
    html: string;
    target: string;
    failureSummary: string;
}

// EnrichedReport extends RegulatoryReport — additive, not breaking
export interface EnrichedReport extends RegulatoryReport {
    failingNodes?: FailingNode[];
    // legalContext already exists on ConvergenceRule — copy it here too
    legalContext?: LegalContext;
}
```

**Why this is safe:** Any code that currently reads a `RegulatoryReport` can accept an `EnrichedReport` in its place (structural typing, LSP). The only change required in downstream code is updating type annotations from `RegulatoryReport` to `EnrichedReport` where the extra fields are accessed.

**Build impact:** Standards builds first. Once `EnrichedReport` is defined and exported, components and engine can import it. No circular dependency is introduced.

### Pattern 2: Single Source of Truth for Version

**What:** One place reads the version; all callers import that one function.

**When:** Any string that must stay in sync with `package.json`.

**Approach:**
```typescript
// packages/engine/src/core/regulatory-scanner.ts (already exists)
export function getEngineVersion(): string {
    try {
        const dir = typeof __dirname !== 'undefined'
            ? __dirname
            : dirname(fileURLToPath(import.meta.url));
        const pkgPath = resolve(dir, '..', 'package.json');
        return JSON.parse(readFileSync(pkgPath, 'utf-8')).version;
    } catch {
        return 'unknown'; // Not a version string — signals "failed to read"
    }
}
```

**Callers import this function** — they do not hardcode strings. The function is already exported from `regulatory-scanner.ts` and already imported by `cloud-client.ts` and `cli/index.ts`.

### Pattern 3: Explicit Locale Routing

**What:** Make fallback language choices explicit in code rather than implicit through missing cases.

**When:** A locale guard that silently falls through to a default.

**Approach:**
```typescript
// Before (silent fallback, Norwegian bug):
const lang = (locale === 'sv' ? 'sv' : 'en');

// After (explicit routing, all 9 locales covered):
const LOCALE_TO_TEMPLATE: Record<string, keyof typeof TEMPLATES> = {
    sv: 'sv',
    no: 'no',
    nb: 'no',      // Norwegian Bokmål → Norwegian template
    da: 'en',      // Danish → English (no da template in component)
    de: 'en',      // German → English (no de template in component)
    fi: 'en',      // Finnish → English (no fi template in component)
    fr: 'en',      // French → English (no fr template in component)
    nl: 'en',      // Dutch → English (no nl template in component)
    es: 'en',      // Spanish → English (no es template in component)
};
const lang = LOCALE_TO_TEMPLATE[locale] ?? 'en';
```

**Why this matters:** The explicit map documents intent. When a template for `da` is eventually added to the component (or injected as a prop), the routing is already in place — just update the map entry. The current implicit fallback hides the gap.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Type Widening with `as any`

**What:** Casting a typed object to `any` to attach extra properties at runtime.

**Why bad:** The cast silences the compiler but doesn't fix the contract mismatch. When the shape of the extra properties changes, all cast sites break at runtime with no compile-time warning.

**Instead:** Define the extended type in the owning package and update the return type of the function that produces it. One type change cascades to all call sites as compile errors rather than runtime surprises.

**Current instances to fix:**
- `enrichResults()` return type: `Promise<RegulatoryReport[]>` → `Promise<EnrichedReport[]>`
- `ScanResult.reports`: `RegulatoryReport[]` → `EnrichedReport[]`
- All `(report as any).failingNodes` → `report.failingNodes` (typed)
- All `(report as any).legalContext` → `report.legalContext` (typed)
- `result.reports.map((report: any) => ...)` in `cloud-client.ts` → properly typed

### Anti-Pattern 2: Index Signature as Escape Hatch

**What:** `[key: string]: any` on an interface to allow arbitrary keys.

**Why bad:** Disables type checking for the entire property namespace. Any typo in a property access compiles cleanly.

**Instead:** Add explicit optional keys for each known variant.

```typescript
// Before:
export interface HolmDigitalInsight {
    diggRisk: DiggRisk;
    eaaImpact: EAAImpact;
    swedishInterpretation?: string;
    [key: string]: any;  // Remove this
}

// After:
export interface HolmDigitalInsight {
    diggRisk: DiggRisk;
    eaaImpact: EAAImpact;
    swedishInterpretation?: string;
    norwegianInterpretation?: string;
    danishInterpretation?: string;
    finnishInterpretation?: string;
    reasoning?: string;  // Added by enrichResults() via holmdigitalInsight.reasoning
    commonMistakes?: string[];
    diggPrecedent?: string;
    priorityRationale?: string;
}
```

**Note on `reasoning`:** `enrichResults()` currently writes `holmdigitalInsight.reasoning = violation.help`. This field is not defined in the interface, so it currently relies on the index signature to compile. Adding it explicitly completes the removal of the index signature without changing runtime behavior.

### Anti-Pattern 3: Hardcoded Version Strings

**What:** Version strings like `'1.4.4'` or `'0.1.0'` embedded in source files.

**Why bad:** They drift immediately. The package version is bumped in `package.json`; none of the hardcoded strings are updated automatically.

**Instead:** Always read from `package.json` at runtime via the already-established `getEngineVersion()` pattern. The fallback in that function should be `'unknown'` — not a version number — so that a build failure is detectable.

### Anti-Pattern 4: Template Data Embedded in a React Component

**What:** `const TEMPLATES = { sv: {...}, en: {...}, no: {...} }` inside `AccessibilityStatement.tsx`.

**Why bad:** The component is consumed both client-side (React applications) and server-side (engine via `renderToStaticMarkup()`). Embedding template data in the component means:
1. The templates cannot be updated without rebuilding the component package.
2. The component and the engine carry separate copies of the same (or similar) template content that can diverge.
3. The component bundle grows with content that server-side callers already have from JSON files.

**For this milestone:** Fix the locale routing bug with the explicit map (Pattern 3 above). Do not remove the `TEMPLATES` constant yet — that is the dedup refactor flagged as out of scope.

---

## Suggested Change Order (Build Dependencies)

Changes must be applied in dependency order because packages build in sequence: standards → components → engine.

### Phase 1: Standards Layer (`@holmdigital/standards`)

**Why first:** All downstream types cascade from here. Until `FailingNode` and `EnrichedReport` are defined and exported, engine cannot import them to fix its casts.

Changes:
1. Add `FailingNode` interface to `types.ts`
2. Add `EnrichedReport extends RegulatoryReport` to `types.ts` (includes `failingNodes?: FailingNode[]` and `legalContext?: LegalContext`)
3. Remove `[key: string]: any` from `HolmDigitalInsight`; add explicit optional keys including `reasoning?: string`
4. Export all new types from `src/index.ts`
5. Build standards, verify no existing tests break

**No consumer impact:** `RegulatoryReport` itself is unchanged. The new `EnrichedReport` type is additive. The `HolmDigitalInsight` cleanup removes the escape hatch but adds back every key that was being used via it.

### Phase 2: Components Layer (`@holmdigital/components`)

**Why second:** Components imports `@holmdigital/standards` types. The locale routing fix is self-contained in the component but benefits from having standards built first (to confirm type compatibility).

Changes:
1. Fix `AccessibilityStatement.tsx` locale routing: replace `(locale === 'sv' ? 'sv' : 'en')` with explicit `LOCALE_TO_TEMPLATE` map covering all 9 locales
2. Fix `(t: any)` cast on `statementTools.find((t: any) => ...)` — `getStatementToolsByCountry()` returns `StatementTool[]`, use that type
3. Fix `const template = TEMPLATES[lang] || TEMPLATES.en` to use a typed key access
4. Build components, verify `AccessibilityStatement` tests pass for all locale inputs

**Backwards compatible:** `locale` prop is already `string` — no prop type change needed. Existing callers passing `locale="sv"` or `locale="en"` get identical behavior. Callers passing `locale="no"` now get the Norwegian template instead of English (bug fix, intentional behavioral change).

### Phase 3: Engine Layer (`@holmdigital/engine`)

**Why last:** Engine imports from both standards and components. All type changes must be in place before engine code can safely remove its casts.

Sub-order within engine (internal build order is a single tsup run, but logical ordering matters for sequential edits):

1. **Version cleanup** (no dependencies on other changes)
   - Update `getEngineVersion()` fallback from `'2.1.1'` to `'unknown'`
   - Confirm `cloud-client.ts` and `cli/index.ts` already call `getEngineVersion()` (they do — no changes needed there beyond the fallback string)

2. **Type fixes in scanner** (depends on Phase 1)
   - Import `EnrichedReport`, `FailingNode` from `@holmdigital/standards`
   - Change `enrichResults()` signature: `Promise<RegulatoryReport[]>` → `Promise<EnrichedReport[]>`
   - Change `generateResultPackage()` parameter type accordingly
   - Change `ScanResult.reports`: `RegulatoryReport[]` → `EnrichedReport[]`
   - Remove `as any` from the `reports.push({...} as any)` in `enrichResults()`
   - Remove `(r: any)` casts in `generateResultPackage()` for `legalContext` access

3. **Type fixes in reporting** (depends on `ScanResult.reports` type change)
   - `html-template.ts`: Remove `(report as any).legalContext` — `report.legalContext` now typed
   - `junit-generator.ts`: Remove `(report as any).failingNodes` and `(node: any)` — both now typed
   - `cloud-client.ts`: Remove `result.reports.map((report: any) => ...)` — `EnrichedReport` is typed
   - `github-actions.ts`: Remove `(node: any)` — replace with `FailingNode` or inline type

4. **Type fixes in i18n** (independent)
   - `i18n/index.ts`: Fix `any` casts in translation lookup — use typed locale record

5. **Build engine**, verify all existing tests pass

---

## Scalability Considerations

| Concern | Current State | After This Milestone | Long-term Path |
|---------|--------------|---------------------|----------------|
| Adding new locale templates | Must update 2 places (component + engine JSON) | Still 2 places (bug fixed, but dedup deferred) | Single source after dedup refactor |
| Adding new runtime fields to reports | Requires `as any` cast | Add field to `EnrichedReport` | No change needed — type system handles it |
| Version management | 3 hardcoded strings | 1 canonical function, 0 hardcoded strings | No change needed |
| New language keys on `HolmDigitalInsight` | Uses index signature escape hatch | Requires explicit property declaration | Same — but now intentional |

---

## Build Order Implications

The monorepo build script in root `package.json` runs: `standards → components → engine`. This order is already correct and must be preserved. TypeScript project references or `npm workspaces` constraints enforce it.

**Critical implication for testing:** After Phase 1 changes to `standards`, the standards test suite must pass before proceeding to Phase 2. After Phase 2, the components test suite must pass before Phase 3. Engine tests run last and are the integration proof that all layers work together.

**Incremental build safety:** Because `EnrichedReport extends RegulatoryReport`, any code that accepted `RegulatoryReport` continues to compile when given `EnrichedReport` (structural compatibility). The only sites that require active changes are those currently using `as any` to access `failingNodes` or `legalContext` — the compiler will flag them as type errors after `ScanResult.reports` is typed as `EnrichedReport[]`, making the changes self-guided.

---

## Sources

- Direct inspection of `packages/standards/src/types.ts` (types layer)
- Direct inspection of `packages/engine/src/core/regulatory-scanner.ts` (enrichResults, getEngineVersion patterns)
- Direct inspection of `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (locale bug, template ownership)
- Direct inspection of `packages/engine/src/reporting/statement-generator.ts` (template loading, processText)
- Direct inspection of `packages/engine/src/reporting/junit-generator.ts`, `html-template.ts`, `cloud-client.ts` (as any cast sites)
- `.planning/codebase/CONCERNS.md` (bug catalog, debt analysis)
- `.planning/codebase/ARCHITECTURE.md` (data flow, layer descriptions)
- `.planning/PROJECT.md` (requirements, constraints, decisions pending)
- TypeScript Handbook: interface extension and structural compatibility (HIGH confidence, stable language feature)
