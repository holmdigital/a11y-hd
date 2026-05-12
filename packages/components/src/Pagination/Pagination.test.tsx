// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — the <nav> landmark + aria-current="page"
 *   expose the pagination structure and current location to assistive tech.
 * - 2.4.4 Link Purpose (In Context) — Previous / Next controls carry explicit
 *   aria-label values; each page button is labelled `Page N`.
 * - 4.1.2 Name, Role, Value — role="navigation" on the container, each control
 *   is a native <button> (implicit role=button), aria-current="page" on the
 *   active page, and the disabled boundary state is exposed via the DOM
 *   `disabled` attribute AND `aria-disabled="true"`.
 *
 * Implementation note (Plan 22-06 RadioGroup precedent):
 *   Pagination.tsx has NO custom arrow-key handler — it relies on the native
 *   <button> contract (Tab to focus, Enter/Space to activate). Therefore the
 *   keyboard surface tested here is ONLY Tab + Enter/Space. ArrowLeft /
 *   ArrowRight keystrokes are exercised with the "does-not-throw" pattern only
 *   (per Plan 22-06): we do NOT assert focus movement, because jsdom does not
 *   simulate browser-native roving for plain buttons and no JS handler exists
 *   in the source to drive it.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Pagination } from './Pagination';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders a navigation landmark', () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('applies the default aria-label "Pagination"', () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
        expect(
            screen.getByRole('navigation', { name: /pagination/i }),
        ).toBeInTheDocument();
    });

    it('ariaLabel prop overrides the default', () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={() => {}}
                ariaLabel="Results pages"
            />,
        );
        expect(
            screen.getByRole('navigation', { name: /results pages/i }),
        ).toBeInTheDocument();
    });

    it('renders nothing when totalPages is 1', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it('appends consumer className to the nav additively', () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={() => {}}
                className="extra-pg"
            />,
        );
        expect(screen.getByRole('navigation')).toHaveClass('extra-pg');
    });
});

describe('Tier 2: A11y Differentiators (APG Pagination — nav landmark + aria-current)', () => {
    it('current page button has aria-current="page"', () => {
        render(<Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />);
        expect(screen.getByRole('button', { name: /page 3/i })).toHaveAttribute(
            'aria-current',
            'page',
        );
    });

    it('non-current page buttons do not have aria-current', () => {
        render(<Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />);
        expect(screen.getByRole('button', { name: /page 2/i })).not.toHaveAttribute(
            'aria-current',
        );
        expect(screen.getByRole('button', { name: /^page 1$/i })).not.toHaveAttribute(
            'aria-current',
        );
    });

    it('Previous button is disabled at currentPage===1 (DOM disabled + aria-disabled)', () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
        const prev = screen.getByRole('button', { name: /previous page/i });
        expect(prev).toBeDisabled();
        expect(prev).toHaveAttribute('aria-disabled', 'true');
    });

    it('Next button is disabled at currentPage===totalPages (DOM disabled + aria-disabled)', () => {
        render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
        const next = screen.getByRole('button', { name: /next page/i });
        expect(next).toBeDisabled();
        expect(next).toHaveAttribute('aria-disabled', 'true');
    });

    it('clicking a non-current page button fires onPageChange with that page number', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onChange} />);

        await user.click(screen.getByRole('button', { name: /page 2/i }));
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(2);
    });

    it('clicking Previous on page 1 does NOT fire onPageChange, and Enter on focused Previous is also a no-op (D-02a parity)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onChange} />);

        const prev = screen.getByRole('button', { name: /previous page/i });
        await user.click(prev);
        expect(onChange).not.toHaveBeenCalled();

        // Click + keyboard parity: Enter on the disabled Previous must also be a no-op.
        prev.focus();
        await user.keyboard('{Enter}');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('clicking Next on the last page does NOT fire onPageChange, and Enter on focused Next is also a no-op (D-02a parity)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Pagination currentPage={5} totalPages={5} onPageChange={onChange} />);

        const next = screen.getByRole('button', { name: /next page/i });
        await user.click(next);
        expect(onChange).not.toHaveBeenCalled();

        next.focus();
        await user.keyboard('{Enter}');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('Tab moves focus to the first interactive control then forwards through buttons in DOM order', async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />);

        await user.tab();
        expect(document.activeElement).toBe(
            screen.getByRole('button', { name: /previous page/i }),
        );
        // Next Tab lands on a page button (DOM order: Prev → page 1 → page 2 → page 3 → Next).
        await user.tab();
        expect(document.activeElement).toBe(
            screen.getByRole('button', { name: /^page 1$/i }),
        );
    });

    it('pressing ArrowLeft / ArrowRight on a focused page button does not throw (Plan 22-06 RadioGroup precedent — Pagination has no custom arrow handler)', async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />);

        const page = screen.getByRole('button', { name: /page 2/i });
        page.focus();
        // Pagination.tsx has NO onKeyDown handler — arrow keys are a native no-op
        // on plain <button>. We only pin "the keystrokes are accepted without
        // throwing", per the Plan 22-06 RadioGroup precedent (no focus-movement
        // assertion because no JS handler exists to drive it in jsdom).
        await expect(
            user.keyboard('{ArrowLeft}{ArrowRight}'),
        ).resolves.toBeUndefined();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('axe-clean for a typical pagination render (currentPage=3, totalPages=10)', async () => {
        const { container } = render(
            <Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />,
        );
        await expectNoAxeViolations(container);
    });

    it('axe-clean for a boundary state (currentPage=1, totalPages=5 — Previous disabled)', async () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />,
        );
        await expectNoAxeViolations(container);
    });
});
