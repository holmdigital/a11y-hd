# Pitfalls Research

**Domain:** Adding Australian (AU) jurisdiction to an EU-centric accessibility compliance monorepo
**Researched:** 2026-03-27
**Confidence:** HIGH — grounded in direct codebase analysis + verified AU legal sources (AHRC, DTA, W3C WAI, Deque, OZeWAI)

---

## Critical Pitfalls

Mistakes that produce legally incorrect output, corrupt TypeScript at compile time, or silently generate wrong enforcement data for AU users.

---

### Pitfall 1: TLD Parser Silently Drops `.com.au` — Country Always Falls Back to EU

**What goes wrong:**
The TLD detection in `statement-generator.ts` uses `.hostname.split('.').pop()` to extract the TLD. For `example.com.au`, `pop()` returns `'au'`, which is correct. However, `.com.au`, `.gov.au`, `.edu.au`, `.net.au`, and `.org.au` are all second-level public suffixes — the effective TLD is two parts. If a future developer "fixes" the logic to parse SLDs using a naive two-part check (the `.co.uk` pattern already in the codebase), they must also cover `.com.au`, `.gov.au`, `.edu.au`, `.net.au`, `.org.au`. The `.co.uk` pattern is commented on in `PROJECT.md` as a known case. Australia has five common two-part suffixes, not one.

The current `pop()` approach happens to work for `example.com.au` because `pop()` returns `au`, which maps to `'AU'` after the new entry is added. But a `.gov.au` hostname like `www.ato.gov.au` also returns `'au'` — both correctly map to `'AU'`. No divergence on `pop()` logic. The risk activates if someone migrates to Public Suffix List (PSL)-based parsing (the correct long-term approach) without including all AU second-level entries: `com.au`, `gov.au`, `edu.au`, `net.au`, `org.au`, `org.au`, `asn.au`, `id.au`.

**Why it happens:**
Developers treating AU as equivalent to single-part TLDs like `.se` or `.de`. The `.co.uk` exception in the codebase hints that SLD handling exists conceptually, but AU was not in scope when that pattern was decided. Adding AU as `'au': 'AU'` in the `TLD_MAP` is correct for the current `pop()` approach and requires no SLD handling. The pitfall is forgetting to document this assumption so it does not get "corrected" with incomplete PSL logic later.

**How to avoid:**
Add `'au': 'AU'` to `TLD_MAP` in `statement-generator.ts`. Add a comment: `// AU covers .au, .com.au, .gov.au, .edu.au etc. — pop() returns 'au' for all`. Also add a test case with URL `https://www.example.com.au` asserting `country === 'AU'` and another with `https://service.gov.au` asserting the same. Document the pop() assumption in the test comment.

**Warning signs:**
If TLD detection tests are missing for `.com.au` specifically and only test plain `.au`, the assumption is unverified. Grep for `com.au` in test files — if absent, the `.com.au` case is not covered.

**Phase to address:** Standards/engine data phase (first phase). TLD detection is foundational — all statement generation depends on correct country detection.

---

### Pitfall 2: `LegalFramework` Type Is Hardcoded to EU Directives — AU Has No WAD/EAA

**What goes wrong:**
`LegalFramework = 'WAD' | 'EAA'` in `types.ts` line 12. `NationalLaw.euFramework` is typed as `LegalFramework`. `getNationalLawByFramework('WAD', country)` is called by both `statement-generator.ts` and `AccessibilityStatement.tsx`. When AU is added to national-laws.json, the AU laws (DDA, Digital Experience Policy/DTA standards) do not map to WAD or EAA — they are independent non-EU frameworks.

If AU national laws are stored with `"euFramework": "WAD"` as a placeholder (to make the TypeScript type pass), the system will falsely report AU sites as subject to the EU Web Accessibility Directive. The enforcement body lookup `getEnforcementBody(country, sector)` defaults to `wad` for public sector — this would return an EU-flavoured enforcement name for AU if not explicitly handled.

