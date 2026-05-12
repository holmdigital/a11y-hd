// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.4.3 Contrast (Minimum) — variant render parametrization (jsdom cannot
 *   measure contrast; the assertion is "each variant mounts and is reachable
 *   by accessible name", real-browser axe-contrast deferred to v0.7+)
 * - 2.1.1 Keyboard — Space and Enter activation; disabled blocks both click
 *   and keyboard
 * - 2.4.7 Focus Visible — focused button becomes document.activeElement and
 *   the inline focus-style hook (outlineOffset) is present
 * - 4.1.2 Name, Role, Value — aria-busy when isLoading, aria-hidden on the
 *   spinner glyph, axe-clean across default / loading / disabled states
 *
 * Template note: this file is the canonical shape for Wave-2 component test
 * suites (Plans 22-06..09 mirror it). Keep the structure copyable: header
 * first, two top-level Tier describes, helper-driven assertions, AAA pattern.
 */
import { useRef, type MutableRefObject } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Button } from './Button';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders children', () => {
        render(<Button>Save</Button>);
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('forwards ref to the underlying button element', () => {
        let captured: HTMLButtonElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLButtonElement>(null);
            return (
                <Button
                    ref={(node) => {
                        (ref as MutableRefObject<HTMLButtonElement | null>).current = node;
                        captured = node;
                    }}
                >
                    Save
                </Button>
            );
        };
        render(<Probe />);
        const btn = screen.getByRole('button', { name: /save/i });
        expect(captured).toBe(btn);
        expect(captured).toBeInstanceOf(HTMLButtonElement);
    });

    it('passes className through additively (consumer class survives)', () => {
        render(<Button className="consumer-class">Save</Button>);
        const btn = screen.getByRole('button', { name: /save/i });
        expect(btn.className).toContain('consumer-class');
    });

    it('forwards arbitrary HTML attributes (data-*, aria-pressed, type)', () => {
        render(
            <Button type="submit" aria-pressed="true" data-analytics="cta-save">
                Save
            </Button>,
        );
        const btn = screen.getByRole('button', { name: /save/i });
        expect(btn).toHaveAttribute('type', 'submit');
        expect(btn).toHaveAttribute('aria-pressed', 'true');
        expect(btn).toHaveAttribute('data-analytics', 'cta-save');
    });

    it('disabled prop sets the DOM disabled attribute', () => {
        render(<Button disabled>Save</Button>);
        const btn = screen.getByRole('button', { name: /save/i });
        expect(btn).toBeDisabled();
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('isLoading sets aria-busy="true" AND disables the button', () => {
        render(<Button isLoading>Save</Button>);
        const btn = screen.getByRole('button', { name: /save/i });
        expect(btn).toHaveAttribute('aria-busy', 'true');
        expect(btn).toBeDisabled();
    });

    it('isLoading hides the spinner glyph from assistive tech (aria-hidden="true")', () => {
        render(<Button isLoading>Save</Button>);
        // Accessible name must remain the visible label, not include the glyph —
        // proving the glyph is hidden from AT (otherwise getByRole's name match
        // would include the spinner character).
        const btn = screen.getByRole('button', { name: /^save$/i });
        expect(btn).toBeInTheDocument();
        // The spinner glyph itself carries aria-hidden="true" — confirm a
        // hidden descendant exists by reading it via the role-scoped query.
        const hiddenGlyph = btn.firstElementChild;
        expect(hiddenGlyph).not.toBeNull();
        expect(hiddenGlyph).toHaveAttribute('aria-hidden', 'true');
    });

    it.each(['primary', 'secondary', 'danger', 'ghost'] as const)(
        'variant=%s renders without crashing and is reachable by accessible name',
        (variant) => {
            render(<Button variant={variant}>Save {variant}</Button>);
            expect(
                screen.getByRole('button', { name: new RegExp(`save ${variant}`, 'i') }),
            ).toBeInTheDocument();
        },
    );

    it('Space activates onClick after focus (WCAG 2.1.1)', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={onClick}>Save</Button>);
        const btn = screen.getByRole('button', { name: /save/i });

        btn.focus();
        expect(document.activeElement).toBe(btn);
        await user.keyboard(' ');

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('Enter activates onClick after focus (WCAG 2.1.1)', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={onClick}>Save</Button>);
        const btn = screen.getByRole('button', { name: /save/i });

        btn.focus();
        await user.keyboard('{Enter}');

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('disabled button does NOT fire onClick on click OR keyboard (D-02a paired)', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(
            <Button disabled onClick={onClick}>
                Save
            </Button>,
        );
        const btn = screen.getByRole('button', { name: /save/i });

        // Click path
        await user.click(btn);
        expect(onClick).not.toHaveBeenCalled();

        // Keyboard path (paired per D-02a) — disabled buttons cannot receive focus
        // in jsdom either, but we still attempt to activate to prove the no-op.
        btn.focus();
        await user.keyboard(' ');
        await user.keyboard('{Enter}');
        expect(onClick).not.toHaveBeenCalled();
    });

    it('axe-clean for default render', async () => {
        const { container } = render(<Button>Save</Button>);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for isLoading state', async () => {
        const { container } = render(<Button isLoading>Save</Button>);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for disabled state', async () => {
        const { container } = render(<Button disabled>Save</Button>);
        await expectNoAxeViolations(container);
    });

    it('two Buttons rendered together produce no duplicate ids', () => {
        const { container } = render(
            <>
                <Button>Save</Button>
                <Button>Cancel</Button>
            </>,
        );
        // Button itself does not auto-generate ids today; the assertion is the
        // template for components that do (FormField, RadioGroup, Tabs). It
        // documents intent and survives any future Button refactor that adds
        // an id-bearing affordance (e.g. tooltip wiring).
        expectUniqueIds(container);
    });

    it('focus-visible smoke: focused button is activeElement and outlineOffset hook is present', async () => {
        const user = userEvent.setup();
        render(<Button>Save</Button>);
        const btn = screen.getByRole('button', { name: /save/i });

        await user.tab();
        expect(document.activeElement).toBe(btn);
        // Inline style hook for the focus ring (WCAG 2.4.7) — Button sets
        // outlineOffset: '2px' in baseStyles. Assert the hook is present so a
        // future refactor that drops the focus-ring scaffolding fails loudly.
        expect((btn as HTMLButtonElement).style.outlineOffset).toBe('2px');
    });
});
