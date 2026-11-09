---
"@holmdigital/engine": patch
---

`metadata.standardsVersion` blev `"unknown"` för alla som laddar motorn som ESM, till exempel scan-servern på Hetzner.

`getStandardsVersion()` anropade en bar `require.resolve`. I ESM-bygget finns ingen `require`, och tsups ersättning kastar `Dynamic require ... is not supported`. Felet fångades och versionen blev `"unknown"`. CJS-bygget och testerna, som kör källan, påverkades inte, så det syntes inte förrän i en skanning från scan-servern.

Uppslaget går nu via `createRequire(import.meta.url)`, som fungerar i båda byggena. tsups `shims: true` ger `import.meta.url` även i CJS. Ett nytt test kör `dist/index.mjs` och `dist/index.js` i en vanlig Node-process. ESM-fallet körs med `--input-type=module`, eftersom en vanlig `node -e` har en global `require` som döljer felet. Testet är rött mot 4.0.1:s bygge och grönt efter rättningen.
