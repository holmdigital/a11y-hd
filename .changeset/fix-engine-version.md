---
"@holmdigital/engine": patch
---

fix(engine): replace hardcoded engineVersion with dynamic package.json read

The internal `engineVersion` metadata was stuck at `1.4.7` and `standardsVersion` at `1.2.2` regardless of the actual published version. Now reads versions dynamically from `package.json` at runtime using `readFileSync` with CJS/ESM compatibility.
