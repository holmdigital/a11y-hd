# Accessibility Enforcement Authorities Guide

Quick reference for accessibility enforcement authorities across supported countries.

## Sweden 🇸🇪

### Digg - Public Sector (WAD)
**Full name:** Myndigheten för digital förvaltning  
**Responsibility:** Enforces DOS-lagen for public sector  
**Website:** https://www.digg.se  
**Monitoring:** https://www.digg.se/tillganglighet

### PTS - Private Sector (EAA)
**Full name:** Post- och telestyrelsen  
**Responsibility:** Market surveillance for EAA/LPTT  
**Website:** https://pts.se

**Sector Authorities under PTS:**
| Authority | Sector |
|-----------|--------|
| Konsumentverket | Transport (trains, buses, flights) |
| Mediemyndigheten | Streaming services |
| MTM | E-books |
| Transportstyrelsen | Transport equipment |

## Norway 🇳🇴

### UU-tilsynet
**Full name:** Tilsynet for universell utforming av IKT  
**Responsibility:** Both public and private sector  
**Website:** https://uutilsynet.no  
**Note:** Very active with inspections. Norway follows EU via EEA agreement.

**Sanctions:** Daily fines (tvangsmulkt) until issues are fixed.

## Denmark 🇩🇰

### Digitaliseringsstyrelsen
**Responsibility:** Public sector accessibility  
**Website:** https://digst.dk

**Sanctions:** Police reports and fines for severe/repeated violations.

## Finland 🇫🇮

### AVI - Public Sector
**Full name:** Regionförvaltningsverket i Södra Finland  
**Responsibility:** Public websites and apps  
**Website:** https://saavutettavuusvaatimukset.fi

### Traficom - Private Sector (EAA)
**Responsibility:** Transport and communications  
**Website:** https://www.traficom.fi

### Valvira
**Responsibility:** Health and social services  

## Germany DE

### BFIT-Bund - Public Sector (WAD)
**Full name:** Uberwachungsstelle des Bundes fur Barrierefreiheit von Informationstechnik
**Responsibility:** Federal monitoring of public sector accessibility
**Website:** https://www.bfit-bund.de

### Marktuberwachungsbehorden - Private Sector (EAA)
**Responsibility:** Market surveillance for BFSG compliance

## France FR

### DINUM - Public Sector (WAD)
**Full name:** Direction interministerielle du numerique
**Responsibility:** Enforces RGAA for public sector
**Website:** https://accessibilite.numerique.gouv.fr

## Netherlands NL

### Logius - Public Sector (WAD)
**Responsibility:** Public sector digital accessibility
**Website:** https://www.digitoegankelijk.nl

## Spain ES

### OAW - Public Sector (WAD)
**Full name:** Observatorio de Accesibilidad Web
**Responsibility:** Public sector web accessibility monitoring

## Italy IT

### AgID - Public and Private Sector
**Full name:** Agenzia per l'Italia Digitale
**Responsibility:** Both WAD and EAA enforcement
**Website:** https://www.agid.gov.it

## Portugal PT

### AMA - Public Sector (WAD)
**Full name:** Agencia para a Modernizacao Administrativa
**Responsibility:** Public sector digital accessibility
**Website:** https://www.acessibilidade.gov.pt

## Poland PL

### Ministerstwo Cyfryzacji - Public Sector
**Full name:** Ministry of Digital Affairs
**Responsibility:** Public sector digital accessibility
**Website:** https://www.gov.pl/web/cyfryzacja

## Ireland IE

### NDA - Public Sector (WAD)
**Full name:** National Disability Authority
**Responsibility:** Public sector accessibility monitoring
**Website:** https://nda.ie

---

## Using the API

```typescript
import { getEnforcementBody } from '@holmdigital/standards';

// Get enforcement body by country and sector
const body = getEnforcementBody('SE', 'public');
// -> "Agency for Digital Government (Digg)"

const eaaBody = getEnforcementBody('SE', 'private');
// -> "Swedish Post and Telecom Authority (PTS)"

const itBody = getEnforcementBody('IT', 'public');
// -> "Agency for Digital Italy (AgID)"

// Legacy Nordic-specific API (still supported)
import { getNordicAuthority } from '@holmdigital/standards';
const digg = getNordicAuthority('se-digg');
```
