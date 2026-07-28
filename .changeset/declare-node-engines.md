---
'@holmdigital/engine': major
'@holmdigital/components': patch
'@holmdigital/standards': patch
---

Declare supported Node versions via `engines`

The published packages carried no `engines` field, so npm performed no
version check at install time. `@holmdigital/engine` already required
Node 22 in practice — `html-validate` needs `^22.22.0 || >=24.8.0`, and
`commander` and `puppeteer` both need `>=22.12.0` — but a consumer on
Node 18 or 20 installed it without any warning and only failed at
runtime.

- `@holmdigital/engine` now declares `node >=22.22.0`, matching the
  strictest floor its dependency tree already imposes. This is a
  breaking change for consumers below that version, hence the major.
- `@holmdigital/components` and `@holmdigital/standards` declare
  `node >=18.0.0`. Neither has runtime dependencies that impose a
  higher floor, so they are deliberately left unconstrained by the
  engine's requirement.
