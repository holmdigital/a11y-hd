# Project Research Summary

**Project:** @holmdigital accessibility monorepo — Australian (AU) jurisdiction support (v0.5)
**Domain:** Multi-jurisdiction accessibility compliance tooling — configuration-data extension
**Researched:** 2026-03-27
**Confidence:** HIGH

## Executive Summary

Adding Australia as a first-class jurisdiction to the HolmDigital accessibility monorepo is a well-scoped, data-driven extension with no new runtime architecture required. The existing monorepo already supports 16 country codes across EU, UK, US, and Canada using a strict three-package dependency chain (standards → components → engine). AU fits this pattern cleanly: add law data to `@holmdigital/standards`, wire locale chrome in `@holmdigital/components`, and add TLD detection plus a statement template to `@holmdigital/engine`. The total scope is approximately 13 file changes across the three packages, with one new file (`en-au.json`).

The Australian legal framework has one meaningful structural difference from all existing jurisdictions: the Disability Discrimination Act 1992 (DDA) applies to both public and private sectors under a single enforcement body (the AHRC), rather than the WAD/EAA split used for EU countries. There is no mandatory accessibility statement requirement under the DDA or the DTA Digital Experience Policy — statements are voluntary best practice. This changes how the `en-au` template must be worded and how enforcement body data must be modelled. Getting this wrong produces legally misleading output for Australian clients.

The highest-risk decision in this milestone is how to represent the AU legal framework within the existing `LegalFramework = 'WAD' | 'EAA'` type. STACK.md recommends extending the type to include `'DDA'`; ARCHITECTURE.md recommends reusing `'WAD'` for backwards compatibility. The STACK recommendation is correct: reusing `'WAD'` for AU data would cause statement templates to falsely reference the EU Web Accessibility Directive for Australian clients. The type must be extended to `'DDA'` before any AU data is written. This must be a team-confirmed decision before Phase 1 begins.

## Key Findings

### Recommended Stack

No new technologies are required for this milestone. The existing stack (TypeScript 5.7, tsup, Vitest 4, axe-core, npm workspaces) handles AU jurisdiction support entirely through data and configuration changes. The only additions are one new JSON template file (`en-au.json`), new keys in existing TypeScript maps, and new entries in `national-laws.json`.

**Core technologies (existing, unchanged):**
- TypeScript 5.7 — type union extension (`LegalFramework`, `Country`) enforces completeness at compile time; adding `'AU'` to `Country` causes compile-time errors on every `Record<Country, ...>` missing the key
- tsup — no build script changes needed; package dependency order already enforces build sequence
- Vitest 4 — existing test infrastructure covers AU additions with approximately 12 new test cases
- npm workspaces — monorepo build order (standards → components → engine) is the correct implementation sequence

**AU-specific data additions:**
- `LegalFramework`: extend union to `'WAD' | 'EAA' | 'DDA'` — non-breaking additive change
- `Country`: add `'AU'` to union — triggers compile-time completeness checking across all `Record<Country, ...>` maps
- `national-laws.json`: two AU law entries (`au-dda` scope both, `au-dta` scope public)
- `TLD_MAP`: add `'au': 'AU'` — the existing `hostname.split('.').pop()` approach correctly handles `.au`, `.com.au`, `.gov.au` without special-casing

### Expected Features

All v0.5 features are P1 (AU jurisdiction is unusable without any of them). There are no optional v0.5 features.

**Must have (table stakes — v0.5):**
- DDA + DTA in `national-laws.json` — legal basis for all AU output
- AHRC in `ENFORCEMENT_BODIES` and `ENFORCEMENT_BODIES_DETAILED` — correct enforcement reference for both sectors
- `.au` / `.com.au` TLD detection — auto-detects country without requiring `--country` flag
- `en-au` engine JSON statement template — legally accurate AU-specific prose referencing DDA and AHRC
- `en-au` component inline template + locale routing — component renders AU data, not EU fallback
- `en-au` locale-chrome entries (BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT) — correct badge text
- AU sector wiring: both public and private sector route to AHRC — DDA has no WAD/EAA split
- Tests for all AU additions (approximately 12 new cases)

**Should have (differentiators — v0.5.x after v0.5 is stable):**
- DTA Digital Experience Policy annotation for `.gov.au` domains — government-specific compliance note
- AS EN 301 549 procurement reference — value for NSW/VIC/QLD government procurement clients
- AHRC complaint pathway URL in statement contact section — actionable guidance for AU users

