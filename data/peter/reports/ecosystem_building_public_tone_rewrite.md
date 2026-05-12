# Ecosystem Building Public Tone Rewrite

This pass rewrote the hidden/noindex ecosystem building prototype pages so they read more like lightweight commercial location pages and less like internal QA records.

## Build And Scope

- Pages affected: 63 hidden/noindex prototype building pages
- Route remains: `/prototype/buildings/{STATE}/{city}/{address-slug}/`
- `noindex,follow` remains in place
- Sitemap entries added: 0
- Global navigation links added: 0
- Build command: `NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy`
- Build result: passed

## Markets Represented

| market | pages |
| --- | --- |
| Sarasota, FL | 7 |
| Pensacola, FL | 7 |
| Fort Wayne, IN | 7 |
| Grand Rapids, MI | 7 |
| Knoxville, TN | 7 |
| Chattanooga, TN | 7 |
| Baton Rouge, LA | 7 |
| Albuquerque, NM | 7 |
| Shreveport, LA | 7 |

## Sections Removed

- Internal QA page language
- Review status module
- Coordinate quality and duplicate risk pills
- QA checklist
- Source guardrails section
- Activation/review/pending language in visible page copy
- Historical activity count display

## Sections Renamed Or Reframed

- `Prototype Building Review` became `Building Area`.
- `Historical Commercial Signals` became `Commercial Profile`.
- `Nearby Representative Buildings` became `Nearby Buildings`.
- Sidebar now focuses on market exploration and related space types.
- Stats now show location, market, commercial profile, and space types instead of review mechanics.

## Before And After Examples

| area | before | after |
| --- | --- | --- |
| Hero eyebrow | Prototype Building Review | Building Area |
| Hero lead | Rofo has historical commercial activity associated with this address. | Commercial real estate near 3950 Central Sarasota Pkwy in Sarasota, FL. |
| Secondary hero copy | This page is a hidden review prototype for evaluating representative commercial building coverage. | Explore nearby buildings, related commercial space types, and the broader Sarasota business market. |
| Signals section | Historical Commercial Signals | Commercial Profile |
| Sidebar | QA Checklist / Source Guardrails / Review Status | Explore The Market / Related Space Types |

## Remaining Safety Language

- Pages still avoid pricing, suites, current availability claims, and stale broker copy.
- A short footnote remains: `This page is for market exploration and does not indicate current availability.`
- This keeps the page safe without explaining the data workflow.

## Pages Still Needing Suppression Or Review

| market | address | reason | url |
| --- | --- | --- | --- |
| Sarasota, FL | 1445 2nd St | Includes land/development-oriented commercial context | /prototype/buildings/FL/sarasota/1445-2nd-st/ |
| Sarasota, FL | 5940 McIntosh Rd | Includes land/development-oriented commercial context | /prototype/buildings/FL/sarasota/5940-mcintosh-rd/ |
| Pensacola, FL | 7171 N Davis Hwy | Includes land/development-oriented commercial context | /prototype/buildings/FL/pensacola/7171-n-davis-hwy/ |
| Baton Rouge, LA | 510 O'Neal Ln | Includes land/development-oriented commercial context | /prototype/buildings/LA/baton-rouge/510-o-neal-ln/ |
| Baton Rouge, LA | 11616 Industriplex Blvd | Includes land/development-oriented commercial context | /prototype/buildings/LA/baton-rouge/11616-industriplex-blvd/ |
| Albuquerque, NM | 10500 Copper Ave NE | Includes land/development-oriented commercial context | /prototype/buildings/NM/albuquerque/10500-copper-ave-ne/ |

## Remaining Weak Areas

- The pages are intentionally sparse and may need richer market-specific context before indexing.
- Some addresses may still be parcels, intersections, or non-building commercial properties and need manual address verification.
- Nearby building links currently point to other hidden prototype pages in the same batch, which is useful for review but should be reconsidered before public launch.
- The route itself contains `/prototype/`, which is acceptable while noindexed but should not be used for public launch URLs.

## Overall Readiness Assessment

The pages now read as lightweight commercial location references rather than internal QA records. They are suitable for hidden/noindex human review. They are not ready for indexing until address verification, duplicate checks, route strategy, and market-specific content review are complete.
