# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v0.1 — a11y-hd Stability Pass

**Shipped:** 2026-03-03
**Phases:** 5 | **Plans:** 9 | **Sessions:** ~3

### What Was Built
- Typed scan result pipeline: `FailingNode`, `EnrichedReport`, tightened `HolmDigitalInsight`
- Build-time version injection replacing 3 stale hardcoded version strings
- Zero `as any` in production code across all 3 packages
- 9-locale `AccessibilityStatement` with complete placeholder substitution (was 3 locales)
- 22 new tests covering enrichment, version, locale routing, and placeholder leakage

### What Worked
- Strict dependency ordering (standards -> components -> engine) prevented cascading type errors
- Parallel plan execution within waves — both Phase 5 plans ran simultaneously with no conflicts
- Research phase caught the 4th Norwegian placeholder bug (`publiseringsdato`) that was missed in context discussion
- Real standards data in tests (no mocking) caught data-shape assumptions early
- YOLO mode eliminated confirmation overhead — smooth automated flow

### What Was Inefficient
- Phase 4 context discussion identified 3 Norwegian placeholder bugs; researcher found a 4th — the context scout could have been more thorough
- Some SUMMARY.md files lack `requirements-completed` frontmatter (01-02 missing TS-04) — minor documentation gap
- `phase complete` tool reported `is_last_phase: true` for Phase 4 even though Phase 5 existed — tool bug worked around manually

### Patterns Established
- `// @vitest-environment jsdom` pragma for component tests without vitest.config.ts
- Bracket notation `(instance as any)['privateMethod']()` for testing private methods without production code changes
- `container.innerHTML` string assertions instead of `@testing-library/jest-dom` matchers — lighter weight
- `effectiveLang` pattern: separate locale lookup from fallback to enable `console.warn` on miss
- Inline `StatementTemplate` objects per file rather than cross-package imports (dependency direction)

### Key Lessons
1. Research agents finding bugs that context discussion missed validates the research step — don't skip it
2. Build-time `define` blocks need matching vitest config — always pair tsup.config.ts changes with vitest.config.ts
3. Template placeholder systems need per-locale mapping tables — generic substitution breaks when languages use different placeholder names
4. Private method testing via bracket notation is an acceptable pattern when "no production code changes" is a constraint

### Cost Observations
- Model mix: ~60% opus (execution), ~30% sonnet (verification), ~10% haiku (exploration)
- Sessions: ~3 across 2 days
- Notable: Average plan execution time was 3 minutes — very efficient for the scope

---

## Milestone: v0.2 — Full Localization

**Shipped:** 2026-03-05
**Phases:** 5 | **Plans:** 8 | **Sessions:** ~3

### What Was Built
- ESM build fixed with tsup `shims: true` — zero warnings in CJS and ESM output
- 9-locale lookup maps for evaluationMethod, statusMap, responseTime, date formatting (engine)
- 12-locale UI chrome (BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT) via locale-chrome.ts (component)
- en-gb/en-us/en-ca jurisdiction-specific statement templates with PSBAR 2018, Section 508/ADA, ACA/AODA references
- TLD-based country detection (.uk→GB, .us→US, .ca→CA) with ENFORCEMENT_BODIES integration
- 127 automated locale tests (31 engine + 80 component + 16 standards), zero failures
- Structured VERIFICATION.md with per-locale manual review checklists

### What Worked
- Parallel plan execution in Wave 1 (Phases 9 plans had zero file overlap between engine/component)
- Phase 9 researcher caught the critical chrome lookup breakage pitfall before planning — changing supportedLocales from `'en-gb': 'en'` to `'en-gb': 'en-gb'` would break chrome map lookups unless locale-chrome.ts got matching entries
- Module-level const map pattern (established Phase 7) scaled cleanly to Phases 8 and 9 — consistent, testable, extensible
- Phase 10 (verification-only) efficiently closed narrow gaps — only 13 new tests needed, not a full rewrite
- YOLO mode + quality profile delivered high confidence with minimal interruption

### What Was Inefficient
- ROADMAP.md plan checkboxes not consistently updated by `phase complete` tool — Phases 8 and 9 show `[ ]` even though complete. Manual fix needed.
- SUMMARY.md `requirements_completed` frontmatter consistently empty across all 8 plans — 3-source cross-reference in audit fell back to 2-source. Executor template should populate this.
- Component dist not rebuilt after Phase 9 (Finding F1) — integration checker caught this. Pre-publish rebuild needed before npm publish.
- AskUserQuestion tool returned empty responses in Phase 9 and 10 discuss steps — workaround was Claude's discretion for all gray areas.

### Patterns Established
- `locale-chrome.ts` as dedicated locale map module (mirrors engine pattern in component package)
- en-gb/en-us/en-ca routing to own templates (not generic en fallback) for jurisdiction-specific legislation
- `.gov` TLD deliberately unmapped — ambiguous, requires explicit country metadata
- Hardcoded test marker maps (not importing from source) — tests validate rendered output independently
- Data-driven `Object.entries(MAP).forEach` test pattern for exhaustive locale coverage

### Key Lessons
1. When changing a locale routing map (supportedLocales), audit all downstream lookups — chrome maps, template maps, date formatters. The Phase 9 researcher caught this before it became a bug.
2. Module-level const maps scale better than inline ternaries — adding a locale is one line, not a cascading if/else change.
3. Verification-only phases work well as final milestone phases — they catch narrow gaps without introducing new code risk.
4. Integration checker value: caught the stale dist issue that per-phase verifiers missed (they test source, not built artifacts).

