import React, { createContext, useContext, useState, useRef, useId, ReactNode, KeyboardEvent } from 'react';
import './Tabs.css';

/**
 * Tabs — accessible tabbed interface (APG roving-tabindex pattern).
 *
 * Theming (CSS custom properties; override at :root or component scope):
 *   --hd-tabs-divider-color   (default: #e2e8f0)                  List/border-side color
 *   --hd-tabs-inactive-color  (default: #64748b)                  Inactive trigger text
 *   --hd-tabs-hover-color     (default: #334155)                  Trigger hover text
 *   --hd-tabs-hover-bg        (default: #f8fafc)                  Trigger hover background
 *   --hd-tabs-focus-ring      (default: #3b82f6)                  :focus-visible outline color
 *   --hd-tabs-active-color    (default: #1d4ed8)                  Active trigger text
 *   --hd-tabs-active-border   (default: #1d4ed8)                  Active trigger border
 *   --hd-tabs-active-bg       (default: rgba(29, 78, 216, 0.05))  Active trigger background
 *
 * State variants are attribute-driven, not className-driven:
 *   - active tab    via [aria-selected="true"]
 *   - orientation   via [data-orientation="vertical"]
 *
 * CSS file is imported as a side effect from this module. Consumer bundlers
 * must honor the package.json `"sideEffects": ["**\/*.css"]` declaration.
 * Explicit fallback: `import '@holmdigital/components/Tabs.css';`.
 */

// --- Context ---
interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
    orientation: 'horizontal' | 'vertical';
    activationMode: 'automatic' | 'manual';
    baseId: string;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// --- Components ---

export interface TabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    activationMode?: 'automatic' | 'manual';
    children: ReactNode;
    className?: string;
}

export const Tabs = ({
    defaultValue,
    value,
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    children,
    className
}: TabsProps) => {
    // Stable base ID for aria connections — useId() is SSR-safe (Math.random
    // would cause hydration mismatches between server and client output).
    const baseId = useId();

    // Controlled vs Uncontrolled state
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const isControlled = value !== undefined;
    const activeTab = isControlled ? value : internalValue;

    const setActiveTab = (newValue: string) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab, orientation, activationMode, baseId }}>
            <div
                data-orientation={orientation}
                className={`hd-tabs${className ? ' ' + className : ''}`}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export interface TabsListProps {
    children: ReactNode;
    className?: string;
    ariaLabel?: string;
}

export const TabsList = ({ children, className, ariaLabel }: TabsListProps) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsList must be used within Tabs');
    const listRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const list = listRef.current;
        if (!list) return;

        const tabs = Array.from(list.querySelectorAll('[role="tab"]:not([disabled])')) as HTMLElement[];
        const index = tabs.indexOf(document.activeElement as HTMLElement);

        if (index === -1) return;

        let nextIndex = index;
        const lastIndex = tabs.length - 1;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = index === 0 ? lastIndex : index - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = index === lastIndex ? 0 : index + 1;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = lastIndex;
                break;
            default:
                return;
        }

        e.preventDefault();
        const nextTab = tabs[nextIndex];
        nextTab.focus();

        if (context.activationMode === 'automatic') {
            nextTab.click();
        }
    };

    return (
        <div
            ref={listRef}
            role="tablist"
            aria-orientation={context.orientation}
            aria-label={ariaLabel}
            data-orientation={context.orientation}
            className={`hd-tabs__list${className ? ' ' + className : ''}`}
            onKeyDown={handleKeyDown}
            tabIndex={-1} // The list itself shouldn't be focusable, only tabs
        >
            {children}
        </div>
    );
};

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    children: ReactNode;
}

export const TabTrigger = ({ value, children, className, ...props }: TabTriggerProps) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabTrigger must be used within Tabs');

    const isActive = context.activeTab === value;
    const triggerId = `tab-${context.baseId}-${value}`;
    const contentId = `content-${context.baseId}-${value}`;

    return (
        <button
            id={triggerId}
            role="tab"
            aria-selected={isActive}
            aria-controls={contentId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => context.setActiveTab(value)}
            data-orientation={context.orientation}
            className={`hd-tabs__trigger${className ? ' ' + className : ''}`}
            {...props}
        >
            {children}
        </button>
    );
};

export interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    const isActive = context.activeTab === value;
    const triggerId = `tab-${context.baseId}-${value}`;
    const contentId = `content-${context.baseId}-${value}`;

    if (!isActive) return null; // Or use hidden={!isActive} if we want to keep DOM state

    return (
        <div
            id={contentId}
            role="tabpanel"
            aria-labelledby={triggerId}
            tabIndex={0}
            className={`hd-tabs__content${className ? ' ' + className : ''}`}
        >
            {children}
        </div>
    );
};
