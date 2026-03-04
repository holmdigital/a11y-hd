# Phase 8: Component UI Chrome Localization - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand the three binary sv/en UI chrome strings in the AccessibilityStatement component to support all 12 locales (9 EU + en-gb/en-us/en-ca). These are: status badge text (compliant/partial/non-compliant), "Updated:" label, and "Generated using" footer text. The component already routes templates by locale — this phase only adds the chrome translations.

</domain>

<decisions>
## Implementation Decisions

### Status Badge Localization
- Expand from binary sv/en at AccessibilityStatement.tsx lines 835-837 to all 12 locales
- Three compliance labels per locale: full, partial, non-compliant
- Should follow the same pattern as Phase 7's STATUS_LABELS map in statement-generator.ts
- en-gb/en-us/en-ca can reuse English labels (same regulatory terminology)
- Store as a locale lookup map (same pattern established in Phase 7)

### Updated Label Localization
- Expand from `'Uppdaterad:'` / `'Updated:'` at line 840 to all 12 locales
- Simple label — one string per locale

### Footer Text Localization
- Expand from `'Genererad med hjälp av'` / `'Generated using'` at line 854 to all 12 locales
- Simple label — one string per locale

### Locale Scope
- All 12 locales: sv, en, no, fi, da, de, fr, es, nl, en-gb, en-us, en-ca
- en-gb/en-us/en-ca use English text for UI chrome (same language, different legal jurisdiction)
- Include nb alias for Norwegian Bokmål (established in Phase 7)

### Claude's Discretion
- Exact translation wording (to be verified in Phase 10)
- Whether to create a separate locale-chrome.ts constants file or keep inline in the component
- Data structure for the lookup maps
- Test approach for verifying chrome translations in rendered output

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AccessibilityStatement.tsx` — single component file containing all three binary sv/en chrome strings
- `effectiveLang` variable already available in render scope for locale routing
- Phase 7's `STATUS_LABELS` map in statement-generator.ts — same compliance labels, can reference for consistency
- 9 inline `TEMPLATES` constant with locale-specific statement content (already routes by locale)

### Established Patterns
- Binary ternary: `effectiveLang === 'sv' ? svText : enText` — same pattern as Phase 7's ternaries, needs replacing with lookup
- Phase 7 established module-level const maps with English fallback (`MAP[lang] || MAP['en']`)
- Component uses `effectiveLang` (derived from `locale` prop) not raw `lang` parameter

### Integration Points
- Status badge text at line 835-837 — nested ternary for compliance level within the sv/en ternary
- Updated label at line 840 — simple ternary
- Footer text at line 854 — simple ternary
- Component test file: `AccessibilityStatement.test.tsx` with 18 existing tests

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow the same locale lookup map pattern established in Phase 7 for consistency between engine and component packages.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-component-ui-chrome-localization*
*Context gathered: 2026-03-04*