**Why it happens:**
`NationalLaw.euFramework: LegalFramework` is named `euFramework` — semantically EU-specific. The temptation is to repurpose WAD=public/EAA=private as a convenient sector proxy. Norway does this (WAD applies via EEA agreement), Canada and US do it too (GB, US, CA all have `wad`/`eaa` entries in `ENFORCEMENT_BODIES_DETAILED` even though neither implements WAD). The pattern of shoehorning non-EU countries into WAD/EAA already exists — but AU is the first jurisdiction where forcing WAD into the `euFramework` field would produce a materially incorrect accessibility statement claiming EU directive applicability.

**How to avoid:**
Two options, choose one before writing any AU data:

Option A (minimal type change): Add `'DDA'` to `LegalFramework` type. This is a non-breaking additive change. Store AU DDA law as `"euFramework": "DDA"`. Update `getNationalLawByFramework` callers to handle DDA as a distinct framework. Update `getEnforcementBody` to handle the AU case without WAD/EAA dichotomy.

Option B (data workaround, riskier): Store AU with `"euFramework": "WAD"` for DDA (public+private) and document that for AU, WAD means DDA. Add a `note` field. This avoids a type change but produces semantically incorrect data.

Option A is strongly preferred. The `LegalFramework` type was always EU-scoped by name. A separate field or union extension is the correct model.

**Warning signs:**
If AU national-laws.json entries have `"euFramework": "WAD"` with no comment explaining why, Option B was chosen silently. Check whether statement templates reference `getNationalLawByFramework('WAD', 'AU')` — if they do and return DDA data, the template will generate text like "complies with the Web Accessibility Directive" which is factually wrong for AU.

**Phase to address:** Standards data phase (first phase). The type decision must be made before any AU data is written. A wrong decision here cascades to templates, components, and tests.

---

### Pitfall 3: `ENFORCEMENT_BODIES_DETAILED` WAD/EAA Split Is Semantically Wrong for AU

**What goes wrong:**
`ENFORCEMENT_BODIES_DETAILED` has `{ wad: string; eaa: string }` per country. For EU countries, this correctly captures dual enforcement (DIGG for WAD, PTS for EAA in SE). For GB/US/CA, both `wad` and `eaa` point to the same body. For AU, the enforcement model is fundamentally different:

- DDA applies to **both** public and private sector (not split by WAD/EAA)
- Enforcement is complaint-based via **AHRC** (Australian Human Rights Commission), not proactive monitoring
- For public sector digital services specifically, the DTA's Digital Experience Policy adds obligations monitored by the **DTA** (public sector only, from Jan 2025)
- There is no private-sector-specific enforcement body separate from AHRC

If AU is added as `{ wad: 'AHRC', eaa: 'DTA' }`, the generated statement for a private AU website will say "the DTA is responsible for enforcing accessibility" — which is incorrect; DTA governs public sector only.

**How to avoid:**
Store AU enforcement as `{ wad: 'Australian Human Rights Commission (AHRC)', eaa: 'Australian Human Rights Commission (AHRC)' }` — both sectors use AHRC for complaint resolution. Add a `note` field to the AU national law explaining that DTA governs public sector proactive standards but AHRC handles complaints for all sectors. The statement template should reference AHRC for all AU sectors. Do not model DTA as the EAA equivalent.

**Warning signs:**
If an AU accessibility statement generated for `sector='private'` references the DTA, the enforcement model is wrong. The DTA's Digital Experience Policy only binds Commonwealth government agencies. The DDA complaint mechanism (AHRC) applies to all sectors.

**Phase to address:** Standards data phase (first phase). Enforcement body data is written once and referenced everywhere.

---

### Pitfall 4: Accessibility Statement Template Assumes WAD-Style Mandatory Statement Structure

**What goes wrong:**
Existing templates (en-ca.json, en-gb.json, en-us.json) follow the WAD accessibility statement structure: scope/coverage section, enforcement procedure section, technical information section, testing section. This structure is mandated by WAD Article 7. Australia has **no mandatory accessibility statement requirement** under either the DDA or the Digital Experience Policy (as of March 2026). The Digital Inclusion Standard requires meeting WCAG 2.2 AA for public sector but does not mandate a published accessibility statement in any prescribed format.

If the AU template copies the EU/UK/CA structure verbatim, the "Enforcement procedure" section will say something like "the AHRC is responsible for enforcing this website's accessibility statement" — which misrepresents how AU enforcement works. AU enforcement is complaint-initiated (a user files a complaint with AHRC), not authority-initiated monitoring.

