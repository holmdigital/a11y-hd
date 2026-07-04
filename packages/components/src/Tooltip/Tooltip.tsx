import React, { useState, useRef, useId, useEffect, createContext, useContext } from 'react';

// --- Context ---
interface TooltipContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
    dismissed: boolean;
    setDismissed: (b: boolean) => void;
    cancelClose: () => void;
    scheduleClose: () => void;
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

// Brief delay so the pointer can transit from trigger to content without
// the tooltip closing mid-transit (WCAG 2.1 SC 1.4.13 — Hoverable).
const CLOSE_DELAY_MS = 100;

export const Tooltip = ({ children }: TooltipProps) => {
    const [open, setOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const id = useId();
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelClose = () => {
        if (closeTimeoutRef.current !== null) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const scheduleClose = () => {
        cancelClose();
        closeTimeoutRef.current = setTimeout(() => {
            setOpen(false);
            closeTimeoutRef.current = null;
        }, CLOSE_DELAY_MS);
    };

    useEffect(() => () => cancelClose(), []);

    return (
        <TooltipContext.Provider value={{ open, setOpen, dismissed, setDismissed, cancelClose, scheduleClose, id }}>
            <div className="relative inline-block group">
                {children}
            </div>
        </TooltipContext.Provider>
    );
};

// --- Trigger ---
export const TooltipTrigger = ({ children, asChild: _asChild = false, ...props }: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) => {
    const context = useContext(TooltipContext);
    if (!context) throw new Error("TooltipTrigger must be used within Tooltip");

    const { open, setOpen, dismissed, setDismissed, cancelClose, scheduleClose, id } = context;

    const handleOpen = () => {
        if (dismissed) return;
        cancelClose();
        setOpen(true);
    };

    const handleClose = () => {
        scheduleClose();
        // Next interaction (re-hover or re-focus after pointer leaves / blur) starts fresh.
        setDismissed(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
            cancelClose();
            setOpen(false);
            setDismissed(true);
            // Prevent ancestor handlers (e.g. a Dialog) from also reacting to Escape.
            e.stopPropagation();
        }
    };

    if (React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)) {
        return React.cloneElement(children, {
            'aria-describedby': open ? id : undefined,
            onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                handleOpen();
                children.props.onMouseEnter?.(e);
            },
            onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                handleClose();
                children.props.onMouseLeave?.(e);
            },
            onFocus: (e: React.FocusEvent<HTMLElement>) => {
                handleOpen();
                children.props.onFocus?.(e);
            },
            onBlur: (e: React.FocusEvent<HTMLElement>) => {
                handleClose();
                children.props.onBlur?.(e);
            },
            onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                handleKeyDown(e);
                if (!e.defaultPrevented) {
                    children.props.onKeyDown?.(e);
                }
            },
            ...props
        });
    }

    return (
        <span
            aria-describedby={open ? id : undefined}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            onFocus={handleOpen}
            onBlur={handleClose}
            onKeyDown={handleKeyDown}
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

    const { open, id, cancelClose, scheduleClose } = context;

    if (!open) return null;

    return (
        <div
            id={id}
            role="tooltip"
            // Pointer transit from trigger to content keeps the tooltip alive
            // (WCAG 2.1 SC 1.4.13 — Hoverable).
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
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
