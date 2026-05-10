// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — semantic role="tablist" / role="tab" /
 *   role="tabpanel"; aria-controls / aria-labelledby pair tabs to panels.
 * - 2.1.1 Keyboard — APG roving-tabindex contract: ArrowLeft/Right (and
 *   ArrowUp/Down for vertical) cycle through tabs, Home/End jump to
 *   first/last; in automatic mode focus = activate, in manual mode
 *   Enter/Space activates the focused tab.
 * - 2.4.3 Focus Order — only the active tab is in the page Tab order
 *   (tabIndex=0); inactive tabs are tabIndex=-1 (roving tabindex).
 * - 2.4.7 Focus Visible — Tabs.css declares :focus-visible outline rules
 *   on .hd-tabs__trigger and .hd-tabs__content (smoke test below).
 * - 4.1.2 Name, Role, Value — aria-selected reflects active state;
 *   aria-controls / aria-labelledby ids resolve to real elements.
 *
 * Template note: this is the canonical APG roving-tabindex test shape for
 * Phase 24 (TreeView, NavigationMenu, Combobox listbox). The Harness
 * pattern + automatic-vs-manual split + Home/End assertions are the
 * reusable bits.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Tabs, TabsList, TabTrigger, TabsContent } from './Tabs';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

interface HarnessProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (v: string) => void;
    orientation?: 'horizontal' | 'vertical';
    activationMode?: 'automatic' | 'manual';
    className?: string;
    ariaLabel?: string;
}

const Harness = ({
    defaultValue = 'a',
    value,
    onValueChange,
    orientation,
    activationMode,
    className,
    ariaLabel = 'Demo tabs',
}: HarnessProps) => (
    <Tabs
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        activationMode={activationMode}
        className={className}
    >
        <TabsList ariaLabel={ariaLabel}>
            <TabTrigger value="a">Alpha</TabTrigger>
            <TabTrigger value="b">Bravo</TabTrigger>
            <TabTrigger value="c">Charlie</TabTrigger>
        </TabsList>
        <TabsContent value="a">Panel A content</TabsContent>
        <TabsContent value="b">Panel B content</TabsContent>
        <TabsContent value="c">Panel C content</TabsContent>
    </Tabs>
);

