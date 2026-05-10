// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 2.4.3 Focus Order — when errors are present, focus moves to the summary
 *   heading on mount (focusOnMount default true) so AT users land at the
 *   error summary before form fields.
 * - 3.3.1 Error Identification — each error renders a link whose href and
 *   onClick handler resolve to the input field's id; activating the link
 *   moves focus to the offending field.
 * - 4.1.3 Status Messages — the summary container is a live region
 *   (role="alert", which implies aria-live="assertive") that exists in the
 *   DOM at mount and updates when the `errors` prop changes (re-render
 *   causes the new content to be announced).
 *
 * Template note: this file is the live-region template for Phase 24
 * (Combobox results-count, DatePicker selected-date, MultiSelect count).
 * The announcement-on-update pattern (rerender + assert new content
 * present in the live region) is the reusable shape.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { ErrorSummary } from './ErrorSummary';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

const ONE_ERROR = [{ id: 'email', message: 'Email is required' }];
const TWO_ERRORS = [
    { id: 'email', message: 'Email is required' },
    { id: 'password', message: 'Password must be at least 8 characters' },
];

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders the default title when no `title` prop is passed', () => {
        render(<ErrorSummary errors={ONE_ERROR} />);
        expect(
            screen.getByRole('heading', { name: /there is a problem/i }),
        ).toBeInTheDocument();
    });

    it('renders a custom title when `title` is provided', () => {
        render(<ErrorSummary errors={ONE_ERROR} title="Please fix the following" />);
        expect(
            screen.getByRole('heading', { name: /please fix the following/i }),
        ).toBeInTheDocument();
    });

    it('passes className through additively on the container', () => {
        const { container } = render(
            <ErrorSummary errors={ONE_ERROR} className="consumer-class" />,
        );
        const region = container.firstElementChild as HTMLElement;
        expect(region.className).toContain('consumer-class');
        expect(region.className).toContain('a11y-error-summary');
    });

    it('renders one list item per error, each containing the message text', () => {
        render(<ErrorSummary errors={TWO_ERRORS} />);
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(
            screen.getByText(/password must be at least 8 characters/i),
        ).toBeInTheDocument();
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(2);
    });

    it('renders nothing when `errors` is an empty array (component returns null)', () => {
        const { container } = render(<ErrorSummary errors={[]} />);
        expect(container.firstChild).toBeNull();
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('exposes live-region semantics via role="alert" (implies aria-live=assertive — WCAG 4.1.3)', () => {
        const { container } = render(<ErrorSummary errors={ONE_ERROR} />);
        const region = container.firstElementChild as HTMLElement;
        expect(region.getAttribute('role')).toBe('alert');
        // role="alert" implies an implicit aria-live="assertive" — assert at
        // least one of these is present so a future refactor that swaps to
        // aria-live keeps announcement intent.
        const hasLive =
            region.getAttribute('role') === 'alert' ||
            region.getAttribute('aria-live') !== null;
        expect(hasLive).toBe(true);
    });

    it('the live region exists in the DOM at first mount (PITFALLS §3.2: regions added later may not announce)', () => {
        const { container } = render(<ErrorSummary errors={ONE_ERROR} />);
        // The container with role="alert" must be present from the very
        // first render — not appended after a state change. Some screen
        // readers do not announce regions inserted post-mount.
        const region = container.querySelector('[role="alert"]');
        expect(region).not.toBeNull();
    });

    it('updating the `errors` prop causes the live region content to update (announcement-on-update template)', () => {
        const { rerender, container } = render(<ErrorSummary errors={ONE_ERROR} />);
        const region = container.querySelector('[role="alert"]') as HTMLElement;
        expect(region.textContent).toMatch(/email is required/i);
        expect(region.textContent).not.toMatch(/password/i);

        rerender(<ErrorSummary errors={TWO_ERRORS} />);

        const updated = container.querySelector('[role="alert"]') as HTMLElement;
        expect(updated.textContent).toMatch(/email is required/i);
        expect(updated.textContent).toMatch(/password must be at least 8 characters/i);
    });

    it('focusOnMount default (true): heading is focusable (tabIndex=-1) AND becomes activeElement after mount (WCAG 2.4.3)', () => {
        render(<ErrorSummary errors={ONE_ERROR} />);
        const heading = screen.getByRole('heading', { name: /there is a problem/i });
        // Programmatically focusable per WCAG 2.4.3 — tabIndex=-1 allows
        // .focus() to land it without inserting it into the Tab order.
        expect(heading.tabIndex).toBe(-1);
        expect(document.activeElement).toBe(heading);
    });

    it('focusOnMount={false} does NOT steal focus on mount', () => {
        render(<ErrorSummary errors={ONE_ERROR} focusOnMount={false} />);
        const heading = screen.getByRole('heading', { name: /there is a problem/i });
        expect(document.activeElement).not.toBe(heading);
        // body is the default activeElement when nothing has stolen focus
        expect(document.activeElement).toBe(document.body);
    });

    it('each error link has href="#${error.id}" referencing the field id (WCAG 3.3.1)', () => {
        render(<ErrorSummary errors={TWO_ERRORS} />);
        const emailLink = screen.getByRole('link', { name: /email is required/i });
        const passwordLink = screen.getByRole('link', {
            name: /password must be at least 8 characters/i,
        });
        expect(emailLink.getAttribute('href')).toBe('#email');
        expect(passwordLink.getAttribute('href')).toBe('#password');
    });

    it('clicking an error link focuses the referenced field (paired with Enter activation per D-02a)', async () => {
        const user = userEvent.setup();
        const Harness = () => (
            <div>
                <ErrorSummary
                    errors={[{ id: 'email', message: 'Email is required' }]}
                    focusOnMount={false}
                />
                <input id="email" aria-label="Email" />
            </div>
        );
        const { unmount } = render(<Harness />);
        const link = screen.getByRole('link', { name: /email is required/i });
        const input = screen.getByLabelText(/email/i) as HTMLInputElement;

        // Click path
        await user.click(link);
        expect(document.activeElement).toBe(input);

        unmount();

        // Keyboard path (paired per D-02a) — Enter on the focused link must
        // also resolve to the field via the onClick handler.
        render(<Harness />);
        const link2 = screen.getByRole('link', { name: /email is required/i });
        const input2 = screen.getByLabelText(/email/i) as HTMLInputElement;
        link2.focus();
        await user.keyboard('{Enter}');
        expect(document.activeElement).toBe(input2);
    });

    it('axe-clean for default render with one error', async () => {
        const { container } = render(<ErrorSummary errors={ONE_ERROR} />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for empty state (component renders null — no a11y surface)', async () => {
        const { container } = render(<ErrorSummary errors={[]} />);
        await expectNoAxeViolations(container);
    });

    it('two ErrorSummary instances on the same page produce no duplicate ids', () => {
        const { container } = render(
            <>
                <ErrorSummary errors={ONE_ERROR} focusOnMount={false} />
                <ErrorSummary
                    errors={[{ id: 'name', message: 'Name is required' }]}
                    focusOnMount={false}
                />
            </>,
        );
        // ErrorSummary uses a hard-coded id "error-summary-title" today —
        // this assertion documents the duplicate-id risk so a future
        // refactor to useId() keeps the intent locked in.
        expectUniqueIds(container);
    });
});
