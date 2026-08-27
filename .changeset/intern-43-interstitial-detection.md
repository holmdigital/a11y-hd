---
"@holmdigital/engine": minor
---

Intern #43 — två robusthetsfynd i motorn.

**Fynd 1 — interstitial-/vänta-/challenge-detektion.** En sida som fortfarande är en "Vänta…"-/bot-challenge-/omdirigeringssida efter hydration-waiten (t.ex. en Cloudflare-challenge eller en meta-refresh-mellansida) mättes tidigare av axe som om den vore det riktiga innehållet, vilket gav ett vilseledande resultat för en platshållarsida. Motorn känner nu av detta (`isInterstitialPage`, exporterad): en tydlig vänta-titel, ELLER en meta-refresh på en nästan tom sida. När det upptäcks sätts `ScanMetadata.interstitialSuspected: true` och en varning loggas som föreslår ett högre `--wait-for-hydration <ms>`. Rådgivande — påverkar aldrig score, stats eller compliance. En kort men riktig sida flaggas inte.

**Fynd 3 — `standardsVersion` blev "unknown".** `getStandardsVersion()` (nu exporterad) resolvade `@holmdigital/standards/package.json`, men standards `exports` exponerade inte den subpathen, så anropet föll på `ERR_PACKAGE_PATH_NOT_EXPORTED` och versionen i metadata blev `unknown`. Fixas av standards patch-släpp (exponerar `./package.json`); motorn läser nu den riktiga semvern.
