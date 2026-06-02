const fs = require("fs");
const path = require("path");

const pageDataPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "normalized",
  "neighborhoods.hidden-page-data.json"
);
const allowlistPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "normalized",
  "neighborhoods.public-review-allowlist.json"
);
const commercialAreasPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "commercial_area_entities_v1.json"
);
const commercialRelationshipsPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "commercial_area_building_relationships_v1.json"
);
const nycCandidatesPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "nyc_neighborhood_rollout_candidates.json"
);
const priorityMarketAreasPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "priority_market_commercial_area_entities_v1.json"
);
const curatedDistrictMediaExportPath = path.join(
  process.cwd(),
  "data",
  "media",
  "generated",
  "curated_district_media_export_v1.json"
);

const pages = JSON.parse(fs.readFileSync(pageDataPath, "utf8"));
const allowlist = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
const commercialAreas = JSON.parse(fs.readFileSync(commercialAreasPath, "utf8"));
const commercialRelationships = JSON.parse(fs.readFileSync(commercialRelationshipsPath, "utf8"));
const nycCandidates = fs.existsSync(nycCandidatesPath)
  ? JSON.parse(fs.readFileSync(nycCandidatesPath, "utf8"))
  : [];
const priorityMarketAreas = fs.existsSync(priorityMarketAreasPath)
  ? JSON.parse(fs.readFileSync(priorityMarketAreasPath, "utf8"))
  : [];
const curatedDistrictMediaExport = fs.existsSync(curatedDistrictMediaExportPath)
  ? JSON.parse(fs.readFileSync(curatedDistrictMediaExportPath, "utf8"))
  : null;
const buildingPages = require("./buildingPages.js");
const neighborhoodMapHeroes = require("./neighborhoodMapHeroes.js");
const neighborhoodIntelligence = require("./neighborhoodIntelligence.js");
const atlantaApprovedEditorialSignals = require("./atlantaApprovedEditorialSignals.js");
const commercialDistrictPublicIntegrations = require("./commercialDistrictPublicIntegrations.js");
const commercialLocationModel = require("./commercialLocationModel.js");
const representativeBuildingCards = require("./representativeBuildingCards.js");
const buildingByPath = new Map(buildingPages.map((building) => [building.building_path, building]));
const curatedDistrictMediaBySlug = curatedDistrictMediaForPublicUse(curatedDistrictMediaExport);
const allowlistByPath = new Map(
  allowlist.map((item) => [item.canonical_neighborhood_path, item])
);
const relationshipsByArea = new Map();
const areaSummaryById = new Map(
  (commercialRelationships.area_summaries || []).map((area) => [area.area_id, area])
);

for (const relationship of commercialRelationships.relationships || []) {
  if (!relationshipsByArea.has(relationship.primary_area_id)) {
    relationshipsByArea.set(relationship.primary_area_id, []);
  }

  relationshipsByArea.get(relationship.primary_area_id).push(relationship);
}

function cleanBuildingName(name) {
  if (!name) {
    return "";
  }

  return String(name)
    .replace(/\s+/g, " ")
    .replace(/[!]+$/g, "")
    .trim();
}

function hasUsableAddress(address) {
  return Boolean(
    address &&
      /\d/.test(String(address)) &&
      String(address).trim().length > 3
  );
}

function shortBuildingLabel(value) {
  return cleanBuildingName(value)
    .replace(/,\s*(Buckhead|Midtown|Downtown Atlanta|Perimeter Center|West Midtown)$/i, "")
    .replace(/\bNortheast\b/g, "NE")
    .replace(/\bNorthwest\b/g, "NW")
    .replace(/\bSoutheast\b/g, "SE")
    .replace(/\bSouthwest\b/g, "SW")
    .replace(/\bRoad\b/g, "Rd")
    .replace(/\bStreet\b/g, "St")
    .replace(/\bAvenue\b/g, "Ave")
    .replace(/\bParkway\b/g, "Pkwy")
    .replace(/\bCenter\b/g, "Ctr")
    .replace(/\s+/g, " ")
    .trim();
}

function editorialTypeLabel(value) {
  const label = clean(value);
  const readableLabel = /\bspace\b/i.test(label) ? label : typeLabel(label);

  return readableLabel.replace(/\bSpace\b/g, "space");
}

function editorialBuildingDescriptor(building) {
  const type = clean(building.type || building.primary_type_label).toLowerCase();
  const sizeLabel = clean(building.size_label).toLowerCase();
  const name = clean(`${building.name || ""} ${building.display_name || ""}`).toLowerCase();

  if (type.includes("industrial")) return "Large-format space";
  if (name.match(/\b(concourse|plaza|promenade|meridian|colony square|tower)\b/)) return "Office tower";
  if (sizeLabel.includes("small")) return "Small suites";
  if (sizeLabel.includes("mid")) return "Mid-size suites";
  if (sizeLabel.includes("large") || sizeLabel.includes("range")) return "Larger floorplates";
  if (type.includes("office")) return "Office building";
  if (type.includes("retail")) return "Street-level context";
  if (type.includes("flex")) return "Flexible layouts";

  return "Commercial example";
}

function normalizeRepresentativeBuilding(building) {
  const address = cleanBuildingName(building.address);
  const name = cleanBuildingName(building.display_name || building.name);
  const displayName = hasUsableAddress(address) ? address : name;

  return {
    ...building,
    display_name: displayName,
    short_display_name: shortBuildingLabel(displayName),
    editorial_type_label: editorialTypeLabel(building.type || building.primary_type_label || "commercial"),
    editorial_descriptor: editorialBuildingDescriptor(building),
  };
}

function displayMediaLabel(asset) {
  return clean(asset.building_name) || clean(asset.address) || clean(asset.district_name);
}

function curatedDistrictMediaForPublicUse(exportManifest) {
  const media = {
    "financial-district": {
      eyebrow: "Views of the Financial District",
      heading: "",
      caption: "A few views that show the Financial District’s vertical office core, street-level business setting, and downtown San Francisco context.",
      primary: {
        district_slug: "financial-district",
        district_name: "Financial District",
        label: "Financial District street-level office core",
        src: "/assets/images/districts/financial-district-sf/battery-market-streetscape.webp",
        thumb_src: "/assets/images/districts/financial-district-sf/battery-market-streetscape.webp",
        canonical_building_path: "",
        alt: "Street-level office and business context near Battery and Market in San Francisco’s Financial District",
      },
      supporting: [],
    },
    "jackson-square": {
      eyebrow: "Views of Jackson Square",
      heading: "",
      caption: "A few views that show Jackson Square’s smaller-scale historic commercial blocks at the edge of San Francisco’s downtown office core.",
      primary: {
        district_slug: "jackson-square",
        district_name: "Jackson Square",
        label: "Jackson Square historic commercial block",
        src: "/assets/images/districts/jackson-square/streetscape.webp",
        thumb_src: "/assets/images/districts/jackson-square/streetscape.webp",
        canonical_building_path: "",
        alt: "Street-level commercial buildings in Jackson Square near San Francisco’s downtown core",
      },
      supporting: [
        {
          district_slug: "jackson-square",
          district_name: "Jackson Square",
          label: "Jackson Square historic block and downtown edge",
          src: "/assets/images/districts/jackson-square/historic-block-transamerica.webp",
          thumb_src: "/assets/images/districts/jackson-square/historic-block-transamerica.webp",
          canonical_building_path: "",
          alt: "Historic Jackson Square commercial block with the downtown San Francisco skyline nearby",
        },
      ],
    },
    "mission-bay": {
      eyebrow: "Views of Mission Bay",
      heading: "",
      caption: "A few views that show Mission Bay’s newer institutional, life-science, office, and waterfront-adjacent commercial environment.",
      primary: {
        district_slug: "mission-bay",
        district_name: "Mission Bay",
        label: "Mission Bay commercial streetscape",
        src: "/assets/images/districts/mission-bay/mission-bay-streetscape.webp",
        thumb_src: "/assets/images/districts/mission-bay/mission-bay-streetscape.webp",
        canonical_building_path: "",
        alt: "Modern commercial streetscape in Mission Bay near San Francisco’s life-science and institutional district",
      },
      supporting: [
        {
          district_slug: "mission-bay",
          district_name: "Mission Bay",
          label: "Mission Bay office context",
          src: "/assets/images/districts/mission-bay/mission-bay-office.webp",
          thumb_src: "/assets/images/districts/mission-bay/mission-bay-office.webp",
          canonical_building_path: "",
          alt: "Modern office building context in San Francisco’s Mission Bay commercial district",
        },
        {
          district_slug: "mission-bay",
          district_name: "Mission Bay",
          label: "Mission Bay waterfront edge",
          src: "/assets/images/districts/mission-bay/china-basin-waterline.webp",
          thumb_src: "/assets/images/districts/mission-bay/china-basin-waterline.webp",
          canonical_building_path: "",
          alt: "Waterfront-adjacent commercial context along the China Basin edge of Mission Bay",
        },
      ],
    },
    "downtown-oakland": {
      eyebrow: "Views of Downtown Oakland",
      heading: "",
      caption: "A few views that show Downtown Oakland’s BART-centered civic and business core around Broadway, City Center, and nearby downtown commercial blocks.",
      primary: {
        district_slug: "downtown-oakland",
        district_name: "Downtown Oakland",
        label: "Downtown Oakland office core",
        src: "/assets/images/districts/downtown-oakland/downtown-oakland-hero.webp",
        thumb_src: "/assets/images/districts/downtown-oakland/downtown-oakland-hero.webp",
        canonical_building_path: "",
        alt: "Downtown Oakland commercial core with office and civic business context",
      },
      supporting: [
        {
          district_slug: "downtown-oakland",
          district_name: "Downtown Oakland",
          label: "Downtown Oakland district edge",
          src: "/assets/images/districts/downtown-oakland/downtown-oakland-border.webp",
          thumb_src: "/assets/images/districts/downtown-oakland/downtown-oakland-border.webp",
          canonical_building_path: "",
          alt: "Downtown Oakland commercial district edge near the central business core",
        },
      ],
    },
    "uptown-oakland": {
      eyebrow: "Views of Uptown Oakland",
      heading: "",
      caption: "A few views that show Uptown Oakland’s mixed-use, arts-adjacent commercial setting north of Downtown Oakland.",
      primary: {
        district_slug: "uptown-oakland",
        district_name: "Uptown Oakland",
        label: "Uptown Oakland mixed-use commercial context",
        src: "/assets/images/districts/uptown-oakland/uptown-oakland-hero.webp",
        thumb_src: "/assets/images/districts/uptown-oakland/uptown-oakland-hero.webp",
        canonical_building_path: "",
        alt: "Uptown Oakland mixed-use commercial and office district context",
      },
      supporting: [
        {
          district_slug: "uptown-oakland",
          district_name: "Uptown Oakland",
          label: "Uptown Oakland Fox Theater area",
          src: "/assets/images/districts/uptown-oakland/uptown-oakland-fox.webp",
          thumb_src: "/assets/images/districts/uptown-oakland/uptown-oakland-fox.webp",
          canonical_building_path: "",
          alt: "Uptown Oakland commercial blocks near the Fox Theater area",
        },
        {
          district_slug: "uptown-oakland",
          district_name: "Uptown Oakland",
          label: "Uptown Oakland district edge",
          src: "/assets/images/districts/uptown-oakland/uptown-oakland-border.webp",
          thumb_src: "/assets/images/districts/uptown-oakland/uptown-oakland-border.webp",
          canonical_building_path: "",
          alt: "Uptown Oakland commercial district edge near Downtown Oakland",
        },
      ],
    },
    soma: {
      eyebrow: "Views of SoMa",
      heading: "",
      caption: "A few views that capture SoMa’s mix of converted warehouses, creative offices, and dense urban fabric.",
      primary: {
        district_slug: "soma",
        district_name: "SoMa",
        label: "South Park office context",
        src: "/assets/images/districts/soma/south-park-office.webp",
        thumb_src: "/assets/images/districts/soma/south-park-office.webp",
        canonical_building_path: "",
        alt: "South Park office and commercial context in San Francisco’s SoMa district",
      },
      supporting: [],
    },
  };

  const soma = exportManifest?.districts?.soma;
  if (!soma || !Array.isArray(soma.assets) || !soma.assets.length) return media;

  const assets = soma.assets
    .filter((asset) =>
      asset &&
      asset.exported &&
      asset.output_url_path &&
      String(asset.output_url_path).endsWith(".webp")
    )
    .slice(0, 5)
    .map((asset) => {
      const label = displayMediaLabel(asset);
      const canonicalPath = clean(asset.canonical_building_path);
      return {
        district_slug: asset.district_slug,
        district_name: asset.district_name || "SoMa",
        label,
        building_id: asset.building_id,
        building_name: clean(asset.building_name),
        address: clean(asset.address),
        src: asset.output_url_path,
        thumb_src: asset.thumbnail_url_path || asset.output_url_path,
        canonical_building_path: canonicalPath && buildingByPath.has(canonicalPath) ? canonicalPath : "",
        alt: `${label} in the SoMa commercial district, San Francisco`,
      };
    });

  if (!assets.length) return media;

  const southParkOfficeImage = {
    district_slug: "soma",
    district_name: "SoMa",
    label: "South Park office context",
    src: "/assets/images/districts/soma/south-park-office.webp",
    thumb_src: "/assets/images/districts/soma/south-park-office.webp",
    canonical_building_path: "",
    alt: "South Park office and commercial context in San Francisco’s SoMa district",
  };

  media.soma = {
    eyebrow: "Views of SoMa",
    heading: "",
    caption: "A few views that capture SoMa’s mix of converted warehouses, creative offices, and dense urban fabric.",
    primary: assets[0],
    supporting: [southParkOfficeImage, ...assets.slice(1, 4)],
  };

  return media;
}

