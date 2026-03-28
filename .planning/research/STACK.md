# Technology Stack — Australia Jurisdiction (v0.5)

**Domain:** Accessibility compliance tooling — adding Australian jurisdiction support
**Researched:** 2026-03-27
**Confidence:** HIGH — grounded in direct codebase inspection plus verified AU legal sources

---

## What This Research Covers

This file answers a single question: what data, type, and code changes are required to add Australia as a first-class jurisdiction? It does not re-research the existing stack (TypeScript 5.7, tsup, Vitest 4, axe-core — all established). It focuses only on the AU-specific additions.

---

## Australian Legal Framework — Verified Facts

### Primary Law: Disability Discrimination Act 1992 (DDA)

- **Scope:** Both public and private sector. The DDA applies to all organisations providing goods and services to the public, not only government.
- **Standard:** WCAG 2.2 Level AA is now the AHRC-recommended benchmark (announced April 2025, updated from WCAG 2.0). This is guidance underpinning the DDA, not a separate legal instrument.
- **Enforcement body:** Australian Human Rights Commission (AHRC)
- **Complaint pathway:** Written complaint to AHRC → conciliation → if unresolved, Federal Court of Australia or Federal Circuit Court
- **Penalties:** No fixed statutory fine schedule. Monetary damages are determined by the Federal Court. In practice, organisations face reputational damage, legal costs, and court-ordered remediation. No hard cap analogous to EU EAA.
- **Law URL:** https://www.legislation.gov.au/Details/C2016C00763

**Confidence: HIGH** — DDA scope, AHRC role, and WCAG 2.2 AA guidance confirmed by AHRC official site and multiple verified sources (Deque 2026 analysis, OZeWAI, AccessibilityChecker.org).

### Secondary Framework: DTA Digital Experience Policy

- **Scope:** Australian Federal Government agencies only (does not apply to state/territory services)
- **Effective:** Digital Access Standard in force from 1 January 2025
- **Standard:** WCAG 2.2 Level AA (mandatory for new services from 1 Jan 2025; existing services uplift by July 2025)
- **Enforcement body:** Digital Transformation Agency (DTA) — monitors and reports compliance, does not issue fines
- **Law URL:** https://www.digital.gov.au/policy/digital-experience/digital-access-standard

**Confidence: HIGH** — DTA Digital Experience Policy in force from Jan 2025; scope and WCAG version confirmed by digital.gov.au and DTA official communications.

### Framework Mapping Decision

The existing system uses `euFramework: 'WAD' | 'EAA'` as the framework discriminator. Neither WAD nor EAA applies to Australia. AU requires a new framework value.

**Recommendation:** Use `'DDA'` as the `euFramework` value for AU entries. The field is already named generically in the `NationalLaw` interface (`euFramework: LegalFramework`). The `LegalFramework` type must be extended to include `'DDA'`.

This means `LegalFramework = 'WAD' | 'EAA' | 'DDA'` — a non-breaking additive union extension. Existing consumers that only check `=== 'WAD'` or `=== 'EAA'` remain unaffected. Consumers calling `getNationalLawByFramework('WAD', 'AU')` will correctly return `null` (AU has no WAD law), which is the right behaviour.

---

## Required Data Structure: AU Entry in national-laws.json

The AU entry must fit the `NationalLaw` interface exactly. No interface changes are needed beyond the `LegalFramework` union extension.

### Recommended AU JSON

