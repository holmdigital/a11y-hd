# Phase 34: Klarspråksrapport (opt-in plain-language report) — Research

**Researched:** 2026-06-11
**Domain:** TypeScript data augmentation (standards) + CLI rendering (engine) + PDF generation
**Confidence:** HIGH — all critical integration points verified by direct source-read

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Chrome-strängar via engine i18n (`t()`).** Renderarens chrome ("Vad som händer:", "Vem det drabbar:", "Vad det kostar:", "Så fixar du:", allvarlighetsbadges, öppning, avslutning, tom-state) läggs som nycklar i motorns befintliga locale-filer (`packages/engine/src/locales/*.json`). `LocaleData = typeof en` betyder att nycklarna måste in i ALLA 9 filer — svenska + engelska översätts på riktigt, övriga 7 (de/fr/es/nl/fi/dk/no) får engelska värden tills vidare. Ingen hårdkodad svenska i `plain-report.ts`.

**D-02: Texterna levereras på svenska OCH engelska (PLAIN-06 utökad).** De 8 klarspråkstexterna skrivs i både `rules.sv.json` och `rules.en.json`. Engelska versionen följer samma tonregler (you-tilltal, affärsnytta före teknik, inga tankstreck/em-dashes, ingen skuld, inga uppfunna siffror). Karin granskar båda språken via leveransgrinden.

**D-03: Engelsk tyst fallback för språk utan texter.** För `--plain --lang de` (etc.): `generateRegulatoryReport` faller tillbaka på engelska `plainLanguage` via `getConvergenceRule(ruleId, 'en')` när språkets regel saknar fältet. Fallbacken sker VID ENRICHMENT i standards — aldrig i renderaren.

**D-04: Explicit `impactLevel` på ALLA 8 regler** (verifierat att härledning ger fel nivå för 6 av 8):

| ruleId | impactLevel (explicit) | diggRisk-härledning hade gett |
|---|---|---|
| form-labels | stoppar-kop | hindrar |
| alt-text | hindrar | hindrar |
| name-role-value | hindrar | stoppar-kop |
| keyboard-accessible | hindrar | stoppar-kop |
| color-contrast | forsamrar | hindrar |
| link-purpose | forsamrar | forsamrar |
| heading-order | putsning | forsamrar |
| language-of-page | putsning | hindrar |

**D-05: Ingen compliance-score i klarspråksterminalen.** Antal punkter + impact-sortering räcker.

**D-06: Neutral avslutning utan sälj-CTA.** CLI-dokumentets "Vill du ha hjälp att prioritera? Hör av dig..." ersätts med neutral rad i stil med "Börja uppifrån. Punkterna högst upp kostar dig mest kunder." Inga tankstreck — tonregel. Slutlig lydelse via D-09.

**D-07: Öppningen behåller kärnan men stryker sifferspannet.** "Det betyder inte att du gjort något fel. De flesta som bygger en webbplats får aldrig veta att tillgänglighet ens är en sak. Nu vet du..." behålls. Claimen "De flesta sajter vi skannar har mellan 15 och 40 sådana här punkter" STRYKS.

**D-08: Klarspråks-PDF:en speglar terminalen.** Öppning + impact-sorterad lista (de fem fälten + allvarlighetsbadge) + neutral avslutning + diskret sidfot med URL, skanningsdatum och verktygsversion. INGEN score, INGA WCAG/DIGG-tabeller, INGA legal-sektioner. `generateReportHTML(result, sector, audience)` väljer klarspråksmall när `audience === 'plain'`; developer-PDF:en förblir byte-för-byte oförändrad.

**D-09: Exakta lydelser via utkast + Karin-grind.** Öppning, avslutning, tom-state och engelska översättningar skrivs av Claude under exekvering. Karin godkänner via testskanning av johancask.com med `--plain --pdf` + Version Packages-PR-mergen.

**D-10: Fyra mekaniska vakter:**
1. Encoding-vakt — vitest asserterar korrekta å/ä/ö (sv), inga `Ã` i någon text.
2. Ton-lint — inga tankstreck (—/–) och inga procenttecken i någon plainLanguage-text (sv och en).
3. sv/en-paritet — exakt samma 8 ruleIds har `plainLanguage` i båda filerna, med identiska `impactLevel`-värden.
4. Renderar-strukturtest — impact-sorteringsordning, badge-mappning, fallback till `remediation.description`, tom-state.

**D-11: `plainLanguage` ligger ALLTID i `EnrichedReport`/`--json`-utdata** (additivt optional fält), oavsett `--audience`. Bakåtkompatibelt.

**D-12: Flaggprioritet `json > light > plain`.** Plain-grenen placeras före dashboard-fallbacken (sista `else`) i CLI:ts utskriftskedja.

### Claude's Discretion
- Exakta i18n-nyckelnamn och struktur i locale-filerna
- Intern struktur i `plain-report.ts` (IMPACT-tabellens utformning etc.)
- Testfilernas placering och namngivning (följ befintliga mönster per paket)
- Changeset-formuleringar
- PDF-sidfotens exakta layout
- Tom-state-lydelsens exakta formulering (inom tonreglerna, granskas via D-09)

