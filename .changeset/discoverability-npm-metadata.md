---
"@holmdigital/engine": patch
"@holmdigital/standards": patch
"@holmdigital/components": patch
---

Public discoverability pass (npm metadata only, no runtime changes):

- **engine**: description now leads with the differentiator (WCAG/EN 301 549 failure mapping to national law and enforcement bodies across 17 jurisdictions) instead of tech internals. Keywords: fixed `ead` typo to `eaa`, added `en-301-549`, `accessibility-testing`, `cli`. README clarifies the 12-language total vs per-subsystem locale file counts (9 CLI output files, 16 statement templates).
- **standards**: description no longer leads with a single national law (DOS Act); now leads with the 17-jurisdiction WCAG-to-EN 301 549-to-national-law mapping with enforcement-body lookups. Keywords: added `en-301-549`, `eaa`.
- **components**: description sharpened to lead with regulation-ready components and the 12-locale accessibility-statement generator. Keywords: added `en-301-549`, `eaa`, `accessibility-statement`.
- All three packages: `homepage` now points to https://wiki.holmdigital.se (the developer documentation front door).
