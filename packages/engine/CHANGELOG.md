# @holmdigital/engine

## 3.1.2

### Patch Changes

- 389d889: Fix: the engine no longer mislabels a rule when axe's rule id is not a direct match in our database (Intern #30). The old fallback matched on any shared tag and took the first entry in file order — `color-contrast` (which carries the `wcag2a`/`wcag21aa` level tags) therefore won every rule bearing a level tag, so an image with no `alt` was reported to the customer as a contrast failure on a button, with the wrong WCAG criterion, wrong remediation and wrong legal reference (68 of 77 mapped axe rules affected).

  The fallback now derives the WCAG **criterion** from axe's own `wcagNNN` tags (`wcag111` → 1.1.1, `wcag258` → 2.5.8) and looks up a rule by its `wcagCriteria` field. When an axe rule declares several mapped criteria the lowest criterion wins — the earliest WCAG principle, deterministic and stable — except `link-name` and `area-alt`, which map explicitly to 4.1.2 (Name, Role, Value) because the failure is a missing accessible name (ratified by Karin, Intern #30). Verified: `image-alt`→alt-text (1.1.1), `label`→name-role-value (4.1.2), `link-name`→link-purpose (2.4.4), `html-has-lang`→language-of-page (3.1.1), `list`→info-and-relationships (1.3.1), `object-alt`→alt-text (1.1.1), `frame-title`→name-role-value (4.1.2). Rules with no matching criterion fall to the existing honest "no specific mapping" branch.

  Side fix (same family): the unmapped branches in `enrichResultsLight` and the `cantTell` fallback no longer write a level tag like `wcag2a` into `wcagCriteria` — a criterion field carries a real criterion or nothing. `enrichIncomplete`'s mapping and needs-review behaviour are otherwise unchanged. Added a test that runs every axe rule id through the mapping and asserts zero wrong criterion.

## 3.1.1

### Patch Changes

- a445cf9: Fix: a `--sector private` accessibility statement no longer renders an empty national-law reference (Intern #31). Six countries without an EAA post in the data (NO, DK, FR, ES, GB, CA) produced sentences like "…complies with , any known accessibility issues…" — a broken clause in a document the customer hands over as their own.

  The national-law logic is extracted into `resolveNationalLawReference(country, sector, lang)`, which never returns an empty string: when no naming law exists in the data it rewords the sentence to be true **without** naming a law (a localised "applicable accessibility requirements" phrase). It never invents a law and never claims an EU directive is a country's national law. Naming the actual transposition for DK/FR/ES is tracked separately (Intern #32, awaiting Juno's wording); this is the safety net that must survive even after the data is complete.

  Added a test that walks all 16 countries × both sectors asserting the reference is non-empty — the test that would have caught this — plus statement-level checks for FR/GB/NO private. No data or `euFramework` values were changed.

## 3.1.0

### Minor Changes

- e92b6a4: Carry axe-core's `incomplete` results forward (KRAV-3, Intern #12). Until now the engine read only `violations` and `passes` and dropped `incomplete` entirely — checks axe could not decide (for example a contrast node whose background is overlapped) vanished from the report: not flagged, not passed, not "review". A reader asking "do we have a contrast problem?" got an answer that never mentioned the element.

  The engine now reads `incomplete` and carries each item into `ScanResult.reports` marked `cantTell` ("needs review" to the user). Marked posts are **excluded from `stats` (`total`, `critical`/`high`/`medium`/`low`), `score`, `complianceStatus` and `legalSummary`** — they are surfaced, never counted as failures. A new informational `stats.needsReview` counts them.

  The reason is read from axe's `messageKey`/`message`, not from `contrastRatio`: in the `bgOverlap` case `contrastRatio` is `0`, which means "could not be determined", not "zero contrast" (Intern #20). The carried post therefore reports the real reason and never a fabricated measurement.

  Reporter/CLI presentation of "needs review" as a distinct section is a follow-up; this change is the engine data model.

