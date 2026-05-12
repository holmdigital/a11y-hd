// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — title renders as an <h3>; the stretched-link
 *   <span> sits inside the anchor with aria-hidden="true" so assistive tech does
 *   not double-announce the title or surface a decorative box as content.
 * - 2.4.4 Link Purpose (In Context) — when `href` is provided, the link's
 *   accessible name is exactly the title text (no glyph leakage, no
 *   "click here"). One tab stop per Card.
 * - 4.1.2 Name, Role, Value — the `as` prop preserves semantic role (div /
 *   article / section / li); axe-clean across plain and stretched-link shapes.
 *
 * Card is React.FC (not forwardRef) — no ref-forwarding test is included.
 * Tier 2 here covers the stretched-link composition contract instead of
 * keyboard activation (Card has no keyboard surface of its own; the anchor
 * inherits native <a> keyboard behavior tested upstream by the browser).
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Card } from './Card';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders children', () => {
        render(<Card>Body content</Card>);
        expect(screen.getByText(/body content/i)).toBeInTheDocument();
    });

    it('renders the title as an h3 when title is provided', () => {
        render(<Card title="Card title">Body</Card>);
        expect(
            screen.getByRole('heading', { level: 3, name: /card title/i }),
        ).toBeInTheDocument();
    });

    it('omits the title heading when title is not provided', () => {
        render(<Card>Only body</Card>);
        expect(screen.queryByRole('heading')).toBeNull();
    });

    it('appends consumer className additively (does not strip)', () => {
        render(<Card className="extra">Body</Card>);
        // The content <div> wraps "Body"; its parentElement is the container
        // <Component> that receives the consumer className.
        const container = screen.getByText(/^body$/i).parentElement;
        expect(container).not.toBeNull();
        expect(container).toHaveClass('extra');
    });

    it.each(['div', 'article', 'section', 'li'] as const)(
        'as="%s" renders the requested element',
        (tag) => {
            const { container } = render(<Card as={tag}>x</Card>);
            const root = container.firstChild as HTMLElement | null;
            expect(root).not.toBeNull();
            expect(root!.tagName).toBe(tag.toUpperCase());
        },
    );
});

describe('Tier 2: A11y Differentiators (Stretched-Link Composition)', () => {
    it('href turns the title into a link with the title text as its accessible name (WCAG 2.4.4)', () => {
        render(
            <Card title="Open report" href="/reports/1">
                body
            </Card>,
        );
        const link = screen.getByRole('link', { name: /open report/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/reports/1');
    });

    it('href places an aria-hidden stretched-link <span> as the first child of the anchor (WCAG 1.3.1)', () => {
        render(
            <Card title="Open" href="/x">
                body
            </Card>,
        );
        const link = screen.getByRole('link', { name: /open/i });
        const first = link.firstElementChild;
        expect(first).not.toBeNull();
        expect(first!.tagName).toBe('SPAN');
        expect(first).toHaveAttribute('aria-hidden', 'true');
    });

    it('without href, no link is rendered (one-stretched-anchor-per-card invariant)', () => {
        render(
            <Card title="Static" href={undefined}>
                body
            </Card>,
        );
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('axe-clean for plain card (title + body)', async () => {
        const { container } = render(<Card title="Plain title">Body content</Card>);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for href stretched-link card', async () => {
        const { container } = render(
            <Card title="Linked title" href="/x">
                Body content
            </Card>,
        );
        await expectNoAxeViolations(container);
    });
});
