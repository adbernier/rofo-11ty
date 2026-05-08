# Building Semantic Identity Pilot Review

## Purpose

This review narrows the Building Semantic Identity v1 output into signals that are likely safe for future public display. The review is intentionally conservative: Rofo should describe durable building identity and historical environment patterns, not current inventory, pricing, or availability.

## Pilot Dataset

- Pilot records reviewed by script: 500
- Representative examples included below: 50
- Source: `data/peter/derived/building_semantic_identity_pilot.json`

## Signal Buckets

### Approve for Possible Public Display

| signal_key | public_label | pilot_count | average_confidence | suspected_noise_level | notes |
| --- | --- | --- | --- | --- | --- |
| warehouse_distribution | Warehouse or distribution fit | 236 | 0.67 | medium | Usually tied to building function rather than current availability. |
| retail_storefront | Retail storefront environment | 203 | 0.709 | medium | Useful for tenant fit, though mixed use buildings should be reviewed. |
| transit_oriented | Transit oriented | 161 | 0.686 | medium | Durable location context when evidence is specific. |
| loading_dock | Loading oriented | 125 | 0.719 | medium | Operational signal that can describe building environment when repeated. |
| freeway_access | Freeway access context | 118 | 0.699 | medium | Location context is durable, but public copy should avoid exact route claims unless reviewed. |
| medical_office | Medical office fit | 68 | 0.671 | medium | Durable tenant fit when repeated across historical records. |
| campus_environment | Campus environment | 65 | 0.724 | medium | Generally stable property positioning. |
| showroom | Showroom fit | 39 | 0.672 | medium | Useful environment signal for retail, design, or trade users. |
| creative_office | Creative office character | 25 | 0.71 | medium | Useful building character signal when backed by repeated evidence. |
| waterfront | Waterfront context | 21 | 0.693 | medium | Durable location context. |
| professional_services | Professional services fit | 12 | 0.653 | medium | Useful tenant fit signal, but best as soft contextual language. |
| boutique_office | Boutique office character | 2 | 0.685 | medium | Useful positioning signal if repeated or building level. |
| historic_building | Historic building character | 0 |  | medium | Durable identity signal when present. |

### Review Carefully

| signal_key | public_label | pilot_count | average_confidence | suspected_noise_level | notes |
| --- | --- | --- | --- | --- | --- |
| restaurant_food | Restaurant or food service fit | 340 | 0.739 | medium | Can be noisy because kitchens and food amenities may be suite level or nearby amenities. |
| fitness | Fitness or wellness fit | 157 | 0.72 | medium | May describe a gym tenant, a nearby amenity, or a wellness use. |
| financial_services | Financial services fit | 78 | 0.706 | medium | May reflect old tenant targeting rather than building identity. |
| high_ceilings | High ceiling environment | 76 | 0.688 | medium | Can be a durable physical trait, but often suite level. |
| natural_light | Natural light mentioned historically | 66 | 0.369 | medium | Internal-only pilot count used because full CSV contains production-safe signals only. Usually suite-level marketing language, not always building identity. |
| high_clearance | High clearance signal | 41 | 0.694 | medium | Likely durable for industrial, but should be reviewed for context. |
| flex_rd | Flex or R&D fit | 29 | 0.682 | medium | Useful but often ambiguous between flex space, R&D, and generic flexible layout language. |
| biotech_lab | Biotech or lab fit | 15 | 0.664 | medium | High-value signal, but false positives are costly and should be reviewed. |
| exposed_brick | Exposed Brick | 14 | 0.686 | medium | Needs manual sample review before public use. |
| brick_and_timber | Brick And Timber | 10 | 0.685 | medium | Needs manual sample review before public use. |
| law_firm | Law firm fit | 10 | 0.693 | medium | May describe prior tenant targeting rather than building identity. |
| startup_friendly | Startup friendly pattern | 8 | 0.693 | medium | Tenant-fit language that can become subjective. |
| heavy_power | Heavy power signal | 5 | 0.702 | medium | Operationally useful but should not be surfaced without stronger verification. |
| class_a | Class A environment | 4 | 0.66 | medium | Useful if verified, but legacy marketing can overstate class. |

### Internal Only or Suppress

