# @holmdigital/standards

[![npm version](https://img.shields.io/npm/v/@holmdigital/standards.svg)](https://www.npmjs.com/package/@holmdigital/standards)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
[![Downloads](https://img.shields.io/npm/dm/@holmdigital/standards.svg)](https://www.npmjs.com/package/@holmdigital/standards)

> Machine-readable regulatory database for WCAG, EN 301 549, DOS-lagen, and EU Legal Frameworks (WAD/EAA).

## Why this package?

This package serves as the **Single Source of Truth** for accessibility compliance mapping in the HolmDigital ecosystem. It eliminates the need to manually cross-reference standard documents by providing:

1.  **WCAG 2.1 Criteria** (Technical Base)
2.  **EN 301 549** (EU Standard Mapping)
3.  **National Laws** (Specific legal references for SE, NL, DE, IT, PT, PL, etc.)
4.  **EU Legal Frameworks** (WAD 2016/2102 & EAA 2019/882)
5.  **Nordic Authority Data** (Digg, PTS, UU-tilsynet, etc.)

It allows developers to query: *"Which law mandates WCAG 1.4.3 in Sweden?"* and get the exact legal paragraph (`Lag (2018:1937) 12 §`).

For the full regulatory database details, API reference, and legal framework mappings (WAD/EAA), see the **[Standards Library Catalog](../../docs/reference/standards.md)**.

## Installation

```bash
npm install @holmdigital/standards
```

## Features

- **Multi-Language Support** (12 locale databases):
  - `en` (Generic / UK PSBAR)
  - `sv` (Sweden / DOS-lagen)
  - `no` (Norway / IKT-forskrift)
  - `fi` (Finland / 306/2019)
  - `da` (Denmark / Tilgængelighed)
  - `de` (Germany / BITV 2.0)
  - `fr` (France / RGAA)
  - `es` (Spain / UNE 139803)
  - `nl` (Netherlands / Digitoegankelijk)
  - `it` (Italy / Legge Stanca)
  - `pt` (Portugal / DL 83/2018)
  - `pl` (Poland / Ustawa o dostępności cyfrowej)
  - `en-gb` (UK / PSBAR)
  - `en-us` (USA / Section 508 & ADA)
  - `en-ca` (Canada / AODA)
- **Risk Assessment**: DIGG-aligned risk levels (`critical`, `high`, `medium`, `low`).
- **Remediation**: Maps issues to `@holmdigital/components` for fixing.
- **EU Legal Frameworks**: WAD (public sector) and EAA (private sector) compliance data.
- **Sector-Aware Enforcement**: `getEnforcementBody(country, 'public'|'private')` returns the correct authority based on WAD or EAA sector.
- **Nordic Authorities & Enforcement**: Shared database of regulatory bodies (`ENFORCEMENT_BODIES`) for SE, NO, DK, FI, and the broader EU.

## Usage

### Basic Mapping

```typescript
import { 
  getEN301549Mapping, 
  getDOSLagenReference 
} from '@holmdigital/standards';

// Get EN 301 549 Mapping
const mapping = getEN301549Mapping('1.4.3');
// { en301549Criteria: "9.1.4.3", ... }

// Get Swedish Law Reference
const ref = getDOSLagenReference('1.4.3', 'sv');
// "EN 301 549 V3.2.1, WCAG 2.1 Level AA required"
```

### EU Legal Framework Queries

```typescript
import { 
  getRulesByFramework,
  getRulesBySector,
  getLegalFramework,
  getNordicAuthorities,
  getEAADeadlineRules
} from '@holmdigital/standards';

// Get all rules applicable to WAD (Web Accessibility Directive)
const wadRules = getRulesByFramework('WAD');

// Get rules for public sector
const publicRules = getRulesBySector('public');

// Get rules with EAA 2025 deadline
const eaaRules = getEAADeadlineRules();

// Get WAD directive details
const wad = getLegalFramework('WAD');
// { id: "2016/2102", name: "Web Accessibility Directive", ... }

// Get Nordic authorities
const authorities = getNordicAuthorities();
// [{ id: "se-digg", name: "Myndigheten för digital förvaltning (Digg)", ... }]
```

### Statement Tools

```typescript
import { getStatementTools } from '@holmdigital/standards';

// Get accessibility statement generators
const tools = getStatementTools();
// [{ id: "digg-generator", url: "https://webbriktlinjer.se/...", ... }]
```

### National Laws & Sanctions

```typescript
import { 
  getNationalLaws,
  getNationalLaw,
  getSanctions,
  getMaxSanction,
  getSectorAuthorities
} from '@holmdigital/standards';

// Get all laws for Sweden
const seLaws = getNationalLaws('SE');
// [{ id: "dos-lagen", law: "DOS-lagen", ... }, { id: "lptt", law: "LPTT", ... }]

// Get sanctions for a specific law
const sanctions = getSanctions('lptt', 'SE');
// { type: "Sanktionsavgift", maxAmount: 10000000, currency: "SEK" }

// Get maximum sanction for a country
const maxSanction = getMaxSanction('DE');
// { law: "BFSG", amount: 500000, currency: "EUR" }

// Get sector-specific EAA authorities
const sectors = getSectorAuthorities('SE');
// [{ authority: "Konsumentverket", responsibility: "Transport" }, ...]
```

## Supported Countries & Maximum Sanctions

| Country | WAD Law | EAA Law | Max Sanction |
|---------|---------|---------|--------------|
| 🇸🇪 SE | DOS-lagen | LPTT | 1M SEK (Vite) / 10M SEK (EAA) |
| 🇳🇱 NL | Digitoegankelijk | Warenwet | 900k EUR |
| 🇩🇪 DE | BITV 2.0 | BFSG | 500k EUR |
| 🇫🇷 FR | RGAA | - | 300k EUR |
| 🇪🇸 ES | Real Decreto | - | 1M EUR |
| 🇮🇪 IE | S.I. 358/2020 | - | 60k EUR |
| 🇳🇴 NO | IKT-forskrift | - | Daily fines |
| 🇫🇮 FI | 306/2019 | EAA | Vite |
| 🇩🇰 DK | Tilgængelighed | - | Fines |
| 🇮🇹 IT | Legge 4/2004 | D.lgs. 82/2022 | Up to 5% of turnover |
| 🇵🇹 PT | DL 83/2018 | DL 82/2022 | 44k EUR |
| 🇵🇱 PL | Ustawa o dostępności cyfrowej | Ustawa o dostępności | 100k PLN |
| 🇬🇧 GB | PSBAR | - | Unlawful Act Notice |
| 🇺🇸 US | Section 508 | - | Civil Rights Complaint |
| 🇨🇦 CA | AODA | - | $100k per day |

## API Reference

### Core Functions
| Function | Description |
|----------|-------------|
| `getEN301549Mapping(criteria, lang?)` | Get EN 301 549 mapping for WCAG criteria |
| `getDOSLagenReference(criteria, lang?)` | Get DOS-lagen reference for criteria |
| `getAllConvergenceRules(lang?)` | Get all convergence rules |
| `getConvergenceRule(ruleId, lang?)` | Get specific rule by ID |
| `searchRulesByTags(tags, lang?)` | Search rules by tags |

### Type Exports
| Type | Description |
|------|-------------|
| `EnrichedReport` | Extended `RegulatoryReport` with `failingNodes` and `legalContext` |
| `FailingNode` | Target selector, HTML snippet, and failure summary for a single failing element |
| `LegalContext` | WAD/EAA applicability, sectors, articles, and EAA deadline |
| `RegulatoryReport` | Core scan result with WCAG criteria, EN 301 549, remediation, and insight |
| `HolmDigitalInsight` | DIGG risk, EAA impact, Swedish interpretation, and common mistakes |
| `ConvergenceRule` | Full convergence rule with remediation, testability, and legal context |
| `DiggRisk` | `'low' \| 'medium' \| 'high' \| 'critical'` |
| `EAAImpact` | `'none' \| 'low' \| 'medium' \| 'high' \| 'critical'` |

### EU Legal Framework Functions
| Function | Description |
|----------|-------------|
| `getRulesByFramework(framework, lang?)` | Get rules by WAD or EAA |
| `getRulesBySector(sector, lang?)` | Get rules by public/private sector |
| `getLegalFrameworks()` | Get all EU legal frameworks |
| `getLegalFramework(id)` | Get specific framework (WAD/EAA) |
| `getNordicAuthorities()` | Get all Nordic authorities |
| `getNordicAuthority(id)` | Get authority by ID |
| `getNordicAuthoritiesByCountry(country)` | Get authorities by country |
| `getStatementTools()` | Get statement generator tools |
| `getEAADeadlineRules(lang?)` | Get rules with EAA deadlines |

### National Laws & Sanctions Functions
| Function | Description |
|----------|-------------|
| `getNationalLaws(country)` | Get all laws for a country |
| `getNationalLaw(id, country?)` | Get specific law by ID |
| `getNationalLawByFramework(framework, country?)` | Get law by WAD/EAA |
| `getSanctions(lawId, country?)` | Get sanctions for a law |
| `getMaxSanction(country?)` | Get maximum sanction amount |
| `getSectorAuthorities(country?)` | Get EAA sector authorities |

## License

MIT © Holm Digital AB