- 36b251a: Present "needs review" (KRAV-3 `cantTell`, Intern #12) as a distinct category across every reporter — the follow-up promised by the engine data-model change. Items axe-core could not decide are surfaced separately and are never mixed into the violation lists or counts:

  - **CLI dashboard & light output:** category scores, legal-risk heuristics and the "Top Violations" list are computed from real violations only; a new "Needs review" section lists the `cantTell` items, and the light output/JSON keep them out of `topIssues` (the count rides on `stats.needsReview`).
  - **HTML (developer & plain-language):** violations and the impact breakdown exclude `cantTell`; a separate, low-alarm "needs review" section renders them. A page whose only finding is "needs review" no longer claims "0 issues".
  - **JUnit:** `cantTell` becomes `<skipped>` (and a `skipped=` count), never `<failure>`.
  - **GitHub Actions:** `cantTell` is annotated as `::notice`, never `::error`/`::warning`, so it can never fail a build.
  - **Cloud payload:** violations exclude `cantTell`; new `needs_review` and `needs_review_count` fields carry them separately.
  - **Accessibility statement:** the legal non-compliance list excludes `cantTell` (a "could not determine" is not a declared failure).

  New localised strings (`plain.needs_review_*`, `report.needs_review_*`) added for all nine locales.

### Patch Changes

- d5efb31: When axe's `incomplete` carries a color-contrast item with mixed reasons, surface the one that actually needs review (Intern #20). In the frozen acceptance case, benign `nonBmp` nodes (icon-only glyphs like `→`) precede the `bgOverlap` node in axe's output; the previous logic took the first node, so the `bgOverlap` concern was labelled `nonBmp` and could be truncated out of the carried nodes. The engine now orders "could not determine contrast" nodes (those whose check data carries `contrastRatio`/`expectedContrastRatio`) ahead of the benign ones, so `reviewReason` and `failingNodes` reflect the real review need. The ordering is stable, so nodes of equal significance keep axe's order.
- Updated dependencies [26e4f8d]
- Updated dependencies [299f376]
- Updated dependencies [0a99805]
- Updated dependencies [e92b6a4]
  - @holmdigital/standards@3.0.2

## 3.0.2

### Patch Changes

- caa24e9: Fix Norwegian CLI verdict string (Intern #23). The `no` locale's `cli.not_compliant` referenced _Diskriminerings- og tilgjengelighetsloven_, a law repealed 1 January 2018. It now names the forskrift that is actually in force: `forskrift om universell utforming av IKT-løsninger`. Also picks up the corrected Norwegian law-reference data from `@holmdigital/standards`.
- Updated dependencies [caa24e9]
  - @holmdigital/standards@3.0.1

## 3.0.1

### Patch Changes

- af69027: Bump axe-core 4.12.1 → 4.13.0.

  Verifierad score-effekt före bump (Intern #18): regeluppsättningen är **identisk** mellan versionerna (105 regler, inga nya/borttagna, inga ändrade WCAG-taggar), så motorns WCAG→lag-mappning är oförändrad. Kontrollkörning på webperf top-10 offentlig sektor + W3C BAD-demo + Wikipedia gav identiskt utfall på 9/10 sajter; enda stabila skillnaden var en (1) extra `color-contrast`-nod på en enskild sida, från 4.13.0:s något noggrannare kontrast-check. Ingen API-ändring.

## 3.0.0

### Major Changes

- 3b35e3f: Declare Node >=22.22.0 via `engines`

  The published packages carried no `engines` field, so npm performed no
  version check at install time. `@holmdigital/engine` already required
  Node 22 in practice — `html-validate` needs `^22.22.0 || >=24.8.0`, and
  `commander` and `puppeteer` both need `>=22.12.0` — but a consumer on
  Node 18 or 20 installed it without any warning and only failed at
  runtime.

  All three packages now declare `node >=22.22.0`, matching the strictest
  floor the monorepo's dependency tree imposes and the only Node version
  CI exercises. This is a breaking change for consumers below that
  version, hence the major across the board.

  Documentation examples that used Node 20 (the README's GitLab CI
  snippet, the CI/CD integration guide, the developer cookbooks and the
  CI/CD strategy doc) have been corrected to Node 22 — as written they
  could not have run the CLI.

### Patch Changes

- Updated dependencies [3b35e3f]
  - @holmdigital/components@4.0.0
  - @holmdigital/standards@3.0.0

## 2.13.0

### Minor Changes

- 95f624c: Robustness without JavaScript: `--noscript-check`, an impact line, a withheld badge, and a `--wait-for-hydration` flag.

  **1. `--noscript-check` (new, opt-in).** The engine loads the page a second time with JavaScript disabled and compares the amount of visible text against the normal, hydrated scan. The metric is content coverage, not axe error count: an empty page has almost no axe errors, so error counts would be meaningless. Content inside `<noscript>` elements is excluded, since it only renders when JavaScript is off and would otherwise inflate the ratio. Verdicts: `ok` (50 % or more), `partial` (5 to 49 %), `empty` (below 5 %), `unknown` (probe failed).

  The finding is advisory and is presented separately from the compliance result. No WCAG 2.x success criterion requires a page to work without JavaScript, so it never affects `score`, `stats` or `complianceStatus`, and it is never reported as a WCAG violation. `result.noScript.isWcagViolation` and `result.noScript.affectsScore` are permanently `false`.

  **2. The report says who the finding affects.** When the verdict is `empty` or `partial`, the CLI, the developer HTML report and the plain-language report all state who is hit: not the people who chose to turn JavaScript off, but the people whose scripts never arrived (weak mobile network, corporate proxy, misbehaving browser extension, timeout). Without that line the finding is waved away with "everyone has JavaScript". The wording is qualitative and carries no statistic, and is localised in all nine languages (`cli.noscript_impact`). Advisory text only, no score effect.

  **3. The shareable badge is withheld on an `empty` verdict.** A 100/100 page that is blank without JavaScript keeps its score and its PASS: it is genuinely WCAG conformant, and lowering the score would misrepresent the law. But the CLI no longer prints the shareable "Perfect Score" badge for it. It prints one line instead (`cli.badge_withheld`, all nine languages): the score is clean, the robustness check is not, so no badge. The badge is a marketing artefact, not a legal verdict, and we do not award one to a page that a user on a weak network never sees. Only `empty` withholds it, `partial` still earns the badge. The predicate is the pure, tested `isBadgeWithheldByRobustness()` in `reporting/badge-generator.ts`. Behaviour is unchanged unless `--noscript-check` is used.

  **4. `--wait-for-hydration <ms>` (bug fix).** `ScannerOptions.waitForHydrationMs` existed with a 2500 ms default but could not be set from the CLI, so every CLI user was locked at 2500 ms. The flag now exists: whole milliseconds, `0` disables the wait, maximum 60000, invalid input exits with code 1 and a message naming both the bad value and the expected format. Precedence is CLI > `.a11yrc` (`waitForHydrationMs`) > default. The scanner constructor also no longer lets an explicitly `undefined` value overwrite the 2500 ms default, which would otherwise have silently turned the wait off for every CLI run and brought back false 100/100 scores on unhydrated SPAs.

  MINOR: additive and backwards compatible. New CLI flags (off or defaulted), new optional `ScannerOptions.noScriptCheck` field (default `false`), new optional `ScanResult.noScript` field. No existing call site, output or score changes when the new flags are not used.

## 2.12.0

### Minor Changes

- 18b1133: Klarspråk i light-skanningen (den publika snabbskanningen).

  Light-läget (`--light`, som den publika `/scan-light` använder) mappade tidigare axe-severity rakt av utan någon standards-uppslagning, så fynden saknade `plainLanguage` och kunde bara visas som råa regelkoder. Nu attacherar light-vägen klarspråkscopy (`plainLanguage`: rubrik, vad som händer, vem drabbas, affärspåverkan, så fixar du, påverkansnivå) för de åtta översta fynden, via `generateRegulatoryReport(id, lang)` med den inbyggda engelska fallbacken. Språket följer `getCurrentLang()`, så en svensk skanning ger svensk klarspråk.

  Light-lägets JSON (`--json --light`) exponerar dessutom `headline`, `businessImpact` och `impactLevel` per fynd i `topIssues` för API-konsumenter. Bakåtkompatibelt: fälten är valfria och saknas för otäckta regler och fynd bortom topp-8.

## 2.11.0

### Minor Changes

- 2560b6f: `--plain` levererar nu en rapport i alla länder i stället för att neka.

  Tidigare vägrade `--plain` att köra på ett språk vars kärnregler inte var översatta (språkspärren avbröt med felkod). Nu serveras rapporten på engelska (klarspråksgolvet) i stället för att avvisas, med en tydlig notis högst upp: "Plain language is not yet available in [språk], so this report is shown in English." Så får varje land en läsbar klarspråksrapport direkt, och vi fyller språk natively land för land.

  Engelska är default för `--plain`, `--lang sv` ger svenska, och ett språk som redan är fyllt natively renderas oförändrat på sitt eget språk. Notisen visas i både terminalrapporten och HTML/PDF-rapporten. Nya regressionstester täcker båda ytorna.

### Patch Changes

- Updated dependencies [2560b6f]
  - @holmdigital/standards@2.10.0

## 2.10.0

### Minor Changes

- 0e6a7dc: Klarspråksläget (`--plain`) spärras nu för språk som ännu inte har egna klarspråksrubriker.

  Tidigare kunde `--plain --lang de` (eller franska, spanska och så vidare) köras trots att de språken saknar egen klarspråkstext. Resultatet blev en rapport som via fallback visades på engelska under en icke-engelsk flagg, vilket motverkar hela klarspråkspoängen.

  CLI:n vägrar nu klarspråk på ett språk som inte täcker kärnreglerna och pekar i stället mot ett språk som stöds (svenska eller engelska) eller utvecklarrapporten. Engelska och dess regionala varianter räknas alltid som stödda, eftersom engelsk klarspråk är äkta och inte en tyst fallback. Stödet beräknas ur regeldatan och uppdaterar sig självt när fler språk fylls i. JSON-utdata påverkas inte.

## 2.9.0

### Minor Changes

- 602d23e: Klarspråksrapporten visar nu en svensk rubrik per regel i stället för den råa engelska axe-regelkoden.

  Tidigare satte både terminalrapporten (`--plain`) och plain-HTML-rapporten regelns engelska `ruleId` ("region", "color-contrast" och så vidare) som kortets rubrik, även i `--lang sv`. En svensk mottagare förstår inte "region", vilket undergrävde hela klarspråkspoängen.

  Renderarna använder nu `plainLanguage.headline` (den svenska klarspråksrubriken som redan fanns i regeldatan) som primär rubrik. Den engelska regelkoden ligger kvar som en liten sekundär teknisk referens i parentes, så utvecklare fortfarande kan slå upp regeln. När en regel saknar `headline` faller renderarna tillbaka på den rena regelkoden precis som förut.

## 2.8.0

### Minor Changes

- 2a23c40: Konfigurerbar hydration-wait (`waitForHydrationMs`, default 2500 ms) så klientrenderade SPA:er hydrerar innan axe körs. Tidigare gav ohydrerade SPA:er falskt 100/100.

  Ny option på `ScannerOptions.waitForHydrationMs` (default 2500, sätt 0 för att stänga av). Waiten körs efter `waitForNetworkIdle` och före metadata-capture (`page.title()`), så all nedströms (HTML-validering, Virtual DOM, axe) arbetar mot en hydrerad DOM.

  Bakgrund och bevis: klarna.com utan wait gav score 100 (fel), med ~3000 ms wait score 10 (sant). networkidle räcker inte: bundlen hinner laddas innan ramverket byggt komponentträdet, så `axe.run(document, ...)` körs mot pre-hydration-DOM:en.

  Stänger holmdigital/a11y-hd issue 49. Specens fast-track-default 2500 ms gör att CLI-användare (`hd-a11y-scan`) får rätt beteende utan att veta att flaggan finns. Latens-tillägg per scan: 2,5 sekunder, försumbart mot puppeteer-uppstart, navigering och axe.

## 2.7.0

### Minor Changes

- cd4ab8f: Klarspråksrapport: launch-blockerande fixar (KRAV 1-4)
  - **KRAV 1 (engine):** gruppera fynd av samma regel till ett enda klarspråkskort med antal förekomster ("color-contrast, 5 förekomster"), i både terminal- och PDF-renderaren. Identiska fynd staplas inte längre som dubblettkort. Grupperingen sker per `ruleId` oavsett position; introtexten ("Hittade N hinder") räknar fortfarande det totala antalet fynd.
  - **KRAV 2 (standards):** ta bort det oinfriade löftet "Vi anger exakt vilka färger…" / "We specify exactly which colours…" ur color-contrast-copyn (sv + en). Den kvarvarande fix-meningen står på egen hand utan hex-koder eller kontrastkvot.
  - **KRAV 3 kort sikt (engine):** läck inte axe-cores råa engelska hjälptext in i en svensk klarspråksrapport. Omappade fynd visar nu en översatt, självbärande ram-mening i stället; engelska rapporter behåller den tekniska detaljen.
  - **KRAV 4 (engine):** visa en fördelningsrad direkt under "Hittade N hinder" med antal per affärspåverkansnivå ("7 hinder: 6 Försämrar upplevelsen, 1 Värt att putsa"), räknat per förekomst så delsummorna summerar till totalen, ordnat efter affärspåverkan, bara nivåer med fynd, badge-etiketter via t(). Gäller terminal och PDF.

### Patch Changes

- Updated dependencies [cd4ab8f]
- Updated dependencies [18fe29c]
  - @holmdigital/standards@2.8.0

## 2.6.1

### Patch Changes

- Updated dependencies
  - @holmdigital/components@3.0.0

## 2.6.0

### Minor Changes

- aa05346: **Plain-language report mode (klarspråksläge)** (2026-06-12):

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

### Patch Changes

- Updated dependencies [aa05346]
  - @holmdigital/standards@2.7.0

## 2.5.6

### Patch Changes

- 5d7716e: Public discoverability pass (npm metadata only, no runtime changes):
  - **engine**: description now leads with the differentiator (WCAG/EN 301 549 failure mapping to national law and enforcement bodies across 17 jurisdictions) instead of tech internals. Keywords: fixed `ead` typo to `eaa`, added `en-301-549`, `accessibility-testing`, `cli`. README clarifies the 12-language total vs per-subsystem locale file counts (9 CLI output files, 16 statement templates).
  - **standards**: description no longer leads with a single national law (DOS Act); now leads with the 17-jurisdiction WCAG-to-EN 301 549-to-national-law mapping with enforcement-body lookups. Keywords: added `en-301-549`, `eaa`.
  - **components**: description sharpened to lead with regulation-ready components and the 12-locale accessibility-statement generator. Keywords: added `en-301-549`, `eaa`, `accessibility-statement`.
  - All three packages: `homepage` now points to https://wiki.holmdigital.se (the developer documentation front door).

- Updated dependencies [5d7716e]
  - @holmdigital/standards@2.6.1
  - @holmdigital/components@2.7.2

## 2.5.4

### Patch Changes

- c75ea8a: PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged. Fixed 2 pre-existing lint errors in `src/core/regulatory-scanner.ts` (`__ENGINE_VERSION__` ESLint readonly global, `@ts-ignore` → `@ts-expect-error`). Public API byte-equivalent to 2.5.2.
- Updated dependencies [0b911ef]
- Updated dependencies [c75ea8a]
- Updated dependencies [c75ea8a]
  - @holmdigital/components@2.7.0
  - @holmdigital/standards@2.5.3

## 2.5.3

### Patch Changes

- PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — `npm publish` now fails if lint or typecheck reports errors.
- Resolved 2 pre-existing lint errors in `src/core/regulatory-scanner.ts`:
  - Declared `__ENGINE_VERSION__` as an ESLint readonly global via source-level `/* global __ENGINE_VERSION__ */` comment (chosen over `package.json#eslintConfig` because the repo uses flat config `eslint.config.mjs` which does NOT read legacy `eslintConfig`; the type was already declared via `src/globals.d.ts`).
  - Swapped `// @ts-ignore` for `// @ts-expect-error` with rationale comment (per `@typescript-eslint/ban-ts-comment` rule defaults). The directive remains needed — `window.axe` is injected by the axe-core script tag at runtime and is not part of `lib.dom`.
- TS2724 / `--skipLibCheck` contingency NOT triggered: `tsc --noEmit` exits 0 cleanly under puppeteer 23.10.4 + TypeScript 5.7.2. No skipLibCheck flag applied.
- No source-behavior changes. Public API byte-equivalent to 2.5.2.

## 2.5.2

### Patch Changes

- ef3d381: Add HHS Section 504 (REHAB framework) routing for US private-sector statements

  `statement-generator.ts` now references both ADA Title III and Section 504 (HHS Final Rule) when rendering accessibility statements with `--country US --sector private`. Healthcare and HHS-funded private organisations (hospitals, FQHCs, research institutions, health plans) previously got a statement that omitted their primary obligation under 45 C.F.R. Part 84.

  Output format mirrors the existing US public-sector pattern (ADA Title II + Section 508):

  > Americans with Disabilities Act Title III (ADA Title III) & Section 504 of the Rehabilitation Act of 1973 (Section 504 (HHS Final Rule))

  Requires `@holmdigital/standards@2.5.1` for the Section 504 entry and the `'REHAB'` framework value.

- Updated dependencies [ef3d381]
  - @holmdigital/standards@2.5.1

## 2.5.1

### Patch Changes

- Fix: PDF-rapport och violation-badges filtreras nu korrekt baserat på `--sector`.

  Tidigare visades alltid både WAD och EAA oavsett vald sektor. Nu gäller:
  - `--sector public` (default): visar enbart WAD-violations och WAD-badges
  - `--sector private`: visar enbart EAA-violations, EAA deadline-stats och EAA-badges

  GitHub Actions-exemplet i README uppdaterat med `--sector` och förklarande kommentar.

## 2.5.0

### Minor Changes

- b30249a: Add ADA Title II and Title III support for US accessibility compliance

  **Background:** DOJ's final rule (28 CFR Part 35, published 2024-04-24) requires
  state and local governments to meet WCAG 2.1 Level AA by 2026-04-24 (entities
  serving 50,000+ population) or 2027-04-24 (smaller entities).

  **@holmdigital/standards:**
  - New `LegalFramework` value: `'ADA'`
  - Two new US laws in `national-laws.json`: `us-ada-title-ii` (public sector) and
    `us-ada-title-iii` (private sector)
  - New DOJ authority id `us-doj`
  - New optional `NationalLaw.complianceDeadlines` field (Title II: 2026-04-24 /
    2027-04-24)
  - ADA framework added to `frameworks.json` with WCAG 2.1 AA
  - 46 convergence rules across all 12 rule-locale files now tagged with `"ADA"`
    in `legalContext.appliesTo`
  - Fixed inconsistency: `ENFORCEMENT_BODIES_DETAILED.US.wad` is now
    `'General Services Administration (GSA)'` to align with the Section 508
    enforcement entry. `.eaa` remains DOJ. `ENFORCEMENT_BODIES.US` unchanged (DOJ).
  - New statement tool: ITIC VPAT template (`itic-vpat`)

  **@holmdigital/engine:**
  - Statement generator is now sector-aware for US: `--country US --sector public`
    references ADA Title II + Section 508 with DOJ as enforcement body;
    `--sector private` references ADA Title III with DOJ as enforcement body
  - en-us.json template's intro and enforcement sections now use
    `{<national_law>}` placeholder for dynamic law resolution

  **Migration:** No breaking changes. Consumers using
  `getNationalLawByFramework('WAD', 'US')` still receive Section 508.

### Patch Changes

- Updated dependencies [b30249a]
  - @holmdigital/standards@2.4.0

## 2.4.1

### Patch Changes

- 43aaaf3: fix(engine): distinguish best-practice rules from unmapped WCAG rules
  - axe-core rules tagged as 'best-practice' (e.g. aria-allowed-role, presentation-role-conflict) now show 'Best Practice' instead of 'WCAG Unknown' with risk level 'low' instead of 'medium'
  - Fallback messages for best-practice and unmapped rules are now localized across all 9 supported languages (en, sv, no, fi, da, de, fr, es, nl)
  - Previously all fallback strings were hardcoded in Swedish regardless of the --lang flag

## 2.4.0

### Minor Changes

- 4cb76cd: feat: add Australia as supported jurisdiction (DDA, AHRC, en-au)
  - Extended `LegalFramework` type with `'DDA'` — first non-EU framework
  - Added `'AU'` to `Country` type (17 countries total)
  - DDA + DTA law entries in `national-laws.json` with AHRC enforcement body
  - `en-au` AccessibilityStatement template with voluntary DDA framing and AHRC complaint pathway
  - `en-au.json` engine statement template with DDA-specific prose
  - `.au` TLD auto-detection (.au, .com.au, .gov.au)
  - Critical `{<national_law>}` DDA fallback fix for non-WAD/EAA frameworks
  - 292 tests across 3 packages with full auto-syncing coverage

### Patch Changes

- Updated dependencies [4cb76cd]
  - @holmdigital/standards@2.3.0
  - @holmdigital/components@2.3.0

## 2.3.0

### Minor Changes

- Add --light CLI flag for fast score-only scanning. Skips HTML validation and Virtual DOM build, uses direct axe severity mapping. Returns compact output ideal for API consumption via --json --light.

## 2.2.0

### Minor Changes

- Add IT, PT, PL locale support and EAA sector-aware enforcement bodies and national laws

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@2.2.0
  - @holmdigital/components@2.2.0

## 2.1.7

### Patch Changes

- dd9a7b8: Fix unresolved choice blocks in Markdown statement output when templates contain nested placeholders

## 2.1.6

### Patch Changes

- fd94d05: v0.1 Stability Pass — type safety, version accuracy, and locale coverage

  **@holmdigital/standards**
  - Added typed `FailingNode`, `EnrichedReport`, and `LegalContext` interfaces
  - Tightened `HolmDigitalInsight` type (removed index signature, added `reasoning` field)
  - All type exports are now fully typed with zero `as any` casts

  **@holmdigital/components**
  - `AccessibilityStatement` now supports 9 locales: en, sv, no, fi, da, nl, de, fr, es
  - Fixed placeholder substitution across all locales (Norwegian `publiseringsdato` bug)
  - FormField accessibility and ESM compatibility fix
  - Button component now spreads `...props` to `<button>` element (fixes onClick, aria-label, type being silently dropped)

  **@holmdigital/engine**
  - Build-time version injection via tsup `define` — replaces 3 hardcoded version strings
  - Zero `as any` casts in production code (was 4)
  - Scan results return fully typed `EnrichedReport[]` with `failingNodes` and `legalContext`
  - Upgraded axe-core from 4.10.2 to 4.11.1

- Updated dependencies [fd94d05]
  - @holmdigital/standards@2.1.1
  - @holmdigital/components@2.1.3

## 2.1.4

### Patch Changes

- Upgrade axe-core from 4.10.2 to 4.11.1 for improved color contrast detection (oklch/oklab), Shadow DOM support, and RGAA standard tags. Updated fallback version and dynamic test assertions.

## 2.1.3

### Patch Changes

- Fix three known bugs: cloud client now sends correct engine version from package.json instead of hardcoded '1.4.4', CLI --version reports actual version instead of '0.1.0', and AccessibilityStatement component now correctly renders Norwegian (no/nb) locale templates instead of falling back to English.
- Updated dependencies
  - @holmdigital/components@2.1.1

## 2.1.2

### Patch Changes

- 38763da: fix(engine): replace hardcoded engineVersion with dynamic package.json read

  The internal `engineVersion` metadata was stuck at `1.4.7` and `standardsVersion` at `1.2.2` regardless of the actual published version. Now reads versions dynamically from `package.json` at runtime using `readFileSync` with CJS/ESM compatibility.

## 2.1.1

### Patch Changes

- bc43b05: # Jenkins Build Fix
  - **Improved Build Process**: Added cross-platform asset copying to ensure accessibility statement templates and logos are correctly bundled and resolved in production builds, resolving `ENOENT` errors in CI/CD environments like Jenkins.
  - **Robust Path Resolution**: Hardened path resolution for assets to support multiple execution environments (src, dist, CI).

## 2.1.0

### Minor Changes

- a5f0169: # Accessibility Statement Enhancements

  Significant improvements to the accessibility statement generation system:
  - **Multi-Language Support**: Added comprehensive support for 9 European languages (EN, SV, NO, DA, FI, NL, DE, FR, ES).
  - **Externalized Templates**: Templates are now managed as separate JSON files in `@holmdigital/engine`, allowing for professional legal phrasing and easier localization.
  - **Enhanced Component**: Refactored the `AccessibilityStatement` component in `@holmdigital/components` to support template-driven rendering, localized date formatting, and automatic icon mapping for all supported languages.
  - **Centralized Enforcement Data**: Moved regulatory authority data to `@holmdigital/standards` for consistent use across all packages.
  - **Improved Substitution Logic**: Built-in support for conditional blocks and choice strings in both HTML and Markdown outputs.
  - **Hardened JUnit Generation**: Enhanced the JUnit XML reporter to include rich metadata properties, successful test case counts, and detailed failure information (DOM targets and HTML snippets) in `<system-out>` blocks for better CI diagnostics.

### Patch Changes

- Updated dependencies [a5f0169]
  - @holmdigital/components@2.1.0
  - @holmdigital/standards@2.1.0

## 2.0.1

### Patch Changes

- e574824: harden junit generation and fallback logic

## 2.0.0

### Major Changes

- 7013ff2: # 🚀 Release Overview: Premium Ecosystem & Nordic Expansion

  This release marks a major evolution of the HolmDigital Accessibility Ecosystem, transitioning from a technical scanner to a full-scale regulatory compliance suite.

  ## ⚖️ Standards & Legal Database (National Laws)
  - **Nordic Expansion**: Added full support for **Norway (Forskrift om universell utforming)**, **Finland (Laki digitaalisten palvelujen)**, and **Denmark (Lov om tilgængelighed)**.
  - **National Law Mapping**: New database for 12+ countries mapping WCAG to specific national legislations and enforcement bodies (e.g., Digg in SE, Traficom in FI).
  - **Sanctions & Enforcement**: Integrated data on legal sanctions and maximum fines for non-compliance across EU/Nordic regions.
  - **Statement Tools**: Registry of official national accessibility statement generators.

  ## 🚂 Engine: CI/CD & Reporting
  - **Premium V2 Statements**: Complete overhaul of the accessibility statement generator with glassmorphism card design, embedded Lucide-style icons, and micro-animations.
  - **Automatic Badge**: Sites with 100% compliance now automatically trigger a green Shields.io badge in the CLI and reports.
  - **GitHub Actions Integration**: Added native output formatting for GitHub Actions summary pages.
  - **JUnit Reporting**: Support for standard JUnit XML output for CI/CD dashboards (GitLab, Azure DevOps).
  - **Expanded CLI**: New flags for `--publish-date`, `--org`, `--response-time`, and `--country`.
  - **New Locales**: Added `no`, `fi`, `da` (and `nb`, `dk` aliases) for all engine outputs and statements.

  ## 🧱 Components: Prescriptive UI
  - **29+ Accessible Components**: Full library includes `DataTable`, `Combobox`, `TreeView`, `DatePicker`, `MultiSelect`, `NavigationMenu`, and more.
  - **Compliant by Default**: Built-in ARIA management, focus traps, and WCAG AAA contrast patterns.
  - **Premium V2 Statement Component**: The `AccessibilityStatement` component now supports rich metadata for multi-company deployments.

  ## 📚 Documentation
  - **Centralized Docs**: Moved all package-specific guides to a structured root `/docs` directory.
  - **New Guides**: Added "EU Legal Framework", "Nordic Authorities", and "CI/CD Integration" master guides.

### Patch Changes

- Updated dependencies [7013ff2]
  - @holmdigital/components@2.0.0
  - @holmdigital/standards@2.0.0

## 1.2.0

### Minor Changes

- 4c06ccf: feat: add cloud integration and CLI options

## 1.0.0

### Major Changes

- # Initial Public Release 🚀

  We are proud to announce that the HolmDigital Accessibility Ecosystem is now public!

  ### 🔍 @holmdigital/engine

  The core scanning engine is now available for public use.
  - **CLI Tool**: Run accessibility scans directly from your terminal or CI/CD pipeline.
  - **Regulatory Compliance**: Automated mapping of WCAG failures to EN 301 549 and DOS-lagen.
  - **PDF Reporting**: Generate beautiful, shareable compliance reports.
  - **HTML Validation**: Integrated `html-validate` checks for semantic correctness.

  ### 📚 @holmdigital/standards

  The single source of truth for accessibility rules.
  - **Machine-Readable Rules**: Complete database of WCAG 2.1 criteria mapped to legal requirements.
  - **Multi-Language Support**: Rules available in English, Swedish, German, French, and Spanish.
  - **Risk Assessment**: "DIGG-aligned" risk levels to help prioritize remediation.

  ### 🧩 @holmdigital/components

  A library of accessible-by-default React components.
  - **Core Components**: Button, FormField, Modal, Dialog, NavigationMenu, and more.
  - **Compliance Built-in**: Pre-configured ARIA attributes, keyboard navigation, and contrast ratios.

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@1.0.0

## 1.0.0

### Major Changes

- # Initial Public Release 🚀

  We are proud to announce that the HolmDigital Accessibility Ecosystem is now public!

  ### 🔍 @holmdigital/engine

  The core scanning engine is now available for public use.
  - **CLI Tool**: Run accessibility scans directly from your terminal or CI/CD pipeline.
  - **Regulatory Compliance**: Automated mapping of WCAG failures to EN 301 549 and DOS-lagen.
  - **PDF Reporting**: Generate beautiful, shareable compliance reports.
  - **HTML Validation**: Integrated `html-validate` checks for semantic correctness.

  ### 📚 @holmdigital/standards

  The single source of truth for accessibility rules.
  - **Machine-Readable Rules**: Complete database of WCAG 2.1 criteria mapped to legal requirements.
  - **Multi-Language Support**: Rules available in English, Swedish, German, French, and Spanish.
  - **Risk Assessment**: "DIGG-aligned" risk levels to help prioritize remediation.

  ### 🧩 @holmdigital/components

  A library of accessible-by-default React components.
  - **Core Components**: Button, FormField, Modal, Dialog, NavigationMenu, and more.
  - **Compliance Built-in**: Pre-configured ARIA attributes, keyboard navigation, and contrast ratios.

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@1.0.0

## 0.3.0

### Minor Changes

- feat: localize accessibility rules to Swedish, German, French, and Spanish
  fix: correct legal references in localized rules

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@0.3.0

## 0.2.2

### Patch Changes

- chore: ensure license files are included in package
- Updated dependencies
  - @holmdigital/standards@0.2.2

## 0.2.1

### Patch Changes

- docs: update README with HTML validation feature
- Updated dependencies
  - @holmdigital/standards@0.2.1

## 0.2.0

### Minor Changes

- Initial public release of the engine and standards packages.

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@0.2.0
