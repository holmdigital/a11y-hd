/**
 * Parsning och validering av CLI-flaggor som tar värden.
 *
 * Egen modul, inte inbakad i index.ts, av ett skäl: index.ts anropar
 * program.parse() på modulnivå. Importerar man den i ett test kör CLI:n igång.
 * Det som ska enhetstestas måste därför ligga utanför.
 */

import type { StatementMetadata } from '../reporting/statement-generator';

/** Övre gräns för hydration-waiten. Över en minut är det inte en wait, det är en hängning. */
export const MAX_HYDRATION_WAIT_MS = 60000;

export class InvalidOptionError extends Error {}

/**
 * Tolkar --wait-for-hydration <ms>.
 *
 * Accepterar ett heltal millisekunder, 0 till MAX_HYDRATION_WAIT_MS.
 * 0 stänger av waiten helt (användbart på statiska sidor där den bara kostar tid).
 *
 * Kastar InvalidOptionError vid skräp, decimaltal, negativa värden och värden
 * över taket. Vi tystar inte ned felet till en default: en användare som skrivit
 * fel ska få veta det, inte i tysthet få en annan wait än hen bad om.
 */
export function parseHydrationWait(raw: string): number {
    const trimmed = String(raw).trim();

    // Number() accepterar '', '0x10', '1e3' och ' 2 '. Vi vill ha rena siffror.
    if (!/^\d+$/.test(trimmed)) {
        throw new InvalidOptionError(
            `Invalid --wait-for-hydration value '${raw}'. ` +
            `Expected a whole number of milliseconds between 0 and ${MAX_HYDRATION_WAIT_MS} (e.g. --wait-for-hydration 5000).`
        );
    }

    const ms = Number(trimmed);

    if (ms > MAX_HYDRATION_WAIT_MS) {
        throw new InvalidOptionError(
            `--wait-for-hydration ${ms} is too high. The maximum is ${MAX_HYDRATION_WAIT_MS} ms. ` +
            `A page that has not hydrated within a minute will not hydrate at all.`
        );
    }

    return ms;
}

type ReviewMethod = NonNullable<StatementMetadata['reviewMethod']>;

/** Granskningsmetoderna som --review-method tar emot (Intern #95). */
export const REVIEW_METHODS: readonly ReviewMethod[] = ['self-assessment', 'external-review', 'no-review'];

const isReviewMethod = (value: string): value is ReviewMethod =>
    (REVIEW_METHODS as readonly string[]).includes(value);

/**
 * Tolkar --review-method och --reviewer (Intern #95) till fälten i StatementMetadata.
 *
 * Utelämnad metod betyder självskattning, samma som utan flaggan i dag. Ett
 * okänt värde är ett fel och ingen tyst fallback: den som skrev "external" ska
 * inte få ett utlåtande om självskattning utan att veta om det.
 *
 * external-review kräver en granskare med namn. Utlåtandegeneratorn kräver
 * samma sak, men här syns felet före skanningen och inte efter den.
 *
 * En granskare skickas bara vidare med external-review, för det är bara då
 * utlåtandet namnger någon. API:t gör likadant: utan external-review står
 * ingen granskare i utlåtandet.
 */
export function parseReviewOptions(
    rawMethod: unknown,
    rawReviewer: unknown
): Pick<StatementMetadata, 'reviewMethod' | 'reviewer'> {
    if (rawMethod === undefined || rawMethod === null) return {};

    const method = String(rawMethod).trim();
    if (!isReviewMethod(method)) {
        throw new InvalidOptionError(
            `Invalid --review-method value '${String(rawMethod)}'. Expected one of: ${REVIEW_METHODS.join(', ')}.`
        );
    }
    if (method !== 'external-review') return { reviewMethod: method };

    const name = typeof rawReviewer === 'string' ? rawReviewer.trim() : '';
    if (name === '') {
        throw new InvalidOptionError(
            `--review-method external-review requires --reviewer <name> (or "reviewer" in the config file): ` +
            `the organisation that performed the review, e.g. --reviewer "Example Audit AB". ` +
            `Use self-assessment (the default) if the statement is based on your own testing, such as this scan.`
        );
    }
    return { reviewMethod: method, reviewer: { name } };
}
