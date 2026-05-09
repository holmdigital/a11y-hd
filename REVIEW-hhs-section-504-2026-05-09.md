---
phase: ad-hoc-hhs-section-504
reviewed: 2026-05-09T05:20:00Z
depth: deep
files_reviewed: 3
files_reviewed_list:
  - packages/standards/src/types.ts
  - packages/standards/data/legal/national-laws.json
  - packages/standards/src/index.test.ts
findings:
  critical: 3
  warning: 5
  info: 4
  total: 12
status: issues_found
---

# Ad-hoc Code Review: HHS Section 504 Final Rule (us-hhs-section-504)

**Reviewed:** 2026-05-09T05:20:00Z
**Depth:** deep (cross-file analysis incl. statement-generator.ts, AccessibilityStatement.tsx, regulatory-scanner.ts, frameworks.json)
**Files Reviewed:** 3 (in scope)
**Cross-referenced:** 6 (out of scope but inspected for impact)
**Status:** issues_found
**Release:** `@holmdigital/standards@2.5.0` (commit f2e722e — already on npm)

## Summary

The change adds a fourth US national law (`us-hhs-section-504`) plus a new `'REHAB'` value in `LegalFramework`. Functionally the new entry is reachable via `getNationalLaws('US')` and the three new tests pass. However, **deep cross-file analysis surfaces three blockers** that ship in 2.5.0 today, all stemming from the schema for `complianceDeadlines` not being widened when the new field shape was introduced:

1. The JSON uses `employeeThreshold` but `NationalLaw.complianceDeadlines.largeEntity/smallEntity` only declares `populationThreshold` — the tests reference a property the public type system says doesn't exist. `tsc` flags this; only the `**/*.test.ts` exclude in `tsconfig.json` hides it. Downstream TS consumers reading `largeEntity.employeeThreshold` get a TS2339 error.
2. `populationThreshold` is declared as **required** in the type, but `us-hhs-section-504` ships without it — so the JSON-imported `NationalLaw` is structurally invalid against the published `.d.ts`.
3. `getLegalFramework('REHAB')` is callable per the widened union type but returns `null` because `frameworks.json` has no `REHAB` entry. There is no test, and no callsite handles the null gracefully (existing callers assume known frameworks resolve).

