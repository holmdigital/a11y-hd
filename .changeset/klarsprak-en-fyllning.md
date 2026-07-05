---
"@holmdigital/standards": minor
---

Engelsk klarspråkstext för alla regler i klarspråksrapporten (fallback-golvet för alla språk).

Tidigare hade bara 11 av reglerna en engelsk klarspråksrubrik och förklaring, resten föll tillbaka på den råa axe-regelkoden. Nu har samtliga 48 regler ett fullständigt `plainLanguage`-block på engelska (rubrik, vad som händer, vem det drabbar, vad det kostar, så fixar du, påverkansnivå). Engelskan är fallback-golvet för alla övriga språk, så varje regel renderar nu läsbar klarspråkstext i stället för en rå regelkod även när målspråket saknar egen text. Engelsk täckning går från 11 till full täckning (48/48).

Samtidigt städas en dubblettpost för regeln `audio-description` bort ur samtliga icke-svenska regelfiler (da, de, en, en-CA, en-GB, en-US, es, fi, fr, nl, no). Den kvarvarande posten är den korrekta, lokaliserade formuleringen; alla tolv regelfiler har därmed 48 unika regler.
