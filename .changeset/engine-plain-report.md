---
"@holmdigital/engine": minor
---

**Plain-language report mode (klarspråksläge)** (2026-06-12):

Opt-in plain-language report for non-technical recipients — `--plain` / `--audience plain`.

**CLI flags (PLAIN-04):**
- `--audience <developer|plain>` — explicit audience selector (default `developer`)
- `--plain` — alias for `--audience plain`; takes precedence over `--audience` when both are set
- Flag precedence: `--json > --light > --plain > dashboard` (D-12)
- `--plain --json` outputs JSON (with `plainLanguage` data); `--plain --light` outputs light report

**Terminal renderer:**
- `renderPlainReport(result, lang)` — business-impact-sorted terminal report
- Opening framing (no blame, no invented statistics), per-issue list (5 business-first labeled fields + chalk badge), neutral closing
- Badge colors: `stoppar-kop` = red bold, `hindrar` = red, `forsamrar` = yellow, `putsning` = gray
- All chrome via `t('plain.*')` i18n keys (D-01)
- No compliance score (D-05)

**Plain PDF (PLAIN-05, D-08):**
- `generateReportHTML(result, sector, audience?)` — third param `audience` defaulted to `'developer'`; existing two-arg callers compile and produce byte-for-byte identical output (D-13 snapshot guard)
- `audience='plain'` generates a plain HTML document mirroring the terminal: opening + impact-sorted numbered list (5 fields + badge) + neutral closing + footer with URL/scan date/engine version (D-16)
- No score, no WCAG/DIGG tables, no legal sections in the plain PDF
- `result.url` HTML-escaped before interpolation (T-34-08 mitigation)

**i18n chrome:**
- `plain.*` namespace (19 keys) in all 9 locale files (en/sv real translations; de/fr/es/nl/fi/dk/no English-valued pending native review)
- `plain.attribution` — discreet report attribution line rendered in terminal footer and plain PDF footer
- `plain.fallback_framing` — framing line rendered before technical description for findings without plainLanguage copy

**D-13 developer-PDF regression lock:**
- Snapshot test on `generateReportHTML(result, sector)` (two-arg calls) ensures the developer HTML is byte-for-byte unchanged when the `audience` param lands

**D-16 footer version source:**
- Plain PDF footer version comes from `getEngineVersion()` (`__ENGINE_VERSION__` injected at build time from `packages/engine/package.json` via tsup define) — never a root or standards version

**PDF page-break safety:**
- Plain HTML template sets `break-inside: avoid; page-break-inside: avoid` on each finding item, ensuring findings shorter than a full page are never split across a page boundary in the PDF
