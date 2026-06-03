# Representative Evidence Audit V1

Scope: repo-accessible data only. This audit does not assume access to AWS archive volumes such as `listings3` or `buildings3`.

Sources compared:

- `temp_data/raw-listings.json`
- `_data/buildingPages.js`
- public representative building references on district pages
- current representative building cards exposed through `_data/neighborhoodPages.js`

Classification:

- A = enough repo-accessible evidence exists
- B = partial evidence exists, but needs archive data or manual review for a full 10-15 card layer
- C = repo-accessible evidence is sparse

Summary: A=0, B=7, C=7

| District | Class | Current cards | Public refs | Listing rows | Listing addresses | Building rows | Listing richness | Enough for 10-15? |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Long Island City | C | 1 | 1 | 9 | 1 | 1 | medium | no |
| Energy Corridor | B | 4 | 2 | 42 | 4 | 6 | low | no |
| Round Rock | C | 1 | 2 | 11 | 1 | 2 | medium | no |
| Downtown Oakland | B | 2 | 4 | 22 | 2 | 15 | low | no |
| The Domain | B | 1 | 2 | 11 | 1 | 6 | low | no |
| Chandler | B | 1 | 4 | 11 | 1 | 4 | low | no |
| Denver Tech Center | B | 3 | 4 | 41 | 3 | 3 | low | no |
| Downtown Palo Alto | B | 12 | 5 | 22 | 2 | 8 | low | yes |
| North San Jose | B | 13 | 5 | 22 | 2 | 4 | medium | yes |
| Commerce City | C | 0 | 0 | 0 | 0 | 0 | none | no |
| Elizabeth Industrial | C | 0 | 0 | 0 | 0 | 0 | none | no |
| Industry City / Sunset Park | C | 0 | 0 | 0 | 0 | 0 | none | no |
| JFK Airport Area | C | 0 | 0 | 0 | 0 | 0 | none | no |
| Port Newark / Elizabeth | C | 0 | 0 | 0 | 0 | 0 | none | no |

## District Findings

### Long Island City

- Classification: C
- Decision: Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.
- Current representative cards: 1
- Public building references: 1
- Repo listing evidence: 9 rows across 1 unique addresses
- Repo building evidence: 1 rows across 1 unique addresses
- Listing keyword richness: medium (office, professional, coworking, manufacturing)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - New York, Long Island City - Spaces — The Falchi Building, 31-00 47th Avenue (9 rows)
- Top public building examples:
  - The Falchi Building, 31-00 47th Avenue — The Falchi Building, 31-00 47th Avenue

### Energy Corridor

- Classification: B
- Decision: Partial improvement possible, but archive extraction or manual review is needed for a full card set.
- Current representative cards: 4
- Public building references: 2
- Repo listing evidence: 42 rows across 4 unique addresses
- Repo building evidence: 6 rows across 6 unique addresses
- Listing keyword richness: low (office, professional, coworking)
- Likely reason evidence is thin: Partial repo evidence exists, but it is not yet broad enough for a confident 10-15 representative card set.
- Top listing examples:
  - Energy Corridor — 11111 Katy Freeway (11 rows)
  - Park Row — 1400 Broadfield Blvd (11 rows)
  - Park Ten Place — 16225 Park Ten Place (11 rows)
- Top public building examples:
  - 11111 Katy Freeway — 11111 Katy Freeway
  - 1400 Broadfield Blvd — 1400 Broadfield Blvd
  - 15730 Park Row Dr — 15730 Park Row Dr

### Round Rock

- Classification: C
- Decision: Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.
- Current representative cards: 1
- Public building references: 2
- Repo listing evidence: 11 rows across 1 unique addresses
- Repo building evidence: 2 rows across 2 unique addresses
- Listing keyword richness: medium (office, professional, coworking, rail)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - Old Town Square — 1 Chisolm Trail Road (11 rows)
- Top public building examples:
  - 1 Chisolm Trail Road — 1 Chisolm Trail Road
  - 106 E Old Settlers Blvd — 106 E Old Settlers Blvd

### Downtown Oakland

- Classification: B
- Decision: Partial improvement possible, but archive extraction or manual review is needed for a full card set.
- Current representative cards: 2
- Public building references: 4
- Repo listing evidence: 22 rows across 2 unique addresses
- Repo building evidence: 15 rows across 15 unique addresses
- Listing keyword richness: low (office, professional, coworking)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - Lake Merritt — 1901 Harrison St (11 rows)
  - Oakland City Center — 505 14th St (11 rows)
- Top public building examples:
  - 1 Kaiser Plz — 1 Kaiser Plz
  - 1111 Broadway — 1111 Broadway
  - 1212 Broadway — 1212 Broadway

### The Domain

- Classification: B
- Decision: Partial improvement possible, but archive extraction or manual review is needed for a full card set.
- Current representative cards: 1
- Public building references: 2
- Repo listing evidence: 11 rows across 1 unique addresses
- Repo building evidence: 6 rows across 6 unique addresses
- Listing keyword richness: low (office, professional, coworking)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - TX, Austin - The Domain - 3220 Feathergrass Ct — 3220 Feathergrass Ct (11 rows)
- Top public building examples:
  - 10505 Boyer Blvd — 10505 Boyer Blvd
  - 10900 Stonelake Blvd — 10900 Stonelake Blvd
  - 11801 Domain Blvd — 11801 Domain Blvd