**How to avoid:**
Write an AU-specific `en-au.json` template that:
1. Does NOT reference a mandatory accessibility statement obligation (frame it as best practice / voluntary commitment)
2. Describes enforcement as complaint-based: users can lodge a complaint with AHRC under the DDA
3. References WCAG 2.2 AA (the AHRC April 2025 guidelines) rather than EN 301 549 or WAD
4. For public sector, additionally references the Digital Experience Policy / Digital Inclusion Standard (from Jan 2025)
5. Does not include the WAD-specific "disproportionate burden" exemption language (no equivalent in DDA)

**Warning signs:**
If the AU template contains phrases like "disproportionate burden", "Web Accessibility Directive", "EN 301 549 transposition", or "monitoring body" (implying proactive authority monitoring), the template was copied from EU/UK/CA without AU-specific review.

**Phase to address:** Engine template phase. The template is the most user-visible output — incorrect legal framing is a reputational and compliance risk.

---

### Pitfall 5: `diggRisk` Field Appears in AU Output with Swedish-Regulatory Semantics

**What goes wrong:**
`EnrichedReport.holmdigitalInsight.diggRisk` is typed as `DiggRisk = 'low' | 'medium' | 'high' | 'critical'`. The field name is "diggRisk" — DIGG is the Swedish Agency for Digital Government. When scan results are presented to an AU user via the CLI or HTML report, the risk level column is derived from `diggRisk`. This field carries Swedish regulatory risk calibration (based on DIGG enforcement patterns and DOS-lagen severity). An AU user will see "DIGG risk: high" in their report, which either (a) confuses them because DIGG is irrelevant to AU, or (b) implies the wrong regulatory context.

**Why it happens:**
`diggRisk` was added when this was purely a Swedish/Nordic tool. Subsequent non-EU country additions (GB, US, CA) did not surface this issue because the CLI presents `diggRisk` as a generic severity indicator and non-Nordic users rarely inspect field names. AU users — especially those who explicitly selected AU jurisdiction for a compliance report — are more likely to scrutinise the report metadata.

**How to avoid:**
This is an existing design debt. For the AU milestone, the minimum mitigation is: do not expose the string "DIGG" in AU-language CLI output or HTML reports. The i18n `en-au` locale strings for report headers should read "Risk level" not "DIGG Risk". The underlying field name remains `diggRisk` in TypeScript (backwards compatible), but the display label is locale-controlled.

Verify: the CLI's risk display text comes from i18n `t()` calls. Check `packages/engine/src/locales/en.json` for the key that labels the risk column. Add `en-au` locale entries that neutralise the DIGG branding.

**Warning signs:**
Run the CLI with `--lang en-au` against any URL and check whether "DIGG" or "Digg" appears in the output. If it does, the i18n strings for AU have not been separated from the generic English strings.

**Phase to address:** Engine i18n/locale phase. Low effort to fix display labels; high impact on professional presentation to AU clients.

---

## Moderate Pitfalls

---

### Pitfall 6: `Country` Type Requires AU Addition to All Lookup Maps Simultaneously

**What goes wrong:**
`Country` in `types.ts` line 14 is a string union. Adding `'AU'` requires updating **every** `Record<Country, ...>` in the codebase simultaneously, or TypeScript will error. The known maps are:

- `ENFORCEMENT_BODIES: Record<Country, string>` — line 26 of `index.ts`
- `ENFORCEMENT_BODIES_DETAILED: Record<Country, { wad: string; eaa: string }>` — line 45

If `'AU'` is added to `Country` but `ENFORCEMENT_BODIES` is not updated, TypeScript throws: "Property 'AU' is missing in type". The build will fail. This is the intended TypeScript safety mechanism — but it means all three additions (type, ENFORCEMENT_BODIES, ENFORCEMENT_BODIES_DETAILED) must be in the same commit, or the build is broken between commits.

**How to avoid:**
Treat the Country type addition and all Record updates as a single atomic commit in `packages/standards`. Do not merge partial changes. The build gate (TypeScript strict mode) will catch any miss, but a broken build between commits disrupts parallel work.

**Warning signs:**
If a PR adds `'AU'` to the `Country` type but the CI build fails with "Property 'AU' is missing", a Record was missed. Check for all `Record<Country,` patterns in `packages/standards/src/index.ts`.

