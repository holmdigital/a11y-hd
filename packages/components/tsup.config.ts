import { defineConfig } from 'tsup';

/**
 * Components package build config.
 *
 * Phase 23 (STY-02): migrated from inline `tsup` CLI in package.json to a
 * config file so we can declare CSS handling, externals, and entries
 * declaratively. Per-component CSS extraction (no `injectStyle`) is required
 * for the styling-unification work — each component ships a sibling .css
 * file alongside its .js/.mjs/.d.ts artifacts.
 */

const components = [
    'Button',
    'FormField',
    'Dialog',
    'Modal',
    'SkipLink',
    'NavigationMenu',
    'Checkbox',
    'RadioGroup',
    'Select',
    'Switch',
    'Toast',
    'Tooltip',
    'Heading',
    'AccessibilityStatement',
    'ErrorSummary',
    'Combobox',
    'DatePicker',
    'MultiSelect',
    'DataTable',
    'Pagination',
    'Card',
    'TreeView',
    'LiveRegion',
    'Tabs',
    'Accordion',
    'ProgressBar',
    'Skeleton',
    'HelpText',
    'Breadcrumbs',
];

export default defineConfig({
    entry: [
        'src/index.ts',
        ...components.map((c) => `src/${c}/${c}.tsx`),
    ],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: ['react', 'react-dom', '@holmdigital/standards'],
    // Explicit guard against future tsup default flips. CSS extraction
    // (separate sibling files) is required by Phase 23 styling unification.
    injectStyle: false,
    loader: { '.css': 'css' },
});
