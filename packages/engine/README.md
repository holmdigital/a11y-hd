# @holmdigital/engine

> Regulatory accessibility test engine with Virtual DOM and Shadow DOM support.

This engine bridges the gap between technical accessibility scanning (using `axe-core`) and legal compliance reporting (EN 301 549). It provides prescriptive remediation advice and localized reporting.

## Features

- **Regulatory Mapping**: Maps technical failures to EU laws.
- **HTML Structure Validation**: built-in `html-validate` checks for semantic correctness.
- **Internationalization (i18n)**: Supports English (`en`), Swedish (`sv`), German (`de`), French (`fr`), and Spanish (`es`).
- **Pseudo-Automation**: Generates Playwright test scripts for manual verification.
- **PDF Reporting**: Generates beautiful, compliant PDF reports.

## Installation

```bash
# First, configure npm to use GitHub Package Registry:
npm config set @holmdigital:registry https://npm.pkg.github.com

# Then install:
npm install @holmdigital/engine
```

## CLI Usage

```bash
npx hd-a11y-scan <url> [options]
```

**Options:**
- `--lang <code`> - Language code (`en` or `sv`)
- `--ci` - Run in CI mode (exit code 1 on failure)
- `--json` - Output results as JSON
- `--pdf <path>` - Generate a PDF report
- `--viewport <size>` - Set viewport size (e.g., "mobile", "desktop")

## Programmatic Usage

```typescript
import { RegulatoryScanner } from '@holmdigital/engine';
import { setLanguage } from '@holmdigital/engine/dist/i18n';

// Initialize Scanner
const scanner = new RegulatoryScanner({
  url: 'https://example.com',
  failOnCritical: false
});

// Set Language context (optional, defaults to 'en')
setLanguage('sv');

// Run Scan
const result = await scanner.scan();

console.log(`Score: ${result.score}`);
```

## License

MIT © Holm Digital AB
