// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 2.4.1 Bypass Blocks — the entire purpose of SkipLink: keyboard users can
 *   jump past repeated nav by Tabbing to a link that targets the main content
 *   landmark (`href="#<targetId>"`). Tab-to-focus is the jsdom-measurable proof.
 * - 2.4.7 Focus Visible — focused link becomes document.activeElement; the
 *   Tailwind transform reveal (`-translate-y-[150%] focus:translate-y-0`) is
 *   visual-only and deferred to a real-browser smoke (jsdom cannot measure
 *   computed transforms / layout).
 * - 4.1.2 Name, Role, Value — accessible name comes from link text (default
 *   Swedish copy 'Hoppa till huvudinnehåll' or consumer-provided children);
 *   axe-clean across default and custom-targetId variants.
 *
 * Template note: mirrors the Phase 22 template-setter shape (Button.test.tsx).
 * Swedish characters å/ä/ö are preserved verbatim per CLAUDE.md user memory.
 */
import { useRef, type MutableRefObject } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { SkipLink } from './SkipLink';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders an anchor', () => {
        render(<SkipLink />);
        expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('defaults targetId to "main" (href="#main")', () => {
        render(<SkipLink />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '#main');
    });

    it('accepts a custom targetId', () => {
        render(<SkipLink targetId="content" />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '#content');
    });

    it('forwards ref to the underlying anchor element', () => {
        let captured: HTMLAnchorElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLAnchorElement>(null);
            return (
                <SkipLink
                    ref={(node) => {
                        (ref as MutableRefObject<HTMLAnchorElement | null>).current = node;
                        captured = node;
                    }}
                />
            );
        };
        render(<Probe />);
        expect(captured).toBeInstanceOf(HTMLAnchorElement);
        expect((captured as HTMLAnchorElement | null)?.tagName).toBe('A');
    });

    it('appends consumer className additively', () => {
        render(<SkipLink className="extra-class" />);
        const link = screen.getByRole('link');
        expect(link.className).toContain('extra-class');
    });

    it('forwards arbitrary anchor attributes (id, data-*)', () => {
        render(<SkipLink id="skip-1" data-analytics="skip-nav" />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('id', 'skip-1');
        expect(link).toHaveAttribute('data-analytics', 'skip-nav');
    });
});

/**
 * Tier 2 note: SkipLink's visual reveal uses Tailwind transform classes
 * (`-translate-y-[150%] focus:translate-y-0`). jsdom does not run a layout
 * engine and returns empty strings for computed transforms, so the visual
 * "slide-in on focus" assertion is explicitly NOT in scope here. The
 * jsdom-measurable Bypass-Blocks contract is: Tab reaches the link and
 * the link points at `#<targetId>` — that is what we pin below.
 */
describe('Tier 2: A11y Differentiators (Bypass Blocks)', () => {
    it('renders default Swedish copy "Hoppa till huvudinnehåll" when no children provided', () => {
        render(<SkipLink />);
        expect(
            screen.getByRole('link', { name: /hoppa till huvudinnehåll/i }),
        ).toBeInTheDocument();
    });

    it('custom children override the default text', () => {
        render(<SkipLink>Skip to content</SkipLink>);
        expect(
            screen.getByRole('link', { name: /skip to content/i }),
        ).toBeInTheDocument();
        expect(screen.queryByText(/huvudinnehåll/i)).toBeNull();
    });

    it('receives focus when Tab is pressed from document.body (WCAG 2.4.1)', async () => {
        const user = userEvent.setup();
        render(<SkipLink />);
        const link = screen.getByRole('link');

        await user.tab();

        expect(document.activeElement).toBe(link);
    });

    it('axe-clean for default skip link', async () => {
        const { container } = render(<SkipLink />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean with custom targetId and children', async () => {
        const { container } = render(
            <SkipLink targetId="content">Skip to content</SkipLink>,
        );
        await expectNoAxeViolations(container);
    });
});