### Deferred Ideas (OUT OF SCOPE)
- Klarspråkstexter på fler språk (de/fr/es/nl/fi/dk/no) — efter native tonvalidering
- Riktiga chrome-översättningar för de 7 övriga locale-filerna — samma grind

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAIN-01 | `PlainLanguageCopy` interface + `BusinessImpactLevel` type in `standards/src/types.ts`; `plainLanguage?: PlainLanguageCopy` on `ConvergenceRule`; `plainLanguage?: PlainLanguageCopy` on `RegulatoryReport` (flows to `EnrichedReport` via extension) | Types verified absent; exact insertion points identified in types.ts |
| PLAIN-02 | Enrichment-koppling: `generateRegulatoryReport` copies `plainLanguage` explicitly (no spread); EN fallback via `getConvergenceRule(ruleId, 'en')` when lang rule lacks field | `generateRegulatoryReport` verified explicit-field (lines 278-288); `enrichResults` uses `{...report}` spread so plainLanguage flows with zero engine changes for data path |
| PLAIN-03 | Terminal renderer `packages/engine/src/reporting/plain-report.ts` — renderPlainReport(result, lang); reads `report.plainLanguage` directly (no secondary lookup); chrome via `t()` | Chrome i18n pattern verified in cli/index.ts; locale file structure confirmed |
| PLAIN-04 | CLI flags `--audience <developer\|plain>` + `--plain` alias; options merge block; `audience` field in type cast; new branch in print chain | Exact positions in cli/index.ts verified (lines 47-68 for options, 203-241 for print chain) |
| PLAIN-05 | PDF mode via `audience` arg in `generateReportHTML`; plain template mirrors terminal; developer PDF byte-for-byte unchanged | `generateReportHTML(result, sector)` signature at line 27 of html-template.ts confirmed; third param addition is safe |
| PLAIN-06 (extended D-02) | 8 klarspråkstexter in BOTH `rules.sv.json` AND `rules.en.json` for semantic ruleIds: `alt-text`, `color-contrast`, `form-labels`, `link-purpose`, `name-role-value`, `keyboard-accessible`, `heading-order`, `language-of-page` | All 8 ruleIds confirmed present in BOTH files; no `plainLanguage` field exists yet; `impactLevel` values must be set explicitly per D-04 table |

</phase_requirements>

---

## Summary

Phase 34 adds an opt-in plain-language report mode (`--plain` / `--audience plain`) for non-technical recipients (e-commerce owners, managers). The work spans two packages: `@holmdigital/standards` receives a new `PlainLanguageCopy` interface and `BusinessImpactLevel` type plus 8 Swedish + 8 English texts in the rules JSON files; `@holmdigital/engine` receives a terminal renderer, two new CLI flags, a PDF mode, and 9 locale file additions. `@holmdigital/components` is untouched.

All 8 target `ruleId` values (`alt-text`, `color-contrast`, `form-labels`, `link-purpose`, `name-role-value`, `keyboard-accessible`, `heading-order`, `language-of-page`) are confirmed present in both `rules.sv.json` and `rules.en.json` with no `plainLanguage` field yet. The Swedish remediation descriptions in those rules are confirmed mojibake-free. The enrichment path in `regulatory-scanner.ts` uses a `{...report}` spread, so once `plainLanguage` is copied in `generateRegulatoryReport`, it flows to terminal, JSON, and PDF output with zero additional engine changes.

The critical architectural insight: `generateRegulatoryReport` copies fields explicitly (not with a spread), so the planner must include a task that adds the explicit copy of `plainLanguage` (with EN fallback) at line ~288 of `standards/src/index.ts`. The convergence schema is referenced in `package.json` scripts (`validate-schema.js`, `validate-data.js`) but those script files do not exist — there is no AJV gate blocking the JSON changes. Schema is informational only.

