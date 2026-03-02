# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**
- Vitest v4.0.16 (declared in root `package.json` devDependencies)
- Engine config: `packages/engine/vitest.config.ts`
- Components and Standards: No package-level vitest config -- inherit from root or run via `vitest` command directly

**Assertion Library:**
- Vitest built-in `expect` (Chai-compatible matchers)
- Common matchers used: `toBe`, `toBeNull`, `toBeDefined`, `toContain`, `toHaveLength`, `toBeGreaterThan`, `toHaveBeenCalledWith`

**Run Commands:**
```bash
npm run test                    # Run all tests across all workspaces
npm run test:ci                 # Run all tests once (no watch) across all workspaces
npm run test -w @holmdigital/engine      # Run engine tests only
npm run test -w @holmdigital/components  # Run components tests only
npm run test -w @holmdigital/standards   # Run standards tests only
```

**Per-package commands:**
```bash
cd packages/engine && npx vitest        # Watch mode for engine
cd packages/engine && npx vitest run    # Single run for engine
```

## Test File Organization

**Location:**
- Co-located with source files (tests live next to the code they test)
- `packages/engine/src/i18n/index.test.ts` tests `packages/engine/src/i18n/index.ts`
- `packages/engine/src/reporting/badge-generator.test.ts` tests `packages/engine/src/reporting/badge-generator.ts`
- `packages/components/src/LiveRegion/LiveRegion.test.tsx` tests `packages/components/src/LiveRegion/LiveRegion.tsx`

**Naming:**
- `{source-file}.test.ts` for TypeScript tests
- `{Component}.test.tsx` for React component tests
- No `.spec.ts` files currently exist (though the vitest config includes them)

**Structure:**
```
packages/engine/src/
  cli/
    cloud-client.ts
    cloud-client.test.ts
  i18n/
    index.ts
    index.test.ts
  reporting/
    badge-generator.ts
    badge-generator.test.ts
    junit-generator.ts
    junit-generator.test.ts

packages/components/src/
  index.ts
  index.test.ts
  LiveRegion/
    LiveRegion.tsx
    LiveRegion.test.tsx

packages/standards/src/
  index.ts
  index.test.ts
```

## Test Structure

**Suite Organization:**
- Top-level `describe` named after the module/function being tested
- Nested `describe` blocks for grouping related behavior
- `it` blocks with descriptive names starting with "should"

```typescript
// Pattern from packages/engine/src/i18n/index.test.ts
describe('i18n', () => {
    beforeEach(() => {
        setLanguage('en');
    });

    describe('setLanguage', () => {
        it('should set language to English', () => {
            setLanguage('en');
            expect(getCurrentLang()).toBe('en');
        });

        it('should fallback to English for unknown language', () => {
            setLanguage('xx');
            expect(getCurrentLang()).toBe('en');
        });
    });

    describe('t', () => {
        it('should translate simple key', () => { ... });
        it('should interpolate parameters', () => { ... });
        it('should return key if not found', () => { ... });
    });
});
```

**Patterns:**
- `beforeEach` for resetting state between tests (e.g., resetting language to `'en'`)
- `afterEach` for cleanup (e.g., `vi.restoreAllMocks()`, `vi.useRealTimers()`)
- Vitest globals enabled in engine config: `globals: true` (allows `describe`, `it`, `expect` without import)
- However, tests still explicitly import from `vitest` for clarity: `import { describe, it, expect } from 'vitest'`

## Vitest Configuration

