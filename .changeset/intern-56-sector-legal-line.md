---
"@holmdigital/engine": patch
---

Intern #56 — klarspråksrapportens lagrad påstod DOS-lagen även för privata kunder.

`klarsprakLegalLine` returnerade hårdkodat `"Lagkrav: DOS-lagen (2018:1937), 10 §."` och tog ingen sektor. DOS-lagen gäller **offentlig** sektor, så varje privat kund som fick en klarspråks-PDF pekades mot fel lag — i utgående kundtext. `--sector private` slog igenom på rapportens toppsammanfattning men nådde aldrig lagraden per fynd.

Funktionen tar nu `{ sector, ruleId }`. **`ruleId` behövs, inte bara sektor:** Junos godkända lydelser är nycklade på regel, inte kriterium — `region` och `heading-order` citerar båda 1.3.1 men skiljer sig i svansen ("sidstruktur" vs "rubrikstruktur").

För `sector: 'private'` nämns DOS-lagen aldrig. De tre regler Juno godkänt lydelser för får dem ordagrant; övriga faller på den redan godkända "lagrum okänt"-raden i stället för påhittad juridik — vilket dessutom är sant i sak, eftersom EAA:s tillämplighet på en enskild privat aktör beror på om tjänsten är konsumentriktad och inte går att avgöra ur en URL. Byts när Juno definierat en generell privat lydelse.

Sektorn trådas till alla tre anropsställen: `--plain` (terminal), plain-HTML/PDF och widget-JSON:ens `legalBasis`.

`opts` är optionellt, så **offentlig sektor är byte-identisk** — verifierat live mot en riktig sajt, och de befintliga testerna från #29 passerar oförändrade. Sidoeffekt: för privat sektor får `region` och `heading-order` nu riktig vägledning i stället för "Lagrum okänt", som de fick före ändringen.
