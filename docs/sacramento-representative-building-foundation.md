# Sacramento Representative Building Foundation

This document records the first Sacramento Publisher Expansion Sprint. The sprint used `data/generated/publisher-expansion-plans.json` as the planning source of truth and added a bounded representative-building foundation for Sacramento without creating full Building Briefs or making availability claims.

## Publisher Plan Reviewed

Recommended sprint: Sacramento Representative Building Foundation Sprint

Publisher identified Sacramento as Expansion Ready with strong recommendation and public-route foundations but no representative-building layer. The highest-priority gaps were representative-building gaps for:

- Downtown Sacramento
- Midtown Sacramento
- Arden / Point West
- East Sacramento / Alhambra Corridor
- Elk Grove Commercial Core
- Folsom Commercial Core
- Natomas
- Power Inn Industrial
- Rancho Cordova Commercial Core
- Rocklin Commercial Core
- Roseville Commercial Core
- West Sacramento Industrial

The sprint scope was intentionally narrowed to five districts and 15 existing canonical building paths. The generated plan did not name buildings, so selections were made from existing Rofo building records and internal semantic evidence where available.

## Districts Improved

### Downtown Sacramento

Why included: Downtown is a recurring Sacramento recommendation for civic, legal, professional-service, and client-facing office users.

Representative buildings:

- 500 Capitol Mall: Capitol Mall office benchmark for formal downtown, civic, and professional-service searches.
- 621 Capitol Mall: additional Capitol Mall tower example so downtown is not represented by only one building.
- Esquire Plaza, 1215 K St: K Street transit-oriented downtown example with a different street context.

### Midtown Sacramento

Why included: Midtown appears in recommendation output for smaller offices, creative firms, nonprofits, medical/wellness users, and local retail.

Representative buildings:

- Spaces R Street, 1610 R St: creative neighborhood office and R Street corridor example.
- 2101 K St: Midtown professional-office example bridging downtown formality and Midtown character.
- 2600 Capitol Ave: medical-adjacent Midtown office example.

### Arden / Point West

Why included: Arden / Point West is a major recommendation alternative for medical, professional-service, and parking-sensitive users.

Representative buildings:

- 1111 Exposition Blvd: medical and freeway-access office example.
- 1375 Exposition Blvd: Point West office-corridor example.
- Campus Commons, 333 University Ave: campus-style office contrast.

### Folsom Commercial Core

Why included: Folsom represents the eastern Sacramento executive-suburban office and professional-service alternative.

Representative buildings:

- 50 Iron Point Cir: Iron Point office benchmark.
- 255 Parkshore Dr: Parkshore professional-office alternative.
- 600 Coolidge Dr: suburban office-park example.

### Elk Grove Commercial Core

Why included: Elk Grove represents south Sacramento local-serving office, medical, retail, and service-commercial demand.

Representative buildings:

- Laguna Pointe E, 9245 Laguna Springs Dr: Laguna Springs office benchmark.
- 9275 Laguna Springs Dr: Laguna Springs professional-office example.
- 9615 Laguna Springs Dr: local office contrast.

## Structured Intelligence Added

Each representative-building entry includes:

- canonical name
- address
- canonical Rofo building path
- building type
- representative role
- representative reason
- best-fit summary
- primary tradeoff
- source confidence
- Building Brief readiness state

This is enough for Publisher coverage and future editorial planning. It is not enough by itself to publish a production Building Brief.

Representative Building Intelligence v2 now evaluates this foundation against ecosystem, subtype, representative-role, business-activity, archetype, operational-characteristic, validation-focus, confidence, and provenance rules. Sacramento's existing foundation is office-oriented; industrial/flex representative environments remain a separate required sprint.

## Recommendation Eligibility

The current Recommendation -> Representative Buildings resolver only renders production `building_brief` records from Commercial Building Intelligence. This sprint did not weaken that global eligibility rule.

Current status:

- Sacramento recommendation districts now have representative-building foundation data.
- Sacramento recommendation pages should continue omitting representative-building modules until those buildings are migrated to Building Briefs or a formally approved non-Brief equivalent is introduced.
- The next Sacramento building sprint should migrate an initial Building Brief collection across distinct environments.

## Building Brief Migration Queue

Priority 1, Ready or review recommended:

- 500 Capitol Mall, Downtown Sacramento: highest-value downtown office benchmark.
- 1610 R St, Midtown Sacramento: clearest Midtown creative/neighborhood-office example.
- 1111 Exposition Blvd, Arden / Point West: medical and parking-oriented office example.
- Campus Commons, 333 University Ave, Arden / Point West: campus-style office contrast.
- 50 Iron Point Cir, Folsom Commercial Core: executive suburban office benchmark.
- Laguna Pointe E, 9245 Laguna Springs Dr, Elk Grove Commercial Core: south Sacramento suburban office benchmark.

Priority 2, research required:

- 621 Capitol Mall, Downtown Sacramento
- 1215 K St, Downtown Sacramento
- 2101 K St, Midtown Sacramento
- 2600 Capitol Ave, Midtown Sacramento
- 1375 Exposition Blvd, Arden / Point West
- 255 Parkshore Dr, Folsom Commercial Core
- 600 Coolidge Dr, Folsom Commercial Core
- 9275 Laguna Springs Dr, Elk Grove Commercial Core
- 9615 Laguna Springs Dr, Elk Grove Commercial Core

## Research Required

No current rents, vacancy, availability, ownership, exact square footage, floor counts, renovation details, certifications, or named tenant claims were added.

Future Building Brief migration should validate:

- exact building identity and common market name
- current building image quality
- physical scale and class where reliable
- transit and parking context
- current suite/floorplate suitability
- named tenant claims only if supported by current building-specific evidence

## Publisher Divergence

Publisher recommended representative-building curation for more Sacramento districts than this sprint could responsibly cover. East Sacramento / Alhambra, Natomas, Power Inn, Rancho Cordova, Roseville, Rocklin, and West Sacramento remain future work.

This divergence was intentional to keep the sprint bounded and avoid adding weak examples merely to close every gap.
