const sfBase = {
  city_label: "San Francisco",
  basemap: "sf-east-central-v1",
  transit_or_freeway_labels: [
    { label: "101", x: 420, y: 202 },
    { label: "280", x: 316, y: 664 }
  ],
  map_region_label: "San Francisco Bay"
};

const sfColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function sfHero(slug, config) {
  return [
    `CA/san-francisco/${slug}`,
    {
      ...sfBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in San Francisco near surrounding commercial districts.`
    }
  ];
}

const nycBase = {
  city_label: "New York",
  basemap: "nyc-manhattan-brooklyn-v1",
  map_region_label: "East River",
  map_region_label_position: { x: 612, y: 220 },
  secondary_map_region_label: "Hudson River",
  secondary_map_region_label_position: { x: 92, y: 260 },
  water_paths: [
    "M 0 0 H 168 C 132 104 122 210 138 320 C 154 430 130 560 86 720 H 0 Z",
    "M 548 0 C 520 120 526 214 562 300 C 606 406 612 526 556 720 H 920 V 0 Z"
  ],
  transit_or_freeway_labels: [
    { label: "FDR", x: 560, y: 218 },
    { label: "BQE", x: 716, y: 478 }
  ]
};

const nycColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function nycHero(slug, config) {
  return [
    `NY/new-york/${slug}`,
    {
      ...nycBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in New York near surrounding Manhattan and Brooklyn commercial districts.`
    }
  ];
}