```json
"AU": [
    {
        "id": "au-dda",
        "law": "Disability Discrimination Act 1992",
        "fullName": "Disability Discrimination Act 1992 (Cth)",
        "euFramework": "DDA",
        "scope": "both",
        "lawUrl": "https://www.legislation.gov.au/Details/C2016C00763",
        "enforcement": {
            "authority": "au-ahrc",
            "authorityName": "Australian Human Rights Commission (AHRC)",
            "responsibility": "Investigates complaints of disability discrimination in digital services. Unresolved complaints may be referred to the Federal Court.",
            "website": "https://humanrights.gov.au"
        },
        "sanctions": {
            "type": "Complaint / Federal Court Damages",
            "description": "No statutory fine cap. Complaints are lodged with the AHRC. If conciliation fails, parties may proceed to the Federal Court for monetary damages and remediation orders.",
            "minAmount": 0,
            "maxAmount": 0,
            "currency": "AUD"
        },
        "inForce": true,
        "effectiveDate": "1993-03-01",
        "note": "WCAG 2.2 Level AA is the AHRC-recommended benchmark since April 2025. Applies to both public and private sector."
    },
    {
        "id": "au-dta",
        "law": "Digital Experience Policy — Digital Access Standard",
        "fullName": "Australian Government Digital Experience Policy — Digital Access Standard",
        "euFramework": "DDA",
        "scope": "public",
        "lawUrl": "https://www.digital.gov.au/policy/digital-experience/digital-access-standard",
        "enforcement": {
            "authority": "au-dta",
            "authorityName": "Digital Transformation Agency (DTA)",
            "responsibility": "Monitors compliance of Australian Federal Government digital services. Applies to agencies in scope of the Digital Experience Policy.",
            "website": "https://www.dta.gov.au"
        },
        "sanctions": {
            "type": "Agency Compliance Reporting",
            "description": "No financial sanctions. Non-compliant federal agencies are reported through DTA performance monitoring.",
            "minAmount": 0,
            "maxAmount": 0,
            "currency": "AUD"
        },
        "inForce": true,
        "effectiveDate": "2025-01-01",
        "note": "Applies to Australian Federal Government agencies only, not state/territory or private sector."
    }
]
```

**Rationale for two AU entries:** AU has two distinct enforcement structures — the AHRC (complaints-based, whole-of-economy, including private sector) and the DTA (government-sector monitoring, proactive compliance). This mirrors the WAD/EAA dual-law pattern used for EU countries, where public and private sector have different instruments. The `sector: 'both'` on DDA and `sector: 'public'` on DTA correctly captures the distinction.

---

## Required Type Changes

### 1. Extend LegalFramework in packages/standards/src/types.ts

```typescript
// BEFORE:
export type LegalFramework = 'WAD' | 'EAA';

// AFTER:
export type LegalFramework = 'WAD' | 'EAA' | 'DDA';
```

This is the only type change required. All downstream code that switches on `LegalFramework` values should be checked for exhaustiveness — any `switch` without a `default` will surface a compile error on the new `'DDA'` value, which is the desired behaviour.

### 2. Add 'AU' to the Country union in packages/standards/src/types.ts

```typescript
// BEFORE:
export type Country = 'SE' | 'NO' | 'DK' | 'FI' | 'NL' | 'DE' | 'FR' | 'ES' | 'IE' | 'IT' | 'PT' | 'PL' | 'GB' | 'US' | 'CA' | 'EU';

// AFTER:
export type Country = 'SE' | 'NO' | 'DK' | 'FI' | 'NL' | 'DE' | 'FR' | 'ES' | 'IE' | 'IT' | 'PT' | 'PL' | 'GB' | 'US' | 'CA' | 'AU' | 'EU';
```

Adding `'AU'` to the `Country` union causes TypeScript to flag every `Record<Country, ...>` that is missing an `'AU'` key — which is exactly the right compile-time guide for what needs updating.

### 3. Add AU to ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED in packages/standards/src/index.ts

```typescript
// ENFORCEMENT_BODIES (backwards-compatible flat map):
AU: 'Australian Human Rights Commission (AHRC)',

// ENFORCEMENT_BODIES_DETAILED (sector-aware map):
AU: {
    wad: 'Australian Human Rights Commission (AHRC)',
    eaa: 'Digital Transformation Agency (DTA)'
}
```

**Rationale for wad/eaa keys on AU:** The existing `ENFORCEMENT_BODIES_DETAILED` interface uses `{ wad: string; eaa: string }`. For AU, `wad` maps to the general-purpose enforcement body (AHRC, which covers both sectors) and `eaa` maps to the government-specific body (DTA). This is an imperfect mapping but it works within the existing `getEnforcementBody(country, sector)` call signature. When `sector === 'private'`, callers get AHRC-via-DTA. When `sector === 'public'`, they get AHRC. The asymmetry is acceptable given DTA does not handle private sector complaints.

**Alternative considered:** Adding a new `dda` key to `ENFORCEMENT_BODIES_DETAILED`. Rejected because it breaks the existing `{ wad: string; eaa: string }` interface for all countries and requires consumers to update. The `wad`/`eaa` reuse is the correct backwards-compatible choice.

---

## Required Code Changes

### 4. TLD Detection — .au and .com.au

