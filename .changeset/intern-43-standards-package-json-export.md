---
"@holmdigital/standards": patch
---

Intern #43 (fynd 3) — exponera `./package.json` i `exports`.

Verktyg som läser paketets version via `require.resolve('@holmdigital/standards/package.json')` föll tidigare på `ERR_PACKAGE_PATH_NOT_EXPORTED`, eftersom `exports` bara listade `.`, `./data/*` och `./schema/*`. Motorns `getStandardsVersion()` fångade felet och rapporterade `standardsVersion: "unknown"` i skanningens metadata. `exports` exponerar nu även `"./package.json"` (standardpraxis, rent additivt), så versionen kan läsas. Ingen kod- eller dataändring i övrigt.
