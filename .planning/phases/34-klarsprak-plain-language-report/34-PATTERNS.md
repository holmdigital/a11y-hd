# Phase 34: Klarspråksrapport — Pattern Map

**Mapped:** 2026-06-11
**Files analyzed:** 13 new/modified files across 2 packages
**Analogs found:** 12 / 13 (1 file — changeset — has only git-history analogs, shown below)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `packages/standards/src/types.ts` | model | transform | itself (existing type additions follow same pattern) | exact |
| `packages/standards/src/index.ts` | service | CRUD | itself (existing `generateRegulatoryReport` at lines 274-289) | exact |
| `packages/standards/data/rules.sv.json` | config | transform | itself (existing rule objects, e.g. `color-contrast`) | exact |
| `packages/standards/data/rules.en.json` | config | transform | itself (existing rule objects) | exact |
| `packages/standards/src/index.test.ts` | test | batch | `packages/engine/src/reporting/junit-generator.test.ts` | role-match |
| `packages/engine/src/reporting/plain-report.ts` | utility | request-response | `packages/engine/src/reporting/junit-generator.ts` | role-match |
| `packages/engine/src/reporting/plain-report.test.ts` | test | request-response | `packages/engine/src/reporting/junit-generator.test.ts` | exact |
| `packages/engine/src/reporting/html-template.ts` | utility | request-response | itself (existing `generateReportHTML` at line 27) | exact |
| `packages/engine/src/cli/index.ts` | utility | request-response | itself (existing options block lines 75-120, print chain lines 203-241) | exact |
| `packages/engine/src/i18n/index.ts` | utility | request-response | itself (existing `t()` + `LocaleData = typeof en` at lines 1-32) | exact |
| `packages/engine/src/locales/en.json` | config | transform | itself (`cli.*` + `report.*` structure, lines 1-38) | exact |
| `packages/engine/src/locales/sv.json` + 7 others | config | transform | `packages/engine/src/locales/sv.json` (same flat-object shape) | exact |
| `.changeset/*.md` | config | — | git-history: `standards-2026-06-05-ca-aca-fr-dinum.md` (retrieved from commit 884f142) | role-match |

---

## Pattern Assignments

### `packages/standards/src/types.ts` (model, transform)

**Analog:** itself — add new type and interface following the established pattern at lines 5-8 (`type DiggRisk`) and lines 129-139 (`interface RegulatoryReport`).

**Existing union-type pattern** (lines 5-8):
```typescript
export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type WCAGVersion = '2.0' | '2.1' | '2.2';
export type DiggRisk = 'low' | 'medium' | 'high' | 'critical';
export type EAAImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
```

**New type to add** — insert after `DiggRisk` on line 7:
```typescript
export type BusinessImpactLevel = 'stoppar-kop' | 'hindrar' | 'forsamrar' | 'putsning';
```

**Existing optional-field-on-interface pattern** (lines 35-36, `ConvergenceRule`):
```typescript
    // EU Legal Framework context (optional for backward compatibility)
    legalContext?: LegalContext;
```

**New interface to add** — insert before `RegulatoryReport` (line 129):
```typescript
/**
 * Plain-language copy for non-technical recipients (klarspråksläge)
 * All text fields must be free of em/en dashes and percent signs (D-10.2).
 */
export interface PlainLanguageCopy {
    headline: string;
    whatHappens: string;
    whoIsAffected: string;
    businessImpact: string;
    howToFix: string;
    impactLevel: BusinessImpactLevel;
}
```

**Fields to add on `ConvergenceRule`** — after `legalContext?` on line 36:
```typescript
    plainLanguage?: PlainLanguageCopy;
```

**Fields to add on `RegulatoryReport`** — after `testability: Testability;` on line 138:
```typescript
    plainLanguage?: PlainLanguageCopy;
```

**Export re-export pattern** — add alongside the existing type exports at lines 103-128 of `index.ts`:
```typescript
    PlainLanguageCopy,
    BusinessImpactLevel,
```

---

### `packages/standards/src/index.ts` (service, CRUD)

**Analog:** itself — `generateRegulatoryReport` at lines 274-289. This is the exact function to modify.

