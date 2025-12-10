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
        const generatedId = useId();
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
            color: '#333',
        };

        const inputStyle = {
            padding: '0.5rem',
            borderRadius: '4px',
            border: error ? '2px solid #dc3545' : '1px solid #ced4da',
            fontSize: '1rem',
            minHeight: '44px', // Touch target
        };

        const errorStyle = {
            color: '#dc3545',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
        };

        const helpStyle = {
            color: '#6c757d',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
        };

        return (
            <div style={containerStyle} className={className}>
                <label htmlFor={inputId} style={labelStyle}>
                    {label}
                    {required && <span aria-hidden="true" style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
                    {required && <span className="sr-only"> (obligatoriskt)</span>}
                </label>

                <input
                    ref={ref}
                    id={inputId}
                    aria-invalid={!!error}
                    aria-describedby={describedBy || undefined}
                    aria-required={required}
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
