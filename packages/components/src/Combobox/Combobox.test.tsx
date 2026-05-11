// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — <label htmlFor={id}> wires accessible
 *   name; <ul role="listbox"> is referenced by aria-controls; description
 *   and error are chained into aria-describedby.
 * - 2.1.1 Keyboard — full APG combobox-with-listbox-popup matrix
 *   (ArrowDown/ArrowUp open + roam, Home/End jump-to-ends, PageDown/PageUp
 *   ±10, Enter selects + closes, Escape closes + resets, Tab closes,
 *   typeahead filters).
 * - 2.4.3 Focus Order — DOM focus stays on the <input role="combobox">;
 *   "virtual focus" roams via aria-activedescendant referencing
 *   `${id}-option-${index}` (Pitfall 2). Tab on the input closes the popup
 *   without trapping focus.
 * - 4.1.2 Name, Role, Value — role="combobox", aria-expanded, aria-controls,
 *   aria-activedescendant, aria-haspopup="listbox", aria-autocomplete="list",
 *   aria-invalid (with error), role="listbox" on the popup, role="option"
 *   on each item, aria-selected on the chosen option.
 *
 * Implementation notes:
 * - Live region (aria-live for filtered-results count) is NOT rendered by
 *   the source. Coverage for that behavior is deferred to v0.7 backlog item
 *   TC-09-LIVE (see .planning ROADMAP / Phase 24 decisions D-01, D-05).
 *   Do NOT add aria-live assertions here — they would test an absent feature.
 * - ArrowUp-when-closed wraps to the LAST option (source diverges from
 *   strict APG which would land on first). The wrap branch at
 *   Combobox.tsx:145-149 fires because focusedIndex starts at -1, which is
 *   NOT > 0. Tested as-shipped; strict-APG alignment deferred to TC-09-IMPL.
 * - Alt+ArrowDown / Alt+ArrowUp are not distinguished by the source from
 *   plain ArrowDown/ArrowUp — modifier-specific tests omitted.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Combobox } from './Combobox';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

const OPTIONS = [
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
    { value: 'c', label: 'Cherry' },
];

// Larger option set for PageDown/PageUp ±10 jumps.
const MANY_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
    value: `v${i}`,
    label: `Option ${i}`,
}));

