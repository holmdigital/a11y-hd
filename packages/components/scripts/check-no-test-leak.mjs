#!/usr/bin/env node
/**
 * PUB-05 enforcement: ensure no test-framework code leaks into the
 * compiled output of @holmdigital/components.
 *
 * Scans `dist/**\/*.{js,mjs}` for tight, import-statement-shaped patterns
 * that can only appear in actual test code — never in JSDoc prose or
 * minified internal identifiers. Patterns are deliberately narrower than
 * bare-token grep would be (per Phase 26 researcher Area 6):
 *
 *   - `from 'vitest'`           — vitest import
 *   - `from '@testing-library/` — RTL family imports
 *   - `vi.mock(`                — vitest mock call (always parens-attached)
 *   - top-level `describe(...)` / `it(...)` — never appears in valid prose
 *
 * REGEX RATIONALE: by anchoring on `from '<framework>'` or `vi.mock(` we
 * cannot fire on a JSDoc comment that mentions "vitest" or "describe"
 * narratively. The describe/it patterns require leading whitespace + string
 * literal so a sentence ending in "describe the API" cannot match.
 *
 * COVERAGE: scans ALL of dist/ (not scoped) — a test leak is a regression
 * at any path. Mirrors the `check-no-tailwind-leak.mjs` skeleton (Phase 23
 * STY-05) and `check-wcag-headers.mjs` (Phase 22) for consistency.
 *
 * SKIP BEHAVIOR: if `dist/` does not exist, exits 0 with a "skipped"
 * message so the chain stays green when the build artifact is absent
 * (mirrors the Phase 23 STY-05 bootstrap pattern).
 *
 * EXIT CODES:
 *   0 — no offenders OR dist/ missing (skipped)
 *   1 — one or more test-code leaks found in dist/
 *
 * REF: .planning/phases/26-publish-hygiene/26-RESEARCH.md Area 6
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

/**
 * Tight, import-statement-shaped patterns. Each pattern is constructed so
 * that it CANNOT appear in valid JSDoc prose or minified identifiers.
 */
const PATTERNS = [
    { name: 'vitest-import',          re: /from\s+['"]vitest['"]/ },
    { name: 'testing-library-import', re: /from\s+['"]@testing-library\// },
    { name: 'vi.mock call',           re: /\bvi\.mock\s*\(/ },
    { name: 'top-level describe',     re: /^\s*describe\s*\(\s*['"]/m },
    { name: 'top-level it',           re: /^\s*it\s*\(\s*['"]/m },
];

if (!existsSync(DIST)) {
    console.log('[check-no-test-leak] skipped — dist/ not built. Run `npm run build` first.');
    process.exit(0);
}

/** Recursively collect all .js / .mjs files under dist/. */
function walk(dir, acc = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, acc);
        } else if (/\.(js|mjs)$/.test(entry.name)) {
            acc.push(full);
        }
    }
    return acc;
}

const files = walk(DIST);
const offenders = [];

for (const file of files) {
    const src = readFileSync(file, 'utf8');
    for (const { name, re } of PATTERNS) {
        const hit = src.match(re);
        if (hit) {
            const idx = hit.index ?? 0;
            const snippetRaw = src.slice(idx, idx + 80).replace(/\s+/g, ' ').trim();
            const snippet = snippetRaw.length > 80 ? snippetRaw.slice(0, 77) + '...' : snippetRaw;
            offenders.push({
                file: relative(process.cwd(), file),
                pattern: name,
                snippet,
            });
        }
    }
}

if (offenders.length) {
    console.error(`\n[check-no-test-leak] ${offenders.length} test-code leak(s) found in dist/:`);
    for (const o of offenders) {
        console.error(`  - ${o.file}: ${o.pattern} — "${o.snippet}"`);
    }
    console.error(`\nFix: check tsup.config.ts entry globs exclude *.test.* and *.stories.*.`);
    process.exit(1);
}

console.log(`[check-no-test-leak] ok — ${files.length} dist file(s) free of test-code imports.`);
