// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — input label wired via htmlFor; listbox
 *   referenced by aria-controls on the combobox input; each chip-remove
 *   <button> carries an explicit aria-label="Remove {label}".
 * - 2.1.1 Keyboard — real assertions for the keystrokes the source DOES
 *   implement: ArrowDown/ArrowUp (open listbox + move aria-activedescendant),
 *   Enter (select focused option + close), Escape (close), Backspace on empty
 *   input (remove last chip); chip-remove <button> activates on BOTH Enter
 *   AND Space (paired keyboard per D-02a, native HTMLButtonElement behaviour).
 *   No-throw stubs for APG-gap keystrokes the source does NOT implement.
 * - 2.4.3 Focus Order — focus remains on the combobox input; removing a chip
 *   programmatically returns focus to the input (handleRemove line 70).
 * - 4.1.2 Name, Role, Value — role="combobox" on input, role="listbox" on
 *   popup (gated on isOpen && availableOptions.length > 0), role="option"
 *   per item, aria-expanded reflects open state, aria-controls points at the
 *   listbox, aria-activedescendant moves on Arrow keys, chip remove button
 *   aria-label="Remove {label}".
 *
 * Implementation note (deferred to v0.7 backlog):
 *   APG listbox-multi gaps NOT implemented in MultiSelect.tsx today:
 *     - `aria-multiselectable="true"` is MISSING on the listbox. APG requires
 *       it for multi-select listboxes. Backlog: TC-11-IMPL.
 *     - `aria-selected` is HARDCODED to `false` on every <li role="option">
 *       (line 278). It never reflects selection state — since the source
 *       filters out already-selected options from availableOptions before
 *       render, "selected" options never appear in the popup, but the
 *       attribute is still semantically wrong. Backlog: TC-11-IMPL.
 *     - Space on the focused input has NO toggle handler — it inserts a
 *       literal space character into the input. APG specifies Space should
 *       toggle the focused option (without moving focus). Backlog: TC-11-IMPL.
 *     - Shift+ArrowDown / Shift+ArrowUp does NOT extend selection — there is
 *       no modifier branch in the keyDown handler. Backlog: TC-11-IMPL.
 *     - No <LiveRegion> / aria-live region announces selection or removal
 *       count to screen readers. Backlog: TC-11-LIVE.
 *
 *   Tier-2 below covers what the source DOES implement; the parametrised
 *   APG-gap row asserts the listed keystrokes do not throw (no-throw stubs
 *   per D-01 partial-stub strategy). When TC-11-IMPL lands the no-throw
 *   row will be replaced with real assertions.
 *
 *   Chip-navigation via ArrowLeft from the input (MultiSelect.tsx lines
 *   104-112) is a comment-only placeholder in the source — silently omitted
 *   from this test file (no no-throw row, no backlog reference) per the
 *   planner's discretion call: source-acknowledged TODO comments do not
 *   warrant a stub assertion that would have to be rewritten when the
 *   feature lands.
 *
 *   4.1.3 Status Messages is NOT covered here — no live region exists.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { MultiSelect } from './MultiSelect';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

const OPTIONS = [
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
    { value: 'c', label: 'Cherry' },
];

