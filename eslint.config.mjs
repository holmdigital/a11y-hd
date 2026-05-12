import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
    {
        ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**"]
    },
    js.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "react-hooks": reactHooks
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            // react-hooks: enable only exhaustive-deps to satisfy inline
            // eslint-disable-next-line directives in source. The full
            // recommended set (incl. react-compiler rules) flags 18
            // pre-existing patterns out of Phase 33 scope — deferred
            // to a dedicated react-hooks audit plan.
            "react-hooks/exhaustive-deps": "warn",
            // Custom rules
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
        }
    }
];
