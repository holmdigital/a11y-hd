// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 4.1.3 Status Messages — toast announcement via aria-live polite/assertive
 * - 2.2.1 Timing Adjustable — auto-dismiss timing and pause-on-hover
 * - 4.1.2 Name, Role, Value — role="status"/"alert", correct aria attributes
 */
import { render, fireEvent, cleanup, act, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// File-scoped lucide-react stub (PUB-06 Strategy A): forces the glyph-fallback
// code path. Pre-existing Toast tests assert on roles/aria-live, not rendered
// lucide SVGs, so this is harmless.
vi.mock('lucide-react', () => ({}));

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

describe('lucide-react fallback (PUB-06)', () => {
    // WCAG 1.1.1 Non-text Content, 1.3.1 Info and Relationships.
    // Variant glyphs remain aria-hidden; the toast's role=alert/status conveys urgency.
    // Use real timers here — these tests don't need fake-timer scheduling.
    beforeEach(() => { vi.useRealTimers(); });
    afterEach(() => { cleanup(); });

    it('renders the ✕ close-button glyph fallback when lucide-react is absent', async () => {
        const { getByText } = renderWithProvider({ type: 'info', title: 'Hi', duration: Infinity });
        fireEvent.click(getByText('Trigger'));
        await waitFor(() => {
            expect(screen.getByTestId('toast-close-fallback-glyph')).toBeInTheDocument();
        });
        expect(screen.getByTestId('toast-close-fallback-glyph')).toHaveTextContent('✕');
        expect(screen.getByTestId('toast-close-fallback-glyph')).toHaveAttribute('aria-hidden', 'true');
    });

    it.each([
        ['info', 'toast-info-fallback-glyph', 'ℹ'],
        ['success', 'toast-success-fallback-glyph', '✓'],
        ['warning', 'toast-warning-fallback-glyph', '⚠'],
        ['error', 'toast-error-fallback-glyph', '⛔'],
    ] as const)('variant=%s renders %s glyph fallback', async (type, testId, glyph) => {
        const { getByText } = renderWithProvider({ type, title: `${type} toast`, duration: Infinity });
        fireEvent.click(getByText('Trigger'));
        await waitFor(() => {
            expect(screen.getByTestId(testId)).toBeInTheDocument();
        });
        expect(screen.getByTestId(testId)).toHaveTextContent(glyph);
        expect(screen.getByTestId(testId)).toHaveAttribute('aria-hidden', 'true');
    });
});
