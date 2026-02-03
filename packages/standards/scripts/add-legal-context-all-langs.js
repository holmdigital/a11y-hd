/**
 * Script to add legalContext to all rules in ALL language files
 */
const fs = require('fs');
const path = require('path');

// All language files to update
const langFiles = [
    'rules.sv.json',
    'rules.de.json',
    'rules.fr.json',
    'rules.es.json',
    'rules.nl.json',
    'rules.en-gb.json',
    'rules.en-us.json',
    'rules.en-ca.json'
];

// EAA service scopes
const eaaServiceScopes = ['e-commerce', 'banking', 'transport', 'telecommunications'];

langFiles.forEach(filename => {
    const rulesPath = path.join(__dirname, '../data', filename);

    if (!fs.existsSync(rulesPath)) {
        console.log(`Skipping ${filename} - file not found`);
        return;
    }

    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

    const updatedRules = rules.map(rule => {
        // Skip if already has legalContext
        if (rule.legalContext) {
            return rule;
        }

        // Create legalContext
        const legalContext = {
            appliesTo: ['WAD', 'EAA'],
            sectors: ['public', 'private'],
            wadArticle: 'Article 4, Annex referencing EN 301 549',
            eaaAnnex: 'Annex I, Section I - Functional accessibility requirements',
            eaaProductScope: eaaServiceScopes,
            eaaDeadline: '2025-06-28'
        };

        // Add WAD/EAA tags if not present
        const newTags = [...(rule.tags || [])];
        if (!newTags.includes('WAD')) newTags.push('WAD');
        if (!newTags.includes('EAA')) newTags.push('EAA');
        if (!newTags.includes('public-sector')) newTags.push('public-sector');
        if (!newTags.includes('private-sector')) newTags.push('private-sector');

        return {
            ...rule,
            tags: newTags,
            legalContext
        };
    });

    fs.writeFileSync(rulesPath, JSON.stringify(updatedRules, null, 4));
    console.log(`Updated ${filename}: ${updatedRules.filter(r => r.legalContext).length} rules with legalContext`);
});

console.log('\nAll language files updated!');
