/**
 * Intern #89 fynd 1: motorns React-spann får inte smalna av i det tysta.
 *
 * Motorn har react och react-dom som KÖRBEROENDEN: HTML-utlåtandet renderas med
 * `renderToStaticMarkup` av komponentpaketets `AccessibilityStatement`, som har
 * `react >=18.0.0` som peer. Spannet var "^18.3.1 || ^19.0.0", men en
 * Dependabot-grupp för minor och patch (PR #109, 2026-07-28) skrev om det till
 * "^19.2.8" utan changeset. Varje motorversion sedan dess stängde ute React 18,
 * fast motorn renderar korrekt med det (verifierat med React 18.3.1 2026-09-24).
 *
 * Att släppa React 18 är ett medvetet beslut och en major, aldrig en rutinbump.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

describe('motorns React-spann', () => {
    it.each(['react', 'react-dom'])('%s tillåter både React 18 och 19', (name) => {
        expect(
            pkg.dependencies[name],
            `${name} ska vara "^18.3.1 || ^19.0.0". Att smalna av spannet släpper React 18 för konsumenter och kräver en major med changeset.`
        ).toBe('^18.3.1 || ^19.0.0');
    });
});