**Engine (`packages/engine/vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/cli/**']
        }
    }
});
```

**Components:**
- No dedicated vitest config file
- Uses `// @vitest-environment jsdom` pragma at the top of `.test.tsx` files for DOM testing
- Depends on `jsdom` (v28.0.0) and `@testing-library/react` (v16.3.2)

**Standards:**
- No dedicated vitest config file
- Tests run with default node environment

## Mocking

**Framework:** Vitest's built-in `vi` module

**Global Mock Pattern (fetch):**
```typescript
// Pattern from packages/engine/src/cli/cloud-client.test.ts
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('cloud-client', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should send POST request with correct headers', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Success' })
        });

        await sendToCloud(config, mockResult);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://cloud.test.com/api/v1/ingest',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'test-api-key'
                }
            })
        );
    });
});
```

**Fake Timers Pattern:**
```typescript
// Pattern from packages/components/src/LiveRegion/LiveRegion.test.tsx
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

it('clears the message after specified timeout', () => {
    const { container } = render(<LiveRegion message="Temporary" clearAfter={1000} />);
    expect(container.textContent).toBe('Temporary');

    act(() => {
        vi.advanceTimersByTime(1000);
    });

    expect(container.textContent).toBe('');
});
```

**What to Mock:**
- Global APIs (`fetch`) for network requests
- Timers for time-dependent behavior

**What NOT to Mock:**
- Internal module logic (standards database, i18n translations)
- Pure transformation functions (badge generation, XML generation, payload transformation)
- React component rendering (use `@testing-library/react` instead)

## React Component Testing

**Library:** `@testing-library/react` v16.3.2

**Environment:** jsdom (set via pragma `// @vitest-environment jsdom`)

**Pattern:**
```typescript
// Pattern from packages/components/src/LiveRegion/LiveRegion.test.tsx
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveRegion } from './LiveRegion';

describe('LiveRegion', () => {
    it('renders a polite live region by default', () => {
        const { container } = render(<LiveRegion />);
        const region = container.firstChild as HTMLElement;
        expect(region.getAttribute('aria-live')).toBe('polite');
    });

    it('updates the announcement when message prop changes', () => {
        const { rerender, container } = render(<LiveRegion message="" />);
        rerender(<LiveRegion message="Hello World" />);
        expect(container.textContent).toBe('Hello World');
    });
});
```

**Key testing-library methods used:**
- `render()` for initial rendering
- `rerender()` for prop change testing
- `container` for direct DOM queries (rather than `screen` queries in this codebase)
- `act()` for wrapping state updates (timer advances)

## Fixtures and Factories

**Test Data:**
- Inline mock objects defined directly in test files (no shared fixture files)
- `ScanResult` mock object pattern used in multiple test files:

```typescript
// Pattern from packages/engine/src/reporting/junit-generator.test.ts
const mockResult: ScanResult = {
    url: 'https://example.com',
    timestamp: '2026-02-08T01:51:29Z',
    metadata: {
        engineVersion: '1.4.7',
        axeCoreVersion: '4.10.2',
        standardsVersion: '1.2.2',
        scanDuration: 1500,
        pageTitle: 'Example',
        pageLanguage: 'en'
    },
    reports: [],
    stats: {
        passed: 42,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0
    },
    score: 100,
    complianceStatus: 'PASS'
};
```

- Spread operator for variations: `{ ...mockResult, score: 85, complianceStatus: 'FAIL' }`
- `as any` cast used for partial mock data (where full interface compliance is not needed for the test)

**Location:**
- No shared fixtures directory -- all test data is inline in test files
- No factory functions -- objects are constructed directly

## Coverage

**Requirements:** No enforced minimum coverage threshold

**Provider:** v8 (configured in engine's vitest.config.ts)

**Reporters:** text, json, html

**Coverage Exclusions:**
- Test files: `src/**/*.test.ts`, `src/**/*.spec.ts`
- CLI code: `src/cli/**` (excluded from engine coverage)

**View Coverage:**
```bash
cd packages/engine && npx vitest run --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and modules
- All current tests are unit tests
- Test pure transformations: badge URL generation, JUnit XML generation, payload transformation
- Test state management: language setting, translation lookup
- Test error paths: unknown language fallback, invalid scores, network errors, auth failures
- Test React component rendering: ARIA attributes, prop updates, timer behavior

**Integration Tests:**
- Config exists for engine: `vitest.integration.config.ts` (referenced in `packages/engine/package.json` script)
- Run command: `npm run test:integration -w @holmdigital/engine`
- No integration test files found in current codebase

**E2E Tests:**
- Not present in the codebase
- Pseudo-automation engine (`packages/engine/src/automation/pseudo-automation.ts`) generates Playwright test scripts but does not run them

**Storybook Visual Testing:**
- Storybook v10.2.4 configured with `@storybook/addon-a11y` in `packages/components/.storybook/main.ts`
- No `.stories.tsx` files exist yet (configured to look for `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`)

## Common Patterns

**Async Testing:**
```typescript
// Pattern from packages/engine/src/cli/cloud-client.test.ts
it('should return success on 200 response', async () => {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Results saved' })
    });

    const response = await sendToCloud(config, mockResult);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Results saved');
});
```

**Error Testing:**
```typescript
// Pattern from packages/engine/src/cli/cloud-client.test.ts
it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const response = await sendToCloud(config, mockResult);

    expect(response.success).toBe(false);
    expect(response.error).toContain('Could not connect');
});

