// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveRegion } from './LiveRegion';

describe('LiveRegion', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders a polite live region by default', () => {
        const { container } = render(<LiveRegion />);
        const region = container.firstChild as HTMLElement;
        expect(region).toBeDefined();
        expect(region.getAttribute('aria-live')).toBe('polite');
    });

    it('updates the announcement when message prop changes', () => {
        const { rerender, container } = render(<LiveRegion message="" />);

        // Initial state
        expect(container.textContent).toBe('');

        // Update message
        rerender(<LiveRegion message="Hello World" />);
        expect(container.textContent).toBe('Hello World');
    });

    it('uses aria-live="polite" by default', () => {
        const { container } = render(<LiveRegion message="Test" />);
        const region = container.firstChild as HTMLElement;
        expect(region.getAttribute('aria-live')).toBe('polite');
    });

    it('uses aria-live="assertive" when configured', () => {
        const { container } = render(<LiveRegion message="Alert!" ariaLive="assertive" />);
        const region = container.firstChild as HTMLElement;
        expect(region.getAttribute('aria-live')).toBe('assertive');
    });

    it('clears the message after specified timeout', () => {
        const { container } = render(<LiveRegion message="Temporary" clearAfter={1000} />);

        expect(container.textContent).toBe('Temporary');

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(container.textContent).toBe('');
    });
});
