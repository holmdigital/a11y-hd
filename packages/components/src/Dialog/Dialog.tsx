import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

// Simple Close Icon SVG
const CloseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);


export interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    variant?: 'default' | 'alert';
    description?: string;
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
    ({ isOpen, onClose, title, children, variant = 'default', description, className, ...props }, ref) => {
        const dialogRef = useRef<HTMLDialogElement>(null);

        useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement);

        useEffect(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;

            if (isOpen) {
                if (!dialog.open) {
                    dialog.showModal();
                    // Lock body scroll
                    document.body.style.overflow = 'hidden';
                }
            } else {
                if (dialog.open) {
                    dialog.close();
                    // Restore body scroll
                    document.body.style.overflow = '';
                }
            }
        }, [isOpen]);

        // Handle ESC key manually if needed, though native dialog does it. 
        // We add a listener to sync the 'isOpen' prop with the native close event.
        useEffect(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;

            const handleClose = () => {
                onClose();
                document.body.style.overflow = '';
            };

            dialog.addEventListener('close', handleClose);

            // Close on backdrop click
            const handleBackdropClick = (e: MouseEvent) => {
                const rect = dialog.getBoundingClientRect();
                const isInDialog =
                    rect.top <= e.clientY &&
                    e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX &&
                    e.clientX <= rect.left + rect.width;

                if (!isInDialog) {
                    dialog.close();
                }
            };

            dialog.addEventListener('click', handleBackdropClick);

            return () => {
                dialog.removeEventListener('close', handleClose);
                dialog.removeEventListener('click', handleBackdropClick);
            };
        }, [onClose]);

        return (
            <dialog
                ref={dialogRef}
                className={`
          backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm
          open:animate-in open:fade-in-0 open:zoom-in-95
          bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/5 
          w-full max-w-lg p-0
          ${className || ''}
        `}
                aria-labelledby="dialog-title"
                aria-describedby={description ? "dialog-desc" : undefined}
                {...props}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 id="dialog-title" className={`text-lg font-semibold ${variant === 'alert' ? 'text-red-600' : 'text-slate-900'}`}>
                        {title}
                    </h2>
                    <button
                        onClick={() => {
                            dialogRef.current?.close();
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        aria-label="Close dialog"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="px-6 py-4">
                    {description && (
                        <p id="dialog-desc" className="text-sm text-slate-500 mb-4">
                            {description}
                        </p>
                    )}
                    {children}
                </div>
            </dialog>
        );
    }
);

Dialog.displayName = 'Dialog';