function districtLocatorMapFor(page) {
  const pagePath = page.canonical_neighborhood_path;

  if (
    page.slug === "soma" &&
    clean(page.city).toLowerCase() === "san francisco" &&
    clean(page.state_abbr).toUpperCase() === "CA"
  ) {
    return {
      eyebrow: "Area map",
      title: "SoMa in context",
      copy:
        "A simplified view of SoMa’s position between Market Street, the Financial District, Mission Bay, and the waterfront.",
      alt:
        "Simplified contextual map showing SoMa between Market Street, the Financial District, Mission Bay, the Mission, and the San Francisco waterfront.",
      promote_to_identity: true,
    };
  }

  if (
    page.slug === "financial-district" &&
    clean(page.city).toLowerCase() === "san francisco" &&
    clean(page.state_abbr).toUpperCase() === "CA"
  ) {
    return {
      variant: "financial_district_sf",
      eyebrow: "Area map",
      title: "Financial District in context",
      copy:
        "A simplified view of the Financial District’s position between the Embarcadero, Jackson Square, Union Square, Market Street, and SoMa.",
      alt:
        "Simplified contextual map showing San Francisco's Financial District near the Embarcadero, Jackson Square, Union Square, Market Street, SoMa, and the Bay Bridge.",
      promote_to_identity: true,
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/mission-bay/") {
    return {
      variant: "sf_central_context",
      primary: "mission-bay",
      eyebrow: "Area map",
      title: "Mission Bay in context",
      copy:
        "A simplified view of Mission Bay’s position south of SoMa, near Dogpatch, Design District / Showplace Square, the waterfront, and the downtown office core.",
      alt:
        "Simplified contextual map showing Mission Bay south of SoMa, near Dogpatch, Design District and Showplace Square, the waterfront, and the Financial District.",
      promote_to_identity: true,
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/jackson-square/") {
    return {
      variant: "sf_central_context",
      primary: "jackson-square",
      eyebrow: "Area map",
      title: "Jackson Square in context",
      copy:
        "A simplified view of Jackson Square’s position at the northern edge of the Financial District, near the Embarcadero, North Beach, Chinatown, and SoMa.",
      alt:
        "Simplified contextual map showing Jackson Square near the Financial District, Embarcadero, North Beach, Chinatown, SoMa, and the waterfront.",
      promote_to_identity: true,
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/downtown-oakland/") {
    return {
      variant: "oakland_core",
      primary: "downtown-oakland",
      eyebrow: "Area map",
      title: "Downtown Oakland in context",
      copy:
        "A simplified view of Downtown Oakland’s position around Broadway, City Center, BART, Uptown, Lake Merritt, Old Oakland, and Jack London Square.",
      alt:
        "Simplified contextual map showing Downtown Oakland near Uptown Oakland, Lake Merritt, Old Oakland, Jack London Square, Broadway, and BART.",
      promote_to_identity: true,
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/uptown-oakland/") {
    return {
      variant: "oakland_core",
      primary: "uptown-oakland",
      eyebrow: "Area map",
      title: "Uptown Oakland in context",
      copy:
        "A simplified view of Uptown Oakland’s position north of Downtown Oakland, near Broadway, Lake Merritt, BART, and the arts-adjacent mixed-use core.",
      alt:
        "Simplified contextual map showing Uptown Oakland near Downtown Oakland, Lake Merritt, Broadway, BART, Old Oakland, and Jack London Square.",
      promote_to_identity: true,
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/jack-london-square/") {
    return {
      variant: "oakland_core",
      primary: "jack-london-square",
      eyebrow: "Area map",
      title: "Jack London Square in context",
      copy:
        "A simplified view of Jack London Square’s waterfront position south of Downtown Oakland and Old Oakland, with rail, ferry, and adaptive-commercial context.",
      alt:
        "Simplified contextual map showing Jack London Square along the Oakland waterfront near Downtown Oakland, Old Oakland, Uptown Oakland, Broadway, and Lake Merritt.",
      promote_to_identity: true,
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/old-oakland/") {
    return {
      variant: "oakland_core",
      primary: "old-oakland",
      eyebrow: "Area map",
      title: "Old Oakland in context",
      copy:
        "A simplified view of Old Oakland’s position between Downtown Oakland, Uptown Oakland, Jack London Square, Broadway, BART, and the waterfront.",
      alt:
        "Simplified contextual map showing Old Oakland between Downtown Oakland, Uptown Oakland, Jack London Square, Broadway, BART, Lake Merritt, and the waterfront.",
      promote_to_identity: true,
    };
  }

  if (pagePath === "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/") {
    return {
      variant: "downtown_palo_alto",
      eyebrow: "Area map",
      title: "Downtown Palo Alto in context",
      copy:
        "A simplified view of Downtown Palo Alto’s position around University Avenue, Hamilton, Lytton, Caltrain, Stanford, and the broader Peninsula commercial corridor.",
      alt:
        "Simplified contextual map showing Downtown Palo Alto near University Avenue, Hamilton Avenue, Lytton Avenue, Caltrain, Stanford, El Camino Real, and California Avenue.",
      promote_to_identity: true,
    };
  }

  return null;
}

function districtIdentityFor(page) {
  const pagePath = page.canonical_neighborhood_path;

  if (
    page.slug === "soma" &&
    clean(page.city).toLowerCase() === "san francisco" &&
    clean(page.state_abbr).toUpperCase() === "CA"
  ) {
    return {
      eyebrow: "District Guide",
      title: "SoMa Commercial District",
      lead:
        "Understand SoMa as a broad central San Francisco commercial district shaped by Market Street, larger blocks, creative offices, converted warehouses, Mission Bay, and the waterfront.",
      guide_label: "District guide",
    };
  }

  if (
    page.slug === "financial-district" &&
    clean(page.city).toLowerCase() === "san francisco" &&
    clean(page.state_abbr).toUpperCase() === "CA"
  ) {
    return {
      eyebrow: "District Guide",
      title: "Financial District SF",
      lead:
        "Understand the Financial District as San Francisco’s formal downtown business core: vertical office buildings, historic commercial blocks, transit access, client-facing services, and a tighter office-oriented setting than SoMa.",
      guide_label: "Business district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/mission-bay/") {
    return {
      eyebrow: "District Guide",
      title: "Mission Bay Commercial District",
      lead:
        "Understand Mission Bay as San Francisco’s newer institutional and life-science-oriented commercial district, shaped by UCSF gravity, modern office and lab-adjacent buildings, larger development parcels, and waterfront adjacency south of SoMa.",
      guide_label: "Institutional district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/jackson-square/") {
    return {
      eyebrow: "District Guide",
      title: "Jackson Square Commercial District",
      lead:
        "Understand Jackson Square as a historic boutique office district at the edge of the Financial District, with smaller-scale commercial buildings, design and professional-service texture, and downtown access without a tower-core feel.",
      guide_label: "Boutique district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/downtown-oakland/") {
    return {
      eyebrow: "District Guide",
      title: "Downtown Oakland Commercial District",
      lead:
        "Understand Downtown Oakland as the East Bay’s civic, transit, and business core: BART-centered, practical, office-oriented, and closely tied to Broadway, City Center, and public-sector adjacency.",
      guide_label: "Business district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/uptown-oakland/") {
    return {
      eyebrow: "District Guide",
      title: "Uptown Oakland Commercial District",
      lead:
        "Understand Uptown Oakland as Downtown Oakland’s mixed-use counterpart: arts-adjacent, smaller-company friendly, transit-connected, and more textured by food, housing, and street-level activity.",
      guide_label: "District guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/jack-london-square/") {
    return {
      eyebrow: "District Guide",
      title: "Jack London Square Commercial District",
      lead:
        "Understand Jack London Square as Oakland’s waterfront adaptive-commercial district, where office, service, food and beverage, visitor activity, rail, ferry, and warehouse-adjacent blocks shape the business setting.",
      guide_label: "Waterfront district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/old-oakland/") {
    return {
      eyebrow: "District Guide",
      title: "Old Oakland Commercial District",
      lead:
        "Understand Old Oakland as a historic downtown transition district connecting Oakland’s civic office core and Jack London Square, with smaller-scale commercial blocks, retail-office texture, and downtown-edge access.",
      guide_label: "Historic district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/") {
    return {
      eyebrow: "District Guide",
      title: "Downtown Palo Alto Commercial District",
      lead:
        "Understand Downtown Palo Alto as a walkable Peninsula professional district: Caltrain-adjacent, client-facing, startup and venture-oriented, and distinct from campus or highway-corridor office geography.",
      guide_label: "Peninsula district guide",
    };
  }

  if (page.public_south_bay_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the South Bay commercial geography graph, with context for office, R&D, flex, industrial, and nearby district comparisons.`,
      guide_label: "South Bay district guide",
    };
  }

  if (page.public_east_bay_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the East Bay commercial geography graph, with context for office, industrial/flex, and nearby business district comparisons.`,
      guide_label: "East Bay district guide",
    };
  }

  if (page.public_north_bay_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the North Bay commercial geography graph, with context for office, medical office, service commercial, light industrial/flex, and nearby market comparisons.`,
      guide_label: "North Bay district guide",
    };
  }

  if (page.public_sacramento_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the Sacramento commercial geography graph, with context for office, industrial/flex, medical office, service commercial, and nearby market comparisons.`,
      guide_label: "Sacramento district guide",
    };
  }

  if (page.public_san_diego_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the San Diego commercial geography graph, with context for office, industrial/flex, life science, logistics, North County, and nearby market comparisons.`,
      guide_label: "San Diego district guide",
    };
  }

  if (page.public_orange_county_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the Orange County commercial geography graph, with context for office, industrial/flex, service commercial, regional retail, and nearby market comparisons.`,
      guide_label: "Orange County district guide",
    };
  }

  if (page.public_inland_empire_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the Inland Empire commercial geography graph, with context for warehouse, logistics, industrial/flex, freeway access, and regional market comparisons.`,
      guide_label: "Inland Empire district guide",
    };
  }

  if (page.public_los_angeles_v1) {
    const locationModel = commercialLocationModel.byPath[pagePath];

    return {
      eyebrow: "District Guide",
      title: `${page.name} Commercial District`,
      lead:
        locationModel?.commercial_thesis ||
        `Understand ${page.name} as part of the Los Angeles commercial geography graph, with context for office, media/creative, industrial/flex, logistics, aerospace, and nearby market comparisons.`,
      guide_label: "Los Angeles district guide",
    };
  }

  return null;
}

function representativeBuildingRolesFor(page) {
  const pagePath = page.canonical_neighborhood_path;

  if (
    page.slug === "soma" &&
    clean(page.city).toLowerCase() === "san francisco" &&
    clean(page.state_abbr).toUpperCase() === "CA"
  ) {
    return {
      "/commercial-real-estate/building/CA/san-francisco/144-2nd-st/":
        "Converted warehouse / creative office texture",
      "/commercial-real-estate/building/CA/san-francisco/414-brannan-st/":
        "South Park creative office cluster",
      "/commercial-real-estate/building/CA/san-francisco/699-2nd-st/":
        "China Basin / 2nd Street edge",
      "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/":
        "Townsend corridor office context",
      "/commercial-real-estate/building/CA/san-francisco/460-townsend-st/":
        "Flex / production-commercial edge",
      "/commercial-real-estate/building/CA/san-francisco/909-harrison-st/":
        "Historic industrial-commercial form",
    };
  }

  if (
    page.slug === "financial-district" &&
    clean(page.city).toLowerCase() === "san francisco" &&
    clean(page.state_abbr).toUpperCase() === "CA"
  ) {
    return {
      "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/":
        "Transit and street-level business core",
      "/commercial-real-estate/building/CA/san-francisco/44-montgomery-st/":
        "Vertical downtown office form",
      "/commercial-real-estate/building/CA/san-francisco/315-montgomery-st/":
        "Montgomery Street office corridor",
      "/commercial-real-estate/building/CA/san-francisco/325-kearny-st/":
        "Jackson Square edge office texture",
      "/commercial-real-estate/building/CA/san-francisco/333-kearny-st/":
        "Historic core edge example",
      "/commercial-real-estate/building/CA/san-francisco/212-sutter-st/":
        "Smaller client-facing office block",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/mission-bay/") {
    return {
      "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/":
        "Institutional / life-science office",
      "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/":
        "Waterfront-adjacent commercial",
      "/commercial-real-estate/building/CA/san-francisco/555-mission-rock-st/":
        "Modern mixed-use commercial",
      "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/":
        "SoMa-to-Mission Bay modern office edge",
      "/commercial-real-estate/building/CA/san-francisco/99-rhode-island-st/":
        "Potrero and life-science-adjacent office edge",
      "/commercial-real-estate/building/CA/san-francisco/54-jeff-adachi-way/":
        "Newer Mission Bay commercial block",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/jackson-square/") {
    return {
      "/commercial-real-estate/building/CA/san-francisco/75-broadway/":
        "Boutique office edge near the downtown core",
      "/commercial-real-estate/building/CA/san-francisco/2-embarcadero-ctr/":
        "Embarcadero and Financial District edge",
      "/commercial-real-estate/building/CA/san-francisco/924-sansome-st/":
        "Historic street-level commercial texture",
      "/commercial-real-estate/building/CA/san-francisco/1100-grant-ave/":
        "Historic boutique office",
      "/commercial-real-estate/building/CA/san-francisco/33-drumm-st/":
        "Waterfront-edge retail support",
      "/commercial-real-estate/building/CA/san-francisco/27-drumm-st/":
        "Small-format downtown edge example",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/downtown-oakland/") {
    return {
      "/commercial-real-estate/building/CA/oakland/1333-broadway/":
        "Broadway office-core example",
      "/commercial-real-estate/building/CA/oakland/505-14th-st/":
        "City Center and BART-oriented office setting",
      "/commercial-real-estate/building/CA/oakland/300-frank-h-ogawa-plz/":
        "Civic core office adjacency",
      "/commercial-real-estate/building/CA/oakland/1440-broadway/":
        "Downtown mid-rise office fabric",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/uptown-oakland/") {
    return {
      "/commercial-real-estate/building/CA/oakland/1-kaiser-plz/":
        "Lake Merritt edge office setting",
      "/commercial-real-estate/building/CA/oakland/2101-webster-st/":
        "Uptown office and mixed-use edge",
      "/commercial-real-estate/building/CA/oakland/1970-broadway/":
        "Broadway arts-adjacent office corridor",
      "/commercial-real-estate/building/CA/oakland/415-20th-st/":
        "Smaller-company Uptown office fabric",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/jack-london-square/") {
    return {
      "/commercial-real-estate/building/CA/oakland/160-franklin-st/":
        "Waterfront-adjacent commercial",
      "/commercial-real-estate/building/CA/oakland/424-3rd-st/":
        "Adaptive commercial building",
      "/commercial-real-estate/building/CA/oakland/66-franklin-st/":
        "Waterfront office and visitor-facing edge",
      "/commercial-real-estate/building/CA/oakland/230-madison-st/":
        "Warehouse-adjacent adaptive commercial texture",
      "/commercial-real-estate/building/CA/oakland/105-2nd-st/":
        "Lower-scale waterfront commercial block",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/oakland/old-oakland/") {
    return {
      "/commercial-real-estate/building/CA/oakland/1000-broadway/":
        "Historic downtown transition",
      "/commercial-real-estate/building/CA/oakland/1212-broadway/":
        "Broadway transit-oriented edge",
      "/commercial-real-estate/building/CA/oakland/1111-broadway/":
        "Downtown edge office example",
      "/commercial-real-estate/building/CA/oakland/1221-broadway/":
        "Broadway transition toward the civic core",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/") {
    return {
      "/commercial-real-estate/building/CA/palo-alto/525-university-ave/":
        "University Avenue professional office",
      "/commercial-real-estate/building/CA/palo-alto/101-lytton-ave/":
        "Caltrain-oriented professional office",
      "/commercial-real-estate/building/CA/palo-alto/530-lytton-ave/":
        "Lytton Avenue professional office fabric",
      "/commercial-real-estate/building/CA/palo-alto/228-hamilton-ave/":
        "Hamilton Avenue client-facing office setting",
      "/commercial-real-estate/building/CA/palo-alto/400-hamilton-ave/":
        "Compact Peninsula office example",
    };
  }

  if (page.public_south_bay_v1) {
    const rolesByPath = {
      "/commercial-real-estate/building/CA/san-jose/2033-gateway-place/":
        "Airport-adjacent office and technology corridor",
      "/commercial-real-estate/building/CA/san-jose/2880-zanker-rd/":
        "North San Jose R&D / office corridor",
      "/commercial-real-estate/building/CA/san-jose/350-w-trimble-rd/":
        "Industrial/flex edge near the technology corridor",
      "/commercial-real-estate/building/CA/san-jose/1510-montague-expy/":
        "Montague Expressway office/flex context",
      "/commercial-real-estate/building/CA/san-jose/725-775-ridder-park-dr/":
        "North San Jose business park setting",
      "/commercial-real-estate/building/CA/san-jose/99-almaden-blvd/":
        "Downtown San Jose office core",
      "/commercial-real-estate/building/CA/san-jose/75-e-santa-clara-st/":
        "Central downtown office address",
      "/commercial-real-estate/building/CA/san-jose/18-n-1st-st/":
        "Historic downtown street-level office context",
      "/commercial-real-estate/building/CA/san-jose/45-n-san-pedro-st/":
        "San Pedro downtown commercial block",
      "/commercial-real-estate/building/CA/san-jose/333-w-san-carlos-st/":
        "Downtown tower and convention edge",
      "/commercial-real-estate/building/CA/santa-clara/2445-augustine-dr/":
        "Santa Clara technology campus office",
      "/commercial-real-estate/building/CA/santa-clara/3300-olcott-st/":
        "Central Santa Clara office/tech corridor",
      "/commercial-real-estate/building/CA/santa-clara/777-lawrence-expy/":
        "Lawrence Expressway office/R&D context",
      "/commercial-real-estate/building/CA/santa-clara/2300-walsh-ave/":
        "Santa Clara R&D/flex business park",
      "/commercial-real-estate/building/CA/santa-clara/4300-great-america-pkwy/":
        "Great America Parkway office node",
      "/commercial-real-estate/building/CA/santa-clara/5201-great-america-pkwy/":
        "Tasman and Great America technology office context",
      "/commercial-real-estate/building/CA/santa-clara/mission-college-blvd-and-montague-expy/":
        "Mission College / Montague commercial edge",
      "/commercial-real-estate/building/CA/sunnyvale/1277-borregas-ave/":
        "Moffett Park technology office context",
      "/commercial-real-estate/building/CA/sunnyvale/415-n-mary-ave/":
        "North Sunnyvale office/R&D corridor",
      "/commercial-real-estate/building/CA/sunnyvale/525-almanor-ave/":
        "Sunnyvale technology campus edge",
      "/commercial-real-estate/building/CA/sunnyvale/710-lakeway-drive-suite-200/":
        "Moffett Park office suite artifact to review",
      "/commercial-real-estate/building/CA/mountain-view/605-ellis-st/":
        "Mountain View office/R&D edge",
      "/commercial-real-estate/building/CA/mountain-view/1954-1958-old-middlefield-wy/":
        "Old Middlefield technology corridor",
      "/commercial-real-estate/building/CA/mountain-view/140-144-whisman-rd-s/":
        "Whisman R&D/flex office context",
      "/commercial-real-estate/building/CA/mountain-view/194-198-castro-st/":
        "Castro Street downtown commercial block",
      "/commercial-real-estate/building/CA/mountain-view/275-castro-st/":
        "Downtown Mountain View office and retail texture",
      "/commercial-real-estate/building/CA/mountain-view/785-castro-st/":
        "Caltrain-oriented downtown office edge",
      "/commercial-real-estate/building/CA/mountain-view/800-w-el-camino-real/":
        "Downtown Mountain View professional office context",
      "/commercial-real-estate/building/CA/palo-alto/2470-embarcadero-way/":
        "Stanford Research Park office/R&D context",
      "/commercial-real-estate/building/CA/palo-alto/2100-geng-rd/":
        "Palo Alto research park campus edge",
      "/commercial-real-estate/building/CA/palo-alto/2170-west-bayshore-road/":
        "Research park and Baylands edge",
      "/commercial-real-estate/building/CA/palo-alto/3101-park-blvd/":
        "Park Boulevard R&D/professional office",
      "/commercial-real-estate/building/CA/redwood-city/2065-broadway-st/":
        "Downtown Redwood City Broadway office block",
      "/commercial-real-estate/building/CA/redwood-city/2400-broadway/":
        "Broadway downtown commercial context",
      "/commercial-real-estate/building/CA/redwood-city/2504-el-camino-real/":
        "El Camino downtown edge",
      "/commercial-real-estate/building/CA/redwood-city/303-twin-dolphin-drive/":
        "Redwood Shores comparison edge",
      "/commercial-real-estate/building/CA/milpitas/720-montague-expy/":
        "Montague industrial/flex corridor",
      "/commercial-real-estate/building/CA/milpitas/750-e-calaveras-blvd/":
        "Milpitas industrial and service-commercial edge",
      "/commercial-real-estate/building/CA/milpitas/401-jacklin-rd/":
        "Milpitas functional commercial block",
      "/commercial-real-estate/building/CA/fremont/45101-45169-industrial-dr/":
        "Warm Springs industrial and distribution context",
      "/commercial-real-estate/building/CA/fremont/40861-albrae-st/":
        "Fremont industrial/flex corridor",
      "/commercial-real-estate/building/CA/fremont/5605-5639-auto-mall-pky/":
        "Warm Springs / Auto Mall commercial edge",
      "/commercial-real-estate/building/CA/fremont/43806-pacific-commons-boulevard/":
        "Pacific Commons commercial support edge",
      "/commercial-real-estate/building/CA/fremont/255-fourier-ave/":
        "Ardenwood R&D/flex technology park",
      "/commercial-real-estate/building/CA/fremont/4900-paseo-padre-pkwy/":
        "Fremont technology office support context",
      "/commercial-real-estate/building/CA/fremont/6036-6038-stevenson-blvd/":
        "Fremont flex/service-commercial edge",
    };

    return rolesByPath;
  }

  if (page.public_east_bay_v1) {
    return {
      "/commercial-real-estate/building/CA/oakland/1410-7th-st/":
        "West Oakland industrial-transition commercial block",
      "/commercial-real-estate/building/CA/oakland/1440-7th-st/":
        "West Oakland service-commercial edge",
      "/commercial-real-estate/building/CA/oakland/1800-peralta-st/":
        "Peralta industrial-adaptive context",
      "/commercial-real-estate/building/CA/berkeley/2001-addison-st/":
        "Downtown Berkeley civic and office context",
      "/commercial-real-estate/building/CA/berkeley/2120-university-ave/":
        "University Avenue commercial core",
      "/commercial-real-estate/building/CA/emeryville/1900-powell-st/":
        "Emeryville office and life-science node",
      "/commercial-real-estate/building/CA/walnut-creek/2121-n-california-blvd/":
        "Downtown Walnut Creek office core",
      "/commercial-real-estate/building/CA/walnut-creek/1406-n-broadway/":
        "Broadway professional office context",
      "/commercial-real-estate/building/CA/walnut-creek/1556-mt-diablo-blvd/":
        "Mt. Diablo client-facing commercial block",
      "/commercial-real-estate/building/CA/walnut-creek/1255-treat-blvd/":
        "Treat Boulevard office corridor contrast",
      "/commercial-real-estate/building/CA/pleasanton/6200-stoneridge-mall-rd/":
        "Hacienda-area suburban office setting",
      "/commercial-real-estate/building/CA/pleasanton/4900-hopyard-rd/":
        "Hopyard Road business park office",
      "/commercial-real-estate/building/CA/pleasanton/6701-koll-center-pkwy/":
        "Tri-Valley corporate office context",
      "/commercial-real-estate/building/CA/pleasanton/5745-5775-johnson-dr/":
        "Pleasanton commercial support edge",
    };
  }

  if (page.public_north_bay_v1) {
    return {
      "/commercial-real-estate/building/CA/san-rafael/1200-4th-st/":
        "Downtown San Rafael professional office block",
      "/commercial-real-estate/building/CA/san-rafael/181-third-st/":
        "Third Street local office and service-commercial edge",
      "/commercial-real-estate/building/CA/san-rafael/369-e-third-st/":
        "Downtown San Rafael service-commercial context",
      "/commercial-real-estate/building/CA/san-rafael/992-998-4th-street/":
        "Fourth Street town-center commercial block",
      "/commercial-real-estate/building/CA/san-rafael/100-smith-ranch-rd/":
        "North San Rafael medical and professional office context",
      "/commercial-real-estate/building/CA/san-rafael/4040-civic-center-dr/":
        "Civic Center / Terra Linda office corridor",
      "/commercial-real-estate/building/CA/novato/15-leveroni-ct/":
        "Novato office/flex business park",
      "/commercial-real-estate/building/CA/novato/2-ranch-dr/":
        "Novato office/flex corridor example",
      "/commercial-real-estate/building/CA/novato/7250-redwood-drive/":
        "Redwood Drive professional office context",
      "/commercial-real-estate/building/CA/novato/951-953-front-st/":
        "Downtown Novato local commercial block",
      "/commercial-real-estate/building/CA/petaluma/755-baywood-dr/":
        "Petaluma office/flex and waterfront-edge context",
      "/commercial-real-estate/building/CA/petaluma/389-mcdowell-blvd-s/":
        "Local service and retail-commercial support",
      "/commercial-real-estate/building/CA/petaluma/401-kenilworth-dr/":
        "Petaluma service-commercial block",
      "/commercial-real-estate/building/CA/santa-rosa/3550-round-barn-blvd/":
        "Santa Rosa office corridor context",
      "/commercial-real-estate/building/CA/santa-rosa/2527-guernville-road/":
        "Santa Rosa local service-commercial example",
    };
  }

  if (page.public_sacramento_v1) {
    return {
      "/commercial-real-estate/building/CA/sacramento/1201-j-st/":
        "Downtown Sacramento civic office core",
      "/commercial-real-estate/building/CA/sacramento/1215-k-st/":
        "K Street traditional office context",
      "/commercial-real-estate/building/CA/sacramento/1225-8th-st/":
        "Downtown government-adjacent office",
      "/commercial-real-estate/building/CA/sacramento/1303-j-st/":
        "J Street professional office block",
      "/commercial-real-estate/building/CA/sacramento/1325-j-st/":
        "Downtown Sacramento office fabric",
      "/commercial-real-estate/building/CA/sacramento/1600-k-st/":
        "Midtown edge professional office",
      "/commercial-real-estate/building/CA/sacramento/1610-r-st/":
        "R Street mixed-use office context",
      "/commercial-real-estate/building/CA/sacramento/1651-alhambra-blvd/":
        "Alhambra medical/professional corridor",
      "/commercial-real-estate/building/CA/sacramento/1200-del-paso-rd/":
        "Natomas suburban office context",
      "/commercial-real-estate/building/CA/sacramento/1313-n-market-blvd/":
        "Northgate / Natomas service-commercial edge",
      "/commercial-real-estate/building/CA/sacramento/1326-n-market-blvd/":
        "North Market industrial/service corridor",
      "/commercial-real-estate/building/CA/sacramento/1415-n-market-blvd/":
        "Northgate industrial park context",
      "/commercial-real-estate/building/CA/sacramento/1111-exposition-blvd/":
        "Arden / Point West office corridor",
      "/commercial-real-estate/building/CA/sacramento/1111-howe-ave/":
        "Howe Avenue professional office",
      "/commercial-real-estate/building/CA/sacramento/1375-exposition-blvd/":
        "Exposition Boulevard office setting",
      "/commercial-real-estate/building/CA/sacramento/1425-river-park-dr/":
        "Point West corporate office context",
      "/commercial-real-estate/building/CA/sacramento/1451-river-plaza-drive/":
        "River Park suburban office context",
      "/commercial-real-estate/building/CA/sacramento/10255-old-placerville-rd/":
        "Power Inn industrial/flex corridor",
      "/commercial-real-estate/building/CA/sacramento/10265-old-placerville-rd/":
        "Highway 50 service-industrial edge",
      "/commercial-real-estate/building/CA/sacramento/1060-national-dr/":
        "National Drive warehouse/flex context",
      "/commercial-real-estate/building/CA/sacramento/1164-national-dr/":
        "Power Inn office/warehouse fabric",
      "/commercial-real-estate/building/CA/west-sacramento/2928-ramco-st/":
        "West Sacramento industrial corridor",
      "/commercial-real-estate/building/CA/west-sacramento/3100-ramco-st/":
        "Ramco Street warehouse/flex context",
      "/commercial-real-estate/building/CA/west-sacramento/3380-industrial-blvd/":
        "Industrial Boulevard operational setting",
      "/commercial-real-estate/building/CA/west-sacramento/3950-industrial-blvd/":
        "West Sacramento industrial/flex example",
      "/commercial-real-estate/building/CA/west-sacramento/545-jefferson-blvd/":
        "Jefferson Boulevard service-commercial edge",
      "/commercial-real-estate/building/CA/rancho-cordova/10860-gold-center-dr/":
        "Highway 50 suburban office context",
      "/commercial-real-estate/building/CA/rancho-cordova/10940-white-rock-rd/":
        "White Rock Road office/flex corridor",
      "/commercial-real-estate/building/CA/rancho-cordova/11025-trade-center-dr/":
        "Trade Center industrial/flex setting",
      "/commercial-real-estate/building/CA/rancho-cordova/11171-sun-center-dr/":
        "Sun Center suburban office node",
      "/commercial-real-estate/building/CA/rancho-cordova/11300-trade-center-dr/":
        "Rancho Cordova service-industrial context",
      "/commercial-real-estate/building/CA/folsom/1024-iron-point-rd/":
        "Iron Point professional office",
      "/commercial-real-estate/building/CA/folsom/255-parkshore-dr/":
        "Parkshore client-facing office context",
      "/commercial-real-estate/building/CA/folsom/50-iron-point-cir/":
        "Folsom suburban office setting",
      "/commercial-real-estate/building/CA/folsom/620-coolidge-dr/":
        "Parkshore professional office fabric",
      "/commercial-real-estate/building/CA/folsom/2545-e-bidwell-st/":
        "East Bidwell medical/professional office",
      "/commercial-real-estate/building/CA/roseville/1512-eureka-rd/":
        "Eureka Road medical/professional office",
      "/commercial-real-estate/building/CA/roseville/1811-douglas-blvd/":
        "Douglas Boulevard professional office",
      "/commercial-real-estate/building/CA/roseville/1386-lead-hill-blvd/":
        "Roseville business park context",
      "/commercial-real-estate/building/CA/roseville/1000-enterprise-way/":
        "Enterprise Way office/business park",
      "/commercial-real-estate/building/CA/roseville/4000-foothills-blvd/":
        "Foothills Boulevard office/flex edge",
      "/commercial-real-estate/building/CA/elk-grove/10139-iron-rock-way/":
        "Elk Grove office/flex business court",
      "/commercial-real-estate/building/CA/elk-grove/3137-dwight-rd/":
        "Laguna West business park context",
      "/commercial-real-estate/building/CA/elk-grove/9245-laguna-springs-dr/":
        "Laguna Springs professional office",
      "/commercial-real-estate/building/CA/elk-grove/9615-laguna-springs-dr/":
        "Elk Grove suburban office context",
    };
  }

  if (page.public_san_diego_v1) {
    return {
      "/commercial-real-estate/building/CA/san-diego/402-w-broadway/":
        "Downtown San Diego office core",
      "/commercial-real-estate/building/CA/san-diego/501-w-broadway/":
        "Broadway client-facing office",
      "/commercial-real-estate/building/CA/san-diego/600-b-st/":
        "Civic downtown office context",
      "/commercial-real-estate/building/CA/san-diego/350-10th-avenue/":
        "East Village downtown office edge",
      "/commercial-real-estate/building/CA/san-diego/770-first-avenue/":
        "Downtown professional office block",
      "/commercial-real-estate/building/CA/san-diego/1420-kettner-blvd/":
        "Little Italy mixed-use office context",
      "/commercial-real-estate/building/CA/san-diego/1025-w-laurel-st/":
        "Downtown-edge professional office",
      "/commercial-real-estate/building/CA/san-diego/2515-camino-del-rio-s/":
        "Mission Valley office corridor",
      "/commercial-real-estate/building/CA/san-diego/2650-camino-del-rio-n/":
        "Mission Valley professional office",
      "/commercial-real-estate/building/CA/san-diego/3111-camino-del-rio-n/":
        "Mission Valley central office node",
      "/commercial-real-estate/building/CA/san-diego/3333-camino-del-rio-s/":
        "Camino del Rio office context",
      "/commercial-real-estate/building/CA/san-diego/9635-granite-ridge-dr/":
        "Mission Valley / Stonecrest suburban office",
      "/commercial-real-estate/building/CA/san-diego/4660-la-jolla-village-dr/":
        "UTC / University City office core",
      "/commercial-real-estate/building/CA/san-diego/4445-eastgate-mall-suite-200/":
        "UTC corporate office context",
      "/commercial-real-estate/building/CA/san-diego/8910-university-center-ln/":
        "University Center office node",
      "/commercial-real-estate/building/CA/san-diego/12707-and-12777-high-bluff-drive/":
        "Del Mar Heights client-facing office",
      "/commercial-real-estate/building/CA/san-diego/10130-sorrento-valley-rd/":
        "Sorrento Valley R&D/flex context",
      "/commercial-real-estate/building/CA/san-diego/11211-sorrento-valley-rd/":
        "Sorrento Mesa technology office/flex",
      "/commercial-real-estate/building/CA/san-diego/5440-morehouse-dr/":
        "Sorrento Mesa technology office",
      "/commercial-real-estate/building/CA/san-diego/6370-lusk-blvd/":
        "Sorrento Mesa R&D/flex setting",
      "/commercial-real-estate/building/CA/san-diego/9920-pacific-heights-blvd/":
        "Pacific Heights R&D office context",
      "/commercial-real-estate/building/CA/la-jolla/888-prospect-st/":
        "La Jolla coastal professional office",
      "/commercial-real-estate/building/CA/la-jolla/1200-prospect-st/":
        "La Jolla specialty office context",
      "/commercial-real-estate/building/CA/san-diego/3914-murphy-canyon-rd/":
        "Kearny Mesa office/flex context",
      "/commercial-real-estate/building/CA/san-diego/5205-kearny-villa-way/":
        "Kearny Villa service-commercial corridor",
      "/commercial-real-estate/building/CA/san-diego/3710-ruffin-rd/":
        "Kearny Mesa central flex corridor",
      "/commercial-real-estate/building/CA/san-diego/4000-ruffin-rd/":
        "Ruffin Road office/flex setting",
      "/commercial-real-estate/building/CA/san-diego/7240-clairemont-mesa-blvd/":
        "Clairemont Mesa office/flex corridor",
      "/commercial-real-estate/building/CA/san-diego/6906-miramar-rd/":
        "Miramar industrial/flex corridor",
      "/commercial-real-estate/building/CA/san-diego/7055-carroll-rd/":
        "Miramar warehouse/flex setting",
      "/commercial-real-estate/building/CA/san-diego/7545-carroll-rd/":
        "Miramar service-industrial context",
      "/commercial-real-estate/building/CA/san-diego/8250-camino-santa-fe/":
        "Miramar office/industrial flex",
      "/commercial-real-estate/building/CA/san-diego/7310-otay-crossings-ct/":
        "Otay Mesa border logistics context",
      "/commercial-real-estate/building/CA/san-diego/7880-airway-rd/":
        "Otay Mesa business park logistics",
      "/commercial-real-estate/building/CA/san-diego/9505-airway-rd/":
        "Airway Road industrial/logistics setting",
      "/commercial-real-estate/building/CA/san-diego/7615-siempre-viva-rd/":
        "Border industrial corridor",
      "/commercial-real-estate/building/CA/chula-vista/333-h-st/":
        "Chula Vista civic/service office",
      "/commercial-real-estate/building/CA/chula-vista/303-h-st/":
        "H Street professional office",
      "/commercial-real-estate/building/CA/chula-vista/876-broadway/":
        "South Bay local commercial block",
      "/commercial-real-estate/building/CA/chula-vista/2402-main-st/":
        "Chula Vista light service-commercial",
      "/commercial-real-estate/building/CA/carlsbad/1815-aston-ave/":
        "Carlsbad office/R&D business park",
      "/commercial-real-estate/building/CA/carlsbad/1902-wright-place/":
        "Carlsbad corporate office context",
      "/commercial-real-estate/building/CA/carlsbad/1945-camino-vida-roble/":
        "Carlsbad commerce center",
      "/commercial-real-estate/building/CA/carlsbad/2300-faraday-ave/":
        "Faraday Avenue R&D/office",
      "/commercial-real-estate/building/CA/carlsbad/701-palomar-airport-rd/":
        "Palomar Airport Road office context",
      "/commercial-real-estate/building/CA/oceanside/2204-s-el-camino-real/":
        "Oceanside local office/service corridor",
      "/commercial-real-estate/building/CA/oceanside/2821-oceanside-blvd/":
        "Oceanside Boulevard commercial context",
      "/commercial-real-estate/building/CA/oceanside/4755-oceanside-blvd/":
        "Oceanside light industrial/service edge",
      "/commercial-real-estate/building/CA/oceanside/815-mission-ave/":
        "Oceanside downtown local commercial",
      "/commercial-real-estate/building/CA/vista/1120-sycamore-ave/":
        "Vista industrial/flex business park",
      "/commercial-real-estate/building/CA/vista/1235-activity-dr/":
        "Vista operations and industrial context",
      "/commercial-real-estate/building/CA/vista/2630-business-park-dr/":
        "Vista business park industrial/flex",
      "/commercial-real-estate/building/CA/vista/2640-progress-st/":
        "Progress Street industrial/flex setting",
      "/commercial-real-estate/building/CA/san-marcos/1284-w-san-marcos-blvd/":
        "San Marcos Boulevard service office",
      "/commercial-real-estate/building/CA/san-marcos/208-w-san-marcos-blvd/":
        "San Marcos local professional office",
      "/commercial-real-estate/building/CA/san-marcos/6-creekside-dr/":
        "San Marcos office/service node",
      "/commercial-real-estate/building/CA/escondido/500-la-terraza-blvd/":
        "Escondido professional office",
      "/commercial-real-estate/building/CA/escondido/300-w-grand-ave/":
        "Downtown Escondido local commercial",
      "/commercial-real-estate/building/CA/escondido/1955-citracado-parway/":
        "Escondido medical/professional corridor",
    };
  }

  if (page.public_orange_county_v1) {
    return {
      "/commercial-real-estate/building/CA/irvine/200-spectrum-center-dr/":
        "Irvine Spectrum office tower context",
      "/commercial-real-estate/building/CA/irvine/400-spectrum-center-dr/":
        "Spectrum business district office form",
      "/commercial-real-estate/building/CA/irvine/7545-irvine-center-dr/":
        "Irvine Center Drive office/flex edge",
      "/commercial-real-estate/building/CA/irvine/8001-irvine-center-dr/":
        "Spectrum office/R&D corridor",
      "/commercial-real-estate/building/CA/irvine/530-technology-dr/":
        "Technology Drive office/flex context",
      "/commercial-real-estate/building/CA/irvine/17875-von-karman-ave/":
        "Von Karman airport-area office",
      "/commercial-real-estate/building/CA/irvine/17901-vonkarman-avenue/":
        "Irvine Business Complex office fabric",
      "/commercial-real-estate/building/CA/irvine/19800-macarthur-blvd/":
        "John Wayne Airport-adjacent office",
      "/commercial-real-estate/building/CA/irvine/2211-michelson-dr/":
        "Michelson corridor professional office",
      "/commercial-real-estate/building/CA/irvine/3333-michelson-dr/":
        "Irvine corporate office context",
      "/commercial-real-estate/building/CA/newport-beach/4041-macarthur-blvd/":
        "Newport Beach client-facing office",
      "/commercial-real-estate/building/CA/newport-beach/4695-macarthur-ct/":
        "MacArthur office corridor",
      "/commercial-real-estate/building/CA/newport-beach/5000-birch-street-west-tower/":
        "Airport/coastal professional office",
      "/commercial-real-estate/building/CA/newport-beach/895-dove-st/":
        "Dove Street professional office",
      "/commercial-real-estate/building/CA/costa-mesa/2037-harbor-blvd/":
        "Costa Mesa local commercial corridor",
      "/commercial-real-estate/building/CA/costa-mesa/2075-newport-blvd/":
        "Newport Boulevard service office",
      "/commercial-real-estate/building/CA/costa-mesa/3420-bristol-st/":
        "Bristol Street central OC office",
      "/commercial-real-estate/building/CA/costa-mesa/555-anton-blvd/":
        "South Coast Metro office core",
      "/commercial-real-estate/building/CA/costa-mesa/600-anton-blvd/":
        "Anton Boulevard client-facing office",
      "/commercial-real-estate/building/CA/costa-mesa/695-town-center-dr/":
        "Town Center Drive office context",
      "/commercial-real-estate/building/CA/anaheim/2400-e-katella-ave/":
        "Platinum Triangle event-adjacent office",
      "/commercial-real-estate/building/CA/anaheim/1701-s-state-college-blvd/":
        "State College commercial corridor",
      "/commercial-real-estate/building/CA/anaheim/1425-s-state-college-blvd/":
        "Anaheim mixed commercial edge",
      "/commercial-real-estate/building/CA/anaheim/1601-s-sinclair-st/":
        "Anaheim industrial/flex building",
      "/commercial-real-estate/building/CA/anaheim/2671-la-palma-ave/":
        "La Palma industrial corridor",
      "/commercial-real-estate/building/CA/anaheim/3071-e-coronado-st/":
        "East Anaheim industrial/flex context",
      "/commercial-real-estate/building/CA/anaheim/4222-e-la-palma-ave/":
        "North OC warehouse/flex corridor",
      "/commercial-real-estate/building/CA/anaheim/5455-e-la-palma-ave/":
        "Anaheim service-industrial corridor",
      "/commercial-real-estate/building/CA/anaheim/5475-e-la-palma-ave/":
        "La Palma warehouse/flex edge",
      "/commercial-real-estate/building/CA/santa-ana/401-s-grand-ave/":
        "Downtown Santa Ana civic office edge",
      "/commercial-real-estate/building/CA/santa-ana/1616-e-4th-st/":
        "Santa Ana office/service commercial",
      "/commercial-real-estate/building/CA/santa-ana/1261-e-dyer-rd/":
        "Dyer Road industrial/service corridor",
      "/commercial-real-estate/building/CA/santa-ana/1018-e-chestnut-ave/":
        "Santa Ana service-industrial building",
      "/commercial-real-estate/building/CA/santa-ana/2900-s-harbor-blvd/":
        "Harbor Boulevard commercial corridor",
      "/commercial-real-estate/building/CA/tustin/17452-irvine-blvd/":
        "Tustin local professional office",
      "/commercial-real-estate/building/CA/orange/333-city-blvd-w/":
        "City Drive office/medical context",
      "/commercial-real-estate/building/CA/orange/1100-town-and-country-road/":
        "Orange professional office corridor",
      "/commercial-real-estate/building/CA/orange/2100-w-orangewood-ave/":
        "Orangewood commercial corridor",
      "/commercial-real-estate/building/CA/orange/2390-n-american-way/":
        "North Orange office/flex context",
      "/commercial-real-estate/building/CA/orange/2442-n-american-way/":
        "North Orange business park edge",
      "/commercial-real-estate/building/CA/buena-park/6700-8th-street/":
        "Northwest OC service-commercial building",
      "/commercial-real-estate/building/CA/garden-grove/12361-12465-lewis-st/":
        "Garden Grove service-commercial corridor",
      "/commercial-real-estate/building/CA/garden-grove/9802-katella-ave/":
        "Katella commercial corridor",
      "/commercial-real-estate/building/CA/lake-forest/22722-lambert-st/":
        "South OC office/flex building",
      "/commercial-real-estate/building/CA/brea/135-s-state-college-blvd/":
        "Brea office/industrial edge",
      "/commercial-real-estate/building/CA/laguna-hills/23001-del-lago-dr/":
        "Laguna Hills medical/professional office",
      "/commercial-real-estate/building/CA/laguna-hills/23046-avenida-de-la-carlota/":
        "Avenida de la Carlota office corridor",
      "/commercial-real-estate/building/CA/laguna-hills/23512-commerce-center-dr/":
        "South OC commerce center context",
      "/commercial-real-estate/building/CA/mission-viejo/999-corporate-drive/":
        "Mission Viejo professional office",
    };
  }

  if (page.public_inland_empire_v1) {
    return {
      "/commercial-real-estate/building/CA/ontario/1477-e-cedar-ave/":
        "Ontario industrial/service building",
      "/commercial-real-estate/building/CA/ontario/2970-inland-empire-blvd/":
        "Inland Empire Boulevard airport-area office",
      "/commercial-real-estate/building/CA/ontario/3200-e-guasti-rd/":
        "Guasti airport-area office context",
      "/commercial-real-estate/building/CA/ontario/3281-e-guasti-rd/":
        "Ontario Airport Area business corridor",
      "/commercial-real-estate/building/CA/ontario/5505-concours/":
        "Airport-adjacent office/logistics context",
      "/commercial-real-estate/building/CA/ontario/875-w-state-st/":
        "Ontario local industrial/service context",
      "/commercial-real-estate/building/CA/rancho-cucamonga/9805-6th-st/":
        "Rancho Cucamonga industrial/flex corridor",
      "/commercial-real-estate/building/CA/fontana/10509-business-dr/":
        "Fontana business/industrial corridor",
      "/commercial-real-estate/building/CA/fontana/10840-cherry-ave/":
        "Cherry Avenue industrial corridor",
      "/commercial-real-estate/building/CA/fontana/14019-rose-ave/":
        "Fontana warehouse/logistics context",
      "/commercial-real-estate/building/CA/fontana/6260-mango-ave/":
        "Truck-oriented industrial setting",
      "/commercial-real-estate/building/CA/rialto/1110-w-base-line-rd/":
        "Rialto local industrial/service edge",
      "/commercial-real-estate/building/CA/colton/1200-1350-e-washington-st/":
        "Colton freeway industrial corridor",
      "/commercial-real-estate/building/CA/san-bernardino/1089-e-mill-st/":
        "San Bernardino industrial corridor",
      "/commercial-real-estate/building/CA/san-bernardino/2449-e-5th-st/":
        "Eastern IE service-industrial context",
      "/commercial-real-estate/building/CA/san-bernardino/5770-industrial-pkwy/":
        "Industrial Parkway logistics setting",
      "/commercial-real-estate/building/CA/san-bernardino/614-e-norman-rd/":
        "San Bernardino warehouse/service building",
      "/commercial-real-estate/building/CA/san-bernardino/634-e-norman-rd/":
        "Norman Road industrial context",
      "/commercial-real-estate/building/CA/moreno-valley/14200-rebecca-st/":
        "Moreno Valley warehouse/distribution context",
      "/commercial-real-estate/building/CA/moreno-valley/23880-23962-alessandro-blvd/":
        "Alessandro Boulevard service-commercial corridor",
      "/commercial-real-estate/building/CA/riverside/11801-pierce-st/":
        "Riverside office/industrial edge",
      "/commercial-real-estate/building/CA/riverside/7530-jurupa-ave/":
        "Jurupa Avenue industrial/service corridor",
      "/commercial-real-estate/building/CA/corona/1113-s-main-st/":
        "Corona local commercial/office context",
      "/commercial-real-estate/building/CA/corona/1141-california-ave/":
        "Corona industrial/flex corridor",
      "/commercial-real-estate/building/CA/corona/210-radio-rd/":
        "Corona service-industrial setting",
      "/commercial-real-estate/building/CA/chino/5236-faraday-ct/":
        "Chino industrial/flex building",
      "/commercial-real-estate/building/CA/pomona/228-e-monterey-ave/":
        "Pomona Valley service-commercial building",
    };
  }

  if (page.public_los_angeles_v1) {
    return {
      "/commercial-real-estate/building/CA/los-angeles/1149-s-hill-st/":
        "Downtown LA office/commercial fabric",
      "/commercial-real-estate/building/CA/los-angeles/1150-s-hope-st/":
        "South Park / DTLA office edge",
      "/commercial-real-estate/building/CA/los-angeles/1150-s-olive-st/":
        "DTLA mixed office context",
      "/commercial-real-estate/building/CA/los-angeles/1100-mateo-st/":
        "Arts District adaptive creative office",
      "/commercial-real-estate/building/CA/los-angeles/1140-e-11th-st/":
        "Downtown industrial-commercial edge",
      "/commercial-real-estate/building/CA/los-angeles/1161-vine-st/":
        "Hollywood media/office context",
      "/commercial-real-estate/building/CA/los-angeles/10880-wilshire-blvd/":
        "Wilshire/Westwood office corridor",
      "/commercial-real-estate/building/CA/los-angeles/10914-kinross-ave/":
        "Westwood village professional office",
      "/commercial-real-estate/building/CA/los-angeles/1010-westwood-blvd/":
        "Westwood professional office block",
      "/commercial-real-estate/building/CA/los-angeles/10250-constellation-blvd/":
        "Century City tower office context",
      "/commercial-real-estate/building/CA/los-angeles/11601-wilshire-blvd/":
        "West LA Wilshire office corridor",
      "/commercial-real-estate/building/CA/los-angeles/11390-w-olympic-blvd/":
        "West LA professional office corridor",
      "/commercial-real-estate/building/CA/los-angeles/11500-w-olympic-blvd/":
        "Olympic Boulevard Westside office",
      "/commercial-real-estate/building/CA/los-angeles/10859-venice-blvd/":
        "Westside service-commercial corridor",
      "/commercial-real-estate/building/CA/culver-city/10000-washington-blvd/":
        "Culver City media/creative office",
      "/commercial-real-estate/building/CA/culver-city/10100-venice-blvd/":
        "Culver City professional corridor",
      "/commercial-real-estate/building/CA/culver-city/3050-la-cienega-place/":
        "Hayden/La Cienega creative office edge",
      "/commercial-real-estate/building/CA/culver-city/5700-buckingham-pkwy/":
        "Culver City business park context",
      "/commercial-real-estate/building/CA/culver-city/5833-perry-dr/":
        "Westside office/creative campus context",
      "/commercial-real-estate/building/CA/beverly-hills/8383-wilshire-blvd/":
        "Beverly Hills Wilshire office",
      "/commercial-real-estate/building/CA/beverly-hills/9465-wilshire-blvd/":
        "Beverly Hills prestige office corridor",
      "/commercial-real-estate/building/CA/santa-monica/225-santa-monica-blvd/":
        "Downtown Santa Monica office context",
      "/commercial-real-estate/building/CA/santa-monica/233-wilshire-blvd/":
        "Santa Monica Wilshire office",
      "/commercial-real-estate/building/CA/santa-monica/1221-colorado-ave/":
        "Colorado Avenue creative/tech corridor",
      "/commercial-real-estate/building/CA/santa-monica/1640-14th-st/":
        "Santa Monica creative office edge",
      "/commercial-real-estate/building/CA/santa-monica/1901-main-st/":
        "Main Street coastal commercial context",
      "/commercial-real-estate/building/CA/el-segundo/222-pacific-coast-highway/":
        "El Segundo LAX/South Bay office",
      "/commercial-real-estate/building/CA/el-segundo/400-continental-blvd/":
        "El Segundo aerospace/business corridor",
      "/commercial-real-estate/building/CA/burbank/4100-w-alameda-ave/":
        "Burbank media district office",
      "/commercial-real-estate/building/CA/burbank/4450-w-lakeside-dr/":
        "Burbank studio-adjacent office",
      "/commercial-real-estate/building/CA/burbank/2717-w-olive-ave/":
        "Olive Avenue media/professional corridor",
      "/commercial-real-estate/building/CA/burbank/2340-n-hollywood-way/":
        "Hollywood Way airport/media edge",
      "/commercial-real-estate/building/CA/burbank/303-n-glenoaks-blvd/":
        "Burbank local office corridor",
      "/commercial-real-estate/building/CA/glendale/201-n-brand-blvd/":
        "Brand Boulevard office core",
      "/commercial-real-estate/building/CA/glendale/450-n-brand-blvd/":
        "Glendale regional office corridor",
      "/commercial-real-estate/building/CA/glendale/611-n-brand-blvd/":
        "North Brand professional office",
      "/commercial-real-estate/building/CA/glendale/655-n-central-ave/":
        "Central Avenue business district",
      "/commercial-real-estate/building/CA/pasadena/117-e-colorado-blvd/":
        "Old Pasadena professional office",
      "/commercial-real-estate/building/CA/pasadena/155-n-lake-ave/":
        "Lake Avenue office corridor",
      "/commercial-real-estate/building/CA/pasadena/177-e-colorado-blvd/":
        "Colorado Boulevard office/retail context",
      "/commercial-real-estate/building/CA/pasadena/680-e-colorado-blvd/":
        "Pasadena institutional/professional corridor",
      "/commercial-real-estate/building/CA/vernon/2357-e-49th-st/":
        "Vernon core industrial building",
      "/commercial-real-estate/building/CA/vernon/2419-e-28th-st/":
        "Vernon manufacturing/warehouse context",
      "/commercial-real-estate/building/CA/vernon/2529-chambers-st/":
        "Vernon service-industrial setting",
      "/commercial-real-estate/building/CA/vernon/4890-s-alameda-st/":
        "Alameda industrial corridor",
      "/commercial-real-estate/building/CA/vernon/5300-s-santa-fe-ave/":
        "Santa Fe Avenue industrial corridor",
      "/commercial-real-estate/building/CA/commerce/2008-camfield-ave/":
        "Commerce warehouse/service-industrial building",
      "/commercial-real-estate/building/CA/commerce/5800-s-eastern-ave/":
        "Eastern Avenue distribution corridor",
      "/commercial-real-estate/building/CA/city-of-industry/1245-s-johnson-dr/":
        "City of Industry industrial/logistics building",
      "/commercial-real-estate/building/CA/compton/1165-w-walnut-st/":
        "Compton industrial corridor",
      "/commercial-real-estate/building/CA/compton/19009-s-alameda-st/":
        "Alameda logistics/industrial context",
      "/commercial-real-estate/building/CA/compton/3019-e-maria-st/":
        "Compton warehouse/service-industrial",
      "/commercial-real-estate/building/CA/compton/350-w-manville-st/":
        "South LA industrial building",
      "/commercial-real-estate/building/CA/carson/1211-e-artesia-blvd/":
        "Carson port-adjacent commercial corridor",
      "/commercial-real-estate/building/CA/carson/20620-leapwood-ave/":
        "Carson industrial/logistics building",
      "/commercial-real-estate/building/CA/carson/860-sandhill-ave/":
        "South Bay service-industrial context",
      "/commercial-real-estate/building/CA/torrance/21515-hawthorne-blvd/":
        "Torrance South Bay office corridor",
      "/commercial-real-estate/building/CA/torrance/3730-skypark-dr/":
        "Torrance aerospace/office-industrial context",
      "/commercial-real-estate/building/CA/torrance/350-crenshaw-blvd/":
        "Torrance industrial/service corridor",
      "/commercial-real-estate/building/CA/torrance/1597-sepulveda-blvd/":
        "Sepulveda local commercial corridor",
      "/commercial-real-estate/building/CA/long-beach/100-w-broadway/":
        "Downtown Long Beach office core",
      "/commercial-real-estate/building/CA/long-beach/111-w-ocean-blvd/":
        "Long Beach waterfront office tower",
      "/commercial-real-estate/building/CA/long-beach/3221-e-59th-st/":
        "Long Beach industrial corridor",
      "/commercial-real-estate/building/CA/long-beach/3253-e-south-st/":
        "South Street service-commercial corridor",
      "/commercial-real-estate/building/CA/woodland-hills/21900-burbank-blvd/":
        "Warner Center corporate office",
      "/commercial-real-estate/building/CA/woodland-hills/6303-owensmouth-ave/":
        "Warner Center office corridor",
      "/commercial-real-estate/building/CA/woodland-hills/6320-canoga-ave/":
        "Canoga Avenue business district",
      "/commercial-real-estate/building/CA/north-hollywood/4605-lankershim-blvd/":
        "North Hollywood media/transit corridor",
      "/commercial-real-estate/building/CA/north-hollywood/5161-lankershim-blvd/":
        "Lankershim professional office",
      "/commercial-real-estate/building/CA/north-hollywood/5250-lankershim-blvd/":
        "NoHo mixed commercial context",
      "/commercial-real-estate/building/CA/studio-city/4370-tujunga-ave/":
        "Studio City boutique professional office",
      "/commercial-real-estate/building/CA/van-nuys/16501-sherman-way/":
        "Van Nuys service-commercial corridor",
      "/commercial-real-estate/building/CA/sherman-oaks/13400-riverside-dr/":
        "Sherman Oaks professional office",
      "/commercial-real-estate/building/CA/sherman-oaks/15233-ventura-blvd/":
        "Ventura Boulevard office corridor",
    };
  }

  return {};
}

function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function typeLabel(value) {
  const labels = {
    office: "Office Space",
    retail: "Retail Space",
    industrial: "Industrial Space",
    flex: "Flex Space",
    coworking: "Coworking Space",
    commercial: "Commercial Space",
  };

  return labels[value] || `${clean(value).replace(/_/g, " ")} space`;
}

function signalLabel(value) {
  const labels = {
    office: "Office",
    retail: "Retail",
    industrial: "Industrial",
    logistics: "Logistics",
    creative_office: "Creative office",
    mixed_use: "Mixed use",
    startup: "Startup-oriented",
    downtown: "Downtown",
    neighborhood_retail: "Neighborhood retail",
    warehouse: "Warehouse",
    transit_oriented: "Transit-oriented",
    professional_services: "Professional services",
    boutique_office: "Boutique office",
    historic_building: "Historic building context",
    waterfront: "Waterfront context",
    hospitality: "Hospitality",
    showroom: "Showroom",
    medical: "Medical",
    suburban_office: "Suburban office",
    enterprise_environment: "Enterprise office",
    airport_access: "Airport access",
    life_science: "Life science",
  };

  return labels[value] || clean(value).replace(/_/g, " ");
}

function areaPath(area) {
  return `/commercial-real-estate/${area.state_abbr}/${slugify(area.city)}/${slugify(area.canonical_name)}/`;
}

function mapHeroKey(page) {
  return [
    clean(page.state_abbr).toUpperCase(),
    slugify(page.city),
    page.slug || slugify(page.name),
  ].join("/");
}

function pageKey(page) {
  return [
    clean(page.state_abbr).toUpperCase(),
    slugify(page.city),
    page.slug || slugify(page.name),
  ].join("/");
}

function neighborhoodImagePathFor(page) {
  const relativePath = [
    "assets",
    "images",
    "neighborhoods",
    clean(page.state_abbr).toUpperCase(),
    slugify(page.city),
    `${page.slug || slugify(page.name)}.webp`,
  ];
  const imagePath = path.join(process.cwd(), ...relativePath);

  return fs.existsSync(imagePath) ? `/${relativePath.join("/")}` : "";
}

const curatedNearbyByKey = {
  "NY/new-york/financial-district": ["tribeca", "soho", "civic-center", "dumbo", "downtown-brooklyn"],
  "NY/new-york/tribeca": ["soho", "financial-district", "civic-center", "west-village", "dumbo"],
  "NY/new-york/soho": ["noho", "tribeca", "west-village", "greenwich-village", "union-square"],
  "NY/new-york/noho": ["soho", "greenwich-village", "east-village", "union-square", "flatiron-district"],
  "NY/new-york/greenwich-village": ["west-village", "noho", "soho", "union-square", "east-village"],
  "NY/new-york/west-village": ["greenwich-village", "soho", "tribeca", "meatpacking-district", "chelsea"],
  "NY/new-york/east-village": ["lower-east-side", "noho", "greenwich-village", "union-square", "gramercy"],
  "NY/new-york/lower-east-side": ["east-village", "chinatown", "soho", "noho", "financial-district"],
  "NY/new-york/chinatown": ["lower-east-side", "civic-center", "soho", "tribeca", "financial-district"],
  "NY/new-york/civic-center": ["financial-district", "tribeca", "chinatown", "soho", "lower-east-side"],
  "NY/new-york/union-square": ["flatiron-district", "gramercy", "greenwich-village", "noho", "soho"],
  "NY/new-york/flatiron-district": ["nomad", "union-square", "chelsea", "gramercy", "midtown-south"],
  "NY/new-york/nomad": ["flatiron-district", "midtown-south", "chelsea", "garment-district", "midtown"],
  "NY/new-york/gramercy": ["union-square", "flatiron-district", "kips-bay", "east-village", "nomad"],
  "NY/new-york/kips-bay": ["gramercy", "murray-hill", "east-midtown", "union-square", "flatiron-district"],
  "NY/new-york/murray-hill": ["kips-bay", "east-midtown", "midtown", "grand-central", "gramercy"],
  "NY/new-york/midtown-south": ["nomad", "flatiron-district", "garment-district", "midtown", "chelsea"],
  "NY/new-york/chelsea": ["hudson-yards", "flatiron-district", "nomad", "meatpacking-district", "west-village"],
  "NY/new-york/meatpacking-district": ["chelsea", "west-village", "greenwich-village", "hudson-yards", "flatiron-district"],
  "NY/new-york/garment-district": ["midtown", "hudson-yards", "penn-district", "times-square", "nomad"],
  "NY/new-york/hudson-yards": ["garment-district", "chelsea", "penn-district", "midtown", "hells-kitchen"],
  "NY/new-york/penn-district": ["garment-district", "hudson-yards", "chelsea", "midtown", "times-square"],
  "NY/new-york/times-square": ["midtown", "garment-district", "hells-kitchen", "penn-district", "plaza-district"],
  "NY/new-york/midtown": ["garment-district", "times-square", "east-midtown", "plaza-district", "nomad"],
  "NY/new-york/east-midtown": ["midtown", "murray-hill", "plaza-district", "kips-bay", "upper-east-side"],
  "NY/new-york/plaza-district": ["midtown", "east-midtown", "upper-east-side", "times-square", "hells-kitchen"],
  "NY/new-york/hells-kitchen": ["times-square", "midtown", "hudson-yards", "garment-district", "upper-west-side"],
  "NY/new-york/upper-east-side": ["plaza-district", "east-midtown", "east-harlem", "midtown", "upper-west-side"],
  "NY/new-york/upper-west-side": ["hells-kitchen", "midtown", "harlem", "upper-east-side", "washington-heights"],
  "NY/new-york/harlem": ["east-harlem", "upper-west-side", "upper-east-side", "washington-heights"],
  "NY/new-york/east-harlem": ["harlem", "upper-east-side", "upper-west-side", "plaza-district"],
  "NY/new-york/washington-heights": ["harlem", "upper-west-side", "east-harlem"],
  "NY/new-york/dumbo": ["downtown-brooklyn", "brooklyn-heights", "vinegar-hill", "brooklyn-navy-yard", "financial-district"],
  "NY/new-york/downtown-brooklyn": ["dumbo", "brooklyn-heights", "fort-greene", "boerum-hill", "brooklyn-commons"],
  "NY/new-york/brooklyn-heights": ["dumbo", "downtown-brooklyn", "cobble-hill", "boerum-hill", "carroll-gardens"],
  "NY/new-york/vinegar-hill": ["dumbo", "brooklyn-navy-yard", "downtown-brooklyn", "fort-greene", "williamsburg"],
  "NY/new-york/brooklyn-navy-yard": ["dumbo", "vinegar-hill", "fort-greene", "williamsburg", "clinton-hill"],
  "NY/new-york/fort-greene": ["downtown-brooklyn", "brooklyn-navy-yard", "clinton-hill", "boerum-hill", "prospect-heights"],
  "NY/new-york/clinton-hill": ["fort-greene", "brooklyn-navy-yard", "bedford-stuyvesant", "prospect-heights", "williamsburg"],
  "NY/new-york/boerum-hill": ["downtown-brooklyn", "brooklyn-heights", "cobble-hill", "gowanus", "fort-greene"],
  "NY/new-york/cobble-hill": ["boerum-hill", "brooklyn-heights", "carroll-gardens", "gowanus", "downtown-brooklyn"],
  "NY/new-york/carroll-gardens": ["cobble-hill", "gowanus", "boerum-hill", "red-hook", "park-slope"],
  "NY/new-york/gowanus": ["boerum-hill", "carroll-gardens", "park-slope", "red-hook", "downtown-brooklyn"],
  "NY/new-york/park-slope": ["gowanus", "prospect-heights", "crown-heights", "greenwood", "carroll-gardens"],
  "NY/new-york/prospect-heights": ["park-slope", "fort-greene", "clinton-hill", "crown-heights", "atlantic-avenue"],
  "NY/new-york/atlantic-avenue": ["downtown-brooklyn", "boerum-hill", "fort-greene", "prospect-heights", "crown-heights"],
  "NY/new-york/crown-heights": ["prospect-heights", "bedford-stuyvesant", "flatbush", "park-slope", "atlantic-avenue"],
  "NY/new-york/bedford-stuyvesant": ["crown-heights", "clinton-hill", "bushwick", "east-williamsburg", "prospect-heights"],
  "NY/new-york/flatbush": ["crown-heights", "prospect-heights", "park-slope", "bedford-stuyvesant"],
  "NY/new-york/williamsburg": ["greenpoint", "east-williamsburg", "south-williamsburg", "brooklyn-navy-yard", "dumbo"],
  "NY/new-york/south-williamsburg": ["williamsburg", "east-williamsburg", "dumbo", "brooklyn-navy-yard", "bushwick"],
  "NY/new-york/east-williamsburg": ["williamsburg", "south-williamsburg", "bushwick", "greenpoint", "bedford-stuyvesant"],
  "NY/new-york/greenpoint": ["williamsburg", "east-williamsburg", "brooklyn-navy-yard", "dumbo"],
  "NY/new-york/bushwick": ["east-williamsburg", "bedford-stuyvesant", "williamsburg", "crown-heights"],
  "NY/new-york/red-hook": ["gowanus", "carroll-gardens", "cobble-hill", "sunset-park", "downtown-brooklyn"],
  "NY/new-york/greenwood": ["industry-city", "sunset-park", "park-slope", "gowanus", "red-hook"],
  "NY/new-york/industry-city": ["sunset-park", "greenwood", "red-hook", "gowanus", "park-slope"],
  "NY/new-york/sunset-park": ["industry-city", "greenwood", "red-hook", "gowanus", "park-slope"],
  "NY/new-york/brooklyn-commons": ["downtown-brooklyn", "fort-greene", "boerum-hill", "brooklyn-heights", "dumbo"],
  "IL/chicago/the-loop": ["west-loop", "river-north", "streeterville", "south-loop", "fulton-river-district"],
  "IL/chicago/west-loop": ["fulton-market", "fulton-river-district", "river-west", "river-north", "the-loop"],
  "IL/chicago/fulton-market": ["west-loop", "fulton-river-district", "river-west", "river-north", "goose-island"],
  "IL/chicago/river-north": ["fulton-river-district", "magnificent-mile", "streeterville", "river-west", "west-loop"],
  "IL/chicago/streeterville": ["magnificent-mile", "river-north", "the-loop", "fulton-river-district", "lakeview"],
  "IL/chicago/south-loop": ["prairie-district", "chinatown", "the-loop", "pilsen", "west-loop"],
  "IL/chicago/magnificent-mile": ["streeterville", "river-north", "the-loop", "fulton-river-district", "old-town"],
  "IL/chicago/clybourn-corridor": ["lincoln-park", "goose-island", "old-town", "wicker-park", "river-west"],
  "IL/chicago/goose-island": ["old-town", "clybourn-corridor", "river-west", "lincoln-park", "fulton-river-district"],
  "IL/chicago/river-west": ["fulton-river-district", "fulton-market", "river-north", "west-loop", "goose-island"],
  "IL/chicago/o-hare": [],
  "IL/chicago/hyde-park": ["bridgeport", "prairie-district", "chinatown", "south-loop", "pilsen"],
  "IL/chicago/illinois-medical-district": ["pilsen", "fulton-market", "west-loop", "fulton-river-district", "river-west"],
  "IL/chicago/pilsen": ["chinatown", "bridgeport", "illinois-medical-district", "south-loop", "prairie-district"],
  "IL/chicago/fulton-river-district": ["river-west", "fulton-market", "river-north", "west-loop", "the-loop"],
  "IL/chicago/lincoln-park": ["clybourn-corridor", "old-town", "goose-island", "wicker-park", "river-west"],
  "IL/chicago/uptown": ["andersonville", "edgewater", "rogers-park", "lincoln-park", "clybourn-corridor"],
  "IL/chicago/chinatown": ["prairie-district", "south-loop", "pilsen", "bridgeport", "the-loop"],
  "IL/chicago/logan-square": ["wicker-park", "clybourn-corridor", "lincoln-park", "goose-island", "old-town"],
  "IL/chicago/prairie-district": ["south-loop", "chinatown", "the-loop", "pilsen", "bridgeport"],
  "IL/chicago/wicker-park": ["logan-square", "clybourn-corridor", "goose-island", "lincoln-park", "river-west"],
  "IL/chicago/andersonville": ["edgewater", "uptown", "rogers-park", "lincoln-park", "clybourn-corridor"],
  "IL/chicago/bridgeport": ["pilsen", "chinatown", "prairie-district", "south-loop", "illinois-medical-district"],
  "IL/chicago/old-town": ["goose-island", "lincoln-park", "clybourn-corridor", "magnificent-mile", "river-west"],
  "IL/chicago/edgewater": ["andersonville", "uptown", "rogers-park", "lincoln-park", "clybourn-corridor"],
  "IL/chicago/rogers-park": ["edgewater", "andersonville", "uptown", "lincoln-park", "logan-square"],
  "CA/los-angeles/downtown-los-angeles": ["fashion-district", "south-park", "little-tokyo", "chinatown", "arts-district"],
  "CA/los-angeles/arts-district": ["little-tokyo", "fashion-district", "downtown-los-angeles", "chinatown", "boyle-heights"],
  "CA/los-angeles/century-city": ["westwood", "sawtelle", "brentwood", "miracle-mile", "playa-vista"],
  "CA/los-angeles/fashion-district": ["south-park", "downtown-los-angeles", "arts-district", "little-tokyo", "chinatown"],
  "CA/los-angeles/hollywood": ["cahuenga-pass", "miracle-mile", "koreatown", "downtown-los-angeles", "south-park"],
  "CA/los-angeles/south-park": ["fashion-district", "downtown-los-angeles", "little-tokyo", "arts-district", "chinatown"],
  "CA/los-angeles/westwood": ["century-city", "sawtelle", "brentwood", "miracle-mile", "venice"],
  "CA/los-angeles/koreatown": ["miracle-mile", "hollywood", "south-park", "downtown-los-angeles", "fashion-district"],
  "CA/los-angeles/westchester": ["playa-vista", "venice", "sawtelle", "century-city", "miracle-mile"],
  "CA/los-angeles/playa-vista": ["westchester", "venice", "sawtelle", "century-city", "brentwood"],
  "CA/los-angeles/miracle-mile": ["hollywood", "koreatown", "century-city", "cahuenga-pass", "westwood"],
  "CA/los-angeles/sawtelle": ["westwood", "century-city", "brentwood", "venice", "playa-vista"],
  "CA/los-angeles/little-tokyo": ["arts-district", "downtown-los-angeles", "chinatown", "fashion-district", "south-park"],
  "CA/los-angeles/brentwood": ["westwood", "sawtelle", "century-city", "venice", "playa-vista"],
  "CA/los-angeles/chinatown": ["little-tokyo", "downtown-los-angeles", "arts-district", "fashion-district", "lincoln-heights"],
  "CA/los-angeles/venice": ["playa-vista", "sawtelle", "westchester", "brentwood", "westwood"],
  "CA/los-angeles/highland-park": ["lincoln-heights", "chinatown", "little-tokyo", "boyle-heights", "arts-district"],
  "CA/los-angeles/cahuenga-pass": ["hollywood", "miracle-mile", "koreatown", "century-city", "westwood"],
  "CA/los-angeles/lincoln-heights": ["chinatown", "little-tokyo", "arts-district", "boyle-heights", "highland-park"],
  "CA/los-angeles/boyle-heights": ["arts-district", "little-tokyo", "fashion-district", "chinatown", "lincoln-heights"],
  "FL/miami/brickell": ["downtown-miami", "little-havana", "overtown", "edgewater", "wynwood"],
  "FL/miami/downtown-miami": ["brickell", "overtown", "edgewater", "wynwood", "little-havana"],
  "FL/miami/wynwood": ["edgewater", "design-district", "overtown", "allapattah", "little-haiti"],
  "FL/miami/design-district": ["wynwood", "little-haiti", "edgewater", "allapattah", "overtown"],
  "FL/miami/coconut-grove": ["coral-way", "brickell", "dadeland", "little-havana", "downtown-miami"],
  "FL/miami/edgewater": ["wynwood", "design-district", "overtown", "downtown-miami", "little-haiti"],
  "FL/miami/little-havana": ["brickell", "coral-way", "overtown", "downtown-miami", "coconut-grove"],
  "FL/miami/allapattah": ["wynwood", "design-district", "overtown", "edgewater", "little-haiti"],
  "FL/miami/little-haiti": ["design-district", "edgewater", "wynwood", "allapattah", "overtown"],
  "FL/miami/blue-lagoon": ["coral-way", "little-havana", "allapattah", "coconut-grove", "overtown"],
  "FL/miami/overtown": ["downtown-miami", "wynwood", "edgewater", "brickell", "design-district"],
  "FL/miami/coral-way": ["coconut-grove", "little-havana", "brickell", "blue-lagoon", "overtown"],
  "FL/miami/dadeland": ["coconut-grove", "coral-way", "blue-lagoon", "little-havana", "brickell"],
  "TX/dallas/uptown": ["arts-district", "victory-park", "turtle-creek", "west-end-historic-district", "downtown-dallas"],
  "TX/dallas/downtown-dallas": ["main-street-district", "arts-district", "west-end-historic-district", "cedars", "deep-ellum"],
  "TX/dallas/main-street-district": ["downtown-dallas", "west-end-historic-district", "arts-district", "cedars", "deep-ellum"],
  "TX/dallas/victory-park": ["west-end-historic-district", "uptown", "arts-district", "design-district", "downtown-dallas"],
  "TX/dallas/arts-district": ["downtown-dallas", "main-street-district", "uptown", "west-end-historic-district", "victory-park"],
  "TX/dallas/deep-ellum": ["downtown-dallas", "main-street-district", "arts-district", "cedars", "west-end-historic-district"],
  "TX/dallas/west-end-historic-district": ["main-street-district", "downtown-dallas", "victory-park", "arts-district", "uptown"],
  "TX/dallas/design-district": ["medical-district", "stemmons-corridor", "victory-park", "uptown", "turtle-creek"],
  "TX/dallas/cedars": ["main-street-district", "downtown-dallas", "deep-ellum", "west-end-historic-district", "arts-district"],
  "TX/dallas/medical-district": ["design-district", "stemmons-corridor", "turtle-creek", "victory-park", "uptown"],
  "TX/dallas/stemmons-corridor": ["medical-district", "design-district", "turtle-creek", "victory-park", "uptown"],
  "TX/dallas/preston-center": ["north-dallas", "turtle-creek", "medical-district", "stemmons-corridor", "uptown"],
  "TX/dallas/turtle-creek": ["uptown", "victory-park", "preston-center", "arts-district", "design-district"],
  "TX/dallas/north-dallas": ["far-north-dallas", "preston-center", "turtle-creek", "medical-district", "stemmons-corridor"],
  "TX/dallas/far-north-dallas": ["north-dallas", "preston-center", "stemmons-corridor", "medical-district", "turtle-creek"],
  "TX/dallas/bishop-arts-district": ["cedars", "west-end-historic-district", "main-street-district", "downtown-dallas", "victory-park"],
  "WA/seattle/downtown-seattle": ["pioneer-square", "waterfront", "denny-triangle", "belltown", "south-lake-union"],
  "WA/seattle/south-lake-union": ["denny-triangle", "capitol-hill", "belltown", "waterfront", "downtown-seattle"],
  "WA/seattle/denny-triangle": ["belltown", "south-lake-union", "waterfront", "downtown-seattle", "capitol-hill"],
  "WA/seattle/pioneer-square": ["downtown-seattle", "waterfront", "sodo", "belltown", "denny-triangle"],
  "WA/seattle/belltown": ["denny-triangle", "waterfront", "south-lake-union", "downtown-seattle", "pioneer-square"],
  "WA/seattle/ballard": ["fremont", "university-district", "northgate", "south-lake-union", "capitol-hill"],
  "WA/seattle/capitol-hill": ["south-lake-union", "denny-triangle", "belltown", "downtown-seattle", "university-district"],
  "WA/seattle/fremont": ["university-district", "south-lake-union", "ballard", "capitol-hill", "denny-triangle"],
  "WA/seattle/university-district": ["fremont", "capitol-hill", "south-lake-union", "northgate", "denny-triangle"],
  "WA/seattle/northgate": ["university-district", "ballard", "fremont", "capitol-hill", "south-lake-union"],
  "WA/seattle/waterfront": ["downtown-seattle", "belltown", "pioneer-square", "denny-triangle", "south-lake-union"],
  "WA/seattle/sodo": ["pioneer-square", "downtown-seattle", "waterfront", "belltown", "denny-triangle"],
  "MA/boston/back-bay": ["theater-district", "south-end", "fenway-kenmore", "financial-district", "downtown-boston"],
  "MA/boston/financial-district": ["downtown-boston", "government-center", "leather-district", "seaport-district", "theater-district"],
  "MA/boston/downtown-boston": ["financial-district", "government-center", "leather-district", "theater-district", "north-station-west-end"],
  "MA/boston/seaport-district": ["financial-district", "leather-district", "downtown-boston", "government-center", "theater-district"],
  "MA/boston/government-center": ["downtown-boston", "financial-district", "north-station-west-end", "theater-district", "leather-district"],
  "MA/boston/leather-district": ["downtown-boston", "financial-district", "theater-district", "seaport-district", "south-end"],
  "MA/boston/north-station-west-end": ["government-center", "downtown-boston", "financial-district", "theater-district", "leather-district"],
  "MA/boston/theater-district": ["leather-district", "downtown-boston", "financial-district", "back-bay", "south-end"],
  "MA/boston/longwood-medical-area": ["fenway-kenmore", "back-bay", "south-end", "theater-district", "downtown-boston"],
  "MA/boston/south-end": ["theater-district", "back-bay", "leather-district", "downtown-boston", "financial-district"],
  "MA/boston/fenway-kenmore": ["longwood-medical-area", "back-bay", "south-end", "theater-district", "downtown-boston"],
  "DC/washington/golden-triangle": ["dupont-circle", "downtown-dc", "penn-quarter", "mount-vernon-triangle", "georgetown"],
  "DC/washington/downtown-dc": ["golden-triangle", "penn-quarter", "mount-vernon-triangle", "dupont-circle", "capitol-hill"],
  "DC/washington/capitol-riverfront": ["capitol-hill", "southwest-waterfront", "penn-quarter", "h-street-ne", "mount-vernon-triangle"],
  "DC/washington/penn-quarter": ["downtown-dc", "mount-vernon-triangle", "capitol-hill", "golden-triangle", "southwest-waterfront"],
  "DC/washington/mount-vernon-triangle": ["penn-quarter", "downtown-dc", "noma", "capitol-hill", "golden-triangle"],
  "DC/washington/noma": ["h-street-ne", "mount-vernon-triangle", "capitol-hill", "penn-quarter", "downtown-dc"],
  "DC/washington/dupont-circle": ["golden-triangle", "downtown-dc", "georgetown", "penn-quarter", "mount-vernon-triangle"],
  "DC/washington/capitol-hill": ["penn-quarter", "mount-vernon-triangle", "capitol-riverfront", "southwest-waterfront", "noma"],
  "DC/washington/h-street-ne": ["noma", "capitol-hill", "mount-vernon-triangle", "penn-quarter", "capitol-riverfront"],
  "DC/washington/georgetown": ["dupont-circle", "golden-triangle", "downtown-dc", "penn-quarter", "mount-vernon-triangle"],
  "DC/washington/southwest-waterfront": ["capitol-riverfront", "capitol-hill", "penn-quarter", "downtown-dc", "mount-vernon-triangle"],
  "GA/atlanta/buckhead": ["midtown", "west-midtown", "perimeter-center", "cumberland-galleria", "old-fourth-ward"],
  "GA/atlanta/midtown": ["old-fourth-ward", "west-midtown", "downtown-atlanta", "inman-park", "buckhead"],
  "GA/atlanta/downtown-atlanta": ["south-downtown", "old-fourth-ward", "inman-park", "midtown", "west-midtown"],
  "GA/atlanta/perimeter-center": ["buckhead", "cumberland-galleria", "midtown"],
  "GA/atlanta/cumberland-galleria": ["buckhead", "west-midtown", "perimeter-center"],
  "GA/atlanta/west-midtown": ["midtown", "downtown-atlanta", "old-fourth-ward", "south-downtown", "buckhead"],
  "GA/atlanta/old-fourth-ward": ["inman-park", "midtown", "downtown-atlanta", "south-downtown", "west-midtown"],
  "GA/atlanta/fulton-industrial": ["west-midtown", "south-downtown", "downtown-atlanta", "hartsfield-jackson-airport-area"],
  "GA/atlanta/hartsfield-jackson-airport-area": ["south-downtown", "downtown-atlanta", "fulton-industrial"],
  "GA/atlanta/south-downtown": ["downtown-atlanta", "old-fourth-ward", "inman-park", "midtown", "west-midtown"],
  "GA/atlanta/inman-park": ["old-fourth-ward", "downtown-atlanta", "midtown", "south-downtown", "west-midtown"],
  "CA/oakland/downtown-oakland": ["uptown-oakland", "jack-london-square", "old-oakland", "lake-merritt"],
  "CA/oakland/uptown-oakland": ["downtown-oakland", "jack-london-square", "lake-merritt", "old-oakland"],
  "CA/san-diego/downtown-san-diego": ["east-village", "little-italy", "bankers-hill", "barrio-logan", "liberty-station"],
  "CA/san-diego/east-village": ["downtown-san-diego", "barrio-logan", "little-italy", "bankers-hill", "liberty-station"],
  "CA/san-diego/little-italy": ["bankers-hill", "downtown-san-diego", "east-village", "liberty-station", "barrio-logan"],
  "CA/san-diego/mission-valley": ["bankers-hill", "kearny-mesa", "downtown-san-diego", "little-italy", "east-village"],
  "CA/san-diego/bankers-hill": ["little-italy", "downtown-san-diego", "east-village", "mission-valley", "barrio-logan"],
  "CA/san-diego/kearny-mesa": ["mission-valley", "university-city", "sorrento-valley", "bankers-hill"],
  "CA/san-diego/sorrento-valley": ["university-city", "kearny-mesa", "mission-valley", "rancho-bernardo"],
  "CA/san-diego/university-city": ["sorrento-valley", "kearny-mesa", "mission-valley", "liberty-station"],
  "CA/san-diego/rancho-bernardo": ["sorrento-valley", "university-city", "kearny-mesa"],
  "CA/san-diego/otay-mesa": ["barrio-logan", "east-village", "downtown-san-diego"],
  "CA/san-diego/barrio-logan": ["east-village", "downtown-san-diego", "little-italy", "bankers-hill", "liberty-station"],
  "CA/san-diego/liberty-station": ["little-italy", "bankers-hill", "downtown-san-diego", "east-village", "mission-valley"],
  "TN/nashville/downtown-nashville": ["sobro", "the-gulch", "germantown", "music-row", "midtown"],
  "TN/nashville/sobro": ["downtown-nashville", "the-gulch", "music-row", "midtown", "germantown"],
  "TN/nashville/midtown": ["music-row", "the-gulch", "west-end", "downtown-nashville", "sobro"],
  "TN/nashville/music-row": ["midtown", "the-gulch", "downtown-nashville", "sobro", "west-end"],
  "TN/nashville/west-end": ["midtown", "music-row", "the-gulch", "green-hills", "downtown-nashville"],
  "TN/nashville/green-hills": ["west-end", "midtown", "music-row", "the-gulch"],
  "TN/nashville/east-nashville": ["downtown-nashville", "sobro", "germantown", "the-gulch"],
  "TN/nashville/donelson-airport-area": ["east-nashville", "sobro", "downtown-nashville"],
  "TN/nashville/the-gulch": ["music-row", "sobro", "downtown-nashville", "midtown", "germantown"],
  "TN/nashville/germantown": ["downtown-nashville", "the-gulch", "sobro", "east-nashville", "midtown"],
  "CO/denver/central-business-district": ["lodo", "ballpark", "capitol-hill", "lower-highland", "santa-fe-arts-district"],
  "CO/denver/cherry-creek": ["capitol-hill", "baker", "santa-fe-arts-district", "central-business-district", "denver-tech-center"],
  "CO/denver/lodo": ["ballpark", "central-business-district", "lower-highland", "river-north-art-district", "globeville"],
  "CO/denver/ballpark": ["lodo", "central-business-district", "river-north-art-district", "lower-highland", "globeville"],
  "CO/denver/denver-tech-center": ["cherry-creek", "baker", "capitol-hill"],
  "CO/denver/santa-fe-arts-district": ["sun-valley", "capitol-hill", "central-business-district", "baker", "lodo"],
  "CO/denver/central-park": ["northeast-denver-industrial", "river-north-art-district", "globeville-elyria-swansea", "globeville"],
  "CO/denver/capitol-hill": ["santa-fe-arts-district", "central-business-district", "cherry-creek", "lodo", "baker"],
  "CO/denver/sun-valley": ["santa-fe-arts-district", "central-business-district", "lodo", "baker", "capitol-hill"],
  "CO/denver/northeast-denver-industrial": ["central-park", "river-north-art-district", "globeville-elyria-swansea", "globeville"],
  "CO/denver/globeville": ["globeville-elyria-swansea", "river-north-art-district", "ballpark", "lower-highland", "lodo"],
  "CO/denver/river-north-art-district": ["globeville-elyria-swansea", "globeville", "ballpark", "central-business-district", "lodo"],
  "CO/denver/globeville-elyria-swansea": ["globeville", "river-north-art-district", "ballpark", "central-park", "northeast-denver-industrial"],
  "CO/denver/lower-highland": ["lodo", "ballpark", "central-business-district", "globeville", "river-north-art-district"],
  "CO/denver/baker": ["santa-fe-arts-district", "capitol-hill", "cherry-creek", "sun-valley", "central-business-district"]
};

const displayNameWithArticleByKey = {
  "CA/san-francisco/financial-district": "the Financial District",
  "MA/boston/financial-district": "the Financial District",
  "NY/new-york/financial-district": "the Financial District",
  "NY/new-york/upper-west-side": "the Upper West Side",
  "NY/new-york/upper-east-side": "the Upper East Side",
  "NY/new-york/west-village": "the West Village",
  "NY/new-york/garment-district": "the Garment District",
  "NY/new-york/flatiron-district": "the Flatiron District",
  "NY/new-york/plaza-district": "the Plaza District",
};

function displayNameWithArticleFor(page) {
  return displayNameWithArticleByKey[pageKey(page)] || "";
}

function sentenceStartName(value) {
  const label = clean(value);
  if (!label) return "";

  return label.charAt(0).toUpperCase() + label.slice(1);
}

const nearbyComparisonNotesByKey = {
  "GA/atlanta/buckhead": {
    midtown: "Denser and more transit-oriented, with stronger university and apartment overlap.",
    "west-midtown": "More adaptive-reuse, showroom, and creative-commercial.",
    "perimeter-center": "More suburban and parking-driven, with stronger freeway commute logic.",
    "cumberland-galleria": "Northwest office-retail node with event, ballpark, and freeway adjacency.",
    "old-fourth-ward": "Eastside mixed-use alternative with stronger neighborhood retail and food context.",
  },
  "GA/atlanta/midtown": {
    "old-fourth-ward": "More neighborhood-scaled, food-oriented, and eastside mixed-use.",
    "west-midtown": "More adaptive-reuse, showroom-oriented, and car-oriented.",
    "downtown-atlanta": "More civic, legal, government, and traditional CBD-oriented.",
    "inman-park": "More neighborhood retail and restaurant-led, with less office scale.",
    buckhead: "More executive-facing, northside, and client-oriented.",
  },
  "GA/atlanta/downtown-atlanta": {
    "south-downtown": "Smaller-scale historic blocks and downtown-adjacent repositioning.",
    "old-fourth-ward": "Eastside mixed-use alternative with stronger food and neighborhood retail context.",
    "inman-park": "Neighborhood retail and restaurant-led setting with less institutional office context.",
    midtown: "Denser mixed-use office district with stronger residential and university overlap.",
    "west-midtown": "More creative-commercial, showroom, and adaptive-reuse oriented.",
  },
  "GA/atlanta/perimeter-center": {
    buckhead: "More established urban business address with stronger client-facing retail context.",
    "cumberland-galleria": "Another suburban office-retail node, oriented to northwest metro access.",
    midtown: "More central, walkable, transit-oriented, and mixed-use.",
  },
  "GA/atlanta/west-midtown": {
    midtown: "More vertical and transit-oriented, with stronger institutional and office-tower context.",
    "downtown-atlanta": "More civic, institutional, transit-connected, and traditional CBD-oriented.",
    "old-fourth-ward": "Eastside food, retail, and neighborhood mixed-use alternative.",
    "south-downtown": "Historic downtown-adjacent setting with smaller-scale blocks and repositioning potential.",
    buckhead: "More polished northside office and client-facing business context.",
  },
  "CA/oakland/downtown-oakland": {
    "uptown-oakland": "More mixed-use and smaller-company oriented, with stronger Uptown arts and retail context.",
    "jack-london-square": "More waterfront and warehouse-adjacent, with service-commercial and adaptive texture.",
    "old-oakland": "Smaller-scale historic blocks just west of the formal downtown core.",
    "lake-merritt": "More Lake Merritt-adjacent, with less formal civic and office-core context.",
  },
  "CA/oakland/uptown-oakland": {
    "downtown-oakland": "More formal, civic, and traditional office-core oriented.",
    "jack-london-square": "More waterfront and service-commercial, with warehouse-adjacent texture.",
    temescal: "More neighborhood retail and small-business oriented north of Uptown.",
    "lake-merritt": "More lake-adjacent and residential mixed-use, with less Broadway office concentration.",
    "old-oakland": "Smaller historic downtown-adjacent blocks with less Uptown arts and Broadway office context.",
  },
};

const representativeBuildingPathOverridesByAreaId = {
  "sf-soma": [
    "/commercial-real-estate/building/CA/san-francisco/144-2nd-st/",
    "/commercial-real-estate/building/CA/san-francisco/414-brannan-st/",
    "/commercial-real-estate/building/CA/san-francisco/699-2nd-st/",
    "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/",
    "/commercial-real-estate/building/CA/san-francisco/460-townsend-st/",
    "/commercial-real-estate/building/CA/san-francisco/909-harrison-st/",
  ],
  "sf-mission-bay": [
    "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/",
    "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/",
    "/commercial-real-estate/building/CA/san-francisco/555-mission-rock-st/",
    "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/",
    "/commercial-real-estate/building/CA/san-francisco/99-rhode-island-st/",
    "/commercial-real-estate/building/CA/san-francisco/54-jeff-adachi-way/",
  ],
  "sf-jackson-square": [
    "/commercial-real-estate/building/CA/san-francisco/75-broadway/",
    "/commercial-real-estate/building/CA/san-francisco/2-embarcadero-ctr/",
    "/commercial-real-estate/building/CA/san-francisco/924-sansome-st/",
    "/commercial-real-estate/building/CA/san-francisco/1100-grant-ave/",
    "/commercial-real-estate/building/CA/san-francisco/33-drumm-st/",
    "/commercial-real-estate/building/CA/san-francisco/27-drumm-st/",
  ],
  "oak-downtown-oakland": [
    "/commercial-real-estate/building/CA/oakland/1333-broadway/",
    "/commercial-real-estate/building/CA/oakland/505-14th-st/",
    "/commercial-real-estate/building/CA/oakland/300-frank-h-ogawa-plz/",
    "/commercial-real-estate/building/CA/oakland/1440-broadway/",
  ],
  "oak-uptown": [
    "/commercial-real-estate/building/CA/oakland/1-kaiser-plz/",
    "/commercial-real-estate/building/CA/oakland/2101-webster-st/",
    "/commercial-real-estate/building/CA/oakland/1970-broadway/",
    "/commercial-real-estate/building/CA/oakland/415-20th-st/",
  ],
  "oak-jack-london-square": [
    "/commercial-real-estate/building/CA/oakland/160-franklin-st/",
    "/commercial-real-estate/building/CA/oakland/424-3rd-st/",
    "/commercial-real-estate/building/CA/oakland/66-franklin-st/",
    "/commercial-real-estate/building/CA/oakland/230-madison-st/",
    "/commercial-real-estate/building/CA/oakland/105-2nd-st/",
  ],
  "oak-old-oakland": [
    "/commercial-real-estate/building/CA/oakland/1000-broadway/",
    "/commercial-real-estate/building/CA/oakland/1212-broadway/",
    "/commercial-real-estate/building/CA/oakland/1111-broadway/",
    "/commercial-real-estate/building/CA/oakland/1221-broadway/",
  ],
  "ba-downtown-palo-alto": [
    "/commercial-real-estate/building/CA/palo-alto/525-university-ave/",
    "/commercial-real-estate/building/CA/palo-alto/101-lytton-ave/",
    "/commercial-real-estate/building/CA/palo-alto/530-lytton-ave/",
    "/commercial-real-estate/building/CA/palo-alto/228-hamilton-ave/",
    "/commercial-real-estate/building/CA/palo-alto/400-hamilton-ave/",
  ],
};

const southBayDistrictDefinitions = [
  {
    id: "sb-north-san-jose",
    name: "North San Jose",
    slug: "north-san-jose",
    city: "San Jose",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-jose/north-san-jose/",
    centroid_lat: 37.408,
    centroid_lng: -121.94,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "flex"],
    profile: ["technology_office", "rd_flex", "industrial_flex", "airport_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-jose/2033-gateway-place/",
      "/commercial-real-estate/building/CA/san-jose/2880-zanker-rd/",
      "/commercial-real-estate/building/CA/san-jose/350-w-trimble-rd/",
      "/commercial-real-estate/building/CA/san-jose/1510-montague-expy/",
      "/commercial-real-estate/building/CA/san-jose/725-775-ridder-park-dr/",
    ],
  },
  {
    id: "sb-downtown-san-jose",
    name: "Downtown San Jose",
    slug: "downtown-san-jose",
    city: "San Jose",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-jose/downtown-san-jose/",
    centroid_lat: 37.335,
    centroid_lng: -121.889,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["downtown_office", "civic_core", "caltrain", "light_rail"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-jose/99-almaden-blvd/",
      "/commercial-real-estate/building/CA/san-jose/75-e-santa-clara-st/",
      "/commercial-real-estate/building/CA/san-jose/333-w-san-carlos-st/",
      "/commercial-real-estate/building/CA/san-jose/18-n-1st-st/",
      "/commercial-real-estate/building/CA/san-jose/45-n-san-pedro-st/",
    ],
  },
  {
    id: "sb-santa-clara-office-tech-core",
    name: "Santa Clara Tech Core",
    slug: "santa-clara-office-tech-core",
    city: "Santa Clara",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/",
    centroid_lat: 37.383,
    centroid_lng: -121.978,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["technology_office", "rd_flex", "campus_office", "central_south_bay"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-clara/2445-augustine-dr/",
      "/commercial-real-estate/building/CA/santa-clara/3300-olcott-st/",
      "/commercial-real-estate/building/CA/santa-clara/777-lawrence-expy/",
      "/commercial-real-estate/building/CA/santa-clara/2300-walsh-ave/",
      "/commercial-real-estate/building/CA/santa-clara/1841-pruneridge-ave/",
    ],
  },
  {
    id: "sb-great-america-tasman",
    name: "Great America / Tasman",
    slug: "great-america-tasman",
    city: "Santa Clara",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-clara/great-america-tasman/",
    centroid_lat: 37.405,
    centroid_lng: -121.974,
    area_type: "district",
    approximate_space_types: ["office", "retail", "flex"],
    profile: ["technology_office", "light_rail", "event_adjacent", "campus_office"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-clara/4300-great-america-pkwy/",
      "/commercial-real-estate/building/CA/santa-clara/5201-great-america-pkwy/",
      "/commercial-real-estate/building/CA/santa-clara/mission-college-blvd-and-montague-expy/",
      "/commercial-real-estate/building/CA/santa-clara/3700-thomas-rd/",
    ],
  },
  {
    id: "sb-moffett-park",
    name: "Moffett Park",
    slug: "moffett-park",
    city: "Sunnyvale",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
    centroid_lat: 37.412,
    centroid_lng: -122.025,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["technology_campus", "innovation_district", "rd_flex", "route_237"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sunnyvale/1277-borregas-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/415-n-mary-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/525-almanor-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/710-lakeway-drive-suite-200/",
    ],
  },
  {
    id: "sb-north-bayshore",
    name: "North Bayshore",
    slug: "north-bayshore",
    city: "Mountain View",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/mountain-view/north-bayshore/",
    centroid_lat: 37.424,
    centroid_lng: -122.084,
    area_type: "district",
    approximate_space_types: ["office", "flex"],
    profile: ["technology_campus", "innovation_district", "mountain_view", "large_employer_context"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/mountain-view/605-ellis-st/",
      "/commercial-real-estate/building/CA/mountain-view/1954-1958-old-middlefield-wy/",
      "/commercial-real-estate/building/CA/mountain-view/140-144-whisman-rd-s/",
    ],
  },
  {
    id: "sb-downtown-mountain-view",
    name: "Downtown Mountain View",
    slug: "downtown-mountain-view",
    city: "Mountain View",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/mountain-view/downtown-mountain-view/",
    centroid_lat: 37.393,
    centroid_lng: -122.079,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["caltrain", "downtown_office", "startup", "professional_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/mountain-view/194-198-castro-st/",
      "/commercial-real-estate/building/CA/mountain-view/275-castro-st/",
      "/commercial-real-estate/building/CA/mountain-view/785-castro-st/",
      "/commercial-real-estate/building/CA/mountain-view/800-w-el-camino-real/",
    ],
  },
  {
    id: "sb-stanford-research-park",
    name: "Stanford Research Park",
    slug: "stanford-research-park",
    city: "Palo Alto",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/palo-alto/stanford-research-park/",
    centroid_lat: 37.41,
    centroid_lng: -122.148,
    area_type: "district",
    approximate_space_types: ["office", "flex"],
    profile: ["research_park", "rd_office", "stanford", "campus_office"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/palo-alto/2470-embarcadero-way/",
      "/commercial-real-estate/building/CA/palo-alto/2100-geng-rd/",
      "/commercial-real-estate/building/CA/palo-alto/2170-west-bayshore-road/",
      "/commercial-real-estate/building/CA/palo-alto/3101-park-blvd/",
      "/commercial-real-estate/building/CA/palo-alto/1121-san-antonio-rd/",
    ],
  },
  {
    id: "sb-downtown-redwood-city",
    name: "Downtown Redwood City",
    slug: "downtown-redwood-city",
    city: "Redwood City",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/",
    centroid_lat: 37.486,
    centroid_lng: -122.232,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["caltrain", "downtown_office", "professional_services", "mid_peninsula"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/redwood-city/2065-broadway-st/",
      "/commercial-real-estate/building/CA/redwood-city/2400-broadway/",
      "/commercial-real-estate/building/CA/redwood-city/2504-el-camino-real/",
      "/commercial-real-estate/building/CA/redwood-city/303-twin-dolphin-drive/",
    ],
  },
  {
    id: "sb-milpitas-industrial",
    name: "Milpitas Industrial",
    slug: "milpitas-industrial",
    city: "Milpitas",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/milpitas/milpitas-industrial/",
    centroid_lat: 37.417,
    centroid_lng: -121.903,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["warehouse", "industrial_flex", "service_commercial", "i880_237"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/milpitas/720-montague-expy/",
      "/commercial-real-estate/building/CA/milpitas/750-e-calaveras-blvd/",
      "/commercial-real-estate/building/CA/milpitas/401-jacklin-rd/",
    ],
  },
  {
    id: "sb-warm-springs",
    name: "Warm Springs Innovation District",
    slug: "warm-springs-innovation-district",
    city: "Fremont",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/",
    centroid_lat: 37.503,
    centroid_lng: -121.94,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["advanced_manufacturing", "rd_flex", "bart", "warm_springs"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/fremont/45101-45169-industrial-dr/",
      "/commercial-real-estate/building/CA/fremont/40861-albrae-st/",
      "/commercial-real-estate/building/CA/fremont/5605-5639-auto-mall-pky/",
      "/commercial-real-estate/building/CA/fremont/43806-pacific-commons-boulevard/",
    ],
  },
  {
    id: "sb-ardenwood",
    name: "Ardenwood Technology Park",
    slug: "ardenwood-technology-park",
    city: "Fremont",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/fremont/ardenwood-technology-park/",
    centroid_lat: 37.555,
    centroid_lng: -122.06,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["rd_flex", "technology_park", "dumbarton_bridge", "fremont"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/fremont/255-fourier-ave/",
      "/commercial-real-estate/building/CA/fremont/4900-paseo-padre-pkwy/",
      "/commercial-real-estate/building/CA/fremont/6036-6038-stevenson-blvd/",
    ],
  },
];

const eastBayDistrictDefinitions = [
  {
    id: "eb-downtown-berkeley",
    name: "Downtown Berkeley",
    slug: "downtown-berkeley",
    city: "Berkeley",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
    centroid_lat: 37.87,
    centroid_lng: -122.269,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["university_adjacent", "bart", "downtown_office", "professional_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/berkeley/2001-addison-st/",
      "/commercial-real-estate/building/CA/berkeley/2120-university-ave/",
    ],
  },
  {
    id: "eb-emeryville-commercial-core",
    name: "Emeryville",
    slug: "emeryville-commercial-core",
    city: "Emeryville",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
    centroid_lat: 37.838,
    centroid_lng: -122.291,
    area_type: "district",
    approximate_space_types: ["office", "flex", "retail"],
    profile: ["office", "life_science_support", "mixed_commercial", "oakland_berkeley_edge"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/emeryville/1900-powell-st/",
    ],
  },
  {
    id: "eb-downtown-walnut-creek",
    name: "Downtown Walnut Creek",
    slug: "downtown-walnut-creek",
    city: "Walnut Creek",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/walnut-creek/downtown-walnut-creek/",
    centroid_lat: 37.9,
    centroid_lng: -122.062,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["suburban_downtown", "professional_services", "client_facing", "bart"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/walnut-creek/2121-n-california-blvd/",
      "/commercial-real-estate/building/CA/walnut-creek/1406-n-broadway/",
      "/commercial-real-estate/building/CA/walnut-creek/1556-mt-diablo-blvd/",
      "/commercial-real-estate/building/CA/walnut-creek/1255-treat-blvd/",
    ],
  },
  {
    id: "eb-hacienda-business-park",
    name: "Hacienda Business Park",
    slug: "hacienda-business-park",
    city: "Pleasanton",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/pleasanton/hacienda-business-park/",
    centroid_lat: 37.696,
    centroid_lng: -121.9,
    area_type: "district",
    approximate_space_types: ["office", "flex"],
    profile: ["suburban_business_park", "corporate_office", "tri_valley", "i580_i680"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/pleasanton/6200-stoneridge-mall-rd/",
      "/commercial-real-estate/building/CA/pleasanton/4900-hopyard-rd/",
      "/commercial-real-estate/building/CA/pleasanton/6701-koll-center-pkwy/",
      "/commercial-real-estate/building/CA/pleasanton/5745-5775-johnson-dr/",
    ],
  },
];

const northBayDistrictDefinitions = [
  {
    id: "nb-downtown-san-rafael",
    name: "Downtown San Rafael",
    slug: "downtown-san-rafael",
    city: "San Rafael",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-rafael/downtown-san-rafael/",
    centroid_lat: 37.974,
    centroid_lng: -122.531,
    area_type: "downtown_core",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["downtown", "professional_services", "medical", "local_services", "central_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-rafael/1200-4th-st/",
      "/commercial-real-estate/building/CA/san-rafael/181-third-st/",
      "/commercial-real-estate/building/CA/san-rafael/369-e-third-st/",
      "/commercial-real-estate/building/CA/san-rafael/992-998-4th-street/",
    ],
  },
  {
    id: "nb-north-san-rafael-terra-linda",
    name: "North San Rafael / Terra Linda",
    slug: "north-san-rafael-terra-linda",
    city: "San Rafael",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-rafael/north-san-rafael-terra-linda/",
    centroid_lat: 38.005,
    centroid_lng: -122.546,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "flex"],
    profile: ["medical", "professional_services", "suburban_office", "highway_101", "central_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-rafael/100-smith-ranch-rd/",
      "/commercial-real-estate/building/CA/san-rafael/4040-civic-center-dr/",
    ],
  },
  {
    id: "nb-larkspur-corte-madera-corridor",
    name: "Larkspur / Corte Madera Corridor",
    slug: "larkspur-corte-madera-corridor",
    city: "Larkspur",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/larkspur/larkspur-corte-madera-corridor/",
    centroid_lat: 37.932,
    centroid_lng: -122.519,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["professional_services", "medical", "retail", "local_services", "southern_marin"],
    representative_building_paths: [],
  },
  {
    id: "nb-novato-commercial-core",
    name: "Novato",
    slug: "novato-commercial-core",
    city: "Novato",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/novato/novato-commercial-core/",
    centroid_lat: 38.107,
    centroid_lng: -122.569,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "flex", "industrial"],
    profile: ["office", "medical", "industrial_flex", "service_commercial", "northern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/novato/15-leveroni-ct/",
      "/commercial-real-estate/building/CA/novato/2-ranch-dr/",
      "/commercial-real-estate/building/CA/novato/7250-redwood-drive/",
      "/commercial-real-estate/building/CA/novato/951-953-front-st/",
    ],
  },
  {
    id: "nb-petaluma-commercial-core",
    name: "Petaluma",
    slug: "petaluma-commercial-core",
    city: "Petaluma",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/petaluma/petaluma-commercial-core/",
    centroid_lat: 38.236,
    centroid_lng: -122.64,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "industrial", "flex", "retail"],
    profile: ["office", "industrial_flex", "service_commercial", "highway_101", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/petaluma/755-baywood-dr/",
      "/commercial-real-estate/building/CA/petaluma/389-mcdowell-blvd-s/",
      "/commercial-real-estate/building/CA/petaluma/401-kenilworth-dr/",
    ],
  },
  {
    id: "nb-downtown-santa-rosa",
    name: "Downtown Santa Rosa",
    slug: "downtown-santa-rosa",
    city: "Santa Rosa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-rosa/downtown-santa-rosa/",
    centroid_lat: 38.44,
    centroid_lng: -122.714,
    area_type: "downtown_core",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["downtown", "professional_services", "medical", "local_services", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-rosa/3550-round-barn-blvd/",
      "/commercial-real-estate/building/CA/santa-rosa/2527-guernville-road/",
    ],
  },
];

const sacramentoDistrictDefinitions = [
  {
    id: "sac-downtown-sacramento",
    name: "Downtown Sacramento",
    slug: "downtown-sacramento",
    city: "Sacramento",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
    centroid_lat: 38.579,
    centroid_lng: -121.493,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["downtown", "civic_business", "professional_services", "transit_oriented", "government_adjacent"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sacramento/1201-j-st/",
      "/commercial-real-estate/building/CA/sacramento/1215-k-st/",
      "/commercial-real-estate/building/CA/sacramento/1225-8th-st/",
      "/commercial-real-estate/building/CA/sacramento/1303-j-st/",
      "/commercial-real-estate/building/CA/sacramento/1325-j-st/",
    ],
  },
  {
    id: "sac-midtown-sacramento",
    name: "Midtown Sacramento",
    slug: "midtown-sacramento",
    city: "Sacramento",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sacramento/midtown-sacramento/",
    centroid_lat: 38.573,
    centroid_lng: -121.474,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["mixed_use", "professional_services", "medical", "creative_office", "local_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sacramento/1600-k-st/",
      "/commercial-real-estate/building/CA/sacramento/1610-r-st/",
      "/commercial-real-estate/building/CA/sacramento/1651-alhambra-blvd/",
    ],
  },
  {
    id: "sac-east-sacramento-alhambra",
    name: "East Sacramento / Alhambra Corridor",
    slug: "east-sacramento-alhambra-corridor",
    city: "Sacramento",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sacramento/east-sacramento-alhambra-corridor/",
    centroid_lat: 38.57,
    centroid_lng: -121.463,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["medical", "professional_services", "local_services", "central_sacramento"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sacramento/1651-alhambra-blvd/",
      "/commercial-real-estate/building/CA/sacramento/1600-k-st/",
    ],
  },
  {
    id: "sac-natomas",
    name: "Natomas",
    slug: "natomas",
    city: "Sacramento",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sacramento/natomas/",
    centroid_lat: 38.65,
    centroid_lng: -121.51,
    area_type: "district",
    approximate_space_types: ["office", "medical", "flex"],
    profile: ["suburban_office", "airport_access", "service_commercial", "highway_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sacramento/1200-del-paso-rd/",
      "/commercial-real-estate/building/CA/sacramento/1313-n-market-blvd/",
      "/commercial-real-estate/building/CA/sacramento/1326-n-market-blvd/",
      "/commercial-real-estate/building/CA/sacramento/1415-n-market-blvd/",
    ],
  },
  {
    id: "sac-arden-point-west",
    name: "Arden / Point West",
    slug: "arden-point-west",
    city: "Sacramento",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sacramento/arden-point-west/",
    centroid_lat: 38.596,
    centroid_lng: -121.431,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["suburban_office", "medical", "professional_services", "business_80"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sacramento/1111-exposition-blvd/",
      "/commercial-real-estate/building/CA/sacramento/1111-howe-ave/",
      "/commercial-real-estate/building/CA/sacramento/1375-exposition-blvd/",
      "/commercial-real-estate/building/CA/sacramento/1425-river-park-dr/",
      "/commercial-real-estate/building/CA/sacramento/1451-river-plaza-drive/",
    ],
  },
  {
    id: "sac-power-inn-industrial",
    name: "Power Inn Industrial",
    slug: "power-inn-industrial",
    city: "Sacramento",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sacramento/power-inn-industrial/",
    centroid_lat: 38.535,
    centroid_lng: -121.402,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["warehouse", "industrial_flex", "service_commercial", "highway_50"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sacramento/10255-old-placerville-rd/",
      "/commercial-real-estate/building/CA/sacramento/10265-old-placerville-rd/",
      "/commercial-real-estate/building/CA/sacramento/1060-national-dr/",
      "/commercial-real-estate/building/CA/sacramento/1164-national-dr/",
    ],
  },
  {
    id: "sac-west-sacramento-industrial",
    name: "West Sacramento Industrial",
    slug: "west-sacramento-industrial",
    city: "West Sacramento",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/",
    centroid_lat: 38.565,
    centroid_lng: -121.55,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["warehouse", "industrial_flex", "service_commercial", "river_port", "downtown_edge"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/west-sacramento/2928-ramco-st/",
      "/commercial-real-estate/building/CA/west-sacramento/3100-ramco-st/",
      "/commercial-real-estate/building/CA/west-sacramento/3380-industrial-blvd/",
      "/commercial-real-estate/building/CA/west-sacramento/3950-industrial-blvd/",
      "/commercial-real-estate/building/CA/west-sacramento/545-jefferson-blvd/",
    ],
  },
  {
    id: "sac-rancho-cordova-commercial-core",
    name: "Rancho Cordova",
    slug: "rancho-cordova-commercial-core",
    city: "Rancho Cordova",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/",
    centroid_lat: 38.59,
    centroid_lng: -121.29,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["suburban_office", "industrial_flex", "highway_50", "back_office"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/rancho-cordova/10860-gold-center-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/10940-white-rock-rd/",
      "/commercial-real-estate/building/CA/rancho-cordova/11025-trade-center-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/11171-sun-center-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/11300-trade-center-dr/",
    ],
  },
  {
    id: "sac-folsom-commercial-core",
    name: "Folsom",
    slug: "folsom-commercial-core",
    city: "Folsom",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/folsom/folsom-commercial-core/",
    centroid_lat: 38.65,
    centroid_lng: -121.16,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["suburban_office", "medical", "professional_services", "highway_50", "client_facing"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/folsom/1024-iron-point-rd/",
      "/commercial-real-estate/building/CA/folsom/255-parkshore-dr/",
      "/commercial-real-estate/building/CA/folsom/50-iron-point-cir/",
      "/commercial-real-estate/building/CA/folsom/620-coolidge-dr/",
      "/commercial-real-estate/building/CA/folsom/2545-e-bidwell-st/",
    ],
  },
  {
    id: "sac-roseville-commercial-core",
    name: "Roseville",
    slug: "roseville-commercial-core",
    city: "Roseville",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/roseville/roseville-commercial-core/",
    centroid_lat: 38.75,
    centroid_lng: -121.27,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail", "flex"],
    profile: ["suburban_office", "medical", "professional_services", "retail", "placer_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/roseville/1512-eureka-rd/",
      "/commercial-real-estate/building/CA/roseville/1811-douglas-blvd/",
      "/commercial-real-estate/building/CA/roseville/1386-lead-hill-blvd/",
      "/commercial-real-estate/building/CA/roseville/1000-enterprise-way/",
      "/commercial-real-estate/building/CA/roseville/4000-foothills-blvd/",
    ],
  },
  {
    id: "sac-elk-grove-commercial-core",
    name: "Elk Grove",
    slug: "elk-grove-commercial-core",
    city: "Elk Grove",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/elk-grove/elk-grove-commercial-core/",
    centroid_lat: 38.42,
    centroid_lng: -121.4,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail", "flex"],
    profile: ["suburban_office", "medical", "local_services", "service_commercial", "south_sacramento"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/elk-grove/10139-iron-rock-way/",
      "/commercial-real-estate/building/CA/elk-grove/3137-dwight-rd/",
      "/commercial-real-estate/building/CA/elk-grove/9245-laguna-springs-dr/",
      "/commercial-real-estate/building/CA/elk-grove/9615-laguna-springs-dr/",
    ],
  },
];

const sanDiegoDistrictDefinitions = [
  {
    id: "sd-downtown-san-diego",
    name: "Downtown San Diego",
    slug: "downtown-san-diego",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/downtown-san-diego/",
    centroid_lat: 32.717,
    centroid_lng: -117.163,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["downtown", "professional_services", "client_facing", "transit_oriented", "civic_business"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/402-w-broadway/",
      "/commercial-real-estate/building/CA/san-diego/501-w-broadway/",
      "/commercial-real-estate/building/CA/san-diego/600-b-st/",
      "/commercial-real-estate/building/CA/san-diego/350-10th-avenue/",
      "/commercial-real-estate/building/CA/san-diego/770-first-avenue/",
    ],
  },
  {
    id: "sd-mission-valley",
    name: "Mission Valley",
    slug: "mission-valley",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/mission-valley/",
    centroid_lat: 32.77,
    centroid_lng: -117.158,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["suburban_office", "medical", "central_san_diego", "freeway_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/2515-camino-del-rio-s/",
      "/commercial-real-estate/building/CA/san-diego/2650-camino-del-rio-n/",
      "/commercial-real-estate/building/CA/san-diego/3111-camino-del-rio-n/",
      "/commercial-real-estate/building/CA/san-diego/3333-camino-del-rio-s/",
      "/commercial-real-estate/building/CA/san-diego/9635-granite-ridge-dr/",
    ],
  },
  {
    id: "sd-utc-university-city",
    name: "UTC / University City",
    slug: "utc-university-city",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/utc-university-city/",
    centroid_lat: 32.872,
    centroid_lng: -117.213,
    area_type: "district",
    approximate_space_types: ["office", "medical", "life_science"],
    profile: ["office", "life_science", "medical", "ucsd", "north_city"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/4660-la-jolla-village-dr/",
      "/commercial-real-estate/building/CA/san-diego/4445-eastgate-mall-suite-200/",
      "/commercial-real-estate/building/CA/san-diego/8910-university-center-ln/",
      "/commercial-real-estate/building/CA/san-diego/12707-and-12777-high-bluff-drive/",
    ],
  },
  {
    id: "sd-sorrento-mesa",
    name: "Sorrento Mesa",
    slug: "sorrento-mesa",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/sorrento-mesa/",
    centroid_lat: 32.902,
    centroid_lng: -117.19,
    area_type: "district",
    approximate_space_types: ["office", "flex", "life_science", "industrial"],
    profile: ["life_science", "rd_flex", "technology", "office_flex", "north_city"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/10130-sorrento-valley-rd/",
      "/commercial-real-estate/building/CA/san-diego/11211-sorrento-valley-rd/",
      "/commercial-real-estate/building/CA/san-diego/5440-morehouse-dr/",
      "/commercial-real-estate/building/CA/san-diego/6370-lusk-blvd/",
      "/commercial-real-estate/building/CA/san-diego/9920-pacific-heights-blvd/",
    ],
  },
  {
    id: "sd-torrey-pines-la-jolla",
    name: "Torrey Pines / La Jolla",
    slug: "torrey-pines-la-jolla",
    city: "La Jolla",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/la-jolla/torrey-pines-la-jolla/",
    centroid_lat: 32.879,
    centroid_lng: -117.243,
    area_type: "district",
    approximate_space_types: ["office", "medical", "life_science"],
    profile: ["life_science", "institutional", "medical", "coastal_office", "ucsd"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/la-jolla/888-prospect-st/",
      "/commercial-real-estate/building/CA/la-jolla/1200-prospect-st/",
    ],
  },
  {
    id: "sd-kearny-mesa",
    name: "Kearny Mesa",
    slug: "kearny-mesa",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/kearny-mesa/",
    centroid_lat: 32.825,
    centroid_lng: -117.148,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "flex", "industrial", "retail"],
    profile: ["office_flex", "service_commercial", "showroom", "central_san_diego"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/3914-murphy-canyon-rd/",
      "/commercial-real-estate/building/CA/san-diego/5205-kearny-villa-way/",
      "/commercial-real-estate/building/CA/san-diego/3710-ruffin-rd/",
      "/commercial-real-estate/building/CA/san-diego/4000-ruffin-rd/",
      "/commercial-real-estate/building/CA/san-diego/7240-clairemont-mesa-blvd/",
    ],
  },
  {
    id: "sd-miramar",
    name: "Miramar",
    slug: "miramar",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/miramar/",
    centroid_lat: 32.889,
    centroid_lng: -117.145,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["warehouse", "industrial_flex", "service_commercial", "rd_flex", "north_city"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/6906-miramar-rd/",
      "/commercial-real-estate/building/CA/san-diego/7055-carroll-rd/",
      "/commercial-real-estate/building/CA/san-diego/7545-carroll-rd/",
      "/commercial-real-estate/building/CA/san-diego/8250-camino-santa-fe/",
    ],
  },
  {
    id: "sd-otay-mesa",
    name: "Otay Mesa",
    slug: "otay-mesa",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/otay-mesa/",
    centroid_lat: 32.558,
    centroid_lng: -116.969,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["warehouse", "logistics", "border", "manufacturing", "industrial_flex"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/7310-otay-crossings-ct/",
      "/commercial-real-estate/building/CA/san-diego/7880-airway-rd/",
      "/commercial-real-estate/building/CA/san-diego/9505-airway-rd/",
      "/commercial-real-estate/building/CA/san-diego/7615-siempre-viva-rd/",
    ],
  },
  {
    id: "sd-chula-vista",
    name: "Chula Vista",
    slug: "chula-vista",
    city: "Chula Vista",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/chula-vista/chula-vista/",
    centroid_lat: 32.64,
    centroid_lng: -117.084,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail", "flex"],
    profile: ["south_bay", "local_services", "medical", "professional_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/chula-vista/333-h-st/",
      "/commercial-real-estate/building/CA/chula-vista/303-h-st/",
      "/commercial-real-estate/building/CA/chula-vista/876-broadway/",
      "/commercial-real-estate/building/CA/chula-vista/2402-main-st/",
    ],
  },
  {
    id: "sd-carlsbad",
    name: "Carlsbad",
    slug: "carlsbad",
    city: "Carlsbad",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/carlsbad/carlsbad/",
    centroid_lat: 33.132,
    centroid_lng: -117.28,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "flex", "life_science"],
    profile: ["north_county", "rd_flex", "manufacturing", "office", "coastal_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/carlsbad/1815-aston-ave/",
      "/commercial-real-estate/building/CA/carlsbad/1902-wright-place/",
      "/commercial-real-estate/building/CA/carlsbad/1945-camino-vida-roble/",
      "/commercial-real-estate/building/CA/carlsbad/2300-faraday-ave/",
      "/commercial-real-estate/building/CA/carlsbad/701-palomar-airport-rd/",
    ],
  },
  {
    id: "sd-oceanside",
    name: "Oceanside",
    slug: "oceanside",
    city: "Oceanside",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/oceanside/oceanside/",
    centroid_lat: 33.195,
    centroid_lng: -117.379,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "retail", "flex"],
    profile: ["north_county", "coastal", "local_services", "light_industrial"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/oceanside/2204-s-el-camino-real/",
      "/commercial-real-estate/building/CA/oceanside/2821-oceanside-blvd/",
      "/commercial-real-estate/building/CA/oceanside/4755-oceanside-blvd/",
      "/commercial-real-estate/building/CA/oceanside/815-mission-ave/",
    ],
  },
  {
    id: "sd-vista",
    name: "Vista",
    slug: "vista",
    city: "Vista",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/vista/vista/",
    centroid_lat: 33.2,
    centroid_lng: -117.242,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["north_county", "industrial_flex", "service_commercial", "manufacturing"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/vista/1120-sycamore-ave/",
      "/commercial-real-estate/building/CA/vista/1235-activity-dr/",
      "/commercial-real-estate/building/CA/vista/2630-business-park-dr/",
      "/commercial-real-estate/building/CA/vista/2640-progress-st/",
    ],
  },
  {
    id: "sd-san-marcos",
    name: "San Marcos",
    slug: "san-marcos",
    city: "San Marcos",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-marcos/san-marcos/",
    centroid_lat: 33.142,
    centroid_lng: -117.166,
    area_type: "district",
    approximate_space_types: ["office", "medical", "flex", "retail"],
    profile: ["north_county", "medical", "education_adjacent", "local_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-marcos/1284-w-san-marcos-blvd/",
      "/commercial-real-estate/building/CA/san-marcos/208-w-san-marcos-blvd/",
      "/commercial-real-estate/building/CA/san-marcos/6-creekside-dr/",
    ],
  },
  {
    id: "sd-escondido",
    name: "Escondido",
    slug: "escondido",
    city: "Escondido",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/escondido/escondido/",
    centroid_lat: 33.119,
    centroid_lng: -117.086,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["north_county", "inland", "local_services", "medical", "civic_business"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/escondido/500-la-terraza-blvd/",
      "/commercial-real-estate/building/CA/escondido/300-w-grand-ave/",
      "/commercial-real-estate/building/CA/escondido/1955-citracado-parway/",
    ],
  },
];

const orangeCountyDistrictDefinitions = [
  {
    id: "oc-irvine-spectrum",
    name: "Irvine Spectrum",
    slug: "irvine-spectrum",
    city: "Irvine",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/irvine/irvine-spectrum/",
    centroid_lat: 33.653,
    centroid_lng: -117.75,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial", "retail"],
    profile: ["office", "rd_flex", "technology", "retail", "business_park"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/irvine/200-spectrum-center-dr/",
      "/commercial-real-estate/building/CA/irvine/400-spectrum-center-dr/",
      "/commercial-real-estate/building/CA/irvine/7545-irvine-center-dr/",
      "/commercial-real-estate/building/CA/irvine/8001-irvine-center-dr/",
      "/commercial-real-estate/building/CA/irvine/530-technology-dr/",
    ],
  },
  {
    id: "oc-irvine-business-complex",
    name: "Irvine Business Complex",
    slug: "irvine-business-complex",
    city: "Irvine",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/irvine/irvine-business-complex/",
    centroid_lat: 33.684,
    centroid_lng: -117.854,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["office", "professional_services", "airport_access", "client_facing"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/irvine/17875-von-karman-ave/",
      "/commercial-real-estate/building/CA/irvine/17901-vonkarman-avenue/",
      "/commercial-real-estate/building/CA/irvine/19800-macarthur-blvd/",
      "/commercial-real-estate/building/CA/irvine/2211-michelson-dr/",
      "/commercial-real-estate/building/CA/irvine/3333-michelson-dr/",
    ],
  },
  {
    id: "oc-newport-center-fashion-island",
    name: "Newport Center / Fashion Island",
    slug: "newport-center-fashion-island",
    city: "Newport Beach",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/newport-beach/newport-center-fashion-island/",
    centroid_lat: 33.615,
    centroid_lng: -117.873,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["office", "client_facing", "professional_services", "retail", "coastal"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/newport-beach/4041-macarthur-blvd/",
      "/commercial-real-estate/building/CA/newport-beach/4695-macarthur-ct/",
      "/commercial-real-estate/building/CA/newport-beach/5000-birch-street-west-tower/",
      "/commercial-real-estate/building/CA/newport-beach/895-dove-st/",
    ],
  },
  {
    id: "oc-costa-mesa",
    name: "Costa Mesa",
    slug: "costa-mesa",
    city: "Costa Mesa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/costa-mesa/costa-mesa/",
    centroid_lat: 33.641,
    centroid_lng: -117.918,
    area_type: "district",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["office", "creative_services", "local_services", "retail", "coastal"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/costa-mesa/2037-harbor-blvd/",
      "/commercial-real-estate/building/CA/costa-mesa/2075-newport-blvd/",
      "/commercial-real-estate/building/CA/costa-mesa/3420-bristol-st/",
    ],
  },
  {
    id: "oc-south-coast-metro",
    name: "South Coast Metro",
    slug: "south-coast-metro",
    city: "Costa Mesa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/costa-mesa/south-coast-metro/",
    centroid_lat: 33.692,
    centroid_lng: -117.886,
    area_type: "district",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["office", "client_facing", "retail", "hospitality", "central_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/costa-mesa/555-anton-blvd/",
      "/commercial-real-estate/building/CA/costa-mesa/600-anton-blvd/",
      "/commercial-real-estate/building/CA/costa-mesa/695-town-center-dr/",
      "/commercial-real-estate/building/CA/costa-mesa/3420-bristol-st/",
    ],
  },
  {
    id: "oc-anaheim-platinum-triangle",
    name: "Anaheim Platinum Triangle",
    slug: "anaheim-platinum-triangle",
    city: "Anaheim",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/anaheim/anaheim-platinum-triangle/",
    centroid_lat: 33.806,
    centroid_lng: -117.886,
    area_type: "district",
    approximate_space_types: ["office", "retail", "commercial"],
    profile: ["office", "event_adjacent", "mixed_use", "transit_oriented"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/anaheim/2400-e-katella-ave/",
      "/commercial-real-estate/building/CA/anaheim/1701-s-state-college-blvd/",
      "/commercial-real-estate/building/CA/anaheim/1425-s-state-college-blvd/",
    ],
  },
  {
    id: "oc-anaheim",
    name: "Anaheim",
    slug: "anaheim",
    city: "Anaheim",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/anaheim/anaheim/",
    centroid_lat: 33.858,
    centroid_lng: -117.844,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["industrial_flex", "warehouse", "manufacturing", "service_commercial"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/anaheim/1601-s-sinclair-st/",
      "/commercial-real-estate/building/CA/anaheim/2671-la-palma-ave/",
      "/commercial-real-estate/building/CA/anaheim/3071-e-coronado-st/",
      "/commercial-real-estate/building/CA/anaheim/4222-e-la-palma-ave/",
      "/commercial-real-estate/building/CA/anaheim/5455-e-la-palma-ave/",
      "/commercial-real-estate/building/CA/anaheim/5475-e-la-palma-ave/",
    ],
  },
  {
    id: "oc-downtown-santa-ana",
    name: "Downtown Santa Ana",
    slug: "downtown-santa-ana",
    city: "Santa Ana",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-ana/downtown-santa-ana/",
    centroid_lat: 33.746,
    centroid_lng: -117.867,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["downtown", "civic_business", "professional_services", "local_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-ana/401-s-grand-ave/",
      "/commercial-real-estate/building/CA/santa-ana/1616-e-4th-st/",
    ],
  },
  {
    id: "oc-santa-ana",
    name: "Santa Ana",
    slug: "santa-ana",
    city: "Santa Ana",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-ana/santa-ana/",
    centroid_lat: 33.716,
    centroid_lng: -117.867,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["industrial_flex", "service_commercial", "central_oc", "local_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-ana/1261-e-dyer-rd/",
      "/commercial-real-estate/building/CA/santa-ana/1018-e-chestnut-ave/",
      "/commercial-real-estate/building/CA/santa-ana/2900-s-harbor-blvd/",
    ],
  },
  {
    id: "oc-huntington-beach",
    name: "Huntington Beach",
    slug: "huntington-beach",
    city: "Huntington Beach",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/huntington-beach/huntington-beach/",
    centroid_lat: 33.66,
    centroid_lng: -117.999,
    area_type: "district",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["coastal", "local_services", "medical", "retail"],
    representative_building_paths: [],
  },
  {
    id: "oc-tustin",
    name: "Tustin",
    slug: "tustin",
    city: "Tustin",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/tustin/tustin/",
    centroid_lat: 33.745,
    centroid_lng: -117.826,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["office", "local_services", "medical", "central_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/tustin/17452-irvine-blvd/",
    ],
  },
  {
    id: "oc-orange",
    name: "Orange",
    slug: "orange",
    city: "Orange",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/orange/orange/",
    centroid_lat: 33.787,
    centroid_lng: -117.852,
    area_type: "district",
    approximate_space_types: ["office", "medical", "industrial", "retail"],
    profile: ["office", "medical", "professional_services", "service_commercial"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/orange/333-city-blvd-w/",
      "/commercial-real-estate/building/CA/orange/1100-town-and-country-road/",
      "/commercial-real-estate/building/CA/orange/2100-w-orangewood-ave/",
      "/commercial-real-estate/building/CA/orange/2390-n-american-way/",
      "/commercial-real-estate/building/CA/orange/2442-n-american-way/",
    ],
  },
  {
    id: "oc-fullerton",
    name: "Fullerton",
    slug: "fullerton",
    city: "Fullerton",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/fullerton/fullerton/",
    centroid_lat: 33.872,
    centroid_lng: -117.925,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office", "retail"],
    profile: ["industrial_flex", "education_adjacent", "local_services", "north_oc"],
    representative_building_paths: [],
  },
  {
    id: "oc-buena-park",
    name: "Buena Park",
    slug: "buena-park",
    city: "Buena Park",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/buena-park/buena-park/",
    centroid_lat: 33.867,
    centroid_lng: -117.999,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "retail"],
    profile: ["industrial_flex", "service_commercial", "north_oc", "logistics"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/buena-park/6700-8th-street/",
    ],
  },
  {
    id: "oc-garden-grove",
    name: "Garden Grove",
    slug: "garden-grove",
    city: "Garden Grove",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/garden-grove/garden-grove/",
    centroid_lat: 33.774,
    centroid_lng: -117.941,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "retail"],
    profile: ["service_commercial", "local_services", "retail", "west_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/garden-grove/12361-12465-lewis-st/",
      "/commercial-real-estate/building/CA/garden-grove/9802-katella-ave/",
    ],
  },
  {
    id: "oc-lake-forest",
    name: "Lake Forest",
    slug: "lake-forest",
    city: "Lake Forest",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/lake-forest/lake-forest/",
    centroid_lat: 33.646,
    centroid_lng: -117.687,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["industrial_flex", "business_park", "south_oc", "service_commercial"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/lake-forest/22722-lambert-st/",
    ],
  },
  {
    id: "oc-foothill-ranch",
    name: "Foothill Ranch",
    slug: "foothill-ranch",
    city: "Foothill Ranch",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/foothill-ranch/foothill-ranch/",
    centroid_lat: 33.686,
    centroid_lng: -117.66,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["business_park", "industrial_flex", "south_oc", "corporate_campus"],
    representative_building_paths: [],
  },
  {
    id: "oc-brea",
    name: "Brea",
    slug: "brea",
    city: "Brea",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/brea/brea/",
    centroid_lat: 33.916,
    centroid_lng: -117.9,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "medical", "retail"],
    profile: ["office", "industrial_flex", "medical", "north_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/brea/135-s-state-college-blvd/",
    ],
  },
  {
    id: "oc-laguna-hills",
    name: "Laguna Hills",
    slug: "laguna-hills",
    city: "Laguna Hills",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/laguna-hills/laguna-hills/",
    centroid_lat: 33.594,
    centroid_lng: -117.705,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["medical", "professional_services", "local_services", "south_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/laguna-hills/23001-del-lago-dr/",
      "/commercial-real-estate/building/CA/laguna-hills/23046-avenida-de-la-carlota/",
      "/commercial-real-estate/building/CA/laguna-hills/23512-commerce-center-dr/",
    ],
  },
  {
    id: "oc-mission-viejo",
    name: "Mission Viejo",
    slug: "mission-viejo",
    city: "Mission Viejo",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/mission-viejo/mission-viejo/",
    centroid_lat: 33.6,
    centroid_lng: -117.672,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["medical", "professional_services", "local_services", "south_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/mission-viejo/999-corporate-drive/",
    ],
  },
  {
    id: "oc-san-clemente",
    name: "San Clemente",
    slug: "san-clemente",
    city: "San Clemente",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-clemente/san-clemente/",
    centroid_lat: 33.427,
    centroid_lng: -117.612,
    area_type: "district",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["coastal", "local_services", "medical", "retail"],
    representative_building_paths: [],
  },
];

const inlandEmpireDistrictDefinitions = [
  {
    id: "ie-ontario",
    name: "Ontario",
    slug: "ontario",
    city: "Ontario",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/ontario/ontario/",
    centroid_lat: 34.063,
    centroid_lng: -117.65,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["logistics", "warehouse", "airport_access", "industrial_flex"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/ontario/1477-e-cedar-ave/",
      "/commercial-real-estate/building/CA/ontario/875-w-state-st/",
      "/commercial-real-estate/building/CA/ontario/2970-inland-empire-blvd/",
    ],
  },
  {
    id: "ie-ontario-airport-area",
    name: "Ontario Airport Area",
    slug: "ontario-airport-area",
    city: "Ontario",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/ontario/ontario-airport-area/",
    centroid_lat: 34.065,
    centroid_lng: -117.6,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["airport_access", "logistics", "office", "warehouse"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/ontario/2970-inland-empire-blvd/",
      "/commercial-real-estate/building/CA/ontario/3200-e-guasti-rd/",
      "/commercial-real-estate/building/CA/ontario/3281-e-guasti-rd/",
      "/commercial-real-estate/building/CA/ontario/5505-concours/",
    ],
  },
  {
    id: "ie-rancho-cucamonga",
    name: "Rancho Cucamonga",
    slug: "rancho-cucamonga",
    city: "Rancho Cucamonga",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/rancho-cucamonga/rancho-cucamonga/",
    centroid_lat: 34.106,
    centroid_lng: -117.594,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office", "retail"],
    profile: ["industrial_flex", "office", "logistics", "service_commercial"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/rancho-cucamonga/9805-6th-st/",
    ],
  },
  {
    id: "ie-fontana",
    name: "Fontana",
    slug: "fontana",
    city: "Fontana",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/fontana/fontana/",
    centroid_lat: 34.092,
    centroid_lng: -117.435,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["logistics", "warehouse", "truck_access", "manufacturing"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/fontana/10509-business-dr/",
      "/commercial-real-estate/building/CA/fontana/10840-cherry-ave/",
      "/commercial-real-estate/building/CA/fontana/14019-rose-ave/",
      "/commercial-real-estate/building/CA/fontana/6260-mango-ave/",
    ],
  },
  {
    id: "ie-rialto",
    name: "Rialto",
    slug: "rialto",
    city: "Rialto",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/rialto/rialto/",
    centroid_lat: 34.106,
    centroid_lng: -117.37,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["warehouse", "logistics", "last_mile", "truck_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/rialto/1110-w-base-line-rd/",
    ],
  },
  {
    id: "ie-bloomington-colton",
    name: "Bloomington / Colton",
    slug: "bloomington-colton",
    city: "Colton",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/colton/bloomington-colton/",
    centroid_lat: 34.065,
    centroid_lng: -117.32,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["rail", "freeway_access", "service_commercial", "warehouse"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/colton/1200-1350-e-washington-st/",
    ],
  },
  {
    id: "ie-san-bernardino",
    name: "San Bernardino",
    slug: "san-bernardino",
    city: "San Bernardino",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-bernardino/san-bernardino/",
    centroid_lat: 34.108,
    centroid_lng: -117.289,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["logistics", "rail", "airport_access", "civic_business"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-bernardino/1089-e-mill-st/",
      "/commercial-real-estate/building/CA/san-bernardino/2449-e-5th-st/",
      "/commercial-real-estate/building/CA/san-bernardino/5770-industrial-pkwy/",
      "/commercial-real-estate/building/CA/san-bernardino/614-e-norman-rd/",
      "/commercial-real-estate/building/CA/san-bernardino/634-e-norman-rd/",
    ],
  },
  {
    id: "ie-redlands",
    name: "Redlands",
    slug: "redlands",
    city: "Redlands",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/redlands/redlands/",
    centroid_lat: 34.055,
    centroid_lng: -117.182,
    area_type: "district",
    approximate_space_types: ["office", "medical", "industrial"],
    profile: ["office", "medical", "local_services", "logistics"],
    representative_building_paths: [],
  },
  {
    id: "ie-moreno-valley",
    name: "Moreno Valley",
    slug: "moreno-valley",
    city: "Moreno Valley",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/moreno-valley/moreno-valley/",
    centroid_lat: 33.942,
    centroid_lng: -117.229,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["warehouse", "logistics", "distribution", "last_mile"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/moreno-valley/14200-rebecca-st/",
      "/commercial-real-estate/building/CA/moreno-valley/23880-23962-alessandro-blvd/",
    ],
  },
  {
    id: "ie-riverside",
    name: "Riverside",
    slug: "riverside",
    city: "Riverside",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/riverside/riverside/",
    centroid_lat: 33.981,
    centroid_lng: -117.375,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "flex", "medical"],
    profile: ["civic_business", "office", "industrial_flex", "medical"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/riverside/11801-pierce-st/",
      "/commercial-real-estate/building/CA/riverside/7530-jurupa-ave/",
    ],
  },
  {
    id: "ie-downtown-riverside",
    name: "Downtown Riverside",
    slug: "downtown-riverside",
    city: "Riverside",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/riverside/downtown-riverside/",
    centroid_lat: 33.982,
    centroid_lng: -117.373,
    area_type: "downtown_core",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["downtown", "civic_business", "professional_services", "transit_oriented"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/riverside/11801-pierce-st/",
    ],
  },
  {
    id: "ie-corona",
    name: "Corona",
    slug: "corona",
    city: "Corona",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/corona/corona/",
    centroid_lat: 33.875,
    centroid_lng: -117.566,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["industrial_flex", "office", "western_ie", "orange_county_edge"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/corona/1113-s-main-st/",
      "/commercial-real-estate/building/CA/corona/1141-california-ave/",
      "/commercial-real-estate/building/CA/corona/210-radio-rd/",
    ],
  },
  {
    id: "ie-chino",
    name: "Chino",
    slug: "chino",
    city: "Chino",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/chino/chino/",
    centroid_lat: 34.013,
    centroid_lng: -117.69,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["industrial_flex", "warehouse", "service_commercial", "western_ie"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/chino/5236-faraday-ct/",
    ],
  },
  {
    id: "ie-pomona",
    name: "Pomona",
    slug: "pomona",
    city: "Pomona",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/pomona/pomona/",
    centroid_lat: 34.055,
    centroid_lng: -117.75,
    area_type: "district",
    approximate_space_types: ["industrial", "flex", "office", "retail"],
    profile: ["service_commercial", "industrial_flex", "local_services", "la_county_edge"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/pomona/228-e-monterey-ave/",
    ],
  },
  {
    id: "ie-jurupa-valley",
    name: "Jurupa Valley",
    slug: "jurupa-valley",
    city: "Jurupa Valley",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/jurupa-valley/jurupa-valley/",
    centroid_lat: 34.004,
    centroid_lng: -117.464,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["truck_access", "yard", "warehouse", "service_commercial"],
    representative_building_paths: [],
  },
  {
    id: "ie-eastvale",
    name: "Eastvale",
    slug: "eastvale",
    city: "Eastvale",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/eastvale/eastvale/",
    centroid_lat: 33.963,
    centroid_lng: -117.564,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "retail"],
    profile: ["warehouse", "logistics", "last_mile", "western_riverside"],
    representative_building_paths: [],
  },
  {
    id: "ie-perris",
    name: "Perris",
    slug: "perris",
    city: "Perris",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/perris/perris/",
    centroid_lat: 33.783,
    centroid_lng: -117.229,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["warehouse", "logistics", "distribution", "i215"],
    representative_building_paths: [],
  },
];

const losAngelesDistrictDefinitions = [
  { id: "la-downtown-los-angeles", name: "Downtown Los Angeles", slug: "downtown-los-angeles", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/downtown-los-angeles/", centroid_lat: 34.05, centroid_lng: -118.25, area_type: "downtown_core", approximate_space_types: ["office", "retail", "coworking"], profile: ["downtown", "office", "civic_business", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/1149-s-hill-st/", "/commercial-real-estate/building/CA/los-angeles/1150-s-hope-st/", "/commercial-real-estate/building/CA/los-angeles/1150-s-olive-st/"] },
  { id: "la-financial-district-bunker-hill", name: "Financial District / Bunker Hill", slug: "financial-district-bunker-hill", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/financial-district-bunker-hill/", centroid_lat: 34.052, centroid_lng: -118.253, area_type: "downtown_core", approximate_space_types: ["office", "coworking"], profile: ["office", "client_facing", "professional_services", "downtown"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/1149-s-hill-st/", "/commercial-real-estate/building/CA/los-angeles/1150-s-olive-st/"] },
  { id: "la-arts-district", name: "Arts District", slug: "arts-district", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/arts-district/", centroid_lat: 34.041, centroid_lng: -118.234, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["creative_office", "adaptive_reuse", "industrial_flex", "showroom"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/1100-mateo-st/", "/commercial-real-estate/building/CA/los-angeles/1140-e-11th-st/"] },
  { id: "la-hollywood", name: "Hollywood", slug: "hollywood", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/hollywood/", centroid_lat: 34.101, centroid_lng: -118.329, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["media", "entertainment", "creative_office", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/1161-vine-st/"] },
  { id: "la-miracle-mile", name: "Miracle Mile", slug: "miracle-mile", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/miracle-mile/", centroid_lat: 34.063, centroid_lng: -118.354, area_type: "commercial_corridor", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "medical", "media", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/10880-wilshire-blvd/"] },
  { id: "la-koreatown", name: "Koreatown", slug: "koreatown", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/koreatown/", centroid_lat: 34.058, centroid_lng: -118.301, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["mixed_use", "transit_oriented", "local_services", "hospitality"], representative_building_paths: [] },
  { id: "la-mid-wilshire", name: "Mid-Wilshire", slug: "mid-wilshire", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/mid-wilshire/", centroid_lat: 34.061, centroid_lng: -118.32, area_type: "commercial_corridor", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "medical", "professional_services", "institutional"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/10880-wilshire-blvd/"] },
  { id: "la-culver-city", name: "Culver City", slug: "culver-city", city: "Culver City", state_abbr: "CA", path: "/commercial-real-estate/CA/culver-city/culver-city/", centroid_lat: 34.021, centroid_lng: -118.396, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["media", "creative_office", "technology", "production_adjacent"], representative_building_paths: ["/commercial-real-estate/building/CA/culver-city/10000-washington-blvd/", "/commercial-real-estate/building/CA/culver-city/10100-venice-blvd/", "/commercial-real-estate/building/CA/culver-city/3050-la-cienega-place/", "/commercial-real-estate/building/CA/culver-city/5700-buckingham-pkwy/", "/commercial-real-estate/building/CA/culver-city/5833-perry-dr/"] },
  { id: "la-westwood", name: "Westwood", slug: "westwood", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/westwood/", centroid_lat: 34.063, centroid_lng: -118.445, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["medical", "institutional", "office", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/1010-westwood-blvd/", "/commercial-real-estate/building/CA/los-angeles/10880-wilshire-blvd/", "/commercial-real-estate/building/CA/los-angeles/10914-kinross-ave/"] },
  { id: "la-century-city", name: "Century City", slug: "century-city", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/century-city/", centroid_lat: 34.058, centroid_lng: -118.417, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["office", "client_facing", "professional_services", "entertainment"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/10250-constellation-blvd/"] },
  { id: "la-beverly-hills", name: "Beverly Hills", slug: "beverly-hills", city: "Beverly Hills", state_abbr: "CA", path: "/commercial-real-estate/CA/beverly-hills/beverly-hills/", centroid_lat: 34.073, centroid_lng: -118.4, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "professional_services", "medical", "retail"], representative_building_paths: ["/commercial-real-estate/building/CA/beverly-hills/8383-wilshire-blvd/", "/commercial-real-estate/building/CA/beverly-hills/9465-wilshire-blvd/"] },
  { id: "la-santa-monica", name: "Santa Monica", slug: "santa-monica", city: "Santa Monica", state_abbr: "CA", path: "/commercial-real-estate/CA/santa-monica/santa-monica/", centroid_lat: 34.019, centroid_lng: -118.491, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["technology", "creative_office", "coastal", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/CA/santa-monica/225-santa-monica-blvd/", "/commercial-real-estate/building/CA/santa-monica/233-wilshire-blvd/", "/commercial-real-estate/building/CA/santa-monica/1221-colorado-ave/", "/commercial-real-estate/building/CA/santa-monica/1640-14th-st/", "/commercial-real-estate/building/CA/santa-monica/1901-main-st/"] },
  { id: "la-west-la", name: "West LA", slug: "west-la", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/west-la/", centroid_lat: 34.044, centroid_lng: -118.443, area_type: "commercial_corridor", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "medical", "professional_services", "westside"], representative_building_paths: ["/commercial-real-estate/building/CA/los-angeles/11601-wilshire-blvd/", "/commercial-real-estate/building/CA/los-angeles/11390-w-olympic-blvd/", "/commercial-real-estate/building/CA/los-angeles/11500-w-olympic-blvd/", "/commercial-real-estate/building/CA/los-angeles/10859-venice-blvd/"] },
  { id: "la-playa-vista", name: "Playa Vista", slug: "playa-vista", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/playa-vista/", centroid_lat: 33.976, centroid_lng: -118.417, area_type: "district", approximate_space_types: ["office", "flex"], profile: ["technology", "media", "creative_office", "campus"], representative_building_paths: [] },
  { id: "la-el-segundo", name: "El Segundo", slug: "el-segundo", city: "El Segundo", state_abbr: "CA", path: "/commercial-real-estate/CA/el-segundo/el-segundo/", centroid_lat: 33.919, centroid_lng: -118.416, area_type: "district", approximate_space_types: ["office", "flex", "industrial"], profile: ["aerospace", "airport_access", "rd_flex", "office"], representative_building_paths: ["/commercial-real-estate/building/CA/el-segundo/222-pacific-coast-highway/", "/commercial-real-estate/building/CA/el-segundo/400-continental-blvd/"] },
  { id: "la-burbank", name: "Burbank", slug: "burbank", city: "Burbank", state_abbr: "CA", path: "/commercial-real-estate/CA/burbank/burbank/", centroid_lat: 34.181, centroid_lng: -118.309, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["media", "entertainment", "office", "production_adjacent"], representative_building_paths: ["/commercial-real-estate/building/CA/burbank/4100-w-alameda-ave/", "/commercial-real-estate/building/CA/burbank/4450-w-lakeside-dr/", "/commercial-real-estate/building/CA/burbank/2717-w-olive-ave/", "/commercial-real-estate/building/CA/burbank/2340-n-hollywood-way/", "/commercial-real-estate/building/CA/burbank/303-n-glenoaks-blvd/"] },
  { id: "la-burbank-media-district", name: "Burbank Media District", slug: "burbank-media-district", city: "Burbank", state_abbr: "CA", path: "/commercial-real-estate/CA/burbank/burbank-media-district/", centroid_lat: 34.155, centroid_lng: -118.342, area_type: "district", approximate_space_types: ["office", "commercial"], profile: ["media", "studio", "production_adjacent", "creative_office"], representative_building_paths: ["/commercial-real-estate/building/CA/burbank/4100-w-alameda-ave/", "/commercial-real-estate/building/CA/burbank/4450-w-lakeside-dr/", "/commercial-real-estate/building/CA/burbank/2717-w-olive-ave/"] },
  { id: "la-glendale", name: "Glendale", slug: "glendale", city: "Glendale", state_abbr: "CA", path: "/commercial-real-estate/CA/glendale/glendale/", centroid_lat: 34.147, centroid_lng: -118.255, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "professional_services", "medical", "regional_business"], representative_building_paths: ["/commercial-real-estate/building/CA/glendale/201-n-brand-blvd/", "/commercial-real-estate/building/CA/glendale/450-n-brand-blvd/", "/commercial-real-estate/building/CA/glendale/611-n-brand-blvd/", "/commercial-real-estate/building/CA/glendale/655-n-central-ave/"] },
  { id: "la-pasadena", name: "Pasadena", slug: "pasadena", city: "Pasadena", state_abbr: "CA", path: "/commercial-real-estate/CA/pasadena/pasadena/", centroid_lat: 34.148, centroid_lng: -118.144, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "institutional", "professional_services", "medical"], representative_building_paths: ["/commercial-real-estate/building/CA/pasadena/117-e-colorado-blvd/", "/commercial-real-estate/building/CA/pasadena/155-n-lake-ave/", "/commercial-real-estate/building/CA/pasadena/177-e-colorado-blvd/", "/commercial-real-estate/building/CA/pasadena/680-e-colorado-blvd/"] },
  { id: "la-vernon", name: "Vernon", slug: "vernon", city: "Vernon", state_abbr: "CA", path: "/commercial-real-estate/CA/vernon/vernon/", centroid_lat: 34.003, centroid_lng: -118.211, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial", "warehouse", "manufacturing", "logistics"], representative_building_paths: ["/commercial-real-estate/building/CA/vernon/2357-e-49th-st/", "/commercial-real-estate/building/CA/vernon/2419-e-28th-st/", "/commercial-real-estate/building/CA/vernon/2529-chambers-st/", "/commercial-real-estate/building/CA/vernon/4890-s-alameda-st/", "/commercial-real-estate/building/CA/vernon/5300-s-santa-fe-ave/"] },
  { id: "la-commerce", name: "Commerce", slug: "commerce", city: "Commerce", state_abbr: "CA", path: "/commercial-real-estate/CA/commerce/commerce/", centroid_lat: 34.0, centroid_lng: -118.16, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "logistics", "freeway_access"], representative_building_paths: ["/commercial-real-estate/building/CA/commerce/2008-camfield-ave/", "/commercial-real-estate/building/CA/commerce/5800-s-eastern-ave/"] },
  { id: "la-city-of-industry", name: "City of Industry", slug: "city-of-industry", city: "City of Industry", state_abbr: "CA", path: "/commercial-real-estate/CA/city-of-industry/city-of-industry/", centroid_lat: 34.02, centroid_lng: -117.959, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "logistics", "manufacturing", "distribution"], representative_building_paths: ["/commercial-real-estate/building/CA/city-of-industry/1245-s-johnson-dr/"] },
  { id: "la-santa-fe-springs", name: "Santa Fe Springs", slug: "santa-fe-springs", city: "Santa Fe Springs", state_abbr: "CA", path: "/commercial-real-estate/CA/santa-fe-springs/santa-fe-springs/", centroid_lat: 33.947, centroid_lng: -118.084, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial", "warehouse", "manufacturing", "service_commercial"], representative_building_paths: [] },
  { id: "la-downey", name: "Downey", slug: "downey", city: "Downey", state_abbr: "CA", path: "/commercial-real-estate/CA/downey/downey/", centroid_lat: 33.94, centroid_lng: -118.133, area_type: "district", approximate_space_types: ["office", "medical", "industrial", "retail"], profile: ["medical", "local_services", "service_commercial", "industrial_flex"], representative_building_paths: [] },
  { id: "la-compton", name: "Compton", slug: "compton", city: "Compton", state_abbr: "CA", path: "/commercial-real-estate/CA/compton/compton/", centroid_lat: 33.895, centroid_lng: -118.22, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "logistics", "manufacturing", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/CA/compton/1165-w-walnut-st/", "/commercial-real-estate/building/CA/compton/19009-s-alameda-st/", "/commercial-real-estate/building/CA/compton/3019-e-maria-st/", "/commercial-real-estate/building/CA/compton/350-w-manville-st/"] },
  { id: "la-carson", name: "Carson", slug: "carson", city: "Carson", state_abbr: "CA", path: "/commercial-real-estate/CA/carson/carson/", centroid_lat: 33.832, centroid_lng: -118.264, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["port_adjacent", "warehouse", "logistics", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/CA/carson/1211-e-artesia-blvd/", "/commercial-real-estate/building/CA/carson/20620-leapwood-ave/", "/commercial-real-estate/building/CA/carson/860-sandhill-ave/"] },
  { id: "la-torrance", name: "Torrance", slug: "torrance", city: "Torrance", state_abbr: "CA", path: "/commercial-real-estate/CA/torrance/torrance/", centroid_lat: 33.835, centroid_lng: -118.34, area_type: "district", approximate_space_types: ["office", "industrial", "flex", "medical"], profile: ["aerospace", "industrial_flex", "office", "advanced_manufacturing"], representative_building_paths: ["/commercial-real-estate/building/CA/torrance/21515-hawthorne-blvd/", "/commercial-real-estate/building/CA/torrance/3730-skypark-dr/", "/commercial-real-estate/building/CA/torrance/350-crenshaw-blvd/", "/commercial-real-estate/building/CA/torrance/1597-sepulveda-blvd/"] },
  { id: "la-long-beach", name: "Long Beach", slug: "long-beach", city: "Long Beach", state_abbr: "CA", path: "/commercial-real-estate/CA/long-beach/long-beach/", centroid_lat: 33.77, centroid_lng: -118.193, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["port", "logistics", "office", "waterfront"], representative_building_paths: ["/commercial-real-estate/building/CA/long-beach/100-w-broadway/", "/commercial-real-estate/building/CA/long-beach/111-w-ocean-blvd/", "/commercial-real-estate/building/CA/long-beach/3221-e-59th-st/", "/commercial-real-estate/building/CA/long-beach/3253-e-south-st/"] },
  { id: "la-south-bay-lax-industrial", name: "South Bay / LAX Industrial", slug: "south-bay-lax-industrial", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/south-bay-lax-industrial/", centroid_lat: 33.94, centroid_lng: -118.38, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "industrial_flex", "aerospace", "logistics"], representative_building_paths: ["/commercial-real-estate/building/CA/el-segundo/222-pacific-coast-highway/", "/commercial-real-estate/building/CA/el-segundo/400-continental-blvd/"] },
  { id: "la-warner-center", name: "Warner Center", slug: "warner-center", city: "Los Angeles", state_abbr: "CA", path: "/commercial-real-estate/CA/los-angeles/warner-center/", centroid_lat: 34.18, centroid_lng: -118.603, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "corporate", "medical", "suburban_office"], representative_building_paths: ["/commercial-real-estate/building/CA/woodland-hills/21900-burbank-blvd/", "/commercial-real-estate/building/CA/woodland-hills/6303-owensmouth-ave/", "/commercial-real-estate/building/CA/woodland-hills/6320-canoga-ave/"] },
  { id: "la-north-hollywood", name: "North Hollywood", slug: "north-hollywood", city: "North Hollywood", state_abbr: "CA", path: "/commercial-real-estate/CA/north-hollywood/north-hollywood/", centroid_lat: 34.172, centroid_lng: -118.379, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["media", "transit_oriented", "creative_office", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/CA/north-hollywood/4605-lankershim-blvd/", "/commercial-real-estate/building/CA/north-hollywood/5161-lankershim-blvd/", "/commercial-real-estate/building/CA/north-hollywood/5250-lankershim-blvd/"] },
  { id: "la-studio-city", name: "Studio City", slug: "studio-city", city: "Studio City", state_abbr: "CA", path: "/commercial-real-estate/CA/studio-city/studio-city/", centroid_lat: 34.143, centroid_lng: -118.395, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["media", "professional_services", "local_services", "wellness"], representative_building_paths: ["/commercial-real-estate/building/CA/studio-city/4370-tujunga-ave/"] },
  { id: "la-van-nuys", name: "Van Nuys", slug: "van-nuys", city: "Van Nuys", state_abbr: "CA", path: "/commercial-real-estate/CA/van-nuys/van-nuys/", centroid_lat: 34.19, centroid_lng: -118.449, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "service_commercial", "airport_access", "local_services"], representative_building_paths: ["/commercial-real-estate/building/CA/van-nuys/16501-sherman-way/"] },
  { id: "la-sherman-oaks", name: "Sherman Oaks", slug: "sherman-oaks", city: "Sherman Oaks", state_abbr: "CA", path: "/commercial-real-estate/CA/sherman-oaks/sherman-oaks/", centroid_lat: 34.151, centroid_lng: -118.449, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["professional_services", "medical", "local_services", "retail"], representative_building_paths: ["/commercial-real-estate/building/CA/sherman-oaks/13400-riverside-dr/", "/commercial-real-estate/building/CA/sherman-oaks/15233-ventura-blvd/"] },
];

const seattleMetroDistrictDefinitions = [
  { id: "sea-downtown-seattle", name: "Downtown Seattle", slug: "downtown-seattle", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/downtown-seattle/", centroid_lat: 47.608, centroid_lng: -122.334, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "transit_oriented", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/WA/seattle/701-fifth-avenue/", "/commercial-real-estate/building/WA/seattle/1201-3rd-ave/", "/commercial-real-estate/building/WA/seattle/1420-fifth-avenue/", "/commercial-real-estate/building/WA/seattle/1600-7th-ave/"] },
  { id: "sea-south-lake-union", name: "South Lake Union", slug: "south-lake-union", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/south-lake-union/", centroid_lat: 47.623, centroid_lng: -122.338, area_type: "district", approximate_space_types: ["office", "flex", "coworking"], profile: ["technology", "life_science", "research", "modern_office"], representative_building_paths: ["/commercial-real-estate/building/WA/seattle/600-stewart-st/", "/commercial-real-estate/building/WA/seattle/1600-7th-ave/"] },
  { id: "sea-belltown", name: "Belltown", slug: "belltown", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/belltown/", centroid_lat: 47.615, centroid_lng: -122.345, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["mixed_use", "creative_office", "hospitality", "downtown_edge"], representative_building_paths: ["/commercial-real-estate/building/WA/seattle/2815-elliott-ave/", "/commercial-real-estate/building/WA/seattle/1601-2nd-ave/"] },
  { id: "sea-pioneer-square", name: "Pioneer Square", slug: "pioneer-square", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/pioneer-square/", centroid_lat: 47.601, centroid_lng: -122.333, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["historic", "adaptive_reuse", "creative_office", "downtown_edge"], representative_building_paths: ["/commercial-real-estate/building/WA/seattle/506-second-avenue/", "/commercial-real-estate/building/WA/seattle/450-alaskan-way-s/", "/commercial-real-estate/building/WA/seattle/255-s-king-st/"] },
  { id: "sea-fremont", name: "Fremont", slug: "fremont", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/fremont/", centroid_lat: 47.651, centroid_lng: -122.35, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["technology", "creative_office", "local_services", "neighborhood_commercial"], representative_building_paths: [] },
  { id: "sea-ballard", name: "Ballard", slug: "ballard", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/ballard/", centroid_lat: 47.668, centroid_lng: -122.386, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["maritime", "maker", "creative_office", "local_services"], representative_building_paths: ["/commercial-real-estate/building/WA/seattle/1448-nw-market-st/", "/commercial-real-estate/building/WA/seattle/1455-nw-leary-way/"] },
  { id: "sea-university-district", name: "University District", slug: "university-district", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/university-district/", centroid_lat: 47.661, centroid_lng: -122.313, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["university_adjacent", "research_support", "medical", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/WA/seattle/10202-5th-ave-ne-2nd-floor/"] },
  { id: "sea-sodo", name: "SoDo", slug: "sodo", city: "Seattle", state_abbr: "WA", path: "/commercial-real-estate/WA/seattle/sodo/", centroid_lat: 47.58, centroid_lng: -122.333, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "warehouse", "showroom", "port_proximate"], representative_building_paths: ["/commercial-real-estate/building/WA/seattle/255-s-king-st/", "/commercial-real-estate/building/WA/seattle/555-andover-park-w/"] },
  { id: "sea-bellevue", name: "Bellevue", slug: "bellevue", city: "Bellevue", state_abbr: "WA", path: "/commercial-real-estate/WA/bellevue/bellevue/", centroid_lat: 47.61, centroid_lng: -122.201, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["eastside", "technology", "corporate", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/WA/bellevue/skyline-tower-10900-n-e-4th-street/", "/commercial-real-estate/building/WA/bellevue/601-108th-ave-ne/", "/commercial-real-estate/building/WA/bellevue/11900-ne-1st-st/", "/commercial-real-estate/building/WA/bellevue/1400-112th-ave-se/", "/commercial-real-estate/building/WA/bellevue/3120-139th-ave-se/"] },
  { id: "sea-downtown-bellevue", name: "Downtown Bellevue", slug: "downtown-bellevue", city: "Bellevue", state_abbr: "WA", path: "/commercial-real-estate/WA/bellevue/downtown-bellevue/", centroid_lat: 47.612, centroid_lng: -122.203, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["eastside", "office", "client_facing", "corporate"], representative_building_paths: ["/commercial-real-estate/building/WA/bellevue/skyline-tower-10900-n-e-4th-street/", "/commercial-real-estate/building/WA/bellevue/601-108th-ave-ne/", "/commercial-real-estate/building/WA/bellevue/11900-ne-1st-st/"] },
  { id: "sea-redmond", name: "Redmond", slug: "redmond", city: "Redmond", state_abbr: "WA", path: "/commercial-real-estate/WA/redmond/redmond/", centroid_lat: 47.674, centroid_lng: -122.121, area_type: "district", approximate_space_types: ["office", "flex"], profile: ["technology", "campus", "rd_flex", "eastside"], representative_building_paths: ["/commercial-real-estate/building/WA/redmond/2525-152nd-ave-ne/"] },
  { id: "sea-kirkland", name: "Kirkland", slug: "kirkland", city: "Kirkland", state_abbr: "WA", path: "/commercial-real-estate/WA/kirkland/kirkland/", centroid_lat: 47.676, centroid_lng: -122.206, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["eastside", "professional_services", "technology", "waterfront"], representative_building_paths: ["/commercial-real-estate/building/WA/kirkland/5400-carillon-point-building-5000/", "/commercial-real-estate/building/WA/kirkland/11335-ne-122nd-way/"] },
  { id: "sea-issaquah", name: "Issaquah", slug: "issaquah", city: "Issaquah", state_abbr: "WA", path: "/commercial-real-estate/WA/issaquah/issaquah/", centroid_lat: 47.53, centroid_lng: -122.034, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["eastside", "suburban_office", "medical", "local_services"], representative_building_paths: [] },
  { id: "sea-bothell", name: "Bothell", slug: "bothell", city: "Bothell", state_abbr: "WA", path: "/commercial-real-estate/WA/bothell/bothell/", centroid_lat: 47.762, centroid_lng: -122.205, area_type: "district", approximate_space_types: ["office", "flex"], profile: ["life_science", "rd_flex", "biotech", "suburban_office"], representative_building_paths: ["/commercial-real-estate/building/WA/bothell/22722-29th-dr-se/"] },
  { id: "sea-kent-valley", name: "Kent Valley", slug: "kent-valley", city: "Kent", state_abbr: "WA", path: "/commercial-real-estate/WA/kent/kent-valley/", centroid_lat: 47.385, centroid_lng: -122.241, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "logistics", "manufacturing"], representative_building_paths: ["/commercial-real-estate/building/WA/kent/7818-s-212th-st/"] },
  { id: "sea-tukwila", name: "Tukwila", slug: "tukwila", city: "Tukwila", state_abbr: "WA", path: "/commercial-real-estate/WA/tukwila/tukwila/", centroid_lat: 47.475, centroid_lng: -122.272, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "retail"], profile: ["airport_access", "service_commercial", "warehouse", "regional_access"], representative_building_paths: [] },
  { id: "sea-auburn", name: "Auburn", slug: "auburn", city: "Auburn", state_abbr: "WA", path: "/commercial-real-estate/WA/auburn/auburn/", centroid_lat: 47.307, centroid_lng: -122.229, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "manufacturing", "service_commercial", "south_valley"], representative_building_paths: [] },
  { id: "sea-renton", name: "Renton", slug: "renton", city: "Renton", state_abbr: "WA", path: "/commercial-real-estate/WA/renton/renton/", centroid_lat: 47.482, centroid_lng: -122.217, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["aerospace", "service_commercial", "office", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/WA/renton/707-s-grady-way/"] },
  { id: "sea-everett", name: "Everett", slug: "everett", city: "Everett", state_abbr: "WA", path: "/commercial-real-estate/WA/everett/everett/", centroid_lat: 47.979, centroid_lng: -122.202, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["north_sound", "aerospace", "regional_office", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/WA/everett/11400-airport-rd-suite-200/"] },
  { id: "sea-everett-industrial", name: "Everett Industrial", slug: "everett-industrial", city: "Everett", state_abbr: "WA", path: "/commercial-real-estate/WA/everett/everett-industrial/", centroid_lat: 47.925, centroid_lng: -122.267, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["aerospace", "manufacturing", "industrial_flex", "north_sound"], representative_building_paths: ["/commercial-real-estate/building/WA/everett/11400-airport-rd-suite-200/"] },
  { id: "sea-tacoma", name: "Tacoma", slug: "tacoma", city: "Tacoma", state_abbr: "WA", path: "/commercial-real-estate/WA/tacoma/tacoma/", centroid_lat: 47.252, centroid_lng: -122.444, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["south_sound", "port", "office", "logistics"], representative_building_paths: ["/commercial-real-estate/building/WA/tacoma/1201-pacific-ave/"] },
  { id: "sea-tacoma-port-industrial", name: "Tacoma Port / Industrial", slug: "tacoma-port-industrial", city: "Tacoma", state_abbr: "WA", path: "/commercial-real-estate/WA/tacoma/tacoma-port-industrial/", centroid_lat: 47.266, centroid_lng: -122.405, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["port", "warehouse", "distribution", "heavy_industrial"], representative_building_paths: [] },
  { id: "sea-fife", name: "Fife", slug: "fife", city: "Fife", state_abbr: "WA", path: "/commercial-real-estate/WA/fife/fife/", centroid_lat: 47.239, centroid_lng: -122.358, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["logistics", "warehouse", "service_commercial", "tacoma_adjacent"], representative_building_paths: [] },
  { id: "sea-lynnwood", name: "Lynnwood", slug: "lynnwood", city: "Lynnwood", state_abbr: "WA", path: "/commercial-real-estate/WA/lynnwood/lynnwood/", centroid_lat: 47.821, centroid_lng: -122.315, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["north_suburban", "medical", "local_services", "retail"], representative_building_paths: [] },
];

const phoenixMetroDistrictDefinitions = [
  { id: "phx-downtown-phoenix", name: "Downtown Phoenix", slug: "downtown-phoenix", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/downtown-phoenix/", centroid_lat: 33.448, centroid_lng: -112.073, area_type: "downtown_core", approximate_space_types: ["office", "medical", "retail"], profile: ["civic", "office", "healthcare_support", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/1021-e-washington-st/", "/commercial-real-estate/building/AZ/phoenix/1027-e-washington-st/", "/commercial-real-estate/building/AZ/phoenix/106-e-buchanan-st/"] },
  { id: "phx-midtown-phoenix", name: "Midtown Phoenix", slug: "midtown-phoenix", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/midtown-phoenix/", centroid_lat: 33.481, centroid_lng: -112.074, area_type: "corridor", approximate_space_types: ["office", "medical", "retail"], profile: ["medical_office", "professional_services", "light_rail", "central_phoenix"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/20-e-thomas-rd/", "/commercial-real-estate/building/AZ/phoenix/2111-e-highland-ave/", "/commercial-real-estate/building/AZ/phoenix/2141-e-highland-ave/"] },
  { id: "phx-camelback-corridor", name: "Camelback Corridor", slug: "camelback-corridor", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/camelback-corridor/", centroid_lat: 33.509, centroid_lng: -112.041, area_type: "corridor", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "office", "finance", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/1212-w-camelback-rd/", "/commercial-real-estate/building/AZ/phoenix/1951-w-camelback-rd/", "/commercial-real-estate/building/AZ/phoenix/2111-e-highland-ave/"] },
  { id: "phx-biltmore-arcadia", name: "Biltmore / Arcadia", slug: "biltmore-arcadia", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/biltmore-arcadia/", centroid_lat: 33.51, centroid_lng: -111.988, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "medical", "wellness", "local_services"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/1048-n-44th-st/", "/commercial-real-estate/building/AZ/phoenix/2048-n-44th-st/", "/commercial-real-estate/building/AZ/phoenix/11211-n-tatum-blvd/", "/commercial-real-estate/building/AZ/phoenix/11811-n-tatum-blvd/"] },
  { id: "phx-scottsdale", name: "Scottsdale", slug: "scottsdale", city: "Scottsdale", state_abbr: "AZ", path: "/commercial-real-estate/AZ/scottsdale/scottsdale/", centroid_lat: 33.494, centroid_lng: -111.926, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["regional_office", "client_facing", "hospitality", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/AZ/scottsdale/6991-e-camelback-rd/", "/commercial-real-estate/building/AZ/scottsdale/7150-e-camelback-rd/", "/commercial-real-estate/building/AZ/scottsdale/7047-e-greenway-pkwy/", "/commercial-real-estate/building/AZ/scottsdale/15169-n-scottsdale-rd/"] },
  { id: "phx-old-town-scottsdale", name: "Old Town Scottsdale", slug: "old-town-scottsdale", city: "Scottsdale", state_abbr: "AZ", path: "/commercial-real-estate/AZ/scottsdale/old-town-scottsdale/", centroid_lat: 33.493, centroid_lng: -111.928, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["mixed_use", "hospitality", "boutique_office", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/AZ/scottsdale/4343-n-scottsdale-rd/", "/commercial-real-estate/building/AZ/scottsdale/6991-e-camelback-rd/", "/commercial-real-estate/building/AZ/scottsdale/7150-e-camelback-rd/", "/commercial-real-estate/building/AZ/scottsdale/7272-e-indian-school-rd/"] },
  { id: "phx-north-scottsdale", name: "North Scottsdale", slug: "north-scottsdale", city: "Scottsdale", state_abbr: "AZ", path: "/commercial-real-estate/AZ/scottsdale/north-scottsdale/", centroid_lat: 33.63, centroid_lng: -111.922, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "medical", "professional_services", "customer_facing"], representative_building_paths: ["/commercial-real-estate/building/AZ/scottsdale/14080-n-northsight-blvd/", "/commercial-real-estate/building/AZ/scottsdale/15169-n-scottsdale-rd/", "/commercial-real-estate/building/AZ/scottsdale/15333-n-pima-rd/", "/commercial-real-estate/building/AZ/scottsdale/16000-n-80th-st/"] },
  { id: "phx-tempe", name: "Tempe", slug: "tempe", city: "Tempe", state_abbr: "AZ", path: "/commercial-real-estate/AZ/tempe/tempe/", centroid_lat: 33.425, centroid_lng: -111.94, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["technology", "university_adjacent", "startup", "regional_office"], representative_building_paths: ["/commercial-real-estate/building/AZ/tempe/80-e-rio-salado-pkwy/", "/commercial-real-estate/building/AZ/tempe/1605-w-university-dr/", "/commercial-real-estate/building/AZ/tempe/1705-w-university-dr/", "/commercial-real-estate/building/AZ/tempe/410-n-scottsdale-rd/"] },
  { id: "phx-mill-avenue-downtown-tempe", name: "Mill Avenue / Downtown Tempe", slug: "mill-avenue-downtown-tempe", city: "Tempe", state_abbr: "AZ", path: "/commercial-real-estate/AZ/tempe/mill-avenue-downtown-tempe/", centroid_lat: 33.425, centroid_lng: -111.94, area_type: "downtown_core", approximate_space_types: ["office", "retail", "coworking"], profile: ["downtown", "university_adjacent", "walkable", "startup"], representative_building_paths: ["/commercial-real-estate/building/AZ/tempe/80-e-rio-salado-pkwy/", "/commercial-real-estate/building/AZ/tempe/64-e-broadway-rd/", "/commercial-real-estate/building/AZ/tempe/1605-w-university-dr/", "/commercial-real-estate/building/AZ/tempe/1705-w-university-dr/"] },
  { id: "phx-mesa", name: "Mesa", slug: "mesa", city: "Mesa", state_abbr: "AZ", path: "/commercial-real-estate/AZ/mesa/mesa/", centroid_lat: 33.415, centroid_lng: -111.832, area_type: "district", approximate_space_types: ["office", "industrial", "medical"], profile: ["east_valley", "office", "industrial_flex", "medical"], representative_building_paths: ["/commercial-real-estate/building/AZ/mesa/104-e-1st-ave/", "/commercial-real-estate/building/AZ/mesa/1833-w-main-st/", "/commercial-real-estate/building/AZ/mesa/2266-s-dobson-rd/", "/commercial-real-estate/building/AZ/mesa/8200-e-germann-rd/"] },
  { id: "phx-chandler", name: "Chandler", slug: "chandler", city: "Chandler", state_abbr: "AZ", path: "/commercial-real-estate/AZ/chandler/chandler/", centroid_lat: 33.306, centroid_lng: -111.842, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["semiconductor", "advanced_manufacturing", "technology", "rd_flex"], representative_building_paths: ["/commercial-real-estate/building/AZ/chandler/2425-s-stearman-dr/", "/commercial-real-estate/building/AZ/chandler/2701-insight-way/", "/commercial-real-estate/building/AZ/chandler/3100-west-ray-road/", "/commercial-real-estate/building/AZ/chandler/411-n-roosevelt-ave/"] },
  { id: "phx-gilbert", name: "Gilbert", slug: "gilbert", city: "Gilbert", state_abbr: "AZ", path: "/commercial-real-estate/AZ/gilbert/gilbert/", centroid_lat: 33.352, centroid_lng: -111.789, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "medical", "local_services", "retail_support"], representative_building_paths: [] },
  { id: "phx-glendale", name: "Glendale", slug: "glendale", city: "Glendale", state_abbr: "AZ", path: "/commercial-real-estate/AZ/glendale/glendale/", centroid_lat: 33.538, centroid_lng: -112.186, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["west_valley", "local_services", "medical", "retail_support"], representative_building_paths: [] },
  { id: "phx-peoria", name: "Peoria", slug: "peoria", city: "Peoria", state_abbr: "AZ", path: "/commercial-real-estate/AZ/peoria/peoria/", centroid_lat: 33.581, centroid_lng: -112.237, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["northwest_valley", "medical", "local_services", "retail_support"], representative_building_paths: [] },
  { id: "phx-airport-sky-harbor", name: "Phoenix Airport / Sky Harbor Area", slug: "phoenix-airport-sky-harbor-area", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/phoenix-airport-sky-harbor-area/", centroid_lat: 33.435, centroid_lng: -112.011, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "service_industrial", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/1021-e-washington-st/", "/commercial-real-estate/building/AZ/phoenix/1027-e-washington-st/", "/commercial-real-estate/building/AZ/phoenix/1048-n-44th-st/", "/commercial-real-estate/building/AZ/phoenix/2130-s-7th-st/"] },
  { id: "phx-deer-valley", name: "Deer Valley", slug: "deer-valley", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/deer-valley/", centroid_lat: 33.688, centroid_lng: -112.083, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["advanced_manufacturing", "aerospace", "office_flex", "north_phoenix"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/20333-n-19th-avenue/", "/commercial-real-estate/building/AZ/phoenix/2205-w-whispering-wind-dr/", "/commercial-real-estate/building/AZ/phoenix/10851-n-black-canyon-fwy/", "/commercial-real-estate/building/AZ/phoenix/10000-n-31st-ave/"] },
  { id: "phx-west-phoenix-industrial", name: "West Phoenix Industrial", slug: "west-phoenix-industrial", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/west-phoenix-industrial/", centroid_lat: 33.47, centroid_lng: -112.18, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "last_mile", "west_valley"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/1002-s-56th-ave/", "/commercial-real-estate/building/AZ/phoenix/2135-s-11th-ave/", "/commercial-real-estate/building/AZ/phoenix/2145-s-11th-ave/"] },
  { id: "phx-southwest-phoenix-industrial", name: "Southwest Phoenix Industrial", slug: "southwest-phoenix-industrial", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/southwest-phoenix-industrial/", centroid_lat: 33.38, centroid_lng: -112.12, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "airport_access", "service_industrial"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/1002-s-56th-ave/", "/commercial-real-estate/building/AZ/phoenix/2130-s-7th-st/", "/commercial-real-estate/building/AZ/phoenix/2135-s-11th-ave/", "/commercial-real-estate/building/AZ/phoenix/2145-s-11th-ave/"] },
  { id: "phx-tolleson", name: "Tolleson", slug: "tolleson", city: "Tolleson", state_abbr: "AZ", path: "/commercial-real-estate/AZ/tolleson/tolleson/", centroid_lat: 33.45, centroid_lng: -112.259, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "cold_storage", "food_logistics"], representative_building_paths: [] },
  { id: "phx-goodyear", name: "Goodyear", slug: "goodyear", city: "Goodyear", state_abbr: "AZ", path: "/commercial-real-estate/AZ/goodyear/goodyear/", centroid_lat: 33.435, centroid_lng: -112.358, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["warehouse", "distribution", "fulfillment", "west_valley"], representative_building_paths: [] },
  { id: "phx-avondale", name: "Avondale", slug: "avondale", city: "Avondale", state_abbr: "AZ", path: "/commercial-real-estate/AZ/avondale/avondale/", centroid_lat: 33.435, centroid_lng: -112.349, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["west_valley", "local_services", "service_industrial", "retail_support"], representative_building_paths: [] },
  { id: "phx-mesa-gateway-east-mesa", name: "Mesa Gateway / East Mesa", slug: "mesa-gateway-east-mesa", city: "Mesa", state_abbr: "AZ", path: "/commercial-real-estate/AZ/mesa/mesa-gateway-east-mesa/", centroid_lat: 33.307, centroid_lng: -111.658, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["airport_access", "aerospace", "advanced_manufacturing", "logistics"], representative_building_paths: ["/commercial-real-estate/building/AZ/mesa/8200-e-germann-rd/", "/commercial-real-estate/building/AZ/mesa/1234-s-power-rd/", "/commercial-real-estate/building/AZ/mesa/3707-e-southern-ave/"] },
  { id: "phx-chandler-airpark", name: "Chandler Airpark", slug: "chandler-airpark", city: "Chandler", state_abbr: "AZ", path: "/commercial-real-estate/AZ/chandler/chandler-airpark/", centroid_lat: 33.27, centroid_lng: -111.81, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["aviation_adjacent", "rd_flex", "advanced_manufacturing", "engineering"], representative_building_paths: ["/commercial-real-estate/building/AZ/chandler/2425-s-stearman-dr/", "/commercial-real-estate/building/AZ/chandler/2701-insight-way/", "/commercial-real-estate/building/AZ/chandler/411-n-roosevelt-ave/"] },
  { id: "phx-mesa-falcon-field", name: "Mesa / Falcon Field", slug: "mesa-falcon-field", city: "Mesa", state_abbr: "AZ", path: "/commercial-real-estate/AZ/mesa/mesa-falcon-field/", centroid_lat: 33.46, centroid_lng: -111.728, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["aerospace", "aviation_adjacent", "rd_flex", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/AZ/mesa/1234-s-power-rd/", "/commercial-real-estate/building/AZ/mesa/8200-e-germann-rd/", "/commercial-real-estate/building/AZ/mesa/3707-e-southern-ave/"] },
  { id: "phx-north-phoenix-tsmc-corridor", name: "North Phoenix / TSMC Corridor", slug: "north-phoenix-tsmc-corridor", city: "Phoenix", state_abbr: "AZ", path: "/commercial-real-estate/AZ/phoenix/north-phoenix-tsmc-corridor/", centroid_lat: 33.85, centroid_lng: -112.12, area_type: "corridor", approximate_space_types: ["industrial", "flex"], profile: ["semiconductor", "advanced_manufacturing", "supplier", "north_phoenix"], representative_building_paths: ["/commercial-real-estate/building/AZ/phoenix/20333-n-19th-avenue/", "/commercial-real-estate/building/AZ/phoenix/2205-w-whispering-wind-dr/", "/commercial-real-estate/building/AZ/phoenix/20830-n-tatum-blvd/", "/commercial-real-estate/building/AZ/phoenix/20860-n-tatum-blvd/"] },
];

const denverMetroDistrictDefinitions = [
  { id: "den-downtown-denver", name: "Downtown Denver", slug: "downtown-denver", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/downtown-denver/", centroid_lat: 39.747, centroid_lng: -104.995, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "civic", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/1200-17th-st/", "/commercial-real-estate/building/CO/denver/999-18th-st/", "/commercial-real-estate/building/CO/denver/1600-broadway/", "/commercial-real-estate/building/CO/denver/1700-lincoln-st/"] },
  { id: "den-lodo", name: "LoDo", slug: "lodo", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/lodo/", centroid_lat: 39.752, centroid_lng: -104.999, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["historic", "mixed_use", "hospitality", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/1400-sixteenth-street/", "/commercial-real-estate/building/CO/denver/1550-wewatta-st/", "/commercial-real-estate/building/CO/denver/2301-blake-st/", "/commercial-real-estate/building/CO/denver/1615-platte-st/"] },
  { id: "den-rino", name: "RiNo", slug: "rino", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/rino/", centroid_lat: 39.765, centroid_lng: -104.984, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["creative_office", "adaptive_reuse", "production", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/2301-blake-st/", "/commercial-real-estate/building/CO/denver/3870-elm-st/", "/commercial-real-estate/building/CO/denver/5005-washington-st/", "/commercial-real-estate/building/CO/denver/5050-fox-st/"] },
  { id: "den-cherry-creek", name: "Cherry Creek", slug: "cherry-creek", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/cherry-creek/", centroid_lat: 39.72, centroid_lng: -104.95, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "professional_services", "retail_adjacent", "medical"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/100-fillmore-place/", "/commercial-real-estate/building/CO/denver/205-detroit-st/", "/commercial-real-estate/building/CO/denver/250-fillmore-st/", "/commercial-real-estate/building/CO/denver/720-s-colorado-blvd/"] },
  { id: "den-capitol-hill-civic-center", name: "Capitol Hill / Civic Center", slug: "capitol-hill-civic-center", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/capitol-hill-civic-center/", centroid_lat: 39.739, centroid_lng: -104.985, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["civic", "medical_office", "nonprofit", "local_services"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/1600-broadway/", "/commercial-real-estate/building/CO/denver/1700-lincoln-st/", "/commercial-real-estate/building/CO/denver/543-santa-fe-dr/"] },
  { id: "den-five-points", name: "Five Points", slug: "five-points", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/five-points/", centroid_lat: 39.756, centroid_lng: -104.977, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["mixed_use", "arts_adjacent", "local_services", "creative_office"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/2301-blake-st/", "/commercial-real-estate/building/CO/denver/3870-elm-st/"] },
  { id: "den-lower-highlands", name: "Lower Highlands", slug: "lower-highlands", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/lower-highlands/", centroid_lat: 39.759, centroid_lng: -105.011, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["neighborhood_commercial", "professional_services", "creative_office", "wellness"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/1615-platte-st/", "/commercial-real-estate/building/CO/denver/1400-sixteenth-street/"] },
  { id: "den-denver-tech-center", name: "Denver Tech Center", slug: "denver-tech-center", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/denver-tech-center/", centroid_lat: 39.623, centroid_lng: -104.899, area_type: "district", approximate_space_types: ["office", "coworking", "medical"], profile: ["suburban_office", "technology", "corporate", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/4600-s-syracuse-st/", "/commercial-real-estate/building/CO/denver/4643-s-ulster-st/", "/commercial-real-estate/building/CO/denver/7900-e-union-ave/", "/commercial-real-estate/building/CO/greenwood-village/5445-dtc-pkwy/"] },
  { id: "den-greenwood-village", name: "Greenwood Village", slug: "greenwood-village", city: "Greenwood Village", state_abbr: "CO", path: "/commercial-real-estate/CO/greenwood-village/greenwood-village/", centroid_lat: 39.617, centroid_lng: -104.95, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["southeast_office", "professional_services", "finance", "medical"], representative_building_paths: ["/commercial-real-estate/building/CO/greenwood-village/5299-dtc-blvd/", "/commercial-real-estate/building/CO/greenwood-village/5445-dtc-pkwy/", "/commercial-real-estate/building/CO/greenwood-village/5675-dtc-blvd/", "/commercial-real-estate/building/CO/greenwood-village/6312-s-fiddlers-green-circle/"] },
  { id: "den-inverness", name: "Inverness", slug: "inverness", city: "Englewood", state_abbr: "CO", path: "/commercial-real-estate/CO/englewood/inverness/", centroid_lat: 39.57, centroid_lng: -104.865, area_type: "district", approximate_space_types: ["office", "coworking", "medical"], profile: ["business_park", "corporate", "technology", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/CO/englewood/109-inverness-dr-e/", "/commercial-real-estate/building/CO/englewood/313-inverness-way-s/", "/commercial-real-estate/building/CO/englewood/365-inverness-pkwy/", "/commercial-real-estate/building/CO/englewood/400-inverness-pkwy/"] },
  { id: "den-centennial", name: "Centennial", slug: "centennial", city: "Centennial", state_abbr: "CO", path: "/commercial-real-estate/CO/centennial/centennial/", centroid_lat: 39.58, centroid_lng: -104.877, area_type: "district", approximate_space_types: ["office", "flex", "medical"], profile: ["suburban_office", "office_flex", "medical", "local_services"], representative_building_paths: ["/commercial-real-estate/building/CO/centennial/12508-12650-e-briarwood-ave/", "/commercial-real-estate/building/CO/centennial/15152-e-fremont-dr/", "/commercial-real-estate/building/CO/centennial/8085-s-chester-st/", "/commercial-real-estate/building/CO/centennial/9100-e-panorama-dr/"] },
  { id: "den-lone-tree", name: "Lone Tree", slug: "lone-tree", city: "Lone Tree", state_abbr: "CO", path: "/commercial-real-estate/CO/lone-tree/lone-tree/", centroid_lat: 39.536, centroid_lng: -104.897, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["south_i25", "medical", "professional_services", "retail_support"], representative_building_paths: [] },
  { id: "den-meridian-lincoln-station", name: "Meridian / Lincoln Station", slug: "meridian-lincoln-station", city: "Englewood", state_abbr: "CO", path: "/commercial-real-estate/CO/englewood/meridian-lincoln-station/", centroid_lat: 39.55, centroid_lng: -104.868, area_type: "district", approximate_space_types: ["office", "coworking", "medical"], profile: ["business_park", "transit_oriented", "south_i25", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/CO/englewood/8310-s-valley-hwy/", "/commercial-real-estate/building/CO/englewood/9800-mt-pyramid-ct/", "/commercial-real-estate/building/CO/englewood/6300-s-syracuse-way/"] },
  { id: "den-boulder", name: "Boulder", slug: "boulder", city: "Boulder", state_abbr: "CO", path: "/commercial-real-estate/CO/boulder/boulder/", centroid_lat: 40.015, centroid_lng: -105.27, area_type: "district", approximate_space_types: ["office", "flex", "medical"], profile: ["technology", "research", "life_science", "university_adjacent"], representative_building_paths: ["/commercial-real-estate/building/CO/boulder/2755-canyon-blvd/", "/commercial-real-estate/building/CO/boulder/4770-baseline-rd/"] },
  { id: "den-downtown-boulder", name: "Downtown Boulder", slug: "downtown-boulder", city: "Boulder", state_abbr: "CO", path: "/commercial-real-estate/CO/boulder/downtown-boulder/", centroid_lat: 40.019, centroid_lng: -105.279, area_type: "downtown_core", approximate_space_types: ["office", "retail", "coworking"], profile: ["downtown", "walkable", "startup", "university_adjacent"], representative_building_paths: ["/commercial-real-estate/building/CO/boulder/2755-canyon-blvd/"] },
  { id: "den-broomfield", name: "Broomfield", slug: "broomfield", city: "Broomfield", state_abbr: "CO", path: "/commercial-real-estate/CO/broomfield/broomfield/", centroid_lat: 39.92, centroid_lng: -105.087, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["us36_corridor", "technology", "aerospace_support", "suburban_office"], representative_building_paths: ["/commercial-real-estate/building/CO/broomfield/335-interlocken-pkwy/", "/commercial-real-estate/building/CO/broomfield/390-interlocken-crescent/", "/commercial-real-estate/building/CO/broomfield/8181-arista-place/"] },
  { id: "den-interlocken", name: "Interlocken", slug: "interlocken", city: "Broomfield", state_abbr: "CO", path: "/commercial-real-estate/CO/broomfield/interlocken/", centroid_lat: 39.925, centroid_lng: -105.118, area_type: "district", approximate_space_types: ["office", "flex"], profile: ["business_park", "technology", "corporate", "us36_corridor"], representative_building_paths: ["/commercial-real-estate/building/CO/broomfield/335-interlocken-pkwy/", "/commercial-real-estate/building/CO/broomfield/390-interlocken-crescent/"] },
  { id: "den-flatiron-us-36-corridor", name: "Flatiron / US-36 Corridor", slug: "flatiron-us-36-corridor", city: "Broomfield", state_abbr: "CO", path: "/commercial-real-estate/CO/broomfield/flatiron-us-36-corridor/", centroid_lat: 39.94, centroid_lng: -105.16, area_type: "corridor", approximate_space_types: ["office", "flex"], profile: ["us36_corridor", "technology", "rd_flex", "aerospace_support"], representative_building_paths: ["/commercial-real-estate/building/CO/broomfield/335-interlocken-pkwy/", "/commercial-real-estate/building/CO/broomfield/390-interlocken-crescent/", "/commercial-real-estate/building/CO/louisville/699-ctc-blvd/"] },
  { id: "den-louisville-superior", name: "Louisville / Superior", slug: "louisville-superior", city: "Louisville", state_abbr: "CO", path: "/commercial-real-estate/CO/louisville/louisville-superior/", centroid_lat: 39.98, centroid_lng: -105.15, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["boulder_adjacent", "office_flex", "local_services", "us36_corridor"], representative_building_paths: ["/commercial-real-estate/building/CO/louisville/699-ctc-blvd/"] },
  { id: "den-airport-pena-corridor", name: "Denver Airport / Pena Boulevard Corridor", slug: "denver-airport-pena-boulevard-corridor", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/denver-airport-pena-boulevard-corridor/", centroid_lat: 39.856, centroid_lng: -104.673, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "warehouse", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/3559-n-himalaya-rd/", "/commercial-real-estate/building/CO/denver/10445-e-49th-ave/", "/commercial-real-estate/building/CO/denver/10500-10600-e-54th-ave/", "/commercial-real-estate/building/CO/denver/11551-e-49th-ave/"] },
  { id: "den-aurora", name: "Aurora", slug: "aurora", city: "Aurora", state_abbr: "CO", path: "/commercial-real-estate/CO/aurora/aurora/", centroid_lat: 39.729, centroid_lng: -104.832, area_type: "district", approximate_space_types: ["office", "industrial", "medical"], profile: ["east_metro", "medical", "industrial_flex", "aerospace_support"], representative_building_paths: ["/commercial-real-estate/building/CO/aurora/12375-e-cornell-ave/", "/commercial-real-estate/building/CO/aurora/2821-2851-south-parker-road/", "/commercial-real-estate/building/CO/aurora/3190-s-vaughn-way/", "/commercial-real-estate/building/CO/aurora/3250-abilene-st/"] },
  { id: "den-northeast-denver-industrial", name: "Northeast Denver Industrial", slug: "northeast-denver-industrial", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/northeast-denver-industrial/", centroid_lat: 39.79, centroid_lng: -104.91, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "service_industrial", "airport_adjacent"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/10515-10525-e-40th-ave/", "/commercial-real-estate/building/CO/denver/4550-kingston-st/", "/commercial-real-estate/building/CO/denver/4665-paris-st/", "/commercial-real-estate/building/CO/denver/6804-e-48th-ave/"] },
  { id: "den-commerce-city", name: "Commerce City", slug: "commerce-city", city: "Commerce City", state_abbr: "CO", path: "/commercial-real-estate/CO/commerce-city/commerce-city/", centroid_lat: 39.808, centroid_lng: -104.934, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "logistics", "manufacturing", "service_industrial"], representative_building_paths: [] },
  { id: "den-north-washington-i25-industrial", name: "North Washington / I-25 Industrial", slug: "north-washington-i-25-industrial", city: "Denver", state_abbr: "CO", path: "/commercial-real-estate/CO/denver/north-washington-i-25-industrial/", centroid_lat: 39.82, centroid_lng: -104.99, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["service_industrial", "contractor", "warehouse_flex", "i25_access"], representative_building_paths: ["/commercial-real-estate/building/CO/denver/1550-e-73rd-ave/", "/commercial-real-estate/building/CO/denver/2300-e-76th-ave/", "/commercial-real-estate/building/CO/denver/470-e-76th-ave/", "/commercial-real-estate/building/CO/denver/500-e-76th-ave/"] },
  { id: "den-thornton", name: "Thornton", slug: "thornton", city: "Thornton", state_abbr: "CO", path: "/commercial-real-estate/CO/thornton/thornton/", centroid_lat: 39.868, centroid_lng: -104.971, area_type: "district", approximate_space_types: ["office", "industrial", "medical"], profile: ["north_suburban", "local_services", "medical", "service_industrial"], representative_building_paths: [] },
  { id: "den-westminster", name: "Westminster", slug: "westminster", city: "Westminster", state_abbr: "CO", path: "/commercial-real-estate/CO/westminster/westminster/", centroid_lat: 39.837, centroid_lng: -105.038, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["northwest_suburban", "professional_services", "medical", "local_services"], representative_building_paths: [] },
  { id: "den-arvada", name: "Arvada", slug: "arvada", city: "Arvada", state_abbr: "CO", path: "/commercial-real-estate/CO/arvada/arvada/", centroid_lat: 39.802, centroid_lng: -105.087, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["west_suburban", "local_services", "medical", "retail_support"], representative_building_paths: [] },
  { id: "den-lakewood", name: "Lakewood", slug: "lakewood", city: "Lakewood", state_abbr: "CO", path: "/commercial-real-estate/CO/lakewood/lakewood/", centroid_lat: 39.704, centroid_lng: -105.081, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["west_metro", "medical", "professional_services", "local_services"], representative_building_paths: ["/commercial-real-estate/building/CO/lakewood/200-union-blvd/"] },
  { id: "den-golden", name: "Golden", slug: "golden", city: "Golden", state_abbr: "CO", path: "/commercial-real-estate/CO/golden/golden/", centroid_lat: 39.756, centroid_lng: -105.222, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["foothills", "technical", "university_adjacent", "rd_flex"], representative_building_paths: [] },
  { id: "den-littleton", name: "Littleton", slug: "littleton", city: "Littleton", state_abbr: "CO", path: "/commercial-real-estate/CO/littleton/littleton/", centroid_lat: 39.613, centroid_lng: -105.017, area_type: "district", approximate_space_types: ["office", "medical", "flex"], profile: ["southwest_suburban", "medical", "local_services", "light_flex"], representative_building_paths: ["/commercial-real-estate/building/CO/littleton/1745-shea-center-dr/", "/commercial-real-estate/building/CO/littleton/26-west-dry-creek-circle/", "/commercial-real-estate/building/CO/littleton/8100-southpark-way/", "/commercial-real-estate/building/CO/littleton/8160-blakeland-dr/"] },
];

const dfwMetroDistrictDefinitions = [
  { id: "dfw-downtown-dallas", name: "Downtown Dallas", slug: "downtown-dallas", city: "Dallas", state_abbr: "TX", path: "/commercial-real-estate/TX/dallas/downtown-dallas/", centroid_lat: 32.781, centroid_lng: -96.797, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "finance", "civic"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/1910-pacific-ave/", "/commercial-real-estate/building/TX/dallas/325-n-st-paul-st/", "/commercial-real-estate/building/TX/dallas/2550-pacific-ave/"] },
  { id: "dfw-uptown-dallas", name: "Uptown Dallas", slug: "uptown-dallas", city: "Dallas", state_abbr: "TX", path: "/commercial-real-estate/TX/dallas/uptown-dallas/", centroid_lat: 32.798, centroid_lng: -96.8, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["client_facing", "mixed_use", "professional_services", "finance"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/100-crescent-ct/", "/commercial-real-estate/building/TX/dallas/1919-mckinney-ave/", "/commercial-real-estate/building/TX/dallas/1920-mckinney-ave/", "/commercial-real-estate/building/TX/dallas/3232-mckinney-ave/"] },
  { id: "dfw-deep-ellum", name: "Deep Ellum", slug: "deep-ellum", city: "Dallas", state_abbr: "TX", path: "/commercial-real-estate/TX/dallas/deep-ellum/", centroid_lat: 32.784, centroid_lng: -96.781, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["creative_office", "entertainment", "adaptive_reuse", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/2550-pacific-ave/", "/commercial-real-estate/building/TX/dallas/1910-pacific-ave/"] },
  { id: "dfw-turtle-creek-oak-lawn", name: "Turtle Creek / Oak Lawn", slug: "turtle-creek-oak-lawn", city: "Dallas", state_abbr: "TX", path: "/commercial-real-estate/TX/dallas/turtle-creek-oak-lawn/", centroid_lat: 32.81, centroid_lng: -96.806, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "medical", "wealth", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/2911-turtle-creek-blvd/", "/commercial-real-estate/building/TX/dallas/3333-lee-pkwy/", "/commercial-real-estate/building/TX/dallas/100-crescent-ct/"] },
  { id: "dfw-knox-henderson", name: "Knox / Henderson", slug: "knox-henderson", city: "Dallas", state_abbr: "TX", path: "/commercial-real-estate/TX/dallas/knox-henderson/", centroid_lat: 32.822, centroid_lng: -96.79, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["boutique_office", "retail_adjacent", "wellness", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/4514-cole-ave/", "/commercial-real-estate/building/TX/dallas/3232-mckinney-ave/"] },
  { id: "dfw-north-dallas", name: "North Dallas", slug: "north-dallas", city: "Dallas", state_abbr: "TX", path: "/commercial-real-estate/TX/dallas/north-dallas/", centroid_lat: 32.91, centroid_lng: -96.81, area_type: "corridor", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "medical", "professional_services", "corridor"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/10000-north-central-expressway/", "/commercial-real-estate/building/TX/dallas/10100-north-central-expressway/", "/commercial-real-estate/building/TX/dallas/13140-coit-rd/", "/commercial-real-estate/building/TX/dallas/13601-preston-rd/"] },
  { id: "dfw-addison", name: "Addison", slug: "addison", city: "Addison", state_abbr: "TX", path: "/commercial-real-estate/TX/addison/addison/", centroid_lat: 32.961, centroid_lng: -96.829, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["tollway_office", "professional_services", "local_services", "customer_facing"], representative_building_paths: ["/commercial-real-estate/building/TX/addison/15305-dallas-parkway-12th-floor/", "/commercial-real-estate/building/TX/addison/15455-dallas-pkwy/", "/commercial-real-estate/building/TX/addison/15851-dallas-pkwy/"] },
  { id: "dfw-richardson", name: "Richardson", slug: "richardson", city: "Richardson", state_abbr: "TX", path: "/commercial-real-estate/TX/richardson/richardson/", centroid_lat: 32.948, centroid_lng: -96.729, area_type: "district", approximate_space_types: ["office", "flex", "industrial"], profile: ["technology", "telecom", "office_flex", "rd_flex"], representative_building_paths: ["/commercial-real-estate/building/TX/richardson/2435-north-central-expressway/", "/commercial-real-estate/building/TX/richardson/1100-business-pkwy/", "/commercial-real-estate/building/TX/richardson/3310-matrix-dr/", "/commercial-real-estate/building/TX/richardson/500-e-arapaho-rd/"] },
  { id: "dfw-telecom-corridor", name: "Telecom Corridor", slug: "telecom-corridor", city: "Richardson", state_abbr: "TX", path: "/commercial-real-estate/TX/richardson/telecom-corridor/", centroid_lat: 32.986, centroid_lng: -96.708, area_type: "corridor", approximate_space_types: ["office", "flex"], profile: ["technology", "telecom", "engineering", "rd_flex"], representative_building_paths: ["/commercial-real-estate/building/TX/richardson/2435-north-central-expressway/", "/commercial-real-estate/building/TX/richardson/3310-matrix-dr/", "/commercial-real-estate/building/TX/richardson/3311-e-renner-rd/", "/commercial-real-estate/building/TX/richardson/3320-matrix-dr/"] },
  { id: "dfw-plano", name: "Plano", slug: "plano", city: "Plano", state_abbr: "TX", path: "/commercial-real-estate/TX/plano/plano/", centroid_lat: 33.019, centroid_lng: -96.699, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["corporate", "technology", "professional_services", "suburban_office"], representative_building_paths: ["/commercial-real-estate/building/TX/plano/101-e-park-blvd/", "/commercial-real-estate/building/TX/plano/6600-chase-oaks-blvd/", "/commercial-real-estate/building/TX/plano/2553-summit-ave/"] },
  { id: "dfw-legacy-plano", name: "Legacy / Plano", slug: "legacy-plano", city: "Plano", state_abbr: "TX", path: "/commercial-real-estate/TX/plano/legacy-plano/", centroid_lat: 33.079, centroid_lng: -96.823, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["corporate_campus", "headquarters", "technology", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/TX/plano/5717-legacy-dr/", "/commercial-real-estate/building/TX/plano/5851-legacy-circle/", "/commercial-real-estate/building/TX/plano/6860-n-dallas-pkwy/", "/commercial-real-estate/building/TX/plano/6900-dallas-pkwy/"] },
  { id: "dfw-west-plano", name: "West Plano", slug: "west-plano", city: "Plano", state_abbr: "TX", path: "/commercial-real-estate/TX/plano/west-plano/", centroid_lat: 33.071, centroid_lng: -96.824, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["tollway_office", "corporate", "professional_services", "growth_market"], representative_building_paths: ["/commercial-real-estate/building/TX/plano/3300-dallas-pkwy/", "/commercial-real-estate/building/TX/plano/7700-windrose-ave/", "/commercial-real-estate/building/TX/plano/6860-n-dallas-pkwy/"] },
  { id: "dfw-frisco", name: "Frisco", slug: "frisco", city: "Frisco", state_abbr: "TX", path: "/commercial-real-estate/TX/frisco/frisco/", centroid_lat: 33.151, centroid_lng: -96.823, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["growth_market", "medical", "corporate_expansion", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/TX/frisco/6136-frisco-square-blvd/", "/commercial-real-estate/building/TX/frisco/7460-warren-pkwy/"] },
  { id: "dfw-allen", name: "Allen", slug: "allen", city: "Allen", state_abbr: "TX", path: "/commercial-real-estate/TX/allen/allen/", centroid_lat: 33.103, centroid_lng: -96.671, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["collin_county", "local_services", "medical", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/TX/allen/825-market-street/"] },
  { id: "dfw-mckinney", name: "McKinney", slug: "mckinney", city: "McKinney", state_abbr: "TX", path: "/commercial-real-estate/TX/mckinney/mckinney/", centroid_lat: 33.198, centroid_lng: -96.639, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["north_growth", "medical", "local_services", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/mckinney/2150-s-central-expressway/", "/commercial-real-estate/building/TX/mckinney/6800-weiskopf-ave/"] },
  { id: "dfw-las-colinas", name: "Las Colinas", slug: "las-colinas", city: "Irving", state_abbr: "TX", path: "/commercial-real-estate/TX/irving/las-colinas/", centroid_lat: 32.872, centroid_lng: -96.944, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["corporate", "airport_adjacent", "headquarters", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/irving/222-las-colinas-blvd-w/", "/commercial-real-estate/building/TX/irving/1431-greenway-dr/", "/commercial-real-estate/building/TX/irving/5605-n-macarthur-blvd/", "/commercial-real-estate/building/TX/irving/320-decker-dr/"] },
  { id: "dfw-irving", name: "Irving", slug: "irving", city: "Irving", state_abbr: "TX", path: "/commercial-real-estate/TX/irving/irving/", centroid_lat: 32.814, centroid_lng: -96.949, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["central_dfw", "airport_adjacent", "office_flex", "service_industrial"], representative_building_paths: ["/commercial-real-estate/building/TX/irving/1216-n-belt-line-rd/", "/commercial-real-estate/building/TX/irving/4425-w-airport-freeway/", "/commercial-real-estate/building/TX/irving/5005-w-royal-ln/", "/commercial-real-estate/building/TX/irving/8300-esters-blvd/"] },
  { id: "dfw-coppell", name: "Coppell", slug: "coppell", city: "Coppell", state_abbr: "TX", path: "/commercial-real-estate/TX/coppell/coppell/", centroid_lat: 32.954, centroid_lng: -97.015, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_adjacent", "logistics", "warehouse", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/8951-cypress-waters-blvd/"] },
  { id: "dfw-southlake", name: "Southlake", slug: "southlake", city: "Southlake", state_abbr: "TX", path: "/commercial-real-estate/TX/southlake/southlake/", centroid_lat: 32.941, centroid_lng: -97.134, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "medical", "retail_support", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/southlake/550-reserve-st/", "/commercial-real-estate/building/TX/southlake/950-e-state-highway-114/"] },
  { id: "dfw-grapevine", name: "Grapevine", slug: "grapevine", city: "Grapevine", state_abbr: "TX", path: "/commercial-real-estate/TX/grapevine/grapevine/", centroid_lat: 32.934, centroid_lng: -97.078, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["airport_adjacent", "hospitality", "local_services", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/TX/grapevine/1452-hughes-rd/"] },
  { id: "dfw-airport-area", name: "DFW Airport Area", slug: "dfw-airport-area", city: "Irving", state_abbr: "TX", path: "/commercial-real-estate/TX/irving/dfw-airport-area/", centroid_lat: 32.899, centroid_lng: -97.04, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "warehouse", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/TX/irving/8300-esters-blvd/", "/commercial-real-estate/building/TX/irving/8650-freeport-pkwy-s/", "/commercial-real-estate/building/TX/irving/4425-w-airport-freeway/", "/commercial-real-estate/building/TX/irving/2250-w-john-carpenter-fwy/"] },
  { id: "dfw-alliance-north-fort-worth", name: "Alliance / North Fort Worth", slug: "alliance-north-fort-worth", city: "Fort Worth", state_abbr: "TX", path: "/commercial-real-estate/TX/fort-worth/alliance-north-fort-worth/", centroid_lat: 32.987, centroid_lng: -97.318, area_type: "corridor", approximate_space_types: ["industrial", "flex", "office"], profile: ["logistics", "distribution", "aviation_adjacent", "corporate_campus"], representative_building_paths: ["/commercial-real-estate/building/TX/fort-worth/9800-hillwood-pkwy/"] },
  { id: "dfw-south-dallas-industrial", name: "South Dallas Industrial", slug: "south-dallas-industrial", city: "Dallas", state_abbr: "TX", path: "/commercial-real-estate/TX/dallas/south-dallas-industrial/", centroid_lat: 32.69, centroid_lng: -96.78, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "manufacturing", "service_industrial"], representative_building_paths: [] },
  { id: "dfw-arlington", name: "Arlington", slug: "arlington", city: "Arlington", state_abbr: "TX", path: "/commercial-real-estate/TX/arlington/arlington/", centroid_lat: 32.736, centroid_lng: -97.108, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["mid_cities", "service_commercial", "industrial_flex", "entertainment_support"], representative_building_paths: ["/commercial-real-estate/building/TX/arlington/171-s-watson-rd/", "/commercial-real-estate/building/TX/arlington/2000-e-lamar-blvd/", "/commercial-real-estate/building/TX/arlington/3901-arlington-highlands-blvd/"] },
  { id: "dfw-grand-prairie", name: "Grand Prairie", slug: "grand-prairie", city: "Grand Prairie", state_abbr: "TX", path: "/commercial-real-estate/TX/grand-prairie/grand-prairie/", centroid_lat: 32.746, centroid_lng: -96.997, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "mid_cities", "service_industrial"], representative_building_paths: [] },
  { id: "dfw-garland-industrial", name: "Garland Industrial", slug: "garland-industrial", city: "Garland", state_abbr: "TX", path: "/commercial-real-estate/TX/garland/garland-industrial/", centroid_lat: 32.912, centroid_lng: -96.638, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["manufacturing", "warehouse", "service_industrial", "east_dallas"], representative_building_paths: ["/commercial-real-estate/building/TX/garland/1720-northwest-hwy/", "/commercial-real-estate/building/TX/garland/13509-lyndon-b-johnson-fwy-1st-floor-garland-tx-75041/"] },
  { id: "dfw-mesquite", name: "Mesquite", slug: "mesquite", city: "Mesquite", state_abbr: "TX", path: "/commercial-real-estate/TX/mesquite/mesquite/", centroid_lat: 32.766, centroid_lng: -96.599, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "retail"], profile: ["east_dallas", "logistics", "warehouse", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/TX/mesquite/15330-lbj-fwy/", "/commercial-real-estate/building/TX/mesquite/4111-us-highway-80-e/"] },
  { id: "dfw-carrollton", name: "Carrollton", slug: "carrollton", city: "Carrollton", state_abbr: "TX", path: "/commercial-real-estate/TX/carrollton/carrollton/", centroid_lat: 32.975, centroid_lng: -96.889, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["office_flex", "warehouse", "service_industrial", "northwest_dallas"], representative_building_paths: ["/commercial-real-estate/building/TX/carrollton/1313-valwood-parkway/", "/commercial-real-estate/building/TX/carrollton/2550-trinity-mills-rd/"] },
  { id: "dfw-farmers-branch", name: "Farmers Branch", slug: "farmers-branch", city: "Farmers Branch", state_abbr: "TX", path: "/commercial-real-estate/TX/farmers-branch/farmers-branch/", centroid_lat: 32.926, centroid_lng: -96.896, area_type: "industrial_area", approximate_space_types: ["office", "industrial", "flex"], profile: ["office_flex", "service_industrial", "close_in", "business_park"], representative_building_paths: ["/commercial-real-estate/building/TX/dallas/2270-springlake-rd/", "/commercial-real-estate/building/TX/dallas/3208-belt-line-rd/"] },
  { id: "dfw-downtown-fort-worth", name: "Downtown Fort Worth", slug: "downtown-fort-worth", city: "Fort Worth", state_abbr: "TX", path: "/commercial-real-estate/TX/fort-worth/downtown-fort-worth/", centroid_lat: 32.755, centroid_lng: -97.33, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "energy", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/fort-worth/420-throckmorton-st/", "/commercial-real-estate/building/TX/fort-worth/702-houston-st/", "/commercial-real-estate/building/TX/fort-worth/1500-n-main-st/"] },
  { id: "dfw-cultural-district", name: "Cultural District", slug: "cultural-district", city: "Fort Worth", state_abbr: "TX", path: "/commercial-real-estate/TX/fort-worth/cultural-district/", centroid_lat: 32.749, centroid_lng: -97.37, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["professional_services", "medical", "arts_adjacent", "local_services"], representative_building_paths: ["/commercial-real-estate/building/TX/fort-worth/5049-edwards-ranch-rd/"] },
  { id: "dfw-west-7th", name: "West 7th", slug: "west-7th", city: "Fort Worth", state_abbr: "TX", path: "/commercial-real-estate/TX/fort-worth/west-7th/", centroid_lat: 32.751, centroid_lng: -97.354, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["mixed_use", "hospitality", "professional_services", "wellness"], representative_building_paths: ["/commercial-real-estate/building/TX/fort-worth/5049-edwards-ranch-rd/", "/commercial-real-estate/building/TX/fort-worth/702-houston-st/"] },
  { id: "dfw-fort-worth-industrial", name: "Fort Worth Industrial", slug: "fort-worth-industrial", city: "Fort Worth", state_abbr: "TX", path: "/commercial-real-estate/TX/fort-worth/fort-worth-industrial/", centroid_lat: 32.77, centroid_lng: -97.24, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "manufacturing", "service_industrial", "logistics"], representative_building_paths: ["/commercial-real-estate/building/TX/fort-worth/2601-petty-pl/", "/commercial-real-estate/building/TX/fort-worth/405-e-bolt-st/", "/commercial-real-estate/building/TX/fort-worth/4500-mercantile-plaza-dr/", "/commercial-real-estate/building/TX/fort-worth/5601-bridge-st/"] },
];

function southBayDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "south_bay_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_south_bay_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function eastBayDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "east_bay_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_east_bay_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function northBayDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "north_bay_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_north_bay_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function sacramentoDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "sacramento_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_sacramento_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function sanDiegoDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "san_diego_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_san_diego_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function orangeCountyDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "orange_county_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_orange_county_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function inlandEmpireDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "inland_empire_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_inland_empire_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function losAngelesDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "los_angeles_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_los_angeles_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function seattleMetroDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "seattle_metro_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_seattle_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function phoenixMetroDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "phoenix_metro_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_phoenix_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function denverMetroDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "denver_metro_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_denver_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function dfwMetroDistrictPageFor(district) {
  return {
    name: district.name,
    slug: district.slug,
    city: district.city,
    state_abbr: district.state_abbr,
    city_slug: slugify(district.city),
    canonical_neighborhood_path: district.path,
    centroid_lat: district.centroid_lat,
    centroid_lng: district.centroid_lng,
    radius: "",
    geometry_quality: "dfw_metro_v1_commercial_graph",
    approximate_building_count: district.representative_building_paths.length,
    approximate_space_types: district.approximate_space_types,
    approximate_semantic_signals: district.profile.map(signalLabel).slice(0, 8),
    representative_buildings: representativeBuildingsFromPaths(
      district.representative_building_paths,
      district.id
    ),
    commercial_area_id: district.id,
    commercial_area_type: district.area_type,
    commercial_area_type_label: clean(district.area_type).replace(/_/g, " "),
    commercial_profile: district.profile,
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_location_model", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_dfw_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function distanceKm(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
    return Number.POSITIVE_INFINITY;
  }

  const radius = 6371.0088;
  const lat1 = Number(a.lat) * Math.PI / 180;
  const lat2 = Number(b.lat) * Math.PI / 180;
  const deltaLat = (Number(b.lat) - Number(a.lat)) * Math.PI / 180;
  const deltaLng = (Number(b.lng) - Number(a.lng)) * Math.PI / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * radius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function representativeBuildingsFor(areaId) {
  return (relationshipsByArea.get(areaId) || [])
    .slice()
    .sort((a, b) => {
      if (a.confidence !== b.confidence) return a.confidence === "high" ? -1 : 1;
      if (a.distance_to_centroid_km !== b.distance_to_centroid_km) {
        return a.distance_to_centroid_km - b.distance_to_centroid_km;
      }
      return (b.historical_listing_activity || 0) - (a.historical_listing_activity || 0);
    })
    .slice(0, 6)
    .map((relationship) =>
      normalizeRepresentativeBuilding({
        address: relationship.address,
        display_name: relationship.address || relationship.building_name,
        name: relationship.building_name,
        building_path: relationship.building_path,
        type: typeLabel(relationship.inferred_space_type_mix?.[0]?.space_type || "commercial"),
        size_label: "",
        primary_area_id: relationship.primary_area_id,
        relationship_confidence: relationship.confidence,
      })
    );
}

function representativeBuildingsFromPaths(paths = [], areaId = "") {
  return paths
    .map((buildingPath) => buildingByPath.get(buildingPath))
    .filter(Boolean)
    .slice(0, 6)
    .map((building) =>
      normalizeRepresentativeBuilding({
        address: building.address,
        display_name: building.address || building.display_name || building.name,
        name: building.name,
        building_path: building.building_path,
        type: building.primary_type_label || building.type || "Commercial Space",
        size_label: building.size_label || "",
        primary_area_id: areaId,
        relationship_confidence: "high",
      })
    );
}

function spaceTypesFor(areaId) {
  const summary = areaSummaryById.get(areaId);
  const values = (summary?.dominant_space_type_patterns || [])
    .map((item) => item.space_type)
    .filter((value) => ["office", "retail", "industrial", "flex", "coworking"].includes(value));

  return [...new Set(values)];
}

function fallbackSpaceTypesFor(area) {
  const profile = area.commercial_profile || [];
  const values = [];

  for (const tag of profile) {
    if (["office", "retail", "industrial", "flex", "coworking"].includes(tag)) {
      values.push(tag);
    } else if (tag === "warehouse" || tag === "logistics") {
      values.push("industrial");
    } else if (tag === "neighborhood_retail" || tag === "showroom") {
      values.push("retail");
    } else if (
      tag === "creative_office" ||
      tag === "professional_services" ||
      tag === "boutique_office" ||
      tag === "enterprise_environment" ||
      tag === "suburban_office"
    ) {
      values.push("office");
    }
  }

  return [...new Set(values)];
}

function areaTypePriority(areaType) {
  const priorities = {
    downtown_core: 0,
    district: 1,
    submarket: 2,
    corridor: 3,
    neighborhood: 4,
    industrial_area: 5,
  };

  return priorities[areaType] ?? 9;
}

function commercialPageFor(area) {
  if (area.recommended_status && area.recommended_status !== "launch") return null;

  const summary = areaSummaryById.get(area.id);
  const relationshipBuildings = representativeBuildingsFor(area.id);
  const overrideBuildings = representativeBuildingsFromPaths(
    representativeBuildingPathOverridesByAreaId[area.id] || [],
    area.id
  );
  const representative_buildings = overrideBuildings.length
    ? overrideBuildings
    : relationshipBuildings.length
    ? relationshipBuildings
    : representativeBuildingsFromPaths(area.representative_building_paths || [], area.id);

  const canonical_neighborhood_path = areaPath(area);
  const areaTypeLabel = clean(area.area_type).replace(/_/g, " ");
  const approximate_space_types = spaceTypesFor(area.id);
  const fallback_space_types = fallbackSpaceTypesFor(area);
  const relationshipCount = summary?.relationship_count || representative_buildings.length || 0;

  return {
    name: area.canonical_name,
    slug: slugify(area.canonical_name),
    city: area.city,
    state_abbr: area.state_abbr,
    city_slug: slugify(area.city),
    canonical_neighborhood_path,
    centroid_lat: area.approximate_centroid?.lat || "",
    centroid_lng: area.approximate_centroid?.lng || "",
    radius: "",
    geometry_quality: "commercial_area_entity",
    approximate_building_count: relationshipCount,
    approximate_space_types: approximate_space_types.length ? approximate_space_types : fallback_space_types,
    approximate_semantic_signals: (area.commercial_profile || []).map(signalLabel).slice(0, 8),
    representative_buildings,
    commercial_area_id: area.id,
    commercial_area_type: area.area_type,
    commercial_area_type_label: areaTypeLabel,
    commercial_profile: area.commercial_profile || [],
    source_confidence: area.source_confidence,
    source_types: area.source_types || [],
    suppress_nearby_neighborhoods: Boolean(area.suppress_nearby_neighborhoods),
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    city_nav_priority: area.city_nav_priority != null
      ? area.city_nav_priority
      : relationshipCount > 0 ? areaTypePriority(area.area_type) : areaTypePriority(area.area_type) + 4,
  };
}

function nycPageFor(candidate) {
  if (candidate.recommended_status !== "launch") return null;

  const representative_buildings = representativeBuildingsFromPaths(
    candidate.representative_building_paths || [],
    `nyc-${candidate.slug}`
  );
  const areaTypeLabel = clean(candidate.area_type).replace(/_/g, " ");

  return {
    name: candidate.canonical_name,
    slug: candidate.slug,
    borough: candidate.borough,
    city: "New York",
    state_abbr: "NY",
    city_slug: "new-york",
    canonical_neighborhood_path: candidate.canonical_path,
    centroid_lat: "",
    centroid_lng: "",
    radius: "",
    geometry_quality: "nyc_nta_reference",
    approximate_building_count: representative_buildings.length,
    approximate_space_types: (candidate.likely_space_types || [])
      .filter((value) => ["office", "retail", "industrial", "flex", "coworking"].includes(value)),
    approximate_semantic_signals: (candidate.likely_space_types || []).map(signalLabel).slice(0, 8),
    representative_buildings,
    commercial_area_id: `nyc-${candidate.slug}`,
    commercial_area_type: candidate.area_type,
    commercial_area_type_label: areaTypeLabel,
    commercial_profile: candidate.likely_space_types || [],
    source_confidence: candidate.source_confidence,
    source_types: candidate.source_types || [],
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: false,
    public_nyc_rollout: true,
    city_nav_priority: Math.max(0, 100 - (candidate.commercial_relevance_score || 70)),
  };
}

const existingPages = pages
  .filter((page) => allowlistByPath.has(page.canonical_neighborhood_path))
  .map((page) => ({
    ...page,
    ...allowlistByPath.get(page.canonical_neighborhood_path),
    representative_buildings: (page.representative_buildings || []).map(
      normalizeRepresentativeBuilding
    ),
    city_nav_priority: 3,
    prototype: true,
    public_review: false,
    public_phase_1: true,
  }));

const commercialPages = [...commercialAreas, ...priorityMarketAreas]
  .map(commercialPageFor)
  .filter(Boolean);

const nycPages = nycCandidates
  .map(nycPageFor)
  .filter(Boolean);

const southBayPages = southBayDistrictDefinitions.map(southBayDistrictPageFor);
const eastBayPages = eastBayDistrictDefinitions.map(eastBayDistrictPageFor);
const northBayPages = northBayDistrictDefinitions.map(northBayDistrictPageFor);
const sacramentoPages = sacramentoDistrictDefinitions.map(sacramentoDistrictPageFor);
const sanDiegoPages = sanDiegoDistrictDefinitions.map(sanDiegoDistrictPageFor);
const orangeCountyPages = orangeCountyDistrictDefinitions.map(orangeCountyDistrictPageFor);
const inlandEmpirePages = inlandEmpireDistrictDefinitions.map(inlandEmpireDistrictPageFor);
const losAngelesPages = losAngelesDistrictDefinitions.map(losAngelesDistrictPageFor);
const seattleMetroPages = seattleMetroDistrictDefinitions.map(seattleMetroDistrictPageFor);
const phoenixMetroPages = phoenixMetroDistrictDefinitions.map(phoenixMetroDistrictPageFor);
const denverMetroPages = denverMetroDistrictDefinitions.map(denverMetroDistrictPageFor);
const dfwMetroPages = dfwMetroDistrictDefinitions.map(dfwMetroDistrictPageFor);

const allPagesByPath = new Map();

for (const page of existingPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, page);
}

for (const page of commercialPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of nycPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of southBayPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of eastBayPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of northBayPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of sacramentoPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of sanDiegoPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of orangeCountyPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of inlandEmpirePages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of losAngelesPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of seattleMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of phoenixMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of denverMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of dfwMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

const allPages = Array.from(allPagesByPath.values());
const eastBayV1ExistingPaths = new Set([
  "/commercial-real-estate/CA/oakland/west-oakland/",
]);

for (const page of allPages) {
  if (eastBayV1ExistingPaths.has(page.canonical_neighborhood_path)) {
    page.public_east_bay_v1 = true;
    page.suppress_nearby_neighborhoods = true;
  }

  if (page.city_nav_priority == null) {
    page.city_nav_priority = page.representative_buildings?.length ? 3 : 7;
  }

  const displayNameWithArticle = displayNameWithArticleFor(page);
  if (!page.display_name_with_article && displayNameWithArticle) {
    page.display_name_with_article = displayNameWithArticle;
  }
  page.uses_definite_article = Boolean(page.display_name_with_article);
  page.display_name_with_article_sentence = sentenceStartName(
    page.display_name_with_article || page.name
  );
  page.meta_place_label =
    clean(page.name).toLowerCase() === clean(page.city).toLowerCase()
      ? `${page.city}, ${page.state_abbr}`
      : `${page.display_name_with_article || page.name}, ${page.city}, ${page.state_abbr}`;
  page.meta_context_label =
    clean(page.name).toLowerCase() === clean(page.city).toLowerCase()
      ? page.city
      : `${page.display_name_with_article || page.name}, ${page.city}`;
  page.neighborhood_image_path =
    page.neighborhood_image_path || neighborhoodImagePathFor(page);
  if (
    page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/soma/"
  ) {
    page.neighborhood_image_path =
      page.neighborhood_image_path || "/assets/images/districts/soma/hero.webp";
  }
  if (
    page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/financial-district/"
  ) {
    page.neighborhood_image_path =
      page.neighborhood_image_path || "/assets/images/districts/financial-district-sf/hero.webp";
  }
  if (
    page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/jackson-square/"
  ) {
    page.neighborhood_image_path =
      page.neighborhood_image_path || "/assets/images/districts/jackson-square/hero.webp";
  }
  if (
    page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/mission-bay/"
  ) {
    page.neighborhood_image_path =
      page.neighborhood_image_path || "/assets/images/districts/mission-bay/hero.webp";
  }
  if (
    page.canonical_neighborhood_path === "/commercial-real-estate/CA/oakland/downtown-oakland/"
  ) {
    page.neighborhood_image_path =
      page.neighborhood_image_path || "/assets/images/districts/downtown-oakland/downtown-oakland-hero.webp";
  }
  if (
    page.canonical_neighborhood_path === "/commercial-real-estate/CA/oakland/uptown-oakland/"
  ) {
    page.neighborhood_image_path =
      page.neighborhood_image_path || "/assets/images/districts/uptown-oakland/uptown-oakland-hero.webp";
  }
  if (
    page.canonical_neighborhood_path === "/commercial-real-estate/CA/oakland/jack-london-square/"
  ) {
    page.neighborhood_image_path =
      page.neighborhood_image_path || "/assets/images/districts/jack-london-square/jack-london-hero.webp";
  }
  page.map_hero = neighborhoodMapHeroes[mapHeroKey(page)] || null;
  page.neighborhood_intelligence = neighborhoodIntelligence[page.canonical_neighborhood_path] || null;
  page.public_commercial_districts =
    commercialDistrictPublicIntegrations.byPath[page.canonical_neighborhood_path] || null;
  page.commercial_location_model =
    commercialLocationModel.byPath[page.canonical_neighborhood_path] || null;
  page.representative_building_cards =
    representativeBuildingCards.byDistrictPath[page.canonical_neighborhood_path] || [];
  page.curated_district_media =
    page.slug === "soma" &&
    clean(page.city).toLowerCase() === "san francisco" &&
    clean(page.state_abbr).toUpperCase() === "CA"
      ? curatedDistrictMediaBySlug.soma || null
      : page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/financial-district/"
      ? curatedDistrictMediaBySlug["financial-district"] || null
      : page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/jackson-square/"
      ? curatedDistrictMediaBySlug["jackson-square"] || null
      : page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/mission-bay/"
      ? curatedDistrictMediaBySlug["mission-bay"] || null
      : page.canonical_neighborhood_path === "/commercial-real-estate/CA/oakland/downtown-oakland/"
      ? curatedDistrictMediaBySlug["downtown-oakland"] || null
      : page.canonical_neighborhood_path === "/commercial-real-estate/CA/oakland/uptown-oakland/"
      ? curatedDistrictMediaBySlug["uptown-oakland"] || null
      : null;
  page.district_locator_map = districtLocatorMapFor(page);
  if (page.district_locator_map && page.district_locator_map.promote_to_identity && page.map_hero) {
    page.map_hero = {
      ...page.map_hero,
      suppress_map_hero: true,
    };
  }
  page.district_identity = districtIdentityFor(page);
  const representativeBuildingRoles = representativeBuildingRolesFor(page);
  if (page.representative_buildings && Object.keys(representativeBuildingRoles).length) {
    page.representative_buildings = page.representative_buildings.map((building) => ({
      ...building,
      editorial_descriptor:
        representativeBuildingRoles[building.building_path] || building.editorial_descriptor,
    }));
  }
  page.approved_editorial_signal =
    clean(page.city).toLowerCase() === "atlanta" && clean(page.state_abbr).toUpperCase() === "GA"
      ? atlantaApprovedEditorialSignals.byPath[page.canonical_neighborhood_path] || null
      : null;
}

const allPagesByCitySlug = new Map();

for (const page of allPages) {
  const cityKey = [clean(page.state_abbr).toUpperCase(), slugify(page.city)].join("/");
  const slug = page.slug || slugify(page.name);

  if (!allPagesByCitySlug.has(cityKey)) {
    allPagesByCitySlug.set(cityKey, new Map());
  }

  allPagesByCitySlug.get(cityKey).set(slug, page);
}

for (const page of allPages) {
  if (page.suppress_nearby_neighborhoods) {
    page.nearby_neighborhoods = [];
    continue;
  }

  const curatedSlugs = curatedNearbyByKey[pageKey(page)] || [];
  const cityKey = [clean(page.state_abbr).toUpperCase(), slugify(page.city)].join("/");
  const cityPagesBySlug = allPagesByCitySlug.get(cityKey) || new Map();
  const curatedNearby = curatedSlugs
    .map((slug) => cityPagesBySlug.get(slug))
    .filter((candidate) =>
      candidate &&
      candidate.canonical_neighborhood_path !== page.canonical_neighborhood_path &&
      !candidate.noindex
    )
    .slice(0, 5)
    .map((candidate) => ({
      name: candidate.name,
      city: candidate.city,
      state_abbr: candidate.state_abbr,
      url: candidate.canonical_neighborhood_path,
      note: nearbyComparisonNotesByKey[pageKey(page)]?.[candidate.slug || slugify(candidate.name)] || "",
    }));

  if (curatedNearby.length) {
    page.nearby_neighborhoods = curatedNearby;
    continue;
  }

  const center = { lat: page.centroid_lat, lng: page.centroid_lng };
  page.nearby_neighborhoods = allPages
    .filter((candidate) =>
      candidate.canonical_neighborhood_path !== page.canonical_neighborhood_path &&
      candidate.city === page.city &&
      candidate.state_abbr === page.state_abbr &&
      !candidate.noindex
    )
    .map((candidate) => ({
      name: candidate.name,
      city: candidate.city,
      state_abbr: candidate.state_abbr,
      url: candidate.canonical_neighborhood_path,
      distance: distanceKm(center, { lat: candidate.centroid_lat, lng: candidate.centroid_lng }),
    }))
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
    .slice(0, 5)
    .map(({ distance, ...nearby }) => nearby);
}

module.exports = allPages.sort((a, b) =>
  `${a.state_abbr} ${a.city}`.localeCompare(`${b.state_abbr} ${b.city}`) ||
  (a.city_nav_priority || 0) - (b.city_nav_priority || 0) ||
  (b.approximate_building_count || 0) - (a.approximate_building_count || 0) ||
  a.name.localeCompare(b.name)
);
