# Deferred Items - Phase 03

## Pre-existing tsc errors (not caused by this plan)

1. **cloud-client.ts:41** - `element_selector: string | string[]` not assignable to `CloudViolation.element_selector: string`. The `FailingNode.target` type was widened to `string | string[]` in Phase 01. The `CloudViolation` interface needs updating to match.

2. **statement-generator.ts:303-305** - `template` is possibly `undefined`. An uncommitted prior change typed `template` as `StatementTemplate | undefined` but did not add narrowing guards before use.

Both issues appear to come from uncommitted work-in-progress changes in the working tree that predate this plan.
