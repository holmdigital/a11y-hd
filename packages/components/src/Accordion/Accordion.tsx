import React, { createContext, useContext, useState, ReactNode } from 'react';


// We will use inline SVG for the chevron to avoid dependencies, just like Breadcrumbs.
const ChevronIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

interface AccordionContextType {
    openItems: string[];
    toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export interface AccordionProps {
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    children: ReactNode;
    className?: string;
}

export const Accordion = ({ type = 'single', defaultValue, children, className }: AccordionProps) => {
    const [openItems, setOpenItems] = useState<string[]>(() => {
        if (Array.isArray(defaultValue)) return defaultValue;
        if (defaultValue) return [defaultValue];
        return [];
    });

    const toggleItem = (value: string) => {
        setOpenItems(prev => {
            if (type === 'single') {
                return prev.includes(value) ? [] : [value];
            }
            return prev.includes(value)
                ? prev.filter(item => item !== value)
                : [...prev, value];
        });
    };

    return (
        <AccordionContext.Provider value={{ openItems, toggleItem }}>
            <div className={`space-y-1 ${className || ''}`}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
};

export interface AccordionItemProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export const AccordionItem = ({ value, children, className }: AccordionItemProps) => {
    const context = useContext(AccordionContext);
    if (!context) throw new Error('AccordionItem must be used within an Accordion');

    const isOpen = context.openItems.includes(value);

    return (
        <div className={`border border-slate-200 rounded-lg overflow-hidden ${className || ''}`}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        ...child.props,
                        value, // Pass value down to Trigger and Content
                        isOpen
                    });
                }
                return child;
            })}
        </div>
    );
};

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    value?: string; // Injected by Item
    isOpen?: boolean; // Injected by Item
}

export const AccordionTrigger = ({ children, className, value, isOpen, ...props }: AccordionTriggerProps) => {
    const context = useContext(AccordionContext);

    return (
        <button
            type="button"
            className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium text-slate-900 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset ${className || ''}`}
            onClick={() => value && context?.toggleItem(value)}
            aria-expanded={isOpen}
            aria-controls={`accordion-content-${value}`}
            id={`accordion-trigger-${value}`}
            {...props}
        >
            {children}
            <ChevronIcon className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
    );
};

export interface AccordionContentProps {
    children: ReactNode;
    className?: string;
    value?: string; // Injected by Item
    isOpen?: boolean; // Injected by Item
}

export const AccordionContent = ({ children, className, value, isOpen }: AccordionContentProps) => {
    return (
        <div
            id={`accordion-content-${value}`}
            role="region"
            aria-labelledby={`accordion-trigger-${value}`}
            hidden={!isOpen}
            className={`px-4 py-3 bg-white text-slate-600 border-t border-slate-100 text-sm leading-relaxed ${!isOpen ? 'hidden' : ''} ${className || ''}`}
        >
            {children}
        </div>
    );
};
