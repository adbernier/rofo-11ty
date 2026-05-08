# Building Enrichment Taxonomy v1

This compact taxonomy is designed for deterministic batch extraction from legacy Rofo exports and future feed text. It intentionally avoids hundreds of tags and favors explainable signals that can support building, city, and neighborhood pages.

| signal_key | human_label | parent_group | trigger_words | confidence_level | notes |
| --- | --- | --- | --- | --- | --- |
| creative_office | Creative Office | Workspace Style | creative office, creative space, creative suite, studio office | medium | Best from broker marketing text. Sparse in current exports, appears mostly in tenant messages. |
| brick_and_timber | Brick and Timber | Building Character | brick and timber, brick & timber, exposed brick, timber beams | high | Strong phrase-level match when present. |
| exposed_ceiling | Exposed Ceiling | Building Character | exposed ceiling, exposed ceilings, exposed duct, open ceiling | high | Usually reliable in marketing copy. |
| class_a | Class A | Market Position | class a, class-a, premier tower, institutional quality | medium | Can be overused in marketing copy. |
| boutique_office | Boutique Office | Building Character | boutique office, boutique building, small building | medium | Useful for neighborhood pages and smaller tenant fit. |
| high_rise | High Rise | Building Character | high-rise, high rise, tower, skyline | medium | Also inferable from floors once thresholds are set. |
| plug_and_play | Plug and Play | Workspace Style | plug and play, plug-and-play, move-in ready, turnkey | high | Good signal for immediate occupancy fit, but avoid live availability claims. |
| furnished | Furnished | Workspace Style | furnished, furniture included, fully furnished | high | Relevant if found in current descriptions or future feeds. |
| coworking_ready | Coworking or Executive Suite | Workspace Style | coworking, co-working, executive suite, shared office, serviced office | high | Can be extracted from text and source/operator names. |
| transit_adjacent | Transit Adjacent | Access + Mobility | near bart, steps from bart, close to bart, near muni, transit, train station, metro station | medium | Needs city-specific transit vocabulary for precision. |
| freeway_access | Freeway Access | Access + Mobility | freeway access, highway access, near i-, interstate, easy access to | medium | Useful for suburban, industrial, and flex contexts. |
| parking_heavy | Parking Heavy | Access + Mobility | ample parking, abundant parking, surface parking, parking ratio, on-site parking | medium | Strong when explicit. Parking-sensitive pages should avoid unsupported claims. |
| walkable_amenities | Walkable Amenities | Amenities + Environment | walkable, walking distance, restaurants, coffee, shops nearby, amenities nearby | medium | Good neighborhood enrichment signal. |
| amenity_rich | Amenity Rich | Amenities + Environment | amenity rich, amenities include, fitness center, conference center, tenant lounge, rooftop | medium | Requires source text to avoid generic claims. |
| waterfront | Waterfront | Amenities + Environment | waterfront, water view, bay view, riverfront, harbor | medium | Useful for identity and comparison pages. |
| biotech_lab | Biotech or Lab | Tenant Fit | lab, laboratory, life science, biotech, wet lab, clean room | high | Strong tenant-fit signal. |
| medical_user | Medical User | Tenant Fit | medical, clinic, dental, healthcare, exam room, doctor | high | Appears in lead messages and can guide demand context. |
| retail_storefront | Retail Storefront | Tenant Fit | storefront, retail, boutique, salon, restaurant, cafe | medium | Should be cross-checked with space_type once mapping is confirmed. |
| showroom | Showroom | Tenant Fit | showroom, display room, gallery, sales floor | high | Useful for retail, flex, and design districts. |
| startup_fit | Startup Fit | Tenant Fit | startup, start-up, small team, growth team, founder | medium | More reliable from tenant messages than building attributes. |
| professional_services | Professional Services | Tenant Fit | law firm, legal, accounting, consulting, advisor, professional services | medium | Good for district identity when aggregated. |
| hq_candidate | HQ Candidate | Tenant Fit | headquarters, hq, corporate office, flagship | medium | Needs cautious use because tenant intent may be aspirational. |
| warehouse_distribution | Warehouse or Distribution | Operational Signals | warehouse, distribution, logistics, storage, fulfillment | high | Strong industrial/flex signal. |
| loading_dock | Loading Dock | Operational Signals | loading dock, dock high, dock-high, grade level, roll-up door, drive-in | high | Strong operational signal. |
| high_ceiling | High Ceilings | Operational Signals | high ceiling, high ceilings, clear height, clearance, clear span | high | Industrial/flex relevance. |
| heavy_power | Heavy Power | Operational Signals | heavy power, 3 phase, three phase, amps, power capacity | high | Industrial/manufacturing relevance. |
| flex_rd | Flex or R&D | Operational Signals | flex, r&d, research and development, office warehouse, office/warehouse | medium | Needs disambiguation because flex can be generic. |
| campus_environment | Campus Environment | Building Character | campus, business park, office park, corporate campus | medium | Useful for suburban office and R&D pages. |
| value_oriented | Value Oriented | Market Position | affordable, low cost, below market, value, economical | low | Use carefully; can age poorly and may be subjective. |
| premium_position | Premium Position | Market Position | premium, trophy, landmark, iconic, prestige | medium | Marketing-heavy, but useful as a soft signal. |

## Use Rules

- Use high-confidence phrase matches directly when source text is explicit.
- Use medium-confidence matches as soft tags or internal signals until reviewed.
- Treat tenant lead text as demand context, not proof that a building has that attribute.
- Never expose stale suite, rent, or availability claims from historical listings.
