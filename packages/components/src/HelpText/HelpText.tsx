import React from 'react';
import { Info, AlertCircle } from 'lucide-react';

export interface HelpTextProps {
    /**
     * Unique ID is required so strictly associated inputs can reference it via aria-describedby.
     */
    id: string;
    /**
     * The help text content.
     */
    children: React.ReactNode;
    /**
     * Semantic variant
     * - default: Neutral formatting (gray)
     * - error: Error formatting (red), often used with aria-invalid on input
     * - valid: Success formatting (green)
     */
    variant?: 'default' | 'error' | 'valid';
    /**
     * Whether to show an icon based on variant.
     */
    showIcon?: boolean;
    className?: string;
}

/**
 * HelpText
 * 
 * Provides additional context, instructions, or error messages for form fields.
 * ALWAYS reference this component's `id` in the `aria-describedby` attribute of the input.
 */
export const HelpText: React.FC<HelpTextProps> = ({
    id,
    children,
    variant = 'default',
    showIcon = false,
    className = ''
}) => {
    const getColor = () => {
        switch (variant) {
            case 'error': return '#EF4444'; // Red-500
            case 'valid': return '#10B981'; // Green-500
            default: return '#6B7280'; // Gray-500
        }
    };

    const style: React.CSSProperties = {
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        color: getColor(),
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    };

    const Icon = () => {
        if (!showIcon) return null;
        if (variant === 'error') return <AlertCircle size={14} />;
        if (variant === 'default') return <Info size={14} />;
        return null;
    };

    return (
        <div
            id={id}
            className={`hd-help-text ${className}`}
            style={style}
        // role="alert" if error? No, typically simpler to let the input manage validity. 
        // If dynamic error, user might make it live regin, but HelpText itself is static description usually.
        >
            <Icon />
            <span>{children}</span>
        </div>
    );
};
