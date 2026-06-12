// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — native <table> + <caption>, scope="col" on
 *   every <th>, role="grid" / role="row" / role="columnheader" /
 *   role="gridcell" overlay.
 * - 2.1.1 Keyboard — full APG grid keyboard matrix: Arrow (L/R/U/D) for
 *   cell-wise navigation, Home/End for row bounds, Ctrl+Home/Ctrl+End for
 *   table corners, PageUp/PageDown for 10-row paging. Enter/Space on a
 *   focused sortable <th> delegates to the sort handler (D-03). The
 *   sortable-header inner <button> is tabIndex={-1} (NOT a document Tab
 *   stop); keyboard sort is delegated through the focused roving header
 *   cell (D-03), not by tabbing to the inner button. The new "Tier 2:
 *   Single Tab Stop" describe block guards the single-tab-stop contract
 *   (previously a test blind spot — no userEvent.tab() coverage existed
 *   before this plan, which is why UAT Test 1 shipped with a violation).
 * - 4.1.2 Name, Role, Value — role=grid, role=columnheader (aria-sort
 *   cycling undefined→ascending→descending), role=gridcell, role=button on
 *   sortable headers, aria-hidden on the sort-indicator glyph.
 *
 * NOT covered here (intentional, source has no implementation):
 * - 4.1.3 Status Messages — no live region announces sort changes.
 *
 * Phase 30 (v0.7) shipped the full APG grid keyboard contract — the Phase 24
 * no-throw stubs at L219-250 are replaced by real focus assertions in the
 * "Tier 2: APG Grid Cell-Wise Keyboard Navigation" describe block below.
 */
import { render, screen, waitFor } from '@testing-library/react';
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

// 15-row fixture for PageUp/PageDown tests — the default DATA has only 3 rows
// which is too few to exercise the 10-row PAGE_SIZE jump.
const LARGE_DATA: Row[] = Array.from({ length: 15 }, (_, i) => ({
    name: `User${i.toString().padStart(2, '0')}`,
    age: 20 + i,
    email: `u${i}@x.com`,
}));

