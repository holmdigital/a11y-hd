// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.4.13 Content on Hover or Focus — dismissible, hoverable, persistent
 * - 2.1.1 Keyboard — Escape dismisses without moving focus
 * - 4.1.2 Name, Role, Value — role="tooltip", aria-describedby wiring
 */
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';

const renderTooltip = () => render(
    <Tooltip>
        <TooltipTrigger>
            <button data-testid="trigger" type="button">Open settings</button>
        </TooltipTrigger>
        <TooltipContent>Settings tooltip</TooltipContent>
    </Tooltip>
);

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

describe('Tooltip — WCAG 2.1 SC 1.4.13 (Content on Hover or Focus)', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    describe('Dismissible', () => {
        it('closes on Escape without moving focus', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            act(() => { trigger.focus(); });
            expect(queryByRole('tooltip')).not.toBeNull();

            fireEvent.keyDown(trigger, { key: 'Escape' });
            expect(queryByRole('tooltip')).toBeNull();
            // Focus must remain on the trigger (SC 1.4.13: dismiss without moving focus)
            expect(document.activeElement).toBe(trigger);
        });

        it('does not flip dismissed-state when Escape is pressed while closed', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            // Tooltip is closed — pressing Escape here must not poison the dismissed flag.
            fireEvent.keyDown(trigger, { key: 'Escape' });

            // Hover after — should still open normally.
            fireEvent.mouseEnter(trigger);
            expect(queryByRole('tooltip')).not.toBeNull();
        });

        it('does not immediately reopen while the trigger is still focused after Escape', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            act(() => { trigger.focus(); });
            fireEvent.keyDown(trigger, { key: 'Escape' });
            expect(queryByRole('tooltip')).toBeNull();

            // Re-firing focus / mouseEnter while still on the trigger should NOT reopen.
            // (Browsers won't typically fire focus again here, but jsdom can — guard against it.)
            fireEvent.focus(trigger);
            fireEvent.mouseEnter(trigger);
            expect(queryByRole('tooltip')).toBeNull();
        });

        it('reopens on a fresh interaction after blur', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            act(() => { trigger.focus(); });
            fireEvent.keyDown(trigger, { key: 'Escape' });
            expect(queryByRole('tooltip')).toBeNull();

            // Blur resets dismissed; next focus opens again.
            act(() => { trigger.blur(); });
            advance(100); // let the close-timeout drain
            act(() => { trigger.focus(); });
            expect(queryByRole('tooltip')).not.toBeNull();
        });

        it('stops Escape from bubbling so it does not also dismiss an enclosing dialog', () => {
            const onAncestorEscape = vi.fn();
            const { getByTestId } = render(
                <div onKeyDown={(e) => { if (e.key === 'Escape') onAncestorEscape(); }}>
                    <Tooltip>
                        <TooltipTrigger>
                            <button data-testid="trigger" type="button">Trigger</button>
                        </TooltipTrigger>
                        <TooltipContent>Content</TooltipContent>
                    </Tooltip>
                </div>
            );
            const trigger = getByTestId('trigger');
            act(() => { trigger.focus(); });
            fireEvent.keyDown(trigger, { key: 'Escape' });
            expect(onAncestorEscape).not.toHaveBeenCalled();
        });
    });

    describe('Hoverable', () => {
        it('keeps the tooltip open while the pointer is on the content', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            fireEvent.mouseEnter(trigger);
            expect(queryByRole('tooltip')).not.toBeNull();

            // Pointer leaves trigger — close is scheduled but not committed yet.
            fireEvent.mouseLeave(trigger);

            // Pointer enters content within the close-delay window — close must be cancelled.
            const tooltip = queryByRole('tooltip')!;
            fireEvent.mouseEnter(tooltip);
            advance(200);
            expect(queryByRole('tooltip')).not.toBeNull();
        });

        it('closes after the pointer leaves both trigger and content', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            fireEvent.mouseEnter(trigger);
            fireEvent.mouseLeave(trigger);
            const tooltip = queryByRole('tooltip')!;
            fireEvent.mouseEnter(tooltip);
            fireEvent.mouseLeave(tooltip);
            advance(200);
            expect(queryByRole('tooltip')).toBeNull();
        });
    });

    describe('Persistent', () => {
        it('remains open while the trigger has focus (no auto-timeout)', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            act(() => { trigger.focus(); });
            advance(5000);
            expect(queryByRole('tooltip')).not.toBeNull();
        });
    });

    describe('aria-describedby', () => {
        it('attaches the tooltip id to the trigger only while open', () => {
            const { getByTestId, queryByRole } = renderTooltip();
            const trigger = getByTestId('trigger');

            expect(trigger.getAttribute('aria-describedby')).toBeNull();

            fireEvent.mouseEnter(trigger);
            const describedBy = trigger.getAttribute('aria-describedby');
            expect(describedBy).not.toBeNull();
            expect(queryByRole('tooltip')!.id).toBe(describedBy);

            fireEvent.mouseLeave(trigger);
            advance(200);
            expect(trigger.getAttribute('aria-describedby')).toBeNull();
        });
    });
});
