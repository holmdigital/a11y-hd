# Nordic Accessibility Authorities Guide

Quick reference for accessibility enforcement authorities in the Nordic region.

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

---

## Using the API

```typescript
import { 
  getNordicAuthorities,
  getNordicAuthority,
  getNordicAuthoritiesByCountry 
} from '@holmdigital/standards';

// Get all Nordic authorities
const all = getNordicAuthorities();

// Get specific authority
const digg = getNordicAuthority('se-digg');
// → { id: 'se-digg', name: 'Myndigheten för digital förvaltning...', website: '...', ... }

// Get authorities by country
const swedish = getNordicAuthoritiesByCountry('SE');
// → [{ id: 'se-digg', ... }, { id: 'se-pts', ... }]
```
