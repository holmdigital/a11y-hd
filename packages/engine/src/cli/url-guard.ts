/**
 * Protokollgrind för skan-adressen.
 *
 * Egen modul av samma skäl som parse-options.ts: index.ts anropar
 * program.parse() på modulnivå, så det som ska enhetstestas måste ligga
 * utanför.
 *
 * Bakgrunden är värd att skriva ut, för felet var inte att kontrollen saknades.
 * Den FANNS i cli/index.ts som `isValidUrl`, den gjorde rätt kontroll, och den
 * anropades på rätt ställe. Men anropet såg ut så här:
 *
 *     if (!isValidUrl(url)) {
 *         // ... validation ...
 *     }
 *
 * En tom kropp. Grinden stod på plats, öppen, sedan februari (912480e), och
 * `file://` gick rakt in i skanningen. Det är värre än ingen kontroll alls:
 * en läsare som söker efter validering hittar den och drar slutsatsen att den
 * sker. Det gjorde vi, i Intern #74, där vi rapporterade att ett protokoll-
 * allowlist fanns i CLI-lagret. Det gjorde det inte.
 *
 * Därför kastar den här modulen i stället för att returnera en boolean. Ett
 * kastat fel kan inte tappas bort av en tom if-sats — anroparen måste fånga
 * det eller krascha, och båda utfallen är ärliga.
 *
 * Intern #53 steg 1. Spärren mot privata adresser och metadatatjänsten hör
 * till steg 2 och ligger INTE här: den är ett produktbeslut med opt-out
 * (`--allow-private-hosts`) som kan bli en MAJOR, och den ska inte smygas in
 * under en akut protokollfix.
 */

/** De enda scheman en skanning får använda. Allt annat avvisas. */
export const ALLOWED_SCAN_PROTOCOLS = ['http:', 'https:'] as const;

export class UnsupportedUrlError extends Error {}

/**
 * Tolkar och godkänner en skan-adress.
 *
 * Returnerar den tolkade URL:en så att anroparen slipper tolka om den, och
 * kastar UnsupportedUrlError vid allt annat än http/https.
 *
 * `file:`, `data:`, `javascript:` och `chrome:` nämns uttryckligen i felet: de
 * är de scheman någon faktiskt råkar skicka in, och ett fel som säger vilket
 * schema som avvisades är lättare att förstå än ett som bara säger "ogiltig".
 */
export function assertScanUrl(raw: string): URL {
    let parsed: URL;

    try {
        parsed = new URL(String(raw).trim());
    } catch {
        throw new UnsupportedUrlError(
            `Invalid URL '${raw}'. Expected an absolute address such as https://example.com.`
        );
    }

    if (!(ALLOWED_SCAN_PROTOCOLS as readonly string[]).includes(parsed.protocol)) {
        throw new UnsupportedUrlError(
            `Unsupported protocol '${parsed.protocol}' in '${raw}'. ` +
            `Only http:// and https:// can be scanned. ` +
            `A local file is not a website: serve it over http and scan that address instead.`
        );
    }

    return parsed;
}
