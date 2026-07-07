# Regelverk: DevOps & DevSecOps — Holm Digital

**Syfte:** hur vi bygger, driftar och säkrar vår infrastruktur och våra tjänster —
tydligt nog att hela teamet kan följa det, tekniskt nog att vi kan luta oss mot det.

**Gäller:** Holm Digitals servrar, infrastruktur och utvecklings-repos (Docker
Compose / Ansible / homelab / moln). Repo-specifika detaljer (serveradresser,
baslinje) bor i respektive infra-repo, inte här.

**Grundat i:** [OWASP DevSecOps Guideline](https://github.com/OWASP/DevSecOpsGuideline)
(People / Process / Governance) samt guidelines för AI i drift
([VersusControl](https://github.com/VersusControl/devops-ai-guidelines),
[AWS DevOps-AI-toolkit](https://github.com/aws-samples/automated-devops-ai-toolkit)).

**Version:** 1.0 · 2026-07-07 · ägare: Daniel (CTO). Ändras via PR.

> Detta är Holm Digitals gemensamma DevSecOps-standard och är avsiktligt likadan i
> alla våra infra-repos. Ändra i en, synka till övriga.

---

# Del A — Spelregler för alla (inkl. Karins team)

De få reglerna **alla** följer, oavsett teknisk nivå. Läs dessa även om du aldrig rör en server.

### A1. Konton & inloggning
- **Eget konto, aldrig delat.** Dela aldrig ditt lösenord — inte ens med kollegor.
- **2FA på allt.** Skyddade tjänster ligger bakom tvåstegsverifiering. Registrera din 2FA och håll den säker.
- **Starka, unika lösenord** via lösenordshanterare. Återanvänd aldrig.

### A2. Hemligheter (lösenord, API-nycklar, tokens)
- **Klistra aldrig in hemligheter i chatt, mejl, dokument eller skärmdumpar.**
- Ser du en hemlighet där den inte hör hemma → **säg till Daniel direkt.** Nycklar kan bytas, men bara om vi vet att de läckt.
- Repos med hemligheter är **privata** — dela aldrig repo-åtkomst eller kod utåt utan Daniels ok.

### A3. Phishing & bedrägeri
- Var skeptisk mot **oväntade** förfrågningar om inloggning/åtkomst/klick — även från bekanta avsändare.
- Verifiera i en **annan kanal** innan du agerar.

### A4. Innehåll får du redigera själv — infrastruktur aldrig
- **Enklare redigering sköter Karins team själva** via de avsedda verktygen: text, sidor, inlägg, bilder, SEO-metadata och kampanjinnehåll i WordPress-admin / CMS. Det är er domän — kör på.
- **Rör ALDRIG servrar, config, kod eller deploy direkt** (server-filer, `.env`, docker/Traefik-config, temafiler via FTP/SSH, "fixa" saker på servern). Det går alltid via den tekniska processen (Del B) — direkt-pill på infra har orsakat våra värsta strul.
- **Osäker på vilken kategori din ändring är?** Fråga hellre en gång för mycket. Allt som rör kod, struktur, ny funktion eller servern → **begär den** (skriv till Daniel, beskriv *vad* du vill uppnå, inte *hur*).

### A5. Om något ser fel ut
- Tjänst nere, konstig varning, oväntat beteende, misstänkt mejl → **säg till Daniel, fixa inte själv.** Skriv ner *vad du såg, när, och vad du gjorde precis innan.*
- Rapportera tidigt. Ingen skäller för en falsk larmning.

### A6. Data & integritet (GDPR)
- Personuppgifter hanteras varsamt och sparas bara så länge de behövs.
- Cookie-consent och analytics finns av juridiska skäl — ändra inte utan avstämning.

---

# Del B — Tekniskt DevSecOps (för oss)

Mappat mot OWASP:s tre pelare, sized för vår verklighet: **dedikerade servrar,
Docker Compose / Ansible, litet team** — inte ett stort moln med hundra pipelines.

## B0. Den gyllene regeln: GitOps

> **Repot är sanningen. Ändra i repot → commit → push → deploy (pull på servern).
> Redigera ALDRIG config, `.env` eller tjänstefiler direkt på en server** annat än i
> en akut incident — och reconcilia då tillbaka till repot **samma dag.**

*Varför:* direkt-på-server-ändringar skapar drift som ingen ser, tills en `git pull`
kolliderar eller en backup/deploy går sönder. En **drift-vakt** (cron som larmar vid
ocommittade server-ändringar) fångar det tidigt.

## B1. People (roller & ansvar)

| Roll | Vem | Huvudansvar |
|------|-----|-------------|
| Övergripande ägare (infra & säkerhet) | Daniel (CTO) | **Allt** — servrar, repos, config, deploy, säkerhetsbeslut, incident-lead. Sista ordet. |
| Innehåll & sajter | Karin + team | **Huvudansvariga för wiki, holmdigital.se + a11y-hd** (innehåll, SEO, kampanjer). Full åtkomst till allt. |

- **Åtkomst ≠ mandat:** teamet har i praktiken full åtkomst (litet team). Att kunna nå servern betyder inte att man rör den — **A4 gäller ändå.** Kontrollen är disciplinen + spårbarheten (commits, loggar, drift-vakt), inte åtkomstbegränsning.
- **Deploy** sker som dedikerad deploy-användare, inte root.
- **Onboarding/offboarding:** skapa/dra in konton, rotera delade hemligheter vid offboarding.

## B2. Process — säkerhet i varje steg

- **Design:** nya publika tjänster får säkra defaults (TLS, säkerhets-headers, rate-limit, auth framför allt icke-publikt). Enkel hotmodellering: *vad kan gå fel, vem når det, vad skyddar det?*
- **Develop:** branch + PR, ingen direkt-push till `main` för icke-trivialt. Hemligheter aldrig hårdkodade. **Secret-scan (gitleaks) i CI** blockerar nya oavsiktliga hemligheter. `.gitattributes` tvingar LF på shell-script.
- **Build/CI:** pinna actions, minsta token-rättighet (`permissions:`), Dependabot på, validera artefakter före deploy.
- **Test/verifiering:** **verifiera det som faktiskt serveras — inte bara filen på disk.** Röktesta mot den publika endpointen, inte bara "grön workflow". Health-endpoints + uptime-övervakning.
- **Release/Deploy:** deploy = pull + deploy-script, aldrig ad hoc på servern. **Rollback-plan alltid klar** (backup/snapshot före icke-trivialt). **Grönt ska betyda grönt** — härda flakiga tester.
- **Operate:** monitoring (metrics + loggar), **verifierad backup som LARMAR vid fel** (en tyst trasig backup är värdelös — larma till ntfy/motsv.), härdning (brandvägg, fail2ban, SSH-nyckel ej lösen, auto-säkerhetsuppdateringar). Inga hemligheter i loggar (hämta filer, `cat`:a aldrig hemligheter till delad terminal).

## B3. Governance (styrning & risk)

- **Access review** kvartalsvis; dra in oanvänt, rotera vid offboarding.
- **Riskregister (medvetna avsteg):** dokumentera varje medvetet avsteg med avvägning + kompenserande kontroller. *Exempel:* om `.env`/hemligheter spåras i ett privat repo (för återställbarhet + teamsynlighet) → kompenserande kontroller: repot privat + åtkomstbegränsat, secret-scannern allowlistar bara de kända filerna och fångar allt annat, hemligheter roterbara. **Villkor: repot får aldrig bli publikt.**
- **Patch-policy:** auto-uppdateringar + Dependabot.
- **Dataskydd/GDPR:** consent, dataminimering, krypterad backup.

## B4. Incident response (kortversion)

1. **Upptäck & rapportera** (A5). 2. **Bedöm** påverkan (kund/data? säkerhet vs drift).
3. **Begränsa** (ta ner tjänst, blockera IP, rotera nyckel). 4. **Åtgärda** i repot → deploy;
akut server-hotfix reconcilias tillbaka samma dag. 5. **Återställ & verifiera** (röktest).
6. **Post-mortem** — kort skriftlig: vad, varför, vad förhindrar återfall.

---

# Del C — AI-assisterad drift (Claude Code / agenter)

Vi använder AI-agenter aktivt i drift. Mönstret — *AI föreslår/utför → valideringsgrind
→ människa godkänner* — kommer från AWS:s DevOps-AI-toolkit och OWASP:s AI-governance.

- **C1. AI får fritt:** läsa och diagnosticera allt (read-only) — status, diffar, loggar, kartlägga kod. Uppmuntras.
- **C2. Kräver mänskligt godkännande:** varje skarp prod-ändring (deploy, reset/checkout på server, omstart, radering, merge till `main`, trigga deploy). AI visar diffar; **människan drar i avtryckaren.** Prod-deploy är människans trigger.
- **C3. Krav på AI-arbete:** **backup FÖRST** före destruktivt; **verifiera, anta inte** (röktesta serverat resultat, inte bara "filen ser rätt ut" / "grön workflow"); **hemligheter aldrig i klartext** i loggen (hämta filer, `cat`:a inte nycklar); **spårbarhet** (commits + kort rapport); **minnet är kontext, inte auktoritet** — verifiera mot verkligheten.
- **C4. Gränser:** agera bara inom uttalad uppgift/behörighet; osäkert läge på körande server → stanna och fråga. Utåtriktade/svåråterställda åtgärder bekräftas först.

---

> Regelverket är levande. Hittar vi en ny fälla — lägg till en rad. Målet är inte
> perfektion, det är att aldrig göra samma misstag två gånger.
