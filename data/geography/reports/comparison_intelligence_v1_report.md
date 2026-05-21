# Comparison Intelligence V1 Report

Date: 2026-05-21

Output directory:

- `generated/geography/comparison-intelligence/`

Inputs:

- `data/geography/public_relationship_candidates.json`
- `data/geography/relationships.enriched.json`
- `data/geography/nodes.json`
- `data/geography/aliases.json`

## Summary

Comparison Intelligence V1 generated calm, editorial geography comparison records for relationships marked `strong_candidate` or `comparison_candidate`.

These records are not connected to public templates. They are review artifacts for future SEO, internal-linking, nearby-market, and district-comparison workflows.

## Counts

| Metric | Count |
| --- | ---: |
| Generated comparison records | 262 |
| Strong candidate inputs | 234 |
| Comparison candidate inputs | 28 |

## Count By Recommendation

| Recommendation | Count |
| --- | --- |
| strong_candidate | 234 |
| comparison_candidate | 28 |


## Count By State

| State | Count |
| --- | --- |
| CA | 262 |


## Generated Record Examples

| Source | Target | Recommendation | Distance | File |
| --- | --- | --- | --- | --- |
| Upland | Rancho Cucamonga | strong_candidate | 2.3 | upland__rancho-cucamonga__legacy-nearby-city-453-455-2.json |
| Rancho Cucamonga | Upland | strong_candidate | 2.3 | rancho-cucamonga__upland__legacy-nearby-city-455-453-2.json |
| Costa Mesa | Newport Beach | strong_candidate | 2.3 | costa-mesa__newport-beach__legacy-nearby-city-457-469-2.json |
| Newport Beach | Costa Mesa | strong_candidate | 2.3 | newport-beach__costa-mesa__legacy-nearby-city-469-457-1.json |
| Fullerton | Anaheim | strong_candidate | 2.5 | fullerton__anaheim__legacy-nearby-city-459-491-1.json |
| Anaheim | Fullerton | strong_candidate | 2.5 | anaheim__fullerton__legacy-nearby-city-491-459-1.json |
| Rancho Santa Margarita | Mission Viejo | strong_candidate | 2.6 | rancho-santa-margarita__mission-viejo__legacy-nearby-city-362-418-1.json |
| Mission Viejo | Rancho Santa Margarita | strong_candidate | 2.6 | mission-viejo__rancho-santa-margarita__legacy-nearby-city-418-362-6.json |
| Orange | Santa Ana | strong_candidate | 3.1 | orange__santa-ana__legacy-nearby-city-468-473-3.json |
| Santa Ana | Orange | strong_candidate | 3.1 | santa-ana__orange__legacy-nearby-city-473-468-1.json |
| Mountain View | Sunnyvale | strong_candidate | 3.1 | mountain-view__sunnyvale__legacy-nearby-city-76-81-1.json |
| Sunnyvale | Mountain View | strong_candidate | 3.1 | sunnyvale__mountain-view__legacy-nearby-city-81-76-1.json |
| Tustin | Santa Ana | strong_candidate | 3.2 | tustin__santa-ana__legacy-nearby-city-430-473-2.json |
| Santa Ana | Tustin | strong_candidate | 3.2 | santa-ana__tustin__legacy-nearby-city-473-430-2.json |
| San Jacinto | Hemet | strong_candidate | 3.4 | san-jacinto__hemet__legacy-nearby-city-378-396-1.json |
| Hemet | San Jacinto | strong_candidate | 3.4 | hemet__san-jacinto__legacy-nearby-city-396-378-1.json |
| Tustin | Orange | strong_candidate | 3.6 | tustin__orange__legacy-nearby-city-430-468-1.json |
| Orange | Tustin | strong_candidate | 3.6 | orange__tustin__legacy-nearby-city-468-430-4.json |
| Santa Clara | Sunnyvale | strong_candidate | 3.8 | santa-clara__sunnyvale__legacy-nearby-city-79-81-2.json |
| Sunnyvale | Santa Clara | strong_candidate | 3.8 | sunnyvale__santa-clara__legacy-nearby-city-81-79-3.json |


## Comparison Candidate Examples

| Source | Target | Distance | Positioning |
| --- | --- | --- | --- |
| Madera | Fresno | 22.4 | Fresno is a market comparison candidate for Madera, sitting about 22.4 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Fresno | Madera | 22.4 | Madera is a market comparison candidate for Fresno, sitting about 22.4 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Corcoran | Visalia | 22.8 | Visalia is a market comparison candidate for Corcoran, sitting about 22.8 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Visalia | Corcoran | 22.8 | Corcoran is a market comparison candidate for Visalia, sitting about 22.8 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Rosamond | Tehachapi | 23.1 | Tehachapi is a market comparison candidate for Rosamond, sitting about 23.1 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Tehachapi | Rosamond | 23.1 | Rosamond is a market comparison candidate for Tehachapi, sitting about 23.1 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Madera | Clovis | 23.7 | Clovis is a market comparison candidate for Madera, sitting about 23.7 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Clovis | Madera | 23.7 | Madera is a market comparison candidate for Clovis, sitting about 23.7 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Bakersfield | Wasco | 24.2 | Wasco is a market comparison candidate for Bakersfield, sitting about 24.2 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Wasco | Bakersfield | 24.2 | Bakersfield is a market comparison candidate for Wasco, sitting about 24.2 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Selma | Visalia | 24.9 | Visalia is a market comparison candidate for Selma, sitting about 24.9 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Visalia | Selma | 24.9 | Selma is a market comparison candidate for Visalia, sitting about 24.9 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Santa Clarita | Palmdale | 25 | Palmdale is a market comparison candidate for Santa Clarita, sitting about 25 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Palmdale | Santa Clarita | 25 | Santa Clarita is a market comparison candidate for Palmdale, sitting about 25 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Turlock | Merced | 25.1 | Merced is a market comparison candidate for Turlock, sitting about 25.1 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Merced | Turlock | 25.1 | Turlock is a market comparison candidate for Merced, sitting about 25.1 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Lemoore | Visalia | 27.7 | Visalia is a market comparison candidate for Lemoore, sitting about 27.7 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Visalia | Lemoore | 27.7 | Lemoore is a market comparison candidate for Visalia, sitting about 27.7 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Redding | Red Bluff | 28.3 | Red Bluff is a market comparison candidate for Redding, sitting about 28.3 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |
| Red Bluff | Redding | 28.3 | Redding is a market comparison candidate for Red Bluff, sitting about 28.3 miles away within the same legacy geography bucket. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim. |


## Editorial Guardrails

- Do not publish these records without editorial review.
- Do not expose validation scores.
- Do not make availability, rent, ranking, or inventory-depth claims.
- Do not infer district identity from city-level nearness alone.
- Use the generated copy as a restrained starting point, not final market prose.

## Recommended Next Step

Run a metro-specific editorial pass on the generated records. The highest-value next layer is to add a short commercial rationale to each selected relationship: access pattern, tenant fit, built form, client proximity, workforce geography, transit/freeway connection, or nearby district alternative logic.