**Existing explicit-field copy pattern** (lines 274-289 — read verbatim):
```typescript
export function generateRegulatoryReport(ruleId: string, lang: string = 'en'): RegulatoryReport | null {
    const rule = getConvergenceRule(ruleId, lang);
    if (!rule) return null;

    return {
        ruleId: rule.ruleId,
        wcagCriteria: rule.wcagCriteria,
        en301549Criteria: rule.en301549Criteria,
        dosLagenReference: rule.dosLagenReference,
        diggRisk: rule.holmdigitalInsight.diggRisk,
        eaaImpact: rule.holmdigitalInsight.eaaImpact,
        remediation: rule.remediation,
        holmdigitalInsight: rule.holmdigitalInsight,
        testability: rule.testability,
    };
}
```

**Modified version** — add EN fallback resolution before the `return` and add `plainLanguage` as the last field:
```typescript
export function generateRegulatoryReport(ruleId: string, lang: string = 'en'): RegulatoryReport | null {
    const rule = getConvergenceRule(ruleId, lang);
    if (!rule) return null;

    // D-03: EN fallback — if the language rule lacks plainLanguage, fetch from EN
    const plainLanguage = rule.plainLanguage
        ?? (lang !== 'en' ? getConvergenceRule(ruleId, 'en')?.plainLanguage : undefined);

    return {
        ruleId: rule.ruleId,
        wcagCriteria: rule.wcagCriteria,
        en301549Criteria: rule.en301549Criteria,
        dosLagenReference: rule.dosLagenReference,
        diggRisk: rule.holmdigitalInsight.diggRisk,
        eaaImpact: rule.holmdigitalInsight.eaaImpact,
        remediation: rule.remediation,
        holmdigitalInsight: rule.holmdigitalInsight,
        testability: rule.testability,
        plainLanguage,
    };
}
```

**getData + getConvergenceRule patterns** (lines 130-151, 153-172) show that `getConvergenceRule(ruleId, 'en')` is safe as a cache hit — `getData('en')` always returns `rulesEn` with no network call, so the EN fallback is free.

**Type export block** (lines 103-128) — pattern for adding `PlainLanguageCopy` and `BusinessImpactLevel` to the existing `export type { ... }` block.

---

### `packages/standards/data/rules.sv.json` and `rules.en.json` (config, transform)

**Analog:** themselves — existing rule objects (e.g. `color-contrast` object confirmed present in both files). PowerShell context output shows the JSON shape: the new `plainLanguage` block sits alongside `ruleId`, `wcagCriteria`, `remediation`, etc.

**Existing rule JSON shape** (from rules.sv.json, `color-contrast` entry):
```json
{
    "ruleId": "color-contrast",
    "wcagCriteria": "1.4.3",
    "wcagLevel": "AA",
    "remediation": {
        "description": "...",
        "technicalGuidance": "...",
        "component": "@holmdigital/components/Button"
    },
    "holmdigitalInsight": { "diggRisk": "high", ... },
    "legalContext": { ... }
}
```

**New `plainLanguage` block to add on each of the 8 target rules** (keys from `klarsprak-cli-implementation.md`, confirmed English-keyed per D-01; impactLevel values from D-04 decision table):

```json
"plainLanguage": {
    "headline": "...",
    "whatHappens": "...",
    "whoIsAffected": "...",
    "businessImpact": "...",
    "howToFix": "...",
    "impactLevel": "stoppar-kop"
}
```

**D-04 impactLevel values** (canonical — copy verbatim):

| ruleId | impactLevel |
|---|---|
| `form-labels` | `stoppar-kop` |
| `alt-text` | `hindrar` |
| `name-role-value` | `hindrar` |
| `keyboard-accessible` | `hindrar` |
| `color-contrast` | `forsamrar` |
| `link-purpose` | `forsamrar` |
| `heading-order` | `putsning` |
| `language-of-page` | `putsning` |

**Tone constraints** (enforced by D-10.2 vitest guard — these chars must NOT appear in any text value):
- No `—` (U+2014 em dash)
- No `–` (U+2013 en dash)
- No `%` (no invented statistics)

**Encoding constraint** (enforced by D-10.1 vitest guard):
- Swedish texts must contain raw UTF-8 `å`, `ä`, `ö` — never mojibake sequences `Ã¶`, `Ã¤`, `Ã…`
- Use the Write tool, not Bash heredoc, to avoid encoding corruption (RESEARCH.md Pitfall 4)

---

### `packages/standards/src/index.test.ts` (test, batch)

**Analog:** `packages/engine/src/reporting/junit-generator.test.ts` (exact test structure), and `packages/standards/src/index.test.ts` itself (existing `describe` blocks at lines 32-136).

