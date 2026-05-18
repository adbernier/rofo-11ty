# Neighborhood Launch Allowlist Review

## Summary

Created a review-only launch allowlist draft for the first pilot markets using resolved neighborhood candidates and approximate same-city building proximity. This does not create routes, public pages, sitemap entries, or template changes.

Generated files:

- `data/peter/normalized/neighborhoods.launch-allowlist-draft.json`
- `data/peter/normalized/neighborhoods.first-wave-candidates.json`

## Building Sources Inspected

Best available current building source:

- `_data/buildings.js`: active Rofo building records with `building_path`, address, city, state, primary space type, source companies, and semantic source id where available.
- `data/peter/derived/building_signals.csv`: legacy building coordinates and activity fields used to attach lat/lng by normalized address, city, and state.
- `_data/semanticBuildingPreview.json`: limited low-risk semantic labels by active building path.
- `data/peter/derived/active_building_semantic_bridge.json`: inspected, but not used for broad signals because it contains address-fallback matches that are not production-safe enough for launch decisions.

Active building records loaded from `_data/buildings.js`: 4,173.
Active building records matched to `building_signals.csv` coordinates by normalized address/city/state: 3,751.
Active building records without coordinate match: 422.

All building-to-neighborhood counts in this report are approximate internal review signals. They are not boundary assignments and should not be described publicly as inventory or availability.

## Recommendation Counts

| Recommendation | Count |
| --- | ---: |
| Strong | 164 |
| Review | 90 |
| Suppress | 57 |
| Total reviewed neighborhoods | 311 |
| First-wave strong candidates selected | 60 |

## Counts By City

| City | State | Strong | Review | Suppress | Total |
| --- | --- | ---: | ---: | ---: | ---: |
| Oakland | CA | 31 | 11 | 13 | 55 |
| San Diego | CA | 28 | 23 | 21 | 72 |
| San Francisco | CA | 57 | 6 | 3 | 66 |
| Denver | CO | 26 | 22 | 15 | 63 |
| Austin | TX | 22 | 28 | 5 | 55 |

## Top Strongest Launch Candidates By City

### Oakland, CA

- Chinatown — 25 approximate buildings, types: office, industrial, coworking, retail
- Jack London Square — 25 approximate buildings, types: coworking, office, industrial, retail
- Lake Merritt — 25 approximate buildings, types: coworking, office, industrial, retail
- McClymonds — 25 approximate buildings, types: office, coworking, retail, industrial
- Northgate — 25 approximate buildings, types: office, coworking, industrial, retail
- Northgate - Waverly — 25 approximate buildings, types: office, coworking, industrial, retail
- Old Oakland — 25 approximate buildings, types: office, coworking, industrial, retail
- San Pablo — 25 approximate buildings, types: office, coworking, retail, industrial
- West Grand — 25 approximate buildings, types: office, retail, coworking, industrial
- West Oakland — 25 approximate buildings, types: retail, office, coworking, industrial

### San Diego, CA

- Mira Mesa — 18 approximate buildings, types: office, coworking, industrial, retail
- Fenton Carroll Canyon — 15 approximate buildings, types: industrial, office, coworking, retail
- Kearny Mesa — 14 approximate buildings, types: retail, industrial, office
- Serra Mesa — 13 approximate buildings, types: coworking, office, industrial, retail
- Miramar — 12 approximate buildings, types: industrial, retail, office, coworking
- University City — 12 approximate buildings, types: coworking, office, industrial
- University Heights — 10 approximate buildings, types: office, coworking
- Bankers Hill — 9 approximate buildings, types: retail, office, coworking
- Logan Heights — 9 approximate buildings, types: coworking, office, industrial, retail
- Cherokee Point — 8 approximate buildings, types: office, coworking

### San Francisco, CA

