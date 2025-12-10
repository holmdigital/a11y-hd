
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';

const execPromise = util.promisify(exec);

const SITES = [
    'https://www.skatteverket.se',
    'https://www.1177.se',
    'https://www.regeringen.se',
    'https://www.aftonbladet.se',
    'https://www.svt.se',
    'https://www.blocket.se',
    'https://www.spotify.com',
    'https://www.kth.se',
    'https://www.swedbank.se',
    'https://www.ica.se'
];

async function runHolmDigitalScan(url) {
    try {
        const { stdout } = await execPromise(`npx hd-a11y-scan ${url} --json`, {
            cwd: process.cwd(),
            timeout: 120000 // 2 minutes timeout
        });

        // Find JSON block in stdout (in case of spinner logs)
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return 'Error';

        const result = JSON.parse(jsonMatch[0]);
        return result.score;
    } catch (error) {
        console.error(`HD Scan failed for ${url}:`, error.message);
        return 'Fail';
    }
}

async function runLighthouseScan(url) {
    const outputPath = `lh-${Date.now()}.json`;
    try {
        // Run Lighthouse headless
        // Note: Requires lighthouse to be installed or accessible via npx
        // Attempting to use npx lighthouse
        await execPromise(`npx lighthouse ${url} --output=json --output-path=${outputPath} --chrome-flags="--headless" --only-categories=accessibility`, {
            cwd: process.cwd(),
            timeout: 120000
        });

        const data = await fs.readFile(outputPath, 'utf8');
        const result = JSON.parse(data);
        const score = result.categories.accessibility.score * 100;

        // Cleanup
        await fs.unlink(outputPath);

        return Math.round(score);
    } catch (error) {
        console.error(`Lighthouse failed for ${url}:`, error.message);
        try { await fs.unlink(outputPath); } catch { }
        return 'Fail';
    }
}

async function main() {
    console.log('🚀 Starting Accessibility Benchmark Race');
    console.log('--------------------------------------------------');
    console.log(`Testing ${SITES.length} websites...`);
    console.log('This may take several minutes.\n');

    console.log(
        '| ' + 'Site'.padEnd(30) +
        '| ' + 'HolmDigital'.padEnd(12) +
        '| ' + 'Lighthouse'.padEnd(12) +
        '| ' + 'Diff'.padEnd(6) + ' |'
    );
    console.log('|' + '-'.repeat(31) + '|' + '-'.repeat(13) + '|' + '-'.repeat(13) + '|' + '-'.repeat(8) + '|');

    const results = [];

    for (const url of SITES) {
        process.stdout.write(`Scanning ${new URL(url).hostname}... `);

        // Run scans in parallel for speed, or serial for stability? Serial is safer.
        const hdScore = await runHolmDigitalScan(url);
        const lhScore = await runLighthouseScan(url);

        const domain = new URL(url).hostname.replace('www.', '');
        const diff = (typeof hdScore === 'number' && typeof lhScore === 'number')
            ? (hdScore - lhScore)
            : 'N/A';

        let diffStr = diff.toString();
        if (typeof diff === 'number') {
            if (diff > 0) diffStr = `+${diff}`; // HD is more lenient
            if (diff < 0) diffStr = `${diff}`;  // HD is stricter
            if (diff === 0) diffStr = ' 0';
        }

        console.log('\r' +
            '| ' + domain.padEnd(30) +
            '| ' + String(hdScore).padEnd(12) +
            '| ' + String(lhScore).padEnd(12) +
            '| ' + diffStr.padEnd(6) + ' |'
        );

        results.push({ domain, hdScore, lhScore, diff });
    }

    console.log('\n✅ Benchmark Complete');
}

main().catch(console.error);