**Existing test file structure** (lines 1-10, 32-40):
```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import {
    getEN301549Mapping,
    // ... other imports
} from './index';
import type { Country } from './types';

describe('Standards Package', () => {
    it('should export convergence rules', () => {
        const rules = getAllConvergenceRules('en');
        expect(rules.length).toBeGreaterThan(0);
    });
```

**New describe-block imports to prepend** — add JSON file imports at top of file alongside existing imports:
```typescript
import rulesSv from '../data/rules.sv.json';
import rulesEn from '../data/rules.en.json';
```

**D-10.1 Encoding guard** — new `describe` block to append at bottom of file:
```typescript
describe('plainLanguage encoding guard (D-10.1)', () => {
    const MOJIBAKE = /Ã/;
    const PLAIN_IDS = [
        'alt-text', 'color-contrast', 'form-labels', 'link-purpose',
        'name-role-value', 'keyboard-accessible', 'heading-order', 'language-of-page'
    ] as const;

    it('sv: no mojibake in any plainLanguage text field', () => {
        for (const id of PLAIN_IDS) {
            const rule = (rulesSv as ConvergenceRule[]).find(r => r.ruleId === id);
            const pl = rule?.plainLanguage;
            if (!pl) continue;
            for (const [field, val] of Object.entries(pl)) {
                if (typeof val === 'string') {
                    expect(MOJIBAKE.test(val), `${id}.${field} has mojibake`).toBe(false);
                }
            }
        }
    });
});
```

Note: Cast `rulesSv as ConvergenceRule[]` (not `as any[]`) after `PlainLanguageCopy` lands in types per CLAUDE.md zero-`as any` rule.

**D-10.2 Tone lint** — new `describe` block:
```typescript
describe('plainLanguage tone lint (D-10.2)', () => {
    const DASH = /[—–]/;
    const PERCENT = /%/;

    for (const [lang, rules] of [['sv', rulesSv], ['en', rulesEn]] as const) {
        it(`${lang}: no em/en dashes or percent signs in any plainLanguage field`, () => {
            for (const rule of rules as ConvergenceRule[]) {
                if (!rule.plainLanguage) continue;
                for (const [field, val] of Object.entries(rule.plainLanguage)) {
                    if (typeof val !== 'string') continue;
                    expect(DASH.test(val), `${rule.ruleId}.${field} (${lang}) has dash`).toBe(false);
                    expect(PERCENT.test(val), `${rule.ruleId}.${field} (${lang}) has percent`).toBe(false);
                }
            }
        });
    }
});
```

**D-10.3 Parity guard** — new `describe` block:
```typescript
describe('plainLanguage sv/en parity (D-10.3)', () => {
    const PLAIN_IDS = [
        'alt-text', 'color-contrast', 'form-labels', 'link-purpose',
        'name-role-value', 'keyboard-accessible', 'heading-order', 'language-of-page'
    ] as const;

    it('same 8 ruleIds have plainLanguage in both sv and en', () => {
        for (const id of PLAIN_IDS) {
            const sv = (rulesSv as ConvergenceRule[]).find(r => r.ruleId === id);
            const en = (rulesEn as ConvergenceRule[]).find(r => r.ruleId === id);
            expect(sv?.plainLanguage, `sv missing plainLanguage for ${id}`).toBeDefined();
            expect(en?.plainLanguage, `en missing plainLanguage for ${id}`).toBeDefined();
            expect(sv?.plainLanguage?.impactLevel, `impactLevel mismatch for ${id}`)
                .toBe(en?.plainLanguage?.impactLevel);
        }
    });
});
```

**PLAIN-02 enrichment assertion** — new `describe` block:
```typescript
describe('generateRegulatoryReport plainLanguage enrichment (PLAIN-02)', () => {
    it('returns plainLanguage for sv when texts exist', () => {
        const report = generateRegulatoryReport('form-labels', 'sv');
        expect(report?.plainLanguage).toBeDefined();
        expect(report?.plainLanguage?.impactLevel).toBe('stoppar-kop');
    });

    it('returns EN plainLanguage as fallback for unsupported lang (D-03)', () => {
        const report = generateRegulatoryReport('form-labels', 'de');
        expect(report?.plainLanguage).toBeDefined();
        // de has no plainLanguage → falls back to EN
        expect(report?.plainLanguage?.impactLevel).toBe('stoppar-kop');
    });

    it('returns undefined plainLanguage for a rule with no text in any lang', () => {
        // Any rule not in the 8-rule set — e.g. a rule without plainLanguage
        const report = generateRegulatoryReport('focus-order', 'en');
        expect(report?.plainLanguage).toBeUndefined();
    });
});
```