- Civic Center — 77 approximate buildings, types: office, retail, industrial, coworking
- Lower Nob Hill — 75 approximate buildings, types: office, retail, coworking, industrial
- Union Square — 74 approximate buildings, types: retail, office, coworking, industrial
- Hillside — 73 approximate buildings, types: retail, office, coworking, industrial
- Nob Hill — 73 approximate buildings, types: office, retail, coworking, industrial
- Japantown — 72 approximate buildings, types: retail, office, coworking, industrial
- Tenderloin — 72 approximate buildings, types: retail, office, coworking, industrial
- Hayes Valley — 70 approximate buildings, types: retail, office, industrial, coworking
- Chinatown — 68 approximate buildings, types: retail, office, coworking, industrial
- Western Addition — 67 approximate buildings, types: retail, office, industrial, coworking

### Denver, CO

- Civic Center — 15 approximate buildings, types: retail, coworking, office, industrial
- Lincoln Park — 15 approximate buildings, types: retail, coworking, office, industrial
- LoDo — 14 approximate buildings, types: office, coworking, retail, industrial
- Northwest — 13 approximate buildings, types: office, coworking, industrial, retail
- City Park West — 11 approximate buildings, types: office, coworking, retail, industrial
- Jefferson Park — 11 approximate buildings, types: office, industrial, coworking, retail
- Sun Valley — 11 approximate buildings, types: industrial, office, retail, coworking
- Capitol Hill — 10 approximate buildings, types: coworking, office, retail, industrial
- North Capitol Hill — 10 approximate buildings, types: office, coworking, retail, industrial
- West Colfax — 10 approximate buildings, types: industrial, office, retail, coworking

### Austin, TX

- Spicewood Professional Plaza — 25 approximate buildings, types: office
- Westover Hills — 25 approximate buildings, types: office, coworking
- North Crossing — 24 approximate buildings, types: office, coworking
- North Shoal Creek — 24 approximate buildings, types: office, coworking
- North Burnet — 23 approximate buildings, types: office, coworking
- Spicewood Summit — 21 approximate buildings, types: office
- Stillhouse Springs — 21 approximate buildings, types: office
- The Austin Center — 17 approximate buildings, types: office
- Congress Avenue Historic District — 13 approximate buildings, types: office, coworking
- North Burnetâ€“Gateway — 13 approximate buildings, types: office, coworking

## Neighborhoods With Duplicate Slug Conflicts

- None in the launch review subset.

## Neighborhoods With Suspicious Radius Values

- Caballo Hills, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; no nearby active building matches in current Rofo building data; legacy_radius_capped_to_2_miles_for_review
- Chinatown, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- City Center, Oakland, CA: source radius `5.0`, notes: vague or generic neighborhood label; legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Claremont, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; no nearby active building matches in current Rofo building data; legacy_radius_capped_to_2_miles_for_review
- Clawson, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Coliseum Industrial, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Dimond, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Downtown, Oakland, CA: source radius `5.0`, notes: vague or generic neighborhood label; legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Downtown Oakland, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- East Oakland, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- EastLake, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Fruitvale, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Fruitvale Station, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Glenview, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Golden Gate, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Grand Avenue, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Grand Lake, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Hegenberger Corridor, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- High Streen Corridor, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Highland, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Ivy Hill, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Jack London Square, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Jingletown, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Lake Merritt, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Lakeshore, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Lakeside, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Laurel, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Lincoln Highlands, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- McClymonds, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Montclair, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; no nearby active building matches in current Rofo building data; legacy_radius_capped_to_2_miles_for_review
- North Hills, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; no nearby active building matches in current Rofo building data; legacy_radius_capped_to_2_miles_for_review
- North Oakland, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Northgate, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Northgate - Waverly, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Oakland Ave - Harrison St, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Old Oakland, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Piedmont Avenue, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Pill Hill, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Prescott, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Redwood Heights, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Rockridge, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; no nearby active building matches in current Rofo building data; legacy_radius_capped_to_2_miles_for_review
- San Pablo, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Sequoyah, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; no nearby active building matches in current Rofo building data; legacy_radius_capped_to_2_miles_for_review
- South Hills, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; no nearby active building matches in current Rofo building data; legacy_radius_capped_to_2_miles_for_review
- South Kennedy Tract, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; low nearby active building count; legacy_radius_capped_to_2_miles_for_review
- Temescal, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- Upper Mandela, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- West Grand, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- West Oakland, Oakland, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review
- 4S Ranch, San Diego, CA: source radius `5.0`, notes: legacy default radius likely broad; legacy_radius_capped_to_2_miles_for_review

