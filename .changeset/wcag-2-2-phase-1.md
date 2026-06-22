---
"@holmdigital/standards": minor
---

Add WCAG 2.2 Phase 1 criteria as forward-looking documentation: 2.5.8 Target Size (Minimum), 2.5.7 Dragging Movements and 2.4.11 Focus Not Obscured (Minimum). All three ship across the 12 locale files mapped to EN 301 549 V4.x clauses (9.2.5.8, 9.2.5.7, 9.2.4.11).

Only 2.5.8 Target Size is detectable automatically (ruleId "target-size" wires to axe-core's single WCAG 2.2 rule), so it carries plain-language copy and testability automated true. 2.5.7 and 2.4.11 ship as manual checks (testability automated false, requiresManualCheck true) and as ICT manual checklist entries, because no automated scanner catches them.

These three criteria are not yet legal requirements: the legal floor stays WCAG 2.1 AA via EN 301 549 V3.2.1. All three carry dosLagenApplies false and no WAD or EAA legal context. They switch to legal-requirement status only when EN 301 549 V4.x is referenced in the OJEU.