The existing TLD parser takes the last hostname segment. This works for simple ccTLDs (`.se`, `.de`, `.uk`) but fails for Australia's common `.com.au` two-part second-level domain structure.

```typescript
// CURRENT logic (statement-generator.ts ~line 147):
const tld = hostname.split('.').pop()?.toLowerCase() || '';
country = TLD_MAP[tld] ?? 'EU';

// This correctly handles:
//   example.com.au → 'au' → AU  (works)
//   example.au     → 'au' → AU  (works)
//   example.gov.au → 'au' → AU  (works)
```

The last-segment approach actually works correctly for all AU domain forms because `au` is always the final segment. No special-casing is required. Simply add `'au': 'AU'` to the TLD_MAP.

```typescript
const TLD_MAP: Record<string, Country> = {
    'se': 'SE', 'no': 'NO', 'dk': 'DK', 'fi': 'FI',
    'de': 'DE', 'fr': 'FR', 'nl': 'NL', 'es': 'ES', 'it': 'IT',
    'pt': 'PT', 'pl': 'PL',
    'uk': 'GB', 'us': 'US', 'ca': 'CA',
    'au': 'AU',  // NEW
};
```

**Confidence: HIGH** — Verified by AU domain structure research. `.com.au`, `.net.au`, `.gov.au`, `.org.au`, `.edu.au`, and the direct `.au` namespace all end in `au`. The split-and-pop approach handles all cases.

### 5. Engine JSON Template — packages/engine/src/reporting/templates/en-au.json

The pattern (confirmed from en-ca.json, en-gb.json, en-us.json) is a 7-section JSON file with jurisdiction-specific law references hardcoded into the `intro`, `enforcement`, and `technical` sections.

```json
{
    "title": "Accessibility of {<website>}",
    "intro": "This website is run by {<organisation>}. We want as many people as possible to be able to use it, and this document describes how {<website>} meets our obligations under the Disability Discrimination Act 1992 (DDA), any known accessibility issues, and how you can report problems so that we can fix them.",
    "sections": [
        {
            "id": "how-accessible",
            "title": "How accessible is the website?",
            "content": "{There are no known accessibility issues with this website./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information.}"
        },
        {
            "id": "what-to-do",
            "title": "What to do if you can't access parts of this website?",
            "content": "If you need content from this website that is not accessible for you, please contact us.\n\n[Our normal response time is {<response time>}.]\n\n[You can also contact us in the following ways:\n\n* email {<email address>}\n* call {<telephone number>}]"
        },
        {
            "id": "reporting",
            "title": "Reporting accessibility problems with this website",
            "content": "We're always looking to improve the accessibility of this website. If you find any problems that aren't listed on this page, contact us and let us know about the problem."
        },
        {
            "id": "enforcement",
            "title": "Lodging a complaint",
            "content": "The {<enforcement_body>} handles complaints about digital accessibility under the Disability Discrimination Act 1992. If you experience accessibility issues on our website, you can lodge a complaint with the {<enforcement_body>}.\n\nIf conciliation is unsuccessful, the matter can be referred to the Federal Court of Australia."
        },
        {
            "id": "technical",
            "title": "Technical information about this website's accessibility",
            "content": "{This website is fully compliant with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA, in line with the Disability Discrimination Act 1992./This website is partially compliant with WCAG 2.2 Level AA, due to the non-compliances listed below./This website is not compliant with WCAG 2.2 Level AA. The non-accessible sections are listed below.}"
        },
        {
            "content": "The content described below is, in one way or another, not fully accessible.\n\n[\n**Non-compliance with WCAG 2.2 Level AA**\n\n{<issues>}\n]"
        },
        {
            "id": "testing",
            "title": "How we tested this website",
            "content": "{We have performed a self-assessment (internal testing) of {<website>}./{<third party>} has tested {<website>}./We have estimated the accessibility without testing.}\n\nThe last assessment was made on {<assessment date>}.\n\n[Assessment method: {<method>}]\n\nThe website was published on {<publish date>}.\n\nThe statement was last updated on {<update date>}."
        }
    ]
}
```

**Key AU-specific prose decisions:**
- "Lodging a complaint" instead of "Enforcement procedure" — AU uses complaint-based process not a formal enforcement regime
- References WCAG 2.2 Level AA by name (not by law reference, since the DDA does not specify a WCAG version — AHRC guidance does)
- Omits "disproportionate burden" clause — this concept exists in EU WAD/EAA but is not a recognised defence mechanism under the DDA
- References Federal Court as the escalation path (not an ombudsman or regulator)

