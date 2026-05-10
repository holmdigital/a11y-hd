---
phase: 25
phase_name: AccessibilityStatement publishDate Fix + Regression Guards
date: 2026-05-10
requirements: STMT-01, STMT-02, STMT-03
---

# Phase 25 Context

## Domain

Replace the misleading `'2024-01-01'` `publishDate` fallback (14 locale replacement slots in `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`, lines 424–562) with a `[YOUR PUBLISH DATE]` placeholder so the missing-data state is obvious. Add two regression-guard tests so neither this bug nor the previously-fixed US `{<national_law>}` placeholder bug (commit 859f301) can silently re-occur.

Goal is local — change `AccessibilityStatement.tsx` source + test additions, no API breaks. The 131 existing tests in `AccessibilityStatement.test.tsx` cover the prose surface; the regression guards are net-new safety nets.

## Canonical Refs

- `.planning/ROADMAP.md` — Phase 25 goal + success criteria (3 items)
- `.planning/REQUIREMENTS.md` — STMT-01, STMT-02, STMT-03
- `.planning/PROJECT.md` — milestone v0.6 Components Quality scope
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` — source containing 14 publishDate replacement slots (lines 424, 425, 487, 493, 498, 503, 511, 520, 528, 538, 546, 554, 562)
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx` — existing 131-test prose-surface coverage
- `packages/components/TESTING-CONVENTIONS.md` — Phase 22 conventions (WCAG-SC marker, helper imports, D-02a anti-pattern gate)
- `packages/components/scripts/check-wcag-headers.mjs` — Phase 22 reference for repo-level guard scripts (relevant pattern for one resolved decision below)
- Commit `859f301` — `fix(components): handle US country in AccessibilityStatement national_law` (the regression STMT-03 guards against)

## Code Context

**Current state (read at discussion time):**
- `AccessibilityStatement.tsx:106` declares `publishDate?: Date` (optional)
- `AccessibilityStatement.tsx:386` destructures `publishDate` from props
- `AccessibilityStatement.tsx:424–562` contains 14 occurrences of `publishDate ? d(publishDate) : '2024-01-01'` across locale-specific replacement maps. The placeholder keys vary per locale: `{<publiceringsdatum>}` (sv), `{<publish date>}` (en), `{<publiseringsdatum>}` (no), `{<publiseringsdato>}` (alt-no), `{<offentliggørelsesdato>}` (da), `{<veröffentlichungsdatum>}` (de), `{<date_publication>}` (fr), `{<fecha_publicacion>}` (es), `{<julkaisupäivä>}` (fi), `{<publicatiedatum>}` (nl), `{<data_pubblicazione>}` (it), `{<data_publicacao>}` (pt), `{<data_publikacji>}` (pl).
- `AccessibilityStatement.test.tsx:26` uses `publishDate: new Date('2024-01-15')` as the test fixture publishDate (different value, NOT the bug — leave it alone).
- `d()` is the locale-aware date formatter; the placeholder substitutes the entire string the formatter would produce, so the placeholder MUST replace the `d(publishDate)` call result, not be wrapped inside it.

**Phase 22 conventions in scope:**
- WCAG-SC JSDoc header marker required on every new `*.test.tsx` file (`npm run test:wcag-headers` enforces it)
- D-02a anti-pattern gate: 0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot` in test files
- Test helpers available from `_test/helpers.ts`: `expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`
- Use `getByRole`/`getByText` over DOM traversal; mirror `Button.test.tsx` structure for new test files

## Decisions

### Placeholder text — English everywhere
Use the literal string `[YOUR PUBLISH DATE]` in **all 14 locale slots** — no translation. Rationale: matches ROADMAP phrasing exactly, harder to miss in code review, signals "configuration error" clearly across all consumers, and a translation slip could make the placeholder look like real content.

**Implementation note:** every `publishDate ? d(publishDate) : '2024-01-01'` becomes `publishDate ? d(publishDate) : '[YOUR PUBLISH DATE]'`. The 14 sites are mechanical search-replace; verify with grep that 0 `'2024-01-01'` literals remain.

### Test placement — new sibling file `AccessibilityStatement.regression.test.tsx`
Both regression-guard tests (STMT-02 + STMT-03) live in a new file at `packages/components/src/AccessibilityStatement/AccessibilityStatement.regression.test.tsx`. Rationale: keeps the 131-test main file focused on behavior; future regression guards get a clear home; matches Phase 22's "one test file per concern" pattern.

**Implementation note:**
- File MUST carry a WCAG-SC JSDoc header marker (Phase 22 CI gate)
- File MUST follow Phase 22's D-02a gate (0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot`)
- STMT-02 (file-content grep): use `fs.readFileSync` + `.toString().includes('2024-01-01')` style assertion within a vitest test; iterate over `*.{ts,tsx}` files under `packages/components/src/`. This keeps the guard discoverable in vitest runs, no separate npm script needed.
- STMT-03 (US render): mount `<AccessibilityStatement country="US" />`, assert rendered text contains zero `{<national_law>}` (and no other unsubstituted `{<...>}` patterns matching the live-bug shape).

### Prop behavior — render placeholder literal in date slot
Keep `publishDate?: Date` optional. When undefined, every replacement substitutes `[YOUR PUBLISH DATE]` directly into the prose (no console.warn, no breaking change to required-prop). Smallest diff, fits the patch-version cadence of v0.6 Components Quality milestone.

### Test fixture preservation
The existing test fixture at line 26 (`publishDate: new Date('2024-01-15')`) is **NOT** the bug — it's a deliberate fixture date inside a test file. Leave it untouched. STMT-02's grep guard targets `2024-01-01` (the bug literal), not `2024-01-15`.

## Deferred Ideas

- **Console-warn for missing publishDate** — would help dev-time discoverability but adds SSR consideration (the engine package SSR-renders this component). Out of scope for v0.6; revisit if user complaints surface in v0.7+.
- **`publishDate` becomes required (breaking change)** — would eliminate the placeholder path entirely. Belongs in a future major version (v1.0+), not this patch milestone.
- **Localized placeholder text per locale** — would read more naturally but adds review surface and translation-slip risk. If consumer feedback ever shows English placeholders are too jarring, revisit.

## Constraints

- Do not break the 131 existing prose-surface tests in `AccessibilityStatement.test.tsx`
- No API changes (`publishDate` stays optional)
- No literal `'2024-01-01'` may remain in component source after the fix (STMT-02 enforces)
- US country path must continue to use both ADA Title III + REHAB Section 504 references (commit 859f301 + 2.5.1 Section 504 work) — STMT-03 guards the placeholder shape but must not assert specific law text that could legitimately change

## Success Criteria (from ROADMAP)

1. All 14 locale entries use `'[YOUR PUBLISH DATE]'` instead of `'2024-01-01'` — verified by grep
2. STMT-02 regression test asserts no literal `2024-01-01` in `packages/components/src/**/*.{ts,tsx}` (excluding test fixtures that legitimately use other 2024-XX-XX dates)
3. STMT-03 regression test renders `<AccessibilityStatement country="US" />` and asserts zero literal `{<national_law>}` placeholders in output

## Next Steps

`/gsd-plan-phase 25` — small phase, likely 1–2 plans (one for source change + STMT-01, one for regression guards STMT-02 + STMT-03; or all three in a single plan).
