---
permalink: false
---

# Market Guide Scaling Template

This framework keeps Rofo market guides useful as the system grows beyond the first manually reviewed batch. Guides should feel practical and locally aware, not like swapped city names in a generic template.

## Required Fields

Each guide record should include:

- `city`
- `state_abbr`
- `city_slug`
- `city_state_slug`
- `space_type`
- `guide_slug`
- `space_type_label`
- `space_type_noun`
- `title`
- `meta_description`
- `average_rent`
- `rent_basis`
- `market_date`
- `summary`
- `trends`
- `neighborhoods`
- `sources`

## Optional Quality Fields

Use these fields for higher-priority guides or any guide where the market has enough distinct local context:

- `summary_short`: One concise line for index cards.
- `has_inventory`: Set to `false` when the guide has useful market context but Rofo does not currently generate a matching city/space-type inventory page. Omit it or set `true` when inventory-backed CTAs are available.
- `best_for`: Tenant or business types that are a strong fit for the market.
- `neighborhood_strategy`: Advice that maps tenant needs to specific areas.
- `leasing_tips`: Practical search guidance tied to the space type or market.

## Quality Rules

- Use conservative language and avoid claims that require live availability data.
- Do not invent rates, concessions, amenities, transit details, or landlord-specific terms.
- Use approximate rent language when sources vary or report different rent bases.
- Match the space type throughout the guide. Office guides should not drift into retail language, and industrial guides should focus on operational needs.
- Keep bullets short enough to scan.
- Use local district names only when they are real and relevant.
- Sources should support the rent basis and broad market context.

## Avoiding Repetitive Content

- Start with the tenant problem, not the city name.
- Vary section emphasis by space type:
  - Office: commute, talent access, client access, building quality, move-in condition.
  - Industrial: loading, clear height, truck access, yard, power, delivery routes.
  - Retail: visibility, signage, parking, customer base, permitted use, co-tenancy.
- Avoid repeating the same city and state phrase in every section.
- Use `neighborhood_strategy` to add decision guidance, not another version of the neighborhood list.
- Use `leasing_tips` for actions a tenant should take before touring or comparing options.

## When Not To Create A Guide

Do not create a guide when:

- There is no reliable rent or market source.
- The city has too little relevant inventory for that space type.
- The guide would mostly duplicate a nearby larger market.
- Local neighborhoods or districts cannot be described accurately.
- The space type has no meaningful search demand or internal linking support.

## Priority Tiers

Tier 1:
Large markets with strong inventory, multiple space types, and high SEO value. These should receive all optional quality fields.

Tier 2:
Important regional markets with solid inventory and reliable source coverage. These should receive at least `summary_short`, `best_for`, and `leasing_tips`.

Tier 3:
Secondary cities or nearby markets that support internal linking. These can launch with required fields and be enriched later.

Tier 4:
Low-inventory or low-confidence markets. Hold until inventory, source quality, or search demand improves.

## Example Guide Record

```json
{
  "city": "San Francisco",
  "state_abbr": "CA",
  "city_slug": "san-francisco",
  "city_state_slug": "san-francisco-ca",
  "space_type": "office-space",
  "guide_slug": "office-space-guide",
  "space_type_label": "Office Space",
  "space_type_noun": "office",
  "title": "San Francisco Office Space Guide",
  "meta_description": "A practical guide to finding office space in San Francisco, including average rents, leasing trends, neighborhood notes, and nearby office markets.",
  "average_rent": "$69-$71 per square foot per year",
  "rent_basis": "Annual full-service/gross asking rent, based on Q1 2026 market reports.",
  "market_date": "Q1 2026",
  "has_inventory": true,
  "summary_short": "A dense Bay Area office market for technology, professional services, and teams comparing downtown and nearby alternatives.",
  "summary": "San Francisco's office market is shaped by technology demand, high-quality buildings, transit access, and tenant interest in move-in-ready space.",
  "best_for": [
    "Technology, AI, and startup teams",
    "Professional services firms that value transit access",
    "Teams comparing downtown San Francisco with East Bay and Peninsula options"
  ],
  "trends": [
    "Technology tenants are driving much of the strongest leasing demand.",
    "Move-in-ready buildings are outperforming older commodity office space."
  ],
  "neighborhoods": [
    {
      "name": "Financial District",
      "summary": "Best for professional services, finance, legal, consulting, and companies that value regional transit access."
    }
  ],
  "neighborhood_strategy": [
    {
      "label": "Tech and growth teams",
      "areas": "SoMa, Mission Bay, Mid-Market",
      "summary": "Good for teams that want access to talent, transit, and other innovation-oriented companies."
    }
  ],
  "leasing_tips": [
    "Compare direct and sublease options because pricing, term, and buildout condition can vary significantly.",
    "Ask whether quoted rents include full-service costs before comparing buildings."
  ],
  "sources": [
    {
      "name": "CBRE San Francisco Office Figures Q1 2026",
      "url": "https://www.cbre.com/insights/figures/san-francisco-office-figures-q1-2026"
    }
  ]
}
```

## Batch Publishing Checklist

- Confirm every URL follows the existing guide pattern.
- Confirm every guide has a reliable source and rent basis.
- Confirm source links work and match the market or broader benchmark being cited.
- Check that each guide uses the correct space-type language throughout.
- Review `summary`, `best_for`, `neighborhood_strategy`, and `leasing_tips` for repeated phrasing.
- Build locally and verify representative office, industrial, and retail pages.
- Confirm guides appear on the index, sitemap, city pages, and matching space-type pages only where data exists.
- Confirm JSON-LD parses as valid JSON in generated HTML.
