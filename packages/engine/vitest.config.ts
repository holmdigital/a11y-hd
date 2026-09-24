import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
    define: {
        __ENGINE_VERSION__: JSON.stringify(pkg.version),
    },
    test: {
        globals: true,
        environment: 'node',
        // Intern #84: stoppa sviten om standards eller components är byggda
        // före sin senaste källändring, i stället för att testa ett gammalt bygge.
        globalSetup: ['./vitest.global-setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/cli/**']
        }
    }
});
