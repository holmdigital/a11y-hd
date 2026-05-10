// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 4.1.3 Status Messages — toast announcement via aria-live polite/assertive
 * - 2.2.1 Timing Adjustable — auto-dismiss timing and pause-on-hover
 * - 4.1.2 Name, Role, Value — role="status"/"alert", correct aria attributes
 */
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './Toast';

const Trigger = ({ type, title, duration }: { type?: 'info' | 'success' | 'warning' | 'error'; title: string; duration?: number }) => {
    const { addToast } = useToast();
    return (
        <button type="button" onClick={() => addToast({ title, type, duration })}>
            Trigger
        </button>
    );
};

const renderWithProvider = (props: { type?: 'info' | 'success' | 'warning' | 'error'; title: string; duration?: number }) =>
    render(
        <ToastProvider>
            <Trigger {...props} />
        </ToastProvider>
    );

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

describe('Toast — WCAG 2.1 AA conformance', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('uses role="alert" + aria-live="assertive" for error toasts', () => {
        const { getByText, queryByRole } = renderWithProvider({ type: 'error', title: 'Save failed' });
        fireEvent.click(getByText('Trigger'));
        const toast = queryByRole('alert');
        expect(toast).not.toBeNull();
        expect(toast?.getAttribute('aria-live')).toBe('assertive');
    });

    it('uses role="status" + aria-live="polite" for non-urgent toasts', () => {
        const { getByText, queryByRole } = renderWithProvider({ type: 'success', title: 'Saved' });
        fireEvent.click(getByText('Trigger'));
        const toast = queryByRole('status');
        expect(toast).not.toBeNull();
        expect(toast?.getAttribute('aria-live')).toBe('polite');
    });

    it('does NOT auto-dismiss error toasts (WCAG 2.2.1 Timing Adjustable)', () => {
        const { getByText, queryByRole } = renderWithProvider({ type: 'error', title: 'Critical' });
        fireEvent.click(getByText('Trigger'));
        expect(queryByRole('alert')).not.toBeNull();
        // 30 seconds is well beyond any reasonable auto-dismiss heuristic.
        advance(30000);
        expect(queryByRole('alert')).not.toBeNull();
    });

    it('auto-dismisses success toasts after a reading-rate-aware duration', () => {
        const { getByText, queryByRole } = renderWithProvider({ type: 'success', title: 'Saved' });
        fireEvent.click(getByText('Trigger'));
        expect(queryByRole('status')).not.toBeNull();
        advance(10000);
        expect(queryByRole('status')).toBeNull();
    });

    it('pauses the auto-dismiss timer while the toast is hovered', () => {
        const { getByText, queryByRole } = renderWithProvider({ type: 'info', title: 'Heads up', duration: 1000 });
        fireEvent.click(getByText('Trigger'));
        const toast = queryByRole('status')!;
        fireEvent.mouseEnter(toast);
        advance(2000);
        // Should still be visible because the timer is paused.
        expect(queryByRole('status')).not.toBeNull();
        fireEvent.mouseLeave(toast);
        advance(1000);
        expect(queryByRole('status')).toBeNull();
    });

    it('dismisses the most-recent urgent toast on Escape', () => {
        const { getByText, queryAllByRole } = renderWithProvider({ type: 'error', title: 'Boom' });
        fireEvent.click(getByText('Trigger'));
        fireEvent.click(getByText('Trigger'));
        expect(queryAllByRole('alert')).toHaveLength(2);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(queryAllByRole('alert')).toHaveLength(1);
    });
});
