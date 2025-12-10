import React, { forwardRef } from 'react';

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /**
     * The ID of the main content area to skip to. 
     * Defaults to "main".
     */
    targetId?: string;
}

/**
 * SkipLink Component
 * 
 * A link that is visually hidden until focused, allowing keyboard users 
 * to skip repeated navigation content.
 * 
 * WCAG 2.4.1 (Bypass Blocks)
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
    ({ targetId = 'main', className, style, children, ...props }, ref) => {
        return (
            <a
                ref={ref}
                href={`#${targetId}`}
                className={`
                    fixed top-4 left-4 z-50 
                    px-4 py-3 
                    bg-white text-slate-900 font-medium 
                    rounded-md shadow-lg ring-2 ring-slate-900
                    transition-transform duration-200
                    -translate-y-[150%] focus:translate-y-0
                    ${className || ''}
                `}
                style={{
                    // Ensure it stays on top of everything
                    zIndex: 9999,
                    ...style
                }}
                {...props}
            >
                {children || 'Hoppa till huvudinnehåll'}
            </a>
        );
    }
);

SkipLink.displayName = 'SkipLink';
