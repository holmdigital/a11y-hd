# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for security reports.**

Use GitHub's [private vulnerability reporting](https://github.com/holmdigital/a11y-hd/security/advisories/new) on this repository. It is enabled, and it gives us a private channel to confirm and fix the issue before any details become public.

If you cannot use that form, email **hej@holmdigital.se** and put "security" in the subject line.

Please include enough to reproduce: the affected package and version, what you did, what happened, and what you expected. A minimal reproduction is worth more than a long description.

### What to expect

- We aim to acknowledge a report within **3 working days**.
- We will tell you whether we consider it a vulnerability, and why, rather than going quiet.
- We will let you know when a fix ships, and we are happy to credit you in the advisory unless you prefer otherwise.

We are a small team, so please allow reasonable time before public disclosure.

## Supported versions

Security fixes go to the **latest published version** of each package. We do not backport to older majors.

| Package | Supported |
| --- | --- |
| `@holmdigital/engine` | latest 3.x |
| `@holmdigital/standards` | latest 3.x |
| `@holmdigital/components` | latest 4.x |

All three are published from this repository via GitHub Actions using npm Trusted Publishing (OIDC) with provenance attestation — no long-lived npm tokens are involved. You can verify a release's provenance with `npm audit signatures`.

## Scope

**In scope**

- The three published packages above, including the `hd-a11y-scan` CLI.
- The build and release pipeline in `.github/workflows/`.

**Out of scope**

- Accessibility findings that a scan reports (or fails to report). Those are product issues, not security ones — open a normal issue.
- Vulnerabilities in third-party dependencies where no version of ours is affected. Report those upstream; Dependabot already tracks them here.
- Findings that require an attacker to already control the machine running the scanner.

## A note on how the scanner runs

`@holmdigital/engine` drives a headless Chromium (Puppeteer) to render the page it scans. The scanner renders whatever page you point it at, including any script on it, so treat scanning an untrusted URL the way you would treat visiting it in a browser.

Since engine 4.0.0 two defences are on by default:

- **Private and internal addresses are blocked.** This covers loopback, 10/8, 172.16/12, 192.168/16, 100.64/10, link-local including the cloud metadata service at 169.254.169.254, multicast, and their IPv6 equivalents. The check applies to the address you give and to every request the page makes, redirects included. Host names are resolved and the resulting addresses are checked, and a lookup that fails is blocked. To scan your own local development server, pass `--allow-private-hosts` (library: `allowPrivateHosts: true`).
- **Chromium's sandbox is on.** Chrome cannot use it when running as root or where unprivileged user namespaces are restricted, as on some CI runners. There you must disable it explicitly with `--no-sandbox` (library: `sandbox: false`, or `PUPPETEER_ARGS="--no-sandbox"`). Only do that for pages you trust.

The address check is a layer, not a complete boundary. The engine resolves a host before the browser does, and the answer can change in between (DNS rebinding). WebSocket connections also do not pass through the check. If you run the engine **server-side on URLs supplied by someone else**, keep your own network egress restrictions in place as well.

If you find a way to escape those documented boundaries, we do want to hear about it.