**Defer (v1.0+):**
- State/territory-level policy annotations (Victoria WCAG 2.1 AA mandate, NSW AS EN 301 549) — no state-specific TLDs; requires explicit metadata beyond TLD detection
- Mobile app compliance notes (AHRC 2025 scope expansion) — requires architectural work outside web scanning
- WCAG 2.2 vs 2.1 delta highlighting for AU clients migrating from older guidance

### Architecture Approach

The implementation follows the established jurisdiction extension pattern used for GB, US, and CA. All changes flow through the package dependency chain in order. The only architectural decision unique to AU is the `LegalFramework` type extension and the deliberate choice to route both AU sectors to AHRC rather than splitting by WAD/EAA semantics.

**Major components and their AU changes:**
1. `@holmdigital/standards` — add `'AU'` to `Country` union, `'DDA'` to `LegalFramework`, two AU law entries in `national-laws.json`, AHRC in both enforcement body maps
2. `@holmdigital/components` — add `TEMPLATES['en-au']` inline template, `supportedLocales` routing entry, three locale-chrome map entries
3. `@holmdigital/engine` — add `TLD_MAP['au']`, four locale map entries, i18n alias, and create `en-au.json` statement template

**Key pattern — parallel template stores:** The engine owns JSON templates; the component owns inline templates. Both must be authored separately for `en-au`. This is intentional design to avoid circular dependency and is the main duplication cost of this milestone.

**Key pattern — atomic Country type update:** Adding `'AU'` to the `Country` union must be committed simultaneously with all `Record<Country, ...>` updates in the same package, or the TypeScript build breaks mid-commit.

**Key pattern — auto-syncing tests:** Tests must call `getEnforcementBody('AU')` and `getNationalLawByFramework(...)` for expected values rather than hardcoding strings. This keeps assertions resilient to future name corrections.

### Critical Pitfalls

1. **`LegalFramework` type reused incorrectly for AU** — Storing AU laws with `euFramework: 'WAD'` causes statement templates to reference the EU Web Accessibility Directive for Australian clients. Extend `LegalFramework` to include `'DDA'` before writing any AU data. This is the single most consequential decision in the milestone and must be resolved before Phase 1 implementation begins.

2. **DTA modelled as EAA equivalent for AU public sector** — Setting `ENFORCEMENT_BODIES_DETAILED.AU.eaa = 'DTA'` causes private-sector AU statements to wrongly name the DTA as enforcement body. DTA only governs federal government agencies and does not accept complaints. Both `wad` and `eaa` fields must point to AHRC.

3. **Statement template copied from EU/UK/CA without AU review** — Existing templates contain WAD-specific structures: "disproportionate burden" exemption, "monitoring body" references, mandatory statement framing. AU has none of these. The `en-au` template must be authored deliberately with complaint-based enforcement language, not adapted from `en-ca.json` or `en-gb.json`.

4. **`diggRisk` label visible in AU CLI output** — The `holmdigitalInsight.diggRisk` field renders "DIGG Risk" in output. DIGG is the Swedish Agency for Digital Government; this label is meaningless and professionally damaging for AU clients. The `en-au` i18n strings must override the display label to "Risk level".

5. **Country type and Record maps updated non-atomically** — Adding `'AU'` to the `Country` union without simultaneously updating `ENFORCEMENT_BODIES` and `ENFORCEMENT_BODIES_DETAILED` breaks the TypeScript build. All three must land in a single commit in `packages/standards`.

## Implications for Roadmap

Based on research, the implementation must follow the strict package dependency chain. There are three natural phases corresponding to the three packages, with a fourth phase for verification.

### Phase 1: Standards Foundation
**Rationale:** The `Country` and `LegalFramework` type unions in `@holmdigital/standards` gate everything downstream. TypeScript will reject AU references in components and engine until `'AU'` and `'DDA'` are present. This is the single blocking dependency for all subsequent work.
**Delivers:** Type-safe AU country code, `'DDA'` in the `LegalFramework` union, DDA + DTA law entries in `national-laws.json`, AHRC enforcement body in both lookup maps, compile-time verification that no `Record<Country>` map was missed.
**Addresses:** AU-LAWS-1, AU-ENFORCEMENT-1, AU-SECTOR-1 (all P1 features)
**Avoids:** Pitfall 2 (`LegalFramework` type wrong for AU), Pitfall 3 (DTA incorrectly as EAA body), Pitfall 6 (`Country` type update non-atomic), Pitfall 8 (sector model wrong for AU)

