# Changelog

All notable changes to HolmDigital packages are documented here.

## [0.3.1] - 2025-12-11

### @holmdigital/engine
- **Added**: `--lang` CLI option for language selection (en, sv, de, fr, es)
- **Added**: `--generate-tests` option for Playwright test script generation
- **Added**: `silent` option to RegulatoryScanner for clean JSON output
- **Fixed**: Invalid URL error handling with user-friendly messages
- **Fixed**: DNS resolution failure error handling
- **Fixed**: JSON output now clean without debug messages

### @holmdigital/standards
- **Fixed**: Type exports for `ConvergenceRule` and `EAAImpact`

### Documentation
- **Added**: GitHub Package Registry installation instructions to all READMEs
- **Added**: Prerequisites section to wiki Installation page
- **Updated**: CI/CD examples with authentication setup
- **Updated**: Main website opensource page with installation guide
- **Enhanced**: Analyspaket cards with detailed feature lists

---

## [0.3.0] - 2025-12-10

### @holmdigital/engine
- **Added**: HTML validation using `html-validate`
- **Added**: Structural HTML issues detection in CLI output
- **Added**: PDF report generation via `--pdf` flag
- **Added**: Viewport testing support (`--viewport`)
- **Added**: Multi-language support (5 languages)

### @holmdigital/standards
- **Added**: Complete rule translations for German, French, Spanish
- **Added**: ICT manual checklist data
- **Updated**: Swedish legal references (removed DOS-lagen specific text)

---

## [0.2.2] - 2025-12-09

### @holmdigital/engine
- Initial public release
- Regulatory scanning with axe-core integration
- WCAG → EN 301 549 → DOS-lagen mapping
- CLI tool (`hd-a11y-scan`)

### @holmdigital/standards
- Initial public release
- 50+ accessibility rules with regulatory mapping
- Swedish DIGG risk levels

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 0.3.1 | 2025-12-11 | CLI improvements, error handling, documentation |
| 0.3.0 | 2025-12-10 | HTML validation, localization, PDF reports |
| 0.2.2 | 2025-12-09 | Initial public OSS release |
