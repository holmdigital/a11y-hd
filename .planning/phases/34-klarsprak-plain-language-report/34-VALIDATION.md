---
phase: 34
slug: klarsprak-plain-language-report
status: ready
nyquist_compliant: true
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

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 34-01-01 | 01 | 1 | PLAIN-01 (typ + fält, D-15 båda typerna) | — | N/A | type-check | `npm run typecheck -w @holmdigital/standards` | ✅ (tsc covers) | ⬜ pending |
| 34-01-01 | 01 | 1 | PLAIN-06 / D-10.1–.3 (vakter, RED-stubbar) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (skapas i tasken) | ⬜ pending |
| 34-01-02 | 01 | 1 | PLAIN-06 / D-10.1–.3 (8 sv + 8 en texter → GREEN) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (34-01-01) | ⬜ pending |
| 34-02-01 | 02 | 2 | PLAIN-02 (enrichment sv + D-03 EN-fallback + D-11) | — | N/A | unit | `npm run test:ci -w @holmdigital/standards` | ❌ W0 (index.test.ts-utökning) | ⬜ pending |
| 34-03-01 | 03 | 1 | D-01/D-14 (chrome-nycklar i alla 9 locale-filer, atomiskt) | T-34-11 | Ingen partiell locale-uppdatering | type-check | `npm run typecheck -w @holmdigital/engine` | ✅ (tsc covers) | ⬜ pending |
| 34-04-01 | 04 | 2 | D-13 (snapshot-baseline developer-PDF, 2-args) | T-34-12 | Byte-för-byte-lås före audience-param | unit | `npm run test:ci -w @holmdigital/engine` | ❌ W0 (html-template.test.ts skapas) | ⬜ pending |
| 34-04-02 | 04 | 2 | PLAIN-03 / D-10.4 (renderartester: sortering, badges, fallback, tom-state — RED) | — | N/A | unit | `npm run test:ci -w @holmdigital/engine` | ❌ W0 (plain-report.test.ts skapas) | ⬜ pending |
| 34-04-03 | 04 | 2 | PLAIN-03 (renderaren → GREEN; D-05 ingen score) | — | N/A | unit | `npm run test:ci -w @holmdigital/engine` | ❌ W0 (34-04-02) | ⬜ pending |
| 34-05-01 | 05 | 3 | PLAIN-04 / D-12 (flaggor + grenordning json > light > plain) | — | N/A | type-check | `npm run typecheck -w @holmdigital/engine` | ✅ (tsc covers) | ⬜ pending |
| 34-05-02 | 05 | 3 | PLAIN-05 / D-08, D-13, D-16 (plain-PDF + snapshot grön + versionskälla) | T-34-13 | result.url HTML-escapas; snapshot orörd | unit | `npm run test:ci -w @holmdigital/engine` | ❌ W0 (34-04-01) | ⬜ pending |
| 34-05-03 | 05 | 3 | Changesets (standards 2.7.0 minor, engine 2.6.0 minor) | — | N/A | CLI | `npx changeset status` | ✅ | ⬜ pending |
| 34-05-04 | 05 | 3 | PLAIN-04 + PLAIN-05 (D-09 Karin-grind, manuell) | — | N/A | manual | `npx hd-a11y-scan https://johancask.com --plain` + `--plain --pdf karin.pdf` | Manual checkpoint | ⬜ pending |

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

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (verifierat av plan-checker, Dimension 8a)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (Dimension 8c)
- [x] Wave 0 covers all MISSING references (index.test.ts-utökningar i 34-01/34-02; plain-report.test.ts i 34-04; html-template.test.ts i 34-04)
- [x] No watch-mode flags
- [x] Feedback latency < 120s (typecheck/test:ci, ~30–60 s per paket)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-11 (plan-checker VERIFICATION PASSED, 0 blockers)
*`wave_0_complete` förblir `false` tills exekveringen skapat testfilerna — flippas av execute-phase.*
