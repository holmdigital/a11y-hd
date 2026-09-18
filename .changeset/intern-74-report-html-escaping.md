---
"@holmdigital/engine": patch
---

Escapa scan-URL och axe-härledd text i den genererade HTML-rapporten.

Utvecklar- och inconclusive-rapporten skrev in `result.url` via `t()` (som inte escapar) rakt i HTML:en, medan klarspråksrapporten redan escapade. En scan mot en URL som innehåller markup kunde därmed injicera HTML/script i rapporten — en risk när rapporter delas som artefakter, och en skarp vektor dagen skanningen körs hostad (jfr #53). Nu escapas `result.url` i både utvecklar- och inconclusive-mallen, `reasoning`/`swedishInterpretation`/`remediation.description` escapas konsekvent, och `escapeHtml` kodar även `"` och `'`. Regressionstester tillagda. (intern#74)
