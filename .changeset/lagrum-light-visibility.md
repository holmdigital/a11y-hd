---
"@holmdigital/engine": patch
---

Light mode now carries the legal basis (Intern #29, part 2). `enrichResultsLight` filled `dosLagenReference` and `en301549Criteria` with empty strings, so the DOS-lagen reference corrected in Intern #28 never reached the public scan widget — the surface most unknown visitors meet. The light path now resolves the rule the same way `enrichResults` does (direct id → criterion fallback, Intern #30) and fills both fields from the report. An unmapped finding says the legal basis is unknown (`Lagrum okänt` / `Legal basis unknown`) — never an empty string and never a phrase that poses as a legal reference. The light-JSON `topIssues` gains a single `legalBasis` field (not the whole rule object); measured size for a typical page grew 1971 → 2731 bytes (+39%, well under the "not more than doubled" ceiling).

(The `--plain` klarspråk line — part 1 — follows in the same PR once Juno's exact wording is in.)