describe('Tier 1: Table Stakes', () => {
    it('mounts a <table> with the supplied caption as its accessible name', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const table = screen.getByRole('grid', { name: /users/i });
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
        expect(screen.getByRole('gridcell', { name: 'Charlie' })).toBeInTheDocument();
        // Custom render path
        expect(screen.getByTestId('age-cell')).toHaveTextContent('30 yrs');
    });

    it('className passes through additively on the outer wrapper <div> (not the table)', () => {
        const { container } = render(
            <DataTable data={DATA} columns={COLUMNS} caption="Users" className="consumer-class" />,
        );
        const table = screen.getByRole('grid', { name: /users/i });
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

describe('Tier 2: APG Grid Cell-Wise Keyboard Navigation', () => {
    it('ArrowRight from header col 0 moves focus to header col 1 (roving tabindex flips)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        expect(nameHeader).toHaveAttribute('tabindex', '0');
        nameHeader.focus();
        expect(nameHeader).toHaveFocus();

        await user.keyboard('{ArrowRight}');

        const ageHeader = screen.getByRole('columnheader', { name: /age/i });
        expect(ageHeader).toHaveFocus();
        expect(ageHeader).toHaveAttribute('tabindex', '0');
        expect(nameHeader).toHaveAttribute('tabindex', '-1');
    });

    it('ArrowLeft from header col 1 moves focus to header col 0', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const ageHeader = screen.getByRole('columnheader', { name: /age/i });
        ageHeader.click();
        ageHeader.focus();

        await user.keyboard('{ArrowLeft}');

        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        expect(nameHeader).toHaveFocus();
        expect(nameHeader).toHaveAttribute('tabindex', '0');
    });

    it('ArrowDown from header col 0 moves focus to data row 0 col 0 (Charlie cell)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();

        await user.keyboard('{ArrowDown}');

        const charlieCell = screen.getByRole('gridcell', { name: 'Charlie' });
        expect(charlieCell).toHaveFocus();
        expect(charlieCell).toHaveAttribute('tabindex', '0');
    });

    it('ArrowUp from data row 0 col 0 moves focus back to header col 0', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const charlieCell = screen.getByRole('gridcell', { name: 'Charlie' });
        charlieCell.click();
        charlieCell.focus();

        await user.keyboard('{ArrowUp}');

        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        expect(nameHeader).toHaveFocus();
    });

    it('ArrowRight at last col is clamped (no focus change)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const emailHeader = screen.getByRole('columnheader', { name: /email/i });
        emailHeader.click();
        emailHeader.focus();

        await user.keyboard('{ArrowRight}');

        expect(emailHeader).toHaveFocus();
        expect(emailHeader).toHaveAttribute('tabindex', '0');
    });

    it('ArrowLeft at col 0 is clamped', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();

        await user.keyboard('{ArrowLeft}');

        expect(nameHeader).toHaveFocus();
        expect(nameHeader).toHaveAttribute('tabindex', '0');
    });

    it('ArrowDown at last data row is clamped', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const lastCell = screen.getByRole('gridcell', { name: 'b@x.com' });
        lastCell.click();
        lastCell.focus();

        await user.keyboard('{ArrowDown}');

        expect(lastCell).toHaveFocus();
    });

    it('ArrowUp at header row is clamped', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();

        await user.keyboard('{ArrowUp}');

        expect(nameHeader).toHaveFocus();
    });

    it('Home moves focus to col 0 of current row', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const emailHeader = screen.getByRole('columnheader', { name: /email/i });
        emailHeader.click();
        emailHeader.focus();

        await user.keyboard('{Home}');

        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        expect(nameHeader).toHaveFocus();
    });

    it('End moves focus to last col of current row', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();

        await user.keyboard('{End}');

        const emailHeader = screen.getByRole('columnheader', { name: /email/i });
        expect(emailHeader).toHaveFocus();
    });

    it('Ctrl+Home from anywhere moves focus to header col 0', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const lastCell = screen.getByRole('gridcell', { name: 'b@x.com' });
        lastCell.click();
        lastCell.focus();

        await user.keyboard('{Control>}{Home}{/Control}');

        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        expect(nameHeader).toHaveFocus();
    });

    it('Ctrl+End from anywhere moves focus to last data row last col', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();

        await user.keyboard('{Control>}{End}{/Control}');

        // DATA[2].email = 'b@x.com' is the last data row last col cell.
        const target = screen.getByRole('gridcell', { name: 'b@x.com' });
        expect(target).toHaveFocus();
    });

    it('PageDown from header (row=-1) jumps to data row 9 (min(-1+10, lastDataRow=14))', async () => {
        const user = userEvent.setup();
        render(<DataTable data={LARGE_DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();

        await user.keyboard('{PageDown}');

        // Header row = -1, so PageDown lands at min(-1 + PAGE_SIZE=10, 14) = 9.
        const target = screen.getByRole('gridcell', { name: 'User09' });
        expect(target).toHaveFocus();
    });

    it('PageUp from data row 14 jumps to data row 4 (max(14-10, -1))', async () => {
        const user = userEvent.setup();
        render(<DataTable data={LARGE_DATA} columns={COLUMNS} caption="Users" />);
        const user14 = screen.getByRole('gridcell', { name: 'User14' });
        user14.click();
        user14.focus();

        await user.keyboard('{PageUp}');

        const target = screen.getByRole('gridcell', { name: 'User04' });
        expect(target).toHaveFocus();
    });

    it('Enter on a focused sortable <th> triggers sort (D-03 delegation via handleSort)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();
        expect(nameHeader).not.toHaveAttribute('aria-sort');

        await user.keyboard('{Enter}');
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

        await user.keyboard(' ');
        expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('clicking a data cell moves the roving anchor to that cell', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        expect(nameHeader).toHaveAttribute('tabindex', '0');

        const aliceCell = screen.getByRole('gridcell', { name: 'Alice' });
        await user.click(aliceCell);

        expect(aliceCell).toHaveAttribute('tabindex', '0');
        expect(nameHeader).toHaveAttribute('tabindex', '-1');
    });

    it('Arrow / Home / End / PageUp / PageDown / Ctrl+Home / Ctrl+End NEVER trigger sort (D-07)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();

        const keys = [
            '{ArrowRight}',
            '{ArrowLeft}',
            '{ArrowDown}',
            '{ArrowUp}',
            '{Home}',
            '{End}',
            '{PageDown}',
            '{PageUp}',
            '{Control>}{Home}{/Control}',
            '{Control>}{End}{/Control}',
        ];
        for (const k of keys) {
            await user.keyboard(k);
            // Name header must never gain aria-sort from these focus-only keys.
            expect(nameHeader).not.toHaveAttribute('aria-sort');
        }
    });
});

