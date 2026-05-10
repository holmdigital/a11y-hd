/**
 * WCAG SCs covered:
 * - 2.1.2 No Keyboard Trap — Tab/Shift+Tab cycle is bounded inside the container,
 *   never escapes to <body> while active.
 * - 2.4.3 Focus Order — focus moves into the container on activation in a
 *   sensible order (initialFocusRef > first focusable > container itself).
 * - 2.4.7 Focus Visible — restore-on-unmount behaviour means the opener
 *   regains a visible focus indicator after the trap releases.
 */
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef, useState } from 'react';
import { useFocusTrap } from './useFocusTrap';

interface HarnessProps {
    withInitialFocusRef?: boolean;
    noFocusables?: boolean;
    multipleFocusables?: boolean;
}

function Harness({ withInitialFocusRef, noFocusables, multipleFocusables }: HarnessProps) {
    const [active, setActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const initialFocusRef = useRef<HTMLButtonElement>(null);
    useFocusTrap(containerRef, active, withInitialFocusRef ? initialFocusRef : undefined);
    return (
        <>
            <button data-testid="opener" type="button" onClick={() => setActive(true)}>
                Open
            </button>
            <button data-testid="closer" type="button" onClick={() => setActive(false)}>
                Close
            </button>
            <div data-testid="container" ref={containerRef}>
                {noFocusables ? (
                    <span>nothing focusable here</span>
                ) : multipleFocusables ? (
                    <>
                        <button data-testid="first" type="button">
                            First
                        </button>
                        <button data-testid="middle" type="button">
                            Middle
                        </button>
                        <button ref={initialFocusRef} data-testid="initial" type="button">
                            Initial
                        </button>
                        <button data-testid="last" type="button">
                            Last
                        </button>
                    </>
                ) : (
                    <button data-testid="only" type="button">
                        Only
                    </button>
                )}
            </div>
        </>
    );
}

describe('Tier 1: Table Stakes', () => {
    it('does nothing while active=false', () => {
        const { getByTestId } = render(<Harness multipleFocusables />);
        getByTestId('opener').focus();
        expect(document.activeElement).toBe(getByTestId('opener'));
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('Scenario 1 — focuses the first focusable when activated (multiple focusables)', () => {
        const { getByTestId } = render(<Harness multipleFocusables />);
        const opener = getByTestId('opener');
        opener.focus();
        act(() => {
            opener.click();
        });
        // First focusable inside the container should now hold focus.
        expect(document.activeElement).toBe(getByTestId('first'));
    });

    it('Scenario 2 — honours initialFocusRef when provided', () => {
        const { getByTestId } = render(<Harness multipleFocusables withInitialFocusRef />);
        const opener = getByTestId('opener');
        opener.focus();
        act(() => {
            opener.click();
        });
        expect(document.activeElement).toBe(getByTestId('initial'));
    });

    // Native KeyboardEvent dispatch (not user-event) because useFocusTrap attaches its
    // handler via container.addEventListener('keydown', ...) and reads document.activeElement
    // synchronously. Per PITFALLS §3.3, fireEvent / native dispatch is fine for components
    // that handle Tab themselves.
    it('Scenario 3 — Tab from last focusable cycles back to first; Shift+Tab from first cycles to last', () => {
        const { getByTestId } = render(<Harness multipleFocusables />);
        const opener = getByTestId('opener');
        opener.focus();
        act(() => {
            opener.click();
        });
        const first = getByTestId('first');
        const last = getByTestId('last');
        const container = getByTestId('container');

        // Place focus on last, fire Tab — should land on first.
        act(() => {
            last.focus();
        });
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        act(() => {
            container.dispatchEvent(tabEvent);
        });
        expect(document.activeElement).toBe(first);

        // Place focus on first, fire Shift+Tab — should land on last.
        act(() => {
            first.focus();
        });
        const shiftTabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        });
        act(() => {
            container.dispatchEvent(shiftTabEvent);
        });
        expect(document.activeElement).toBe(last);
    });

    it('Scenario 4 — restores focus to opener on unmount/deactivation', () => {
        const { getByTestId } = render(<Harness multipleFocusables />);
        const opener = getByTestId('opener');
        opener.focus();
        act(() => {
            opener.click();
        });
        expect(document.activeElement).toBe(getByTestId('first'));
        act(() => {
            getByTestId('closer').click();
        });
        expect(document.activeElement).toBe(opener);
    });

    it('Scenario 5 — container with no focusables: focus moves to container itself, no crash', () => {
        const { getByTestId } = render(<Harness noFocusables />);
        const opener = getByTestId('opener');
        opener.focus();
        expect(() =>
            act(() => {
                opener.click();
            }),
        ).not.toThrow();
        const container = getByTestId('container');
        expect(container.getAttribute('tabindex')).toBe('-1');
        expect(document.activeElement).toBe(container);
    });
});
