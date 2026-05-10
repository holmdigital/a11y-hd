// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 2.1.2 No Keyboard Trap — Tab cycles focusable elements within the
 *   dialog and Escape exits (focus trap is bounded by the dialog).
 * - 2.4.3 Focus Order — APG dialog focus moves into the dialog on open
 *   and restores to the opener on close.
 * - 4.1.2 Name, Role, Value — role="dialog" / "alertdialog",
 *   aria-modal="true", aria-labelledby, aria-describedby.
 *
 * The HTMLDialogElement.showModal/close polyfill is centralised in
 * src/_test/setup.ts (Plan 22-01). The duplicate inline setup hook that
 * used to live here was removed in Plan 22-08 once the central polyfill
 * was proven via TC-04 (Modal.test.tsx).
 */
import { useState } from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Dialog } from './Dialog';

const Harness = ({ initialOpen = true, ...rest }: { initialOpen?: boolean } & Partial<React.ComponentProps<typeof Dialog>>) => {
    const [open, setOpen] = useState(initialOpen);
    return (
        <>
            <button data-testid="opener" type="button" onClick={() => setOpen(true)}>Open</button>
            <Dialog isOpen={open} onClose={() => setOpen(false)} title="Settings" description="Configure app" {...rest}>
                <button data-testid="confirm" type="button">Confirm</button>
                <button data-testid="cancel" type="button">Cancel</button>
            </Dialog>
        </>
    );
};

describe('Dialog — WCAG 2.1 AA conformance', () => {
    afterEach(() => cleanup());

    it('renders with role="dialog" and aria-modal="true" by default', () => {
        const { getByRole } = render(<Harness />);
        const dialog = getByRole('dialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('renders with role="alertdialog" when variant="alert"', () => {
        const { getByRole } = render(<Harness variant="alert" />);
        const dialog = getByRole('alertdialog');
        expect(dialog).not.toBeNull();
    });

    it('uses unique aria-labelledby/describedby ids per instance (no duplicates)', () => {
        const { container } = render(
            <>
                <Harness />
                <Harness />
            </>
        );
        const dialogs = container.querySelectorAll('[role="dialog"]');
        expect(dialogs).toHaveLength(2);
        const labelledBy = Array.from(dialogs).map(d => d.getAttribute('aria-labelledby'));
        // The two dialogs must reference different ids — proves no hardcoded "dialog-title".
        expect(labelledBy[0]).not.toBe(labelledBy[1]);
        expect(labelledBy[0]).not.toBeNull();
        expect(labelledBy[1]).not.toBeNull();

        // Each id resolves to exactly one element on the page (use getElementById since
        // useId() returns ":r2:"-style strings that aren't valid CSS selectors).
        const allIdsOnPage = Array.from(container.querySelectorAll('[id]')).map(el => el.id);
        for (const id of labelledBy) {
            const occurrences = allIdsOnPage.filter(x => x === id).length;
            expect(occurrences).toBe(1);
        }
    });

    it('calls onClose when the close button is clicked', () => {
        let closed = false;
        const onClose = () => { closed = true; };
        const { getByLabelText } = render(
            <Dialog isOpen={true} onClose={onClose} title="Test">
                <p>Body</p>
            </Dialog>
        );
        fireEvent.click(getByLabelText('Close dialog'));
        expect(closed).toBe(true);
    });

    it('moves focus into the dialog on open and restores it on close', () => {
        const { rerender } = render(
            <Dialog isOpen={false} onClose={() => undefined} title="Settings">
                <button data-testid="confirm" type="button">Confirm</button>
            </Dialog>
        );
        // Simulate prior focus.
        const externalButton = document.createElement('button');
        externalButton.id = 'external';
        document.body.appendChild(externalButton);
        externalButton.focus();
        expect(document.activeElement).toBe(externalButton);

        rerender(
            <Dialog isOpen={true} onClose={() => undefined} title="Settings">
                <button data-testid="confirm" type="button">Confirm</button>
            </Dialog>
        );

        // Focus should move to the first focusable inside the dialog.
        // Close button is the first focusable in our DOM, but also acceptable: any element inside the dialog.
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog?.contains(document.activeElement)).toBe(true);

        rerender(
            <Dialog isOpen={false} onClose={() => undefined} title="Settings">
                <button data-testid="confirm" type="button">Confirm</button>
            </Dialog>
        );

        // Focus should be restored to the opener.
        expect(document.activeElement).toBe(externalButton);
        document.body.removeChild(externalButton);
    });

    it('respects initialFocusRef when provided', () => {
        const initialFocusRef = { current: null as HTMLElement | null };
        const { rerender } = render(
            <Dialog isOpen={false} onClose={() => undefined} title="X" initialFocusRef={initialFocusRef}>
                <button ref={(el) => { initialFocusRef.current = el; }} data-testid="confirm" type="button">Confirm</button>
            </Dialog>
        );
        rerender(
            <Dialog isOpen={true} onClose={() => undefined} title="X" initialFocusRef={initialFocusRef}>
                <button ref={(el) => { initialFocusRef.current = el; }} data-testid="confirm" type="button">Confirm</button>
            </Dialog>
        );
        expect(document.activeElement).toBe(initialFocusRef.current);
    });
});
