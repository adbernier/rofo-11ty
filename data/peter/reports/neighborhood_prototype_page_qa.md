# Neighborhood Prototype Page QA

## Summary

Reviewed the 60 hidden/noindex neighborhood prototype pages generated from:

- `data/peter/normalized/neighborhoods.hidden-page-data.json`
- `pages/commercial-real-estate/neighborhood.njk`
- `_site/commercial-real-estate/...`

These pages are correctly hidden from SEO launch paths:

- All reviewed pages include `noindex,follow`.
- No reviewed page URL appears in `_site/sitemap.xml`.
- No reviewed page URL appears in the global header navigation.

The prototype is useful for internal review, but the 60-page set is not ready for public linking or indexing as-is. The strongest pages are the ones with recognizable commercial district identity and building examples that match tenant search intent. The weakest pages are office park names, street-corridor labels, vague geographic labels, and pages whose building examples appear too broad for the named district.

## Counts

| QA bucket | Count |
| --- | ---: |
| Total pages reviewed | 60 |
| Pages with strong content | 25 |
| Pages needing manual review | 22 |
| Pages to suppress for now | 13 |
| Pages with no semantic chips | 38 |
| Pages with weak or awkward intro copy | 60 |
| Pages with too few representative buildings | 0 |
| Pages with duplicate-looking names | 6 |
| Pages with suspicious neighborhood/city pairing or label quality | 13 |
| Pages where building cards look mismatched or too broad | 18 |
| Pages that feel too thin for public launch | 38 |

## Overall Findings

### What Works

- The noindex prototype note is clear and protects against accidental public SEO assumptions.
- The page structure is scanable: hero, internal review note, overview, signals, buildings, space types, nearby neighborhoods, and broader market links.
- Representative building cards render on all 60 pages.
- The broader city and market guide links are useful and safe.
- The language avoids current availability, pricing, suite-level claims, and stale inventory framing.

### What Needs Work

- The intro copy is too generic and repeats the same internal-review phrasing on every page.
- Pages without semantic chips feel thin because the signal module becomes mostly metadata rather than useful market context.
- Some names are not neighborhood pages in a tenant-friendly sense, such as office parks or building complexes.
- Some proximity-based building matches are too broad. This is expected from centroid/radius assignment, but those pages need manual building curation before public use.
- The prototype note is helpful for internal review but too prominent for any public version. It should become an unobtrusive data note or be removed after editorial approval.

## City-Level Recommendations

## Austin, TX

### 5 Strongest Candidates

- North Burnet
- Congress Avenue Historic District
- East Cesar Chavez
- Warehouse District
- Bouldin

### Needs Manual Review

- Westover Hills
- North Crossing
- North Shoal Creek
- Allandale
- North Burnetâ€“Gateway

### Suppress For Now

- Spicewood Professional Plaza
- Spicewood Summit
- Stillhouse Springs
- The Austin Center
- Parkcrest Center

### Austin Notes

Austin has several useful candidates, but it also has many office park or asset-cluster labels. `North Burnetâ€“Gateway` has an encoding issue and should be normalized before public use. The office-park-style names should not become neighborhood pages unless they are intentionally reframed as business campuses or commercial districts.

## Denver, CO

### 5 Strongest Candidates

- LoDo
- Civic Center
- Capitol Hill
- Lincoln Park
- Jefferson Park

### Needs Manual Review

- City Park West
- Sun Valley
- Northwest

### Suppress For Now

- Northwest, unless reframed or replaced with a more specific district label

### Denver Notes

Denver has a smaller first-wave set but several recognizable districts. `Northwest` is too broad for a neighborhood page. `Sun Valley` may be useful for industrial or redevelopment context but needs careful building review.

## Oakland, CA

### 5 Strongest Candidates

- Jack London Square
- Old Oakland
- West Oakland
- Lake Merritt
- Chinatown

### Needs Manual Review

- McClymonds
- Northgate
- West Grand
- Prescott
- EastLake

### Suppress For Now

- Northgate - Waverly
- Oakland Ave - Harrison St
- Upper Mandela
- San Pablo

### Oakland Notes

Oakland is promising, especially for Jack London Square, Old Oakland, West Oakland, Lake Merritt, and Chinatown. However, several names are street corridors or compound labels rather than strong neighborhood page labels. The repeated `Waterfront context` chip across many Oakland pages is probably too broad and should be reviewed before public display.

