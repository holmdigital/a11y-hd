---
"@holmdigital/standards": patch
"@holmdigital/components": patch
"@holmdigital/engine": patch
---

v0.1 Stability Pass — type safety, version accuracy, and locale coverage

**@holmdigital/standards**
- Added typed `FailingNode`, `EnrichedReport`, and `LegalContext` interfaces
- Tightened `HolmDigitalInsight` type (removed index signature, added `reasoning` field)
- All type exports are now fully typed with zero `as any` casts

**@holmdigital/components**
- `AccessibilityStatement` now supports 9 locales: en, sv, no, fi, da, nl, de, fr, es
- Fixed placeholder substitution across all locales (Norwegian `publiseringsdato` bug)
- FormField accessibility and ESM compatibility fix
- Button component now spreads `...props` to `<button>` element (fixes onClick, aria-label, type being silently dropped)

**@holmdigital/engine**
- Build-time version injection via tsup `define` — replaces 3 hardcoded version strings
- Zero `as any` casts in production code (was 4)
- Scan results return fully typed `EnrichedReport[]` with `failingNodes` and `legalContext`
- Upgraded axe-core from 4.10.2 to 4.11.1
