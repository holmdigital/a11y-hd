import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
    id: string;
    title: string;
    description?: string;
    type?: ToastType;
    /**
     * Auto-dismiss duration in milliseconds. Pass `Infinity` (or omit for
     * `error` toasts) to keep the toast visible until the user dismisses it.
     */
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION_MS = 5000;
// Reading-rate heuristic: ~4.2 chars/sec at 200 wpm, average word length 5 = 1000ms per ~24 chars.
const MIN_READING_DURATION_MS = (text: string) => Math.max(DEFAULT_DURATION_MS, text.length * 50);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idCounter = useRef(0);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        idCounter.current += 1;
        const id = `toast-${idCounter.current}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Group-level Escape: dismiss the most-recently-added urgent toast.
    // Status (info/success) toasts stay — they are not interruptions the user
    // is asking to clear. Errors/warnings are.
    useEffect(() => {
        if (toasts.length === 0) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const urgent = [...toasts].reverse().find(t => t.type === 'error' || t.type === 'warning');
            if (urgent) removeToast(urgent.id);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [toasts, removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastViewport />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastViewport = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div
            className="fixed bottom-0 right-0 z-50 p-4 w-full md:max-w-sm flex flex-col gap-2"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    const { id, type = 'info' } = toast;
    const isUrgent = type === 'error' || type === 'warning';
    // Errors stick by default — WCAG 2.2.1 requires the user be able to read them.
    const effectiveDuration =
        toast.duration === Infinity || (type === 'error' && toast.duration === undefined)
            ? Infinity
            : toast.duration ?? MIN_READING_DURATION_MS(toast.title + (toast.description ?? ''));

    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (effectiveDuration === Infinity || paused) return;

        const timer = setTimeout(() => {
            onRemove(id);
        }, effectiveDuration);

        return () => clearTimeout(timer);
    }, [id, effectiveDuration, paused, onRemove]);

    const icons = {
        info: <Info className="w-5 h-5 text-blue-500" aria-hidden="true" />,
        success: <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />,
    };

    const bgColors = {
        info: 'bg-white border-blue-100',
        success: 'bg-white border-green-100',
        warning: 'bg-white border-amber-100',
        error: 'bg-white border-red-100',
    };

    return (
        <div
            role={isUrgent ? 'alert' : 'status'}
            aria-live={isUrgent ? 'assertive' : 'polite'}
            aria-atomic="true"
            // Pause auto-dismiss while user is reading or interacting.
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className={`
                flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all animate-in slide-in-from-right-full fade-in duration-300
                ${bgColors[type]}
            `}
        >
            {icons[type]}
            <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900">{toast.title}</h4>
                {toast.description && (
                    <p className="text-sm text-slate-600 mt-1">{toast.description}</p>
                )}
                {toast.action && (
                    <button
                        type="button"
                        onClick={toast.action.onClick}
                        className="mt-2 text-sm font-medium text-slate-900 underline hover:no-underline"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button
                type="button"
                onClick={() => onRemove(id)}
                className="text-slate-400 hover:text-slate-900 transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" aria-hidden="true" />
            </button>
        </div>
    );
};
