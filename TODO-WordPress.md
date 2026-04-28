# TODO: WordPress Integration Strategy

## Mål
Att erbjuda HolmDigitals tillgänglighetskomponenter (t.ex. `AccessibilityStatement`) till den stora kundbasen som använder WordPress, utan att behöva underhålla dubbla kodbaser (inga forks).

## Rekommenderad Arkitektur: Monorepo WP-Plugin
Istället för att bygga ett separat bibliotek från noll, kommer vi att bygga ett officiellt WordPress-plugin **inuti vår befintliga monorepo**.

### Steg-för-steg Plan

1. **Skapa ett nytt paket:**
   Skapa en ny mapp `packages/wordpress-plugin`. Detta blir ytan för själva pluginet (som innehåller både PHP-koden för WP och en bygg-process för frontend-koden).

2. **Konsumera befintliga React-komponenter:**
   I pluginets `package.json` installerar vi våra egna bibliotek som beroenden:
   ```json
   "dependencies": {
     "@holmdigital/components": "workspace:*",
     "@holmdigital/engine": "workspace:*"
   }
   ```
   Detta gör att "Single Source of Truth" bibehålls. Ändringar i `@holmdigital/components` reflekteras direkt i WP-pluginet nästa gång vi bygger det.

3. **Bundla för Webbläsaren (Web Components / Standalone React):**
   Sätt upp en byggprocess (t.ex. Vite, Webpack eller `@wordpress/scripts`) i plugin-paketet som tar React-komponenterna och exponerar dem som Custom Elements (Web Components) eller via en simpel `window.renderHolmDigitalStatement()`-funktion. 
   
   Resultatet blir en optimerad fil (`dist/holmdigital-frontend.js`) som inte krockar med kundernas befintliga (ofta gamla) jQuery/React-versioner som laddas in via andra WordPress-plugins.

4. **Minimal PHP-Wrapper:**
   PHP-koden görs så "dum" som möjligt. Den ansvarar enbart för:
   * Att registrera en admin-sida där kunden fyller i sin API-nyckel eller domän-URL.
   * Att tillhandahålla en Shortcode (t.ex. `[holmdigital_statement]`) eller ett Gutenberg-block.
   * Att rendera en enkel container-div: `<div id="holmdigital-root" data-url="kundens-url"></div>`.
   * Att använda `wp_enqueue_script()` för att ladda in vår bundlade JavaScript-fil (`dist/holmdigital-frontend.js`) på sidor där shortcoden eller blocket används.
   
5. **Distribution:**
   Skapa ett automatiserat skript (t.ex. i Github Actions) som bygger paketet, zip:ar upp `.php`-filerna och `dist/`-mappen till en `holmdigital-a11y-plugin.zip` som enkelt kan laddas upp i WordPress adminpanel av kunden.

## Fördelar med denna arkitektur
- **DDR (Don't Repeat Yourself):** All huvudlogik, styling och rendering för tillgänglighetsprodukten (UI:t) lever och frodas i `packages/components`.
- **Minimal tidsåtgång att underhålla:** Om en ny lag träder i kraft uppdateras `@holmdigital/standards` och `@holmdigital/components`. Gå sen in i `packages/wordpress-plugin`, tryck `pnpm build`, och släpp en ny zip-fil. Klart!
- **Inga konflikter:** Genom att bunlda allt finkänsligt (React, CSS) i vår egen domän, smäller sidan inte för att kunden har installerat Yoast SEO eller Elementor.