describe('Tier 2: Single Tab Stop (roving tabindex — gap closure 30-02)', () => {
    it('Test A: every sort button carries tabindex="-1" (structural guard)', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        // COLUMNS has Name (sortable) + Age (sortable) + Email (not sortable) → 2 sort buttons.
        const sortButtons = screen.getAllByRole('button');
        expect(sortButtons).toHaveLength(2);
        sortButtons.forEach((btn) => {
            expect(btn).toHaveAttribute('tabindex', '-1');
        });
    });

    it('Test B: Tab sequence — input → roving grid anchor → exits grid (no sort-button stop)', async () => {
        const user = userEvent.setup();
        // Render: [input before] [DataTable] [button after] — mirrors the APG Grid Keyboard story fixture.
        render(
            <>
                <input aria-label="before grid" />
                <DataTable data={DATA} columns={COLUMNS} caption="Users" />
                <button type="button">after grid</button>
            </>,
        );

        // Start: focus the input before the grid.
        const input = screen.getByRole('textbox');
        input.focus();
        expect(input).toHaveFocus();

        // First Tab: focus must land on the grid roving anchor (Name columnheader, tabindex=0).
        await user.tab();
        expect(screen.getByRole('columnheader', { name: /name/i })).toHaveFocus();

        // Second Tab: focus must EXIT the grid and land on the after-grid button.
        // If any sort button is in the page Tab order, this would land there instead — regression caught.
        await user.tab();
        expect(screen.getByRole('button', { name: /after grid/i })).toHaveFocus();
    });
});

