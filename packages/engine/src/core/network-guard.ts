/**
 * Intern #53 steg 2: motorn vägrar nå privata och interna adresser, som
 * standard.
 *
 * Karins beslut 2026-09-18: motorn får egna spärrar som ett extra lager utöver
 * spärren i driften, och spärren är PÅ från början. Den som skannar sin egen
 * lokala utvecklingsserver öppnar den aktivt, med `--allow-private-hosts` i
 * CLI:t eller `allowPrivateHosts: true` i biblioteket.
 *
 * Varför motorn och inte bara scan-servern: scan-serverns spärr (steg 1)
 * prövar adressen den TAR EMOT. Men webbläsaren följer omdirigeringar, och en
 * publik sida kan hämta resurser från vilken adress som helst. En sida på en
 * publik adress som svarar 302 till http://169.254.169.254/ passerar en
 * kontroll av startadressen. Den här spärren sitter därför i webbläsaren och
 * prövar VARJE förfrågan sidan gör, inklusive varje omdirigeringssteg.
 *
 * Ett värdnamn är inte en adress: `intern.example.com` kan peka på 10.0.0.5.
 * Spärren slår därför upp namnet och prövar de adresser det faktiskt ger, och
 * den felar stängt: ett uppslag som misslyckas avvisas.
 *
 * Kvar som känd gräns, och därför ett lager och inte hela skyddet: mellan vårt
 * uppslag och webbläsarens eget kan svaret ändras (DNS rebinding), och
 * WebSocket-anslutningar går inte genom Puppeteers request interception.
 * Nätverksisolering av den miljö motorn kör i är det andra lagret.
 *
 * Intervallen är desamma som i scan-serverns spärr, så att de två lagren
 * blockerar samma sak.
 */
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { HTTPRequest, Page } from 'puppeteer';

export class PrivateHostError extends Error {
    readonly host: string;
    readonly reason: string;
    constructor(url: string, host: string, reason: string) {
        super(
            `Refusing to scan '${url}': ${host} resolves to ${reason}. ` +
            'Private and internal addresses are blocked by default, so the engine cannot be used to reach internal services. ' +
            'To scan your own local development server, pass --allow-private-hosts (library: allowPrivateHosts: true).'
        );
        this.name = 'PrivateHostError';
        this.host = host;
        this.reason = reason;
    }
}

/**
 * Skälet till att en IPv4-adress är spärrad, eller null om den är publik.
 *
 * Metadatatjänsten (169.254.169.254) ligger i länklokalt utrymme och täcks av
 * 169.254/16, men nämns ändå för sig: det är den adress ett angrepp faktiskt
 * siktar på, och en läsare ska hitta den när hen söker.
 */
export function blockedIPv4(ip: string): string | null {
    const p = ip.split('.').map(Number);
    if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return 'a malformed IPv4 address';
    const [a, b] = p;
    if (a === 0) return 'this-network 0.0.0.0/8';
    if (a === 10) return 'private 10.0.0.0/8';
    if (a === 127) return 'loopback 127.0.0.0/8';
    if (a === 169 && b === 254) {
        return ip === '169.254.169.254' ? 'the cloud metadata service 169.254.169.254' : 'link-local 169.254.0.0/16';
    }
    if (a === 172 && b >= 16 && b <= 31) return 'private 172.16.0.0/12';
    if (a === 192 && b === 168) return 'private 192.168.0.0/16';
    if (a === 100 && b >= 64 && b <= 127) return 'carrier-grade NAT 100.64.0.0/10';
    if (a === 192 && b === 0) return 'IETF protocol assignments 192.0.0.0/24';
    if (a >= 224) return 'multicast or reserved 224.0.0.0/4';
    return null;
}

