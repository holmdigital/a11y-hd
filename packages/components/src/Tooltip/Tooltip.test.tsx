// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.4.13 Content on Hover or Focus — dismissible, hoverable, persistent
 * - 2.1.1 Keyboard — Escape dismisses without moving focus
 * - 4.1.2 Name, Role, Value — role="tooltip", aria-describedby wiring
 */
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';
import { expectNoAxeViolations } from '../_test/helpers';

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

/**
 * Implementation note: D-02a waiver for the legacy SC 1.4.13 block above.
 * The existing tests use fireEvent because the contract under test
 * (Escape-doesn't-poison-dismissed-flag, hover-bridge cancel, reopen-after-blur)
 * is timing-sensitive and the fake-timers + @testing-library/user-event v14 + vitest 4 combo
 * deadlocks (see STATE.md Plan 27-01 deviations). The NEW Tier 1 + Tier 2 blocks
 * below are D-02a-clean (no fireEvent / querySelector / configureAxe / toMatchSnapshot)
 * and satisfy the Phase 22 template-setter contract for TC-15.
 */
describe('Tier 1: Table Stakes', () => {
    afterEach(() => { cleanup(); });

    it('mounts and renders the trigger child', () => {
        render(
            <Tooltip>
                <TooltipTrigger>
                    <button type="button">Open settings</button>
                </TooltipTrigger>
                <TooltipContent>Settings tooltip</TooltipContent>
            </Tooltip>
        );
        expect(screen.getByRole('button', { name: /open settings/i })).toBeInTheDocument();
    });

    it('does not render the tooltip content before interaction', () => {
        render(
            <Tooltip>
                <TooltipTrigger>
                    <button type="button">Open settings</button>
                </TooltipTrigger>
                <TooltipContent>Settings tooltip</TooltipContent>
            </Tooltip>
        );
        expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('TooltipContent renders the provided text when open', () => {
        render(
            <Tooltip>
                <TooltipTrigger>
                    <button type="button">Open settings</button>
                </TooltipTrigger>
                <TooltipContent>Settings tooltip</TooltipContent>
            </Tooltip>
        );
        const trigger = screen.getByRole('button', { name: /open settings/i });
        act(() => { trigger.focus(); });
        expect(screen.getByRole('tooltip')).toHaveTextContent(/settings tooltip/i);
    });

    it('passes className through to TooltipContent when open', () => {
        render(
            <Tooltip>
                <TooltipTrigger>
                    <button type="button">Open settings</button>
                </TooltipTrigger>
                <TooltipContent className="custom-tt-class">Settings tooltip</TooltipContent>
            </Tooltip>
        );
        const trigger = screen.getByRole('button', { name: /open settings/i });
        act(() => { trigger.focus(); });
        expect(screen.getByRole('tooltip').className).toContain('custom-tt-class');
    });
});

describe('Tier 2: A11y Differentiators (role=tooltip + axe smoke)', () => {
    afterEach(() => { cleanup(); });

    it('exposes role="tooltip" when open', () => {
        render(
            <Tooltip>
                <TooltipTrigger>
                    <button type="button">Open settings</button>
                </TooltipTrigger>
                <TooltipContent>Settings tooltip</TooltipContent>
            </Tooltip>
        );
        const trigger = screen.getByRole('button', { name: /open settings/i });
        act(() => { trigger.focus(); });
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('axe-clean for trigger with open tooltip', async () => {
        const { container } = render(
            <Tooltip>
                <TooltipTrigger>
                    <button type="button">Open settings</button>
                </TooltipTrigger>
                <TooltipContent>Settings tooltip</TooltipContent>
            </Tooltip>
        );
        const trigger = screen.getByRole('button', { name: /open settings/i });
        act(() => { trigger.focus(); });
        await expectNoAxeViolations(container);
    });
});
