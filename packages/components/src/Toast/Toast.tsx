import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// --- lucide-react optional peer dependency (PUB-06) ----------------------
type LucideIconLike = React.ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number;
    'aria-hidden'?: boolean | string;
}>;

const lucideCache: Record<string, LucideIconLike | null> = {};
let importAttempted = false;
let importPromise: Promise<Record<string, LucideIconLike | null>> | null = null;

function loadLucide(): Promise<Record<string, LucideIconLike | null>> {
    if (importAttempted) return Promise.resolve(lucideCache);
    if (importPromise) return importPromise;
    importPromise = import('lucide-react')
        .then((m) => {
            const mod = m as Record<string, unknown>;
            lucideCache.X = (mod.X ?? null) as LucideIconLike | null;
            lucideCache.Info = (mod.Info ?? null) as LucideIconLike | null;
            lucideCache.CheckCircle = (mod.CheckCircle ?? null) as LucideIconLike | null;
            lucideCache.AlertTriangle = (mod.AlertTriangle ?? null) as LucideIconLike | null;
            lucideCache.AlertCircle = (mod.AlertCircle ?? null) as LucideIconLike | null;
            importAttempted = true;
            return lucideCache;
        })
        .catch(() => {
            importAttempted = true;
            return lucideCache;
        });
    return importPromise;
}

function useLucideIcon(name: string): LucideIconLike | null {
    const [Icon, setIcon] = useState<LucideIconLike | null>(lucideCache[name] ?? null);
    useEffect(() => {
        if (importAttempted) {
            setIcon(lucideCache[name] ?? null);
            return;
        }
        let mounted = true;
        loadLucide().then(() => {
            if (mounted) setIcon(lucideCache[name] ?? null);
        });
        return () => {
            mounted = false;
        };
    }, [name]);
    return Icon;
}

const VARIANT_ICON_INFO: Record<
    'info' | 'success' | 'warning' | 'error',
    { name: string; className: string; glyph: string; testId: string }
> = {
    info: {
        name: 'Info',
        className: 'w-5 h-5 text-blue-500',
        glyph: 'ℹ',
        testId: 'toast-info-fallback-glyph',
    },
    success: {
        name: 'CheckCircle',
        className: 'w-5 h-5 text-green-500',
        glyph: '✓',
        testId: 'toast-success-fallback-glyph',
    },
    warning: {
        name: 'AlertTriangle',
        className: 'w-5 h-5 text-amber-500',
        glyph: '⚠',
        testId: 'toast-warning-fallback-glyph',
    },
    error: {
        name: 'AlertCircle',
        className: 'w-5 h-5 text-red-500',
        glyph: '⛔',
        testId: 'toast-error-fallback-glyph',
    },
};

const VariantIconOrGlyph = ({ variant }: { variant: 'info' | 'success' | 'warning' | 'error' }) => {
    const info = VARIANT_ICON_INFO[variant];
    const Icon = useLucideIcon(info.name);
    if (Icon) return <Icon className={info.className} aria-hidden="true" />;
    return (
        <span
            className={`${info.className} hd-toast-fallback-glyph inline-flex items-center justify-center`}
            data-testid={info.testId}
            aria-hidden="true"
        >
            {info.glyph}
        </span>
    );
};

const CloseIconOrGlyph = () => {
    const Icon = useLucideIcon('X');
    if (Icon) return <Icon className="w-4 h-4" aria-hidden="true" />;
    return (
        <span
            className="w-4 h-4 inline-flex items-center justify-center hd-toast-close-fallback-glyph"
            data-testid="toast-close-fallback-glyph"
            aria-hidden="true"
        >
            ✕
        </span>
    );
};
// -------------------------------------------------------------------------

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
            <VariantIconOrGlyph variant={type} />
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
                <CloseIconOrGlyph />
            </button>
        </div>
    );
};
