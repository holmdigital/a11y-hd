# Architecture Research

**Domain:** Multi-jurisdiction accessibility compliance — AU jurisdiction extension
**Researched:** 2026-03-27
**Confidence:** HIGH (existing codebase read directly; AU regulatory facts verified via official/current sources)

## Context: Subsequent Milestone

This file documents the architecture for adding Australia (AU) as a supported jurisdiction to an existing monorepo that already covers 16 country codes (SE, NO, DK, FI, NL, DE, FR, ES, IE, IT, PT, PL, GB, US, CA, EU). The question is: what to extend vs what to create, and in what order.

---

## Existing Architecture Snapshot

```
packages/
├── standards/                          # @holmdigital/standards  (no deps on other packages)
│   ├── src/
│   │   ├── types.ts                    # Country union, NationalLaw, ENFORCEMENT_BODIES*
│   │   └── index.ts                    # getEnforcementBody(), getNationalLawByFramework()
│   └── data/
│       └── legal/
│           └── national-laws.json      # Keyed by Country code: {laws: {SE:[...], NO:[...], ...}}
│
├── components/                         # @holmdigital/components  (depends on standards)
│   └── src/AccessibilityStatement/
│       ├── AccessibilityStatement.tsx  # TEMPLATES Record<string, StatementTemplate> (inline)
│       └── locale-chrome.ts           # BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT maps
│
└── engine/                             # @holmdigital/engine  (depends on standards + components)
    └── src/
        ├── i18n/index.ts               # locales map, setLanguage(), t()
        ├── reporting/
        │   ├── statement-generator.ts  # TLD_MAP, EVALUATION_METHOD, STATUS_LABELS; loads JSON templates
        │   └── templates/              # JSON files: en.json, sv.json, en-ca.json, en-gb.json, en-us.json, ...
        └── core/regulatory-scanner.ts  # ScanResult, enrichResults(), legalSummary
```

**Dependency chain (strict, enforced):** standards → components → engine

---

## AU Regulatory Landscape

Australia has two complementary legal instruments for digital accessibility:

### DDA — Disability Discrimination Act 1992
- **Scope:** Both public and private sectors (applies to any organisation offering services to the public)
- **Technical standard:** WCAG 2.2 Level AA (AHRC clarified this as minimum in April 2025)
- **Enforcement body:** Australian Human Rights Commission (AHRC)
- **Mechanism:** Complaint-driven. Complainants file with AHRC; AHRC seeks conciliation. If unresolved, case proceeds to Federal Court / Federal Circuit and Family Court.
- **Sanctions:** No fixed fines. Court can award damages; reputational and legal cost exposure. No maximum cap legislated.
- **Status:** In force since 1992; WCAG 2.2 guideline effective April 2025.
- **Coverage extension (2025):** AHRC guidelines extended obligations to SaaS platforms, AI tools, IoT devices, and mobile apps.

### DTA — Digital Transformation Agency (Digital Experience Policy)
- **Scope:** Australian Government agencies (federal public sector)
- **Technical standard:** WCAG 2.2 Level AA
- **Effective date:** 1 January 2025 (Digital Experience Policy came into force)
- **Enforcement body:** Digital Transformation Agency (DTA)
- **Mechanism:** Policy compliance and audit by DTA; non-binding on private sector but sets government benchmark.
- **Note:** DTA operates under digital.gov.au / stylemanual.gov.au frameworks.

### Key architectural consequence
Unlike EU jurisdictions where WAD = public and EAA = private, Australia uses:
- DDA = both sectors (universal applicability)
- DTA = public sector only (government-specific policy layer on top of DDA)

The existing `euFramework: 'WAD' | 'EAA'` type on `NationalLaw` does not have a direct AU equivalent. The cleanest mapping is:
- DDA → treat as the primary law, `euFramework: 'WAD'` (public), scope `'both'`
- DTA → treat as a sector-specific policy layer, `euFramework: 'WAD'`, scope `'public'`

This mirrors how CA is modelled (AODA with `scope: 'both'`) and GB (PSBAR 2018 public-only) — using WAD as the framework key for non-EU public-sector laws.

---

