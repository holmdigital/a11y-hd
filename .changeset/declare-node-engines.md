---
'@holmdigital/engine': major
'@holmdigital/components': major
'@holmdigital/standards': major
---

Declare Node >=22.22.0 via `engines`

The published packages carried no `engines` field, so npm performed no
version check at install time. `@holmdigital/engine` already required
Node 22 in practice — `html-validate` needs `^22.22.0 || >=24.8.0`, and
`commander` and `puppeteer` both need `>=22.12.0` — but a consumer on
Node 18 or 20 installed it without any warning and only failed at
runtime.

All three packages now declare `node >=22.22.0`, matching the strictest
floor the monorepo's dependency tree imposes and the only Node version
CI exercises. This is a breaking change for consumers below that
version, hence the major across the board.

Documentation examples that used Node 20 (the README's GitLab CI
snippet, the CI/CD integration guide, the developer cookbooks and the
CI/CD strategy doc) have been corrected to Node 22 — as written they
could not have run the CLI.
