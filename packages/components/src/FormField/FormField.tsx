import React, { forwardRef, useId } from 'react';

/**
 * Props för FormField-komponenten
 */
export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Etiketttext (Label)
     */
    label: string;

    /**
     * Felmeddelande
     */
    error?: string;

    /**
     * Hjälptext
     */
    helpText?: string;

    /**
     * Om fältet är obligatoriskt
     */
    required?: boolean;
}

/** Strip colons from React useId() output to produce valid HTML IDs */
function sanitizeId(id: string): string {
    return id.replaceAll(':', '');
}

/**
 * Regulatoriskt Kompatibelt Formulärfält
 *
 * Uppfyller:
 * - WCAG 3.3.2 (Labels or Instructions)
 * - WCAG 1.3.1 (Info and Relationships)
 * - WCAG 3.3.1 (Error Identification)
 * - WCAG 3.3.3 (Error Suggestion)
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    ({
        label,
        error,
        helpText,
        required,
        id,
        className = '',
        style,
        ...props
    }, ref) => {
        // Generera unika IDs för a11y-kopplingar om ej angivna
        const generatedId = sanitizeId(useId());
        const inputId = id || `input-${generatedId}`;
        const helpTextId = `help-${generatedId}`;
        const errorId = `error-${generatedId}`;

        // Bygg aria-describedby sträng
        const describedBy = [
            helpText ? helpTextId : null,
            error ? errorId : null
        ].filter(Boolean).join(' ');

        const containerStyle = {
            display: 'flex',
            flexDirection: 'column' as const,
            marginBottom: '1rem',
            fontFamily: 'system-ui, sans-serif',
            ...style
        };

        const labelStyle = {
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#1e293b',
        };

        const inputStyle = {
            padding: '0.5rem',
            borderRadius: '4px',
            border: error ? '2px solid #b91c1c' : '1px solid #94a3b8',
            fontSize: '1rem',
            color: '#0f172a',
            minHeight: '44px', // Touch target
        };

        const errorStyle = {
            color: '#b91c1c',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
        };

        const helpStyle = {
            color: '#475569',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
        };

        return (
            <div style={containerStyle} className={className}>
                <label htmlFor={inputId} style={labelStyle}>
                    {label}
                    {required && <span aria-hidden="true" style={{ color: '#b91c1c', marginLeft: '4px' }}>*</span>}
                    {required && <span className="sr-only"> (obligatoriskt)</span>}
                </label>

                <input
                    ref={ref}
                    id={inputId}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy || undefined}
                    required={required}
                    style={inputStyle}
                    {...props}
                />

                {error && (
                    <div id={errorId} style={errorStyle} role="alert">
                        <span aria-hidden="true" style={{ marginRight: '4px' }}>⚠️</span>
                        {error}
                    </div>
                )}

                {helpText && (
                    <div id={helpTextId} style={helpStyle}>
                        {helpText}
                    </div>
                )}
            </div>
        );
    }
);

FormField.displayName = 'FormField';