## Integration Points: What to Extend vs Create

### Package 1: `@holmdigital/standards`

**Extend (modify existing files):**

| File | Change | Detail |
|------|--------|--------|
| `src/types.ts` | Add `'AU'` to `Country` union | Line 14: `Country = 'SE' | ... | 'CA' | 'AU' | 'EU'` |
| `src/index.ts` | Add `AU` entry to `ENFORCEMENT_BODIES` | `AU: 'Australian Human Rights Commission (AHRC)'` |
| `src/index.ts` | Add `AU` entry to `ENFORCEMENT_BODIES_DETAILED` | `AU: { wad: 'Australian Human Rights Commission (AHRC)', eaa: 'Australian Human Rights Commission (AHRC)' }` — same body for both sectors since DDA covers both |
| `data/legal/national-laws.json` | Add `"AU": [...]` key | Two entries: `au-dda` (scope `both`, DDA 1992) and `au-dta` (scope `public`, DTA Digital Experience Policy) |

**Create (new files):** None for standards.

**Key design decision — single enforcement body for both sectors:** Unlike EU countries where WAD (public) and EAA (private) have distinct authorities, AHRC enforces DDA for all sectors. The `ENFORCEMENT_BODIES_DETAILED.AU.wad` and `.eaa` should both be `'Australian Human Rights Commission (AHRC)'`. This is the same pattern used for `GB`, `US`, and `CA` in the existing code.

**Key design decision — `euFramework` field for AU laws:** The `NationalLaw` interface requires `euFramework: LegalFramework` (`'WAD' | 'EAA'`). AU has no EU framework. Use `'WAD'` for both AU entries — this is the established convention for non-EU countries (US uses `'WAD'` for Section 508, CA uses `'WAD'` for AODA). Do NOT extend `LegalFramework` type; that would break the existing EU-framework semantics.

---

### Package 2: `@holmdigital/components`

**Extend (modify existing files):**

| File | Change | Detail |
|------|--------|--------|
| `src/AccessibilityStatement/AccessibilityStatement.tsx` | Add `'en-au'` entry to `TEMPLATES` Record | New inline template entry following the `en-gb`/`en-ca` pattern; references DDA and AHRC |
| `src/AccessibilityStatement/AccessibilityStatement.tsx` | Add `'en-au'` to `supportedLocales` routing | Ensures `country='AU'` routes to the AU template, not the generic `'en'` fallback |
| `src/AccessibilityStatement/locale-chrome.ts` | Add `'en-au'` to `BADGE_LABELS`, `UPDATED_LABEL`, `FOOTER_TEXT` | English strings — identical to `en-gb`/`en-ca` values since AU English matches |

**Create (new files):** None for components.

---

### Package 3: `@holmdigital/engine`

**Extend (modify existing files):**

| File | Change | Detail |
|------|--------|--------|
| `src/reporting/statement-generator.ts` `TLD_MAP` | Add `'au': 'AU'` | Simple TLD `.au` → Country `'AU'`. Also handles `.com.au` (see TLD note below). |
| `src/reporting/statement-generator.ts` `EVALUATION_METHOD` | Add `'en-au'` entry | `'en-au': 'Automated scan via @holmdigital/engine'` |
| `src/reporting/statement-generator.ts` `STATUS_LABELS` | Add `'en-au'` entry | English strings matching other `en-*` variants |
| `src/reporting/statement-generator.ts` `RESPONSE_TIME_DEFAULT` | Add `'en-au'` entry | `'en-au': '2 days'` |
| `src/i18n/index.ts` | Add `'en-au': en` alias | Maps `en-au` locale to English locale data |

**Create (new files):**

| File | Purpose |
|------|---------|
| `src/reporting/templates/en-au.json` | AU-specific statement template with DDA/AHRC references |

**TLD parsing note:** The current parser does `hostname.split('.').pop()`. For `example.com.au`, `pop()` returns `'au'`. A single `'au': 'AU'` entry in `TLD_MAP` correctly handles both `.au` and `.com.au` TLDs. No special case needed.

---

## Data Flow for AU-Specific Paths

### Scan-time AU detection flow

