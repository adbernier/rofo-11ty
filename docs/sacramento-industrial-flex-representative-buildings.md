# Sacramento Industrial & Flex Representative Buildings

## Purpose

This sprint establishes the first Sacramento Representative Building foundation for the `industrial_flex` commercial ecosystem. The goal is to make Sacramento's industrial and flex recommendations more tangible without creating Building Briefs, changing recommendation rankings, or making availability claims.

Representative Buildings in this collection are examples of operating environments. Archetype assignments describe environmental fit; they do not identify current tenants.

## Source Methodology

The sprint reused existing Rofo public building records and repository source captures rather than creating duplicate canonical buildings. Source support came primarily from:

- `_data/buildingPages.js` for canonical page paths and identity.
- `data-sources/company-exports/raw/cbre__sacramento-region.csv`.
- `data-sources/company-exports/raw/colliers__sacramento.csv`.
- `data-sources/company-exports/raw/ethan-conrad__sacramento-region.csv`.
- `data-sources/company-exports/raw/century__sacramento-region.csv`.
- Sacramento district ecosystem metadata in `_data/locationKnowledgeGraph.js`.

Property-level technical features are included only where the repository source captures support them. Suite-specific items such as loading, parking, power, yard rights, ventilation, permitted use, trailer parking, and clear height remain validation topics.

## Districts Evaluated

The Publisher plan identified the following graph-supported districts as industrial/flex candidates:

- Natomas
- Power Inn Industrial
- Rancho Cordova Commercial Core
- Rocklin Commercial Core
- West Sacramento Industrial

Roseville, Elk Grove, Folsom, and Arden / Point West were reviewed as broader Sacramento commercial areas, but they were not prioritized for this industrial/flex foundation because the current graph already treats them as stronger medical, retail, or office expressions.

## Buildings Selected

### Natomas

- `1235 Blumenfeld Dr`: small-bay service environment for compact warehouse, dispatch, and trade-service users.
- `1329 N Market Blvd`: last-mile logistics environment with dock and grade-level loading context.
- `1060 National Dr`: warehouse/distribution environment for larger north Sacramento storage and inventory movement.
- `4205 S Market Ct`: contractor-service cluster with fenced-yard and loading context.

### Power Inn Industrial

- `5711 Florin Perkins Rd`: small-bay service environment with smaller warehouse-suite pattern.
- `4949 Florin Perkins Rd`: warehouse/distribution environment tied to Highway 50 and the Florin Perkins corridor.
- `5800 Alder Ave`: light-manufacturing environment and single-tenant industrial example with yard context.
- `8583 Elder Creek Rd`: light-manufacturing and technical-industrial example with source-backed power, clear-height, yard, and loading signals.

### Rancho Cordova Commercial Core

- `11201 Sun Center Dr`: contractor-service cluster with office/industrial mixed-use and fenced-yard evidence.
- `11353 Pyrites Way`: small-bay service environment with smaller suite, storefront, and M2 zoning context.
- `11300 Trade Center Dr`: flex business-park example with meaningful office/warehouse split.
- `10255 Old Placerville Rd`: conditioned flex and technical-use comparison point near the Highway 50 corridor.

### West Sacramento Industrial

- `3100 Ramco St`: large-scale distribution environment with dock doors, grade-level doors, clear height, power, trailer parking, and ESFR source support.
- `2928 Ramco St`: warehouse/distribution center example with dock-high and grade-level loading, clear height, sprinkler, and light-industrial zoning support.
- `3380 Industrial Blvd`: showroom/flex environment with office/warehouse and grade-level loading context.

### Rocklin Commercial Core

- `4011 Alvis Ct`: Placer County flex/warehouse example. This is intentionally a thin single-building starter record because current evidence supports one credible representative example, not a full Rocklin industrial batch.

## Deferred Or Rejected Candidates

