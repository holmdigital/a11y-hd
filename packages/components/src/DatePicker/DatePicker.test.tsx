// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — label is wired to the trigger button via
 *   `aria-labelledby`; description + error participate in `aria-describedby`
 *   (id-chain assertion).
 * - 4.1.2 Name, Role, Value — trigger button exposes name+role+state
 *   (aria-expanded, aria-controls); dialog has `role="dialog"`; calendar
 *   has `role="grid"`; day cells have `role="gridcell"` + `aria-selected`
 *   + `aria-current="date"` for today.
 *
 * Phase 28 Plan 01 — base render only. Plan 28-02 restores the keyboard
 * stub matrix as real APG assertions (and adds 2.1.1, 2.4.3, 2.4.7).
 * Plan 28-03 adds the live-region announcement (4.1.3, added then).
 *
 * Implementation note:
 *   28-01 ships popup cells with `tabIndex={-1}` and no roving — no
 *   keyboard user can enter the popup yet. Claiming 2.4.7 (focus visible)
 *   on cells that no keyboard user can focus would be a false claim;
 *   keyboard SCs are intentionally deferred to 28-02.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { DatePicker } from './DatePicker';
import { expectNoAxeViolations } from '../_test/helpers';

// TODO(Plan 28-02): restore Tier 1 + Tier 2 stub tests as real APG/focus
// assertions against the new custom calendar UI. Skipped here because the
// native <input type=date> they exercised has been replaced with a custom
// role=grid calendar (D-01).
describe.skip('Tier 1: Table Stakes (native-input baseline — Plan 28-02 restores as calendar assertions)', () => {
    it('mounts and the input has type="date"', () => {
        // PLACEHOLDER — see Plan 28-02 plan for the restoration target.
    });
});

// TODO(Plan 28-02): restore the APG_GRID_KEYS it.each matrix as REAL focus
// assertions (ArrowRight → next day, PageUp → prev month, etc.). Skipped
// because Plan 28-01 ships popup cells with tabIndex={-1} (no roving yet).
describe.skip('Tier 2: A11y Differentiators (APG no-throw stubs — Plan 28-02 restoration target)', () => {
    it('APG dialog-grid keystroke matrix (placeholder)', () => {
        // PLACEHOLDER — see Plan 28-02 plan for the restoration target.
    });
});

describe('base render (Plan 28-01)', () => {
    it('renders a trigger button whose accessible name comes from the label', () => {
        render(<DatePicker label="Birthday" />);
        // The trigger button's accessible name is derived from aria-labelledby → "Birthday".
        const trigger = screen.getByRole('button', { name: /birthday/i });
        expect(trigger).toBeInTheDocument();
        // Closed popup: trigger text is the placeholder, popup is absent.
        expect(trigger).toHaveTextContent(/pick a date/i);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('clicking the trigger opens a role=dialog popup containing a role=grid calendar', async () => {
        const user = userEvent.setup();
        render(<DatePicker label="Birthday" />);
        const trigger = screen.getByRole('button', { name: /birthday/i });
        await user.click(trigger);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        const grid = within(dialog).getByRole('grid');
        expect(grid).toBeInTheDocument();

        // Trigger reflects open state.
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('the grid renders exactly 42 role=gridcell day buttons (6 weeks × 7 days)', async () => {
        const user = userEvent.setup();
        render(<DatePicker label="Birthday" />);
        await user.click(screen.getByRole('button', { name: /birthday/i }));
        const dialog = screen.getByRole('dialog');
        const cells = within(dialog).getAllByRole('gridcell');
        expect(cells).toHaveLength(42);
    });

    it("today's cell carries aria-current='date' exactly once across the grid", async () => {
        const user = userEvent.setup();
        render(<DatePicker label="Birthday" />);
        await user.click(screen.getByRole('button', { name: /birthday/i }));
        const dialog = screen.getByRole('dialog');
        const cells = within(dialog).getAllByRole('gridcell');
        const todayCells = cells.filter((c) => c.getAttribute('aria-current') === 'date');
        expect(todayCells).toHaveLength(1);
    });

    it("passing value={2026-03-14} renders a cell with aria-selected='true' and visible text '14'", async () => {
        const user = userEvent.setup();
        render(<DatePicker label="Birthday" value={new Date(2026, 2, 14)} />);
        // Trigger label reflects the value (English long form).
        const trigger = screen.getByRole('button', { name: /birthday/i });
        expect(trigger).toHaveTextContent(/March/);
        expect(trigger).toHaveTextContent(/2026/);

        await user.click(trigger);
        const dialog = screen.getByRole('dialog');
        const cells = within(dialog).getAllByRole('gridcell');
        const selected = cells.filter((c) => c.getAttribute('aria-selected') === 'true');
        expect(selected).toHaveLength(1);
        expect(selected[0]).toHaveTextContent('14');
    });

    it('axe-clean smoke (closed-popup render)', async () => {
        const { container } = render(<DatePicker label="Birthday" />);
        await expectNoAxeViolations(container);
    });

    it('error renders with role="alert" and trigger has aria-invalid="true"', () => {
        render(<DatePicker label="Birthday" error="Required" />);
        const trigger = screen.getByRole('button', { name: /birthday/i });
        expect(trigger).toHaveAttribute('aria-invalid', 'true');
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/required/i);
    });

    it('description id appears in trigger aria-describedby', () => {
        render(<DatePicker label="Birthday" description="Use the calendar to pick" />);
        const trigger = screen.getByRole('button', { name: /birthday/i });
        const describedBy = trigger.getAttribute('aria-describedby');
        expect(describedBy).not.toBeNull();
        const descEl = screen.getByText(/use the calendar to pick/i);
        expect(describedBy!.split(/\s+/)).toContain(descEl.id);
    });
});