**Phase to address:** Standards data phase. The atomic update requirement is a sequencing constraint, not a design flaw.

---

### Pitfall 7: `getNationalLawByFramework` Returns `null` for AU if Called with `'WAD'`

**What goes wrong:**
`getNationalLawByFramework('WAD', 'AU')` is called in both `statement-generator.ts` and `AccessibilityStatement.tsx` to get the law name and enforcement body for the statement. If AU national laws use framework `'DDA'` (see Pitfall 2), this call returns `null` for AU. Both callers must handle `null` gracefully or AU statements will render with undefined law names.

Specific caller risk in `statement-generator.ts`:
```typescript
const nationalLaw = getNationalLawByFramework('WAD', country);
// If country === 'AU' and AU laws use 'DDA' framework, nationalLaw is null
// downstream: nationalLaw.law → TypeError: Cannot read property 'law' of null
```

**How to avoid:**
Add AU-aware fallback logic in both callers:
- If `framework === 'WAD'` returns null for a country, also try framework `'DDA'` (or whatever AU uses)
- Or: add a `getNationalLawForCountry(country, sector)` helper that is sector-aware without assuming WAD/EAA semantics

Write a test: `getNationalLawByFramework('WAD', 'AU')` with the new AU data — assert it returns the correct DDA law entry (which requires deciding whether DDA is stored as WAD or DDA framework).

**Warning signs:**
If statement generation for AU produces a statement where the law name placeholder `{<law>}` or the enforcement body is blank, `null` was not handled. Run `hd-a11y-scan https://example.com.au --lang en-au --statement out.html` and check the output for empty law fields.

**Phase to address:** Engine template phase. The null-handling fix should accompany AU template addition.

---

### Pitfall 8: Sector-Aware Enforcement Logic Does Not Model AU's DDA "Both" Sector Scope

**What goes wrong:**
`getEnforcementBody(country, sector?)` returns the WAD body for `sector='public'` and EAA body for `sector='private'`. For AU, DDA applies to **both** sectors equally — the same AHRC is the complaint body for a government website and for a private e-commerce site. The `sector` parameter is ignored for AU.

However, the AU public sector has an *additional* obligation layer: the Digital Experience Policy monitored by DTA. If the system renders `sector='public'` for an AU government website, it should ideally mention both AHRC (DDA) and DTA (Digital Experience Policy) — but the current model only returns a single enforcement body string.

**How to avoid:**
For the v0.5 milestone, model AU as: both sectors → AHRC. This is correct and complete for DDA. Add a `note` to the AU national law data: "Public sector Commonwealth agencies are also subject to the Digital Transformation Agency's Digital Experience Policy (from 1 January 2025)." The note can appear in the accessibility statement as a contextual paragraph for public sector AU sites.

Do not attempt to model DTA as a second enforcement body returned by `getEnforcementBody` in v0.5 — this would require changing the return type from `string` to `string | string[]`, which is a breaking API change.

**Warning signs:**
If the AU public-sector enforcement body is set to 'DTA' in `ENFORCEMENT_BODIES_DETAILED.AU.wad`, private sector AU statements will incorrectly reference DTA. Test both `sector='public'` and `sector='private'` AU statement generation.

**Phase to address:** Standards data phase (enforcement body data) + engine template phase (DTA note for public sector).

---

### Pitfall 9: HolmDigitalInsight `australianInterpretation` Field Requires Opt-In Handling

**What goes wrong:**
`HolmDigitalInsight` in `types.ts` has locale-specific interpretation fields: `swedishInterpretation`, `norwegianInterpretation`, etc. Adding `australianInterpretation?: string` is the natural next step. However, unlike European locales, `australianInterpretation` would contain DDA-context guidance rather than EN 301 549/WAD context. The JSON rule files (`rules.en-au.json`) must either be a full copy of `rules.en.json` with `australianInterpretation` added, or share the English base with AU-specific overrides.

If `rules.en-au.json` is a verbatim copy of `rules.en.json` (the likely shortcut), it will double the size of the standards package import for AU consumers and produce stale content when `rules.en.json` is updated. The en-gb, en-us, en-ca rule files presumably follow this copy pattern already (verified: `packages/standards/src/index.ts` imports all three as separate files).

