import React, { useEffect, useState, useRef } from 'react';

export type LiveRegionProps = {
    /**
     * The message to announce to screen readers.
     * Changing this prop will trigger a new announcement.
     */
    message?: string;

    /**
     * The politeness level of the announcement.
     * 'polite': Waits for the user to pause functionality before speaking (default).
     * 'assertive': Interrupts the user immediately. Use sparingly!
     */
    ariaLive?: 'polite' | 'assertive';

    /**
     * Optional cleanup time in ms. 
     * Useful if you want the region to clear itself after announcing.
     */
    clearAfter?: number;
};

/**
 * LiveRegion component for making dynamic announcements to screen readers.
 * This component is visually hidden but essential for accessibility in SPAs.
 * 
 * @example
 * <LiveRegion message="Search results updated" ariaLive="polite" />
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
    message,
    ariaLive = 'polite',
    clearAfter
}) => {
    const [announcement, setAnnouncement] = useState<string>('');
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        if (message) {
            // Clear any existing timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Set the announcement
            setAnnouncement(message);

            // Optional: Clear after X ms (often needed so if the same message comes again, it is re-announced)
            if (clearAfter) {
                timeoutRef.current = setTimeout(() => {
                    setAnnouncement('');
                }, clearAfter);
            }
        }
    }, [message, clearAfter]);

    return (
        <div
            aria-live={ariaLive}
            aria-atomic="true"
            style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
            }}
        >
            {announcement}
        </div>
    );
};
