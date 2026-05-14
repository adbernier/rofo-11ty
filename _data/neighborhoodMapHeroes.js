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

function nycSimpleHero(slug, config) {
  const nearby = config.nearby || [];

  return nycHero(slug, {
    title: config.title,
    subtitle: config.subtitle,
    descriptor: config.descriptor,
    orientation_label: config.orientation_label,
    accessibility_label: config.accessibility_label || config.orientation_label,
    accessibility_note:
      config.accessibility_note ||
      `Useful for comparing ${config.title} with nearby New York commercial districts.`,
    approximate_polygon: config.approximate_polygon,
    label_position: config.label_position,
    nearby_landmarks: nearby.slice(0, 4).map((item, index) => ({
      label: item.label,
      time: item.time || item.note || "nearby",
      color: item.color || Object.values(nycColors)[index % 4]
    })),
    nearby_districts: (config.nearby_districts || nearby).slice(0, 5).map((item, index) => ({
      label: item.label,
      x: item.x,
      y: item.y,
      emphasis: index === 0
    })),
    anchor_points: (config.anchor_points || nearby).slice(0, 4).map((item, index) => ({
      label: item.label,
      x: item.x,
      y: item.y,
      color: item.color || Object.values(nycColors)[index % 4]
    }))
  });
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
  }),

  nycSimpleHero("midtown-south", {
    title: "Midtown South",
    subtitle: "Central Manhattan commercial area connecting office, design, retail, and mixed-use districts.",
    descriptor: "Near NoMad, Flatiron, Chelsea, and the Garment District.",
    orientation_label: "Midtown South",
    approximate_polygon: "262,158 470,146 520,270 462,362 278,354 214,238",
    label_position: { x: 368, y: 260 },
    nearby: [
      { label: "NoMad", x: 392, y: 214 },
      { label: "Flatiron", x: 392, y: 274 },
      { label: "Chelsea", x: 248, y: 250 },
      { label: "Garment District", x: 300, y: 164 }
    ]
  }),

  nycSimpleHero("times-square", {
    title: "Times Square",
    subtitle: "Midtown district with hospitality, entertainment, office, and visitor-serving commercial context.",
    descriptor: "Near Midtown, the Garment District, Hell's Kitchen, and Penn District.",
    orientation_label: "West Midtown",
    approximate_polygon: "278,64 398,58 448,126 410,196 284,202 238,132",
    label_position: { x: 342, y: 132 },
    nearby: [
      { label: "Midtown", x: 420, y: 130 },
      { label: "Garment District", x: 300, y: 178 },
      { label: "Hell's Kitchen", x: 214, y: 126 },
      { label: "Hudson Yards", x: 188, y: 116 }
    ]
  }),

  nycSimpleHero("east-midtown", {
    title: "East Midtown",
    subtitle: "East side Manhattan office district with enterprise, professional services, and transit context.",
    descriptor: "Near Midtown, Murray Hill, Plaza District, and the East River.",
    orientation_label: "East Midtown",
    approximate_polygon: "420,78 536,70 586,150 540,232 424,230 378,150",
    label_position: { x: 486, y: 152 },
    nearby: [
      { label: "Midtown", x: 382, y: 130 },
      { label: "Murray Hill", x: 478, y: 238 },
      { label: "Plaza District", x: 458, y: 76 },
      { label: "East River", x: 612, y: 220 }
    ]
  }),

  nycSimpleHero("plaza-district", {
    title: "Plaza District",
    subtitle: "Central Midtown office district with institutional, hospitality, and professional services context.",
    descriptor: "Near Midtown, East Midtown, Times Square, and the Upper East Side.",
    orientation_label: "Central Midtown",
    approximate_polygon: "370,22 506,18 558,80 522,142 382,146 326,84",
    label_position: { x: 446, y: 84 },
    nearby: [
      { label: "Midtown", x: 392, y: 148 },
      { label: "East Midtown", x: 500, y: 162 },
      { label: "Times Square", x: 310, y: 130 },
      { label: "Upper East Side", x: 512, y: 48 }
    ]
  }),

  nycSimpleHero("noho", {
    title: "NoHo",
    subtitle: "Lower Manhattan district with boutique office, retail, creative, and mixed commercial context.",
    descriptor: "Near SoHo, Greenwich Village, East Village, and Union Square.",
    orientation_label: "Downtown Manhattan",
    approximate_polygon: "344,292 438,284 472,332 440,384 346,388 306,338",
    label_position: { x: 390, y: 342 },
    nearby: [
      { label: "SoHo", x: 354, y: 392 },
      { label: "Union Square", x: 392, y: 304 },
      { label: "East Village", x: 480, y: 350 },
      { label: "Greenwich Village", x: 286, y: 330 }
    ]
  }),

  nycSimpleHero("murray-hill", {
    title: "Murray Hill",
    subtitle: "East side Manhattan district with office, professional services, residential, and neighborhood retail context.",
    descriptor: "Near East Midtown, Kips Bay, Midtown, and the East River.",
    orientation_label: "East side Manhattan",
    approximate_polygon: "406,190 526,184 574,254 532,324 410,326 364,252",
    label_position: { x: 470, y: 256 },
    nearby: [
      { label: "East Midtown", x: 500, y: 162 },
      { label: "Kips Bay", x: 486, y: 326 },
      { label: "Midtown", x: 386, y: 146 },
      { label: "East River", x: 612, y: 220 }
    ]
  }),

  nycSimpleHero("greenwich-village", {
    title: "Greenwich Village",
    subtitle: "Lower Manhattan neighborhood with retail, office, education, hospitality, and mixed-use context.",
    descriptor: "Near West Village, NoHo, SoHo, and Union Square.",
    orientation_label: "Lower Manhattan",
    approximate_polygon: "234,288 350,276 398,336 358,410 244,414 190,344",
    label_position: { x: 294, y: 348 },
    nearby: [
      { label: "West Village", x: 232, y: 346 },
      { label: "NoHo", x: 390, y: 342 },
      { label: "SoHo", x: 354, y: 392 },
      { label: "Union Square", x: 392, y: 304 }
    ]
  }),

  nycSimpleHero("industry-city", {
    title: "Industry City",
    subtitle: "Brooklyn waterfront commercial district with production, creative, retail, and light industrial context.",
    descriptor: "Near Sunset Park, Greenwood, Red Hook, and Gowanus.",
    orientation_label: "South Brooklyn waterfront",
    approximate_polygon: "662,650 780,634 846,704 820,720 666,720 610,690",
    label_position: { x: 742, y: 690 },
    nearby: [
      { label: "Sunset Park", x: 792, y: 700 },
      { label: "Greenwood", x: 780, y: 650 },
      { label: "Red Hook", x: 640, y: 688 },
      { label: "Gowanus", x: 766, y: 666 }
    ]
  }),

  nycSimpleHero("meatpacking-district", {
    title: "Meatpacking District",
    subtitle: "Lower west side district with retail, hospitality, showroom, and office-adjacent commercial context.",
    descriptor: "Near Chelsea, West Village, Hudson Yards, and the Hudson River.",
    orientation_label: "Lower west side",
    approximate_polygon: "164,246 276,236 324,296 288,358 174,362 126,300",
    label_position: { x: 226, y: 304 },
    nearby: [
      { label: "Chelsea", x: 252, y: 244 },
      { label: "West Village", x: 230, y: 350 },
      { label: "Hudson River", x: 92, y: 260 },
      { label: "Flatiron", x: 392, y: 274 }
    ]
  }),

  nycSimpleHero("penn-district", {
    title: "Penn District",
    subtitle: "West Midtown district with office, transit, hospitality, and mixed commercial context.",
    descriptor: "Near the Garment District, Hudson Yards, Chelsea, and Midtown.",
    orientation_label: "West Midtown",
    approximate_polygon: "208,118 334,108 382,174 344,238 216,244 168,178",
    label_position: { x: 276, y: 180 },
    nearby: [
      { label: "Garment District", x: 306, y: 164 },
      { label: "Hudson Yards", x: 190, y: 116 },
      { label: "Chelsea", x: 252, y: 246 },
      { label: "Midtown", x: 410, y: 130 }
    ]
  }),

  nycSimpleHero("harlem", {
    title: "Harlem",
    subtitle: "Upper Manhattan district with neighborhood retail, office, cultural, and institutional context.",
    descriptor: "Near East Harlem, Upper West Side, Washington Heights, and the Upper East Side.",
    orientation_label: "Upper Manhattan",
    approximate_polygon: "274,0 474,0 540,52 506,118 308,126 232,62",
    label_position: { x: 390, y: 62 },
    nearby: [
      { label: "East Harlem", x: 520, y: 92 },
      { label: "Upper West Side", x: 238, y: 92 },
      { label: "Upper East Side", x: 520, y: 48 },
      { label: "Midtown", x: 392, y: 148 }
    ]
  }),

  nycSimpleHero("upper-east-side", {
    title: "Upper East Side",
    subtitle: "Upper Manhattan district with medical, retail, professional, and neighborhood commercial context.",
    descriptor: "Near East Midtown, Plaza District, East Harlem, and Central Park.",
    orientation_label: "Upper east side",
    approximate_polygon: "456,0 596,0 640,92 588,174 474,146 432,62",
    label_position: { x: 532, y: 78 },
    nearby: [
      { label: "East Midtown", x: 500, y: 162 },
      { label: "Plaza District", x: 446, y: 84 },
      { label: "East Harlem", x: 540, y: 96 },
      { label: "Midtown", x: 392, y: 148 }
    ]
  }),

  nycSimpleHero("west-village", {
    title: "West Village",
    subtitle: "Lower west side neighborhood with retail, hospitality, boutique office, and mixed-use context.",
    descriptor: "Near Greenwich Village, SoHo, Tribeca, and Chelsea.",
    orientation_label: "Lower west side",
    approximate_polygon: "180,322 288,308 336,374 300,450 190,456 138,386",
    label_position: { x: 238, y: 386 },
    nearby: [
      { label: "Greenwich Village", x: 300, y: 348 },
      { label: "SoHo", x: 354, y: 392 },
      { label: "Tribeca", x: 294, y: 478 },
      { label: "Chelsea", x: 252, y: 246 }
    ]
  }),

  nycSimpleHero("chinatown", {
    title: "Chinatown",
    subtitle: "Lower Manhattan neighborhood with retail, food, office-adjacent, and neighborhood-serving commercial context.",
    descriptor: "Near Civic Center, Lower East Side, SoHo, and the Financial District.",
    orientation_label: "Lower Manhattan",
    approximate_polygon: "372,408 488,398 532,462 496,532 380,536 332,468",
    label_position: { x: 430, y: 470 },
    nearby: [
      { label: "Lower East Side", x: 500, y: 392 },
      { label: "Civic Center", x: 404, y: 520 },
      { label: "SoHo", x: 354, y: 392 },
      { label: "Financial District", x: 404, y: 590 }
    ]
  }),

  nycSimpleHero("civic-center", {
    title: "Civic Center",
    subtitle: "Lower Manhattan civic district with office, institutional, legal, and neighborhood commercial context.",
    descriptor: "Near Chinatown, Tribeca, SoHo, and the Financial District.",
    orientation_label: "Lower Manhattan",
    approximate_polygon: "330,462 456,448 506,516 470,596 342,600 286,528",
    label_position: { x: 398, y: 530 },
    nearby: [
      { label: "Financial District", x: 404, y: 590 },
      { label: "Chinatown", x: 430, y: 470 },
      { label: "Tribeca", x: 294, y: 478 },
      { label: "SoHo", x: 354, y: 392 }
    ]
  }),

  nycSimpleHero("east-village", {
    title: "East Village",
    subtitle: "Lower Manhattan neighborhood with retail, food, creative, and mixed-use commercial context.",
    descriptor: "Near NoHo, Union Square, Lower East Side, and Greenwich Village.",
    orientation_label: "Downtown Manhattan",
    approximate_polygon: "416,306 526,296 574,360 538,432 424,436 374,366",
    label_position: { x: 478, y: 370 },
    nearby: [
      { label: "NoHo", x: 390, y: 342 },
      { label: "Union Square", x: 392, y: 304 },
      { label: "Lower East Side", x: 500, y: 412 },
      { label: "Greenwich Village", x: 300, y: 348 }
    ]
  }),

  nycSimpleHero("gramercy", {
    title: "Gramercy",
    subtitle: "Central Manhattan neighborhood with office, residential, retail, and professional services context.",
    descriptor: "Near Union Square, Flatiron, Kips Bay, and NoMad.",
    orientation_label: "Central Manhattan",
    approximate_polygon: "398,236 504,228 548,292 512,356 402,360 356,296",
    label_position: { x: 456, y: 296 },
    nearby: [
      { label: "Union Square", x: 392, y: 304 },
      { label: "Flatiron", x: 390, y: 274 },
      { label: "Kips Bay", x: 486, y: 326 },
      { label: "NoMad", x: 392, y: 214 }
    ]
  }),

  nycSimpleHero("greenpoint", {
    title: "Greenpoint",
    subtitle: "North Brooklyn neighborhood with creative office, retail, production, and waterfront context.",
    descriptor: "Near Williamsburg, East Williamsburg, Brooklyn Navy Yard, and the East River.",
    orientation_label: "North Brooklyn",
    approximate_polygon: "666,112 812,100 880,188 844,284 690,292 612,198",
    label_position: { x: 746, y: 198 },
    nearby: [
      { label: "Williamsburg", x: 716, y: 326 },
      { label: "East Williamsburg", x: 824, y: 332 },
      { label: "Navy Yard", x: 772, y: 462 },
      { label: "East River", x: 606, y: 300 }
    ]
  }),

  nycSimpleHero("hells-kitchen", {
    title: "Hell's Kitchen",
    subtitle: "West Midtown neighborhood with hospitality, office, entertainment, and neighborhood retail context.",
    descriptor: "Near Times Square, Midtown, Hudson Yards, and the Hudson River.",
    orientation_label: "West Midtown",
    approximate_polygon: "156,42 292,36 348,118 310,206 174,210 112,122",
    label_position: { x: 230, y: 128 },
    nearby: [
      { label: "Times Square", x: 342, y: 132 },
      { label: "Midtown", x: 392, y: 148 },
      { label: "Hudson Yards", x: 190, y: 116 },
      { label: "Hudson River", x: 92, y: 150 }
    ]
  }),

  nycSimpleHero("lower-east-side", {
    title: "Lower East Side",
    subtitle: "Lower Manhattan neighborhood with retail, food, nightlife, creative, and mixed-use context.",
    descriptor: "Near East Village, Chinatown, SoHo, and the East River.",
    orientation_label: "Lower east side",
    approximate_polygon: "458,366 566,354 614,430 574,514 466,516 418,436",
    label_position: { x: 520, y: 440 },
    nearby: [
      { label: "East Village", x: 478, y: 370 },
      { label: "Chinatown", x: 430, y: 470 },
      { label: "SoHo", x: 354, y: 392 },
      { label: "East River", x: 612, y: 420 }
    ]
  }),

  nycSimpleHero("sunset-park", {
    title: "Sunset Park",
    subtitle: "South Brooklyn district with industrial, production, waterfront, and neighborhood retail context.",
    descriptor: "Near Industry City, Greenwood, Red Hook, and Gowanus.",
    orientation_label: "South Brooklyn",
    approximate_polygon: "730,650 882,630 920,704 900,720 742,720 678,688",
    label_position: { x: 820, y: 690 },
    nearby: [
      { label: "Industry City", x: 742, y: 690 },
      { label: "Greenwood", x: 780, y: 650 },
      { label: "Red Hook", x: 640, y: 688 },
      { label: "Gowanus", x: 766, y: 666 }
    ]
  }),

  nycSimpleHero("brooklyn-heights", {
    title: "Brooklyn Heights",
    subtitle: "Brooklyn waterfront neighborhood with office-adjacent, retail, civic, and mixed-use context.",
    descriptor: "Near DUMBO, Downtown Brooklyn, Cobble Hill, and Lower Manhattan.",
    orientation_label: "Brooklyn waterfront",
    approximate_polygon: "574,558 682,546 728,610 692,682 582,686 530,620",
    label_position: { x: 636, y: 620 },
    nearby: [
      { label: "DUMBO", x: 650, y: 548 },
      { label: "Downtown Brooklyn", x: 728, y: 620 },
      { label: "Cobble Hill", x: 688, y: 680 },
      { label: "Financial District", x: 404, y: 590 }
    ]
  }),

  nycSimpleHero("bushwick", {
    title: "Bushwick",
    subtitle: "Brooklyn neighborhood with creative, industrial, retail, and mixed commercial context.",
    descriptor: "Near East Williamsburg, Williamsburg, Bedford-Stuyvesant, and Crown Heights.",
    orientation_label: "East Brooklyn",
    approximate_polygon: "786,250 920,246 920,372 856,434 764,402 730,318",
    label_position: { x: 848, y: 344 },
    nearby: [
      { label: "East Williamsburg", x: 824, y: 332 },
      { label: "Williamsburg", x: 716, y: 326 },
      { label: "Bed-Stuy", x: 824, y: 520 },
      { label: "Crown Heights", x: 846, y: 626 }
    ]
  }),

  nycSimpleHero("kips-bay", {
    title: "Kips Bay",
    subtitle: "East side Manhattan neighborhood with medical, office, retail, and residential commercial context.",
    descriptor: "Near Gramercy, Murray Hill, East Midtown, and the East River.",
    orientation_label: "East side Manhattan",
    approximate_polygon: "422,294 538,286 586,352 546,426 430,428 380,358",
    label_position: { x: 484, y: 362 },
    nearby: [
      { label: "Gramercy", x: 456, y: 296 },
      { label: "Murray Hill", x: 470, y: 256 },
      { label: "East Midtown", x: 500, y: 162 },
      { label: "East River", x: 612, y: 350 }
    ]
  }),

  nycSimpleHero("east-harlem", {
    title: "East Harlem",
    subtitle: "Upper Manhattan neighborhood with medical, civic, retail, and neighborhood-serving commercial context.",
    descriptor: "Near Harlem, Upper East Side, and the East River.",
    orientation_label: "Upper east side",
    approximate_polygon: "470,0 626,0 682,72 638,156 500,150 434,74",
    label_position: { x: 554, y: 78 },
    nearby: [
      { label: "Harlem", x: 390, y: 62 },
      { label: "Upper East Side", x: 532, y: 78 },
      { label: "East River", x: 612, y: 120 },
      { label: "Midtown", x: 392, y: 148 }
    ]
  }),

  nycSimpleHero("east-williamsburg", {
    title: "East Williamsburg",
    subtitle: "Brooklyn district with creative, production, light industrial, and mixed commercial context.",
    descriptor: "Near Williamsburg, Greenpoint, Bushwick, and Bedford-Stuyvesant.",
    orientation_label: "North Brooklyn",
    approximate_polygon: "746,284 886,276 920,352 876,446 748,430 690,354",
    label_position: { x: 824, y: 360 },
    nearby: [
      { label: "Williamsburg", x: 716, y: 326 },
      { label: "Greenpoint", x: 746, y: 198 },
      { label: "Bushwick", x: 848, y: 344 },
      { label: "Bed-Stuy", x: 824, y: 520 }
    ]
  }),

  nycSimpleHero("fort-greene", {
    title: "Fort Greene",
    subtitle: "Brooklyn neighborhood with office-adjacent, civic, arts, retail, and mixed-use context.",
    descriptor: "Near Downtown Brooklyn, Clinton Hill, Brooklyn Navy Yard, and Prospect Heights.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "756,486 866,474 912,538 876,606 764,610 716,548",
    label_position: { x: 818, y: 546 },
    nearby: [
      { label: "Downtown Brooklyn", x: 728, y: 620 },
      { label: "Navy Yard", x: 772, y: 462 },
      { label: "Clinton Hill", x: 850, y: 490 },
      { label: "Prospect Heights", x: 842, y: 596 }
    ]
  }),

  nycSimpleHero("red-hook", {
    title: "Red Hook",
    subtitle: "Brooklyn waterfront district with industrial, creative, retail, and logistics-oriented context.",
    descriptor: "Near Gowanus, Carroll Gardens, Sunset Park, and the Brooklyn waterfront.",
    orientation_label: "Brooklyn waterfront",
    approximate_polygon: "554,632 682,616 744,688 706,720 572,720 514,682",
    label_position: { x: 632, y: 686 },
    nearby: [
      { label: "Gowanus", x: 766, y: 666 },
      { label: "Carroll Gardens", x: 704, y: 650 },
      { label: "Sunset Park", x: 820, y: 690 },
      { label: "Downtown Brooklyn", x: 728, y: 620 }
    ]
  }),

  nycSimpleHero("upper-west-side", {
    title: "Upper West Side",
    subtitle: "Upper Manhattan neighborhood with retail, education, cultural, and professional services context.",
    descriptor: "Near Hell's Kitchen, Midtown, Harlem, and the west side waterfront.",
    orientation_label: "Upper west side",
    approximate_polygon: "170,0 324,0 382,78 334,164 190,154 126,74",
    label_position: { x: 250, y: 82 },
    nearby: [
      { label: "Harlem", x: 390, y: 62 },
      { label: "Hell's Kitchen", x: 230, y: 128 },
      { label: "Midtown", x: 392, y: 148 },
      { label: "Hudson River", x: 92, y: 150 }
    ]
  }),

  nycSimpleHero("bedford-stuyvesant", {
    title: "Bedford-Stuyvesant",
    subtitle: "Brooklyn neighborhood with neighborhood retail, creative, office-adjacent, and mixed-use context.",
    descriptor: "Near Clinton Hill, Bushwick, Crown Heights, and Williamsburg.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "760,454 920,444 920,574 850,626 742,588 704,512",
    label_position: { x: 826, y: 532 },
    nearby: [
      { label: "Clinton Hill", x: 850, y: 490 },
      { label: "Bushwick", x: 848, y: 344 },
      { label: "Crown Heights", x: 846, y: 626 },
      { label: "Fort Greene", x: 818, y: 546 }
    ]
  }),

  nycSimpleHero("boerum-hill", {
    title: "Boerum Hill",
    subtitle: "Brooklyn neighborhood with retail, office-adjacent, residential, and mixed-use commercial context.",
    descriptor: "Near Downtown Brooklyn, Cobble Hill, Gowanus, and Fort Greene.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "676,600 788,590 836,650 798,720 686,714 636,656",
    label_position: { x: 736, y: 656 },
    nearby: [
      { label: "Downtown Brooklyn", x: 728, y: 620 },
      { label: "Cobble Hill", x: 688, y: 680 },
      { label: "Gowanus", x: 766, y: 666 },
      { label: "Fort Greene", x: 818, y: 546 }
    ]
  }),

  nycSimpleHero("clinton-hill", {
    title: "Clinton Hill",
    subtitle: "Brooklyn neighborhood with creative, institutional, retail, and office-adjacent context.",
    descriptor: "Near Fort Greene, Brooklyn Navy Yard, Bedford-Stuyvesant, and Williamsburg.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "806,434 920,428 920,536 854,586 764,556 724,488",
    label_position: { x: 856, y: 504 },
    nearby: [
      { label: "Fort Greene", x: 818, y: 546 },
      { label: "Navy Yard", x: 772, y: 462 },
      { label: "Bed-Stuy", x: 826, y: 532 },
      { label: "Williamsburg", x: 716, y: 326 }
    ]
  }),

  nycSimpleHero("cobble-hill", {
    title: "Cobble Hill",
    subtitle: "Brooklyn neighborhood with neighborhood retail, services, food, and mixed-use commercial context.",
    descriptor: "Near Brooklyn Heights, Boerum Hill, Carroll Gardens, and Gowanus.",
    orientation_label: "West Brooklyn",
    approximate_polygon: "626,626 734,614 786,676 752,720 634,720 586,682",
    label_position: { x: 688, y: 680 },
    nearby: [
      { label: "Boerum Hill", x: 736, y: 656 },
      { label: "Brooklyn Heights", x: 636, y: 620 },
      { label: "Carroll Gardens", x: 704, y: 650 },
      { label: "Gowanus", x: 766, y: 666 }
    ]
  }),

  nycSimpleHero("crown-heights", {
    title: "Crown Heights",
    subtitle: "Brooklyn neighborhood with retail corridors, services, mixed-use, and neighborhood commercial context.",
    descriptor: "Near Prospect Heights, Bedford-Stuyvesant, Flatbush, and Park Slope.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "774,584 920,576 920,704 838,720 742,676 724,620",
    label_position: { x: 844, y: 650 },
    nearby: [
      { label: "Prospect Heights", x: 842, y: 596 },
      { label: "Bed-Stuy", x: 826, y: 532 },
      { label: "Flatbush", x: 852, y: 700 },
      { label: "Park Slope", x: 826, y: 690 }
    ]
  }),

  nycSimpleHero("greenwood", {
    title: "Greenwood",
    subtitle: "South Brooklyn area with industrial, production, service, and neighborhood commercial context.",
    descriptor: "Near Industry City, Sunset Park, Park Slope, and Gowanus.",
    orientation_label: "South Brooklyn",
    approximate_polygon: "728,618 856,604 912,678 874,720 736,720 680,666",
    label_position: { x: 794, y: 672 },
    nearby: [
      { label: "Industry City", x: 742, y: 690 },
      { label: "Sunset Park", x: 820, y: 690 },
      { label: "Park Slope", x: 826, y: 690 },
      { label: "Gowanus", x: 766, y: 666 }
    ]
  }),

  nycSimpleHero("park-slope", {
    title: "Park Slope",
    subtitle: "Brooklyn neighborhood with neighborhood retail, services, food, and mixed-use commercial context.",
    descriptor: "Near Gowanus, Prospect Heights, Greenwood, and Crown Heights.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "758,636 874,620 920,692 888,720 756,720 704,682",
    label_position: { x: 824, y: 686 },
    nearby: [
      { label: "Gowanus", x: 766, y: 666 },
      { label: "Prospect Heights", x: 842, y: 596 },
      { label: "Greenwood", x: 794, y: 672 },
      { label: "Crown Heights", x: 844, y: 650 }
    ]
  }),

  nycSimpleHero("prospect-heights", {
    title: "Prospect Heights",
    subtitle: "Brooklyn neighborhood with retail, cultural, office-adjacent, and mixed-use commercial context.",
    descriptor: "Near Fort Greene, Park Slope, Crown Heights, and Atlantic Avenue.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "778,544 894,532 920,600 880,666 772,658 728,596",
    label_position: { x: 842, y: 604 },
    nearby: [
      { label: "Fort Greene", x: 818, y: 546 },
      { label: "Park Slope", x: 826, y: 690 },
      { label: "Crown Heights", x: 844, y: 650 },
      { label: "Atlantic Avenue", x: 772, y: 604 }
    ]
  }),

  nycSimpleHero("washington-heights", {
    title: "Washington Heights",
    subtitle: "Upper Manhattan neighborhood with medical, retail, civic, and neighborhood-serving commercial context.",
    descriptor: "Near Harlem, Upper West Side, and northern Manhattan corridors.",
    orientation_label: "Northern Manhattan",
    approximate_polygon: "196,0 396,0 470,46 430,112 240,106 150,42",
    label_position: { x: 312, y: 50 },
    nearby: [
      { label: "Harlem", x: 390, y: 62 },
      { label: "Upper West Side", x: 250, y: 82 },
      { label: "East Harlem", x: 554, y: 78 },
      { label: "Hudson River", x: 92, y: 90 }
    ]
  }),

  nycSimpleHero("atlantic-avenue", {
    title: "Atlantic Avenue",
    subtitle: "Brooklyn corridor with retail, transit, office-adjacent, and mixed-use commercial context.",
    descriptor: "Near Downtown Brooklyn, Boerum Hill, Fort Greene, and Prospect Heights.",
    orientation_label: "Brooklyn corridor",
    approximate_polygon: "650,560 846,546 890,604 834,650 666,640 604,594",
    label_position: { x: 748, y: 604 },
    nearby: [
      { label: "Downtown Brooklyn", x: 728, y: 620 },
      { label: "Boerum Hill", x: 736, y: 656 },
      { label: "Fort Greene", x: 818, y: 546 },
      { label: "Prospect Heights", x: 842, y: 596 }
    ]
  }),

  nycSimpleHero("flatbush", {
    title: "Flatbush",
    subtitle: "Brooklyn neighborhood with retail corridors, services, civic, and neighborhood commercial context.",
    descriptor: "Near Crown Heights, Prospect Heights, Park Slope, and central Brooklyn.",
    orientation_label: "Central Brooklyn",
    approximate_polygon: "782,646 920,636 920,720 790,720 724,690",
    label_position: { x: 850, y: 696 },
    nearby: [
      { label: "Crown Heights", x: 844, y: 650 },
      { label: "Prospect Heights", x: 842, y: 596 },
      { label: "Park Slope", x: 826, y: 690 },
      { label: "Bed-Stuy", x: 826, y: 532 }
    ]
  }),

  nycSimpleHero("carroll-gardens", {
    title: "Carroll Gardens",
    subtitle: "Brooklyn neighborhood with retail, services, food, and mixed-use commercial context.",
    descriptor: "Near Cobble Hill, Gowanus, Boerum Hill, and Red Hook.",
    orientation_label: "West Brooklyn",
    approximate_polygon: "640,638 758,628 814,690 780,720 648,720 590,684",
    label_position: { x: 704, y: 682 },
    nearby: [
      { label: "Cobble Hill", x: 688, y: 680 },
      { label: "Gowanus", x: 766, y: 666 },
      { label: "Boerum Hill", x: 736, y: 656 },
      { label: "Red Hook", x: 632, y: 686 }
    ]
  }),

  nycSimpleHero("south-williamsburg", {
    title: "South Williamsburg",
    subtitle: "Brooklyn neighborhood with retail, creative, mixed-use, and light industrial context.",
    descriptor: "Near Williamsburg, DUMBO, East Williamsburg, and Brooklyn Navy Yard.",
    orientation_label: "North Brooklyn",
    approximate_polygon: "602,328 740,314 800,394 762,492 620,486 552,402",
    label_position: { x: 682, y: 408 },
    nearby: [
      { label: "Williamsburg", x: 716, y: 326 },
      { label: "East Williamsburg", x: 824, y: 360 },
      { label: "DUMBO", x: 650, y: 548 },
      { label: "Navy Yard", x: 772, y: 462 }
    ]
  }),

  nycSimpleHero("vinegar-hill", {
    title: "Vinegar Hill",
    subtitle: "Brooklyn waterfront area with creative, light industrial, and Downtown Brooklyn-adjacent context.",
    descriptor: "Near DUMBO, Brooklyn Navy Yard, Downtown Brooklyn, and the East River.",
    orientation_label: "Brooklyn waterfront",
    approximate_polygon: "644,468 752,456 802,520 766,584 654,590 604,528",
    label_position: { x: 704, y: 528 },
    nearby: [
      { label: "DUMBO", x: 650, y: 548 },
      { label: "Navy Yard", x: 772, y: 462 },
      { label: "Downtown Brooklyn", x: 728, y: 620 },
      { label: "East River", x: 610, y: 330 }
    ]
  })
]);
