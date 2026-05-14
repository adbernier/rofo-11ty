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
  })
]);
