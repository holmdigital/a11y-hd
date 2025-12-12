# 🚀 HolmDigital: "Thinking Outside the Box" Roadmap

Här är tre skalnivåer för hur vi kan ta projektet från "Ett grymt verktyg" till "En branschledande plattform".

## Nivå 1: Det tekniska ekosystemet (Quick Wins)

Integrera delarna hårdare så de känns som en enhet.

- **Levande Wiki ("Try it now"):**
    - Istället för statisk kod i Wikin, bygg in en "Playground" där man kan ändra props på `Button` och se resultatet direkt (och se om Accessibility-proven failar live!).
- **Storybook + Standards:**
    - Koppla `@holmdigital/standards` data direkt in i Storybook. En "Accessibility"-tab bredvid varje komponent som visar exakt vilka WCAG-kriterier komponenten löser åt dig (hämtat från din JSON-databas).
- **VS Code Extension (Linter):**
    - Bygg ett plugin som använder din engine. När en utvecklare skriver `<div onClick...>` dyker en röd våglinje upp: *"HolmDigital: Use `<Button>` component instead to capture WCAG 2.1.1 compliance."*

## Nivå 2: Tjänstefiering (SaaS & Value)

Gå från verktyg till process.

- **HolmDigital Cloud (Compliance Dashboard):**
    - Idag får man en rapport här och nu. Tänk dig en dashboard där en organisation kan se:
        - *"Vår tillgänglighet har ökat från 65% till 89% på 3 månader."*
        - *"Vi har 40% färre WCAG-fel i våra PRs sedan vi bytte till HolmDigital Components."*
    - Detta säljer till chefer, inte bara utvecklare.
- **"Fix it for me" (AI-Remediation):**
    - Engine hittar fel. Låt oss ta det ett steg längre: generera en `git patch` som faktiskt lagar felet.
    - *"Jag hittade 5 bilder utan alt-texter. Här är ett förslag baserat på bildanalys. Godkänn patch?"*

## Nivå 3: "Accessibility First" Design (Shift Left på riktigt)

Flytta problemet innan koden ens skrivs.

- **Figma Plugin som exporterar kod:**
    - Designers använder ditt plugin i Figma. Det varnar för dålig kontrast *medan de designar*.
    - När de är klara klickar de "Export to React" och får kod som använder `@holmdigital/components` med allt rätt inställt.
- **Certifierings-Badge:**
    - Ett API som man lägger i sin footer.
    - `<img src="https://api.holmdigital.se/badge/examplestore.com.svg" />`
    - Om din senaste scan (som körs varje natt) är grön, visas en "Gold Level Accessibility"-badge. Om den failar, blir den grå. Det blir ett kvalitetsmärke för e-handlare.

---

### Min favorit? 🏆
**VS Code Extension.** Det är "developer magic". Att bli stoppad *medan* man skriver fel kod är den bästa utbildningen som finns. Det sparar pengar och tid innan koden ens når CI/CD.
