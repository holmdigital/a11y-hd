---
"@holmdigital/engine": patch
---

Bump axe-core 4.12.1 → 4.13.0.

Verifierad score-effekt före bump (Intern #18): regeluppsättningen är **identisk** mellan versionerna (105 regler, inga nya/borttagna, inga ändrade WCAG-taggar), så motorns WCAG→lag-mappning är oförändrad. Kontrollkörning på webperf top-10 offentlig sektor + W3C BAD-demo + Wikipedia gav identiskt utfall på 9/10 sajter; enda stabila skillnaden var en (1) extra `color-contrast`-nod på en enskild sida, från 4.13.0:s något noggrannare kontrast-check. Ingen API-ändring.
