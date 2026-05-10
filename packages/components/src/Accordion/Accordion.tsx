import React, { createContext, useContext, useState, ReactNode } from 'react';
import './Accordion.css';

/**
 * Accordion — accessible expandable-content interface.
 *
 * Theming (CSS custom properties; override at :root or component scope):
 *   --hd-accordion-border             (default: #e2e8f0)
 *   --hd-accordion-trigger-color      (default: #0f172a)
 *   --hd-accordion-trigger-bg         (default: #ffffff)
 *   --hd-accordion-hover-bg           (default: #f8fafc)
 *   --hd-accordion-focus-ring         (default: #3b82f6)
 *   --hd-accordion-chevron-color      (default: #64748b)
 *   --hd-accordion-content-color      (default: #475569)
 *   --hd-accordion-content-bg         (default: #ffffff)
 *   --hd-accordion-content-border     (default: #f1f5f9)
 *
 * Visibility hook: AccordionContent uses BOTH the native `hidden` HTML attribute
 * (assistive-tech semantics) AND `data-state="open"|"closed"` (CSS styling hook).
 * The CSS rule `[data-state="closed"] { display: none }` controls visual presence;
 * ARIA `aria-expanded` + `hidden` remain intact.
 *
 * CSS imported as a side effect; consumers' bundlers must honor
 * `"sideEffects": ["**\/*.css"]`. Explicit fallback:
 * `import '@holmdigital/components/Accordion.css';`.
 */

// Inline SVG chevron — no icon-library dependency (matches Breadcrumbs convention).
const ChevronIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className={className}
        style={style}
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
            <div className={`hd-accordion${className ? ' ' + className : ''}`}>
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
        <div className={`hd-accordion__item${className ? ' ' + className : ''}`}>
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
            className={`hd-accordion__trigger${className ? ' ' + className : ''}`}
            onClick={() => value && context?.toggleItem(value)}
            aria-expanded={isOpen}
            aria-controls={`accordion-content-${value}`}
            id={`accordion-trigger-${value}`}
            data-state={isOpen ? 'open' : 'closed'}
            {...props}
        >
            {children}
            <ChevronIcon
                className="hd-accordion__chevron"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
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
            data-state={isOpen ? 'open' : 'closed'}
            className={`hd-accordion__content${className ? ' ' + className : ''}`}
        >
            {children}
        </div>
    );
};