/** Samma för IPv6, inklusive IPv4-mappade adresser som ::ffff:10.0.0.5. */
export function blockedIPv6(ip: string): string | null {
    const lower = ip.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return blockedIPv4(mapped[1]);
    if (lower === '::1') return 'loopback ::1';
    if (lower === '::') return 'unspecified ::';
    if (/^f[cd]/.test(lower)) return 'unique local fc00::/7';
    if (/^fe[89ab]/.test(lower)) return 'link-local fe80::/10';
    if (/^ff/.test(lower)) return 'multicast ff00::/8';
    return null;
}

type Resolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;
const systemResolver: Resolver = (hostname) => lookup(hostname, { all: true });

/**
 * Skälet till att ett värdnamn är spärrat, eller null om ALLA dess adresser
 * är publika. Ett namn som ger både en publik och en privat adress spärras:
 * antingen är det felkonfigurerat eller ett försök, och utfallet ska inte bero
 * på vilken adress webbläsaren råkar välja.
 */
export async function blockedHostReason(hostname: string, resolve: Resolver = systemResolver): Promise<string | null> {
    const host = hostname.replace(/^\[|\]$/g, '');
    const literal = isIP(host);
    if (literal === 4) return blockedIPv4(host);
    if (literal === 6) return blockedIPv6(host);

    let addresses: Array<{ address: string; family: number }>;
    try {
        addresses = await resolve(host);
    } catch {
        return 'an address that could not be resolved (blocked: the guard fails closed)';
    }
    if (addresses.length === 0) return 'no address (blocked: the guard fails closed)';
    for (const { address, family } of addresses) {
        const reason = family === 6 ? blockedIPv6(address) : blockedIPv4(address);
        if (reason) return reason;
    }
    return null;
}

/** Kastar PrivateHostError om startadressen pekar på en spärrad adress. */
export async function assertPublicHost(url: string, resolve: Resolver = systemResolver): Promise<void> {
    const { hostname } = new URL(url);
    const reason = await blockedHostReason(hostname, resolve);
    if (reason) throw new PrivateHostError(url, hostname, reason);
}

/** Scheman som inte går över nätverket och därför släpps igenom. */
const LOCAL_SCHEMES = new Set(['data:', 'blob:', 'about:']);

export interface BlockedRequest {
    url: string;
    host: string;
    reason: string;
}

/**
 * Slår på request interception för sidan och avbryter varje förfrågan till en
 * spärrad adress, omdirigeringar inräknade. Uppslag cachas per värdnamn under
 * sidans livstid. Returnerar en funktion som ger de avbrutna förfrågningarna.
 *
 * Varje förfrågan löses exakt en gång. Ett oväntat fel i kontrollen avbryter
 * förfrågan i stället för att släppa igenom den.
 */
export async function guardPage(
    page: Page,
    resolve: Resolver = systemResolver
): Promise<() => BlockedRequest[]> {
    const verdicts = new Map<string, Promise<string | null>>();
    const blocked: BlockedRequest[] = [];

    const verdictFor = (hostname: string) => {
        let verdict = verdicts.get(hostname);
        if (!verdict) {
            verdict = blockedHostReason(hostname, resolve);
            verdicts.set(hostname, verdict);
        }
        return verdict;
    };

    await page.setRequestInterception(true);
    page.on('request', (request: HTTPRequest) => {
        void (async () => {
            let reason: string | null;
            let host = '';
            try {
                const target = new URL(request.url());
                host = target.hostname;
                if (LOCAL_SCHEMES.has(target.protocol)) {
                    reason = null;
                } else if (target.protocol === 'http:' || target.protocol === 'https:') {
                    reason = await verdictFor(target.hostname);
                } else {
                    reason = `the unsupported scheme ${target.protocol}`;
                }
            } catch {
                reason = 'an address the guard could not check';
            }
            try {
                if (reason) {
                    blocked.push({ url: request.url(), host, reason });
                    await request.abort('blockedbyclient');
                } else {
                    await request.continue();
                }
            } catch {
                // Förfrågan kan redan vara avslutad, till exempel om sidan
                // navigerade bort under uppslaget. Då finns inget kvar att lösa.
            }
        })();
    });

    return () => [...blocked];
}
