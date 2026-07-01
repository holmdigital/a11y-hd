import { defineConfig } from 'tsup';

/**
 * Standards package build config.
 *
 * Migrated from the inline `tsup src/index.ts --format cjs,esm --dts --clean`
 * CLI form to a config file so the DTS pass can carry `compilerOptions`.
 * tsup 8.x hardcodes deprecated `baseUrl` into the DTS rollup compilerOptions
 * (`baseUrl: compilerOptions.baseUrl || "."`), which TS6 flags as TS5101.
 * The silencer is scoped to the DTS pass only — placing `ignoreDeprecations`
 * in the shared tsconfig.base breaks `tsc --noEmit` typecheck (TS5103), since
 * that pass has no active deprecation to ignore.
 *
 * Tech debt: `baseUrl` stops functioning entirely in TS7. Remove this once
 * tsup stops injecting it or the DTS pipeline moves off rollup-plugin-dts.
 */
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
    clean: true,
});
