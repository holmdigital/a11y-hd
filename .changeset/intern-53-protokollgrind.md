---
"@holmdigital/engine": patch
---

Intern #53 steg 1 — protokollgrinden i CLI:t stod tom, och därför öppen.

Kontrollen fanns. Den gjorde rätt. Den anropades på rätt ställe:

```ts
if (!isValidUrl(url)) {
    // ... validation ...
}
```

Kroppen var tom. `isValidUrl` räknade ut rätt svar och svaret kastades bort, så `file:///etc/passwd` gick rakt in i skanningen. Enligt `git log -S` har det sett ut så sedan `912480e` i februari.

Det är värre än ingen kontroll alls: den som läser koden och letar efter validering hittar den och drar slutsatsen att den sker. **Vi gjorde precis det** — i Intern #74 rapporterade vi att ett protokoll-allowlist fanns i CLI-lagret. Det gjorde det inte.

Grinden ligger nu i en egen modul (`cli/url-guard.ts`, samma skäl som `parse-options.ts`: `index.ts` anropar `program.parse()` på modulnivå, så det som ska testas måste ligga utanför) och **kastar i stället för att returnera en boolean**. Ett kastat fel kan inte tappas bort av en tom if-sats — anroparen måste fånga det eller krascha, och båda utfallen är ärliga.

`http` och `https` släpps igenom. `file:`, `data:`, `javascript:`, `chrome:` och allt annat avvisas med ett fel som namnger schemat, och CLI:t avslutar med 1. Sju regressionstester, varav det som betyder något är att `file://` inte längre passerar.

**Spärren mot privata adresser och metadatatjänsten ingår INTE.** Den är steg 2 i #53, ett produktbeslut med opt-out (`--allow-private-hosts`) som kan bli en MAJOR, och den ska inte smygas in under en akut protokollfix.
