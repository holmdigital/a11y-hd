# Developer Cookbooks

Practical recipes for integrating accessibility into your development workflow using the `@holmdigital` ecosystem.

## Recipe 1: CI/CD Compliance Gate
**Goal:** Block Pull Requests that introduce new accessibility violations.

```yaml
# .github/workflows/a11y-check.yml
name: Accessibility Check
on: [pull_request]

jobs:
  a11y-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      
      # Start your local server
      - name: Start Dev Server
        run: npm run dev & 
        env:
          PORT: 3000

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      # Run HolmDigital Engine
      - name: Run Accessibility Scan
        run: |
          npx hd-a11y-scan http://localhost:3000 \
            --threshold high \
            --ci
```

## Recipe 2: Custom Audit Log with `DataTable`
**Goal:** Build an accessible table to display audit logs using the generic `DataTable` component.

```tsx
import { DataTable } from '@holmdigital/components';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

const data: LogEntry[] = [
  { id: '1', timestamp: '2023-10-01 12:00', user: 'admin', action: 'Login' },
  { id: '2', timestamp: '2023-10-01 12:05', user: 'editor', action: 'Update' },
];

const columns = [
  { header: 'Time', accessor: 'timestamp', sortable: true },
  { header: 'User', accessor: 'user', sortable: true },
  { header: 'Action', accessor: 'action' }
];

export function AuditLog() {
  return (
    <DataTable
      caption="System Audit Logs"
      data={data}
      columns={columns}
      className="audit-table"
    />
  );
}
```

## Recipe 3: Dynamic Accessibility Statement
**Goal:** Generate a statement that automatically updates based on your app's config.

```tsx
import { AccessibilityStatement } from '@holmdigital/components';
import config from './config'; // Your app config

export function LegalPage() {
  const isPrivateSector = config.type === 'b2c';

  return (
    <div className="container mx-auto p-4">
      <h1>Accessibility</h1>
      <AccessibilityStatement
        country={config.country} // e.g., 'SE'
        sector={isPrivateSector ? 'private' : 'public'}
        organizationName={config.orgName}
        websiteUrl={config.publicUrl}
        complianceLevel="partial"
        // Update this date automatically when deploying
        lastReviewDate={new Date(process.env.BUILD_DATE)} 
        contactEmail="support@example.com"
      />
    </div>
  );
}
```

## Recipe 4: EAA Compliance Check
**Goal:** Programmatic check if your app complies with the now-active European Accessibility Act (EAA).

```typescript
import { getEAADeadlineRules } from '@holmdigital/standards';

function checkLegalRisks() {
  const violatingRules = getEAADeadlineRules();
  
  if (violatingRules.length > 0) {
    console.error(`🚨 CRITICAL: ${violatingRules.length} violations of the European Accessibility Act (EAA)!`);
    console.error(`   The deadline (June 2025) has passed. These issues must be fixed immediately.`);
    violatingRules.forEach(r => console.groupCollapsed(`- ${r.id}: ${r.description}`));
  }
}
```

## Recipe 5: GitLab CI Pipeline
**Goal:** Run accessibility checks in GitLab CI/CD with merge request annotations.

```yaml
# .gitlab-ci.yml
accessibility-check:
  stage: test
  image: node:22
  script:
    - npm ci
    - npm run build
    - npm run start &
    - npx wait-on http://localhost:3000
    - npx hd-a11y-scan http://localhost:3000 
        --ci 
        --junit a11y-report.xml 
        --threshold high
  artifacts:
    when: always
    reports:
      junit: a11y-report.xml
    paths:
      - a11y-report.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## Recipe 6: JUnit Report for Test Runners
**Goal:** Generate JUnit XML output for integration with test dashboards (Jenkins, Azure DevOps, etc.)

```bash
# Generate JUnit report
npx hd-a11y-scan https://example.com --junit ./reports/a11y-results.xml

# Combine with existing test results
npx hd-a11y-scan https://example.com \
  --junit ./test-results/accessibility.xml \
  --threshold critical \
  --ci
```

Example JUnit output:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="HolmDigital Accessibility Scan" tests="46" failures="2">
  <testsuite name="WCAG 2.1 AA" tests="46" failures="2">
    <testcase name="landmark-one-main" classname="WCAG.1.3.1">
      <failure message="Page must have exactly one main landmark">
        Element: document
        Impact: moderate
      </failure>
    </testcase>
    <testcase name="color-contrast" classname="WCAG.1.4.3" />
  </testsuite>
</testsuites>
```

## Recipe 7: Configuration File (.a11yrc)
**Goal:** Store scan settings in a config file for consistent team usage.

Create `.a11yrc` in your project root. The schema mirrors the CLI flag names — all keys are flat (no nested `output` object, no `pages`/`exclude` array):

```json
{
  "lang": "sv",
  "threshold": "high",
  "viewport": "desktop",
  "ci": true,
  "sector": "public",
  "junit": "./reports/a11y-junit.xml",
  "pdf": "./reports/accessibility-report.pdf",
  "org": "Acme Corp",
  "email": "a11y@example.com",
  "phone": "+46 70 000 00 00",
  "responseTime": "2 dagar",
  "publishDate": "2024-02-06",
  "cloudUrl": "https://cloud.holmdigital.se"
}
```

Then pass the URL on each invocation (the URL is not stored in `.a11yrc`):
```bash
npx hd-a11y-scan http://localhost:3000
# Reads settings from .a11yrc automatically — CLI flags override file values
```

## Recipe 8: Azure DevOps Pipeline
**Goal:** Integrate accessibility testing in Azure Pipelines.

```yaml
# azure-pipelines.yml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npm run build && npm run start &
    displayName: 'Start application'

  - script: npx wait-on http://localhost:3000
    displayName: 'Wait for server'

  - script: |
      npx hd-a11y-scan http://localhost:3000 \
        --junit $(Build.ArtifactStagingDirectory)/a11y-results.xml \
        --ci \
        --lang sv
    displayName: 'Run Accessibility Scan'

  - task: PublishTestResults@2
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: '$(Build.ArtifactStagingDirectory)/a11y-results.xml'
      testRunTitle: 'Accessibility Tests'
    condition: always()
```

## Recipe 9: Pre-commit Hook
**Goal:** Catch accessibility issues before code is committed.

Install husky and lint-staged:
```bash
npm install -D husky lint-staged
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{html,tsx,jsx}": [
      "npx hd-a11y-scan --threshold critical --ci"
    ]
  }
}
```

Create `.husky/pre-commit`:
```bash
#!/bin/sh
npx lint-staged
```

## Recipe 10: EAA Private Sector Statement
**Goal:** Generate an accessibility statement for a private sector company under the European Accessibility Act.

```bash
npx hd-a11y-scan https://shop.example.com \
  --statement eaa-statement.html \
  --sector private \
  --country DE \
  --lang de \
  --org "Online Shop GmbH" \
  --email "barrierefreiheit@shop.de" \
  --phone "+49 30 1234567" \
  --response-time "5 Werktage"
```

This generates a statement that automatically:
- References the **BFSG** (Barrierefreiheitsstaerkungsgesetz) as the applicable law
- Lists the correct EAA enforcement authority for Germany
- Uses German-language professional legal templates
