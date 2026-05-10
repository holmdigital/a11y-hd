import React, { Children, isValidElement, cloneElement, ReactNode } from 'react';
import './Breadcrumbs.css';

/**
 * Breadcrumbs — accessible breadcrumb navigation.
 *
 * Theming (CSS custom properties; override at :root or component scope):
 *   --hd-breadcrumbs-current-color       (default: #0f172a)   Current page text
 *   --hd-breadcrumbs-link-color          (default: #64748b)   Link text color
 *   --hd-breadcrumbs-link-hover-color    (default: #334155)   Link hover text
 *   --hd-breadcrumbs-focus-ring          (default: #3b82f6)   :focus-visible outline
 *   --hd-breadcrumbs-separator-color     (default: #94a3b8)   Separator icon color
 *
 * Current-page styling is keyed off the `aria-current="page"` attribute (no modifier
 * class needed). The component sets this attribute on the last item automatically.
 *
 * CSS imported as side effect; consumers' bundlers must honor
 * `"sideEffects": ["**\/*.css"]`. Explicit fallback:
 * `import '@holmdigital/components/Breadcrumbs.css';`.
 */

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
    separator?: ReactNode;
    children: ReactNode;
}

export interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
    href?: string;
    isCurrent?: boolean;
    children: ReactNode;
}

export const BreadcrumbItem = ({ href, isCurrent, children, className, ...props }: BreadcrumbItemProps) => {
    if (isCurrent) {
        return (
            <li className={`hd-breadcrumbs__item${className ? ' ' + className : ''}`} aria-current="page" {...props}>
                {children}
            </li>
        );
    }

    return (
        <li className={`hd-breadcrumbs__item hd-breadcrumbs__item--link${className ? ' ' + className : ''}`} {...props}>
            {href ? (
                <a href={href} className="hd-breadcrumbs__link">
                    {children}
                </a>
            ) : (
                children
            )}
        </li>
    );
};

export const Breadcrumbs = ({ separator, children, className, ...props }: BreadcrumbsProps) => {
    const separatorIcon = separator || (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hd-breadcrumbs__separator">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );

    const items = Children.toArray(children).filter(isValidElement);

    return (
        <nav aria-label="Breadcrumb" className={`hd-breadcrumbs${className ? ' ' + className : ''}`} {...props}>
            <ol className="hd-breadcrumbs__list">
                {items.map((child, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <React.Fragment key={index}>
                            {cloneElement(child as React.ReactElement<BreadcrumbItemProps>, {
                                isCurrent: isLast || (child as React.ReactElement<BreadcrumbItemProps>).props.isCurrent
                            })}
                            {!isLast && (
                                <li aria-hidden="true" className="hd-breadcrumbs__separator-item">
                                    {separatorIcon}
                                </li>
                            )}
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};
