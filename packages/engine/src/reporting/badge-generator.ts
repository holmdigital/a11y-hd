
/**
 * Utility to generate shields.io accessibilty badges
 */

const BADGE_COLOR = '00703C'; // AAA Compliant Green (Contrast 7.15:1)
const BADGE_BASE_URL = 'https://img.shields.io/badge/HolmDigital_Engine';

/**
 * Generates the shields.io URL for the accessibility badge
 * @param score The accessibility score (0-100)
 * @returns The badge URL or null if score is not 100
 */
export function generateBadgeUrl(score: number): string | null {
    if (score !== 100) {
        return null;
    }
    return `${BADGE_BASE_URL}-100%25-${BADGE_COLOR}?style=flat-square`;
}

/**
 * Generates the Markdown code for the accessibility badge
 * @param score The accessibility score (0-100)
 * @returns The badge markdown or null if score is not 100
 */
export function generateBadgeMarkdown(score: number): string | null {
    const url = generateBadgeUrl(score);
    if (!url) {
        return null;
    }
    return `![Accessibility Status: 100% Compliant](${url})`;
}
