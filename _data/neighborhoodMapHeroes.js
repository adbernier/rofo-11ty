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
  })
]);