describe('Tier 1: Table Stakes', () => {
    it('mounts with role="combobox" on the input', () => {
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={() => {}}
            />,
        );
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('label is wired via htmlFor to the combobox input', () => {
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={() => {}}
            />,
        );
        // getByLabelText resolves the htmlFor→id link; this is the canonical
        // 1.3.1 Info and Relationships assertion for the input/label pair.
        const input = screen.getByLabelText(/pick fruits/i);
        expect(input).toBe(screen.getByRole('combobox'));
    });

    it('passes className through additively on the outer container', () => {
        const { container } = render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={() => {}}
                className="consumer-class"
            />,
        );
        const outer = container.firstElementChild as HTMLElement;
        expect(outer.className).toContain('consumer-class');
    });

    it('selected items render as visible chips with their labels', () => {
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a', 'b']}
                onChange={() => {}}
            />,
        );
        // Each chip wraps the label text; getByText scopes the assertion
        // to visible content and proves both chips rendered.
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('each chip remove button carries aria-label="Remove {label}"', () => {
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a', 'b']}
                onChange={() => {}}
            />,
        );
        expect(screen.getByRole('button', { name: /remove apple/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /remove banana/i })).toBeInTheDocument();
    });

    it('empty selected renders the placeholder; non-empty selected renders chips (no placeholder)', () => {
        const { rerender } = render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={() => {}}
                placeholder="Choose…"
            />,
        );
        // Placeholder visible when nothing selected.
        expect((screen.getByRole('combobox') as HTMLInputElement).placeholder).toBe('Choose…');

        rerender(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a']}
                onChange={() => {}}
                placeholder="Choose…"
            />,
        );
        // Placeholder cleared when at least one chip is rendered.
        expect((screen.getByRole('combobox') as HTMLInputElement).placeholder).toBe('');
        expect(screen.getByText('Apple')).toBeInTheDocument();
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('clicking an option in the listbox fires onChange with [...selected, value]', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a']}
                onChange={onChange}
            />,
        );
        // Open the listbox first (focus opens it via onFocus).
        await user.click(screen.getByRole('combobox'));
        // availableOptions = OPTIONS minus already-selected = [Banana, Cherry].
        await user.click(screen.getByRole('option', { name: /banana/i }));
        expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    });

    it('ArrowDown on the focused input opens the listbox AND moves aria-activedescendant to option-0', async () => {
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={() => {}}
            />,
        );
        const input = screen.getByRole('combobox');
        // user.click() drives a real React synthetic FocusEvent, which fires
        // the source's onFocus → setIsOpen(true). A bare DOM input.focus()
        // does NOT round-trip through React's synthetic event system in jsdom.
        await user.click(input);
        // onFocus opens the listbox; that is part of the implemented contract.
        expect(input).toHaveAttribute('aria-expanded', 'true');
        await user.keyboard('{ArrowDown}');
        // After one ArrowDown from initial focusedIndex=-1 → 0.
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
    });

    it('ArrowUp on the focused input opens the listbox AND wraps aria-activedescendant to the last option', async () => {
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={() => {}}
            />,
        );
        const input = screen.getByRole('combobox');
        await user.click(input);
        // Source line 88: `prev > 0 ? prev - 1 : availableOptions.length - 1`.
        // From initial focusedIndex=-1 (-1 is NOT > 0) → wraps to last index
        // = availableOptions.length - 1 = 2 (3 options, none selected).
        await user.keyboard('{ArrowUp}');
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-2$/);
    });

    it('Enter on the input with a focused option selects it AND closes the listbox', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={onChange}
            />,
        );
        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.keyboard('{ArrowDown}'); // focusedIndex → 0 (Apple)
        await user.keyboard('{Enter}');
        expect(onChange).toHaveBeenCalledWith(['a']);
        // Source: handleSelect → setIsOpen(false).
        expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('Escape closes the listbox without calling onChange', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={onChange}
            />,
        );
        const input = screen.getByRole('combobox');
        await user.click(input); // opens via onFocus
        expect(input).toHaveAttribute('aria-expanded', 'true');
        await user.keyboard('{Escape}');
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('Backspace on EMPTY input fires onChange with selected.slice(0, -1) (removes last chip)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a', 'b']}
                onChange={onChange}
            />,
        );
        const input = screen.getByRole('combobox') as HTMLInputElement;
        await user.click(input);
        expect(input.value).toBe(''); // confirms inputValue is empty
        await user.keyboard('{Backspace}');
        expect(onChange).toHaveBeenCalledWith(['a']);
    });

    it('Backspace on NON-empty input does NOT fire onChange (input clears first)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a']}
                onChange={onChange}
            />,
        );
        const input = screen.getByRole('combobox');
        await user.click(input);
        await user.keyboard('x'); // inputValue becomes 'x'
        // user-event's typing path may invoke onChange noise on the controlled
        // input? No — onChange here is the MultiSelect prop, not the input's
        // native change. The MultiSelect onChange should only fire when the
        // backspace deletes a CHIP, which only happens if inputValue==''.
        await user.keyboard('{Backspace}');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('clicking a chip remove button fires onChange (value removed) AND focus returns to the input', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a', 'b']}
                onChange={onChange}
            />,
        );
        const removeApple = screen.getByRole('button', { name: /remove apple/i });
        await user.click(removeApple);
        expect(onChange).toHaveBeenCalledWith(['b']);
        // Source line 70: inputRef.current?.focus() after onChange.
        expect(document.activeElement).toBe(screen.getByRole('combobox'));
    });

    it('Enter on a focused chip remove button fires onChange (D-02a paired keyboard)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a']}
                onChange={onChange}
            />,
        );
        const removeBtn = screen.getByRole('button', { name: /remove apple/i });
        removeBtn.focus();
        await user.keyboard('{Enter}');
        // Native <button> activates onClick on Enter → handleRemove → onChange.
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('Space on a focused chip remove button fires onChange (D-02a paired keyboard)', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a']}
                onChange={onChange}
            />,
        );
        const removeBtn = screen.getByRole('button', { name: /remove apple/i });
        removeBtn.focus();
        await user.keyboard(' ');
        // Native <button> activates onClick on Space → handleRemove → onChange.
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it.each([
        // APG specifies Space toggles the focused option WITHOUT moving focus
        // (TC-11-IMPL). Source has no Space branch — it inserts a literal
        // space character into the input. No-throw stub per D-01.
        { name: 'Space (APG: toggle option; source: inserts literal space)', key: ' ' },
        // APG specifies Shift+ArrowDown/Up extends contiguous selection
        // (TC-11-IMPL). Source has no Shift branch — Shift is ignored, the
        // un-modified Arrow branch runs. No-throw stub.
        { name: 'Shift+ArrowDown (APG: extend selection; source: plain ArrowDown)', key: '{Shift>}{ArrowDown}{/Shift}' },
        { name: 'Shift+ArrowUp (APG: extend selection; source: plain ArrowUp)', key: '{Shift>}{ArrowUp}{/Shift}' },
    ])(
        'APG-gap keystroke does not throw on the focused input — $name (deferred to TC-11-IMPL)',
        async ({ key }) => {
            const user = userEvent.setup();
            render(
                <MultiSelect
                    label="Pick fruits"
                    options={OPTIONS}
                    selected={[]}
                    onChange={() => {}}
                />,
            );
            const input = screen.getByRole('combobox');
            await user.click(input);
            await user.keyboard(key);
            // Component still mounted and input still reachable.
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        },
    );

    it('axe-clean for default render (selected=[])', async () => {
        const { container } = render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={[]}
                onChange={() => {}}
            />,
        );
        await expectNoAxeViolations(container);
    });

    it('axe-clean for with-selection render (selected=["a", "b"])', async () => {
        const { container } = render(
            <MultiSelect
                label="Pick fruits"
                options={OPTIONS}
                selected={['a', 'b']}
                onChange={() => {}}
            />,
        );
        await expectNoAxeViolations(container);
    });

    it('two MultiSelect instances on the same page produce no duplicate ids', () => {
        const { container } = render(
            <>
                <MultiSelect
                    label="Pick fruits"
                    options={OPTIONS}
                    selected={[]}
                    onChange={() => {}}
                />
                <MultiSelect
                    label="Pick sizes"
                    options={[
                        { value: 's', label: 'Small' },
                        { value: 'l', label: 'Large' },
                    ]}
                    selected={[]}
                    onChange={() => {}}
                />
            </>,
        );
        // useId() guarantees per-instance prefix; assertion proves nothing
        // collides on `${id}-listbox` / `${id}-label` / `${id}-option-N`.
        expectUniqueIds(container);
    });
});
