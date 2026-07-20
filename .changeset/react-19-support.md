---
"@holmdigital/components": minor
---

Add React 19 compatibility. Fixed three `cloneElement`/ref typing issues (Accordion, Select, Tooltip) that only surfaced under React 19's stricter types. Runtime behavior is unchanged: the full component suite passes under both React 18 and React 19 (649 tests on each).

The `react`/`react-dom` peer dependency range remains `>=18.0.0` and the published type surface is unchanged, so existing React 18 consumers are unaffected — at runtime and at the type level.

React 19 is now the **development** baseline. The package's own `tsc --noEmit` requires React 19 types: `Select.tsx` passes an internal `RefObject<HTMLDivElement | null>` that React 18's `LegacyRef` rejects. That ref is internal context state and does not appear in the published `.d.ts`, so the constraint stops at this repository and never reaches consumers.
