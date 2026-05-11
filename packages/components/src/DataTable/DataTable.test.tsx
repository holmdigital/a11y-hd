// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — native <table> + <caption>, scope="col" on
 *   every <th>, role=columnheader exposed by the table semantics.
 * - 2.1.1 Keyboard — sortable headers are real <button>s, so Enter + Space
 *   activate them natively (paired keyboard per D-02a). Cell-arrow APG
 *   navigation is not implemented in source; covered by a no-throw stub
 *   (see Implementation note below).
 * - 4.1.2 Name, Role, Value — role=table from <table>, role=columnheader from
 *   <th>, role=button on sortable headers, aria-sort cycling
 *   undefined→ascending→descending, aria-hidden on the sort-indicator glyph.
 *
 * NOT covered here (intentional, source has no implementation):
 * - 4.1.3 Status Messages — no live region announces sort changes.
 * - 2.4.3 Focus Order — cells are non-focusable <td>; no roving tabindex.
 *
 * Implementation note (TC-12-IMPL backlog, deferred to v0.7):
 *   - APG grid cell-arrow keyboard navigation (ArrowLeft/Right/Up/Down between
 *     cells, Home/End for row bounds, Ctrl+Home/End for table bounds,
 *     PageUp/PageDown) is NOT implemented in source — cells are non-focusable
 *     <td> with no onKeyDown handler.
 *   - The Tier-2 cell-arrow tests below use the `fireEvent.keyDown` escape
 *     hatch (RESEARCH §5) because userEvent.keyboard requires a focusable
 *     target and a bare <td> cannot receive focus.
 *   - APG grid roles (`role="grid"`, `role="gridcell"`, `role="row"`) are NOT
 *     applied — source uses native table semantics, which is acceptable for a
 *     static table but is a gap relative to the full APG data-grid pattern.
 *   - `scope="row"` is NOT applied to first-column cells — source has no
 *     row-header support. This gap is OUTSIDE TC-12-IMPL scope and is tracked
 *     separately.
 *   - The sortable-header contract (aria-sort cycling + native Enter/Space on
 *     a real <button>) IS the strongest implemented APG surface and is tested
 *     for real here so a future refactor cannot silently regress it.
 *
 * Template note: mirrors Button.test.tsx Tier-1 shape; Tier-2 adds the
 * partial-stub strategy per D-01 for surface DataTable does not yet
 * implement (cell-arrow nav).
 */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { DataTable, type Column } from './DataTable';
import { expectNoAxeViolations } from '../_test/helpers';

interface Row {
    name: string;
    age: number;
    email: string;
}

const DATA: Row[] = [
    { name: 'Charlie', age: 30, email: 'c@x.com' },
    { name: 'Alice', age: 25, email: 'a@x.com' },
    { name: 'Bob', age: 28, email: 'b@x.com' },
];

const COLUMNS: Column<Row>[] = [
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Age', accessor: 'age', sortable: true },
    { header: 'Email', accessor: 'email', sortable: false },
];

