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
 * NOTE (Juno guardrail): "10 §" is not hard-derived from data — it is correct for all
 * 45 current DOS-lagen requirements. If `standards` ever emits a different paragraph
 * for a legal requirement, Fall C must be revised with Juno.
 */
export function klarsprakLegalLine(dosLagenReference: string | undefined | null): string {
    const ref = (dosLagenReference ?? '').trim();

    // Fall A: no reference, our light "unknown" marker, or a non-law fallback phrase
    // (e.g. "Kräver manuell bedömning" / "Rekommendation (ej lagkrav)"). A finding
    // without a mapping must say the legal basis is unknown — never a phrase that
    // poses as a law.
    const isRealDosLagen = ref.includes('2018:1937');
    const isNotYetLaw = ref.includes('ännu inte lagkrav');
    if (ref === '' || (!isRealDosLagen && !isNotYetLaw)) {
        return 'Lagrum okänt. Fyndet kunde inte kopplas till ett specifikt lagrum.';
    }

    // Fall B: WCAG 2.2 criterion — tested BEFORE the default (Juno).
    if (isNotYetLaw) {
        return 'Ännu inte lagkrav under DOS-lagen (WCAG 2.2-kriterium). Blir bindande när EN 301 549 V4.x refereras i EU:s officiella tidning.';
    }

    // Fall C: a real DOS-lagen A/AA requirement.
    return 'Lagkrav: DOS-lagen (2018:1937), 10 §.';
}
