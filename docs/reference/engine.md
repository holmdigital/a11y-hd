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
| `--lang <code>` | Set the language for the report (default: `en`). Supports `sv`, `no`, `fi`, `da` etc. | `--lang sv` |
| `--ci` | **CI Mode**: Exits with code 1 if critical issues are found. | `--ci` |
| `--threshold <level>` | Minimum severity to report. Values: `critical`, `high`, `medium`, `low`. | `--threshold critical` |
| `--viewport <size>` | Set screen size. Presets: `mobile`, `desktop`, `tablet` or custom `WxH`. | `--viewport mobile` |
| `--json` | Output raw JSON to stdout (silences other logs). | `--json > report.json` |
| `--junit <path>` | Generate a JUnit XML report for CI dashboards. | `--junit ./report.xml` |
| `--pdf <path>` | Generate a visual PDF report. | `--pdf ./report.pdf` |
| `--generate-tests` | **Experimental**: Generates Puppeteer test scripts to reproduce found errors. | `--generate-tests` |
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
  "invalidHttpsCert": true
}
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
Standard XML format supported by GitHub, GitLab, Jenkins, and Azure DevOps to visualize test results.

### 3. PDF (Human Readable)
A beautiful, shareable document for stakeholders. Contains:
- Executive Summary (Score / 100)
- Legal Risk Assessment (High/Medium/Low)
- Detailed breakdown of issues with screenshots (if configured).

---

## 🧠 Smart Features

### Pseudo-Automation (`--generate-tests`)
When the engine finds a complex error (e.g. "Focus trap in modal"), it can try to generate a Puppeteer script that reproduces user interaction leading to that state. This helps developers debug "invisible" accessibility issues.

### Cloud Integration
If you have a HolmDigital Cloud account, use `--api-key` to upload results for historical tracking and trend analysis over time.
