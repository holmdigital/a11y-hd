
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

/**
 * Ska den delbara badgen hållas inne trots 100/100?
 *
 * Ja, och bara i ett fall: när robusthetskontrollen ger verdict 'empty', alltså
 * när sidan i praktiken är tom utan JavaScript.
 *
 * LÄS INNAN DU ÄNDRAR:
 * Detta rör INTE scoren. Sidan ÄR WCAG-konform och ska fortsatt visa 100/100 och
 * PASS. Att sänka scoren vore att ljuga om lagen: inget WCAG-kriterium kräver att
 * en sida fungerar utan JavaScript (se noscript-check.ts).
 *
 * Badgen är däremot en marknadsföringsartefakt, inte en juridisk bedömning. Den
 * är till för att delas i ett README eller på en sajt. Vi delar inte ut en
 * delbar utmärkelse till en sida som en användare på dåligt nät aldrig ser.
 *
 * 'partial' räcker inte. Där finns kärninnehåll utan JS, sidan går att läsa.
 * Bara det binära fallet "tom" håller inne badgen.
 */
export function isBadgeWithheldByRobustness(
    noScript?: { verdict: string } | null
): boolean {
    return noScript?.verdict === 'empty';
}
