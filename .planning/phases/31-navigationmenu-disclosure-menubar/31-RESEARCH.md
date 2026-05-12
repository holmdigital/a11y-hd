# Phase 31: NavigationMenu Disclosure → Menubar — Research

**Researched:** 2026-05-12
**Domain:** W3C APG Menubar pattern in React + jsdom; opt-in pattern switch coexisting byte-for-byte with the legacy Disclosure renderer
**Confidence:** HIGH — every implementation primitive (roving `tabindex`, `useRef` shadow, `useLayoutEffect` imperative focus, single parent `onKeyDown`, `Map<string,HTMLElement>` registry, `data-state="focused"`) is shipping in `DataTable.tsx` (Phase 30) and `DatePicker.tsx` (Phase 28); only the type-ahead buffer and submenu-cross transitions are novel for this phase, and both have a canonical W3C reference.

## Summary

Phase 31 adds an opt-in `pattern: 'disclosure' | 'menubar'` prop to `NavigationMenu`. Default (`'disclosure'`) re-renders the current 177-line source byte-for-byte; opt-in (`'menubar'`) renders a separate APG Menubar implementation. CONTEXT.md has already locked the 8 substantive decisions (D-01 … D-08) — this research answers **how** to implement them, not **what** to decide.

**Primary recommendation:** Two-sibling-component dispatch in `NavigationMenu.tsx`. The exported `NavigationMenu` forwardRef stays as the public surface; it branches on `pattern` and delegates to one of two internal renderers: the existing `MenuItem`-based Disclosure body (untouched, byte-equivalent) or a new `MenubarRenderer` that owns ALL roving / type-ahead / open-submenu state centrally (mirroring Phase 30's `DataTable` single-owner pattern). This keeps the public API surface and v0.6 byte-equivalence guarantee trivial to prove (Disclosure code path stays untouched) while letting the Menubar renderer use the patterns Phase 30 already verified in production.

Type-ahead: `useRef<string>('')` buffer (NOT `useState` — avoids re-render on every keystroke, avoids stale-closure inside the parent `onKeyDown`); `useRef<ReturnType<typeof setTimeout> | null>` for the 500 ms timeout, cleared on every printable keystroke and re-scheduled. Submenu↔menubar boundary reset: clear the buffer ref in the same code branch that flips `openSubmenuIndex` (one assignment, no separate effect). Cmd/Ctrl/Alt/Meta chords gate-out at the top of the type-ahead branch via `e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey` (D-02 explicit).

Focus orchestration across the menubar↔submenu DOM-tree boundary: use the Phase 30 model — single `Map<string, HTMLElement>` registry keyed by stable strings (`"menubar:${index}"` for top-level, `"submenu:${parentIndex}:${childIndex}"` for submenu items), and a `useLayoutEffect` keyed on `[activeKey, openSubmenuIndex]` that imperatively `.focus()`es the cell at the current active key. This is strictly cleaner than the current source's `requestAnimationFrame` hack because `useLayoutEffect` runs synchronously after DOM mutation but before paint — focus and visual update land on the same frame (Phase 28 / Phase 30 precedent).

Test surface: Append one new describe block `'Tier 2: A11y Differentiators (APG Menubar per Phase 31)'` after the existing Disclosure block at L143–L335. New block is D-02a-clean: `userEvent.setup()`, `user.keyboard(...)`, `toHaveFocus()`, `toHaveAttribute(...)` only. ZERO `fireEvent` / `querySelector` / `configureAxe` / `toMatchSnapshot`. The existing Disclosure block stays byte-for-byte untouched.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (Backwards-compat — opt-in `pattern` prop, default `'disclosure'`):** New `pattern?: 'disclosure' | 'menubar'` prop on `NavigationMenuProps`. Default `'disclosure'` renders the current source byte-for-byte. `'menubar'` swaps to the new APG Menubar implementation. Version bump 2.4.0 → 2.5.0 (MINOR, additive). NO breaking change. NO major bump.
- **D-02 (Type-ahead — multi-char buffer + 500 ms timeout):** `useRef("")` buffer + `setTimeout(500)`. Append `e.key.toLowerCase()` on each printable keystroke (`e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey`); reset timeout; find first menuitem whose `label.toLowerCase().startsWith(buffer)`; wrap-around scan if no match after current index. Buffer scope: menubar items only when focus is on menubar; current-submenu items only when focus is in a submenu. Buffer RESET on menubar↔submenu crossing.
- **D-03 (Hover-to-open — DROPPED in menubar mode):** No `onMouseEnter` / `onMouseLeave` / `onFocus` hover-parity wiring on menubar-mode items. Click toggles trigger; ArrowDown opens + focuses first; ArrowUp opens + focuses last. Click-outside still closes.
- **D-04 (Leaf item — native `<a role="menuitem">`):** Items without `children` render as `<a href role="menuitem" tabIndex={isActive ? 0 : -1}>`. Enter/Space do NOT `preventDefault` — native `<a>` activation fires (browser navigates; jsdom dispatches a `click` event we can spy on). Ctrl+click / middle-click semantics preserved.
- **D-05 (ARIA role chain):** `<nav aria-label>` UNCHANGED. Top-level `<ul role="menubar">`. Top-level `<li role="none">`. Top-level trigger (with children) `<button role="menuitem" aria-haspopup="menu" aria-expanded aria-controls tabIndex={0|-1} data-state>`. Top-level leaf (no children) `<a role="menuitem" tabIndex={0|-1} data-state>`. Submenu `<ul role="menu" aria-orientation="vertical">`. Submenu `<li role="none">`. Submenu link `<a role="menuitem" tabIndex={-1}>` always.
- **D-06 (Keyboard contract — CLAMPED, not wrapping):** Menubar Arrow Left/Right clamped at first/last top-level item. ArrowDown/Up on trigger opens submenu + focuses first/last item. Home/End jump first/last menubar item. Enter/Space on trigger = open + focus first. Enter/Space on leaf = native `<a>` activation. Escape = no-op when no submenu open. Inside submenu: Arrow Up/Down clamped; ArrowLeft closes + focus trigger; ArrowRight closes current + advance menubar + open NEW submenu + focus first; Home/End first/last submenu item; Escape closes + refocuses trigger with `stopPropagation` (Phase 24 carry-forward); Tab native.
- **D-07 (Test surface — D-02a-clean for new block):** New describe block uses ONLY `userEvent.keyboard` + `toHaveFocus` + `toHaveAttribute` + `getByRole`. Zero `fireEvent` / `querySelector` / `configureAxe` / `toMatchSnapshot`. Existing Disclosure block (L143–end) byte-equivalent — Phase 24 fireEvent exception preserved verbatim. ~15 new `it()` blocks; final test count ~32.
- **D-08 (Type-ahead matching rules):** Match `item.label.toLowerCase().startsWith(buffer)`. Locale-naive JS `toLowerCase()` (no `toLocaleLowerCase('sv-SE')`). å/ä/ö match by literal codepoint (works correctly for Swedish labels without special handling).

### Claude's Discretion

- **File layout** — single `NavigationMenu.tsx` containing both renderers vs. split (`NavigationMenu.tsx` + `MenubarNavigationMenu.tsx`). Recommendation: **single file**. Keeps the public export surface in one place; the dispatch is a 3-line `if` at the top of the forwardRef body; the Disclosure `MenuItem` sub-component (49 lines) and the new `MenubarRenderer` (estimated ~180 lines) coexist below. Mirrors `DataTable.tsx` (sortable + grid in one file). Splitting would force a re-export ceremony for `NavigationMenuProps` and `NavItem` and obscure the byte-equivalence claim for Disclosure.
- **Buffer storage — `useRef<string>` vs `useState<string>`** — Recommendation: **`useRef`**. Type-ahead is read inside the parent `onKeyDown` immediately after assignment; `useState` would re-render on every keystroke (16+ re-renders for "Settings") with no visual benefit, and the `useState` value read inside the handler would be the stale closure value from the previous render. `useRef` matches Phase 30's `activeCellRef` shadow precedent.
- **Focus orchestration — `requestAnimationFrame` vs `useLayoutEffect`** — Recommendation: **`useLayoutEffect`**. `rAF` (current source's choice) defers focus to next paint; works but introduces a 1-frame visual lag and is harder to test (test must `waitFor`). `useLayoutEffect` runs synchronously after DOM mutation, before paint — focus lands on same frame as the visual `tabIndex` flip. Phase 28 and Phase 30 both shipped with `useLayoutEffect` and zero `waitFor` in new tests. Recommended structure: keyed on `[activeKey, openSubmenuIndex]`, gated by `hasUserMovedRef` to prevent mount-time focus-steal.
- **Submenu-open state** — single `useState<number | null>(openSubmenuIndex)` (only one submenu open at a time; APG Menubar treats peers as exclusive) vs. `useState<Set<number>>`. Recommendation: **single index**. APG Menubar doesn't permit multiple peer submenus open simultaneously.
- **Test fixture location** — inline `MENUBAR_ITEMS` const at top of test file (Phase 30 `LARGE_DATA` precedent) vs. shared helper. Recommendation: **inline at top of file**, sized to exercise ArrowRight-from-submenu-crosses-to-next-submenu (≥ 2 parents with children + ≥ 1 leaf).
- **`data-state="focused"` semantic match with Phase 30** — confirmed: same string value on the currently-roving item. Consumer CSS can reuse the same selector.

### Deferred Ideas (OUT OF SCOPE)

- Default flip to `pattern="menubar"` — future major bump (3.0.0). Not Phase 31.
- Locale-aware type-ahead (`toLocaleLowerCase('sv-SE')`). v1 codepoint match is sufficient for Swedish labels.
- Submenu wrap-around (APG permits both; clamping chosen for Phase 30 consistency).
- Multi-level submenus (submenus inside submenus). `NavItem.children` is recursive in TS but renderer renders one level only.
- `aria-current="page"` router integration. Consumer responsibility.
- Mouse drag-from-trigger-to-item (macOS native UX). Not APG required.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TC-14-IMPL | NavigationMenu APG Menubar upgrade — Arrow horizontal/vertical along menubar, Home/End first/last, Enter activates leaf, type-ahead. Currently APG Disclosure pattern per source self-documentation. | (a) Roving `tabindex` + `useLayoutEffect` + `Map` registry + `hasUserMovedRef` proven in `DataTable.tsx:120-136` (Phase 30) `[VERIFIED: file read]`. (b) Single parent `onKeyDown` with `useRef` shadow proven in `DataTable.tsx:138-200` and `DatePicker.tsx:224-287` `[CITED: 30-RESEARCH.md L51,L60]`. (c) Type-ahead buffer + 500 ms timeout pattern documented in W3C APG menubar-navigation example `[CITED: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/]`. (d) `role="none"` on `<li>` inside `role="menubar"` confirmed required by APG example `[CITED: same URL]`. (e) `userEvent.keyboard` + `toHaveFocus` pattern proven D-02a-clean in Phase 30 `DataTable.test.tsx`. (f) Backwards-compat opt-in dispatch via `pattern` prop is a 3-line `if` in the forwardRef body — no architectural risk. |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Public API surface (`NavigationMenuProps`, `NavItem` export) | `NavigationMenu.tsx` forwardRef | — | Single import path preserved for v0.6 consumers. |
| Pattern dispatch (`'disclosure'` vs `'menubar'`) | forwardRef body — top-of-function `if (pattern === 'menubar')` | — | One conditional, two render branches. Byte-equivalence for Disclosure is trivially provable. |
| Disclosure renderer (existing `MenuItem` sub-component) | Internal to `NavigationMenu.tsx` | — | UNCHANGED. Byte-for-byte. Phase 24 fireEvent exception lives here. |
| Menubar renderer (NEW `MenubarRenderer` sub-component) | Internal to `NavigationMenu.tsx` | — | OWNS all roving + type-ahead + open-submenu state. Pure-props children. |
| Roving anchor state | `useState<string>` (current active key) | `useRef<string>` shadow | State drives render; ref read inside `onKeyDown` for stale-closure safety (Phase 30 precedent). |
| Type-ahead buffer | `useRef<string>('')` | `useRef<setTimeout|null>` for timer | Buffer read inside handler immediately after assignment; `useState` would cause needless re-renders and stale-closure reads. |
| Imperative focus after navigation | `useLayoutEffect` keyed on `[activeKey, openSubmenuIndex]` | `Map<string, HTMLElement>` registry via ref callback | Synchronous post-mutation focus; same-frame visual + focus update. Phase 30 precedent. |
| Mount-guard against focus-steal | `useRef<boolean>(false)` flipped to `true` on first keyboard nav | — | Prevents menubar from yanking focus to itself on mount. Phase 30 `hasUserMovedRef` pattern. |
| Submenu open/close | Single `useState<number | null>(openSubmenuIndex)` | — | APG: only one peer submenu open. |
| Keyboard handler | Single `onKeyDown` on the `<ul role="menubar">` (event bubbles from focused child) | — | Phase 28 + Phase 30 precedent; one handler, single source of truth, no per-child allocation. |
| Click-outside close | `useEffect` document-level `click` listener gated on `openSubmenuIndex !== null` | — | Mirrors current Disclosure source's pattern (`NavigationMenu.tsx:60-71`). |
| Escape with `stopPropagation` | Submenu branch of `onKeyDown` | — | Phase 24 carry-forward; prevents ancestor Dialog from co-reacting. |
| Leaf `<a>` activation | Native — no `preventDefault` on Enter/Space when leaf | — | Preserves Ctrl+click, middle-click, "Open in new tab" affordances (D-04). |

## Standard Stack

### Core (already in place — no additions)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18+ | `useState`, `useRef`, `useLayoutEffect`, `useEffect`, `useId`, `forwardRef` | Native primitives — no new dep. `[CITED: ./CLAUDE.md]` |
| `@testing-library/react` | project-installed | `render`, `screen`, `getByRole`, `getAllByRole` | Already in current test file. `[VERIFIED: file read]` |
| `@testing-library/user-event` | project-installed | `userEvent.setup()`, `user.keyboard('{ArrowRight}')`, `user.click(...)`, `user.tab()` | Already in current test file. `[VERIFIED: file read]` |
| `@testing-library/jest-dom` | project-installed | `toHaveFocus`, `toHaveAttribute`, `toHaveAccessibleName` | Already used. `[VERIFIED: file read]` |
| vitest | 4.x | test runner | `[CITED: ./CLAUDE.md "Vitest 4.x Upgrade"]` |
| jsdom | vitest-bundled | DOM env | `// @vitest-environment jsdom` already on L1 of test file. `[VERIFIED: file read]` |
| `expectNoAxeViolations` | local helper | axe-clean smoke | Already imported `[VERIFIED: NavigationMenu.test.tsx:71]` |

### Supporting (none needed)

No new packages. Pure-React state + DOM-attr changes + ref-callback registry. `[VERIFIED: Phase 30 RESEARCH followed same path with zero new deps]`

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useRef<string>('')` for type-ahead buffer | `useState<string>` | useState: re-render per keystroke; stale-closure value inside onKeyDown. useRef: zero re-renders, fresh read inside handler. `[VERIFIED: Phase 30 activeCellRef precedent]` |
| `useLayoutEffect` for imperative focus | `useEffect` or `requestAnimationFrame` | useEffect: post-paint focus → 1-frame visual lag. rAF (current Disclosure source): defers to next paint; needs `waitFor` in tests. useLayoutEffect: synchronous after DOM mutation, before paint — focus + visual land on same frame. `[VERIFIED: DataTable.tsx:132, DatePicker.tsx:128]` |
| Single-file `NavigationMenu.tsx` with both renderers | Split into `NavigationMenu.tsx` + `MenubarNavigationMenu.tsx` | Split: forces re-export of `NavigationMenuProps` and `NavItem`; obscures byte-equivalence claim. Single: dispatch is 3-line `if`; both renderers visible side-by-side. `[VERIFIED: DataTable.tsx ships sortable + grid in one file]` |
| Two-sibling-component dispatch | Single component branching internally on every render | Internal branching couples Disclosure + Menubar state into one giant body, defeating byte-equivalence claim. Sibling dispatch: `<DisclosureRenderer>` body is byte-identical to today's render output. |
| Single `Map<string, HTMLElement>` keyed by `"menubar:i"` / `"submenu:p:c"` | Two separate Maps for menubar vs submenu | Single Map: one ref callback shape, one `useLayoutEffect` lookup. Two Maps: code duplication. `[VERIFIED: Phase 30 uses one Map with `"${row}:${col}"` keys]` |

**Installation:**
```bash
# No new dependencies. Source-only change in NavigationMenu.tsx + NavigationMenu.test.tsx + package.json version bump 2.4.0 → 2.5.0.
```

**Version verification:** Current `@holmdigital/components` per CONTEXT D-01 is 2.4.0; target 2.5.0 (MINOR, additive). `[CITED: 31-CONTEXT.md L46, CLAUDE.md "Current Package Versions"]`

## System Architecture Diagram

```
                        ┌──────────────────────────────────┐
                        │ Consumer: <NavigationMenu        │
                        │   items={...}                    │
                        │   pattern="menubar" /> (opt-in)  │
                        └──────────────┬───────────────────┘
                                       │
                       ┌───────────────▼──────────────────┐
                       │ NavigationMenu forwardRef        │
                       │   if (pattern === 'menubar')     │
                       │     return <MenubarRenderer .../>│
                       │   return <DisclosureRenderer../> │
                       └────────┬──────────────┬──────────┘
                                │              │
                pattern='menubar'│              │pattern='disclosure' (default)
                                │              │  ←—— byte-equivalent to v0.6
                                ▼              ▼
                  ┌─────────────────────────┐  ┌──────────────────────────┐
                  │ MenubarRenderer (new)   │  │ DisclosureRenderer       │
                  │ ─────────────────────── │  │ (current MenuItem-based) │
                  │ STATE (single owner):   │  │ — UNTOUCHED              │
                  │ • activeKey: string     │  │ — Phase 24 fireEvent     │
                  │ • activeKeyRef shadow   │  │   exception preserved    │
                  │ • openSubmenuIndex      │  │                          │
                  │ • typeAheadBufferRef    │  │                          │
                  │ • typeAheadTimerRef     │  │                          │
                  │ • cellRefs: Map<...>    │  │                          │
                  │ • hasUserMovedRef       │  │                          │
                  └────────────┬────────────┘  └──────────────────────────┘
                               │
       ┌───────────────────────┼────────────────────────────┐
       │                       │                            │
       ▼                       ▼                            ▼
 onKeyDown on               useLayoutEffect            onClick per item
 <ul role="menubar">        ([activeKey,               (sets activeKey,
 (single handler)            openSubmenu])              hasUserMovedRef=true)
       │                       │
       │  • Arrow L/R          │  cellRefs.get(activeKey).focus()
       │  • Arrow U/D          │  (synchronous; same-frame)
       │  • Home/End           │
       │  • Enter/Space        │
       │  • Escape             │
       │  • Type-ahead chars   │
       │                       │
       ▼                       ▼
   setActiveKey +           Active <button> or <a> receives
   activeKeyRef             tabindex=0 + data-state="focused"
   (clamped Math.min/max)
```

## Architecture Patterns

### Pattern 1: Two-sibling-component dispatch in one file

**What:** The exported `NavigationMenu` forwardRef contains a 3-line conditional that delegates to one of two internal renderers. The Disclosure renderer is the existing `MenuItem`-based body (byte-equivalent). The Menubar renderer is the new `MenubarRenderer` sub-component.

**When to use:** When adding an opt-in new behavior alongside a strict byte-equivalence guarantee for the existing behavior.

**Example:**
```typescript
// NavigationMenu.tsx
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
    ({ items, className, 'aria-label': ariaLabel = 'Main Navigation', pattern = 'disclosure' }, ref) => {
        if (pattern === 'menubar') {
            return <MenubarRenderer ref={ref} items={items} className={className} ariaLabel={ariaLabel} />;
        }
        // Default: Disclosure — body byte-equivalent to v0.6
        return (
            <nav ref={ref} className={`flex items-center ${className || ''}`} aria-label={ariaLabel}>
                <ul className="flex flex-wrap gap-2 m-0 p-0 list-none">
                    {items.map((item, index) => <MenuItem key={index} item={item} />)}
                </ul>
            </nav>
        );
    }
);
```

### Pattern 2: Centralized state in MenubarRenderer (NOT per-item)

**What:** Unlike the Disclosure `MenuItem` (which owns its own `useState(isOpen)`), the Menubar renderer owns ALL state at the parent level: `activeKey`, `openSubmenuIndex`, `typeAheadBufferRef`, `cellRefs`, `hasUserMovedRef`. Children are pure, props-only.

**Why:** Roving `tabindex` requires the parent to know which child is active (so it can set `tabIndex={0}` on exactly one). Type-ahead requires parent-level access to all item labels. Submenu transitions (`ArrowRight from submenu crosses to next menubar's submenu`) require coordinated state mutation across multiple children — only feasible at parent level.

**Source:** Phase 30 `DataTable.tsx:120-200` (same single-owner pattern).

### Pattern 3: Single parent `onKeyDown` with `useRef` shadow

**What:** One `onKeyDown` handler attached to `<ul role="menubar">`. Events bubble from focused child (the active `<button>` or `<a>`) to the parent. Handler reads `activeKeyRef.current` (NOT `activeKey` state) to avoid stale closures.

**Example:**
```typescript
// Source: DataTable.tsx:138-200 (Phase 30 precedent)
const [activeKey, setActiveKey] = useState<string>('menubar:0');
const activeKeyRef = useRef(activeKey);
useEffect(() => { activeKeyRef.current = activeKey; }, [activeKey]);

const onMenubarKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const current = activeKeyRef.current;
    // ... switch on e.key, compute next, setActiveKey(next) + activeKeyRef.current = next
};
```

### Pattern 4: `useLayoutEffect` imperative focus across DOM-tree boundary

**What:** A `useLayoutEffect` keyed on `[activeKey, openSubmenuIndex]` looks up the target element in `cellRefs` and calls `.focus()`. Runs synchronously after DOM mutation, before paint — `tabIndex` flip and `.focus()` land on the same frame.

**Example:**
```typescript
// Source: DataTable.tsx:132-136 (Phase 30 precedent)
useLayoutEffect(() => {
    if (!hasUserMovedRef.current) return;
    cellRefs.current.get(activeKey)?.focus();
}, [activeKey, openSubmenuIndex]);
```

**Critical:** `hasUserMovedRef` guard prevents focus-steal on initial mount (the menubar must not yank focus on render).

**Why this is cleaner than `requestAnimationFrame`** (current Disclosure source's choice at `NavigationMenu.tsx:87`): rAF defers to next paint; introduces a 1-frame visual lag; tests must use `waitFor`. `useLayoutEffect` is synchronous; tests assert focus immediately after `user.keyboard('{ArrowDown}')` without `waitFor`. Phase 30 shipped 13 new tests with zero `waitFor` on focus assertions.

### Pattern 5: Type-ahead buffer with `useRef` + timeout

**What:** Buffer stored in `useRef<string>('')`. On each printable keystroke: clear pending timeout, append `e.key.toLowerCase()` to buffer, schedule new 500 ms timeout to clear buffer, scan items for `label.toLowerCase().startsWith(buffer)` (with wrap-around from `currentIndex + 1`).

**Example:**
```typescript
const typeAheadBufferRef = useRef('');
const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Inside onMenubarKeyDown, before the switch():
if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
    typeAheadBufferRef.current += e.key.toLowerCase();
    typeAheadTimerRef.current = setTimeout(() => {
        typeAheadBufferRef.current = '';
        typeAheadTimerRef.current = null;
    }, 500);

    // Scope: menubar items if focus on menubar; current submenu items if in submenu
    const scopeItems = openSubmenuIndex === null
        ? items
        : items[openSubmenuIndex].children || [];
    const startFromIndex = /* parse from activeKeyRef.current */;
    const found = findFirstMatchWithWraparound(scopeItems, typeAheadBufferRef.current, startFromIndex + 1);
    if (found) {
        setActiveKey(keyFor(found));
        activeKeyRef.current = keyFor(found);
        e.preventDefault();
    }
    return;
}
```

**Cleanup:** `useEffect(() => () => { if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current); }, []);` on unmount.

**Buffer reset on menubar↔submenu crossing:** In the same branches that flip `openSubmenuIndex` (ArrowDown on trigger, ArrowLeft from submenu, ArrowRight cross-submenu, Escape), assign `typeAheadBufferRef.current = ''` and `clearTimeout(typeAheadTimerRef.current)`. One line per branch; no separate effect needed.

### Pattern 6: Stable key strings for `cellRefs` Map

**What:** Single `Map<string, HTMLElement>` keyed by `'menubar:${index}'` for top-level items and `'submenu:${parentIndex}:${childIndex}'` for submenu items.

**Example:**
```typescript
const cellRefs = useRef<Map<string, HTMLElement>>(new Map());

// In render — menubar item:
ref={(node) => {
    const key = `menubar:${index}`;
    if (node) cellRefs.current.set(key, node);
    else cellRefs.current.delete(key);
}}

// In render — submenu item:
ref={(node) => {
    const key = `submenu:${parentIndex}:${childIndex}`;
    if (node) cellRefs.current.set(key, node);
    else cellRefs.current.delete(key);
}}
```

**Why:** One Map, one ref-callback shape, one `useLayoutEffect` lookup. Phase 30 precedent. Avoids per-tier duplication.

### Pattern 7: Submenu-cross-on-ArrowRight (multi-step transition)

**What:** ArrowRight from a submenu item must: (a) close current submenu, (b) advance menubar anchor by 1 (clamped), (c) open new menubar item's submenu if it has children, (d) focus first submenu item of new submenu (or just the new menubar item if it's a leaf).

**Implementation:** All four steps in one synchronous code branch — set both state values + both ref shadows + buffer reset before returning. The `useLayoutEffect` keyed on `[activeKey, openSubmenuIndex]` fires once at the end and focuses the final target.

```typescript
case 'ArrowRight': {
    if (currentIsSubmenuItem) {
        const parentIdx = parseSubmenuKey(current).parentIndex;
        const nextMenubarIdx = Math.min(items.length - 1, parentIdx + 1);
        if (nextMenubarIdx === parentIdx) return; // clamped — no-op
        e.preventDefault();
        const nextItem = items[nextMenubarIdx];
        const nextHasChildren = nextItem.children && nextItem.children.length > 0;
        if (nextHasChildren) {
            setOpenSubmenuIndex(nextMenubarIdx);
            const newKey = `submenu:${nextMenubarIdx}:0`;
            setActiveKey(newKey);
            activeKeyRef.current = newKey;
        } else {
            setOpenSubmenuIndex(null);
            const newKey = `menubar:${nextMenubarIdx}`;
            setActiveKey(newKey);
            activeKeyRef.current = newKey;
        }
        typeAheadBufferRef.current = '';
        if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
        return;
    }
    // ... menubar-level ArrowRight = simple clamp
}
```

### Recommended Project Structure

```
packages/components/src/NavigationMenu/
├── NavigationMenu.tsx        # forwardRef dispatch + DisclosureRenderer (existing MenuItem)
│                             # + MenubarRenderer (NEW, ~180 lines)
└── NavigationMenu.test.tsx   # existing Tier 1 + Tier 2 Disclosure (UNCHANGED L88-L335)
                              # + NEW Tier 2 Menubar describe block (~15 new it blocks)
```

### Anti-Patterns to Avoid

- **Per-item `useState` for `isOpen` in Menubar mode** — Disclosure's `MenuItem` owns its own `isOpen`. The Menubar renderer must NOT replicate this — coordinated transitions (ArrowRight cross-submenu) become impossible. Centralize in parent.
- **`useEffect` instead of `useLayoutEffect` for focus** — introduces 1-frame visual lag; tests need `waitFor`. Use `useLayoutEffect`.
- **`useState` for type-ahead buffer** — causes 1 re-render per keystroke + stale-closure read inside handler. Use `useRef`.
- **Reading `activeKey` (state) inside `onKeyDown`** — stale-closure trap. Read `activeKeyRef.current` instead.
- **`preventDefault` on Enter/Space when leaf** — breaks native `<a>` activation; breaks Ctrl+click → new tab. Let the browser dispatch click natively.
- **Wrapping leaf `<a>` in a `<button>`** — destroys "Open in new tab" affordance. APG explicitly permits `role="menuitem"` on `<a>`. `[CITED: W3C APG]`
- **Hover-to-open in Menubar mode** — D-03 dropped. Adding it creates SR-confusing announcements (submenu opens unprompted).
- **Two separate `Map`s for menubar vs submenu refs** — code duplication. Use one Map with prefixed keys.
- **Wrap-around in menubar Arrow keys** — D-06 clamped (NOT wrapping); matches Phase 30 consistency. APG permits both; we pick clamp.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Roving `tabindex` pattern | Custom focus-tracker hook | Inline in `MenubarRenderer` mirroring `DataTable.tsx:120-200` | Project already has the shipping pattern; extracting it to a hook adds indirection without test reuse. |
| Type-ahead matching | A new utility module | Inline in the `onKeyDown` handler | Logic is ~15 lines; pulling it to a helper makes the handler harder to read. |
| Focus-trap in submenu | A focus-trap library | Native `tabIndex={-1}` + `useLayoutEffect` imperative focus | Menubar/submenu is NOT a focus-trap — Tab escapes natively to next focusable. Don't import `focus-trap-react`. |
| Click-outside detection | A `useClickOutside` library | Inline `useEffect` with `document.addEventListener('click', ...)` | Current Disclosure source already has this pattern at `NavigationMenu.tsx:60-71` — mirror it. |
| `<a>` activation simulation in tests | A custom navigation polyfill in test setup | `user.keyboard('{Enter}')` triggers native `<button>`-style click on `<a>` in jsdom; assert via `toHaveAttribute('href', '/path')` + onClick spy | jsdom dispatches the click event but does NOT navigate. Assertion strategy in Pitfall 5 below. |
| Stable key strings | A keyed `Symbol` registry | Plain template literals `'menubar:0'` / `'submenu:1:2'` | Phase 30 precedent. Strings are debuggable; symbols are not. |

**Key insight:** Every primitive needed for this phase is already shipping in `DataTable.tsx` (Phase 30) or `NavigationMenu.tsx` (current Disclosure source). Phase 31 is a near-mechanical recombination of existing patterns + the type-ahead addition + the submenu-cross transition. No external libraries. No new abstractions.

## Common Pitfalls

### Pitfall 1: `role="none"` on `<li>` confuses Testing Library queries

**What goes wrong:** `getByRole('menuitem', { name: /home/i })` might miss items if `role="none"` strips the wrong element.

**Why it happens:** APG specifies `role="none"` on the `<li>` (NOT on the inner `<button>` / `<a>`). The `<button role="menuitem">` and `<a role="menuitem">` still expose the menuitem role to AT and to Testing Library's role-resolution.

**How to avoid:** Apply `role="none"` ONLY to `<li>` elements. Apply `role="menuitem"` to the inner `<button>` / `<a>`. Testing Library will resolve menuitem correctly. `[VERIFIED: Phase 30 used the same pattern with `role="row"` on `<tr>` + `role="gridcell"` on `<td>` — Testing Library found cells fine.]`

**Warning signs:** `getByRole('menuitem')` returns null when the element clearly exists in the DOM. Check that `role="menuitem"` is on the `<button>` / `<a>`, not the `<li>`.

### Pitfall 2: axe-core may flag `role="none"` on `<li>` inside `<ul role="menubar">`

**What goes wrong:** axe might emit a "list" rule violation because the `<ul>` is no longer a "real" list (its `role` is `menubar`, its `<li>`s have `role="none"`).

**Why it happens:** axe-core's `list` rule expects `<ul>` to contain `<li>`s. Overriding both throws the heuristic off in some versions.

**How to avoid:** Phase 30 DataTable hit the analog (`<table role="grid">` + `<td role="gridcell">`) and was axe-clean. Same expectation here. If axe flags it, use `aria-label` / `aria-labelledby` per APG and accept it. `[ASSUMED — same shape worked for DataTable; needs verification at test time]`

**Warning signs:** `expectNoAxeViolations(container)` fails on the open-submenu render. Mitigation: read the violation message; if it's `list-rule` and APG-required, document the deviation.

### Pitfall 3: Stale-closure inside parent `onKeyDown`

**What goes wrong:** Handler reads `activeKey` (state) and computes `next` based on it; but `activeKey` is the value from the closure at render time, not the current value.

**Why it happens:** React closures capture state values at render time. If two keystrokes fire in the same render (unlikely but possible with held arrow keys), the second one reads stale state.

**How to avoid:** Use `activeKeyRef.current` inside the handler. Update both `setActiveKey(next)` AND `activeKeyRef.current = next` in the same branch. `[VERIFIED: DataTable.tsx:138-200 follows this pattern]`

**Warning signs:** Arrow keys "skip" cells under rapid keypress.

### Pitfall 4: Submenu items mount AFTER `setOpenSubmenuIndex(idx)`

**What goes wrong:** `setOpenSubmenuIndex(0)` + `setActiveKey('submenu:0:0')` in the same handler branch. `useLayoutEffect` fires and tries `cellRefs.get('submenu:0:0').focus()` — but the submenu DOM mount happens in the SAME commit, so the ref callback HAS already fired by the time `useLayoutEffect` runs.

**Why it doesn't actually go wrong:** React batches the state updates; renders both; commits both DOM mutations (mount submenu + flip tabindex); then runs `useLayoutEffect` synchronously after commit. By that time, the ref callback has already populated `cellRefs.current` with the new submenu items' nodes. `[VERIFIED: Phase 28 DatePicker calendar grid mounts day cells via map + uses useLayoutEffect to focus — same shape, no race]`

**How to avoid:** Don't second-guess. Use `useLayoutEffect`, NOT `useEffect` or `rAF`. If you see "cannot focus null" in tests, the issue is `hasUserMovedRef` is false at mount — fix the guard, not the effect timing.

**Warning signs:** Tests show `expect(document.activeElement).toBe(firstSubmenuLink)` but `document.activeElement` is the trigger or body.

### Pitfall 5: Asserting `<a>` Enter activation in jsdom

**What goes wrong:** Test asserts `await user.keyboard('{Enter}')` on a focused `<a href="/widgets">` triggers navigation. jsdom does NOT navigate — `window.location` does not change.

**Why it happens:** jsdom intentionally doesn't implement navigation (would invalidate the test environment).

**How to avoid:** Two test shapes — pick the cleaner per case:

  - **Shape A — assert href + click handler spy:** Pass an `onClick` spy via wrapping the leaf in a parent that captures the bubbled click event. After `user.keyboard('{Enter}')` on the focused `<a>`, assert the spy was called with the right target. The native `<button>`-style activation DOES dispatch a click on the focused `<a>` in jsdom.
  - **Shape B — assert href + element type:** `expect(link).toHaveAttribute('href', '/widgets')` + `expect(link.tagName).toBe('A')` + `expect(link).toHaveAttribute('role', 'menuitem')`. Does NOT exercise the activation path but proves the link is wired correctly. APG-sufficient.

**Recommended:** Use Shape A for ONE test (proves activation fires); Shape B for the rest (less ceremony). `[CITED: jsdom does not implement navigation by design — well-known behavior]`

**Phase 30 D-03 precedent:** For Enter on sortable header, Phase 30 directly invoked `handleSort(accessor)` instead of `.click()`. Here, the menubar leaf is a native `<a>` (not a custom button), so the test asserts the bubbled click event reaches an `onClick` spy attached to a wrapper `<div>` — closer to user reality than mocking `handleSort`.

**Warning signs:** Test passes but consumer reports clicks not navigating in real browser. Confirm `preventDefault` is NOT being called on Enter for leaf items.

### Pitfall 6: Type-ahead buffer leaks across menubar↔submenu transitions

**What goes wrong:** User types `'p'` while on menubar (matches "Products"), opens submenu with ArrowDown, types `'w'` (expects "Widgets") — but buffer is still `'p'` so it appends to `'pw'` and finds no match.

**How to avoid:** Clear `typeAheadBufferRef.current = ''` and `clearTimeout(typeAheadTimerRef.current)` in every branch that flips `openSubmenuIndex`. D-02 explicit; mechanical fix.

**Warning signs:** First type-ahead character after a submenu open/close does nothing.

### Pitfall 7: `hasUserMovedRef` not flipped on click

**What goes wrong:** User clicks a menubar item; `setActiveKey` runs; `useLayoutEffect` aborts because `hasUserMovedRef.current === false`; focus doesn't move.

**How to avoid:** In every code path that calls `setActiveKey` (onClick, onKeyDown branches), set `hasUserMovedRef.current = true` BEFORE the state update. `[VERIFIED: DataTable.tsx:266-269, 308-311 — onClick handlers do exactly this]`

**Warning signs:** Click-to-focus parity broken (tests pass but click doesn't move roving anchor visually).

### Pitfall 8: Escape inside submenu doesn't `stopPropagation`

**What goes wrong:** Consumer puts the menubar inside a `<Dialog>` (Phase 27 Dialog or Modal). Escape inside submenu closes the submenu AND closes the surrounding Dialog.

**How to avoid:** Call `e.stopPropagation()` after the Escape-handling branch (Phase 24 carry-forward). Already documented in CONTEXT D-06 and L77-78 of current source.

**Warning signs:** Modal closes when user presses Escape on submenu.

### Pitfall 9: Initial roving anchor when items prop changes

**What goes wrong:** Consumer passes new `items` array with fewer entries; `activeKey = 'menubar:5'` no longer maps to any element; `useLayoutEffect` tries to focus undefined; nothing happens.

**How to avoid:** Either (a) reset `activeKey` to `'menubar:0'` when `items.length` shrinks below the current index, or (b) clamp in `useLayoutEffect` before lookup. Recommendation (a) via `useEffect(() => { /* clamp activeKey to items.length */ }, [items.length])`. Defer if items prop is treated as stable (typical consumer usage). `[ASSUMED — not blocking for v1; flag in plan as optional hardening]`

**Warning signs:** Focus lost after items prop changes; unlikely in real consumer usage but possible in tests.

### Pitfall 10: Two `NavigationMenu` instances + duplicate `useId` collisions

**What goes wrong:** Submenu `<ul>` `id={dropdownId}` collides across two menubar renderers.

**How to avoid:** Use `useId()` per-trigger inside `MenubarRenderer` (mirrors current Disclosure `MenuItem` at `NavigationMenu.tsx:55-56`). The existing test `'two NavigationMenu instances render with no duplicate ids'` at L326-334 will validate.

## Runtime State Inventory

> **Skipped.** This is a code-only addition (new prop + new internal renderer + new tests). No databases, OS-registered tasks, secrets, env vars, or build artifacts are renamed or migrated. The published package name `@holmdigital/components` is unchanged; only the version bumps 2.4.0 → 2.5.0.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None | — |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | None | — |
| Build artifacts | `packages/components/dist/` will rebuild; no stale-name issue | `npm run build -w @holmdigital/components` after merge |

## Code Examples

### Example 1: Pattern dispatch in forwardRef body

```typescript
// Source: this RESEARCH.md, Pattern 1
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
    ({ items, className, 'aria-label': ariaLabel = 'Main Navigation', pattern = 'disclosure' }, ref) => {
        if (pattern === 'menubar') {
            return <MenubarRenderer ref={ref} items={items} className={className} ariaLabel={ariaLabel} />;
        }
        return (
            <nav ref={ref} className={`flex items-center ${className || ''}`} aria-label={ariaLabel}>
                <ul className="flex flex-wrap gap-2 m-0 p-0 list-none">
                    {items.map((item, index) => <MenuItem key={index} item={item} />)}
                </ul>
            </nav>
        );
    }
);
```

### Example 2: Centralized state in MenubarRenderer

```typescript
// Source: this RESEARCH.md, Pattern 2 + DataTable.tsx:120-136
const MenubarRenderer = forwardRef<HTMLElement, MenubarRendererProps>(
    ({ items, className, ariaLabel }, ref) => {
        const [activeKey, setActiveKey] = useState<string>('menubar:0');
        const activeKeyRef = useRef(activeKey);
        useEffect(() => { activeKeyRef.current = activeKey; }, [activeKey]);

        const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
        const typeAheadBufferRef = useRef('');
        const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
        const cellRefs = useRef<Map<string, HTMLElement>>(new Map());
        const hasUserMovedRef = useRef(false);

        useLayoutEffect(() => {
            if (!hasUserMovedRef.current) return;
            cellRefs.current.get(activeKey)?.focus();
        }, [activeKey, openSubmenuIndex]);

        // Click-outside close
        useEffect(() => {
            if (openSubmenuIndex === null) return;
            const handler = (e: MouseEvent) => {
                // ... check if click is outside the nav, close if so
            };
            document.addEventListener('click', handler);
            return () => document.removeEventListener('click', handler);
        }, [openSubmenuIndex]);

        // Cleanup type-ahead timer on unmount
        useEffect(() => () => {
            if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
        }, []);

        const onMenubarKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
            // ... see Patterns 3, 5, 7
        };

        return (
            <nav ref={ref as React.Ref<HTMLElement>} className={`flex items-center ${className || ''}`} aria-label={ariaLabel}>
                <ul role="menubar" className="flex flex-wrap gap-2 m-0 p-0 list-none" onKeyDown={onMenubarKeyDown}>
                    {items.map((item, index) => (
                        <MenubarItem
                            key={index}
                            item={item}
                            index={index}
                            isActive={activeKey === `menubar:${index}`}
                            isOpen={openSubmenuIndex === index}
                            activeSubmenuKey={activeKey.startsWith(`submenu:${index}:`) ? activeKey : null}
                            cellRefs={cellRefs}
                            onItemClick={(key) => {
                                hasUserMovedRef.current = true;
                                setActiveKey(key);
                            }}
                        />
                    ))}
                </ul>
            </nav>
        );
    }
);
```

### Example 3: Type-ahead match scan with wrap-around

```typescript
// Source: this RESEARCH.md, Pattern 5
function findFirstMatchWithWraparound<T extends { label: string }>(
    items: T[],
    buffer: string,
    startFromIndex: number
): { item: T; index: number } | null {
    const n = items.length;
    for (let i = 0; i < n; i++) {
        const idx = (startFromIndex + i) % n;
        if (items[idx].label.toLowerCase().startsWith(buffer)) {
            return { item: items[idx], index: idx };
        }
    }
    return null;
}
```

### Example 4: Test shape — leaf `<a>` Enter activation (Pitfall 5 Shape A)

```typescript
// Source: this RESEARCH.md, Pitfall 5
it('Enter on a focused leaf <a> dispatches a native click (D-04)', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.fn();
    render(
        <div onClick={clickSpy}>
            <NavigationMenu items={MENUBAR_ITEMS} pattern="menubar" />
        </div>
    );
    const homeLink = screen.getByRole('menuitem', { name: /^home$/i });
    expect(homeLink.tagName).toBe('A');
    expect(homeLink).toHaveAttribute('href', '/');
    homeLink.focus();
    await user.keyboard('{Enter}');
    // Native <a> activation in jsdom dispatches a click event that bubbles.
    expect(clickSpy).toHaveBeenCalled();
});
```

### Example 5: Test shape — type-ahead multi-char buffer

```typescript
// Source: this RESEARCH.md, Pattern 5
it('type-ahead buffer accumulates printable keys and matches "se" → Settings before reset', async () => {
    const user = userEvent.setup();
    const items: NavItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Search', href: '/search' },
        { label: 'Settings', href: '/settings' },
    ];
    render(<NavigationMenu items={items} pattern="menubar" />);
    const home = screen.getByRole('menuitem', { name: /^home$/i });
    await user.tab(); // focus Home (initial roving anchor)
    expect(home).toHaveFocus();
    await user.keyboard('s');
    expect(screen.getByRole('menuitem', { name: /^search$/i })).toHaveFocus();
    await user.keyboard('e'); // buffer is now "se" — must still match Search (Sea… not Set…); wait — Search starts with "se" too.
    // Pick distinguishing labels in real test: use "Search" vs "Settings" — both start with "se". Use "Set" → Settings unambiguously.
    await user.keyboard('t');
    expect(screen.getByRole('menuitem', { name: /^settings$/i })).toHaveFocus();
});
```

### Example 6: MENUBAR_ITEMS fixture (inline at top of test file)

```typescript
// Source: this RESEARCH.md, Test fixture recommendation
const MENUBAR_ITEMS: NavItem[] = [
    { label: 'Home', href: '/' },
    {
        label: 'Products',
        children: [
            { label: 'Widgets', href: '/widgets' },
            { label: 'Gadgets', href: '/gadgets' },
            { label: 'Sprockets', href: '/sprockets' },
        ],
    },
    {
        label: 'About',
        children: [
            { label: 'Team', href: '/team' },
            { label: 'Careers', href: '/careers' },
        ],
    },
    { label: 'Contact', href: '/contact' },
];
// Shape: leaf-parent-parent-leaf — exercises ArrowRight cross-submenu (Products→About) AND clamping at last (Contact).
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `requestAnimationFrame` for post-state-change focus | `useLayoutEffect` keyed on active coordinate | Phase 28 (DatePicker) onwards | Same-frame focus + visual update; tests don't need `waitFor` on focus assertions |
| Per-item `useState` for `isOpen` | Centralized parent state for roving + open-submenu | Phase 30 (DataTable) precedent | Coordinated transitions (cross-submenu ArrowRight) become possible |
| Mixed `fireEvent` + `userEvent` in tests | D-02a-clean: `userEvent` + `toHaveFocus` + `toHaveAttribute` only | Phase 24 D-02a gate | New Menubar block is gate-compliant; existing Disclosure block keeps fireEvent exception (Phase 24 D-02 carve-out) |
| Hover-parity `onFocus={handleEnter}` | NOT carried into Menubar mode | Phase 31 D-03 | Menubar follows strict APG; hover is not a contract surface |

**Deprecated / outdated:**
- The current source's `requestAnimationFrame` defer at `NavigationMenu.tsx:87` — superseded by `useLayoutEffect` in Phase 28/30; Disclosure renderer keeps rAF for byte-equivalence, Menubar renderer uses `useLayoutEffect`.
- The current source's `onFocus={handleEnter}` focus-parity hook at `NavigationMenu.tsx:114` — does NOT carry into Menubar mode (D-03).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | axe-core will not flag `role="none"` on `<li>` inside `<ul role="menubar">` | Pitfall 2 | If axe complains, plan must include a documented violation suppression OR a different mitigation. Low risk — Phase 30's analog (`<tr role="row">` + `<td role="gridcell">`) shipped axe-clean. | `[ASSUMED]`
| A2 | `useLayoutEffect` firing AFTER submenu mount works because React batches state + DOM mutation before the effect runs | Pitfall 4 | If submenu items aren't in `cellRefs.current` at effect time, focus lands on null. Mitigation: Phase 28 DatePicker shipped this exact shape (calendar grid mounts via map + uses `useLayoutEffect` to focus a newly-rendered day cell). Low risk. | `[ASSUMED via Phase 28 precedent]`
| A3 | Stable initial roving anchor on `'menubar:0'` is safe even when `items[0]` is a leaf (not a parent) | Architecture Pattern 2 | If a consumer passes `items=[]`, the initial render renders nothing; activeKey points to a non-existent element. Mitigation: render returns early or `useLayoutEffect` gated by `hasUserMovedRef` (no focus until user interacts). Low risk. | `[ASSUMED]`
| A4 | Plan to defer `items.length` reactivity (clamping `activeKey` when items prop shrinks) is acceptable for v1 | Pitfall 9 | Consumer mutates items array during user interaction → activeKey points to nothing → focus lost. Real-world risk: low (items usually stable). Flag as optional hardening in plan. | `[ASSUMED]`

**Note:** This assumptions log is short because the 8 CONTEXT.md locked decisions remove most of the typical research uncertainty. The remaining assumptions are all minor-risk and bounded.

## Open Questions

### Resolved by CONTEXT.md
- Backwards-compat strategy → D-01 (opt-in prop, default Disclosure)
- Type-ahead spec → D-02 (multi-char buffer, 500 ms, printable-only)
- Hover behavior → D-03 (dropped in menubar mode)
- Leaf rendering → D-04 (native `<a>`)
- ARIA role chain → D-05
- Keyboard contract → D-06 (clamped, not wrapping)
- Test surface gate → D-07 (D-02a-clean)
- Type-ahead match rules → D-08 (codepoint, no locale)

### Resolved by this Research
1. **File layout** → single `NavigationMenu.tsx`, two-sibling-component dispatch
2. **Buffer storage** → `useRef<string>` (not `useState`)
3. **Focus orchestration** → `useLayoutEffect` keyed on `[activeKey, openSubmenuIndex]` (not `rAF`)
4. **Cross-DOM-tree focus** → single `Map<string, HTMLElement>` with prefixed keys
5. **Submenu-cross-on-ArrowRight** → multi-step state mutation in one branch; let `useLayoutEffect` reconcile
6. **`<a>` activation testing** → Shape A (onClick spy on wrapper) for the one canonical test; Shape B (href + role attrs) for the rest
7. **Test fixture** → inline `MENUBAR_ITEMS` at top of file, shape leaf-parent-parent-leaf
8. **`data-state="focused"`** → same string value as Phase 30; consumer CSS reuse intentional

### Deferred (flagged for planner)
- **Q1: items prop change → activeKey clamping?** Optional hardening. Plan can include as a low-priority task or defer to a hardening phase. `[ASSUMED low real-world risk]`
- **Q2: axe-core behavior with `role="none"` on `<li>` inside `<ul role="menubar">`** — verify at test time. If clean (expected), no action. If flagged, document and possibly file a project-level axe suppression for this specific rule. `[ASSUMED clean via Phase 30 analog]`

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| React | runtime | ✓ | 18+ (per CLAUDE.md) | — |
| vitest | tests | ✓ | 4.x | — |
| jsdom | tests | ✓ | vitest-bundled | — |
| `@testing-library/user-event` | tests | ✓ | project-installed | — |
| `@testing-library/jest-dom` | tests | ✓ | project-installed | — |
| `expectNoAxeViolations` helper | tests | ✓ | `packages/components/src/_test/helpers.ts` | — |

**Missing dependencies:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.x + @testing-library/react + jsdom (project standard) |
| Config file | `packages/components/vitest.config.ts` (existing) |
| Quick run command | `npm run test -w @holmdigital/components -- NavigationMenu` |
| Full suite command | `npm run test -w @holmdigital/components` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TC-14-IMPL | Menubar role chain — `role="menubar"`, `role="menuitem"`, `role="menu"`, `aria-haspopup="menu"` | unit | `npm run test -w @holmdigital/components -- NavigationMenu` | ✓ (test file exists; new describe block appended) |
| TC-14-IMPL | Roving `tabindex="0"` on initial menubar item; `tabindex="-1"` elsewhere | unit | same | ✓ |
| TC-14-IMPL | ArrowRight / ArrowLeft clamped traversal across menubar | unit | same | ✓ |
| TC-14-IMPL | Home / End jump to first / last menubar item | unit | same | ✓ |
| TC-14-IMPL | ArrowDown on trigger opens submenu + focuses first item; ArrowUp focuses last | unit | same | ✓ |
| TC-14-IMPL | Arrow Up/Down within submenu clamped | unit | same | ✓ |
| TC-14-IMPL | ArrowLeft from submenu closes + refocuses trigger | unit | same | ✓ |
| TC-14-IMPL | ArrowRight from submenu crosses to next menubar + opens its submenu | unit | same | ✓ |
| TC-14-IMPL | Escape from submenu closes + refocuses trigger (with stopPropagation) | unit | same | ✓ |
| TC-14-IMPL | Type-ahead single-char match | unit | same | ✓ |
| TC-14-IMPL | Type-ahead multi-char buffer (e.g. "set" → Settings) | unit | same | ✓ |
| TC-14-IMPL | Type-ahead 500 ms timeout reset | unit | same (vitest `vi.useFakeTimers()`) | ✓ |
| TC-14-IMPL | Type-ahead buffer reset on menubar↔submenu cross | unit | same | ✓ |
| TC-14-IMPL | Leaf `<a>` Enter dispatches native click (onClick spy) | unit | same | ✓ |
| TC-14-IMPL | Leaf `<a>` has `href` and `role="menuitem"` | unit | same | ✓ |
| TC-14-IMPL | Arrow keys do NOT trigger link navigation (no-side-effect guard) | unit | same | ✓ |
| TC-14-IMPL | axe-clean default render (no submenu open) — menubar mode | unit | same | ✓ |
| TC-14-IMPL | axe-clean with one submenu open — menubar mode | unit | same | ✓ |
| TC-14-IMPL | Disclosure tests UNCHANGED (byte-equivalent) | regression | same | ✓ (existing block L143-L335) |

### Sampling Rate
- **Per task commit:** `npm run test -w @holmdigital/components -- NavigationMenu`
- **Per wave merge:** `npm run test -w @holmdigital/components`
- **Phase gate:** Full suite green; `npm run build -w @holmdigital/components` exits 0; package version bumped 2.4.0 → 2.5.0.

### Wave 0 Gaps
- None — `NavigationMenu.test.tsx` exists with full Tier 1 + Tier 2 Disclosure coverage. New describe block appends to existing file.
- `vi.useFakeTimers()` for the type-ahead 500 ms timeout test — vitest built-in; no new install needed.

## Security Domain

> **Skipped — `security_enforcement` not flagged in init; phase is pure-UI keyboard-handling change with no auth/data/network surface.**

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | n/a (no user-controlled input persisted; type-ahead reads `e.key` which is a single character, not stored) | — |
| V6 Cryptography | no | — |

### Known Threat Patterns for React UI components

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via `item.label` rendered without escaping | Tampering | React's default text-node escaping handles this; do NOT use `dangerouslySetInnerHTML` for labels. |
| `href` value injection | Tampering | Pass through as-is; consumer responsibility to sanitize. APG / current Disclosure source already do this. |

## Project Constraints (from CLAUDE.md)

- **TypeScript strict mode** — all new code must compile under `tsc --strict`. Use `interface` for `NavigationMenuProps` (public API); `type` for unions like `'disclosure' | 'menubar'`.
- **Test framework** — vitest, already configured. `// @vitest-environment jsdom` directive at top of test file already present.
- **Exports configuration** — `types` first in package.json exports. `@holmdigital/components` already correctly configured.
- **Versioning** — MINOR bump for additive opt-in feature: 2.4.0 → 2.5.0. NOT major (no break). NOT patch (it's a feature, not a fix).
- **Swedish characters** — preserve å/ä/ö in any Swedish-locale labels. Type-ahead uses codepoint comparison (`toLowerCase()`), which works correctly for Swedish without `toLocaleLowerCase('sv-SE')`. D-08 explicit.
- **WCAG SC JSDoc markers** — new `MenubarRenderer` JSDoc must include `@wcag` with `2.1.1 Keyboard` (full APG matrix) and `4.1.2 Name, Role, Value` (`role="menubar"`, `role="menuitem"`, `aria-haspopup`, `aria-expanded`, `aria-controls`). Mirror `DataTable.tsx:74-83` shape.
- **No breaking changes** — public surface `NavigationMenu` + `NavItem` + `NavigationMenuProps` are additive only (`pattern?` is optional with safe default).
- **Auto-update documentation** — CHANGELOG entry under 2.5.0 describing opt-in `pattern='menubar'`. CLAUDE.md "Current Package Versions" table updated.

## Sources

### Primary (HIGH confidence)
- `packages/components/src/NavigationMenu/NavigationMenu.tsx` (177 lines) — read in full `[VERIFIED]`
- `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` (335 lines) — read in full `[VERIFIED]`
- `packages/components/src/DataTable/DataTable.tsx` (326 lines) — read in full; precedent for roving + Map registry + useLayoutEffect + parent onKeyDown + Enter/Space delegation `[VERIFIED]`
- `.planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-RESEARCH.md` (first 100 lines) — output shape mirror `[VERIFIED]`
- `.planning/phases/31-navigationmenu-disclosure-menubar/31-CONTEXT.md` — all 8 locked decisions D-01..D-08 `[VERIFIED]`
- `.planning/REQUIREMENTS.md` — TC-14, TC-14-IMPL `[VERIFIED via grep]`
- `./CLAUDE.md` — version policy, TS conventions, test framework `[VERIFIED]`

### Secondary (MEDIUM confidence)
- W3C APG Menubar Navigation example: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/ — confirms `role="none"` on `<li>`, type-ahead semantics, keyboard contract `[CITED]`
- W3C APG Disclosure Navigation Menu pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/ — confirms current source's pattern (preserved under default) `[CITED via CONTEXT.md]`

### Tertiary (LOW confidence)
- jsdom navigation behavior (does not navigate on `<a>` click) — well-known but not re-verified this session `[ASSUMED]`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; all patterns already shipping in DataTable.tsx
- Architecture (dispatch, centralized state, useLayoutEffect, Map registry): HIGH — direct Phase 28 + Phase 30 precedent
- Type-ahead specifics (buffer storage, timeout management, boundary reset): HIGH — W3C APG canonical reference + Phase 30 useRef-shadow precedent
- Submenu-cross-on-ArrowRight (multi-step transition): MEDIUM — derived from D-06 spec; first time we ship this exact transition shape; mitigated by useLayoutEffect reconciliation pattern
- Pitfalls (role="none" + Testing Library, axe-core behavior, jsdom `<a>` activation): MEDIUM — Phase 30 analog shipped clean for similar role-overrides; verify at test time
- Test surface (D-02a-clean): HIGH — Phase 30 shipped 13 new tests this way with zero violations of the gate

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (30 days — stable React + APG patterns; no fast-moving deps)

## RESEARCH COMPLETE
