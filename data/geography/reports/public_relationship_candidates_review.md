# Public Relationship Candidates Review V1

Date: 2026-05-21

Input:

- `data/geography/relationships.enriched.json`

Output:

- `data/geography/public_relationship_candidates.json`

## Summary

This review filters Relationship Validation V1 to relationships marked `promotion_status: "candidate_public"` and adds a conservative public-use review layer. Nothing is promoted into public templates or live page behavior.

The recommendations are intentionally restrained. A geography relationship can be strong enough for review without being strong enough for public comparison copy. Raw corpus support is still marked `not_evaluated`, so commercial meaning should not be invented from geographic nearness alone.

## Counts

| Metric | Count |
| --- | ---: |
| Candidate-public relationships reviewed | 1304 |
| Strong candidate | 234 |
| Nearby only | 820 |
| Comparison candidate | 28 |
| Needs editorial review | 222 |

## Count By State

| State | Count |
| --- | --- |
| CA | 1202 |
| WA | 22 |
| AZ | 12 |
| MA | 10 |
| OR | 10 |
| TX | 10 |
| CO | 8 |
| FL | 8 |
| CT | 6 |
| NV | 6 |
| VA | 6 |
| NJ | 2 |
| PA | 2 |


## Top Metro / Market Buckets

| Bucket | Count |
| --- | --- |
| legacy-region:8 | 461 |
| legacy-region:7 | 144 |
| legacy-region:2 | 127 |
| legacy-region:11 | 110 |
| legacy-region:9 | 81 |
| legacy-region:3 | 76 |
| legacy-region:4 | 74 |
| legacy-region:5 | 49 |
| legacy-region:10 | 42 |
| legacy-region:6 | 36 |
| state:WA | 22 |
| state:AZ | 12 |
| state:MA | 10 |
| state:OR | 10 |
| state:TX | 10 |
| state:CO | 8 |
| state:FL | 8 |
| state:CT | 6 |
| state:NV | 6 |
| state:VA | 6 |


## Source Node Types

| Source node type | Count |
| --- | --- |
| city | 1304 |


## Relationship Types

| Relationship type | Count |
| --- | --- |
| nearby_to | 1304 |


## Strong Candidate Examples

| Source | Target | State | Distance | Score | Label suggestion |
| --- | --- | --- | --- | --- | --- |
| Upland | Rancho Cucamonga | CA | 2.3 | 90 | Rancho Cucamonga near Upland |
| Rancho Cucamonga | Upland | CA | 2.3 | 90 | Upland near Rancho Cucamonga |
| Costa Mesa | Newport Beach | CA | 2.3 | 90 | Newport Beach near Costa Mesa |
| Newport Beach | Costa Mesa | CA | 2.3 | 90 | Costa Mesa near Newport Beach |
| Fullerton | Anaheim | CA | 2.5 | 90 | Anaheim near Fullerton |
| Anaheim | Fullerton | CA | 2.5 | 90 | Fullerton near Anaheim |
| Rancho Santa Margarita | Mission Viejo | CA | 2.6 | 90 | Mission Viejo near Rancho Santa Margarita |
| Mission Viejo | Rancho Santa Margarita | CA | 2.6 | 90 | Rancho Santa Margarita near Mission Viejo |
| Orange | Santa Ana | CA | 3.1 | 90 | Santa Ana near Orange |
| Santa Ana | Orange | CA | 3.1 | 90 | Orange near Santa Ana |
| Mountain View | Sunnyvale | CA | 3.1 | 90 | Sunnyvale near Mountain View |
| Sunnyvale | Mountain View | CA | 3.1 | 90 | Mountain View near Sunnyvale |
| Tustin | Santa Ana | CA | 3.2 | 90 | Santa Ana near Tustin |
| Santa Ana | Tustin | CA | 3.2 | 90 | Tustin near Santa Ana |
| San Jacinto | Hemet | CA | 3.4 | 90 | Hemet near San Jacinto |
| Hemet | San Jacinto | CA | 3.4 | 90 | San Jacinto near Hemet |
| Tustin | Orange | CA | 3.6 | 90 | Orange near Tustin |
| Orange | Tustin | CA | 3.6 | 90 | Tustin near Orange |
| Santa Clara | Sunnyvale | CA | 3.8 | 90 | Sunnyvale near Santa Clara |
| Sunnyvale | Santa Clara | CA | 3.8 | 90 | Santa Clara near Sunnyvale |


