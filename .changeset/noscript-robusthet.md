---
"@holmdigital/engine": minor
---

Add `--noscript-check`: an opt-in robustness probe that measures how much of a page's content is available without JavaScript.

The engine loads the page a second time with JavaScript disabled and compares the amount of visible text against the normal, hydrated scan. The metric is content coverage, not axe error count: an empty page has almost no axe errors, so error counts would be meaningless. Content inside `<noscript>` elements is excluded, since it only renders when JavaScript is off and would otherwise inflate the ratio.

The finding is advisory and is presented separately from the compliance result. No WCAG 2.x success criterion requires a page to work without JavaScript, so it never affects `score`, `stats` or `complianceStatus`, and it is never reported as a WCAG violation. `result.noScript.isWcagViolation` and `result.noScript.affectsScore` are permanently `false`.

MINOR: additive and backwards compatible. New CLI flag (off by default), new optional `ScannerOptions.noScriptCheck` field (default `false`), new optional `ScanResult.noScript` field. No existing call site, output or score changes when the flag is not used.