There are also two latent issues in the `inForce`-based logic of `statement-generator.ts` and `AccessibilityStatement.tsx`: with `inForce: false` until 2026-05-11 (i.e. **today + 2 days**), a US private-sector statement generated right now will silently bypass HHS Section 504 disclosure, even for healthcare customers in scope. The data is correct; the consumer code never references it. That is non-blocking (HHS isn't in any consumer codepath yet) but is the obvious next gap.

The release was published before this review, so blockers must be resolved in a 2.5.1 patch.

---

## Critical Issues

### CR-01: Type definition for `complianceDeadlines` does not match the JSON shape — published type contract is broken

**Files:**
- `packages/standards/src/types.ts:272-276`
- `packages/standards/data/legal/national-laws.json:494-505`

**Issue:** `NationalLaw.complianceDeadlines.largeEntity` is typed as
```ts
{ populationThreshold: number; deadline: string; description: string }
```
where `populationThreshold` is **required** (no `?`). The new `us-hhs-section-504` entry replaces this with `employeeThreshold: 15` (no `populationThreshold`). This means:

1. The JSON imported via `resolveJsonModule` and cast to `Record<string, NationalLaw[]>` in `index.ts:453` is structurally wrong — the publicly exported `NationalLaw` type advertises a property that isn't present at runtime. Any downstream consumer doing `law.complianceDeadlines.largeEntity.populationThreshold` for the HHS entry gets `undefined` despite TS saying the value is `number`.
2. The test on `index.test.ts:364` reads `law?.complianceDeadlines?.largeEntity?.employeeThreshold` — `tsc --noEmit src/index.test.ts` fails with `TS2339: Property 'employeeThreshold' does not exist on type '{ populationThreshold: number; deadline: string; description: string; }'`. This is masked at CI/runtime because `tsconfig.json` excludes `**/*.test.ts` and Vitest uses esbuild (no type checking). Anyone running `tsc` on tests in their IDE sees the error immediately.
3. The doc-comment `"ADA-specific: ... currently only populated for us-ada-title-ii"` (types.ts:272) is now factually stale — the entry exists for HHS too.

**Fix:** Widen the deadline schema to be a discriminated/optional union covering both threshold styles. Reorder the union so each entry carries exactly one of the two thresholds:

```ts
// types.ts
type ComplianceDeadlineEntry =
    | { populationThreshold: number; deadline: string; description: string }   // ADA Title II (entity served population)
    | { employeeThreshold: number; deadline: string; description: string };   // HHS Section 504 (recipient headcount)

export interface NationalLaw {
    // ...existing fields...
    /**
     * Tiered compliance deadlines keyed by entity size.
     * Entries use either `populationThreshold` (population served, e.g. ADA Title II)
     * or `employeeThreshold` (recipient headcount, e.g. HHS Section 504).
     * Consumers MUST narrow before reading the threshold field.
     */
    complianceDeadlines?: {
        largeEntity?: ComplianceDeadlineEntry;
        smallEntity?: ComplianceDeadlineEntry;
    };
}
```

Then update the test on line 364 to narrow:
```ts
const large = law?.complianceDeadlines?.largeEntity;
expect(large && 'employeeThreshold' in large ? large.employeeThreshold : undefined).toBe(15);
```

Also remove `**/*.test.ts` from `exclude` in `packages/standards/tsconfig.json` (or add a separate `tsconfig.test.json`) so `tsc` actually validates test files going forward — that exclude is what allowed this defect to ship.

---

### CR-02: `getLegalFramework('REHAB')` is callable but unsupported — returns `null` with no fallback handling

**Files:**
- `packages/standards/src/types.ts:12` (added `'REHAB'` to union)
- `packages/standards/data/legal/frameworks.json` (no `REHAB` entry)
- `packages/standards/src/index.ts:388-391` (`getLegalFramework`)

**Issue:** `LegalFramework` was widened to include `'REHAB'`, so `getLegalFramework('REHAB')` is now an accepted call. But `frameworks.json` defines only `WAD`, `EAA`, `ADA` — there is no `REHAB` entry. The function returns `null`, but consumers (e.g. anything reading `framework.wcagVersion`, `framework.technicalStandard`) typically `!`-assert or destructure and will crash. The same trap already exists for `'DDA'` — and it is never tested (`getLegalFramework('DDA')` returns null silently). Adding `'REHAB'` doubles down on the same data/type inconsistency.

This is also asymmetric with `getNationalLawByFramework('REHAB', 'US')`, which DOES resolve to the HHS entry. So a downstream caller doing the natural pair-up
```ts
const law = getNationalLawByFramework('REHAB', 'US');           // → us-hhs-section-504
const framework = getLegalFramework(law!.euFramework);            // → null
```
breaks at the second line.

**Fix:** Either (a) add a `REHAB` entry (and a `DDA` entry) to `frameworks.json` so the union and the data agree:
```json
"REHAB": {
    "id": "Rehab-1973",
    "name": "Rehabilitation Act of 1973 (Section 504)",
    "fullName": "Section 504 of the Rehabilitation Act of 1973 (29 U.S.C. § 794)",
    "scope": "both",
    "eurLexUrl": "https://www.hhs.gov/civil-rights/for-individuals/disability/section-504-rehabilitation-act/index.html",
    "adoptionDate": "1973-09-26",
    "transpositionDeadline": "1977-06-03",
    "wcagVersion": "2.1",
    "wcagLevel": "AA",
    "technicalStandard": "WCAG 2.1 Level A and AA (45 C.F.R. § 84.85, HHS Final Rule)"
}
```
or (b) split `LegalFramework` into `EUFramework` (the keys of `frameworks.json`) and `NationalLawFramework` (the superset including `DDA`/`REHAB`), and narrow `getLegalFramework`'s parameter to `EUFramework`. Option (a) is the smaller change and fixes `DDA` at the same time.

Add a guarding test:
```ts
it('should resolve REHAB framework', () => {
    expect(getLegalFramework('REHAB')).not.toBeNull();
});
```

---

### CR-03: `inForce: true for all enacted US laws` test silently invalidates itself in 2 days, leaving a coverage gap

**File:** `packages/standards/src/index.test.ts:329-334`

**Issue:** The test was patched with
```ts
const enacted = getNationalLaws('US').filter(l => l.id !== 'us-hhs-section-504');
for (const law of enacted) {
    expect(law.inForce).toBe(true);
}
```
On **2026-05-11** (in 2 days), the HHS rule's compliance deadline triggers and someone will (or should) flip `inForce` to `true`. At that point the test's filter becomes wrong — it will keep excluding the HHS entry and silently never assert that flag. The test will continue to pass but no longer exercises what its name claims (`'should have inForce true for enacted US laws'`).

This is the same anti-pattern as the EAA pre-2025-06-28 entries that ship with `inForce: false` and lie there silently — except those already got flipped. Hardcoded entity-ID exclusions are brittle.

**Fix:** Either drop the filter and add an explicit "today is the compliance day" check, or invert the assertion to be data-driven:
```ts
it('should match inForce against effectiveDate', () => {
    const today = new Date('2026-05-09');  // or new Date()
    for (const law of getNationalLaws('US')) {
        const isPastEffective = new Date(law.effectiveDate) <= today;
        expect(law.inForce).toBe(isPastEffective);
    }
});
```
Or at minimum add a TODO with the exact date the filter must be removed:
```ts
// TODO(2026-05-11): remove the us-hhs-section-504 filter once the rule is in force.
```

---

## Warnings

### WR-01: `inForce` semantics are inconsistent — `2026-05-11` should plausibly be `true` already (general Section 504 obligations effective 2024-07-08)

**File:** `packages/standards/data/legal/national-laws.json:491-493`

**Issue:** The `note` field correctly explains:
> Rule published 89 FR 40066 (May 9, 2024); **general Section 504 obligations effective July 8, 2024**; WCAG technical standards enforcement begins at compliance deadlines.

So Section 504 obligations themselves are already in force; only the WCAG-2.1-AA technical mandate is gated on 2026-05-11/2027-05-10. But `inForce: false` gets read by consumers as "the law has no legal effect yet," which is wrong. Compare with `us-ada-title-iii` which has `inForce: true` and `effectiveDate: 1992-01-26` even though no DOJ rule yet specifies a WCAG version — the same logic should apply here.

This will also cause `getMaxSanction('US')` to under-report risk: the HHS entry contributes `maxAmount: 0` (which doesn't move the max anyway), but consumers filtering on `inForce` lose a real obligation today.

**Fix:** Decide on one semantic:
- **Option A (recommended, matches Title III):** Set `inForce: true` and add `complianceDeadline` separately as the WCAG-2.1-AA effective date. Update CR-03's test accordingly.
- **Option B:** Document that `inForce` means "technical standard enforced" and apply that consistently — which would require flipping `us-ada-title-iii` to `false` (it has no final WCAG-bound rule). That's a bigger change.

---

### WR-02: `populationThreshold: 49999` for `smallEntity` is a confusing fence-post / off-by-one

**File:** `packages/standards/data/legal/national-laws.json:439` (Title II) and the same anti-pattern is referenced in HHS

**Issue:** The Title II small-entity entry uses `populationThreshold: 49999`, which is the largest value still in the small-entity bucket — i.e. `population <= 49999` (strict less-than 50000). `largeEntity` uses `50000` for "population >= 50000". This means the two thresholds aren't comparable: `largeEntity.populationThreshold` is the **inclusive lower bound** of the large bucket, but `smallEntity.populationThreshold` is the **inclusive upper bound** of the small bucket. There is no per-entry indication of which side of the threshold applies. Same risk applies to the new `employeeThreshold` (large=15 means >=15, small=14 means <15).

The HHS entry happens to be internally consistent with that scheme (large=15, small=14) but external consumers writing `if (org.employees >= law.complianceDeadlines.largeEntity.employeeThreshold)` will get the right answer for HHS by coincidence; for Title II they'd need `>=`; for some other law with different bucketing the convention is undocumented.

**Fix:** Either add an explicit comparison operator field (`comparator: 'gte' | 'lt'`) or use a single boundary value plus naming that disambiguates (`largeEntityThreshold`, `smallEntityThreshold`). At minimum, document in the JSDoc on `NationalLaw.complianceDeadlines` what the value means:
```ts
/** Inclusive boundary: largeEntity.X = entities with >= X qualify; smallEntity.X = entities with <= X qualify. */
```

---

### WR-03: `statement-generator.ts` US branch ignores HHS Section 504 entirely — silent under-disclosure for healthcare customers

**File:** `packages/engine/src/reporting/statement-generator.ts:308-341` (out of scope but consequence of in-scope change)

**Issue:** The US branch in `statement-generator.ts` only knows about ADA Title II/III + Section 508:
```ts
const adaLaw = usLaws.find(l => l.euFramework === 'ADA' && l.scope === sector);
```
For US private sector this returns `us-ada-title-iii`. The new `us-hhs-section-504` (also `scope: 'private'`) is invisible. A healthcare customer (hospital, FQHC, Medicare-Part-B-billing physician practice) generating a statement via `hd-a11y-scan --country=US --sector=private` after 2026-05-11 will get a statement that fails to mention their actual primary obligation.

The same gap exists in `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx:431-432`:
```ts
const law = getNationalLawByFramework(sector === 'private' ? 'EAA' : 'WAD', country)
         ?? getNationalLawByFramework('DDA', country);
```
Neither call can hit `'REHAB'`, so the HHS entry is dead data for the only consumer that renders national-law text.

**Fix:** This is out of scope for the standards package patch, but the `2.5.0` release notes should call out that a follow-up `engine` and `components` change is required. Suggested pattern:
```ts
// statement-generator.ts US branch — append after Title II/III resolution
const hhsLaw = getNationalLaw('us-hhs-section-504', 'US');
if (hhsLaw && sector === 'private') {
    // Healthcare/HHS-recipient organizations: append HHS reference
    return `${adaLaw.fullName} (${adaLaw.law}) — also subject to ${hhsLaw.law} for HHS-funded recipients`;
}
```
Better long-term: add an `appliesToSector?: ('healthcare' | 'general')[]` field so the generator can pick the right law per industry.

---

### WR-04: HHS Section 504 sanction `minAmount: 0, maxAmount: 0` makes `getMaxSanction('US')` materially wrong

**File:** `packages/standards/data/legal/national-laws.json:486-488`

**Issue:** The sanction shape is filled in with `minAmount: 0, maxAmount: 0` because there's no fixed cap. But the existing `us-ada-title-iii` entry uses `minAmount: 75000, maxAmount: 150000` and even includes a comment explaining inflation adjustments. For HHS Section 504, the actual financial exposure is **suspension/termination of HHS federal financial assistance** — which for a hospital can mean Medicare/Medicaid revenue (millions). Setting `0/0` makes consumers reading `law.sanctions.maxAmount` infer "no monetary risk," which is the opposite of the truth.

`getMaxSanction('US')` already returns the Title III $150k figure (which beats 0), so this isn't a regression for that helper. But the data is misleading on its own merits.

**Fix:** Either (a) note in the description that the financial cap is funding-loss-based and not a fixed dollar figure (the description already does this, but `0/0` undermines it), or (b) introduce a `sanctionType: 'fixed' | 'funding-loss' | 'none'` discriminator and let the API surface that, or (c) put a representative figure (Medicare-billing hospitals can lose $X-millions/year) in `example` so the magnitude is at least visible somewhere structured.

---

### WR-05: Test coverage gap — three new tests assert presence/values but never exercise the documented helper API

**File:** `packages/standards/src/index.test.ts:351-373`

**Issue:** All three new HHS tests use the imperative `getNationalLaws('US').find(l => l.id === 'us-hhs-section-504')` lookup instead of going through `getNationalLawByFramework('REHAB', 'US')`. That helper is the public API consumers will use — and it's the one that interacts with the new `'REHAB'` `LegalFramework` value. The tests effectively prove the JSON has the right shape but never prove the framework wiring works.

Combined with the missing `getLegalFramework('REHAB')` test (CR-02), nothing in this PR exercises the new union-type branch via the public API.

**Fix:** Add at minimum:
```ts
it('should resolve HHS Section 504 via getNationalLawByFramework(\'REHAB\', \'US\')', () => {
    const law = getNationalLawByFramework('REHAB', 'US');
    expect(law).not.toBeNull();
    expect(law?.id).toBe('us-hhs-section-504');
});

it('should not return HHS Section 504 when querying ADA framework', () => {
    // Regression test for the scope='private' overlap between Title III and HHS 504
    const adaPrivate = getNationalLaws('US').filter(l => l.euFramework === 'ADA' && l.scope === 'private');
    expect(adaPrivate).toHaveLength(1);
    expect(adaPrivate[0].id).toBe('us-ada-title-iii');
});
```

---

## Info

### IN-01: `lawUrl` is the Federal Register HTML page, not the codified rule

**File:** `packages/standards/data/legal/national-laws.json:476`

The URL points to the original 2024-05-09 Federal Register notice (89 FR 40066, document `2024-09237`). For consistency with `us-ada-title-ii` (which links to ada.gov's evergreen `law-and-regs/title-ii-2024/` page rather than the FR notice), consider adding the codified eCFR link as a secondary reference or replacing with `https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-A/part-84` so the URL doesn't bit-rot when HHS eventually retires the FR landing page.

---

### IN-02: `fullName` is 269 characters and embeds two parenthetical clauses — hard to render in tabular UIs

**File:** `packages/standards/data/legal/national-laws.json:473`

`"Section 504 of the Rehabilitation Act of 1973 — Nondiscrimination on the Basis of Disability in Programs or Activities Receiving Federal Financial Assistance (HHS Digital Accessibility Final Rule, 45 C.F.R. Part 84, 89 FR 40066)"` is much longer than other entries (Title II is 153 chars, Title III is 162). When inserted into the statement template via `{<national_law>}`, this will create a very long line in the rendered Markdown/HTML statement. Consider splitting the regulatory citation into a separate `regulatoryReference` field so the human-readable name stays short.

---

### IN-03: Stale doc-comment on `complianceDeadlines`

**File:** `packages/standards/src/types.ts:272`

```ts
/** ADA-specific: compliance deadlines keyed by entity size (currently only populated for us-ada-title-ii). */
```
This is no longer accurate — HHS Section 504 also populates it. Update when fixing CR-01.

---

### IN-04: `index.test.ts` line 357 hardcodes `inForce: false`, will break on 2026-05-11 if anyone bumps the data

**File:** `packages/standards/src/index.test.ts:357`

```ts
expect(law?.inForce).toBe(false);
```
This test will fail the moment the HHS rule's `inForce` is correctly flipped to `true` (which per WR-01 should arguably already be the case). Whoever ships that data fix has to remember to update this assertion too. Make it date-driven (see CR-03's fix snippet) or at least co-locate a TODO marker.

---

_Reviewed: 2026-05-09T05:20:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
