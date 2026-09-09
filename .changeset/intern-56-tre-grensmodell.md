---
"@holmdigital/engine": patch
---

Intern #56 — lagraden bygger nu på Junos tre-grensmodell, och needs-review-texten slutar påstå att posterna inte är hinder.

**Rättar en överdrift jag släppte i 3.3.3.** Lydelsen för `region` och `heading-order` sa "WCAG 2.2, framgångskriterium 1.3.1 ... (nivå A)". Juno belade mot primärkälla att den påstår ett lagkrav som inte finns: axe taggar båda `best-practice` utan wcag-tagg, SC 1.3.1 kräver varken sekventiell rubrikordning eller att allt innehåll ligger i landmärken, och närmaste kriterier är 2.4.10 (AAA) respektive 2.4.1 (där en skiplänk räcker). Vilmas fastställda lydelse ersätter den, och gäller **båda** sektorerna — det är en klassningsfråga, inte en sektorsfråga, så offentlig sektor får den också i stället för det tidigare "Lagrum okänt".

**Tre grenar, inte två.** Juno gick igenom alla 48 regler individuellt i stället för att generalisera från två. En tvågrensmodell klassar `color-contrast` fel: den är en riktig WCAG 1.4.3 AA-brist, inte god praxis.

- **gren 1, 38 regler** — formellt lagkrav. Offentlig citerar DOS-lagen 10 §, privat citerar lagen om vissa produkters och tjänsters tillgänglighet (2023:254) 6 och 9 §§. Båda med kriterium och titel ur regeldatan.
- **gren 2, 7 regler** — god praxis, samma text för båda sektorerna.
- **gren 3, 3 regler** (`target-size`, `dragging-movements`, `focus-not-obscured`) — riktiga WCAG 2.2 AA-kriterier som ännu inte är bindande. Skiljs från gren 2: de ÄR framgångskriterier, de är bara inte refererade i EUT än.

Grenen härleds ur fält rapporten redan bär. Den härledningen reproducerar Junos 38/7/3 exakt, vilket ett test låser mot regeldatan.

**Privat gren 1 gissar aldrig en EN 301 549-version.** Juno kunde inte belägga vilken version som är citerad för lag 2023:254 mot primärkälla, så raden går ut med markeringen kvar.

**Datavarning inbyggd i koden:** lagraden får aldrig byggas från `legalContext`. Blocket finns på 45 av 48 regler med identisk text, inklusive alla sju best practice-regler, och kan därför inte skilja lagkrav från god praxis.

**18 strängar rättade** (9 språk × `needs_review_intro`/`needs_review_note`). Den gamla texten påstod att needs-review-posterna "inte är hinder". Sanningen är att de varken är godkända eller underkända — en människa avgör. Karins källverifierade lydelser säger det. Tar samtidigt bort tankstrecken ur de nycklarna.
