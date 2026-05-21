# Commercial Identity Enrichment V1 Report

Date: 2026-05-21

Output:

- `generated/geography/identity-signals/`
- `generated/geography/identity-signals/_manifest.json`

## Summary

Commercial Identity Enrichment V1 creates internal, draft identity signals for the strongest available geography nodes. These records are editorial scaffolding only. They are not connected to public templates and should not be treated as final public copy.

The layer favors places with strong or comparison candidate relationships, generated comparison-intelligence records, and selected priority Bay Area or Atlanta city nodes where present.

## Counts

| Metric | Count |
| --- | ---: |
| Identity records generated | 145 |
| Places skipped | 0 |
| Public-ready records | 0 |

## Count By State

| State | Count |
| --- | --- |
| CA | 142 |
| GA | 3 |


## Count By Confidence

| Confidence | Count |
| --- | --- |
| low | 55 |
| medium | 53 |
| high | 37 |


## Count By Environment Type

| Environment type | Count |
| --- | --- |
| nearby city market | 76 |
| multi-district commercial market | 47 |
| suburban commercial node | 14 |
| regional commercial center | 4 |
| city-level geography node | 2 |
| major city commercial market | 2 |


## Example High-Confidence Records

| Name | State | Environment | Summary |
| --- | --- | --- | --- |
| Anaheim | CA | multi-district commercial market | Anaheim has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Antioch | CA | multi-district commercial market | Antioch has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Apple Valley | CA | multi-district commercial market | Apple Valley has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Bakersfield | CA | multi-district commercial market | Bakersfield has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Campbell | CA | multi-district commercial market | Campbell has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Carlsbad | CA | multi-district commercial market | Carlsbad has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Cerritos | CA | multi-district commercial market | Cerritos has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Chula Vista | CA | multi-district commercial market | Chula Vista has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Concord | CA | multi-district commercial market | Concord has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Corona | CA | multi-district commercial market | Corona has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| Costa Mesa | CA | multi-district commercial market | Costa Mesa has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |
| El Dorado Hills | CA | multi-district commercial market | El Dorado Hills has existing market-snapshot context and should be treated as a multi-district commercial market. Use the snapshot as orientation only; keep final public copy tied to current editorial review. |


## Example Low-Confidence Records

| Name | State | Environment | Caution |
| --- | --- | --- | --- |
| Anderson | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Beaumont | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Benicia | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Burbank | CA | multi-district commercial market | Raw corpus support has not been evaluated for these relationships. |
| Carmichael | CA | multi-district commercial market | Raw corpus support has not been evaluated for these relationships. |
| Castro Valley | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Cathedral City | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Chino | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Chino Hills | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Clovis | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Coachella | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |
| Corcoran | CA | nearby city market | Raw corpus support has not been evaluated for these relationships. |


## Places Skipped

_None._


## Warnings About Overuse

- Do not publish identity records directly.
- Do not use these records to make ranking, rent, vacancy, inventory, or current availability claims.
- Do not infer district-level specificity from city-level nearby relationships.
- Treat confidence as an editorial readiness hint, not a public metric.
- Use low-confidence records only to guide future corpus review.

## Recommended Next Step

Run a metro-specific editorial review for Bay Area, Atlanta, Southern California, Phoenix, Seattle/Bellevue, Texas, and South Florida. For each promising node, add corpus-backed commercial rationale: built form, access pattern, tenant fit, nearby alternatives, and district-level context where available.
