#!/usr/bin/env node
/**
 * D-03a enforcement: every *.test.tsx under packages/components/src/*
 * MUST contain the literal marker `WCAG SCs covered:` within the
 * first 30 lines. Fails the build with a non-zero exit code listing
 * any offenders so CI pipelines surface them in the same step.
 *
 * Excludes: src/_test/** (helper meta-tests are not component tests).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MARKER = 'WCAG SCs covered:';
const HEADER_LINES = 30;

function walk(dir, acc = []) {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) {
            if (full.includes(`${sep}_test`) || full.includes('/_test')) continue;
            walk(full, acc);
        } else if (name.endsWith('.test.tsx')) {
            acc.push(full);
        }
    }
    return acc;
}

const files = walk(ROOT);
const offenders = [];
for (const file of files) {
    const head = readFileSync(file, 'utf8').split(/\r?\n/).slice(0, HEADER_LINES).join('\n');
    if (!head.includes(MARKER)) offenders.push(relative(process.cwd(), file));
}

if (offenders.length) {
    console.error(`\n[check-wcag-headers] ${offenders.length} test file(s) missing "${MARKER}" in first ${HEADER_LINES} lines:`);
    for (const o of offenders) console.error('  - ' + o);
    console.error('\nAdd the JSDoc header documented in packages/components/TESTING-CONVENTIONS.md (Section 2).');
    process.exit(1);
}
console.log(`[check-wcag-headers] ok — ${files.length} test file(s) all carry the marker.`);
