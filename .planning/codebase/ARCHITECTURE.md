# ARCHITECTURE

Date: 2026-05-12

## System Design
The repository is a monorepo containing a cohesive accessibility compliance ecosystem:
- **`@holmdigital/standards`**: The single source of truth for legal and technical accessibility requirements (WCAG, EN301549, local laws).
- **`@holmdigital/components`**: A prescriptive React UI kit that implements the standards out of the box. 
- **`@holmdigital/engine`**: An evaluation engine and CLI (`hd-a11y-scan`) that tests HTML against the standards.

## Data Flow
- `standards` provides JSON definitions mapped to interfaces.
- `engine` loads definitions from `standards`, drives a headless browser via `puppeteer`, runs `axe-core`, and validates DOM structure. It generates reports in various formats (JUnit, HTML, PDF, Markdown).
- `components` use definitions from `standards` to ensure interactive elements meet expected WCAG SCs out of the box.

## Boundaries
- The engine uses a virtual DOM layer (`virtual-dom.ts`) to manage evaluations independently of the browser environment.
- The CLI acts as the primary entry point for consumers wanting to run accessibility scans against local or remote environments.
