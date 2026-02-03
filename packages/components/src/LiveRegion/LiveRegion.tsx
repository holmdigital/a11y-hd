import React, { useEffect, useState, useRef } from 'react';

export interface LiveRegionProps {
    /**
     * The content to be announced. Changing this content triggers the announcement.
     */
    children?: React.ReactNode;
    /**
     * The politeness level of the announcement.
     * - 'polite': Waiting for the user to be idle (default).
     * - 'assertive': Interrupts the user immediately.
     * - 'off': Updates are not announced.
     */
    politeness?: 'polite' | 'assertive' | 'off';
    /**
     * Optional class name for the container.
     */
    className?: string;
    /**
     * If true, the container is visually hidden but available to screen readers.
     * Default: true
     */
    visuallyHidden?: boolean;
}

/**
 * LiveRegion
 * 
 * A utility component to announce dynamic content changes to screen readers.
 * Useful for status updates, form errors, or external events.
 * 
 * @example
 * <LiveRegion politeness="assertive">
 *   {hasError ? "Error: Invalid Input" : ""}
 * </LiveRegion>
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
    children,
    politeness = 'polite',
    className = '',
    visuallyHidden = true
}) => {
    // Styles for visually hidden content (SR-only)
    const hiddenStyle: React.CSSProperties = visuallyHidden ? {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
    } : {};

    return (
        <div
            role={politeness === 'assertive' ? 'alert' : 'status'}
            aria-live={politeness}
            aria-atomic="true"
            className={`hd-live-region ${className}`}
            style={hiddenStyle}
        >
            {children}
        </div>
    );
};