**How to avoid:**
For v0.5, accept the copy approach for `rules.en-au.json` — it is consistent with the existing en-gb/en-us/en-ca pattern. Add a code comment in `index.ts` and in the build process noting that AU rules are derived from EN rules. Document the update procedure: when `rules.en.json` is updated, run a diff-and-apply script against en-au. Do not silently let en-au drift.

**Warning signs:**
If `rules.en-au.json` is added but there is no test verifying it has the same number of rules as `rules.en.json`, divergence is invisible until an AU user reports a missing rule mapping.

**Phase to address:** Standards data phase. Low risk at creation time, medium risk at maintenance time.

---

## Technical Debt Patterns

Shortcuts specific to AU integration that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store AU DDA as `euFramework: 'WAD'` | No type change needed | Statement says "EU Web Accessibility Directive applies" for AU — legally wrong | Never |
| Model DTA as EAA equivalent for AU public sector | Reuses existing WAD/EAA split | Misleads private AU users who see DTA in their statement | Never |
| Copy `rules.en.json` to `rules.en-au.json` with no AU-specific content | Fast first pass | AU users get identical content to `en` — no DDA context in insights | Acceptable for v0.5 if documented |
| Use AHRC for both WAD and EAA fields in `ENFORCEMENT_BODIES_DETAILED` | Correct for current DDA model | If AU ever splits public/private enforcement, this needs revisiting | Acceptable — document the assumption |
| Skip `australianInterpretation` field in rules for v0.5 | Less data work | No AU-specific WCAG interpretive guidance in reports | Acceptable for v0.5 if tracked |

---

## Integration Gotchas

| Integration Point | Common Mistake | Correct Approach |
|-------------------|----------------|------------------|
| `TLD_MAP` in `statement-generator.ts` | Add only `'au': 'AU'`, forget `.com.au` is already handled by `pop()` | Add `'au': 'AU'`; document that `pop()` correctly handles all AU SLDs; add `.com.au` test |
| `ENFORCEMENT_BODIES` / `ENFORCEMENT_BODIES_DETAILED` | Add AU entry with DTA as EAA body (DTA = public sector) | AHRC for both WAD and EAA; add note about DTA in public sector template prose |
| `getNationalLawByFramework` callers | Call with `'WAD'` assuming it covers AU | Handle null return; add AU-specific fallback or change how AU law is stored |
| `en-au` statement template | Copy from `en-ca.json` which has WAD-style mandatory statement framing | Write from scratch; frame as voluntary best practice; complaint-based enforcement via AHRC |
| `Country` type union | Add `'AU'` in one commit, `Record<Country>` updates in a later commit | Single atomic commit for type + all Record updates |
| `legalSummary` in `ScanResult` | `wadApplicable`/`eaaApplicable` counts are meaningless for AU | For AU scans, these counts will be 0 if legalContext is EU-scoped — acceptable; do not display in AU reports |

---

## "Looks Done But Isn't" Checklist

