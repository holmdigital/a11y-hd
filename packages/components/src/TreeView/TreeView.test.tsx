// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — semantic role="tree" / role="treeitem" /
 *   role="group"; aria-level conveys hierarchy depth programmatically.
 * - 2.1.1 Keyboard — APG tree contract: ArrowDown/Up move focus to
 *   prev/next visible item; ArrowRight expands a collapsed parent then
 *   moves into it; ArrowLeft collapses an expanded parent then moves to
 *   the parent of a collapsed/leaf node; Home/End jump to first/last
 *   visible; Enter/Space select + toggle expand (paired keyboard per
 *   D-02a).
 * - 2.4.3 Focus Order — single tab stop via roving tabindex; exactly one
 *   treeitem has tabIndex=0 at any time, all others -1; arrow keys move
 *   focus within the tree, Tab moves out.
 * - 4.1.2 Name, Role, Value — role=tree on the container, role=treeitem
 *   per node, aria-expanded only on parent nodes (omitted on leaves),
 *   aria-selected reflects selection state, aria-level reflects depth.
 *
 * Implementation note:
 * - APG-OPTIONAL behaviors `typeahead` (character-key jumps to first
 *   matching item) and `asterisk-expand` (`*` expands all sibling nodes)
 *   are intentionally OMITTED from this test suite per D-07 (CONTEXT.md
 *   user decision). No no-throw stub assertions, no backlog item — these
 *   are out of scope for Phase 24.
 * - TreeView's useEffect focus shift competes with userEvent (Pitfall 6),
 *   so every post-keystroke focus assertion is wrapped in `waitFor` and
 *   re-queries via `screen.getByRole(...)` after the await rather than
 *   capturing a stale element reference up-front.
 * - The TreeView source has a duplicated inline render at the root
 *   (lines 238-281 mirror the recursive `renderTree` at lines 156-209).
 *   Tests pass transparently against both paths — assertions use
 *   `getAllByRole('treeitem')` and accessible-name lookups, not DOM
 *   structure.
 * - `expectUniqueIds` is asserted for documentation value only:
 *   TreeView does not auto-generate ids (it uses consumer-supplied
 *   `node.id` values stored in a Map ref, not DOM ids). The assertion
 *   passes trivially today but guards against a future regression where
 *   the component might start emitting DOM ids.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { TreeView, type TreeNode } from './TreeView';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

const DATA: TreeNode[] = [
    {
        id: 'fruits',
        label: 'Fruits',
        children: [
            { id: 'apple', label: 'Apple' },
            { id: 'banana', label: 'Banana' },
        ],
    },
    {
        id: 'veggies',
        label: 'Vegetables',
        children: [{ id: 'carrot', label: 'Carrot' }],
    },
    { id: 'grains', label: 'Grains' }, // leaf — for ArrowRight no-op test
];

const getTreeitem = (name: RegExp) => screen.getByRole('treeitem', { name });

