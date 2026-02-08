# 🚂 Engine Library Catalog
> **Last Updated:** 2026-02-04

The `@holmdigital/engine` is the automated testing core. It runs a headless browser (Puppeteer) to scan your web applications for accessibility violations against WCAG 2.1 and EN 301 549.

It is designed to be **CI/CD native**, meaning it fits perfectly into your build pipelines.

## 🚀 Quick Start

Run a one-off scan on any URL:

```bash
npx @holmdigital/engine scan https://example.com
```

## 🛠️ CLI Reference

### Basic Usage

```bash
hd-a11y-scan <url> [options]
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--lang <code>` | Set the language for the report (default: `en`). Supports `en`, `sv`, `no`, `fi`, `da`, `nl`, `de`, `fr`, `es`. | `--lang sv` |
| `--ci` | **CI Mode**: Exits with code 1 if critical issues are found. | `--ci` |
| `--threshold <level>` | Minimum severity to report. Values: `critical`, `high`, `medium`, `low`. | `--threshold critical` |
| `--viewport <size>` | Set screen size. Presets: `mobile`, `desktop`, `tablet` or custom `WxH`. | `--viewport mobile` |
| `--json` | Output raw JSON to stdout (silences other logs). | `--json > report.json` |
| `--junit <path>` | Generate a JUnit XML report for CI dashboards. | `--junit ./report.xml` |
| `--pdf <path>` | Generate a visual PDF report. | `--pdf ./report.pdf` |
| `--generate-tests` | **Experimental**: Generates Puppeteer test scripts to reproduce found errors. | `--generate-tests` |
| `--statement <path>` | Generate an accessibility statement file. | `--statement a11y.html` |
| `--org <name>` | Organization name for the statement. | `--org "Acme Corp"` |
| `--email <email>` | Contact email for the statement. | `--email "a11y@acme.com"` |
| `--phone <number>` | Contact phone for the statement. | `--phone "555-0123"` |
| `--response-time <val>` | Response time for the statement. | `--response-time "2 days"` |
| `--publish-date <date>` | Website publish date (YYYY-MM-DD). | `--publish-date 2024-02-06` |
| `--api-key <key>` | Upload results to HolmDigital Cloud. | `--api-key abc-123` |

---

## ⚙️ Configuration File (`.a11yrc`)

Instead of long CLI commands, you can store your settings in a `.a11yrc` file in your project root. The engine detects this automatically.

```json
{
  "lang": "sv",
  "threshold": "high",
  "viewport": "desktop",
  "ci": true,
  "junit": "./reports/accessibility.xml",
  "pdf": "./reports/accessibility.pdf",
  "invalidHttpsCert": true,
  "org": "HolmDigital AB",
  "email": "hej@holmdigital.se",
  "phone": "070-123 45 67",
  "responseTime": "2 dagar",
  "publishDate": "2024-02-06"
}
```

### Accessibility Statement Metadata

The following keys in `.a11yrc` map to the `AccessibilityStatement` component props. These are used when generating statements via the CLI or programmatic API.

| Config Key (`.a11yrc`) | Prop Name | Description |
| :--- | :--- | :--- |
| `org` | `organizationName` | Name of the organization |
| `email` | `contactEmail` | Support/contact email address |
| `phone` | `phoneNumber` | Support/contact phone number |
| `responseTime` | `responseTime` | Expected response time (e.g. "2 days") |
| `country` | `country` | Country code for enforcement body (SE, NO, etc.) |
| `publishDate` | `publishDate` | Website publish date (YYYY-MM-DD) |

> [!TIP]
> Other props like `assessmentDate` and `evaluationMethod` are currently automated by the engine to ensure consistency across scan reports.

### Multi-Company Scale
You can use separate config files for different clients:
```bash
hd-a11y-scan https://client-a.com --config client-a.a11yrc --statement client-a-a11y.html
```

---

## 🤖 CI/CD Integration Examples

### GitHub Actions

```yaml
- name: Run Accessibility Scan
  run: |
    npx @holmdigital/engine scan http://localhost:3000 \
      --ci \
      --threshold critical \
      --lang sv
```

### GitLab CI

```yaml
a11y-check:
  script:
    - npx @holmdigital/engine scan https://staging.example.com --ci --junit report.xml
  artifacts:
    reports:
      junit: report.xml
```

---

## 📊 Report Types

### 1. JSON (Machine Readable)
Full details of every violation, including DOM nodes, remediation suggestions, and WCAG references.

### 2. JUnit (CI Dashboards)
Standard XML format supported by GitHub, GitLab, Jenkins, and Azure DevOps. **Recently enhanced** to include:
- **Metadata Properties**: Engine version, AXE version, and page metadata are injected as `<property>` tags.
- **Success State Tracking**: Shows all passed rules to provide a balanced health overview.
- **Detailed failure snippets**: Each failure includes a `<system-out>` block with the specific CSS selector and HTML source of the violation.

### 3. PDF (Human Readable)
A beautiful, shareable document for stakeholders. Contains:
- Executive Summary (Score / 100)
- Legal Risk Assessment (High/Medium/Low)
- Detailed breakdown of issues with screenshots (if configured).

---

## 🧠 Smart Features

### Template-Driven Reports
Accessibility statements are generated using professionalized JSON templates located in `packages/engine/src/reporting/templates/`. These templates support:
- **Conditional Text**: Blocks like `[contact phone: {<phone>}]` only render if data is provided.
- **Compliance Choices**: Text blocks that vary based on the scan result (e.g., `{Compliant/Partial/Non-Compliant}`).

### Cloud Integration
If you have a HolmDigital Cloud account, use `--api-key` to upload results for historical tracking and trend analysis over time. All data is securely hosted at `holmdigital.se`.