| signal_key | public_label | pilot_count | average_confidence | suspected_noise_level | notes |
| --- | --- | --- | --- | --- | --- |
| current_parking | Parking mentioned historically | 319 | 0.43 | high | Internal-only pilot count used because full CSV contains production-safe signals only. Parking is too current-condition sensitive for public use without fresh verification. |
| furnished | Furnished mentioned historically | 100 | 0.342 | high | Internal-only pilot count used because full CSV contains production-safe signals only. Transient suite condition. |
| plug_and_play | Plug and play mentioned historically | 73 | 0.26 | high | Internal-only pilot count used because full CSV contains production-safe signals only. Transient listing condition. |
| nonprofit | Nonprofit tenant pattern | 2 | 0.39 | high | Internal-only pilot count used because full CSV contains production-safe signals only. Tenant-type targeting can be sensitive and weak as public building identity. |
| current_buildout | Current buildout mentioned historically | 0 |  | high | Suite-level current condition claim. |
| move_in_ready | Move in ready mentioned historically | 0 |  | high | Availability and current condition claim. |
| pricing_oriented | Pricing oriented language | 0 |  | high | Pricing language should not be exposed from historical records. |

## Representative Building Examples

### Medical office fit

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| Brickell Bayview Center | Miami | FL | 0.74 | 15 | healthcare | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| Miami Airport Center #114 | Miami | FL | 0.71 | 41 | medical | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| Westend @ 25th | Miami | FL | 0.69 | 68 | medical, doctor | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Warehouse or distribution fit

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| Executive Center II & III | Dallas | TX | 0.74 | 1196 | storage | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| Miami- Miami International Commerce Center | Miami | FL | 0.74 | 58 | warehouse, storage | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| Miami Airport Center #114 | Miami | FL | 0.74 | 43 | warehouse, storage | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Freeway access context

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| 80 S Santa Fe Dr. | Denver | CO | 0.95 | 28 | easy access to | Credible because the signal appears in building-level text and historical listing evidence. |
| St. James Place | San Jose | CA | 0.71 | 22 | highway access | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| Valley Office Centre | San Jose | CA | 0.7 | 19 | highway access | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Loading oriented

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| Executive Center II & III | Dallas | TX | 0.95 | 8067 | loading dock | Credible because the signal appears in building-level text and historical listing evidence. |
| nan | Atlanta | GA | 0.91 | 17 | dock high, loading dock | Credible because the signal appears in building-level text and historical listing evidence. |
| 8330 LBJ Freeway | Dallas | TX | 0.88 | 137 | loading dock | Credible because the signal appears in building-level text and historical listing evidence. |

### Campus environment

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| nan | Austin | TX | 0.86 | 9 | campus, business park | Credible because the signal appears in building-level text and historical listing evidence. |
| 4101 McEwen | Dallas | TX | 0.78 | 235 | campus | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| 4099 McEwen | Dallas | TX | 0.78 | 219 | campus | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Waterfront context

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| River North | Chicago | IL | 0.98 | 24 | riverfront | Credible because the signal appears in building-level text and historical listing evidence. |
| nan | Oakland | CA | 0.82 | 8 | waterfront | Credible because the signal appears in building-level text and historical listing evidence. |
| US Bank Centre Sublease | Seattle | WA | 0.74 | 15 | waterfront | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Retail storefront environment

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| Westend @ 25th | Miami | FL | 0.95 | 117 | retail, shopping center, end cap | Credible because the signal appears in building-level text and historical listing evidence. |
| nan | Austin | TX | 0.86 | 9 | retail | Credible because the signal appears in building-level text and historical listing evidence. |
| Miami Airport Center #114 | Miami | FL | 0.74 | 43 | retail | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Showroom fit

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| Miami Airport Center #114 | Miami | FL | 0.71 | 33 | showroom | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| 80 S Santa Fe Dr. | Denver | CO | 0.71 | 28 | showroom | Credible because repeated historical listing evidence points to a durable building or location pattern. |
| Westend @ 25th | Miami | FL | 0.69 | 61 | gallery, showroom | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Transit oriented

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| Legacy Almaden Plaza | San Jose | CA | 0.98 | 37 | light rail, caltrain | Credible because the signal appears in building-level text and historical listing evidence. |
| 80 S Santa Fe Dr. | Denver | CO | 0.95 | 28 | light rail | Credible because the signal appears in building-level text and historical listing evidence. |
| nan | San Francisco | CA | 0.78 | 333 | caltrain | Credible because repeated historical listing evidence points to a durable building or location pattern. |

