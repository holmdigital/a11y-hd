/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — unsubstituted `{<...>}` placeholders break programmatic determination of statement metadata
 * - 3.3.2 Labels or Instructions — `[YOUR PUBLISH DATE]` placeholder signals required configuration; fabricated 2024-01-01 fallback would mislead consumers
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { AccessibilityStatement } from './AccessibilityStatement';

const SRC_ROOT = join(__dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '_test', 'dist']);

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        if (SKIP_DIRS.has(entry)) continue;
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            collectSourceFiles(full, acc);
            continue;
        }
        if (!stat.isFile()) continue;
        if (entry.endsWith('.test.ts')) continue;
        if (entry.endsWith('.test.tsx')) continue;
        if (entry.endsWith('.regression.test.tsx')) continue;
        if (entry.endsWith('.stories.tsx')) continue;
        if (!entry.endsWith('.ts') && !entry.endsWith('.tsx')) continue;
        acc.push(full);
    }
    return acc;
}

describe('AccessibilityStatement regression guards', () => {
    it('STMT-02: no literal 2024-01-01 in component source', () => {
        const files = collectSourceFiles(SRC_ROOT);
        const offenders: string[] = [];
        for (const file of files) {
            const contents = readFileSync(file, 'utf8');
            if (contents.includes("'2024-01-01'")) {
                offenders.push(relative(SRC_ROOT, file));
            }
        }
        expect(
            offenders,
            `Found '2024-01-01' literal in: ${offenders.join(', ')}. ` +
                `This is the publishDate fallback bug — replace with '[YOUR PUBLISH DATE]'.`,
        ).toEqual([]);
    });

    it('STMT-03: country=US never emits {<national_law>} placeholder', () => {
        const baseProps = {
            country: 'US' as const,
            organizationName: 'Test Org',
            websiteUrl: 'https://test.example.com',
            complianceLevel: 'partial' as const,
            lastReviewDate: new Date('2024-01-15'),
            contactEmail: 'test@example.com',
        };

        // public sector — Title II branch
        const { container: publicContainer } = render(
            <AccessibilityStatement {...baseProps} sector="public" />,
        );
        expect(publicContainer.innerHTML).not.toContain('{<national_law>}');
        expect(publicContainer.innerHTML).not.toMatch(/\{<[^>]+>\}/);

        // private sector — Title III + REHAB Section 504 branch (commit 859f301 + v2.5.1)
        const { container: privateContainer } = render(
            <AccessibilityStatement {...baseProps} sector="private" />,
        );
        expect(privateContainer.innerHTML).not.toContain('{<national_law>}');
        expect(privateContainer.innerHTML).not.toMatch(/\{<[^>]+>\}/);
    });
});
