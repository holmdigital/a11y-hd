import React, { useId, forwardRef } from 'react';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Label for the date picker
     */
    label: string;

    /**
     * Helper text displayed below the label
     */
    description?: string;

    /**
     * Error message
     */
    error?: string;

    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * Accessible DatePicker Component
 * 
 * Uses native <input type="date"> for maximum accessibility and device integration.
 * This ensures full keyboard support, screen reader compatibility, and native mobile date pickers.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
    label,
    description,
    error,
    className = '',
    style,
    id: providedId,
    ...props
}, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const styles: Record<string, React.CSSProperties> = {
        container: {
            marginBottom: '1rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        label: {
            display: 'block',
            fontWeight: 600,
            marginBottom: '0.25rem',
            color: '#1e293b'
        },
        description: {
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '0.5rem'
        },
        error: {
            fontSize: '0.875rem',
            color: '#dc2626',
            marginTop: '0.25rem'
        },
        input: {
            display: 'block',
            width: '100%',
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            lineHeight: 1.5,
            color: '#0f172a',
            backgroundColor: '#ffffff',
            border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`,
            borderRadius: '0.375rem',
            outline: 'none',
            boxSizing: 'border-box',
            minHeight: '2.5rem' // Ensure touch target size
        }
    };

    return (
        <div className={className} style={{ ...styles.container, ...style }}>
            <label
                htmlFor={id}
                style={styles.label}
            >
                {label}
            </label>

            {description && (
                <div id={descriptionId} style={styles.description}>
                    {description}
                </div>
            )}

            <input
                ref={ref}
                id={id}
                type="date"
                aria-invalid={!!error}
                aria-describedby={
                    [
                        description ? descriptionId : null,
                        error ? errorId : null
                    ].filter(Boolean).join(' ') || undefined
                }
                style={styles.input}
                {...props}
            />

            {error && (
                <div id={errorId} style={styles.error} role="alert">
                    {error}
                </div>
            )}
        </div>
    );
});

DatePicker.displayName = 'DatePicker';
