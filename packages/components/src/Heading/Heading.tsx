import React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /**
     * Heading level (1-6). 
     * Always start with level 1 for the main page title.
     * Don't skip levels (e.g. don't jump from h2 to h4).
     */
    level: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Accessible Heading Component
 * 
 * Enforces semantic HTML headings (h1-h6).
 * 
 * @example
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={2}>Section Title</Heading>
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ level, children, className, ...props }, ref) => {
        const Tag = `h${level}` as keyof JSX.IntrinsicElements;

        return (
            <Tag ref={ref} className={className} {...props}>
                {children}
            </Tag>
        );
    }
);

Heading.displayName = 'Heading';