## San Diego, CA

### 5 Strongest Candidates

- Mira Mesa
- Kearny Mesa
- Miramar
- University City
- Serra Mesa

### Needs Manual Review

- Fenton Carroll Canyon
- University Heights

### Suppress For Now

- None from this first-wave set, but `University Heights` should not launch until building matches are reviewed.

### San Diego Notes

San Diego has a good commercial geography set, especially for office, industrial, and flex/R&D style context. `University Heights` appears to pull representative buildings from the Mission Valley/Camino del Rio area, so the building cards need manual review.

## San Francisco, CA

### 5 Strongest Candidates

- Financial District
- Union Square
- Civic Center
- Hayes Valley
- Marina District

### Needs Manual Review

- Lower Nob Hill
- Nob Hill
- Japantown
- Tenderloin
- Chinatown
- Western Addition
- Russian Hill
- Pacific Heights

### Suppress For Now

- Hillside
- Deco Ghetto

### San Francisco Notes

San Francisco has strong recognizable names, but many pages currently lack semantic chips and therefore feel like generic geography shells. `Financial District` should eventually use the handcrafted prototype content strategy rather than this generic template alone. `Hillside` is vague, and `Deco Ghetto` feels outdated or unfamiliar enough to suppress until editorially validated.

## Cross-City QA Flags

### Pages With No Semantic Chips

38 pages have no semantic chips. This does not break the prototype, but those pages need stronger editorial context before public launch.

Most affected groups:

- All San Francisco first-wave pages
- All Denver first-wave pages
- Most Austin first-wave pages
- Several Oakland pages

### Weak Or Awkward Intro Copy

All 60 pages share the same intro pattern:

> Rofo is evaluating [Neighborhood] as part of its commercial geography layer...

This is appropriate for an internal prototype but too robotic for public launch. Public pages need neighborhood-specific introductions that explain why the district matters to tenants.

### Too Few Representative Buildings

No page had fewer than six representative building cards. The issue is quality and fit, not quantity.

### Duplicate-Looking Or Confusing Names

Flag for review:

- Northgate and Northgate - Waverly
- North Burnet and North Burnetâ€“Gateway
- Spicewood Professional Plaza, Spicewood Summit, and related Spicewood labels
- West Grand and West Oakland
- Chinatown appears in both Oakland and San Francisco, which is valid but requires city-specific copy

### Suspicious Neighborhood Or City Pairing

Flag for review or suppression:

- Spicewood Professional Plaza, Austin
- The Austin Center, Austin
- Parkcrest Center, Austin
- North Burnetâ€“Gateway, Austin because of encoding and label quality
- Hillside, San Francisco
- Deco Ghetto, San Francisco
- Oakland Ave - Harrison St, Oakland
- Northgate - Waverly, Oakland
- Upper Mandela, Oakland
- San Pablo, Oakland
- Northwest, Denver
- University Heights, San Diego because the building examples appear to skew toward Camino del Rio/Mission Valley

### Building Cards That Look Mismatched Or Too Broad

The most important mismatch pattern is proximity radius bleed. Examples:

- University Heights, San Diego shows Camino del Rio / Mission Valley style buildings.
- San Francisco neighborhood pages with 60 to 77 approximate buildings often pull from nearby dense downtown areas.
- Oakland corridor labels such as San Pablo, West Grand, and Upper Mandela reuse many downtown or West Oakland examples.
- Austin office-park names show building examples that may be better framed as campus or submarket context, not neighborhood pages.

These pages should use manually selected representative buildings before public launch.

### Pages That Feel Too Thin

Pages without semantic chips and without curated copy feel thin even when they have six building cards. The thinness is especially noticeable on:

- San Francisco pages other than Financial District, Union Square, Civic Center, Hayes Valley, and Marina District
- Denver pages without recognizable district-specific context
- Austin office-park-style pages

## Language Audit

### Too Salesy

No major salesy language found. The pages are restrained.

### Too Confident

The template is mostly careful. The phrase `Commercial Real Estate in [Neighborhood]` is acceptable as a title, but public copy should be careful when the candidate is actually an office park or corridor rather than a neighborhood.

### Too Robotic

High issue. The repeated phrasing makes every page feel generated:

- `Rofo is evaluating...`
- `This prototype uses legacy neighborhood data...`
- `These building links are approximate review matches...`

