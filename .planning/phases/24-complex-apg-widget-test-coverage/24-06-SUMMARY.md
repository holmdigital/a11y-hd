# Plan 24-06 SUMMARY — NavigationMenu test suite (TC-14)

**Phase:** 24
**Plan:** 06 (Wave 1 — final parallel test plan)
**Date:** 2026-05-11
**Status:** COMPLETE

## What landed

Created `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` — 335 LOC, 20 `it()` blocks across Tier 1 (6) and Tier 2 (14).

**Pattern tested:** APG **Disclosure** (per D-06), NOT Menubar. NavigationMenu source self-documents (file JSDoc line 26) as Disclosure pattern — each top-level item has a button trigger that toggles its submenu independently, Escape closes the open submenu, click-outside closes.

## Commits

- `8674374` — test(24-06): add NavigationMenu Disclosure-pattern test suite (TC-14)

## Verification

- 20/20 new tests pass
- Full components suite green at time of merge
- WCAG-SC marker: 4 SCs documented (1.3.1, 2.1.1, 2.4.3, 4.1.2)
- D-02a clean: 0 `querySelector` / `configureAxe` / `toMatchSnapshot`
- 2× `expectNoAxeViolations` smokes (closed + open render states)
- 4× `waitFor(` calls handling source's `requestAnimationFrame` focus shift (Pitfall 5)
- 3× `TC-14-IMPL` backlog refs in JSDoc (deferred Menubar upgrade)
- `queryAllByRole('menuitem')` returns 0 — confirms Disclosure pattern (not Menubar)

## Deviations (Rule 1, documented)

1. **Escape close half masked by source focus-parity race.** Source's Escape handler does `setIsOpen(false)` then `triggerRef.focus()`, but the programmatic focus re-fires `<li> onFocus={handleEnter}` within the same React batch, re-opening the dropdown. The test asserts only the focus-return half of the Disclosure Escape contract; the close half is deferred to TC-14-IMPL (v0.7 Menubar upgrade decouples Escape from focus-parity). Source NOT modified per "create exactly ONE file" constraint.

2. **userEvent focus-parity race** on click/Enter/Space toggle tests — resolved in-test by switching to `fireEvent.click` + `fireEvent.keyDown` (no synthetic focus event), exercising the `onClick` toggle in isolation. The focus-opens-dropdown affordance is asserted in its own dedicated test.

## Backlog refs

- **TC-14-IMPL** (v0.7): NavigationMenu APG Menubar upgrade — Arrow horizontal/vertical along menubar, Home/End first/last, Enter activates leaf, type-ahead. Currently APG Disclosure; upgrade decouples Escape from focus-parity (resolves deviation 1) and adds menubar keyboard contract.

## Files

- `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` (new)

## Not modified

- `packages/components/src/NavigationMenu/NavigationMenu.tsx` (source untouched per D-01 test-only scope)
- `package.json` (no test:ci changes needed in this plan)

---

*Backfilled 2026-05-11 during milestone v0.6 close-out — original execution had inline completion report only; this SUMMARY captures the persisted record per Phase 24 convention.*
