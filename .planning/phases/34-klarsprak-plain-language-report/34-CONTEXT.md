# Phase 34: Klarspråksrapport (opt-in plain-language report) - Context

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Opt-in klarspråksläge för icke-tekniska mottagare: `hd-a11y-scan <url> --plain` (alias för `--audience plain`, default `developer` — inget befintligt beteende ändras) ger en affärsspråksrapport i terminal och PDF. Levererar: ny optional `PlainLanguageCopy`-datatyp + `BusinessImpactLevel` i standards, 8 klarspråkstexter på svenska OCH engelska, enrichment-koppling i `generateRegulatoryReport`, terminalrenderare (`plain-report.ts`), CLI-flaggor, PDF-läge via `audience`-arg i `generateReportHTML`, samt i18n-chrome via motorns befintliga `t()`.

`@holmdigital/components` rörs inte. Minor-release av standards + engine via changesets efter Karins godkännande.

</domain>

<decisions>
## Implementation Decisions

### Språk & i18n
- **D-01: Chrome-strängar via engine i18n (`t()`).** Renderarens chrome ("Vad som händer:", "Vem det drabbar:", "Vad det kostar:", "Så fixar du:", allvarlighetsbadges, öppning, avslutning, tom-state) läggs som nycklar i motorns befintliga locale-filer (`packages/engine/src/locales/*.json`). `LocaleData = typeof en` betyder att nycklarna måste in i ALLA 9 filer — svenska + engelska översätts på riktigt, övriga 7 (de/fr/es/nl/fi/dk/no) får engelska värden tills vidare. Ingen hårdkodad svenska i `plain-report.ts`.
- **D-02: Texterna levereras på svenska OCH engelska (PLAIN-06 utökad).** De 8 klarspråkstexterna skrivs i både `rules.sv.json` och `rules.en.json`. Engelska versionen följer samma tonregler (you-tilltal, affärsnytta före teknik, inga tankstreck/em-dashes, ingen skuld, inga uppfunna siffror). Karin granskar båda språken via leveransgrinden.
- **D-03: Engelsk tyst fallback för språk utan texter.** För `--plain --lang de` (etc.): `generateRegulatoryReport` faller tillbaka på engelska `plainLanguage` via `getConvergenceRule(ruleId, 'en')` när språkets regel saknar fältet. Fallbacken sker VID ENRICHMENT i standards — aldrig i renderaren (låsningen "ingen andra uppslagning vid utskrift" gäller renderaren; renderaren läser bara `report.plainLanguage`). Resultatet blir en helt engelsk klarspråksrapport (chrome har ändå engelska värden för oöversatta språk). Ingen notis-rad. Först när även EN saknar texten degraderas raden till `remediation.description`.

### impactLevel
- **D-04: Explicit `impactLevel` på ALLA 8 regler** enligt klarsprakslagrets redaktionella nivåer — INTE härledning från diggRisk (verifierat mot rules.sv.json: härledning ger fel nivå för 6 av 8):

  | ruleId | impactLevel (explicit) | diggRisk-härledning hade gett |
  |---|---|---|
  | form-labels | stoppar-kop | hindrar ✗ |
  | alt-text | hindrar | hindrar ✓ |
  | name-role-value | hindrar | stoppar-kop ✗ |
  | keyboard-accessible | hindrar | stoppar-kop ✗ |
  | color-contrast | forsamrar | hindrar ✗ |
  | link-purpose | forsamrar | forsamrar ✓ |
  | heading-order | putsning | forsamrar ✗ |
  | language-of-page | putsning | hindrar ✗ |

  Härledningen (critical→stoppar-kop, high→hindrar, medium→forsamrar, low→putsning) implementeras ändå som fallback för FRAMTIDA regler utan explicit nivå.

### Terminalrapportens innehåll
- **D-05: Ingen compliance-score i klarspråksterminalen.** Antal punkter + impact-sortering räcker. En siffra utan kontext läses som betyg och skaver mot "igenkänning, inte skam".
- **D-06: Neutral avslutning utan sälj-CTA.** CLI-dokumentets "Vill du ha hjälp att prioritera? Hör av dig..." utgår — verktyget är publikt på npm och andra byråer kör det åt sina kunder. Ersätts med neutral rad i stil med "Börja uppifrån. Punkterna högst upp kostar dig mest kunder." (OBS: inga tankstreck — tonregel.) Slutlig lydelse via D-09.
- **D-07: Öppningen behåller kärnan men stryker sifferspannet.** "Det betyder inte att du gjort något fel. De flesta som bygger en webbplats får aldrig veta att tillgänglighet ens är en sak. Nu vet du..." behålls; claimen "De flesta sajter vi skannar har mellan 15 och 40 sådana här punkter" STRYKS ("vi skannar" stämmer inte för alla avsändare av ett publikt verktyg; ärlighetsregeln).

