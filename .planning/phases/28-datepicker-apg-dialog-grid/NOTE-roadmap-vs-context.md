# Note: ROADMAP SC-4 vs CONTEXT D-01

ROADMAP Phase 28 SC-4 states: "Existing prop interface unchanged (no breaking changes to consumers)."

CONTEXT D-01 (discuss-phase output, 2026-05-11) locks the OPPOSITE: `value: string → value: Date` IS a breaking change, accepted with rationale (downstream audit shows no in-repo consumers; downstream npm consumers get CHANGELOG migration note).

The planner honours CONTEXT (locked user decision per planner context-fidelity rules). The plans implement the breaking change with CHANGELOG entry per D-01.

Action for the user (orchestrator surface):
- Suggest a one-line ROADMAP edit at next opportunity: "4. ~~Existing prop interface unchanged (no breaking changes to consumers)~~ → `value` prop type changes from `string` to `Date` per Phase 28 CONTEXT D-01 (documented BREAKING in changelog.md)"

This file exists so the conflict is not silently buried.
