---
"@holmdigital/components": minor
---

Add React 19 compatibility. Fixed three cloneElement/ref typing issues (Accordion, Select, Tooltip) that only surfaced under React 19's stricter types; runtime behavior is unchanged and verified against both React 18 and React 19 (649 tests passing on each). The `react`/`react-dom` peer dependency range remains `>=18.0.0`, so existing React 18 consumers are unaffected.
