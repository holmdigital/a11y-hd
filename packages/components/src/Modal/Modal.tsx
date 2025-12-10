import { forwardRef } from 'react';
import { Dialog, DialogProps } from '../Dialog/Dialog';

export interface ModalProps extends Omit<DialogProps, 'variant'> {
    // Add any specific modal props here if needed
}

export const Modal = forwardRef<HTMLDialogElement, ModalProps>((props, ref) => {
    return (
        <Dialog
            ref={ref}
            {...props}
            className={`max-w-2xl ${props.className || ''}`}
        />
    );
});

Modal.displayName = 'Modal';
