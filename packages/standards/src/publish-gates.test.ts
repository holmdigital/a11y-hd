import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

interface PkgJson {
    version: string;
    scripts: Record<string, string>;
    devDependencies?: Record<string, string>;
}

const VERIFY_ORDERED_CHAIN =
    'npm run build && npm run lint && npm run typecheck && npm run check:exports && npm run check:types && npm run test:ci';

function readPkg(relPath: string): PkgJson {
    const abs = join(__dirname, relPath);
    return JSON.parse(readFileSync(abs, 'utf-8')) as PkgJson;
}

function readChangelog(relPath: string): string {
    const abs = join(__dirname, relPath);
    return readFileSync(abs, 'utf-8');
}

describe('PUB-09 publish-gate drift guard', () => {
    describe('standards package — Task 33-01-01', () => {
        const pkg = readPkg('../../standards/package.json');

        it('standards typecheck script is exactly tsc --noEmit', () => {
            expect(pkg.scripts['typecheck']).toBe('tsc --noEmit');
        });

        it('standards verify script contains the full ordered chain', () => {
            const verify = pkg.scripts['verify'] ?? '';
            expect(verify).toContain(VERIFY_ORDERED_CHAIN);
        });

        it('standards prepublishOnly is exactly npm run verify', () => {
            expect(pkg.scripts['prepublishOnly']).toBe('npm run verify');
        });
    });

    describe('engine package — Task 33-02-02', () => {
        const pkg = readPkg('../../engine/package.json');

        it('engine typecheck script is exactly tsc --noEmit', () => {
            expect(pkg.scripts['typecheck']).toBe('tsc --noEmit');
        });

        it('engine verify script contains the full ordered chain', () => {
            const verify = pkg.scripts['verify'] ?? '';
            expect(verify).toContain(VERIFY_ORDERED_CHAIN);
        });

        it('engine prepublishOnly is exactly npm run verify', () => {
            expect(pkg.scripts['prepublishOnly']).toBe('npm run verify');
        });
    });

    describe('components package — Task 33-03-01', () => {
        const pkg = readPkg('../../components/package.json');

        it('components typecheck script is exactly tsc --noEmit', () => {
            expect(pkg.scripts['typecheck']).toBe('tsc --noEmit');
        });

        it('components verify script contains the full ordered chain', () => {
            const verify = pkg.scripts['verify'] ?? '';
            expect(verify).toContain(VERIFY_ORDERED_CHAIN);
        });

        it('components prepublishOnly is exactly npm run verify', () => {
            expect(pkg.scripts['prepublishOnly']).toBe('npm run verify');
        });

        it('components devDependencies includes @types/node pinned to ^22', () => {
            const typesNode = pkg.devDependencies?.['@types/node'] ?? '';
            expect(typesNode).toMatch(/^\^22/);
        });
    });

    describe('CHANGELOG durable history — Task 33-04-02', () => {
        it('standards CHANGELOG has a ## 2.5.2 section containing PUB-09', () => {
            const cl = readChangelog('../../standards/CHANGELOG.md');
            const idx = cl.indexOf('## 2.5.2');
            expect(idx).toBeGreaterThan(-1);
            // Find the next ## heading after ## 2.5.2 to scope the section
            const afterHeading = cl.slice(idx);
            const nextHeading = afterHeading.indexOf('\n## ', 1);
            const section = nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
            expect(section).toContain('PUB-09');
        });

        it('components CHANGELOG has a ## 2.6.1 section containing PUB-09', () => {
            const cl = readChangelog('../../components/CHANGELOG.md');
            const idx = cl.indexOf('## 2.6.1');
            expect(idx).toBeGreaterThan(-1);
            const afterHeading = cl.slice(idx);
            const nextHeading = afterHeading.indexOf('\n## ', 1);
            const section = nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
            expect(section).toContain('PUB-09');
        });

        it('engine CHANGELOG has a ## 2.5.3 section containing PUB-09', () => {
            const cl = readChangelog('../../engine/CHANGELOG.md');
            const idx = cl.indexOf('## 2.5.3');
            expect(idx).toBeGreaterThan(-1);
            const afterHeading = cl.slice(idx);
            const nextHeading = afterHeading.indexOf('\n## ', 1);
            const section = nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
            expect(section).toContain('PUB-09');
        });
    });
});
