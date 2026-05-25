# District Building Universe V1

Generated a broad internal district-to-building universe for Bay Area commercial district media and editorial review.

## Scope

- Districts: 11
- Buildings associated: 17587
- Buildings with original images: 222
- Original images attached: 455

## Method

This pass intentionally broadens beyond currently published buildings and representative seeds. It combines:

- Bay Area neighborhood assignment rows
- Bay Area raw corpus area assignments
- Representative building seeds as a signal, not a limit
- Building Signals metadata
- Lat/lng proximity to reviewed district centers where available
- Original Image Index V1 coverage

No images were copied, processed, resized, optimized, uploaded, scored, or suppressed.

## District Summary

| District | Buildings | With originals | Original images | Rep seeds | Source layers |
|---|---:|---:|---:|---:|---|
| Downtown Oakland | 2577 | 12 | 22 | 10 | bay_area_raw_corpus_area_assignment, bay_area_neighborhood_assignment, representative_building_seed, lat_lng_proximity, building_signals_metadata |
| Uptown Oakland | 2330 | 12 | 22 | 10 | bay_area_raw_corpus_area_assignment, lat_lng_proximity, building_signals_metadata, bay_area_neighborhood_assignment, representative_building_seed |
| Jack London Square | 917 | 5 | 10 | 10 | bay_area_raw_corpus_area_assignment, bay_area_neighborhood_assignment, representative_building_seed, lat_lng_proximity, building_signals_metadata |
| Financial District SF | 2659 | 54 | 103 | 10 | bay_area_neighborhood_assignment, building_signals_metadata, lat_lng_proximity, representative_building_seed |
| SoMa | 4741 | 85 | 180 | 20 | bay_area_neighborhood_assignment, lat_lng_proximity, building_signals_metadata, representative_building_seed |
| Mission Bay | 711 | 11 | 33 | 10 | bay_area_neighborhood_assignment, lat_lng_proximity, building_signals_metadata, representative_building_seed |
| Downtown Palo Alto | 135 | 1 | 1 | 10 | bay_area_raw_corpus_area_assignment, lat_lng_proximity, building_signals_metadata, bay_area_neighborhood_assignment, representative_building_seed |
| Mountain View Tech Corridor | 611 | 34 | 67 | 10 | bay_area_raw_corpus_area_assignment, bay_area_neighborhood_assignment, building_signals_metadata, representative_building_seed, lat_lng_proximity |
| South San Francisco Biotech Corridor | 1320 | 3 | 7 | 10 | bay_area_raw_corpus_area_assignment, bay_area_neighborhood_assignment, representative_building_seed, lat_lng_proximity, building_signals_metadata |
| Emeryville / Powell Corridor | 367 | 0 | 0 | 0 | bay_area_raw_corpus_area_assignment, city_building_signal_fallback, lat_lng_proximity, building_signals_metadata |
| West Oakland Industrial Corridor | 1219 | 5 | 10 | 0 | bay_area_neighborhood_assignment, lat_lng_proximity, building_signals_metadata |

## Guardrails

- Internal editorial infrastructure only.
- Building and image counts are review coverage signals, not public metrics.
- Provider-bias flags are cautions only and do not remove records.
- District association remains approximate where neighborhood assignments or reliable polygons are unavailable.

## Next Step

Use this universe as the input for a broader representative imagery review manifest so editorial review can select authentic district context, exterior photography, and streetscape-supporting buildings before any public imagery is considered.