### Phase 2: Component Locale Wiring
**Rationale:** Component changes require `Country` type to include `'AU'` (Phase 1). Components can then be updated independently of engine changes. Component changes are primarily additive map entries — lower complexity than the engine template.
**Delivers:** `AccessibilityStatement` renders correctly for `country='AU'` with DDA/AHRC references and correct locale chrome (badges, labels, footer). No EU/generic fallback for AU sites.
**Addresses:** AU-COMPONENT-1, AU-CHROME-1 (P1 features)
**Avoids:** Pitfall 4 (WAD mandatory template structure) — component template must use complaint-based framing rather than enforcement-procedure framing

### Phase 3: Engine TLD Detection and Statement Template
**Rationale:** Engine depends on both standards and components. TLD detection, locale maps, and the `en-au.json` statement template are all engine-layer concerns. The `en-au.json` template is the most user-visible deliverable and requires the most careful authoring.
**Delivers:** Automatic AU detection for `.au`/`.com.au` URLs, correct `en-au` locale maps (EVALUATION_METHOD, STATUS_LABELS, RESPONSE_TIME_DEFAULT, RESPONSE_TIME_DEFAULT), and a legally accurate AU accessibility statement template referencing DDA 1992, AHRC, and WCAG 2.2 AA.
**Addresses:** AU-TLD-1, AU-TEMPLATE-1 (P1 features)
**Avoids:** Pitfall 1 (TLD drops .com.au — add comment documenting pop() assumption), Pitfall 4 (WAD-style template prose), Pitfall 5 (diggRisk label in AU i18n output), Pitfall 7 (getNationalLawByFramework null for AU)

### Phase 4: Test Coverage and Verification
**Rationale:** Tests must run after all three packages are updated to verify end-to-end correctness. The "looks done but isn't" checklist from PITFALLS.md defines the minimum verification surface.
**Delivers:** Approximately 12 new test cases covering TLD detection (`.au` and `.com.au`), enforcement body routing (both sectors), law data retrieval, statement generation, and component rendering for `country='AU'`. Regression verification that existing 225 tests still pass.
**Addresses:** AU-TESTS-1 (P1 feature)
**Avoids:** Silent regressions from the `Country` type union expansion

### Phase Ordering Rationale

- Standards must come first because `Country` and `LegalFramework` type unions are imported by both downstream packages. Any AU reference in components or engine without the type update causes a build failure at compile time.
- Components come before engine because engine imports `AccessibilityStatement` for server-side rendering. Unstable component types cascade to engine test failures.
- The `en-au.json` engine template is the highest-risk deliverable and benefits from having the component template (`TEMPLATES['en-au']`) written first as a prose consistency reference.
- Tests are written alongside each phase as unit tests, with a final end-to-end integration pass in Phase 4.

### Research Flags

Phases with well-documented patterns — no additional research needed:
- **Phase 1:** `Country`/`LegalFramework` type extension and `national-laws.json` additions follow established patterns from GB, US, CA. Direct codebase read confirms the exact lines to change.
- **Phase 2:** Component locale wiring is mechanical map-entry work. The `en-gb`/`en-us`/`en-ca` templates are direct models.
- **Phase 4:** Test patterns are already established; the auto-syncing pattern (call standards functions rather than hardcoding strings) is documented and verified in ARCHITECTURE.md.

