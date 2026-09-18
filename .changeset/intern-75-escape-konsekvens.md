---
"@holmdigital/engine": patch
---

Intern #75 — escapa axe- och regeldatahärlett innehåll konsekvent i utvecklarrapporten.

Uppföljning på #74. Där var scan-URL:en, som är rå CLI-indata, en verklig sårbarhet. Under den fixen visade en PoC mot varje fält att ytterligare nio renderades rått i utvecklarrapporten, medan klarspråksrapporten redan escapade flera av dem. Samma malldrift, ett steg vidare.

**Inget av fälten är angriparstyrt i dag** — `ruleId` och `wcagCriteria`/`en301549Criteria` kommer ur axe-cores egen regelidentitet och taggmappning, `dosLagenReference` och `eaaDeadline` ur vår lagdata, `priorityRationale` ur vår i18n, och `remediation.component` är `undefined` från skannern. Det här är alltså en förebyggande åtgärd, inte en sårbarhetsfix.

Escapade: `report.ruleId` (båda sektionerna), `wcagCriteria`, `en301549Criteria`, `dosLagenReference`, `legalContext.eaaDeadline`, `holmdigitalInsight.priorityRationale`, `remediation.component`.

**`diggRisk` byggdes in i ett CSS-klassnamn** med `` `badge-${diggRisk}` ``, alltså ren strängkonkatenering in i ett attribut. `escapeHtml` skyddar inte attributkontext som en textnod, så ett oväntat värde kunde bryta ut ur `class=""`. Klassen slås nu upp i en fast tabell: en nyckel som inte finns ger tom sträng, aldrig ett nytt attribut.

**Det som gör ändringen värd mer än nio escapes: ett svep.** Ett nytt test läser mallfilen och underkänner varje `${report.x}`/`${result.x}` som inte går genom `escapeHtml` eller står i en uttrycklig undantagslista med skäl. Att escapa nio fält hjälper inte mot det tionde som läggs till om ett halvår, och just den glidningen är vad både #74 och #75 handlar om.

Två av mina egna testförsök var fel och är värda att nämna, eftersom båda felen är lätta att göra igen:

- Det första badge-testet letade efter substrängen `onmouseover=alert(1)` och "hittade sårbarheten" i korrekt escapad utdata. `escapeHtml` har ingen anledning att koda `=`, `(` eller blanksteg i en textnod — det som gör en payload ofarlig där är att citattecknen är kodade. Testet prövar nu strukturen i stället: klassattributet stängt och tomt, citattecknen kodade.
- Det första svepet sökte på `report.` i råtexten och träffade fjorton `t('report.x')`-anrop, eftersom i18n-nycklarna heter så. Det strippar nu stränglitteraler först.
