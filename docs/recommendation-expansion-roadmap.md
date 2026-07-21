# Rofo Compass Expansion Roadmap

This document supports the internal Rofo Compass Coverage dashboard. It is a planning guide for increasing Compass Maturity and editorial depth across commercial metros.

A metro is Compass Ready when Rofo Compass can consistently generate trustworthy, graph-backed recommendations and advisor-quality Location Briefs using the Commercial Location Knowledge Graph, Recommendation Resolver, Explainability Layer, Location Brief Generator, and Recommendation QA.

Editorial Maturity, representative-building coverage, comparison depth, and district refinement are tracked separately. They improve Location Brief richness over time, but they are not Compass Ready blockers once recommendation quality is credible and QA validated.

Future metro work should begin with Compass Discovery using `docs/templates/compass-discovery-template.md`. The roadmap should track what Compass knows, what it is learning, what has been validated, and what should be built next.

Recommendation pages can now use production Building Briefs as representative evidence for a recommended district. The implementation rules, eligibility thresholds, disclosure language, and future Live Market Investigation path are documented in `docs/recommendation-representative-buildings.md`.

## Compass Ready

### SF Bay Area

Compass Maturity: Compass Ready

Current strengths:

- Deepest Commercial Location Graph coverage.
- Strong city, district, comparison, and functional competitor graph.
- Office, life science, technology, creative office, industrial, warehouse, flex, and R&D paths are represented.
- Location Briefs can resolve credible market paths for major San Francisco, Peninsula, South Bay, and East Bay searches.

Current weaknesses:

- Representative building depth can still improve in selected districts.
- Some retail and medical-office guidance is lighter than office and industrial guidance.

Future enhancements:

- Add more representative building support to high-volume districts.
- Expand medical-office and retail Knowledge Cards where tenant demand supports it.
- Continue validating comparison relationships against actual tenant decision paths.

### Sacramento

Compass Maturity: Compass Ready

Current strengths:

- City-level Sacramento now resolves to a graph-backed market path.
- Downtown Sacramento, Midtown Sacramento, East Sacramento / Alhambra, Natomas, Arden / Point West, Power Inn Industrial, West Sacramento Industrial, Rancho Cordova, Folsom, Roseville, Rocklin, and Elk Grove are represented.
- Office, medical, retail, flex, industrial, and warehouse paths are represented.
- Industrial/flex guidance includes truck access, highway access, loading, yard, power, labor access, and outdoor storage considerations where relevant.
- Suburban office and medical paths distinguish Highway 50, I-80, I-5, Placer County, and south Sacramento decision patterns.
- Sacramento completed the pilot Recommendation QA pass using seven realistic business profiles across medical, professional services, back-office, flex, warehouse, startup office, and local service/retail use cases.
- Sacramento QA now includes explainability checks for selection rationale, matched priorities, tradeoff summary, alternative rationale, and validation focus.

Current weaknesses:

- Representative building depth should continue to be reviewed for selected suburban and industrial districts.
- Comparison pages exist for many relationships, but editorial depth should keep improving as Location Brief usage reveals demand.

Future enhancements:

- Strengthen representative building support using existing reliable building paths.
- Continue expanding high-value comparison pages where graph relationships show real tenant choices.
- Watch Location Brief demand to decide whether additional Sacramento industrial submarkets should be enriched.
- Use the Sacramento QA process as the baseline for future Compass Ready reviews.
- Require future Compass Ready reviews to pass both recommendation-direction QA and explanation-quality QA.

## Enhancing

### Los Angeles

Compass Maturity: Enhancing

Current strengths:

- Compass graph coverage now covers Downtown LA, Westside, media/creative, South Bay, and major industrial/logistics districts.
- Office, creative office, media, professional services, flex, R&D, industrial, warehouse, distribution, and manufacturing paths are represented.
- LA industrial Knowledge Cards include truck access, highway access, loading, yard, power, labor access, port/airport access, and trailer parking considerations.

Current weaknesses:

- Retail and medical-office coverage should deepen.
- Representative building depth is uneven by district.
- Some LA comparison pages may need additional editorial depth as graph-backed recommendations drive more usage.

Next priorities:

- Add retail and medical-office Knowledge Cards for districts where those uses are commercially meaningful.
- Improve representative building coverage in LA office and industrial districts using existing reliable building paths only.
- Expand comparison pages where current graph relationships identify high-value tenant choices.

## Compass Ready - Recent Pilots

### San Diego

Compass Maturity: Compass Ready

Current strengths:

