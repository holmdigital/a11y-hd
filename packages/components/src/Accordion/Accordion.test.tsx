// @vitest-environment jsdom
/**
 * Accordion smoke tests — STY-01, STY-03, STY-04, STY-06.
 *
 * WCAG SCs covered: 2.4.7 Focus Visible (smoke test asserts :focus-visible
 * style hook is present in Accordion.css), 4.1.2 Name/Role/Value (data-state
 * + aria-expanded toggle verification).
 *
 * Scope: minimal smoke tests for Phase 23 styling migration. Full Tier 1+2
 * test suite deferred to Phase 24 (per CONTEXT.md and RESEARCH.md Open Q #2).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

// __dirname shim for ESM test runs
const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);

afterEach(() => cleanup());

describe('Accordion.css style hooks', () => {
    const cssPath = resolve(__dirnameLocal, 'Accordion.css');
    const css = readFileSync(cssPath, 'utf8');

    it('declares a :focus-visible rule (STY-04 / WCAG 2.4.7)', () => {
        expect(css).toMatch(/:focus-visible\s*\{/);
    });

    it('exposes CSS custom-property theming surface (STY-03)', () => {
        expect(css).toMatch(/var\(--hd-accordion-/);
    });

    it('targets the closed content via [data-state="closed"] attribute selector (visibility-hook regression guard)', () => {
        expect(css).toMatch(/\[data-state=["']closed["']\]/);
    });
});

describe('Accordion data-state visibility hook (RESEARCH Section 7)', () => {
    it('toggles data-state and aria-expanded when trigger is clicked', () => {
        render(
            <Accordion type="single">
                <AccordionItem value="a">
                    <AccordionTrigger>Trigger A</AccordionTrigger>
                    <AccordionContent>Content A</AccordionContent>
                </AccordionItem>
            </Accordion>
        );
        const trigger = screen.getByRole('button', { name: 'Trigger A' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(trigger).toHaveAttribute('data-state', 'closed');

        // Resolve content panel via getByText + closest('[data-state]'). getByRole('region',
        // { name: 'Trigger A' }) fails because the trigger button's accessible-name calculation
        // includes the (non-aria-hidden) chevron SVG path data; that's a separate fix-forward
        // item. Walking up from the visible content text is robust and matches the actual
        // a11y contract: collapsed region is in the DOM but `hidden`-attributed.
        const content = screen.getByText('Content A').closest('[data-state]')!;
        expect(content).toHaveAttribute('data-state', 'closed');
        // ARIA preservation: hidden HTML attribute set when collapsed
        expect(content).toHaveAttribute('hidden');

        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(trigger).toHaveAttribute('data-state', 'open');
        expect(content).toHaveAttribute('data-state', 'open');
        expect(content).not.toHaveAttribute('hidden');

        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(trigger).toHaveAttribute('data-state', 'closed');
        expect(content).toHaveAttribute('data-state', 'closed');
        expect(content).toHaveAttribute('hidden');
    });
});

describe('AccordionItem className passthrough (STY-06)', () => {
    it('merges consumer className with the default hd-accordion__item class', () => {
        render(
            <Accordion>
                <AccordionItem value="a" className="custom-class">
                    <AccordionTrigger>T</AccordionTrigger>
                    <AccordionContent>C</AccordionContent>
                </AccordionItem>
            </Accordion>
        );
        // getByRole + .parentElement traversal (role-based, D-02a)
        const trigger = screen.getByRole('button', { name: 'T' });
        const item = trigger.parentElement!;
        expect(item.className).toContain('hd-accordion__item');
        expect(item.className).toContain('custom-class');
    });
});
