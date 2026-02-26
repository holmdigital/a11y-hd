# Coding Conventions

**Analysis Date:** 2026-02-26

## Naming Patterns

**Files:**
- Components: PascalCase directory and file matching component name (e.g., `packages/components/src/Button/Button.tsx`)
- Engine modules: kebab-case (e.g., `packages/engine/src/reporting/badge-generator.ts`, `packages/engine/src/cli/cloud-client.ts`)
- Test files: co-located with source, suffix `.test.ts` or `.test.tsx` (e.g., `packages/engine/src/cli/cloud-client.test.ts`)
- Type definition files: `types.ts` in package `src/` root (e.g., `packages/standards/src/types.ts`)
- Index/barrel files: `index.ts` at package root (e.g., `packages/components/src/index.ts`)

**Functions:**
- Use camelCase for all functions: `generateBadgeUrl`, `transformToCloudPayload`, `getEN301549Mapping`
- Prefix getters with `get`: `getConvergenceRule`, `getDatabaseStats`, `getCurrentLang`
- Prefix boolean checks with `is`: `isValidUrl`, `isWCAGCriteriaSupported`
- Generator functions prefixed with `generate`: `generateRegulatoryReport`, `generateJUnitXML`, `generateStatement`
- Setter functions prefixed with `set`: `setLanguage`

**Variables:**
- Use camelCase for local variables: `scanResult`, `pageTitle`, `complianceLevel`
- Use UPPER_SNAKE_CASE for module-level constants: `BADGE_COLOR`, `BADGE_BASE_URL`, `ENGINE_VERSION`, `ENFORCEMENT_BODIES`

**Types/Interfaces:**
- Use PascalCase for all types and interfaces: `ScanResult`, `CloudPayload`, `ConvergenceRule`
- Interface props suffixed with `Props`: `ButtonProps`, `DialogProps`, `FormFieldProps`
- Type unions for string literals: `type WCAGLevel = 'A' | 'AA' | 'AAA'`
- Context types suffixed with `ContextType`: `AccordionContextType`, `ToastContextType`

**React Components:**
- Use PascalCase: `Button`, `FormField`, `AccessibilityStatement`
- Always set `displayName` on `forwardRef` components: `Button.displayName = 'Button'`
- Sub-components use parent prefix: `AccordionItem`, `AccordionTrigger`, `AccordionContent`

## Code Style

**Formatting:**
- Prettier v3.4.2 is listed as a devDependency (no `.prettierrc` config file found -- uses defaults)
- Default Prettier: 2-space indentation, double quotes, semicolons, trailing commas
- Actual codebase uses 4-space indentation in most files and single quotes for imports

**Linting:**
- ESLint v9 with flat config at `eslint.config.mjs`
- TypeScript-ESLint parser and plugin
- Key rules:
  - `@typescript-eslint/no-explicit-any`: `"warn"` (not error -- `any` is tolerated with suppression comments)
  - `@typescript-eslint/no-unused-vars`: `"warn"` with `argsIgnorePattern: "^_"` (prefix unused args with `_`)
- Ignores: `**/dist/**`, `**/node_modules/**`, `**/coverage/**`

**TypeScript:**
- Strict mode enabled globally in `tsconfig.base.json`
- Key strict settings: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Target: ES2022, Module: ESNext, ModuleResolution: bundler
- Declaration maps and source maps enabled for debugging

## Import Organization

**Order:**
1. React imports (`import React, { useState, useEffect } from 'react'`)
2. External library imports (`import axeCore from 'axe-core'`, `import chalk from 'chalk'`)
3. Internal monorepo imports (`import { RegulatoryReport } from '@holmdigital/standards'`)
4. Relative imports (`import { VirtualDOMBuilder } from './virtual-dom'`)
5. JSON/data imports (`import rulesEn from '../data/rules.en.json'`)

**Path Aliases:**
- Monorepo packages use npm workspace names: `@holmdigital/standards`, `@holmdigital/engine`, `@holmdigital/components`
- No path aliases (like `@/`) are configured in tsconfig

**Type Imports:**
- Use `import type` for type-only imports: `import type { ScanResult } from '../core/regulatory-scanner'`
- Re-export types with `export type { ... }` in barrel files (see `packages/standards/src/index.ts`)

## Component Patterns

**React Components (packages/components):**

Use `forwardRef` for all functional components that render DOM elements:
```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', ...props }, ref) => {
        return <button ref={ref} {...props}>{children}</button>;
    }
);
Button.displayName = 'Button';
```

Use `interface` extending native HTML element attributes for props:
```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
}
```

Compound components use React Context pattern:
```tsx
const AccordionContext = createContext<AccordionContextType | undefined>(undefined);
// Provider wraps children, consumers use useContext
```

