---
phase: 32
slug: tc-15-remaining-component-test-coverage
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-12
audited: 2026-06-12
reconstructed: true
---

# Phase 32 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> **Reconstructed retroactively** (2026-06-12) from 32-01…32-08 PLAN.md + 5 SUMMARY.md files via /gsd-validate-phase — the phase executed 2026-05-12 without a VALIDATION.md.
> Meta-note: this phase's deliverables ARE test files (TC-15 closure), so the per-task verification IS the deliverable itself running green plus the Phase 22 structural gates.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x + @testing-library/react + @testing-library/user-event + jsdom + `expectNoAxeViolations` axe helper |
| **Config file** | `packages/components/vitest.config.ts` |
| **Quick run command** | `cd packages/components && npx vitest run src/<Component>/<Component>.test.tsx` |
| **Full suite command** | `npm run verify -w @holmdigital/components` |
| **Estimated runtime** | ~8 seconds (all 8 TC-15 files, 114 tests) / ~60–90 seconds (full verify: build + exports + types + test:ci) |

> **Windows gotcha (load-bearing):** `npm run test -w @holmdigital/components -- <pattern>` does NOT forward the pattern through the workspace boundary on this host (npm consumes the `--`). Always use the direct `cd packages/components && npx vitest run <path>` form. Confirmed during Waves 1–3 and re-confirmed at audit time.

---

## Sampling Rate

- **After every task commit:** Run quick command on the touched component's test file (~1–2 s/file)
- **After every plan wave:** Run all 8 TC-15 files together (~8 s)
- **Before `/gsd-verify-work`:** Full `npm run verify -w @holmdigital/components` must exit 0 (includes `test:wcag-headers`, `check:no-tailwind-leak`, `check:no-test-leak`)
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 32-01-01 | 01 | 1 | TC-15 | — | N/A (test-only; no auth surface) | unit | `npx vitest run src/Card/Card.test.tsx` | ✅ | ✅ green (13 cases) |
| 32-02-01 | 02 | 1 | TC-15 | — | N/A | unit | `npx vitest run src/Skeleton/Skeleton.test.tsx` | ✅ | ✅ green (13 cases) |
| 32-03-01 | 03 | 1 | TC-15 | — | N/A | unit | `npx vitest run src/Heading/Heading.test.tsx` | ✅ | ✅ green (13 cases) |
| 32-04-01 | 04 | 1 | TC-15 | — | N/A | unit | `npx vitest run src/SkipLink/SkipLink.test.tsx` | ✅ | ✅ green (11 cases) |
| 32-05-01 | 05 | 2 | TC-15 | — | N/A | unit | `npx vitest run src/ProgressBar/ProgressBar.test.tsx` | ✅ | ✅ green (18 cases) |
| 32-06-01 | 06 | 2 | TC-15 | — | N/A | unit | `npx vitest run src/Switch/Switch.test.tsx` | ✅ | ✅ green (15 cases) |
| 32-07-01 | 07 | 2 | TC-15 | — | N/A | unit | `npx vitest run src/Pagination/Pagination.test.tsx` | ✅ | ✅ green (16 cases) |
| 32-08-01 | 08 | 3 | TC-15 | — | N/A | unit | `npx vitest run src/Tooltip/Tooltip.test.tsx` | ✅ | ✅ green (15 cases) |
| 32-08-02 | 08 | 3 | TC-15 | — | N/A | script | `grep -c "## 2.6.0" packages/components/CHANGELOG.md` returns 1; version ≥ 2.6.0 | ✅ | ✅ green |
| 32-08-03 | 08 | 3 | TC-15 | — | N/A | human gate | — (checkpoint:human-verify — full verify + visual smoke) | — | ✅ approved 2026-05-12 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> Notes:
> - Plan 08 Task 2's original verify asserted `version === '2.6.0'`; that literal check is stale at HEAD (components shipped 2.7.0/2.7.2 since). The durable invariant is the `## 2.6.0` CHANGELOG entry + monotonically advanced version, both verified at audit time.
> - Case counts are runtime test cases (`it.each` expanded). Literal `it(` lines at HEAD: Card 9, Skeleton 10, Heading 7, SkipLink 11, ProgressBar 14, Switch 15, Pagination 16, Tooltip 15.
> - Known commits: 32-02 `4f8a3c2`, 32-04 `d9c2436`, 32-05 `e83f30f`, 32-07 `fa0f203`, 32-08 `752ea7d` + `1a2deb4`. Wave 1 bundling race put Card + Heading in the same commit (`43cf5ad`) — files intact, history muddied; Wave 2 onward used pathspec-scoped commits.

---

## Structural Gates (Phase 22 template-setter pillars, re-verified at audit)

All 8 files pass at HEAD:

| Gate | Card | Skeleton | Heading | SkipLink | ProgressBar | Switch | Pagination | Tooltip |
|------|------|----------|---------|----------|-------------|--------|------------|---------|
| `WCAG SCs covered:` in first 30 lines | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Tier 1: Table Stakes` describe | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Tier 2:` describe | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ≥1 `expectNoAxeViolations` call | ✅ (2) | ✅ (2) | ✅ (2) | ✅ (2) | ✅ (2) | ✅ (2) | ✅ (2) | ✅ (1) |
| D-02a blocklist hits | 0 | 0 | 0 | 0 | 0 | 0 | 0 | waiver* |

