# Holm Digital Regulatory-Compliant Accessibility Ecosystem

A professional accessibility ecosystem bridging the gap between technical code validation (**WCAG 2.x**) and legal compliance (EN 301 549, DOS Act).
> **Note:** We strictly adhere to **WCAG 2.1 & 2.2** standards to ensure stability and full alignment with current EU/Global legal requirements (EAA, Section 508).

## 🎯 Value Proposition

- **Multi-Language Regulatory Mapping**: Automatically maps WCAG failures to EN 301 549 and national laws across **12 languages** and **15 countries**:
    - 🇸🇪 **DOS-lagen** (Sweden)
    - 🇫🇮 **Laki digitaalisten palvelujen saavutettavuudesta** (Finland)
    - 🇳🇴 **Forskrift om universell utforming av IKT** (Norway)
    - 🇩🇰 **Lov om tilgængelighed** (Denmark)
    - 🇳🇱 **Digitoegankelijk** (Netherlands)
    - 🇩🇪 **BITV 2.0** (Germany)
    - 🇫🇷 **RGAA** (France)
    - 🇪🇸 **UNE 139803** (Spain)
    - 🇮🇹 **Legge Stanca** (Italy)
    - 🇵🇹 **DL 83/2018** (Portugal)
    - 🇵🇱 **Ustawa o dostępności cyfrowej** (Poland)
    - 🇬🇧 **PSBAR** / 🇮🇪 **S.I. No. 358/2020** (UK/Ireland)
- **Sector-Aware Compliance**: Distinguishes between public sector (WAD) and private sector (EAA), routing to the correct enforcement body and national law via `--sector public|private`.
- **Risk Assessment**: Classifies every violation based on regulatory enforcement practices (e.g., DIGG, uutilsynet, Logius).
- **Professional CI/CD Reporting**: Enhanced JUnit XML reports with full metadata, success counts, and detailed failure snippets for seamless integration with modern DevOps dashboards.
- **Template-Driven Statements**: Generates modern, glassmorphism-styled accessibility statements using professionalized JSON templates for deep localization.

## 📚 Documentation & Guides

Comprehensive resources to help you master the ecosystem, from legal compliance to advanced technical integration.

### 📖 Reference Catalogs
Detailed API and property references for each package.
*   **[Engine Reference](./docs/reference/engine.md)** - CLI flags, configuration schema, and programmatic API.
*   **[Component Library](./docs/reference/components.md)** - Visual catalog of 29+ accessible React components with props.
*   **[Standards Database](./docs/reference/standards.md)** - Mapping table for WCAG vs EN 301 549 vs National Laws.

### 🛠️ Developer Resources
Practical guides for building and deploying accessible applications.
*   **[Developer Cookbooks](./docs/guides/developer-cookbooks.md)** - Step-by-step recipes for common accessibility patterns.
*   **[CI/CD Integration Guide](./docs/guides/ci-cd-integration.md)** - How to run the engine in GitHub, GitLab, and Azure DevOps.
*   **[Internal CI/CD Strategy](./docs/architecture/ci-cd-strategy.md)** - Monorepo architecture and automated release pipelines.
*   **[Accessibility Statement Tutorial](./docs/guides/accessibility-statement.md)** - How to generate and customize V2 legal statements.

### ⚖️ Legal & Regulatory
Stay ahead of enforcement deadlines and compliance requirements.
*   **[EU Legal Framework (WAD & EAA)](./docs/guides/eu-legal-framework.md)** - Understanding the impact of current and upcoming regulations.
*   **[Nordic Regulatory Authorities](./docs/guides/nordic-authorities.md)** - Details on Digg (SE), Traficom (FI), and others.

## 📦 Packages

This monorepo contains three core NPM packages and a documentation wiki:

### 1. [@holmdigital/engine](./packages/engine)
Regulatory test engine with Virtual DOM architecture for Shadow DOM and SPA support. Now with internationalization (i18n), **Premium V2 Accessibility Statement** generation, and automatic badge support.

```bash
npm install @holmdigital/engine
```

**CLI:**
```bash
npx hd-a11y-scan <url> [options]
```

