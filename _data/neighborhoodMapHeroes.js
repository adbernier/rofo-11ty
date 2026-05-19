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

const bayAreaBase = {
  city_label: "Bay Area",
  basemap: "bay-area-pilot-v1",
  map_region_label: "San Francisco Bay",
  map_region_label_position: { x: 736, y: 260 },
  water_paths: [
    "M 664 0 C 620 92 628 188 680 276 C 742 382 724 516 664 720 H 920 V 0 Z"
  ],
  transit_or_freeway_labels: [
    { label: "BART", x: 410, y: 326 },
    { label: "101", x: 604, y: 510 },
    { label: "880", x: 330, y: 420 }
  ]
};

const bayAreaColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function bayAreaHero(citySlug, slug, config) {
  return [
    `CA/${citySlug}/${slug}`,
    {
      ...bayAreaBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in the Bay Area near surrounding commercial districts.`
    }
  ];
}

function bayAreaSimpleHero(citySlug, slug, config) {
  const nearby = config.nearby || [];

  return bayAreaHero(citySlug, slug, {
    title: config.title,
    subtitle: config.subtitle,
    descriptor: config.descriptor,
    orientation_label: config.orientation_label,
    accessibility_label: config.accessibility_label || config.orientation_label,
    accessibility_note:
      config.accessibility_note ||
      `Useful for comparing ${config.title} with nearby Bay Area commercial districts.`,
    approximate_polygon: config.approximate_polygon,
    label_position: config.label_position,
    nearby_landmarks: nearby.slice(0, 4).map((item, index) => ({
      label: item.label,
      time: item.time || item.note || "nearby",
      color: item.color || Object.values(bayAreaColors)[index % 4]
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
      color: item.color || Object.values(bayAreaColors)[index % 4]
    })),
    transit_or_freeway_labels: config.transit_or_freeway_labels || bayAreaBase.transit_or_freeway_labels
  });
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

const chicagoBase = {
  city_label: "Chicago",
  basemap: "chicago-central-v1",
  map_region_label: "Lake Michigan",
  map_region_label_position: { x: 724, y: 234 },
  water_paths: [
    "M 690 0 C 656 116 660 242 704 360 C 746 472 742 608 694 720 H 920 V 0 Z"
  ],
  transit_or_freeway_labels: [
    { label: "90/94", x: 330, y: 258 },
    { label: "290", x: 262, y: 430 },
    { label: "55", x: 354, y: 612 }
  ]
};

const chicagoColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function chicagoHero(slug, config) {
  return [
    `IL/chicago/${slug}`,
    {
      ...chicagoBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Chicago near surrounding commercial districts.`
    }
  ];
}

function chicagoSimpleHero(slug, config) {
  const nearby = config.nearby || [];

  return chicagoHero(slug, {
    title: config.title,
    subtitle: config.subtitle,
    descriptor: config.descriptor,
    orientation_label: config.orientation_label,
    accessibility_label: config.accessibility_label || config.orientation_label,
    accessibility_note:
      config.accessibility_note ||
      `Useful for comparing ${config.title} with nearby Chicago commercial districts.`,
    approximate_polygon: config.approximate_polygon,
    label_position: config.label_position,
    nearby_landmarks: nearby.slice(0, 4).map((item, index) => ({
      label: item.label,
      time: item.time || "nearby",
      color: item.color || Object.values(chicagoColors)[index % 4]
    })),
    nearby_districts: nearby.slice(0, 5).map((item, index) => ({
      label: item.label,
      x: item.x,
      y: item.y,
      emphasis: index === 0
    })),
    anchor_points: nearby.slice(0, 4).map((item, index) => ({
      label: item.label,
      x: item.x,
      y: item.y,
      color: item.color || Object.values(chicagoColors)[index % 4]
    }))
  });
}

const laBase = {
  city_label: "Los Angeles",
  basemap: "los-angeles-v1",
  map_region_label: "Westside",
  map_region_label_position: { x: 168, y: 360 },
  secondary_map_region_label: "Downtown",
  secondary_map_region_label_position: { x: 650, y: 320 },
  transit_or_freeway_labels: [
    { label: "10", x: 402, y: 422 },
    { label: "101", x: 536, y: 246 },
    { label: "110", x: 626, y: 410 },
    { label: "405", x: 246, y: 432 }
  ]
};

const laColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function laHero(slug, config) {
  return [
    `CA/los-angeles/${slug}`,
    {
      ...laBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Los Angeles near surrounding commercial districts.`
    }
  ];
}

function laSimpleHero(slug, config) {
  const nearby = config.nearby || [];

  return laHero(slug, {
    title: config.title,
    subtitle: config.subtitle,
    descriptor: config.descriptor,
    orientation_label: config.orientation_label,
    accessibility_label: config.accessibility_label || config.orientation_label,
    accessibility_note:
      config.accessibility_note ||
      `Useful for comparing ${config.title} with nearby Los Angeles commercial districts.`,
    approximate_polygon: config.approximate_polygon,
    label_position: config.label_position,
    nearby_landmarks: nearby.slice(0, 4).map((item, index) => ({
      label: item.label,
      time: item.time || "nearby",
      color: item.color || Object.values(laColors)[index % 4]
    })),
    nearby_districts: nearby.slice(0, 5).map((item, index) => ({
      label: item.label,
      x: item.x,
      y: item.y,
      emphasis: index === 0
    })),
    anchor_points: nearby.slice(0, 4).map((item, index) => ({
      label: item.label,
      x: item.x,
      y: item.y,
      color: item.color || Object.values(laColors)[index % 4]
    }))
  });
}

function boxPolygon(x, y, width = 128, height = 92) {
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;

  return `${left},${top + 18} ${x - 18},${top} ${right - 14},${top + 16} ${right},${y + 10} ${x + 18},${bottom} ${left + 12},${bottom - 12}`;
}

function compactCityHero(cityHero, colors, slug, config) {
  const nearby = (config.nearby || []).map((item, index) => ({
    ...item,
    color: item.color || Object.values(colors)[index % 4]
  }));

  return cityHero(slug, {
    title: config.title,
    subtitle: config.subtitle,
    descriptor: `Near ${nearby.map((item) => item.label).slice(0, 3).join(", ")}.`,
    orientation_label: config.orientation_label,
    accessibility_label: config.orientation_label,
    accessibility_note: `Useful for comparing ${config.title} with nearby commercial areas.`,
    approximate_polygon: boxPolygon(config.x, config.y, config.width, config.height),
    label_position: { x: config.x, y: config.y + 6 },
    nearby_landmarks: nearby.slice(0, 4).map((item) => ({
      label: item.label,
      time: "nearby",
      color: item.color
    })),
    nearby_districts: nearby.slice(0, 5).map((item, index) => ({
      label: item.label,
      x: item.x,
      y: item.y,
      emphasis: index === 0
    })),
    anchor_points: nearby.slice(0, 4)
  });
}

function chicagoCompactHero(slug, config) {
  return compactCityHero(chicagoHero, chicagoColors, slug, config);
}

function laCompactHero(slug, config) {
  return compactCityHero(laHero, laColors, slug, config);
}

const miamiBase = {
  city_label: "Miami",
  basemap: "miami-urban-core-v1",
  map_region_label: "Biscayne Bay",
  map_region_label_position: { x: 732, y: 288 },
  secondary_map_region_label: "Airport area",
  secondary_map_region_label_position: { x: 174, y: 382 },
  water_paths: [
    "M 672 0 C 640 112 650 214 700 306 C 758 414 744 568 688 720 H 920 V 0 Z",
    "M 560 532 C 642 560 690 626 704 720 H 920 V 720 H 602 C 600 642 574 592 560 532 Z"
  ],
  transit_or_freeway_labels: [
    { label: "95", x: 548, y: 258 },
    { label: "195", x: 560, y: 126 },
    { label: "836", x: 318, y: 342 },
    { label: "US 1", x: 438, y: 542 }
  ]
};

const miamiColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function miamiHero(slug, config) {
  return [
    `FL/miami/${slug}`,
    {
      ...miamiBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Miami near surrounding commercial districts.`
    }
  ];
}

function miamiCompactHero(slug, config) {
  return compactCityHero(miamiHero, miamiColors, slug, config);
}

const dallasBase = {
  city_label: "Dallas",
  basemap: "dallas-commercial-core-v1",
  map_region_label: "Trinity River",
  map_region_label_position: { x: 122, y: 438 },
  secondary_map_region_label: "Downtown core",
  secondary_map_region_label_position: { x: 528, y: 366 },
  water_paths: [
    "M 0 406 C 86 388 156 412 220 466 C 274 510 318 572 384 604 L 360 720 H 0 Z"
  ],
  transit_or_freeway_labels: [
    { label: "35E", x: 288, y: 300 },
    { label: "30", x: 454, y: 498 },
    { label: "75", x: 556, y: 214 },
    { label: "45", x: 552, y: 586 }
  ]
};

const dallasColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function dallasHero(slug, config) {
  return [
    `TX/dallas/${slug}`,
    {
      ...dallasBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Dallas near surrounding commercial districts.`
    }
  ];
}

function dallasCompactHero(slug, config) {
  return compactCityHero(dallasHero, dallasColors, slug, config);
}

const seattleBase = {
  city_label: "Seattle",
  basemap: "seattle-core-v1",
  map_region_label: "Puget Sound",
  map_region_label_position: { x: 104, y: 330 },
  secondary_map_region_label: "Lake Union",
  secondary_map_region_label_position: { x: 532, y: 174 },
  water_paths: [
    "M 0 0 H 168 C 126 128 126 256 164 374 C 206 504 176 626 106 720 H 0 Z",
    "M 478 90 C 556 68 636 104 644 180 C 650 244 592 282 516 262 C 450 244 424 124 478 90 Z",
    "M 792 0 H 920 V 720 H 826 C 794 588 802 456 842 324 C 882 184 852 80 792 0 Z"
  ],
  transit_or_freeway_labels: [
    { label: "5", x: 544, y: 300 },
    { label: "90", x: 548, y: 570 },
    { label: "99", x: 374, y: 336 }
  ]
};

const seattleColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function seattleHero(slug, config) {
  return [
    `WA/seattle/${slug}`,
    {
      ...seattleBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Seattle near surrounding commercial districts.`
    }
  ];
}

function seattleCompactHero(slug, config) {
  return compactCityHero(seattleHero, seattleColors, slug, config);
}

const bostonBase = {
  city_label: "Boston",
  basemap: "boston-core-v1",
  map_region_label: "Boston Harbor",
  map_region_label_position: { x: 744, y: 330 },
  secondary_map_region_label: "Charles River",
  secondary_map_region_label_position: { x: 254, y: 178 },
  water_paths: [
    "M 702 0 C 656 112 664 238 716 340 C 760 426 744 580 686 720 H 920 V 0 Z",
    "M 0 128 C 128 156 244 156 350 132 C 452 108 544 132 616 190 L 592 238 C 480 190 382 178 272 202 C 164 226 74 218 0 190 Z"
  ],
  transit_or_freeway_labels: [
    { label: "90", x: 420, y: 448 },
    { label: "93", x: 566, y: 362 },
    { label: "1A", x: 704, y: 250 }
  ]
};

const bostonColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function bostonHero(slug, config) {
  return [
    `MA/boston/${slug}`,
    {
      ...bostonBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Boston near surrounding commercial districts.`
    }
  ];
}

function bostonCompactHero(slug, config) {
  return compactCityHero(bostonHero, bostonColors, slug, config);
}

const dcBase = {
  city_label: "Washington DC",
  basemap: "washington-dc-core-v1",
  map_region_label: "National Mall",
  map_region_label_position: { x: 470, y: 420 },
  secondary_map_region_label: "Potomac River",
  secondary_map_region_label_position: { x: 142, y: 504 },
  water_paths: [
    "M 0 504 C 112 454 194 440 280 476 C 350 506 378 588 356 720 H 0 Z",
    "M 600 548 C 684 532 760 562 824 620 V 720 H 592 C 626 656 628 598 600 548 Z"
  ],
  transit_or_freeway_labels: [
    { label: "66", x: 254, y: 420 },
    { label: "395", x: 430, y: 560 },
    { label: "695", x: 626, y: 462 }
  ]
};

const dcColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function dcHero(slug, config) {
  return [
    `DC/washington/${slug}`,
    {
      ...dcBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Washington DC near surrounding commercial districts.`
    }
  ];
}

function dcCompactHero(slug, config) {
  return compactCityHero(dcHero, dcColors, slug, config);
}

const atlantaBase = {
  city_label: "Atlanta",
  basemap: "atlanta-core-v1",
  map_region_label: "Downtown connector",
  map_region_label_position: { x: 470, y: 382 },
  secondary_map_region_label: "Northside markets",
  secondary_map_region_label_position: { x: 532, y: 104 },
  transit_or_freeway_labels: [
    { label: "75/85", x: 470, y: 354 },
    { label: "20", x: 460, y: 532 },
    { label: "400", x: 520, y: 164 },
    { label: "285", x: 650, y: 92 }
  ]
};

const atlantaColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function atlantaHero(slug, config) {
  return [
    `GA/atlanta/${slug}`,
    {
      ...atlantaBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Atlanta near surrounding commercial districts.`
    }
  ];
}

function atlantaCompactHero(slug, config) {
  return compactCityHero(atlantaHero, atlantaColors, slug, config);
}

const sandiegoBase = {
  city_label: "San Diego",
  basemap: "san-diego-core-v1",
  map_region_label: "San Diego Bay",
  map_region_label_position: { x: 192, y: 474 },
  secondary_map_region_label: "I-15 corridor",
  secondary_map_region_label_position: { x: 664, y: 154 },
  water_paths: [
    "M 0 240 C 96 284 126 370 116 470 C 106 570 166 632 252 720 H 0 Z",
    "M 94 0 C 144 116 158 210 126 292 C 94 376 72 470 112 562 C 142 630 210 678 286 720 H 0 V 0 Z"
  ],
  transit_or_freeway_labels: [
    { label: "5", x: 286, y: 430 },
    { label: "8", x: 418, y: 322 },
    { label: "15", x: 640, y: 230 },
    { label: "805", x: 526, y: 278 }
  ]
};

const sandiegoColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function sandiegoHero(slug, config) {
  return [
    `CA/san-diego/${slug}`,
    {
      ...sandiegoBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in San Diego near surrounding commercial districts.`
    }
  ];
}

function sandiegoCompactHero(slug, config) {
  return compactCityHero(sandiegoHero, sandiegoColors, slug, config);
}

const nashvilleBase = {
  city_label: "Nashville",
  basemap: "nashville-core-v1",
  map_region_label: "Cumberland River",
  map_region_label_position: { x: 644, y: 338 },
  secondary_map_region_label: "West End corridor",
  secondary_map_region_label_position: { x: 246, y: 286 },
  water_paths: [
    "M 560 0 C 664 96 670 192 610 278 C 544 374 596 470 718 526 C 800 564 846 628 858 720 H 920 V 0 Z"
  ],
  transit_or_freeway_labels: [
    { label: "40", x: 438, y: 442 },
    { label: "65", x: 470, y: 332 },
    { label: "24", x: 664, y: 440 },
    { label: "440", x: 326, y: 522 }
  ]
};

const nashvilleColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function nashvilleHero(slug, config) {
  return [
    `TN/nashville/${slug}`,
    {
      ...nashvilleBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Nashville near surrounding commercial districts.`
    }
  ];
}

function nashvilleCompactHero(slug, config) {
  return compactCityHero(nashvilleHero, nashvilleColors, slug, config);
}

const denverBase = {
  city_label: "Denver",
  basemap: "denver-core-v1",
  map_region_label: "Downtown grid",
  map_region_label_position: { x: 430, y: 310 },
  secondary_map_region_label: "DTC corridor",
  secondary_map_region_label_position: { x: 664, y: 674 },
  transit_or_freeway_labels: [
    { label: "25", x: 354, y: 390 },
    { label: "70", x: 462, y: 166 },
    { label: "225", x: 730, y: 544 },
    { label: "6", x: 332, y: 506 }
  ]
};

const denverColors = {
  green: "green",
  blue: "blue",
  purple: "purple",
  yellow: "yellow"
};

function denverHero(slug, config) {
  return [
    `CO/denver/${slug}`,
    {
      ...denverBase,
      ...config,
      map_alt:
        config.map_alt ||
        `Abstract orientation map highlighting ${config.title} in Denver near surrounding commercial districts.`
    }
  ];
}

function denverCompactHero(slug, config) {
  return compactCityHero(denverHero, denverColors, slug, config);
}

const chicagoMapConfigs = [
  ["the-loop", { title: "The Loop", subtitle: "Central business district with office, civic, transit, and cultural commercial context.", orientation_label: "Downtown core", x: 504, y: 382, nearby: [{ label: "West Loop", x: 342, y: 404 }, { label: "River North", x: 462, y: 254 }, { label: "South Loop", x: 494, y: 568 }, { label: "Lake Michigan", x: 736, y: 250 }] }],
  ["west-loop", { title: "West Loop", subtitle: "Near-downtown district with office, food, retail, and mixed commercial context.", orientation_label: "West of downtown", x: 342, y: 404, nearby: [{ label: "Fulton Market", x: 306, y: 324 }, { label: "The Loop", x: 504, y: 382 }, { label: "River West", x: 326, y: 280 }, { label: "Fulton River", x: 404, y: 320 }] }],
  ["fulton-market", { title: "Fulton Market", subtitle: "West Loop district with office, food, showroom, hospitality, and mixed-use context.", orientation_label: "West Loop district", x: 306, y: 324, nearby: [{ label: "West Loop", x: 342, y: 404 }, { label: "River West", x: 326, y: 280 }, { label: "The Loop", x: 504, y: 382 }, { label: "Goose Island", x: 358, y: 204 }] }],
  ["river-north", { title: "River North", subtitle: "Downtown-adjacent district with office, design, hospitality, and gallery commercial context.", orientation_label: "North of The Loop", x: 462, y: 254, nearby: [{ label: "Streeterville", x: 614, y: 234 }, { label: "The Loop", x: 504, y: 382 }, { label: "River West", x: 326, y: 280 }, { label: "Magnificent Mile", x: 568, y: 166 }] }],
  ["streeterville", { title: "Streeterville", subtitle: "Near North Side district with medical, office, hospitality, retail, and lakefront context.", orientation_label: "Near North lakefront", x: 614, y: 234, nearby: [{ label: "Magnificent Mile", x: 568, y: 166 }, { label: "River North", x: 462, y: 254 }, { label: "The Loop", x: 504, y: 382 }, { label: "Lake Michigan", x: 736, y: 234 }] }],
  ["south-loop", { title: "South Loop", subtitle: "South downtown district with office, institutional, residential, and mixed commercial context.", orientation_label: "South downtown", x: 494, y: 568, nearby: [{ label: "The Loop", x: 504, y: 382 }, { label: "Prairie District", x: 530, y: 628 }, { label: "Chinatown", x: 432, y: 654 }, { label: "Pilsen", x: 292, y: 622 }] }],
  ["magnificent-mile", { title: "Magnificent Mile", subtitle: "North Michigan Avenue district with retail, hospitality, office, and visitor-serving context.", orientation_label: "North Michigan Avenue", x: 568, y: 166, nearby: [{ label: "Streeterville", x: 614, y: 234 }, { label: "River North", x: 462, y: 254 }, { label: "The Loop", x: 504, y: 382 }, { label: "Lake Michigan", x: 736, y: 210 }] }],
  ["clybourn-corridor", { title: "Clybourn Corridor", subtitle: "North Side corridor with retail, showroom, service, and mixed commercial context.", orientation_label: "North Side corridor", x: 296, y: 160, nearby: [{ label: "Lincoln Park", x: 372, y: 108 }, { label: "Goose Island", x: 358, y: 204 }, { label: "Old Town", x: 434, y: 150 }, { label: "River West", x: 326, y: 280 }] }],
  ["goose-island", { title: "Goose Island", subtitle: "Near North Side industrial and mixed commercial area.", orientation_label: "North Branch corridor", x: 358, y: 204, nearby: [{ label: "Clybourn", x: 296, y: 160 }, { label: "Old Town", x: 434, y: 150 }, { label: "River West", x: 326, y: 280 }, { label: "Fulton Market", x: 306, y: 324 }] }],
  ["river-west", { title: "River West", subtitle: "Near-downtown district with office, residential, service, and mixed commercial context.", orientation_label: "Near northwest downtown", x: 326, y: 280, nearby: [{ label: "Fulton Market", x: 306, y: 324 }, { label: "River North", x: 462, y: 254 }, { label: "Goose Island", x: 358, y: 204 }, { label: "West Loop", x: 342, y: 404 }] }],
  ["o-hare", { title: "O’Hare", subtitle: "Airport-area commercial district with office, logistics, hospitality, and transportation context.", orientation_label: "Airport submarket", x: 158, y: 150, nearby: [{ label: "Airport area", x: 158, y: 150 }, { label: "Kennedy Expy", x: 260, y: 220 }, { label: "Downtown", x: 504, y: 382 }, { label: "Northwest side", x: 190, y: 84 }] }],
  ["hyde-park", { title: "Hyde Park", subtitle: "South Side district with education, medical, retail, office, and neighborhood commercial context.", orientation_label: "South Side lakefront", x: 612, y: 674, nearby: [{ label: "Bridgeport", x: 330, y: 682 }, { label: "South Loop", x: 494, y: 568 }, { label: "Lake Michigan", x: 746, y: 636 }, { label: "Chinatown", x: 432, y: 654 }] }],
  ["illinois-medical-district", { title: "Illinois Medical District", subtitle: "Medical and institutional district west of downtown with office and healthcare context.", orientation_label: "West of downtown", x: 246, y: 482, nearby: [{ label: "Pilsen", x: 292, y: 622 }, { label: "West Loop", x: 342, y: 404 }, { label: "The Loop", x: 504, y: 382 }, { label: "Fulton Market", x: 306, y: 324 }] }],
  ["pilsen", { title: "Pilsen", subtitle: "Near southwest district with arts, retail, industrial, service, and mixed commercial context.", orientation_label: "Near southwest side", x: 292, y: 622, nearby: [{ label: "Chinatown", x: 432, y: 654 }, { label: "Bridgeport", x: 330, y: 682 }, { label: "Medical District", x: 246, y: 482 }, { label: "South Loop", x: 494, y: 568 }] }],
  ["fulton-river-district", { title: "Fulton River District", subtitle: "Downtown-adjacent district with office, residential, food, and riverfront context.", orientation_label: "Downtown river district", x: 404, y: 320, nearby: [{ label: "River West", x: 326, y: 280 }, { label: "Fulton Market", x: 306, y: 324 }, { label: "River North", x: 462, y: 254 }, { label: "The Loop", x: 504, y: 382 }] }],
  ["lincoln-park", { title: "Lincoln Park", subtitle: "North Side neighborhood with retail, services, office-adjacent, and institutional context.", orientation_label: "North Side", x: 372, y: 108, nearby: [{ label: "Clybourn", x: 296, y: 160 }, { label: "Old Town", x: 434, y: 150 }, { label: "Goose Island", x: 358, y: 204 }, { label: "Lake Michigan", x: 724, y: 164 }] }],
  ["uptown", { title: "Uptown", subtitle: "North lakefront neighborhood with retail, entertainment, office-adjacent, and service context.", orientation_label: "North lakefront", x: 468, y: 76, nearby: [{ label: "Andersonville", x: 340, y: 66 }, { label: "Edgewater", x: 506, y: 58 }, { label: "Rogers Park", x: 528, y: 50 }, { label: "Lake Michigan", x: 728, y: 110 }] }],
  ["chinatown", { title: "Chinatown", subtitle: "Near South Side district with retail, food, services, and neighborhood commercial context.", orientation_label: "Near South Side", x: 432, y: 654, nearby: [{ label: "South Loop", x: 494, y: 568 }, { label: "Pilsen", x: 292, y: 622 }, { label: "Bridgeport", x: 330, y: 682 }, { label: "The Loop", x: 504, y: 382 }] }],
  ["logan-square", { title: "Logan Square", subtitle: "Northwest Side neighborhood with retail, food, creative, and mixed-use commercial context.", orientation_label: "Northwest Side", x: 146, y: 178, nearby: [{ label: "Wicker Park", x: 202, y: 330 }, { label: "Clybourn", x: 296, y: 160 }, { label: "Goose Island", x: 358, y: 204 }, { label: "Lincoln Park", x: 372, y: 108 }] }],
  ["prairie-district", { title: "Prairie District", subtitle: "South Loop-adjacent district with institutional, office-adjacent, and mixed commercial context.", orientation_label: "South downtown", x: 530, y: 628, nearby: [{ label: "South Loop", x: 494, y: 568 }, { label: "Chinatown", x: 432, y: 654 }, { label: "The Loop", x: 504, y: 382 }, { label: "Lake Michigan", x: 742, y: 620 }] }],
  ["wicker-park", { title: "Wicker Park", subtitle: "Northwest Side neighborhood with retail, food, creative, and mixed-use commercial context.", orientation_label: "Northwest Side", x: 202, y: 330, nearby: [{ label: "Logan Square", x: 146, y: 178 }, { label: "Clybourn", x: 296, y: 160 }, { label: "Goose Island", x: 358, y: 204 }, { label: "River West", x: 326, y: 280 }] }],
  ["andersonville", { title: "Andersonville", subtitle: "North Side neighborhood with retail, food, services, and neighborhood commercial context.", orientation_label: "North Side", x: 340, y: 66, nearby: [{ label: "Edgewater", x: 506, y: 58 }, { label: "Uptown", x: 468, y: 76 }, { label: "Rogers Park", x: 528, y: 50 }, { label: "Lincoln Park", x: 372, y: 108 }] }],
  ["bridgeport", { title: "Bridgeport", subtitle: "South Side neighborhood with industrial, service, retail, and mixed commercial context.", orientation_label: "Southwest Side", x: 330, y: 682, nearby: [{ label: "Pilsen", x: 292, y: 622 }, { label: "Chinatown", x: 432, y: 654 }, { label: "South Loop", x: 494, y: 568 }, { label: "Medical District", x: 246, y: 482 }] }],
  ["old-town", { title: "Old Town", subtitle: "Near North Side neighborhood with retail, hospitality, services, and office-adjacent context.", orientation_label: "Near North Side", x: 434, y: 150, nearby: [{ label: "Lincoln Park", x: 372, y: 108 }, { label: "Goose Island", x: 358, y: 204 }, { label: "River North", x: 462, y: 254 }, { label: "Clybourn", x: 296, y: 160 }] }],
  ["edgewater", { title: "Edgewater", subtitle: "North lakefront neighborhood with retail, services, and neighborhood commercial context.", orientation_label: "North lakefront", x: 506, y: 58, nearby: [{ label: "Andersonville", x: 340, y: 66 }, { label: "Uptown", x: 468, y: 76 }, { label: "Rogers Park", x: 528, y: 50 }, { label: "Lake Michigan", x: 728, y: 90 }] }],
  ["rogers-park", { title: "Rogers Park", subtitle: "Far North Side neighborhood with retail, services, institutional, and neighborhood context.", orientation_label: "Far North Side", x: 528, y: 50, nearby: [{ label: "Edgewater", x: 506, y: 58 }, { label: "Andersonville", x: 340, y: 66 }, { label: "Uptown", x: 468, y: 76 }, { label: "Lake Michigan", x: 728, y: 80 }] }]
];

const laMapConfigs = [
  ["downtown-los-angeles", { title: "Downtown Los Angeles", subtitle: "Central LA business district with office, civic, hospitality, retail, and mixed commercial context.", orientation_label: "Central Los Angeles", x: 638, y: 366, nearby: [{ label: "Fashion District", x: 654, y: 504 }, { label: "Arts District", x: 764, y: 398 }, { label: "Little Tokyo", x: 714, y: 344 }, { label: "South Park", x: 574, y: 474 }] }],
  ["arts-district", { title: "Arts District", subtitle: "Downtown-adjacent district with creative office, showroom, production, retail, and food context.", orientation_label: "East downtown", x: 764, y: 398, nearby: [{ label: "Little Tokyo", x: 714, y: 344 }, { label: "Downtown LA", x: 638, y: 366 }, { label: "Fashion District", x: 654, y: 504 }, { label: "Boyle Heights", x: 812, y: 526 }] }],
  ["century-city", { title: "Century City", subtitle: "Westside office district with entertainment, professional services, retail, and hospitality context.", orientation_label: "Westside office district", x: 326, y: 356, nearby: [{ label: "Westwood", x: 292, y: 256 }, { label: "Sawtelle", x: 206, y: 336 }, { label: "Brentwood", x: 174, y: 250 }, { label: "Miracle Mile", x: 458, y: 400 }] }],
  ["fashion-district", { title: "Fashion District", subtitle: "Downtown LA district with showroom, wholesale, retail, production, and mixed commercial context.", orientation_label: "Downtown south", x: 654, y: 504, nearby: [{ label: "South Park", x: 574, y: 474 }, { label: "Downtown LA", x: 638, y: 366 }, { label: "Arts District", x: 764, y: 398 }, { label: "Little Tokyo", x: 714, y: 344 }] }],
  ["hollywood", { title: "Hollywood", subtitle: "Central LA district with entertainment, office, retail, hospitality, and production context.", orientation_label: "Central LA", x: 488, y: 214, nearby: [{ label: "Cahuenga Pass", x: 438, y: 132 }, { label: "Miracle Mile", x: 458, y: 400 }, { label: "Koreatown", x: 548, y: 420 }, { label: "Downtown LA", x: 638, y: 366 }] }],
  ["south-park", { title: "South Park", subtitle: "Downtown LA district with entertainment, hospitality, office, and mixed commercial context.", orientation_label: "South downtown", x: 574, y: 474, nearby: [{ label: "Fashion District", x: 654, y: 504 }, { label: "Downtown LA", x: 638, y: 366 }, { label: "Little Tokyo", x: 714, y: 344 }, { label: "Arts District", x: 764, y: 398 }] }],
  ["westwood", { title: "Westwood", subtitle: "Westside district with office, medical, education, retail, and neighborhood commercial context.", orientation_label: "Westside", x: 292, y: 256, nearby: [{ label: "Century City", x: 326, y: 356 }, { label: "Sawtelle", x: 206, y: 336 }, { label: "Brentwood", x: 174, y: 250 }, { label: "Venice", x: 154, y: 566 }] }],
  ["koreatown", { title: "Koreatown", subtitle: "Central LA district with office, retail, food, hospitality, and dense mixed-use context.", orientation_label: "Central LA", x: 548, y: 420, nearby: [{ label: "Miracle Mile", x: 458, y: 400 }, { label: "Downtown LA", x: 638, y: 366 }, { label: "South Park", x: 574, y: 474 }, { label: "Hollywood", x: 488, y: 214 }] }],
  ["westchester", { title: "Westchester", subtitle: "Westside district with airport-adjacent, office, education, and service commercial context.", orientation_label: "Westside airport area", x: 202, y: 536, nearby: [{ label: "Playa Vista", x: 176, y: 474 }, { label: "Venice", x: 154, y: 566 }, { label: "Sawtelle", x: 206, y: 336 }, { label: "Century City", x: 326, y: 356 }] }],
  ["playa-vista", { title: "Playa Vista", subtitle: "Westside district with tech, office, creative, retail, and mixed-use commercial context.", orientation_label: "Westside", x: 176, y: 474, nearby: [{ label: "Westchester", x: 202, y: 536 }, { label: "Venice", x: 154, y: 566 }, { label: "Sawtelle", x: 206, y: 336 }, { label: "Century City", x: 326, y: 356 }] }],
  ["miracle-mile", { title: "Miracle Mile", subtitle: "Central LA corridor with office, retail, museum, medical, and mixed commercial context.", orientation_label: "Central LA corridor", x: 458, y: 400, nearby: [{ label: "Koreatown", x: 548, y: 420 }, { label: "Hollywood", x: 488, y: 214 }, { label: "Century City", x: 326, y: 356 }, { label: "Westwood", x: 292, y: 256 }] }],
  ["sawtelle", { title: "Sawtelle", subtitle: "Westside neighborhood with retail, food, office-adjacent, and service commercial context.", orientation_label: "Westside", x: 206, y: 336, nearby: [{ label: "Westwood", x: 292, y: 256 }, { label: "Century City", x: 326, y: 356 }, { label: "Brentwood", x: 174, y: 250 }, { label: "Venice", x: 154, y: 566 }] }],
  ["little-tokyo", { title: "Little Tokyo", subtitle: "Downtown LA district with retail, food, cultural, office-adjacent, and mixed-use context.", orientation_label: "East downtown", x: 714, y: 344, nearby: [{ label: "Arts District", x: 764, y: 398 }, { label: "Downtown LA", x: 638, y: 366 }, { label: "Chinatown", x: 662, y: 272 }, { label: "Fashion District", x: 654, y: 504 }] }],
  ["brentwood", { title: "Brentwood", subtitle: "Westside neighborhood with office-adjacent, medical, retail, and service commercial context.", orientation_label: "Westside", x: 174, y: 250, nearby: [{ label: "Westwood", x: 292, y: 256 }, { label: "Sawtelle", x: 206, y: 336 }, { label: "Century City", x: 326, y: 356 }, { label: "Venice", x: 154, y: 566 }] }],
  ["chinatown", { title: "Chinatown", subtitle: "Central LA neighborhood with retail, food, services, and downtown-adjacent commercial context.", orientation_label: "North downtown", x: 662, y: 272, nearby: [{ label: "Little Tokyo", x: 714, y: 344 }, { label: "Downtown LA", x: 638, y: 366 }, { label: "Arts District", x: 764, y: 398 }, { label: "Lincoln Heights", x: 786, y: 274 }] }],
  ["venice", { title: "Venice", subtitle: "Westside neighborhood with creative office, retail, food, service, and coastal commercial context.", orientation_label: "Westside coast", x: 154, y: 566, nearby: [{ label: "Playa Vista", x: 176, y: 474 }, { label: "Westchester", x: 202, y: 536 }, { label: "Sawtelle", x: 206, y: 336 }, { label: "Westwood", x: 292, y: 256 }] }],
  ["highland-park", { title: "Highland Park", subtitle: "Northeast LA neighborhood with retail, food, creative, and neighborhood commercial context.", orientation_label: "Northeast Los Angeles", x: 766, y: 174, nearby: [{ label: "Lincoln Heights", x: 786, y: 274 }, { label: "Chinatown", x: 662, y: 272 }, { label: "Little Tokyo", x: 714, y: 344 }, { label: "Boyle Heights", x: 812, y: 526 }] }],
  ["cahuenga-pass", { title: "Cahuenga Pass", subtitle: "Central LA pass corridor with entertainment, office-adjacent, and transportation commercial context.", orientation_label: "Hollywood corridor", x: 438, y: 132, nearby: [{ label: "Hollywood", x: 488, y: 214 }, { label: "Miracle Mile", x: 458, y: 400 }, { label: "Koreatown", x: 548, y: 420 }, { label: "Century City", x: 326, y: 356 }] }],
  ["lincoln-heights", { title: "Lincoln Heights", subtitle: "Northeast LA neighborhood with industrial, service, retail, and downtown-adjacent context.", orientation_label: "Northeast downtown edge", x: 786, y: 274, nearby: [{ label: "Chinatown", x: 662, y: 272 }, { label: "Little Tokyo", x: 714, y: 344 }, { label: "Arts District", x: 764, y: 398 }, { label: "Boyle Heights", x: 812, y: 526 }] }],
  ["boyle-heights", { title: "Boyle Heights", subtitle: "East LA neighborhood with retail, service, industrial, and downtown-adjacent commercial context.", orientation_label: "East of downtown", x: 812, y: 526, nearby: [{ label: "Arts District", x: 764, y: 398 }, { label: "Little Tokyo", x: 714, y: 344 }, { label: "Fashion District", x: 654, y: 504 }, { label: "Lincoln Heights", x: 786, y: 274 }] }]
];

const miamiMapConfigs = [
  ["brickell", { title: "Brickell", subtitle: "Downtown-adjacent financial and mixed-use district near Biscayne Bay.", orientation_label: "South downtown waterfront", x: 590, y: 400, nearby: [{ label: "Downtown Miami", x: 610, y: 300 }, { label: "Little Havana", x: 410, y: 350 }, { label: "Overtown", x: 520, y: 260 }, { label: "Biscayne Bay", x: 732, y: 288 }] }],
  ["downtown-miami", { title: "Downtown Miami", subtitle: "Central Miami commercial core with office, civic, hospitality, and retail context.", orientation_label: "Miami central core", x: 610, y: 300, nearby: [{ label: "Brickell", x: 590, y: 400 }, { label: "Overtown", x: 520, y: 260 }, { label: "Edgewater", x: 575, y: 210 }, { label: "Wynwood", x: 520, y: 170 }] }],
  ["wynwood", { title: "Wynwood", subtitle: "Creative and mixed commercial district north of downtown Miami.", orientation_label: "North of downtown", x: 520, y: 170, nearby: [{ label: "Edgewater", x: 575, y: 210 }, { label: "Design District", x: 560, y: 120 }, { label: "Allapattah", x: 430, y: 170 }, { label: "Overtown", x: 520, y: 260 }] }],
  ["design-district", { title: "Design District", subtitle: "Retail, design, showroom, and hospitality district north of Midtown Miami.", orientation_label: "North Miami core", x: 560, y: 120, nearby: [{ label: "Wynwood", x: 520, y: 170 }, { label: "Little Haiti", x: 550, y: 65 }, { label: "Edgewater", x: 575, y: 210 }, { label: "Allapattah", x: 430, y: 170 }] }],
  ["coconut-grove", { title: "Coconut Grove", subtitle: "South Miami waterfront neighborhood with office, retail, hospitality, and service context.", orientation_label: "South waterfront", x: 430, y: 560, nearby: [{ label: "Coral Way", x: 360, y: 445 }, { label: "Brickell", x: 590, y: 400 }, { label: "Dadeland", x: 470, y: 650 }, { label: "US 1", x: 438, y: 542 }] }],
  ["edgewater", { title: "Edgewater", subtitle: "Waterfront-adjacent district north of downtown with mixed commercial context.", orientation_label: "North downtown waterfront", x: 575, y: 210, nearby: [{ label: "Wynwood", x: 520, y: 170 }, { label: "Design District", x: 560, y: 120 }, { label: "Downtown Miami", x: 610, y: 300 }, { label: "Biscayne Bay", x: 732, y: 288 }] }],
  ["little-havana", { title: "Little Havana", subtitle: "West of downtown neighborhood with retail, food, services, and mixed commercial context.", orientation_label: "West of downtown", x: 410, y: 350, nearby: [{ label: "Brickell", x: 590, y: 400 }, { label: "Coral Way", x: 360, y: 445 }, { label: "Overtown", x: 520, y: 260 }, { label: "Downtown Miami", x: 610, y: 300 }] }],
  ["allapattah", { title: "Allapattah", subtitle: "Industrial, medical, service, and mixed commercial area northwest of downtown.", orientation_label: "Northwest of downtown", x: 430, y: 170, nearby: [{ label: "Wynwood", x: 520, y: 170 }, { label: "Design District", x: 560, y: 120 }, { label: "Overtown", x: 520, y: 260 }, { label: "Airport area", x: 174, y: 382 }] }],
  ["little-haiti", { title: "Little Haiti", subtitle: "North Miami neighborhood with retail, arts, services, and mixed commercial context.", orientation_label: "North Miami", x: 550, y: 65, nearby: [{ label: "Design District", x: 560, y: 120 }, { label: "Wynwood", x: 520, y: 170 }, { label: "Edgewater", x: 575, y: 210 }, { label: "Allapattah", x: 430, y: 170 }] }],
  ["blue-lagoon", { title: "Blue Lagoon", subtitle: "Airport-area commercial district with office, hospitality, and service context.", orientation_label: "Miami airport area", x: 220, y: 370, nearby: [{ label: "Coral Way", x: 360, y: 445 }, { label: "Little Havana", x: 410, y: 350 }, { label: "Allapattah", x: 430, y: 170 }, { label: "836", x: 318, y: 342 }] }],
  ["overtown", { title: "Overtown", subtitle: "Central Miami neighborhood between Wynwood, Downtown, and the broader urban core.", orientation_label: "Central Miami", x: 520, y: 260, nearby: [{ label: "Downtown Miami", x: 610, y: 300 }, { label: "Wynwood", x: 520, y: 170 }, { label: "Edgewater", x: 575, y: 210 }, { label: "Brickell", x: 590, y: 400 }] }],
  ["coral-way", { title: "Coral Way", subtitle: "Southwest Miami corridor with retail, office, service, and neighborhood commercial context.", orientation_label: "Southwest corridor", x: 360, y: 445, nearby: [{ label: "Coconut Grove", x: 430, y: 560 }, { label: "Little Havana", x: 410, y: 350 }, { label: "Brickell", x: 590, y: 400 }, { label: "Blue Lagoon", x: 220, y: 370 }] }],
  ["dadeland", { title: "Dadeland", subtitle: "South Miami commercial node with retail, office, transit, and corridor context.", orientation_label: "South Miami commercial node", x: 470, y: 650, nearby: [{ label: "Coconut Grove", x: 430, y: 560 }, { label: "Coral Way", x: 360, y: 445 }, { label: "US 1", x: 438, y: 542 }, { label: "Biscayne Bay", x: 732, y: 288 }] }]
];

const dallasMapConfigs = [
  ["uptown", { title: "Uptown", subtitle: "North of downtown district with office, residential, retail, and hospitality context.", orientation_label: "North of downtown", x: 480, y: 240, nearby: [{ label: "Arts District", x: 520, y: 300 }, { label: "Victory Park", x: 420, y: 270 }, { label: "Turtle Creek", x: 420, y: 180 }, { label: "Downtown Dallas", x: 470, y: 360 }] }],
  ["downtown-dallas", { title: "Downtown Dallas", subtitle: "Central business district with office, civic, hospitality, and retail context.", orientation_label: "Dallas central core", x: 470, y: 360, nearby: [{ label: "Main Street District", x: 500, y: 385 }, { label: "Arts District", x: 520, y: 300 }, { label: "West End", x: 430, y: 350 }, { label: "Deep Ellum", x: 620, y: 390 }] }],
  ["main-street-district", { title: "Main Street District", subtitle: "Downtown Dallas district with office, hospitality, retail, and civic context.", orientation_label: "Downtown core", x: 500, y: 385, nearby: [{ label: "Downtown Dallas", x: 470, y: 360 }, { label: "West End", x: 430, y: 350 }, { label: "Arts District", x: 520, y: 300 }, { label: "Deep Ellum", x: 620, y: 390 }] }],
  ["victory-park", { title: "Victory Park", subtitle: "Downtown-adjacent district with entertainment, office, hospitality, and mixed-use context.", orientation_label: "Northwest downtown", x: 420, y: 270, nearby: [{ label: "Uptown", x: 480, y: 240 }, { label: "West End", x: 430, y: 350 }, { label: "Arts District", x: 520, y: 300 }, { label: "Design District", x: 330, y: 270 }] }],
  ["arts-district", { title: "Arts District", subtitle: "Downtown district with office, civic, cultural, hospitality, and retail context.", orientation_label: "Northeast downtown", x: 520, y: 300, nearby: [{ label: "Uptown", x: 480, y: 240 }, { label: "Downtown Dallas", x: 470, y: 360 }, { label: "Victory Park", x: 420, y: 270 }, { label: "Deep Ellum", x: 620, y: 390 }] }],
  ["deep-ellum", { title: "Deep Ellum", subtitle: "East of downtown district with creative, entertainment, retail, and mixed commercial context.", orientation_label: "East of downtown", x: 620, y: 390, nearby: [{ label: "Downtown Dallas", x: 470, y: 360 }, { label: "Main Street District", x: 500, y: 385 }, { label: "Arts District", x: 520, y: 300 }, { label: "Cedars", x: 500, y: 500 }] }],
  ["west-end-historic-district", { title: "West End Historic District", subtitle: "Historic downtown district with office, hospitality, civic, and visitor-serving context.", orientation_label: "West downtown", x: 430, y: 350, nearby: [{ label: "Main Street District", x: 500, y: 385 }, { label: "Downtown Dallas", x: 470, y: 360 }, { label: "Victory Park", x: 420, y: 270 }, { label: "Arts District", x: 520, y: 300 }] }],
  ["design-district", { title: "Design District", subtitle: "Showroom, design, office, hospitality, and mixed commercial district northwest of downtown.", orientation_label: "Northwest downtown", x: 330, y: 270, nearby: [{ label: "Medical District", x: 250, y: 300 }, { label: "Victory Park", x: 420, y: 270 }, { label: "Stemmons Corridor", x: 210, y: 220 }, { label: "Uptown", x: 480, y: 240 }] }],
  ["cedars", { title: "Cedars", subtitle: "South of downtown district with creative, industrial, office-adjacent, and mixed commercial context.", orientation_label: "South of downtown", x: 500, y: 500, nearby: [{ label: "Downtown Dallas", x: 470, y: 360 }, { label: "Deep Ellum", x: 620, y: 390 }, { label: "Main Street District", x: 500, y: 385 }, { label: "Bishop Arts", x: 380, y: 590 }] }],
  ["medical-district", { title: "Medical District", subtitle: "Healthcare and institutional commercial district northwest of downtown Dallas.", orientation_label: "Medical corridor", x: 250, y: 300, nearby: [{ label: "Design District", x: 330, y: 270 }, { label: "Stemmons Corridor", x: 210, y: 220 }, { label: "Turtle Creek", x: 420, y: 180 }, { label: "Victory Park", x: 420, y: 270 }] }],
  ["stemmons-corridor", { title: "Stemmons Corridor", subtitle: "Northwest Dallas corridor with medical, office, logistics, and highway-oriented context.", orientation_label: "Northwest corridor", x: 210, y: 220, nearby: [{ label: "Medical District", x: 250, y: 300 }, { label: "Design District", x: 330, y: 270 }, { label: "Turtle Creek", x: 420, y: 180 }, { label: "35E", x: 288, y: 300 }] }],
  ["preston-center", { title: "Preston Center", subtitle: "North Dallas commercial node with office, retail, medical, and service context.", orientation_label: "North Dallas node", x: 450, y: 90, nearby: [{ label: "North Dallas", x: 540, y: 70 }, { label: "Turtle Creek", x: 420, y: 180 }, { label: "Uptown", x: 480, y: 240 }, { label: "75", x: 556, y: 214 }] }],
  ["turtle-creek", { title: "Turtle Creek", subtitle: "North of Uptown district with office, residential, hospitality, and service context.", orientation_label: "North of Uptown", x: 420, y: 180, nearby: [{ label: "Uptown", x: 480, y: 240 }, { label: "Preston Center", x: 450, y: 90 }, { label: "Victory Park", x: 420, y: 270 }, { label: "Design District", x: 330, y: 270 }] }],
  ["north-dallas", { title: "North Dallas", subtitle: "North Dallas area with office, retail, medical, and neighborhood-serving commercial context.", orientation_label: "North Dallas", x: 540, y: 70, nearby: [{ label: "Far North Dallas", x: 600, y: 35 }, { label: "Preston Center", x: 450, y: 90 }, { label: "Turtle Creek", x: 420, y: 180 }, { label: "75", x: 556, y: 214 }] }],
  ["far-north-dallas", { title: "Far North Dallas", subtitle: "Far north commercial area with office, retail, medical, and corridor context.", orientation_label: "Far North Dallas", x: 600, y: 35, nearby: [{ label: "North Dallas", x: 540, y: 70 }, { label: "Preston Center", x: 450, y: 90 }, { label: "75", x: 556, y: 214 }, { label: "Turtle Creek", x: 420, y: 180 }] }],
  ["bishop-arts-district", { title: "Bishop Arts District", subtitle: "Oak Cliff district with retail, food, services, and neighborhood commercial context.", orientation_label: "Oak Cliff district", x: 380, y: 590, nearby: [{ label: "Cedars", x: 500, y: 500 }, { label: "West End", x: 430, y: 350 }, { label: "Downtown Dallas", x: 470, y: 360 }, { label: "Trinity River", x: 122, y: 438 }] }]
];

const seattleMapConfigs = [
  ["downtown-seattle", { title: "Downtown Seattle", subtitle: "Central Seattle commercial core with office, civic, hospitality, and retail context.", orientation_label: "Seattle central core", x: 430, y: 360, nearby: [{ label: "Waterfront", x: 350, y: 360 }, { label: "Pioneer Square", x: 430, y: 475 }, { label: "Belltown", x: 385, y: 270 }, { label: "Denny Triangle", x: 465, y: 250 }] }],
  ["south-lake-union", { title: "South Lake Union", subtitle: "Office, life science, tech, retail, and mixed-use district south of Lake Union.", orientation_label: "South of Lake Union", x: 510, y: 170, nearby: [{ label: "Denny Triangle", x: 465, y: 250 }, { label: "Capitol Hill", x: 600, y: 280 }, { label: "Belltown", x: 385, y: 270 }, { label: "Lake Union", x: 532, y: 174 }] }],
  ["denny-triangle", { title: "Denny Triangle", subtitle: "Downtown-adjacent district between South Lake Union, Belltown, and the central core.", orientation_label: "North downtown", x: 465, y: 250, nearby: [{ label: "South Lake Union", x: 510, y: 170 }, { label: "Belltown", x: 385, y: 270 }, { label: "Downtown Seattle", x: 430, y: 360 }, { label: "Capitol Hill", x: 600, y: 280 }] }],
  ["pioneer-square", { title: "Pioneer Square", subtitle: "Historic district south of downtown with office, retail, hospitality, and stadium-area context.", orientation_label: "South downtown", x: 430, y: 475, nearby: [{ label: "Downtown Seattle", x: 430, y: 360 }, { label: "Waterfront", x: 350, y: 360 }, { label: "SoDo", x: 450, y: 610 }, { label: "Belltown", x: 385, y: 270 }] }],
  ["belltown", { title: "Belltown", subtitle: "North downtown neighborhood with office-adjacent, retail, hospitality, and waterfront context.", orientation_label: "North downtown", x: 385, y: 270, nearby: [{ label: "Denny Triangle", x: 465, y: 250 }, { label: "Waterfront", x: 350, y: 360 }, { label: "South Lake Union", x: 510, y: 170 }, { label: "Downtown Seattle", x: 430, y: 360 }] }],
  ["ballard", { title: "Ballard", subtitle: "Northwest Seattle neighborhood with retail, food, maritime, and mixed commercial context.", orientation_label: "Northwest Seattle", x: 335, y: 95, nearby: [{ label: "Fremont", x: 500, y: 95 }, { label: "University District", x: 630, y: 75 }, { label: "Northgate", x: 600, y: 20 }, { label: "Puget Sound", x: 104, y: 330 }] }],
  ["capitol-hill", { title: "Capitol Hill", subtitle: "Central Seattle neighborhood with retail, food, services, office-adjacent, and nightlife context.", orientation_label: "East of downtown", x: 600, y: 280, nearby: [{ label: "South Lake Union", x: 510, y: 170 }, { label: "Denny Triangle", x: 465, y: 250 }, { label: "Downtown Seattle", x: 430, y: 360 }, { label: "University District", x: 630, y: 75 }] }],
  ["fremont", { title: "Fremont", subtitle: "North Seattle neighborhood with office, creative, retail, food, and mixed commercial context.", orientation_label: "North of Lake Union", x: 500, y: 95, nearby: [{ label: "University District", x: 630, y: 75 }, { label: "Ballard", x: 335, y: 95 }, { label: "South Lake Union", x: 510, y: 170 }, { label: "Lake Union", x: 532, y: 174 }] }],
  ["university-district", { title: "University District", subtitle: "North Seattle district with institutional, retail, office-adjacent, and service context.", orientation_label: "Northeast Seattle", x: 630, y: 75, nearby: [{ label: "Fremont", x: 500, y: 95 }, { label: "Northgate", x: 600, y: 20 }, { label: "Capitol Hill", x: 600, y: 280 }, { label: "South Lake Union", x: 510, y: 170 }] }],
  ["northgate", { title: "Northgate", subtitle: "North Seattle commercial node with retail, medical, office, and transit-oriented context.", orientation_label: "North Seattle", x: 600, y: 20, nearby: [{ label: "University District", x: 630, y: 75 }, { label: "Ballard", x: 335, y: 95 }, { label: "Fremont", x: 500, y: 95 }, { label: "I-5", x: 544, y: 300 }] }],
  ["waterfront", { title: "Waterfront", subtitle: "Central Seattle waterfront area with hospitality, retail, civic, and office-adjacent context.", orientation_label: "Central waterfront", x: 350, y: 360, nearby: [{ label: "Downtown Seattle", x: 430, y: 360 }, { label: "Belltown", x: 385, y: 270 }, { label: "Pioneer Square", x: 430, y: 475 }, { label: "Puget Sound", x: 104, y: 330 }] }],
  ["sodo", { title: "SoDo", subtitle: "South Seattle industrial and stadium-area district with logistics, service, and commercial context.", orientation_label: "South of downtown", x: 450, y: 610, nearby: [{ label: "Pioneer Square", x: 430, y: 475 }, { label: "Downtown Seattle", x: 430, y: 360 }, { label: "Waterfront", x: 350, y: 360 }, { label: "I-90", x: 548, y: 570 }] }]
];

const bostonMapConfigs = [
  ["back-bay", { title: "Back Bay", subtitle: "Central Boston district with office, retail, hospitality, and transit-rich commercial context.", orientation_label: "West of downtown", x: 318, y: 318, nearby: [{ label: "Financial District", x: 560, y: 356 }, { label: "South End", x: 342, y: 458 }, { label: "Fenway-Kenmore", x: 186, y: 292 }, { label: "Charles River", x: 254, y: 178 }] }],
  ["financial-district", { title: "Financial District", subtitle: "Downtown Boston business district with office, hospitality, civic, and waterfront context.", orientation_label: "Downtown core", x: 560, y: 356, nearby: [{ label: "Downtown Boston", x: 506, y: 318 }, { label: "Seaport", x: 676, y: 442 }, { label: "Government Center", x: 526, y: 244 }, { label: "Boston Harbor", x: 744, y: 330 }] }],
  ["downtown-boston", { title: "Downtown Boston", subtitle: "Central Boston commercial core with office, retail, civic, and hospitality context.", orientation_label: "Boston central core", x: 506, y: 318, nearby: [{ label: "Financial District", x: 560, y: 356 }, { label: "Government Center", x: 526, y: 244 }, { label: "Theater District", x: 444, y: 392 }, { label: "Leather District", x: 516, y: 450 }] }],
  ["seaport-district", { title: "Seaport District", subtitle: "Waterfront district with office, life science, hospitality, retail, and innovation context.", orientation_label: "Waterfront district", x: 676, y: 442, nearby: [{ label: "Financial District", x: 560, y: 356 }, { label: "Leather District", x: 516, y: 450 }, { label: "Downtown Boston", x: 506, y: 318 }, { label: "Boston Harbor", x: 744, y: 330 }] }],
  ["government-center", { title: "Government Center", subtitle: "Downtown civic and office district near Boston's central commercial core.", orientation_label: "North downtown", x: 526, y: 244, nearby: [{ label: "Downtown Boston", x: 506, y: 318 }, { label: "Financial District", x: 560, y: 356 }, { label: "North Station", x: 452, y: 182 }, { label: "Back Bay", x: 318, y: 318 }] }],
  ["leather-district", { title: "Leather District", subtitle: "Compact downtown district between the Financial District, Chinatown, and South Station.", orientation_label: "South downtown", x: 516, y: 450, nearby: [{ label: "Financial District", x: 560, y: 356 }, { label: "Theater District", x: 444, y: 392 }, { label: "Seaport", x: 676, y: 442 }, { label: "South End", x: 342, y: 458 }] }],
  ["north-station-west-end", { title: "North Station / West End", subtitle: "North downtown area with office, medical, transit, civic, and entertainment context.", orientation_label: "North downtown", x: 452, y: 182, nearby: [{ label: "Government Center", x: 526, y: 244 }, { label: "Downtown Boston", x: 506, y: 318 }, { label: "Financial District", x: 560, y: 356 }, { label: "Charles River", x: 254, y: 178 }] }],
  ["theater-district", { title: "Theater District", subtitle: "Downtown-adjacent district with hospitality, retail, office, and entertainment context.", orientation_label: "Central downtown", x: 444, y: 392, nearby: [{ label: "Downtown Boston", x: 506, y: 318 }, { label: "Leather District", x: 516, y: 450 }, { label: "Back Bay", x: 318, y: 318 }, { label: "South End", x: 342, y: 458 }] }],
  ["longwood-medical-area", { title: "Longwood Medical Area", subtitle: "Medical and institutional district with healthcare, research, and office-adjacent context.", orientation_label: "Medical district", x: 176, y: 412, nearby: [{ label: "Fenway-Kenmore", x: 186, y: 292 }, { label: "Back Bay", x: 318, y: 318 }, { label: "South End", x: 342, y: 458 }, { label: "Downtown Boston", x: 506, y: 318 }] }],
  ["south-end", { title: "South End", subtitle: "Central Boston neighborhood with retail, services, office-adjacent, and mixed commercial context.", orientation_label: "Southwest of downtown", x: 342, y: 458, nearby: [{ label: "Back Bay", x: 318, y: 318 }, { label: "Theater District", x: 444, y: 392 }, { label: "Leather District", x: 516, y: 450 }, { label: "Longwood", x: 176, y: 412 }] }],
  ["fenway-kenmore", { title: "Fenway-Kenmore", subtitle: "Central Boston district with institutional, medical-adjacent, retail, and entertainment context.", orientation_label: "West central Boston", x: 186, y: 292, nearby: [{ label: "Longwood", x: 176, y: 412 }, { label: "Back Bay", x: 318, y: 318 }, { label: "South End", x: 342, y: 458 }, { label: "Charles River", x: 254, y: 178 }] }]
];

const dcMapConfigs = [
  ["golden-triangle", { title: "Golden Triangle", subtitle: "Downtown DC business district near Dupont Circle and the central office core.", orientation_label: "Northwest office core", x: 380, y: 286, nearby: [{ label: "Dupont Circle", x: 330, y: 224 }, { label: "Downtown DC", x: 456, y: 316 }, { label: "Penn Quarter", x: 522, y: 372 }, { label: "Georgetown", x: 206, y: 284 }] }],
  ["downtown-dc", { title: "Downtown DC", subtitle: "Central Washington commercial core with office, civic, hospitality, and retail context.", orientation_label: "Central DC", x: 456, y: 316, nearby: [{ label: "Golden Triangle", x: 380, y: 286 }, { label: "Penn Quarter", x: 522, y: 372 }, { label: "Mount Vernon Triangle", x: 584, y: 290 }, { label: "National Mall", x: 470, y: 420 }] }],
  ["capitol-riverfront", { title: "Capitol Riverfront", subtitle: "Waterfront district with office, mixed-use, entertainment, and riverfront commercial context.", orientation_label: "Southeast waterfront", x: 660, y: 548, nearby: [{ label: "Capitol Hill", x: 662, y: 426 }, { label: "Southwest Waterfront", x: 506, y: 540 }, { label: "Penn Quarter", x: 522, y: 372 }, { label: "Anacostia River", x: 760, y: 612 }] }],
  ["penn-quarter", { title: "Penn Quarter", subtitle: "Central DC district with office, hospitality, civic, entertainment, and retail context.", orientation_label: "East downtown", x: 522, y: 372, nearby: [{ label: "Downtown DC", x: 456, y: 316 }, { label: "Mount Vernon Triangle", x: 584, y: 290 }, { label: "Capitol Hill", x: 662, y: 426 }, { label: "National Mall", x: 470, y: 420 }] }],
  ["mount-vernon-triangle", { title: "Mount Vernon Triangle", subtitle: "Northeast downtown district with office, residential, retail, and mixed-use context.", orientation_label: "Northeast downtown", x: 584, y: 290, nearby: [{ label: "Penn Quarter", x: 522, y: 372 }, { label: "NoMa", x: 652, y: 218 }, { label: "Downtown DC", x: 456, y: 316 }, { label: "Capitol Hill", x: 662, y: 426 }] }],
  ["noma", { title: "NoMa", subtitle: "North of Massachusetts Avenue district with office, residential, transit, and mixed-use context.", orientation_label: "North Capitol corridor", x: 652, y: 218, nearby: [{ label: "H Street NE", x: 724, y: 314 }, { label: "Mount Vernon Triangle", x: 584, y: 290 }, { label: "Capitol Hill", x: 662, y: 426 }, { label: "Penn Quarter", x: 522, y: 372 }] }],
  ["dupont-circle", { title: "Dupont Circle", subtitle: "Northwest DC district with office, embassy, retail, restaurant, and service context.", orientation_label: "Northwest DC", x: 330, y: 224, nearby: [{ label: "Golden Triangle", x: 380, y: 286 }, { label: "Downtown DC", x: 456, y: 316 }, { label: "Georgetown", x: 206, y: 284 }, { label: "Penn Quarter", x: 522, y: 372 }] }],
  ["capitol-hill", { title: "Capitol Hill", subtitle: "Civic and neighborhood district with office-adjacent, retail, and institutional context.", orientation_label: "East of the Mall", x: 662, y: 426, nearby: [{ label: "Penn Quarter", x: 522, y: 372 }, { label: "Capitol Riverfront", x: 660, y: 548 }, { label: "Mount Vernon Triangle", x: 584, y: 290 }, { label: "H Street NE", x: 724, y: 314 }] }],
  ["h-street-ne", { title: "H Street NE", subtitle: "Northeast DC corridor with retail, food, services, and neighborhood commercial context.", orientation_label: "Northeast corridor", x: 724, y: 314, nearby: [{ label: "NoMa", x: 652, y: 218 }, { label: "Capitol Hill", x: 662, y: 426 }, { label: "Mount Vernon Triangle", x: 584, y: 290 }, { label: "Penn Quarter", x: 522, y: 372 }] }],
  ["georgetown", { title: "Georgetown", subtitle: "Northwest DC district with retail, office-adjacent, hospitality, and waterfront context.", orientation_label: "Northwest waterfront", x: 206, y: 284, nearby: [{ label: "Dupont Circle", x: 330, y: 224 }, { label: "Golden Triangle", x: 380, y: 286 }, { label: "Downtown DC", x: 456, y: 316 }, { label: "Potomac River", x: 142, y: 504 }] }],
  ["southwest-waterfront", { title: "Southwest Waterfront", subtitle: "Waterfront district with hospitality, office-adjacent, entertainment, and mixed-use context.", orientation_label: "Southwest waterfront", x: 506, y: 540, nearby: [{ label: "Capitol Riverfront", x: 660, y: 548 }, { label: "Capitol Hill", x: 662, y: 426 }, { label: "Penn Quarter", x: 522, y: 372 }, { label: "Potomac River", x: 142, y: 504 }] }]
];

const atlantaMapConfigs = [
  ["buckhead", { title: "Buckhead", subtitle: "North Atlanta business district with office, retail, hospitality, and mixed commercial context.", orientation_label: "North Atlanta", x: 520, y: 142, nearby: [{ label: "Midtown", x: 476, y: 316 }, { label: "Perimeter Center", x: 660, y: 86 }, { label: "West Midtown", x: 344, y: 336 }, { label: "GA 400", x: 520, y: 164 }] }],
  ["midtown", { title: "Midtown", subtitle: "Central Atlanta district with office, institutional, retail, hospitality, and mixed-use context.", orientation_label: "Central Atlanta", x: 476, y: 316, nearby: [{ label: "Downtown Atlanta", x: 486, y: 454 }, { label: "Old Fourth Ward", x: 596, y: 382 }, { label: "West Midtown", x: 344, y: 336 }, { label: "Buckhead", x: 520, y: 142 }] }],
  ["downtown-atlanta", { title: "Downtown Atlanta", subtitle: "Central Atlanta business district with office, civic, hospitality, and institutional context.", orientation_label: "Downtown core", x: 486, y: 454, nearby: [{ label: "South Downtown", x: 482, y: 524 }, { label: "Midtown", x: 476, y: 316 }, { label: "Old Fourth Ward", x: 596, y: 382 }, { label: "Inman Park", x: 648, y: 470 }] }],
  ["perimeter-center", { title: "Perimeter Center", subtitle: "North Atlanta office and retail submarket near the perimeter and GA 400.", orientation_label: "North perimeter market", x: 660, y: 86, nearby: [{ label: "Buckhead", x: 520, y: 142 }, { label: "Cumberland", x: 238, y: 122 }, { label: "Midtown", x: 476, y: 316 }, { label: "285", x: 650, y: 92 }] }],
  ["cumberland-galleria", { title: "Cumberland / Galleria", subtitle: "Northwest Atlanta office, retail, hospitality, and entertainment submarket.", orientation_label: "Northwest submarket", x: 238, y: 122, nearby: [{ label: "Buckhead", x: 520, y: 142 }, { label: "Perimeter Center", x: 660, y: 86 }, { label: "West Midtown", x: 344, y: 336 }, { label: "Midtown", x: 476, y: 316 }] }],
  ["west-midtown", { title: "West Midtown", subtitle: "Westside Atlanta district with office, creative, retail, food, and mixed commercial context.", orientation_label: "Westside Atlanta", x: 344, y: 336, nearby: [{ label: "Midtown", x: 476, y: 316 }, { label: "Downtown Atlanta", x: 486, y: 454 }, { label: "Old Fourth Ward", x: 596, y: 382 }, { label: "Buckhead", x: 520, y: 142 }] }],
  ["old-fourth-ward", { title: "Old Fourth Ward", subtitle: "Eastside Atlanta district with retail, food, office-adjacent, and mixed-use context.", orientation_label: "East of Midtown", x: 596, y: 382, nearby: [{ label: "Inman Park", x: 648, y: 470 }, { label: "Midtown", x: 476, y: 316 }, { label: "Downtown Atlanta", x: 486, y: 454 }, { label: "South Downtown", x: 482, y: 524 }] }],
  ["fulton-industrial", { title: "Fulton Industrial", subtitle: "West Atlanta industrial corridor with logistics, warehouse, and service commercial context.", orientation_label: "West industrial corridor", x: 188, y: 560, nearby: [{ label: "West Midtown", x: 344, y: 336 }, { label: "South Downtown", x: 482, y: 524 }, { label: "Downtown Atlanta", x: 486, y: 454 }, { label: "I-20", x: 460, y: 532 }] }],
  ["hartsfield-jackson-airport-area", { title: "Hartsfield-Jackson Airport Area", subtitle: "Airport-area commercial district with logistics, hospitality, service, and transportation context.", orientation_label: "Airport submarket", x: 530, y: 674, nearby: [{ label: "South Downtown", x: 482, y: 524 }, { label: "Downtown Atlanta", x: 486, y: 454 }, { label: "Fulton Industrial", x: 188, y: 560 }, { label: "I-75/85", x: 470, y: 354 }] }],
  ["south-downtown", { title: "South Downtown", subtitle: "South of downtown district with civic, office-adjacent, retail, and mixed commercial context.", orientation_label: "South of downtown", x: 482, y: 524, nearby: [{ label: "Downtown Atlanta", x: 486, y: 454 }, { label: "Old Fourth Ward", x: 596, y: 382 }, { label: "Inman Park", x: 648, y: 470 }, { label: "Fulton Industrial", x: 188, y: 560 }] }],
  ["inman-park", { title: "Inman Park", subtitle: "Eastside Atlanta neighborhood with retail, food, services, and mixed commercial context.", orientation_label: "Eastside Atlanta", x: 648, y: 470, nearby: [{ label: "Old Fourth Ward", x: 596, y: 382 }, { label: "Downtown Atlanta", x: 486, y: 454 }, { label: "South Downtown", x: 482, y: 524 }, { label: "Midtown", x: 476, y: 316 }] }]
];

const bayAreaPilotMapConfigs = [
  ["oakland", "downtown-oakland", {
    title: "Downtown Oakland",
    subtitle: "East Bay institutional business core with BART, civic, and professional office context.",
    descriptor: "Near Uptown Oakland, Old Oakland, Jack London Square, and Lake Merritt.",
    orientation_label: "East Bay business core",
    approximate_polygon: "338,300 430,292 470,366 430,438 328,426 292,352",
    label_position: { x: 336, y: 366 },
    nearby: [
      { label: "Uptown Oakland", x: 388, y: 250 },
      { label: "Jack London Square", x: 370, y: 500 },
      { label: "Old Oakland", x: 282, y: 388 },
      { label: "Lake Merritt", x: 508, y: 330 }
    ],
    transit_or_freeway_labels: [
      { label: "BART", x: 398, y: 336 },
      { label: "880", x: 314, y: 506 },
      { label: "Bay Bridge", x: 190, y: 244 }
    ]
  }],
  ["oakland", "uptown-oakland", {
    title: "Uptown Oakland",
    subtitle: "Mixed-use Oakland office district with Broadway, Lake Merritt, arts, food, and BART context.",
    descriptor: "North of Downtown Oakland, near Lake Merritt and the Broadway office corridor.",
    orientation_label: "North of downtown",
    approximate_polygon: "338,210 456,212 500,288 460,364 334,352 286,274",
    label_position: { x: 346, y: 286 },
    nearby: [
      { label: "Downtown Oakland", x: 382, y: 390 },
      { label: "Lake Merritt", x: 520, y: 318 },
      { label: "Temescal", x: 366, y: 128 },
      { label: "Jack London Square", x: 370, y: 500 }
    ],
    transit_or_freeway_labels: [
      { label: "19th St BART", x: 390, y: 286 },
      { label: "Broadway", x: 438, y: 248 },
      { label: "980", x: 276, y: 328 }
    ]
  }],
  ["palo-alto", "downtown-palo-alto", {
    title: "Downtown Palo Alto",
    subtitle: "Walkable Peninsula downtown with startup, professional office, retail, and Caltrain context.",
    descriptor: "Near Menlo Park, California Avenue, Mountain View, and Redwood City.",
    orientation_label: "Peninsula downtown",
    approximate_polygon: "520,460 620,438 674,502 626,578 516,574 468,508",
    label_position: { x: 516, y: 520 },
    nearby: [
      { label: "Menlo Park", x: 510, y: 408 },
      { label: "California Ave", x: 620, y: 612 },
      { label: "Mountain View", x: 724, y: 604 },
      { label: "Redwood City", x: 454, y: 360 }
    ],
    transit_or_freeway_labels: [
      { label: "Caltrain", x: 584, y: 520 },
      { label: "El Camino", x: 544, y: 590 },
      { label: "101", x: 704, y: 470 }
    ]
  }]
];

const sandiegoMapConfigs = [
  ["downtown-san-diego", { title: "Downtown San Diego", subtitle: "Central San Diego commercial core with office, civic, hospitality, and waterfront context.", orientation_label: "Downtown waterfront", x: 318, y: 450, nearby: [{ label: "East Village", x: 386, y: 464 }, { label: "Little Italy", x: 302, y: 384 }, { label: "Barrio Logan", x: 400, y: 552 }, { label: "San Diego Bay", x: 192, y: 474 }] }],
  ["east-village", { title: "East Village", subtitle: "Downtown-adjacent district with office, entertainment, residential, and mixed commercial context.", orientation_label: "East downtown", x: 386, y: 464, nearby: [{ label: "Downtown San Diego", x: 318, y: 450 }, { label: "Barrio Logan", x: 400, y: 552 }, { label: "Little Italy", x: 302, y: 384 }, { label: "Bankers Hill", x: 342, y: 330 }] }],
  ["little-italy", { title: "Little Italy", subtitle: "North downtown neighborhood with food, retail, office-adjacent, and waterfront context.", orientation_label: "North downtown", x: 302, y: 384, nearby: [{ label: "Downtown San Diego", x: 318, y: 450 }, { label: "Bankers Hill", x: 342, y: 330 }, { label: "Liberty Station", x: 178, y: 392 }, { label: "San Diego Bay", x: 192, y: 474 }] }],
  ["mission-valley", { title: "Mission Valley", subtitle: "Central San Diego corridor with office, retail, hospitality, and freeway-oriented context.", orientation_label: "Central corridor", x: 450, y: 310, nearby: [{ label: "Bankers Hill", x: 342, y: 330 }, { label: "Kearny Mesa", x: 526, y: 220 }, { label: "Downtown San Diego", x: 318, y: 450 }, { label: "I-8", x: 418, y: 322 }] }],
  ["bankers-hill", { title: "Bankers Hill", subtitle: "Central San Diego neighborhood with office-adjacent, medical, retail, and service context.", orientation_label: "North of downtown", x: 342, y: 330, nearby: [{ label: "Little Italy", x: 302, y: 384 }, { label: "Downtown San Diego", x: 318, y: 450 }, { label: "Mission Valley", x: 450, y: 310 }, { label: "East Village", x: 386, y: 464 }] }],
  ["kearny-mesa", { title: "Kearny Mesa", subtitle: "Central San Diego business district with office, industrial, retail, and logistics context.", orientation_label: "Central business corridor", x: 526, y: 220, nearby: [{ label: "Mission Valley", x: 450, y: 310 }, { label: "University City", x: 532, y: 112 }, { label: "Sorrento Valley", x: 610, y: 72 }, { label: "805", x: 526, y: 278 }] }],
  ["sorrento-valley", { title: "Sorrento Valley", subtitle: "North San Diego employment area with office, life science, R&D, and freeway access context.", orientation_label: "North employment area", x: 610, y: 72, nearby: [{ label: "University City", x: 532, y: 112 }, { label: "Kearny Mesa", x: 526, y: 220 }, { label: "Rancho Bernardo", x: 696, y: 38 }, { label: "I-15", x: 640, y: 230 }] }],
  ["university-city", { title: "University City", subtitle: "North San Diego district with office, retail, medical, education, and mixed-use context.", orientation_label: "North San Diego", x: 532, y: 112, nearby: [{ label: "Sorrento Valley", x: 610, y: 72 }, { label: "Kearny Mesa", x: 526, y: 220 }, { label: "Mission Valley", x: 450, y: 310 }, { label: "I-5", x: 286, y: 430 }] }],
  ["rancho-bernardo", { title: "Rancho Bernardo", subtitle: "North San Diego business area with office, industrial, R&D, and corridor context.", orientation_label: "North inland corridor", x: 696, y: 38, nearby: [{ label: "Sorrento Valley", x: 610, y: 72 }, { label: "University City", x: 532, y: 112 }, { label: "Kearny Mesa", x: 526, y: 220 }, { label: "I-15", x: 640, y: 230 }] }],
  ["otay-mesa", { title: "Otay Mesa", subtitle: "South San Diego industrial and logistics district near major border and freeway corridors.", orientation_label: "South industrial district", x: 636, y: 668, nearby: [{ label: "Barrio Logan", x: 400, y: 552 }, { label: "East Village", x: 386, y: 464 }, { label: "Downtown San Diego", x: 318, y: 450 }, { label: "I-805", x: 526, y: 278 }] }],
  ["barrio-logan", { title: "Barrio Logan", subtitle: "South of downtown neighborhood with industrial, creative, retail, and waterfront commercial context.", orientation_label: "South downtown", x: 400, y: 552, nearby: [{ label: "East Village", x: 386, y: 464 }, { label: "Downtown San Diego", x: 318, y: 450 }, { label: "Little Italy", x: 302, y: 384 }, { label: "San Diego Bay", x: 192, y: 474 }] }],
  ["liberty-station", { title: "Liberty Station", subtitle: "Bay-adjacent district with office, retail, hospitality, and mixed commercial context.", orientation_label: "Bay-adjacent district", x: 178, y: 392, nearby: [{ label: "Little Italy", x: 302, y: 384 }, { label: "Downtown San Diego", x: 318, y: 450 }, { label: "Bankers Hill", x: 342, y: 330 }, { label: "San Diego Bay", x: 192, y: 474 }] }]
];

const nashvilleMapConfigs = [
  ["downtown-nashville", { title: "Downtown Nashville", subtitle: "Central Nashville district with office, hospitality, entertainment, civic, and retail context.", orientation_label: "Downtown core", x: 520, y: 378, nearby: [{ label: "SoBro", x: 540, y: 454 }, { label: "The Gulch", x: 438, y: 430 }, { label: "Germantown", x: 456, y: 278 }, { label: "Cumberland River", x: 644, y: 338 }] }],
  ["sobro", { title: "SoBro", subtitle: "South of Broadway district with hospitality, office-adjacent, entertainment, and mixed-use context.", orientation_label: "South downtown", x: 540, y: 454, nearby: [{ label: "Downtown Nashville", x: 520, y: 378 }, { label: "The Gulch", x: 438, y: 430 }, { label: "Music Row", x: 340, y: 392 }, { label: "I-40", x: 438, y: 442 }] }],
  ["midtown", { title: "Midtown", subtitle: "Central Nashville district with office-adjacent, medical, education, retail, and hospitality context.", orientation_label: "West of downtown", x: 300, y: 348, nearby: [{ label: "Music Row", x: 340, y: 392 }, { label: "The Gulch", x: 438, y: 430 }, { label: "West End", x: 220, y: 320 }, { label: "Downtown Nashville", x: 520, y: 378 }] }],
  ["music-row", { title: "Music Row", subtitle: "Central Nashville district with office, creative, entertainment, and service commercial context.", orientation_label: "Music business district", x: 340, y: 392, nearby: [{ label: "Midtown", x: 300, y: 348 }, { label: "The Gulch", x: 438, y: 430 }, { label: "West End", x: 220, y: 320 }, { label: "SoBro", x: 540, y: 454 }] }],
  ["west-end", { title: "West End", subtitle: "West Nashville corridor with office, medical, education, retail, and hospitality context.", orientation_label: "West End corridor", x: 220, y: 320, nearby: [{ label: "Midtown", x: 300, y: 348 }, { label: "Music Row", x: 340, y: 392 }, { label: "Green Hills", x: 174, y: 540 }, { label: "The Gulch", x: 438, y: 430 }] }],
  ["green-hills", { title: "Green Hills", subtitle: "Southwest Nashville commercial node with retail, office-adjacent, medical, and service context.", orientation_label: "Southwest commercial node", x: 174, y: 540, nearby: [{ label: "West End", x: 220, y: 320 }, { label: "Midtown", x: 300, y: 348 }, { label: "Music Row", x: 340, y: 392 }, { label: "I-440", x: 326, y: 522 }] }],
  ["east-nashville", { title: "East Nashville", subtitle: "East of downtown neighborhood with retail, food, services, creative, and mixed commercial context.", orientation_label: "East of downtown", x: 708, y: 386, nearby: [{ label: "Downtown Nashville", x: 520, y: 378 }, { label: "SoBro", x: 540, y: 454 }, { label: "Germantown", x: 456, y: 278 }, { label: "Cumberland River", x: 644, y: 338 }] }],
  ["donelson-airport-area", { title: "Donelson / Airport Area", subtitle: "Airport-area district with hospitality, office, logistics, and transportation context.", orientation_label: "Airport corridor", x: 742, y: 610, nearby: [{ label: "East Nashville", x: 708, y: 386 }, { label: "SoBro", x: 540, y: 454 }, { label: "Downtown Nashville", x: 520, y: 378 }, { label: "I-40", x: 438, y: 442 }] }],
  ["the-gulch", { title: "The Gulch", subtitle: "Downtown-adjacent district with office, hospitality, retail, and mixed-use commercial context.", orientation_label: "Southwest downtown", x: 438, y: 430, nearby: [{ label: "SoBro", x: 540, y: 454 }, { label: "Downtown Nashville", x: 520, y: 378 }, { label: "Music Row", x: 340, y: 392 }, { label: "Midtown", x: 300, y: 348 }] }],
  ["germantown", { title: "Germantown", subtitle: "North of downtown neighborhood with office-adjacent, retail, food, and mixed commercial context.", orientation_label: "North downtown", x: 456, y: 278, nearby: [{ label: "Downtown Nashville", x: 520, y: 378 }, { label: "The Gulch", x: 438, y: 430 }, { label: "East Nashville", x: 708, y: 386 }, { label: "Cumberland River", x: 644, y: 338 }] }]
];

const denverMapConfigs = [
  ["central-business-district", { title: "Central Business District", subtitle: "Downtown Denver office core with civic, hospitality, retail, and transit context.", orientation_label: "Downtown core", x: 430, y: 330, nearby: [{ label: "LoDo", x: 350, y: 288 }, { label: "Ballpark", x: 420, y: 224 }, { label: "Capitol Hill", x: 520, y: 412 }, { label: "Santa Fe", x: 330, y: 470 }] }],
  ["cherry-creek", { title: "Cherry Creek", subtitle: "Central Denver commercial district with retail, office, hospitality, and service context.", orientation_label: "East central district", x: 666, y: 456, nearby: [{ label: "Capitol Hill", x: 520, y: 412 }, { label: "Baker", x: 420, y: 548 }, { label: "CBD", x: 430, y: 330 }, { label: "DTC", x: 690, y: 652 }] }],
  ["lodo", { title: "LoDo", subtitle: "Lower Downtown district with office, hospitality, retail, entertainment, and transit context.", orientation_label: "Lower downtown", x: 350, y: 288, nearby: [{ label: "CBD", x: 430, y: 330 }, { label: "Ballpark", x: 420, y: 224 }, { label: "Lower Highland", x: 278, y: 266 }, { label: "RiNo", x: 520, y: 190 }] }],
  ["ballpark", { title: "Ballpark", subtitle: "North downtown district with office-adjacent, hospitality, entertainment, and mixed-use context.", orientation_label: "North downtown", x: 420, y: 224, nearby: [{ label: "LoDo", x: 350, y: 288 }, { label: "CBD", x: 430, y: 330 }, { label: "RiNo", x: 520, y: 190 }, { label: "Globeville", x: 396, y: 124 }] }],
  ["denver-tech-center", { title: "Denver Tech Center", subtitle: "Southeast Denver office and business corridor with highway and transit access context.", orientation_label: "Southeast business corridor", x: 690, y: 652, nearby: [{ label: "Cherry Creek", x: 666, y: 456 }, { label: "Baker", x: 420, y: 548 }, { label: "Capitol Hill", x: 520, y: 412 }, { label: "I-25", x: 354, y: 390 }] }],
  ["santa-fe-arts-district", { title: "Santa Fe Arts District", subtitle: "Central Denver district with creative, retail, service, and mixed commercial context.", orientation_label: "Southwest of downtown", x: 330, y: 470, nearby: [{ label: "Sun Valley", x: 268, y: 420 }, { label: "CBD", x: 430, y: 330 }, { label: "Baker", x: 420, y: 548 }, { label: "Capitol Hill", x: 520, y: 412 }] }],
  ["central-park", { title: "Central Park", subtitle: "Northeast Denver area with retail, office-adjacent, medical, and mixed commercial context.", orientation_label: "Northeast Denver", x: 724, y: 188, nearby: [{ label: "Northeast Industrial", x: 646, y: 116 }, { label: "RiNo", x: 520, y: 190 }, { label: "Globeville", x: 396, y: 124 }, { label: "I-70", x: 462, y: 166 }] }],
  ["capitol-hill", { title: "Capitol Hill", subtitle: "Central Denver neighborhood with office-adjacent, retail, service, and civic context.", orientation_label: "East of downtown", x: 520, y: 412, nearby: [{ label: "CBD", x: 430, y: 330 }, { label: "Cherry Creek", x: 666, y: 456 }, { label: "Santa Fe", x: 330, y: 470 }, { label: "Baker", x: 420, y: 548 }] }],
  ["sun-valley", { title: "Sun Valley", subtitle: "West of downtown district with industrial, service, civic, and mixed commercial context.", orientation_label: "West of downtown", x: 268, y: 420, nearby: [{ label: "Santa Fe", x: 330, y: 470 }, { label: "CBD", x: 430, y: 330 }, { label: "LoDo", x: 350, y: 288 }, { label: "Baker", x: 420, y: 548 }] }],
  ["northeast-denver-industrial", { title: "Northeast Denver Industrial", subtitle: "Northeast Denver industrial area with logistics, warehouse, service, and corridor context.", orientation_label: "Northeast industrial", x: 646, y: 116, nearby: [{ label: "Central Park", x: 724, y: 188 }, { label: "RiNo", x: 520, y: 190 }, { label: "Globeville", x: 396, y: 124 }, { label: "I-70", x: 462, y: 166 }] }],
  ["globeville", { title: "Globeville", subtitle: "North Denver district with industrial, service, mixed-use, and corridor context.", orientation_label: "North Denver", x: 396, y: 124, nearby: [{ label: "Elyria-Swansea", x: 482, y: 112 }, { label: "RiNo", x: 520, y: 190 }, { label: "Ballpark", x: 420, y: 224 }, { label: "I-70", x: 462, y: 166 }] }],
  ["river-north-art-district", { title: "River North Art District", subtitle: "North Denver district with creative, office, food, light industrial, and mixed commercial context.", orientation_label: "North of downtown", x: 520, y: 190, nearby: [{ label: "Ballpark", x: 420, y: 224 }, { label: "Globeville", x: 396, y: 124 }, { label: "CBD", x: 430, y: 330 }, { label: "Central Park", x: 724, y: 188 }] }],
  ["globeville-elyria-swansea", { title: "Globeville / Elyria-Swansea", subtitle: "North Denver area with industrial, logistics, service, and mixed commercial context.", orientation_label: "North Denver", x: 482, y: 112, nearby: [{ label: "Globeville", x: 396, y: 124 }, { label: "RiNo", x: 520, y: 190 }, { label: "Ballpark", x: 420, y: 224 }, { label: "Northeast Industrial", x: 646, y: 116 }] }],
  ["lower-highland", { title: "Lower Highland", subtitle: "Northwest of downtown district with office-adjacent, retail, food, and mixed-use context.", orientation_label: "Northwest of downtown", x: 278, y: 266, nearby: [{ label: "LoDo", x: 350, y: 288 }, { label: "Ballpark", x: 420, y: 224 }, { label: "CBD", x: 430, y: 330 }, { label: "Globeville", x: 396, y: 124 }] }],
  ["baker", { title: "Baker", subtitle: "South central Denver neighborhood with retail, creative, service, and mixed commercial context.", orientation_label: "South central Denver", x: 420, y: 548, nearby: [{ label: "Santa Fe", x: 330, y: 470 }, { label: "Capitol Hill", x: 520, y: 412 }, { label: "Cherry Creek", x: 666, y: 456 }, { label: "CBD", x: 430, y: 330 }] }]
];

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
  }),

  ...chicagoMapConfigs.map(([slug, config]) => chicagoCompactHero(slug, config)),
  ...laMapConfigs.map(([slug, config]) => laCompactHero(slug, config)),
  ...miamiMapConfigs.map(([slug, config]) => miamiCompactHero(slug, config)),
  ...dallasMapConfigs.map(([slug, config]) => dallasCompactHero(slug, config)),
  ...seattleMapConfigs.map(([slug, config]) => seattleCompactHero(slug, config)),
  ...bostonMapConfigs.map(([slug, config]) => bostonCompactHero(slug, config)),
  ...dcMapConfigs.map(([slug, config]) => dcCompactHero(slug, config)),
  ...atlantaMapConfigs.map(([slug, config]) => atlantaCompactHero(slug, config)),
  ...bayAreaPilotMapConfigs.map(([citySlug, slug, config]) => bayAreaSimpleHero(citySlug, slug, config)),
  ...sandiegoMapConfigs.map(([slug, config]) => sandiegoCompactHero(slug, config)),
  ...nashvilleMapConfigs.map(([slug, config]) => nashvilleCompactHero(slug, config)),
  ...denverMapConfigs.map(([slug, config]) => denverCompactHero(slug, config))
]);
