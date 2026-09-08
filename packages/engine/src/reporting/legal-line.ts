/**
 * Klarspråk legal-basis line for a finding (Intern #29, Juno's approved wordings,
 * ratified by Karin 2026-08-25). Branches on the CONTENT of `dosLagenReference`,
 * in this order — the WCAG 2.2 case ("ännu inte lagkrav") MUST be tested before the
 * default, otherwise a not-yet-binding criterion is mislabelled as a legal
 * requirement:
 *
 *   Fall A  empty / a non-law fallback phrase (unmapped)  → "Lagrum okänt …"
 *   Fall B  value contains "ännu inte lagkrav" (WCAG 2.2) → "Ännu inte lagkrav …"
 *   Fall C  a real DOS-lagen reference                    → "Lagkrav: DOS-lagen …"
 *
 * The exact same string is used by `--plain` (terminal) and the plain HTML so the
 * two can never drift apart. Swedish only — Juno approved wordings for the Swedish
 * klarspråk report; other locales are a separate request (render nothing there).
 *
 * Intern #56: the three cases above describe PUBLIC sector. With `sector: 'private'`
 * DOS-lagen is never named at all — see PRIVATE_SECTOR_LINES below. `opts` is
 * optional so every existing call keeps its exact current output; public-sector
 * reports are byte-identical to before.
 *
 * NOTE (Juno guardrail): "10 §" is not hard-derived from data — it is correct for all
 * 45 current DOS-lagen requirements. If `standards` ever emits a different paragraph
 * for a legal requirement, Fall C must be revised with Juno.
 */
/**
 * Junos godkända lydelser för PRIVAT sektor (Intern #56, 2026-09-08). Nycklade på
 * ruleId, inte på kriterium: `region` och `heading-order` citerar båda 1.3.1 men
 * skiljer sig i svansen ("sidstruktur" vs "rubrikstruktur").
 *
 * De påstår medvetet INGET skarpt EAA-krav. Om EAA gäller en enskild privat aktör
 * beror på om tjänsten är konsumentriktad — en juridisk bedömning som varken vi
 * eller motorn kan göra ur en URL. Lydelserna håller sig därför till WCAG 2.2 och
 * EN 301 549, som är sektorsoberoende.
 */
const PRIVATE_SECTOR_LINES: Record<string, string> = {
    'name-role-value': 'Standard: WCAG 2.2, framgångskriterium 4.1.2 Namn, roll, värde (nivå A). Motsvaras av EN 301 549. En knapp utan tillgängligt namn kan inte tolkas av skärmläsare.',
    'region': 'Standard: WCAG 2.2, framgångskriterium 1.3.1 Information och relationer (nivå A), samt god praxis för sidstruktur.',
    'heading-order': 'Standard: WCAG 2.2, framgångskriterium 1.3.1 Information och relationer (nivå A), samt god praxis för rubrikstruktur.',
};

/** Fall A — Junos godkända lydelse för "vi kan inte peka ut ett lagrum". */
const UNKNOWN_LINE = 'Lagrum okänt. Fyndet kunde inte kopplas till ett specifikt lagrum.';

export function klarsprakLegalLine(
    dosLagenReference: string | undefined | null,
    opts?: { sector?: 'public' | 'private'; ruleId?: string }
): string {
    const ref = (dosLagenReference ?? '').trim();

    // Intern #56: DOS-lagen gäller OFFENTLIG sektor. En privat kund fick tidigare
    // "Lagkrav: DOS-lagen (2018:1937), 10 §." i sin klarspråks-PDF — fel lag, i
    // utgående kundtext. För privat sektor nämns DOS-lagen därför aldrig.
    //
    // Juno har godkänt lydelser för tre regler. För övriga faller vi tillbaka på
    // den redan godkända "lagrum okänt"-raden i stället för att hitta på juridisk
    // text — och för en privat aktör är den dessutom sann i sak, se kommentaren
    // vid PRIVATE_SECTOR_LINES. Byts ut när Juno definierat en generell lydelse.
    if (opts?.sector === 'private') {
        return (opts.ruleId && PRIVATE_SECTOR_LINES[opts.ruleId]) || UNKNOWN_LINE;
    }

    // Fall A: no reference, our light "unknown" marker, or a non-law fallback phrase
    // (e.g. "Kräver manuell bedömning" / "Rekommendation (ej lagkrav)"). A finding
    // without a mapping must say the legal basis is unknown — never a phrase that
    // poses as a law.
    const isRealDosLagen = ref.includes('2018:1937');
    const isNotYetLaw = ref.includes('ännu inte lagkrav');
    if (ref === '' || (!isRealDosLagen && !isNotYetLaw)) {
        return UNKNOWN_LINE;
    }

    // Fall B: WCAG 2.2 criterion — tested BEFORE the default (Juno).
    if (isNotYetLaw) {
        return 'Ännu inte lagkrav under DOS-lagen (WCAG 2.2-kriterium). Blir bindande när EN 301 549 V4.x refereras i EU:s officiella tidning.';
    }

    // Fall C: a real DOS-lagen A/AA requirement.
    return 'Lagkrav: DOS-lagen (2018:1937), 10 §.';
}
