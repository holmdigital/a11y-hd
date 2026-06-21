---
"@holmdigital/engine": minor
"@holmdigital/standards": patch
---

Klarspråksrapport: launch-blockerande fixar (KRAV 1-3 kort sikt)

- **KRAV 1 (engine):** gruppera fynd av samma regel till ett enda klarspråkskort med antal förekomster ("color-contrast, 5 förekomster"), i både terminal- och PDF-renderaren. Identiska fynd staplas inte längre som dubblettkort. Grupperingen sker per `ruleId` oavsett position; introtexten ("Hittade N hinder") räknar fortfarande det totala antalet fynd.
- **KRAV 2 (standards):** ta bort det oinfriade löftet "Vi anger exakt vilka färger…" / "We specify exactly which colours…" ur color-contrast-copyn (sv + en). Den kvarvarande fix-meningen står på egen hand utan hex-koder eller kontrastkvot.
- **KRAV 3 kort sikt (engine):** läck inte axe-cores råa engelska hjälptext in i en svensk klarspråksrapport. Omappade fynd visar nu en översatt, självbärande ram-mening i stället; engelska rapporter behåller den tekniska detaljen.