describe('Tier 1: Table Stakes', () => {
    it('mounts; renders one role="tab" per trigger and a role="tabpanel" for the active panel', () => {
        render(<Harness />);
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(3);
        // Only the active panel is in the DOM (TabsContent returns null when inactive)
        expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
        expect(screen.getByRole('tabpanel')).toHaveTextContent(/panel a content/i);
    });

    it('renders role="tablist" with aria-orientation and aria-label', () => {
        render(<Harness orientation="horizontal" />);
        const list = screen.getByRole('tablist', { name: /demo tabs/i });
        expect(list).toBeInTheDocument();
        expect(list.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('passes className through additively on the Tabs wrapper', () => {
        const { container } = render(<Harness className="consumer-class" />);
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('consumer-class');
    });

    it('controlled: value="b" makes tab Bravo aria-selected="true" and renders Panel B', () => {
        render(<Harness value="b" onValueChange={() => {}} />);
        expect(screen.getByRole('tab', { name: /bravo/i })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        expect(screen.getByRole('tabpanel')).toHaveTextContent(/panel b content/i);
    });

    it('uncontrolled: defaultValue="a" initially selects Alpha; clicking Bravo updates aria-selected', async () => {
        const user = userEvent.setup();
        render(<Harness defaultValue="a" />);
        expect(screen.getByRole('tab', { name: /alpha/i })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        await user.click(screen.getByRole('tab', { name: /bravo/i }));
        expect(screen.getByRole('tab', { name: /bravo/i })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        expect(screen.getByRole('tab', { name: /alpha/i })).toHaveAttribute(
            'aria-selected',
            'false',
        );
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('roving tabindex: active tab tabIndex=0, inactive tabs tabIndex=-1 (APG)', () => {
        render(<Harness defaultValue="a" />);
        const alpha = screen.getByRole('tab', { name: /alpha/i }) as HTMLButtonElement;
        const bravo = screen.getByRole('tab', { name: /bravo/i }) as HTMLButtonElement;
        const charlie = screen.getByRole('tab', { name: /charlie/i }) as HTMLButtonElement;
        expect(alpha.tabIndex).toBe(0);
        expect(bravo.tabIndex).toBe(-1);
        expect(charlie.tabIndex).toBe(-1);
    });

    it('aria-controls on each tab resolves to a panel element with the matching id', () => {
        render(<Harness defaultValue="b" />);
        const bravo = screen.getByRole('tab', { name: /bravo/i });
        const controls = bravo.getAttribute('aria-controls');
        expect(controls).not.toBeNull();
        const panel = document.getElementById(controls!);
        expect(panel).not.toBeNull();
        expect(panel!.getAttribute('role')).toBe('tabpanel');
    });

    it('aria-labelledby on the active panel resolves to the active tab element', () => {
        render(<Harness defaultValue="c" />);
        const panel = screen.getByRole('tabpanel');
        const labelledby = panel.getAttribute('aria-labelledby');
        expect(labelledby).not.toBeNull();
        const labelEl = document.getElementById(labelledby!);
        expect(labelEl).not.toBeNull();
        expect(labelEl!.getAttribute('role')).toBe('tab');
        expect(labelEl!.textContent).toMatch(/charlie/i);
    });

    it('automatic activation (default): ArrowRight moves focus AND changes selection in one step', async () => {
        const user = userEvent.setup();
        render(<Harness defaultValue="a" activationMode="automatic" />);
        const alpha = screen.getByRole('tab', { name: /alpha/i });
        alpha.focus();
        expect(document.activeElement).toBe(alpha);

        await user.keyboard('{ArrowRight}');
        const bravo = screen.getByRole('tab', { name: /bravo/i });
        expect(document.activeElement).toBe(bravo);
        expect(bravo).toHaveAttribute('aria-selected', 'true');
        // Panel swapped too — proves activation happened, not just focus move
        expect(screen.getByRole('tabpanel')).toHaveTextContent(/panel b content/i);
    });

    it('manual activation: ArrowRight moves focus but does NOT change selection; Enter activates (paired with Space per D-02a)', async () => {
        const user = userEvent.setup();
        render(<Harness defaultValue="a" activationMode="manual" />);
        const alpha = screen.getByRole('tab', { name: /alpha/i });
        alpha.focus();

        await user.keyboard('{ArrowRight}');
        const bravo = screen.getByRole('tab', { name: /bravo/i });
        expect(document.activeElement).toBe(bravo);
        // Selection has NOT moved — alpha is still selected in manual mode
        expect(screen.getByRole('tab', { name: /alpha/i })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        expect(bravo).toHaveAttribute('aria-selected', 'false');

        // Enter activates the focused tab
        await user.keyboard('{Enter}');
        expect(screen.getByRole('tab', { name: /bravo/i })).toHaveAttribute(
            'aria-selected',
            'true',
        );

        // Paired keyboard activation: Space also activates (per D-02a) —
        // move focus to Charlie via ArrowRight (manual: focus only) then Space.
        await user.keyboard('{ArrowRight}');
        const charlie = screen.getByRole('tab', { name: /charlie/i });
        expect(document.activeElement).toBe(charlie);
        await user.keyboard(' ');
        expect(charlie).toHaveAttribute('aria-selected', 'true');
    });

    it('Home jumps focus (and activates in automatic mode) to the first tab; End to the last', async () => {
        const user = userEvent.setup();
        render(<Harness defaultValue="b" activationMode="automatic" />);
        const bravo = screen.getByRole('tab', { name: /bravo/i });
        bravo.focus();

        await user.keyboard('{End}');
        const charlie = screen.getByRole('tab', { name: /charlie/i });
        expect(document.activeElement).toBe(charlie);
        expect(charlie).toHaveAttribute('aria-selected', 'true');

        await user.keyboard('{Home}');
        const alpha = screen.getByRole('tab', { name: /alpha/i });
        expect(document.activeElement).toBe(alpha);
        expect(alpha).toHaveAttribute('aria-selected', 'true');
    });

    it('vertical orientation: ArrowDown cycles to next tab (replacing ArrowRight)', async () => {
        const user = userEvent.setup();
        render(<Harness defaultValue="a" orientation="vertical" activationMode="automatic" />);
        const alpha = screen.getByRole('tab', { name: /alpha/i });
        alpha.focus();

        await user.keyboard('{ArrowDown}');
        const bravo = screen.getByRole('tab', { name: /bravo/i });
        expect(document.activeElement).toBe(bravo);
        expect(bravo).toHaveAttribute('aria-selected', 'true');

        // tablist's aria-orientation reflects vertical
        expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
            'vertical',
        );
    });

    it('onValueChange fires with the new value when activation occurs', async () => {
        const onValueChange = vi.fn();
        const user = userEvent.setup();
        render(<Harness defaultValue="a" onValueChange={onValueChange} />);

        await user.click(screen.getByRole('tab', { name: /charlie/i }));
        expect(onValueChange).toHaveBeenCalledWith('c');
    });

    it('axe-clean for default horizontal render', async () => {
        const { container } = render(<Harness defaultValue="a" />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for vertical orientation', async () => {
        const { container } = render(<Harness defaultValue="a" orientation="vertical" />);
        await expectNoAxeViolations(container);
    });

    it('two Tabs components on the same page produce no duplicate ids (useId() SSR-safety regression guard)', () => {
        const { container } = render(
            <>
                <Harness defaultValue="a" ariaLabel="First tabs" />
                <Harness defaultValue="a" ariaLabel="Second tabs" />
            </>,
        );
        // CLAUDE.md context: Tabs.tsx uses React useId() for stable baseId.
        // This catches a regression to Math.random or a hard-coded id.
        expectUniqueIds(container);
    });
});

describe('Tabs.css style hooks (STY-03 + STY-04 smoke)', () => {
    // ESM-safe path resolution per Plan 23-02 directive (NOT __dirname).
    const here = dirname(fileURLToPath(import.meta.url));
    const cssPath = resolve(here, 'Tabs.css');
    const css = readFileSync(cssPath, 'utf8');

    it('declares a :focus-visible rule (STY-04 / WCAG 2.4.7)', () => {
        expect(css).toMatch(/:focus-visible\s*\{/);
    });

    it('exposes CSS custom-property theming surface via var() defaults (STY-03)', () => {
        expect(css).toMatch(/var\(--hd-tabs-/);
    });

    it('targets the active-tab via [aria-selected="true"] attribute selector (regression guard)', () => {
        expect(css).toMatch(/\[aria-selected=["']true["']\]/);
    });
});