## Neighborhoods With Zero Or Low Approximate Building Counts

- Anderson Mill West, Austin, TX: 0 approximate buildings, recommendation `suppress`
- Johnston Terrace, Austin, TX: 0 approximate buildings, recommendation `suppress`
- Mountain View, Austin, TX: 0 approximate buildings, recommendation `suppress`
- Pierson Business Center, Austin, TX: 0 approximate buildings, recommendation `suppress`
- St. Tropez, Austin, TX: 0 approximate buildings, recommendation `suppress`
- Anderson Mills East, Austin, TX: 1 approximate buildings, recommendation `review`
- Berkley Square - Headway, Austin, TX: 1 approximate buildings, recommendation `review`
- Heritage Hills, Austin, TX: 1 approximate buildings, recommendation `review`
- Hill Country Galleria, Austin, TX: 1 approximate buildings, recommendation `review`
- Shenandoah, Austin, TX: 1 approximate buildings, recommendation `review`
- South Lamar, Austin, TX: 1 approximate buildings, recommendation `review`
- Tech Ridge Center, Austin, TX: 1 approximate buildings, recommendation `review`
- Twenty Two Twenty Two Business Park, Austin, TX: 1 approximate buildings, recommendation `review`
- Village At Anderson Mill, Austin, TX: 1 approximate buildings, recommendation `review`
- Walden Park At Lakeline, Austin, TX: 1 approximate buildings, recommendation `review`
- Windsor Hills, Austin, TX: 1 approximate buildings, recommendation `review`
- Galindo, Austin, TX: 2 approximate buildings, recommendation `review`
- North Loop, Austin, TX: 2 approximate buildings, recommendation `review`
- Parker Lane, Austin, TX: 2 approximate buildings, recommendation `review`
- South Austin, Austin, TX: 2 approximate buildings, recommendation `review`
- Southeast Austin, Austin, TX: 2 approximate buildings, recommendation `review`
- St. Edwards, Austin, TX: 2 approximate buildings, recommendation `review`
- Walnut Forest, Austin, TX: 2 approximate buildings, recommendation `review`
- East Congress, Austin, TX: 3 approximate buildings, recommendation `review`
- East Oak Hill, Austin, TX: 3 approximate buildings, recommendation `review`
- Hermosa Office Park, Austin, TX: 3 approximate buildings, recommendation `review`
- Oak Forest, Austin, TX: 3 approximate buildings, recommendation `review`
- Old Tarlton Center, Austin, TX: 3 approximate buildings, recommendation `review`
- Knollwood, Austin, TX: 4 approximate buildings, recommendation `review`
- North Star, Austin, TX: 4 approximate buildings, recommendation `review`
- The Courtyard, Austin, TX: 4 approximate buildings, recommendation `review`
- Westlake Medical Center, Austin, TX: 4 approximate buildings, recommendation `review`
- Wildwood, Austin, TX: 4 approximate buildings, recommendation `review`
- Bear Valley, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Eiber, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Greater East End, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Green Valley Ranch, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Greenbriar - Cloverdale, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Lowry, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Mar Lee, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Morse Park, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Northwest Denver, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Platt Park, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Rosedale, Denver, CO: 0 approximate buildings, recommendation `suppress`
- South, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Southwest, Denver, CO: 0 approximate buildings, recommendation `suppress`
- University, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Westwood, Denver, CO: 0 approximate buildings, recommendation `suppress`
- Berkeley, Denver, CO: 1 approximate buildings, recommendation `review`
- Dayton Triangle, Denver, CO: 1 approximate buildings, recommendation `review`
- East Colfax, Denver, CO: 1 approximate buildings, recommendation `review`
- Montclair, Denver, CO: 1 approximate buildings, recommendation `review`
- Virginia Village, Denver, CO: 1 approximate buildings, recommendation `review`
- Windsor, Denver, CO: 1 approximate buildings, recommendation `review`
- Baker, Denver, CO: 2 approximate buildings, recommendation `review`
- Sunnyside, Denver, CO: 2 approximate buildings, recommendation `review`
- Washington Virginia Vale, Denver, CO: 2 approximate buildings, recommendation `review`
- Congress Park, Denver, CO: 3 approximate buildings, recommendation `review`
- East, Denver, CO: 3 approximate buildings, recommendation `review`
- Hale, Denver, CO: 3 approximate buildings, recommendation `review`
- Hilltop, Denver, CO: 3 approximate buildings, recommendation `review`
- Southeast Denver, Denver, CO: 3 approximate buildings, recommendation `review`
- City Park, Denver, CO: 4 approximate buildings, recommendation `review`
- Denver Tech Center, Denver, CO: 4 approximate buildings, recommendation `review`
- Northeast Park Hill, Denver, CO: 4 approximate buildings, recommendation `review`
- River North Art District, Denver, CO: 4 approximate buildings, recommendation `review`
- 23rd Avenue, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Caballo Hills, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Claremont, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Eastmont, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Elmhurst, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Foothill Square, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Foothill and Seminary, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Montclair, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- North Hills, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Rockridge, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- San Antonio, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Sequoyah, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- South Hills, Oakland, CA: 0 approximate buildings, recommendation `suppress`
- Dimond, Oakland, CA: 1 approximate buildings, recommendation `review`