## Nearby-Only Examples

| Source | Target | State | Distance | Label suggestion |
| --- | --- | --- | --- | --- |
| El Sobrante | Pinole | CA | 1 | Nearby: Pinole |
| South Gate | Lynwood | CA | 1 | Nearby: Lynwood |
| Lynwood | South Gate | CA | 1 | Nearby: South Gate |
| Pinole | El Sobrante | CA | 1 | Nearby: El Sobrante |
| Kentfield | Larkspur | CA | 1.2 | Nearby: Larkspur |
| Larkspur | Kentfield | CA | 1.2 | Nearby: Kentfield |
| Sausalito | Marin City | CA | 1.2 | Nearby: Marin City |
| Marin City | Sausalito | CA | 1.2 | Nearby: Sausalito |
| Fairfax | San Anselmo | CA | 1.3 | Nearby: San Anselmo |
| San Anselmo | Fairfax | CA | 1.3 | Nearby: Fairfax |
| Corte Madera | Larkspur | CA | 1.4 | Nearby: Larkspur |
| Larkspur | Corte Madera | CA | 1.4 | Nearby: Corte Madera |
| Tiburon | Belvedere | CA | 1.5 | Nearby: Belvedere |
| Belvedere | Tiburon | CA | 1.5 | Nearby: Tiburon |
| Laguna Woods | Lake Forest | CA | 1.5 | Nearby: Lake Forest |
| Pico Rivera | Montebello | CA | 1.5 | Nearby: Montebello |
| Lake Forest | Laguna Woods | CA | 1.5 | Nearby: Laguna Woods |
| Montebello | Pico Rivera | CA | 1.5 | Nearby: Pico Rivera |
| Sierra Madre | Arcadia | CA | 1.6 | Nearby: Arcadia |
| Hermosa Beach | Manhattan Beach | CA | 1.6 | Nearby: Manhattan Beach |


## Needs Editorial Review Examples

| Source | Target | State | Distance | Reason |
| --- | --- | --- | --- | --- |
| Tracy | Manteca | CA | 12.1 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:6 bucket. 12.1 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Manteca | Tracy | CA | 12.1 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:6 bucket. 12.1 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Turlock | Modesto | CA | 12.3 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:6 bucket. 12.3 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Modesto | Turlock | CA | 12.3 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:6 bucket. 12.3 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Thousand Oaks | Calabasas | CA | 12.5 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 12.5 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Calabasas | Thousand Oaks | CA | 12.5 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 12.5 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Sebastopol | Bodega Bay | CA | 12.8 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:3 bucket. 12.8 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Bodega Bay | Sebastopol | CA | 12.8 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:3 bucket. 12.8 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Ventura | Camarillo | CA | 13.2 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 13.2 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Camarillo | Ventura | CA | 13.2 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 13.2 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Westlake Village | Camarillo | CA | 13.4 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 13.4 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Camarillo | Westlake Village | CA | 13.4 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 13.4 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Palm Springs | Indian Wells | CA | 13.5 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 13.5 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Indian Wells | Palm Springs | CA | 13.5 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:8 bucket. 13.5 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Solana Beach | Poway | CA | 13.5 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:9 bucket. 13.5 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Poway | Solana Beach | CA | 13.5 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:9 bucket. 13.5 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Monterey | Salinas | CA | 13.8 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:4 bucket. 13.8 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Salinas | Monterey | CA | 13.8 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:4 bucket. 13.8 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Del Mar | Poway | CA | 14.1 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:9 bucket. 14.1 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |
| Poway | Del Mar | CA | 14.1 | Legacy nearby relationship validated for geography signals only. Reciprocal in legacy nearby graph. Shares legacy-region:9 bucket. 14.1 miles between city centers. Do not use publicly without stronger market or editorial support. Raw corpus support not evaluated. |


