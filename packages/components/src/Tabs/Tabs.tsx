import React, { createContext, useContext, useState, useRef, ReactNode, KeyboardEvent } from 'react';

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
    // Generate a stable base ID for aria connections
    const [baseId] = useState(() => Math.random().toString(36).substr(2, 9));

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
            <div className={`flex ${orientation === 'vertical' ? 'flex-col md:flex-row gap-4' : 'flex-col'} ${className || ''}`}>
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
            className={`flex ${context.orientation === 'vertical' ? 'flex-col border-r border-slate-200' : 'border-b border-slate-200'} ${className || ''}`}
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
            className={`
                px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                ${context.orientation === 'horizontal' ? 'border-b-2' : 'border-r-2 text-left'}
                ${isActive
                    ? `border-primary-500 text-primary-600 bg-primary-50/50`
                    : `border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50`
                }
                ${className || ''}
            `}
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
            className={`py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md ${className || ''}`}
        >
            {children}
        </div>
    );
};
