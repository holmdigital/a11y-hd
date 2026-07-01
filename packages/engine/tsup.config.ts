import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['cjs', 'esm'],
  // tsup 8.x injects deprecated `baseUrl` into the DTS rollup compilerOptions,
  // which TS6 flags as TS5101. Silence it on the DTS pass only (see components
  // tsup.config.ts for the full rationale). Keeping it out of tsconfig.base
  // avoids breaking `tsc --noEmit` typecheck with TS5103. Tech debt: baseUrl
  // dies in TS7 — revisit when tsup stops injecting it.
  dts:
    process.env.TSUP_NO_DTS !== '1'
      ? { compilerOptions: { ignoreDeprecations: '6.0' } }
      : false,
  clean: true,
  shims: true,
  define: {
    __ENGINE_VERSION__: JSON.stringify(pkg.version),
  },
});
