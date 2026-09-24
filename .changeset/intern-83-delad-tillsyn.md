---
'@holmdigital/standards': minor
'@holmdigital/engine': patch
'@holmdigital/components': patch
---

Intern #83, Karins beslut i #94 fråga 2: ett svenskt utlåtande för privat sektor anger hur tillsynen över LPTT är fördelad, i stället för att peka ut PTS för alla.

**Det här ser kunden.** Tillsynsavsnittet i ett svenskt utlåtande för privat sektor lyder nu, ordagrant som Karin skrev det:

> Tillsynen över lagen (2023:254) om vissa produkters och tjänsters tillgänglighet är uppdelad mellan flera myndigheter beroende på vilken tjänst som erbjuds: Post- och telestyrelsen ansvarar för elektronisk kommunikation, banktjänster och e-handelstjänster, Mediemyndigheten för audiovisuella medietjänster, Myndigheten för tillgängliga medier för e-böcker, och Konsumentverket respektive Transportstyrelsen för olika delar av persontransporttjänster.

Förut stod där att PTS har ansvaret för tillsynen och att kunden kan anmäla till PTS. För ett buss-, tåg-, flyg- eller rederibolags webbplats är Konsumentverket tillsynsmyndighet, så meningen var fel för dem. Motorn vet inte vilken tjänst kunden driver, och därför anger avsnittet fördelningen.

**Texten ersätter hela avsnittet.** Mallens två meningar om att anmäla till PTS och dess stycke om oskäligt betungande krav, tillgänglighetsredogörelsen och begäran om tillgängliggörande står inte längre i ett svenskt utlåtande för privat sektor. Det stycket hör till DOS-lagen och offentlig sektor.

**Oförändrat:** offentlig sektor, alla andra länder och svensk privat sektor på andra språk än svenska. Det finns bara en svensk text än.

**Nytt i standards:** `enforcement.statementText`, en språknycklad text för en lag vars tillsyn är delad efter tjänstetyp, och `getEnforcementStatementText(country, sector, lang)`. Funktionen har samma lagval som `resolveNationalLawReference` och samma lagnamnsgrind. Texten namnger lagen, så den används bara när lagnamnet är attesterat; annars vore den en väg förbi grinden. Motorn och komponenten läser den på samma sätt.
