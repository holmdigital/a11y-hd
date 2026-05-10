// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — semantic dialog role exposes the
 *   modal's nature programmatically (role="dialog").
 * - 2.1.2 No Keyboard Trap — focus trap is bounded by the dialog and
 *   restored on close; the hook contract is pinned by Plan 22-04
 *   (useFocusTrap.test.tsx). This suite verifies Modal correctly WIRES
 *   the hook, not the hook's internals.
 * - 2.4.3 Focus Order — focus moves into the dialog on open and is
 *   restored to the opener on close.
 * - 2.4.7 Focus Visible — restored focus lands on a focusable opener.
 * - 4.1.2 Name, Role, Value — role="dialog", aria-modal="true",
 *   aria-labelledby resolves to the title, aria-describedby resolves
 *   to the description (PITFALLS §3.1 id-resolution check).
 *
 * Modal is a thin wrapper around Dialog that hard-codes `max-w-2xl`
 * (Modal.tsx line 11). Tests cover (1) the wrapper-specific concerns
 * — className composition, ref forwarding, prop passthrough — and
 * (2) the integration-level dialog contract Modal inherits from Dialog.
 */
import { useRef, useState } from 'react';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { Modal } from './Modal';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

/**
 * Controlled harness mirroring Dialog.test.tsx — opener button + Modal +
 * interior buttons. Re-uses the same shape so the two suites read together.
 */
const Harness = ({
    initialOpen = true,
    onClose,
    title = 'Settings',
    description = 'Configure app',
    ...rest
}: {
    initialOpen?: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
} & Partial<React.ComponentProps<typeof Modal>>) => {
    const [open, setOpen] = useState(initialOpen);
    const handleClose = () => {
        onClose?.();
        setOpen(false);
    };
    return (
        <>
            <button data-testid="opener" type="button" onClick={() => setOpen(true)}>
                Open
            </button>
            <Modal isOpen={open} onClose={handleClose} title={title} description={description} {...rest}>
                <button data-testid="confirm" type="button">
                    Confirm
                </button>
                <button data-testid="cancel" type="button">
                    Cancel
                </button>
            </Modal>
        </>
    );
};

