import React from 'react';

export interface SkeletonProps {
    /**
     * shape of the skeleton
     * - text: line of text (default)
     * - circular: circle (e.g. avatar)
     * - rectangular: box
     */
    variant?: 'text' | 'circular' | 'rectangular';
    /**
     * Width of the skeleton
     */
    width?: string | number;
    /**
     * Height of the skeleton
     */
    height?: string | number;
    /**
     * Animation style
     * - pulse: scaling opacity (default)
     * - wave: moving gradient
     * - none: static
     */
    animation?: 'pulse' | 'wave' | 'none';
    className?: string;
}

/**
 * Skeleton
 * 
 * Loading placeholder that mimics the shape of content.
 * 
 * Accessibility:
 * - Uses aria-hidden="true" as it is a visual representation.
 * - Ensure the parent container has adequate loading state announcement (e.g. aria-busy).
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    animation = 'pulse',
    className = ''
}) => {

    const baseStyle: React.CSSProperties = {
        backgroundColor: '#E5E7EB', // Gray-200
        borderRadius: variant === 'circular' ? '50%' : '4px',
        display: 'inline-block',
        width: width ?? (variant === 'text' ? '100%' : undefined),
        height: height ?? (variant === 'text' ? '1em' : undefined),
    };

    const getAnimationClass = () => {
        switch (animation) {
            case 'pulse': return 'hd-skeleton-pulse';
            case 'wave': return 'hd-skeleton-wave';
            default: return '';
        }
    };

    // Inline keyframes usually need a style sheet or css-in-js. 
    // For this standalone component without external CSS, we'll try to rely on utility classes 
    // or simple style injection if allowed. Assuming a standard build setup, class names preferred.
    // We will assume CSS classes 'hd-skeleton-pulse' and 'hd-skeleton-wave' are available globally 
    // or add a style tag for self-containment if this is a library without guaranteed global css.

    // Adding simple animation styles via style tag for portability in this demo
    const styles = `
    @keyframes hd-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    @keyframes hd-wave {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .hd-skeleton-pulse {
      animation: hd-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .hd-skeleton-wave {
      position: relative;
      overflow: hidden;
    }
    .hd-skeleton-wave::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
      animation: hd-wave 1.6s linear infinite;
    }
  `;

    return (
        <>
            <style>{styles}</style>
            <span
                className={`hd-skeleton ${getAnimationClass()} ${className}`}
                style={baseStyle}
                aria-hidden="true"
            />
        </>
    );
};