- San Diego has a calibrated Compass Knowledge Graph seed for the city-level market and core office, innovation, flex, industrial, warehouse, and North County decision paths.
- Seed nodes include Downtown San Diego, Mission Valley, UTC / University City, Sorrento Mesa, Kearny Mesa, Miramar, Otay Mesa, Rancho Bernardo, Poway Business Park, Carlsbad Business Park, Vista Business Park, and Oceanside Industrial.
- City-level San Diego can route office, medical, life-science/R&D, flex, industrial, warehouse, manufacturing, showroom, and North County professional-service scenarios into differentiated graph-backed market paths.
- San Diego QA includes ten realistic business profiles and passes baseline recommendation-direction and explainability checks with differentiated primary recommendations.
- Editorial broker-style review passed after calibration. The North County professional-services scenario now keeps Rancho Bernardo ahead of Downtown San Diego as the more direct North County comparison.
- Explainability now surfaces profile-specific matched priorities such as life science, R&D, showroom, logistics, border access, North County, and I-15 access when those terms are supported by graph-authored knowledge.
- The first seed intentionally consolidates overlapping labels: UTC / University City is the primary North City office node, and Sorrento Mesa is the primary innovation/R&D/flex node.

Current weaknesses:

- Representative buildings are attached only from existing reliable Rofo building paths and should continue moving from illustrative seed coverage toward richer broker-reviewed examples.
- Medical-office and retail/service guidance is present but should be deepened after demand and broker review confirm priority corridors.
- Some useful page-level districts from discovery, including Little Italy / Columbia, East Village, Del Mar Heights / Carmel Valley, Chula Vista, San Marcos, and Escondido, were intentionally not included in the first Compass seed because they are second-pass recommendation refinements.

Future enhancements:

- Promote reviewed representative building candidates into the dedicated representative-building layer where appropriate.
- Add second-pass Knowledge Cards only where they improve recommendations: Chula Vista medical/service, Little Italy / Columbia, East Village, Del Mar Heights / Carmel Valley, Torrey Pines / La Jolla, San Marcos, and Escondido.
- Continue validating whether Sorrento Valley should remain supporting context or become a distinct Compass node.
- Use real Location Brief usage to identify where San Diego needs more precise retail, medical, and representative-building depth.

### Orange County

Compass Maturity: Compass Ready

Editorial Maturity: Developing

Representative Building Coverage: Developing

QA Coverage: Complete

Current strengths:

- Orange County has a first-pass Compass Knowledge Graph with city-level routing and priority district nodes for Irvine Spectrum, Irvine Business Complex, University Research Park, South Coast Metro, Newport Center, Tustin Legacy, Anaheim Canyon, Lake Forest Business Park, Fullerton, and South OC Medical & Professional.
- Office, executive professional services, airport-access professional office, medical, R&D, flex, industrial, warehouse, retail/service, and contractor/service-industrial paths are represented.
- Orange County QA includes twelve realistic business profiles and passes baseline recommendation-direction and explainability checks with differentiated primary recommendations.
- K1.1 calibration sharpened the core office differentiation: Irvine Spectrum for technology/growth/R&D image, Irvine Business Complex for airport-access professional office, University Research Park for UC Irvine/research adjacency, South Coast Metro for central OC office-retail/client-facing users, Newport Center for coastal executive/client image, and Tustin Legacy for modern Irvine-edge medical/professional use.
- The first seed intentionally models airport access as a reason inside Irvine Business Complex and related office nodes rather than creating a shallow John Wayne Airport Area node.
- South OC medical/professional demand is modeled through a combined Mission Viejo / Laguna Hills node to support patient/customer geography without splitting the first-pass graph too thinly.

Current weaknesses:

- Representative-building depth is uneven. Irvine, South Coast Metro, Newport Center, Anaheim Canyon, Lake Forest, and South OC Medical & Professional have stronger existing path support; Fullerton and Tustin Legacy need deeper reviewed examples.
- Second-pass candidates such as Costa Mesa, Orange, Downtown Santa Ana, Brea, Huntington Beach, Buena Park, Garden Grove, Foothill Ranch, and Anaheim Platinum Triangle were intentionally not promoted until their recommendation impact is clearer.
- Retail and medical-office coverage should be calibrated with actual Location Brief usage and broker feedback.

Future enhancements:

- Improve representative-building coverage using existing reliable Rofo building paths only.
- Evaluate Costa Mesa, Orange, Anaheim Platinum Triangle, and Foothill Ranch as second-pass Knowledge Cards only if they improve recommendations.
- Decide whether Downtown Santa Ana, Brea, Huntington Beach, Buena Park, or Garden Grove should become later editorial refinements.
- Continue monitoring whether city-level broad office searches route appropriately across Irvine, Newport, South Coast Metro, Tustin, and North OC rather than over-converging on Irvine.