### Chandler

- Classification: B
- Decision: Partial improvement possible, but archive extraction or manual review is needed for a full card set.
- Current representative cards: 1
- Public building references: 4
- Repo listing evidence: 11 rows across 1 unique addresses
- Repo building evidence: 4 rows across 4 unique addresses
- Listing keyword richness: low (office, professional, coworking)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - San Tan Corporate Center II — 3100 West Ray Road (11 rows)
- Top public building examples:
  - 2425 S Stearman Dr — 2425 S Stearman Dr
  - 2701 Insight Way — 2701 Insight Way
  - 3100 West Ray Road — 3100 West Ray Road

### Denver Tech Center

- Classification: B
- Decision: Partial improvement possible, but archive extraction or manual review is needed for a full card set.
- Current representative cards: 3
- Public building references: 4
- Repo listing evidence: 41 rows across 3 unique addresses
- Repo building evidence: 3 rows across 3 unique addresses
- Listing keyword richness: low (office, professional, coworking)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - 6795 - 6825 East Tennessee Ave — 6795 - 6825 East Tennessee Ave (19 rows)
  - DTC Tech — 4600 S Syracuse St (11 rows)
  - DTC Corporate Center III — 7900 E Union Ave (11 rows)
- Top public building examples:
  - 4600 S Syracuse St — 4600 S Syracuse St
  - 4643 S Ulster St — 4643 S Ulster St
  - 7900 E Union Ave — 7900 E Union Ave

### Downtown Palo Alto

- Classification: B
- Decision: Partial improvement possible, but archive extraction or manual review is needed for a full card set.
- Current representative cards: 12
- Public building references: 5
- Repo listing evidence: 22 rows across 2 unique addresses
- Repo building evidence: 8 rows across 8 unique addresses
- Listing keyword richness: low (office, professional, coworking)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - Hamilton Avenue — 228 Hamilton Ave (11 rows)
  - Downtown Lytton Avenue — 530 Lytton Ave (11 rows)
- Top public building examples:
  - 101 Lytton Ave — 101 Lytton Ave
  - 200 Hamilton Ave — 200 Hamilton Ave
  - 200-228 Hamilton Ave — 200-228 Hamilton Ave

### North San Jose

- Classification: B
- Decision: Partial improvement possible, but archive extraction or manual review is needed for a full card set.
- Current representative cards: 13
- Public building references: 5
- Repo listing evidence: 22 rows across 2 unique addresses
- Repo building evidence: 4 rows across 4 unique addresses
- Listing keyword richness: medium (office, professional, coworking, freeway access)
- Likely reason evidence is thin: Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.
- Top listing examples:
  - San Jose Airport — 2033 Gateway Place (11 rows)
  - 2880 Zanker Rd — 2880 Zanker Rd (11 rows)
- Top public building examples:
  - 1510 Montague Expy — 1510 Montague Expy
  - 2033 Gateway Place — 2033 Gateway Place
  - 2880 Zanker Rd — 2880 Zanker Rd

### Commerce City

- Classification: C
- Decision: Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.
- Current representative cards: 0
- Public building references: 0
- Repo listing evidence: 0 rows across 0 unique addresses
- Repo building evidence: 0 rows across 0 unique addresses
- Listing keyword richness: none (none)
- Likely reason evidence is thin: No repo-accessible listings or building pages matched the district using current city and district-context filters.

### Elizabeth Industrial

- Classification: C
- Decision: Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.
- Current representative cards: 0
- Public building references: 0
- Repo listing evidence: 0 rows across 0 unique addresses
- Repo building evidence: 0 rows across 0 unique addresses
- Listing keyword richness: none (none)
- Likely reason evidence is thin: No repo-accessible listings or building pages matched the district using current city and district-context filters.

### Industry City / Sunset Park

- Classification: C
- Decision: Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.
- Current representative cards: 0
- Public building references: 0
- Repo listing evidence: 0 rows across 0 unique addresses
- Repo building evidence: 0 rows across 0 unique addresses
- Listing keyword richness: none (none)
- Likely reason evidence is thin: No repo-accessible listings or building pages matched the district using current city and district-context filters.

### JFK Airport Area

- Classification: C
- Decision: Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.
- Current representative cards: 0
- Public building references: 0
- Repo listing evidence: 0 rows across 0 unique addresses
- Repo building evidence: 0 rows across 0 unique addresses
- Listing keyword richness: none (none)
- Likely reason evidence is thin: No repo-accessible listings or building pages matched the district using current city and district-context filters.

### Port Newark / Elizabeth

- Classification: C
- Decision: Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.
- Current representative cards: 0
- Public building references: 0
- Repo listing evidence: 0 rows across 0 unique addresses
- Repo building evidence: 0 rows across 0 unique addresses
- Listing keyword richness: none (none)
- Likely reason evidence is thin: No repo-accessible listings or building pages matched the district using current city and district-context filters.

## Decision Roadmap

- Improve now: Downtown Palo Alto, North San Jose
- Partial, archive/manual review needed: Energy Corridor, Downtown Oakland, The Domain, Chandler, Denver Tech Center
- Sparse repo evidence, archive/external sources needed: Long Island City, Round Rock, Commerce City, Elizabeth Industrial, Industry City / Sunset Park, JFK Airport Area, Port Newark / Elizabeth
