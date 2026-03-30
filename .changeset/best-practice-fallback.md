---
"@holmdigital/engine": patch
---

fix(engine): distinguish best-practice rules from unmapped WCAG rules

- axe-core rules tagged as 'best-practice' (e.g. aria-allowed-role, presentation-role-conflict) now show 'Best Practice' instead of 'WCAG Unknown' with risk level 'low' instead of 'medium'
- Fallback messages for best-practice and unmapped rules are now localized across all 9 supported languages (en, sv, no, fi, da, de, fr, es, nl)
- Previously all fallback strings were hardcoded in Swedish regardless of the --lang flag