describe('Tier 2: Code-Review Fix Regressions', () => {
    it('CR-01: clicking an input inside a gridcell keeps focus on the input (not the <td>)', async () => {
        const user = userEvent.setup();
        const cols: Column<Row>[] = [
            { header: 'Name', accessor: 'name', sortable: true },
            { header: 'Age', accessor: 'age', render: (_r) => <input aria-label="cell-input" /> },
            { header: 'Email', accessor: 'email' },
        ];
        render(<DataTable data={DATA} columns={cols} caption="Users" />);
        // Move anchor to the Age data cell in row 0
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        nameHeader.focus();
        await user.keyboard('{ArrowDown}');  // row 0, col 0
        await user.keyboard('{ArrowRight}'); // row 0, col 1
        // Click the input inside the cell
        const cellInput = screen.getAllByRole('textbox', { name: /cell-input/i })[0];
        await user.click(cellInput);
        expect(cellInput).toHaveFocus();
        // Arrow keys must not steal focus from the input
        await user.keyboard('{ArrowLeft}');
        // await-stable to avoid flake under CPU load
        await waitFor(() => {
            expect(cellInput).toHaveFocus();
            // aria-sort must not have appeared anywhere
            screen.getAllByRole('columnheader').forEach(h => expect(h).not.toHaveAttribute('aria-sort'));
        });
    });

    it('WR-01: Enter on Age sort button sorts Age column (not Name) — discriminating variant', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const ageBtn = screen.getByRole('button', { name: /^Age$/ });
        const ageHeader = screen.getByRole('columnheader', { name: /age/i });
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        ageBtn.focus();
        await user.keyboard('{Enter}');
        // await-stable to avoid flake under CPU load
        await waitFor(() => {
            expect(ageHeader).toHaveAttribute('aria-sort', 'ascending');
            expect(nameHeader).not.toHaveAttribute('aria-sort');
        });
    });

    it('CR-02: grid has exactly one tabindex=0 cell after data shrinks below anchor row', async () => {
        const { rerender } = render(<DataTable data={LARGE_DATA} columns={COLUMNS} caption="Users" />);
        // Move anchor to last row (row 14)
        const user14 = screen.getByRole('gridcell', { name: 'User14' });
        user14.click();
        user14.focus();
        // Shrink data to 3 rows — anchor row 14 no longer exists
        rerender(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        // Exactly one cell must have tabindex=0 — await-stable to avoid flake under CPU load
        await waitFor(() => {
            const allCells = [
                ...screen.getAllByRole('columnheader'),
                ...screen.getAllByRole('gridcell'),
            ];
            const tabZeroCells = allCells.filter(c => c.getAttribute('tabindex') === '0');
            expect(tabZeroCells).toHaveLength(1);
        });
    });

    it('IN-01a: Name columnheader has no data-state attribute on initial mount', () => {
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        expect(screen.getByRole('columnheader', { name: /name/i })).not.toHaveAttribute('data-state');
    });

    it('IN-01b: data-state="focused" appears when grid is focused and disappears after Tab-out', async () => {
        const user = userEvent.setup();
        render(
            <>
                <input aria-label="before" />
                <DataTable data={DATA} columns={COLUMNS} caption="Users" />
                <button type="button">after</button>
            </>
        );
        const input = screen.getByRole('textbox');
        input.focus();
        await user.tab();
        expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute('data-state', 'focused');
        await user.tab();
        expect(screen.getByRole('columnheader', { name: /name/i })).not.toHaveAttribute('data-state');
    });

    it('IN-03: clicking a columnheader moves roving anchor from gridcell to that columnheader', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const aliceCell = screen.getByRole('gridcell', { name: 'Alice' });
        await user.click(aliceCell);
        expect(aliceCell).toHaveAttribute('tabindex', '0');
        const ageHeader = screen.getByRole('columnheader', { name: /age/i });
        await user.click(ageHeader);
        expect(ageHeader).toHaveAttribute('tabindex', '0');
        expect(aliceCell).toHaveAttribute('tabindex', '-1');
    });

    it('IN-04: Space on non-sortable Email header suppresses scroll (header keeps focus, no aria-sort)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const emailHeader = screen.getByRole('columnheader', { name: /email/i });
        emailHeader.focus();
        await user.keyboard(' ');
        expect(emailHeader).toHaveFocus();
        expect(emailHeader).not.toHaveAttribute('aria-sort');
    });

    it('IN-04: Space on a gridcell suppresses scroll (cell keeps focus)', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        const charlieCell = screen.getByRole('gridcell', { name: 'Charlie' });
        charlieCell.focus();
        await user.keyboard(' ');
        expect(charlieCell).toHaveFocus();
    });

    it('IN-05: sort live region announces ascending sort on first click', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        await user.click(screen.getByRole('button', { name: /^Name$/ }));
        expect(await screen.findByText(/sorted by name, ascending/i)).toBeInTheDocument();
    });

    it('IN-05: sort live region announces descending sort on second click', async () => {
        const user = userEvent.setup();
        render(<DataTable data={DATA} columns={COLUMNS} caption="Users" />);
        await user.click(screen.getByRole('button', { name: /^Name$/ }));
        await user.click(screen.getByRole('button', { name: /^Name$/ }));
        expect(await screen.findByText(/sorted by name, descending/i)).toBeInTheDocument();
    });

    it('WR-03: null accessor value renders as empty string in gridcell', () => {
        const nullRow = { name: null as unknown as string, age: 0, email: '' };
        render(<DataTable data={[nullRow, DATA[0]]} columns={COLUMNS} caption="Users" />);
        // The null cell should render as empty, not the string 'null'
        const cells = screen.getAllByRole('gridcell');
        const nameCells = cells.filter((_, i) => i % 3 === 0);
        expect(nameCells[0]).not.toHaveTextContent('null');
    });

    it('WR-03: ascending sort by Name uses numeric-aware ordering (User2 before User10)', async () => {
        const user = userEvent.setup();
        const numericData: Row[] = [
            { name: 'User10', age: 1, email: 'u10@x.com' },
            { name: 'User2', age: 2, email: 'u2@x.com' },
        ];
        render(<DataTable data={numericData} columns={COLUMNS} caption="Users" />);
        await user.click(screen.getByRole('button', { name: /^Name$/ }));
        // await-stable read to avoid flake under CPU load
        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // With numeric:true localeCompare, "User2" < "User10" (2 < 10 numerically).
            // Without numeric sort, lexicographic order puts "User10" before "User2" ("1" < "2").
            expect(rows[1]).toHaveTextContent('User2');
            expect(rows[2]).toHaveTextContent('User10');
        });
    });

    it("sorts Swedish characters per sv collation — Åsa before Ängla (Å < Ä)", async () => {
        // Swedish collation: Å < Ä (Å sorts before Ä). With the old code-unit '<'
        // operator, Ä (U+00C4) < Å (U+00C5) — wrong order. With 'sv' localeCompare
        // the comparator places Å before Ä — the correct Swedish order.
        const user = userEvent.setup();
        const svData: Row[] = [
            { name: 'Ängla', age: 1, email: 'angla@x.com' },
            { name: 'Åsa', age: 2, email: 'asa@x.com' },
        ];
        render(<DataTable data={svData} columns={COLUMNS} caption="Users" />);
        await user.click(screen.getByRole('button', { name: /^Name$/ }));
        // Ascending sv sort: Åsa (Å) before Ängla (Ä)
        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            expect(rows[1]).toHaveTextContent('Åsa');
            expect(rows[2]).toHaveTextContent('Ängla');
        });
    });
});
