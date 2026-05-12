# CONVENTIONS

Date: 2026-05-12

## Coding Style
- Follows ESLint recommendations for TypeScript and React Hooks.
- `react-hooks/exhaustive-deps` is set to warn, and some legacy warnings exist.
- Prettier is used for code formatting.
- `any` usage is discouraged (`@typescript-eslint/no-explicit-any`: warn).
- Unused variables must be prefixed with an underscore (`_`).

## Error Handling
- Engine components throw structured errors that are reported either through the CLI interface or caught to generate error logs in JUnit/HTML outputs.

## Export Conventions
- Uses `exports` field in `package.json` for all packages to support both CommonJS and ESM.
- Export constraints and structure are verified using `publint` and `@arethetypeswrong/cli` during CI/publishing steps.
