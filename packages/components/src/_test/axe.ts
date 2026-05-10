/**
 * Centralised axe-core configuration for @holmdigital/components.
 *
 * Single helper exported: expectNoAxeViolations(container).
 * Per-test configureAxe calls are FORBIDDEN — see PITFALLS §1.4 and
 * 22-CONTEXT.md decision D-NoPerTestConfigureAxe.
 *
 * The 11 disabled rules below are jsdom-incompatible (no layout) or
 * page-level rules that do not apply to isolated-component tests.
 * Real-browser axe coverage is deferred to v0.7+.
 *
 * NOTE: @chialab/vitest-axe 0.19.x ships ONLY the toHaveNoViolations matcher
 * (default export of main entry). It does NOT export `configureAxe`/`axe`,
 * unlike `chaance/vitest-axe`. We therefore call `axe-core` directly here
 * with our rule overrides and feed the result into the matcher. See
 * 22-01-SUMMARY.md for the related matcher-import deviation note.
 */
import axe, { type AxeResults, type Spec, type RunOptions } from 'axe-core';
import { expect } from 'vitest';

const RULE_OVERRIDES: NonNullable<Spec['rules']> = [
    // jsdom returns empty computed styles — color-contrast cannot run.
    { id: 'color-contrast', enabled: false },
    // Page-chrome / landmark rules — component tests have no <main> etc.
    { id: 'region', enabled: false },
    { id: 'landmark-one-main', enabled: false },
    { id: 'landmark-complementary-is-top-level', enabled: false },
    { id: 'landmark-no-duplicate-banner', enabled: false },
    { id: 'landmark-no-duplicate-contentinfo', enabled: false },
    { id: 'landmark-unique', enabled: false },
    // Page-level skip-link / metadata rules.
    { id: 'bypass', enabled: false },
    { id: 'meta-viewport', enabled: false },
    { id: 'document-title', enabled: false },
    { id: 'html-has-lang', enabled: false },
];

// Apply rule overrides once at module load. axe.configure is idempotent for our flags.
axe.configure({ rules: RULE_OVERRIDES });

const RUN_OPTIONS: RunOptions = {
    // Belt-and-braces: also disable the same rules per-run, in case another
    // test file calls axe.configure with a fresh spec.
    rules: Object.fromEntries(RULE_OVERRIDES.map((r) => [r.id as string, { enabled: false }])),
};

/**
 * Assert the rendered container is free of axe-core violations
 * (excluding the 11 jsdom-incompatible / page-level rules above).
 */
export async function expectNoAxeViolations(container: HTMLElement): Promise<void> {
    if (!container || !(container instanceof HTMLElement)) {
        throw new Error('expectNoAxeViolations: container must be an HTMLElement');
    }
    const results: AxeResults = await axe.run(container, RUN_OPTIONS);
    expect(results).toHaveNoViolations();
}