## Suspicious Or Weird Relationships

| Relationship | Source | Target | Source state | Target state | Distance | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| legacy-nearby-city:247:249:1 | Shafter | Tehachapi | CA | CA | 48.2 | comparison_candidate |
| legacy-nearby-city:249:247:4 | Tehachapi | Shafter | CA | CA | 48.2 | comparison_candidate |
| legacy-nearby-city:375:389:3 | La Palma | Cypress | CA | CA | 2 | needs_editorial_review |
| legacy-nearby-city:389:375:2 | Cypress | La Palma | CA | CA | 2 | needs_editorial_review |
| legacy-nearby-city:132:134:1 | Vallejo | American Canyon | CA | CA | 2.3 | needs_editorial_review |
| legacy-nearby-city:134:132:7 | American Canyon | Vallejo | CA | CA | 2.3 | needs_editorial_review |
| legacy-nearby-city:29133:29143:3 | Kirkland | Redmond | WA | WA | 2.9 | needs_editorial_review |
| legacy-nearby-city:29143:29133:1 | Redmond | Kirkland | WA | WA | 2.9 | needs_editorial_review |
| legacy-nearby-city:29122:29151:5 | Bothell | Woodinville | WA | WA | 3 | needs_editorial_review |
| legacy-nearby-city:29151:29122:1 | Woodinville | Bothell | WA | WA | 3 | needs_editorial_review |
| legacy-nearby-city:288:337:1 | Salida | Ripon | CA | CA | 3.1 | needs_editorial_review |
| legacy-nearby-city:337:288:1 | Ripon | Salida | CA | CA | 3.1 | needs_editorial_review |
| legacy-nearby-city:389:390:3 | Cypress | Buena Park | CA | CA | 3.1 | needs_editorial_review |
| legacy-nearby-city:390:389:2 | Buena Park | Cypress | CA | CA | 3.1 | needs_editorial_review |
| legacy-nearby-city:2653:2663:1 | Boston | Cambridge | MA | MA | 3.3 | needs_editorial_review |
| legacy-nearby-city:2663:2653:1 | Cambridge | Boston | MA | MA | 3.3 | needs_editorial_review |
| legacy-nearby-city:6673:6675:4 | Arlington | Alexandria | VA | VA | 3.8 | needs_editorial_review |
| legacy-nearby-city:6675:6673:6 | Alexandria | Arlington | VA | VA | 3.8 | needs_editorial_review |
| legacy-nearby-city:29915:29922:2 | Plantation | Sunrise | FL | FL | 3.9 | needs_editorial_review |
| legacy-nearby-city:29922:29915:3 | Sunrise | Plantation | FL | FL | 3.9 | needs_editorial_review |


## Interpretation Notes

- `strong_candidate` means the relationship is a strong geography candidate for internal linking or nearby-market review, not automatic public copy.
- `nearby_only` should be used only for geographic nearness unless editorial review adds a commercial rationale.
- `comparison_candidate` is the best raw material for future comparison modules, but it still needs district or market-level interpretation.
- `needs_editorial_review` should stay out of public surfaces until a human can explain why the relationship matters.

## Recommended Next Step

Run a region-specific editorial pass for priority geography clusters, starting with Bay Area, Atlanta, Southern California, Texas, Phoenix, Seattle/Bellevue, and South Florida. For each relationship considered for public use, add a short rationale such as access pattern, tenant fit, built form, commercial identity, transit/freeway connection, or nearby district alternative logic.

Do not use these candidates as generic “nearby listings” infrastructure. The value is commercial geography interpretation and disciplined internal linking, not inventory quantity.
