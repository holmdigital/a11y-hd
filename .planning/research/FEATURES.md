# Feature Research

**Domain:** Australian jurisdiction support for accessibility compliance tooling
**Researched:** 2026-03-27
**Confidence:** HIGH (AHRC, DTA, WAI/W3C official sources verified; AS EN 301 549 confirmed via Standards Australia)

---

## Scope of This Research

This milestone adds Australia (AU) as a fully supported jurisdiction to an existing multi-jurisdiction accessibility compliance monorepo. The existing system already handles:

- EU jurisdictions (EN 301 549, WAD, EAA) across 9 countries
- UK (Equality Act + PSBAR), US (ADA + Section 508), Canada (ACA)
- TLD-based country detection, sector-aware enforcement selection
- Accessibility statement generation in 12 locales

The features below are evaluated against **what AU jurisdiction support requires** specifically — not what is already built.

---

## Australian Regulatory Landscape (Research Findings)

### Primary Legal Framework

**Disability Discrimination Act 1992 (DDA)** — the foundational law. Applies to all sectors (public and private). No specific WCAG version mandated in the legislation itself; WCAG compliance is the established standard of care via AHRC advisory notes and 2025 guidelines.

**2025 AHRC Guidelines (April 2025)** — updated guidance affirming WCAG 2.2 Level AA as the minimum standard, replacing the 2014 advisory notes which referenced WCAG 2.0. Extended scope to SaaS platforms, AI tools, IoT devices, mobile apps, CAPTCHAs, two-factor authentication, and QR codes.

**Digital Transformation Agency (DTA) — Digital Experience Policy** — effective 1 January 2025 for new government services, 1 July 2025 for existing services. Mandatory for federal government departments and agencies only. Contains four sub-standards: Digital Service Standard, Digital Inclusion Standard, Digital Access Standard, Digital Performance Standard.

**AS EN 301 549:2024** — voluntary standard (not legislated federally) that identically adopts EN 301 549:2021. Used in ICT procurement by NSW, Victoria, Queensland state governments. Aligns with WCAG 2.2 AA.

### Enforcement Body

**Australian Human Rights Commission (AHRC)** — receives and investigates DDA complaints. Conciliation is the primary mechanism; unresolved complaints escalate to the **Federal Court of Australia**. Maximum penalty: AUD 100,000.

DTA enforces the Digital Experience Policy for government agencies only (via compliance reporting, not court action).

### Sector Scope

**DDA applies to both public and private sectors.** This is a key difference from EU WAD/EAA split:
- EU: WAD = public sector, EAA = private sector (two distinct enforcement regimes)
- AU: DDA covers both; AHRC is the single enforcement body for both sectors
- DTA's Digital Experience Policy = government only (not private sector)

### State/Territory Variations

- **Victoria**: WCAG 2.1 AA mandatory for all Victorian government digital services (internal and external)
- **NSW**: References AS EN 301 549 in ICT procurement
- **Queensland**: Agency policies reiterate WCAG 2.1 AA baseline
- All states/territories have accessibility commitments; no state-level equivalent of DDA (DDA is federal)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features an AU compliance tool must have. Missing = product is not usable for AU market.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| DDA (Disability Discrimination Act 1992) as mapped law | AU users expect DDA to appear as the legal basis in scan reports, just as DOS-lagen appears for SE users | LOW | Add to national-laws.json; framework key is `DDA` (not WAD/EAA) |
| AHRC as enforcement body | AU users expect the Australian Human Rights Commission to be named as enforcer, not a European body | LOW | Add `AU` entry to ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED |
| en-au locale statement template | Compliance statements must reference DDA, not WAD/EU Directive 2016/2102. Legal prose must be AU-appropriate. | MEDIUM | New JSON template for engine; new inline template for component; mirrors en-gb/en-us/en-ca pattern |
| .au and .com.au TLD detection | Sites on .com.au are clearly Australian; scanner must auto-detect country without requiring explicit --country flag | LOW | Extend TLD map; `.com.au` is a second-level TLD and needs special handling (not just last segment) |
| WCAG 2.2 AA as the stated standard in AU output | 2025 AHRC guidelines affirm WCAG 2.2 AA. Citing WCAG 2.0 or 2.1 in AU statements is outdated. | LOW | Template prose must specify WCAG 2.2 AA (or parameterized WCAG version field) |
| en-au UI chrome (component badges, labels, footer) | Component renders jurisdiction-specific chrome (law name, enforcement body) per locale; en-au must be wired in | LOW | Add en-au entries to locale-chrome.ts and relevant locale maps |
| Single enforcement body for all sectors (no WAD/EAA split) | DDA applies to public and private sectors equally — no sector-specific enforcement body switch for AU | LOW | `getEnforcementBody('AU', sector)` should return AHRC regardless of sector param |

