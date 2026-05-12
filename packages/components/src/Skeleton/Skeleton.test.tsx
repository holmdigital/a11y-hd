// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.1.1 Non-text Content — Skeleton is a purely decorative loading
 *   placeholder. The visible span carries `aria-hidden="true"` so assistive
 *   technology skips it; the parent container is responsible for any
 *   user-visible "loading" status announcement.
 * - 4.1.2 Name, Role, Value — because Skeleton exposes no name and no role
 *   to the accessibility tree, axe must remain clean across all variants
 *   and animation modes (no orphaned ARIA, no broken landmark).
 *
 * Tier 2 contract: the `aria-hidden="true"` attribute on the placeholder
 * span is the load-bearing accessibility property; pinning it here prevents
 * a future refactor from accidentally surfacing the decorative element to
 * screen readers.
 */
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders the placeholder span', () => {
        const { container } = render(<Skeleton />);
        expect(container.getElementsByClassName('hd-skeleton').length).toBeGreaterThanOrEqual(1);
    });

    it('accepts string width and height and passes them through as inline styles', () => {
        const { container } = render(<Skeleton width="200px" height="40px" />);
        const el = container.getElementsByClassName('hd-skeleton')[0] as HTMLElement;
        expect(el).toBeTruthy();
        expect(el.style.width).toBe('200px');
        expect(el.style.height).toBe('40px');
    });

    it('accepts numeric width and height (React inlines px units)', () => {
        const { container } = render(<Skeleton width={200} height={40} />);
        const el = container.getElementsByClassName('hd-skeleton')[0] as HTMLElement;
        expect(el).toBeTruthy();
        expect(el.style.width).toBe('200px');
        expect(el.style.height).toBe('40px');
    });

    it('appends consumer className additively without dropping the base class', () => {
        const { container } = render(<Skeleton className="extra" />);
        const el = container.getElementsByClassName('hd-skeleton')[0] as HTMLElement;
        expect(el).toBeTruthy();
        expect(el.classList.contains('hd-skeleton')).toBe(true);
        expect(el.classList.contains('extra')).toBe(true);
    });
});

describe('Tier 2: A11y Differentiators (Decorative Placeholder)', () => {
    it('is hidden from assistive technology (aria-hidden="true")', () => {
        const { container } = render(<Skeleton />);
        const el = container.getElementsByClassName('hd-skeleton')[0] as HTMLElement;
        expect(el).toBeTruthy();
        expect(el).toHaveAttribute('aria-hidden', 'true');
    });

    it.each(['text', 'circular', 'rectangular'] as const)(
        'variant=%s mounts without crashing',
        (variant) => {
            const { container } = render(<Skeleton variant={variant} />);
            expect(container.getElementsByClassName('hd-skeleton').length).toBeGreaterThanOrEqual(1);
        },
    );

    it('applies the hd-skeleton-pulse class hook when animation="pulse"', () => {
        const { container } = render(<Skeleton animation="pulse" />);
        const el = container.getElementsByClassName('hd-skeleton')[0] as HTMLElement;
        expect(el.classList.contains('hd-skeleton-pulse')).toBe(true);
    });

    it('applies the hd-skeleton-wave class hook when animation="wave"', () => {
        const { container } = render(<Skeleton animation="wave" />);
        const el = container.getElementsByClassName('hd-skeleton')[0] as HTMLElement;
        expect(el.classList.contains('hd-skeleton-wave')).toBe(true);
    });

    it('applies no animation class hook when animation="none"', () => {
        const { container } = render(<Skeleton animation="none" />);
        const el = container.getElementsByClassName('hd-skeleton')[0] as HTMLElement;
        expect(el.classList.contains('hd-skeleton-pulse')).toBe(false);
        expect(el.classList.contains('hd-skeleton-wave')).toBe(false);
    });

    it('axe-clean for default skeleton', async () => {
        const { container } = render(<Skeleton />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for circular variant with explicit dimensions', async () => {
        const { container } = render(<Skeleton variant="circular" width={40} height={40} />);
        await expectNoAxeViolations(container);
    });
});
