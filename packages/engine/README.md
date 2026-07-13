# @holmdigital/engine

[![npm version](https://img.shields.io/npm/v/@holmdigital/engine.svg)](https://www.npmjs.com/package/@holmdigital/engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
[![Downloads](https://img.shields.io/npm/dm/@holmdigital/engine.svg)](https://www.npmjs.com/package/@holmdigital/engine)

> Full documentation and live scanner: [holmdigital.se/wcag-verktyg/engine](https://holmdigital.se/wcag-verktyg/engine)

> Regulatory accessibility test engine with Virtual DOM, Shadow DOM support, and built-in legal compliance reporting.

## Why this package?

Most accessibility tools give you technical errors (e.g., "Color contrast must be 4.5:1"). This engine bridges the gap between **technical code validation** (using `axe-core`) and **legal compliance** (EN 301 549, Section 508, DOS-lagen).

It handles the heavy lifting of:
1.  **Mapping** technical failures to specific legal clauses.
2.  **Validating** HTML structure to ensure test accuracy.
3.  **Reporting** in multiple languages — 9 CLI output locales (EN, SV, NO, FI, DA, NL, DE, FR, ES) and 16 accessibility statement template locales (adds IT, PT, PL, EN-GB, EN-US, EN-CA, EN-AU) — for non-technical stakeholders.
4.  **CI/CD Pipeline Integration** with automatic enforcement.

For a comprehensive guide on CLI flags, CI/CD integration, and configuration files, see the **[Engine Library Catalog](../../docs/reference/engine.md)**.

## Features

- **Regulatory Mapping**: Maps technical failures to EU laws (EN 301 549, EAA), international laws (Australian DDA), and **U.S. ADA (Title II state/local, Title III private sector) + Section 508 (federal agencies) + HHS Section 504 (HHS-funded healthcare/research)**.
- **Sector-Aware US Routing**: `--country US --sector public` references **ADA Title II + Section 508** (DOJ enforcement); `--sector private` references **ADA Title III + HHS Section 504** (DOJ + HHS OCR enforcement) — covering both general public-accommodations exposure and HHS-funded healthcare obligations in a single statement.
- **HTML Structure Validation**: Built-in `html-validate` checks to prevent false positives/negatives.
- **Internationalization (i18n)**: 12 languages total; locale file counts differ by subsystem (9 CLI output files, 16 statement templates including English variants).
  - **CLI output**: 9 locale files (`en`, `sv`, `no`, `fi`, `da`, `de`, `fr`, `es`, `nl`) + 4 English aliases (`en-gb`, `en-us`, `en-ca`, `en-au`) that fall back to `en`.
  - **Statement templates**: 16 locale files — adds `it`, `pt`, `pl`, and separate templates for each English variant (`en-gb`, `en-us`, `en-ca`, `en-au`).
- **Template-Driven Accessibility Statements**: Generates modern, glassmorphism-styled statements using externalized JSON templates for each language, allowing for professional legal phrasing and deep customization.
- **Multi-Company Metadata**: Easily customize statements via CLI flags or `.a11yrc` for scalable client generation.
- **Enriched JUnit XML**: Professional CI/CD reports including scan duration, page title, engine metadata, and **detailed failing node** snippets (Target + HTML).
- **Configurable Severity Threshold**: Fail CI only on critical/high issues (configurable).
- **Pseudo-Automation**: Automatically generates Playwright/Puppeteer test scripts for manual verification steps.
- **PDF Reporting**: Generates beautiful, compliant PDF reports with severity-sorted violations, HTML error counts, and `@HolmDigital/engine` branding.
- **Plain-Language Reports**: `--plain` (or `--audience plain`) renders the report and PDF in plain language for managers, lawyers, and buyers without a technical background. Findings of the same rule are grouped into one card with an occurrence count, with a business-impact breakdown and Swedish-language fallback.
- **Robustness Without JavaScript** (opt-in): `--noscript-check` loads the page a second time with JavaScript disabled and reports how much of the content survives. A client-rendered SPA that is blank without JS breaks for every user whose script fails to load (network, proxy, firewall, extension). They get an empty page, not a degraded one. When the page is empty or partial, the report also names who is affected, so the finding is not waved away with "everyone has JavaScript". **This is advisory, not a legal requirement**: no WCAG success criterion requires a page to work without JavaScript, so the finding never affects the compliance score and is never reported as a WCAG violation.
- **Type-Safe Results**: Scan results return fully typed `EnrichedReport[]` with `failingNodes` and `legalContext` — zero `as any` casts in the pipeline.
- **Build-Time Version Injection**: Engine version derived from `package.json` at build time via tsup `define` — CLI, cloud client, and reports always report the correct version.
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
| `--lang <code>` | Language code. CLI output: `en`, `sv`, `no`, `fi`, `da`, `de`, `fr`, `es`, `nl` (+ aliases `en-gb`, `en-us`, `en-ca`, `en-au` fall back to `en`). Statement templates also accept `it`, `pt`, `pl`. |
| `--threshold <level>` | Severity threshold for compliance (`critical`, `high`, `medium`, `low`). Default: `high` |
| `--ci` | Run in CI mode (exit code 1 on failure) |
| `--json` | Output results as JSON |
| `--pdf <path>` | Generate a PDF report |
| `--statement <path>` | Generate a Premium V2 accessibility statement (HTML) |
| `--org <name>` | Organization name for the statement metadata |
| `--email <email>` | Contact email for the statement metadata |
| `--phone <number>` | Contact phone for the statement metadata |
| `--response-time <val>` | Response time for the statement metadata |
| `--publish-date <date>` | Publish date for the website (YYYY-MM-DD) |
| `--country <code>` | Country code for enforcement body (`SE`, `NO`, `DE`, `IT`, `PT`, `PL`, `AU`, etc.) |
| `--sector <type>` | Sector type: `public` (WAD) or `private` (EAA). Default: `public` |
| `--viewport <size>` | Set viewport size (`mobile`, `tablet`, `desktop`, or custom `1024x768`) |
| `--generate-tests` | Generate Pseudo-Automation tests |
| `--invalid-https-cert` | Allow scanning sites with invalid/self-signed HTTPS certificates ⚠️ |
| `--api-key <key>` | API Key for HolmDigital Cloud |
| `--cloud-url <url>` | Custom Cloud API Endpoint (default: cloud.holmdigital.se) |
| `--light` | Fast score-only mode — skips HTML validation and detailed legal mapping |
| `--plain` | Plain-language mode (klarspråksläge): report and PDF in non-technical language for recipients without a technical background. Alias for `--audience plain`. |
| `--audience <mode>` | Report audience: `developer` (default) or `plain`. |
| `--noscript-check` | Robustness probe: measures how much of the page content is available without JavaScript. **Advisory only. Never affects the compliance score.** |
| `--wait-for-hydration <ms>` | Settle time after network idle so client-rendered SPAs finish hydrating before axe runs. Default: `2500`. `0` disables the wait, maximum `60000`. |

### 🏆 Accessibility Badge
If your site achieves a **100% score**, the CLI will generate a [Shields.io](https://shields.io/) badge that you can add to your project's README:

![Accessibility Status: 100% Compliant](https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square)

The badge uses accessible colors (AAA compliant contrast) and is included in both the CLI output and the HTML report.

**One exception.** If you run `--noscript-check` and the verdict is `empty` (the page is effectively blank without JavaScript), the badge is not generated. The score is untouched: the page still shows 100/100 and PASS, because it is genuinely WCAG conformant and lowering the score would misrepresent the law. But the badge is a shareable marketing artefact, not a legal verdict, and we do not hand out an award to a page that a user on a weak network never gets to see. The CLI prints one line instead:

```
100/100 with no findings. The robustness check is not clean, so we do not generate a shareable badge.
```

A `partial` verdict still earns the badge: core content is there and the page can be read.

> **⚠️ Security Note:** The `--invalid-https-cert` flag should only be used in trusted environments (local dev, staging). It disables certificate validation and is not recommended for production. *(Contributed by [@FerdiStro](https://github.com/FerdiStro))*

**Example:**
```bash
# Fail only on critical issues in CI
npx hd-a11y-scan https://example.com --ci --threshold critical

# Full JSON output with metadata
npx hd-a11y-scan https://example.com --json

# Quick score check (ideal for APIs and dashboards)
npx hd-a11y-scan https://example.com --light

# Light scan with JSON output (perfect for scan-server integration)
npx hd-a11y-scan https://example.com --light --json

# U.S. state/local government statement (ADA Title II + Section 508, DOJ)
npx hd-a11y-scan https://example.gov --country US --sector public --statement statement.md --lang en-us

# U.S. private sector statement (ADA Title III + HHS Section 504, DOJ + HHS OCR)
# Covers general "public accommodation" exposure AND HHS-funded healthcare obligations
npx hd-a11y-scan https://shop.example.com --country US --sector private --statement statement.md --lang en-us
npx hd-a11y-scan https://hospital.example.com --country US --sector private --statement statement.md --lang en-us
```

## JSON Output

```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-13T17:05:11.749Z",
  "metadata": {
    "engineVersion": "2.8.0",
    "axeCoreVersion": "4.11.1",
    "standardsVersion": "2.8.0",
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