### Differentiators (Competitive Advantage)

Features that set the product apart in the AU market. Not required by law, but provide meaningful value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AS EN 301 549 procurement reference in AU reports | State governments (NSW, Victoria, QLD) use AS EN 301 549 for ICT procurement; flagging this in reports helps procurement officers | MEDIUM | Add AS EN 301 549 as a secondary standard reference for AU, noting it is voluntary but procurement-relevant; maps to same WCAG 2.2 AA content as EU EN 301 549 |
| DTA Digital Experience Policy annotation for .gov.au domains | Federal government agencies face mandatory DTA compliance from 2025; annotating government scans with DTA policy reference adds actionable context competitors do not provide | MEDIUM | Detect .gov.au TLD as government sector; append DTA Digital Experience Policy note to government scan output. Requires special .gov.au TLD handling. |
| WCAG 2.2 AA call-out (vs 2.1) in AU context | 2025 AHRC guidelines updated from 2.0 to 2.2 AA; tools still citing 2.0 create compliance risk for users | LOW | In en-au template prose, explicitly state "WCAG 2.2 Level AA as recommended by the AHRC (April 2025 guidelines)" |
| AHRC complaint pathway guidance in statement | Unlike EU (formal enforcement body decisions), AU enforcement is complaint-driven via AHRC conciliation; statements should reference how users can lodge accessibility complaints with the AHRC | LOW | Add AHRC complaints URL (humanrights.gov.au) to en-au statement template feedback/contact section |
| State government procurement note (AS EN 301 549) | For NSW/Victoria/QLD government clients, noting AS EN 301 549:2024 adoption strengthens the procurement case for accessibility tooling investment | LOW | Conditional annotation in AU government reports; no new data structure needed |

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly NOT build for AU jurisdiction support.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| State/territory-level enforcement body switching | AU has 8 states/territories; users may expect Victoria vs NSW to route to different bodies | There is no state-level DDA equivalent. All DDA complaints go to AHRC regardless of state. Building state routing would be legally incorrect and confusing. | Use AHRC as the single AU enforcement body for all states. Add a note that state governments have their own accessibility policies but DDA enforcement remains federal. |
| WAD/EAA sector split for AU | The existing EU sector logic (WAD = public, EAA = private) is a natural template for AU | DDA has no equivalent split. Applying WAD/EAA framing to AU would misrepresent the legal structure and produce incorrect compliance statements. | `getEnforcementBody('AU', sector)` returns AHRC regardless of sector. DTA is government-only and is not a complaints enforcement body. |
| Mobile app scanning for AU compliance | AHRC 2025 guidelines extend DDA to mobile apps | Mobile app scanning requires a fundamentally different scanner architecture (native app inspection vs web page scanning). This is an architectural expansion, not a jurisdiction addition. | Note in en-au statement that WCAG 2.2 AA guidance applies to mobile apps under 2025 AHRC guidelines, but mobile scanning is out of scope for this milestone. |
| Hardcoded WCAG version in AU template | Lock template to "WCAG 2.2 AA" to match current AHRC guidance | WCAG versions evolve; EN 301 549 v4.1.1 (expected 2026) will update to WCAG 2.2 AA in EN 301 549 context. Hardcoding creates a maintenance burden. | Use a parameterized WCAG version field consistent with how other templates handle it, defaulting to "2.2 Level AA" for en-au. |
| Separate "DTA compliance" scan mode | DTA Digital Experience Policy is sometimes treated as a distinct compliance regime | DTA policy mandates WCAG 2.2 AA — the same standard as DDA. A separate mode would duplicate effort with no technical difference. | Annotate DTA policy in .gov.au output without creating a separate scan pipeline. |

---

## Feature Dependencies

