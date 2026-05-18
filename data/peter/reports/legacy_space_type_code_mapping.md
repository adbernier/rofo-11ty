# Legacy Space Type Code Mapping

This report decodes the numeric legacy `space_type` values found in Peter's Rofo listing exports into public-safe categories for future city, building, and market-density work.

The mapping is intentionally conservative. Rofo should use these codes for aggregate commercial geography scoring, not for live availability or listing claims.

## Sources Reviewed

- `data/peter/raw/rofo_listings.csv`: 3,264,927 historical listing rows with numeric `space_type`.
- `data/peter/raw/rofo_leads.csv`: tenant request text with the same numeric `space_type` field.
- `data/peter/derived/raw_listing_descriptions_sample.csv`: rich raw SQL-derived listing text sample.
- `data/peter/reports/raw_listing_description_semantic_audit.md`: listing code counts and raw text audit.
- `data/peter/reports/building_semantic_sample_review.md`: prior keyword profile by lead space type code.
- `scripts/peter/build_building_semantic_identity.py`: prior internal label guesses used for semantic aggregation.

## Recommended Public-Safe Lookup

| code | listing_count | public_safe_category | legacy_label_guess | confidence | evidence | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 171 | other/unknown | unknown / unset | low | Very small listing count. Lead text is mixed and sparse; no durable category pattern. | Treat as unset or unknown. Do not use for public categorization. |
| 1 | 1205090 | office | office | high | Largest code. Lead messages are heavily office-oriented; raw rich samples include private office, executive suite, business center, and office-for-lease examples. Prior semantic workflow labeled code 1 as office. | Use as office for public-safe expansion scoring. Coworking/executive-suite language may appear inside this code and should be handled by semantic text extraction, not numeric code alone. |
| 2 | 726872 | retail | retail | high | Lead messages have the strongest retail/storefront/restaurant keyword concentration among common codes. Listing profile is mostly NNN lease/sale, consistent with retail property economics. Prior semantic workflow labeled code 2 as retail. | Use as retail. Some office and mixed-use examples appear, so text signals should still refine final categorization. |
| 3 | 368663 | industrial | industrial | high | Lead messages show the strongest warehouse, industrial, loading, distribution, and larger-square-footage pattern among common codes. Listing square-footage distribution is materially larger than office/retail. Prior semantic workflow labeled code 3 as industrial. | Use as industrial. Flex/R&D and showroom-warehouse needs may be present inside this code and should be refined with text signals. |
| 8 | 621403 | land | land / land-other | high | Raw rich samples for code 8 are land/redevelopment tracts. Lead keyword profile has the strongest land keyword concentration among uncommon codes. Listing profile is sale-heavy with many zero or very large square-footage values. Prior semantic workflow labeled code 8 as land/other. | Use as land when building expansion logic needs a public-safe category. Exclude from building-page style inventory unless the page model supports land explicitly. |
| 9 | 209 | other/unknown | specialty | low | Very small listing count and mixed lead text. Prior semantic workflow labeled it specialty, but the category is not specific enough for public grouping. | Keep as other/unknown until legacy application constants are recovered. |
| 10 | 252815 | other/unknown | other / investment-oriented | medium | Mostly SALE records with total price selection and unknown price type. Rich samples include apartment, waterfront development, and investment-oriented property copy rather than a durable tenant space type. | Do not map to office/retail/industrial/flex/coworking/medical/land without more evidence. Public-safe category should remain other/unknown. |
| 11 | 273 | other/unknown | hospitality / special use | low | Tiny sale-heavy code. Lead samples include function/event and hotel-like requests, but volume is too low for reliable public categorization. | Keep as other/unknown. If hospitality becomes a future public category, revisit. |
| 12 | 29221 | flex | flex / mixed commercial | medium | Prior semantic workflow labeled code 12 as flex/mixed. Lead keyword profile is mixed across office, retail, warehouse, industrial, studio, and flexible-use language rather than a clean single-use type. | Usable as flex for coarse scoring, but treat as medium-confidence mixed/flex. Do not expose unsupported specific claims without text confirmation. |
| 13 | 60210 | other/unknown | ambiguous; prior workflow guessed coworking/executive suite | low | Prior semantic workflow guessed coworking/executive suite, but listing profile is overwhelmingly SALE-oriented and the available lead/text evidence does not support a reliable coworking mapping. | Keep as other/unknown for now. Coworking should be extracted from rich text/operator signals such as executive suite, coworking, shared office, serviced office, Regus, or WeWork. |

## Ambiguous Codes

- `9`: Very low volume and previously labeled only as `specialty`. Keep as `other/unknown`.
- `10`: Meaningful volume, but mostly sale-oriented and investment/multifamily/development-like in samples. Keep as `other/unknown`.
- `11`: Tiny volume, possibly hospitality or special use. Keep as `other/unknown`.
- `12`: Best current interpretation is `flex`, but it is really mixed/flexible commercial. Use only for coarse scoring unless text evidence confirms flex/R&D, office-warehouse, workshop, or similar fit.
- `13`: Prior internal workflow guessed coworking/executive suite, but the aggregate listing profile does not support that confidently. Keep as `other/unknown`; detect coworking from text/operator signals instead.

## Categories Not Reliably Encoded Numerically

No numeric code can be treated as a reliable standalone signal for:

- `coworking`
- `medical`

Those should be extracted from rich listing/building text, operator names, semantic signals, or future reviewed enrichment. For example, `executive suite`, `shared office`, `Regus`, `medical`, `clinic`, and `dental` are better text-level evidence than a numeric `space_type` code alone.

## Recommended Use

Use the lookup for aggregate market scoring and city expansion analysis:

- `1` → `office`
- `2` → `retail`
- `3` → `industrial`
- `8` → `land`
- `12` → `flex` with medium-confidence caveats
- all other codes → `other/unknown`

Do not use this mapping to claim current inventory, active availability, pricing, or suite-level details.

## Next Step

Before building expansion sets, apply this lookup to legacy listing aggregates and keep raw code counts alongside public-safe category counts. For thin or ambiguous markets, require text-derived semantic evidence before using `flex`, `coworking`, or `medical` as public-facing categories.