*\*Tooltip D-02a waiver: 18 `fireEvent` lines, ALL confined to the legacy SC 1.4.13 block (0 occurrences after the appended `Tier 1: Table Stakes` describe); `querySelector`/`configureAxe`/`toMatchSnapshot` = 0 file-wide; `D-02a waiver` JSDoc marker present. Waiver rationale: fake-timers + user-event v14 + vitest 4 deadlock (STATE.md Plan 27-01).*

`test:wcag-headers` gate: ok — 31 test file(s) all carry the marker (29 colocated + `_hooks/useFocusTrap` + `AccessibilityStatement.regression`).

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* Vitest + jsdom + @testing-library/user-event + axe helper (`expectNoAxeViolations`) proven on Phases 22–31. No new test infra was needed; none is needed now.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SkipLink visual reveal on focus (Tailwind `-translate-y-[150%] → focus:translate-y-0`) | TC-15 | jsdom returns empty strings for computed transforms — only focus reachability is automatable | In a real browser, load a page with `<SkipLink />`, press Tab from the address bar; verify the link becomes visible on focus and clicking it moves focus/scroll to `#main`. |
| ProgressBar variant color contrast (SC 1.4.3 across primary/success/warning/danger) | TC-15 | axe contrast rules need real rendering (layout + computed colors); deferred per PUB-07 | Run a real-browser axe scan (e.g. via `npx hd-a11y-scan`) on a page rendering all four variants; verify zero contrast violations. |
| Screen-reader behavior: Skeleton silence (aria-hidden), Switch state announcements (role=switch + aria-checked), Pagination current-page announcement (aria-current) | TC-15 | ARIA wiring is automated; actual NVDA/VoiceOver announcement strings are not jsdom-observable | With NVDA: (1) verify Skeleton placeholders produce no announcement; (2) Tab to a Switch, toggle with Space, verify "on/off" state announcements; (3) navigate Pagination, verify "current page" is announced on the active page button. |
| Tooltip real-pointer hover semantics (hover-bridge, 1.4.13 dismiss/hoverable/persistent under real timing) | TC-15 | jsdom-level races are covered by the legacy fireEvent block under the D-02a waiver; real pointer + real timers behavior is browser-only | In a real browser: hover the trigger, move pointer across the gap onto the tooltip (must stay open), press Escape (must close without moving focus), re-hover (must reopen). |

All other phase behaviors (render contracts, ARIA attribute wiring, keyboard toggle/parity, boundary clamping/disabling, focus order, axe smokes) have automated verification.

---

## Observable Test Signals

Signals used across the 8 suites (all D-02a-clean outside the Tooltip legacy waiver block):

1. **`getByRole` queries** — `progressbar`, `switch`, `navigation`, `link`, `heading {level}`, `tooltip`, `button {name}` — role contracts are the Tier-2 backbone
2. **`toHaveAttribute` on ARIA state** — `aria-hidden` (Skeleton), `aria-checked` (Switch), `aria-valuenow/min/max/valuetext` incl. clamping (ProgressBar), `aria-current="page"` + `aria-disabled` (Pagination), `href="#<targetId>"` (SkipLink)
3. **`document.activeElement` after `user.tab()`** — SkipLink Bypass-Blocks proof (2.4.1); Pagination Tab order
4. **`vi.fn()` callback assertions with click+keyboard parity** — Switch Space/Enter toggle + disabled-blocks-both; Pagination boundary-disabled click + Enter no-op (D-02a parity rule)
5. **`expectNoAxeViolations`** — ≥1 axe smoke per file (15 calls total across the 8 files)
6. **`container.firstChild` tagName walks** — Card `as` polymorphism, Pagination `totalPages<=1 → null` (querySelector-free per D-02a)
7. **`getElementsByClassName`** — Skeleton class hooks (documented Plan 22-05 allowance; not on the D-02a blocklist)
8. **Structural grep gates** — WCAG-header marker, Tier describes, anti-pattern blocklist (enforced repo-wide by `check-wcag-headers.mjs` + per-plan acceptance greps)

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (9 automated + 1 human gate, approved at phase close)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none — existing infra sufficient)
- [x] No watch-mode flags (all commands use `vitest run` / `--run`)
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** reconstructed and approved 2026-06-12 (retroactive Nyquist audit; execution completed 2026-05-12)

---

## Validation Audit 2026-06-12

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 10 tasks COVERED at HEAD (components 2.7.2, post-Phase-34): the 8 TC-15 suites run **114/114 green** in 7.6 s
(Card 13, Skeleton 13, Heading 13, SkipLink 11, ProgressBar 18, Switch 15, Pagination 16, Tooltip 15 — matching
the 32-08-SUMMARY table exactly), and full `npm run verify -w @holmdigital/components` exits 0 (build, publint,
attw, vitest, wcag-headers 31-file ok, no-tailwind-leak, no-test-leak). Structural gates re-verified per file
(header marker, Tier 1+2 describes, axe smokes, D-02a 0 hits in the 7 new files; Tooltip waiver intact and
correctly scoped — 0 banned tokens after the appended blocks). Release artifacts hold: CHANGELOG `## 2.6.0`
entry present, version advanced past 2.6.0. The mid-phase "Vitest failed to find the runner" blocker that forced
structural-only acceptance of 32-02/32-03 was subsumed by 32-08's full verify and does not reproduce at audit
time via the documented `npx vitest run` invocation. VALIDATION.md did not exist — reconstructed from
PLAN/SUMMARY artifacts (State B); no new tests required. Four manual-only items documented (visual focus reveal,
variant contrast/PUB-07, screen-reader announcements, real-pointer tooltip timing).