```
CLI receives URL (e.g. https://example.com.au)
    |
statement-generator.ts: TLD parse → 'au' → TLD_MAP['au'] = 'AU'
    |
country = 'AU', sector = 'public' (default)
    |
getEnforcementBody('AU', 'public') → ENFORCEMENT_BODIES_DETAILED.AU.wad = 'AHRC'
    |
getNationalLawByFramework('WAD', 'AU') → au-dda entry from national-laws.json
    |
AccessibilityStatementProps{ country: 'AU', locale: 'en-au', ... }
    |
AccessibilityStatement TEMPLATES['en-au'] renders with AU placeholders
    |
Output: HTML/Markdown statement referencing DDA 1992 + AHRC
```

### Standards package AU data flow

```
national-laws.json["AU"] = [
  { id: "au-dda", law: "DDA", euFramework: "WAD", scope: "both", enforcement: { authority: "au-ahrc" } },
  { id: "au-dta", law: "DTA Digital Experience Policy", euFramework: "WAD", scope: "public", ... }
]
    |
getNationalLawByFramework('WAD', 'AU') → returns au-dda (first match, covers both sectors)
    |
getEnforcementBody('AU')          → 'Australian Human Rights Commission (AHRC)'
getEnforcementBody('AU', 'private') → 'Australian Human Rights Commission (AHRC)'  [same — DDA is universal]
```

---

## Component Boundary Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   @holmdigital/standards                     │
│                                                             │
│  types.ts:  Country = ... | 'AU' | 'EU'                    │
│  index.ts:  ENFORCEMENT_BODIES['AU'] = 'AHRC'               │
│             ENFORCEMENT_BODIES_DETAILED['AU'] = {wad,eaa}  │
│  national-laws.json: laws.AU = [au-dda, au-dta]            │
└──────────────────────────────┬──────────────────────────────┘
                               | (consumed by)
┌──────────────────────────────▼──────────────────────────────┐
│                  @holmdigital/components                     │
│                                                             │
│  AccessibilityStatement.tsx:                                │
│    TEMPLATES['en-au'] = { title, intro, sections }         │
│    supportedLocales routing: country='AU' -> 'en-au'       │
│  locale-chrome.ts:                                          │
│    BADGE_LABELS['en-au'], UPDATED_LABEL['en-au'], ...      │
└──────────────────────────────┬──────────────────────────────┘
                               | (consumed by)
┌──────────────────────────────▼──────────────────────────────┐
│                    @holmdigital/engine                       │
│                                                             │
│  i18n/index.ts: locales['en-au'] = en                      │
│  statement-generator.ts:                                    │
│    TLD_MAP['au'] = 'AU'                                    │
│    EVALUATION_METHOD['en-au'] = '...'                      │
│    STATUS_LABELS['en-au'] = { full, partial, ... }        │
│    RESPONSE_TIME_DEFAULT['en-au'] = '2 days'              │
│  templates/en-au.json: DDA/AHRC prose                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Suggested Build Order

The build order follows the package dependency chain. Each phase is a discrete set of changes that can be built and tested independently before moving to the next.

### Phase 1 — Standards (foundation, blocks all other phases)
1. Extend `Country` type: add `'AU'` to union in `types.ts`
2. Add `AU` to `ENFORCEMENT_BODIES` and `ENFORCEMENT_BODIES_DETAILED` in `index.ts`
3. Add `"AU"` key to `national-laws.json` with `au-dda` and `au-dta` entries
4. Run standards tests — verify `getEnforcementBody('AU')` and `getNationalLawByFramework('WAD', 'AU')` return correct values
5. Publish `@holmdigital/standards` patch bump (or advance to components if working in monorepo build)

**Why first:** Components and engine both import `Country` type from standards. If `'AU'` is not in the union, TypeScript will reject it at compile time in downstream packages. This is the single blocking gate.

### Phase 2 — Components (unblocked after Phase 1)
1. Add `'en-au'` template to `TEMPLATES` in `AccessibilityStatement.tsx`
2. Add `'en-au'` to locale routing logic in `AccessibilityStatement.tsx`
3. Add `'en-au'` entries to `BADGE_LABELS`, `UPDATED_LABEL`, `FOOTER_TEXT` in `locale-chrome.ts`
4. Run component tests — verify `country='AU'` renders with DDA/AHRC text, not EU/generic fallback
5. Publish `@holmdigital/components` patch bump

