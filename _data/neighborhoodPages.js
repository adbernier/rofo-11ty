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