---

### `packages/engine/src/reporting/plain-report.ts` (NEW — utility, request-response)

**Analog:** `packages/engine/src/reporting/junit-generator.ts` (same role: reporter reading `ScanResult`, returning formatted output without side effects). Secondary analog: the `else if (options.light)` block in `cli/index.ts` (lines 220-239) for the chalk terminal-rendering pattern.

**Imports pattern** — copy from `packages/engine/src/reporting/html-template.ts` (lines 1-5) and `packages/engine/src/cli/index.ts` (lines 7-17):
```typescript
import chalk from 'chalk';
import { ScanResult } from '../core/regulatory-scanner';
import { t } from '../i18n';
import type { EnrichedReport } from '@holmdigital/standards';
import type { BusinessImpactLevel } from '@holmdigital/standards';
```

**Core rendering pattern** — modelled on the `else if (options.light)` block (cli/index.ts lines 220-239) for chalk usage, and the `reports.sort()` pattern in `html-template.ts` lines 275-280 for sort order:
```typescript
const IMPACT_ORDER: Record<BusinessImpactLevel, number> = {
    'stoppar-kop': 0,
    'hindrar': 1,
    'forsamrar': 2,
    'putsning': 3,
};

const RISK_TO_IMPACT: Record<string, BusinessImpactLevel> = {
    critical: 'stoppar-kop',
    high: 'hindrar',
    medium: 'forsamrar',
    low: 'putsning',
};

const BADGE_CHALK: Record<BusinessImpactLevel, chalk.Chalk> = {
    'stoppar-kop': chalk.red.bold,
    'hindrar': chalk.red,
    'forsamrar': chalk.yellow,
    'putsning': chalk.gray,
};

export function renderPlainReport(result: ScanResult, lang: string = 'en'): void {
    // renderer reads report.plainLanguage directly — no secondary lookup (RESEARCH anti-pattern)
    const sortedReports = [...result.reports].sort((a, b) => {
        const levelOf = (r: EnrichedReport): BusinessImpactLevel =>
            r.plainLanguage?.impactLevel ?? RISK_TO_IMPACT[r.holmdigitalInsight.diggRisk] ?? 'putsning';
        return (IMPACT_ORDER[levelOf(a)] ?? 4) - (IMPACT_ORDER[levelOf(b)] ?? 4);
    });
    // ... console.log calls using t() for all chrome strings
}
```

**Chalk color pattern** (from cli/index.ts lines 233-236):
```typescript
const color = r.holmdigitalInsight.diggRisk === 'critical' ? chalk.red
    : r.holmdigitalInsight.diggRisk === 'high' ? chalk.yellow : chalk.gray;
console.log(color(`  [${r.holmdigitalInsight.diggRisk.toUpperCase()}] ${r.ruleId} ...`));
```

**Fallback to `remediation.description`** — when `report.plainLanguage` is undefined, use `report.remediation.description` as the body text (D-03 fallback already handled upstream; this covers rules with no text in any language).

**`t()` call pattern** (from cli/index.ts line 134):
```typescript
ora(t('cli.initializing')).start()
// t() with params:
t('cli.scanning', { url })
t('cli.pdf_saved', { path: options.pdf })
```

Apply same pattern for plain-report chrome: `t('plain.what_happens')`, `t('plain.intro_found', { count: sortedReports.length, unit: ... })`, etc.

---

### `packages/engine/src/reporting/plain-report.test.ts` (NEW — test, request-response)

**Analog:** `packages/engine/src/reporting/junit-generator.test.ts` (lines 1-91) — same file structure, same `mockResult` construction pattern with `as unknown as ScanResult['reports'][number]` for partial report fixtures.

**Imports pattern** (from junit-generator.test.ts lines 1-5):
```typescript
import { describe, it, expect } from 'vitest';
import { renderPlainReport } from './plain-report';
import { ScanResult, getEngineVersion } from '../core/regulatory-scanner';
import axeCore from 'axe-core';
```

