import React, { useState, useRef, useEffect, useLayoutEffect, useId, forwardRef } from 'react';

export interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[];
}

export interface NavigationMenuProps {
    items: NavItem[];
    className?: string;
    'aria-label'?: string;
    /**
     * APG pattern variant. Default 'disclosure' preserves v0.6 behaviour byte-for-byte.
     * 'menubar' enables the full W3C APG Menubar keyboard contract.
     */
    pattern?: 'disclosure' | 'menubar';
}

/**
 * NavigationMenu — accessible navigation with two opt-in APG patterns.
 *
 * Phase 31 v0.7 — adds opt-in `pattern="menubar"` (W3C APG Menubar) on top of the
 * existing Disclosure Navigation Menu (default, byte-equivalent to v0.6).
 *
 * Patterns:
 * - `pattern="disclosure"` (default): <button aria-expanded> trigger + plain <a> submenu links.
 *   Hover and focus both open the submenu (parity for keyboard + pointer users).
 * - `pattern="menubar"`: role="menubar" + role="menuitem" + role="menu" with full APG keyboard
 *   contract (Arrow horizontal/vertical, Home/End, Enter/Space, Escape, type-ahead).
 *
 * APG Menubar keyboard matrix (pattern="menubar" mode only — focus-only, no side effects):
 * | Key (on trigger / leaf)      | Action                                               |
 * |------------------------------|------------------------------------------------------|
 * | ArrowLeft / ArrowRight       | Top-level anchor +-1 (clamped at first/last)         |
 * | ArrowDown (on trigger)       | Open submenu, focus first item                       |
 * | ArrowUp (on trigger)         | Open submenu, focus last item                        |
 * | Home / End                   | First / last top-level item                          |
 * | Enter / Space (on trigger)   | Open submenu, focus first item                       |
 * | Enter / Space (on leaf <a>)  | Native <a> activation (no preventDefault)            |
 * | Escape                       | No-op when no submenu is open                        |
 * | Type-ahead char              | Match item.label.toLowerCase().startsWith(buffer)    |
 * | (Inside open submenu)        |                                                      |
 * | ArrowDown / ArrowUp          | Next / previous submenu item (clamped)               |
 * | ArrowRight                   | Close current, advance menubar, open next submenu    |
 * | ArrowLeft                    | Close submenu, refocus trigger                       |
 * | Home / End                   | First / last submenu item                            |
 * | Escape                       | Close submenu, refocus trigger, stopPropagation      |
 *
 * Roving tabindex: exactly one item carries tabindex=0; all others tabindex=-1.
 * Click on a menubar item moves the roving anchor and (for triggers) toggles the submenu.
 * Hover does NOT open submenus in menubar mode (D-03). Click-outside still closes.
 *
 * @wcag
 * - 2.1.1 Keyboard — full APG Menubar matrix above; type-ahead per D-02.
 * - 2.4.3 Focus Order — roving tabindex maintains predictable left-to-right traversal;
 *   submenu open injects focus on first/last item; Escape returns focus to the trigger.
 * - 4.1.2 Name, Role, Value — role=menubar, role=menuitem, role=menu, role=none on <li>,
 *   aria-haspopup="menu", aria-expanded, aria-controls, aria-orientation="vertical" on submenu.
 */
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
    ({ items, className, 'aria-label': ariaLabel = 'Main Navigation', pattern = 'disclosure' }, ref) => {
        if (pattern === 'menubar') {
            return <MenubarRenderer ref={ref} items={items} className={className} ariaLabel={ariaLabel} />;
        }
        return <DisclosureRenderer ref={ref} items={items} className={className} ariaLabel={ariaLabel} />;
    }
);

NavigationMenu.displayName = 'NavigationMenu';

interface RendererProps {
    items: NavItem[];
    className?: string;
    ariaLabel: string;
}

