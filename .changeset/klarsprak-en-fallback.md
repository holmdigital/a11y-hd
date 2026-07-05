---
"@holmdigital/engine": minor
---

`--plain` levererar nu en rapport i alla länder i stället för att neka.

Tidigare vägrade `--plain` att köra på ett språk vars kärnregler inte var översatta (språkspärren avbröt med felkod). Nu serveras rapporten på engelska (klarspråksgolvet) i stället för att avvisas, med en tydlig notis högst upp: "Plain language is not yet available in [språk], so this report is shown in English." Så får varje land en läsbar klarspråksrapport direkt, och vi fyller språk natively land för land.

Engelska är default för `--plain`, `--lang sv` ger svenska, och ett språk som redan är fyllt natively renderas oförändrat på sitt eget språk. Notisen visas i både terminalrapporten och HTML/PDF-rapporten. Nya regressionstester täcker båda ytorna.
