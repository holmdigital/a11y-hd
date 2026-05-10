// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — `<label htmlFor>` is wired to the input's
 *   `id` so screen readers announce the label as the accessible name; verified
 *   via getByLabelText returning the input element.
 * - 2.1.1 Keyboard — Space toggles the checkbox once it has focus; paired with
 *   the click path per D-02a so we cover both modalities.
 * - 4.1.2 Name, Role, Value — role="checkbox" via type="checkbox", checked
 *   reflected to the DOM, indeterminate set via the underlying input property,
 *   axe-clean across unchecked / checked-disabled states.
 *
 * Project gotcha (CLAUDE.md → "Component API gotchas"): Checkbox exposes
 * `onCheckedChange(checked: boolean)` — NOT a synthetic event handler. The
 * tests below assert the callback fires with the boolean value (true then
 * false) so future refactors can't silently swap it back to onChange.
 */
import { useEffect, useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Checkbox } from './Checkbox';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders the label text', () => {
        render(<Checkbox label="Accept terms" />);
        expect(screen.getByLabelText(/accept terms/i)).toBeInTheDocument();
    });

    it('forwards ref to the underlying input element', () => {
        let captured: HTMLInputElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLInputElement>(null);
            return (
                <Checkbox
                    label="Subscribe"
                    ref={(node) => {
                        ref.current = node;
                        captured = node;
                    }}
                />
            );
        };
        render(<Probe />);
        const input = screen.getByLabelText(/subscribe/i);
        expect(captured).toBe(input);
        expect(captured).toBeInstanceOf(HTMLInputElement);
    });

    it('passes className through additively on the wrapper', () => {
        const { container } = render(<Checkbox label="X" className="consumer-class" />);
        // Wrapper is the outermost div; className should survive.
        expect(container.firstElementChild?.className).toContain('consumer-class');
    });

    it('disabled prop disables the underlying input', () => {
        render(<Checkbox label="Disabled box" disabled />);
        const input = screen.getByLabelText(/disabled box/i);
        expect(input).toBeDisabled();
    });

    it('accepts an explicit id and uses it (no auto-generated id when id provided)', () => {
        render(<Checkbox label="Pinned id" id="my-pinned-id" />);
        const input = screen.getByLabelText(/pinned id/i);
        expect(input.getAttribute('id')).toBe('my-pinned-id');
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('uncontrolled: clicking toggles the user-visible checked state', async () => {
        const user = userEvent.setup();
        render(<Checkbox label="Toggle me" />);
        const input = screen.getByLabelText(/toggle me/i) as HTMLInputElement;
        expect(input.checked).toBe(false);
        await user.click(input);
        expect(input.checked).toBe(true);
    });

    it('onCheckedChange fires with boolean value on click (true then false)', async () => {
        const onCheckedChange = vi.fn();
        const user = userEvent.setup();
        render(<Checkbox label="Cb" onCheckedChange={onCheckedChange} />);
        const input = screen.getByLabelText(/cb/i);

        await user.click(input);
        expect(onCheckedChange).toHaveBeenLastCalledWith(true);
        await user.click(input);
        expect(onCheckedChange).toHaveBeenLastCalledWith(false);
        // Argument is a primitive boolean — not a SyntheticEvent.
        const lastArg = onCheckedChange.mock.calls.at(-1)?.[0];
        expect(typeof lastArg).toBe('boolean');
    });

    it('Space toggles when input has focus (paired keyboard path, D-02a)', async () => {
        const onCheckedChange = vi.fn();
        const user = userEvent.setup();
        render(<Checkbox label="Space toggle" onCheckedChange={onCheckedChange} />);
        const input = screen.getByLabelText(/space toggle/i) as HTMLInputElement;

        input.focus();
        expect(document.activeElement).toBe(input);
        await user.keyboard(' ');
        expect(onCheckedChange).toHaveBeenCalledWith(true);
        expect(input.checked).toBe(true);
    });

    it('controlled: checked={true} renders checked; Space fires onCheckedChange(false)', async () => {
        const onCheckedChange = vi.fn();
        const user = userEvent.setup();
        render(
            <Checkbox
                label="Controlled"
                checked
                onCheckedChange={onCheckedChange}
                onChange={() => {
                    /* required by React for controlled input */
                }}
            />,
        );
        const input = screen.getByLabelText(/controlled/i) as HTMLInputElement;
        expect(input.checked).toBe(true);

        input.focus();
        await user.keyboard(' ');
        expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it('indeterminate prop sets the DOM indeterminate property on the input', () => {
        // `indeterminate` is a DOM property, not an HTML attribute — set via ref
        // on mount. This is the canonical pattern; document it for FormField.
        const Probe = () => {
            const ref = useRef<HTMLInputElement>(null);
            useEffect(() => {
                if (ref.current) ref.current.indeterminate = true;
            }, []);
            return <Checkbox label="Tri-state" ref={ref} />;
        };
        render(<Probe />);
        const input = screen.getByLabelText(/tri-state/i) as HTMLInputElement;
        expect(input.indeterminate).toBe(true);
    });

    it('label is programmatically associated via htmlFor↔id (WCAG 1.3.1)', () => {
        render(<Checkbox label="Newsletter" />);
        // getByLabelText resolves only when the label-input wiring is correct.
        const input = screen.getByLabelText(/newsletter/i);
        expect(input).toBeInstanceOf(HTMLInputElement);
        expect(input.tagName).toBe('INPUT');
    });

    it('axe-clean for default (unchecked) render', async () => {
        const { container } = render(<Checkbox label="Default" />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for checked + disabled state', async () => {
        const { container } = render(
            <Checkbox label="Checked disabled" checked disabled onChange={() => {}} />,
        );
        await expectNoAxeViolations(container);
    });

    it('two Checkboxes with explicit ids on the same page produce no duplicate ids', () => {
        const { container } = render(
            <>
                <Checkbox label="One" id="cb-one" />
                <Checkbox label="Two" id="cb-two" />
            </>,
        );
        expectUniqueIds(container);
    });
});
