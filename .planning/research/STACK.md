# Technology Stack — Stability Pass Research

**Project:** @holmdigital/a11y-hd (three-package accessibility scanning monorepo)
**Researched:** 2026-03-02
**Scope:** Three specific problems — `as any` elimination, monorepo version source of truth, multi-locale template handling in React
**Confidence:** HIGH — all recommendations grounded in direct codebase inspection; no training-data guesses

---

## 1. Eliminating `as any` Casts — Pattern and Technique

### The Root Cause

The `as any` problem in this codebase has one structural root: `RegulatoryReport` (defined in `packages/standards/src/types.ts`) is missing two properties that `enrichResults()` attaches at runtime — `failingNodes` and `legalContext`. Because the type doesn't describe what the runtime object actually is, every downstream consumer must cast to escape the compiler.

The full blast radius, from direct inspection:

| File | Cast(s) | Root Cause |
|------|---------|-----------|
| `regulatory-scanner.ts:272` | `} as any` on pushed report | `RegulatoryReport` lacks `failingNodes`/`legalContext` |
| `regulatory-scanner.ts:365-374` | `(r: any)` on legalSummary filters | Same — runtime props not in type |
| `html-template.ts:262-263,269` | `(report as any).legalContext` | Same |
| `junit-generator.ts:49-51,69` | `(report as any).failingNodes`, `escapeXML(unsafe: any)` | Same + utility accepts any |
| `cloud-client.ts:41` | `result.reports.map((report: any) => {...})` | Accessing `failingNodes` on base type |
| `cli/index.ts:93,102,216,263-267,289,301` | Multiple casts on `options` and `result.reports` | Local options object and report iteration |
| `statement-generator.ts:37,97,102` | `let template: any`, `let country: any`, `s: any` | Template and country variable lack types |
| `i18n/index.ts:16,47,55` | `Record<string, any>`, `let value: any` | Dynamic key traversal |
| `AccessibilityStatement.tsx:109,299,388` | `Record<string, any>` TEMPLATES, `section: any`, `IconNode = null` | TEMPLATES not typed, sections untyped |
| `standards/src/types.ts:57` | `[key: string]: any` on `HolmDigitalInsight` | Catch-all index signature |

### Recommended Approach: Extend RegulatoryReport into EnrichedReport

**Confidence: HIGH** — This is the standard TypeScript pattern for runtime property addition and is directly implied by the codebase structure. Interface extension is backwards-compatible: existing consumers holding `RegulatoryReport` references are unaffected because `EnrichedReport extends RegulatoryReport`.

**Step 1 — Define the missing interfaces in `packages/standards/src/types.ts`:**

```typescript
// Add to packages/standards/src/types.ts

/**
 * A single failing DOM node from an axe-core violation
 */
export interface FailingNode {
    html: string;
    target: string;
    failureSummary: string;
}

/**
 * RegulatoryReport enriched with runtime scan data.
 * This is the type that flows through all reporting modules.
 * RegulatoryReport remains the public API for consumers of @holmdigital/standards.
 */
export interface EnrichedReport extends RegulatoryReport {
    failingNodes?: FailingNode[];
    legalContext?: LegalContext;
}
```

**Step 2 — Change the HolmDigitalInsight index signature to explicit optional keys:**

```typescript
// BEFORE (unsafe):
export interface HolmDigitalInsight {
    diggRisk: DiggRisk;
    eaaImpact: EAAImpact;
    swedishInterpretation?: string;
    [key: string]: any;   // <-- eliminates all type safety for this interface
    commonMistakes?: string[];
    diggPrecedent?: string;
    priorityRationale?: string;
}

// AFTER (explicit — add all observed language keys from the JSON locale files):
export interface HolmDigitalInsight {
    diggRisk: DiggRisk;
    eaaImpact: EAAImpact;
    reasoning?: string;         // axe-core violation.help, added at enrichment time
    swedishInterpretation?: string;
    norwegianInterpretation?: string;
    danishInterpretation?: string;
    finnishInterpretation?: string;
    germanInterpretation?: string;
    dutchInterpretation?: string;
    frenchInterpretation?: string;
    spanishInterpretation?: string;
    commonMistakes?: string[];
    diggPrecedent?: string;
    priorityRationale?: string;
}
```

