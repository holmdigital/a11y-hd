# @holmdigital/standards

## 3.0.5

### Patch Changes

- 66e5f9b: Intern #43 (fynd 3) — exponera `./package.json` i `exports`.

  Verktyg som läser paketets version via `require.resolve('@holmdigital/standards/package.json')` föll tidigare på `ERR_PACKAGE_PATH_NOT_EXPORTED`, eftersom `exports` bara listade `.`, `./data/*` och `./schema/*`. Motorns `getStandardsVersion()` fångade felet och rapporterade `standardsVersion: "unknown"` i skanningens metadata. `exports` exponerar nu även `"./package.json"` (standardpraxis, rent additivt), så versionen kan läsas. Ingen kod- eller dataändring i övrigt.

## 3.0.4

### Patch Changes

- 635ac7c: KRAV-13 data cleanup (Intern #27, Karin's decisions 2026-08-26). Two changes:

  **The seven axe best-practice rules no longer claim WCAG 1.3.1.** `region`, `heading-order`, `page-has-heading-one`, `landmark-one-main`, `landmark-unique`, `landmark-banner-is-top-level` and `landmark-no-duplicate-banner` are best-practice rules in axe with no WCAG tag — but our data labelled them 1.3.1 nivå A with a DOS-lagen reference, i.e. a legal requirement they are not. They are now reported as **"Best Practice" (no criterion)** in all twelve locale files: `wcagCriteria: "Best Practice"`, `en301549Criteria: "N/A"`, `dosLagenApplies: false`, and a per-language best-practice reference instead of a legal one (Vilma's ruling — 1.3.1 may live on as advisory text, never in the conformance field). The general 1.3.1 rule `info-and-relationships` is unchanged and remains the single, unambiguous holder of that criterion.

  **Removed the dead `data/wcag-to-en301549.json`.** No runtime code reads it; it duplicated legal strings already locked in `rules.*.json` (and still carried a duplicate `audio-description`). Its assertions are dropped from `doslagen-reference.test.ts`.

  Recomputed KRAV-13 outcome over axe-core 4.13.0 (105 rules): 9 exact id-match, 66 criterion-match, 23 best practice, 7 honestly unmapped, **0 silent errors**.

## 3.0.3

### Patch Changes

- 4d3ea2f: Rätta felaktiga lagrum i `dosLagenReference` (Intern #28). Fältet pekade på fel paragraf/rättsakt i publicerad regeldata — fel hänvisning bredvid rätt kravnivå, så inga fynd eller bedömningar påverkas, bara hänvisningen. Junos godkända lydelser byggda ordagrant:

  - **38 poster på DOS-lagens `§7`** (definitionen av museiföremål) → **10 §** med precisering: `Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå A/AA krävs`. I `rules.sv.json` och `wcag-to-en301549.json`.
  - **7 poster på `9 §`** (undantagsparagrafen, alla WCAG 1.3.1 nivå A): `rules.sv.json` → svenska 10 §-lydelsen; `rules.en/da/fi.json` och `wcag-to-en301549.json` → filens neutrala mönster `EN 301 549 V3.2.1, WCAG 2.1 Level A required`. Ingen svensk sträng ligger längre i en icke-svensk fil.
  - **1 post på `100 §`** (finns inte; lagen har 23 §§) i `wcag-to-en301549.json`, posten är `audio-description` (1.2.5 AA) → `EN 301 549 V3.2.1, WCAG 2.1 Level AA required`.
  - **45 spanska poster på det ersatta `UNE 139803:2012`** → `Real Decreto 1112/2018, artículos 5 y 6, mediante UNE-EN 301549:2022 (EN 301 549 V3.2.1) Anexo A, Nivel A/AA requerido`.
  - **`legal/national-laws.json` `es-une`**: `law` `UNE 139803` → `Real Decreto 1112/2018`, `fullName` till full BOE-titel (`id` orört).
  - **`legal/national-laws.json` italienska AgID-akter**: fel akttyp `Delibera n. 84/2026` / `n. 38/2026` → `Determinazione n. 84 del 15 maggio 2026` / `Determinazione n. 38 del 4 marzo 2026` (ren substringbytning i prosafält; sanktionsfält orörda).

  Ett låstest (`doslagen-reference.test.ts`) förhindrar att strängarna glider isär igen. `de/fr/nl/no/en-gb/en-us/en-ca`, `fr-rgaa` och WCAG 2.2-posterna är orörda.

## 3.0.2

### Patch Changes

- 26e4f8d: Translate the readable `codeExample` comments for the alt-text rule (`image-alt`) into each locale (Intern #13 follow-up). The three guiding comments — "Missing alt", "Descriptive alt" and "Decorative image" — were left in English in every non-English rules file even though the surrounding rule text was localised. They are now translated in `sv`, `de`, `fr`, `es`, `nl`, `fi`, `da` and `no`; the English variants (`en`, `en-ca`, `en-gb`, `en-us`) are unchanged. Code identifiers and JSX (`<img>`, `src`, `alt`, `role="presentation"`, the `HolmDigital Logo` sample value) stay in English — only the `//` comment prose is localised.
- 299f376: Rewrite the alt-text rule's `remediation.description` (Intern #13). The old text ("All images must have descriptive alternative text.") was wrong about WCAG 1.1.1: it ignored the decoration exception and implied `alt` is always required. The new, WCAG-reviewed wording distinguishes informative from decorative images, states that decorative images must be actively marked so assistive technology can ignore them (an empty `alt=""` is the standard way, and omitting `alt` entirely is not enough), and frames the requirement as being about the outcome, not the technique.

  Applied in all 11 affected language files (`sv`, `en`, `en-ca`, `en-gb`, `en-us`, `da`, `de`, `fi`, `fr`, `nl`, `no`) — `sv`/`en` verbatim as approved, the rest as faithful translations, none using em/en-dashes. `es` already stated the criterion and is left unchanged.

- 0a99805: Fix alt-text rule data (Intern #13). Two live, customer-facing corrections in all 12 language files:

  - **Typo:** `remediation.codeExample` said `// Bad: Msising alt` — corrected to `Missing`. It shipped in every report on every language.
  - **Missing technique:** added `H67` (null `alt` for decorative images) to `remediation.wcagTechnique`, which listed only `G94`, `G95`, `H37`. `H67` is the sufficient technique for exactly the decorative-image case the rule covers.

  `rules.es.json` included — the typo and technique list were identical across all twelve files. No wording change to `remediation.description` here; that is handled separately.

- e92b6a4: Add two optional fields to `EnrichedReport` for KRAV-3 (Intern #12): `cantTell` (marks a "needs review" post carried from axe's `incomplete`, which must be excluded from stats/score/complianceStatus) and `reviewReason` (axe's `messageKey`, e.g. `bgOverlap`, so a `contrastRatio: 0` is not mistaken for zero contrast). Both are optional and additive — no change for existing consumers.

## 3.0.1

### Patch Changes

- caa24e9: Fix Norwegian legal context (Intern #23). Corrections to law-reference data, six of them customer-visible via generated accessibility statements:

  - **Enforcement body (customer-facing):** `ENFORCEMENT_BODIES.NO` and `ENFORCEMENT_BODIES_DETAILED.NO.wad` now name the body a Norwegian reader files complaints with — `Tilsynet for universell utforming av ikt (uu-tilsynet)` — instead of the parent directorate `Digdir`. `getEnforcementBody('NO', 'public')` reads `.wad`, so this is the value that reaches a public-sector statement.
  - **EAA field emptied, not guessed:** `ENFORCEMENT_BODIES_DETAILED.NO.eaa` was `Nkom` (unverified). Norway is EEA, not EU, and the EAA has not been incorporated into the EEA agreement, so no EAA enforcement body exists in Norwegian law. The field is now empty and must not be filled with an authority name until status is verified against regjeringen.no.
  - **Law title:** `no-ikt.law` restored to the exact Lovdata short title `Forskrift om universell utforming av IKT-løsninger` (the `-løsninger` suffix was missing).
  - **Sanction wording:** `no-ikt.sanctions` no longer calls Norwegian _tvangsmulkt_ (an administrative coercive measure) Swedish _dagsböter_ (a criminal penalty). Now `Löpande vite (tvangsmulkt)`.
  - **Cross-jurisdiction data leak:** seven WCAG 1.3.1 rules in `rules.no.json` carried a Swedish `dosLagenReference` (`9 § (Struktur och relationer)`); replaced with the file's own EN 301 549 phrasing.

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

## 2.10.0

### Minor Changes

- 2560b6f: Engelsk klarspråkstext för alla regler i klarspråksrapporten (fallback-golvet för alla språk).

  Tidigare hade bara 11 av reglerna en engelsk klarspråksrubrik och förklaring, resten föll tillbaka på den råa axe-regelkoden. Nu har samtliga 48 regler ett fullständigt `plainLanguage`-block på engelska (rubrik, vad som händer, vem det drabbar, vad det kostar, så fixar du, påverkansnivå). Engelskan är fallback-golvet för alla övriga språk, så varje regel renderar nu läsbar klarspråkstext i stället för en rå regelkod även när målspråket saknar egen text. Engelsk täckning går från 11 till full täckning (48/48).

  Samtidigt städas en dubblettpost för regeln `audio-description` bort ur samtliga icke-svenska regelfiler (da, de, en, en-CA, en-GB, en-US, es, fi, fr, nl, no). Den kvarvarande posten är den korrekta, lokaliserade formuleringen; alla tolv regelfiler har därmed 48 unika regler.

## 2.9.0

### Minor Changes

- ec01cfb: Svensk klarspråkstext för alla regler i klarspråksrapporten (`--plain --lang sv`).

  Tidigare hade bara 11 av reglerna en svensk klarspråksrubrik och förklaring, resten föll tillbaka på den råa engelska regelkoden. Nu har samtliga regler ett fullständigt `plainLanguage`-block på svenska (rubrik, vad som händer, vem det drabbar, vad det kostar, så fixar du, affärspåverkan), skrivet i klarspråk ur besökarens och kundens perspektiv. Svensk täckning går därmed från 11 till full täckning.

  Samtidigt städas en dubblettpost för regeln `audio-description` bort ur den svenska regeldatan. Den kvarvarande posten är den korrekta, ovillkorliga formuleringen av WCAG 1.2.5 AA.

## 2.8.0

### Minor Changes

- 18fe29c: Add WCAG 2.2 Phase 1 criteria as forward-looking documentation: 2.5.8 Target Size (Minimum), 2.5.7 Dragging Movements and 2.4.11 Focus Not Obscured (Minimum). All three ship across the 12 locale files mapped to EN 301 549 V4.x clauses (9.2.5.8, 9.2.5.7, 9.2.4.11).

  Only 2.5.8 Target Size is detectable automatically (ruleId "target-size" wires to axe-core's single WCAG 2.2 rule), so it carries plain-language copy and testability automated true. 2.5.7 and 2.4.11 ship as manual checks (testability automated false, requiresManualCheck true) and as ICT manual checklist entries, because no automated scanner catches them.

  These three criteria are not yet legal requirements: the legal floor stays WCAG 2.1 AA via EN 301 549 V3.2.1. All three carry dosLagenApplies false and no WAD or EAA legal context. They switch to legal-requirement status only when EN 301 549 V4.x is referenced in the OJEU.

### Patch Changes

- cd4ab8f: Klarspråksrapport: launch-blockerande fixar (KRAV 1-4)
  - **KRAV 1 (engine):** gruppera fynd av samma regel till ett enda klarspråkskort med antal förekomster ("color-contrast, 5 förekomster"), i både terminal- och PDF-renderaren. Identiska fynd staplas inte längre som dubblettkort. Grupperingen sker per `ruleId` oavsett position; introtexten ("Hittade N hinder") räknar fortfarande det totala antalet fynd.
  - **KRAV 2 (standards):** ta bort det oinfriade löftet "Vi anger exakt vilka färger…" / "We specify exactly which colours…" ur color-contrast-copyn (sv + en). Den kvarvarande fix-meningen står på egen hand utan hex-koder eller kontrastkvot.
  - **KRAV 3 kort sikt (engine):** läck inte axe-cores råa engelska hjälptext in i en svensk klarspråksrapport. Omappade fynd visar nu en översatt, självbärande ram-mening i stället; engelska rapporter behåller den tekniska detaljen.
  - **KRAV 4 (engine):** visa en fördelningsrad direkt under "Hittade N hinder" med antal per affärspåverkansnivå ("7 hinder: 6 Försämrar upplevelsen, 1 Värt att putsa"), räknat per förekomst så delsummorna summerar till totalen, ordnat efter affärspåverkan, bara nivåer med fynd, badge-etiketter via t(). Gäller terminal och PDF.

## 2.7.0

### Minor Changes

- aa05346: **Plain-language copy (klarspråksläge)** (2026-06-12):

  New public API for non-technical recipients — the plain-language data layer that feeds the `--plain` report mode in `@holmdigital/engine`.

  **New types:**
  - `BusinessImpactLevel`: `'stoppar-kop' | 'hindrar' | 'forsamrar' | 'putsning'` — business-impact severity used for sorting plain reports
  - `PlainLanguageCopy`: interface with six fields (`headline`, `whatHappens`, `whoIsAffected`, `businessImpact`, `howToFix`, `impactLevel`) — plain-language copy for non-technical recipients

  **New optional fields:**
  - `ConvergenceRule.plainLanguage?: PlainLanguageCopy` — plain-language copy on each rule
  - `RegulatoryReport.plainLanguage?: PlainLanguageCopy` — copied through by `generateRegulatoryReport`

  **Data:**
  - 10 Swedish plain-language texts in `rules.sv.json` (`form-labels`, `alt-text`, `name-role-value`, `keyboard-accessible`, `color-contrast`, `link-purpose`, `heading-order`, `language-of-page`, `landmark-one-main`, `region`)
  - 10 English plain-language texts in `rules.en.json` (same rule set, same tone rules: you-address, business-first, no em/en dashes, no invented statistics)

  **Enrichment (D-03):**
  - `generateRegulatoryReport` now copies `plainLanguage` from the rule, with a silent English fallback for languages without translated texts (`lang !== 'en'` and rule missing `plainLanguage`)

  **Deferred (D-02):** Real translations for de/fr/es/nl/fi/dk/no pending native editorial review. The D-03 EN fallback activates automatically for those languages until texts land.

## 2.6.1

### Patch Changes

- 5d7716e: Public discoverability pass (npm metadata only, no runtime changes):
  - **engine**: description now leads with the differentiator (WCAG/EN 301 549 failure mapping to national law and enforcement bodies across 17 jurisdictions) instead of tech internals. Keywords: fixed `ead` typo to `eaa`, added `en-301-549`, `accessibility-testing`, `cli`. README clarifies the 12-language total vs per-subsystem locale file counts (9 CLI output files, 16 statement templates).
  - **standards**: description no longer leads with a single national law (DOS Act); now leads with the 17-jurisdiction WCAG-to-EN 301 549-to-national-law mapping with enforcement-body lookups. Keywords: added `en-301-549`, `eaa`.
  - **components**: description sharpened to lead with regulation-ready components and the 12-locale accessibility-statement generator. Keywords: added `en-301-549`, `eaa`, `accessibility-statement`.
  - All three packages: `homepage` now points to https://wiki.holmdigital.se (the developer documentation front door).

## 2.6.0

### Minor Changes

- 884f142: **Canada federal ACA + France RGAA authority correction** (legal review 2026-06-05):
  1. **New: Accessible Canada Act (`ca-aca`)** — Adds the Canadian federal accessibility framework that was missing entirely. Previously only `ca-aoda` (Ontario provincial) was encoded. Canadian users now resolve the federal layer via `getNationalLawByFramework('ACA', 'CA')`.
     - Law: Accessible Canada Act (S.C. 2019, c. 10) + Accessible Canada Regulations (SOR/2021-241), ICT amendments in force **2025-12-05**
     - Technical standard: **CAN/ASC-EN 301 549:2024** (WCAG 2.1 Level AA)
     - Primary authority: Accessibility Commissioner (Canadian Human Rights Commission)
     - Sector authorities: CRTC (broadcasting + telecom), Canadian Transportation Agency (federally-regulated transport)
     - Compliance deadlines: federal public sector **2027-12-05**, federally-regulated private sector **2028-12-05**
     - Sanctions: up to **250 000 CAD per violation** via administrative monetary penalties (ACA Part 6)
     - Scope: `both` (covers both federal public and federally-regulated private)
  2. **New `LegalFramework` value: `'ACA'`** — added to the union type and registered in `frameworks.json`. `getLegalFramework('ACA')` now returns metadata. This is the MINOR-bump driver (new type union member).
  3. **Schema updated** — `national-laws-schema.json` `euFramework` enum extended with `"ACA"`.
  4. **Fix: France RGAA authority** — `fr-rgaa.enforcement.authorityName` corrected from `'Arcom'` to `'DINUM (Direction interministérielle du numérique)'`. DINUM is the current supervisory authority for RGAA 4.1.2; Arcom only takes over when RGAA 5 publishes (expected late 2026). Previous Arcom designation pre-empted a not-yet-effective transition. `ENFORCEMENT_BODIES.FR` and `ENFORCEMENT_BODIES_DETAILED.FR.wad` updated to match. A new `note` on the `fr-rgaa` entry documents the upcoming RGAA 5 transition (WCAG 2.2 + mobile + documents + Arcom authority).
  5. **Regression tests added** — `getEnforcementBody('FR')` must NOT return Arcom; `fr-rgaa.enforcement.authorityName` must contain DINUM. CA federal layer is asserted with explicit deadlines and `ACA` framework resolution.

  **Items intentionally NOT changed this release** (per the 2026-06-05 legal review, deferred for separate triggers):
  - SE: DIGG + PTS → Digitaliseringsmyndigheten (effective 2027-01-01) — wait for autumn 2026 proposition.
  - EU: EN 301 549 V4.1.x — do not switch until OJEU citation, not just ETSI publication.

  **Sources verified:** Canadian Human Rights Commission, Government of Canada accessible-canada regulations summary, numerique.gouv.fr, DesignGouv RGAA 5 article.

### Patch Changes

- cd1c749: **Italy EAA data correction** — fixes four substantive errors in `it-eaa` discovered during compliance review:
  1. **Law number corrected**: `D.Lgs. 82/2024` → **`D.Lgs. 82/2022`** (Decreto Legislativo 27 May 2022, n. 82 — the actual Italian EAA transposition decree). Previous year was wrong.
  2. **Enforcement authority corrected**: `AGCOM` → **`AgID`**. Per D.Lgs. 82/2022 art. 21, AgID supervises EAA-covered digital services (websites, e-commerce, banking, transport, electronic communications, e-books). AGCOM only handles audiovisual media services (D.Lgs. 208/2021 art. 31). The previous AGCOM designation made `getEnforcementBody('IT', 'private')` return the wrong authority for ~99% of EAA service use cases — including every site `hd-a11y-scan --country IT --sector private` would normally target.
  3. **Sector authority split documented**: new `sectorAuthorities` array makes the three-authority split explicit:
     - **MIMIT** (Ministero delle Imprese e del Made in Italy) — products
     - **AgID** — digital services (primary)
     - **AGCOM** — audiovisual media services only
  4. **Sanctions corrected**: previous range `2,500–40,000 EUR` mixed values from two distinct sanction categories. Corrected to **`5,000–40,000 EUR`** (substantive violation per accessibility requirements). The 2,500–30,000 EUR range (non-cooperation / failure to comply with AgID orders) is now documented in `sanctions.description` rather than blended into the primary range.
  5. **Pre-istruttoria phase documented**: description now reflects AgID's actual enforcement procedure — notification → response window → remediation period → sanctions only on persistent non-compliance. This shifts the messaging from "you risk fines" to "have a response routine ready" (the operative obligation).
  6. **Delibera 84/2026 referenced**: in addition to existing Delibera 38/2026 (Linee Guida, 4 March 2026), `note` now references **Delibera 84/2026** (15 May 2026 — Regolamento sulle procedure di accertamento delle violazioni e applicazione delle sanzioni), which is where the pre-istruttoria procedure is codified.
  7. **Complaint mechanism origin clarified**: `note` makes explicit that the complaint mechanism is NOT new in 2026 — it was established by Legge n. 4/2004 (Legge Stanca) and D.Lgs. 82/2022. The 2026 Delibere systematise the review procedure.
  8. **`ENFORCEMENT_BODIES_DETAILED.IT.eaa`** in `src/index.ts` updated to `Agency for Digital Italy (AgID)` (was AGCOM). Regression test added to assert this never returns AGCOM for `IT` private sector.

  **Impact:** Any consumer calling `getEnforcementBody('IT', 'private')` or generating Italian AccessibilityStatements has been receiving incorrect authority data since the IT entry was added. Upgrade strongly recommended.

  **Sources verified:** UserWay, AccessiWay, Federprivacy, dirittobancario, fiscoetasse, eye-able, redazionefiscale, agendadigitale.eu, AgID official PDF.

## 2.5.7

### Patch Changes

- 8309522: Compliance data updates per legal review (2026-05-22):
  - **IT (`it-eaa`)**: Update sanctions to reflect AgID Delibera n. 38/2026 — PMI fines 2,500–40,000 EUR per violation; added new `note` field documenting the service-level accessibility approach per Linee Guida sull'accessibilità dei servizi digitali (in force 24 March 2026 via Gazzetta Ufficiale, based on EN 301 549 V3.2.1 + WCAG 2.1 AA, mandatory for e-commerce, banking, transport, electronic communications, audiovisual, e-books).
  - **US (`us-ada-title-ii`)**: Correct compliance deadlines per DOJ Interim Final Rule (published 2026-04-20) — large entity 2026-04-24 → 2027-04-26; small entity 2027-04-24 → 2028-04-26. Comment period closes 2026-06-22. Technical standard (WCAG 2.1 AA) unchanged. The previous large-entity deadline had already passed in the data — consumers were seeing an expired deadline.
  - **IE (`ie-eaa`)**: Add new entry for S.I. No. 636/2023 (European Union (Accessibility Requirements of Products and Services) Regulations 2023), in force 28 June 2025. CCPC is primary market surveillance authority; sector authorities are Central Bank of Ireland (financial services, per Consumer Protection Code 2025) and ComReg (electronic communications). Includes EAA microbusiness exemption (Article 4(5)). Ireland's full EAA transposition was missing from the package since 2025-06-28.
  - **frameworks (`REHAB`)**: Align `technicalStandard` effective date to 2027-05-11 per HHS IFR 2026-09266 (consistent with `us-hhs-section-504` realign in 2.5.6).

## 2.5.6

### Patch Changes

- 9b7fbca: HHS Section 504: extend WCAG 2.1 AA compliance deadlines by one year per HHS Interim Final Rule (Federal Register doc 2026-09266, published 2026-05-11, docket HHS-OCR-2026-0004). Large entity (15+ employees) deadline 2026-05-11 → 2027-05-11; small entity (<15 employees) deadline 2027-05-10 → 2028-05-10. Technical standard (WCAG 2.1 AA), scope, sanctions, and `effectiveDate` (2024-07-08) unchanged. Updates `data/legal/national-laws.json` entry `us-hhs-section-504`.
- 49a6bec: HHS Section 504: realign `effectiveDate` and `inForce` to reflect the WCAG benchmark enforcement trigger, not the underlying rule's 2024 effective date. Per HHS Interim Final Rule 2026-09266 (published 2026-05-11), the WCAG 2.1 AA compliance benchmark for large entities (15+ employees) starts 2027-05-11. `us-hhs-section-504` now publishes `effectiveDate: "2027-05-11"` and `inForce: false` — the `inForce` flag will flip to true automatically when the drift-guard validates `effectiveDate <= today` on 2027-05-11. Note field expanded to document the field-semantic choice. Compliance deadlines and all other metadata unchanged.

## 2.5.4

### Patch Changes

- HHS Section 504: extend WCAG 2.1 AA compliance deadlines by one year per HHS Interim Final Rule (Federal Register doc 2026-09266, published 2026-05-11, docket HHS-OCR-2026-0004). Large entity (15+ employees) deadline 2026-05-11 → 2027-05-11; small entity (<15 employees) deadline 2027-05-10 → 2028-05-10. Technical standard (WCAG 2.1 AA), scope, sanctions, and `effectiveDate` (2024-07-08) unchanged. Updates `data/legal/national-laws.json` entry `us-hhs-section-504` (compliance deadlines + descriptions + note). Consumers should re-fetch `getComplianceDeadlines('us-hhs-section-504', 'US')`.

## 2.5.3

### Patch Changes

- c75ea8a: PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — `npm publish` now fails if lint or typecheck reports errors. No source changes.

## 2.5.2

### Patch Changes

- PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — npm publish now fails if lint or typecheck reports errors. No source changes; current source was already clean against both new gates.

## 2.5.1

### Patch Changes

- ef3d381: Fix HHS Section 504 type contract, framework metadata gaps, and EAA inForce drift (post-2.5.0 review)

  **Type contract fix (was a published-API break in 2.5.0)**
  - Widen `NationalLaw.complianceDeadlines` to a discriminated union covering both `populationThreshold` (ADA Title II) and `employeeThreshold` (HHS Section 504). The 2.5.0 entry shipped `employeeThreshold` against a type that only declared `populationThreshold`, leaving downstream TypeScript consumers with `undefined` where the type promised `number`. New `ComplianceDeadlineEntry` type is exported.
  - Stop excluding `**/*.test.ts` from `tsc` so this class of defect is caught at build time. Updated existing tests to narrow on the new discriminant.

  **Framework metadata symmetry**
  - Add `REHAB` (Rehabilitation Act of 1973 / Section 504) and `DDA` (Disability Discrimination Act 1992) entries to `frameworks.json`. Previously `getLegalFramework('REHAB')` and `getLegalFramework('DDA')` were callable per the union type but returned `null` because the data file had no entries.

  **inForce semantics correction**
  - HHS Section 504 entry is now `inForce: true` with `effectiveDate: "2024-07-08"` (when the HHS Final Rule took effect). The previous `inForce: false` was incorrect — Section 504 obligations are active; only the WCAG 2.1 AA technical benchmark is staged on `complianceDeadlines.largeEntity.deadline` (2026-05-11).
  - Same drift fix applied to four EAA private-sector entries (SE/lptt, FI/fi-eaa, DE/de-bfsg, NL/nl-eaa) which carried `inForce: false` despite `effectiveDate: "2025-06-28"` having passed almost a year ago.

  **Convergence rules tagging**
  - Add `"REHAB"` to the `legalContext.appliesTo` array of all 46 WCAG 2.1 A/AA convergence rules across 12 locale files (552 changes). `getRulesByFramework('REHAB')` now returns the same coverage set as ADA Title II/III. Level AAA rules are excluded (Section 504 does not mandate AAA).

  **EAA microbusiness exemption metadata**
  - New `MicrobusinessExemption` type and `NationalLaw.exemptions.microbusiness` field. Encodes the EAA Article 4(5) exemption: services-providing microenterprises with fewer than 10 employees AND annual turnover or balance sheet at or below 2 million EUR are exempt from accessibility requirements. Both conditions must be met cumulatively. Applied to all 7 EAA private-sector entries (SE, FI, DE, NL, IT, PT, PL).

  **Schema validation**
  - New `schema/national-laws-schema.json` (JSON Schema Draft-07) for structural validation of `national-laws.json`. Vitest now validates the data file against the schema on every run via `ajv`.

  **Test coverage additions**
  - Date-driven `inForce` assertion across all 16 supported countries replaces the brittle entity-ID exclusion filter. Catches future drift like the EAA inForce gap.
  - Direct coverage of the public framework API: `getNationalLawByFramework('REHAB', 'US')`, `getLegalFramework('REHAB')`, `getLegalFramework('DDA')`, `getRulesByFramework('REHAB')`.
  - Regression guard: filtering `euFramework === 'ADA' && scope === 'private'` returns only Title III, not the new Section 504 entry.
  - New tests asserting microbusiness exemption presence and EAA-mandated thresholds across all 7 EAA private-sector entries.
  - Schema validation test fails the suite if any future law entry violates the structural contract.

## 2.5.0

### Minor Changes

- f2e722e: Add HHS Section 504 Final Rule (US) to national laws database

  Adds `us-hhs-section-504` — the HHS Digital Accessibility Final Rule (45 C.F.R. Part 84, 89 FR 40066) — as a new US law entry. Covers private organizations receiving federal financial assistance from HHS (hospitals, FQHCs, research institutions, health plans). Enforcement deadline for entities with 15+ employees is 2026-05-11; smaller entities by 2027-05-10. Technical standard: WCAG 2.1 Level AA (45 C.F.R. § 84.85).

  Also adds `'REHAB'` to the `LegalFramework` union type to represent the Rehabilitation Act framework (no direct EU equivalent).

## 2.4.0

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

## 2.3.0

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

## 2.2.0

### Minor Changes

- Add IT, PT, PL locale support and EAA sector-aware enforcement bodies and national laws

## 2.1.1

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

## 0.3.0

### Minor Changes

- feat: localize accessibility rules to Swedish, German, French, and Spanish
  fix: correct legal references in localized rules

## 0.2.2

### Patch Changes

- chore: ensure license files are included in package

## 0.2.1

### Patch Changes

- docs: update README with HTML validation feature

## 0.2.0

### Minor Changes

- Initial public release of the engine and standards packages.
