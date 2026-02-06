import React from 'react';

export interface ProgressBarProps {
    /**
     * Current value of the progress (between min and max).
     */
    value: number;
    /**
     * Minimum value (default 0).
     */
    min?: number;
    /**
     * Maximum value (default 100).
     */
    max?: number;
    /**
     * Accessible label for the progress bar.
     * REQUIRED for WCAG compliance if no visible label is associated.
     */
    label: string;
    /**
     * Whether to show the value label visually (e.g., "50%").
     * Default: false
     */
    showValueLabel?: boolean;
    /**
     * Optional formatted text for aria-valuetext (e.g. "Step 2 of 4").
     */
    valueText?: string;
    /**
     * Variant of the progress bar.
     * Default: 'primary'
     */
    variant?: 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

/**
 * ProgressBar
 * 
 * A visually accessible progress indicator.
 * - Uses role="progressbar"
 * - Handles aria-valuenow/min/max
 * - Supports high contrast modes
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    min = 0,
    max = 100,
    label,
    showValueLabel = false,
    valueText,
    variant = 'primary',
    className = ''
}) => {
    // clamp value
    const clampedValue = Math.min(Math.max(value, min), max);
    const percentage = Math.round(((clampedValue - min) / (max - min)) * 100);

    const getVariantColor = () => {
        switch (variant) {
            case 'success': return '#10B981'; // Green
            case 'warning': return '#F59E0B'; // Amber
            case 'danger': return '#EF4444'; // Red
            default: return '#2563EB'; // Blue (Primary)
        }
    };

    const styles = {
        container: {
            width: '100%',
            backgroundColor: '#E5E7EB', // Gray-200
            borderRadius: '9999px',
            height: '1rem',
            overflow: 'hidden',
            position: 'relative' as const
        },
        bar: {
            height: '100%',
            backgroundColor: getVariantColor(),
            width: `${percentage}%`,
            transition: 'width 0.3s ease-in-out',
            borderRadius: '9999px'
        },
        labelFn: {
            fontSize: '0.875rem',
            color: '#374151',
            marginBottom: '0.25rem',
            display: 'flex',
            justifyContent: 'space-between'
        }
    };

    return (
        <div className={`hd-progress-root ${className}`}>
            <div style={styles.labelFn} id={`progress-label-${label.replace(/\s+/g, '-')}`}>
                <span className="hd-progress-label-text">{label}</span>
                {showValueLabel && <span>{percentage}%</span>}
            </div>

            <div
                role="progressbar"
                aria-valuenow={clampedValue}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-label={label}
                aria-valuetext={valueText}
                style={styles.container}
            >
                <div style={styles.bar} />
            </div>
        </div>
    );
};
