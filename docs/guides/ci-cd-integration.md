# CI/CD Integration Guide

## Prerequisites

The packages are hosted on **npmjs**. No special configuration is usually required.

```bash
# Ensure you are using the public npm registry (default)
npm config set registry https://registry.npmjs.org/
```

## Quick Start

```bash
# Install the scanner
npm install @holmdigital/engine

# Run in CI/CD mode - exits with code 1 on critical failures
npx hd-a11y-scan https://your-site.com --ci

# JSON output for parsing in scripts
npx hd-a11y-scan https://your-site.com --ci --json
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0`  | PASS – No critical violations |
| `1`  | FAIL – Critical violations found (blocks pipeline) |

---

## CLI Options

```bash
Usage: hd-a11y-scan [options] <url>

Options:
  --ci               Exit code 1 on compliance failure
  --threshold <lvl>  Failure threshold: "critical", "high", "medium", "low"
  --json             Machine-readable JSON output
  --pdf <path>       Generate visual PDF report
  --statement <path> Generate Premium V2 accessibility statement
  --org <name>       Organization name for metadata
  --email <email>    Contact email for metadata
  --phone <num>      Contact phone for metadata
  --response-time <v> Expected response time for metadata
  --publish-date <d> Website publish date (YYYY-MM-DD)
  --viewport <size>  "mobile", "desktop", or "1024x768"
  --lang <code>      Language: "en", "sv", "no", "fi", "da", etc.
  --generate-tests   Generate Pseudo-Automation tests (experimental)
  --config <path>    Path to a custom .a11yrc/config file
```

---

## GitHub Actions

```yaml
name: Accessibility Check

on: [push, pull_request]

jobs:
  a11y-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Install scanner
        run: npm install -g @holmdigital/engine

      
      - name: Run accessibility scan
        run: hd-a11y-scan ${{ vars.SITE_URL || 'https://your-site.com' }} --ci
```

### With JSON Artifact

```yaml
      - name: Run scan with report
        run: hd-a11y-scan https://your-site.com --ci --json > a11y-report.json

      
      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: accessibility-report
          path: a11y-report.json
```

---

## GitLab CI

```yaml
accessibility:
  image: node:22
  stage: test
  before_script:

  script:
    - npm install -g @holmdigital/engine
    - hd-a11y-scan https://your-site.com --ci --json > a11y-report.json
  artifacts:
    when: always
    paths:
      - a11y-report.json
```



---

## Azure DevOps

```yaml
- task: NodeTool@0
  inputs:
    versionSpec: '22.x'

- script: |

    npm install -g @holmdigital/engine
    hd-a11y-scan $(SITE_URL) --ci
  displayName: 'Accessibility Scan'
```



---

## JSON Output Structure

```json
{
  "url": "https://example.com",
  "score": 85,
  "complianceStatus": "FAIL",
  "stats": {
    "critical": 2,
    "serious": 5,
    "moderate": 3,
    "minor": 1
  },
  "reports": [
    {
      "ruleId": "color-contrast",
      "impact": "serious",
      "holmdigitalInsight": {
        "diggRisk": "high",
        "wcag": ["1.4.3"],
        "en301549": ["9.1.4.3"],
        "dosLagen": true
      },
      "failingNodes": [...]
    }
  ],
  "htmlValidation": {
    "valid": false,
    "errorCount": 3,
    "errors": [...]
  }
}
```

---

## Recommended Workflow

1. **Development**: Run manually during development
   ```bash
   npx hd-a11y-scan http://localhost:3000
   ```

2. **Pull Request**: Block merge on critical failures
   ```bash
   npx hd-a11y-scan $PREVIEW_URL --ci
   ```

3. **Post-Deploy**: Generate PDF reports for compliance
   ```bash
   npx hd-a11y-scan https://production.com --pdf report.pdf
   ```

---

## Viewport Testing

Test responsive accessibility:

```bash
# Mobile (375x667)
npx hd-a11y-scan https://your-site.com --ci --viewport mobile

# Desktop (1280x720)
npx hd-a11y-scan https://your-site.com --ci --viewport desktop

# Custom
npx hd-a11y-scan https://your-site.com --ci --viewport 1920x1080
```

---

## Troubleshooting

### Timeout Issues
The scanner uses Puppeteer. For slow sites, ensure adequate timeout in your CI:

```yaml
# GitHub Actions
- name: Run scan
  run: hd-a11y-scan https://your-site.com --ci
  timeout-minutes: 5
```

### Headless Browser Issues
For Docker/container environments, you may need:

```dockerfile
# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils
```

---

## Standards Tested

The engine automatically maps technical violations to the following global and national legal frameworks:

- ✅ **WCAG 2.1 & 2.2** (A, AA, AAA)
- ✅ **EN 301 549** (EU Harmonized Standard)
- ✅ **DOS-lagen** (Sweden)
- ✅ **Forskrift om universell utforming** (Norway)
- ✅ **Lov om tilgængelighed** (Denmark)
- ✅ **Laki digitaalisten palvelujen** (Finland)
- ✅ **Digitoegankelijk** (Netherlands)
- ✅ **BITV 2.0** (Germany)
- ✅ **RGAA** (France)
- ✅ **UNE 139803** (Spain)
- ✅ **Section 508 / ADA** (USA)
- ✅ **AODA** (Canada)
- ✅ **PSBAR** (UK)