**Why second:** Template prose uses `getEnforcementBody()` from standards. Requires `Country` type to include `'AU'`.

### Phase 3 — Engine (unblocked after Phase 2)
1. Add `'au': 'AU'` to `TLD_MAP` in `statement-generator.ts`
2. Add `'en-au'` to `EVALUATION_METHOD`, `STATUS_LABELS`, `RESPONSE_TIME_DEFAULT`
3. Add `'en-au': en` alias to `i18n/index.ts`
4. Create `src/reporting/templates/en-au.json` with AU-specific prose
5. Run engine tests — verify `.au` TLD detection, statement generation, placeholder exhaustiveness
6. Publish `@holmdigital/engine` patch bump

**Why last:** Engine imports both standards (`Country`, enforcement body functions) and components (`AccessibilityStatement`). Any type error in earlier packages cascades here. Engine also owns the JSON template files which are separate from the component inline templates.

---

## Architectural Patterns

### Pattern 1: Parallel Template Stores (intentional duplication)

**What:** The engine has JSON templates in `src/reporting/templates/*.json`. The component has inline `TEMPLATES` in `AccessibilityStatement.tsx`. Both serve the same locale but are maintained separately.

**Why this exists:** Engine imports components (`AccessibilityStatement`) for server-side rendering via `renderToStaticMarkup`. If components imported engine templates, it would create a circular dependency (engine → components → engine). The duplication is a documented architecture decision.

**AU impact:** AU template content must be authored twice — once as `en-au.json` (engine) and once as a `TEMPLATES['en-au']` entry (component). Keep them in sync manually. This is a known accepted cost in the project.

### Pattern 2: Module-level Lookup Maps

**What:** All locale-keyed data uses `Record<string, T>` module-level constants (`EVALUATION_METHOD`, `STATUS_LABELS`, `BADGE_LABELS`, etc.) rather than switch statements or inline ternaries.

**AU impact:** Every such map must receive an `'en-au'` entry. There are 7 maps across 3 files:
- `statement-generator.ts`: `EVALUATION_METHOD`, `STATUS_LABELS`, `RESPONSE_TIME_DEFAULT`
- `locale-chrome.ts`: `BADGE_LABELS`, `UPDATED_LABEL`, `FOOTER_TEXT`
- `i18n/index.ts`: `locales`

Missing any one causes silent fallback to `'en'`, producing generic rather than AU-specific chrome text.

### Pattern 3: Auto-syncing Tests via Standards Functions

**What:** Engine and component tests call `getEnforcementBody()` and `getNationalLawByFramework()` directly — they do not hardcode expected strings. When law data changes, tests auto-update.

**AU impact:** AU tests must follow the same pattern. Do not hardcode `'Australian Human Rights Commission (AHRC)'` in test assertions — call `getEnforcementBody('AU')` and compare against that. This keeps tests resilient to future name corrections.

### Pattern 4: Sector-aware Enforcement Routing

**What:** `getEnforcementBody(country, sector?)` returns the `wad` body by default and the `eaa` body for `sector='private'`.

**AU impact:** For AU, both `wad` and `eaa` entries in `ENFORCEMENT_BODIES_DETAILED` point to AHRC. This is correct — DDA covers both sectors without a separate private-sector authority. The existing API surface is unchanged; callers passing `sector='private'` for AU get the correct AHRC response without any special-casing.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Creating a New Framework Type for AU

**What people might do:** Add `'DDA'` or `'AU'` to the `LegalFramework` union type (`'WAD' | 'EAA'`) to represent AU-specific frameworks.

**Why it's wrong:** `LegalFramework` is used throughout the codebase to determine WAD vs EAA applicability for EU directives. Adding a third value would require updating every conditional that branches on this type and could break downstream consumers. The existing non-EU countries (US, CA, GB) all use `'WAD'` as a stand-in successfully.

