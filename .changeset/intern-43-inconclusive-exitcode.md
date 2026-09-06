---
"@holmdigital/engine": patch
---

Intern #43 fynd 1 (Mejas exit-kod-fynd) — en INCONCLUSIVE-scan ger nu non-zero exit **oavsett flaggor**.

3.3.0 satte `complianceStatus: INCONCLUSIVE` korrekt, men exit-1:an låg bakom `--ci`. En default-körd CLI gav därför **exit 0** på en omätt interstitial-sida — samma kod som ett PASS — så ett skript eller en pipeline som läser `$?` såg fortfarande grönt på en sida vi aldrig mätte.

En INCONCLUSIVE-scan är en **misslyckad mätning**, inte ett utlåtande. PASS och FAIL är lyckade mätningar och lyder under `--ci`-gaten som förut; INCONCLUSIVE hör i stället ihop med scanfel-grenen, som alltid exit:at 1 oavsett flaggor. Exit:en ligger sist i flödet, så banner, JUnit-fil och moln-besked hinner skrivas först.

Verifierat end-to-end mot en lokal interstitial-fixtur: interstitial utan `--ci` → **exit 1**; vanlig sida → **exit 0**; `--json` på interstitial → giltig JSON (`INCONCLUSIVE`, `score: 0`, `reports: []`) **och** exit 1.