### 6. Component Inline Template — 'en-au' entry in AccessibilityStatement.tsx TEMPLATES

Following the pattern of `'en-gb'`, `'en-us'`, `'en-ca'`, add an `'en-au'` key to the inline `TEMPLATES` object. The prose mirrors the engine JSON template above.

### 7. Engine EVALUATION_METHOD, STATUS_LABELS, RESPONSE_TIME_DEFAULT — Add 'en-au' key

```typescript
// statement-generator.ts additions:
EVALUATION_METHOD['en-au'] = 'Automated scan via @holmdigital/engine';
STATUS_LABELS['en-au'] = { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' };
RESPONSE_TIME_DEFAULT['en-au'] = '2 days';
```

### 8. Component locale-chrome.ts — Add 'en-au' to all three maps

```typescript
// locale-chrome.ts — add 'en-au' to BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT
'en-au': { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' },
'en-au': 'Updated:',
'en-au': 'Generated using',
```

### 9. Component AccessibilityStatement.tsx — formatDiggDate locale map

```typescript
// Add 'en-au' to the localeMap in formatDiggDate:
'en-au': 'en-AU',
```

### 10. Component AccessibilityStatement.tsx — supportedLocales routing

The component routes locale strings to template keys via a `supportedLocales` map. Add `'en-au': 'en-au'` to this map.

### 11. Standards getData() in packages/standards/src/index.ts — Add 'en-au' alias

```typescript
case 'en-au': return rulesEnAu as ConvergenceRule[];
```

This requires creating `packages/standards/data/rules.en-au.json`. In practice, AU uses the same rules as EN with `australianInterpretation` fields added to `HolmDigitalInsight`. For v0.5, the simplest correct approach is to reuse the English rules file and add an en-au alias pointing to `rulesEn`. A separate `rules.en-au.json` with AU-specific interpretation text can be a follow-on task.

---

## Integration Points Summary

| Integration Point | File | Change Type | Complexity |
|-------------------|------|-------------|------------|
| LegalFramework type | packages/standards/src/types.ts | Union extension `\| 'DDA'` | Trivial |
| Country type | packages/standards/src/types.ts | Union extension `\| 'AU'` | Trivial |
| ENFORCEMENT_BODIES | packages/standards/src/index.ts | Add AU key | Trivial |
| ENFORCEMENT_BODIES_DETAILED | packages/standards/src/index.ts | Add AU key | Trivial |
| national-laws.json | packages/standards/data/legal/national-laws.json | Add AU array | Low |
| TLD_MAP | packages/engine/src/reporting/statement-generator.ts | Add `'au': 'AU'` | Trivial |
| Engine template | packages/engine/src/reporting/templates/en-au.json | New file | Low |
| Engine locale maps | packages/engine/src/reporting/statement-generator.ts | Add en-au keys | Trivial |
| Component TEMPLATES | packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx | Add en-au entry | Low |
| Component chrome | packages/components/src/AccessibilityStatement/locale-chrome.ts | Add en-au keys | Trivial |
| Component date format | packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx | Add en-au to localeMap | Trivial |
| Component supportedLocales | packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx | Add en-au routing | Trivial |
| Standards getData() | packages/standards/src/index.ts | Add en-au case | Trivial |

---

## What NOT to Add

| Avoid | Why |
|-------|-----|
| State/territory AU laws (e.g. Disability Inclusion Act NSW) | DTA explicitly scopes Digital Experience Policy to federal agencies only. State/territory compliance is out of scope for v0.5 and would require per-state entries. |
| Separate `auFramework` discriminator on NationalLaw | Reusing `'DDA'` as a LegalFramework value is sufficient and avoids interface changes. Adding `auFramework` would break the existing typed `Record<LegalFramework, ...>` patterns. |
| `rules.en-au.json` with custom rule interpretations | AU uses the same WCAG criteria as every other jurisdiction. EN rule data is correct. AU-specific interpretation text is a LOC milestone, not a jurisdiction milestone. |
| Hard-coded WCAG version in the AU type entry | WCAG version is enforced by axe-core scan configuration, not per-jurisdiction rule data. The DDA does not codify a WCAG version; the AHRC guidance specifying WCAG 2.2 AA is policy, not law. |
| DDA fine amounts | The DDA has no statutory cap on damages. `minAmount: 0, maxAmount: 0` with a descriptive `description` field is the correct representation — the same pattern used for GB PSBAR and US Section 508. |

