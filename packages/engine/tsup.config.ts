import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['cjs', 'esm'],
  dts: process.env.TSUP_NO_DTS !== '1',
  clean: true,
  shims: true,
  define: {
    __ENGINE_VERSION__: JSON.stringify(pkg.version),
  },
});