### Cost Observations
- Model mix: ~60% opus (execution), ~30% sonnet (verification/checking), ~10% haiku (exploration)
- Sessions: ~3 across 2 days (same as v0.1)
- Notable: Average plan execution time 3 min; 8 plans in ~27 min total execution. Milestone overhead (discuss/plan/verify) was ~2x the execution time.

---

## Milestone: v0.3 — National Compliance

**Shipped:** 2026-03-06
**Phases:** 3 | **Plans:** 4 | **Sessions:** 1 (same day)

### What Was Built
- `ENFORCEMENT_BODIES_DETAILED` — 14-country dual WAD/EAA enforcement body map with sector-aware `getEnforcementBody(country, sector?)` helper
- TLD detection rewrite: fragile `endsWith()` chain replaced with URL hostname parse + `TLD_MAP` covering all 12 TLDs; EU as unmapped fallback (replacing SE)
- All 8 EU engine JSON templates updated with `{<national_law>}` placeholder — zero hardcoded law names
- All 8 EU component inline TEMPLATES updated with `{<national_law>}` and sector-aware enforcement body — sector prop that was `_sector` (unused) now flows through to `getEnforcementBody(country, sector)`
- 58 new auto-syncing tests: 10 standards + 32 engine (TLD + per-locale) + 16 component per-locale

### What Worked
- Auto-syncing test pattern established — test expectations call `getEnforcementBody()` and `getNationalLawByFramework()` directly from standards instead of hardcoding strings. When law data changes, tests auto-update.
- Phase dependency discipline — Phases 12 and 13 both depended on Phase 11; sequential execution (not parallel) avoided merge conflicts in shared test patterns.
- `{<national_law>}` placeholder pattern adopted identically in both engine (JSON templates) and component (inline TypeScript objects) — consistency enables future template consolidation.
- Sector future-proofing cost zero extra effort — passing `sector` prop through to `getEnforcementBody` instead of hardcoding `'public'` required one line change, enables EAA private-sector clients automatically.
- Milestone shipped in one day (3 phases, 4 plans) — tight scope + clear prior research = fast execution.

### What Was Inefficient
- `gsd-tools milestone complete` couldn't auto-extract SUMMARY.md accomplishments (files in gitignored `.planning/` directory) — manual enrichment of MILESTONES.md required.
- SUMMARY.md `requirements_completed` frontmatter still empty in v0.3 phases — same issue as v0.2.
- ROADMAP.md plan entries for Phase 12 were listed as `[ ]` even though plans were complete (v0.2 carryover issue).

### Patterns Established
- **Auto-syncing tests**: Test assertions import and call standards functions directly — `expect(html).toContain(getEnforcementBody('DE', 'public'))`. Zero hardcoded strings. Standards-first.
- **Sector pass-through**: Component `sector` prop flows to every enforcement body lookup — future EAA private-sector clients work without code changes.
- **Dual map pattern**: `ENFORCEMENT_BODIES` (simple string, backwards compat) + `ENFORCEMENT_BODIES_DETAILED` ({ wad, eaa }) — clean extension without API break.
- **EU fallback for unmapped TLDs**: International context, not Swedish, is the right default.

### Key Lessons
1. When adding new placeholder types (`{<national_law>}`), apply the pattern to both engine templates AND component templates in the same milestone — consistency beats partial coverage.
2. Auto-syncing tests (call the source function in assertions) are worth the one-time setup cost — they prevent test rot when data changes.
3. Sector awareness in APIs should be designed in from the start — even if only one sector is used today, the parameter cost is trivial and future-proofing is free.
4. Tight scope milestones (3 phases, focused goal) execute fast and verify cleanly — avoid scope sprawl.

### Cost Observations
- Model mix: ~70% sonnet (execution), ~20% sonnet (verification/audit), ~10% haiku (exploration)
- Sessions: 1 (entire milestone in one session)
- Notable: All 3 phases executed sequentially in one session. Average plan time: 11min (3min + 8min + 12min + 10min / 4 plans). Fastest milestone yet.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v0.1 | ~3 | 5 | Initial GSD workflow — established patterns |
| v0.2 | ~3 | 5 | Research catching cross-phase pitfalls, parallel wave execution |
| v0.3 | 1 | 3 | Tight scope, auto-syncing tests, same-day ship |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v0.1 | 74 | ~18% (9/49 files) | 0 |
| v0.2 | 127 | ~24% (3 test files, 12 source files changed) | 0 |
| v0.3 | 225 (+58) | ~30% (3 test files, 24 source/template files) | 0 |

### Top Lessons (Verified Across Milestones)

1. Research step catches bugs that context discussion misses — don't skip research (v0.1 Norwegian placeholder, v0.2 chrome lookup breakage)
2. Strict dependency ordering prevents cascading type errors in monorepos
3. Module-level const maps are the right pattern for i18n lookups — established v0.1, scaled v0.2
4. Integration checker catches dist-level issues that per-phase verifiers miss — run before publishing
5. Auto-syncing test assertions (call the source, not copy the string) prevent test rot — established v0.3, apply to all data-backed tests
6. Tight 3-phase milestones with a clear single goal execute in one session — scope discipline pays off
