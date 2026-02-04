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
4.  **CI/CD Pipeline Integration** with automatic enforcement.

For a comprehensive guide on CLI flags, CI/CD integration, and configuration files, see the **[Engine Library Catalog](../../docs/engine-library.md)**.

## Features

- **Regulatory Mapping**: Maps technical failures to EU laws (EN 301 549, EAA).
- **HTML Structure Validation**: Built-in `html-validate` checks to prevent false positives/negatives.
- **Internationalization (i18n)**: Supports English (`en`), Swedish (`sv`), German (`de`), French (`fr`), Spanish (`es`), and Dutch (`nl`).
- **Configurable Severity Threshold**: Fail CI only on critical/high issues (configurable).
- **Rich Metadata**: Includes scan duration, page title, language, and version info.
- **Pseudo-Automation**: Automatically generates Playwright/Puppeteer test scripts for manual verification steps.
- **PDF Reporting**: Generates beautiful, compliant PDF reports with severity-sorted violations, HTML error counts, and `@HolmDigital/engine` branding.
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
| `--lang <code>` | Language code (`en`, `sv`, `de`, `fr`, `es`, `nl`, `no`, `fi`, `da`, `en-gb`, `en-us`, `en-ca`) |
| `--threshold <level>` | Severity threshold for compliance (`critical`, `high`, `medium`, `low`). Default: `high` |
| `--ci` | Run in CI mode (exit code 1 on failure) |
| `--json` | Output results as JSON |
| `--pdf <path>` | Generate a PDF report |
| `--viewport <size>` | Set viewport size (`mobile`, `tablet`, `desktop`, or custom `1024x768`) |
| `--generate-tests` | Generate Pseudo-Automation tests |
| `--invalid-https-cert` | Allow scanning sites with invalid/self-signed HTTPS certificates ⚠️ |
| `--api-key <key>` | API Key for HolmDigital Cloud |
| `--cloud-url <url>` | Custom Cloud API Endpoint (default: cloud.holmdigital.se) |

### 🏆 Accessibility Badge
If your site achieves a **100% score**, the CLI will generate a [Shields.io](https://shields.io/) badge that you can add to your project's README:

![Accessibility Status: 100% Compliant](https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square)

The badge uses accessible colors (AAA compliant contrast) and is included in both the CLI output and the HTML report.

> **⚠️ Security Note:** The `--invalid-https-cert` flag should only be used in trusted environments (local dev, staging). It disables certificate validation and is not recommended for production. *(Contributed by [@FerdiStro](https://github.com/FerdiStro))*

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
    "engineVersion": "1.4.12",
    "axeCoreVersion": "4.10.2",
    "standardsVersion": "1.2.3",
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
  "legalSummary": {
    "wadApplicable": 2,
    "eaaApplicable": 2,
    "eaaDeadlineViolations": 2
  },
  "score": 90,
  "complianceStatus": "PASS"
}
```

## EU Legal Framework

The engine maps violations to EU legal frameworks:

| Framework | Description | Deadline |
|-----------|-------------|----------|
| **WAD** | Web Accessibility Directive 2016/2102 (Public Sector) | Already in force |
| **EAA** | European Accessibility Act 2019/882 (Private Sector) | **June 28, 2025** |

### legalSummary Fields

| Field | Description |
|-------|-------------|
| `wadApplicable` | Violations that affect WAD compliance (public sector) |
| `eaaApplicable` | Violations that affect EAA compliance (private sector) |
| `eaaDeadlineViolations` | Issues that must be fixed before EAA 2025 deadline |

### HTML Report Enhancements

The HTML/PDF report now includes:
- **EU Legal Framework Impact** summary section
- **WAD/EAA badges** on each violation card
- **EAA deadline warnings** for issues requiring immediate attention

## Severity Threshold

The `--threshold` flag controls when `complianceStatus` becomes `FAIL`:

| Threshold | Fails on |
|-----------|----------|
| `critical` | Only critical violations |
| `high` (default) | Critical + high violations |
| `medium` | Critical + high + medium violations |
| `low` | Any violation |

**Why this matters for CI/CD:**

```bash
# Strict: Block deployment on any serious issue
npx hd-a11y-scan https://staging.example.com --ci --threshold high

# Lenient: Only block on critical issues (like missing alt text)
npx hd-a11y-scan https://staging.example.com --ci --threshold critical
```

Medium violations (like missing `<main>` landmark) won't fail your CI by default, but are still reported for awareness.

## Metadata Fields

| Field | Description |
|-------|-------------|
| `engineVersion` | Version of @holmdigital/engine |
| `axeCoreVersion` | Version of axe-core used |
| `standardsVersion` | Version of @holmdigital/standards database |
| `scanDuration` | Scan time in milliseconds |
| `pageTitle` | HTML `<title>` of scanned page |
| `pageLanguage` | `lang` attribute of `<html>` |
| `stats.passed` | Number of accessibility checks that passed |


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
