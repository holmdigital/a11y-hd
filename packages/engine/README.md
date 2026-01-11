# @holmdigital/engine

[![npm version](https://img.shields.io/npm/v/@holmdigital/engine.svg)](https://www.npmjs.com/package/@holmdigital/engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
[![Downloads](https://img.shields.io/npm/dm/@holmdigital/engine.svg)](https://www.npmjs.com/package/@holmdigital/engine)

> Regulatory accessibility test engine with Virtual DOM, Shadow DOM support, and built-in legal compliance reporting.

## Why this package?

Most accessibility tools give you technical errors (e.g., "Color contrast must be 4.5:1"). This engine bridges the gap between **technical code validation** (using `axe-core`) and **legal compliance** (EN 301 549, Section 508, DOS-lagen).

It handles the heavy lifting of:
1.  **Mapping** technical failures to specific legal clauses.
2.  **Validating** HTML structure to ensure test accuracy.
3.  **Reporting** in multiple languages (EN, SV, NL, DE, FR, ES) for non-technical stakeholders.

## Features

- **Regulatory Mapping**: Maps technical failures to EU laws (EN 301 549, EAA).
- **HTML Structure Validation**: Built-in `html-validate` checks to prevent false positives/negatives.
- **Internationalization (i18n)**: Supports English (`en`), Swedish (`sv`), German (`de`), French (`fr`), Spanish (`es`), and Dutch (`nl`).
- **Pseudo-Automation**: Automatically generates Playwright/Puppeteer test scripts for manual verification steps.
- **PDF Reporting**: Generates beautiful, compliant PDF reports out of the box.
- **TypeScript**: Written in TypeScript with full type definitions included.

## Installation

```bash
npm install @holmdigital/engine
```

## CLI Usage

```bash
npx hd-a11y-scan <url> [options]
```

**Options:**
- `--lang <code>` - Language code (`en`, `sv`, `de`, `fr`, `es`, `nl`, `en-us`, `en-gb`)
- `--ci` - Run in CI mode (exit code 1 on failure)
- `--json` - Output results as JSON
- `--pdf <path>` - Generate a PDF report
- `--viewport <size>` - Set viewport size (`mobile`, `tablet`, `desktop`, or custom `1024x768`)
- `--generate-tests` - Generate Pseudo-Automation tests
- `--api-key <key>` - API Key for HolmDigital Cloud (sends results to dashboard)
- `--cloud-url <url>` - Custom URL for HolmDigital Cloud API (default: `https://cloud.holmdigital.se`)

## Programmatic Usage

```typescript
import { RegulatoryScanner, setLanguage } from '@holmdigital/engine';

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