```
AU-LAWS-1: Add DDA to national-laws.json in @holmdigital/standards
    └──required-by──> AU-ENFORCEMENT-1: Add AHRC to ENFORCEMENT_BODIES (needs Country type to include 'AU')
    └──required-by──> AU-TEMPLATE-1: en-au engine JSON statement template (references DDA law name)
    └──required-by──> AU-COMPONENT-1: en-au component inline template (references DDA law name)

AU-TLD-1: Extend TLD detection map with .au and .com.au
    └──independent (reads Country type, does not need new law data)
    └──note: .com.au is a second-level TLD — requires substring match, not simple last-segment split

AU-ENFORCEMENT-1: AHRC in ENFORCEMENT_BODIES_DETAILED
    └──required-by──> AU-TEMPLATE-1 (template references enforcement body name)
    └──required-by──> AU-COMPONENT-1 (component chrome uses enforcement body name)
    └──requires──> AU-LAWS-1 (Country type must include 'AU' before map entry is valid)

AU-SECTOR-1: Sector-aware enforcement wiring for AU (no WAD/EAA split)
    └──requires──> AU-ENFORCEMENT-1
    └──note: getEnforcementBody('AU', sector) must return AHRC for both 'public' and 'private'

AU-TEMPLATE-1: en-au engine JSON statement template
    └──requires──> AU-LAWS-1, AU-ENFORCEMENT-1
    └──parallel-with──> AU-COMPONENT-1 (both reference same law/enforcement data)

AU-COMPONENT-1: en-au component inline template + UI chrome
    └──requires──> AU-LAWS-1, AU-ENFORCEMENT-1
    └──parallel-with──> AU-TEMPLATE-1

AU-CHROME-1: en-au locale-chrome.ts entries (badges, labels, footer)
    └──requires──> AU-COMPONENT-1 (or simultaneous — same file edit)

AU-TESTS-1: Test coverage for all AU additions
    └──requires──> AU-LAWS-1, AU-ENFORCEMENT-1, AU-TLD-1, AU-TEMPLATE-1, AU-COMPONENT-1, AU-SECTOR-1

Build order constraint:
    @holmdigital/standards (AU-LAWS-1, AU-ENFORCEMENT-1) must build before
    @holmdigital/components (AU-COMPONENT-1, AU-CHROME-1) must build before
    @holmdigital/engine (AU-TEMPLATE-1, AU-TLD-1, AU-SECTOR-1)
```

### Dependency Notes

- **AU-LAWS-1 is the root dependency.** Country type must include 'AU' before enforcement body maps, TLD maps, or template wiring can reference it without TypeScript errors.
- **.com.au TLD requires non-trivial detection.** The existing pattern splits on the last segment of the hostname. `.com.au` has two suffix segments; detection logic must check for `.com.au` before falling back to `.au` split.
- **AU-SECTOR-1 is deliberately a no-op for sector switching.** The sector param is accepted but both values resolve to AHRC. This is correct behavior, not an omission.
- **DTA annotation (differentiator) depends on .gov.au TLD detection**, which is a special case of AU-TLD-1. Can be implemented in the same TLD extension pass.

---

## MVP Definition

### Launch With (v0.5 — this milestone)

Minimum features needed to call AU a "fully supported jurisdiction" in the same sense as UK, US, CA, and EU countries.

- [x] AU-LAWS-1 — DDA + DTA in national-laws.json. Without this, no AU-specific legal reference exists.
- [x] AU-ENFORCEMENT-1 — AHRC in ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED. Without this, enforcement body output is wrong.
- [x] AU-TLD-1 — .au and .com.au TLD detection. Without this, AU sites fall through to EU fallback.
- [x] AU-TEMPLATE-1 — en-au engine JSON statement template. Without this, engine generates a legally incorrect statement.
- [x] AU-COMPONENT-1 — en-au component inline template. Without this, component renders wrong jurisdiction data.
- [x] AU-CHROME-1 — en-au locale-chrome entries. Without this, badges/labels reference wrong law/body.
- [x] AU-SECTOR-1 — Sector wiring that routes both public and private to AHRC.
- [x] AU-TESTS-1 — Tests covering all new law data, TLD detection, enforcement routing, and template generation.

### Add After Validation (v0.5.x or v0.6)

- [ ] DTA Digital Experience Policy annotation for .gov.au domains — adds government-sector differentiation; trigger: government agency customers request it
- [ ] AS EN 301 549 procurement note in AU reports — adds value for state government procurement; trigger: NSW/VIC/QLD government clients
- [ ] AHRC complaint pathway URL in statement contact section — adds actionable guidance; trigger: user testing feedback

### Future Consideration (v1.0+)