**Do this instead:** Map both AU laws to `euFramework: 'WAD'` in `national-laws.json`. Use the `scope` field (`'both'` vs `'public'`) to distinguish DDA from DTA. This is the established convention.

### Anti-Pattern 2: Adding a `com.au` Special Case to TLD Parsing

**What people might do:** Add `'com.au': 'AU'` as a separate TLD_MAP entry because `.com.au` is the most common Australian commercial TLD.

**Why it's wrong:** The current parser calls `hostname.split('.').pop()` which always extracts the final segment. For `example.com.au`, `pop()` returns `'au'`. Adding `'com.au'` to TLD_MAP would never match because lookup is keyed on the single last segment.

**Do this instead:** A single `'au': 'AU'` entry in TLD_MAP correctly handles both `example.au` and `example.com.au`. No special case needed.

### Anti-Pattern 3: Creating a New `locales/en-au.json` File

**What people might do:** Create `locales/en-au.json` (alongside `en.json`, `sv.json`) with AU-specific i18n strings for the engine's `t()` translation system.

**Why it's wrong:** The engine's `i18n/index.ts` translation system covers scan output UI strings — not statement templates. All existing `en-*` variants (en-gb, en-us, en-ca) alias to the base `en` locale data. AU English does not require distinct scan output strings.

**Do this instead:** Add `'en-au': en` to the `locales` map in `i18n/index.ts`, aliasing to the base English. Reserve locale JSON files for languages requiring genuine translation (sv, de, fr, etc.).

### Anti-Pattern 4: Aliasing `en-au` Template Directly to Generic `en`

**What people might do:** Use `TEMPLATES['en-au'] = TEMPLATES['en']` in the component and `en.json` as the engine template for AU.

**Why it's wrong:** The generic `en` template references `{<national_law>}` as a dynamic placeholder. AU needs explicit DDA/AHRC references in static prose (intro text, enforcement section) to produce legally accurate statements — the same reason `en-gb`, `en-us`, and `en-ca` each have distinct templates despite being English.

**Do this instead:** Author a distinct `TEMPLATES['en-au']` and `en-au.json` that references DDA 1992 and AHRC by name in appropriate sections.

---

## Scaling Considerations

This is a configuration-data extension, not a runtime architecture change. Scaling is not a concern for this milestone. The relevant operational consideration is test coverage maintenance:

| Metric | Current | After AU addition (estimated) |
|--------|---------|-------------------------------|
| Total tests | 225 | ~237 |
| Standards tests | 26 | ~28 (+2 AU-specific) |
| Engine tests | 95 | ~100 (+5 AU locale/TLD/template) |
| Component tests | 104 | ~109 (+5 AU render/chrome) |

All new tests should follow the auto-syncing pattern (call standards functions for expected values) to keep the test suite maintainable as more jurisdictions are added.

---

## Sources

- Codebase direct read: `packages/standards/src/types.ts`, `packages/standards/src/index.ts`, `packages/standards/data/legal/national-laws.json` (2026-03-27)
- Codebase direct read: `packages/engine/src/reporting/statement-generator.ts`, `packages/engine/src/i18n/index.ts` (2026-03-27)
- Codebase direct read: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`, `locale-chrome.ts` (2026-03-27)
- [DDA Compliance: Web Accessibility in Australia (2026) — AccessibilityChecker](https://www.accessibilitychecker.org/guides/dda/)
- [Three major accessibility updates in Australia, 2026 — Deque](https://www.deque.com/blog/accessibility-updates-in-australia-in-2026/)
- [Accessibility | Digital Transformation Agency](https://www.dta.gov.au/accessibility)
- [Criterion 4: Make it accessible | digital.gov.au](https://www.digital.gov.au/policy/digital-experience/digital-inclusion-standard/dis-criterion-4-make-it-accessible)
- [Australia's accessibility laws — Deque APAC](https://www.deque.com/apac-digital-accessibility-laws/australia/)
- [Disability Discrimination Act 1992 — Federal Register of Legislation](https://www.legislation.gov.au/Details/C2018C00125)

---

*Architecture research for: AU jurisdiction integration into @holmdigital accessibility monorepo*
*Researched: 2026-03-27*
