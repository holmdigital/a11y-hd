import React, { Children, isValidElement, cloneElement, ReactNode } from 'react';


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
            <li className={`flex items-center text-slate-900 font-semibold ${className || ''}`} aria-current="page" {...props}>
                {children}
            </li>
        );
    }

    return (
        <li className={`flex items-center text-slate-500 hover:text-slate-700 transition-colors ${className || ''}`} {...props}>
            {href ? (
                <a href={href} className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-sm">
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mx-2">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );

    const items = Children.toArray(children).filter(isValidElement);

    return (
        <nav aria-label="Breadcrumb" className={className} {...props}>
            <ol className="flex items-center flex-wrap">
                {items.map((child, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <React.Fragment key={index}>
                            {cloneElement(child as React.ReactElement<BreadcrumbItemProps>, {
                                isCurrent: isLast || (child.props as any).isCurrent
                            })}
                            {!isLast && (
                                <li aria-hidden="true" className="flex items-center select-none">
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