**Styling approaches (mixed):**
- Some components use inline styles with JS objects (`packages/components/src/Button/Button.tsx`, `packages/components/src/FormField/FormField.tsx`)
- Some components use Tailwind CSS class strings (`packages/components/src/Dialog/Dialog.tsx`, `packages/components/src/Toast/Toast.tsx`, `packages/components/src/Accordion/Accordion.tsx`)
- Use inline styles for accessibility-critical styles (contrast, touch target sizes)
- Use Tailwind for layout and visual styling

**Class Pattern (packages/engine):**
- Scanner and builder modules use classes: `RegulatoryScanner`, `VirtualDOMBuilder`, `HtmlValidator`, `PseudoAutomationEngine`
- Classes use private fields and methods: `private browser`, `private log()`
- Constructor accepts options/config objects with defaults via spread

## Error Handling

**Patterns:**

Return result objects for async operations (success/failure without throwing):
```typescript
// Pattern from cloud-client.ts
export interface CloudResponse {
    success: boolean;
    message?: string;
    error?: string;
}

async function sendToCloud(...): Promise<CloudResponse> {
    try {
        // ... operation
        return { success: true, message: data.message };
    } catch (error) {
        return { success: false, error: `Could not connect...` };
    }
}
```

Throw errors for unrecoverable failures:
```typescript
if (!this.browser) throw new Error('Browser not initialized');
```

User-friendly error messages in CLI with pattern matching:
```typescript
if (errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
    console.error(chalk.red(`Error: Could not resolve domain for '${url}'`));
}
```

Return `null` for "not found" lookups (no exceptions):
```typescript
export function getConvergenceRule(ruleId: string): ConvergenceRule | null {
    return getData(lang).find((r) => r.ruleId === ruleId) || null;
}
```

Fallback chain pattern for file/resource resolution:
```typescript
const possiblePaths = [path1, path2, path3];
for (const p of possiblePaths) {
    try { /* load */ break; } catch { continue; }
}
```

## Logging

**Framework:** `console` for engine internals; `chalk` + `ora` for CLI output

**Patterns:**
- Use `console.log` for debug/info output, wrapped in a `silent` check:
  ```typescript
  private log(message: string) {
      if (!this.options.silent) { console.log(message); }
  }
  ```
- Use `console.warn` for non-fatal warnings (e.g., unsupported language fallback)
- Use `console.error` for error output in CLI
- Use `ora` spinner for long-running operations in CLI
- Use `chalk` for colored terminal output (blue for headers, red for errors, green for success, gray for info)

## Comments

**When to Comment:**
- Module-level JSDoc block describing purpose (often in Swedish): `/** Regulatory Scanner - Karnan i @holmdigital/engine... */`
- WCAG/EN 301 549 compliance annotations on components explaining which criteria are met
- Inline comments for non-obvious logic (retry loops, scoring algorithms, fallback chains)
- `// eslint-disable-next-line` with rule name when suppressing linting

**JSDoc/TSDoc:**
- Use JSDoc `/** ... */` for exported functions with `@param` and `@returns` annotations (see `packages/engine/src/reporting/badge-generator.ts`)
- Use `@default` in interface properties for default values
- Use `@example` for usage demonstrations in component docs (see `LiveRegion`)

**Language:**
- Comments mix Swedish and English throughout the codebase
- Swedish predominates in engine core code (regulatory-scanner.ts, virtual-dom.ts)
- English used in newer modules and public-facing documentation
- New code should use English for comments

## Function Design

**Size:** Most utility functions are 5-30 lines. Larger methods (e.g., `scan()` at ~90 lines, CLI action at ~300 lines) exist but are the exception.

**Parameters:**
- Use options objects for functions with 3+ parameters: `ScannerOptions`, `VirtualDOMConfig`, `StatementMetadata`
- Use positional parameters for simple functions: `generateBadgeUrl(score: number)`
- Default parameter values: `lang: string = 'en'`

**Return Values:**
- Return `null` for "not found" (never `undefined`)
- Return result objects `{ success, message, error }` for async operations
- Return `Promise<T>` for async functions (never callbacks)

## Module Design

**Exports:**
- Named exports only (no default exports except ESLint config)
- Barrel files (`index.ts`) re-export everything from sub-modules
- Separate `export type { ... }` blocks for type-only re-exports

**Barrel Files:**
- `packages/components/src/index.ts`: `export * from './Button/Button'` pattern for all components
- `packages/engine/src/index.ts`: Selective re-exports from core modules
- `packages/standards/src/index.ts`: Functions + type re-exports

**Package Exports:**
- Dual format: CJS (`.js`) + ESM (`.mjs`) via tsup
- Type declarations (`.d.ts`) generated alongside
- Subpath exports in package.json for tree-shaking individual components

---

*Convention analysis: 2026-02-26*
