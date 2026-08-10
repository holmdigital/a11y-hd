---
"@holmdigital/engine": patch
---

Fix Norwegian CLI verdict string (Intern #23). The `no` locale's `cli.not_compliant` referenced *Diskriminerings- og tilgjengelighetsloven*, a law repealed 1 January 2018. It now names the forskrift that is actually in force: `forskrift om universell utforming av IKT-løsninger`. Also picks up the corrected Norwegian law-reference data from `@holmdigital/standards`.
