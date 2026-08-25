---
"@holmdigital/engine": patch
---

Fix: the engine no longer mislabels a rule when axe's rule id is not a direct match in our database (Intern #30). The old fallback matched on any shared tag and took the first entry in file order — `color-contrast` (which carries the `wcag2a`/`wcag21aa` level tags) therefore won every rule bearing a level tag, so an image with no `alt` was reported to the customer as a contrast failure on a button, with the wrong WCAG criterion, wrong remediation and wrong legal reference (68 of 77 mapped axe rules affected).

The fallback now derives the WCAG **criterion** from axe's own `wcagNNN` tags (`wcag111` → 1.1.1, `wcag258` → 2.5.8) and looks up a rule by its `wcagCriteria` field. When an axe rule declares several mapped criteria (e.g. `area-alt` = 2.4.4 + 4.1.2) the lowest criterion wins — the earliest WCAG principle, deterministic and stable. Verified: `image-alt`→alt-text (1.1.1), `label`→name-role-value (4.1.2), `link-name`→link-purpose (2.4.4), `html-has-lang`→language-of-page (3.1.1), `list`→info-and-relationships (1.3.1), `object-alt`→alt-text (1.1.1), `frame-title`→name-role-value (4.1.2). Rules with no matching criterion fall to the existing honest "no specific mapping" branch.

Side fix (same family): the unmapped branches in `enrichResultsLight` and the `cantTell` fallback no longer write a level tag like `wcag2a` into `wcagCriteria` — a criterion field carries a real criterion or nothing. `enrichIncomplete`'s mapping and needs-review behaviour are otherwise unchanged. Added a test that runs every axe rule id through the mapping and asserts zero wrong criterion.
