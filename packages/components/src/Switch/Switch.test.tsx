// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 2.1.1 Keyboard — Space and Enter both toggle the switch via
 *   onCheckedChange; disabled blocks click + Space + Enter. This is the
 *   APG Switch Tier-2 contract (the whole point of role="switch" over a
 *   styled checkbox).
 * - 4.1.2 Name, Role, Value — role="switch", aria-checked reflects the
 *   `checked` prop, accessible name flows from the associated <label>.
 * - 3.3.2 Labels or Instructions — when `label` is provided, the label
 *   element's htmlFor wires to the switch button's id (custom or
 *   auto-generated).
 *
 * Template note: mirrors the Phase 22 Wave-2 template-setter shape
 * (header → two Tier describes → AAA → helper-driven axe). D-02a:
 * every click test has a paired keyboard test.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Switch } from './Switch';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders a switch button', () => {
        render(<Switch checked={false} onCheckedChange={() => {}} />);
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders the label and associates it with the switch via htmlFor', () => {
        render(
            <Switch
                checked={false}
                onCheckedChange={() => {}}
                label="Notifications"
                id="notif"
            />,
        );
        expect(
            screen.getByRole('switch', { name: /notifications/i }),
        ).toBeInTheDocument();
        expect(screen.getByText('Notifications').getAttribute('for')).toBe('notif');
    });

    it('generates a non-empty id when id is omitted', () => {
        render(<Switch checked={false} onCheckedChange={() => {}} />);
        const sw = screen.getByRole('switch');
        expect(sw.id.length).toBeGreaterThan(0);
    });

    it('applies the disabled DOM attribute when disabled={true}', () => {
        render(<Switch checked={false} onCheckedChange={() => {}} disabled />);
        expect(screen.getByRole('switch').hasAttribute('disabled')).toBe(true);
    });
});

describe('Tier 2: A11y Differentiators (APG Switch — Space/Enter toggle)', () => {
    it('aria-checked="true" when checked={true}', () => {
        render(<Switch checked={true} onCheckedChange={() => {}} />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('aria-checked="false" when checked={false}', () => {
        render(<Switch checked={false} onCheckedChange={() => {}} />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('click calls onCheckedChange with !checked', async () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onChange} />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('switch'));
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('Space toggles via onCheckedChange (no literal space inserted)', async () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onChange} />);
        const user = userEvent.setup();
        screen.getByRole('switch').focus();
        await user.keyboard('{ }');
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('Enter toggles via onCheckedChange', async () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onChange} />);
        const user = userEvent.setup();
        screen.getByRole('switch').focus();
        await user.keyboard('{Enter}');
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('disabled blocks click', async () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onChange} disabled />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('switch'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('disabled blocks Space', async () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onChange} disabled />);
        const user = userEvent.setup();
        screen.getByRole('switch').focus();
        await user.keyboard('{ }');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('disabled blocks Enter', async () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onChange} disabled />);
        const user = userEvent.setup();
        screen.getByRole('switch').focus();
        await user.keyboard('{Enter}');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('controlled flip: checked={true} → click → onCheckedChange(false)', async () => {
        const onChange = vi.fn();
        render(<Switch checked={true} onCheckedChange={onChange} />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('switch'));
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('axe-clean for unchecked switch with label', async () => {
        const { container } = render(
            <Switch checked={false} onCheckedChange={() => {}} label="Notify" />,
        );
        await expectNoAxeViolations(container);
    });

    it('axe-clean for checked switch with label', async () => {
        const { container } = render(
            <Switch checked={true} onCheckedChange={() => {}} label="Notify" />,
        );
        await expectNoAxeViolations(container);
    });
});
