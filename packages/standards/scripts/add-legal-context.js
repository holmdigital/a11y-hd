/**
 * Script to add legalContext to all rules in rules.en.json
 * All WCAG 2.1 AA criteria apply to both WAD and EAA
 */
const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '../data/rules.en.json');
const rules = require(rulesPath);

// EAA service scopes (applies to private sector)
const eaaServiceScopes = ['e-commerce', 'banking', 'transport', 'telecommunications'];

// Add legalContext to each rule
const updatedRules = rules.map(rule => {
    // Skip if already has legalContext
    if (rule.legalContext) {
        return rule;
    }

    // Determine sectors based on WCAG level
    // All A and AA criteria apply to both WAD (public) and EAA (private)
    const sectors = ['public', 'private'];

    // Create legalContext
    const legalContext = {
        appliesTo: ['WAD', 'EAA'],
        sectors: sectors,
        wadArticle: 'Article 4, Annex referencing EN 301 549',
        eaaAnnex: 'Annex I, Section I - Functional accessibility requirements',
        eaaProductScope: eaaServiceScopes,
        eaaDeadline: '2025-06-28'
    };

    // Add WAD/EAA tags if not present
    const newTags = [...rule.tags];
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

// Write back to file
fs.writeFileSync(rulesPath, JSON.stringify(updatedRules, null, 4));

console.log(`Updated ${updatedRules.length} rules with legalContext`);
console.log(`Rules with legalContext: ${updatedRules.filter(r => r.legalContext).length}`);