describe('Tier 1: Table Stakes', () => {
    it('mounts with role="tree" and a default aria-label of "Tree View"', () => {
        render(<TreeView data={DATA} />);
        const tree = screen.getByRole('tree', { name: /tree view/i });
        expect(tree).toBeInTheDocument();
    });

    it('custom ariaLabel prop overrides the default', () => {
        render(<TreeView data={DATA} ariaLabel="Food categories" />);
        expect(screen.getByRole('tree', { name: /food categories/i })).toBeInTheDocument();
        expect(screen.queryByRole('tree', { name: /^tree view$/i })).toBeNull();
    });

    it('renders one role="treeitem" per visible (root) node initially; children are not visible until parent expands', () => {
        render(<TreeView data={DATA} />);
        const items = screen.getAllByRole('treeitem');
        expect(items).toHaveLength(3); // Fruits, Vegetables, Grains
        expect(screen.queryByRole('treeitem', { name: /apple/i })).toBeNull();
        expect(screen.queryByRole('treeitem', { name: /banana/i })).toBeNull();
        expect(screen.queryByRole('treeitem', { name: /carrot/i })).toBeNull();
    });

    it('passes className through additively on the wrapper', () => {
        const { container } = render(<TreeView data={DATA} className="consumer-class" />);
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('consumer-class');
    });

    it('clicking a leaf node selects it (aria-selected="true") and calls onSelect with that node', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<TreeView data={DATA} onSelect={onSelect} />);

        await user.click(getTreeitem(/grains/i));

        expect(getTreeitem(/grains/i)).toHaveAttribute('aria-selected', 'true');
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'grains', label: 'Grains' }),
        );
    });

    it('clicking a parent node toggles expand AND selects it AND calls onSelect', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<TreeView data={DATA} onSelect={onSelect} />);

        const fruits = getTreeitem(/fruits/i);
        expect(fruits).toHaveAttribute('aria-expanded', 'false');

        await user.click(fruits);

        const fruitsAfter = getTreeitem(/fruits/i);
        expect(fruitsAfter).toHaveAttribute('aria-expanded', 'true');
        expect(fruitsAfter).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('treeitem', { name: /apple/i })).toBeInTheDocument();
        expect(screen.getByRole('treeitem', { name: /banana/i })).toBeInTheDocument();
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'fruits' }),
        );
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('aria-expanded is OMITTED on leaf treeitems', () => {
        render(<TreeView data={DATA} />);
        const grains = getTreeitem(/grains/i);
        expect(grains).not.toHaveAttribute('aria-expanded');
    });

    it('aria-expanded reflects state on parent treeitems: "false" initially, "true" after click', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'false');
        await user.click(getTreeitem(/fruits/i));
        expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'true');
    });

    it('aria-level is 1 on root nodes; 2 on first-level children once expanded', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        for (const name of [/fruits/i, /vegetables/i, /grains/i] as const) {
            expect(getTreeitem(name)).toHaveAttribute('aria-level', '1');
        }

        await user.click(getTreeitem(/fruits/i));
        expect(getTreeitem(/apple/i)).toHaveAttribute('aria-level', '2');
        expect(getTreeitem(/banana/i)).toHaveAttribute('aria-level', '2');
    });

    it('roving tabindex: initially data[0] has tabIndex=0 and all other visible items have tabIndex=-1', () => {
        render(<TreeView data={DATA} />);
        const fruits = getTreeitem(/fruits/i) as HTMLElement;
        const veggies = getTreeitem(/vegetables/i) as HTMLElement;
        const grains = getTreeitem(/grains/i) as HTMLElement;
        expect(fruits.tabIndex).toBe(0);
        expect(veggies.tabIndex).toBe(-1);
        expect(grains.tabIndex).toBe(-1);
    });

    it('ArrowDown moves focus to the next visible treeitem; tabIndex shifts to it', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        const fruits = getTreeitem(/fruits/i);
        fruits.focus();
        expect(document.activeElement).toBe(fruits);

        await user.keyboard('{ArrowDown}');

        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/vegetables/i));
        });
        expect((getTreeitem(/vegetables/i) as HTMLElement).tabIndex).toBe(0);
        expect((getTreeitem(/fruits/i) as HTMLElement).tabIndex).toBe(-1);
    });

    it('ArrowUp moves focus to the previous visible treeitem', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        getTreeitem(/grains/i).focus();
        await user.keyboard('{ArrowDown}'); // no-op at end; safer: focus grains then ArrowUp from veggies
        // Re-position deterministically: focus veggies via Home/End logic.
        // Simplest: click veggies to make it the focused item, then ArrowUp.
        await user.click(getTreeitem(/vegetables/i));
        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/vegetables/i));
        });

        await user.keyboard('{ArrowUp}');

        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/fruits/i));
        });
    });

    it('ArrowRight on a collapsed parent EXPANDS it (children become rendered)', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        const fruits = getTreeitem(/fruits/i);
        fruits.focus();
        expect(fruits).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('treeitem', { name: /apple/i })).toBeNull();

        await user.keyboard('{ArrowRight}');

        await waitFor(() => {
            expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'true');
        });
        expect(screen.getByRole('treeitem', { name: /apple/i })).toBeInTheDocument();
        expect(screen.getByRole('treeitem', { name: /banana/i })).toBeInTheDocument();
    });

    it('ArrowRight on an expanded parent moves focus to its first child', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        // Expand Fruits via click so we land in the expanded-parent branch.
        await user.click(getTreeitem(/fruits/i));
        await waitFor(() => {
            expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'true');
        });
        // Click on Fruits also selects; re-focus to ensure Fruits has focus
        // before ArrowRight (click does set focusedId in the handler).
        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/fruits/i));
        });

        await user.keyboard('{ArrowRight}');

        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/apple/i));
        });
    });

    it('ArrowRight on a leaf is a no-op (does not throw; focus stays)', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        await user.click(getTreeitem(/grains/i));
        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/grains/i));
        });

        await user.keyboard('{ArrowRight}');

        // Focus must not have moved and no new items revealed.
        expect(document.activeElement).toBe(getTreeitem(/grains/i));
        expect(screen.getAllByRole('treeitem')).toHaveLength(3);
    });

    it('ArrowLeft on an expanded parent COLLAPSES it (children unmounted)', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        await user.click(getTreeitem(/fruits/i));
        await waitFor(() => {
            expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'true');
        });
        // Confirm children exist before collapse.
        expect(screen.getByRole('treeitem', { name: /apple/i })).toBeInTheDocument();

        await user.keyboard('{ArrowLeft}');

        await waitFor(() => {
            expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'false');
        });
        expect(screen.queryByRole('treeitem', { name: /apple/i })).toBeNull();
        expect(screen.queryByRole('treeitem', { name: /banana/i })).toBeNull();
    });

    it('ArrowLeft on a collapsed/leaf child moves focus to its parent', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        // Expand Fruits, then focus Apple (a leaf child).
        await user.click(getTreeitem(/fruits/i));
        await waitFor(() => {
            expect(screen.getByRole('treeitem', { name: /apple/i })).toBeInTheDocument();
        });
        await user.click(getTreeitem(/apple/i));
        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/apple/i));
        });

        await user.keyboard('{ArrowLeft}');

        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/fruits/i));
        });
    });

    it('Home focuses the first visible treeitem; End focuses the last visible treeitem', async () => {
        const user = userEvent.setup();
        render(<TreeView data={DATA} />);

        const fruits = getTreeitem(/fruits/i);
        fruits.focus();

        await user.keyboard('{End}');
        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/grains/i));
        });

        await user.keyboard('{Home}');
        await waitFor(() => {
            expect(document.activeElement).toBe(getTreeitem(/fruits/i));
        });
    });

    it('Enter on a focused leaf calls onSelect (paired with Space per D-02a)', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<TreeView data={DATA} onSelect={onSelect} />);

        const grains = getTreeitem(/grains/i);
        grains.focus();
        await user.keyboard('{Enter}');

        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'grains' }),
        );
        expect(getTreeitem(/grains/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('Space on a focused leaf calls onSelect (paired keyboard per D-02a)', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<TreeView data={DATA} onSelect={onSelect} />);

        const grains = getTreeitem(/grains/i);
        grains.focus();
        await user.keyboard(' ');

        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'grains' }),
        );
        expect(getTreeitem(/grains/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('Enter on a focused parent calls onSelect AND toggles expand', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<TreeView data={DATA} onSelect={onSelect} />);

        const fruits = getTreeitem(/fruits/i);
        fruits.focus();
        expect(fruits).toHaveAttribute('aria-expanded', 'false');

        await user.keyboard('{Enter}');

        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'fruits' }),
        );
        await waitFor(() => {
            expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'true');
        });
        expect(screen.getByRole('treeitem', { name: /apple/i })).toBeInTheDocument();
    });

    it('axe-clean for default render', async () => {
        const { container } = render(<TreeView data={DATA} ariaLabel="Foods" />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for expanded-state render', async () => {
        const user = userEvent.setup();
        const { container } = render(<TreeView data={DATA} ariaLabel="Foods" />);
        await user.click(getTreeitem(/fruits/i));
        await waitFor(() => {
            expect(getTreeitem(/fruits/i)).toHaveAttribute('aria-expanded', 'true');
        });
        await expectNoAxeViolations(container);
    });

    it('two TreeView instances render with no duplicate ids (documentation guard — TreeView uses consumer-supplied node.id, not DOM ids)', () => {
        const { container } = render(
            <>
                <TreeView data={DATA} ariaLabel="First" />
                <TreeView data={DATA} ariaLabel="Second" />
            </>,
        );
        // Today TreeView does not emit DOM ids, so this assertion is trivially
        // satisfied. Kept as a regression guard against a future change that
        // adds DOM ids without scoping them per-instance.
        expectUniqueIds(container);
    });
});
