---
"@holmdigital/engine": minor
"@holmdigital/components": minor
"@holmdigital/standards": minor
---

# Accessibility Statement Enhancements

Significant improvements to the accessibility statement generation system:

- **Multi-Language Support**: Added comprehensive support for 9 European languages (EN, SV, NO, DA, FI, NL, DE, FR, ES).
- **Externalized Templates**: Templates are now managed as separate JSON files in `@holmdigital/engine`, allowing for professional legal phrasing and easier localization.
- **Enhanced Component**: Refactored the `AccessibilityStatement` component in `@holmdigital/components` to support template-driven rendering, localized date formatting, and automatic icon mapping for all supported languages.
- **Centralized Enforcement Data**: Moved regulatory authority data to `@holmdigital/standards` for consistent use across all packages.
- **Improved Substitution Logic**: Built-in support for conditional blocks and choice strings in both HTML and Markdown outputs.
- **Hardened JUnit Generation**: Enhanced the JUnit XML reporter to include rich metadata properties, successful test case counts, and detailed failure information (DOM targets and HTML snippets) in `<system-out>` blocks for better CI diagnostics.
