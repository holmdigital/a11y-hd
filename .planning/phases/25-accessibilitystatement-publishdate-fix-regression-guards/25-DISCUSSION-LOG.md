# Phase 25 Discussion Log

**Date:** 2026-05-10
**Phase:** 25 — AccessibilityStatement publishDate Fix + Regression Guards

## Areas Discussed

### Placeholder text
**Question:** Should the placeholder text be localized per-locale, or kept as one English string everywhere?

**Options presented:**
- English everywhere — `[YOUR PUBLISH DATE]`
- Localized per-locale (e.g., SV: `[DITT PUBLICERINGSDATUM]`, DE: `[IHR VERÖFFENTLICHUNGSDATUM]`)
- Empty string only

**User choice:** English everywhere — `[YOUR PUBLISH DATE]`

**Rationale:** matches ROADMAP phrasing exactly, harder to miss in code review, signals configuration error clearly, eliminates translation-slip risk.

### Test placement
**Question:** Where should the 2 regression-guard tests live?

**Options presented:**
- New file `AccessibilityStatement.regression.test.tsx`
- Append to existing `AccessibilityStatement.test.tsx`
- Mix — file-grep guard at repo level, render guard in test file

**User choice:** New file `AccessibilityStatement.regression.test.tsx`

**Rationale:** keeps the 131-test main file focused on behavior; dedicated home for future regression guards; matches Phase 22's "one test file per concern" pattern.

### Prop behavior
**Question:** Which `publishDate` prop default behavior do you want when the consumer doesn't pass one?

**Options presented:**
- Render placeholder literal in date slot
- Console-warn + render placeholder
- Make `publishDate` required (breaking change)

**User choice:** Render placeholder literal in date slot

**Rationale:** smallest diff, fits the patch-version cadence of v0.6 Components Quality milestone, no breaking-change overhead.

## Deferred Ideas

- Console-warn for missing `publishDate` — would help dev-time discoverability but adds SSR consideration; revisit in v0.7+ if user complaints surface
- `publishDate` becomes required — belongs in a future major (v1.0+), not this patch milestone
- Localized placeholder text per locale — revisit if English placeholders prove too jarring in production

## Claude's Discretion (not asked)

- 14-slot mechanical search-replace strategy (every `publishDate ? d(publishDate) : '2024-01-01'` → `'[YOUR PUBLISH DATE]'`) — chosen by Claude as the obvious implementation approach
- STMT-02 implemented as a vitest test using `fs.readFileSync` over `*.{ts,tsx}` files (not as a separate npm script `check-no-stale-publishdate.mjs`) — keeps the guard discoverable in test runs and avoids growing the npm-script surface for a single bug class
- Test fixture at `AccessibilityStatement.test.tsx:26` (`publishDate: new Date('2024-01-15')`) preserved — different literal than the `'2024-01-01'` bug, legitimate test fixture
- STMT-03 assertion shape: `{<national_law>}` literal absence (not specific law text that could legitimately change as standards data evolves)