Note: `reasoning` is actually needed because `enrichResults()` sets `holmdigitalInsight.reasoning = violation.help` — this property is also used in `junit-generator.ts:41`. It's currently absent from the interface, which is why the cast exists.

**Step 3 — Change the `enrichResults()` return type and push expression:**

```typescript
// packages/engine/src/core/regulatory-scanner.ts

// BEFORE:
private async enrichResults(axeResults: any): Promise<RegulatoryReport[]> {
    const reports: RegulatoryReport[] = [];
    ...
    reports.push({
        ...report,
        legalContext: fullRule?.legalContext,
        failingNodes: violation.nodes.map((node: any) => ({...}))
    } as any);   // <-- the cast that is the problem

// AFTER:
import type { EnrichedReport, FailingNode } from '@holmdigital/standards';

private async enrichResults(axeResults: {
    violations: Array<{
        id: string;
        help: string;
        description: string;
        tags: string[];
        nodes: Array<{ html: string; target: string[]; failureSummary: string }>;
    }>;
}): Promise<EnrichedReport[]> {
    const reports: EnrichedReport[] = [];
    ...
    reports.push({
        ...report,
        holmdigitalInsight: {
            ...report.holmdigitalInsight,
            reasoning: violation.help
        },
        legalContext: fullRule?.legalContext,
        failingNodes: violation.nodes.map((node): FailingNode => ({
            html: node.html,
            target: node.target.join(' '),
            failureSummary: node.failureSummary
        }))
    });   // No cast needed — EnrichedReport satisfies the shape
```

Typing `axeResults` properly also eliminates the `(axeResults: any)` parameter cast. The axe-core `AxeResults` type is available from `axe-core` itself: `import type { AxeResults } from 'axe-core'`.

**Step 4 — Update ScanResult to use EnrichedReport:**

```typescript
// packages/engine/src/core/regulatory-scanner.ts
import type { EnrichedReport } from '@holmdigital/standards';

export interface ScanResult {
    ...
    reports: EnrichedReport[];   // was: RegulatoryReport[]
    ...
}
```

This is the change that cascades and eliminates all the `(report as any)` casts downstream. Once `ScanResult.reports` is typed as `EnrichedReport[]`, the `html-template.ts`, `junit-generator.ts`, `cloud-client.ts`, and `cli/index.ts` casts all become unnecessary.

**Step 5 — Remaining casts to fix case-by-case:**

| Cast | Fix |
|------|-----|
| `cli/index.ts:93` — `as ScannerOptions & {...}` | Extract a `CliOptions` interface; drop the cast |
| `cli/index.ts:216,263-267` — `(r: any)` on report iteration | Resolved by ScanResult.reports being EnrichedReport[] |
| `statement-generator.ts:37` — `let template: any` | Define `StatementTemplate` interface matching the JSON shape |
| `statement-generator.ts:102` — `let country: any` | Use `Country` type directly with a type guard |
| `statement-generator.ts:97` — `s: any` in section map | Resolved by StatementTemplate interface |
| `i18n/index.ts:47,55` — `let value: any` | `unknown` with a type guard (`typeof value === 'string'`) is more honest; or keep the `// eslint-disable` comment since this is legitimate dynamic traversal |
| `AccessibilityStatement.tsx:109` — `Record<string, any>` TEMPLATES | Type the inline TEMPLATES object (moot after locale fix, see Section 3) |
| `AccessibilityStatement.tsx:299` — `section: any` | Type the section mapping once template type is defined |
| `junit-generator.ts:69` — `escapeXML(unsafe: any)` | Change to `escapeXML(unsafe: unknown): string` |