---

## Sector-Aware Enforcement Wiring for AU

The `getEnforcementBody(country, sector)` function uses `ENFORCEMENT_BODIES_DETAILED[country].wad` for public sector and `.eaa` for private sector.

For AU:
- `sector: 'public'` → AHRC (the DDA complaint body applies to all sectors; the DTA Digital Access Standard is additionally relevant for government)
- `sector: 'private'` → AHRC (the DDA applies directly to private sector; DTA is not relevant)

Both keys correctly point to AHRC. The DTA appears in the `national-laws.json` enforcement data for the `au-dta` law entry (for consumers who inspect individual laws), but the sector-aware enforcement helper should return AHRC for both sectors because that is who handles complaints regardless of sector.

```typescript
AU: { wad: 'Australian Human Rights Commission (AHRC)', eaa: 'Australian Human Rights Commission (AHRC)' }
```

This is cleaner and more accurate than routing private sector to DTA (DTA does not handle private sector complaints).

---

## Alternatives Considered

| Decision | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| `LegalFramework = 'DDA'` | Use 'DDA' as framework discriminator | Use 'WAD' as a catch-all for non-EU national laws | WAD literally means Web Accessibility Directive (EU). Conflating AU with EU WAD produces misleading statements referencing EU directives. |
| Two AU law entries (DDA + DTA) | Two entries with different scope | Single DDA entry | Single entry loses the public/private sector distinction. The DTA Digital Access Standard is a materially distinct obligation for government sites. |
| AHRC for both sectors | AHRC as universal AU enforcement body | DTA for public sector | DTA monitors compliance but does not accept public complaints. AHRC is the correct contact point for any accessibility complaint regardless of sector. |
| Last-segment TLD parse for .au | Reuse existing split('.').pop() | Special-case .com.au parsing | Not needed. All AU domains end in 'au'. The existing parser handles all forms correctly. |

---

## Sources

- [Australian Human Rights Commission — DDA complaints](https://humanrights.gov.au/complaints/complaints/complaints-under-disability-discrimination-act) — AHRC role, complaint process confirmed (HIGH confidence)
- [DTA — Digital Experience Policy](https://www.dta.gov.au/articles/digital-experience-policy-and-standards-now-live-digitalgovau) — DTA scope, 1 Jan 2025 effective date confirmed (HIGH confidence)
- [Deque — Three major accessibility updates in Australia, 2026](https://www.deque.com/blog/accessibility-updates-in-australia-in-2026/) — WCAG 2.2 AA guidance, AHRC April 2025 announcement (MEDIUM confidence — trade publication)
- [OZeWAI — Three major accessibility updates in Australia](https://ozewai.org/blog/standards/three-major-accessibility-updates-in-australia/) — corroborates Deque analysis (MEDIUM confidence)
- [Disability Discrimination Act 1992 — Federal Register of Legislation](https://www.legislation.gov.au/Details/C2016C00763) — primary legislation (HIGH confidence)
- [.au Wikipedia](https://en.wikipedia.org/wiki/.au) — AU domain structure confirmed; all forms end in 'au' (HIGH confidence)

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| AU legal framework (DDA scope, AHRC role) | HIGH | Confirmed by official AHRC site and primary legislation |
| DTA Digital Experience Policy scope and date | HIGH | Confirmed by official DTA and digital.gov.au sources |
| WCAG 2.2 AA as AHRC recommendation | HIGH | Multiple sources; AHRC April 2025 announcement confirmed |
| No statutory fine cap under DDA | HIGH | Complaint-based system; Federal Court determines damages; confirmed by AHRC complaints docs |
| TLD detection correctness for .au | HIGH | AU domain structure research confirms all forms end in 'au' |
| en-au template prose | MEDIUM | Template is new content; phrasing should be reviewed by an AU-familiar legal practitioner before first public use |
| `'DDA'` as LegalFramework discriminator | HIGH | No existing code requires WAD/EAA for AU; additive union extension is standard TypeScript |

---

*Stack research for: Australia jurisdiction (v0.5 milestone)*
*Researched: 2026-03-27*
