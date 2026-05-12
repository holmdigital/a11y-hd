---
"@holmdigital/engine": patch
---

PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged. Fixed 2 pre-existing lint errors in `src/core/regulatory-scanner.ts` (`__ENGINE_VERSION__` ESLint readonly global, `@ts-ignore` → `@ts-expect-error`). Public API byte-equivalent to 2.5.2.
