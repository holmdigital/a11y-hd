---
phase: 09-en-gb-en-us-en-ca-statement-templates
verified: 2026-03-04T19:51:34Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 9: en-gb/en-us/en-ca Statement Templates Verification Report

**Phase Goal:** Legally correct accessibility statements for UK, US, and Canadian websites with jurisdiction-specific references
**Verified:** 2026-03-04T19:51:34Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | en-gb Markdown output references PSBAR 2018 in enforcement and technical sections | VERIFIED | en-gb.json enforcement: "Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018"; technical: same; engine test confirms at line 122 |
| 2  | en-us Markdown output references Section 508 and ADA | VERIFIED | en-us.json enforcement: "Section 508 of the Rehabilitation Act and the Americans with Disabilities Act (ADA)"; technical: "Section 508 of the Rehabilitation Act"; engine test at line 123 |
| 3  | en-ca Markdown output references Accessible Canada Act and AODA | VERIFIED | en-ca.json enforcement: "Accessible Canada Act" + "Accessibility for Ontarians with Disabilities Act"; technical: both acts; engine test at line 124 |
| 4  | TLD detection maps .uk to GB, .us to US, .ca to CA | VERIFIED | statement-generator.ts lines 130-132; TLD detection tests pass (.gov.uk -> GB, .us -> US, .gc.ca -> CA) |
| 5  | All three en-* templates pass placeholder exhaustiveness test with zero leftover {<...>} markers | VERIFIED | Engine test file covers 12 templates; all 30 engine tests pass green |
| 6  | en-gb component HTML output references PSBAR 2018 in enforcement and technical sections | VERIFIED | AccessibilityStatement.tsx TEMPLATES['en-gb'] lines 244-245; component test at line 170 asserts full PSBAR 2018 string; 68 tests pass |
| 7  | en-us component HTML output references Section 508 and ADA | VERIFIED | TEMPLATES['en-us'] enforcement (line 257) and technical (line 258); component test asserts "Section 508" and "Americans with Disabilities Act" |
| 8  | en-ca component HTML output references Accessible Canada Act and AODA | VERIFIED | TEMPLATES['en-ca'] enforcement (line 270) and technical (line 271); component test asserts both acts |
| 9  | en-gb/en-us/en-ca locales select their own template, not generic en | VERIFIED | supportedLocales line 338: 'en-gb': 'en-gb', 'en-us': 'en-us', 'en-ca': 'en-ca' (not 'en') |
| 10 | Chrome text (badge, updated label, footer) renders correctly for all three en-* locales | VERIFIED | locale-chrome.ts has all three locales in BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT; component chrome test passes |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/engine/src/reporting/templates/en-gb.json` | UK accessibility statement template | VERIFIED | Exists, 39 lines, contains "Public Sector Bodies" in 3 locations (intro, enforcement, technical) |
| `packages/engine/src/reporting/templates/en-us.json` | US accessibility statement template | VERIFIED | Exists, 39 lines, contains "Section 508" in 3 locations, "Americans with Disabilities Act" in enforcement |
| `packages/engine/src/reporting/templates/en-ca.json` | Canada accessibility statement template | VERIFIED | Exists, 39 lines, contains "Accessible Canada Act" in 4 locations, AODA in 3 |
| `packages/engine/src/reporting/statement-generator.ts` | Extended TLD detection and en-* locale map entries | VERIFIED | Lines 37-39 (EVALUATION_METHOD), 53-55 (STATUS_LABELS), 69-71 (RESPONSE_TIME_DEFAULT), 130-132 (TLD detection) |
| `packages/engine/src/reporting/statement-generator.test.ts` | 12-template tests + en-* locale expectations + TLD tests | VERIFIED | Template count expects 12 (line 95); en-* locale assertions (lines 122-124); TLD detection suite (lines 147-171) |
| `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` | en-gb/en-us/en-ca TEMPLATES entries and updated supportedLocales | VERIFIED | TEMPLATES['en-gb'] at line 237, 'en-us' at 250, 'en-ca' at 263; supportedLocales at line 338 maps to own keys |
| `packages/components/src/AccessibilityStatement/locale-chrome.ts` | en-gb/en-us/en-ca chrome map entries | VERIFIED | BADGE_LABELS lines 25-27, UPDATED_LABEL lines 41-43, FOOTER_TEXT lines 57-59 |
| `packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx` | Tests for en-* template content and chrome text | VERIFIED | Jurisdiction content tests (lines 162-201); chrome tests (lines 143-160); placeholder leakage at line 53 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `statement-generator.ts` | `templates/en-gb.json` | `fs.readFile` with lang='en-gb' | VERIFIED | templatePath uses `${lang}.json` pattern (line 90); en-gb.json exists at expected path |
| `statement-generator.ts` | `ENFORCEMENT_BODIES[country]` | TLD detection sets country, substitutions map uses it | VERIFIED | Line 286: `'{<enforcement_body>}': ENFORCEMENT_BODIES[country] || ENFORCEMENT_BODIES.EU` |
| `AccessibilityStatement.tsx supportedLocales` | `TEMPLATES['en-gb']` | `supportedLocales['en-gb']` -> 'en-gb' -> `TEMPLATES[effectiveLang]` | VERIFIED | Line 338: `'en-gb': 'en-gb'`; line 345: `TEMPLATES[effectiveLang]` |
| `AccessibilityStatement.tsx effectiveLang` | `locale-chrome.ts BADGE_LABELS` | `BADGE_LABELS[effectiveLang]` lookup | VERIFIED | BADGE_LABELS has 'en-gb', 'en-us', 'en-ca' entries; line 7 imports BADGE_LABELS from locale-chrome |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| TMPL-01 | 09-01-PLAN.md, 09-02-PLAN.md | en-gb statement template with UK PSBAR 2018 legal references (engine JSON + component inline) | SATISFIED | en-gb.json exists with PSBAR 2018 in intro/enforcement/technical; TEMPLATES['en-gb'] in AccessibilityStatement.tsx with same; tests pass |
| TMPL-02 | 09-01-PLAN.md, 09-02-PLAN.md | en-us statement template with Section 508/ADA legal references (engine JSON + component inline) | SATISFIED | en-us.json exists with Section 508/ADA in enforcement/technical; TEMPLATES['en-us'] in component; tests pass |
| TMPL-03 | 09-01-PLAN.md, 09-02-PLAN.md | en-ca statement template with AODA/ACA legal references (engine JSON + component inline) | SATISFIED | en-ca.json exists with ACA/AODA in enforcement/technical; TEMPLATES['en-ca'] in component; tests pass |
| TMPL-04 | 09-01-PLAN.md, 09-02-PLAN.md | Country detection extended for en-gb/en-us/en-ca (TLD + explicit locale) | SATISFIED | TLD detection lines 130-132 (.uk/.us/.ca); supportedLocales routes en-* to own template keys; TLD tests pass |

All 4 requirements satisfied. No orphaned requirements found.

### Anti-Patterns Found

No anti-patterns detected.

- No TODO/FIXME/PLACEHOLDER comments in any of the three new JSON template files
- No empty implementations or stub returns
- No `{<...>}` leftover placeholders (confirmed by exhaustiveness test passing)
- No `console.log`-only handlers
- Generic `en` template is unmodified (correct — stays EU-focused)

### Human Verification Required

#### 1. Legal Accuracy of PSBAR 2018 Text (en-gb)

**Test:** Read the enforcement section of en-gb.json/TEMPLATES['en-gb'] against the actual UK Public Sector Bodies Accessibility Regulations 2018 guidance.
**Expected:** The disproportionate burden complaint language matches EHRC official guidance.
**Why human:** Legal accuracy of regulatory text cannot be verified programmatically.

#### 2. Legal Accuracy of Section 508/ADA Text (en-us)

**Test:** Read the enforcement section of en-us.json against current DOJ Civil Rights Division guidance on Section 508 and ADA complaints.
**Expected:** The complaint filing language accurately describes the process with the DOJ Civil Rights Division.
**Why human:** Legal accuracy and currency of US federal regulations requires expert review.

#### 3. Legal Accuracy of ACA/AODA Text (en-ca)

**Test:** Read the enforcement section of en-ca.json against Accessibility Commissioner (Canadian Human Rights Commission) guidance and AODA enforcement process.
**Expected:** The complaint language correctly describes the dual ACA/AODA enforcement structure.
**Why human:** Canadian federal/provincial split (ACA federal, AODA Ontario-only) requires legal expert review.

#### 4. Visual Rendering of en-* HTML Output

**Test:** Run the component with locale="en-gb" country="GB", locale="en-us" country="US", locale="en-ca" country="CA" and view rendered HTML in a browser.
**Expected:** Enforcement body name (EHRC/DOJ/Accessibility Commissioner) appears correctly in the rendered statement; chrome badges show "Fully compliant" / "Partially compliant" / "Non-compliant" in English.
**Why human:** Visual layout and formatting cannot be verified programmatically.

### Success Criteria Assessment (from ROADMAP.md)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | en-gb statement references UK PSBAR 2018 and EHRC as enforcement body (both HTML and Markdown output) | VERIFIED | Engine JSON + component TEMPLATES both present; ENFORCEMENT_BODIES.GB = "Equality and Human Rights Commission (EHRC)" |
| 2 | en-us statement references Section 508/ADA and DOJ Civil Rights Division (both HTML and Markdown output) | VERIFIED | Engine JSON + component TEMPLATES both present; ENFORCEMENT_BODIES.US = "Department of Justice (Civil Rights Division)" |
| 3 | en-ca statement references AODA/ACA and Accessibility Commissioner (both HTML and Markdown output) | VERIFIED | Engine JSON + component TEMPLATES both present; ENFORCEMENT_BODIES.CA = "Accessibility Commissioner (Canadian Human Rights Commission)" |
| 4 | Country detection correctly identifies .uk/.gov.uk, .us/.gov, and .ca/.gc.ca TLDs | VERIFIED (with note) | .uk, .us, .ca mapped; .gov intentionally unmapped per user decision; .gov.uk covered by .uk suffix; .gc.ca covered by .ca suffix; test at line 166 confirms .gov is NOT mapped |
| 5 | Both template pipelines (component HTML and engine Markdown) produce consistent enforcement body and legislation references for each en-* locale | VERIFIED | Both pipelines use ENFORCEMENT_BODIES[country] for enforcement body; both have jurisdiction-specific legislation text in intro/enforcement/technical sections |

All 5 success criteria pass. Note on criterion 4: `.gov` (bare, US) is deliberately left unmapped per explicit user decision documented in 09-01-PLAN.md and confirmed in the test suite.

### Commit Verification

All 4 documented commits verified in git log:
- `2c9dfa7` feat(09-01): add en-gb/en-us/en-ca statement templates and extend TLD detection
- `8137e36` test(09-01): update tests for 12 templates and en-* locale verification
- `3589251` feat(09-02): add en-gb/en-us/en-ca inline TEMPLATES and chrome map entries
- `d2027ea` test(09-02): add en-gb/en-us/en-ca jurisdiction content and chrome tests

### Test Results

- Engine tests: 30/30 passed (statement-generator.test.ts)
- Component tests: 68/68 passed (AccessibilityStatement.test.tsx)
- Total: 98 tests, 0 failures

---

_Verified: 2026-03-04T19:51:34Z_
_Verifier: Claude (gsd-verifier)_
