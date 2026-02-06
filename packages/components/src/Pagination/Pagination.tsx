import React from 'react';

export interface PaginationProps {
    /**
     * Current active page (1-based index)
     */
    currentPage: number;

    /**
     * Total number of pages
     */
    totalPages: number;

    /**
     * Callback when a page is selected
     */
    onPageChange: (page: number) => void;

    /**
     * Accessible label for the navigation region
     * @default "Pagination"
     */
    ariaLabel?: string;

    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * Accessible Pagination Component
 * 
 * Uses a <nav> element to identify the navigation region.
 * Uses aria-current="page" to identify the current page.
 * Provides Previous/Next controls and individual page links.
 */
export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    ariaLabel = 'Pagination',
    className = ''
}) => {
    if (totalPages <= 1) return null;

    // Simple range generation. For production apps with thousands of pages, 
    // you'd want a truncation algorithm (e.g., 1 2 ... 9 10).
    // For this implementation, we'll keep it simple or limit to a window if needed.
    // Let's implement a basic window: always show first, last, current, and neighbors.

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        // Always show page 1
        pages.push(1);

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) pages.push('...');

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) pages.push('...');

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        // De-duplicate in case logic overlaps for small totalPages
        return Array.from(new Set(pages));
    };

    const pages = getPageNumbers();

    const styles: Record<string, React.CSSProperties> = {
        nav: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        list: {
            display: 'flex',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            gap: '0.5rem',
            alignItems: 'center'
        },
        button: {
            minWidth: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #cbd5e1',
            backgroundColor: 'white',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            color: '#1e293b',
            padding: '0 0.75rem',
            transition: 'all 0.2s'
        },
        activeButton: {
            backgroundColor: '#2563eb', // Blue-600
            color: 'white',
            borderColor: '#2563eb',
            fontWeight: 'bold'
        },
        disabledButton: {
            opacity: 0.5,
            cursor: 'not-allowed',
            backgroundColor: '#f1f5f9'
        },
        ellipsis: {
            color: '#64748b',
            padding: '0 0.5rem'
        }
    };

    return (
        <nav aria-label={ariaLabel} className={className} style={styles.nav}>
            <ul style={styles.list}>
                <li>
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-disabled={currentPage === 1}
                        aria-label="Previous page"
                        style={{
                            ...styles.button,
                            ...(currentPage === 1 ? styles.disabledButton : {})
                        }}
                    >
                        ←
                    </button>
                </li>

                {pages.map((page, index) => (
                    <li key={`${page}-${index}`}>
                        {page === '...' ? (
                            <span style={styles.ellipsis}>…</span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onPageChange(page as number)}
                                aria-current={currentPage === page ? 'page' : undefined}
                                aria-label={`Page ${page}`}
                                style={{
                                    ...styles.button,
                                    ...(currentPage === page ? styles.activeButton : {})
                                }}
                            >
                                {page}
                            </button>
                        )}
                    </li>
                ))}

                <li>
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-disabled={currentPage === totalPages}
                        aria-label="Next page"
                        style={{
                            ...styles.button,
                            ...(currentPage === totalPages ? styles.disabledButton : {})
                        }}
                    >
                        →
                    </button>
                </li>
            </ul>
        </nav>
    );
};