const DisclosureRenderer = forwardRef<HTMLElement, RendererProps>(
    ({ items, className, ariaLabel }, ref) => {
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

DisclosureRenderer.displayName = 'DisclosureRenderer';

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

// -------------------------------------------------------------------------------------
// Menubar Renderer (APG Menubar — opt-in via pattern="menubar")
// -------------------------------------------------------------------------------------

type ParsedKey =
    | { kind: 'menubar'; index: number }
    | { kind: 'submenu'; parent: number; child: number };

const parseMenubarKey = (key: string): ParsedKey => {
    const parts = key.split(':');
    if (parts[0] === 'menubar') return { kind: 'menubar', index: Number(parts[1]) };
    return { kind: 'submenu', parent: Number(parts[1]), child: Number(parts[2]) };
};

const MenubarRenderer = forwardRef<HTMLElement, RendererProps>(
    ({ items, className, ariaLabel }, ref) => {
        const [activeKey, setActiveKey] = useState<string>('menubar:0');
        const activeKeyRef = useRef(activeKey);
        useEffect(() => { activeKeyRef.current = activeKey; }, [activeKey]);

        const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
        const openSubmenuIndexRef = useRef<number | null>(null);
        useEffect(() => { openSubmenuIndexRef.current = openSubmenuIndex; }, [openSubmenuIndex]);

        const typeAheadBufferRef = useRef<string>('');
        const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
        useEffect(() => () => {
            if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
        }, []);

        const cellRefs = useRef<Map<string, HTMLElement>>(new Map());
        const hasUserMovedRef = useRef<boolean>(false);
        const navRef = useRef<HTMLElement | null>(null);

        useLayoutEffect(() => {
            if (!hasUserMovedRef.current) return;
            cellRefs.current.get(activeKey)?.focus();
        }, [activeKey, openSubmenuIndex]);

        // Click-outside close (D-03 carry-over)
        useEffect(() => {
            if (openSubmenuIndex === null) return;
            const handleClickOutside = (event: MouseEvent) => {
                if (navRef.current && !navRef.current.contains(event.target as Node)) {
                    setOpenSubmenuIndex(null);
                    openSubmenuIndexRef.current = null;
                }
            };
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }, [openSubmenuIndex]);

        const reactId = useId();

        const resetTypeAhead = () => {
            typeAheadBufferRef.current = '';
            if (typeAheadTimerRef.current) {
                clearTimeout(typeAheadTimerRef.current);
                typeAheadTimerRef.current = null;
            }
        };

        const moveTo = (nextKey: string) => {
            hasUserMovedRef.current = true;
            setActiveKey(nextKey);
            activeKeyRef.current = nextKey;
        };

        const closeSubmenu = () => {
            setOpenSubmenuIndex(null);
            openSubmenuIndexRef.current = null;
            resetTypeAhead();
        };

        const openSubmenuAt = (parentIndex: number, focusLast = false) => {
            const parent = items[parentIndex];
            if (!parent.children || parent.children.length === 0) return;
            setOpenSubmenuIndex(parentIndex);
            openSubmenuIndexRef.current = parentIndex;
            const childIdx = focusLast ? parent.children.length - 1 : 0;
            moveTo(`submenu:${parentIndex}:${childIdx}`);
            resetTypeAhead();
        };

        const onMenubarKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
            const current = activeKeyRef.current;
            const parsed = parseMenubarKey(current);
            const lastMenubarIndex = items.length - 1;

            // -------- Type-ahead branch (D-02, D-08 locale-naive, Pattern 5) — BEFORE the switch.
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && e.key !== ' ') {
                if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
                typeAheadBufferRef.current += e.key.toLowerCase();
                typeAheadTimerRef.current = setTimeout(() => {
                    typeAheadBufferRef.current = '';
                    typeAheadTimerRef.current = null;
                }, 500);

                const buffer = typeAheadBufferRef.current;
                if (parsed.kind === 'menubar') {
                    const startFrom = parsed.index + 1;
                    for (let offset = 0; offset < items.length; offset++) {
                        const idx = (startFrom + offset) % items.length;
                        if (items[idx].label.toLowerCase().startsWith(buffer)) {
                            e.preventDefault();
                            moveTo(`menubar:${idx}`);
                            return;
                        }
                    }
                } else {
                    const children = items[parsed.parent].children || [];
                    const startFrom = parsed.child + 1;
                    for (let offset = 0; offset < children.length; offset++) {
                        const idx = (startFrom + offset) % children.length;
                        if (children[idx].label.toLowerCase().startsWith(buffer)) {
                            e.preventDefault();
                            moveTo(`submenu:${parsed.parent}:${idx}`);
                            return;
                        }
                    }
                }
                e.preventDefault();
                return;
            }

            // -------- Navigation switch
            if (parsed.kind === 'menubar') {
                const idx = parsed.index;
                const item = items[idx];
                const hasChildren = item.children && item.children.length > 0;

                switch (e.key) {
                    case 'ArrowRight': {
                        e.preventDefault();
                        const next = Math.min(lastMenubarIndex, idx + 1);
                        if (next !== idx) { closeSubmenu(); moveTo(`menubar:${next}`); }
                        return;
                    }
                    case 'ArrowLeft': {
                        e.preventDefault();
                        const next = Math.max(0, idx - 1);
                        if (next !== idx) { closeSubmenu(); moveTo(`menubar:${next}`); }
                        return;
                    }
                    case 'ArrowDown': {
                        e.preventDefault();
                        if (hasChildren) openSubmenuAt(idx, false);
                        return;
                    }
                    case 'ArrowUp': {
                        e.preventDefault();
                        if (hasChildren) openSubmenuAt(idx, true);
                        return;
                    }
                    case 'Home': { e.preventDefault(); closeSubmenu(); moveTo('menubar:0'); return; }
                    case 'End':  { e.preventDefault(); closeSubmenu(); moveTo(`menubar:${lastMenubarIndex}`); return; }
                    case 'Enter':
                    case ' ': {
                        if (hasChildren) { e.preventDefault(); openSubmenuAt(idx, false); }
                        // Leaf: do NOT preventDefault — let native <a> activation fire (D-04).
                        return;
                    }
                    case 'Escape': { return; /* no-op when no submenu open (D-06) */ }
                    default: return;
                }
            }

            // parsed.kind === 'submenu'
            const parentIdx = parsed.parent;
            const childIdx = parsed.child;
            const submenuItems = items[parentIdx].children || [];
            const lastSubmenuIdx = submenuItems.length - 1;

            switch (e.key) {
                case 'ArrowDown': {
                    e.preventDefault();
                    const next = Math.min(lastSubmenuIdx, childIdx + 1);
                    if (next !== childIdx) moveTo(`submenu:${parentIdx}:${next}`);
                    return;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    const next = Math.max(0, childIdx - 1);
                    if (next !== childIdx) moveTo(`submenu:${parentIdx}:${next}`);
                    return;
                }
                case 'ArrowLeft': {
                    e.preventDefault();
                    closeSubmenu();
                    moveTo(`menubar:${parentIdx}`);
                    return;
                }
                case 'ArrowRight': {
                    e.preventDefault();
                    const nextParent = Math.min(lastMenubarIndex, parentIdx + 1);
                    if (nextParent === parentIdx) return;
                    const nextItem = items[nextParent];
                    const nextHasChildren = nextItem.children && nextItem.children.length > 0;
                    closeSubmenu();
                    if (nextHasChildren) openSubmenuAt(nextParent, false);
                    else moveTo(`menubar:${nextParent}`);
                    return;
                }
                case 'Home': { e.preventDefault(); moveTo(`submenu:${parentIdx}:0`); return; }
                case 'End':  { e.preventDefault(); moveTo(`submenu:${parentIdx}:${lastSubmenuIdx}`); return; }
                case 'Escape': {
                    e.preventDefault();
                    e.stopPropagation(); // Phase 24 D-02 carry-forward
                    closeSubmenu();
                    moveTo(`menubar:${parentIdx}`);
                    return;
                }
                case 'Enter':
                case ' ': {
                    // Submenu items are <a> — native activation. Do NOT preventDefault (D-04).
                    return;
                }
                default: return;
            }
        };

        const isActive = (key: string) => activeKey === key;

        return (
            <nav
                ref={(node) => {
                    navRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
                }}
                className={`flex items-center ${className || ''}`}
                aria-label={ariaLabel}
            >
                <ul
                    role="menubar"
                    className="flex flex-wrap gap-2 m-0 p-0 list-none"
                    onKeyDown={onMenubarKeyDown}
                >
                    {items.map((item, index) => {
                        const key = `menubar:${index}`;
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openSubmenuIndex === index;
                        const dropdownId = `${reactId}-submenu-${index}`;

                        return (
                            <li key={index} role="none" className="relative">
                                {hasChildren ? (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        aria-haspopup="menu"
                                        aria-expanded={isOpen}
                                        aria-controls={dropdownId}
                                        tabIndex={isActive(key) ? 0 : -1}
                                        data-state={isActive(key) ? 'focused' : undefined}
                                        ref={(node) => {
                                            if (node) cellRefs.current.set(key, node);
                                            else cellRefs.current.delete(key);
                                        }}
                                        onClick={() => {
                                            hasUserMovedRef.current = true;
                                            setActiveKey(key);
                                            activeKeyRef.current = key;
                                            setOpenSubmenuIndex(isOpen ? null : index);
                                        }}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-md text-slate-700 font-medium hover:bg-slate-100 focus:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    >
                                        {item.label}
                                        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <a
                                        href={item.href}
                                        role="menuitem"
                                        tabIndex={isActive(key) ? 0 : -1}
                                        data-state={isActive(key) ? 'focused' : undefined}
                                        ref={(node) => {
                                            if (node) cellRefs.current.set(key, node);
                                            else cellRefs.current.delete(key);
                                        }}
                                        onClick={() => {
                                            hasUserMovedRef.current = true;
                                            setActiveKey(key);
                                            activeKeyRef.current = key;
                                        }}
                                        className="block px-4 py-2 text-slate-700 font-medium rounded-md hover:bg-slate-100 focus:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {item.label}
                                    </a>
                                )}

                                {hasChildren && isOpen && (
                                    <ul
                                        id={dropdownId}
                                        role="menu"
                                        aria-orientation="vertical"
                                        className="absolute top-full left-0 mt-1 min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50"
                                    >
                                        {item.children?.map((child, childIdx) => {
                                            const childKey = `submenu:${index}:${childIdx}`;
                                            return (
                                                <li key={childIdx} role="none">
                                                    <a
                                                        href={child.href}
                                                        role="menuitem"
                                                        tabIndex={-1}
                                                        data-state={isActive(childKey) ? 'focused' : undefined}
                                                        ref={(node) => {
                                                            if (node) cellRefs.current.set(childKey, node);
                                                            else cellRefs.current.delete(childKey);
                                                        }}
                                                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-primary-600 focus:bg-slate-50 focus:text-primary-600 focus:outline-none"
                                                    >
                                                        {child.label}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }
);

MenubarRenderer.displayName = 'MenubarRenderer';
