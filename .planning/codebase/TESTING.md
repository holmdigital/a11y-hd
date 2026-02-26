# Testing Patterns

**Analysis Date:** 2026-02-26

## Test Framework

**Runner:**
- Vitest v4.0.16
- Config: `packages/engine/vitest.config.ts` (only engine has explicit config)
- Components and standards packages use Vitest defaults (no config file)

**Assertion Library:**
- Vitest built-in `expect` (Chai-compatible API)

**Run Commands:**
```bash
npm test                              # Run all tests across workspaces
npm test -w @holmdigital/engine       # Run engine tests (watch mode)
npm test -w @holmdigital/components   # Run component tests (watch mode)
npm test -w @holmdigital/standards    # Run standards tests (watch mode)
npm run test:ci                       # Run all tests once (no watch)
npm run test:ci -w @holmdigital/engine # Run engine tests once
```

## Test File Organization

**Location:**
- Co-located with source files (test files sit next to the code they test)

**Naming:**
- `{filename}.test.ts` for TypeScript modules
- `{filename}.test.tsx` for React components
- Examples:
  - `packages/engine/src/cli/cloud-client.test.ts` tests `cloud-client.ts`
  - `packages/components/src/LiveRegion/LiveRegion.test.tsx` tests `LiveRegion.tsx`
  - `packages/components/src/index.test.ts` tests barrel exports
  - `packages/standards/src/index.test.ts` tests standards API

**Structure:**
```
packages/engine/src/
  cli/
    cloud-client.ts
    cloud-client.test.ts       # Co-located
  i18n/
    index.ts
    index.test.ts              # Co-located
  reporting/
    badge-generator.ts
    badge-generator.test.ts    # Co-located
    junit-generator.ts
    junit-generator.test.ts    # Co-located

packages/components/src/
  index.ts
  index.test.ts                # Barrel export test
  LiveRegion/
    LiveRegion.tsx
    LiveRegion.test.tsx         # Co-located component test

packages/standards/src/
  index.ts
  index.test.ts                # API surface test
```

## Test Structure

**Suite Organization:**
```typescript
// Standard pattern: import from vitest, describe/it blocks
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { functionUnderTest } from './module';

describe('ModuleName', () => {
    // Optional setup/teardown
    beforeEach(() => {
        // Reset state
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Nested describe for grouping related tests
    describe('functionName', () => {
        it('should do expected behavior', () => {
            const result = functionUnderTest(input);
            expect(result).toBe(expectedOutput);
        });

        it('should handle edge case', () => {
            // ...
        });
    });
});
```

**Patterns:**
- Use `describe` blocks to group by function/feature name
- Use nested `describe` for sub-features (see `packages/engine/src/cli/cloud-client.test.ts` with `describe('transformToCloudPayload')` and `describe('sendToCloud')`)
- Use `beforeEach` to reset state (language, mocks)
- Use `afterEach` with `vi.restoreAllMocks()` when mocking
- Test descriptions use `should` prefix: `'should transform ScanResult to CloudPayload format'`
- `it` blocks are self-contained; each test sets up its own data

## Vitest Configuration

**Engine package** (`packages/engine/vitest.config.ts`):
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

**Component tests** use per-file environment override:
```typescript
// @vitest-environment jsdom
```
This comment at the top of `.test.tsx` files switches to jsdom for DOM testing. See `packages/components/src/LiveRegion/LiveRegion.test.tsx`.

## Mocking

**Framework:** Vitest built-in `vi` mock utilities

**Global Mock Pattern (fetch):**
```typescript
// Mock fetch globally for HTTP client tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('cloud-client', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should send POST request', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Success' })
        });

        await sendToCloud(config, mockResult);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://cloud.test.com/api/v1/ingest',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': 'test-api-key' }
            })
        );
    });
});
```

**Timer Mocking (for animations/timeouts):**
```typescript
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

it('clears message after timeout', () => {
    const { container } = render(<LiveRegion message="Temporary" clearAfter={1000} />);
    expect(container.textContent).toBe('Temporary');

    act(() => {
        vi.advanceTimersByTime(1000);
    });

    expect(container.textContent).toBe('');
});
```

**What to Mock:**
- Global `fetch` for HTTP client tests
- Timers (`vi.useFakeTimers()`) for timeout-dependent behavior
- External services (network, browser automation) -- not directly tested

