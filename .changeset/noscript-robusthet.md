---
"@holmdigital/engine": minor
---

Robustness without JavaScript: `--noscript-check`, an impact line, a withheld badge, and a `--wait-for-hydration` flag.

**1. `--noscript-check` (new, opt-in).** The engine loads the page a second time with JavaScript disabled and compares the amount of visible text against the normal, hydrated scan. The metric is content coverage, not axe error count: an empty page has almost no axe errors, so error counts would be meaningless. Content inside `<noscript>` elements is excluded, since it only renders when JavaScript is off and would otherwise inflate the ratio. Verdicts: `ok` (50 % or more), `partial` (5 to 49 %), `empty` (below 5 %), `unknown` (probe failed).

The finding is advisory and is presented separately from the compliance result. No WCAG 2.x success criterion requires a page to work without JavaScript, so it never affects `score`, `stats` or `complianceStatus`, and it is never reported as a WCAG violation. `result.noScript.isWcagViolation` and `result.noScript.affectsScore` are permanently `false`.

**2. The report says who the finding affects.** When the verdict is `empty` or `partial`, the CLI, the developer HTML report and the plain-language report all state who is hit: not the people who chose to turn JavaScript off, but the people whose scripts never arrived (weak mobile network, corporate proxy, misbehaving browser extension, timeout). Without that line the finding is waved away with "everyone has JavaScript". The wording is qualitative and carries no statistic, and is localised in all nine languages (`cli.noscript_impact`). Advisory text only, no score effect.

**3. The shareable badge is withheld on an `empty` verdict.** A 100/100 page that is blank without JavaScript keeps its score and its PASS: it is genuinely WCAG conformant, and lowering the score would misrepresent the law. But the CLI no longer prints the shareable "Perfect Score" badge for it. It prints one line instead (`cli.badge_withheld`, all nine languages): the score is clean, the robustness check is not, so no badge. The badge is a marketing artefact, not a legal verdict, and we do not award one to a page that a user on a weak network never sees. Only `empty` withholds it, `partial` still earns the badge. The predicate is the pure, tested `isBadgeWithheldByRobustness()` in `reporting/badge-generator.ts`. Behaviour is unchanged unless `--noscript-check` is used.

**4. `--wait-for-hydration <ms>` (bug fix).** `ScannerOptions.waitForHydrationMs` existed with a 2500 ms default but could not be set from the CLI, so every CLI user was locked at 2500 ms. The flag now exists: whole milliseconds, `0` disables the wait, maximum 60000, invalid input exits with code 1 and a message naming both the bad value and the expected format. Precedence is CLI > `.a11yrc` (`waitForHydrationMs`) > default. The scanner constructor also no longer lets an explicitly `undefined` value overwrite the 2500 ms default, which would otherwise have silently turned the wait off for every CLI run and brought back false 100/100 scores on unhydrated SPAs.

MINOR: additive and backwards compatible. New CLI flags (off or defaulted), new optional `ScannerOptions.noScriptCheck` field (default `false`), new optional `ScanResult.noScript` field. No existing call site, output or score changes when the new flags are not used.
