# Coding Conventions

**Analysis Date:** 2026-02-26

## Naming Patterns

**Files:**
- Component files: PascalCase matching the component name (`Button.tsx`, `FormField.tsx`, `LiveRegion.tsx`)
- Non-component TypeScript files: kebab-case (`badge-generator.ts`, `cloud-client.ts`, `html-validator.ts`, `regulatory-scanner.ts`)
- Test files: Co-located with source, same name with `.test.ts` or `.test.tsx` suffix (`badge-generator.test.ts`, `LiveRegion.test.tsx`)
- Type definition files: `types.ts` in the package's `src/` root
- JSON data files: kebab-case with language suffix (`rules.en.json`, `rules.sv.json`, `ict-manual-checks.json`)
- Each component lives in its own PascalCase directory: `src/Button/Button.tsx`, `src/Dialog/Dialog.tsx`

**Functions:**
- Use camelCase for all functions: `generateBadgeUrl`, `setLanguage`, `transformToCloudPayload`
- Prefix boolean getters with `is`: `isValidUrl`, `isWCAGCriteriaSupported`
- Prefix retrieval functions with `get`: `getEN301549Mapping`, `getDOSLagenReference`, `getCurrentLang`
- Use `generate` prefix for output-producing functions: `generateRegulatoryReport`, `generateJUnitXML`, `generateStatementContent`

**Variables:**
- camelCase for all variables: `currentLang`, `nodeIdCounter`, `complianceLevel`
- UPPER_SNAKE_CASE for module-level constants: `BADGE_COLOR`, `BADGE_BASE_URL`, `ENGINE_VERSION`, `ENFORCEMENT_BODIES`
- Prefix private class fields with no underscore (TypeScript `private` keyword instead): `private browser`, `private options`

**Types & Interfaces:**
- PascalCase for all types and interfaces: `ScanResult`, `CloudPayload`, `ConvergenceRule`
- Interface names describe the shape, no `I` prefix: `ScannerOptions` not `IScannerOptions`
- Props interfaces named `{Component}Props`: `ButtonProps`, `DialogProps`, `FormFieldProps`, `LiveRegionProps`
- Union literal types for constrained strings: `type WCAGLevel = 'A' | 'AA' | 'AAA'`, `type DiggRisk = 'low' | 'medium' | 'high' | 'critical'`
- Export types separately using `export type { ... }` syntax in `packages/standards/src/index.ts`

**React Components:**
- Named exports, not default exports: `export const Button = ...`
- Use `forwardRef` for interactive elements: `Button`, `FormField`, `Dialog`, `Checkbox`
- Always set `displayName`: `Button.displayName = 'Button'`
- Use `React.FC<Props>` for simpler components without ref forwarding: `ErrorSummary`, `LiveRegion`

## Code Style

**Formatting:**
- Prettier v3.4.2 (declared in root `package.json` devDependencies)
- No `.prettierrc` configuration file detected -- uses Prettier defaults
- Default: 2-space indentation (visible in all source files)
- Single quotes for strings in TypeScript source
- Semicolons required (visible in all source files)
- Trailing commas in multi-line constructs

**Linting:**
- ESLint v9.17.0 with flat config (`eslint.config.mjs`)
- Extends: `@eslint/js` recommended + `@typescript-eslint` recommended rules
- Custom overrides:
  - `@typescript-eslint/no-explicit-any`: `"warn"` (not error -- `any` is used in several places)
  - `@typescript-eslint/no-unused-vars`: `"warn"` with `argsIgnorePattern: "^_"` (prefix unused params with `_`)
- Ignores: `**/dist/**`, `**/node_modules/**`, `**/coverage/**`
- Parser: `@typescript-eslint/parser` targeting ECMAScript 2022
- Globals: both `browser` and `node` environments

**TypeScript:**
- Strict mode enabled in `tsconfig.base.json`
- Target: ES2022, Module: ESNext, ModuleResolution: bundler
- `noUnusedLocals: true`, `noUnusedParameters: true`, `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `declaration: true`, `declarationMap: true`, `sourceMap: true`
- Tests excluded from compilation: `**/*.test.ts`, `**/*.spec.ts`

## Import Organization

**Order:**
1. Node.js built-in modules (`node:fs`, `node:path`, `node:url`)
2. External dependencies (`react`, `puppeteer`, `axe-core`, `commander`, `chalk`)
3. Internal monorepo packages (`@holmdigital/standards`, `@holmdigital/components`)
4. Relative imports (`./index`, `../core/regulatory-scanner`, `../i18n`)

**Path Aliases:**
- No path aliases configured -- all imports use relative paths or package names
- Cross-package imports use npm workspace package names: `@holmdigital/standards`, `@holmdigital/components`

**Import Style:**
- Named imports preferred: `import { describe, it, expect } from 'vitest'`
- Namespace imports for barrel re-exports: `import * as Components from './index'`
- Type-only imports used sparingly: `import type { ScanResult } from '../core/regulatory-scanner'`
- Dynamic imports used for optional/lazy-loaded modules: `await import('@holmdigital/standards')`, `await import('../reporting/junit-generator')`

## Error Handling

**Patterns:**
- Return result objects with `success/error` fields for async operations (see `packages/engine/src/cli/cloud-client.ts`):
  ```typescript
  interface CloudResponse {
      success: boolean;
      message?: string;
      error?: string;
  }
  ```
- Return `null` for "not found" instead of throwing: `getConvergenceRule()`, `generateBadgeUrl()`, `getNordicAuthority()`
- Try-catch with user-friendly error messages in CLI (`packages/engine/src/cli/index.ts`):
  ```typescript
  if (errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
      console.error(chalk.red(`Error: Could not resolve domain for '${url}'`));
  }
  ```
- Retry logic for network operations (3 retries with 2s delay in `packages/engine/src/core/regulatory-scanner.ts`)
- `finally` blocks for resource cleanup (browser closing in `RegulatoryScanner.scan()`)
- Graceful fallbacks: unknown languages fall back to English, missing templates try multiple paths

**Error Reporting:**
- `console.warn` for non-fatal issues (unsupported language, missing logo)
- `console.error` with `chalk.red()` for fatal CLI errors
- `process.exit(1)` only in CLI for critical compliance failures or unrecoverable errors

## Logging

**Framework:** `console` (no logging framework)

**CLI-Specific:**
- `ora` spinner for progress indication in CLI
- `chalk` for colored terminal output
- Silent mode: `this.log()` wrapper in `RegulatoryScanner` suppresses output when `options.silent` is true (for `--json` mode)
- Pattern: wrap console calls in conditional: `if (!options.json) { console.log(...) }`

**Patterns:**
- Use `console.warn()` for non-critical warnings (language fallback, missing files)
- Use `console.log()` for informational output (scan progress)
- Use `console.error()` for error conditions
- No structured logging -- all output is human-readable strings

## Comments

**When to Comment:**
- File-level JSDoc comment explaining the module's purpose (present in most source files)
- Swedish comments are common throughout the codebase alongside English, reflecting the Swedish origin of the project:
  ```typescript
  // Kärnan i @holmdigital/engine som kombinerar teknisk scanning med regulatorisk data
  // Navigera till URL (med retry logic)
  ```
- Inline comments explain "why" not "what" for non-obvious logic
- `// TODO:` used sparingly for known incomplete implementations