### What NOT to Do

- **Do NOT use `// @ts-ignore` or `// @ts-expect-error` as a shortcut.** These hide problems without fixing them.
- **Do NOT change `noImplicitAny` or remove `strict: true` from `tsconfig.base.json`.** The ESLint rule `@typescript-eslint/no-explicit-any: "warn"` is already correct. Change it to `"error"` only after the casts are removed — not before.
- **Do NOT try to eliminate the `i18n/index.ts` dynamic traversal casts** in this pass. Dynamic key traversal (`let value: any = locales[currentLang]`) with a final `typeof value !== 'string'` guard is legitimate. The `// eslint-disable-next-line` comment there is correct. Don't touch it.
- **Do NOT remove `[key: string]: any` from `HolmDigitalInsight` without first auditing all JSON locale files** to find every language key that is actually present. Adding a key that doesn't exist in the JSON will cause a runtime `undefined` and TypeScript won't catch it.

### Backwards Compatibility

The public API surface of `@holmdigital/standards` is `RegulatoryReport`. Adding `EnrichedReport extends RegulatoryReport` is additive — existing consumers break only if they typed a variable as `RegulatoryReport` and then tried to access `failingNodes` (they can't today either, so no regression).

Widening `ScanResult.reports` from `RegulatoryReport[]` to `EnrichedReport[]` is backwards-compatible because `EnrichedReport` is a strict superset of `RegulatoryReport`. Consumers that only read `RegulatoryReport` properties will continue to work with no changes.

---

## 2. Version Source of Truth — Monorepo Pattern

### Current Situation

Direct inspection reveals the codebase is in a transitional state:

- `getEngineVersion()` in `regulatory-scanner.ts` already reads `package.json` via `readFileSync` at runtime (lines 18-30). This is the correct pattern and is already used in `ScanMetadata` (engineVersion) and in `cloud-client.ts` (which imports and calls `getEngineVersion()`).
- The CLI's `program.version(...)` call at line 36 also already uses `getEngineVersion()`.
- The stale hardcoded strings mentioned in CONCERNS.md (`'1.4.4'` in cloud-client, `'0.1.0'` in CLI) have already been refactored away in the current source. The CONCERNS.md was written against an older snapshot.
- The only remaining hardcoded version is the fallback in `getEngineVersion()`: `return '2.1.1'`. The actual current version is `2.1.5`.

**Confidence: HIGH** — verified by direct file inspection of the three locations named in CONCERNS.md.

### Recommended Approach: Build-Time Injection via tsup `define`

The current runtime `readFileSync` approach works but has a fragility: it reads `package.json` from a path relative to `__dirname` after bundling. If the dist directory structure changes or `package.json` is not included in the npm publish (it's not — `files: ["dist", "README.md"]`), the fallback silently kicks in.

The cleanest fix for this monorepo is **tsup `define`** — inject the version string at build time so the bundle carries it as a literal, requiring no filesystem access at runtime.

**Implementation — add a `tsup.config.ts` to `packages/engine`:**

```typescript
// packages/engine/tsup.config.ts
import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
    entry: ['src/index.ts', 'src/cli/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    define: {
        __ENGINE_VERSION__: JSON.stringify(pkg.version)
    }
});
```

**Then simplify `getEngineVersion()`:**

```typescript
// packages/engine/src/core/regulatory-scanner.ts

// tsup replaces __ENGINE_VERSION__ with the literal version string at build time.
// During vitest (not bundled), declare the global to avoid a ReferenceError.
declare const __ENGINE_VERSION__: string;

export function getEngineVersion(): string {
    // __ENGINE_VERSION__ is defined by tsup at build time.
    // In test environments (vitest/ts-node), fall back to reading package.json.
    if (typeof __ENGINE_VERSION__ !== 'undefined') {
        return __ENGINE_VERSION__;
    }
    // Fallback for test/dev contexts where tsup hasn't bundled the code
    try {
        const { readFileSync } = await import('node:fs');  // keep sync for simplicity
        // ... existing readFileSync logic ...
    } catch {
        return '0.0.0-dev';
    }
}
```

For test contexts (Vitest runs TypeScript directly without tsup bundling), add to `vitest.config.ts`:

```typescript
// packages/engine/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
    define: {
        __ENGINE_VERSION__: JSON.stringify(pkg.version)
    },
    test: { ... }
});
```

**Confidence: HIGH** — tsup `define` is a first-class documented feature (equivalent to webpack `DefinePlugin`). Vitest `define` works the same way. Both eliminate the runtime filesystem dependency entirely.

### Fallback: Keep Runtime Read, Fix the Path

If adding `tsup.config.ts` is out of scope for this pass, the simpler fix is:

1. Update the fallback string in `getEngineVersion()` from `'2.1.1'` to `'0.0.0-fallback'` — this makes stale fallbacks immediately visible.
2. Ensure `package.json` is NOT excluded from the published package (currently it's excluded by `files: ["dist", "README.md"]`). The runtime `readFileSync` approach depends on `package.json` being present next to the built files — which it won't be after `npm publish`.

The build-time inject approach is better precisely because it removes this dependency.

### What NOT to Do

- **Do NOT read version from a shared `version.ts` module** that re-exports the version string. This still requires the file to be maintained manually alongside `package.json`.
- **Do NOT use `require('../package.json')` in TypeScript source.** This approach fails in ESM bundles and requires `resolveJsonModule: true` in tsconfig, which can cause issues with type declarations for JSON imports.
- **Do NOT add `package.json` to the `files` array** just to make runtime reads work. npm packages should be lean; bundling `package.json` into the published package just to read the version at runtime is unnecessary overhead.

---

## 3. Multi-Locale Template Handling — AccessibilityStatement Component

### Current Situation (from direct inspection)

The `AccessibilityStatement` component has two parallel locale problems:

**Problem A — Template selection covers only sv/no/en:**
```typescript
// Line 205-206:
const supportedLocales: Record<string, keyof typeof TEMPLATES> = { sv: 'sv', no: 'no', nb: 'no' };
const lang = supportedLocales[locale] ?? 'en';
```
This silently falls back to English for `da`, `de`, `fi`, `fr`, `nl`, `es`. Yet all 9 JSON templates exist in `packages/engine/src/reporting/templates/*.json`.

**Problem B — TEMPLATES are hardcoded inline** (lines 110-149) in the component source, duplicating the JSON files in `packages/engine/src/reporting/templates/`. They diverge in structure and are maintained separately.

**Problem C — The component's renderTemplate() and the engine's processText() implement the same template engine twice** with subtly different order-of-operations (component: conditionals → substitution → choices; engine: conditionals → choices, then substitution as a special case of choices). This means HTML output from the React component and Markdown output from the generator can produce different text for identical inputs.

### Recommended Approach: Prop-Driven Templates with No Bundled Defaults

**Confidence: HIGH** — This is the standard React component library pattern for externalized content. The component should render templates, not own them. The engine already loads templates from JSON files.

**Step 1 — Add a `template` prop to AccessibilityStatementProps:**

```typescript
// packages/standards/src/types.ts — add shared template type

export interface StatementSection {
    id: string;
    title: string;
    content: string;
}

export interface StatementTemplate {
    title: string;
    intro: string;
    sections: StatementSection[];
}
```

```typescript
// packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx

export interface AccessibilityStatementProps {
    // ... existing props ...

    /**
     * Template data for the statement content.
     * When provided, overrides built-in templates.
     * Load from @holmdigital/engine templates or provide your own.
     */
    template?: StatementTemplate;
}
```

**Step 2 — Remove inline TEMPLATES constant; fall back to a minimal English default:**

```typescript
// The hardcoded TEMPLATES object (lines 109-149) is removed entirely.
// The component selects from:
//   1. props.template  (caller provides loaded JSON)
//   2. BUILTIN_EN_TEMPLATE  (static minimum — avoids blank render if no template passed)

const BUILTIN_EN_TEMPLATE: StatementTemplate = {
    title: "Accessibility of {<website>}",
    intro: "...",   // keep a single English fallback
    sections: [ /* minimal English sections */ ]
};

// In the component body:
const template = props.template ?? BUILTIN_EN_TEMPLATE;
```

**Step 3 — The statement-generator.ts passes the loaded JSON template as the prop:**

The engine already loads locale-specific JSON templates via filesystem. After this change, `generateStatementContent()` passes the loaded template as a prop:

```typescript
// packages/engine/src/reporting/statement-generator.ts

// After loading template from JSON:
const props: AccessibilityStatementProps = {
    ...
    template: template as StatementTemplate,   // the parsed JSON
    locale: lang,
    ...
};
```

This closes the gap: the component uses exactly the same JSON content that the Markdown path does. No more divergence.

**Step 4 — Expand locale routing in the component:**

Once TEMPLATES is removed, locale is used only for date formatting and the enforcement body lookup. The `lang` selection simplifies to a direct pass-through — the caller determines which template to supply:

```typescript
// Locale is used for date formatting only:
const d = (date: Date) => formatDiggDate(date, locale);

// Enforcement body comes from the country prop (already correct):
const enforcementBody = ENFORCEMENT_BODIES[country] || ENFORCEMENT_BODIES.EU;
```

**Step 5 — Fix the renderTemplate/processText divergence:**

Extract a shared `processTemplate()` function into `packages/standards/src/utils/template.ts` (or `packages/components/src/utils/processTemplate.ts` since the engine already depends on components). Both the component and the engine's Markdown path call the same function.

The processing order must be: **conditionals → substitution → choices**. The component currently does this correctly (conditionals first at line 264, substitution second at line 281, choices third at line 286). The engine's `processText()` applies choices before substitution for non-bracket content (line 281-294 in statement-generator.ts), which is the divergence.

```typescript
// packages/components/src/utils/processTemplate.ts (or standards/src/utils/)

export interface TemplateContext {
    replacements: Record<string, string>;
    complianceLevel: 'full' | 'partial' | 'non-compliant';
    responseTime?: string;
    phoneNumber?: string;
}

export function processTemplate(text: string, ctx: TemplateContext): string {
    let result = text;

    // 1. Conditionals [ ... ] — remove blocks whose data is absent
    result = result.replace(/\[([\s\S]*?)\]/g, (_match, content) => {
        if ((content.includes('{<svarstid>}') || content.includes('{<svartid>}') || content.includes('{<response time>}'))
            && !ctx.responseTime) return '';
        if ((content.includes('{<telefonnummer>}') || content.includes('{<telephone number>}') || content.includes('{<puhelinnumero>}'))
            && !ctx.phoneNumber) return '';
        if ((content.includes('{<brister>}') || content.includes('{<issues>}') || content.includes('{<mangler>}'))
            && ctx.complianceLevel === 'full') return '';
        return content;
    });

    // 2. Variable substitution {<key>} — apply named replacements
    for (const [key, value] of Object.entries(ctx.replacements)) {
        result = result.replaceAll(key, value);
    }

    // 3. Choices { A / B / C } — pick the right branch
    result = result.replace(/\{([^{}]*?)\}/g, (_match, content) => {
        const parts = content.split('/');
        if (parts.length >= 2) {
            const idx = ctx.complianceLevel === 'partial' ? 1
                : ctx.complianceLevel === 'non-compliant' ? Math.min(2, parts.length - 1)
                : 0;
            return parts[idx].trim();
        }
        return _match;
    });

    return result;
}
```

### Locale Expansion — All 9 Locales

Once the component accepts a `template` prop, locale support expands automatically to all 9 languages because the engine (and any consumer) can load the matching JSON and pass it in. The component itself needs no locale-specific changes.

The only locale-specific behavior remaining in the component is date formatting (`formatDiggDate`), which already has entries for all 9 locales (lines 154-168). It is already correct.

### What NOT to Do

- **Do NOT bundle all 9 JSON templates into the React component package.** The component package is a library with React peer dependency. Bundling large JSON blobs increases the component package size and causes consumers to ship unused translations. Template data should be loaded by the consumer (or by the engine on their behalf).
- **Do NOT use dynamic `import()` inside the component to load templates.** React components in a library should not assume the filesystem or network is available. Prop-driven is the right pattern.
- **Do NOT try to merge the two template processing implementations during this pass** if it requires non-trivial refactoring to both engine and component. The minimum fix is: (1) expand the `supportedLocales` guard to all 9 locales in the component, and (2) confirm the JSON templates for the remaining 6 locales work. The full dedup is explicitly called "out of scope" in PROJECT.md and should stay that way.

---

## Supporting Libraries (No Changes Needed)

| Library | Current | Status | Notes |
|---------|---------|--------|-------|
| TypeScript | 5.7.2 | Current | Strict mode already enabled. No changes. |
| tsup | 8.3.5 | Current | `define` feature available. Add `tsup.config.ts`. |
| Vitest | 4.0.16 | Current | `define` in `vitest.config.ts` needed for `__ENGINE_VERSION__`. |
| @typescript-eslint | 8.18.1 | Current | Change `no-explicit-any` from `"warn"` to `"error"` after casts removed. |
| axe-core | 4.11.1 | Current | Provides `AxeResults` type for the `enrichResults` parameter. Use it. |

## Alternatives Considered

| Decision | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| EnrichedReport vs separate union type | `EnrichedReport extends RegulatoryReport` | Discriminated union `BaseReport \| EnrichedReport` | Union requires every consumer to narrow before use — too disruptive to downstream. Extension is additive. |
| Build-time version inject | `tsup define` + `vitest define` | Runtime `readFileSync` | `package.json` not in `files` array; runtime read silently falls back. Build-time is reliable. |
| Template prop vs dynamic import | `template` prop | Dynamic `import('./templates/en.json')` in component | Dynamic imports in library components break SSR, test environments, and bundler assumptions. Prop-driven is the React idiom. |
| Shared processTemplate util | Extracted to shared location | Keep two separate implementations | Same bug fixed once. The divergence is a real bug (order of operations differs). |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| `as any` root cause and fix | HIGH | Direct inspection of all named files and cast sites |
| `EnrichedReport` extends pattern | HIGH | Standard TypeScript pattern; no library dependency |
| tsup `define` for version inject | HIGH | Documented tsup feature; verified tsup 8.x supports it |
| Vitest `define` for test context | HIGH | Documented Vitest config option, same API as tsup |
| Template prop pattern | HIGH | Standard React library idiom |
| `processTemplate` unification | HIGH | Both implementations inspected; ordering confirmed |
| All 9 locales via prop injection | HIGH | All 9 JSON files confirmed present; date locale map confirmed complete |

---

## Gaps

None for this scope. All three problems have unambiguous fixes rooted in existing code.

The "Template rendering dedup" (extracting `processTemplate` as a shared util) is listed as out of scope in PROJECT.md. The minimum fix for the stability pass is:

1. Expand `supportedLocales` in the component from `{sv, no, nb}` to all 9 locale codes.
2. Accept a `template` prop to allow callers to pass the loaded JSON.
3. The engine's `generateStatementContent()` passes the loaded JSON template as the prop.

The full dedup (extracting `processTemplate` into a shared module) is the correct long-term fix but is a separate PR.
