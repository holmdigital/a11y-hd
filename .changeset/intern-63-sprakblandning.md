---
'@holmdigital/standards': patch
---

Intern #63 — två språkblandade fält rättade.

- `de-bitv.enforcement.responsibility`: `Federal tillsyn av offentlig sektor.` → `Federal oversight of the public sector.` Hela meningen var svensk i en tysk post. Engelska följer det mönster som faktiskt gäller för beskrivande prosafält i granskade poster; lagnamn och andra citatfält står kvar på originalspråket.
- `nl-eaa.sanctions.description`: ett svenskt `eller` mitt i en nederländsk mening → `of`.

Ingen sakuppgift är ändrad. Varken motorn eller komponenten läser `responsibility` eller `sanctions`, så inget kunddokument påverkas. Ändringen syns bara för den som läser datan via API:t.