describe('Tier 1: Table Stakes', () => {
    it('mounts a <table> with the supplied caption as its accessible name', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const table = screen.getByRole('table', { name: /users/i });
        expect(table).toBeInTheDocument();
    });

    it('renders one <th scope="col"> per column (3 columnheaders, all scope=col)', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const headers = screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(3);
        headers.forEach((h) => expect(h).toHaveAttribute('scope', 'col'));
    });

    it('renders one <tr> per data row plus the header row', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const rows = screen.getAllByRole('row');
        // 1 header row + 3 data rows
        expect(rows).toHaveLength(DATA.length + 1);
    });

    it('cells render via String(row[accessor]) by default AND via custom column.render() when provided', () => {
        const cols: Column<Row>[] = [
            { header: 'Name', accessor: 'name' },
            {
                header: 'Age',
                accessor: 'age',
                render: (r) => <span data-testid="age-cell">{r.age} yrs</span>,
            },
        ];
        render(<DataTable data={[DATA[0]]} columns={cols} caption="Users" />);
        // Default String() path
        expect(screen.getByRole('cell', { name: 'Charlie' })).toBeInTheDocument();
        // Custom render path
        expect(screen.getByTestId('age-cell')).toHaveTextContent('30 yrs');
    });

    it('className passes through additively on the outer wrapper <div> (not the table)', () => {
        const { container } = render(
            <DataTable data={DATA} columns={COLUMNS} caption="Users" className="consumer-class" />,
        );
        const table = screen.getByRole('table', { name: /users/i });
        // className lives on the outer wrapper, not the <table>.
        expect(table.className).not.toContain('consumer-class');
        // The outer wrapper is the firstElementChild of the render container.
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('consumer-class');
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('sortable column header renders as a <button> reachable by accessible name', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        // "Name" column is sortable → header wraps a real <button>.
        expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /age/i })).toBeInTheDocument();
    });

    it('non-sortable column header renders as plain text (no button)', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        // "Email" column is non-sortable → no button for it.
        expect(screen.queryByRole('button', { name: /email/i })).not.toBeInTheDocument();
        // It still appears as a columnheader.
        expect(screen.getByRole('columnheader', { name: /email/i })).toBeInTheDocument();
    });

    it('clicking a sortable header sets aria-sort="ascending" on first click', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        // Initial: no aria-sort attribute (source emits undefined).
        expect(nameHeader).not.toHaveAttribute('aria-sort');

        await user.click(screen.getByRole('button', { name: /name/i }));
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('clicking the same sortable header twice toggles ascending → descending', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        const nameBtn = screen.getByRole('button', { name: /name/i });

        await user.click(nameBtn);
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
        await user.click(nameBtn);
        expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('clicking a different sortable header resets to ascending AND clears aria-sort on previous column', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        const ageHeader = screen.getByRole('columnheader', { name: /age/i });

        await user.click(screen.getByRole('button', { name: /name/i }));
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

        await user.click(screen.getByRole('button', { name: /age/i }));
        expect(ageHeader).toHaveAttribute('aria-sort', 'ascending');
        // Previous column no longer carries aria-sort.
        expect(nameHeader).not.toHaveAttribute('aria-sort');
    });

    it('data rows reorder when sort is applied (first row text shifts)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        // Initial order: Charlie, Alice, Bob (as in DATA).
        const initialRows = screen.getAllByRole('row');
        expect(initialRows[1]).toHaveTextContent(/charlie/i);

        await user.click(screen.getByRole('button', { name: /name/i }));
        // After ascending sort by name: Alice, Bob, Charlie.
        const sortedAsc = screen.getAllByRole('row');
        expect(sortedAsc[1]).toHaveTextContent(/alice/i);
        expect(sortedAsc[3]).toHaveTextContent(/charlie/i);

        await user.click(screen.getByRole('button', { name: /name/i }));
        // Descending: Charlie, Bob, Alice.
        const sortedDesc = screen.getAllByRole('row');
        expect(sortedDesc[1]).toHaveTextContent(/charlie/i);
        expect(sortedDesc[3]).toHaveTextContent(/alice/i);
    });

    it('Enter on the focused sort button fires the sort transition (WCAG 2.1.1 — native button)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        const nameBtn = screen.getByRole('button', { name: /name/i });

        nameBtn.focus();
        expect(document.activeElement).toBe(nameBtn);
        await user.keyboard('{Enter}');

        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('Space on the focused sort button fires the sort transition (D-02a paired keyboard)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        const nameBtn = screen.getByRole('button', { name: /name/i });

        nameBtn.focus();
        await user.keyboard(' ');

        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    // RESEARCH §5 escape hatch: <td> is not focusable so userEvent.keyboard
    // cannot dispatch to it. We use fireEvent.keyDown to prove the source does
    // not throw on APG-grid cell-arrow keystrokes — this is a no-throw STUB
    // (per D-01), not real keyboard coverage. Flips to userEvent + focus
    // assertions when TC-12-IMPL ships roving tabindex on cells in v0.7.
    it.each([
        ['ArrowDown'],
        ['ArrowUp'],
        ['ArrowRight'],
        ['ArrowLeft'],
        ['Home'],
        ['End'],
        ['PageUp'],
        ['PageDown'],
    ])(
        'no-throw stub: %s on a cell does not throw (TC-12-IMPL gap — non-focusable <td>)',
        (key) => {
            render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
            const firstCell = screen.getAllByRole('cell')[0];
            // fireEvent escape hatch — see comment block above.
            expect(() => fireEvent.keyDown(firstCell, { key })).not.toThrow();
            expect(screen.getByRole('table', { name: /users/i })).toBeInTheDocument();
        },
    );

    it('no-throw stub: Ctrl+Home and Ctrl+End on a cell do not throw (TC-12-IMPL gap)', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const firstCell = screen.getAllByRole('cell')[0];
        // fireEvent escape hatch (RESEARCH §5) — <td> is non-focusable.
        expect(() =>
            fireEvent.keyDown(firstCell, { key: 'Home', ctrlKey: true }),
        ).not.toThrow();
        expect(() =>
            fireEvent.keyDown(firstCell, { key: 'End', ctrlKey: true }),
        ).not.toThrow();
        expect(screen.getByRole('table', { name: /users/i })).toBeInTheDocument();
    });

    it('sort indicator glyph is hidden from AT (button accessible name omits ▲/▼/↕)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        // If the glyph were NOT aria-hidden, the accessible name would include
        // "↕"/"▲"/"▼" and a strict /^Name$/ regex would fail. Anchored regex
        // proves the indicator is excluded from the accessible name in BOTH
        // unsorted and sorted states.
        expect(screen.getByRole('button', { name: /^Name$/ })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /^Name$/ }));
        // After sort, indicator becomes ▲ but accessible name must still be "Name".
        expect(screen.getByRole('button', { name: /^Name$/ })).toBeInTheDocument();
    });

    it('axe-clean for default render (no sort applied)', async () => {
        const { container } = render(
            <DataTable data={DATA} columns={COLUMNS} caption="Users" />,
        );
        await expectNoAxeViolations(container);
    });

    it('axe-clean for sorted render (after clicking a sortable header)', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <DataTable data={DATA} columns={COLUMNS} caption="Users" />,
        );
        await user.click(screen.getByRole('button', { name: /name/i }));
        await expectNoAxeViolations(container);
    });
});