afterEach(() => cleanup());

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders children when isOpen=true', () => {
        render(<Harness />);
        expect(screen.getByTestId('confirm')).toBeInTheDocument();
        expect(screen.getByTestId('cancel')).toBeInTheDocument();
    });

    it('does not show the dialog as open when isOpen=false', () => {
        render(<Harness initialOpen={false} />);
        const dialog = screen.getByRole('dialog', { hidden: true });
        // The native <dialog> exposes its open state via the `open` attribute.
        expect(dialog.hasAttribute('open')).toBe(false);
    });

    it('forwards ref to the underlying HTMLDialogElement', () => {
        let captured: HTMLDialogElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLDialogElement>(null);
            return (
                <Modal
                    ref={(node) => {
                        ref.current = node;
                        captured = node;
                    }}
                    isOpen={true}
                    onClose={() => undefined}
                    title="Probe"
                >
                    <button type="button">Inside</button>
                </Modal>
            );
        };
        render(<Probe />);
        expect(captured).not.toBeNull();
        expect(captured).toBeInstanceOf(HTMLDialogElement);
    });

    it('className passthrough merges with the hard-coded max-w-2xl', () => {
        render(<Harness className="consumer-modal" />);
        const dialog = screen.getByRole('dialog');
        expect(dialog.className).toContain('max-w-2xl');
        expect(dialog.className).toContain('consumer-modal');
    });

    it('renders title and description text content', () => {
        render(<Harness title="Modal Title" description="Modal description text" />);
        expect(screen.getByText('Modal Title')).toBeInTheDocument();
        expect(screen.getByText('Modal description text')).toBeInTheDocument();
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('exposes role="dialog" by default (WCAG 1.3.1, 4.1.2)', () => {
        render(<Harness />);
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
    });

    it('sets aria-modal="true" so AT trees treat content behind as inert (WCAG 4.1.2)', () => {
        render(<Harness />);
        const dialog = screen.getByRole('dialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('aria-labelledby resolves to an element containing the title (PITFALLS §3.1)', () => {
        render(<Harness title="Unique Modal Title" />);
        const dialog = screen.getByRole('dialog');
        const labelledBy = dialog.getAttribute('aria-labelledby');
        expect(labelledBy).toBeTruthy();
        const labelEl = document.getElementById(labelledBy!);
        expect(labelEl).not.toBeNull();
        expect(labelEl!.textContent).toContain('Unique Modal Title');
    });

    it('aria-describedby resolves to an element containing the description (PITFALLS §3.1)', () => {
        render(<Harness description="Unique Modal Description" />);
        const dialog = screen.getByRole('dialog');
        const describedBy = dialog.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        const descEl = document.getElementById(describedBy!);
        expect(descEl).not.toBeNull();
        expect(descEl!.textContent).toContain('Unique Modal Description');
    });

    it('on open, focus moves into the dialog (Modal wires useFocusTrap correctly)', () => {
        // Hook contract pinned by Plan 22-04 (useFocusTrap.test.tsx). This
        // assertion verifies WIRING — that Modal/Dialog actually invokes the
        // hook against the dialog element when isOpen flips true.
        const externalButton = document.createElement('button');
        externalButton.id = 'external-opener';
        externalButton.textContent = 'External';
        document.body.appendChild(externalButton);
        externalButton.focus();

        const { rerender } = render(
            <Modal isOpen={false} onClose={() => undefined} title="Test">
                <button data-testid="confirm" type="button">Confirm</button>
            </Modal>,
        );
        rerender(
            <Modal isOpen={true} onClose={() => undefined} title="Test">
                <button data-testid="confirm" type="button">Confirm</button>
            </Modal>,
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
        document.body.removeChild(externalButton);
    });

    it('on close, focus is restored to the opener (integration of useFocusTrap Scenario 4)', () => {
        const externalButton = document.createElement('button');
        externalButton.id = 'restore-target';
        externalButton.textContent = 'Opener';
        document.body.appendChild(externalButton);
        externalButton.focus();
        expect(document.activeElement).toBe(externalButton);

        const { rerender } = render(
            <Modal isOpen={true} onClose={() => undefined} title="Test">
                <button data-testid="confirm" type="button">Confirm</button>
            </Modal>,
        );
        rerender(
            <Modal isOpen={false} onClose={() => undefined} title="Test">
                <button data-testid="confirm" type="button">Confirm</button>
            </Modal>,
        );

        expect(document.activeElement).toBe(externalButton);
        document.body.removeChild(externalButton);
    });

    it('Escape key path fires onClose via the native close event (D-02a paired with click test)', async () => {
        // Modal/Dialog wires onClose to the native <dialog> `close` event
        // (Dialog.tsx lines 85–87, 106). The browser dispatches `close` when
        // Escape triggers the native cancel→close sequence. Our setup.ts
        // polyfill dispatches `close` from `dialog.close()`. We verify the
        // wiring by triggering a programmatic close — the equivalent path
        // Escape takes — and asserting onClose fires.
        const onClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={onClose} title="Escape test">
                <button type="button">Inside</button>
            </Modal>,
        );
        const dialog = screen.getByRole('dialog');
        // Simulate the browser's Escape→close sequence.
        (dialog as HTMLDialogElement).close();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('click on the backdrop (target === dialog) fires onClose (D-02a paired with Escape)', () => {
        // Dialog.tsx lines 96–104: backdrop click is detected by checking
        // `e.target === dialog`. Clicks on children do NOT close.
        const onClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={onClose} title="Backdrop test">
                <button data-testid="inner" type="button">Inside</button>
            </Modal>,
        );
        const dialog = screen.getByRole('dialog');

        // Click on a child should NOT close.
        fireEvent.click(screen.getByTestId('inner'));
        expect(onClose).not.toHaveBeenCalled();

        // Click directly on the dialog element (backdrop semantics) SHOULD close.
        fireEvent.click(dialog, { target: dialog });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('axe-clean for default open state', async () => {
        const { container } = render(<Harness />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for open state with footer action buttons', async () => {
        const { container } = render(
            <Modal isOpen={true} onClose={() => undefined} title="Confirm action" description="Are you sure?">
                <div>
                    <button type="button">Cancel</button>
                    <button type="button">Confirm</button>
                </div>
            </Modal>,
        );
        await expectNoAxeViolations(container);
    });

    it('two Modals on the same page produce no duplicate ids', () => {
        const { container } = render(
            <>
                <Harness title="First" description="First desc" />
                <Harness title="Second" description="Second desc" initialOpen={false} />
            </>,
        );
        expectUniqueIds(container);
    });
});