## Examples Of Approximate Building Assignments

### Chinatown, Oakland, CA

Approximate building count: 25

- 1111 Broadway — 1111 Broadway — office — 0.509 km — `/commercial-real-estate/building/CA/oakland/1111-broadway/`
- 1300 Broadway — 1300 Broadway — office — 0.522 km — `/commercial-real-estate/building/CA/oakland/1300-broadway/`
- 1221 Broadway — 1221 Broadway — office — 0.535 km — `/commercial-real-estate/building/CA/oakland/1221-broadway/`
- 1333 Broadway — 1333 Broadway — office — 0.59 km — `/commercial-real-estate/building/CA/oakland/1333-broadway/`
- 230 Madison St — 230 Madison St — industrial — 0.612 km — `/commercial-real-estate/building/CA/oakland/230-madison-st/`

### City Center, Oakland, CA

Approximate building count: 25

- 1800 Peralta St — 1800 Peralta St — office — 0.444 km — `/commercial-real-estate/building/CA/oakland/1800-peralta-st/`
- 1410 7th St — 1410 7th St — retail — 0.592 km — `/commercial-real-estate/building/CA/oakland/1410-7th-st/`
- 1440 7th St — 1440 7th St — retail — 0.649 km — `/commercial-real-estate/building/CA/oakland/1440-7th-st/`
- 610 16th St — 610 16th St — office — 1.484 km — `/commercial-real-estate/building/CA/oakland/610-16th-st/`
- 1300 Clay St — 1300 Clay St — office — 1.644 km — `/commercial-real-estate/building/CA/oakland/1300-clay-st/`

### Clawson, Oakland, CA

Approximate building count: 23

- 1800 Peralta St — 1800 Peralta St — office — 1.122 km — `/commercial-real-estate/building/CA/oakland/1800-peralta-st/`
- 1410 7th St — 1410 7th St — retail — 2.11 km — `/commercial-real-estate/building/CA/oakland/1410-7th-st/`
- 1440 7th St — 1440 7th St — retail — 2.157 km — `/commercial-real-estate/building/CA/oakland/1440-7th-st/`
- 610 16th St — 610 16th St — office — 2.159 km — `/commercial-real-estate/building/CA/oakland/610-16th-st/`
- 2335 Broadway — 2335 Broadway — office — 2.201 km — `/commercial-real-estate/building/CA/oakland/2335-broadway/`

### Coliseum Industrial, Oakland, CA

Approximate building count: 4

