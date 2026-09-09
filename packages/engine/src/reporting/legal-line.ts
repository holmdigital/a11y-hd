import { getConvergenceRule } from '@holmdigital/standards';

/**
 * Klarspråk legal-basis line for a finding.
 *
 * Intern #29 gave the first three cases. Intern #56 replaced them: Juno went
 * through all 48 rules in `rules.sv.json` individually rather than generalising
 * from two, and the result is THREE branches, not two. The distinction that a
 * two-branch model gets wrong is `color-contrast`: it is a real WCAG 1.4.3 AA
 * requirement, not good practice, and must never be lumped in with the
 * best-practice rules.
 *
 *   Gren 1  38 rules  real WCAG A/AA + dosLagenApplies:true  → formal legal requirement
 *   Gren 2   7 rules  wcagCriteria === "Best Practice"       → good practice, no law
 *   Gren 3   3 rules  real WCAG 2.2 AA but not yet binding   → becomes law with EN 301 549 V4.x
 *
 * Gren 3 (`target-size`, `dragging-movements`, `focus-not-obscured`) is NOT the
 * same as gren 2 and is reported wrong if the two are conflated: these ARE real
 * success criteria, they are simply not referenced in the Official Journal yet.
 *
 * The branch is derived from fields the report already carries — `wcagCriteria`
 * and the "ännu inte lagkrav" marker in `dosLagenReference`. Verified against the
 * data: that derivation reproduces Juno's 38/7/3 split exactly.
 *
 * DATA WARNING (Juno, Intern #56): never build this line from `legalContext`.
 * That block is present on 45 of 48 rules with identical text, including all
 * seven best-practice rules, so it cannot distinguish a legal requirement from
 * good practice. Only `wcagCriteria` / `wcagLevel` / `dosLagenReference` are
 * trustworthy signals here.
 *
 * Swedish only — Juno approved Swedish wordings; both call sites gate on `sv`.
 * `opts` is optional so any call without it keeps the pre-#56 public behaviour.
 */

/** Fall A — Junos godkända lydelse för "vi kan inte peka ut ett lagrum". */
const UNKNOWN_LINE = 'Lagrum okänt. Fyndet kunde inte kopplas till ett specifikt lagrum.';

/**
 * Gren 2, fastställda lydelser för de två regler Vilma formulerat (Intern #56,
 * 18:37). Gäller BÅDA sektorerna: det här är en klassningsfråga, inte en
 * sektorsfråga — de är god praxis för alla.
 *
 * Den tidigare lydelsen ("WCAG 2.2 ... 1.3.1 ... nivå A") togs bort för att den
 * ÖVERDREV. Juno belade mot primärkälla att axe taggar båda `best-practice` utan
 * wcag-tagg, att SC 1.3.1 varken kräver sekventiell rubrikordning eller att allt
 * innehåll ligger i landmärken, och att närmaste kriterier är 2.4.10 (AAA)
 * respektive 2.4.1 (där en skiplänk räcker). Ingen av dem bär upp ett A-krav.
 */
const BEST_PRACTICE_LINES: Record<string, string> = {
    'region': 'Klassas som god praxis för sidstruktur, snarare än ett formellt framgångskriterium i WCAG 2.2 eller ett krav i EN 301 549. Landmärken låter användare av hjälpmedel hoppa direkt till huvudinnehåll, navigation och sidfot, och gör sidan mätbart lättare att navigera.',
    'heading-order': 'Klassas som god praxis för rubrikstruktur, snarare än ett formellt framgångskriterium i WCAG 2.2 eller ett krav i EN 301 549. En logisk rubrikordning låter skärmläsaranvändare överblicka sidan och hoppa mellan avsnitt, ungefär som via en innehållsförteckning.',
};

interface LegalLineOptions {
    sector?: 'public' | 'private';
    ruleId?: string;
    /** Kriteriet från fyndet, t.ex. "1.4.3" eller "Best Practice". */
    wcagCriteria?: string;
    /** EN-kriteriet från fyndet, t.ex. "9.1.4.3". */
    en301549Criteria?: string;
}

