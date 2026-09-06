---
"@holmdigital/standards": patch
---

Intern #43 fynd 2 — `remediation.component` föreslår inte längre en komponent där den inte hör hemma.

Datan klistrade ett komponentförslag på fynd oavsett feltyp: ett `@holmdigital/components/Button`-kodexempel hamnade på ett rent `<span>`-kontrastfel (digg.se) och en `ProgressBar` injicerades på en extern sajt (airbnb). Vilma och Mejas regel: ett komponentförslag hör hemma bara när felet är en trasig eller egenbyggd interaktiv widget där den äkta fixen ÄR att använda rätt komponent. Att tömma fältet betyder aldrig att felet är mindre allvarligt — bara att åtgärdstypen är en annan (CSS, ARIA, generell).

**Tömt `component` (7 regler, alla 12 locales):** `color-contrast` (1.4.3), `non-text-contrast` (1.4.11), `focus-visible` (2.4.7), `target-size` (2.5.8), `use-of-color` (1.4.1), `name-role-value` (4.1.2), `keyboard-accessible` (2.1.1).

**Behållet (komponenten passar):** `identify-input-purpose`, `form-labels`, `error-identification`, `error-suggestion` (FormField) och `status-messages` (LiveRegion).

Kodexemplen följde med där de var rena komponentpitchar — `color-contrast` och `name-role-value` (de två rapporterade symptomen) tömdes, `keyboard-accessible` trimmades så div-till-button-vägledningen står kvar utan komponent-svansen, och `target-size` behöll sitt rena CSS-exempel oförändrat. Ingen regel utan `component` bär längre en `@holmdigital/components`-import i sitt kodexempel.

Låst med test (`remediation-component.test.ts`) över alla tolv locales. Testet dokumenterar också en drift som upptäcktes när regeln tillämpades: `en-gb`/`en-us`/`en-ca` fick aldrig `status-messages` → LiveRegion, till skillnad från de nio andra.