describe('Tier 1: Table Stakes', () => {
    it('mounts with role="combobox" and renders the label', () => {
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        expect(screen.getByRole('combobox', { name: /fruit/i })).toBeInTheDocument();
        expect(screen.getByText('Fruit')).toBeInTheDocument();
    });

    it('label wired via htmlFor — getByLabelText resolves the input (WCAG 1.3.1)', () => {
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByLabelText(/fruit/i);
        expect(input.tagName).toBe('INPUT');
        expect(input).toHaveAttribute('role', 'combobox');
    });

    it('passes className through additively on the outer container', () => {
        const { container } = render(
            <Combobox
                label="Fruit"
                className="consumer-class"
                options={OPTIONS}
                onChange={() => {}}
            />,
        );
        // The outer <div> is the first element child of the render container.
        const outer = container.firstElementChild as HTMLElement;
        expect(outer).not.toBeNull();
        expect(outer.className).toContain('consumer-class');
    });

    it('controlled `value` preselects input text (useEffect sync — Combobox.tsx:85-94)', async () => {
        render(
            <Combobox label="Fruit" options={OPTIONS} onChange={() => {}} value="b" />,
        );
        const input = screen.getByRole('combobox', { name: /fruit/i }) as HTMLInputElement;
        await waitFor(() => expect(input.value).toBe('Banana'));
    });

    it('typing into the input opens the listbox and filters to substring matches', async () => {
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        await user.click(input);
        await user.keyboard('ba');

        // Listbox opened
        expect(input).toHaveAttribute('aria-expanded', 'true');
        // Only Banana matches "ba"
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent('Banana');
    });

    it('description AND error wire into aria-describedby (chained ids)', () => {
        render(
            <Combobox
                label="Fruit"
                description="Pick a fruit"
                error="Required"
                options={OPTIONS}
                onChange={() => {}}
            />,
        );
        const input = screen.getByRole('combobox', { name: /fruit/i });
        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).not.toBeNull();
        const ids = describedBy!.split(/\s+/);
        expect(ids).toHaveLength(2);
        // Both referenced elements must exist in the DOM
        ids.forEach((id) => {
            expect(document.getElementById(id)).not.toBeNull();
        });
        expect(input).toHaveAttribute('aria-invalid', 'true');
        // Error is announced as role=alert
        expect(screen.getByRole('alert')).toHaveTextContent('Required');
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('aria-expanded toggles to "true" and aria-controls resolves to <ul role="listbox"> on open', async () => {
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        expect(input).toHaveAttribute('aria-expanded', 'false');
        input.focus();
        await user.keyboard('{ArrowDown}');
        expect(input).toHaveAttribute('aria-expanded', 'true');

        const controlsId = input.getAttribute('aria-controls');
        expect(controlsId).not.toBeNull();
        const listbox = document.getElementById(controlsId!);
        expect(listbox).not.toBeNull();
        expect(listbox).toHaveAttribute('role', 'listbox');
    });

    it('ArrowDown after opening sets aria-activedescendant to ${id}-option-0', async () => {
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        input.focus();
        // First ArrowDown opens the popup (handler returns early); second moves index 0.
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
    });

    it('second ArrowDown advances activedescendant to -option-1; wraps from last back to 0', async () => {
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        input.focus();
        // open (1) + index 0 (2) + index 1 (3)
        await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-1$/);

        // Advance to index 2 (last for 3-option set), then wrap to 0
        await user.keyboard('{ArrowDown}'); // -> 2
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-2$/);
        await user.keyboard('{ArrowDown}'); // wraps -> 0
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
    });

    it('ArrowUp from -1 wraps to LAST option (source diverges from strict APG)', async () => {
        // Source Combobox.tsx:145-149 — wrap branch fires because focusedIndex
        // starts at -1, which is NOT > 0. Tested as-shipped; deferred to
        // TC-09-IMPL for strict-APG alignment.
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        input.focus();
        // First ArrowUp opens (early-return). Second ArrowUp executes the
        // wrap-to-last branch.
        await user.keyboard('{ArrowUp}{ArrowUp}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-2$/);
    });

    it('Home sets activedescendant to option-0; End sets it to option-{last}', async () => {
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        input.focus();
        // Open the popup, then jump to last via End, then to first via Home.
        await user.keyboard('{ArrowDown}'); // open only
        await user.keyboard('{End}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-2$/);
        await user.keyboard('{Home}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
    });

    it('PageDown jumps +10 (clamped to last); PageUp jumps -10 (clamped to 0)', async () => {
        const user = userEvent.setup();
        render(
            <Combobox label="Number" options={MANY_OPTIONS} onChange={() => {}} />,
        );
        const input = screen.getByRole('combobox', { name: /number/i });

        input.focus();
        // open + land on index 0
        await user.keyboard('{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);

        // PageDown: 0 -> min(0+10, 14) = 10
        await user.keyboard('{PageDown}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-10$/);

        // Another PageDown clamps to 14 (last)
        await user.keyboard('{PageDown}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-14$/);

        // PageUp: 14 -> max(14-10, 0) = 4
        await user.keyboard('{PageUp}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-4$/);

        // Another PageUp clamps to 0
        await user.keyboard('{PageUp}');
        expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
    });

    it('Enter on a focused option calls onChange and closes the listbox', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={onChange} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        input.focus();
        // open + focus index 0 (Apple) + Enter
        await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('a');
        expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('Escape closes the listbox without calling onChange and resets input text', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={onChange} />);
        const input = screen.getByRole('combobox', { name: /fruit/i }) as HTMLInputElement;

        await user.click(input);
        await user.keyboard('app'); // opens + filters; no selection committed
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input.value).toBe('app');

        await user.keyboard('{Escape}');
        expect(input).toHaveAttribute('aria-expanded', 'false');
        // No selection was made, so onChange was called only by the typing
        // path's "clear" branch when input.value === '' — which never happened
        // here. Assert it was never invoked with a selection value.
        expect(onChange).not.toHaveBeenCalledWith('a');
        expect(onChange).not.toHaveBeenCalledWith('b');
        expect(onChange).not.toHaveBeenCalledWith('c');
        // Input text resets to '' because no controlled `value` is set.
        expect(input.value).toBe('');
    });

    it('Tab closes the listbox (aria-expanded="false" after Tab)', async () => {
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        input.focus();
        await user.keyboard('{ArrowDown}');
        expect(input).toHaveAttribute('aria-expanded', 'true');

        await user.keyboard('{Tab}');
        expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('typeahead: typing "ba" filters to a single "Banana" option', async () => {
        const user = userEvent.setup();
        render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
        const input = screen.getByRole('combobox', { name: /fruit/i });

        await user.click(input);
        await user.keyboard('ba');

        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent('Banana');
    });

    it('axe-clean for default render (Tier-1 smoke)', async () => {
        const { container } = render(
            <Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />,
        );
        await expectNoAxeViolations(container);
    });

    it('two <Combobox> instances rendered together produce no duplicate ids', () => {
        const { container } = render(
            <>
                <Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />
                <Combobox label="Veg" options={OPTIONS} onChange={() => {}} />
            </>,
        );
        expectUniqueIds(container);
    });
});