/** Slår upp nivå och titel ur regeldatan — bärs inte av EnrichedReport. */
function ruleFacts(ruleId?: string): { level: string; title: string } {
    if (!ruleId) return { level: '', title: '' };
    try {
        const rule = getConvergenceRule(ruleId, 'sv') as unknown as { wcagLevel?: string; wcagTitle?: string } | null;
        return { level: rule?.wcagLevel ?? '', title: rule?.wcagTitle ?? '' };
    } catch {
        return { level: '', title: '' };
    }
}

/** "WCAG AA 1.4.3 (Contrast (Minimum))" — utan tomma parenteser när titel saknas. */
function criterionPhrase(level: string, criteria: string, title: string): string {
    const head = `WCAG ${level} ${criteria}`.replace(/\s+/g, ' ').trim();
    return title ? `${head} (${title})` : head;
}

export function klarsprakLegalLine(
    dosLagenReference: string | undefined | null,
    opts?: LegalLineOptions
): string {
    const ref = (dosLagenReference ?? '').trim();
    const isRealDosLagen = ref.includes('2018:1937');
    const isNotYetLaw = ref.includes('ännu inte lagkrav');

    // Fall A: omappat fynd. En fallback-fras ("Kräver manuell bedömning") får
    // aldrig renderas som om den vore ett lagrum.
    const isBestPractice = opts?.wcagCriteria === 'Best Practice' || ref.includes('Rekommendation (ej lagkrav)');
    if (!isBestPractice && !isRealDosLagen && !isNotYetLaw) {
        return UNKNOWN_LINE;
    }

    const { level, title } = ruleFacts(opts?.ruleId);

    // Gren 2 — god praxis. Samma text oavsett sektor.
    if (isBestPractice) {
        const fixed = opts?.ruleId && BEST_PRACTICE_LINES[opts.ruleId];
        if (fixed) return fixed;
        return `Ingen lagkrav, varken DOS-lagen eller lagen om vissa produkters och tjänsters tillgänglighet. ${opts?.ruleId ?? 'Regeln'} är god praxis (axe-core taggar den best-practice) och rekommenderas för bättre struktur, men ingår inte i lagens golv.`;
    }

    // Gren 3 — riktigt WCAG 2.2-kriterium som ännu inte är bindande. Samma text
    // oavsett sektor. Skiljs från gren 2: detta ÄR ett framgångskriterium.
    if (isNotYetLaw) {
        const phrase = criterionPhrase(level, opts?.wcagCriteria ?? '', title);
        return `Ännu inte lagkrav, varken DOS-lagen eller lagen om vissa produkters och tjänsters tillgänglighet. ${phrase} tillkom i WCAG 2.2 och blir bindande i båda lagarna när EN 301 549 V4.x refereras i EU:s officiella tidning, väntat 30 november 2026.`;
    }

    // Gren 1 — formellt lagkrav. Här, och bara här, skiljer sig sektorerna.
    const phrase = criterionPhrase(level, opts?.wcagCriteria ?? '', title);
    if (opts?.sector === 'private') {
        // Juno kunde INTE belägga vilken EN 301 549-version som är citerad för
        // lag 2023:254 mot primärkälla — harmoniseringen verkar pågå. Raden går
        // därför ut med markeringen kvar, aldrig med ett gissat versionsnummer.
        return `Lagkrav: lagen om vissa produkters och tjänsters tillgänglighet (2023:254), 6 och 9 §§. ${phrase}. EN 301 549-version för denna lag är inte verifierad.`;
    }
    const en = opts?.en301549Criteria && opts.en301549Criteria !== 'N/A' && opts.en301549Criteria !== 'Unknown'
        ? `, EN 301 549 ${opts.en301549Criteria}`
        : '';
    return `Lagkrav: DOS-lagen (2018:1937), 10 §. ${phrase}${en}.`;
}
