---
"@holmdigital/engine": patch
---

Puppeteer 25.6.0 → 25.16.0, verifierat neutralt före bumpen. Rättar zod-sårbarheten GHSA-mrhx-c7xc-m3w5 (hög) för alla som installerar motorn.

**Varför.** Puppeteer 25.6.0 drar in `chromium-bidi` 17.0.2, som kräver `zod@^3.24.1`. Zod 3 har ingen rättad version (första rättade är 4.6.6), så larmet följde med till alla konsumenter: wikin, holmdigital.se och scan-servern. Det går inte att rätta med en override hos konsumenterna utan att tvinga in zod 4 i ett paket som kräver zod 3. I Puppeteer 25.16.0 kräver `chromium-bidi` 157.0.8090-0 i stället `zod@^4.6.5`, och lockfilen löser det till 4.6.7.

**Kontrollkörning enligt rutinen från Intern #25.** Samma åtta referenssajter skannades med 25.6.0 (Chrome 151.0.7922.77) och 25.16.0 (Chrome 156.0.8078.47): domstol.se, scb.se, pensionsmyndigheten.se, jo.se, kriminalvarden.se, mucf.se, apotea.se (cookie-tung e-handel) och zeppelin-cat.se (carousel-tung). Jämförelsen gällde score, complianceStatus, regeluppsättning, WCAG-kriteriemappning och antal felnoder.

**Noll skillnader på alla åtta.** Apotea ger 65/FAIL med sju regelträffar och Zeppelin 65/FAIL med fyra regelträffar i båda versionerna.

Den exakta pinnen ligger kvar. Lockfilen rör bara Puppeteer och dess egna beroenden.