- [ ] State-level government policy annotations (Victoria WCAG 2.1 AA mandate, NSW AS EN 301 549 procurement) — requires state detection beyond TLD (no state-specific TLDs exist); needs explicit metadata
- [ ] Mobile app compliance notes (AHRC 2025 scope expansion) — requires architectural work beyond this tool's web scanning scope
- [ ] WCAG 2.2 AA vs 2.1 AA delta highlighting for AU — useful as AHRC updates from 2.0 to 2.2 baseline; needs per-criterion version tagging

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| DDA in national-laws.json | HIGH | LOW | P1 |
| AHRC enforcement body | HIGH | LOW | P1 |
| .au / .com.au TLD detection | HIGH | LOW (with .com.au caveat) | P1 |
| en-au engine JSON template | HIGH | MEDIUM | P1 |
| en-au component inline template | HIGH | MEDIUM | P1 |
| en-au locale-chrome entries | HIGH | LOW | P1 |
| AU sector wiring (no split) | HIGH | LOW | P1 |
| Tests for all AU additions | HIGH | MEDIUM | P1 |
| DTA .gov.au annotation | MEDIUM | LOW | P2 |
| AS EN 301 549 procurement note | MEDIUM | LOW | P2 |
| AHRC complaint URL in statement | MEDIUM | LOW | P2 |
| State-level policy annotations | LOW | HIGH | P3 |
| Mobile app compliance notes | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v0.5 launch (AU jurisdiction is unusable without these)
- P2: Should have; add in v0.5.x when P1 is stable
- P3: Defer; requires architecture work or external research beyond this milestone

---

## Competitor Feature Analysis

| Feature | AccessibilityCheck.au (AU-local tool) | Siteimprove / Deque (global tools) | Our Approach |
|---------|---------------------------------------|------------------------------------|--------------|
| DDA law reference in reports | Yes — primary differentiator for AU tool | DDA listed as a supported standard | Named in legal context of each failing criterion |
| AHRC enforcement body reference | Unclear from public docs | Not jurisdiction-specific in report output | Explicit per-country enforcement body in statement and report |
| Sector-aware enforcement | No evidence of sector switching | No AU-specific sector logic found | AU gets AHRC for both sectors; EU retains WAD/EAA split |
| .com.au TLD auto-detection | N/A (AU-only tool, assumes AU context) | Not applicable (manual country selection) | Automatic via TLD map; .com.au needs two-segment check |
| WCAG version in AU context | WCAG 2.2 AA (matches 2025 AHRC guidance) | WCAG 2.2 AA | WCAG 2.2 AA explicitly in en-au template prose |
| Accessibility statement generation | Yes | Enterprise tier only | Included — en-au template with DDA + AHRC references |
| AS EN 301 549 reference for AU | Not found | Not AU-specific | P2 differentiator for procurement context |

---

## Sources

- [AHRC — Standards and Guidelines on Digital Accessibility](https://humanrights.gov.au/our-work/disability-rights/chapter-3-standards-and-guidelines-digital-accessibility) — HIGH confidence, official body
- [W3C WAI — Australia Policy](https://www.w3.org/WAI/policies/australia/) — HIGH confidence, authoritative policy index
- [DTA — Accessibility and Digital Service Standard](https://www.dta.gov.au/blogs/accessibility-and-digital-service-standard) — HIGH confidence, official government
- [digital.gov.au — Digital Service Standard](https://www.digital.gov.au/policy/digital-experience/digital-service-standard) — HIGH confidence, official
- [Deque — Three major accessibility updates in Australia in 2026](https://www.deque.com/blog/accessibility-updates-in-australia-in-2026/) — MEDIUM confidence, specialist analysis
- [Deque — The 2025 AHRC accessibility guidelines: What's new and why it matters](https://www.deque.com/blog/the-2025-ahrc-accessibility-guidelines-whats-new-and-why-it-matters/) — MEDIUM confidence
- [Intopia — EN 301 549: What it means for Australia](https://intopia.digital/articles/en-301-549-australia/) — MEDIUM confidence, AU accessibility specialists
- [Standards Australia — AS EN 301 549:2024](https://store.standards.org.au/product/AS-EN-301-549-2024) — HIGH confidence, official standards body
- [iconagency.com.au — Australian Government website accessibility in 2025](https://iconagency.com.au/news/2025-10-21-australian-government-website-accessibility-2025-dss-wcag-22-and-multilingual) — MEDIUM confidence
- [OZeWAI — Three major accessibility updates in Australia](https://ozewai.org/blog/standards/three-major-accessibility-updates-in-australia/) — MEDIUM confidence, AU accessibility community
- [vic.gov.au — Digital accessibility requirements](https://www.vic.gov.au/digital-accessibility-requirements) — HIGH confidence, official state government

---

*Feature research for: Australian jurisdiction support (v0.5 milestone)*
*Researched: 2026-03-27*