- [ ] **TLD detection:** `'au': 'AU'` added to TLD_MAP — but test with `https://example.com.au` URL (not just `example.au`) to verify `pop()` returns `'au'` in both cases
- [ ] **Enforcement body:** AHRC name is present in `ENFORCEMENT_BODIES` and `ENFORCEMENT_BODIES_DETAILED` — but verify the en-au statement template actually renders the AHRC name (not a placeholder)
- [ ] **National laws:** `national-laws.json` has an AU entry — but verify `getNationalLawByFramework` returns the AU DDA law without `null`
- [ ] **Statement template:** `en-au.json` template file exists in `packages/engine/src/reporting/templates/` — but verify no unresolved `{<...>}` placeholders remain in rendered output
- [ ] **Component locale-chrome:** `en-au` entries exist in `BADGE_LABELS`, `UPDATED_LABEL`, `FOOTER_TEXT` in `locale-chrome.ts` — but verify the AccessibilityStatement component renders with `country='AU'` without crashing
- [ ] **Test coverage:** AU-specific test exists in `statement-generator.test.ts` — but also verify the existing 225 tests still pass (no regression from Country type addition)
- [ ] **Sector wiring:** Both `sector='public'` and `sector='private'` AU cases are tested — not just the default public case
- [ ] **i18n locale registration:** `en-au` is registered in `packages/engine/src/i18n/index.ts` locales map — but verify `setLanguage('en-au')` does not fall through to `console.warn` and English fallback

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| TLD parser drops `.com.au` (Pitfall 1) | Phase 1: Standards + TLD data | Test with `https://www.example.com.au` and `https://service.gov.au` — both must return `'AU'` |
| `LegalFramework` type wrong for AU (Pitfall 2) | Phase 1: Standards types | TypeScript must compile with AU laws using chosen framework value; `getNationalLawByFramework` must not return null for AU |
| `ENFORCEMENT_BODIES_DETAILED` WAD/EAA wrong for AU (Pitfall 3) | Phase 1: Standards data | `getEnforcementBody('AU', 'private')` must return AHRC, not DTA |
| Statement template assumes WAD mandatory structure (Pitfall 4) | Phase 2: Engine template | AU statement must not contain "disproportionate burden", "Web Accessibility Directive", or "monitoring body" language |
| `diggRisk` label appears in AU CLI output (Pitfall 5) | Phase 3: i18n/locale | `--lang en-au` output must not contain "DIGG" or "Digg" in display labels |
| `Country` type missing from Record maps (Pitfall 6) | Phase 1: Standards data | `npm run build -w @holmdigital/standards` must pass with zero TypeScript errors after AU addition |
| `getNationalLawByFramework` null for AU (Pitfall 7) | Phase 2: Engine template | Statement generation for AU must not throw TypeError; law name must appear in output |
| Sector model wrong for AU DDA "both" scope (Pitfall 8) | Phase 1: Standards data | Test `getEnforcementBody('AU', 'public')` and `getEnforcementBody('AU', 'private')` both return AHRC |
| `australianInterpretation` field drift (Pitfall 9) | Phase 1: Standards data | Test that `rules.en-au.json` rule count matches `rules.en.json` |

---

## Sources

**Australian legal framework (MEDIUM-HIGH confidence — multiple sources agree):**
- W3C WAI Australia Policies: https://www.w3.org/WAI/policies/australia/
- AHRC DDA Advisory Notes (2014, current legal basis): https://humanrights.gov.au/our-work/disability-rights/world-wide-web-access-disability-discrimination-act-advisory-notes
- AHRC Guidelines on equal access to digital goods and services (April 2025): https://humanrights.gov.au/resource-hub/by-resource-type/guidelines-and-standards/guides-and-standards-disability-rights/chapter-3-standards-and-guidelines-digital-accessibility
- Deque: Australia's accessibility laws overview: https://www.deque.com/apac-digital-accessibility-laws/australia/
- Deque: Three major AU accessibility updates 2026: https://www.deque.com/blog/accessibility-updates-in-australia-in-2026/
- DTA Digital Inclusion Standard: https://www.digital.gov.au/policy/digital-experience/digital-inclusion-standard
- OZeWAI: Three major accessibility updates in Australia: https://ozewai.org/blog/standards/three-major-accessibility-updates-in-australia/
- Intopia: Australia revises AS EN 301 549: https://intopia.digital/articles/australia-revises-as-en-301-549-proposes-to-increase-accessibility-standards/

**AU domain structure (HIGH confidence — wikipedia + auDA):**
- .au Wikipedia: https://en.wikipedia.org/wiki/.au
- auDA domain policies: https://www.auda.org.au/

**Codebase analysis (HIGH confidence — direct source reading):**
- `packages/standards/src/types.ts` — `LegalFramework`, `Country`, `NationalLaw.euFramework`
- `packages/standards/src/index.ts` — `ENFORCEMENT_BODIES`, `ENFORCEMENT_BODIES_DETAILED`, `getNationalLawByFramework`
- `packages/engine/src/reporting/statement-generator.ts` — `TLD_MAP`, `pop()` TLD logic, template loading
- `packages/engine/src/reporting/templates/en-ca.json` — reference template structure (WAD-style)
- `packages/engine/src/i18n/index.ts` — locale registration, `setLanguage` fallback
- `.planning/PROJECT.md` — v0.5 milestone scope, existing TLD coverage, sector-aware enforcement API

---
*Pitfalls research for: AU jurisdiction integration into EU-centric accessibility compliance monorepo*
*Researched: 2026-03-27*
