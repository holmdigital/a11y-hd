# @holmdigital/standards

> Machine-readable regulatory database for WCAG, EN 301 549, and the DOS Act.

This package provides the "truth" for accessibility compliance mapping. It connects:
1.  **WCAG 2.1 Criteria** (Technical)
2.  **EN 301 549** (EU Standard)
3.  **National Laws** (e.g., Sweden's *Lag (2018:1937) om tillgänglighet till digital offentlig service*)

## Installation

```bash
# First, configure npm to use GitHub Package Registry:
npm config set @holmdigital:registry https://npm.pkg.github.com

# Then install:
npm install @holmdigital/standards
```

## Features

- **Multi-Language Support**: Separate data rules for English (`en`), Swedish (`sv`), German (`de`), French (`fr`), and Spanish (`es`).
- **Risk Assessment**: DIGG-aligned risk levels (`critical`, `high`, `medium`, `low`).
- **Remediation**: Maps issues to `@holmdigital/components` for fixing.

## Usage

```typescript
import { 
  getEN301549Mapping, 
  getDOSLagenReference 
} from '@holmdigital/standards';

// 1. Get Mapping (Default: English)
const enMapping = getEN301549Mapping('1.4.3');
// Output: { en301549Criteria: "9.1.4.3", ... }

// 2. Get Mapping (Swedish Context)
const svMapping = getEN301549Mapping('1.4.3', 'sv');
// Output: Includes 'dosLagenReference' specific to Swedish law.
```

## License

MIT © Holm Digital AB
