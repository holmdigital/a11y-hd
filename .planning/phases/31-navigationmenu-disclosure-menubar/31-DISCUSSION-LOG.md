# Phase 31 — Discussion Log

**Date:** 2026-05-12
**Phase:** 31 — NavigationMenu Disclosure → Menubar
**Mode:** standard discuss (4 gray areas, all selected by user)

## Gray Areas Presented

User selected ALL four:
- D-01 Bakåtkompatibilitet (opt-in vs ny default) — ROADMAP-flagged
- D-02 Type-ahead-omfattning (single-char vs buffert)
- D-03 Hover-att-öppna (behåll/ta bort i menubar-läge)
- D-04 Tom-submeny / leaf-item-beteende

## Question Turns

### D-01: Backwards-compat strategy
- **Options:** opt-in via `pattern` prop / new default = menubar / new default + legacy escape-prop
- **User chose:** Opt-in via `pattern` prop (default `"disclosure"`) — recommended path
- **Rationale:** lowest-risk, additive only, MINOR bump (2.4.0 → 2.5.0), no migration burden on v0.6 consumers

### D-02: Type-ahead implementation
- **Options:** multi-char buffer 500ms / single-char only / skip in v1
- **User chose:** Multi-char buffer with 500 ms timeout — APG full spec
- **Rationale:** distinguishes "Se" → Settings from "Sea" → Search; matches native OS menubars; ROADMAP Success Criterion #1 explicitly lists type-ahead

### D-03: Hover-to-open in menubar mode
- **Options:** drop hover in menubar / keep hover both modes / click-only both modes
- **User chose:** Drop hover-open in menubar mode (disclosure mode keeps hover)
- **Rationale:** strict APG Menubar contract; predictable for assistive tech; avoids SR-confusing "submenu opened while focus was elsewhere"

### D-04: Leaf-item (top-level item without children) behavior
- **Options:** native `<a>` + Enter activates / Down hops to nearest neighbor's children / always-button trigger
- **User chose:** Enter/Space native `<a>` activation; ArrowDown = no-op + preventDefault
- **Rationale:** preserves native `<a>` affordances (Ctrl+click new-tab, right-click menu, SR "link" announcement); APG permits `role="menuitem"` on `<a>`

## Decisions Captured

8 decisions locked in 31-CONTEXT.md:
- D-01 opt-in `pattern` prop, default disclosure, MINOR 2.5.0
- D-02 type-ahead multi-char buffer with 500 ms timeout
- D-03 drop hover-open in menubar mode
- D-04 leaf-item = native `<a role="menuitem">`
- D-05 full ARIA role chain (`menubar` / `menu` / `menuitem` / `none`)
- D-06 clamped (NOT wrapping) keyboard contract — Phase 30 consistency
- D-07 D-02a-clean test surface for new Menubar block; Disclosure block keeps Phase 24 fireEvent exception
- D-08 type-ahead label source = `item.label`, case-insensitive, locale-naive (Swedish å/ä/ö work via codepoint match)

## Deferred Ideas

- Default flip to `pattern="menubar"` in 3.0.0
- Locale-aware type-ahead (`toLocaleLowerCase('sv-SE')`)
- Submenu wrap-around as toggle
- Multi-level submenus (recursive `children`)
- `aria-current="page"` router integration
- Mouse drag-from-trigger-to-item activation
