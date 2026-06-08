---
"@holmdigital/standards": patch
---

**Italy EAA data correction** — fixes four substantive errors in `it-eaa` discovered during compliance review:

1. **Law number corrected**: `D.Lgs. 82/2024` → **`D.Lgs. 82/2022`** (Decreto Legislativo 27 May 2022, n. 82 — the actual Italian EAA transposition decree). Previous year was wrong.

2. **Enforcement authority corrected**: `AGCOM` → **`AgID`**. Per D.Lgs. 82/2022 art. 21, AgID supervises EAA-covered digital services (websites, e-commerce, banking, transport, electronic communications, e-books). AGCOM only handles audiovisual media services (D.Lgs. 208/2021 art. 31). The previous AGCOM designation made `getEnforcementBody('IT', 'private')` return the wrong authority for ~99% of EAA service use cases — including every site `hd-a11y-scan --country IT --sector private` would normally target.

3. **Sector authority split documented**: new `sectorAuthorities` array makes the three-authority split explicit:
   - **MIMIT** (Ministero delle Imprese e del Made in Italy) — products
   - **AgID** — digital services (primary)
   - **AGCOM** — audiovisual media services only

4. **Sanctions corrected**: previous range `2,500–40,000 EUR` mixed values from two distinct sanction categories. Corrected to **`5,000–40,000 EUR`** (substantive violation per accessibility requirements). The 2,500–30,000 EUR range (non-cooperation / failure to comply with AgID orders) is now documented in `sanctions.description` rather than blended into the primary range.

5. **Pre-istruttoria phase documented**: description now reflects AgID's actual enforcement procedure — notification → response window → remediation period → sanctions only on persistent non-compliance. This shifts the messaging from "you risk fines" to "have a response routine ready" (the operative obligation).

6. **Delibera 84/2026 referenced**: in addition to existing Delibera 38/2026 (Linee Guida, 4 March 2026), `note` now references **Delibera 84/2026** (15 May 2026 — Regolamento sulle procedure di accertamento delle violazioni e applicazione delle sanzioni), which is where the pre-istruttoria procedure is codified.

7. **Complaint mechanism origin clarified**: `note` makes explicit that the complaint mechanism is NOT new in 2026 — it was established by Legge n. 4/2004 (Legge Stanca) and D.Lgs. 82/2022. The 2026 Delibere systematise the review procedure.

8. **`ENFORCEMENT_BODIES_DETAILED.IT.eaa`** in `src/index.ts` updated to `Agency for Digital Italy (AgID)` (was AGCOM). Regression test added to assert this never returns AGCOM for `IT` private sector.

**Impact:** Any consumer calling `getEnforcementBody('IT', 'private')` or generating Italian AccessibilityStatements has been receiving incorrect authority data since the IT entry was added. Upgrade strongly recommended.

**Sources verified:** UserWay, AccessiWay, Federprivacy, dirittobancario, fiscoetasse, eye-able, redazionefiscale, agendadigitale.eu, AgID official PDF.
