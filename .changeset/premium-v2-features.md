---
"@holmdigital/engine": minor
"@holmdigital/components": minor
"@holmdigital/standards": minor
---

# 🚀 Release Overview: Premium Ecosystem & Nordic Expansion

This release marks a major evolution of the HolmDigital Accessibility Ecosystem, transitioning from a technical scanner to a full-scale regulatory compliance suite.

## ⚖️ Standards & Legal Database (National Laws)
- **Nordic Expansion**: Added full support for **Norway (Forskrift om universell utforming)**, **Finland (Laki digitaalisten palvelujen)**, and **Denmark (Lov om tilgængelighed)**.
- **National Law Mapping**: New database for 12+ countries mapping WCAG to specific national legislations and enforcement bodies (e.g., Digg in SE, Traficom in FI).
- **Sanctions & Enforcement**: Integrated data on legal sanctions and maximum fines for non-compliance across EU/Nordic regions.
- **Statement Tools**: Registry of official national accessibility statement generators.

## 🚂 Engine: CI/CD & Reporting
- **Premium V2 Statements**: Complete overhaul of the accessibility statement generator with glassmorphism card design, embedded Lucide-style icons, and micro-animations.
- **Automatic Badge**: Sites with 100% compliance now automatically trigger a green Shields.io badge in the CLI and reports.
- **GitHub Actions Integration**: Added native output formatting for GitHub Actions summary pages.
- **JUnit Reporting**: Support for standard JUnit XML output for CI/CD dashboards (GitLab, Azure DevOps).
- **Expanded CLI**: New flags for `--publish-date`, `--org`, `--response-time`, and `--country`.
- **New Locales**: Added `no`, `fi`, `da` (and `nb`, `dk` aliases) for all engine outputs and statements.

## 🧱 Components: Prescriptive UI
- **29+ Accessible Components**: Full library includes `DataTable`, `Combobox`, `TreeView`, `DatePicker`, `MultiSelect`, `NavigationMenu`, and more.
- **Compliant by Default**: Built-in ARIA management, focus traps, and WCAG AAA contrast patterns.
- **Premium V2 Statement Component**: The `AccessibilityStatement` component now supports rich metadata for multi-company deployments.

## 📚 Documentation
- **Centralized Docs**: Moved all package-specific guides to a structured root `/docs` directory.
- **New Guides**: Added "EU Legal Framework", "Nordic Authorities", and "CI/CD Integration" master guides.
