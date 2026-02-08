
import { generateStatementContent } from '../src/reporting/statement-generator';
import { ScanResult } from '../src/core/regulatory-scanner';

async function verify() {
    const mockResult: ScanResult = {
        url: 'https://example.no',
        score: 85,
        stats: { critical: 0, serious: 5, moderate: 10, minor: 15 },
        reports: [
            { ruleId: 'rule-1', wcagCriteria: '1.1.1', severity: 'serious' as any, message: 'Missing alt text', element: 'img', score: 0 }
        ],
        timestamp: new Date().toISOString()
    } as any;

    const languages = ['en', 'sv', 'no', 'da', 'fi', 'nl', 'de', 'fr', 'es'];

    console.log('# Accessibility Statement Verification\n');

    for (const lang of languages) {
        try {
            const md = await generateStatementContent(mockResult, lang, 'md', {
                organizationName: 'HolmDigital Test Org',
                contactEmail: 'test@holmdigital.se'
            });

            console.log(`## Language: ${lang.toUpperCase()}`);
            const lines = md.split('\n');
            console.log(`Title: ${lines[0]}`);
            const enforcementLine = lines.find(l => l.includes('Digitaliseringsstyrelsen') || l.includes('Digg') || l.includes('uutilsynet') || l.includes('AVI') || l.includes('BZK') || l.includes('BFIT-Bund') || l.includes('DINUM') || l.includes('Ministerio'));
            console.log(`Enforcement: ${enforcementLine?.trim() || 'Not found'}`);
            console.log('---');
        } catch (e: any) {
            console.error(`Error generating for ${lang}: ${e.message}`);
        }
    }
}

verify().catch(console.error);
