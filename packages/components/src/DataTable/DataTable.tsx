import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';

const PAGE_SIZE = 10;

export interface Column<T> {
    /**
     * Header text to display
     */
    header: string;

    /**
     * Key to access data in the row object
     */
    accessor: keyof T;

    /**
     * Whether the column is sortable
     * @default false
     */
    sortable?: boolean;

    /**
     * Custom render function for the cell content
     */
    render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
    /**
     * The data array to display
     */
    data: T[];

    /**
     * Column definitions
     */
    columns: Column<T>[];

    /**
     * A descriptive caption for the table (required for accessibility)
     */
    caption: string;

    /**
     * Additional CSS class names
     */
    className?: string;
}

type SortDirection = 'ascending' | 'descending';

/**
 * Accessible DataTable with W3C APG grid keyboard contract.
 *
 * Phase 30 v0.7 — adds cell-wise Arrow keyboard navigation on top of the
 * existing sortable-header surface (unchanged).
 *
 * APG keyboard matrix (focus moves only — no sort side effects per D-07):
 * | Key                | Action                                                  |
 * |--------------------|---------------------------------------------------------|
 * | ArrowLeft / Right  | col ± 1 (clamped at 0 and lastCol)                      |
 * | ArrowUp / Down     | row ± 1 (clamped: header at -1, data ends at lastRow)   |
 * | Home               | col → 0 (current row)                                   |
 * | End                | col → lastCol (current row)                             |
 * | PageUp / PageDown  | row → max(r-10, -1) / min(r+10, lastDataRow)            |
 * | Ctrl+Home          | (row=-1, col=0)  — first <th>                           |
 * | Ctrl+End           | (row=lastDataRow, col=lastCol) — last <td>              |
 * | Enter / Space      | On sortable <th>: handleSort(accessor). Otherwise: no-op|
 *
 * Roving tabindex: the cell matching activeCell has tabindex=0; all others -1.
 * Click on a cell moves the roving anchor. Header row participates in roving
 * (D-02); sortable-header inner <button> carries tabIndex={-1} and is NOT a
 * document Tab stop — the grid is a single Tab stop (the roving anchor). The
 * button is reachable via grid navigation + Enter/Space (D-03) and via mouse
 * click; it is intentionally removed from the page Tab sequence per the W3C
 * APG Grid pattern.
 *
 * @wcag
 * - 1.3.1 Info and Relationships — native <table> structure + role="grid" /
 *   role="row" / role="columnheader" / role="gridcell" overlay; scope="col"
 *   preserved on every <th>.
 * - 2.1.1 Keyboard — full APG grid keyboard matrix above; keyboard sort is
 *   delegated through the roving header cell via Enter/Space (D-03), not by
 *   tabbing to the inner button; the inner button is tabIndex={-1} and is
 *   not in the page Tab order.
 * - 4.1.2 Name, Role, Value — role=grid, role=columnheader (with aria-sort
 *   cycling), role=gridcell, role=button on sortable headers, aria-hidden on
 *   sort-indicator glyph.
 *
 * Single-tab-stop contract restored in the Phase 30 gap-closure pass — see 30-02-PLAN.md / 30-UAT.md Test 1.
 */
