---
"@holmdigital/engine": minor
---

Klarspråksläget (`--plain`) spärras nu för språk som ännu inte har egna klarspråksrubriker.

Tidigare kunde `--plain --lang de` (eller franska, spanska och så vidare) köras trots att de språken saknar egen klarspråkstext. Resultatet blev en rapport som via fallback visades på engelska under en icke-engelsk flagg, vilket motverkar hela klarspråkspoängen.

CLI:n vägrar nu klarspråk på ett språk som inte täcker kärnreglerna och pekar i stället mot ett språk som stöds (svenska eller engelska) eller utvecklarrapporten. Engelska och dess regionala varianter räknas alltid som stödda, eftersom engelsk klarspråk är äkta och inte en tyst fallback. Stödet beräknas ur regeldatan och uppdaterar sig självt när fler språk fylls i. JSON-utdata påverkas inte.
