import React, { useState, useMemo } from 'react';

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
            <table style={styles.table}>
                <caption style={styles.caption}>{caption}</caption>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                scope="col"
                                aria-sort={
                                    sortConfig.key === column.accessor
                                        ? sortConfig.direction
                                        : undefined
                                }
                                style={styles.th}
                            >
                                {column.sortable ? (
                                    <button
                                        type="button"
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
                        <tr key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} style={styles.td}>
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
