import { forwardRef } from 'react';
import { Dialog, DialogProps } from '../Dialog/Dialog';

export type ModalProps = Omit<DialogProps, 'variant'>;

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
