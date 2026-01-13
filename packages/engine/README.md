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
- **Configurable Severity Threshold**: Fail CI only on critical/high issues (configurable).
- **Rich Metadata**: Includes scan duration, page title, language, and version info.
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
| Option | Description |
|--------|-------------|
| `--lang <code>` | Language code (`en`, `sv`, `de`, `fr`, `es`, `nl`, `en-us`, `en-gb`) |
| `--threshold <level>` | Severity threshold for compliance (`critical`, `high`, `medium`, `low`). Default: `high` |
| `--ci` | Run in CI mode (exit code 1 on failure) |
| `--json` | Output results as JSON |
| `--pdf <path>` | Generate a PDF report |
| `--viewport <size>` | Set viewport size (`mobile`, `tablet`, `desktop`, or custom `1024x768`) |
| `--generate-tests` | Generate Pseudo-Automation tests |
| `--api-key <key>` | API Key for HolmDigital Cloud |
| `--cloud-url <url>` | Custom URL for HolmDigital Cloud API |

**Example:**
```bash
# Fail only on critical issues in CI
npx hd-a11y-scan https://example.com --ci --threshold critical

# Full JSON output with metadata
npx hd-a11y-scan https://example.com --json
```

## JSON Output

```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-13T17:05:11.749Z",
  "metadata": {
    "engineVersion": "1.4.6",
    "axeCoreVersion": "4.10.2",
    "standardsVersion": "1.2.2",
    "scanDuration": 2891,
    "pageTitle": "Example Domain",
    "pageLanguage": "en"
  },
  "stats": {
    "passed": 13,
    "critical": 0,
    "high": 0,
    "medium": 2,
    "low": 0,
    "total": 2
  },
  "score": 90,
  "complianceStatus": "PASS"
}
```

## Programmatic Usage

```typescript
import { RegulatoryScanner, setLanguage } from '@holmdigital/engine';

const scanner = new RegulatoryScanner({
  url: 'https://example.com',
  severityThreshold: 'high' // critical, high, medium, low
});

setLanguage('sv');

const result = await scanner.scan();

console.log(`Score: ${result.score}`);
console.log(`Duration: ${result.metadata.scanDuration}ms`);
console.log(`Passed: ${result.stats.passed}, Failed: ${result.stats.total}`);
```

## License

MIT © Holm Digital AB
