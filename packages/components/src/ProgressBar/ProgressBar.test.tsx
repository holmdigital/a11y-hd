// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — the progressbar role + numeric ARIA
 *   wiring (aria-valuenow/min/max) expose progress state to assistive
 *   technology in a structured, programmatically determinable form.
 * - 4.1.2 Name, Role, Value — role="progressbar", aria-label, the
 *   aria-valuenow/min/max triad, and the optional aria-valuetext together
 *   form the entire Tier-2 contract. This file pins each leg.
 * - 1.4.3 Contrast (Minimum) — variant prop renders distinct color
 *   tracks; jsdom cannot measure contrast so the variant assertion is a
 *   smoke "mounts and is reachable by accessible name" — real-browser
 *   axe-contrast deferred (same caveat as Button.test.tsx).
 *
 * Template note: mirrors the Phase 22 template-setter shape (Button.test.tsx).
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ProgressBar } from './ProgressBar';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders without crashing', () => {
        render(<ProgressBar value={50} label="Upload" />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders the label text', () => {
        render(<ProgressBar value={50} label="Upload" />);
        expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('shows the percentage value when showValueLabel is true', () => {
        render(<ProgressBar value={42} label="Upload" showValueLabel />);
        expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('appends consumer className to the wrapper additively', () => {
        const { container } = render(
            <ProgressBar value={50} label="Upload" className="extra-class" />,
        );
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper).not.toBeNull();
        expect(wrapper.className).toContain('hd-progress-root');
        expect(wrapper.className).toContain('extra-class');
    });
});

describe('Tier 2: A11y Differentiators (progressbar role + numeric ARIA)', () => {
    it('aria-label equals the label prop', () => {
        render(<ProgressBar value={50} label="Upload progress" />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress');
    });

    it('aria-valuenow reflects value when in range', () => {
        render(<ProgressBar value={42} label="x" />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
    });

    it('aria-valuemin and aria-valuemax default to 0 and 100', () => {
        render(<ProgressBar value={50} label="x" />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-valuemin', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('aria-valuemin and aria-valuemax reflect custom min/max props', () => {
        render(<ProgressBar value={5} min={1} max={10} label="x" />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-valuemin', '1');
        expect(bar).toHaveAttribute('aria-valuemax', '10');
        expect(bar).toHaveAttribute('aria-valuenow', '5');
    });

    it('clamps value above max to max in aria-valuenow', () => {
        render(<ProgressBar value={150} max={100} label="x" />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps value below min to min in aria-valuenow', () => {
        render(<ProgressBar value={-10} min={0} label="x" />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('sets aria-valuetext when valueText prop is provided', () => {
        render(
            <ProgressBar value={2} max={4} label="Step progress" valueText="Step 2 of 4" />,
        );
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 2 of 4');
    });

    it('does not set aria-valuetext when valueText is omitted', () => {
        render(<ProgressBar value={50} label="x" />);
        expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuetext');
    });

    it.each(['primary', 'success', 'warning', 'danger'] as const)(
        'variant=%s renders without crashing and is reachable by accessible name',
        (variant) => {
            render(<ProgressBar value={50} label={`Upload ${variant}`} variant={variant} />);
            expect(
                screen.getByRole('progressbar', { name: new RegExp(`upload ${variant}`, 'i') }),
            ).toBeInTheDocument();
        },
    );

    it('axe-clean at 0%', async () => {
        const { container } = render(<ProgressBar value={0} label="Upload" />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean at 100% with valueText', async () => {
        const { container } = render(
            <ProgressBar value={4} max={4} label="Steps" valueText="Done" showValueLabel />,
        );
        await expectNoAxeViolations(container);
    });
});
