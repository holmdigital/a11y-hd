/**
 * Parsning och validering av CLI-flaggor som tar värden.
 *
 * Egen modul, inte inbakad i index.ts, av ett skäl: index.ts anropar
 * program.parse() på modulnivå. Importerar man den i ett test kör CLI:n igång.
 * Det som ska enhetstestas måste därför ligga utanför.
 */

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
