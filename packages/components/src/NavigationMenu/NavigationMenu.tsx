import React, { useState, useRef, useEffect, useId, forwardRef } from 'react';

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
 * NavigationMenu — accessible disclosure-pattern navigation with optional dropdowns.
 *
 * Keyboard support per WAI-ARIA APG Disclosure Navigation Menu:
 * - Tab / Shift+Tab — between top-level items and into the open submenu.
 * - Enter / Space — toggles a submenu when the trigger is focused.
 * - ArrowDown on a closed submenu trigger — opens the submenu and focuses the first item.
 * - Escape — closes an open submenu and returns focus to the trigger.
 * - Hover and focus both open the submenu (parity for keyboard and pointer users).
 *
 * Note: This is the disclosure pattern, not the menu/menuitem pattern. Submenu items
 * are plain `<a>` tags inside an `<ul>`, not `role="menuitem"`. Use this for primary
 * site navigation; use a `Menu` component (when available) for application menus.
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
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLUListElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reactId = useId();
    const dropdownId = `${reactId}-dropdown`;

    const hasChildren = item.children && item.children.length > 0;

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
            triggerRef.current?.focus();
            // Prevent ancestor handlers (e.g. a Dialog) from also reacting to Escape.
            e.stopPropagation();
        }
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'ArrowDown' && hasChildren) {
            e.preventDefault();
            setIsOpen(true);
            // Defer to next tick so the dropdown is mounted/visible before we focus.
            requestAnimationFrame(() => {
                const firstLink = dropdownRef.current?.querySelector<HTMLAnchorElement>('a');
                firstLink?.focus();
            });
        }
    };

    const handleEnter = () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsOpen(true);
    };

    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
    };

    return (
        <li
            ref={containerRef}
            className="relative group"
            onKeyDown={handleKeyDown}
            onMouseEnter={hasChildren ? handleEnter : undefined}
            onMouseLeave={hasChildren ? handleLeave : undefined}
            // Focus parity with hover so keyboard users see the dropdown when tabbing through.
            onFocus={hasChildren ? handleEnter : undefined}
            onBlur={hasChildren ? handleLeave : undefined}
        >
            {hasChildren ? (
                <>
                    <button
                        ref={triggerRef}
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        onKeyDown={handleTriggerKeyDown}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                        aria-controls={dropdownId}
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
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    <ul
                        ref={dropdownRef}
                        id={dropdownId}
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
