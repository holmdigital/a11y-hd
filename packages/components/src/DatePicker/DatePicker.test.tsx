// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — <label htmlFor> wires label to the input;
 *   description and error elements are bound to the input via
 *   aria-describedby (id-chain assertion).
 * - 2.1.1 Keyboard — APG dialog-grid keystrokes (Arrow*, Home, End, PageUp,
 *   PageDown, Shift+PageUp, Shift+PageDown, Enter, Escape) are exercised as
 *   a parametrised no-throw matrix per D-01 (Phase 22 RadioGroup pattern).
 *   See "Implementation note" below for why these are stubs today.
 * - 4.1.2 Name, Role, Value — input[type=date] is the accessible-name vehicle
 *   (label htmlFor provides the name); aria-invalid toggles on error; the
 *   error message carries role="alert".
 *
 * Implementation note (deliberate stub coverage):
 *   DatePicker.tsx uses a native <input type="date"> by design (see component
 *   JSDoc, line 25-29: "Uses native <input type=date> for maximum accessibility
 *   and device integration"). It implements NONE of the APG dialog-grid
 *   contract — there is no role="grid" calendar, no gridcell day cells, no
 *   custom onKeyDown handler. The Tier-2 keystroke block here is therefore a
 *   no-throw stub matrix (D-01 RadioGroup pattern from Phase 22): it pins
 *   structural sanity (focused input survives the keystroke, aria-invalid
 *   does not flip spuriously) without asserting date-navigation behaviour
 *   that jsdom cannot simulate anyway (Pitfall 3: jsdom does not drive
 *   <input type=date> calendar pickers).
 *
 *   When v0.7 lands the dialog-grid implementation (backlog: TC-10-IMPL),
 *   these no-throw stubs upgrade naturally to real assertions
 *   (expectKeyboardSequence + focus moves on the day grid) without test
 *   churn — the same it.each table flips from "does not throw" to "focuses
 *   the next day cell". A selected-date live-region announcement is also
 *   NOT rendered by the current source (no <LiveRegion>, no aria-live);
 *   that is deferred to TC-10-LIVE in the backlog.
 *
 *   WCAG 4.1.3 (Status Messages) and 2.4.3 (Focus Order, beyond the native
 *   single-input case) are intentionally NOT claimed here — they belong to
 *   TC-10-IMPL / TC-10-LIVE follow-ups, not to the native-input baseline.
 */
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { DatePicker } from './DatePicker';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and the input has type="date"', () => {
        render(<DatePicker label="Birthday" />);
        const input = screen.getByLabelText(/birthday/i) as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'date');
    });

    it('label is wired via htmlFor (getByLabelText resolves to the input)', () => {
        render(<DatePicker label="Birthday" />);
        const input = screen.getByLabelText(/birthday/i);
        expect(input.tagName).toBe('INPUT');
    });

    it('forwards ref to the underlying <input> element', () => {
        let captured: HTMLInputElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLInputElement>(null);
            return (
                <DatePicker
                    label="Birthday"
                    ref={(node) => {
                        ref.current = node;
                        captured = node;
                    }}
                />
            );
        };
        render(<Probe />);
        const input = screen.getByLabelText(/birthday/i);
        expect(captured).toBe(input);
        expect(captured).toBeInstanceOf(HTMLInputElement);
    });

    it('passes className through on the outer container (additive, consumer class survives)', () => {
        const { container } = render(
            <DatePicker label="Birthday" className="consumer-class" />,
        );
        // The outer wrapper <div> is the first child of the render container.
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper).not.toBeNull();
        expect(wrapper.className).toContain('consumer-class');
    });

    it('description renders and its id appears in the input\'s aria-describedby', () => {
        render(<DatePicker label="Birthday" description="Use YYYY-MM-DD" />);
        const input = screen.getByLabelText(/birthday/i);
        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).not.toBeNull();
        // Description text is visible and the id token resolves to it.
        const descEl = screen.getByText(/use yyyy-mm-dd/i);
        expect(descEl.id).toBeTruthy();
        expect(describedBy!.split(/\s+/)).toContain(descEl.id);
    });

    it('error renders with role="alert", participates in aria-describedby, and toggles aria-invalid="true"', () => {
        render(<DatePicker label="Birthday" error="Required" />);
        const input = screen.getByLabelText(/birthday/i);
        expect(input).toHaveAttribute('aria-invalid', 'true');

        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/required/i);
        expect(alert.id).toBeTruthy();

        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).not.toBeNull();
        expect(describedBy!.split(/\s+/)).toContain(alert.id);
    });

    it('arbitrary HTML attributes (min, max, name, data-*) pass through to the input', () => {
        render(
            <DatePicker
                label="Birthday"
                name="birthday"
                min="2020-01-01"
                max="2030-12-31"
                data-analytics="dob-field"
            />,
        );
        const input = screen.getByLabelText(/birthday/i);
        expect(input).toHaveAttribute('name', 'birthday');
        expect(input).toHaveAttribute('min', '2020-01-01');
        expect(input).toHaveAttribute('max', '2030-12-31');
        expect(input).toHaveAttribute('data-analytics', 'dob-field');
    });
});

describe('Tier 2: A11y Differentiators', () => {
    // APG dialog-grid keystroke matrix — D-01 no-throw stub.
    // Source does NOT implement these keystrokes (native <input type=date>);
    // assertions are: input still in DOM, aria-invalid did not flip from the
    // no-error baseline ("false"), and userEvent.keyboard did not throw.
    // When TC-10-IMPL lands, this table upgrades to expectKeyboardSequence.
    const APG_GRID_KEYS = [
        '{ArrowLeft}',
        '{ArrowRight}',
        '{ArrowUp}',
        '{ArrowDown}',
        '{Home}',
        '{End}',
        '{PageUp}',
        '{PageDown}',
        '{Shift>}{PageUp}{/Shift}',
        '{Shift>}{PageDown}{/Shift}',
        '{Enter}',
        '{Escape}',
    ] as const;

    it.each(APG_GRID_KEYS)(
        'APG dialog-grid keystroke %s does not throw on a focused input (D-01 no-throw stub; TC-10-IMPL upgrade target)',
        async (key) => {
            const user = userEvent.setup();
            render(<DatePicker label="Birthday" />);
            const input = screen.getByLabelText(/birthday/i) as HTMLInputElement;

            input.focus();
            expect(document.activeElement).toBe(input);

            await expect(user.keyboard(key)).resolves.not.toThrow();

            // Structural sanity: input still mounted; aria-invalid did not
            // spuriously flip from the no-error baseline ("false").
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('aria-invalid', 'false');
        },
    );

    it('axe-clean for default render', async () => {
        const { container } = render(<DatePicker label="Birthday" />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for error-state render (description + error + aria-invalid all engaged)', async () => {
        const { container } = render(
            <DatePicker
                label="Birthday"
                description="Use YYYY-MM-DD"
                error="Required"
            />,
        );
        await expectNoAxeViolations(container);
    });

    it('axe-clean for description-only render (positive flow, no error)', async () => {
        const { container } = render(
            <DatePicker label="Birthday" description="Use YYYY-MM-DD" />,
        );
        await expectNoAxeViolations(container);
    });

    it('two <DatePicker> instances render with no duplicate ids', () => {
        const { container } = render(
            <>
                <DatePicker label="Start date" description="Inclusive" />
                <DatePicker label="End date" error="Required" />
            </>,
        );
        // Catches the `${id}-description` and `${id}-error` collision modes
        // if useId() generation ever regresses.
        expectUniqueIds(container);
    });
});
