---
'@holmdigital/engine': patch
---

cosmiconfig ^9.0.2 → ^10.0.1 (ersätter Dependabot #225, som inte gick att rebasa). cosmiconfig 10 kräver Node ^22.18 eller ≥ 24, och engine kräver redan ≥ 22.22. CLI:t läser fortfarande `.a11yrc` och `package.json` på samma sätt.
