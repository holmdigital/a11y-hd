---
'@holmdigital/standards': minor
'@holmdigital/engine': minor
---

WCAG 2.5.3 Label in Name, och axe-core 4.14.

axe-core 4.14 slår på regeln `label-content-name-mismatch` som standard. Den saknade mappning i standards, och referenskörningen (Intern #25, 2026-11-10) visade vad det gav: fyndet räknades in i score (scb 87 → 82, jo 100 → 95, apotea 65 → 60), men rapporten visade kriteriet "Unknown", engelsk text och inga felnoder.

**standards:** ny regel `label-in-name` (WCAG 2.5.3, nivå A, WCAG 2.1, EN 301 549 9.2.5.3) i alla 12 språkfiler.
- Lagrumstexten och `legalContext` är desamma som för 2.1.4 i varje språkfil, eftersom båda är WCAG 2.1 nivå A och ingår i EN 301 549 V3.2.1. Testerna räknar därför 22 nivå A-regler, inte 21, och 39 lagkrav, inte 38.
- Klarspråk finns på svenska och engelska (`impactLevel: hindrar`).

**engine:**
- **Omappade fynd har nu sina felnoder.** Förut räknades fyndet in i score, men noderna saknades.
- **Kriteriet för omappade fynd** tas ur axes `wcagNNN`-taggar, lägsta först, som light-läget redan gör. "Unknown" blir det bara när taggen saknas.
- **axe-core** ^4.13.0 → ^4.14.0, html-validate 11.16.0 → 11.18.0, chalk ^6.0.1 och ws ^8.22.1 (ersätter Dependabot #255).
