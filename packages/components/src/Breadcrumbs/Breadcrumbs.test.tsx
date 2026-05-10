/**
 * Breadcrumbs smoke tests — STY-01, STY-03, STY-04, STY-06.
 *
 * WCAG SCs covered:
 * - 2.4.7 Focus Visible — smoke test asserts :focus-visible style hook is present in Breadcrumbs.css
 * - 2.4.8 Location — aria-current="page" verification on the last item
 * - 1.3.1 Info and Relationships — semantic nav + ol structure
 *
 * Scope: minimal smoke tests for Phase 23 styling migration. Full Tier 1+2
 * test suite deferred to Phase 24 (per CONTEXT and RESEARCH Open Q #2).
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Breadcrumbs.css style hooks', () => {
    const cssPath = resolve(__dirname, 'Breadcrumbs.css');
    const css = readFileSync(cssPath, 'utf8');

    it('declares a :focus-visible rule (STY-04 / WCAG 2.4.7)', () => {
        expect(css).toMatch(/:focus-visible\s*\{/);
    });

    it('exposes CSS custom-property theming surface (STY-03)', () => {
        expect(css).toMatch(/var\(--hd-breadcrumbs-/);
    });

    it('targets the current page via [aria-current="page"] attribute selector (current-page hook regression guard)', () => {
        expect(css).toMatch(/\[aria-current=["']page["']\]/);
    });
});

describe('Breadcrumbs semantics', () => {
    it('renders a nav with aria-label="Breadcrumb" and marks the last item as aria-current="page"', () => {
        render(
            <Breadcrumbs>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
                <BreadcrumbItem>Current</BreadcrumbItem>
            </Breadcrumbs>
        );
        const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
        expect(nav).toBeInTheDocument();

        const current = screen.getByText('Current').closest('li')!;
        expect(current).toHaveAttribute('aria-current', 'page');
    });
});

describe('Breadcrumbs className passthrough (STY-06)', () => {
    it('merges consumer className with the default hd-breadcrumbs class', () => {
        render(
            <Breadcrumbs className="custom-nav-class">
                <BreadcrumbItem>One</BreadcrumbItem>
            </Breadcrumbs>
        );
        const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
        expect(nav.className).toContain('hd-breadcrumbs');
        expect(nav.className).toContain('custom-nav-class');
    });
});
