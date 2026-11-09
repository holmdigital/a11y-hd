/**
 * Intern #84: vägra testa motorn mot ett inaktuellt bygge av dess beroenden.
 *
 * Motorn löser `@holmdigital/standards` och `@holmdigital/components` genom
 * arbetsytans symlänkar till deras BYGGDA `dist/`, aldrig till källan och
 * inte till den publicerade versionen. Ingenting bygger dem före motorns
 * tester. 2026-09-24 gav det 122 röda tester lokalt medan CI, som alltid
 * bygger först, var grön: `dist/` var elva dagar äldre än datan, och
 * testerna jämförde dagens förväntningar med gårdagens paket.
 *
 * Det farliga är inte de röda testerna utan att de ser ut som motorfel. Den
 * här kontrollen körs före sviten och stoppar den med ett besked om vad som
 * ska byggas, i stället för att låta ett gammalt bygge ge falska svar åt
 * båda hållen. Den testar fortfarande det som levereras, alltså `dist/`.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGES = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Källkatalogerna som byggs in i paketets dist, per beroende. */
const DEPENDENCIES: Record<string, string[]> = {
    standards: ['src', 'data'],
    components: ['src'],
};

/** Filer som aldrig hamnar i dist; en ändring i dem kräver inget nytt bygge. */
const NOT_BUILT = /\.(test|spec|stories)\.[cm]?[tj]sx?$|__snapshots__|[\\/]_test[\\/]/;

function newestSource(dir: string): { file: string; mtimeMs: number } | null {
    if (!existsSync(dir)) return null;
    let newest: { file: string; mtimeMs: number } | null = null;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (NOT_BUILT.test(full)) continue;
        const candidate = entry.isDirectory()
            ? newestSource(full)
            : { file: full, mtimeMs: statSync(full).mtimeMs };
        if (candidate && (!newest || candidate.mtimeMs > newest.mtimeMs)) newest = candidate;
    }
    return newest;
}

export default function ensureFreshDependencies(): void {
    const problems: string[] = [];
    for (const [name, sources] of Object.entries(DEPENDENCIES)) {
        const built = join(PACKAGES, name, 'dist', 'index.mjs');
        if (!existsSync(built)) {
            problems.push(`@holmdigital/${name}: dist/ saknas`);
            continue;
        }
        const builtAt = statSync(built).mtimeMs;
        const newest = sources
            .map(s => newestSource(join(PACKAGES, name, s)))
            .reduce((a, b) => (b && (!a || b.mtimeMs > a.mtimeMs) ? b : a), null);
        if (newest && newest.mtimeMs > builtAt) {
            problems.push(
                `@holmdigital/${name}: ${relative(PACKAGES, newest.file).replace(/\\/g, '/')} är ändrad efter senaste bygget`
            );
        }
    }
    if (problems.length > 0) {
        throw new Error(
            'Motorns tester skulle köras mot ett inaktuellt bygge av sina beroenden (Intern #84):\n' +
            problems.map(p => `  - ${p}`).join('\n') +
            '\n\nBygg dem först, från repots rot:\n' +
            '  npm run build -w @holmdigital/standards -w @holmdigital/components\n'
        );
    }
}
