---
"@holmdigital/components": patch
---

PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged. Added `@types/node@^22.10.2` as devDependency. Resolved 27 pre-existing `tsc --noEmit` errors across 5 categories (Node types, vitest-axe matcher augmentation, read-only ref assignment, unused @ts-expect-error, LiveRegionLocale narrowing). Public API byte-equivalent to 2.6.0.
