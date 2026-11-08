/**
 * Intern #53 steg 2: Chromes sandbox är PÅ som standard.
 *
 * Motorn renderar per definition främmande sidor med deras JavaScript, så
 * indata är aldrig betrott. Sandboxen är Chromes inneslutning mot att en
 * komprometterad renderare tar sig ut i värden. Motorn stängde av den
 * ovillkorligt med `--no-sandbox --disable-setuid-sandbox`, i både skannern
 * och PDF-generatorn. Karins beslut 2026-09-18: sandboxen ska vara på.
 *
 * Opt-out finns, och den är uttrycklig: `--no-sandbox` i CLI:t,
 * `sandbox: false` i biblioteket, eller miljövariabeln `PUPPETEER_ARGS`, som
 * nu faktiskt läses. Scan-serverns container sätter redan
 * `PUPPETEER_ARGS="--no-sandbox …"`, som ingen kod läste. Därför bryter den
 * här ändringen inte driften när motorn uppgraderas där. Att köra containern
 * som vanlig användare med sandboxen påslagen är driftens nästa steg.
 *
 * Opt-out behövs i två vanliga miljöer. Chrome vägrar starta med sandbox som
 * root, till exempel i en container utan USER-rad. På CI-runners som
 * begränsar användarnamnrymder, som Ubuntu 24.04 med AppArmor, saknar Chrome
 * en användbar sandbox. Felmeddelandet säger då vad som ska göras i stället
 * för att visa Chromes egen text ensam.
 */

/** Miljövariablerna som läses. Samma form som process.env. */
type Env = Record<string, string | undefined>;

export interface LaunchPolicy {
    /** Chromes sandbox. Standard: på. */
    sandbox?: boolean;
    invalidHttpsCert?: boolean;
    /** Övriga flaggor anroparen alltid vill ha. */
    extraArgs?: string[];
}

/** Flaggorna i `PUPPETEER_ARGS`, åtskilda av blanksteg. */
export function puppeteerArgsFromEnv(env: Env = process.env): string[] {
    return (env.PUPPETEER_ARGS ?? '').split(/\s+/).filter(Boolean);
}

/** Sant om sandboxen faktiskt begärs, alltså varken avstängd i koden eller i miljön. */
export function sandboxRequested(policy: LaunchPolicy, env: Env = process.env): boolean {
    return policy.sandbox !== false && !puppeteerArgsFromEnv(env).includes('--no-sandbox');
}

export function chromeLaunchArgs(policy: LaunchPolicy, env: Env = process.env): string[] {
    return [
        ...(policy.sandbox === false ? ['--no-sandbox', '--disable-setuid-sandbox'] : []),
        ...(policy.invalidHttpsCert ? ['--ignore-certificate-errors', '--allow-insecure-localhost'] : []),
        ...(policy.extraArgs ?? []),
        ...puppeteerArgsFromEnv(env),
    ];
}

/**
 * Översätter Chromes startfel när sandboxen är orsaken. Andra fel lämnas
 * orörda.
 */
export function explainLaunchFailure(error: unknown, policy: LaunchPolicy, env: Env = process.env): Error {
    const original = error instanceof Error ? error : new Error(String(error));
    if (!sandboxRequested(policy, env) || !/sandbox|user namespace|setuid|crbug\.com\/638180/i.test(original.message)) {
        return original;
    }
    const chromeSaid = original.message.split('\n').find(line => /sandbox|namespace|setuid/i.test(line))?.trim()
        ?? original.message.split('\n')[0];
    return new Error(
        'Chrome could not start its sandbox. The sandbox is on by default because the engine renders third-party pages. ' +
        'Chrome cannot use it when running as root (for example in a container without a USER) or where unprivileged user namespaces are restricted (for example on Ubuntu 24.04 CI runners). ' +
        'Either run as a regular user in an environment that allows the sandbox, or disable it explicitly with --no-sandbox ' +
        '(library: sandbox: false, or PUPPETEER_ARGS="--no-sandbox"). Only disable it for pages you trust.\n' +
        `Chrome said: ${chromeSaid}`
    );
}
