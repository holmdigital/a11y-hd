import { describe, it, expect } from 'vitest';
import { en301549FromTags, RegulatoryScanner } from './regulatory-scanner';
import type { EnrichedReport } from '@holmdigital/standards';

/**
 * Intern #39 — EN-9.x-taggen som en301549-fallback för OMAPPADE fynd.
 *
 * axe bär EN-referensen ordagrant i taggen (`EN-9.1.4.4`). För ett ärligt omappat
 * fynd (t.ex. `meta-viewport`, vars 1.4.4 inte finns i vår DB) blev `en301549Criteria`
 * `'Unknown'` trots det. Nu används taggen som fallback — men ALDRIG i stället för
 * vår regeldata på ett matchat fynd.
 */

describe('Intern #39 — en301549FromTags', () => {
    it('parsar EN-9.x.x.x ur taggen', () => {
        expect(en301549FromTags(['EN-9.1.4.4'])).toBe('9.1.4.4');
    });

    it('matchar INTE framework-taggen EN-301-549', () => {
        expect(en301549FromTags(['EN-301-549'])).toBeNull();
    });

    it('plockar EN-9.x även när framework-taggen ligger bredvid', () => {
        expect(en301549FromTags(['cat.x', 'EN-301-549', 'EN-9.1.1.1', 'ACT'])).toBe('9.1.1.1');
    });

    it('null när ingen EN-9-tagg finns', () => {
        expect(en301549FromTags(['wcag2a', 'wcag144', 'ACT'])).toBeNull();
    });

    it('tar första EN-9-taggen i taggordning', () => {
        expect(en301549FromTags(['EN-9.1.1.1', 'EN-9.4.1.2'])).toBe('9.1.1.1');
    });
});

describe('Intern #39 — fallback endast på omappade fynd, aldrig på matchade', () => {
    const scanner = new RegulatoryScanner({ url: 'https://test.example.com' });
    const full = (i: unknown) => (scanner as unknown as { enrichResults: (x: unknown) => Promise<EnrichedReport[]> }).enrichResults(i);
    const light = (i: unknown) => (scanner as unknown as { enrichResultsLight: (x: unknown) => Promise<EnrichedReport[]> }).enrichResultsLight(i);
    const fix = (id: string, tags: string[]) => ({
        violations: [{ id, help: 'h', description: 'd', tags, nodes: [{ html: '<x>', target: ['x'], failureSummary: 's' }] }],
        passes: []
    });

    // meta-viewport: 1.4.4 finns inte i DB → ärligt omappat (KRAV-13 RT6).
    const META_VIEWPORT = ['cat.sensory-and-visual-cues', 'wcag2aa', 'wcag144', 'EN-301-549', 'EN-9.1.4.4', 'ACT', 'RGAAv4', 'RGAA-10.4.2'];
    // image-alt: matchat fynd, regeldatan bär 9.1.1.1.
    const IMAGE_ALT = ['cat.text-alternatives', 'wcag2a', 'wcag111', 'EN-301-549', 'EN-9.1.1.1', 'ACT'];

    it('omappat meta-viewport → en301549 från EN-9.1.4.4, inte "Unknown" (full)', async () => {
        const [r] = await full(fix('meta-viewport', META_VIEWPORT));
        expect(r.en301549Criteria).toBe('9.1.4.4');
    });

    it('omappat meta-viewport → EN-9.1.4.4 även i light-vägen', async () => {
        const [r] = await light(fix('meta-viewport', META_VIEWPORT));
        expect(r.en301549Criteria).toBe('9.1.4.4');
    });

    it('matchat image-alt behåller regeldatans 9.1.1.1 — taggen åsidosätter inte (full)', async () => {
        const [r] = await full(fix('image-alt', IMAGE_ALT));
        expect(r.en301549Criteria).toBe('9.1.1.1');
    });

    it('matchat image-alt behåller 9.1.1.1 även i light-vägen', async () => {
        const [r] = await light(fix('image-alt', IMAGE_ALT));
        expect(r.en301549Criteria).toBe('9.1.1.1');
    });

    it('omappat fynd UTAN EN-9-tagg → fortfarande "Unknown" (full)', async () => {
        const [r] = await full(fix('meta-viewport', ['cat.sensory-and-visual-cues', 'wcag2aa', 'wcag144', 'ACT']));
        expect(r.en301549Criteria).toBe('Unknown');
    });
});
