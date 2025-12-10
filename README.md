# Holm Digital Regulatory-Compliant Accessibility Ecosystem

A professional accessibility ecosystem bridging the gap between technical code validation (**WCAG 2.x**) and legal compliance (EN 301 549, DOS Act).
> **Note:** We strictly adhere to **WCAG 2.1 & 2.2** standards to ensure stability and full alignment with current EU/Global legal requirements (EAA, Section 508).

## 🎯 Value Proposition

- **Regulatory Mapping**: Automatically maps WCAG failures to EN 301 549 and national laws (e.g., Sweden's DOS-lagen).
- **Risk Assessment**: Classifies every violation based on regulatory enforcement practices (e.g., DIGG).
- **Prescriptive Design**: Provides concrete component-based solutions, not just error descriptions.
- **European Focus**: Built-in support for multiple languages and national regulations.
- **CI/CD Integration**: Automatically breaks builds on critical regulatory violations.

## 📦 Packages

This monorepo contains three core NPM packages and a documentation wiki:

### 1. [@holmdigital/engine](./packages/engine)
Regulatory test engine with Virtual DOM architecture for Shadow DOM and SPA support. Now with internationalization (i18n).

```bash
npm install @holmdigital/engine
```

**CLI:**
```bash
npx hd-a11y-scan <url> [options]
```

**Options:**
- `--lang <code>` - Language code (`en`, `sv`, `de`, `fr`, `es`)
- `--ci` - Run in CI mode (exit code 1 on failure)
- `--json` - Output results as JSON
- `--pdf <path>` - Generate a PDF report
- `--viewport <size>` - Set viewport size (e.g., "mobile", "desktop")

### 2. [@holmdigital/components](./packages/components)
Accessible React components with built-in regulatory compliance.

```bash
npm install @holmdigital/components
```

### 3. [@holmdigital/standards](./packages/standards)
Machine-readable regulatory database with convergence schema.

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

### GitHub Actions Example

Create `.github/workflows/accessibility.yml`:

```yaml
name: Accessibility Scan
on: [push, pull_request]

jobs:
  a11y-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # 1. Start your local server (e.g., Next.js, Vite)
      - name: Start Server
        run: npm run dev &
        env:
            CI: true

      - name: Wait for Server
        run: npx wait-on http://localhost:3000

      # 2. Run Regulatory Scan
      - name: Run HolmDigital Compliance Scan
        run: npx @holmdigital/engine --ci --lang en http://localhost:3000
```

## 🚀 Quick Start

### Installation

```bash
# Clone repo
git clone https://github.com/holmdigital/a11y.git
cd a11y

# Install dependencies
npm install

# Build all packages
npm run build
```

## 🏗️ Architecture

```
@holmdigital/a11y-monorepo/
├── packages/
│   ├── engine/          # Test engine (Puppeteer/Axe) with i18n
│   ├── components/      # React components
│   └── standards/       # Regulatory database (EN/SV/DE/FR/ES)
├── holmdigital-wiki/    # Private Internal Wiki / Documentation
└── package.json         # Monorepo root
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

**MIT License** - See [LICENSE](./LICENSE) for details.

Copyright (c) 2025 Holm Digital AB

## 🔗 Links

- [Holm Digital AB](https://holmdigital.se)
- [GitHub](https://github.com/holmdigital/a11y)
- [NPM](https://www.npmjs.com/org/holmdigital)