This is fine for internal review but not public launch.

### Too Vague

Moderate issue. The overview explains the data process more than tenant decision value. Public pages need to answer:

- What kind of business environment is this?
- Who should compare this area?
- What nearby districts are realistic alternatives?
- What building styles or commercial uses dominate?

### Too Much Like A Listing Site

Low issue. The copy avoids listing-style language. Building cards are present, but the page repeatedly says they are examples and approximate matches.

### Too Reliant On Current Availability

No issue found. The pages explicitly avoid live availability claims.

## UX Audit

### Heading Hierarchy

Generally clean. The H1 is clear, and section H2s are predictable. Public pages should use a less internal-facing H1 support line.

### Card Ordering

Good for internal QA. For public pages, put neighborhood identity and best-fit context ahead of metadata cards like approximate building count and geometry quality.

### Building Grid

The grid renders correctly and is useful. However, it needs manually curated buildings for public pages. Proximity alone creates questionable matches in dense markets.

### Semantic Chip Display

Works when signals exist. Pages without chips need alternative content, such as:

- business fit chips
- common space type chips
- nearby district comparisons
- building environment notes

### Related Space Type Links

Useful but potentially broad. Some links may point to valid city-level space-type pages even when the neighborhood candidate itself is weak. Keep this section, but make it quieter for public pages.

### Nearby Neighborhood Links

Useful for internal review. Public pages need curated nearby districts, not purely distance-based first-wave links.

### Broader Market Link

Works well. This is the safest internal link section and should remain in public versions.

### Mobile Layout

The generated HTML uses existing responsive city/neighborhood CSS. Static inspection did not show structural mobile blockers. Before public launch, check the prototype in a browser at mobile widths because the prototype note plus hero cards may make the first screen feel too internal-heavy.

## Template Improvement Recommendations

### Make Pages Useful Without Semantic Chips

Add fallback content that does not depend on semantic extraction:

- `Best fit for` chips based on curated neighborhood type
- `Common space types` based on representative building mix
- `Nearby areas to compare` with curated relationship labels
- Short district identity paragraph written or reviewed by editorial

### Improve Introductory Language

Replace the internal prototype intro with public-safe tenant language. Example direction:

> [Neighborhood] is one of the areas businesses compare when evaluating commercial space in [City]. Rofo uses building signals, local market context, and nearby district comparisons to help tenants understand whether the area fits their team, customers, and operating needs.

For noindex review pages, keep the prototype note, but move it below the hero or into a smaller sidebar note.

### Clarify Approximate Assignment Without Scaring Users

Current language is accurate but too prominent. For public pages, use a softer data note:

> Representative buildings are examples from Rofo's building data and may not reflect current availability.

Avoid repeatedly saying `approximate` in every section once the page has been manually reviewed.

### Strengthen Internal Review Usefulness

Add internal-only QA fields to the page or report, not the public copy:

- source radius
- matched building count
- match method
- confidence flags
- reviewed/suppress status

### Before Public Launch

Do not index any candidate until:

1. Name quality is approved.
2. Nearby neighborhoods are curated.
3. Representative buildings are manually reviewed.
4. The intro is rewritten for tenant usefulness.
5. The page has either semantic chips or a strong editorial fallback.
6. The prototype note is removed or moved into a small data note.
7. No current availability, pricing, suite, or live inventory claims are present.

## Recommended First Public Review Set

Start with 10 to 15 pages, not all 60:

### Highest Confidence First Pass

- Financial District, San Francisco
- Union Square, San Francisco
- Civic Center, San Francisco
- Hayes Valley, San Francisco
- Marina District, San Francisco
- Jack London Square, Oakland
- Old Oakland, Oakland
- West Oakland, Oakland
- Lake Merritt, Oakland
- Chinatown, Oakland

### Second Pass

- Mira Mesa, San Diego
- Kearny Mesa, San Diego
- Miramar, San Diego
- University City, San Diego
- LoDo, Denver
- North Burnet, Austin
- East Cesar Chavez, Austin
- Warehouse District, Austin

## Bottom Line

The hidden prototype is technically working and safe from indexing. It is not yet strong enough for broad public linking. Use it as an editorial QA surface, then promote a much smaller set with curated copy, manually reviewed representative buildings, and curated nearby-neighborhood relationships.