it('should handle 401 authentication error', async () => {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
    });

    const response = await sendToCloud(config, mockResult);

    expect(response.success).toBe(false);
    expect(response.error).toContain('Authentication failed');
});
```

**Null Return Testing:**
```typescript
// Pattern from packages/engine/src/reporting/badge-generator.test.ts
it('should return null for score < 100', () => {
    const url = generateBadgeUrl(99);
    expect(url).toBeNull();
});
```

**Export Verification Testing:**
```typescript
// Pattern from packages/components/src/index.test.ts
it('should export all components', () => {
    const exports = Object.keys(Components);
    expect(exports).toContain('Button');
    expect(exports).toContain('Dialog');
    expect(exports.length).toBeGreaterThan(10);
});
```

**Data-Driven Testing (informal):**
```typescript
// Pattern from packages/standards/src/index.test.ts
it('should get rules by WAD framework', () => {
    const rules = getRulesByFramework('WAD');
    expect(rules.length).toBeGreaterThan(0);
    const colorContrast = rules.find(r => r.ruleId === 'color-contrast');
    expect(colorContrast).toBeDefined();
});
```

## Current Test Inventory

| Package | Test Files | Test Count (approx) |
|---------|-----------|---------------------|
| `packages/engine` | 4 files | ~25 tests |
| `packages/components` | 2 files | ~10 tests |
| `packages/standards` | 1 file | ~15 tests |
| **Total** | **7 files** | **~50 tests** |

**Test files:**
- `packages/engine/src/cli/cloud-client.test.ts` - Cloud API integration (9 tests)
- `packages/engine/src/i18n/index.test.ts` - i18n language/translation (9 tests)
- `packages/engine/src/reporting/badge-generator.test.ts` - Badge generation (4 tests)
- `packages/engine/src/reporting/junit-generator.test.ts` - JUnit XML output (3 tests)
- `packages/components/src/index.test.ts` - Export verification (3 tests)
- `packages/components/src/LiveRegion/LiveRegion.test.tsx` - LiveRegion component (5 tests)
- `packages/standards/src/index.test.ts` - Standards API (14 tests)

## Adding New Tests

**For a new engine module at `packages/engine/src/{area}/{module}.ts`:**
1. Create `packages/engine/src/{area}/{module}.test.ts`
2. Import from `vitest`: `import { describe, it, expect } from 'vitest'`
3. Import the module under test
4. Use `describe('{module-name}', () => { ... })` structure
5. Tests will be auto-discovered by vitest include pattern `src/**/*.test.ts`

**For a new React component at `packages/components/src/{Component}/{Component}.tsx`:**
1. Create `packages/components/src/{Component}/{Component}.test.tsx`
2. Add `// @vitest-environment jsdom` pragma as the first line
3. Import from `@testing-library/react` and `vitest`
4. Test ARIA attributes, keyboard interactions, and prop behavior
5. Use fake timers if testing time-dependent behavior

**For new standards API functions:**
1. Add tests to `packages/standards/src/index.test.ts`
2. Follow the existing pattern of testing against real data (not mocks)
3. Use `toBeGreaterThan(0)` for collection queries, `toBeDefined()` for lookups

---

*Testing analysis: 2026-03-02*
