# UTKAST: HHS Section 504 i @holmdigital/standards 4.3.0

> **Status:** UTKAST, ej publicerad. Skrivs om till slutlig release när PR #234 är mergad och Karin godkänt lansering.
> **Startcommit:** `17fcb06` (basen för PR #234 mot origin/master). **Paket:** `@holmdigital/standards` 4.2.2 → 4.3.0 (MINOR), satt av changeset `.changeset/hhs-504-tier-in-force.md` när Version Packages körs. Ingen version ändrad för hand.
> **Spårning:** holmdigital/Intern#122 (datumstyrd gällande per nivå), #99, #111.

## Vad ändras

### 1. Ny export: `isComplianceTierInForce(law, tier, today?)`

Avgör vid körning om en nivå i `law.complianceDeadlines` (`'largeEntity'` eller `'smallEntity'`) är gällande på `today` (standard: nu, UTC-datum). Returnerar `false` om nivån saknar datum.

### 2. `us-hhs-section-504`: `inForce` och `effectiveDate`

- `inForce`: `false` → `true`.
- `effectiveDate`: `"2027-05-11"` → `"2024-07-08"` (grundregelns ikraftträdande, 45 CFR 84.84(a), 89 FR 40066).

**Konsumentvarning:** `inForce` betyder nu grundregelns status, inte att WCAG-kravet gäller. Den som läser `inForce` för att avgöra om WCAG-kravet gäller på ett visst datum får fel svar. Använd `isComplianceTierInForce` eller `complianceDeadlines` för WCAG-datumen.

### 3. WCAG-datumen är oförändrade

- 15+ anställda: 2027-05-11
- Färre än 15: 2028-05-10

### 4. Källhänvisning

Citatet för WCAG-kravet ändras från 45 CFR 84.85 till **84.84(b)** i `enforcement.responsibility` och i båda `complianceDeadlines`-beskrivningarna.

## Livekörningsrapport (krav för lagdata)

Plats för rapporten. **Ej gjord ännu.**

- Land: USA (`us-hhs-section-504`)
- Språk: engelska
- Rapport: [LIVEKÖRNING, före merge]

## Tester

`packages/standards`: 363 av 363 gröna efter ändringen (vitest run, 2026-10-06).