- 5441 International Blvd — 5441 International Blvd — industrial — 1.377 km — `/commercial-real-estate/building/CA/oakland/5441-international-blvd/`
- Exotic Hardwood — 1154 57th Ave — industrial — 1.451 km — `/commercial-real-estate/building/CA/oakland/1154-57th-ave/`
- 711 Independent Rd — 711 Independent Rd — industrial — 1.458 km — `/commercial-real-estate/building/CA/oakland/711-independent-rd/`
- 700 Independent Rd — 700 Independent Rd — industrial — 1.588 km — `/commercial-real-estate/building/CA/oakland/700-independent-rd/`

### Dimond, Oakland, CA

Approximate building count: 1

- DaVita — 3810 MacArthur Blvd — retail — 1.144 km — `/commercial-real-estate/building/CA/oakland/3810-macarthur-blvd/`

### Downtown, Oakland, CA

Approximate building count: 25

- 610 16th St — 610 16th St — office — 0.224 km — `/commercial-real-estate/building/CA/oakland/610-16th-st/`
- 300 Frank H Ogawa Plz — 300 Frank H Ogawa Plz — office — 0.251 km — `/commercial-real-estate/building/CA/oakland/300-frank-h-ogawa-plz/`
- 1970 Broadway — 1970 Broadway — office — 0.336 km — `/commercial-real-estate/building/CA/oakland/1970-broadway/`
- 415 20th St — 415 20th St — office — 0.353 km — `/commercial-real-estate/building/CA/oakland/415-20th-st/`
- 1440 Broadway — 1440 Broadway — office — 0.375 km — `/commercial-real-estate/building/CA/oakland/1440-broadway/`

### Downtown Oakland, Oakland, CA

Approximate building count: 5

- 5441 International Blvd — 5441 International Blvd — industrial — 1.881 km — `/commercial-real-estate/building/CA/oakland/5441-international-blvd/`
- Exotic Hardwood — 1154 57th Ave — industrial — 2.127 km — `/commercial-real-estate/building/CA/oakland/1154-57th-ave/`
- DaVita — 3810 MacArthur Blvd — retail — 2.3 km — `/commercial-real-estate/building/CA/oakland/3810-macarthur-blvd/`
- 711 Independent Rd — 711 Independent Rd — industrial — 2.651 km — `/commercial-real-estate/building/CA/oakland/711-independent-rd/`
- 700 Independent Rd — 700 Independent Rd — industrial — 2.757 km — `/commercial-real-estate/building/CA/oakland/700-independent-rd/`

### East Oakland, Oakland, CA

Approximate building count: 5

- 5441 International Blvd — 5441 International Blvd — industrial — 1.631 km — `/commercial-real-estate/building/CA/oakland/5441-international-blvd/`
- Exotic Hardwood — 1154 57th Ave — industrial — 1.711 km — `/commercial-real-estate/building/CA/oakland/1154-57th-ave/`
- DaVita — 3810 MacArthur Blvd — retail — 2.011 km — `/commercial-real-estate/building/CA/oakland/3810-macarthur-blvd/`
- 700 Independent Rd — 700 Independent Rd — industrial — 2.311 km — `/commercial-real-estate/building/CA/oakland/700-independent-rd/`
- 711 Independent Rd — 711 Independent Rd — industrial — 2.319 km — `/commercial-real-estate/building/CA/oakland/711-independent-rd/`

### EastLake, Oakland, CA

Approximate building count: 22

- 230 Madison St — 230 Madison St — industrial — 1.932 km — `/commercial-real-estate/building/CA/oakland/230-madison-st/`
- 105 2nd St — 105 2nd St — industrial — 1.945 km — `/commercial-real-estate/building/CA/oakland/105-2nd-st/`
- Lake Merritt — 1901 Harrison St — office — 1.993 km — `/commercial-real-estate/building/CA/oakland/1901-harrison-st/`
- 1 Kaiser Plz — 1 Kaiser Plz — office — 2.11 km — `/commercial-real-estate/building/CA/oakland/1-kaiser-plz/`
- 1814 Franklin St — 1814 Franklin St — office — 2.139 km — `/commercial-real-estate/building/CA/oakland/1814-franklin-st/`