**Options:**
- `--lang <code>` - Language code (`en`, `sv`, `no`, `fi`, `da`, `de`, `fr`, `es`, `nl`, `it`, `pt`, `pl`)
- `--threshold <level>` - Severity threshold (`critical`, `high`, `medium`, `low`). Default: `high`
- `--ci` - Run in CI mode (exit code 1 on critical failures)
- `--json` - Output results as JSON
- `--pdf <path>` - Generate a PDF report
- `--statement <path>` - Generate an accessibility statement (Premium V2 HTML)
- `--format <type>` - Output format for statement (`html`, `md`). Default: `html`
- `--junit <path>` - Generate JUnit XML report for CI dashboards
- `--country <code>` - Country code for enforcement body (e.g., `SE`, `NO`, `DE`, `IT`, `PT`, `PL`)
- `--sector <type>` - Sector type: `public` (WAD) or `private` (EAA). Default: `public`
- `--org <name>` - Organization name for statement metadata
- `--email <email>` - Contact email for statement metadata
- `--phone <number>` - Contact phone for statement metadata
- `--response-time <val>` - Normal response time for statement metadata
- `--publish-date <date>` - Website publish date (YYYY-MM-DD) for statement metadata
- `--viewport <size>` - Set viewport size (e.g., "mobile", "tablet", "desktop", "1024x768")
- `--generate-tests` - Generate pseudo-code automation scripts for verification
- `--invalid-https-cert` - Allow scanning sites with invalid/self-signed certs ⚠️
- `--api-key <key>` - Upload results to HolmDigital Cloud Dashboard
- `--cloud-url <url>` - Custom Cloud API Endpoint (default: cloud.holmdigital.se)

> **⚠️ Security:** `--invalid-https-cert` should only be used in trusted environments. *(Contributed by [@FerdiStro](https://github.com/FerdiStro))*

### 2. [@holmdigital/components](./packages/components)
Accessible React components with built-in regulatory compliance. Includes a 12-locale `AccessibilityStatement` component for generating legal statements in EN, SV, NO, FI, DA, NL, DE, FR, ES, IT, PT, and PL.

```bash
npm install @holmdigital/components
```

### 3. [@holmdigital/standards](./packages/standards)
Machine-readable regulatory database with convergence schema, 12 locale databases, and fully typed exports (`EnrichedReport`, `FailingNode`, `LegalContext`).

```bash
npm install @holmdigital/standards
```

**API:**
```typescript
import { getEN301549Mapping } from '@holmdigital/standards';

// Get mapping with Swedish legal context
const mapping = getEN301549Mapping('1.4.3', 'sv');
// { wcagCriteria: "1.4.3", en301549Criteria: "9.1.4.3", dosLagenReference: "Lag 2018:1937 §7..." }
```

## 🤖 CI/CD Integration

The engine is designed to run in CI/CD pipelines (GitHub Actions, GitLab CI, etc.). It returns exit code `1` if critical violations are found.

### 1. GitHub Actions
```yaml
name: Accessibility Scan
on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Start Server
        run: npm run dev &
        env:
            CI: true

      - name: Wait for Server
        run: npx wait-on http://localhost:3000

      - name: Run Scan
        run: npx hd-a11y-scan http://localhost:3000 --ci --lang en --junit report.xml --pdf report.pdf

      - name: Upload Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-reports
          path: report.*
```

### 2. GitLab CI
```yaml
a11y-check:
  image: node:20
  script:
    - npm install
    - npm run dev &
    - npx wait-on http://localhost:3000
    - npx hd-a11y-scan http://localhost:3000 --ci --junit report.xml --pdf report.pdf
  artifacts:
    when: always
    paths:
      - report.xml
      - report.pdf
    reports:
      junit: report.xml
```

### 3. Azure DevOps
```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- script: |
    npm install
    npm run dev &
    npx wait-on http://localhost:3000
    npx hd-a11y-scan http://localhost:3000 --ci --junit report.xml
  displayName: 'Run Accessibility Scan'

- task: PublishTestResults@2
  condition: succeededOrFailed()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'report.xml'
```

### 🛑 Build Breaking Logic
The engine returns exit code `1` only when it finds violations that meet your `--threshold`.

- `--threshold critical` = Fails only on critical issues (e.g., missing alt text).
- `--threshold high` (default) = Fails on critical + high issues.
- `--threshold low` = Fails on everything (zero tolerance).


## 🚀 Quick Start

### Installation

```bash
# Clone repo
git clone git@github.com:holmdigital/a11y-hd.git
cd a11y-hd

# Install dependencies
npm install

# Build all packages
npm run build
```

## 🏗️ Architecture

@holmdigital/a11y-monorepo/
├── packages/
│   ├── engine/          # Test engine (Puppeteer/Axe) with i18n & Cloud Support
│   ├── components/      # React components (Heading, Button, etc.)
│   └── standards/       # Regulatory database (12 locales incl. Nordic)
└── package.json         # Monorepo root

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

**MIT License** - See [LICENSE](./LICENSE) for details.

Copyright (c) 2026 Holm Digital AB

## 🔗 Links

- [Holm Digital AB](https://holmdigital.se)
- [GitHub](https://github.com/holmdigital/a11y-hd)
- [NPM](https://www.npmjs.com/org/holmdigital)
