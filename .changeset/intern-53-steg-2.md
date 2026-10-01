---
'@holmdigital/engine': major
---

Intern #53 steg 2: motorn spärrar privata och interna adresser som standard, och Chromes sandbox är på.

Motorn renderar per definition främmande sidor med deras JavaScript. Den stängde av Chromes sandbox ovillkorligt och hämtade allt den pekades på, inklusive `localhost`, interna nät och molnets metadatatjänst på `169.254.169.254`. Karins beslut 2026-09-18 var säkert som standard, med uttrycklig opt-out.

**Brytande ändringar, därav major:**

- **Privata och interna adresser spärras.** Det gäller loopback, 10/8, 172.16/12, 192.168/16, 100.64/10, länklokala adresser inklusive metadatatjänsten, multicast och motsvarande för IPv6. Spärren prövar startadressen innan någon webbläsare startar. Den prövar också **varje förfrågan sidan gör**, omdirigeringar och resurser inräknade, så att en publik sida inte kan leda skannern in i ett internt nät. Värdnamn slås upp och de adresser de ger prövas, och ett misslyckat uppslag spärras. Att skanna `http://localhost:3000` ger nu ett fel som säger vad som ska göras: `--allow-private-hosts` i CLI:t, eller `allowPrivateHosts: true` i biblioteket.
- **Sandboxen är på**, i både skannern och PDF-generatorn. Chrome kan inte använda den som root, eller där användarnamnrymder är begränsade, till exempel i en container utan USER eller på vissa CI-runners. Där stänger man av den uttryckligen med `--no-sandbox` (biblioteket: `sandbox: false`). Felmeddelandet säger det i stället för att bara återge Chromes text.

**`PUPPETEER_ARGS` läses nu.** Flaggorna läggs till Chromes startargument. Scan-serverns container sätter redan `PUPPETEER_ARGS="--no-sandbox …"`, som ingen kod läste tidigare. En uppgradering där bryter därför inte driften.

**Nytt i resultatet:** `metadata.blockedPrivateRequests` anger hur många förfrågningar spärren avbröt, och sätts bara när antalet är större än noll.

**Migrering:** en CI som skannar ett lokalt bygge behöver i regel båda flaggorna:

```
npx hd-a11y-scan http://localhost:3000 --ci --allow-private-hosts --no-sandbox
```

**Gränser, dokumenterade i SECURITY.md:** spärren är ett lager, inte hela skyddet. Svaret på DNS-uppslaget kan ändras mellan motorns uppslag och webbläsarens (DNS rebinding), och WebSocket-anslutningar går inte genom Puppeteers request interception. Den som kör motorn server-side på främmande adresser behöver fortfarande nätverksisolering.

Verifierat med riktig Chrome:

- En lokal adress spärras med beskedet och exit 1.
- Med `--allow-private-hosts` skannas den med sandboxen på, och med `--no-sandbox` fungerar den också.
- example.com och holmdigital.se ger samma poäng som med publicerad 3.3.12, också i en full skanning med `--noscript-check`.