**Mock ScanResult fixture pattern** (from junit-generator.test.ts lines 7-29):
```typescript
const mockResult: ScanResult = {
    url: 'https://example.com',
    timestamp: '2026-02-08T01:51:29Z',
    metadata: {
        engineVersion: getEngineVersion(),
        axeCoreVersion: axeCore.version,
        standardsVersion: '1.2.2',
        scanDuration: 1500,
        pageTitle: 'Example',
        pageLanguage: 'en'
    },
    reports: [],
    stats: { passed: 42, critical: 0, high: 0, medium: 0, low: 0, total: 0 },
    score: 100,
    complianceStatus: 'PASS'
};
```

**Partial report fixture pattern with widening** (from junit-generator.test.ts lines 43-67):
```typescript
{
    ruleId: 'form-labels',
    holmdigitalInsight: { diggRisk: 'critical', eaaImpact: 'high', reasoning: '...' },
    remediation: { description: 'Fix labels', technicalGuidance: '...', component: null },
    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
    plainLanguage: {
        headline: 'Test headline',
        whatHappens: 'Test what happens',
        whoIsAffected: 'Test who',
        businessImpact: 'Test impact',
        howToFix: 'Test fix',
        impactLevel: 'stoppar-kop'
    }
} as unknown as ScanResult['reports'][number]
```

Note: use `as unknown as ScanResult['reports'][number]` — not `as any` — per CLAUDE.md PUB-09 rule.

**D-10.4 renderer structure tests** — four `it()` blocks covering:
1. Sort order: reports sorted `stoppar-kop` before `hindrar` before `forsamrar` before `putsning`
2. Badge mapping: `stoppar-kop` → `chalk.red.bold` output (assert against spied `console.log` or capture stdout)
3. Fallback: when `plainLanguage` is undefined, renderer does not throw and uses `remediation.description` text
4. Tom-state: when `result.reports` is empty, `t('plain.empty_state')` key is rendered

**Spy/capture pattern** — capture stdout with `vi.spyOn(console, 'log')` or use a returned string if the function signature is changed to return `string` instead of `void`. Prefer `void` + spy to match `generateJUnitXML`'s `return string` pattern only when simpler.

---

### `packages/engine/src/reporting/html-template.ts` (utility, request-response)

**Analog:** itself. Function signature at line 27 is the exact insertion point.

**Current signature** (line 27):
```typescript
export function generateReportHTML(result: ScanResult, sector: 'public' | 'private' = 'public'): string {
```

**Modified signature** — add `audience` as third param with default (Pitfall 5 in RESEARCH.md):
```typescript
export function generateReportHTML(
    result: ScanResult,
    sector: 'public' | 'private' = 'public',
    audience: 'developer' | 'plain' = 'developer'
): string {
```

**Plain template branch** — insert at top of function body before the existing `const criticalCount = ...` block:
```typescript
    if (audience === 'plain') {
        return generatePlainReportHTML(result, sector);
    }
```

Then add a private `generatePlainReportHTML(result, sector)` function in the same file. The plain HTML template mirrors the terminal renderer structure: opening paragraph + numbered list (impact-sorted, five fields + badge) + closing paragraph + footer with URL/date/version. No score, no WCAG tables, no legal sections (D-08).

**i18n pattern** (from html-template.ts lines 34-36, 50):
```typescript
const intlLocale = LOCALE_TO_INTL[getCurrentLang()] || 'en-US';
// ...
<title>${t('report.title', { url: result.url })}</title>
```

Apply same `t()` for plain template chrome: `t('plain.report_title', { url: result.url })`, etc.

**Footer pattern** (html-template.ts lines 311-313):
```typescript
<footer>
    ${t('report.footer', { version: getEngineVersion() })}
</footer>
```

Plain footer also includes `result.url`, `result.timestamp`, `getEngineVersion()` per D-08 ("URL, skanningsdatum och verktygsversion").

**Caller site** (cli/index.ts line 174) — existing call passes two args:
```typescript
const html = generateReportHTML(result, options.sector as 'public' | 'private');
```
The default for `audience` ensures this call compiles without change. The plain-mode call passes three args:
```typescript
const html = generateReportHTML(result, options.sector as 'public' | 'private', 'plain');
```

---

### `packages/engine/src/cli/index.ts` (utility, request-response)

**Analog:** itself. Three exact insertion points.

