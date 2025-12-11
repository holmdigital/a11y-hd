# CI/CD Integration Guide

## Prerequisites

The packages are hosted on **GitHub Package Registry**. Configure npm before installation:

```bash
# Configure npm to use GitHub Package Registry for @holmdigital packages
npm config set @holmdigital:registry https://npm.pkg.github.com

# Authenticate (use a GitHub PAT with read:packages scope)
npm login --registry=https://npm.pkg.github.com
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
  --ci               Exit code 1 on critical failures
  --json             Machine-readable JSON output
  --pdf <path>       Generate PDF report
  --viewport <size>  "mobile", "desktop", or "1024x768"
  --lang <code>      Language: "en" or "sv"
  --generate-tests   Generate Pseudo-Automation tests
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
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@holmdigital'
      
      - name: Install scanner
        run: npm install -g @holmdigital/engine
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Run accessibility scan
        run: hd-a11y-scan ${{ vars.SITE_URL || 'https://your-site.com' }} --ci
```

### With JSON Artifact

```yaml
      - name: Run scan with report
        run: hd-a11y-scan https://your-site.com --ci --json > a11y-report.json
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
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
  image: node:20
  stage: test
  before_script:
    - npm config set @holmdigital:registry https://npm.pkg.github.com
    - npm config set //npm.pkg.github.com/:_authToken ${GITHUB_NPM_TOKEN}
  script:
    - npm install -g @holmdigital/engine
    - hd-a11y-scan https://your-site.com --ci --json > a11y-report.json
  artifacts:
    when: always
    paths:
      - a11y-report.json
```

> **Note:** Create a GitLab CI variable `GITHUB_NPM_TOKEN` with a GitHub PAT that has `read:packages` scope.

---

## Azure DevOps

```yaml
- task: NodeTool@0
  inputs:
    versionSpec: '20.x'

- script: |
    npm config set @holmdigital:registry https://npm.pkg.github.com
    npm config set //npm.pkg.github.com/:_authToken $(GITHUB_NPM_TOKEN)
    npm install -g @holmdigital/engine
    hd-a11y-scan $(SITE_URL) --ci
  displayName: 'Accessibility Scan'
```

> **Note:** Create a pipeline variable `GITHUB_NPM_TOKEN` with a GitHub PAT that has `read:packages` scope.

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

- ✅ WCAG 2.1 (A & AA)
- ✅ EN 301 549 (EU)
- ✅ DOS-lagen (Sweden)
