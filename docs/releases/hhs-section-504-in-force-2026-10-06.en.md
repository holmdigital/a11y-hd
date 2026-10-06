# DRAFT: HHS Section 504 in @holmdigital/standards 4.3.0

> **Status:** DRAFT, not published. Will be rewritten as the final release once PR #234 is merged and Karin has approved the release.
> **Start commit:** `17fcb06` (the base of PR #234 against origin/master). **Package:** `@holmdigital/standards` 4.2.2 → 4.3.0 (MINOR), set by the changeset `.changeset/hhs-504-tier-in-force.md` when Version Packages runs. No version is changed by hand.
> **Tracking:** holmdigital/Intern#122 (date-driven in-force status per tier), #99, #111.

## What changes

### 1. New export: `isComplianceTierInForce(law, tier, today?)`

Decides at runtime whether a tier in `law.complianceDeadlines` (`'largeEntity'` or `'smallEntity'`) is in force on `today` (default: now, UTC date). Returns `false` if the tier has no date.

### 2. `us-hhs-section-504`: `inForce` and `effectiveDate`

- `inForce`: `false` → `true`.
- `effectiveDate`: `"2027-05-11"` → `"2024-07-08"` (the basic rule's effective date, 45 CFR 84.84(a), 89 FR 40066).

**Consumer warning:** `inForce` now means the status of the basic rule, not that the WCAG requirement applies. Anyone who reads `inForce` to decide whether the WCAG requirement applies on a given date gets the wrong answer. Use `isComplianceTierInForce` or `complianceDeadlines` for the WCAG dates.

### 3. The WCAG dates are unchanged

- 15 or more employees: 2027-05-11
- Fewer than 15 employees: 2028-05-10

### 4. Source citation

The citation for the WCAG requirement changes from 45 CFR 84.85 to **84.84(b)** in `enforcement.responsibility` and in both `complianceDeadlines` descriptions.

## Live-run report (requirement for legal data)

Place for the report. **Not done yet.**

- Country: USA (`us-hhs-section-504`)
- Language: English
- Report: [LIVEKÖRNING, före merge]

## Tests

`packages/standards`: 363 of 363 green after the change (vitest run, 2026-10-06).