### PDF (PLAIN-05)
- **D-08: Klarspråks-PDF:en speglar terminalen.** Öppning + impact-sorterad lista (de fem fälten + allvarlighetsbadge) + neutral avslutning + diskret sidfot med URL, skanningsdatum och verktygsversion (trovärdighet). INGEN score, INGA WCAG/DIGG-tabeller, INGA legal-sektioner. `generateReportHTML(result, sector, audience)` väljer klarspråksmall när `audience === 'plain'`; developer-PDF:en förblir byte-för-byte oförändrad.

### Lydelser & granskning
- **D-09: Exakta lydelser via utkast + Karin-grind.** Öppning, avslutning, tom-state ("Vi hittade inga hinder..."-varianten) och engelska översättningar skrivs av Claude under exekvering enligt tonreglerna. Karin godkänner via den befintliga leveransgrinden: testskanning av johancask.com med `--plain --pdf` + Version Packages-PR-mergen.

### Kvalitetsvakter (tester)
- **D-10: Fyra mekaniska vakter ingår i fasen:**
  1. **Encoding-vakt** — vitest asserterar att alla plainLanguage-texter innehåller korrekta å/ä/ö (sv) och att inga mojibake-sekvenser (`Ã`) förekommer i någon text.
  2. **Ton-lint** — inga tankstreck (—/–) och inga procenttecken i någon plainLanguage-text (både sv och en).
  3. **sv/en-paritet** — exakt samma 8 ruleIds har `plainLanguage` i både `rules.sv.json` och `rules.en.json`, med identiska `impactLevel`-värden.
  4. **Renderar-strukturtest** — impact-sorteringsordning, badge-mappning, fallback till `remediation.description` när `plainLanguage` saknas, tom-state.

### JSON & flaggprioritet
- **D-11: `plainLanguage` ligger ALLTID i `EnrichedReport`/`--json`-utdata** (additivt optional fält), oavsett `--audience`. Bakåtkompatibelt; JSON-konsumenter kan bygga egna klarspråksvyer.
- **D-12: Flaggprioritet `json > light > plain`.** Plain-grenen placeras före dashboard-fallbacken (sista `else`) i CLI:ts utskriftskedja, per underlagets grenplacering. `--plain --json` ger JSON (med plainLanguage-datan), `--plain --light` ger light.

### Claude's Discretion
- Exakta i18n-nyckelnamn och struktur i locale-filerna
- Intern struktur i `plain-report.ts` (IMPACT-tabellens utformning etc.)
- Testfilernas placering och namngivning (följ befintliga mönster per paket)
- Changeset-formuleringar
- PDF-sidfotens exakta layout
- Tom-state-lydelsens exakta formulering (inom tonreglerna, granskas via D-09)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auktoritativ ram (Karins beslut + arkitekturvalen)
- `.planning/phases/34-klarsprak-plain-language-report/daniel-engine-klarsprak-2026-06-05.md` — auktoritativ: flaggdesign, text-i-standards-arkitekturen, enrichment-koppling (EN uppslagning), tonregler, de 8 texternas urval, leveransplan, samt domen "bygg enligt CLI-versionen, behåll innehållet från klarsprakslagret"

### Implementationsreferens
- `.planning/phases/34-klarsprak-plain-language-report/klarsprak-cli-implementation.md` — bygg enligt denna (typer, CLI-koppling, renderarens grundstruktur) MED AVVIKELSER: `getPlainLanguageCopy`-helpern + `RULES_BY_LANG` SKROTAS (renderaren läser `report.plainLanguage` direkt); exemplets `"ruleId": "image-alt"` är FEL (semantiskt id är `alt-text`); chrome-strängar via `t()` i stället för hårdkodad svenska (D-01); avslutnings-CTA:n ersätts (D-06); öppningen justeras (D-07)

### Innehållskälla (texterna)
- `.planning/phases/34-klarsprak-plain-language-report/klarsprakslager-engine.md` — de 8 färdiga texterna (innehåll som ska in i rules.sv.json), tonreglerna (fingerprint), allvarlighetsnivåerna per text (D-04), rapportöppningen (minus sifferspannet, D-07), badge-klartextmappningen (Stoppar köp / Hindrar kunder / Försämrar upplevelsen / Värt att putsa). Dess svensk-nycklade `PlainCopy`-datatyp är SKROTAD.

