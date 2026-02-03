# 🤖 Automating Regulatory Compliance: Beyond Basic Linting

*Subtitle: How we built `@holmdigital/engine` to handle complex EU legal frameworks automatically.*

---

**Summary:**  
Standard accessibility tools (Lighthouse, axe-core) find violations but lack legal context. This article explains how `@holmdigital/engine` maps technical failures to specific legal risks (WAD vs. EAA) and how developers can integrate this into their CI/CD pipelines.

---

### The Problem with Generic Scanners

Most developers use tools like Lighthouse. They are great, but they tell you:
> *"Button needs a name."*

They **don't** tell you:
> *"This violates EN 301 549 Clause 9.1.2.1, which mandatory for your Public Sector Client in Sweden under DOS-lagen, carrying a risk of daily fines."*

Context matters. Prioritization matters.

### Enter the Regulatory Engine

We built `@holmdigital/engine` to bridge the gap between code and law. It’s not just a scanner; it’s a compliance officer in your terminal.

#### 1. Smart Classification
The engine distinguishes between **WAD** (Public Sector) and **EAA** (Private Sector) rules.

```typescript
// Example: Engine Output
{
  "violation": "button-name",
  "impact": "critical",
  "legalContext": {
    "wad": { "applicable": true, "law": "DOS-lagen (SE)" },
    "eaa": { "applicable": true, "law": "LPTT (SE)", "deadline": "2025-06-28" }
  }
}
```

#### 2. The "Deadline Watch"
We flagged rules that are critical for the upcoming EAA 2025 deadline. If your build fails on these, you aren't just shipping a bug; you're shipping a legal liability.

### How to Implement It (CI/CD Recipe)

Stop relying on manual testing before launch. Catch issues on every commit.

**GitHub Actions Example:**

```yaml
  - name: Legal Compliance Scan
    run: npx @holmdigital/engine scan --url https://staging.myapp.com --threshold 90
    env:
      SECTOR: private # Activates EAA logic
```

### Visualizing the Data

We map violations to a visual hierarchy to help stakeholders understand "where we bleed."

```ascii
[ Compliance Score: 82/100 ] 🟡
----------------------------------------
HTML Structure   [████████░░] 80% (Minor issues)
Keyboard Nav     [████░░░░░░] 40% (CRITICAL FAIL)
Contrast         [██████████] 100%
----------------------------------------
⚖️  Legal Risk: HIGH (Keyboard Nav blocks EAA compliance)
```

### Conclusion

Compliance isn't about checking boxes; it's about engineering quality. By treating accessibility rules as strict as type definitions, we build software that is robust, legal, and inclusive by default.

---

*Tags: #DevOps #CICD #Accessibility #TypeScript #Automation #HolmDigital*
