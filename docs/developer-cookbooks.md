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
          npx @holmdigital/engine scan \
            --url http://localhost:3000 \
            --threshold 90 \
            --fail-on-critical
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

## Recipe 4: EAA Deadline Check
**Goal:** programmatic check if your app runs within the EAA deadline warning window.

```typescript
import { getEAADeadlineRules } from '@holmdigital/standards';

function checkDeadlineRisks() {
  const riskyRules = getEAADeadlineRules();
  
  if (riskyRules.length > 0) {
    console.warn(`⚠️ Warning: ${riskyRules.length} rules have an upcoming June 2025 deadline!`);
    riskyRules.forEach(r => console.log(`- ${r.id}: ${r.description}`));
  }
}
```