### Roadmap
- `.planning/ROADMAP.md` — Phase 34-sektionen, särskilt "Tekniska avgöranden (verifierade mot kod)"

</canonical_refs>

<code_context>
## Existing Code Insights

### Integration Points (verifierade mot kod 2026-06-11)
- `packages/standards/src/index.ts` — `generateRegulatoryReport(ruleId, lang)` plockar explicita fält (spreadar INTE) → `plainLanguage` måste kopieras explicit där, med EN-fallback (D-03). Flödar sedan genom `{...report}`-spreaden i enrichment utan engine-ändringar för dataflödet.
- `packages/engine/src/cli/index.ts` — utskriftskedjan: `if (options.json && options.light)` (rad ~203) / `else if (options.json)` / `else if (options.light)` / `else { dashboard }` (rad ~241). Plain-grenen läggs före sista `else` (D-12). `t()` används redan för chrome (rad ~134: `ora(t('cli.initializing'))`). `generateReportHTML(result, options.sector)` anropas på rad ~174 — får tredje arg.
- `packages/engine/src/i18n/index.ts` — `t()` + `setLanguage()`; 9 bas-locales (en, sv, de, fr, es, nl, fi, dk, no) + alias (en-gb/en-us/en-ca/en-au→en, da→dk, nb→no). `LocaleData = typeof en` med typade nyckel-paths → nya nycklar MÅSTE läggas i alla 9 `packages/engine/src/locales/*.json`.
- `packages/engine/src/reporting/html-template.ts:27` — `generateReportHTML(result: ScanResult, sector: 'public' | 'private' = 'public'): string` → utökas med `audience`-param (PLAIN-05).
- `packages/standards/data/rules.sv.json` — 46 regler, semantiska id bekräftade (`form-labels`, `alt-text` etc.). `rules.en.json` har samma form.

### Established Patterns
- Changesets-releaseflöde; minor-bump för standards + engine, components orörd
- Zero-warning lint-state (fas 33) — inga `as any`; `prepublishOnly` kedjar build+lint+typecheck+check:exports+check:types+test:ci
- standards = ren data + synkrona helpers, ingen fs/network (importeras i browser-bundles)
- Vitest; engine-reporting-tester ligger som `packages/engine/src/reporting/*.test.ts`
- Auto-syncing test pattern: assertions anropar standards-funktioner direkt

### Encoding-läge
- Fasmappens tre källdokument är verifierat mojibake-fria (0 träffar på `Ã`), men ROADMAP:s encoding-vakt gäller fortfarande: texterna som skrivs in i `rules.sv.json` måste verifieras med korrekta å/ä/ö före commit (mekaniserat via D-10.1).

</code_context>

<specifics>
## Specific Ideas

- Allvarlighetsbadges visas i klartext för kunden, aldrig "nivå A/AA": Stoppar köp / Hindrar kunder / Försämrar upplevelsen / Värt att putsa (klarsprakslagrets tabell)
- Affärsnyttan kommer FÖRE tekniken i varje rads fältordning: Vad som händer → Vem det drabbar → Vad det kostar → Så fixar du
- Exempelkörningen i CLI-dokumentet (johancask.com) visar förväntad terminalform — numrerad lista, badge i färg per nivå (chalk: stoppar-kop=red.bold, hindrar=red, forsamrar=yellow, putsning=gray)
- Leverans: testskanning av johancask.com med `--plain --pdf` för Karins granskning; minor-release via changesets efter godkännande (Version Packages-PR-mergen är godkännandegrinden)

</specifics>

<deferred>
## Deferred Ideas

- **Klarspråkstexter på fler språk (de/fr/es/nl/fi/dk/no)** — efter native tonvalidering. Tonen är produktens fingerprint; maskinöversättning utan granskning är en risk, inte en feature (PROJECT.md listar redan native-granskning som out-of-scope). Arkitekturen (D-03-fallbacken) är förberedd: lägg texterna i `rules.<lang>.json` så aktiveras språket automatiskt.
- **Riktiga chrome-översättningar för de 7 övriga locale-filerna** — samma grind som ovan; engelska värden gäller tills dess.

</deferred>

---

*Phase: 34-klarsprak-plain-language-report*
*Context gathered: 2026-06-11*