**What NOT to Mock:**
- Internal module logic (standards database lookups, data transformations)
- React component rendering (use actual render via @testing-library/react)
- JSON data files (tested with real data)

## Fixtures and Factories

**Test Data:**
```typescript
// Inline mock data objects, defined at describe block level or per-test
const mockResult: ScanResult = {
    url: 'https://example.com',
    timestamp: '2024-01-01T00:00:00Z',
    reports: [],
    stats: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
    score: 100,
    complianceStatus: 'PASS'
};

// For variations, use spread:
const failureResult: ScanResult = {
    ...mockResult,
    reports: [{ /* violation data */ }],
    stats: { ...mockResult.stats, total: 1, critical: 1 }
};
```

**Location:**
- No separate fixture files or factory functions exist
- Test data is defined inline within test files
- Complex objects are built at `describe` scope and spread-modified per test

## Coverage

**Requirements:** "100% coverage for compliance logic" (stated in `CONTRIBUTING.md`, not enforced in CI config)

**Configuration:**
- Coverage provider: `v8`
- Coverage reporters: `text`, `json`, `html`
- Coverage excludes: test files and CLI module (`src/cli/**`)
- Only configured in engine package

**View Coverage:**
```bash
npx vitest run --coverage -w @holmdigital/engine  # Generate coverage report
```

## Test Types

**Unit Tests:**
- All existing tests are unit tests
- Test individual exported functions in isolation
- Test data transformations (e.g., `transformToCloudPayload`)
- Test error handling paths (401, 403, network errors)
- Test i18n lookups and fallbacks
- Test report generation (badge URLs, JUnit XML, statements)

**Integration Tests:**
- Engine has an integration test config: `vitest.integration.config.ts` (referenced in `package.json` scripts as `test:integration`)
- Run command: `npm run test:integration -w @holmdigital/engine`
- No integration test files were found in the source

**Component Tests:**
- React component tests using `@testing-library/react` with `jsdom` environment
- Test rendering, props behavior, ARIA attributes, and timer-based state changes
- Only `LiveRegion` has a component test; other 20+ components lack tests

**E2E Tests:**
- Not used directly, but the engine generates Playwright test scripts via `PseudoAutomationEngine`

## Common Patterns

**Async Testing:**
```typescript
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
it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const response = await sendToCloud(config, mockResult);

    expect(response.success).toBe(false);
    expect(response.error).toContain('Could not connect');
});
```

**React Component Testing:**
```typescript
// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

it('renders with correct ARIA attributes', () => {
    const { container } = render(<LiveRegion message="Test" />);
    const region = container.firstChild as HTMLElement;
    expect(region.getAttribute('aria-live')).toBe('polite');
});
```

**Barrel Export Testing:**
```typescript
it('should export all components', () => {
    const exports = Object.keys(Components);
    expect(exports).toContain('Button');
    expect(exports).toContain('Dialog');
    expect(exports.length).toBeGreaterThan(10);
});
```

**Data Validation Testing:**
```typescript
it('should retrieve database stats', () => {
    const stats = getDatabaseStats('en');
    expect(stats.totalRules).toBeGreaterThan(0);
    expect(stats.rulesByLevel.A).toBeGreaterThan(0);
});
```

## Test Gaps

**Major gaps (no tests):**
- `packages/engine/src/core/regulatory-scanner.ts` - Core scanning logic (requires browser mocking)
- `packages/engine/src/core/virtual-dom.ts` - Virtual DOM builder
- `packages/engine/src/core/html-validator.ts` - HTML validation wrapper
- `packages/engine/src/reporting/html-template.ts` - HTML report generation
- `packages/engine/src/reporting/pdf-generator.ts` - PDF generation
- `packages/engine/src/reporting/statement-generator.ts` - Statement generation
- `packages/engine/src/reporting/github-actions.ts` - GitHub Actions annotations
- `packages/engine/src/automation/pseudo-automation.ts` - Test script generation
- `packages/engine/src/cli/index.ts` - CLI entry point
- 20+ React components in `packages/components/src/` (only LiveRegion and index have tests)

**Total test files:** 7 across the entire monorepo
- Engine: 4 test files (`cloud-client`, `i18n`, `badge-generator`, `junit-generator`)
- Components: 2 test files (`index`, `LiveRegion`)
- Standards: 1 test file (`index`)

---

*Testing analysis: 2026-02-26*
