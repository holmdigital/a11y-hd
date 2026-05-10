// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — group label is wired via aria-labelledby
 *   to a sibling element whose id matches `${name}-label`; each radio's
 *   `<label htmlFor>` resolves to its input id.
 * - 2.1.1 Keyboard — radios accept focus and selection via Space; arrow-key
 *   roving is the browser's NATIVE radio-group behaviour (RadioGroup.tsx
 *   does not implement a custom keyDown handler — see "Implementation note"
 *   below). Tests assert ArrowDown/ArrowUp keystrokes do not crash and that
 *   click+Space selection both fire the onChange contract.
 * - 2.4.3 Focus Order — all radios are reachable; checked radio receives
 *   focus when the group is tabbed into (native behaviour).
 * - 4.1.2 Name, Role, Value — role="radiogroup" on the wrapper, role="radio"
 *   per option, every radio carries the shared `name` attribute, axe-clean
 *   for default and disabled-option states.
 *
 * Implementation note (template for Tabs / Phase 24):
 *   This RadioGroup relies on native HTML radio semantics — there is NO
 *   roving-tabindex JS layer here. Components that DO implement roving
 *   (Tabs Plan 22-09, TreeView/Combobox in Phase 24) must add an explicit
 *   keyDown handler and assert focus moves on ArrowDown/Up via
 *   expectKeyboardSequence. The arrow-key assertions here are limited to
 *   "the keystroke does not throw and the onChange contract is intact" —
 *   jsdom does not simulate the browser's native radio arrow behaviour.
 */
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { RadioGroup } from './RadioGroup';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

const OPTIONS = [
    { label: 'Apple', value: 'a' },
    { label: 'Banana', value: 'b' },
    { label: 'Cherry', value: 'c' },
];

describe('Tier 1: Table Stakes', () => {
    it('mounts with role="radiogroup"', () => {
        render(<RadioGroup name="fruit" options={OPTIONS} />);
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('renders each option as a radio with role="radio"', () => {
        render(<RadioGroup name="fruit" options={OPTIONS} />);
        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(3);
        expect(screen.getByLabelText(/apple/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/banana/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cherry/i)).toBeInTheDocument();
    });

    it('forwards ref to the wrapper div', () => {
        let captured: HTMLDivElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLDivElement>(null);
            return (
                <RadioGroup
                    name="fruit"
                    options={OPTIONS}
                    ref={(node) => {
                        ref.current = node;
                        captured = node;
                    }}
                />
            );
        };
        render(<Probe />);
        const group = screen.getByRole('radiogroup');
        expect(captured).toBe(group);
        expect(captured).toBeInstanceOf(HTMLDivElement);
    });

    it('passes className through on the wrapper', () => {
        render(<RadioGroup name="fruit" options={OPTIONS} className="consumer-class" />);
        expect(screen.getByRole('radiogroup').className).toContain('consumer-class');
    });

    it('group label is wired via aria-labelledby (WCAG 1.3.1)', () => {
        render(<RadioGroup name="fruit" label="Pick a fruit" options={OPTIONS} />);
        const group = screen.getByRole('radiogroup');
        const labelledby = group.getAttribute('aria-labelledby');
        expect(labelledby).toBe('fruit-label');
        // The id resolves to a real element bearing the label text.
        const labelEl = document.getElementById(labelledby!);
        expect(labelEl).not.toBeNull();
        expect(labelEl!.textContent).toMatch(/pick a fruit/i);
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('controlled: passing value="b" renders the b-radio as checked', () => {
        render(<RadioGroup name="fruit" options={OPTIONS} value="b" onChange={() => {}} />);
        const radios = screen.getAllByRole('radio') as HTMLInputElement[];
        const checked = radios.filter((r) => r.checked);
        expect(checked).toHaveLength(1);
        expect(checked[0]).toBe(screen.getByLabelText(/banana/i));
    });

    it('uncontrolled-style: clicking an option fires onChange with the value (string, not event)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<RadioGroup name="fruit" options={OPTIONS} onChange={onChange} />);

        await user.click(screen.getByLabelText(/cherry/i));
        expect(onChange).toHaveBeenCalledWith('c');
        expect(typeof onChange.mock.calls[0][0]).toBe('string');
    });

    it('Space on a focused radio selects it and fires onChange (WCAG 2.1.1)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<RadioGroup name="fruit" options={OPTIONS} onChange={onChange} />);

        const apple = screen.getByLabelText(/apple/i) as HTMLInputElement;
        apple.focus();
        expect(document.activeElement).toBe(apple);
        await user.keyboard(' ');
        expect(onChange).toHaveBeenCalledWith('a');
    });

    it('ArrowDown / ArrowRight keystrokes do not crash on a focused radio (native browser behaviour, jsdom no-op)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<RadioGroup name="fruit" options={OPTIONS} onChange={onChange} />);

        const apple = screen.getByLabelText(/apple/i) as HTMLInputElement;
        apple.focus();
        // Native HTML radio groups handle ArrowDown/ArrowRight in real browsers
        // (move focus + select next radio). RadioGroup.tsx delegates entirely to
        // native semantics — no custom keyDown — so jsdom does not simulate the
        // movement. We assert the keystrokes are accepted without throwing and
        // the component remains in a sane state for the contract that IS pinned
        // here (focus + click + Space). Tabs (Plan 22-09) will replace this with
        // a real expectKeyboardSequence assertion once roving-tabindex lands.
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowRight}');
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('ArrowUp / ArrowLeft keystrokes do not crash on a focused radio (native behaviour, jsdom no-op)', async () => {
        const user = userEvent.setup();
        render(<RadioGroup name="fruit" options={OPTIONS} value="b" onChange={() => {}} />);

        const banana = screen.getByLabelText(/banana/i) as HTMLInputElement;
        banana.focus();
        await user.keyboard('{ArrowUp}');
        await user.keyboard('{ArrowLeft}');
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('disabled options are not selectable via click', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        const opts = [
            { label: 'Apple', value: 'a' },
            { label: 'Banana', value: 'b', disabled: true },
            { label: 'Cherry', value: 'c' },
        ];
        render(<RadioGroup name="fruit" options={opts} onChange={onChange} />);

        const banana = screen.getByLabelText(/banana/i) as HTMLInputElement;
        expect(banana).toBeDisabled();
        await user.click(banana);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('all radios share the `name` attribute matching the prop', () => {
        render(<RadioGroup name="fruit" options={OPTIONS} />);
        const radios = screen.getAllByRole('radio');
        radios.forEach((r) => {
            expect(r.getAttribute('name')).toBe('fruit');
        });
    });

    it('axe-clean for default render (no selected option)', async () => {
        const { container } = render(<RadioGroup name="fruit" label="Pick" options={OPTIONS} />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for controlled + disabled-option state', async () => {
        const opts = [
            { label: 'Apple', value: 'a' },
            { label: 'Banana', value: 'b', disabled: true },
        ];
        const { container } = render(
            <RadioGroup name="fruit" label="Pick" options={opts} value="a" onChange={() => {}} />,
        );
        await expectNoAxeViolations(container);
    });

    it('two RadioGroups with different `name` props on the same page produce no duplicate ids', () => {
        const { container } = render(
            <>
                <RadioGroup name="fruit" label="Fruit" options={OPTIONS} />
                <RadioGroup
                    name="size"
                    label="Size"
                    options={[
                        { label: 'Small', value: 's' },
                        { label: 'Large', value: 'l' },
                    ]}
                />
            </>,
        );
        // Catches the `${name}-label` and `${name}-${value}` collision modes.
        expectUniqueIds(container);
    });
});