**Primary recommendation:** Structure the phase as four waves: (1) types + data, (2) standards enrichment + texts, (3) engine renderer + CLI + PDF, (4) tests + changesets. This ordering ensures the data layer is stable before the render layer consumes it.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PlainLanguageCopy type definition | standards/src/types.ts | — | Types live with the data package they annotate |
| BusinessImpactLevel type | standards/src/types.ts | — | Derived concept from the content layer |
| 8 Swedish + 8 English klarspråkstexter | standards/data/rules.sv.json + rules.en.json | — | Texts are per-language data, co-located with other per-language rule fields |
| EN fallback logic | standards/src/index.ts (`generateRegulatoryReport`) | — | Fallback is a data-retrieval concern, not a rendering concern |
| plainLanguage flow to EnrichedReport | engine/src/core/regulatory-scanner.ts (zero changes needed) | — | `{...report}` spread already passes the field through |
| Chrome i18n strings (labels, badges, open/close text) | engine/src/locales/*.json (all 9) | — | Engine owns all terminal chrome; `LocaleData = typeof en` enforces exhaustiveness |
| Terminal renderer | engine/src/reporting/plain-report.ts (new file) | — | Engine reporting layer owns all CLI output |
| CLI flags --audience / --plain | engine/src/cli/index.ts | — | All CLI option parsing is in cli/index.ts |
| PDF plain template | engine/src/reporting/html-template.ts | engine/src/reporting/pdf-generator.ts | html-template generates HTML; pdf-generator converts it |
| Quality guards (D-10.1-4) | standards/src/index.test.ts (encoding, tone, parity) | engine/src/reporting/plain-report.test.ts (renderer) | Tests co-located with the code they guard |

---

## Standard Stack

### Core (no new packages needed)

| Library | Already In Use | Purpose | Notes |
|---------|---------------|---------|-------|
| chalk ^5.3.0 | engine dep | Terminal colors (red.bold for stoppar-kop, red for hindrar, yellow for forsamrar, gray for putsning) | Already used in cli/index.ts and referenced in klarsprak-cli-implementation.md |
| vitest ^4.0.16 | both packages devDep | Test framework for all 4 D-10 guards | Confirmed in both package.json devDependencies |
| tsup ^8.3.5 | both packages devDep | Build; no build changes needed for plain-report.ts (auto-discovered) | Existing config covers new files |

### No new packages required

This phase installs zero new npm packages. All capabilities use existing dependencies:

- Terminal rendering: `chalk` (already in engine)
- i18n: `t()` / `setLanguage()` (already in engine/src/i18n/index.ts)
- PDF: existing `generateReportHTML` + `generatePDF` pipeline (already in engine)
- Data: JSON import pattern already established in standards/src/index.ts

---

## Package Legitimacy Audit

No new packages to audit. This phase installs zero new dependencies in any package.

---

## Architecture Patterns

### System Architecture Diagram

```
CLI: hd-a11y-scan <url> --plain [--lang sv] [--pdf report.pdf]
     |
     v
cli/index.ts -- options merge: audience = 'plain' (--plain wins over --audience)
     |
     v (scan runs as today)
regulatory-scanner.enrichResults()
     |
     +---> generateRegulatoryReport(violation.id, lang)  [standards/src/index.ts]
     |       |
     |       +-- getConvergenceRule(ruleId, lang) -> rule.plainLanguage (if present)
     |       |       |
     |       |       +-- if undefined AND lang != 'en':
     |       |               getConvergenceRule(ruleId, 'en').plainLanguage  [D-03 fallback]
     |       |
     |       +-- returns RegulatoryReport { ...explicit fields..., plainLanguage? }
     |
     +---> {  ...report,                         <- plain report already in RegulatoryReport
               holmdigitalInsight: {..., reasoning},
               legalContext,
               failingNodes
            }  <- EnrichedReport (plainLanguage flows through spread for free)
     |
     v
ScanResult { reports: EnrichedReport[] }   <- plainLanguage in every matched report
     |
     +---> if options.json && options.light  -> light JSON (no plain branch)
     +---> else if options.json             -> JSON.stringify(result)  [D-11: plainLanguage in JSON always]
     +---> else if options.light            -> compact output
     +---> else if options.audience==='plain'  --> renderPlainReport(result, lang)   [D-12]
     |                                            -> (optional) generateReportHTML(result, sector, 'plain') -> PDF
     +---> else                             -> developer dashboard (unchanged)
```

### Recommended Project Structure (new/modified files only)

```
packages/
  standards/
    src/
      types.ts              # ADD: PlainLanguageCopy interface, BusinessImpactLevel type,
                            #      plainLanguage? on ConvergenceRule + RegulatoryReport
      index.ts              # MODIFY: generateRegulatoryReport — add explicit plainLanguage copy + EN fallback (D-03)
      index.test.ts         # ADD: D-10.1 encoding guard, D-10.2 tone lint, D-10.3 sv/en parity
    data/
      rules.sv.json         # ADD: plainLanguage block on 8 rules (Swedish texts + explicit impactLevel per D-04)
      rules.en.json         # ADD: plainLanguage block on 8 rules (English texts + explicit impactLevel per D-04)
  engine/
    src/
      locales/
        en.json             # ADD: plain.* i18n keys (real English translations)
        sv.json             # ADD: plain.* i18n keys (real Swedish)
        de.json             # ADD: plain.* i18n keys (English values per D-01 discretion)
        fr.json             # ADD: plain.* i18n keys (English values)
        es.json             # ADD: plain.* i18n keys (English values)
        nl.json             # ADD: plain.* i18n keys (English values)
        fi.json             # ADD: plain.* i18n keys (English values)
        dk.json             # ADD: plain.* i18n keys (English values)
        no.json             # ADD: plain.* i18n keys (English values)
      reporting/
        plain-report.ts     # NEW: renderPlainReport(result, lang)
        plain-report.test.ts # NEW: D-10.4 renderer structure tests
        html-template.ts    # MODIFY: add audience param, add plain HTML template
      cli/
        index.ts            # MODIFY: --audience / --plain flags, audience in options + type cast, new print branch
```

### Pattern 1: Explicit-field copy in `generateRegulatoryReport`

The function currently picks fields explicitly (no spread). `plainLanguage` must be copied with the EN fallback inline:

```typescript
// Source: packages/standards/src/index.ts (verified lines 274-289)
export function generateRegulatoryReport(ruleId: string, lang: string = 'en'): RegulatoryReport | null {
    const rule = getConvergenceRule(ruleId, lang);
    if (!rule) return null;

    // D-03: EN fallback — fetch from EN if the language rule lacks plainLanguage
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
        plainLanguage,   // additive optional field — undefined when no text exists
    };
}
```

[VERIFIED: source read of packages/standards/src/index.ts lines 274-289]

### Pattern 2: enrichResults spread (no engine changes needed for data path)

```typescript
// Source: packages/engine/src/core/regulatory-scanner.ts lines 318-332
reports.push({
    ...report,                              // plainLanguage flows here for free
    holmdigitalInsight: {
        ...report.holmdigitalInsight,
        reasoning: violation.help
    },
    legalContext: fullRule?.legalContext,
    failingNodes: violation.nodes.map(...)
});
```

[VERIFIED: source read of regulatory-scanner.ts lines 293-332]

### Pattern 3: CLI print-chain branch insertion point

```typescript
// Source: packages/engine/src/cli/index.ts lines 203-241 (verified)
// Current structure:
if (options.json && options.light) { ... }
else if (options.json) { ... }
else if (options.light) { ... }
// INSERT HERE (D-12: before the else dashboard)
else if (options.audience === 'plain') {
    const { renderPlainReport } = await import('../reporting/plain-report');
    renderPlainReport(result, options.lang);
} else {
    // developer dashboard — unchanged
}
```

[VERIFIED: source read of packages/engine/src/cli/index.ts lines 203-241]

### Pattern 4: options merge block in CLI (plain flag resolution)

```typescript
// In the options merge block (around line 75-120):
audience: cliOptions.plain
    ? 'plain'
    : (cliOptions.audience || fileConfig.audience || 'developer'),
```

And in the type cast (around line 98-120), add:
```typescript
audience: 'developer' | 'plain';
```

[ASSUMED — exact surrounding code verified; precise cast block location confirmed by reading lines 98-120]

### Pattern 5: impactLevel derivation for future rules (not the 8 explicit ones)

```typescript
// In plain-report.ts — fallback for rules without explicit impactLevel
const RISK_TO_IMPACT: Record<DiggRisk, BusinessImpactLevel> = {
    critical: 'stoppar-kop',
    high: 'hindrar',
    medium: 'forsamrar',
    low: 'putsning',
};

const levelOf = (r: EnrichedReport): BusinessImpactLevel =>
    r.plainLanguage?.impactLevel ?? RISK_TO_IMPACT[r.holmdigitalInsight.diggRisk];
```

[CITED: klarsprak-cli-implementation.md — pattern confirmed valid]

### Pattern 6: i18n key shape for chrome strings

The 9 locale files follow a flat `cli.*` and `report.*` structure (verified by reading en.json and sv.json). New keys belong under a `plain.*` namespace:

```json
{
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
        "empty_state": "Vi hittade inga hinder den här gången. Snyggt jobbat.",
        "report_title": "Tillgänglighetsrapport för {url}"
    }
}
```

[ASSUMED — key names are at Claude's discretion per CONTEXT.md; structure follows existing pattern]

Note: `LocaleData = typeof en` in `i18n/index.ts` means ALL 9 files must have every key under `plain.*` or the TypeScript type check fails. The 7 non-sv/en files receive English values per D-01.

### Pattern 7: plainLanguage JSON shape in rules files

```json
{
    "ruleId": "form-labels",
    "plainLanguage": {
        "headline": "Fälten i kassan saknar tydliga etiketter",
        "whatHappens": "Inmatningsfälten i kassan har ingen kopplad etikett. Det syns kanske en grå text i fältet men den försvinner så fort man börjar skriva.",
        "whoIsAffected": "Alla som använder skärmläsare och den som blir avbruten mitt i ifyllningen och tappar bort var hen var.",
        "businessImpact": "Kassan är där pengarna finns. Varje hinder här ger övergivna varukorgar.",
        "howToFix": "Sätt en synlig etikett ovanför varje fält till exempel Postnummer som ligger kvar hela tiden.",
        "impactLevel": "stoppar-kop"
    }
}
```

[CITED: klarsprak-cli-implementation.md and klarsprakslager-engine.md — English key names confirmed by CLI doc; note inga tankstreck in texts]

### Anti-Patterns to Avoid

- **Secondary lookup in renderer:** The renderer MUST read `report.plainLanguage` directly. It must NOT call `getConvergenceRule` or any standards function at print time. The EN fallback happens in `generateRegulatoryReport` at enrichment time.
- **Swedish-keyed PlainCopy:** The `klarsprakslager-engine.md` file uses `vadHander`, `vemPaverkas` etc. These Swedish keys are SCRAPPED. Use the English-keyed interface from `klarsprak-cli-implementation.md`: `headline`, `whatHappens`, `whoIsAffected`, `businessImpact`, `howToFix`.
- **`getPlainLanguageCopy` helper and `RULES_BY_LANG` constant:** The CLI doc proposes these. They are SCRAPPED per D-03 decision; the enrichment path already does the lookup.
- **`"ruleId": "image-alt"` in JSON:** The CLI doc example uses this axe-core raw id. The correct semantic id is `"ruleId": "alt-text"` — confirmed present in both JSON files.
- **Hardcoded Swedish in `plain-report.ts`:** All chrome strings go through `t()`. No string literals in Swedish or English in the renderer file itself.
- **Spread in `generateRegulatoryReport`:** Do not add a spread to this function. The field must be explicitly listed to remain consistent with the function's existing pattern.
- **Tankstreck in texts:** Neither `—` (em dash) nor `–` (en dash) may appear in any `plainLanguage` text field. Use commas, periods, or line breaks. This is a D-10.2 lint guard.
- **Procenttecken in texts:** No `%` characters in any `plainLanguage` text. No invented statistics.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Language fallback for missing translations | Custom locale-loader | `getConvergenceRule(ruleId, 'en')` in generateRegulatoryReport | Re-uses existing `getData()` cache; no extra module; no fs/network (standards is browser-safe) |
| Impact-level derivation | Parse diggRisk at render time | `plainLanguage?.impactLevel ?? RISK_TO_IMPACT[r.holmdigitalInsight.diggRisk]` | impactLevel is in the data (explicit for 8 rules); fallback map is 4 entries |
| PDF generation | New PDF library | `generatePDF(html, path)` from existing pdf-generator.ts | Existing pipeline; audience param only changes the HTML template, not the PDF call |
| i18n for chrome strings | Separate translation file | `t()` from existing engine i18n | `LocaleData = typeof en` gives compile-time exhaustiveness; no new infrastructure |
| Schema validation | New AJV script | n/a — convergence-schema.json has NO enforced validation gate | validate-schema.js and validate-data.js referenced in package.json do not exist; the schema is informational |

---

## Common Pitfalls

### Pitfall 1: forgetting the explicit copy in `generateRegulatoryReport`

**What goes wrong:** `plainLanguage` exists on `ConvergenceRule` but is never copied to `RegulatoryReport`. All reports have `plainLanguage: undefined` even when texts are in the JSON.
**Why it happens:** The function uses explicit field listing, not a spread. New fields must be added manually.
**How to avoid:** The task for PLAIN-02 must explicitly add `plainLanguage` to the returned object with the EN fallback expression.
**Warning signs:** Renderer always falls back to `remediation.description`; `--json` output has no `plainLanguage` field.

### Pitfall 2: TypeScript error from i18n key exhaustiveness

**What goes wrong:** `LocaleData = typeof en` means TypeScript type-checks every locale file against en.json's shape. If `plain.*` keys are added to en.json but not to (e.g.) dk.json, `tsc --noEmit` fails.
**Why it happens:** `type LocaleData = typeof en` creates a literal type from en.json's shape. All 9 `locales[lang]` entries must satisfy `LocaleData`.
**How to avoid:** Add `plain.*` keys to ALL 9 files simultaneously in the same task. The 7 non-sv/en files copy English values verbatim per D-01.
**Warning signs:** `npm run typecheck` error in engine package: "Type ... is not assignable to type LocaleData".

### Pitfall 3: impactLevel mismatch in D-10.3 parity test

**What goes wrong:** The parity guard asserts that all 8 ruleIds in rules.sv.json have the same `impactLevel` as in rules.en.json. If the values differ between files (copy-paste error), the test fails.
**Why it happens:** The 8 explicit impactLevel values must be identical in both files (they are editorial decisions, not language-specific).
**How to avoid:** Use the D-04 table as the canonical source. Both file edits should happen in the same task or wave.
**Warning signs:** D-10.3 test fails with "sv impactLevel for form-labels does not match en".

### Pitfall 4: mojibake when writing Swedish texts

**What goes wrong:** Text written by the implementer or copy-pasted through a tool produces `Ã¶` instead of `ö`, `Ã¤` instead of `ä`, `Ã…` instead of `Å`.
**Why it happens:** UTF-8 bytes are mis-decoded as Latin-1.
**How to avoid:** Write texts using the Write tool (not Bash heredoc). The D-10.1 encoding guard catches any escape.
**Warning signs:** D-10.1 test fails; `grep 'Ã' rules.sv.json` returns results.

### Pitfall 5: PDF changes breaking developer mode

**What goes wrong:** Modifying `generateReportHTML` to add the `audience` parameter changes the function signature. Existing callers in cli/index.ts (line 174) pass only two args. Without a default value for the third param, TypeScript flags the call.
**Why it happens:** Strict TypeScript + existing callers.
**How to avoid:** Give `audience` a default value: `audience: 'developer' | 'plain' = 'developer'`. The developer PDF path is byte-for-byte unchanged when `audience` defaults to `'developer'`.
**Warning signs:** `npm run typecheck` error in engine: "Expected 3 arguments, but got 2".

### Pitfall 6: plain branch in wrong position in print chain

**What goes wrong:** The `else if (options.audience === 'plain')` branch is inserted AFTER the final `else`, or BEFORE the `light` branch. This breaks D-12 (json > light > plain).
**Why it happens:** The chain has 4 branches; the insertion point is before the last `else`.
**How to avoid:** The insertion is before `else { // CLI DASHBOARD }` (line ~241). json and light branches remain above.
**Warning signs:** `--plain --json` renders plain report instead of JSON; `--plain --light` renders plain instead of light.

### Pitfall 7: schema validation scripts do not exist

**What goes wrong:** A plan task runs `npm run validate-schema` or `npm run validate-data` and fails with "file not found".
**Why it happens:** These scripts are referenced in standards/package.json but the corresponding `.js` files in `scripts/` do not exist (confirmed by directory listing).
**How to avoid:** Do NOT include tasks that invoke `validate-schema` or `validate-data`. The convergence schema has no enforced AJV gate in the current codebase. Schema validation for plainLanguage is covered by the TypeScript interface (PLAIN-01) and the D-10 vitest guards.
**Warning signs:** `npm run validate-schema` exits with ENOENT.

---

## Code Examples

### Adding plainLanguage to rules.sv.json (form-labels, highest impact)

```json
{
  "ruleId": "form-labels",
  "wcagCriteria": "1.3.1",
  "plainLanguage": {
    "headline": "Fälten i kassan saknar tydliga etiketter",
    "whatHappens": "Inmatningsfälten i kassan har ingen kopplad etikett. Det syns kanske en grå text i fältet men den försvinner så fort man börjar skriva.",
    "whoIsAffected": "Alla som använder skärmläsare och den som blir avbruten mitt i ifyllningen och tappar bort var hen var.",
    "businessImpact": "Kassan är där pengarna finns. Varje hinder här ger övergivna varukorgar.",
    "howToFix": "Sätt en synlig etikett ovanför varje fält till exempel Postnummer som ligger kvar hela tiden.",
    "impactLevel": "stoppar-kop"
  }
}
```

[CITED: klarsprakslager-engine.md text + D-04 impactLevel + English-key names from klarsprak-cli-implementation.md]

### D-10.1 Encoding guard (vitest)

```typescript
// packages/standards/src/index.test.ts
import rulesSv from '../data/rules.sv.json';
import rulesEn from '../data/rules.en.json';

describe('plainLanguage encoding guard (D-10.1)', () => {
    const MOJIBAKE = /Ã/;
    const PLAIN_IDS = ['alt-text','color-contrast','form-labels','link-purpose',
                       'name-role-value','keyboard-accessible','heading-order','language-of-page'];

    it('sv: no mojibake in any plainLanguage text', () => {
        for (const id of PLAIN_IDS) {
            const rule = (rulesSv as any[]).find((r: {ruleId: string}) => r.ruleId === id);
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

[ASSUMED — pattern follows existing test style in index.test.ts]

### D-10.2 Tone lint (vitest)

```typescript
describe('plainLanguage tone lint (D-10.2 — no dashes, no percent)', () => {
    const DASH = /[—–]/;
    const PERCENT = /%/;

    for (const [lang, rules] of [['sv', rulesSv], ['en', rulesEn]] as const) {
        it(`${lang}: no em/en dashes or percent signs in any plainLanguage field`, () => {
            for (const rule of rules as any[]) {
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

[ASSUMED — pattern follows existing test style]

### D-10.3 sv/en parity (vitest)

```typescript
describe('plainLanguage sv/en parity (D-10.3)', () => {
    const PLAIN_IDS = ['alt-text','color-contrast','form-labels','link-purpose',
                       'name-role-value','keyboard-accessible','heading-order','language-of-page'];

    it('same 8 ruleIds have plainLanguage in both sv and en', () => {
        for (const id of PLAIN_IDS) {
            const sv = (rulesSv as any[]).find((r: {ruleId: string}) => r.ruleId === id);
            const en = (rulesEn as any[]).find((r: {ruleId: string}) => r.ruleId === id);
            expect(sv?.plainLanguage, `sv missing plainLanguage for ${id}`).toBeDefined();
            expect(en?.plainLanguage, `en missing plainLanguage for ${id}`).toBeDefined();
            expect(sv?.plainLanguage?.impactLevel, `impactLevel mismatch for ${id}`)
                .toBe(en?.plainLanguage?.impactLevel);
        }
    });
});
```

[ASSUMED — pattern follows existing test style]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Swedish-keyed PlainCopy (vadHander, vemPaverkas) in engine | English-keyed PlainLanguageCopy in standards | D-01 decision 2026-06-11 | Consistent with existing English-keyed standards data; no new locale infrastructure |
| getPlainLanguageCopy() helper + RULES_BY_LANG in standards | Texts read from report.plainLanguage set at enrichment time | D-03 decision 2026-06-11 | Single lookup, no secondary calls at render time |
| Hardcoded Swedish in renderer | All chrome via t() | D-01 decision 2026-06-11 | Works for --plain --lang en; future-proof for language support |
| sälj-CTA as closing ("Hör av dig...") | Neutral closing per D-06 | D-06 decision 2026-06-11 | Appropriate for public npm tool used by multiple agencies |

**Deprecated/scrapped:**
- `getPlainLanguageCopy(ruleId, lang)`: proposed in klarsprak-cli-implementation.md, scrapped in CONTEXT.md
- `RULES_BY_LANG` constant: same document, same fate
- Swedish-keyed `PlainCopy` interface from klarsprakslager-engine.md: scrapped in CONTEXT.md
- `"ruleId": "image-alt"` example: wrong; correct id is `"alt-text"`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | i18n key namespace `plain.*` is appropriate (e.g., `plain.what_happens`) | Architecture Patterns / Pattern 6 | Low — this is at Claude's discretion per CONTEXT.md; any namespace that compiles with LocaleData = typeof en is valid |
| A2 | The 7 non-sv/en locale files (de, fr, es, nl, fi, dk, no) can receive English values verbatim (copy of en.json plain.* values) | Architecture Patterns / Pattern 6 | Low — explicitly stated in D-01 |
| A3 | Exact position of type cast block in cli/index.ts is lines 98-120 | Standard Stack / Pattern 4 | Low — the cast block is clearly visible in source; audience field insertion is straightforward |
| A4 | Plain HTML template in html-template.ts is added as an inline branch (`if (audience === 'plain') { return plainTemplate; }`) rather than a separate file | Architecture Patterns | Low — both approaches compile; inline branch is consistent with how the developer template works |

**If this table is near-empty:** All architecturally significant claims are verified by direct source read. The assumptions are all at Claude's discretion per CONTEXT.md.

---

## Open Questions

1. **Exact wording of English texts (D-09)**
   - What we know: Tonregler apply to English too (you-address, business-first, no dashes, no invented stats)
   - What's unclear: The 8 English texts do not exist yet; Claude will draft them during execution
   - Recommendation: Planner should make English text authoring a distinct task; Karin reviews via the johancask.com test scan

2. **Exact wording of neutral closing (D-06 + D-09)**
   - What we know: Must not be "Hör av dig"; must not contain dashes; must convey priority ordering
   - What's unclear: Exact phrasing — "Börja uppifrån. Punkterna högst upp kostar dig mest kunder." is a D-06 example, not finalized
   - Recommendation: Claude writes a candidate in the implementation task; it goes through the D-09 Karin grind with the johancask.com PDF

3. **Tom-state wording (D-09)**
   - What we know: Must not be "Snyggt jobbat" (too casual?) — the CLI doc uses this; tonreglerna prefer "igenkänning"
   - What's unclear: Final phrasing
   - Recommendation: Same D-09 grind path; "Vi hittade inga hinder den här gången." is a good starting point

---

## Environment Availability

No new external tools required. All dependencies are already installed in both packages.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| chalk | engine terminal renderer | Yes | ^5.3.0 (in engine deps) | — |
| vitest | D-10 guards | Yes | ^4.0.16 (both devDeps) | — |
| tsup | build | Yes | ^8.3.5 (both devDeps) | — |
| node (for JSON edits) | Writing rules.sv.json / rules.en.json | Yes | 22.15.0 | — |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.16 |
| Config file | vitest.config.ts (both packages, existing) |
| Quick run command (standards) | `npm run test:ci -w @holmdigital/standards` |
| Quick run command (engine) | `npm run test:ci -w @holmdigital/engine` |
| Full verify (standards) | `npm run verify -w @holmdigital/standards` |
| Full verify (engine) | `npm run verify -w @holmdigital/engine` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLAIN-01 | `PlainLanguageCopy` interface + `BusinessImpactLevel` type compile correctly | type-check | `npm run typecheck -w @holmdigital/standards` | No change to existing test file — tsc covers this |
| PLAIN-01 | `plainLanguage?` on `ConvergenceRule` and `RegulatoryReport` | type-check | `npm run typecheck -w @holmdigital/standards` | — |
| PLAIN-02 | `generateRegulatoryReport('form-labels','sv')` returns `plainLanguage` | unit | `npm run test:ci -w @holmdigital/standards` | ❌ Wave 0 gap in index.test.ts |
| PLAIN-02 | EN fallback: `generateRegulatoryReport('form-labels','de')` returns EN plainLanguage | unit | `npm run test:ci -w @holmdigital/standards` | ❌ Wave 0 gap in index.test.ts |
| PLAIN-03 | renderPlainReport: sorted by impactLevel rank (stoppar-kop > hindrar > forsamrar > putsning) | unit | `npm run test:ci -w @holmdigital/engine` | ❌ Wave 0: plain-report.test.ts does not exist |
| PLAIN-03 | renderPlainReport: fallback to remediation.description when plainLanguage undefined | unit | `npm run test:ci -w @holmdigital/engine` | ❌ Wave 0: plain-report.test.ts |
| PLAIN-03 | renderPlainReport: tom-state output when result.reports.length === 0 | unit | `npm run test:ci -w @holmdigital/engine` | ❌ Wave 0: plain-report.test.ts |
| PLAIN-06 (D-10.1) | Encoding guard: no Ã in sv plainLanguage texts | unit | `npm run test:ci -w @holmdigital/standards` | ❌ Wave 0 gap in index.test.ts |
| PLAIN-06 (D-10.2) | Tone lint: no — / – / % in sv or en plainLanguage texts | unit | `npm run test:ci -w @holmdigital/standards` | ❌ Wave 0 gap in index.test.ts |
| PLAIN-06 (D-10.3) | Parity: same 8 ruleIds + identical impactLevel in sv and en | unit | `npm run test:ci -w @holmdigital/standards` | ❌ Wave 0 gap in index.test.ts |
| PLAIN-04 | CLI `--plain` sets audience='plain'; `--audience plain` equivalent | integration (manual-only) | `npx hd-a11y-scan https://johancask.com --plain` | Manual — D-09 Karin grind |
| PLAIN-05 | `--plain --pdf` produces klarspråks-PDF without score/WCAG tables | integration (manual-only) | `npx hd-a11y-scan https://johancask.com --plain --pdf karin.pdf` | Manual — D-09 Karin grind |

### Sampling Rate

- **Per task commit:** `npm run test:ci -w @holmdigital/standards` (for standards tasks); `npm run test:ci -w @holmdigital/engine` (for engine tasks)
- **Per wave merge:** `npm run verify -w @holmdigital/standards && npm run verify -w @holmdigital/engine`
- **Phase gate:** Full verify green in both packages before `/gsd:verify-work`; manual johancask.com scan confirms terminal + PDF output

### Wave 0 Gaps

- [ ] `packages/standards/src/index.test.ts` — add D-10.1 encoding guard, D-10.2 tone lint, D-10.3 parity, PLAIN-02 enrichment assertions
- [ ] `packages/engine/src/reporting/plain-report.test.ts` — new file covering D-10.4 renderer structure (sort order, badge mapping, fallback, tom-state)
- [ ] `packages/engine/src/reporting/plain-report.ts` — new file (renderer itself)

---

## Security Domain

This phase adds no authentication, user input handling, network calls, or cryptographic operations. The plain-report renderer reads from an already-validated `ScanResult` object. The only data written to disk is the optional PDF file at a user-specified path — no different from the existing `--pdf` mode.

ASVS categories:

| ASVS Category | Applies | Rationale |
|---------------|---------|-----------|
| V2 Authentication | No | No auth involved |
| V3 Session Management | No | CLI tool, no sessions |
| V4 Access Control | No | No access control |
| V5 Input Validation | No | ruleId values come from the internal scan result; path for PDF is user-controlled but handled by existing `generatePDF` |
| V6 Cryptography | No | No crypto |

---

## Project Constraints (from CLAUDE.md)

| Directive | How It Applies to Phase 34 |
|-----------|---------------------------|
| TypeScript strict mode enabled | All new types must be strictly typed; no `as any` in PlainLanguageCopy or BusinessImpactLevel |
| Use `interface` for public APIs, `type` for unions | `PlainLanguageCopy` is `interface`; `BusinessImpactLevel` is `type` |
| Always put `types` FIRST in exports conditions | No new exports paths added; existing path unchanged |
| Zero-warning lint state (PUB-09) | plain-report.ts and all modified files must pass `eslint src` with zero warnings; no `as any` escape hatches |
| `prepublishOnly` chains build+lint+typecheck+check:exports+check:types+test:ci | All D-10 vitest guards must pass before the changesets trigger `npm publish` |
| No `as any` — use `as unknown as T` for fixture widening, `// @ts-expect-error` for negative-path tests | D-10.3 parity test casts JSON imports as `any[]`; change to `ConvergenceRule[]` after PLAIN-01 types land |
| Minor-release via changesets | standards: minor bump (new public API: `PlainLanguageCopy`, `BusinessImpactLevel`); engine: minor bump (new CLI flags + renderer); components: no bump |
| Current versions: engine 2.5.6 / standards 2.6.1 | Next: standards 2.7.0, engine 2.6.0 (or per changeset calculation) |

Note: The reference doc `daniel-engine-klarsprak-2026-06-05.md` cites engine 2.5.5 and standards 2.5.7. Actual current versions confirmed by reading package.json files: engine 2.5.6, standards 2.6.1. Post-phase minor bumps will be: standards 2.7.0, engine 2.6.0.

---

## Sources

### Primary (HIGH confidence — direct source read)

- `packages/standards/src/types.ts` — verified complete absence of `PlainLanguageCopy`/`BusinessImpactLevel`; confirmed `ConvergenceRule` and `RegulatoryReport` insertion points
- `packages/standards/src/index.ts` — verified `generateRegulatoryReport` explicit-field pattern (lines 274-289); confirmed `getData()` caching via module-level imports; confirmed `getConvergenceRule` is safe for EN fallback
- `packages/engine/src/core/regulatory-scanner.ts` — verified `enrichResults` `{...report}` spread (lines 318-332); confirmed `plainLanguage` will flow through with zero engine changes
- `packages/engine/src/cli/index.ts` — verified print chain structure (lines 203-241); confirmed `t()` already used for chrome; confirmed `generateReportHTML` call at line 174
- `packages/engine/src/i18n/index.ts` — verified `LocaleData = typeof en` pattern; confirmed 9 locale files (en, sv, de, fr, es, nl, fi, dk, no) + aliases
- `packages/engine/src/locales/en.json` and `sv.json` — verified existing key structure (`cli.*`, `report.*`); `plain.*` namespace is new
- `packages/engine/src/reporting/html-template.ts` — verified `generateReportHTML(result, sector)` signature at line 27; confirmed third param addition is safe
- `packages/standards/data/rules.sv.json` — confirmed all 8 target ruleIds present; confirmed no `plainLanguage` yet; confirmed no mojibake in existing remediation text
- `packages/standards/data/rules.en.json` — confirmed all 8 target ruleIds present; confirmed no `plainLanguage` yet; confirmed same diggRisk values as sv
- `packages/standards/schema/convergence-schema.json` — confirmed `plainLanguage` is not in schema; confirmed no AJV enforcement gate exists
- `packages/standards/scripts/` directory listing — confirmed `validate-schema.js` and `validate-data.js` do NOT exist; schema validation is informational only
- `packages/standards/src/index.test.ts` — verified AJV usage only validates national-laws.json; confirmed test file structure for Wave 0 gap additions
- `packages/engine/src/reporting/*.test.ts` glob — confirmed existing reporting test pattern (co-located `.test.ts` files)
- `packages/standards/package.json` — confirmed version 2.6.1; confirmed verify chain
- `packages/engine/package.json` — confirmed version 2.5.6; confirmed verify chain

### Secondary (MEDIUM confidence — cited reference docs)

- `daniel-engine-klarsprak-2026-06-05.md` — authoritative decisions from Karin; architecture constraints
- `klarsprak-cli-implementation.md` — implementation reference for types, CLI coupling, renderer structure
- `klarsprakslager-engine.md` — content source for the 8 texts, tone rules, badge display names, report opening
- `34-CONTEXT.md` — D-01 through D-12 locked decisions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing deps verified in package.json
- Architecture: HIGH — all integration points verified by direct source read
- Types/data: HIGH — insertion points confirmed; schema validation confirmed non-blocking
- i18n key shape: MEDIUM — namespace choice is at Claude's discretion; structure verified from existing locale files
- Pitfalls: HIGH — derived from actual code analysis (e.g., the explicit-field pattern in generateRegulatoryReport is the most likely failure point)
- Test patterns: HIGH — existing test files read; Wave 0 gaps accurately listed

**Research date:** 2026-06-11
**Valid until:** 2026-07-11 (stable codebase; only changes are the ones this phase introduces)
