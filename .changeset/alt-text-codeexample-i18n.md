---
"@holmdigital/standards": patch
---

Translate the readable `codeExample` comments for the alt-text rule (`image-alt`) into each locale (Intern #13 follow-up). The three guiding comments — "Missing alt", "Descriptive alt" and "Decorative image" — were left in English in every non-English rules file even though the surrounding rule text was localised. They are now translated in `sv`, `de`, `fr`, `es`, `nl`, `fi`, `da` and `no`; the English variants (`en`, `en-ca`, `en-gb`, `en-us`) are unchanged. Code identifiers and JSX (`<img>`, `src`, `alt`, `role="presentation"`, the `HolmDigital Logo` sample value) stay in English — only the `//` comment prose is localised.
