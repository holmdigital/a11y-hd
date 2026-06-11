---
phase: 34
slug: klarsprak-plain-language-report
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-11
---

# Phase 34 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.16 (existing, both packages) |
| **Config file** | `vitest.config.ts` per package (existing) |
| **Quick run command** | `npm run test:ci -w @holmdigital/standards` / `npm run test:ci -w @holmdigital/engine` |
| **Full suite command** | `npm run verify -w @holmdigital/standards && npm run verify -w @holmdigital/engine` |
| **Estimated runtime** | ~30–60 seconds per package (test:ci); verify chains build+lint+typecheck+exports+tests |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:ci -w @holmdigital/standards` (standards tasks) or `npm run test:ci -w @holmdigital/engine` (engine tasks)
- **After every plan wave:** Run `npm run verify -w @holmdigital/standards && npm run verify -w @holmdigital/engine`
- **Before `/gsd:verify-work`:** Full verify green in both packages + manual johancask.com scan (terminal + PDF)
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

> Task IDs assigned at planning. Requirement-level rows below; planner maps each to task IDs.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | PLAIN-01 (typ + fält) | — | N/A | type-check | `npm run typecheck -w @holmdigital/standards` | ✅ (tsc covers) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-02 (enrichment sv) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (index.test.ts gap) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-02 (D-03 EN-fallback för de/fr/...) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (index.test.ts gap) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-03 (sortering per impactLevel-rank) | — | N/A | unit | `npm run test:ci -w @holmdigital/engine` | ❌ W0 (plain-report.test.ts saknas) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-03 (fallback till remediation.description) | — | N/A | unit | `npm run test:ci -w @holmdigital/engine` | ❌ W0 (plain-report.test.ts) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-03 (tom-state vid 0 reports) | — | N/A | unit | `npm run test:ci -w @holmdigital/engine` | ❌ W0 (plain-report.test.ts) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-06 / D-10.1 (encoding-vakt: inga Ã, korrekta å/ä/ö) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (index.test.ts gap) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-06 / D-10.2 (ton-lint: inga —/–/% i sv+en) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (index.test.ts gap) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-06 / D-10.3 (sv/en-paritet: samma 8 id + identiska impactLevel) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (index.test.ts gap) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-04 (flaggor `--audience`/`--plain`) | — | N/A | manual | `npx hd-a11y-scan https://johancask.com --plain` | Manual (D-09 Karin-grind) | ⬜ pending |
| TBD | TBD | TBD | PLAIN-05 (klarspråks-PDF utan score/WCAG-tabeller) | — | N/A | manual | `npx hd-a11y-scan https://johancask.com --plain --pdf karin.pdf` | Manual (D-09 Karin-grind) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/standards/src/index.test.ts` — D-10.1 encoding-vakt, D-10.2 ton-lint, D-10.3 sv/en-paritet, PLAIN-02 enrichment-assertions (utöka befintlig fil)
- [ ] `packages/engine/src/reporting/plain-report.test.ts` — ny fil: D-10.4 renderar-struktur (sortering, badge-mappning, fallback, tom-state)

*Framework finns redan — ingen installation behövs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Terminal-klarspråk end-to-end mot riktig sajt | PLAIN-04 | Kräver live Puppeteer-skanning + mänsklig tonbedömning | `npx hd-a11y-scan https://johancask.com --plain` — verifiera öppning, badges, sortering, neutral avslutning |
| Klarspråks-PDF för Karins granskning | PLAIN-05 | Leveransgrind (D-09): redaktionellt godkännande | `npx hd-a11y-scan https://johancask.com --plain --pdf karin.pdf` — ingen score, inga WCAG/DIGG-tabeller, sidfot med URL/datum/version |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
