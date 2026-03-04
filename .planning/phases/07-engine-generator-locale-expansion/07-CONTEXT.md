# Phase 7: Engine Generator Locale Expansion - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand `evaluationMethod`, `statusMap`, and date formatting in the engine's Markdown statement generator to correctly handle all 9 EU locales (sv, en, no, fi, da, de, fr, es, nl). Currently these are binary sv/en ternaries with partial coverage for no/da in statusMap only.

</domain>

<decisions>
## Implementation Decisions

### evaluationMethod Localization
- Expand from binary sv/en to all 9 EU locales
- Pattern: "[Automated scan] via @holmdigital/engine" translated per locale
- Swedish reference: "Automatiserad granskning via @holmdigital/engine"
- Use natural translations, not overly formal bureaucratic language
- Store as a locale lookup map (not nested ternaries)

### statusMap Localization
- Expand from sv/no/da + English fallback to all 9 EU locales
- Three status labels per locale: full compliance, partial compliance, non-compliance
- Use standard regulatory language aligned with each country's accessibility directive terminology
- Swedish reference: "Fullt ut forerenlig" / "Delvis forerenlig" / "Inte forerenlig"
- Store as structured lookup (locale -> status -> label)

### Date Formatting
- Replace binary sv-SE/en-US `Intl.DateTimeFormat` locale in html-template.ts
- Map lang codes to proper Intl locale codes (e.g., 'no' -> 'nb-NO', 'da' -> 'da-DK', 'fi' -> 'fi-FI')
- Use same format options across all locales (year: numeric, month: long, day: numeric, hour/minute 2-digit)

### Response Time Default
- Expand the default `responseTime` fallback from binary sv/en to all 9 locales
- This is a fallback default only — users can override via metadata
- Pattern: "2 [days in locale language]"

### Claude's Discretion
- Exact translation wording for each locale (to be verified in Phase 10)
- Whether to extract locale maps to a separate constants file or keep inline
- Data structure for the locale lookup (flat map vs nested object)
- Test approach for verifying locale-specific output

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `statement-generator.ts` — single file containing evaluationMethod (line 122), statusMap (lines 159-163), and responseTime (line 130)
- `html-template.ts` — contains date formatting (line 13) using `getCurrentLang()`
- `i18n/index.ts` — existing i18n module with `getCurrentLang()` and `t()` functions
- 9 JSON template files in `packages/engine/src/reporting/templates/` — already have locale-specific placeholder keys

### Established Patterns
- Binary ternary pattern: `lang === 'sv' ? svText : enText` — needs replacing with lookup
- statusMap uses nested ternary: sv -> no/nb -> da -> English fallback
- `Intl.DateTimeFormat` already used for date formatting, just needs locale parameter expanded
- Substitution map at lines 165-238 already has locale-specific keys for all 9 locales

### Integration Points
- `evaluationMethod` flows into template substitution via `{<metod>}` / `{<method>}` etc. placeholders
- `statusMap` flows into template substitution via `statusString` key
- Date formatting in html-template.ts is independent (HTML report, not statement)
- `responseTime` flows into template substitution via `{<svarstid>}` / `{<response time>}` placeholders

</code_context>

<specifics>
## Specific Ideas

No specific requirements — translations should follow standard accessibility directive terminology used in each EU member state. Phase 10 includes manual review for representative locales.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-engine-generator-locale-expansion*
*Context gathered: 2026-03-04*
