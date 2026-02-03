---
title: "Building a Regulatory-Compliant Accessibility Scanner: From WCAG to Legal Compliance"
published: false
description: "A deep dive into building an accessibility ecosystem that bridges technical validation (WCAG 2.1) with legal compliance (EN 301 549, Section 508, and more)"
tags: accessibility, typescript, react, webdev
cover_image: 
canonical_url: 
---

# Building a Regulatory-Compliant Accessibility Scanner: From WCAG to Legal Compliance

Most accessibility tools tell you *what's wrong*. But when regulators come knocking, they don't ask "Did you fix the color contrast?" — they ask "Are you compliant with EN 301 549 clause 9.1.4.3?"

This guide walks you through three open-source packages I built to bridge that gap: from technical WCAG validation to legal compliance reporting, with ready-to-use React components that are accessible by default.

## The Problem We're Solving

Here's a typical accessibility tool output:

```
❌ color-contrast: Elements must have sufficient color contrast ratio
   Expected: 4.5:1, Actual: 3.2:1
```

But here's what a compliance auditor needs:

```
❌ WCAG 2.1 Success Criterion 1.4.3 (Level AA)
   EN 301 549 Reference: 9.1.4.3
   Swedish DOS-lagen: 12 § Lag (2018:1937)
   Risk Level: HIGH
   Remediation: Increase foreground/background contrast to minimum 4.5:1
```

Let's build this.

---

## The Three Packages