export function DataTable<T>({
    data,
    columns,
    caption,
    className = ''
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T | null;
        direction: SortDirection;
    }>({ key: null, direction: 'ascending' });

    const handleSort = (key: keyof T) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key!];
            const bValue = b[sortConfig.key!];

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({ row: -1, col: 0 });
    const activeCellRef = useRef(activeCell);
    useEffect(() => { activeCellRef.current = activeCell; }, [activeCell]);
    const cellRefs = useRef<Map<string, HTMLElement>>(new Map());
    const hasUserMovedRef = useRef(false);

    const lastDataRow = sortedData.length - 1;
    const lastCol = columns.length - 1;

    const isActive = (row: number, col: number) =>
        activeCell.row === row && activeCell.col === col;

    useLayoutEffect(() => {
        if (!hasUserMovedRef.current) return;
        const key = `${activeCell.row}:${activeCell.col}`;
        cellRefs.current.get(key)?.focus();
    }, [activeCell]);

    const onGridKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
        const { row, col } = activeCellRef.current;
        let next: { row: number; col: number } | null = null;

        switch (e.key) {
            case 'ArrowLeft':
                next = { row, col: Math.max(0, col - 1) };
                break;
            case 'ArrowRight':
                next = { row, col: Math.min(lastCol, col + 1) };
                break;
            case 'ArrowUp':
                next = { row: Math.max(-1, row - 1), col };
                break;
            case 'ArrowDown':
                next = { row: Math.min(lastDataRow, row + 1), col };
                break;
            case 'Home':
                if (e.ctrlKey) {
                    next = { row: -1, col: 0 };
                } else {
                    next = { row, col: 0 };
                }
                break;
            case 'End':
                if (e.ctrlKey) {
                    next = { row: lastDataRow, col: lastCol };
                } else {
                    next = { row, col: lastCol };
                }
                break;
            case 'PageUp':
                next = { row: Math.max(-1, row - PAGE_SIZE), col };
                break;
            case 'PageDown':
                next = { row: Math.min(lastDataRow, row + PAGE_SIZE), col };
                break;
            case 'Enter':
            case ' ':
            case 'Spacebar': {
                // D-03: Enter/Space on a focused sortable <th> delegates via
                // direct handleSort call (per RESEARCH finding #5 — NOT .click()).
                // Non-sortable headers and all data cells: no-op (D-03 + future-reserved).
                if (row === -1) {
                    const column = columns[col];
                    if (column && column.sortable) {
                        e.preventDefault();
                        handleSort(column.accessor);
                    }
                }
                return;
            }
            default:
                return;
        }

        if (next) {
            e.preventDefault();
            hasUserMovedRef.current = true;
            setActiveCell(next);
            activeCellRef.current = next;
        }
    };

    const styles: Record<string, React.CSSProperties> = {
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            marginBottom: '1rem',
        },
        caption: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            marginBottom: '0.75rem',
            color: '#1e293b'
        },
        th: {
            textAlign: 'left',
            borderBottom: '2px solid #e2e8f0',
            padding: '0.75rem',
            fontWeight: 600,
            color: '#475569',
            backgroundColor: '#f8fafc'
        },
        td: {
            padding: '0.75rem',
            borderBottom: '1px solid #e2e8f0',
            color: '#334155'
        },
        sortButton: {
            background: 'none',
            border: 'none',
            font: 'inherit',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'inherit'
        }
    };

    return (
        <div className={className} style={{ overflowX: 'auto' }}>
            <table role="grid" onKeyDown={onGridKeyDown} style={styles.table}>
                <caption style={styles.caption}>{caption}</caption>
                <thead>
                    <tr role="row">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                role="columnheader"
                                scope="col"
                                aria-sort={
                                    sortConfig.key === column.accessor
                                        ? sortConfig.direction
                                        : undefined
                                }
                                tabIndex={isActive(-1, index) ? 0 : -1}
                                data-state={isActive(-1, index) ? 'focused' : undefined}
                                ref={(node) => {
                                    const key = `-1:${index}`;
                                    if (node) cellRefs.current.set(key, node);
                                    else cellRefs.current.delete(key);
                                }}
                                onClick={() => {
                                    hasUserMovedRef.current = true;
                                    setActiveCell({ row: -1, col: index });
                                }}
                                style={styles.th}
                            >
                                {column.sortable ? (
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => handleSort(column.accessor)}
                                        style={styles.sortButton}
                                    >
                                        {column.header}
                                        {sortConfig.key === column.accessor ? (
                                            <span aria-hidden="true">
                                                {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                            </span>
                                        ) : (
                                            <span aria-hidden="true" style={{ opacity: 0.3 }}>↕</span>
                                        )}
                                    </button>
                                ) : (
                                    column.header
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, rowIndex) => (
                        <tr key={rowIndex} role="row">
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    role="gridcell"
                                    tabIndex={isActive(rowIndex, colIndex) ? 0 : -1}
                                    data-state={isActive(rowIndex, colIndex) ? 'focused' : undefined}
                                    ref={(node) => {
                                        const key = `${rowIndex}:${colIndex}`;
                                        if (node) cellRefs.current.set(key, node);
                                        else cellRefs.current.delete(key);
                                    }}
                                    onClick={() => {
                                        hasUserMovedRef.current = true;
                                        setActiveCell({ row: rowIndex, col: colIndex });
                                    }}
                                    style={styles.td}
                                >
                                    {column.render
                                        ? column.render(row)
                                        : String(row[column.accessor])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
