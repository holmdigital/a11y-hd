import React from 'react';
import { ArticleData } from '../../types';
import { CodeBlock } from '../../components/CodeBlock';

export const configArticle: ArticleData = {
  id: 'config',
  title: 'Configuration',
  description: 'Configure the engine and scanner for your specific needs.',
  lastUpdated: 'December 08, 2025',
  sections: [],
  content: (
    <>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        The scanner can be configured via a <code>holmdigital.config.js</code> file or CLI arguments.
      </p>
      <h3 className="text-lg font-bold text-slate-900 mb-4">CLI Options</h3>
      <CodeBlock code={`npx hd-a11y-scan <url> [options]

Options:
  --lang <code>       Language code (en, sv, de, fr, es). Default: en
  --ci                Run in CI mode (exit code 1 on critical failures)
  --json              Output results as JSON (clean, no debug messages)
  --pdf <path>        Generate PDF report to specified file path
  --viewport <size>   Set viewport: "mobile", "tablet", "desktop", or "WIDTHxHEIGHT"
  --generate-tests    Generate Playwright pseudo-automation test scripts`} language="bash" />
    </>
  )
};

export const cicdArticle: ArticleData = {
  id: 'ci-cd',
  title: 'CI/CD Integration',
  description: 'Automate accessibility testing in your build pipelines.',
  lastUpdated: 'December 09, 2025',
  sections: [
    { id: 'github', title: 'GitHub Actions' },
    { id: 'gitlab', title: 'GitLab CI' }
  ],
  content: (
    <>
      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        The <code>@holmdigital/engine</code> is designed to fail builds when accessibility violations are detected.
        Use the <code>--ci</code> flag to ensure the process exits with code 1.
      </p>

      <h2 id="authentication" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24">Authentication</h2>
      <p className="text-slate-600 mb-4">
        Since our packages are hosted on the <strong>GitHub Package Registry</strong>, your CI/CD environment must be authenticated to install them.
        This is typically done by setting the <code>NODE_AUTH_TOKEN</code> environment variable.
      </p>

      <h3 className="text-lg font-bold text-slate-900 mb-2">1. Create an .npmrc file</h3>
      <p className="text-slate-600 mb-4">
        Add an <code>.npmrc</code> file to the root of your project with the following content:
      </p>
      <CodeBlock code={`@holmdigital:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}`} language="ini" />

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
        <p className="text-sm text-blue-800">
          <strong>Important:</strong> Do not hardcode your token in the file! Use the <code>{'${NODE_AUTH_TOKEN}'}</code> syntax
          so npm can read it from your CI/CD secrets.
        </p>
      </div>

      <h2 id="github" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24">GitHub Actions</h2>
      <CodeBlock code={`name: Accessibility Check
on: [push, pull_request]

jobs:
  a11y-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@holmdigital'

      - name: Install dependencies
        run: npm ci
        env:
          NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Build Application
        run: npm run build

      - name: Start Server
        run: npm start &
        env:
          PORT: 3000

      - name: Wait for Server
        run: npx wait-on http://localhost:3000

      - name: Run Accessibility Scan
        run: npx hd-a11y-scan http://localhost:3000 --ci --lang en
        env:
          NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`} language="yaml" />

      <h2 id="gitlab" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24">GitLab CI</h2>
      <CodeBlock code={`a11y_check:
  image: node:20
  stage: test
  before_script:
    # Configure npm for GitHub Package Registry
    - npm config set @holmdigital:registry https://npm.pkg.github.com
    - npm config set //npm.pkg.github.com/:_authToken \${GITHUB_TOKEN}
  script:
    - npm ci
    - npm run build
    - npm start &
    - npx wait-on http://localhost:3000
    - npx hd-a11y-scan http://localhost:3000 --ci --lang en
  allow_failure: false`} language="yaml" />

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              <strong>Tip:</strong> You can also generate a JSON report using the <code>--json</code> flag
              and upload it as a build artifact for deeper analysis.
            </p>
          </div>
        </div>
      </div>
    </>
  )
};
