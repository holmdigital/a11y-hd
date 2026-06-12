---
phase: 31
slug: navigationmenu-disclosure-menubar
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-12
audited: 2026-06-12
reconstructed: true
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> **Reconstructed retroactively** (2026-06-12) from 31-01-PLAN.md + 31-01-SUMMARY.md via /gsd-validate-phase — the phase executed 2026-05-12 without a VALIDATION.md.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x + @testing-library/react + @testing-library/user-event + jsdom |
| **Config file** | `packages/components/vitest.config.ts` |
| **Quick run command** | `npm run test -w @holmdigital/components -- NavigationMenu` |
| **Full suite command** | `npm run verify -w @holmdigital/components` |
| **Estimated runtime** | ~6.5 seconds (NavigationMenu only) / ~35 seconds (full components suite) |

---

## Sampling Rate

- **After every task commit:** Run quick command (NavigationMenu file only)
- **After every plan wave:** Run full `npm run verify -w @holmdigital/components`
- **Before `/gsd-verify-work`:** Full suite must be green AND axe-clean smokes must pass for BOTH `pattern="disclosure"` and `pattern="menubar"` under jsdom
- **Max feedback latency:** 35 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | TC-14-IMPL | — | N/A (focus management, no auth surface) | unit | `npm run build -w @holmdigital/components && npm run test -w @holmdigital/components -- NavigationMenu --run` | ✅ | ✅ green |
| 31-01-02 | 01 | 2 | TC-14-IMPL | — | N/A | unit | `npm run test -w @holmdigital/components -- NavigationMenu --run` | ✅ | ✅ green |
| 31-01-03 | 01 | 3 | TC-14-IMPL | — | N/A | full | `npm run verify -w @holmdigital/components` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> Note: the plan's original 4-task draft was merged to 3 at plan-revision time (preflight finding: `noUnusedLocals: true` rejects a shell-only intermediate). The map reflects the 3 executed tasks (commits `10a4294`, `1eb50a4`, `1eb6d34`).

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* Vitest + jsdom + @testing-library/user-event + axe-helper (`expectNoAxeViolations`) proven on Phases 22–30. No new test infra needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Screen-reader announcement of menubar semantics (menu/menuitem roles, submenu expanded state, item position) | TC-14-IMPL | NVDA/VoiceOver announcement strings are not jsdom-observable | Render `<NavigationMenu pattern="menubar">` in a real browser with NVDA active; Tab to menubar; Arrow across items and into submenus; verify role, label, expanded/collapsed state, and position announcements. |
| Native `<a>` activation on Enter for leaf menuitems (real navigation) | TC-14-IMPL | jsdom does not synthesise `<a>` activation on Enter — the automated test proves `defaultPrevented === false` plus element-type preconditions (`tagName === 'A'`, `href` present), but not the actual page navigation | In a real browser, focus the `Help` leaf via End, press Enter, verify the browser navigates to `/help`. Also verify Ctrl+click / middle-click open-in-new-tab semantics survive. |

All other phase behaviors (roving tabindex, Arrow/Home/End, cross-submenu ArrowRight, Escape + stopPropagation, type-ahead, click-outside, Disclosure byte-equivalence, axe-clean) have automated verification.

---

## Observable Test Signals

Signals used by the Tier 2 APG Menubar block (D-02a-clean — no `fireEvent`/`querySelector`/`configureAxe`/`toMatchSnapshot` in the new block; legacy Disclosure block keeps its Phase 24 `fireEvent` exception, whole-file count frozen at 23):

1. **`toHaveFocus()`** — DOM focus state (roving anchor + submenu focus injection)
2. **`getAttribute('tabindex')`** — `"0"` on the single active item, `"-1"` elsewhere (roving invariant)
3. **`aria-expanded` / `aria-haspopup` / role queries** — `getByRole('menubar')`, `getByRole('menuitem', { name })`, `getByRole('menu')` for open-state transitions
4. **`event.defaultPrevented === false`** via `dispatchEvent` — D-04 leaf native-activation contract (jsdom limitation workaround, see SUMMARY deviation #1)
5. **`expectNoAxeViolations`** — axe-clean smokes for both patterns (closed + one-submenu-open)

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none — existing infra sufficient)
- [x] No watch-mode flags
- [x] Feedback latency < 35s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** reconstructed and approved 2026-06-12 (retroactive Nyquist audit; execution completed 2026-05-12)

---

## Validation Audit 2026-06-12

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 3 tasks COVERED at HEAD (components 2.7.2, post-Phase-34): `NavigationMenu.test.tsx` runs 43/43 green
(20 Tier 1 + Disclosure tests preserved byte-equivalent, 20 new APG Menubar `it()` blocks, 3 axe smokes),
full `npm run verify -w @holmdigital/components` exits 0. D-02a gate clean in the new block (0 `fireEvent` /
`querySelector` / `configureAxe` / `toMatchSnapshot`); whole-file `fireEvent` invariant holds at exactly 23;
26 `toHaveFocus|tabIndex` assertions; `MENUBAR_ITEMS` fixture present. VALIDATION.md did not exist —
reconstructed from PLAN/SUMMARY (State B); no new tests required. Two manual-only items documented
(screen-reader announcements; real-browser native `<a>` Enter navigation).
