---
"@holmdigital/standards": patch
---

PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — `npm publish` now fails if lint or typecheck reports errors. No source changes.
