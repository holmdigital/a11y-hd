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
3.  **National Laws** (Specific legal references for SE, NL, DE, etc.)
4.  **EU Legal Frameworks** (WAD 2016/2102 & EAA 2019/882)
5.  **Nordic Authority Data** (Digg, PTS, UU-tilsynet, etc.)

It allows developers to query: *"Which law mandates WCAG 1.4.3 in Sweden?"* and get the exact legal paragraph (`Lag (2018:1937) 12 §`).

## Installation

```bash
npm install @holmdigital/standards
```

## Features

- **Multi-Language Support**:
  - `en` (Generic / UK PSBAR)
  - `sv` (Sweden / DOS-lagen)
  - `de` (Germany / BITV 2.0)
  - `fr` (France / RGAA)
  - `es` (Spain / UNE 139803)
  - `nl` (Netherlands / Digitoegankelijk)
  - `en-us` (USA / Section 508 & ADA)
  - `en-ca` (Canada / AODA)
- **Risk Assessment**: DIGG-aligned risk levels (`critical`, `high`, `medium`, `low`).
- **Remediation**: Maps issues to `@holmdigital/components` for fixing.
- **EU Legal Frameworks**: WAD (public sector) and EAA (private sector) compliance data.
- **Nordic Authorities**: Regulatory body information for SE, NO, DK, FI.

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

## API Reference

### Core Functions
| Function | Description |
|----------|-------------|
| `getEN301549Mapping(criteria, lang?)` | Get EN 301 549 mapping for WCAG criteria |
| `getDOSLagenReference(criteria, lang?)` | Get DOS-lagen reference for criteria |
| `getAllConvergenceRules(lang?)` | Get all convergence rules |
| `getConvergenceRule(ruleId, lang?)` | Get specific rule by ID |
| `searchRulesByTags(tags, lang?)` | Search rules by tags |

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

## License

MIT © Holm Digital AB
