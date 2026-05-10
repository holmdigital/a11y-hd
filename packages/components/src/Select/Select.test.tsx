// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 2.1.1 Keyboard — APG listbox keyboard contract (arrows, Home/End, type-ahead)
 * - 2.4.3 Focus Order — focus stays on trigger; activedescendant pattern
 * - 4.1.2 Name, Role, Value — role="listbox", aria-expanded, aria-activedescendant
 */
import { useState } from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Select, SelectTrigger, SelectContent, SelectItem } from './Select';

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

const Harness = () => {
    const [value, setValue] = useState('');
    return (
        <Select value={value} onChange={setValue}>
            <SelectTrigger>{value || undefined}</SelectTrigger>
            <SelectContent>
                {FRUITS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
        </Select>
    );
};

describe('Select — APG Listbox keyboard contract', () => {
    afterEach(() => cleanup());

    it('aria-controls links the trigger to the listbox id, both unique per instance', () => {
        const { container } = render(
            <>
                <Harness />
                <Harness />
            </>
        );
        const triggers = container.querySelectorAll('button[aria-haspopup="listbox"]');
        expect(triggers).toHaveLength(2);
        const controls = Array.from(triggers).map(t => t.getAttribute('aria-controls'));
        expect(controls[0]).not.toBeNull();
        expect(controls[1]).not.toBeNull();
        expect(controls[0]).not.toBe(controls[1]);
    });

    it('opens on ArrowDown and exposes aria-activedescendant', () => {
        const { getByRole, queryByRole } = render(<Harness />);
        const trigger = getByRole('button');

        fireEvent.keyDown(trigger, { key: 'ArrowDown' });
        const listbox = queryByRole('listbox');
        expect(listbox).not.toBeNull();
        // First option should be highlighted, surfaced via aria-activedescendant on the trigger.
        const activeId = trigger.getAttribute('aria-activedescendant');
        expect(activeId).not.toBeNull();
        expect(document.getElementById(activeId!)).not.toBeNull();
    });

    it('Home jumps to the first option, End to the last', () => {
        const { getByRole } = render(<Harness />);
        const trigger = getByRole('button');
        fireEvent.keyDown(trigger, { key: 'ArrowDown' });
        fireEvent.keyDown(trigger, { key: 'End' });
        const lastDescendant = trigger.getAttribute('aria-activedescendant');
        const lastOption = document.getElementById(lastDescendant!);
        expect(lastOption?.textContent?.trim()).toBe('Elderberry');

        fireEvent.keyDown(trigger, { key: 'Home' });
        const firstDescendant = trigger.getAttribute('aria-activedescendant');
        const firstOption = document.getElementById(firstDescendant!);
        expect(firstOption?.textContent?.trim()).toBe('Apple');
    });

    it('type-ahead jumps to the first option starting with the typed prefix', () => {
        const { getByRole } = render(<Harness />);
        const trigger = getByRole('button');
        // Open the listbox first (ArrowDown), then type-ahead to a matching option.
        fireEvent.keyDown(trigger, { key: 'ArrowDown' });
        fireEvent.keyDown(trigger, { key: 'C' });
        const activeId = trigger.getAttribute('aria-activedescendant');
        const option = document.getElementById(activeId!);
        expect(option?.textContent?.trim()).toBe('Cherry');
    });

    it('Escape closes the listbox and stops propagation (does not double-close ancestor handlers)', () => {
        let ancestorEscape = 0;
        const { getByRole, queryByRole } = render(
            <div onKeyDown={(e) => { if (e.key === 'Escape') ancestorEscape += 1; }}>
                <Harness />
            </div>
        );
        const trigger = getByRole('button');
        fireEvent.keyDown(trigger, { key: 'ArrowDown' });
        expect(queryByRole('listbox')).not.toBeNull();
        fireEvent.keyDown(trigger, { key: 'Escape' });
        expect(queryByRole('listbox')).toBeNull();
        expect(ancestorEscape).toBe(0);
    });
});
