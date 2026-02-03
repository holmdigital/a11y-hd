import React from 'react';

export interface CardProps {
    /**
     * Card title
     */
    title?: React.ReactNode;

    /**
     * URL for the main link of the card.
     * If provided, the title will become a link and span the entire card.
     */
    href?: string;

    /**
     * Content of the card
     */
    children: React.ReactNode;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * HTML tag to use for the container
     * @default "div"
     */
    as?: 'div' | 'article' | 'section' | 'li';
}

/**
 * Accessible Card Component
 * 
 * Implements the "Stretched Link" pattern.
 * If an href is provided, the title becomes a link that covers the entire card via CSS.
 * This ensures the card is accessible (one tab stop) and valid HTML (no nested interactive elements).
 * 
 * NOTE: Do not place other interactive elements (buttons, links) inside a Card with an href
 * unless you explicitly raise their z-index to be above the stretched link.
 */
export const Card: React.FC<CardProps> = ({
    title,
    href,
    children,
    className = '',
    as: Component = 'div'
}) => {
    const styles: Record<string, React.CSSProperties> = {
        card: {
            position: 'relative',
            border: '1px solid #cbd5e1',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            transition: 'box-shadow 0.2s, transform 0.2s',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        title: {
            marginTop: 0,
            marginBottom: '0.75rem',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1e293b'
        },
        link: {
            textDecoration: 'none',
            color: 'inherit'
        },
        stretchedLink: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1,
            content: "''"
        },
        content: {
            color: '#475569',
            lineHeight: 1.5
        }
    };

    return (
        <Component className={className} style={styles.card}>
            {title && (
                <h3 style={styles.title}>
                    {href ? (
                        <a href={href} style={styles.link}>
                            <span style={styles.stretchedLink} aria-hidden="true" />
                            {title}
                        </a>
                    ) : (
                        title
                    )}
                </h3>
            )}
            <div style={styles.content}>
                {children}
            </div>
        </Component>
    );
};
