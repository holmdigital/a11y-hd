# 🚂 Engine Library Catalog
> **Last Updated:** 2026-06-22

The `@holmdigital/engine` is the automated testing core. It runs a headless browser (Puppeteer) to scan your web applications for accessibility violations against WCAG 2.1 and EN 301 549.

It is designed to be **CI/CD native**, meaning it fits perfectly into your build pipelines.

## 🚀 Quick Start

Run a one-off scan on any URL:

```bash
npx hd-a11y-scan https://example.com
```

## 🛠️ CLI Reference

### Basic Usage

```bash
hd-a11y-scan <url> [options]
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--lang <code>` | Set the language for the report (default: `en`). CLI output: `en`, `sv`, `no`, `fi`, `da`, `nl`, `de`, `fr`, `es` (+ aliases `en-gb`/`en-us`/`en-ca`/`en-au` fall back to `en`). Statement templates also accept `it`, `pt`, `pl`, plus dedicated `en-gb`/`en-us`/`en-ca`/`en-au`. | `--lang sv` |
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
| `--cloud-url <url>` | Cloud API URL (default: `https://cloud.holmdigital.se`). | `--cloud-url https://custom.api` |
| `--country <code>` | Country code for enforcement body in statement. For `US`: combined with `--sector public` → ADA Title II + Section 508 (DOJ); combined with `--sector private` → ADA Title III (DOJ). | `--country SE` |
| `--format <type>` | Output format for statement (`html`, `md`). Default: `html`. | `--format md` |
| `--sector <type>` | Sector type for enforcement body and law selection (`public` or `private`). Default: `public`. | `--sector private` |
| `--light` | Fast score-only mode — skips HTML validation and detailed legal mapping. | `--light` |
| `--invalid-https-cert` | Allow scanning sites with invalid/self-signed HTTPS certificates ⚠️ (trusted envs only). | `--invalid-https-cert` |
| `--audience <mode>` | Report audience: `developer` (default) or `plain`. Plain mode renders a non-technical, grouped report for managers, lawyers, and buyers. | `--audience plain` |
| `--plain` | Alias for `--audience plain` (klarspråksläge). | `--plain` |
| `--noscript-check` | Robustness probe: how much content is available without JavaScript. Advisory only, never affects the score. | `--noscript-check` |

### Robustness Without JavaScript (`--noscript-check`)

Opt-in. Loads the page a second time with JavaScript disabled and compares the amount of visible text against the normal, hydrated scan. The result is a **content coverage ratio**, not an axe error count — an empty page has almost no axe errors, so error counts are useless here.

| Coverage | Verdict | Meaning |
| --- | --- | --- |
| `< 5 %` | `empty` | The page is effectively blank without JavaScript. |
| `5–49 %` | `partial` | A substantial part of the content is missing without JavaScript. |
| `≥ 50 %` | `ok` | Core content is server-rendered; JavaScript is an enhancement. |
| n/a | `unknown` | The probe failed, or the page has no text even with JavaScript. A failed probe never fails the scan. |

> **This is a recommendation, not a legal requirement.** No WCAG 2.x success criterion requires a page to work without JavaScript. Principle 4 ("Robust") is about content being parseable by user agents and assistive technology, not about progressive enhancement; SC 4.1.2 explicitly assumes script-generated components. The requirement existed in WCAG 1.0 checkpoint 6.3 (1999) and was removed in WCAG 2.0, and W3C technique SCR38 states outright that it "is not required for conformance with WCAG 2.x."
>
> Consequently the finding **never** affects `score`, `stats` or `complianceStatus`, and is **never** emitted as a WCAG violation. It is carried in a separate `result.noScript` object whose `isWcagViolation` and `affectsScore` fields are permanently `false`.

Content inside `<noscript>` elements is excluded from the measurement. A `<noscript>` block only renders when JavaScript is off, so counting it would compare text that exists in one measurement and is impossible in the other, inflating the coverage ratio.

```bash
npx hd-a11y-scan https://spa.example.com --noscript-check --lang sv
```

```typescript
const scanner = new RegulatoryScanner({
  url: 'https://spa.example.com',
  noScriptCheck: true // default: false — costs one extra page load
});
const result = await scanner.scan();
result.noScript?.verdict;        // 'ok' | 'partial' | 'empty' | 'unknown'
result.noScript?.coverageRatio;  // 0..1
```

Cost: one extra page load. Off by default.

### Hydration Wait (SPA support)
`ScannerOptions.waitForHydrationMs` (programmatic API) adds an extra settle after `waitForNetworkIdle` and before metadata capture, so client-rendered SPAs finish hydrating before axe runs. Default is `2500` ms; set `0` to turn it off. Without this wait, unhydrated SPAs could report a false 100/100.

```typescript
const scanner = new RegulatoryScanner({
  url: 'https://spa.example.com',
  waitForHydrationMs: 5000 // give a heavy SPA more time; 0 disables the wait
});
```

---

## ⚙️ Configuration File (`.a11yrc`)

Instead of long CLI commands, you can store your settings in a `.a11yrc` file in your project root. The engine detects this automatically.

```json
{
  "lang": "sv",
  "sector": "public",
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
  "publishDate": "2024-02-06",
  "cloudUrl": "https://cloud.holmdigital.se"
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
| `sector` | `sector` | Sector type (`public` or `private`) for law framework selection |
| `publishDate` | `publishDate` | Website publish date (YYYY-MM-DD) |
| `invalidHttpsCert` | — | Allow scanning pages with invalid HTTPS certificates |
| `cloudUrl` | — | Custom Cloud API endpoint URL |

> [!TIP]
> Other props like `assessmentDate` and `evaluationMethod` are currently automated by the engine to ensure consistency across scan reports.

### Multi-Company Scale
Place a `.a11yrc` file in each client's project directory. The engine auto-discovers it via [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig):
```bash
cd client-a/ && hd-a11y-scan https://client-a.com --statement client-a-a11y.html
```

---

## 🤖 CI/CD Integration Examples

### GitHub Actions

```yaml
- name: Run Accessibility Scan
  run: |
    npx hd-a11y-scan http://localhost:3000 \
      --ci \
      --threshold critical \
      --lang sv
```

### GitLab CI

```yaml
a11y-check:
  script:
    - npx hd-a11y-scan https://staging.example.com --ci --junit report.xml
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

### 4. Plain-Language (Non-Technical Recipients)
Triggered by `--plain` or `--audience plain`. The terminal report and PDF are rendered in plain language for managers, lawyers, and buyers without a technical background. Findings of the same rule are grouped into one card with an occurrence count, a business-impact breakdown is shown under the intro line, and unmapped findings fall back to a translated, self-contained sentence instead of leaking axe-core's raw English help text.

---

## 🧠 Smart Features

### Template-Driven Reports
Accessibility statements are generated using professionalized JSON templates located in `packages/engine/src/reporting/templates/`. The engine ships with **15 locale templates** covering EN, EN-GB, EN-US, EN-CA, SV, NO, FI, DA, NL, DE, FR, ES, IT, PT, and PL. These templates support:
- **Conditional Text**: Blocks like `[contact phone: {<phone>}]` only render if data is provided.
- **Compliance Choices**: Text blocks that vary based on the scan result (e.g., `{Compliant/Partial/Non-Compliant}`).

### Cloud Integration
If you have a HolmDigital Cloud account, use `--api-key` to upload results for historical tracking and trend analysis over time. All data is securely hosted at `holmdigital.se`.