**Options declaration block** (lines 45-68) — add two new `.option()` calls after `--light` on line 67:
```typescript
.option('--light', 'Light scan: fast score-only mode ...')
.option('--audience <mode>', 'Output audience: developer (default) or plain', 'developer')
.option('--plain', 'Alias for --audience plain (klarspråksläge for non-technical recipients)')
```

**Options merge block** (lines 75-120) — add `audience` and `plain` fields following the existing `cliOptions.X || fileConfig.X || default` pattern (line 97 for `light`):
```typescript
// In merge block:
plain: cliOptions.plain ?? fileConfig.plain ?? false,
audience: cliOptions.plain
    ? 'plain'
    : (cliOptions.audience || fileConfig.audience || 'developer'),
```

**Type cast block** (lines 98-120) — add to the `as ScannerOptions & { ... }` cast:
```typescript
plain: boolean;
audience: 'developer' | 'plain';
```

**Print-chain insertion** (between `else if (options.light)` on line 220 and `else {` on line 241 — D-12: after light, before dashboard):
```typescript
} else if (options.audience === 'plain') {
    const { renderPlainReport } = await import('../reporting/plain-report');
    renderPlainReport(result, options.lang);
} else {
    // --- CLI DASHBOARD IMPLEMENTATION ---
```

**Plain PDF branch** — inside the existing `if (options.pdf)` block (lines 172-176), branch on audience:
```typescript
if (options.pdf) {
    if (spinner) spinner.start(t('cli.generating_pdf'));
    const html = options.audience === 'plain'
        ? generateReportHTML(result, options.sector as 'public' | 'private', 'plain')
        : generateReportHTML(result, options.sector as 'public' | 'private');
    await generatePDF(html, options.pdf);
    if (spinner) spinner.succeed(t('cli.pdf_saved', { path: options.pdf }));
}
```

---

### `packages/engine/src/locales/en.json` (config, transform)

**Analog:** itself. Existing two-namespace flat structure (lines 1-38): `"cli": { ... }` and `"report": { ... }`.

**New `"plain"` namespace to add** — append as third top-level key (stays flat per existing pattern; `LocaleData = typeof en` in `i18n/index.ts` line 12 enforces all 9 files must match this shape):

```json
{
    "cli": { ... },
    "report": { ... },
    "plain": {
        "what_happens": "What happens",
        "who_is_affected": "Who is affected",
        "business_impact": "What it costs you",
        "how_to_fix": "How to fix it",
        "badge_stoppar_kop": "Blocks purchases",
        "badge_hindrar": "Excludes customers",
        "badge_forsamrar": "Degrades experience",
        "badge_putsning": "Worth polishing",
        "intro_found": "We found {count} {unit} to look at.",
        "intro_unit_singular": "issue",
        "intro_unit_plural": "issues",
        "intro_framing": "This doesn't mean you did anything wrong. Most people who build a website never find out that accessibility is even a thing. Now you know.",
        "sorted_by": "Sorted by what costs you the most customers.",
        "closing": "Start at the top. The items highest up cost you the most customers.",
        "empty_state": "We found no barriers this time. Well done.",
        "report_title": "Accessibility report for {url}"
    }
}
```

---

### `packages/engine/src/locales/sv.json` (config, transform)

**Analog:** `en.json` shape (all 9 files must match `typeof en`). Swedish values for the `plain` namespace per D-01 (real Swedish translations).

```json
"plain": {
    "what_happens": "Vad som händer",
    "who_is_affected": "Vem det drabbar",
    "business_impact": "Vad det kostar",
    "how_to_fix": "Så fixar du",
    "badge_stoppar_kop": "Stoppar köp",
    "badge_hindrar": "Hindrar kunder",
    "badge_forsamrar": "Försämrar upplevelsen",
    "badge_putsning": "Värt att putsa",
    "intro_found": "Vi hittade {count} {unit} att titta på.",
    "intro_unit_singular": "punkt",
    "intro_unit_plural": "punkter",
    "intro_framing": "Det betyder inte att du gjort något fel. De flesta som bygger en webbplats får aldrig veta att tillgänglighet ens är en sak. Nu vet du.",
    "sorted_by": "Sorterat efter vad som kostar dig mest kunder.",
    "closing": "Börja uppifrån. Punkterna högst upp kostar dig mest kunder.",
    "empty_state": "Vi hittade inga hinder den här gången.",
    "report_title": "Tillgänglighetsrapport för {url}"
}
```

---

### `packages/engine/src/locales/de.json` (and fr, es, nl, fi, dk, no) (config, transform)

