# Manager's Guide to Digital Accessibility Compliance

> **Executive Summary:** Digital accessibility is no longer optional. With the **European Accessibility Act (EAA)** entering force in **June 2025**, private companies face the same strict requirements as the public sector. Non-compliance risks significant fines (up to €1M or daily fines) and repetitional damage.

## 1. The Legal Landscape (Simplified)

There are two main regulations you need to care about:

| Regulation | Target Group | Deadline | Key Consequence |
| :--- | :--- | :--- | :--- |
| **WAD** (Web Accessibility Directive) | Public Sector & Gov. Bodies | **Active Now** | Monitoring by Digg/others. Public "shaming". |
| **EAA** (European Accessibility Act) | **Private Sector** (E-commerce, Banking, Transport, Services) | **June 28, 2025** | **Fines & Sanctions**. Products can be pulled from the market. |

### ⚠️ Risk Assessment
Ignoring these regulations carries three types of risk:
1.  **Legal/Financial:** Direct fines. In Sweden, up to 10M SEK. In Ireland, up to €60k and imprisonment.
2.  **Market Access:** Non-compliant products can be banned from the EU market.
3.  **Brand:** Exclusion of 15-20% of the population (people with disabilities).

## 2. Action Plan: Getting Ready for 2025

To ensure compliance by the deadline, adopt this timeline:

### Phase 1: Assessment (Now)
- [ ] **Audit current assets:** Scan public websites and apps using `@holmdigital/engine`.
- [ ] **Identify "EAA Scope":** Which parts of your service are "core" (e.g., checkout flow, login, critical docs)?
- [ ] **Publish Statement:** Even if not perfect, publish an Accessibility Statement (use `@holmdigital/components`). Transparency reduces legal risk.

### Phase 2: Remediation (Q1-Q3)
- [ ] **Fix Critical Blockers:** Keyboard navigation, screen reader compatibility, contrast.
- [ ] **Train Teams:** Ensure designers and developers understand WCAG 2.1 AA.
- [ ] **Update Procurement:** Require accessibility compliance from all new vendors/SaaS tools.

### Phase 3: Validation (Q4 - Launch)
- [ ] **User Testing:** Test critical flows with people with disabilities.
- [ ] **Final Compliance Scan:** Ensure automated score is >90.
- [ ] **Freeze & Maintain:** Implement CI/CD checks to prevent regression.

## 3. Checklist for Procurement

When buying software or hiring agencies, ask these questions:

*   *"Can you provide a VPAT or ACR (Accessibility Conformance Report)?"*
*   *"Who is responsible if the delivered code violates WCAG 2.1 AA?"*
*   *"Do you test with assistive technology (Screen readers, Voice control)?"*

## 4. How HolmDigital Helps

Our toolstack aligns directly with this strategy:
*   **Standards Package:** Automatic awareness of daily fines and deadlines.
*   **Engine:** Finds technical violations automatically.
*   **Components:** Pre-built, accessible UI elements to speed up remediation.
