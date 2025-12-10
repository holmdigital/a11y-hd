import React, { useState, useRef, createContext, useContext } from 'react';

// --- Context ---
interface TooltipContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
    id: string;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

// --- Provider ---
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

// --- Root Component ---
interface TooltipProps {
    children: React.ReactNode;
}

export const Tooltip = ({ children }: TooltipProps) => {
    const [open, setOpen] = useState(false);
    const id = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`).current;

    return (
        <TooltipContext.Provider value={{ open, setOpen, id }}>
            <div className="relative inline-block group" onMouseLeave={() => setOpen(false)}>
                {children}
            </div>
        </TooltipContext.Provider>
    );
};

// --- Trigger ---
export const TooltipTrigger = ({ children, asChild = false, ...props }: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) => {
    const context = useContext(TooltipContext);
    if (!context) throw new Error("TooltipTrigger must be used within Tooltip");

    const { setOpen, id } = context;

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    if (React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            'aria-describedby': context.open ? id : undefined,
            onMouseEnter: (e: React.MouseEvent) => {
                handleOpen();
                children.props.onMouseEnter?.(e);
            },
            onMouseLeave: (e: React.MouseEvent) => {
                handleClose();
                children.props.onMouseLeave?.(e);
            },
            onFocus: (e: React.FocusEvent) => {
                handleOpen();
                children.props.onFocus?.(e);
            },
            onBlur: (e: React.FocusEvent) => {
                handleClose();
                children.props.onBlur?.(e);
            },
            ...props
        });
    }

    return (
        <span
            aria-describedby={context.open ? id : undefined}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            onFocus={handleOpen}
            onBlur={handleClose}
            tabIndex={0}
            className="cursor-default"
            {...props}
        >
            {children}
        </span>
    );
};

// --- Content ---
export const TooltipContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
    const context = useContext(TooltipContext);
    if (!context) throw new Error("TooltipContent must be used within Tooltip");

    if (!context.open) return null;

    return (
        <div
            id={context.id}
            role="tooltip"
            className={`
                absolute z-50 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded shadow-lg
                bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap
                animate-in fade-in zoom-in-95 duration-200
                ${className}
            `}
        >
            {children}
            {/* Arrow */}
            <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1" />
        </div>
    );
};
