---
"@holmdigital/standards": major
---

Intern #63 — EAA-transponeringarna för Frankrike, Danmark och Spanien, och `enforcement`/`sanctions` blir valfria.

## Brytande: `NationalLaw.enforcement` och `NationalLaw.sanctions` är valfria

De var obligatoriska, och det var fel. Typen påstod att varje lag i världen har exakt en namngiven tillsynsmyndighet och ett eget sanktionsspann i siffror. Tre av Junos fynd visar att den inte gör det:

- **Spanien har ingen nationell tillsynsmyndighet.** Ley 11/2023 art. 27.3 lägger den hos varje autonom region samt Ceuta och Melilla, var och en utser sin egen. Art. 28:s *unidad técnica* är uttryckligen ett stöd- och samordningsorgan, inte en tillsynsmyndighet.
- **Spanien har inget eget sanktionsspann.** Art. 30 hänvisar till sektorslagstiftningen, i andra hand till avdelning III i RDL 1/2013. Det finns ingen siffra att skriva.
- **Frankrikes sanktionsart är belagd men inte beloppet.** Art. R. 451-4 code de la consommation gör överträdelse till *"une amende relevant des contraventions de 5e classe"* — straffrättsliga böter, inte en administrativ avgift. `Sanction` kräver `minAmount`/`maxAmount`.
- **Danmarks tillsyn och sanktioner är obelagda.** `retsinformation.dk` och `sik.dk` svarar båda 403 på automatiserad hämtning, så lagtexten är aldrig öppnad.

Junos ord: *"Om schemat kräver `enforcement` för att posten ska validera är det schemat som behöver ett sätt att uttrycka 'tillsynen är uppdelad', inte datan som ska fyllas med en gissning."*

**Migrering.** Läs `law.enforcement?.authorityName` i stället för `law.enforcement.authorityName`, likaså `law.sanctions?`. Saknat fält betyder *"ingen enskild myndighet, eller inte belagd"* — aldrig *"ingen finns"*. Fall aldrig tillbaka på ett annat lands myndighet. `getMaxSanction()` hoppar nu över lagar utan spann i stället för att läsa dem som ett nolltak, vilket hade underskattat landets maxexponering.

Schemat speglar ändringen: båda fälten är kvar som `properties`, men ur `required`.

## Tre nya lagposter

Privat sektor i Frankrike, Danmark och Spanien fick tidigare **ingen lag namngiven alls**, bara en omskrivning utan lagnamn, trots att EAA gäller i alla tre sedan 2025-06-28.

| id | Lag | Tillsyn | Sanktioner |
|---|---|---|---|
| `fr-eaa` | Code de la consommation art. L. 412-13 (+ D. 412-57, arrêté 9 oktober 2023) | DGCCRF | **Utelämnad** — art finns, belopp obelagt |
| `dk-eaa` | Lov om tilgængelighedskrav for produkter og tjenester | **Utelämnad** — obelagd | **Utelämnad** — obelagd |
| `es-eaa` | Ley 11/2023, de 8 de mayo | **Utelämnad** — regional enligt art. 27.3 | **Utelämnad** — saknas i lagen |

Varje utelämnat fält har ett `note` som säger exakt varför och vad som krävs för att fylla det. Testerna failar både om posterna försvinner och om någon fyller dem med en gissning.

## Två felaktiga tillsynsmyndigheter rättade

- **`ENFORCEMENT_BODIES_DETAILED.FR.eaa`: Arcom → DGCCRF.** Arcom var fel som generellt påstående. Dess EAA-behörighet enligt art. L. 511-25-1 omfattar bara tjänster som ger tillgång till audiovisuella medietjänster samt e-böcker och läsprogramvara. DGCCRF är den generella marknadskontrollmyndigheten och samordnar sektorsmyndigheterna. Arcoms mandat ligger i `fr-eaa`s `responsibility`. **WAD-sidan rörs inte** — DINUM är fortfarande rätt för RGAA och offentlig sektor, och noten i `fr-rgaa` står kvar oförändrad.
- **`ENFORCEMENT_BODIES_DETAILED.ES.eaa`: Ministerio de Consumo → arrangemanget.** Ministeriet är inte tillsynsmyndighet enligt lagen. Eftersom Spanien inte har något enskilt nationellt organ att namnge namnges ordningen i stället, med artikelhänvisning.
