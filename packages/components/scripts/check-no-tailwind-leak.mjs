#!/usr/bin/env node
/**
 * STY-05 enforcement: ensure no Tailwind utility classes leak into the
 * compiled output of components that were migrated off Tailwind during
 * Phase 23 (styling unification).
 *
 * SCOPED to a deny-list of dist subdirectories — currently the three
 * components migrated by Plans 23-02..04 (Tabs, Accordion, Breadcrumbs).
 * This is intentional per A3 / D-05: STY-07 (full migration of remaining
 * components) is out of scope for Phase 23, and a tree-wide grep would
 * yield non-actionable failures from the still-Tailwindified components.
 *
 * EXTENDING: when a future plan migrates another component off Tailwind,
 * add its directory name to SCOPED_DIRS below. STY-07 (Phase 24+) will
 * eventually flip this to scan the entire dist/ once all components ship
 * .css siblings.
 *
 * BOOTSTRAP NOTE: Plan 23-01 introduces this script but does NOT yet
 * wire it into `test:ci`. The pre-migration tree HAS Tailwind in all 3
 * scoped dirs, so the guard is expected to exit non-zero against the
 * unmigrated tree. Plan 23-04 wires the guard into `test:ci` once
 * Plans 23-02..04 have each driven their dir's match count to 0.
 *
 * REGEX SCOPING: The Tailwind pattern is searched ONLY inside
 * `className: '...'` (compiled JSX) or `className="..."` (plain JSX)
 * contexts. A tree-wide unscoped grep produces hundreds of
 * false-positives from minified internal tokens that happen to match
 * Tailwind shorthand (e.g. `gap-` appearing inside an unrelated
 * minified identifier). Scoping reduces that to actionable hits.
 *
 * LAYOUT NOTE: Phase 23 Task 1 detected a NESTED tsup CSS layout
 * (`dist/<Name>/<Name>.{js,mjs,css}`). This script handles BOTH layouts
 * (nested and flat) so it remains valid even if tsup later flips its
 * default emission shape.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

/** Components migrated off Tailwind. Extend when STY-07 lands. */
const SCOPED_DIRS = ['Tabs', 'Accordion', 'Breadcrumbs'];

/**
 * Tailwind utility-class pattern. \b word-boundaries prevent partial
 * matches inside unrelated identifiers. Covers the utilities that
 * appeared in the Phase 22 components.
 */
const TAILWIND_PATTERN =
    /\b(?:flex|grid|text-slate|bg-white|bg-slate|hover:[\w-]+|focus:[\w-]+|focus-visible:[\w-]+|ring-[\w-]+|rounded-[\w-]+|border-slate|border-primary|space-y-[\w-]+|gap-[\w-]+|px-[\w-]+|py-[\w-]+|mx-[\w-]+|my-[\w-]+|leading-[\w-]+|font-[\w-]+)\b/;

/** Match `className: '...'`, `className="..."`, or `className: \`...\`` */
const CLASSNAME_CTX = /className\s*[:=]\s*(['"`])([\s\S]*?)\1/g;

if (!existsSync(DIST)) {
    console.log('[check-no-tailwind-leak] skipped — dist/ not built. Run `npm run build` first.');
    process.exit(0);
}

/**
 * Resolve the on-disk file paths to scan for a logical component name.
 * Handles both nested (`dist/Tabs/Tabs.js`) and flat (`dist/Tabs.js`) layouts.
 */
function filesForComponent(name) {
    const out = [];
    const nestedDir = join(DIST, name);
    if (existsSync(nestedDir) && statSync(nestedDir).isDirectory()) {
        for (const f of readdirSync(nestedDir)) {
            if (/\.(js|mjs)$/.test(f)) out.push(join(nestedDir, f));
        }
    }
    for (const ext of ['js', 'mjs']) {
        const flat = join(DIST, `${name}.${ext}`);
        if (existsSync(flat) && statSync(flat).isFile()) out.push(flat);
    }
    return out;
}

const offenders = [];
let scanned = 0;

for (const name of SCOPED_DIRS) {
    const files = filesForComponent(name);
    for (const file of files) {
        scanned++;
        const src = readFileSync(file, 'utf8');
        let m;
        const ctx = new RegExp(CLASSNAME_CTX.source, CLASSNAME_CTX.flags);
        while ((m = ctx.exec(src)) !== null) {
            const inner = m[2];
            const hit = inner.match(TAILWIND_PATTERN);
            if (hit) {
                const snippet = inner.length > 80 ? inner.slice(0, 77) + '...' : inner;
                offenders.push({
                    file: relative(process.cwd(), file),
                    token: hit[0],
                    snippet,
                });
            }
        }
    }
}

if (offenders.length) {
    console.error(`\n[check-no-tailwind-leak] ${offenders.length} Tailwind class leak(s) found in scoped dirs (${SCOPED_DIRS.join(', ')}):`);
    for (const o of offenders) {
        console.error(`  - ${o.file}: matched "${o.token}" in "${o.snippet}"`);
    }
    console.error(`\nScanned ${scanned} file(s). Replace Tailwind utility classes with hd-* CSS class names + sibling .css imports.`);
    process.exit(1);
}

console.log(`[check-no-tailwind-leak] ok — ${scanned} file(s) across ${SCOPED_DIRS.length} scoped dir(s) free of Tailwind utility leaks.`);