**Analog:** `en.json` `plain.*` block — verbatim English values per D-01 (real translations deferred). All 7 files receive identical content to `en.json`'s `plain` block. Pattern from `de.json` (lines 1-38) shows the `"cli"` and `"report"` blocks already have German values; `"plain"` gets English values appended as third namespace.

---

### `.changeset/*.md` (config)

**Analog:** `standards-2026-06-05-ca-aca-fr-dinum.md` (retrieved from git commit 884f142). Changeset format:

```markdown
---
"@holmdigital/standards": minor
---

**[Title]** ([date]):

[Bullet-point description of what changed and why. List new public API additions, breaking changes, and deferred items.]

**Sources verified:** [list]
```

**Two changesets required:**
1. `standards-2026-06-[date]-plain-language-copy.md` — `"@holmdigital/standards": minor` — new public API: `PlainLanguageCopy` interface, `BusinessImpactLevel` type, `plainLanguage` field on `ConvergenceRule` and `RegulatoryReport`, 8 Swedish + 8 English texts
2. `engine-2026-06-[date]-plain-report.md` — `"@holmdigital/engine": minor` — new `renderPlainReport`, `--plain` / `--audience plain` CLI flags, plain PDF template

---

## Shared Patterns

### i18n via `t()` (engine-wide)

**Source:** `packages/engine/src/i18n/index.ts` lines 45-76; `packages/engine/src/cli/index.ts` line 134
**Apply to:** `plain-report.ts`, `html-template.ts` plain branch

```typescript
// Simple key
t('plain.what_happens')
// Parametric key
t('plain.intro_found', { count: 5, unit: 'punkter' })
// t() already falls back to EN if key missing in current lang (i18n/index.ts lines 53-63)
```

**Critical constraint:** `LocaleData = typeof en` in `i18n/index.ts` line 12 — ALL 9 locale files (`en`, `sv`, `de`, `fr`, `es`, `nl`, `fi`, `dk`, `no`) must have every key under `plain.*` or `npm run typecheck -w @holmdigital/engine` fails. Add keys to all 9 files in one task wave (RESEARCH Pitfall 2).

### chalk color pattern (engine terminal output)

**Source:** `packages/engine/src/cli/index.ts` lines 222-236
**Apply to:** `plain-report.ts`

```typescript
const scoreColor = result.score >= 90 ? chalk.green : (result.score >= 70 ? chalk.yellow : chalk.red);
// Badge color by impactLevel (plain-report specific mapping):
// stoppar-kop → chalk.red.bold
// hindrar     → chalk.red
// forsamrar   → chalk.yellow
// putsning    → chalk.gray
```

### Zero-warning lint state (PUB-09, CLAUDE.md)

**Source:** CLAUDE.md PUB-09 section
**Apply to:** ALL new/modified `.ts` files

- No `as any` — use `as unknown as T` for partial-fixture widening in tests
- No unused `catch (e)` — use `catch { }` or `catch (_e) { }` if error unused
- No `// @ts-expect-error` except for intentionally-invalid negative-path test inputs
- Strict mode: no implicit `any` parameters

### Explicit-field pattern (no spread in `generateRegulatoryReport`)

**Source:** `packages/standards/src/index.ts` lines 278-289
**Apply to:** The PLAIN-02 modification of `generateRegulatoryReport`

The function lists every returned field explicitly. Do NOT add a spread (`...rule`). The new `plainLanguage` field must be the final listed entry after `testability`.

### Dynamic import pattern for new CLI branches

**Source:** `packages/engine/src/cli/index.ts` lines 378-380

```typescript
const { generateGitHubActionsAnnotations } = await import('../reporting/github-actions');
```

Apply this same lazy-import pattern for `renderPlainReport` in the CLI print-chain branch:
```typescript
const { renderPlainReport } = await import('../reporting/plain-report');
```

---

## No Analog Found

All files in scope have at least a role-match analog in the codebase. No files require falling back to RESEARCH.md patterns exclusively — all RESEARCH.md patterns are already grounded in verified source reads.

---

## Metadata

**Analog search scope:** `packages/standards/src/`, `packages/engine/src/reporting/`, `packages/engine/src/cli/`, `packages/engine/src/locales/`, `packages/engine/src/i18n/`, `.changeset/` (git history)
**Files scanned:** 14 source files read directly; 2 git history commits examined for changeset format
**Pattern extraction date:** 2026-06-11
