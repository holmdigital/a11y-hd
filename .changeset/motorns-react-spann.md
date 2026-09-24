---
'@holmdigital/engine': patch
---

React 18 stöds igen (Intern #89, fynd 1).

Motorn har `react` och `react-dom` som körberoenden, eftersom HTML-utlåtandet renderas med `renderToStaticMarkup`. Spannet var `^18.3.1 || ^19.0.0`, men en Dependabot-grupp för minor och patch (PR #109, 2026-07-28) skrev om det till `^19.2.8` utan changeset. Varje motorversion sedan dess har därför stängt ute React 18, trots att motorn renderar korrekt med React 18.3.1. Det är verifierat 2026-09-24 med de packade paketen i ett rent projekt.

Spannet är nu återställt till `^18.3.1 || ^19.0.0`, och ett test låser det. Grundorsaken är också rättad. Dependabot höjde spann även när den nya versionen redan rymdes i dem, och undantaget för React-majors stoppade inte det, eftersom det bara gäller majors. Med `versioning-strategy: increase-if-necessary` lämnas ett spann som redan tillåter versionen orört, och bara låsfilen uppdateras.