module.exports = Object.fromEntries([
  sfHero("dogpatch", {
    title: "Dogpatch",
    subtitle: "Waterfront creative district on San Francisco's southeastern shoreline.",
    descriptor: "Near Mission Bay, Chase Center, and the Central Waterfront.",
    orientation_label: "Southeast San Francisco",
    accessibility_label: "East side location",
    accessibility_note: "Quick access to 101, 280, and the waterfront.",
    approximate_polygon:
      "525,150 612,96 626,112 636,196 662,198 664,298 692,300 698,430 674,494 650,498 654,535 704,624 666,680 568,626 520,574 540,520 540,358 514,325 500,285 464,248",
    label_position: { x: 570, y: 380 },
    nearby_landmarks: [
      { label: "Mission Bay", time: "5 min", color: sfColors.green },
      { label: "Chase Center", time: "6 min", color: sfColors.blue },
      { label: "Embarcadero", time: "8 min", color: sfColors.purple },
      { label: "Downtown / FiDi", time: "12 min", color: sfColors.yellow }
    ],
    nearby_districts: [
      { label: "SOMA", x: 315, y: 190 },
      { label: "Mission Bay", x: 420, y: 380, emphasis: true },
      { label: "Potrero Hill", x: 318, y: 505 },
      { label: "Financial District", x: 440, y: 76 },
      { label: "Central Waterfront", x: 755, y: 350 },
      { label: "Chase Center", x: 690, y: 536 }
    ],
    anchor_points: [
      { label: "Mission Bay", x: 424, y: 410, color: sfColors.green },
      { label: "Chase Center", x: 730, y: 548, color: sfColors.blue },
      { label: "Embarcadero", x: 624, y: 112, color: sfColors.purple },
      { label: "Downtown / FiDi", x: 352, y: 74, color: sfColors.yellow }
    ],
    map_alt:
      "Abstract orientation map highlighting Dogpatch in southeast San Francisco near Mission Bay, Chase Center, and the Central Waterfront."
  }),

  sfHero("mission-bay", {
    title: "Mission Bay",
    subtitle: "Waterfront district connecting health, research, office, and event activity.",
    descriptor: "Near Dogpatch, SoMa, UCSF, and Chase Center.",
    orientation_label: "Eastern waterfront",
    accessibility_label: "Waterfront district",
    accessibility_note: "Close to Dogpatch, SoMa, 280, and the central waterfront.",
    approximate_polygon:
      "400,300 512,268 612,292 646,380 616,492 520,560 432,500 390,402",
    label_position: { x: 520, y: 418 },
    nearby_landmarks: [
      { label: "Dogpatch", time: "5 min", color: sfColors.blue },
      { label: "Chase Center", time: "4 min", color: sfColors.green },
      { label: "SoMa", time: "8 min", color: sfColors.purple },
      { label: "Financial District", time: "12 min", color: sfColors.yellow }
    ],
    nearby_districts: [
      { label: "SOMA", x: 318, y: 190 },
      { label: "Dogpatch", x: 638, y: 390, emphasis: true },
      { label: "Potrero Hill", x: 314, y: 506 },
      { label: "Financial District", x: 440, y: 76 },
      { label: "Chase Center", x: 682, y: 538 }
    ],
    anchor_points: [
      { label: "Dogpatch", x: 646, y: 408, color: sfColors.blue },
      { label: "Chase Center", x: 724, y: 548, color: sfColors.green },
      { label: "SoMa", x: 342, y: 230, color: sfColors.purple },
      { label: "Financial District", x: 352, y: 74, color: sfColors.yellow }
    ]
  }),

  sfHero("soma", {
    title: "SoMa",
    subtitle: "Large central district with office, creative, tech, showroom, and mixed commercial activity.",
    descriptor: "Between Downtown, Mission Bay, South Park, and the waterfront.",
    orientation_label: "Central San Francisco",
    accessibility_label: "Central district",
    accessibility_note: "Close to downtown, 101, 280, Mission Bay, and the waterfront.",
    approximate_polygon:
      "282,156 486,112 566,214 548,330 460,396 322,360 224,276",
    label_position: { x: 398, y: 268 },
    nearby_landmarks: [
      { label: "Financial District", time: "5 min", color: sfColors.yellow },
      { label: "Mission Bay", time: "8 min", color: sfColors.green },
      { label: "Union Square", time: "6 min", color: sfColors.purple },
      { label: "Dogpatch", time: "10 min", color: sfColors.blue }
    ],
    nearby_districts: [
      { label: "Financial District", x: 482, y: 78 },
      { label: "Union Square", x: 350, y: 122 },
      { label: "Mission Bay", x: 492, y: 426, emphasis: true },
      { label: "Dogpatch", x: 640, y: 400 },
      { label: "Potrero Hill", x: 302, y: 506 }
    ],
    anchor_points: [
      { label: "Financial District", x: 512, y: 92, color: sfColors.yellow },
      { label: "Mission Bay", x: 500, y: 410, color: sfColors.green },
      { label: "Union Square", x: 356, y: 112, color: sfColors.purple },
      { label: "Dogpatch", x: 650, y: 410, color: sfColors.blue }
    ]
  }),

  sfHero("financial-district", {
    title: "Financial District",
    subtitle: "Downtown office core with client-facing, professional, and transit-oriented business activity.",
    descriptor: "Near Embarcadero, Jackson Square, Union Square, and SoMa.",
    orientation_label: "Downtown core",
    accessibility_label: "Downtown core",
    accessibility_note: "Close to BART, Muni, ferry connections, and the Embarcadero.",
    approximate_polygon:
      "438,42 574,38 650,92 624,172 520,206 430,164 394,92",
    label_position: { x: 526, y: 124 },
    nearby_landmarks: [
      { label: "Embarcadero", time: "3 min", color: sfColors.purple },
      { label: "Union Square", time: "7 min", color: sfColors.yellow },
      { label: "Jackson Square", time: "4 min", color: sfColors.green },
      { label: "SoMa", time: "6 min", color: sfColors.blue }
    ],
    nearby_districts: [
      { label: "Jackson Square", x: 468, y: 42 },
      { label: "Embarcadero", x: 650, y: 108, emphasis: true },
      { label: "Union Square", x: 346, y: 150 },
      { label: "SOMA", x: 340, y: 248 },
      { label: "Mission Bay", x: 486, y: 428 }
    ],
    anchor_points: [
      { label: "Embarcadero", x: 640, y: 118, color: sfColors.purple },
      { label: "Union Square", x: 358, y: 144, color: sfColors.yellow },
      { label: "Jackson Square", x: 480, y: 58, color: sfColors.green },
      { label: "SoMa", x: 360, y: 246, color: sfColors.blue }
    ]
  }),

  sfHero("union-square", {
    title: "Union Square",
    subtitle: "Central retail, hospitality, office, and visitor-serving district near downtown.",
    descriptor: "Near SoMa, Financial District, Civic Center, and Market Street.",
    orientation_label: "Central downtown",
    accessibility_label: "Central downtown",
    accessibility_note: "Close to Market Street, downtown transit, SoMa, and the Financial District.",
    approximate_polygon:
      "318,86 430,72 486,134 456,222 338,236 286,168",
    label_position: { x: 382, y: 162 },
    nearby_landmarks: [
      { label: "Financial District", time: "7 min", color: sfColors.yellow },
      { label: "SoMa", time: "6 min", color: sfColors.blue },
      { label: "Civic Center", time: "7 min", color: sfColors.purple },
      { label: "Embarcadero", time: "10 min", color: sfColors.green }
    ],
    nearby_districts: [
      { label: "Financial District", x: 526, y: 84 },
      { label: "SOMA", x: 380, y: 285, emphasis: true },
      { label: "Civic Center", x: 188, y: 170 },
      { label: "Embarcadero", x: 650, y: 120 },
      { label: "Mission Bay", x: 500, y: 432 }
    ],
    anchor_points: [
      { label: "Financial District", x: 522, y: 104, color: sfColors.yellow },
      { label: "SoMa", x: 398, y: 278, color: sfColors.blue },
      { label: "Civic Center", x: 205, y: 165, color: sfColors.purple },
      { label: "Embarcadero", x: 642, y: 126, color: sfColors.green }
    ]
  }),

  sfHero("jackson-square", {
    title: "Jackson Square",
    subtitle: "Historic downtown district with boutique office, design, and professional services context.",
    descriptor: "Near the Financial District, North Beach, Embarcadero, and Union Square.",
    orientation_label: "Northeast downtown",
    accessibility_label: "Historic downtown edge",
    accessibility_note: "Close to the Financial District, Embarcadero, and north downtown connections.",
    approximate_polygon:
      "428,26 520,22 558,66 532,112 438,120 396,72",
    label_position: { x: 474, y: 78 },
    nearby_landmarks: [
      { label: "Financial District", time: "4 min", color: sfColors.yellow },
      { label: "Embarcadero", time: "6 min", color: sfColors.purple },
      { label: "Union Square", time: "9 min", color: sfColors.blue },
      { label: "SoMa", time: "10 min", color: sfColors.green }
    ],
    nearby_districts: [
      { label: "Financial District", x: 548, y: 136, emphasis: true },
      { label: "Embarcadero", x: 664, y: 106 },
      { label: "Union Square", x: 346, y: 154 },
      { label: "SOMA", x: 360, y: 282 },
      { label: "Mission Bay", x: 496, y: 430 }
    ],
    anchor_points: [
      { label: "Financial District", x: 545, y: 136, color: sfColors.yellow },
      { label: "Embarcadero", x: 642, y: 112, color: sfColors.purple },
      { label: "Union Square", x: 350, y: 150, color: sfColors.blue },
      { label: "SoMa", x: 372, y: 270, color: sfColors.green }
    ]
  }),

  sfHero("civic-center", {
    title: "Civic Center",
    subtitle: "Central civic, office, cultural, and neighborhood-serving commercial district.",
    descriptor: "Near Hayes Valley, Union Square, SoMa, and Market Street.",
    orientation_label: "Central city",
    accessibility_label: "Civic core",
    accessibility_note: "Close to Market Street transit, Hayes Valley, Union Square, and central offices.",
    approximate_polygon:
      "152,112 274,104 322,168 286,240 170,250 112,184",
    label_position: { x: 218, y: 180 },
    nearby_landmarks: [
      { label: "Hayes Valley", time: "4 min", color: sfColors.green },
      { label: "Union Square", time: "7 min", color: sfColors.yellow },
      { label: "SoMa", time: "7 min", color: sfColors.blue },
      { label: "Financial District", time: "12 min", color: sfColors.purple }
    ],
    nearby_districts: [
      { label: "Hayes Valley", x: 120, y: 132, emphasis: true },
      { label: "Union Square", x: 380, y: 148 },
      { label: "SOMA", x: 372, y: 286 },
      { label: "Financial District", x: 540, y: 96 },
      { label: "Mission Bay", x: 506, y: 432 }
    ],
    anchor_points: [
      { label: "Hayes Valley", x: 132, y: 134, color: sfColors.green },
      { label: "Union Square", x: 372, y: 150, color: sfColors.yellow },
      { label: "SoMa", x: 382, y: 280, color: sfColors.blue },
      { label: "Financial District", x: 540, y: 106, color: sfColors.purple }
    ]
  }),

  sfHero("hayes-valley", {
    title: "Hayes Valley",
    subtitle: "Central neighborhood with retail, design, food, and office-adjacent commercial activity.",
    descriptor: "Near Civic Center, Market Street, Union Square, and SoMa.",
    orientation_label: "Central west",
    accessibility_label: "Central neighborhood",
    accessibility_note: "Close to Civic Center, Market Street transit, and downtown commercial districts.",
    approximate_polygon:
      "72,82 178,70 228,126 182,204 74,210 34,142",
    label_position: { x: 126, y: 146 },
    nearby_landmarks: [
      { label: "Civic Center", time: "4 min", color: sfColors.purple },
      { label: "Union Square", time: "10 min", color: sfColors.yellow },
      { label: "SoMa", time: "10 min", color: sfColors.blue },
      { label: "Financial District", time: "14 min", color: sfColors.green }
    ],
    nearby_districts: [
      { label: "Civic Center", x: 230, y: 180, emphasis: true },
      { label: "Union Square", x: 384, y: 150 },
      { label: "SOMA", x: 372, y: 288 },
      { label: "Financial District", x: 540, y: 98 },
      { label: "Mission Bay", x: 506, y: 432 }
    ],
    anchor_points: [
      { label: "Civic Center", x: 226, y: 180, color: sfColors.purple },
      { label: "Union Square", x: 382, y: 150, color: sfColors.yellow },
      { label: "SoMa", x: 382, y: 288, color: sfColors.blue },
      { label: "Financial District", x: 538, y: 108, color: sfColors.green }
    ]
  }),

  sfHero("marina-district", {
    title: "Marina District",
    subtitle: "North-side neighborhood with retail corridors, services, and waterfront access.",
    descriptor: "Near Pacific Heights, the Presidio, Russian Hill, and northern waterfront areas.",
    orientation_label: "North San Francisco",
    accessibility_label: "North-side district",
    accessibility_note: "Useful for businesses comparing northern San Francisco neighborhoods and waterfront access.",
    approximate_polygon:
      "118,18 274,12 342,54 306,110 164,118 72,70",
    label_position: { x: 206, y: 70 },
    nearby_landmarks: [
      { label: "Pacific Heights", time: "5 min", color: sfColors.green },
      { label: "Russian Hill", time: "8 min", color: sfColors.blue },
      { label: "Financial District", time: "15 min", color: sfColors.yellow },
      { label: "Union Square", time: "15 min", color: sfColors.purple }
    ],
    nearby_districts: [
      { label: "Pacific Heights", x: 180, y: 130, emphasis: true },
      { label: "Russian Hill", x: 358, y: 76 },
      { label: "Financial District", x: 548, y: 116 },
      { label: "Union Square", x: 374, y: 168 },
      { label: "Civic Center", x: 226, y: 214 }
    ],
    anchor_points: [
      { label: "Pacific Heights", x: 184, y: 128, color: sfColors.green },
      { label: "Russian Hill", x: 354, y: 82, color: sfColors.blue },
      { label: "Financial District", x: 548, y: 118, color: sfColors.yellow },
      { label: "Union Square", x: 374, y: 166, color: sfColors.purple }
    ]
  }),

  sfHero("south-park", {
    title: "South Park",
    subtitle: "Small SoMa-adjacent district with office, creative, and startup-oriented commercial context.",
    descriptor: "Near SoMa, Mission Bay, Oracle Park, and the Financial District.",
    orientation_label: "SoMa edge",
    accessibility_label: "SoMa-adjacent pocket",
    accessibility_note: "Close to SoMa, Mission Bay, 280, and downtown commercial districts.",
    approximate_polygon:
      "418,214 508,206 552,264 520,330 430,336 386,276",
    label_position: { x: 470, y: 274 },
    nearby_landmarks: [
      { label: "SoMa", time: "3 min", color: sfColors.blue },
      { label: "Mission Bay", time: "6 min", color: sfColors.green },
      { label: "Financial District", time: "8 min", color: sfColors.yellow },
      { label: "Dogpatch", time: "10 min", color: sfColors.purple }
    ],
    nearby_districts: [
      { label: "SOMA", x: 342, y: 210, emphasis: true },
      { label: "Mission Bay", x: 512, y: 410 },
      { label: "Financial District", x: 526, y: 96 },
      { label: "Dogpatch", x: 646, y: 410 },
      { label: "Potrero Hill", x: 318, y: 512 }
    ],
    anchor_points: [
      { label: "SoMa", x: 344, y: 218, color: sfColors.blue },
      { label: "Mission Bay", x: 508, y: 410, color: sfColors.green },
      { label: "Financial District", x: 526, y: 104, color: sfColors.yellow },
      { label: "Dogpatch", x: 648, y: 410, color: sfColors.purple }
    ]
  }),

  sfHero("bayview", {
    title: "Bayview",
    subtitle: "Southeastern San Francisco district with industrial, service, and neighborhood commercial context.",
    descriptor: "Near Dogpatch, India Basin, Hunters Point, and the southeastern waterfront.",
    orientation_label: "Southeast San Francisco",
    accessibility_label: "Southeast district",
    accessibility_note: "Useful for comparing industrial, service, and waterfront-adjacent commercial areas.",
    approximate_polygon:
      "586,524 700,504 786,596 766,704 632,704 548,626",
    label_position: { x: 670, y: 626 },
    nearby_landmarks: [
      { label: "Dogpatch", time: "8 min", color: sfColors.blue },
      { label: "Mission Bay", time: "10 min", color: sfColors.green },
      { label: "Potrero Hill", time: "10 min", color: sfColors.purple },
      { label: "SoMa", time: "14 min", color: sfColors.yellow }
    ],
    nearby_districts: [
      { label: "Dogpatch", x: 632, y: 398, emphasis: true },
      { label: "Mission Bay", x: 500, y: 424 },
      { label: "Potrero Hill", x: 318, y: 512 },
      { label: "SOMA", x: 342, y: 210 },
      { label: "Chase Center", x: 704, y: 540 }
    ],
    anchor_points: [
      { label: "Dogpatch", x: 646, y: 406, color: sfColors.blue },
      { label: "Mission Bay", x: 506, y: 416, color: sfColors.green },
      { label: "Potrero Hill", x: 320, y: 508, color: sfColors.purple },
      { label: "SoMa", x: 350, y: 232, color: sfColors.yellow }
    ]
  }),

  nycHero("financial-district", {
    title: "Financial District",
    subtitle: "Lower Manhattan business district with office, finance, civic, and waterfront context.",
    descriptor: "Near Tribeca, SoHo, DUMBO, and the East River waterfront.",
    orientation_label: "Lower Manhattan",
    accessibility_label: "Downtown core",
    accessibility_note: "Useful for comparing Lower Manhattan with nearby Brooklyn and west side districts.",
    approximate_polygon: "352,520 444,500 486,584 452,664 354,646 316,574",
    label_position: { x: 404, y: 586 },
    nearby_landmarks: [
      { label: "Tribeca", time: "6 min", color: nycColors.green },
      { label: "SoHo", time: "10 min", color: nycColors.blue },
      { label: "DUMBO", time: "12 min", color: nycColors.purple },
      { label: "Brooklyn", time: "15 min", color: nycColors.yellow }
    ],
    nearby_districts: [
      { label: "Tribeca", x: 310, y: 454, emphasis: true },
      { label: "SoHo", x: 334, y: 386 },
      { label: "DUMBO", x: 642, y: 548 },
      { label: "Downtown Brooklyn", x: 704, y: 604 },
      { label: "Midtown", x: 380, y: 180 }
    ],
    anchor_points: [
      { label: "Tribeca", x: 324, y: 454, color: nycColors.green },
      { label: "SoHo", x: 346, y: 390, color: nycColors.blue },
      { label: "DUMBO", x: 642, y: 548, color: nycColors.purple },
      { label: "Brooklyn", x: 716, y: 604, color: nycColors.yellow }
    ]
  }),

  nycHero("soho", {
    title: "SoHo",
    subtitle: "Lower Manhattan district with retail, creative office, showroom, and boutique commercial context.",
    descriptor: "Near Tribeca, NoHo, Greenwich Village, and Lower Manhattan.",
    orientation_label: "Lower Manhattan",
    accessibility_label: "Lower Manhattan district",
    accessibility_note: "Useful for comparing downtown retail and creative office districts.",
    approximate_polygon: "292,330 402,314 446,374 416,436 306,446 258,388",
    label_position: { x: 352, y: 384 },
    nearby_landmarks: [
      { label: "Tribeca", time: "5 min", color: nycColors.green },
      { label: "NoHo", time: "5 min", color: nycColors.purple },
      { label: "Union Square", time: "10 min", color: nycColors.yellow },
      { label: "Financial District", time: "12 min", color: nycColors.blue }
    ],
    nearby_districts: [
      { label: "Tribeca", x: 300, y: 462 },
      { label: "NoHo", x: 388, y: 310, emphasis: true },
      { label: "Union Square", x: 390, y: 270 },
      { label: "Financial District", x: 396, y: 590 },
      { label: "Brooklyn", x: 704, y: 592 }
    ],
    anchor_points: [
      { label: "Tribeca", x: 310, y: 454, color: nycColors.green },
      { label: "NoHo", x: 394, y: 314, color: nycColors.purple },
      { label: "Union Square", x: 390, y: 270, color: nycColors.yellow },
      { label: "Financial District", x: 404, y: 590, color: nycColors.blue }
    ]
  }),

  nycHero("tribeca", {
    title: "Tribeca",
    subtitle: "Lower Manhattan district with loft, office, showroom, and neighborhood retail context.",
    descriptor: "Near SoHo, the Financial District, Hudson Square, and the Hudson River.",
    orientation_label: "Lower west side",
    accessibility_label: "Lower west side district",
    accessibility_note: "Useful for comparing downtown office, showroom, and retail-oriented neighborhoods.",
    approximate_polygon: "224,408 342,392 390,462 360,548 238,552 194,476",
    label_position: { x: 294, y: 478 },
    nearby_landmarks: [
      { label: "SoHo", time: "5 min", color: nycColors.blue },
      { label: "Financial District", time: "6 min", color: nycColors.yellow },
      { label: "Hudson River", time: "4 min", color: nycColors.purple },
      { label: "DUMBO", time: "14 min", color: nycColors.green }
    ],
    nearby_districts: [
      { label: "SoHo", x: 350, y: 378, emphasis: true },
      { label: "Financial District", x: 406, y: 590 },
      { label: "Hudson River", x: 92, y: 456 },
      { label: "DUMBO", x: 644, y: 548 },
      { label: "Midtown", x: 380, y: 178 }
    ],
    anchor_points: [
      { label: "SoHo", x: 350, y: 382, color: nycColors.blue },
      { label: "Financial District", x: 406, y: 590, color: nycColors.yellow },
      { label: "Hudson River", x: 172, y: 470, color: nycColors.purple },
      { label: "DUMBO", x: 642, y: 548, color: nycColors.green }
    ]
  }),

  nycHero("flatiron-district", {
    title: "Flatiron District",
    subtitle: "Central Manhattan district with office, design, retail, and professional services context.",
    descriptor: "Near NoMad, Chelsea, Union Square, and Midtown South.",
    orientation_label: "Midtown South",
    accessibility_label: "Central Manhattan district",
    accessibility_note: "Useful for comparing Midtown South and downtown-adjacent commercial areas.",
    approximate_polygon: "320,214 430,202 472,256 438,318 330,330 286,270",
    label_position: { x: 374, y: 270 },
    nearby_landmarks: [
      { label: "NoMad", time: "4 min", color: nycColors.green },
      { label: "Chelsea", time: "6 min", color: nycColors.blue },
      { label: "Union Square", time: "5 min", color: nycColors.purple },
      { label: "Midtown", time: "10 min", color: nycColors.yellow }
    ],
    nearby_districts: [
      { label: "NoMad", x: 384, y: 214, emphasis: true },
      { label: "Chelsea", x: 236, y: 238 },
      { label: "Union Square", x: 392, y: 304 },
      { label: "Midtown", x: 384, y: 156 },
      { label: "SoHo", x: 354, y: 384 }
    ],
    anchor_points: [
      { label: "NoMad", x: 386, y: 214, color: nycColors.green },
      { label: "Chelsea", x: 244, y: 240, color: nycColors.blue },
      { label: "Union Square", x: 394, y: 304, color: nycColors.purple },
      { label: "Midtown", x: 386, y: 158, color: nycColors.yellow }
    ]
  }),

  nycHero("chelsea", {
    title: "Chelsea",
    subtitle: "West side Manhattan district with office, showroom, gallery, retail, and mixed-use context.",
    descriptor: "Near Hudson Yards, Flatiron, Meatpacking, and the Hudson River.",
    orientation_label: "Manhattan west side",
    accessibility_label: "West side district",
    accessibility_note: "Useful for comparing west side commercial districts and Midtown South options.",
    approximate_polygon: "198,158 322,150 368,238 328,330 206,326 160,230",
    label_position: { x: 266, y: 246 },
    nearby_landmarks: [
      { label: "Hudson Yards", time: "6 min", color: nycColors.yellow },
      { label: "Flatiron", time: "6 min", color: nycColors.green },
      { label: "NoMad", time: "8 min", color: nycColors.purple },
      { label: "Union Square", time: "10 min", color: nycColors.blue }
    ],
    nearby_districts: [
      { label: "Hudson Yards", x: 228, y: 118, emphasis: true },
      { label: "Flatiron", x: 394, y: 270 },
      { label: "NoMad", x: 390, y: 214 },
      { label: "Union Square", x: 392, y: 306 },
      { label: "Hudson River", x: 92, y: 242 }
    ],
    anchor_points: [
      { label: "Hudson Yards", x: 232, y: 118, color: nycColors.yellow },
      { label: "Flatiron", x: 392, y: 270, color: nycColors.green },
      { label: "NoMad", x: 390, y: 214, color: nycColors.purple },
      { label: "Union Square", x: 392, y: 306, color: nycColors.blue }
    ]
  }),

  nycHero("midtown", {
    title: "Midtown",
    subtitle: "Manhattan office core with enterprise, professional services, hospitality, and transit context.",
    descriptor: "Near the Garment District, NoMad, Plaza District, and Grand Central area.",
    orientation_label: "Central Manhattan",
    accessibility_label: "Manhattan office core",
    accessibility_note: "Useful for comparing central office districts and nearby Midtown South areas.",
    approximate_polygon: "304,72 454,62 514,144 470,226 318,232 260,148",
    label_position: { x: 392, y: 150 },
    nearby_landmarks: [
      { label: "Garment District", time: "5 min", color: nycColors.blue },
      { label: "NoMad", time: "8 min", color: nycColors.green },
      { label: "Hudson Yards", time: "8 min", color: nycColors.yellow },
      { label: "Flatiron", time: "10 min", color: nycColors.purple }
    ],
    nearby_districts: [
      { label: "Garment District", x: 278, y: 150, emphasis: true },
      { label: "NoMad", x: 392, y: 218 },
      { label: "Hudson Yards", x: 222, y: 118 },
      { label: "Flatiron", x: 390, y: 274 },
      { label: "Downtown", x: 396, y: 584 }
    ],
    anchor_points: [
      { label: "Garment District", x: 286, y: 150, color: nycColors.blue },
      { label: "NoMad", x: 394, y: 218, color: nycColors.green },
      { label: "Hudson Yards", x: 228, y: 118, color: nycColors.yellow },
      { label: "Flatiron", x: 392, y: 274, color: nycColors.purple }
    ]
  }),

  nycHero("hudson-yards", {
    title: "Hudson Yards",
    subtitle: "Far west Midtown district with office, mixed-use, hospitality, and transit-oriented context.",
    descriptor: "Near Chelsea, the Garment District, Penn District, and the Hudson River.",
    orientation_label: "Far west Midtown",
    accessibility_label: "West Midtown district",
    accessibility_note: "Useful for comparing west side office and mixed-use districts.",
    approximate_polygon: "168,60 286,54 334,122 298,190 176,196 128,122",
    label_position: { x: 230, y: 128 },
    nearby_landmarks: [
      { label: "Chelsea", time: "6 min", color: nycColors.blue },
      { label: "Garment District", time: "6 min", color: nycColors.purple },
      { label: "Midtown", time: "8 min", color: nycColors.yellow },
      { label: "Hudson River", time: "3 min", color: nycColors.green }
    ],
    nearby_districts: [
      { label: "Chelsea", x: 252, y: 244, emphasis: true },
      { label: "Garment District", x: 326, y: 150 },
      { label: "Midtown", x: 396, y: 124 },
      { label: "Hudson River", x: 92, y: 150 },
      { label: "NoMad", x: 392, y: 218 }
    ],
    anchor_points: [
      { label: "Chelsea", x: 254, y: 244, color: nycColors.blue },
      { label: "Garment District", x: 326, y: 150, color: nycColors.purple },
      { label: "Midtown", x: 396, y: 126, color: nycColors.yellow },
      { label: "Hudson River", x: 158, y: 138, color: nycColors.green }
    ]
  }),

  nycHero("garment-district", {
    title: "Garment District",
    subtitle: "Midtown district with office, showroom, fashion, production, and transit-adjacent context.",
    descriptor: "Near Midtown, Hudson Yards, Penn District, and Times Square.",
    orientation_label: "West Midtown",
    accessibility_label: "Midtown district",
    accessibility_note: "Useful for comparing west Midtown office and showroom-oriented districts.",
    approximate_polygon: "236,104 350,96 398,158 362,222 246,224 202,164",
    label_position: { x: 300, y: 164 },
    nearby_landmarks: [
      { label: "Midtown", time: "5 min", color: nycColors.yellow },
      { label: "Hudson Yards", time: "6 min", color: nycColors.green },
      { label: "NoMad", time: "8 min", color: nycColors.blue },
      { label: "Chelsea", time: "8 min", color: nycColors.purple }
    ],
    nearby_districts: [
      { label: "Midtown", x: 420, y: 130, emphasis: true },
      { label: "Hudson Yards", x: 190, y: 116 },
      { label: "NoMad", x: 394, y: 218 },
      { label: "Chelsea", x: 252, y: 250 },
      { label: "Flatiron", x: 390, y: 276 }
    ],
    anchor_points: [
      { label: "Midtown", x: 418, y: 130, color: nycColors.yellow },
      { label: "Hudson Yards", x: 190, y: 116, color: nycColors.green },
      { label: "NoMad", x: 394, y: 218, color: nycColors.blue },
      { label: "Chelsea", x: 252, y: 250, color: nycColors.purple }
    ]
  }),

  nycHero("nomad", {
    title: "NoMad",
    subtitle: "Midtown South district with office, hospitality, design, and mixed commercial context.",
    descriptor: "Near Flatiron, Midtown, Chelsea, and Union Square.",
    orientation_label: "Midtown South",
    accessibility_label: "Central Manhattan district",
    accessibility_note: "Useful for comparing Midtown South office and mixed-use commercial districts.",
    approximate_polygon: "326,166 438,156 480,218 444,278 334,286 292,226",
    label_position: { x: 386, y: 224 },
    nearby_landmarks: [
      { label: "Flatiron", time: "4 min", color: nycColors.green },
      { label: "Midtown", time: "8 min", color: nycColors.yellow },
      { label: "Chelsea", time: "8 min", color: nycColors.blue },
      { label: "Union Square", time: "8 min", color: nycColors.purple }
    ],
    nearby_districts: [
      { label: "Flatiron", x: 390, y: 274, emphasis: true },
      { label: "Midtown", x: 396, y: 128 },
      { label: "Chelsea", x: 252, y: 248 },
      { label: "Union Square", x: 392, y: 312 },
      { label: "SoHo", x: 354, y: 388 }
    ],
    anchor_points: [
      { label: "Flatiron", x: 390, y: 274, color: nycColors.green },
      { label: "Midtown", x: 396, y: 128, color: nycColors.yellow },
      { label: "Chelsea", x: 252, y: 248, color: nycColors.blue },
      { label: "Union Square", x: 392, y: 312, color: nycColors.purple }
    ]
  }),

  nycHero("union-square", {
    title: "Union Square",
    subtitle: "Central downtown Manhattan district with retail, office, education, and mixed-use context.",
    descriptor: "Near Flatiron, Greenwich Village, SoHo, and NoMad.",
    orientation_label: "Downtown Manhattan",
    accessibility_label: "Central downtown district",
    accessibility_note: "Useful for comparing Midtown South and lower Manhattan commercial neighborhoods.",
    approximate_polygon: "326,270 430,258 472,314 438,374 332,382 292,326",
    label_position: { x: 384, y: 326 },
    nearby_landmarks: [
      { label: "Flatiron", time: "5 min", color: nycColors.green },
      { label: "NoMad", time: "8 min", color: nycColors.yellow },
      { label: "SoHo", time: "10 min", color: nycColors.blue },
      { label: "Chelsea", time: "10 min", color: nycColors.purple }
    ],
    nearby_districts: [
      { label: "Flatiron", x: 390, y: 250, emphasis: true },
      { label: "NoMad", x: 392, y: 212 },
      { label: "SoHo", x: 354, y: 392 },
      { label: "Chelsea", x: 252, y: 254 },
      { label: "Financial District", x: 404, y: 590 }
    ],
    anchor_points: [
      { label: "Flatiron", x: 390, y: 250, color: nycColors.green },
      { label: "NoMad", x: 392, y: 212, color: nycColors.yellow },
      { label: "SoHo", x: 354, y: 392, color: nycColors.blue },
      { label: "Chelsea", x: 252, y: 254, color: nycColors.purple }
    ]
  }),

  nycHero("dumbo", {
    title: "DUMBO",
    subtitle: "Brooklyn waterfront district with creative office, design, retail, and bridge-access context.",
    descriptor: "Near Downtown Brooklyn, Brooklyn Navy Yard, Williamsburg, and Lower Manhattan.",
    orientation_label: "Brooklyn waterfront",
    accessibility_label: "Brooklyn waterfront district",
    accessibility_note: "Useful for comparing Brooklyn waterfront and Downtown Brooklyn commercial areas.",
    approximate_polygon: "604,500 704,486 746,540 714,600 612,606 566,548",
    label_position: { x: 660, y: 550 },
    nearby_landmarks: [
      { label: "Downtown Brooklyn", time: "5 min", color: nycColors.yellow },
      { label: "Navy Yard", time: "8 min", color: nycColors.green },
      { label: "Financial District", time: "12 min", color: nycColors.blue },
      { label: "Williamsburg", time: "14 min", color: nycColors.purple }
    ],
    nearby_districts: [
      { label: "Downtown Brooklyn", x: 722, y: 620, emphasis: true },
      { label: "Navy Yard", x: 752, y: 450 },
      { label: "Williamsburg", x: 710, y: 320 },
      { label: "Financial District", x: 402, y: 590 },
      { label: "East River", x: 610, y: 330 }
    ],
    anchor_points: [
      { label: "Downtown Brooklyn", x: 724, y: 620, color: nycColors.yellow },
      { label: "Navy Yard", x: 752, y: 450, color: nycColors.green },
      { label: "Financial District", x: 404, y: 590, color: nycColors.blue },
      { label: "Williamsburg", x: 710, y: 320, color: nycColors.purple }
    ]
  }),

  nycHero("williamsburg", {
    title: "Williamsburg",
    subtitle: "North Brooklyn district with creative office, retail, food, and waterfront commercial context.",
    descriptor: "Near Greenpoint, DUMBO, Brooklyn Navy Yard, and Manhattan's east side.",
    orientation_label: "North Brooklyn",
    accessibility_label: "North Brooklyn district",
    accessibility_note: "Useful for comparing creative, retail, and waterfront-oriented Brooklyn districts.",
    approximate_polygon: "626,230 770,214 836,300 806,410 656,420 586,326",
    label_position: { x: 714, y: 326 },
    nearby_landmarks: [
      { label: "Greenpoint", time: "6 min", color: nycColors.green },
      { label: "Navy Yard", time: "8 min", color: nycColors.yellow },
      { label: "DUMBO", time: "14 min", color: nycColors.purple },
      { label: "Downtown Brooklyn", time: "15 min", color: nycColors.blue }
    ],
    nearby_districts: [
      { label: "Greenpoint", x: 732, y: 198, emphasis: true },
      { label: "Navy Yard", x: 748, y: 450 },
      { label: "DUMBO", x: 652, y: 548 },
      { label: "Downtown Brooklyn", x: 724, y: 620 },
      { label: "East River", x: 606, y: 300 }
    ],
    anchor_points: [
      { label: "Greenpoint", x: 732, y: 198, color: nycColors.green },
      { label: "Navy Yard", x: 748, y: 450, color: nycColors.yellow },
      { label: "DUMBO", x: 652, y: 548, color: nycColors.purple },
      { label: "Downtown Brooklyn", x: 724, y: 620, color: nycColors.blue }
    ]
  }),

  nycHero("downtown-brooklyn", {
    title: "Downtown Brooklyn",
    subtitle: "Brooklyn business district with office, civic, retail, education, and transit context.",
    descriptor: "Near DUMBO, Brooklyn Heights, Fort Greene, and Boerum Hill.",
    orientation_label: "Central Brooklyn",
    accessibility_label: "Brooklyn business district",
    accessibility_note: "Useful for comparing Brooklyn's central commercial districts and nearby waterfront areas.",
    approximate_polygon: "654,560 786,548 846,624 806,704 666,704 604,626",
    label_position: { x: 728, y: 634 },
    nearby_landmarks: [
      { label: "DUMBO", time: "5 min", color: nycColors.purple },
      { label: "Fort Greene", time: "6 min", color: nycColors.green },
      { label: "Gowanus", time: "10 min", color: nycColors.blue },
      { label: "Financial District", time: "15 min", color: nycColors.yellow }
    ],
    nearby_districts: [
      { label: "DUMBO", x: 650, y: 548, emphasis: true },
      { label: "Fort Greene", x: 812, y: 522 },
      { label: "Gowanus", x: 780, y: 690 },
      { label: "Financial District", x: 402, y: 590 },
      { label: "Brooklyn", x: 760, y: 626 }
    ],
    anchor_points: [
      { label: "DUMBO", x: 650, y: 548, color: nycColors.purple },
      { label: "Fort Greene", x: 812, y: 522, color: nycColors.green },
      { label: "Gowanus", x: 780, y: 690, color: nycColors.blue },
      { label: "Financial District", x: 402, y: 590, color: nycColors.yellow }
    ]
  }),

  nycHero("brooklyn-navy-yard", {
    title: "Brooklyn Navy Yard",
    subtitle: "Brooklyn industrial and creative production district near the East River waterfront.",
    descriptor: "Near DUMBO, Williamsburg, Downtown Brooklyn, and Fort Greene.",
    orientation_label: "Brooklyn waterfront",
    accessibility_label: "Production district",
    accessibility_note: "Useful for comparing industrial, production, and creative commercial districts in Brooklyn.",
    approximate_polygon: "700,396 834,382 884,452 846,526 708,528 648,456",
    label_position: { x: 772, y: 462 },
    nearby_landmarks: [
      { label: "DUMBO", time: "8 min", color: nycColors.purple },
      { label: "Williamsburg", time: "8 min", color: nycColors.green },
      { label: "Downtown Brooklyn", time: "10 min", color: nycColors.yellow },
      { label: "Fort Greene", time: "6 min", color: nycColors.blue }
    ],
    nearby_districts: [
      { label: "DUMBO", x: 650, y: 548 },
      { label: "Williamsburg", x: 716, y: 320, emphasis: true },
      { label: "Downtown Brooklyn", x: 728, y: 626 },
      { label: "Fort Greene", x: 820, y: 538 },
      { label: "East River", x: 606, y: 300 }
    ],
    anchor_points: [
      { label: "DUMBO", x: 650, y: 548, color: nycColors.purple },
      { label: "Williamsburg", x: 716, y: 320, color: nycColors.green },
      { label: "Downtown Brooklyn", x: 728, y: 626, color: nycColors.yellow },
      { label: "Fort Greene", x: 820, y: 538, color: nycColors.blue }
    ]
  }),

  nycHero("gowanus", {
    title: "Gowanus",
    subtitle: "Brooklyn district with light industrial, creative, retail, and mixed commercial context.",
    descriptor: "Near Downtown Brooklyn, Park Slope, Carroll Gardens, and Red Hook.",
    orientation_label: "South Brooklyn",
    accessibility_label: "Mixed commercial district",
    accessibility_note: "Useful for comparing Brooklyn light industrial, creative, and neighborhood commercial areas.",
    approximate_polygon: "706,610 820,600 876,670 838,720 706,720 654,662",
    label_position: { x: 766, y: 666 },
    nearby_landmarks: [
      { label: "Downtown Brooklyn", time: "10 min", color: nycColors.yellow },
      { label: "Park Slope", time: "6 min", color: nycColors.green },
      { label: "Red Hook", time: "8 min", color: nycColors.purple },
      { label: "DUMBO", time: "12 min", color: nycColors.blue }
    ],
    nearby_districts: [
      { label: "Downtown Brooklyn", x: 728, y: 610, emphasis: true },
      { label: "Park Slope", x: 826, y: 690 },
      { label: "Red Hook", x: 640, y: 688 },
      { label: "DUMBO", x: 650, y: 548 },
      { label: "Brooklyn", x: 764, y: 626 }
    ],
    anchor_points: [
      { label: "Downtown Brooklyn", x: 728, y: 610, color: nycColors.yellow },
      { label: "Park Slope", x: 826, y: 690, color: nycColors.green },
      { label: "Red Hook", x: 640, y: 688, color: nycColors.purple },
      { label: "DUMBO", x: 650, y: 548, color: nycColors.blue }
    ]
  })
]);
