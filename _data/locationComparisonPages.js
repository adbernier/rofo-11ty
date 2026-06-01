const commercialLocationModel = require("./commercialLocationModel.js");

const comparisons = [
  {
    slug: "soma-vs-financial-district",
    title: "SoMa vs Financial District SF",
    short_title: "SoMa vs Financial District",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/soma-vs-financial-district/",
    district_a_name: "SoMa",
    district_b_name: "Financial District SF",
    district_a_path: "/commercial-real-estate/CA/san-francisco/soma/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    verdict_a:
      "Choose SoMa if adaptive buildings, creative-office texture, South Park/Townsend context, and a less formal central San Francisco environment matter.",
    verdict_b:
      "Choose the Financial District if formal office-core identity, transit concentration, client-facing services, and vertical downtown buildings matter more.",
    comparison_notes: [
      "SoMa is broader, more mixed, and more adaptive; the Financial District is tighter, denser, and more formal.",
      "SoMa works better for creative or startup teams that want central access without full CBD formality.",
      "The Financial District works better for traditional professional-service users that benefit from a recognized downtown business address.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "soma-vs-mission-bay",
    title: "SoMa vs Mission Bay",
    short_title: "SoMa vs Mission Bay",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/soma-vs-mission-bay/",
    district_a_name: "SoMa",
    district_b_name: "Mission Bay",
    district_a_path: "/commercial-real-estate/CA/san-francisco/soma/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    verdict_a:
      "Choose SoMa if adaptive warehouse-office texture, central-city variety, and proximity to downtown, South Park, and the Townsend corridor are the priority.",
    verdict_b:
      "Choose Mission Bay if newer institutional, life-science, medical, or modern large-parcel office context matters more.",
    comparison_notes: [
      "SoMa is more adaptive and mixed; Mission Bay is newer, more institutional, and more purpose-built.",
      "SoMa is stronger for creative office and central-city flexibility.",
      "Mission Bay is stronger for life-science, medical, research-adjacent, and modern office environments.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-oakland-vs-uptown-oakland",
    title: "Downtown Oakland vs Uptown Oakland",
    short_title: "Downtown Oakland vs Uptown Oakland",
    city: "Oakland",
    state_abbr: "CA",
    city_slug: "oakland",
    path: "/commercial-real-estate/CA/oakland/downtown-oakland-vs-uptown-oakland/",
    district_a_name: "Downtown Oakland",
    district_b_name: "Uptown Oakland",
    district_a_path: "/commercial-real-estate/CA/oakland/downtown-oakland/",
    district_b_path: "/commercial-real-estate/CA/oakland/uptown-oakland/",
    verdict_a:
      "Choose Downtown Oakland if BART-centered access, civic/business services, Broadway office buildings, and practical East Bay office identity matter.",
    verdict_b:
      "Choose Uptown Oakland if a smaller-company, mixed-use, arts-adjacent setting with stronger street-level texture is a better fit.",
    comparison_notes: [
      "Downtown Oakland is more formal, civic, and office-core oriented.",
      "Uptown Oakland is more mixed-use, arts-adjacent, and smaller-company friendly.",
      "Both can support East Bay office users, but they communicate different business environments.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "financial-district-vs-jackson-square",
    title: "Financial District SF vs Jackson Square",
    short_title: "Financial District vs Jackson Square",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/financial-district-vs-jackson-square/",
    district_a_name: "Financial District SF",
    district_b_name: "Jackson Square",
    district_a_path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
    verdict_a:
      "Choose the Financial District if formal downtown office-core identity, transit concentration, and vertical client-facing buildings are the priority.",
    verdict_b:
      "Choose Jackson Square if smaller historic buildings, boutique professional-service texture, and downtown access without tower-core formality are a better fit.",
    comparison_notes: [
      "Both districts sit in San Francisco's downtown commercial orbit, but they communicate very different office environments.",
      "The Financial District is stronger for traditional professional-service users that benefit from scale, transit, and formal business identity.",
      "Jackson Square is stronger for boutique teams that want downtown adjacency in lower-scale historic commercial buildings.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-oakland-vs-jack-london-square",
    title: "Downtown Oakland vs Jack London Square",
    short_title: "Downtown Oakland vs Jack London Square",
    city: "Oakland",
    state_abbr: "CA",
    city_slug: "oakland",
    path: "/commercial-real-estate/CA/oakland/downtown-oakland-vs-jack-london-square/",
    district_a_name: "Downtown Oakland",
    district_b_name: "Jack London Square",
    district_a_path: "/commercial-real-estate/CA/oakland/downtown-oakland/",
    district_b_path: "/commercial-real-estate/CA/oakland/jack-london-square/",
    verdict_a:
      "Choose Downtown Oakland if BART-centered access, civic/business services, and Broadway office concentration matter most.",
    verdict_b:
      "Choose Jack London Square if waterfront context, adaptive commercial buildings, service-commercial texture, and a less formal Oakland setting matter more.",
    comparison_notes: [
      "Downtown Oakland is the stronger BART-centered civic and office core.",
      "Jack London Square is more waterfront-adjacent, adaptive, and service-commercial in character.",
      "The decision is often between practical East Bay office concentration and a lower-scale waterfront commercial environment.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "financial-district-vs-mission-bay",
    title: "Financial District SF vs Mission Bay",
    short_title: "Financial District vs Mission Bay",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/financial-district-vs-mission-bay/",
    district_a_name: "Financial District SF",
    district_b_name: "Mission Bay",
    district_a_path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    verdict_a:
      "Choose the Financial District if a formal CBD address, transit concentration, and client-facing office environment are the priority.",
    verdict_b:
      "Choose Mission Bay if institutional adjacency, life-science orientation, newer buildings, and modern large-parcel office context matter more.",
    comparison_notes: [
      "The Financial District is San Francisco's most formal downtown office core; Mission Bay is newer, more institutional, and more life-science oriented.",
      "The Financial District is usually stronger for legal, finance, consulting, and traditional professional-service users.",
      "Mission Bay is usually stronger for research-adjacent, medical, life-science, and modern office users tied to UCSF or waterfront growth.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-oakland-vs-old-oakland",
    title: "Downtown Oakland vs Old Oakland",
    short_title: "Downtown Oakland vs Old Oakland",
    city: "Oakland",
    state_abbr: "CA",
    city_slug: "oakland",
    path: "/commercial-real-estate/CA/oakland/downtown-oakland-vs-old-oakland/",
    district_a_name: "Downtown Oakland",
    district_b_name: "Old Oakland",
    district_a_path: "/commercial-real-estate/CA/oakland/downtown-oakland/",
    district_b_path: "/commercial-real-estate/CA/oakland/old-oakland/",
    verdict_a:
      "Choose Downtown Oakland if Broadway office concentration, civic adjacency, and the clearest BART-centered business core matter.",
    verdict_b:
      "Choose Old Oakland if smaller historic commercial blocks, retail-office texture, and a downtown-edge setting are a better match.",
    comparison_notes: [
      "Downtown Oakland is more formal, civic, and office-core oriented.",
      "Old Oakland is lower-scale, more historic, and more transitional between the Broadway core and Jack London Square.",
      "Both can work for East Bay office users, but Old Oakland reads as a smaller district environment rather than the main business core.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "financial-district-vs-downtown-oakland",
    title: "Financial District SF vs Downtown Oakland",
    short_title: "Financial District vs Downtown Oakland",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/financial-district-vs-downtown-oakland/",
    district_a_name: "Financial District SF",
    district_b_name: "Downtown Oakland",
    district_a_path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    district_b_path: "/commercial-real-estate/CA/oakland/downtown-oakland/",
    verdict_a:
      "Choose the Financial District if San Francisco CBD identity, client-facing prestige, and the deepest downtown office concentration matter most.",
    verdict_b:
      "Choose Downtown Oakland if East Bay access, BART-centered practicality, civic adjacency, and cross-bay cost or commute tradeoffs matter more.",
    comparison_notes: [
      "This is a cross-bay downtown decision, not a neighborhood-style choice.",
      "The Financial District is stronger for firms that benefit from San Francisco's formal CBD identity and client-facing office concentration.",
      "Downtown Oakland is stronger for organizations prioritizing East Bay access, practical transit, public-sector adjacency, or a different cost and commute profile.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "soma-vs-jackson-square",
    title: "SoMa vs Jackson Square",
    short_title: "SoMa vs Jackson Square",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/soma-vs-jackson-square/",
    district_a_name: "SoMa",
    district_b_name: "Jackson Square",
    district_a_path: "/commercial-real-estate/CA/san-francisco/soma/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
    verdict_a:
      "Choose SoMa if adaptive buildings, broader central-city flexibility, and mixed creative-commercial texture matter more than boutique downtown character.",
    verdict_b:
      "Choose Jackson Square if smaller historic buildings, professional-service texture, and downtown adjacency without a broad SoMa footprint are the better fit.",
    comparison_notes: [
      "SoMa is broader, more varied, and more adaptive; Jackson Square is smaller, more historic, and more boutique.",
      "SoMa usually fits creative, technology, and flexible office users that want central access and mixed building types.",
      "Jackson Square usually fits boutique professional-service, design, and client-facing users that want downtown access in lower-scale buildings.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "mission-bay-vs-jackson-square",
    title: "Mission Bay vs Jackson Square",
    short_title: "Mission Bay vs Jackson Square",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/mission-bay-vs-jackson-square/",
    district_a_name: "Mission Bay",
    district_b_name: "Jackson Square",
    district_a_path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
    verdict_a:
      "Choose Mission Bay if life-science, institutional, medical, or modern large-parcel office context matters most.",
    verdict_b:
      "Choose Jackson Square if smaller historic commercial buildings, boutique office identity, and downtown-edge professional texture are more important.",
    comparison_notes: [
      "Mission Bay is newer, more institutional, and more life-science oriented.",
      "Jackson Square is older, smaller-scale, and more boutique professional-service oriented.",
      "This comparison is most useful when a user is deciding between modern institutional geography and downtown-edge historic office character.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-palo-alto-vs-soma",
    title: "Downtown Palo Alto vs SoMa",
    short_title: "Downtown Palo Alto vs SoMa",
    city: "Palo Alto",
    state_abbr: "CA",
    city_slug: "palo-alto",
    path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto-vs-soma/",
    district_a_name: "Downtown Palo Alto",
    district_b_name: "SoMa",
    district_a_path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/soma/",
    verdict_a:
      "Choose Downtown Palo Alto if Caltrain access, Peninsula client-facing context, Stanford adjacency, and walkable professional office identity matter most.",
    verdict_b:
      "Choose SoMa if central San Francisco access, adaptive buildings, creative-commercial texture, and broader mixed-use office geography matter more.",
    comparison_notes: [
      "Downtown Palo Alto is a Peninsula professional and startup-adjacent downtown; SoMa is a larger central San Francisco adaptive office district.",
      "Downtown Palo Alto is stronger for teams tied to Peninsula clients, Stanford, Caltrain, or venture-adjacent networks.",
      "SoMa is stronger for users that want San Francisco centrality, mixed building types, and proximity to downtown, Mission Bay, South Park, and the waterfront.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-palo-alto-vs-financial-district",
    title: "Downtown Palo Alto vs Financial District SF",
    short_title: "Downtown Palo Alto vs Financial District",
    city: "Palo Alto",
    state_abbr: "CA",
    city_slug: "palo-alto",
    path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto-vs-financial-district/",
    district_a_name: "Downtown Palo Alto",
    district_b_name: "Financial District SF",
    district_a_path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    district_b_path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    verdict_a:
      "Choose Downtown Palo Alto if a walkable Peninsula professional setting, Caltrain access, and startup or venture-adjacent context matter most.",
    verdict_b:
      "Choose the Financial District if San Francisco CBD identity, formal client-facing office concentration, and downtown transit depth matter more.",
    comparison_notes: [
      "Downtown Palo Alto is a smaller Peninsula downtown with professional, startup, and client-facing context.",
      "The Financial District is a larger formal CBD with stronger vertical office concentration and regional downtown identity.",
      "This comparison is useful for teams weighing Peninsula network access against San Francisco downtown presence.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "uptown-oakland-vs-jack-london-square",
    title: "Uptown Oakland vs Jack London Square",
    short_title: "Uptown Oakland vs Jack London Square",
    city: "Oakland",
    state_abbr: "CA",
    city_slug: "oakland",
    path: "/commercial-real-estate/CA/oakland/uptown-oakland-vs-jack-london-square/",
    district_a_name: "Uptown Oakland",
    district_b_name: "Jack London Square",
    district_a_path: "/commercial-real-estate/CA/oakland/uptown-oakland/",
    district_b_path: "/commercial-real-estate/CA/oakland/jack-london-square/",
    verdict_a:
      "Choose Uptown Oakland if mixed-use street life, BART adjacency, smaller-company office fit, and arts-adjacent commercial texture matter most.",
    verdict_b:
      "Choose Jack London Square if waterfront context, adaptive commercial buildings, service-commercial uses, and ferry or rail-adjacent identity matter more.",
    comparison_notes: [
      "Uptown Oakland is more BART-adjacent, mixed-use, and arts-oriented.",
      "Jack London Square is more waterfront-adjacent, adaptive, and service-commercial.",
      "Both can support smaller office and creative users, but they communicate different Oakland environments.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "soma-vs-downtown-oakland",
    title: "SoMa vs Downtown Oakland",
    short_title: "SoMa vs Downtown Oakland",
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    path: "/commercial-real-estate/CA/san-francisco/soma-vs-downtown-oakland/",
    district_a_name: "SoMa",
    district_b_name: "Downtown Oakland",
    district_a_path: "/commercial-real-estate/CA/san-francisco/soma/",
    district_b_path: "/commercial-real-estate/CA/oakland/downtown-oakland/",
    verdict_a:
      "Choose SoMa if San Francisco centrality, adaptive office buildings, creative-commercial texture, and proximity to Mission Bay and downtown matter most.",
    verdict_b:
      "Choose Downtown Oakland if East Bay access, BART-centered practicality, civic adjacency, and a more formal secondary downtown office setting matter more.",
    comparison_notes: [
      "SoMa is a central San Francisco adaptive office district; Downtown Oakland is the East Bay's BART-centered civic and business core.",
      "SoMa is stronger for teams prioritizing San Francisco access and mixed creative-commercial building types.",
      "Downtown Oakland is stronger for teams prioritizing East Bay access, practical transit, public-sector adjacency, or cross-bay cost and commute tradeoffs.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "hayward-vs-fremont",
    title: "Hayward vs Fremont",
    short_title: "Hayward vs Fremont",
    city: "Hayward",
    state_abbr: "CA",
    city_slug: "hayward",
    path: "/commercial-real-estate/CA/hayward/hayward-vs-fremont/",
    district_a_name: "Hayward",
    district_b_name: "Fremont",
    district_a_path: "/commercial-real-estate/CA/hayward/",
    district_b_path: "/commercial-real-estate/CA/fremont/",
    verdict_a:
      "Choose Hayward if central East Bay warehouse/flex access, service-commercial practicality, and broad I-880 reach matter most.",
    verdict_b:
      "Choose Fremont if R&D, advanced manufacturing, clean-tech, life-science support, or stronger Silicon Valley industrial adjacency matter more.",
    comparison_notes: [
      "Hayward is the more central East Bay warehouse/flex decision; Fremont is more oriented toward R&D, advanced manufacturing, and South East Bay industrial identity.",
      "Hayward tends to fit service-commercial, contractor, light industrial, and distribution users that prioritize functional access.",
      "Fremont tends to fit users that benefit from a deeper manufacturing and technology-adjacent industrial ecosystem.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "hayward-vs-union-city",
    title: "Hayward vs Union City",
    short_title: "Hayward vs Union City",
    city: "Hayward",
    state_abbr: "CA",
    city_slug: "hayward",
    path: "/commercial-real-estate/CA/hayward/hayward-vs-union-city/",
    district_a_name: "Hayward",
    district_b_name: "Union City",
    district_a_path: "/commercial-real-estate/CA/hayward/",
    district_b_path: "/commercial-real-estate/CA/union-city/",
    verdict_a:
      "Choose Hayward if a broader central East Bay industrial base, more varied warehouse/flex context, and north-south I-880 reach matter most.",
    verdict_b:
      "Choose Union City if a compact Tri-City logistics/flex position between Hayward and Fremont is enough for the operation.",
    comparison_notes: [
      "This is an adjacent-market warehouse/flex decision, not an office identity comparison.",
      "Hayward is broader and usually more useful when users want more industrial depth and a central East Bay position.",
      "Union City is more compact and can work when practical I-880 access matters more than a large commercial identity.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "hayward-vs-san-leandro",
    title: "Hayward vs San Leandro",
    short_title: "Hayward vs San Leandro",
    city: "Hayward",
    state_abbr: "CA",
    city_slug: "hayward",
    path: "/commercial-real-estate/CA/hayward/hayward-vs-san-leandro/",
    district_a_name: "Hayward",
    district_b_name: "San Leandro",
    district_a_path: "/commercial-real-estate/CA/hayward/",
    district_b_path: "/commercial-real-estate/CA/san-leandro/",
    verdict_a:
      "Choose Hayward if central East Bay warehouse/flex depth and a broader I-880 corridor position are the priority.",
    verdict_b:
      "Choose San Leandro if Oakland-adjacent access, airport-area proximity, and North I-880 service-commercial reach matter more.",
    comparison_notes: [
      "Hayward is more central to the East Bay industrial corridor; San Leandro is more Oakland-adjacent.",
      "Hayward tends to fit warehouse/flex users that want broad I-880 reach across the East Bay.",
      "San Leandro tends to fit service-commercial, contractor, and light industrial users that benefit from Oakland, airport, and North I-880 proximity.",
    ],
    lead_prompt: "Find locations that fit",
  },
];

comparisons.push(
  {
    slug: "north-san-jose-vs-santa-clara",
    title: "North San Jose vs Santa Clara Tech Core",
    short_title: "North San Jose vs Santa Clara Tech Core",
    city: "San Jose",
    state_abbr: "CA",
    city_slug: "san-jose",
    path: "/commercial-real-estate/CA/san-jose/north-san-jose-vs-santa-clara/",
    district_a_name: "North San Jose",
    district_b_name: "Santa Clara Tech Core",
    district_a_path: "/commercial-real-estate/CA/san-jose/north-san-jose/",
    district_b_path: "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/",
    verdict_a:
      "Choose North San Jose if broader R&D/flex geography, airport access, and larger-corridor technology space matter most.",
    verdict_b:
      "Choose Santa Clara Tech Core if a more established central South Bay office/tech core and campus-oriented setting are the better fit.",
    comparison_notes: [
      "Both work for technology and R&D users, but North San Jose reads as a broader corridor while Santa Clara Tech Core reads as a more concentrated office/tech market.",
      "North San Jose is stronger for airport, 101/I-880, and larger mixed office/flex geography.",
      "Santa Clara Tech Core is stronger when central South Bay campus identity and established tech-office context matter.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "north-san-jose-vs-moffett-park",
    title: "North San Jose vs Moffett Park",
    short_title: "North San Jose vs Moffett Park",
    city: "San Jose",
    state_abbr: "CA",
    city_slug: "san-jose",
    path: "/commercial-real-estate/CA/san-jose/north-san-jose-vs-moffett-park/",
    district_a_name: "North San Jose",
    district_b_name: "Moffett Park",
    district_a_path: "/commercial-real-estate/CA/san-jose/north-san-jose/",
    district_b_path: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
    verdict_a:
      "Choose North San Jose if airport access, broad R&D/flex supply, and South Bay corridor flexibility matter most.",
    verdict_b:
      "Choose Moffett Park if a more concentrated Sunnyvale innovation-campus environment is the stronger signal.",
    comparison_notes: [
      "North San Jose is broader and more corridor-like; Moffett Park is more concentrated and campus-oriented.",
      "North San Jose fits teams comparing office, R&D, and flex needs across a larger geography.",
      "Moffett Park fits companies that want a clear Sunnyvale innovation district near Mountain View and major tech employers.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-san-jose-vs-north-san-jose",
    title: "Downtown San Jose vs North San Jose",
    short_title: "Downtown San Jose vs North San Jose",
    city: "San Jose",
    state_abbr: "CA",
    city_slug: "san-jose",
    path: "/commercial-real-estate/CA/san-jose/downtown-san-jose-vs-north-san-jose/",
    district_a_name: "Downtown San Jose",
    district_b_name: "North San Jose",
    district_a_path: "/commercial-real-estate/CA/san-jose/downtown-san-jose/",
    district_b_path: "/commercial-real-estate/CA/san-jose/north-san-jose/",
    verdict_a:
      "Choose Downtown San Jose if urban office identity, transit access, civic context, and walkable downtown activity matter most.",
    verdict_b:
      "Choose North San Jose if larger technology-campus, R&D, airport, and office/flex corridor geography are the priority.",
    comparison_notes: [
      "This is the clearest San Jose format decision: urban downtown office context versus larger-parcel technology corridor.",
      "Downtown San Jose is stronger for civic, transit, university, convention, and walkable office needs.",
      "North San Jose is stronger for office/R&D, flex, airport access, and campus-style building requirements.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "moffett-park-vs-north-bayshore",
    title: "Moffett Park vs North Bayshore",
    short_title: "Moffett Park vs North Bayshore",
    city: "Sunnyvale",
    state_abbr: "CA",
    city_slug: "sunnyvale",
    path: "/commercial-real-estate/CA/sunnyvale/moffett-park-vs-north-bayshore/",
    district_a_name: "Moffett Park",
    district_b_name: "North Bayshore",
    district_a_path: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
    district_b_path: "/commercial-real-estate/CA/mountain-view/north-bayshore/",
    verdict_a:
      "Choose Moffett Park if Sunnyvale campus supply, 237/101 access, and a broader innovation district fit the requirement.",
    verdict_b:
      "Choose North Bayshore if Mountain View technology-campus identity and major-employer adjacency are the priority.",
    comparison_notes: [
      "Both are campus-oriented innovation districts, not downtown office environments.",
      "Moffett Park usually offers broader Sunnyvale district comparison value across office and R&D/flex users.",
      "North Bayshore is more tightly associated with Mountain View large-employer and campus geography.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-palo-alto-vs-downtown-mountain-view",
    title: "Downtown Palo Alto vs Downtown Mountain View",
    short_title: "Downtown Palo Alto vs Downtown Mountain View",
    city: "Palo Alto",
    state_abbr: "CA",
    city_slug: "palo-alto",
    path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto-vs-downtown-mountain-view/",
    district_a_name: "Downtown Palo Alto",
    district_b_name: "Downtown Mountain View",
    district_a_path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    district_b_path: "/commercial-real-estate/CA/mountain-view/downtown-mountain-view/",
    verdict_a:
      "Choose Downtown Palo Alto if Stanford adjacency, venture/professional services, and stronger client-facing Peninsula identity matter most.",
    verdict_b:
      "Choose Downtown Mountain View if Caltrain access, startup context, and a practical walkable downtown near major tech employers fit better.",
    comparison_notes: [
      "Both are walkable Caltrain-oriented Peninsula downtowns.",
      "Downtown Palo Alto carries stronger Stanford, venture, and client-facing professional identity.",
      "Downtown Mountain View is often more practical for startup and technology-adjacent users that still want downtown texture.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "stanford-research-park-vs-downtown-palo-alto",
    title: "Stanford Research Park vs Downtown Palo Alto",
    short_title: "Stanford Research Park vs Downtown Palo Alto",
    city: "Palo Alto",
    state_abbr: "CA",
    city_slug: "palo-alto",
    path: "/commercial-real-estate/CA/palo-alto/stanford-research-park-vs-downtown-palo-alto/",
    district_a_name: "Stanford Research Park",
    district_b_name: "Downtown Palo Alto",
    district_a_path: "/commercial-real-estate/CA/palo-alto/stanford-research-park/",
    district_b_path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    verdict_a:
      "Choose Stanford Research Park if research, R&D, institutional adjacency, and campus-oriented buildings matter most.",
    verdict_b:
      "Choose Downtown Palo Alto if walkability, Caltrain access, restaurants, and client-facing downtown identity are more important.",
    comparison_notes: [
      "This is a format decision within Palo Alto: research-park/campus geography versus walkable downtown office context.",
      "Stanford Research Park is stronger for R&D, technology, and institutional users.",
      "Downtown Palo Alto is stronger for professional services, startups, and teams that benefit from University Avenue and Caltrain.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "warm-springs-vs-milpitas-industrial",
    title: "Warm Springs vs Milpitas Industrial",
    short_title: "Warm Springs vs Milpitas Industrial",
    city: "Fremont",
    state_abbr: "CA",
    city_slug: "fremont",
    path: "/commercial-real-estate/CA/fremont/warm-springs-vs-milpitas-industrial/",
    district_a_name: "Warm Springs",
    district_b_name: "Milpitas Industrial",
    district_a_path: "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/",
    district_b_path: "/commercial-real-estate/CA/milpitas/milpitas-industrial/",
    verdict_a:
      "Choose Warm Springs if advanced manufacturing, R&D/flex, BART adjacency, and Fremont innovation identity matter most.",
    verdict_b:
      "Choose Milpitas Industrial if practical I-880/237 warehouse, flex, and service-commercial access is the priority.",
    comparison_notes: [
      "Warm Springs has a stronger innovation and advanced manufacturing signal.",
      "Milpitas Industrial is more directly functional for warehouse/flex and service-commercial users.",
      "Both serve South Bay industrial/flex decisions, but they communicate different levels of technology and manufacturing identity.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "north-san-jose-vs-milpitas",
    title: "North San Jose vs Milpitas Industrial",
    short_title: "North San Jose vs Milpitas",
    city: "San Jose",
    state_abbr: "CA",
    city_slug: "san-jose",
    path: "/commercial-real-estate/CA/san-jose/north-san-jose-vs-milpitas/",
    district_a_name: "North San Jose",
    district_b_name: "Milpitas Industrial",
    district_a_path: "/commercial-real-estate/CA/san-jose/north-san-jose/",
    district_b_path: "/commercial-real-estate/CA/milpitas/milpitas-industrial/",
    verdict_a:
      "Choose North San Jose if office/R&D identity, airport access, and larger technology corridor context matter most.",
    verdict_b:
      "Choose Milpitas Industrial if warehouse/flex functionality, service-commercial access, and I-880/237 utility matter more.",
    comparison_notes: [
      "North San Jose works better when the decision includes office, R&D, and technology-campus identity.",
      "Milpitas Industrial works better when the decision is more operational, warehouse/flex, or service-commercial.",
      "The comparison helps separate South Bay technology corridor needs from functional industrial/flex needs.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "warm-springs-vs-ardenwood",
    title: "Warm Springs vs Ardenwood",
    short_title: "Warm Springs vs Ardenwood",
    city: "Fremont",
    state_abbr: "CA",
    city_slug: "fremont",
    path: "/commercial-real-estate/CA/fremont/warm-springs-vs-ardenwood/",
    district_a_name: "Warm Springs",
    district_b_name: "Ardenwood",
    district_a_path: "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/",
    district_b_path: "/commercial-real-estate/CA/fremont/ardenwood-technology-park/",
    verdict_a:
      "Choose Warm Springs if BART adjacency, advanced manufacturing, and Fremont innovation identity are central.",
    verdict_b:
      "Choose Ardenwood if R&D/flex buildings and Dumbarton Bridge/Peninsula access are more important.",
    comparison_notes: [
      "Warm Springs is more strongly associated with advanced manufacturing and BART-adjacent innovation geography.",
      "Ardenwood is more bridge-adjacent and useful for Fremont users comparing East Bay buildings with Peninsula access.",
      "Both fit R&D/flex decisions, but they solve different commute and ecosystem problems.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-redwood-city-vs-downtown-palo-alto",
    title: "Downtown Redwood City vs Downtown Palo Alto",
    short_title: "Downtown Redwood City vs Downtown Palo Alto",
    city: "Redwood City",
    state_abbr: "CA",
    city_slug: "redwood-city",
    path: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city-vs-downtown-palo-alto/",
    district_a_name: "Downtown Redwood City",
    district_b_name: "Downtown Palo Alto",
    district_a_path: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/",
    district_b_path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    verdict_a:
      "Choose Downtown Redwood City if a practical mid-Peninsula downtown with Caltrain, civic, and Broadway context fits best.",
    verdict_b:
      "Choose Downtown Palo Alto if Stanford adjacency, venture/professional services, and stronger prestige signaling matter more.",
    comparison_notes: [
      "Both are Caltrain-oriented Peninsula downtowns.",
      "Downtown Redwood City is a practical mid-Peninsula business and civic downtown.",
      "Downtown Palo Alto is more strongly tied to Stanford, venture networks, and client-facing professional identity.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "downtown-redwood-city-vs-downtown-mountain-view",
    title: "Downtown Redwood City vs Downtown Mountain View",
    short_title: "Downtown Redwood City vs Downtown Mountain View",
    city: "Redwood City",
    state_abbr: "CA",
    city_slug: "redwood-city",
    path: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city-vs-downtown-mountain-view/",
    district_a_name: "Downtown Redwood City",
    district_b_name: "Downtown Mountain View",
    district_a_path: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/",
    district_b_path: "/commercial-real-estate/CA/mountain-view/downtown-mountain-view/",
    verdict_a:
      "Choose Downtown Redwood City if mid-Peninsula access, civic context, and Broadway downtown activity matter most.",
    verdict_b:
      "Choose Downtown Mountain View if startup context, Castro Street, and Mountain View technology adjacency matter more.",
    comparison_notes: [
      "Both are useful Peninsula downtown comparisons for office and professional users.",
      "Downtown Redwood City leans more mid-Peninsula, civic, and Broadway-oriented.",
      "Downtown Mountain View leans more startup and technology-adjacent near major Mountain View employers.",
    ],
    lead_prompt: "Find locations that fit",
  },
  {
    slug: "santa-clara-vs-moffett-park",
    title: "Santa Clara Tech Core vs Moffett Park",
    short_title: "Santa Clara Tech Core vs Moffett Park",
    city: "Santa Clara",
    state_abbr: "CA",
    city_slug: "santa-clara",
    path: "/commercial-real-estate/CA/santa-clara/santa-clara-vs-moffett-park/",
    district_a_name: "Santa Clara Tech Core",
    district_b_name: "Moffett Park",
    district_a_path: "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/",
    district_b_path: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
    verdict_a:
      "Choose Santa Clara Tech Core if central South Bay office/tech supply, established campus context, and broader employer access matter most.",
    verdict_b:
      "Choose Moffett Park if a more concentrated Sunnyvale innovation-campus district is the stronger location signal.",
    comparison_notes: [
      "Santa Clara Tech Core is broader and more central within South Bay office/tech geography.",
      "Moffett Park is more concentrated and innovation-campus oriented.",
      "The decision often turns on whether a user needs practical central South Bay access or a more defined Sunnyvale campus environment.",
    ],
    lead_prompt: "Find locations that fit",
  }
);

const detailCtaByArchetype = {
  adaptive_warehouse_office_district: "adaptive office context",
  formal_downtown_office_core: "office core",
  life_science_institutional_district: "life-science and institutional context",
  transit_centered_civic_business_core: "BART-centered office context",
  mixed_use_startup_district: "mixed-use office context",
  historic_boutique_office_district: "boutique office context",
  adaptive_industrial_commercial_district: "waterfront adaptive-commercial context",
  historic_downtown_transition_district: "historic downtown transition context",
  i880_warehouse_flex_corridor: "warehouse/flex corridor context",
  advanced_manufacturing_rd_flex_market: "R&D and manufacturing context",
  tri_city_logistics_flex_market: "Tri-City logistics/flex context",
  north_i880_industrial_service_market: "North I-880 industrial context",
  silicon_valley_innovation_office_district: "South Bay office and R&D context",
  technology_campus_office_core: "technology campus context",
  moffett_park_innovation_district: "Moffett Park innovation context",
  north_bayshore_technology_district: "North Bayshore technology context",
  caltrain_downtown_professional_district: "Caltrain downtown office context",
  research_park_rd_office_district: "research park and R&D context",
  peninsula_downtown_office_core: "Peninsula downtown office context",
  i880_237_industrial_flex_corridor: "industrial/flex corridor context",
  advanced_manufacturing_innovation_district: "advanced manufacturing context",
  ardenwood_rd_flex_district: "Ardenwood R&D/flex context",
};

const metaFocusBySlug = {
  "soma-vs-financial-district":
    "adaptive creative-office texture versus formal downtown office-core identity",
  "soma-vs-mission-bay":
    "adaptive central San Francisco office context versus newer institutional and life-science geography",
  "downtown-oakland-vs-uptown-oakland":
    "BART-centered civic/business core versus mixed-use arts-adjacent Oakland office context",
  "financial-district-vs-jackson-square":
    "formal San Francisco CBD office identity versus boutique historic downtown-edge office character",
  "downtown-oakland-vs-jack-london-square":
    "BART-centered Oakland office concentration versus waterfront adaptive-commercial context",
  "financial-district-vs-mission-bay":
    "formal downtown office core versus newer institutional and life-science-oriented office setting",
  "downtown-oakland-vs-old-oakland":
    "Broadway civic/business core versus smaller historic downtown transition blocks",
  "financial-district-vs-downtown-oakland":
    "San Francisco CBD identity versus East Bay BART-centered downtown practicality",
  "soma-vs-jackson-square":
    "broad adaptive SoMa office geography versus smaller boutique historic downtown-edge office context",
  "mission-bay-vs-jackson-square":
    "modern institutional and life-science geography versus boutique historic professional office context",
  "downtown-palo-alto-vs-soma":
    "walkable Peninsula professional office context versus central San Francisco adaptive office geography",
  "downtown-palo-alto-vs-financial-district":
    "Peninsula professional and startup-adjacent context versus San Francisco CBD office identity",
  "uptown-oakland-vs-jack-london-square":
    "mixed-use BART-adjacent Oakland office context versus waterfront adaptive-commercial setting",
  "soma-vs-downtown-oakland":
    "San Francisco adaptive office context versus East Bay BART-centered business core",
  "hayward-vs-fremont":
    "central East Bay warehouse/flex access versus Fremont R and D and advanced manufacturing context",
  "hayward-vs-union-city":
    "Hayward industrial depth versus compact Tri-City logistics and warehouse/flex access",
  "hayward-vs-san-leandro":
    "central East Bay warehouse/flex depth versus Oakland-adjacent North I-880 service-industrial access",
  "north-san-jose-vs-santa-clara":
    "North San Jose R and D/flex corridor geography versus Santa Clara office and technology campus context",
  "north-san-jose-vs-moffett-park":
    "broad South Bay office/R and D corridor access versus concentrated Sunnyvale innovation-campus geography",
  "downtown-san-jose-vs-north-san-jose":
    "urban San Jose downtown office context versus larger-parcel North San Jose technology and R and D corridor geography",
  "moffett-park-vs-north-bayshore":
    "Sunnyvale innovation district context versus Mountain View large-campus technology geography",
  "downtown-palo-alto-vs-downtown-mountain-view":
    "Stanford-adjacent Peninsula professional context versus Mountain View startup and Caltrain downtown context",
  "stanford-research-park-vs-downtown-palo-alto":
    "research park and R and D campus geography versus walkable Palo Alto downtown office identity",
  "warm-springs-vs-milpitas-industrial":
    "Fremont advanced manufacturing and BART-adjacent innovation context versus Milpitas industrial/flex utility",
  "north-san-jose-vs-milpitas":
    "South Bay office/R and D corridor context versus functional I-880/237 industrial and warehouse/flex access",
  "warm-springs-vs-ardenwood":
    "Warm Springs advanced manufacturing and BART adjacency versus Ardenwood R and D/flex and Dumbarton access",
  "downtown-redwood-city-vs-downtown-palo-alto":
    "mid-Peninsula downtown practicality versus Stanford-adjacent Palo Alto professional identity",
  "downtown-redwood-city-vs-downtown-mountain-view":
    "Redwood City mid-Peninsula business downtown versus Mountain View startup and technology-adjacent downtown",
  "santa-clara-vs-moffett-park":
    "Santa Clara central South Bay office/tech context versus Moffett Park innovation-campus concentration",
};

function districtSummary(path) {
  const model = commercialLocationModel.byPath[path];
  if (!model) return null;

  return {
    path,
    ...model,
  };
}

function relatedAlternatives(comparison, districtA, districtB) {
  const excludedPaths = new Set([comparison.district_a_path, comparison.district_b_path]);
  const seenUrls = new Set([comparison.path]);
  const alternatives = [];

  for (const district of [districtA, districtB]) {
    for (const item of district.compare_with || []) {
      const url = item.comparison_path || item.district_path;
      if (!url || seenUrls.has(url) || excludedPaths.has(item.district_path)) continue;

      seenUrls.add(url);
      alternatives.push({
        district_name: item.district_name,
        source_district_name:
          district.path === comparison.district_a_path
            ? comparison.district_a_name
            : comparison.district_b_name,
        url,
        reason: item.reason,
      });

      if (alternatives.length >= 4) return alternatives;
    }
  }

  return alternatives;
}

function hasWarehouseFlexDecisionContext(districtA, districtB) {
  return Boolean(
    districtA &&
      districtB &&
      districtA.warehouse_flex_profile &&
      districtB.warehouse_flex_profile &&
      districtA.warehouse_flex_profile.decision_context &&
      districtB.warehouse_flex_profile.decision_context
  );
}

const warehouseFlexComparisonSlugs = new Set([
  "hayward-vs-fremont",
  "hayward-vs-union-city",
  "hayward-vs-san-leandro",
  "warm-springs-vs-milpitas-industrial",
  "north-san-jose-vs-milpitas",
  "warm-springs-vs-ardenwood",
]);

module.exports = comparisons.map((comparison) => {
  const districtA = districtSummary(comparison.district_a_path);
  const districtB = districtSummary(comparison.district_b_path);
  const metaFocus = metaFocusBySlug[comparison.slug];
  const warehouseFlexComparison =
    warehouseFlexComparisonSlugs.has(comparison.slug) &&
    hasWarehouseFlexDecisionContext(districtA, districtB);

  return {
    ...comparison,
    district_a: districtA,
    district_b: districtB,
    decision_context_label: warehouseFlexComparison ? "Warehouse/flex context" : "Office context",
    decision_context_heading: warehouseFlexComparison
      ? "How to think about warehouse/flex fit"
      : "How to think about office fit",
    district_a_decision_context: warehouseFlexComparison
      ? districtA.warehouse_flex_profile.decision_context
      : districtA.best_fit_businesses,
    district_b_decision_context: warehouseFlexComparison
      ? districtB.warehouse_flex_profile.decision_context
      : districtB.best_fit_businesses,
    related_alternatives: relatedAlternatives(comparison, districtA, districtB),
    compared_districts_value: `${comparison.district_a_name},${comparison.district_b_name}`,
    district_a_detail_cta:
      `Explore ${comparison.district_a_name} ${detailCtaByArchetype[districtA.primary_archetype] || "commercial context"}`,
    district_b_detail_cta:
      `Explore ${comparison.district_b_name} ${detailCtaByArchetype[districtB.primary_archetype] || "commercial context"}`,
    page_title: `${comparison.title} | Commercial Location Comparison | Rofo`,
    meta_description: metaFocus
      ? `Compare ${comparison.title}: ${metaFocus} for business location fit and ${warehouseFlexComparison ? "warehouse/flex context" : "office context"}.`
      : `Compare ${comparison.title} for business location fit, ${warehouseFlexComparison ? "warehouse/flex context" : "office context"}, representative commercial environments, and nearby district alternatives.`,
  };
});
