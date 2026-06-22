---
"@holmdigital/engine": minor
---

Konfigurerbar hydration-wait (`waitForHydrationMs`, default 2500 ms) så klientrenderade SPA:er hydrerar innan axe körs. Tidigare gav ohydrerade SPA:er falskt 100/100.

Ny option på `ScannerOptions.waitForHydrationMs` (default 2500, sätt 0 för att stänga av). Waiten körs efter `waitForNetworkIdle` och före metadata-capture (`page.title()`), så all nedströms (HTML-validering, Virtual DOM, axe) arbetar mot en hydrerad DOM.

Bakgrund och bevis: klarna.com utan wait gav score 100 (fel), med ~3000 ms wait score 10 (sant). networkidle räcker inte: bundlen hinner laddas innan ramverket byggt komponentträdet, så `axe.run(document, ...)` körs mot pre-hydration-DOM:en.

Stänger holmdigital/a11y-hd issue 49. Specens fast-track-default 2500 ms gör att CLI-användare (`hd-a11y-scan`) får rätt beteende utan att veta att flaggan finns. Latens-tillägg per scan: 2,5 sekunder, försumbart mot puppeteer-uppstart, navigering och axe.
