import { useEffect } from 'react';

/**
 * Ref-counted body scroll lock.
 *
 * Multiple components (Dialog, Modal, Toast, future Drawer) can request a
 * scroll lock simultaneously without trampling each other. The lock is only
 * released when every requester has released it.
 */
let lockCount = 0;
let originalOverflow: string | null = null;

function acquire() {
    if (typeof document === 'undefined') return;
    if (lockCount === 0) {
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }
    lockCount += 1;
}

function release() {
    if (typeof document === 'undefined') return;
    if (lockCount === 0) return;
    lockCount -= 1;
    if (lockCount === 0) {
        document.body.style.overflow = originalOverflow ?? '';
        originalOverflow = null;
    }
}

/**
 * Lock body scroll while `active` is true. Safe to nest across components.
 */
export function useScrollLock(active: boolean) {
    useEffect(() => {
        if (!active) return;
        acquire();
        return release;
    }, [active]);
}