Phases requiring careful authoring (not additional research, but deliberate divergence from existing templates):
- **Phase 3 (en-au.json prose):** The legal prose for the AU statement template does not have a direct existing model. The DDA complaint-based enforcement structure, absence of mandatory statement requirements, and absence of "disproportionate burden" exemption all require deliberate divergence from `en-ca.json`/`en-gb.json`. The draft prose in STACK.md is a verified starting point but should be reviewed by an AU-familiar legal practitioner before first production use.
- **Phase 3 (diggRisk label):** The exact i18n key for the risk-level column label was not verified during research. The Phase 3 implementer must locate the key in `packages/engine/src/locales/en.json` before adding the `en-au` override.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new technologies; all changes are type/data additions within the established TypeScript monorepo. Confirmed by direct codebase read of all affected files. |
| Features | HIGH | AU legal framework verified against AHRC official site, DTA official site, primary DDA legislation, W3C WAI Australia policy index, and Standards Australia. Feature scope is well-bounded. |
| Architecture | HIGH | All integration points identified by direct source read. Build order is determined by existing package dependency declarations and TypeScript project references. |
| Pitfalls | HIGH | Critical pitfalls are grounded in direct codebase analysis. Legal pitfalls (DDA scope, AHRC vs DTA distinction, no mandatory statement requirement) confirmed by multiple official sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **`LegalFramework` type decision requires team alignment before implementation starts:** STACK.md recommends extending to `'DDA'`; ARCHITECTURE.md recommends reusing `'WAD'` as an existing convention. These are irreconcilable. The recommended choice is `'DDA'` (legally correct and non-breaking); the `'WAD'` option produces misleading output and is rejected. The team must confirm this before Phase 1 begins to avoid re-work.
- **`en-au` template prose legal review:** The AHRC-specific language in the `en-au.json` enforcement section and the characterisation of accessibility statements as voluntary (not mandatory) under AU law should be confirmed by an AU legal practitioner before external release. AHRC's complaint URL and process are verified from official sources, but statement framing nuances carry reputational risk.
- **`australianInterpretation` field drift in rule files:** PITFALLS.md flags that `rules.en-au.json` will diverge from `rules.en.json` over time without an explicit maintenance procedure. A rule count parity test must be added in Phase 4, and the diff-and-apply procedure should be documented when `rules.en.json` is updated.
- **`diggRisk` display label i18n key path not verified:** The exact key name in `packages/engine/src/locales/en.json` for the risk-level column label was not confirmed during research. The Phase 3 implementer must locate it before authoring the `en-au` locale override.

## Sources

### Primary (HIGH confidence)
- Direct codebase read: `packages/standards/src/types.ts`, `packages/standards/src/index.ts`, `packages/standards/data/legal/national-laws.json`
- Direct codebase read: `packages/engine/src/reporting/statement-generator.ts`, `packages/engine/src/i18n/index.ts`, `packages/engine/src/reporting/templates/en-ca.json`
- Direct codebase read: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`, `locale-chrome.ts`
- [Australian Human Rights Commission — DDA complaints](https://humanrights.gov.au/complaints/complaints/complaints-under-disability-discrimination-act)
- [DTA — Digital Experience Policy](https://www.dta.gov.au/articles/digital-experience-policy-and-standards-now-live-digitalgovau)
- [digital.gov.au — Digital Access Standard](https://www.digital.gov.au/policy/digital-experience/digital-access-standard)
- [Disability Discrimination Act 1992 — Federal Register of Legislation](https://www.legislation.gov.au/Details/C2016C00763)
- [Standards Australia — AS EN 301 549:2024](https://store.standards.org.au/product/AS-EN-301-549-2024)
- [W3C WAI — Australia Policy](https://www.w3.org/WAI/policies/australia/)

### Secondary (MEDIUM confidence)
- [Deque — Three major accessibility updates in Australia, 2026](https://www.deque.com/blog/accessibility-updates-in-australia-in-2026/) — WCAG 2.2 AA guidance, AHRC April 2025 announcement
- [Deque — The 2025 AHRC accessibility guidelines](https://www.deque.com/blog/the-2025-ahrc-accessibility-guidelines-whats-new-and-why-it-matters/) — extended scope (SaaS, AI, IoT, mobile)
- [OZeWAI — Three major accessibility updates in Australia](https://ozewai.org/blog/standards/three-major-accessibility-updates-in-australia/) — corroborates Deque analysis
- [Intopia — EN 301 549: What it means for Australia](https://intopia.digital/articles/en-301-549-australia/) — AS EN 301 549:2024 procurement context

### Tertiary (LOW confidence)
- [iconagency.com.au — Australian Government website accessibility in 2025](https://iconagency.com.au/news/2025-10-21-australian-government-website-accessibility-2025-dss-wcag-22-and-multilingual) — DTA policy coverage, needs verification against official sources
- [.au Wikipedia](https://en.wikipedia.org/wiki/.au) — AU domain structure; used to verify TLD parser behaviour (all AU domains end in 'au')

---
*Research completed: 2026-03-27*
*Ready for roadmap: yes*
