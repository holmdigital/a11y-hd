import React, { useRef, useEffect, useId, forwardRef, useImperativeHandle } from 'react';
import { useFocusTrap } from '../_hooks/useFocusTrap';
import { useScrollLock } from '../_hooks/useScrollLock';

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
        aria-hidden="true"
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);


export interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'role'> {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    /** `'alert'` produces `role="alertdialog"` and a red title (per WAI-ARIA). */
    variant?: 'default' | 'alert';
    description?: string;
    /** Element to focus when the dialog opens. Defaults to first focusable child. */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    /** Close when the user clicks the backdrop. Default: true. */
    closeOnBackdropClick?: boolean;
    /** Close when the user presses Escape. Default: true. */
    closeOnEscape?: boolean;
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
    ({
        isOpen,
        onClose,
        title,
        children,
        variant = 'default',
        description,
        className,
        initialFocusRef,
        closeOnBackdropClick = true,
        closeOnEscape = true,
        ...props
    }, ref) => {
        const dialogRef = useRef<HTMLDialogElement>(null);
        const reactId = useId();
        const titleId = `${reactId}-title`;
        const descId = `${reactId}-desc`;

        useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement);

        // Open / close the native dialog in sync with `isOpen`.
        useEffect(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;
            if (isOpen && !dialog.open) {
                dialog.showModal();
            } else if (!isOpen && dialog.open) {
                dialog.close();
            }
        }, [isOpen]);

        // Ref-counted scroll lock — composes safely with stacked dialogs.
        useScrollLock(isOpen);

        // Focus management: trap inside dialog, restore to opener on close.
        useFocusTrap(dialogRef as React.RefObject<HTMLElement | null>, isOpen, initialFocusRef);

        // Wire native `close` event to the consumer's onClose, and intercept
        // Escape / backdrop clicks if the consumer disabled them.
        useEffect(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;

            const handleClose = () => {
                onClose();
            };

            const handleCancel = (e: Event) => {
                // Native `cancel` fires for Escape on <dialog>. Intercept if disabled.
                if (!closeOnEscape) {
                    e.preventDefault();
                }
            };

            const handleClick = (e: MouseEvent) => {
                if (!closeOnBackdropClick) return;
                // A click on the backdrop has `e.target === dialog`. A click on
                // any child element has the child as target. This is reliable
                // even when the dialog is transformed/scaled.
                if (e.target === dialog) {
                    onClose();
                }
            };

            dialog.addEventListener('close', handleClose);
            dialog.addEventListener('cancel', handleCancel);
            dialog.addEventListener('click', handleClick);

            return () => {
                dialog.removeEventListener('close', handleClose);
                dialog.removeEventListener('cancel', handleCancel);
                dialog.removeEventListener('click', handleClick);
            };
        }, [onClose, closeOnEscape, closeOnBackdropClick]);

        return (
            <dialog
                ref={dialogRef}
                role={variant === 'alert' ? 'alertdialog' : 'dialog'}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descId : undefined}
                className={`
                    backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm
                    open:animate-in open:fade-in-0 open:zoom-in-95
                    bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/5
                    w-full max-w-lg p-0
                    ${className || ''}
                `}
                {...props}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 id={titleId} className={`text-lg font-semibold ${variant === 'alert' ? 'text-red-600' : 'text-slate-900'}`}>
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        aria-label="Close dialog"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="px-6 py-4">
                    {description && (
                        <p id={descId} className="text-sm text-slate-500 mb-4">
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
