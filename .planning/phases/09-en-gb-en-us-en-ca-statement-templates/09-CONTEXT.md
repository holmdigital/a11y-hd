# Phase 9: en-gb/en-us/en-ca Statement Templates - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Add jurisdiction-specific accessibility statement templates for UK (en-gb), US (en-us), and Canadian (en-ca) websites. This covers both template systems (engine JSON files + component inline TEMPLATES), country detection from URL TLDs, and correct legislation/enforcement body references. The ENFORCEMENT_BODIES map and national-laws.json already have GB/US/CA entries — this phase creates the templates that reference them.

</domain>

<decisions>
## Implementation Decisions

### Template Differentiation
- Each en-* locale gets its own distinct template (not a copy of generic en)
- Enforcement section references jurisdiction-specific legislation: PSBAR 2018 (UK), Section 508/ADA (US), AODA/ACA (CA)
- Compliance section references the correct national law name instead of generic "accessibility regulations"
- Intro and general sections stay close to generic English tone but reference the correct national law
- Generic en template remains unchanged (EU-focused, references WAD/EAA)

### Country Detection Logic
- Extend engine's TLD detection (statement-generator.ts lines 115-121) to cover:
  - `.uk` and `.gov.uk` → GB
  - `.us` and `.gov` → US (note: `.gov` is ambiguous but US is the most common assumption)
  - `.ca` and `.gc.ca` → CA
- Use the same simple `url.endsWith()` pattern already established
- Detection only runs when `metadata?.country` is not explicitly provided (same guard as existing)
- Component side: country prop is passed explicitly, no URL detection needed there

### Template Prose Tone
- Keep the neutral informational tone of existing English template
- Swap in jurisdiction-specific legal terminology without changing the overall register
- UK: reference "Public Sector Bodies Accessibility Regulations 2018" and EHRC
- US: reference "Section 508 of the Rehabilitation Act" and DOJ Civil Rights Division
- CA: reference "Accessible Canada Act" and Accessibility Commissioner

### Placeholder Variables
- Keep the `{<enforcement_body>}` placeholder pattern — already resolved via ENFORCEMENT_BODIES[country]
- Template-specific placeholder keys should follow existing naming conventions (e.g., `{<website>}`, `{<organisation>}`)
- No new placeholder types needed — just different prose around existing placeholders

### Dual Template System
- Engine: Create en-gb.json, en-us.json, en-ca.json in packages/engine/src/reporting/templates/
- Component: Add en-gb, en-us, en-ca entries to the inline TEMPLATES constant (currently these locales fall through to generic en via supportedLocales mapping)
- Component supportedLocales already maps en-gb/en-us/en-ca to 'en' — this needs to change so they get their own template instead of falling through to generic en

### Claude's Discretion
- Exact wording of template prose sections (will be reviewed in Phase 10)
- Whether to refactor component TEMPLATES to load from external files or keep inline
- Test strategy for verifying jurisdiction-specific references in rendered output
- Whether `.gov` TLD should map to US or remain unmapped (ambiguous — could be any country)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ENFORCEMENT_BODIES` in `@holmdigital/standards` — already has GB (EHRC), US (DOJ), CA (Accessibility Commissioner) entries
- `national-laws.json` — already has GB (PSBAR 2018), US (Section 508), CA (AODA) with full enforcement details
- `Country` type in standards — already includes 'GB' | 'US' | 'CA'
- `en.json` engine template — base for creating en-gb/en-us/en-ca variants
- Component TEMPLATES.en — base for creating component-side en-* variants

### Established Patterns
- Engine templates: JSON files in `packages/engine/src/reporting/templates/` loaded via `fs.readFile` at statement-generator.ts line 81-91
- Component templates: inline `TEMPLATES` const at AccessibilityStatement.tsx lines 122-237
- TLD detection: `result.url.endsWith('.no')` pattern at statement-generator.ts lines 117-121
- supportedLocales map: en-gb/en-us/en-ca currently map to 'en' at AccessibilityStatement.tsx line 299

### Integration Points
- statement-generator.ts line 81: `const templatePath = path.join(__dirname, 'templates', \`${lang}.json\`)` — new JSON files auto-discovered
- statement-generator.ts lines 115-121: country detection — needs new TLD entries
- AccessibilityStatement.tsx line 299: supportedLocales — needs en-gb/en-us/en-ca to map to their own keys instead of 'en'
- AccessibilityStatement.tsx line 122: TEMPLATES constant — needs en-gb/en-us/en-ca entries
- Component test file: needs tests for en-gb/en-us/en-ca template rendering

</code_context>

<specifics>
## Specific Ideas

- UK template should reference "Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018" in the enforcement section, matching the fullName from national-laws.json
- US template should reference both Section 508 (federal) and ADA (broader private sector)
- CA template should reference AODA (Ontario) and the federal Accessible Canada Act (ACA)
- The `.gov` TLD is ambiguous — safer to leave unmapped and require explicit country metadata for US government sites

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-en-gb-en-us-en-ca-statement-templates*
*Context gathered: 2026-03-04*