### Restaurant or food service fit

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| West Loop Timber Loft Office Space for Lease | Chicago | IL | 0.96 | 20 | kitchen, restaurant | Can be noisy because kitchens and food amenities may be suite level or nearby amenities. |
| Westend @ 25th | Miami | FL | 0.93 | 115 | kitchen, restaurant | Can be noisy because kitchens and food amenities may be suite level or nearby amenities. |
| nan | Austin | TX | 0.86 | 9 | restaurant | Can be noisy because kitchens and food amenities may be suite level or nearby amenities. |

### Financial services fit

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| River North | Chicago | IL | 0.82 | 11 | bank | May reflect old tenant targeting rather than building identity. |
| Brickell Bayview Center | Miami | FL | 0.74 | 15 | bank | May reflect old tenant targeting rather than building identity. |
| Miami Airport Center #114 | Miami | FL | 0.71 | 103 | bank | May reflect old tenant targeting rather than building identity. |

### Fitness or wellness fit

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| 4101 McEwen | Dallas | TX | 0.98 | 235 | fitness | May describe a gym tenant, a nearby amenity, or a wellness use. |
| Executive Center II & III | Dallas | TX | 0.95 | 8067 | fitness | May describe a gym tenant, a nearby amenity, or a wellness use. |
| River North | Chicago | IL | 0.82 | 11 | gym | May describe a gym tenant, a nearby amenity, or a wellness use. |

### Flex or R&D fit

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| nan | San Francisco | CA | 0.8 | 8 | flex space | Useful but often ambiguous between flex space, R&D, and generic flexible layout language. |
| 80 S Santa Fe Dr. | Denver | CO | 0.71 | 28 | office warehouse | Useful but often ambiguous between flex space, R&D, and generic flexible layout language. |
| Miami- Miami International Commerce Center | Miami | FL | 0.7 | 18 | flex space, office warehouse | Useful but often ambiguous between flex space, R&D, and generic flexible layout language. |

### High ceiling environment

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| nan | Austin | TX | 0.86 | 9 | clear height | Can be a durable physical trait, but often suite level. |
| nan | San Francisco | CA | 0.71 | 16 | high ceilings | Can be a durable physical trait, but often suite level. |
| nan | Chicago | IL | 0.69 | 170 | high ceilings | Can be a durable physical trait, but often suite level. |

### Parking mentioned historically

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| nan | Austin | TX | 0.62 | 9 | parking | Parking is too current-condition sensitive for public use without fresh verification. |
| Miami Airport Center #114 | Miami | FL | 0.53 | 81 | parking | Parking is too current-condition sensitive for public use without fresh verification. |
| Brickell Bayview Center | Miami | FL | 0.5 | 15 | parking, covered parking | Parking is too current-condition sensitive for public use without fresh verification. |

### Plug and play mentioned historically

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| 2880 Zanker Rd | San Jose | CA | 0.29 | 4 | plug and play, turnkey | Transient listing condition. |
| River North | Chicago | IL | 0.27 | 3 | plug and play, turnkey | Transient listing condition. |
| Brickell Bayview Center | Miami | FL | 0.27 | 3 | plug and play, turnkey | Transient listing condition. |

### Furnished mentioned historically

| building | city | state | confidence | support | evidence | review_note |
| --- | --- | --- | --- | --- | --- | --- |
| 4099 McEwen | Dallas | TX | 0.42 | 16 | furnished, fully furnished | Transient suite condition. |
| Golden Gate ├â┬É 75 Broadway | San Francisco | CA | 0.41 | 14 | furnished, fully furnished | Transient suite condition. |

## Data Quality Concerns

- Some legacy building names contain encoding artifacts or missing names.
- Some signals are strongly repeated because one building had many historical listing rows with similar marketing copy.
- Location signals such as transit or freeway access are more durable than suite condition signals, but they should still avoid exact unverified claims.
- Restaurant, fitness, and financial services can describe tenant targeting, nearby amenities, or previous tenants rather than building identity.
- The full v1 CSV only contains production-safe signal counts, so internal-only full-population counts require a later compact aggregation if needed.

## UI Recommendation

- Start with a reviewed signal whitelist, not the full production-safe list.
- Use small semantic chips only for approved signals.
- Add a short `Building Environment` summary only when 2 or more approved signals are present.
- Use language such as `Historically associated with` or `Rofo has seen historical signals for`.
- Do not show suite, rent, pricing, availability, furnished, plug-and-play, or move-in-ready claims from historical data.

## Next Step

Manually review the strongest pilot examples for approved signals, then create a small whitelist for prototype display on a limited set of building or neighborhood pages.