| Package | Purpose | npm |
|---------|---------|-----|
| `@holmdigital/engine` | Accessibility scanner + CLI | [![npm](https://img.shields.io/npm/v/@holmdigital/engine.svg)](https://www.npmjs.com/package/@holmdigital/engine) |
| `@holmdigital/standards` | Regulatory mapping database | [![npm](https://img.shields.io/npm/v/@holmdigital/standards.svg)](https://www.npmjs.com/package/@holmdigital/standards) |
| `@holmdigital/components` | Accessible React components | [![npm](https://img.shields.io/npm/v/@holmdigital/components.svg)](https://www.npmjs.com/package/@holmdigital/components) |

---

## Part 1: The Quick Win — CLI Scanning

Install and scan any website in seconds:

```bash
npx hd-a11y-scan https://your-website.com --lang en --ci
```

**Output:**

```
🔍 Scanning https://your-website.com...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HolmDigital Regulatory Accessibility Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Score: 72/100
  Violations: 4 critical, 8 serious, 12 moderate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CRITICAL: Missing form labels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📋 WCAG 2.1: 1.3.1 (Level A)
  📋 EN 301 549: 9.1.3.1
  📋 Section 508: 1194.22(n)
  
  ⚠️  Risk: CRITICAL
  
  💡 Fix: Associate each input with a <label> element using 
     the 'for' attribute matching the input's 'id'.

  📍 Elements affected:
     - <input type="email" class="newsletter-input">
     - <input type="text" class="search-box">
```

### CLI Options

```bash
# Generate PDF report
npx hd-a11y-scan https://example.com --pdf report.pdf

# Mobile viewport
npx hd-a11y-scan https://example.com --viewport mobile

# Swedish language output
npx hd-a11y-scan https://example.com --lang sv

# JSON for CI/CD pipelines
npx hd-a11y-scan https://example.com --json > results.json
```

---

## Part 2: Programmatic Integration

For deeper integration, use the scanner programmatically:

```typescript
import { RegulatoryScanner, setLanguage } from '@holmdigital/engine';

// Set language context (affects rule descriptions)
setLanguage('en');

async function auditWebsite(url: string) {
  const scanner = new RegulatoryScanner({
    url,
    failOnCritical: true,  // Throws if critical issues found
    viewport: { width: 1920, height: 1080 }
  });

  try {
    const result = await scanner.scan();
    
    console.log(`
      ✅ Accessibility Score: ${result.score}/100
      📊 Total Issues: ${result.violations.length}
      ⚠️  Critical: ${result.violations.filter(v => v.risk === 'critical').length}
    `);

    // Group by WCAG criterion
    const byWcag = result.violations.reduce((acc, v) => {
      const key = v.wcagCriterion;
      acc[key] = (acc[key] || []).concat(v);
      return acc;
    }, {});

    return { score: result.score, byWcag };
  } catch (error) {
    console.error('Critical accessibility violations found!');
    process.exit(1);
  }
}

// Usage
auditWebsite('https://your-site.com');
```

### Real-World Example: GitHub Actions Integration

```yaml
name: Accessibility Audit

on:
  pull_request:
    branches: [main]

jobs:
  a11y-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install & Build
        run: |
          npm ci
          npm run build
          npm run start &
          sleep 5
      
      - name: Run Accessibility Scan
        run: npx hd-a11y-scan http://localhost:3000 --ci --lang en
```

This fails the PR if any **critical** accessibility violations are found.

---

## Part 3: The Standards Database

The real magic is in the regulatory mapping. Here's how it works under the hood:

```typescript
import { 
  getEN301549Mapping, 
  getRulesByLanguage 
} from '@holmdigital/standards';

// Get the EN 301 549 mapping for a WCAG criterion
const mapping = getEN301549Mapping('1.4.3');

console.log(mapping);
// {
//   wcagCriterion: '1.4.3',
//   wcagLevel: 'AA',
//   en301549Clause: '9.1.4.3',
//   description: 'Contrast (Minimum)',
//   risk: 'high',
//   remediation: {
//     description: 'Ensure text has a contrast ratio of at least 4.5:1',
//     technicalGuidance: 'Use CSS to adjust foreground or background colors...'
//   }
// }

// Get all rules for a specific language/region
const swedenRules = getRulesByLanguage('sv');
const usRules = getRulesByLanguage('en-us');

// Each rule includes national law references
console.log(swedenRules[0].nationalLaw);
// {
//   name: 'DOS-lagen',
//   reference: 'Lag (2018:1937) 12 §',
//   description: 'Lagen om tillgänglighet till digital offentlig service'
// }
```

### Supported Regulations

| Language | Regulation | Coverage |
|----------|------------|----------|
| `en` | EN 301 549, WCAG 2.1 | EU Generic |
| `en-us` | Section 508, ADA | United States |
| `en-ca` | AODA | Canada |
| `en-gb` | PSBAR | United Kingdom |
| `sv` | DOS-lagen | Sweden |
| `de` | BITV 2.0 | Germany |
| `fr` | RGAA | France |
| `nl` | Digitoegankelijk | Netherlands |
| `es` | UNE 139803 | Spain |

---

## Part 4: Accessible React Components

Stop reinventing the wheel. These components handle ARIA, focus management, and keyboard navigation for you:

```tsx
import { 
  Button, 
  FormField, 
  Dialog, 
  Heading,
  SkipLink 
} from '@holmdigital/components';

function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Skip link for keyboard users */}
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>

      <main id="main-content">
        {/* Semantic headings with enforced hierarchy */}
        <Heading level={1}>Contact Us</Heading>
        
        <form>
          {/* Auto-generated labels, error states, ARIA */}
          <FormField
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            helpText="We'll never share your email."
            error={emailError}
          />

          <FormField
            label="Message"
            type="textarea"
            required
            minLength={10}
          />

          {/* Accessible button with loading state */}
          <Button 
            variant="primary" 
            type="submit"
            loading={isSubmitting}
          >
            Send Message
          </Button>
        </form>

        {/* Focus-trapped modal dialog */}
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Message Sent"
        >
          <p>Thank you! We'll respond within 24 hours.</p>
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Dialog>
      </main>
    </>
  );
}
```

### What's Handled Automatically

| Feature | Component | WCAG Criterion |
|---------|-----------|----------------|
| Focus trapping | `Dialog`, `Modal` | 2.4.3 |
| Escape to close | `Dialog`, `Modal` | 2.1.2 |
| Label association | `FormField` | 1.3.1 |
| Error announcement | `FormField` | 3.3.1 |
| Heading hierarchy | `Heading` | 1.3.1 |
| Skip navigation | `SkipLink` | 2.4.1 |
| Visible focus | All components | 2.4.7 |
| Color contrast | All components | 1.4.3 |

---

## The Development Story

### Why I Built This

I was working with a Swedish government agency that needed to prove compliance with DOS-lagen (Sweden's digital accessibility law). Standard tools gave them WCAG violations, but auditors wanted EN 301 549 clause references with Swedish legal context.

Existing solutions were either:
- **Too technical** (WCAG-only, no legal mapping)
- **Too expensive** (enterprise SaaS pricing)
- **Too manual** (consultants doing spreadsheet mappings)

### Architecture Decisions

**1. Monorepo Structure**

```
packages/
├── engine/      # Scanner + CLI (depends on standards)
├── standards/   # Regulatory database (no deps)
└── components/  # React UI library (no deps)
```

Each package is independently publishable but designed to work together.

**2. Build Tooling**

We use `tsup` for building because:
- Single config for CJS, ESM, and DTS
- Fast builds (Rollup under the hood)
- Tree-shakeable output

```typescript
// tsup.config.ts
export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true
}
```

**3. Exports Configuration**

A lesson learned the hard way — always put `types` first:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

If `types` comes after `import`, some bundlers won't find your TypeScript definitions.

**4. i18n Architecture**

All user-facing strings are externalized:

```typescript
// src/i18n/index.ts
import en from '../locales/en.json';
import sv from '../locales/sv.json';
// ... other locales

let currentLang = 'en';

export function setLanguage(lang: string) {
  if (locales[lang]) {
    currentLang = lang;
  }
}

export function t(key: string): string {
  return locales[currentLang][key] ?? key;
}
```

---

## Getting Started

### Install

```bash
# CLI scanning (no install needed)
npx hd-a11y-scan https://your-site.com

# For programmatic use
npm install @holmdigital/engine

# For React components
npm install @holmdigital/components

# For regulatory database only
npm install @holmdigital/standards
```

### Quick Integration Checklist

1. **Add CI scanning** to catch regressions
2. **Replace form components** with accessible versions
3. **Add skip links** for keyboard navigation
4. **Generate PDF reports** for compliance documentation

---

## What's Next

- [ ] Browser extension for on-page scanning
- [ ] VS Code extension for inline warnings
- [ ] More national regulations (Australia, India, Japan)
- [ ] Automated fix suggestions with code generation

---

## Resources

- **GitHub**: [github.com/holmdigital/a11y-hd](https://github.com/holmdigital/a11y-hd)
- **NPM**: 
  - [@holmdigital/engine](https://www.npmjs.com/package/@holmdigital/engine)
  - [@holmdigital/standards](https://www.npmjs.com/package/@holmdigital/standards)
  - [@holmdigital/components](https://www.npmjs.com/package/@holmdigital/components)

---

*Built with ❤️ by [Holm Digital](https://holmdigital.se) — Making accessibility compliance actually achievable.*

---

**Did you find this useful?** Drop a comment below or connect with me on [LinkedIn](https://linkedin.com/in/your-profile). I'd love to hear about your accessibility challenges!
