# Phase 34: Klarspråksrapport (opt-in plain-language report) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-11
**Phase:** 34-klarsprak-plain-language-report
**Areas discussed:** Chrome-strängar & --lang, impactLevel-strategi, Terminalens score & CTA, PDF-utformning, Mekaniska kvalitetsvakter, --json & flaggprioritet, Exakta lydelser

---

## Chrome-strängar & --lang

| Option | Description | Selected |
|--------|-------------|----------|
| Engine i18n via t() | Följer befintligt mönster; nycklar i alla 9 locale-filer; sv+en riktiga översättningar, övriga engelska värden | ✓ |
| Hårdkodad svenska | CLI-dokumentets exempel; --plain --lang en blir halvsvensk | |
| Hårdkodad svenska + spärr | Varning/exit vid --plain + --lang ≠ sv | |

**User's choice:** Engine i18n via t()

| Option | Description | Selected |
|--------|-------------|----------|
| Tyst degradering | Fallback till remediation.description på språket | |
| Degradering med notis | Samma + notisrad om att klarspråk saknas på språket | |
| Spärra till svenska | --plain kräver --lang sv | |
| *(Fritext)* | "går det inte att fixa andra språk? men åtminstone Svenska + Engelska som är gångbart i stora delar av världen" | ✓ |

**User's choice:** Fritext → beslut: PLAIN-06 utökas till sv + en (8 texter i båda); övriga 7 språk deferred efter native tonvalidering (bekräftat "ja precis" / "ja det är väl ändå smidigast?").
**Notes:** Följdfråga om fallback för språk utan texter: användaren svarade "antingen tyst eller kanske engelska?" → beslut: engelsk tyst fallback i `generateRegulatoryReport` vid enrichment (aldrig i renderaren). Konsistensargument: chrome för oöversatta språk har ändå engelska värden, så resultatet blir helt engelsk rapport i stället för halvspråk.

---

## impactLevel-strategi

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit på alla 8 | Klarsprakslagrets redaktionella nivåer ordagrant; diggRisk-härledning endast fallback för framtida regler | ✓ |
| Bara form-labels explicit | ROADMAP:s bokstavliga formulering; övriga härleds | |
| Du bestämmer | Claude's discretion | |

**User's choice:** Explicit på alla 8
**Notes:** Datagrundat: verifiering mot rules.sv.json visade att härledning från diggRisk ger annan nivå än redaktörens val för 6 av 8 regler (t.ex. language-of-page hade blivit "Hindrar kunder" i stället för "Värt att putsa").

---

## Terminalens score & CTA

| Option | Description | Selected |
|--------|-------------|----------|
| Ingen score | Antal punkter + sortering räcker; siffra läses som betyg | ✓ |
| Score med klarspråksram | Poäng förklarad med referensram | |
| Kvalitativ sammanfattning | Ingen siffra, en lägesmening | |

**User's choice:** Ingen score

| Option | Description | Selected |
|--------|-------------|----------|
| Behåll CTA:n | "Hör av dig..." — HolmDigital som avsändare | |
| Neutral avslutning | Ingen säljton; andra byråer kör verktyget åt sina kunder | ✓ |
| Ingen avslutningsrad | Slutar efter sista punkten | |

**User's choice:** Neutral avslutning

| Option | Description | Selected |
|--------|-------------|----------|
| Behåll ordagrant | Klarsprakslagrets öppning med "15–40 punkter"-spannet | |
| Stryk sifferspannet | Kärnan behålls utan claimen | ✓ |
| Du bestämmer | Claude's discretion | |

**User's choice:** Stryk sifferspannet

---

## PDF-utformning

| Option | Description | Selected |
|--------|-------------|----------|
| Spegla terminalen | Öppning + sorterad lista + neutral avslutning + diskret sidfot; ingen score/jargong/legal | ✓ |
| Befintlig mall, utbytta texter | Struktur kvar, texter bytta | |
| Hybrid med formell bilaga | Klarspråk först + WCAG/EN/DOS-referensbilaga | |

**User's choice:** Spegla terminalen

---

## Mekaniska kvalitetsvakter

| Option | Description | Selected |
|--------|-------------|----------|
| Encoding-vakt | å/ä/ö korrekta, ingen mojibake i texterna | ✓ |
| Ton-lint | Inga tankstreck/procenttecken i någon text (sv+en) | ✓ |
| sv/en-paritet | Samma 8 ruleIds + identiska impactLevel i båda filer | ✓ |
| Renderar-strukturtest | Sortering, badges, fallback, tom-state | ✓ |

**User's choice:** Alla fyra

---

## --json & flaggprioritet

| Option | Description | Selected |
|--------|-------------|----------|
| Alltid med | plainLanguage alltid i EnrichedReport/JSON (additivt) | ✓ |
| Bara vid --audience plain | Villkorlig strip-logik | |

**User's choice:** Alltid med

| Option | Description | Selected |
|--------|-------------|----------|
| json > light > plain | Maskinlägen vinner över presentationsval | ✓ |
| plain vinner över light | --plain --light ger klarspråk | |

**User's choice:** json > light > plain

---

## Exakta lydelser

| Option | Description | Selected |
|--------|-------------|----------|
| Utkast + Karin-grind | Claude skriver enligt tonregler; Karin godkänner via leveransgrinden | ✓ |
| Lås lydelser nu | Formuleringar låses ordagrant i CONTEXT.md | |

**User's choice:** Utkast + Karin-grind

---

## Claude's Discretion

- Exakta i18n-nyckelnamn och locale-filstruktur
- Intern struktur i plain-report.ts
- Testfilers placering/namngivning
- Changeset-formuleringar
- PDF-sidfotens exakta layout
- Tom-state-lydelse (inom tonreglerna)

## Deferred Ideas

- Klarspråkstexter på fler språk (de/fr/es/nl/fi/dk/no) efter native tonvalidering
- Riktiga chrome-översättningar för de 7 övriga locale-filerna (samma grind)
