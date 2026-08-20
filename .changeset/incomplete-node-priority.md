---
"@holmdigital/engine": patch
---

When axe's `incomplete` carries a color-contrast item with mixed reasons, surface the one that actually needs review (Intern #20). In the frozen acceptance case, benign `nonBmp` nodes (icon-only glyphs like `→`) precede the `bgOverlap` node in axe's output; the previous logic took the first node, so the `bgOverlap` concern was labelled `nonBmp` and could be truncated out of the carried nodes. The engine now orders "could not determine contrast" nodes (those whose check data carries `contrastRatio`/`expectedContrastRatio`) ahead of the benign ones, so `reviewReason` and `failingNodes` reflect the real review need. The ordering is stable, so nodes of equal significance keep axe's order.
