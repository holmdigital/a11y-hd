---
"@holmdigital/engine": minor
---

Klarspråksrapporten visar nu en svensk rubrik per regel i stället för den råa engelska axe-regelkoden.

Tidigare satte både terminalrapporten (`--plain`) och plain-HTML-rapporten regelns engelska `ruleId` ("region", "color-contrast" och så vidare) som kortets rubrik, även i `--lang sv`. En svensk mottagare förstår inte "region", vilket undergrävde hela klarspråkspoängen.

Renderarna använder nu `plainLanguage.headline` (den svenska klarspråksrubriken som redan fanns i regeldatan) som primär rubrik. Den engelska regelkoden ligger kvar som en liten sekundär teknisk referens i parentes, så utvecklare fortfarande kan slå upp regeln. När en regel saknar `headline` faller renderarna tillbaka på den rena regelkoden precis som förut.