- Additional Rocklin and Roseville industrial/flex candidates: deferred until stronger source evidence supports multiple distinct roles.
- Elk Grove industrial candidates: deferred because the current sprint was scoped to Publisher's primary industrial/flex candidate districts.
- Food-production candidates: deferred. The repository did not yet provide enough source-supported Sacramento food-production building evidence to add a credible role.
- Industrial-campus candidates: deferred. The collection establishes operational breadth first; campus-scale examples require additional research.

## Coverage Added

### Ecosystem Subtypes

- `small_bay_industrial`
- `flex`
- `contractor_service`
- `contractor_yard`
- `warehouse`
- `distribution`
- `last_mile_logistics`
- `light_manufacturing`
- `showroom_flex`
- `research_development`

### Representative Roles

- `small_bay_service_environment`
- `flex_business_park`
- `contractor_service_cluster`
- `warehouse_distribution_environment`
- `last_mile_logistics_environment`
- `light_manufacturing_environment`
- `large_scale_distribution_environment`
- `showroom_flex_environment`

### Business Activities

- `service_dispatch`
- `equipment_storage`
- `vehicle_storage`
- `inventory_management`
- `receiving`
- `shipping`
- `storage`
- `distribution`
- `assembly`
- `light_manufacturing`
- `customer_showroom`
- `knowledge_work`
- `product_development`

### Business Archetypes

- `general_contractor`
- `electrician`
- `hvac_company`
- `plumbing_company`
- `landscaper`
- `cabinet_shop`
- `furniture_maker`
- `equipment_service_company`
- `building_services_company`
- `distributor`
- `wholesaler`
- `importer`
- `light_manufacturer`
- `ecommerce_fulfillment_business`
- `research_company`

### Operational Categories

All seven Representative Building Intelligence operational categories are represented:

- `access_loading`
- `parking_vehicles`
- `configuration`
- `infrastructure`
- `market_presence`
- `location_workforce`
- `outdoor_special_use`

## Building Brief Migration Queue

1. `3100 Ramco St`, West Sacramento Industrial: large-scale distribution angle; strongest technical source support.
2. `8583 Elder Creek Rd`, Power Inn Industrial: light-manufacturing and technical-validation angle.
3. `11201 Sun Center Dr`, Rancho Cordova Commercial Core: contractor-service and yard-oriented operations angle.
4. `2928 Ramco St`, West Sacramento Industrial: warehouse/distribution center angle.
5. `1329 N Market Blvd`, Natomas: last-mile logistics and north Sacramento access angle.
6. `3380 Industrial Blvd`, West Sacramento Industrial: showroom/flex and office/warehouse angle.
7. `5711 Florin Perkins Rd`, Power Inn Industrial: small-bay trade-service angle.
8. `11353 Pyrites Way`, Rancho Cordova Commercial Core: small-suite service and maker angle.

## Publisher Before And After

Before this sprint, Publisher reported Sacramento `industrial_flex` as a blocking ecosystem with:

- Representative Buildings: 0
- Representative roles: 0
- Operational categories: 0
- Building Briefs: 0
- Industrial/flex readiness: Thin
- Recommended ecosystem sprint: Industrial & Flex Representative Building Foundation

After regeneration, Publisher reports:

- Representative Buildings: 16
- Representative roles: 8
- Operational categories: 7
- Operational characteristics: 39
- Review-required Representative Buildings: 0
- Building Briefs: 0
- Industrial/flex readiness: Partial
- Recommended ecosystem sprint: Industrial & Flex Building Brief Migration

The metro remains `Expansion Ready`; current Publisher scoring and recommendation behavior are not intentionally changed.

## Remaining Gaps

- No Sacramento industrial/flex Building Briefs exist yet.
- Food-production, R&D, urban-industrial, and industrial-campus roles remain research candidates.
- Rocklin industrial/flex coverage is intentionally thin.
- Technical property details must continue to be validated during future Building Brief migration.

## QA

Run:

```bash
node scripts/qa-sacramento-industrial-flex-representative-buildings.js
npm run publisher:snapshot
npm run publisher:report
node scripts/qa-publisher-ecosystem-readiness.js
node scripts/qa-representative-building-intelligence.js
```
