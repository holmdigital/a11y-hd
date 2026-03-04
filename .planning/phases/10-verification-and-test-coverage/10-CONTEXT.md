# Phase 10: Verification and Test Coverage - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Comprehensive automated and manual verification that all 12 locales produce correct output across both template pipelines (engine Markdown + component HTML). This phase adds any missing cross-locale test coverage, runs the full suite, performs manual spot-checks on rendered output, and documents findings. No new features — purely verification and gap closure.

</domain>

<decisions>
## Implementation Decisions

### Test Coverage Scope
- Automated tests should cover evaluationMethod, statusMap, and UI chrome for all 12 locales (9 EU + en-gb/en-us/en-ca)
- Automated tests should verify en-gb/en-us/en-ca routing, template rendering, and enforcement body references in both pipelines
- Pre-existing test failures (cloud-client 8 tests, getEngineVersion 1 test, junit-generator) are OUT OF SCOPE — they are unrelated to localization and predate v0.2
- Current passing test counts: 30 engine statement tests + 68 component tests + 16 standards tests = 114 locale-related tests
- Any new tests should fill gaps in cross-locale coverage, not duplicate existing tests

### Manual Review Approach
- Spot-check generated statements for at least sv, en, en-gb, de, and fi (as specified in ROADMAP success criteria)
- Review criteria: correct language in each section, no placeholder leaks ({<...>}), correct enforcement body name, correct legislation references
- Document findings in the VERIFICATION.md as part of the phase output
- Manual review is a verification task, not a blocking gate — issues found become documented items for future correction

### Translation Accuracy
- Translations are treated as best-effort — Phase 10 verifies structural correctness and placeholder handling, not linguistic accuracy
- Flag obvious translation errors if spotted during review, but do not block on native speaker review
- Legal terminology accuracy (legislation names, enforcement body names) should match the official English names from national-laws.json
- Content accuracy for non-English EU locales is informational — documented but not blocking

### Claude's Discretion
- Whether to add new test files or extend existing test files
- Which specific assertions to add for cross-locale gaps
- Format of manual review documentation
- Whether to create a test utility for rendering statements across all locales

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `statement-generator.test.ts` — 30 tests including 12-locale template exhaustiveness, en-* locale verification, TLD detection
- `AccessibilityStatement.test.tsx` — 68 tests including chrome localization (9 locales), jurisdiction content (en-gb/en-us/en-ca), placeholder leakage (12 locales)
- `standards.test.ts` — 16 tests for rules data
- Phase 6 established placeholder exhaustiveness test pattern (no leftover `{<...>}` markers)
- Phase 7 established locale content verification with `it.each` data-driven pattern

### Established Patterns
- Data-driven tests: `Object.entries(MAP).forEach(([locale, expected]) => { it(\`...\`) })`
- Placeholder leak test: render all locales, assert no `{<` in output
- Chrome marker tests: render with locale, assert `container.innerHTML.toContain(expectedText)`
- Engine tests run from `packages/engine/` due to `__ENGINE_VERSION__` define in vitest.config.ts

### Integration Points
- `packages/engine/src/reporting/statement-generator.test.ts` — engine-side tests
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx` — component-side tests
- Full suite: `npx vitest run` from repo root (expect 9 pre-existing failures in unrelated tests)
- Per-package: `npx vitest run packages/engine/src/reporting/statement-generator.test.ts` and similar

</code_context>

<specifics>
## Specific Ideas

- ROADMAP success criterion 3 explicitly requires "Manual review of generated statements for at least sv, en, en-gb, de, and fi confirms correct output"
- ROADMAP success criterion 4 requires "Full test suite (74+ existing tests plus new locale tests) passes with zero failures" — note: the 9 pre-existing failures are in unrelated files (cloud-client, junit-generator, getEngineVersion) and should be excluded from this count
- Focus on verifying that Phase 7 (engine), Phase 8 (chrome), and Phase 9 (en-gb/en-us/en-ca) work correctly together end-to-end

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-verification-and-test-coverage*
*Context gathered: 2026-03-04*
