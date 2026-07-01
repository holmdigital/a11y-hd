import { defineConfig } from 'tsup';

/**
 * Components package build config.
 *
 * Phase 23 (STY-02): migrated from inline `tsup` CLI in package.json to a
 * config file so we can declare CSS handling, externals, and entries
 * declaratively. Per-component CSS extraction (no `injectStyle`) is required
 * for the styling-unification work — each component ships a sibling .css
 * file alongside its .js/.mjs/.d.ts artifacts.
 *
 * Phase 26 (PUB-05): replaced the hand-maintained 30-item `components` array
 * with a glob entry list. New components dropped into `src/<Name>/<Name>.tsx`
 * are picked up automatically; `*.test.*`, `*.stories.*`, and `_test/`
 * artifacts are excluded via `!`-prefix negation. Per Phase 26 researcher
 * §5, the `!`-prefix form is the safer choice over extglob `!(...)`
 * because globby/tsup support it universally across versions. Also added
 * `lucide-react` to `external` so its source is never inlined into a
 * component bundle (forward-compat with Plan 26-04's optional-peer move).
 */

export default defineConfig({
    // Glob entries auto-discover new components and exclude tests/stories per PUB-05.
    // Underscore-prefixed dirs (_hooks, _test, _i18n) are internal helpers — they
    // should be bundled into the components that import them, not emitted as
    // standalone entries. locale-chrome.ts inside AccessibilityStatement is a
    // co-located helper for the same reason: it must remain inlined, not split out
    // as a public subpath.
    entry: [
        'src/index.ts',
        'src/*/*.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.stories.{ts,tsx}',
        '!src/_test/**',
        '!src/_hooks/**',
        '!src/_i18n/**',
        '!src/AccessibilityStatement/locale-*.{ts,tsx}',
        '!src/DatePicker/date-utils.ts',
    ],
    format: ['cjs', 'esm'],
    // tsup 8.x hardcodes deprecated `baseUrl` into the DTS rollup compilerOptions
    // (rollup.js: `baseUrl: compilerOptions.baseUrl || "."`), which TS6 flags as
    // TS5101. Scope the silencer to the DTS pass only — putting it in the shared
    // tsconfig.base breaks `tsc --noEmit` typecheck (TS5103) because that pass has
    // no active deprecation to ignore. Tech debt: baseUrl dies in TS7; remove this
    // once tsup stops injecting it or the DTS pipeline moves off rollup-plugin-dts.
    dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
    clean: true,
    external: ['react', 'react-dom', '@holmdigital/standards', 'lucide-react'],
    // Explicit guard against future tsup default flips. CSS extraction
    // (separate sibling files) is required by Phase 23 styling unification.
    injectStyle: false,
    loader: { '.css': 'css' },
});
