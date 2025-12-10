import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
    id: string;
    title: string;
    description?: string;
    type?: ToastType;
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

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

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
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
    useEffect(() => {
        if (toast.duration === Infinity) return;

        const timer = setTimeout(() => {
            onRemove();
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const icons = {
        info: <Info className="w-5 h-5 text-blue-500" />,
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
    };

    const bgColors = {
        info: 'bg-white border-blue-100',
        success: 'bg-white border-green-100',
        warning: 'bg-white border-amber-100',
        error: 'bg-white border-red-100',
    };

    return (
        <div
            role="alert"
            className={`
                flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all animate-in slide-in-from-right-full fade-in duration-300
                ${bgColors[toast.type || 'info']}
            `}
        >
            {icons[toast.type || 'info']}
            <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900">{toast.title}</h4>
                {toast.description && (
                    <p className="text-sm text-slate-600 mt-1">{toast.description}</p>
                )}
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className="mt-2 text-sm font-medium text-slate-900 underline hover:no-underline"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button
                onClick={onRemove}
                className="text-slate-400 hover:text-slate-900 transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
