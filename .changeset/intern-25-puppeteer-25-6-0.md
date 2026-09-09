---
"@holmdigital/engine": patch
---

Intern #25 — Puppeteer 25.4.0 → 25.6.0, verifierat neutral före bump.

Kontrollkörning av **tre** versioner mot åtta referenssajter: 25.2.1 (Chrome 150.0.7871.24), 25.4.0 (Chrome 151.0.7922.47) och 25.6.0 (Chrome 151.0.7922.77). Referenssetet är sex av webperfs topp-10 offentlig sektor från Intern #18, plus apotea.se som cookie-tung e-handel och zeppelin-cat.se som carousel-tung sajt.

**Noll skillnader på alla åtta**, jämfört på score, complianceStatus, regeluppsättning, WCAG-kriteriemappning och antal felnoder. Även apotea, som ger 5 fel över 13 noder, är identisk i alla tre versionerna.

Det täcker in båda de behaviorrelevanta delarna: cookie-/swap-normaliseringen i 25.3.0, UA-ändringen i 25.5.0 (motorn sätter ändå alltid sin egen user agent via `page.setUserAgent`, så den ändringen kan inte träffa oss) och out-of-process-iframe-fixen i 25.6.0.

Lockfilen rör bara puppeteer och dess egna beroenden (`@puppeteer/browsers` 3.0.6 → 3.2.0, `modern-tar` 0.7.7 → 0.8.5). Inga nedgraderingar, inga nya sårbarheter — de fyra `npm audit` rapporterar är pre-existerande dev-verktyg (vitest) och transitiva, opåverkade av bumpen. Den stale `packages/engine`-posten i lockfilen (3.3.2) rättades till 3.3.4 på köpet.
