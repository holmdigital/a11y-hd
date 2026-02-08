---
"@holmdigital/engine": patch
---

# Jenkins Build Fix

- **Improved Build Process**: Added cross-platform asset copying to ensure accessibility statement templates and logos are correctly bundled and resolved in production builds, resolving `ENOENT` errors in CI/CD environments like Jenkins.
- **Robust Path Resolution**: Hardened path resolution for assets to support multiple execution environments (src, dist, CI).
