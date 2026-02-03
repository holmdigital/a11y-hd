import React, { useEffect, useRef } from 'react';

export interface ErrorSummaryProps {
    /**
     * List of validation errors to display
     */
    errors: Array<{
        /** ID of the input field associated with the error */
        id: string;
        /** The error message description */
        message: string;
    }>;

    /**
     * accessible title for the error summary
     * @default "There is a problem"
     */
    title?: string;

    /**
     * Whether to move focus to the error summary when mounted
     * @default true
     */
    focusOnMount?: boolean;

    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * ErrorSummary component (WCAG 3.3.1)
 * 
 * Displays a summary of validation errors at the top of a form.
 * Moves focus to the summary when errors occur to ensure screen reader users are aware of them.
 * Provides links to jump directly to the invalid fields.
 */
export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
    errors,
    title = 'There is a problem',
    focusOnMount = true,
    className = ''
}) => {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (focusOnMount && errors.length > 0 && headingRef.current) {
            headingRef.current.focus();
        }
    }, [focusOnMount, errors]);

    if (errors.length === 0) {
        // Render nothing if there are no errors, but keep in DOM if needed for live regions? 
        // Typically ErrorSummary is conditional.
        return null;
    }

    const styles: Record<string, React.CSSProperties> = {
        container: {
            border: '2px solid #dc2626', // Red-600
            borderRadius: '0.375rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fef2f2', // Red-50
        },
        heading: {
            color: '#991b1b', // Red-800
            fontWeight: 'bold',
            fontSize: '1.125rem',
            marginBottom: '0.5rem',
            outline: 'none', // Managed focus usually visually indicated by browser, but we can style if needed
        },
        list: {
            listStyleType: 'disc',
            paddingLeft: '1.25rem',
            margin: 0,
            color: '#dc2626' // Red-600
        },
        link: {
            color: '#b91c1c', // Red-700
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 500
        }
    };

    return (
        <div
            className={`a11y-error-summary ${className}`}
            role="alert"
            aria-labelledby="error-summary-title"
            style={styles.container}
        >
            <h2
                id="error-summary-title"
                ref={headingRef}
                tabIndex={-1}
                style={styles.heading}
            >
                {title}
            </h2>
            <ul style={styles.list}>
                {errors.map((error, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>
                        <a
                            href={`#${error.id}`}
                            style={styles.link}
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(error.id);
                                if (element) {
                                    element.focus();
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }}
                        >
                            {error.message}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

ErrorSummary.displayName = 'ErrorSummary';
