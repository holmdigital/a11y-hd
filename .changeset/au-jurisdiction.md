---
"@holmdigital/standards": minor
"@holmdigital/engine": minor
"@holmdigital/components": minor
---

feat: add Australia as supported jurisdiction (DDA, AHRC, en-au)

- Extended `LegalFramework` type with `'DDA'` — first non-EU framework
- Added `'AU'` to `Country` type (17 countries total)
- DDA + DTA law entries in `national-laws.json` with AHRC enforcement body
- `en-au` AccessibilityStatement template with voluntary DDA framing and AHRC complaint pathway
- `en-au.json` engine statement template with DDA-specific prose
- `.au` TLD auto-detection (.au, .com.au, .gov.au)
- Critical `{<national_law>}` DDA fallback fix for non-WAD/EAA frameworks
- 292 tests across 3 packages with full auto-syncing coverage