### Fruitvale, Oakland, CA

Approximate building count: 5

- 5441 International Blvd — 5441 International Blvd — industrial — 1.599 km — `/commercial-real-estate/building/CA/oakland/5441-international-blvd/`
- Exotic Hardwood — 1154 57th Ave — industrial — 1.814 km — `/commercial-real-estate/building/CA/oakland/1154-57th-ave/`
- 711 Independent Rd — 711 Independent Rd — industrial — 2.203 km — `/commercial-real-estate/building/CA/oakland/711-independent-rd/`
- 700 Independent Rd — 700 Independent Rd — industrial — 2.323 km — `/commercial-real-estate/building/CA/oakland/700-independent-rd/`
- DaVita — 3810 MacArthur Blvd — retail — 2.911 km — `/commercial-real-estate/building/CA/oakland/3810-macarthur-blvd/`

### Fruitvale Station, Oakland, CA

Approximate building count: 5

- 5441 International Blvd — 5441 International Blvd — industrial — 2.011 km — `/commercial-real-estate/building/CA/oakland/5441-international-blvd/`
- Exotic Hardwood — 1154 57th Ave — industrial — 2.237 km — `/commercial-real-estate/building/CA/oakland/1154-57th-ave/`
- 711 Independent Rd — 711 Independent Rd — industrial — 2.648 km — `/commercial-real-estate/building/CA/oakland/711-independent-rd/`
- 700 Independent Rd — 700 Independent Rd — industrial — 2.767 km — `/commercial-real-estate/building/CA/oakland/700-independent-rd/`
- DaVita — 3810 MacArthur Blvd — retail — 2.84 km — `/commercial-real-estate/building/CA/oakland/3810-macarthur-blvd/`

### Glenview, Oakland, CA

Approximate building count: 1

- DaVita — 3810 MacArthur Blvd — retail — 2.87 km — `/commercial-real-estate/building/CA/oakland/3810-macarthur-blvd/`


## Recommendation For First Public Launch Size

Use the `neighborhoods.first-wave-candidates.json` file as the first editorial review pool, not as an automatic launch list. It is capped at 60 total and 15 per city, with only `launch_recommendation = strong` records.

For actual public rollout, start smaller than the file cap:

- 5 to 10 San Francisco neighborhoods
- 5 to 10 Oakland neighborhoods
- 3 to 5 each in San Diego, Austin, and Denver after copy review

Prioritize neighborhoods with clear commercial identity, useful tenant decision context, and enough representative building links to support a real page.

## Recommendation Section

Are we ready to build hidden/noindex neighborhood prototype pages?

Yes, for a limited hidden/noindex prototype set. The data is sufficient for prototype pages when backed by editorial review, cautious copy, and no live-inventory claims. It is not ready for broad indexable rollout.

Which neighborhoods should launch first?

Use first-wave candidates with the highest approximate building counts and clean commercial identity. San Francisco and Oakland should remain the editorial pilots because they already have Bay Area district strategy work. Strong candidates in San Diego, Austin, and Denver should be reviewed for name quality before page work.

Should building links be added only for first-wave neighborhoods?

Yes. Add representative building links only for first-wave neighborhoods after manual review. Do not bulk-add building links based purely on centroid/radius assignment.

What data quality rules should block public indexing?

Block indexing when any of these are true:

1. Missing or invalid centroid.
2. Duplicate same-city neighborhood slug.
3. Bad, misspelled, or non-neighborhood label.
4. No representative building links after manual review.
5. No editorial description beyond legacy SEO text.
6. Geometry is malformed and there is no valid centroid.
7. The page depends on live availability, suite, pricing, or stale listing claims.
8. City/state resolution is unresolved or low confidence.

Building assignment should initially be manual allowlist-based. Centroid/radius matching is useful for internal review, but public page content should not imply authoritative boundaries until true reviewed polygons are sourced.