**JSDoc/TSDoc:**
- JSDoc on all exported functions in `packages/standards/src/index.ts`:
  ```typescript
  /**
   * Get EN 301 549 mapping for a WCAG criteria
   */
  export function getEN301549Mapping(wcagCriteria: string, lang: string = 'en'): ...
  ```
- JSDoc on component props with `@default` values:
  ```typescript
  /**
   * Visuell variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  ```
- Component-level JSDoc documenting which WCAG criteria the component satisfies:
  ```typescript
  /**
   * Regulatoriskt Kompatibel Knapp
   * Uppfyller:
   * - WCAG 1.4.3 (Kontrast)
   * - WCAG 2.1.1 (Tangentbordsåtkomst)
   * ...
   */
  ```
- `@example` tags in some component docs (`LiveRegion.tsx`)

## Function Design

**Size:**
- Utility functions are small and focused (5-30 lines): `generateBadgeUrl`, `escapeXML`, `isValidUrl`
- Class methods are moderate (20-80 lines): `scan()`, `enrichResults()`
- CLI action handler is the largest function (~340 lines in `packages/engine/src/cli/index.ts`) -- monolithic

**Parameters:**
- Use options objects for functions with many parameters: `ScannerOptions`, `VirtualDOMConfig`
- Default parameter values preferred over overloads: `lang: string = 'en'`
- Spread `...props` pattern for component rest props: `{ children, variant, ...props }`

**Return Values:**
- Functions return explicit types: `Promise<ScanResult>`, `string | null`, `ConvergenceRule[]`
- Nullable returns use `| null` not `| undefined`: `getConvergenceRule(): ConvergenceRule | null`
- Async functions always return Promises explicitly

## Module Design

**Exports:**
- Barrel files (`index.ts`) re-export from all modules:
  - `packages/components/src/index.ts`: `export * from './Button/Button'` (one per component)
  - `packages/engine/src/index.ts`: `export * from './core/regulatory-scanner'` (selective)
- Type exports separated: `export type { ConvergenceRule, ... }` in `packages/standards/src/index.ts`
- Named exports only -- no default exports anywhere in the codebase

**Barrel Files:**
- `packages/components/src/index.ts`: Re-exports all 28+ components
- `packages/engine/src/index.ts`: Re-exports core scanner, virtual-dom, pseudo-automation, i18n, and statement generator
- `packages/standards/src/index.ts`: Both function exports and type re-exports from `types.ts`

## React Component Patterns

**Component Structure (for new components, follow this pattern):**
1. Imports (React first, then external, then internal)
2. Props interface with JSDoc on each prop
3. Component-level JSDoc documenting WCAG criteria compliance
4. `forwardRef` wrapper (for interactive elements) or `React.FC` (for non-interactive)
5. Internal logic (state, refs, effects)
6. Inline styles as JS objects (NOT CSS-in-JS libraries)
7. JSX return with ARIA attributes
8. `displayName` assignment after component definition

**Styling Approach:**
- Mixed strategy: inline `style` objects for `packages/components` core behavior (Button, FormField, ErrorSummary)
- Tailwind CSS class strings for visual styling in Dialog, Checkbox, Select
- Some components use both simultaneously (Checkbox)
- All components ensure minimum 44px touch targets (EN 301 549 9.2.5.5)

**Accessibility Patterns:**
- Every interactive component has appropriate ARIA attributes
- `aria-live` regions for dynamic content announcements
- `aria-invalid`, `aria-describedby`, `aria-required` on form fields
- `aria-labelledby`, `aria-describedby` for dialogs
- `aria-haspopup`, `aria-expanded` for dropdown triggers
- `role="alert"` for error messages
- `role="listbox"` and `role="option"` for custom selects
- Visually hidden text using clip-rect technique for screen reader only content
- Focus management: `tabIndex={-1}` with programmatic `.focus()` for error summaries

---

*Convention analysis: 2026-02-26*
