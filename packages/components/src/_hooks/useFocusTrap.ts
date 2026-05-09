import { useEffect, RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details > summary',
].join(',');

function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

/**
 * Focus management for modal-like containers.
 *
 * When `active` becomes true:
 * 1. Stores the currently-focused element as the "opener".
 * 2. Moves focus to `initialFocusRef.current`, or the first focusable
 *    element inside `containerRef`, or the container itself.
 * 3. Traps Tab / Shift+Tab inside the container.
 *
 * When `active` becomes false:
 * 4. Restores focus to the opener if it is still in the DOM and focusable.
 */
export function useFocusTrap(
    containerRef: RefObject<HTMLElement | null>,
    active: boolean,
    initialFocusRef?: RefObject<HTMLElement | null>
) {
    useEffect(() => {
        if (!active) return;
        const container = containerRef.current;
        if (!container) return;

        const opener = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;

        // Move focus into the container.
        const target = initialFocusRef?.current ?? getFocusable(container)[0] ?? container;
        if (target && typeof target.focus === 'function') {
            // If the container itself is the focus target, ensure it can receive focus.
            if (target === container && !container.hasAttribute('tabindex')) {
                container.setAttribute('tabindex', '-1');
            }
            target.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const focusables = getFocusable(container);
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const activeEl = document.activeElement as HTMLElement | null;

            if (e.shiftKey) {
                if (activeEl === first || !container.contains(activeEl)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (activeEl === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            // Restore focus to opener if it is still mounted and focusable.
            if (opener && typeof opener.focus === 'function' && document.body.contains(opener)) {
                opener.focus();
            }
        };
    }, [active, containerRef, initialFocusRef]);
}