### Denver

Compass Maturity: Compass Ready

Editorial Maturity: Developing

Representative Building Coverage: Developing

QA Coverage: Complete

Current strengths:

- Denver has a first-pass Compass Knowledge Graph with city-level routing and 20 district nodes across central Denver, southeast office, Boulder/US-36 technology, east/northeast industrial, west metro, and south metro medical/professional decision paths.
- Office, medical, flex, R&D, industrial, warehouse, distribution, manufacturing, showroom, retail/service, and airport/logistics paths are represented where the graph supports them.
- Denver QA includes twelve realistic business profiles and passes baseline recommendation-direction and explainability checks with twelve unique primary recommendations.
- Q1 calibration sharpened DTC versus Cherry Creek for back-office searches, added Commerce City and Lone Tree to the city-level path, and improved distribution fit for airport/northeast industrial recommendations.
- The first seed intentionally avoids adding every public Denver-area page. Glendale, Arvada, Thornton, Northglenn, Longmont, Baker, Five Points, and Santa Fe Arts District remain second-pass candidates until recommendation demand justifies them.

Current weaknesses:

- Representative-building depth is uneven. Downtown Denver, LoDo, Cherry Creek, DTC, Northeast Denver Industrial, Aurora, Boulder, Broomfield/Interlocken, Centennial, Inverness, Lakewood, and Louisville/Superior have resolved examples; Central Park, Commerce City, Westminster, Golden, and some edge districts need deeper review.
- Broker review should continue validating Aurora medical, Denver Airport/Pena logistics, Boulder versus US-36 technology alternatives, and south metro medical/professional distinctions.
- Retail and medical-office guidance is present but should deepen only after actual Location Brief demand identifies priority corridors.

Future enhancements:

- Improve representative-building coverage using existing reliable Rofo building paths only.
- Add second-pass Knowledge Cards only where they improve recommendations, especially Glendale, Arvada, Thornton/Northglenn, Longmont, Baker, Five Points, Santa Fe Arts District, or other Denver districts exposed by real demand.
- Continue monitoring whether broad Denver office searches distinguish central Denver, Cherry Creek, DTC, Boulder/US-36, and west/south metro alternatives clearly enough for advisor-quality Location Briefs.

## Planned

### Seattle

Compass Maturity: Planned

Current strengths:

- Public city and district geography exists for major Seattle-area markets.
- Several commercial districts are already visible in search/autocomplete.

Current weaknesses:

- Knowledge Graph coverage is not yet Compass Ready.
- Office, industrial, warehouse, flex, and life-science fit needs to be authored.
- Comparison relationships need to be built from tenant decision paths.

Next priorities:

- Seed Downtown Seattle, South Lake Union, Bellevue, Redmond, Kirkland, Kent Valley, Tacoma Port / Industrial, and Everett Industrial.
- Add office, technology, life science, industrial, and warehouse Knowledge Cards.
- Add city-level market paths for Seattle and Bellevue.

### Phoenix

Compass Maturity: Future / planned candidate

Current strengths:

- Major city pages exist.
- Phoenix has clear office, industrial, retail, healthcare, and logistics location patterns suitable for future graph expansion.

Current weaknesses:

- Knowledge Graph coverage has not started.
- District coverage and comparisons need planning before Location Brief output can be trusted.

Next priorities:

- Define priority districts and industrial corridors.
- Seed city and district Knowledge Cards.
- Add representative buildings only where existing reliable data supports them.

## Future

### Tier 2

- Portland
- Austin

Next priorities:

- Convert existing geography expansion work into Knowledge Graph coverage where needed.
- Ensure every priority district has space-type fit, tradeoffs, questions to validate, and compare relationships.

### Tier 3

- Dallas
- Houston
- Chicago
- Boston
- Atlanta

Next priorities:

- Start with commercially recognized office, industrial, medical, and logistics districts.
- Build graph-backed recommendation paths before scaling page count.

## Operating Principle

Every future metro expansion should begin and end in the Rofo Compass Coverage dashboard.

Pages are useful only when they improve Rofo's ability to produce a credible Location Brief.

Recommendation pages now support a Live Market Investigation intake after representative buildings are shown. Future expansion work should treat representative buildings and Building Briefs as inputs to that continuation: they help users confirm what Rofo should investigate, but they do not imply live availability or replace broker-validated market research.
