import { HtmlValidate, ConfigData } from 'html-validate';

export interface ValidationResult {
    valid: boolean;
    errors: Array<{
        rule: string;
        message: string;
        line: number;
        column: number;
        selector?: string;
    }>;
}

export class HtmlValidator {
    private validator: HtmlValidate;

    constructor() {
        // Configuration focused on structural issues that impact accessibility
        // We use 'standard' but can disable rules that are purely stylistic if needed
        const config: ConfigData = {
            extends: ['html-validate:recommended'],
            rules: {
                'no-deprecated-attr': 'off', // Focus on structure, not deprecation
                'prefer-native-element': 'off',
                'no-trailing-whitespace': 'off',
                'void-style': 'off',
                'no-inline-style': 'off', // Allowed for A11y overrides
                'no-implicit-button-type': 'off', // Common in React
            },
        };
        this.validator = new HtmlValidate(config);
    }

    public async validate(html: string): Promise<ValidationResult> {
        const report = await this.validator.validateString(html);

        return {
            valid: report.valid,
            errors: report.results.flatMap((result: any) =>
                result.messages.map((msg: any) => ({
                    rule: msg.ruleId,
                    message: msg.message,
                    line: msg.line,
                    column: msg.column,
                    selector: msg.selector ?? undefined
                }))
            )
        };
    }
}
