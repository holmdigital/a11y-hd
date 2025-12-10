import React, { useState, useRef, useEffect, forwardRef } from 'react';

export interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[];
}

export interface NavigationMenuProps {
    items: NavItem[];
    className?: string;
    'aria-label'?: string;
}

/**
 * NavigationMenu Component
 * 
 * Accessible navigation menu with dropdown support.
 * - Semantic <nav> and <ul> structure
 * - Keyboard support (Tab, Enter/Space, Esc)
 * - Aria attributes for expanded states
 */
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
    ({ items, className, 'aria-label': ariaLabel = "Main Navigation" }, ref) => {
        return (
            <nav
                ref={ref}
                className={`flex items-center ${className || ''}`}
                aria-label={ariaLabel}
            >
                <ul className="flex flex-wrap gap-2 m-0 p-0 list-none">
                    {items.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}
                </ul>
            </nav>
        );
    }
);

NavigationMenu.displayName = 'NavigationMenu';

const MenuItem = ({ item }: { item: NavItem }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLLIElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const hasChildren = item.children && item.children.length > 0;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    // Handle Escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
            // Move focus back to the trigger button
            const trigger = containerRef.current?.querySelector('button');
            trigger?.focus();
        }
    };

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
    };

    return (
        <li
            ref={containerRef}
            className="relative group"
            onKeyDown={handleKeyDown}
            onMouseEnter={hasChildren ? handleMouseEnter : undefined}
            onMouseLeave={hasChildren ? handleMouseLeave : undefined}
        >
            {hasChildren ? (
                <>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                        className={`
                            flex items-center gap-1 px-4 py-2 rounded-md
                            text-slate-700 font-medium hover:bg-slate-100 focus:bg-slate-100
                            transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500
                        `}
                    >
                        {item.label}
                        <svg
                            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    <ul
                        className={`
                            absolute top-full left-0 mt-1 min-w-[200px]
                            bg-white border border-slate-200 rounded-lg shadow-xl
                            py-2 z-50
                            transform origin-top transition-all duration-200
                            ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                        `}
                    >
                        {item.children?.map((child, idx) => (
                            <li key={idx}>
                                <a
                                    href={child.href}
                                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-primary-600 focus:bg-slate-50 focus:text-primary-600 focus:outline-none"
                                >
                                    {child.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <a
                    href={item.href}
                    className="block px-4 py-2 text-slate-700 font-medium rounded-md hover:bg-slate-100 focus:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {item.label}
                </a>
            )}
        </li>
    );
};
