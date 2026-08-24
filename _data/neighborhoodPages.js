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
const commercialBuildingIntelligence = require("./commercialBuildingIntelligence.js");
const representativeBuildingCards = require("./representativeBuildingCards.js");
const commercialMarketEvidence = require("./commercialMarketEvidence.js");
const sfPublicDecisionSurfaces = require("./sfPublicDecisionSurfaces.js");
const commercialMarketEvidenceByDistrict = new Map(
  (commercialMarketEvidence.collections || []).map((collection) => [collection.district?.districtId, collection])
);
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
  const pathMatch = clean(building.building_path).match(/^\/commercial-real-estate\/building\/([^/]+)\/([^/]+)\/([^/]+)\//);
  const state = clean(building.state_abbr || pathMatch?.[1]).toLowerCase();
  const citySlug = clean(building.city_slug || pathMatch?.[2] || slugify(building.city)).toLowerCase();
  const buildingSlug = clean(building.building_slug || pathMatch?.[3]).toLowerCase();
  const fieldPhotoSubjectId =
    clean(building.semantic_source_building_id) ||
    (state && citySlug && buildingSlug ? `${state}-${citySlug}-${buildingSlug}` : "");

  return {
    ...building,
    display_name: displayName,
    short_display_name: shortBuildingLabel(displayName),
    editorial_type_label: editorialTypeLabel(building.type || building.primary_type_label || "commercial"),
    editorial_descriptor: editorialBuildingDescriptor(building),
    fieldPhotoSubjectId,
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

  if (pagePath === "/commercial-real-estate/CA/san-francisco/bayview-industrial/") {
    return {
      eyebrow: "Industrial District Guide",
      title: "Bayview Industrial",
      lead: "Understand San Francisco's broadest city-serving operational industrial geography for warehouse, distribution, food, contractor, fleet, production, and practical flex requirements.",
      guide_label: "Industrial decision guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/central-waterfront/") {
    return {
      eyebrow: "Industrial District Guide",
      title: "Central Waterfront",
      lead: "Understand the protected Central Waterfront PDR core for urban production, fabrication, maker, practical flex, prototyping, product development, and maritime-support uses south of mixed-use Dogpatch.",
      guide_label: "Production and flex district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/showplace-square/") {
    return {
      eyebrow: "Design Trade District Guide",
      title: "Showplace Square / Design District",
      lead: "Understand San Francisco's overlapping Showplace Square and Design District geography for showrooms, interiors, building products, creative production, office/showroom hybrids, and customer-facing PDR uses.",
      guide_label: "Showroom and design-trade guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/potrero-hill/") {
    return {
      eyebrow: "Commercial District Guide",
      title: "Potrero Hill",
      lead: "Understand Potrero Hill's neighborhood-scale commercial identity and the selective production, maker, service-commercial, and flex relevance of its eastern/base and Showplace-adjacent edges.",
      guide_label: "Commercial and production-edge guide",
    };
  }

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

  if (pagePath === "/commercial-real-estate/CA/san-francisco/union-square/") {
    return {
      eyebrow: "District Guide",
      title: "Union Square Commercial District",
      lead:
        "Understand Union Square as San Francisco's visitor-facing retail, hospitality, and office-adjacent district, where storefront visibility, hotels, transit, and downtown proximity matter more than a pure office-core identity.",
      guide_label: "Retail and office district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/hayes-valley/") {
    return {
      eyebrow: "District Guide",
      title: "Hayes Valley Commercial District",
      lead:
        "Understand Hayes Valley as a smaller mixed commercial district between Civic Center, Market Street, and central-west San Francisco, with boutique storefronts, local services, creative office users, and neighborhood-scale client access.",
      guide_label: "Mixed commercial district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/mission/") {
    return {
      eyebrow: "District Guide",
      title: "Mission Commercial District",
      lead:
        "Understand the Mission as a dense mixed commercial district where neighborhood retail, food and beverage, creative office users, local services, and transit access meet a more street-level environment than SoMa, Mission Bay, or the Financial District.",
      guide_label: "Mixed commercial district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/marina-district/") {
    return {
      eyebrow: "District Guide",
      title: "Marina District Commercial District",
      lead:
        "Understand the Marina District as a northern San Francisco commercial area for local office, retail, wellness, medical, and client-facing service users that want neighborhood visibility and affluent customer access rather than downtown office density.",
      guide_label: "Local commercial district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/richmond/") {
    return {
      eyebrow: "District Guide",
      title: "Richmond District Commercial District",
      lead:
        "Understand the Richmond District as a west-side San Francisco commercial area anchored by neighborhood-serving corridors, medical and professional services, local retail, and practical access to the Presidio, Golden Gate Park, and western neighborhoods.",
      guide_label: "West-side commercial district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/sunset/") {
    return {
      eyebrow: "District Guide",
      title: "Sunset District Commercial District",
      lead:
        "Understand the Sunset District as a west-side San Francisco market for neighborhood retail, medical, professional-service, and local office users serving residential customer geography rather than downtown or campus-style office demand.",
      guide_label: "West-side commercial district guide",
    };
  }

  if (pagePath === "/commercial-real-estate/CA/san-francisco/presidio/") {
    return {
      eyebrow: "District Guide",
      title: "Presidio Commercial District",
      lead:
        "Understand the Presidio as a distinctive campus-like San Francisco commercial setting, useful for organizations that value historic buildings, open-space identity, creative office character, and northern-city access more than downtown transit density.",
      guide_label: "Campus district guide",
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
  const intelligenceRoles = commercialBuildingIntelligence.roleDescriptorsByDistrictPath[pagePath] || null;

  if (intelligenceRoles && Object.keys(intelligenceRoles).length) {
    return intelligenceRoles;
  }

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
      "/commercial-real-estate/building/CA/san-jose/1140-ringwood-ct/":
        "Ringwood office/R&D corridor",
      "/commercial-real-estate/building/CA/san-jose/1580-1630-old-oakland-road/":
        "Old Oakland Road office corridor",
      "/commercial-real-estate/building/CA/san-jose/1650-las-plumas-ave/":
        "Las Plumas office and industrial-support context",
      "/commercial-real-estate/building/CA/san-jose/1721-rogers-ave/":
        "Rogers Avenue office/R&D context",
      "/commercial-real-estate/building/CA/san-jose/95-holger-way/":
        "North San Jose amenity and office-support edge",
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
      "/commercial-real-estate/building/CA/sunnyvale/1310-kifer-rd/":
        "Sunnyvale industrial/R&D support corridor",
      "/commercial-real-estate/building/CA/mountain-view/605-ellis-st/":
        "Mountain View office/R&D edge",
      "/commercial-real-estate/building/CA/mountain-view/1954-1958-old-middlefield-wy/":
        "Old Middlefield technology corridor",
      "/commercial-real-estate/building/CA/mountain-view/140-144-whisman-rd-s/":
        "Whisman R&D/flex office context",
      "/commercial-real-estate/building/CA/mountain-view/1051-1063-el-camino-real-w/":
        "El Camino service-commercial support edge",
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
      "/commercial-real-estate/building/CA/palo-alto/1121-san-antonio-rd/":
        "Palo Alto business park setting",
      "/commercial-real-estate/building/CA/palo-alto/3000-el-camino-real/":
        "Palo Alto Square campus office comparison",
      "/commercial-real-estate/building/CA/palo-alto/306-cambridge-ave/":
        "Research-adjacent flex and production edge",
      "/commercial-real-estate/building/CA/palo-alto/3260-ash-st/":
        "South Palo Alto professional/R&D office edge",
      "/commercial-real-estate/building/CA/redwood-city/2065-broadway-st/":
        "Downtown Redwood City Broadway office block",
      "/commercial-real-estate/building/CA/redwood-city/2400-broadway/":
        "Broadway downtown commercial context",
      "/commercial-real-estate/building/CA/redwood-city/2504-el-camino-real/":
        "El Camino downtown edge",
      "/commercial-real-estate/building/CA/redwood-city/303-twin-dolphin-drive/":
        "Redwood Shores comparison edge",
      "/commercial-real-estate/building/CA/redwood-city/1400-seaport-blvd-bldg-9/":
        "Redwood Shores campus-office contrast",
      "/commercial-real-estate/building/CA/san-mateo/3-east-third-ave/":
        "Downtown San Mateo office and Caltrain-adjacent context",
      "/commercial-real-estate/building/CA/san-mateo/302-baldwin-ave/":
        "Downtown San Mateo service-retail edge",
      "/commercial-real-estate/building/CA/san-mateo/1650-borel-pl/":
        "San Mateo professional office corridor",
      "/commercial-real-estate/building/CA/san-mateo/400-concar-dr/":
        "Concar office corridor comparison",
      "/commercial-real-estate/building/CA/san-mateo/951-mariners-island-blvd/":
        "Mariners Island office corridor context",
      "/commercial-real-estate/building/CA/san-mateo/1720-s-amphlett-blvd/":
        "Bayshore corporate office setting",
      "/commercial-real-estate/building/CA/san-mateo/1825-s-grant-st/":
        "San Mateo office and service-commercial edge",
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
      "/commercial-real-estate/building/CA/sacramento/300-capitol-mall/":
        "Capitol Mall civic and professional office context",
      "/commercial-real-estate/building/CA/sacramento/320-capitol-mall/":
        "Downtown Sacramento large-format office setting",
      "/commercial-real-estate/building/CA/sacramento/980-ninth-street/":
        "Park Tower downtown office example",
      "/commercial-real-estate/building/CA/sacramento/555-capitol-mall/":
        "Capitol Mall government-adjacent office fabric",
      "/commercial-real-estate/building/CA/sacramento/621-capitol-mall/":
        "Central Sacramento professional office tower context",
      "/commercial-real-estate/building/CA/sacramento/770-l-st/":
        "L Street downtown office and civic access",
      "/commercial-real-estate/building/CA/sacramento/400-capitol-mall/":
        "Capitol Mall professional office context",
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
      "/commercial-real-estate/building/CA/sacramento/2480-natomas-park-dr/":
        "Natomas Park suburban office setting",
      "/commercial-real-estate/building/CA/sacramento/2484-natomas-park-dr/":
        "Natomas office park building context",
      "/commercial-real-estate/building/CA/sacramento/2485-natomas-park-dr/":
        "Natomas Corporate Center office example",
      "/commercial-real-estate/building/CA/sacramento/2700-gateway-oaks-dr/":
        "Gateway Oaks suburban office park",
      "/commercial-real-estate/building/CA/sacramento/2850-gateway-oaks-dr/":
        "Crown Corporate Center office context",
      "/commercial-real-estate/building/CA/sacramento/2275-gateway-oaks-dr/":
        "Gateway Oaks professional office setting",
      "/commercial-real-estate/building/CA/sacramento/2295-gateway-oaks-dr/":
        "Gateway Oaks parking-oriented office example",
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
      "/commercial-real-estate/building/CA/rancho-cordova/10265-rockingham-dr/":
        "Rockingham Drive office/flex context",
      "/commercial-real-estate/building/CA/rancho-cordova/10690-white-rock-rd/":
        "White Rock Road suburban office setting",
      "/commercial-real-estate/building/CA/rancho-cordova/11135-trade-center-dr/":
        "Trade Center warehouse/flex example",
      "/commercial-real-estate/building/CA/rancho-cordova/11167-trade-center-dr/":
        "Trade Center industrial/flex context",
      "/commercial-real-estate/building/CA/rancho-cordova/11201-sun-center-dr/":
        "Sun Center office/flex support building",
      "/commercial-real-estate/building/CA/rancho-cordova/11249-gold-country-blvd/":
        "Gold Country suburban office context",
      "/commercial-real-estate/building/CA/rancho-cordova/3075-prospect-park-dr/":
        "Prospect Park business park office",
      "/commercial-real-estate/building/CA/rancho-cordova/3100-zinfandel-dr/":
        "Zinfandel Drive regional office example",
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
      "/commercial-real-estate/building/CA/rocklin/2203-plaza-dr/":
        "Plaza Drive suburban office setting",
      "/commercial-real-estate/building/CA/rocklin/2205-plaza-dr/":
        "Plaza Drive professional office context",
      "/commercial-real-estate/building/CA/rocklin/2210-plaza-dr/":
        "Rocklin office/business park example",
      "/commercial-real-estate/building/CA/rocklin/2540-warren-dr/":
        "Warren Drive suburban office building",
      "/commercial-real-estate/building/CA/rocklin/3706-atherton-rd/":
        "Atherton Road medical/professional office",
      "/commercial-real-estate/building/CA/rocklin/3825-atherton-rd/":
        "Atherton Road business park office",
      "/commercial-real-estate/building/CA/rocklin/3835-atherton-rd/":
        "Atherton Road professional office context",
      "/commercial-real-estate/building/CA/rocklin/4011-alvis-ct/":
        "Rocklin light industrial/flex example",
      "/commercial-real-estate/building/CA/rocklin/4780-rocklin-rd/":
        "Rocklin Road local office context",
      "/commercial-real-estate/building/CA/rocklin/5905-6015-pacific-street/":
        "Pacific Street service-commercial context",
      "/commercial-real-estate/building/CA/rocklin/6815-five-star-blvd/":
        "Five Star Boulevard office/business park",
      "/commercial-real-estate/building/CA/rocklin/6960-destiny-dr/":
        "Destiny Drive suburban office example",
      "/commercial-real-estate/building/CA/elk-grove/10139-iron-rock-way/":
        "Elk Grove office/flex business court",
      "/commercial-real-estate/building/CA/elk-grove/3137-dwight-rd/":
        "Laguna West business park context",
      "/commercial-real-estate/building/CA/elk-grove/9245-laguna-springs-dr/":
        "Laguna Springs professional office",
      "/commercial-real-estate/building/CA/elk-grove/9615-laguna-springs-dr/":
        "Elk Grove suburban office context",
      "/commercial-real-estate/building/CA/elk-grove/10000-waterman-rd/":
        "Waterman Road light industrial edge",
      "/commercial-real-estate/building/CA/elk-grove/10237-iron-rock-way/":
        "Iron Rock industrial/flex building",
      "/commercial-real-estate/building/CA/elk-grove/10280-iron-rock-way/":
        "Iron Rock service-industrial context",
      "/commercial-real-estate/building/CA/elk-grove/9092-elkmont-way/":
        "Elkmont Way warehouse/flex example",
      "/commercial-real-estate/building/CA/elk-grove/9250-laguna-springs-dr/":
        "Laguna Springs suburban office node",
      "/commercial-real-estate/building/CA/elk-grove/9275-laguna-springs-dr/":
        "Laguna Springs professional office setting",
      "/commercial-real-estate/building/CA/elk-grove/9263-bendel-pl/":
        "Bendel Place light industrial context",
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
  "CA/oakland/hegenberger-corridor": ["coliseum-industrial", "jack-london-square", "downtown-oakland", "fruitvale"],
  "CA/oakland/coliseum-industrial": ["hegenberger-corridor", "fruitvale", "jack-london-square", "downtown-oakland"],
  "CA/oakland/west-oakland": ["jack-london-square", "downtown-oakland", "old-oakland", "uptown-oakland"],
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
  "IL/chicago/loop": "the Loop",
  "IL/chicago/west-loop": "the West Loop",
  "IL/chicago/south-loop": "the South Loop",
  "IL/chicago/magnificent-mile": "the Magnificent Mile",
  "IL/chicago/illinois-medical-district": "the Illinois Medical District",
  "MA/boston/seaport": "the Seaport",
  "MA/waltham/route-128-corridor": "the Route 128 Corridor",
  "MA/framingham/route-495-corridor": "the Route 495 Corridor",
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
  "oak-hegenberger-corridor": [
    "/commercial-real-estate/building/CA/oakland/700-independent-rd/",
    "/commercial-real-estate/building/CA/oakland/711-independent-rd/",
    "/commercial-real-estate/building/CA/oakland/180-hegenberger-loop/",
    "/commercial-real-estate/building/CA/oakland/404-pendleton-way/",
    "/commercial-real-estate/building/CA/oakland/433-hegenberger-rd/",
    "/commercial-real-estate/building/CA/oakland/333-hegenberger-rd/",
    "/commercial-real-estate/building/CA/oakland/303-hegenberger-rd/",
    "/commercial-real-estate/building/CA/oakland/675-hegenberger-rd/",
    "/commercial-real-estate/building/CA/oakland/8000-edgewater-dr/",
    "/commercial-real-estate/building/CA/oakland/8301-edgewater-dr/",
  ],
  "oak-coliseum-industrial": [
    "/commercial-real-estate/building/CA/oakland/5441-international-blvd/",
    "/commercial-real-estate/building/CA/oakland/1154-57th-ave/",
    "/commercial-real-estate/building/CA/oakland/7303-edgewater-dr/",
    "/commercial-real-estate/building/CA/oakland/7307-edgewater-dr/",
    "/commercial-real-estate/building/CA/oakland/7677-oakport-st/",
    "/commercial-real-estate/building/CA/oakland/8105-edgewater-dr/",
    "/commercial-real-estate/building/CA/oakland/8501-san-leandro-st/",
    "/commercial-real-estate/building/CA/oakland/5601-san-leandro-st/",
    "/commercial-real-estate/building/CA/oakland/6195-coliseum-way/",
    "/commercial-real-estate/building/CA/oakland/7001-san-leandro-st/",
    "/commercial-real-estate/building/CA/oakland/745-85th-ave/",
    "/commercial-real-estate/building/CA/oakland/610-85th-ave/",
  ],
  "oak-west-oakland": [
    "/commercial-real-estate/building/CA/oakland/1440-7th-st/",
    "/commercial-real-estate/building/CA/oakland/1410-7th-st/",
    "/commercial-real-estate/building/CA/oakland/1800-peralta-st/",
    "/commercial-real-estate/building/CA/oakland/105-2nd-st/",
    "/commercial-real-estate/building/CA/oakland/119-filbert-st/",
    "/commercial-real-estate/building/CA/oakland/1400-mandela-pkwy/",
    "/commercial-real-estate/building/CA/oakland/2201-poplar-st/",
    "/commercial-real-estate/building/CA/oakland/2921-adeline-st/",
    "/commercial-real-estate/building/CA/oakland/2855-mandela-pkwy/",
    "/commercial-real-estate/building/CA/oakland/1500-mandela-pkwy/",
    "/commercial-real-estate/building/CA/oakland/1320-wood-st/",
    "/commercial-real-estate/building/CA/oakland/2400-filbert-st/",
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
      "/commercial-real-estate/building/CA/san-jose/1140-ringwood-ct/",
      "/commercial-real-estate/building/CA/san-jose/1580-1630-old-oakland-road/",
      "/commercial-real-estate/building/CA/san-jose/1650-las-plumas-ave/",
      "/commercial-real-estate/building/CA/san-jose/1721-rogers-ave/",
      "/commercial-real-estate/building/CA/san-jose/95-holger-way/",
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
    id: "sb-santana-row-valley-fair",
    name: "Santana Row / Valley Fair",
    slug: "santana-row-valley-fair",
    city: "San Jose",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-jose/santana-row-valley-fair/",
    centroid_lat: 37.32,
    centroid_lng: -121.947,
    area_type: "district",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["mixed_use", "retail_adjacent_office", "professional_services", "west_san_jose"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-jose/3031-tisch-way/",
      "/commercial-real-estate/building/CA/san-jose/550-s-winchester-blvd/",
      "/commercial-real-estate/building/CA/san-jose/560-s-winchester-blvd/",
      "/commercial-real-estate/building/CA/san-jose/1245-s-winchester-blvd/",
      "/commercial-real-estate/building/CA/san-jose/2880-stevens-creek-blvd/",
      "/commercial-real-estate/building/CA/san-jose/4340-stevens-creek-blvd/",
      "/commercial-real-estate/building/CA/san-jose/1190-saratoga-ave/",
      "/commercial-real-estate/building/CA/san-jose/1600-saratoga-ave/",
    ],
  },
  {
    id: "sb-san-jose-airport-golden-triangle",
    name: "Airport / Golden Triangle",
    slug: "airport-golden-triangle",
    city: "San Jose",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-jose/airport-golden-triangle/",
    centroid_lat: 37.37,
    centroid_lng: -121.922,
    area_type: "district",
    approximate_space_types: ["office", "flex", "coworking"],
    profile: ["airport_access", "office", "technology_support", "freeway_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-jose/2025-gateway-pl/",
      "/commercial-real-estate/building/CA/san-jose/2001-gateway-pl/",
      "/commercial-real-estate/building/CA/san-jose/2033-gateway-pl/",
      "/commercial-real-estate/building/CA/san-jose/226-airport-pkwy/",
      "/commercial-real-estate/building/CA/san-jose/1735-technology-dr/",
      "/commercial-real-estate/building/CA/san-jose/1731-technology-dr/",
      "/commercial-real-estate/building/CA/san-jose/25-metro-dr/",
      "/commercial-real-estate/building/CA/san-jose/101-metro-dr/",
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
    id: "sb-cupertino-commercial-core",
    name: "Cupertino Commercial Core",
    slug: "cupertino-commercial-core",
    city: "Cupertino",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/cupertino/cupertino-commercial-core/",
    centroid_lat: 37.323,
    centroid_lng: -122.032,
    area_type: "district",
    approximate_space_types: ["office", "retail", "flex"],
    profile: ["technology_office", "professional_services", "apple_adjacent", "west_valley"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/cupertino/1601-s-de-anza-blvd/",
      "/commercial-real-estate/building/CA/cupertino/10001-n-de-anza-blvd/",
      "/commercial-real-estate/building/CA/cupertino/10601-s-de-anza-blvd/",
      "/commercial-real-estate/building/CA/cupertino/21040-homestead-rd/",
      "/commercial-real-estate/building/CA/cupertino/20111-stevens-creek-blvd/",
      "/commercial-real-estate/building/CA/cupertino/20450-stevens-creek-blvd/",
      "/commercial-real-estate/building/CA/cupertino/18900-stevens-creek-blvd/",
      "/commercial-real-estate/building/CA/cupertino/10420-bubb-rd/",
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
      "/commercial-real-estate/building/CA/sunnyvale/1195-borregas-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/1277-borregas-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/415-n-mary-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/525-almanor-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/710-lakeway-drive-suite-200/",
      "/commercial-real-estate/building/CA/sunnyvale/1310-kifer-rd/",
    ],
  },
  {
    id: "sb-downtown-sunnyvale",
    name: "Downtown Sunnyvale",
    slug: "downtown-sunnyvale",
    city: "Sunnyvale",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sunnyvale/downtown-sunnyvale/",
    centroid_lat: 37.377,
    centroid_lng: -122.032,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["caltrain", "walkable_downtown", "mixed_use", "professional_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sunnyvale/111-w-evelyn-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/150-mathilda-pl/",
      "/commercial-real-estate/building/CA/sunnyvale/200-w-washington-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/100-mathilda-pl/",
      "/commercial-real-estate/building/CA/sunnyvale/640-w-california-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/400-w-california-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/260-s-sunnyvale-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/100-s-murphy-ave/",
    ],
  },
  {
    id: "sb-peery-park",
    name: "Peery Park",
    slug: "peery-park",
    city: "Sunnyvale",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sunnyvale/peery-park/",
    centroid_lat: 37.392,
    centroid_lng: -122.035,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["rd_flex", "technology_office", "business_park", "central_sunnyvale"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sunnyvale/650-vaqueros-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/525-almanor-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/380-n-pastoria-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/678-w-maude-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/676-w-maude-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/333-w-maude-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/730-n-pastoria-ave/",
      "/commercial-real-estate/building/CA/sunnyvale/965-w-maude-ave/",
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
      "/commercial-real-estate/building/CA/mountain-view/800-w-el-camino-real/",
      "/commercial-real-estate/building/CA/mountain-view/1051-1063-el-camino-real-w/",
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
      "/commercial-real-estate/building/CA/palo-alto/3000-el-camino-real/",
      "/commercial-real-estate/building/CA/palo-alto/306-cambridge-ave/",
      "/commercial-real-estate/building/CA/palo-alto/3260-ash-st/",
    ],
  },
  {
    id: "sb-south-san-francisco-oyster-point",
    name: "South San Francisco Oyster Point",
    slug: "south-san-francisco-oyster-point",
    city: "South San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/south-san-francisco/oyster-point/",
    centroid_lat: 37.665,
    centroid_lng: -122.384,
    area_type: "district",
    approximate_space_types: ["office", "flex", "life science"],
    profile: ["life_science", "biotech", "lab", "airport_access", "waterfront"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/south-san-francisco/400-oyster-point-blvd/",
      "/commercial-real-estate/building/CA/south-san-francisco/701-gateway-blvd/",
      "/commercial-real-estate/building/CA/south-san-francisco/389-oyster-point-blvd/",
      "/commercial-real-estate/building/CA/south-san-francisco/395-oyster-point-blvd/",
      "/commercial-real-estate/building/CA/south-san-francisco/379-oyster-point-blvd/",
      "/commercial-real-estate/building/CA/south-san-francisco/11-airport-blvd/",
      "/commercial-real-estate/building/CA/south-san-francisco/131-maple-ave-s/",
      "/commercial-real-estate/building/CA/south-san-francisco/100-produce-ave/",
    ],
  },
  {
    id: "sb-menlo-park-commercial-core",
    name: "Menlo Park Commercial Core",
    slug: "menlo-park-commercial-core",
    city: "Menlo Park",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/menlo-park/menlo-park-commercial-core/",
    centroid_lat: 37.452,
    centroid_lng: -122.182,
    area_type: "district",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["peninsula_office", "downtown_core", "caltrain", "stanford_adjacent"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/menlo-park/333-ravenswood-ave/",
      "/commercial-real-estate/building/CA/menlo-park/932-santa-cruz-ave/",
      "/commercial-real-estate/building/CA/menlo-park/845-santa-cruz-ave/",
      "/commercial-real-estate/building/CA/menlo-park/1258-el-camino-real/",
      "/commercial-real-estate/building/CA/menlo-park/275-middlefield-rd/",
      "/commercial-real-estate/building/CA/menlo-park/100-middlefield-rd/",
      "/commercial-real-estate/building/CA/menlo-park/1010-el-camino-real/",
      "/commercial-real-estate/building/CA/menlo-park/611-santa-cruz-ave/",
    ],
  },
  {
    id: "sb-sand-hill-stanford-adjacent",
    name: "Sand Hill / Stanford-adjacent",
    slug: "sand-hill-stanford-adjacent",
    city: "Menlo Park",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/menlo-park/sand-hill-stanford-adjacent/",
    centroid_lat: 37.421,
    centroid_lng: -122.205,
    area_type: "district",
    approximate_space_types: ["office"],
    profile: ["venture_office", "stanford_adjacent", "campus_office", "executive_office"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/menlo-park/2882-sand-hill-rd/",
      "/commercial-real-estate/building/CA/menlo-park/2400-sand-hill-rd/",
      "/commercial-real-estate/building/CA/menlo-park/3000-sand-hill-rd/",
      "/commercial-real-estate/building/CA/menlo-park/2800-sand-hill-rd/",
      "/commercial-real-estate/building/CA/menlo-park/2440-sand-hill-rd/",
      "/commercial-real-estate/building/CA/menlo-park/2765-sand-hill-rd/",
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
      "/commercial-real-estate/building/CA/redwood-city/1400-seaport-blvd-bldg-9/",
    ],
  },
  {
    id: "sb-downtown-san-mateo",
    name: "Downtown San Mateo",
    slug: "downtown-san-mateo",
    city: "San Mateo",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-mateo/downtown-san-mateo/",
    centroid_lat: 37.563,
    centroid_lng: -122.325,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["peninsula_downtown", "caltrain", "professional_services", "local_services"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-mateo/3-east-third-ave/",
      "/commercial-real-estate/building/CA/san-mateo/302-baldwin-ave/",
      "/commercial-real-estate/building/CA/san-mateo/1650-borel-pl/",
      "/commercial-real-estate/building/CA/san-mateo/400-concar-dr/",
      "/commercial-real-estate/building/CA/san-mateo/951-mariners-island-blvd/",
      "/commercial-real-estate/building/CA/san-mateo/1720-s-amphlett-blvd/",
      "/commercial-real-estate/building/CA/san-mateo/1825-s-grant-st/",
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
    id: "i880-hayward-industrial",
    name: "Hayward Industrial",
    slug: "hayward-industrial",
    city: "Hayward",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/hayward/hayward-industrial/",
    centroid_lat: 37.629,
    centroid_lng: -122.118,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["industrial", "warehouse", "logistics", "manufacturing", "i880"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/hayward/3832-bay-center-pl/",
      "/commercial-real-estate/building/CA/hayward/25901-industrial-blvd/",
      "/commercial-real-estate/building/CA/hayward/2340-industrial-pkwy-w/",
      "/commercial-real-estate/building/CA/hayward/3151-diablo-ave/",
      "/commercial-real-estate/building/CA/hayward/3596-baumberg-ave/",
      "/commercial-real-estate/building/CA/hayward/21371-cabot-blvd/",
      "/commercial-real-estate/building/CA/hayward/3447-investment-blvd/",
      "/commercial-real-estate/building/CA/hayward/31350-huntwood-ave/",
    ],
  },
  {
    id: "i880-union-city-industrial",
    name: "Union City Industrial",
    slug: "union-city-industrial",
    city: "Union City",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/union-city/union-city-industrial/",
    centroid_lat: 37.601,
    centroid_lng: -122.069,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["industrial", "warehouse", "logistics", "manufacturing", "i880"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/union-city/30300-whipple-rd/",
      "/commercial-real-estate/building/CA/union-city/32900-alvarado-niles-rd/",
      "/commercial-real-estate/building/CA/union-city/33288-central-ave/",
      "/commercial-real-estate/building/CA/union-city/4001-whipple-rd/",
      "/commercial-real-estate/building/CA/union-city/1550-pacific-st/",
      "/commercial-real-estate/building/CA/union-city/30336-whipple-rd/",
      "/commercial-real-estate/building/CA/union-city/33333-western-ave/",
      "/commercial-real-estate/building/CA/union-city/30100-30150-ahern-st/",
    ],
  },
  {
    id: "i880-fremont-pacific-commons",
    name: "Fremont Pacific Commons",
    slug: "pacific-commons",
    city: "Fremont",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/fremont/pacific-commons/",
    centroid_lat: 37.507,
    centroid_lng: -121.976,
    area_type: "district",
    approximate_space_types: ["office", "retail", "flex", "industrial"],
    profile: ["mixed_commercial", "retail_adjacent", "flex", "i880"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/fremont/43806-pacific-commons-blvd/",
      "/commercial-real-estate/building/CA/fremont/42840-christy-st/",
      "/commercial-real-estate/building/CA/fremont/41638-41758-christy-st/",
      "/commercial-real-estate/building/CA/fremont/41444-christy-st/",
      "/commercial-real-estate/building/CA/fremont/41460-christy-st/",
      "/commercial-real-estate/building/CA/fremont/42744-boscell-rd/",
      "/commercial-real-estate/building/CA/fremont/5500-boscell-cmn/",
      "/commercial-real-estate/building/CA/fremont/44235-nobel-dr/",
    ],
  },
  {
    id: "i880-fremont-auto-mall-parkway",
    name: "Fremont Auto Mall Parkway",
    slug: "auto-mall-parkway",
    city: "Fremont",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/fremont/auto-mall-parkway/",
    centroid_lat: 37.507,
    centroid_lng: -121.999,
    area_type: "industrial_area",
    approximate_space_types: ["retail", "flex", "industrial"],
    profile: ["showroom", "service_commercial", "flex", "i880"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/fremont/5605-auto-mall-pkwy/",
      "/commercial-real-estate/building/CA/fremont/4580-auto-mall-pkwy/",
      "/commercial-real-estate/building/CA/fremont/4400-auto-mall-pkwy/",
      "/commercial-real-estate/building/CA/fremont/5605-5639-auto-mall-pkwy/",
      "/commercial-real-estate/building/CA/fremont/40851-40869-albrae-st/",
      "/commercial-real-estate/building/CA/fremont/40547-40577-albrae-st/",
      "/commercial-real-estate/building/CA/fremont/41407-41601-albrae-st/",
      "/commercial-real-estate/building/CA/fremont/40460-albrae-st/",
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
      "/commercial-real-estate/building/CA/fremont/48860-milmont-dr/",
      "/commercial-real-estate/building/CA/fremont/48834-kato-rd/",
      "/commercial-real-estate/building/CA/fremont/48603-warm-springs-blvd/",
      "/commercial-real-estate/building/CA/fremont/47697-westinghouse-dr/",
      "/commercial-real-estate/building/CA/fremont/48810-48818-kato-rd/",
      "/commercial-real-estate/building/CA/fremont/46723-lakeview-blvd/",
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
      "/commercial-real-estate/building/CA/fremont/215-fourier-ave/",
      "/commercial-real-estate/building/CA/fremont/6036-stevenson-blvd/",
      "/commercial-real-estate/building/CA/fremont/3068-laurelview-ct/",
      "/commercial-real-estate/building/CA/fremont/3342-gateway-blvd/",
      "/commercial-real-estate/building/CA/fremont/48000-48016-fremont-blvd/",
      "/commercial-real-estate/building/CA/fremont/48301-lakeview-blvd/",
      "/commercial-real-estate/building/CA/fremont/47421-bayside-pkwy/",
    ],
  },
];

const eastBayDistrictDefinitions = [
  {
    id: "eb-richmond-industrial",
    name: "Richmond Industrial",
    slug: "richmond-industrial",
    city: "Richmond",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/richmond/richmond-industrial/",
    centroid_lat: 37.935,
    centroid_lng: -122.365,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["industrial", "warehouse", "logistics", "manufacturing", "i80_i580"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/richmond/3065-richmond-pky/",
      "/commercial-real-estate/building/CA/richmond/3033-richmond-pky/",
      "/commercial-real-estate/building/CA/richmond/3095-richmond-pky/",
      "/commercial-real-estate/building/CA/richmond/1150-hensley-st/",
      "/commercial-real-estate/building/CA/richmond/1069-hensley-st/",
      "/commercial-real-estate/building/CA/richmond/211-w-cutting-blvd/",
      "/commercial-real-estate/building/CA/richmond/1-barrett-ave/",
      "/commercial-real-estate/building/CA/richmond/5215-central-ave/",
      "/commercial-real-estate/building/CA/richmond/4911-central-ave/",
    ],
  },
  {
    id: "eb-point-richmond-marina-bay",
    name: "Point Richmond / Marina Bay",
    slug: "point-richmond-marina-bay",
    city: "Richmond",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/richmond/point-richmond-marina-bay/",
    centroid_lat: 37.913,
    centroid_lng: -122.354,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["waterfront", "office", "flex", "industrial_transition", "east_bay_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/richmond/1400-harbour-way-s/",
      "/commercial-real-estate/building/CA/richmond/1200-harbour-way-s/",
      "/commercial-real-estate/building/CA/richmond/1050-1090-marina-way-s/",
      "/commercial-real-estate/building/CA/richmond/1121-regatta-blvd/",
      "/commercial-real-estate/building/CA/richmond/1001-canal-blvd/",
      "/commercial-real-estate/building/CA/richmond/100-104-washington-ave/",
      "/commercial-real-estate/building/CA/richmond/830-marina-way-s/",
    ],
  },
  {
    id: "eb-alameda-waterfront-harbor-bay",
    name: "Alameda Waterfront / Harbor Bay",
    slug: "alameda-waterfront-harbor-bay",
    city: "Alameda",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/alameda/alameda-waterfront-harbor-bay/",
    centroid_lat: 37.765,
    centroid_lng: -122.253,
    area_type: "district",
    approximate_space_types: ["office", "retail", "industrial", "flex"],
    profile: ["waterfront", "business_park", "office", "industrial_flex", "oakland_adjacent"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/alameda/1101-marina-village-pkwy/",
      "/commercial-real-estate/building/CA/alameda/2226-pacific-ave/",
      "/commercial-real-estate/building/CA/alameda/2264-santa-clara-ave/",
      "/commercial-real-estate/building/CA/alameda/2315-2323-central-ave/",
      "/commercial-real-estate/building/CA/alameda/park-street-w-and-otis-dr/",
    ],
  },
  {
    id: "eb-san-leandro-industrial",
    name: "San Leandro Industrial",
    slug: "san-leandro-industrial",
    city: "San Leandro",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-leandro/san-leandro-industrial/",
    centroid_lat: 37.704,
    centroid_lng: -122.177,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["industrial", "warehouse", "service_commercial", "airport_access", "i880"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-leandro/1451-doolittle-dr/",
      "/commercial-real-estate/building/CA/san-leandro/1420-san-leandro-blvd/",
      "/commercial-real-estate/building/CA/san-leandro/2400-teagarden-st/",
      "/commercial-real-estate/building/CA/san-leandro/2010-williams-st/",
      "/commercial-real-estate/building/CA/san-leandro/1670-alvarado-st/",
      "/commercial-real-estate/building/CA/san-leandro/3018-alvarado-st/",
      "/commercial-real-estate/building/CA/san-leandro/321-davis-st/",
      "/commercial-real-estate/building/CA/san-leandro/500-davis-st/",
      "/commercial-real-estate/building/CA/san-leandro/2091-williams-st/",
      "/commercial-real-estate/building/CA/san-leandro/2700-merced-st/",
    ],
  },
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
      "/commercial-real-estate/building/CA/berkeley/2140-shattuck-ave/",
      "/commercial-real-estate/building/CA/berkeley/2150-shattuck-ave/",
      "/commercial-real-estate/building/CA/berkeley/2030-addison-st/",
      "/commercial-real-estate/building/CA/berkeley/1936-university-ave/",
      "/commercial-real-estate/building/CA/berkeley/2300-shattuck-ave/",
      "/commercial-real-estate/building/CA/berkeley/2130-center-st/",
      "/commercial-real-estate/building/CA/berkeley/2168-shattuck-ave/",
      "/commercial-real-estate/building/CA/berkeley/2070-allston-way/",
      "/commercial-real-estate/building/CA/berkeley/2040-bancroft-way/",
      "/commercial-real-estate/building/CA/berkeley/2118-milvia-st/",
    ],
  },
  {
    id: "eb-west-berkeley",
    name: "West Berkeley",
    slug: "west-berkeley",
    city: "Berkeley",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/berkeley/west-berkeley/",
    centroid_lat: 37.869,
    centroid_lng: -122.296,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["rd_flex", "creative_office", "industrial_transition", "university_adjacent"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/berkeley/950-gilman-st/",
      "/commercial-real-estate/building/CA/berkeley/2600-10th-st/",
      "/commercial-real-estate/building/CA/berkeley/3100-san-pablo-ave/",
      "/commercial-real-estate/building/CA/berkeley/2560-9th-st/",
      "/commercial-real-estate/building/CA/berkeley/829-heinz-ave/",
      "/commercial-real-estate/building/CA/berkeley/650-university-ave/",
      "/commercial-real-estate/building/CA/berkeley/1608-4th-st/",
      "/commercial-real-estate/building/CA/berkeley/2550-9th-st/",
      "/commercial-real-estate/building/CA/berkeley/2501-9th-st/",
      "/commercial-real-estate/building/CA/berkeley/717-potter-st/",
      "/commercial-real-estate/building/CA/berkeley/2929-7th-st/",
      "/commercial-real-estate/building/CA/berkeley/918-parker-st/",
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
      "/commercial-real-estate/building/CA/emeryville/6425-christie-ave/",
      "/commercial-real-estate/building/CA/emeryville/2200-powell-st/",
      "/commercial-real-estate/building/CA/emeryville/2100-powell-st/",
      "/commercial-real-estate/building/CA/emeryville/5858-horton-st/",
      "/commercial-real-estate/building/CA/emeryville/2000-powell-st/",
      "/commercial-real-estate/building/CA/emeryville/5980-horton-st/",
      "/commercial-real-estate/building/CA/emeryville/6001-shellmound-st/",
      "/commercial-real-estate/building/CA/emeryville/5900-hollis-st/",
      "/commercial-real-estate/building/CA/emeryville/1250-45th-st/",
      "/commercial-real-estate/building/CA/emeryville/5901-christie-ave/",
      "/commercial-real-estate/building/CA/emeryville/967-stanford-ave/",
      "/commercial-real-estate/building/CA/emeryville/4045-horton-st/",
      "/commercial-real-estate/building/CA/emeryville/1480-64th-st/",
      "/commercial-real-estate/building/CA/emeryville/1400-65th-st/",
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
    id: "nb-downtown-mill-valley",
    name: "Downtown Mill Valley",
    slug: "downtown-mill-valley",
    city: "Mill Valley",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/mill-valley/downtown-mill-valley/",
    centroid_lat: 37.906,
    centroid_lng: -122.548,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["boutique_office", "professional_services", "local_retail", "southern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/mill-valley/138-144-throckmorton-ave/",
      "/commercial-real-estate/building/CA/mill-valley/32-miller-ave/",
      "/commercial-real-estate/building/CA/mill-valley/55-sunnyside-ave/",
      "/commercial-real-estate/building/CA/mill-valley/230-232-e-blithedale-ave/",
      "/commercial-real-estate/building/CA/mill-valley/447-miller-ave/",
      "/commercial-real-estate/building/CA/mill-valley/495-miller-ave/",
      "/commercial-real-estate/building/CA/mill-valley/619-e-blithedale-ave/",
      "/commercial-real-estate/building/CA/mill-valley/9-montford-ave/",
    ],
  },
  {
    id: "nb-strawberry-mill-valley",
    name: "Strawberry",
    slug: "strawberry",
    city: "Mill Valley",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/mill-valley/strawberry/",
    centroid_lat: 37.895,
    centroid_lng: -122.515,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["highway_101", "medical", "professional_services", "retail", "southern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/mill-valley/100-shoreline-hwy/",
      "/commercial-real-estate/building/CA/mill-valley/575-redwood-hwy/",
      "/commercial-real-estate/building/CA/mill-valley/591-redwood-hwy/",
      "/commercial-real-estate/building/CA/mill-valley/618-redwood-hwy/",
      "/commercial-real-estate/building/CA/mill-valley/655-redwood-hwy/",
      "/commercial-real-estate/building/CA/mill-valley/800-805-redwood-hwy-frontage-rd/",
      "/commercial-real-estate/building/CA/mill-valley/1-belvedere-dr/",
      "/commercial-real-estate/building/CA/mill-valley/1-belvedere-pl/",
    ],
  },
  {
    id: "nb-tam-junction",
    name: "Tam Junction",
    slug: "tam-junction",
    city: "Mill Valley",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/mill-valley/tam-junction/",
    centroid_lat: 37.88,
    centroid_lng: -122.53,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "retail", "flex"],
    profile: ["service_commercial", "creative_office", "local_services", "southern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/mill-valley/1048-redwood-hwy-frontage/",
      "/commercial-real-estate/building/CA/mill-valley/250-camino-alto/",
      "/commercial-real-estate/building/CA/mill-valley/45-camino-alto-suite-106/",
      "/commercial-real-estate/building/CA/mill-valley/61-camino-alto-suite-102/",
      "/commercial-real-estate/building/CA/mill-valley/695-e-blithedale-ave/",
      "/commercial-real-estate/building/CA/mill-valley/701-e-blithedale-ave/",
    ],
  },
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
    name: "Northgate / Smith Ranch / Civic Center",
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
    id: "nb-kerner-east-san-rafael",
    name: "Kerner / East San Rafael",
    slug: "kerner-east-san-rafael",
    city: "San Rafael",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-rafael/kerner-east-san-rafael/",
    centroid_lat: 37.963,
    centroid_lng: -122.506,
    area_type: "commercial_corridor",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["service_commercial", "light_industrial", "contractor", "central_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-rafael/369-e-third-st/",
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
    id: "nb-larkspur-landing",
    name: "Larkspur Landing",
    slug: "larkspur-landing",
    city: "Larkspur",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/larkspur/larkspur-landing/",
    centroid_lat: 37.944,
    centroid_lng: -122.51,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["ferry_access", "professional_services", "medical", "southern_marin"],
    representative_building_paths: [],
  },
  {
    id: "nb-downtown-larkspur",
    name: "Downtown Larkspur",
    slug: "downtown-larkspur",
    city: "Larkspur",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/larkspur/downtown-larkspur/",
    centroid_lat: 37.934,
    centroid_lng: -122.535,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["boutique_office", "local_retail", "professional_services", "southern_marin"],
    representative_building_paths: [],
  },
  {
    id: "nb-corte-madera-town-center",
    name: "Corte Madera Town Center / Highway 101",
    slug: "corte-madera-town-center-highway-101",
    city: "Corte Madera",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/corte-madera/corte-madera-town-center-highway-101/",
    centroid_lat: 37.925,
    centroid_lng: -122.516,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["retail", "professional_services", "highway_101", "southern_marin"],
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
    id: "nb-downtown-novato",
    name: "Downtown Novato",
    slug: "downtown-novato",
    city: "Novato",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/novato/downtown-novato/",
    centroid_lat: 38.107,
    centroid_lng: -122.57,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["downtown", "professional_services", "local_retail", "northern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/novato/951-953-front-st/",
    ],
  },
  {
    id: "nb-hamilton-landing-ignacio",
    name: "Hamilton Landing / Ignacio",
    slug: "hamilton-landing-ignacio",
    city: "Novato",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/novato/hamilton-landing-ignacio/",
    centroid_lat: 38.065,
    centroid_lng: -122.535,
    area_type: "district",
    approximate_space_types: ["office", "flex", "medical"],
    profile: ["adaptive_reuse", "campus_office", "office_flex", "northern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/novato/2-ranch-dr/",
      "/commercial-real-estate/building/CA/novato/15-leveroni-ct/",
    ],
  },
  {
    id: "nb-hamilton-landing",
    name: "Hamilton Landing",
    slug: "hamilton-landing",
    city: "Novato",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/novato/hamilton-landing/",
    centroid_lat: 38.062,
    centroid_lng: -122.528,
    area_type: "district",
    approximate_space_types: ["office", "flex"],
    profile: ["adaptive_reuse", "campus_office", "creative_office", "northern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/novato/2-ranch-dr/",
    ],
  },
  {
    id: "nb-ignacio",
    name: "Ignacio",
    slug: "ignacio",
    city: "Novato",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/novato/ignacio/",
    centroid_lat: 38.07,
    centroid_lng: -122.542,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "medical", "flex"],
    profile: ["office_flex", "medical", "local_services", "northern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/novato/15-leveroni-ct/",
    ],
  },
  {
    id: "nb-bel-marin-keys",
    name: "Bel Marin Keys",
    slug: "bel-marin-keys",
    city: "Novato",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/novato/bel-marin-keys/",
    centroid_lat: 38.08,
    centroid_lng: -122.52,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["light_industrial", "service_commercial", "contractor", "logistics", "northern_marin"],
    representative_building_paths: [],
  },
  {
    id: "nb-downtown-sausalito",
    name: "Downtown Sausalito",
    slug: "downtown-sausalito",
    city: "Sausalito",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sausalito/downtown-sausalito/",
    centroid_lat: 37.859,
    centroid_lng: -122.486,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail"],
    profile: ["waterfront", "boutique_office", "local_retail", "southern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sausalito/1905-bridgeway-blvd/",
    ],
  },
  {
    id: "nb-sausalito-marinship-waterfront",
    name: "Sausalito Waterfront / Marinship",
    slug: "sausalito-waterfront-marinship",
    city: "Sausalito",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sausalito/sausalito-waterfront-marinship/",
    centroid_lat: 37.869,
    centroid_lng: -122.499,
    area_type: "district",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["waterfront", "creative_office", "marine", "service_commercial", "southern_marin"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/sausalito/1-harbor-dr/",
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
  {
    id: "nb-santa-rosa-airport-business-center",
    name: "Airport Business Center",
    slug: "airport-business-center",
    city: "Santa Rosa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-rosa/airport-business-center/",
    centroid_lat: 38.508,
    centroid_lng: -122.806,
    area_type: "business_park",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["airport_access", "business_park", "office_flex", "light_industrial", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-rosa/3550-round-barn-blvd/",
    ],
  },
  {
    id: "nb-santa-rosa-northpoint-corporate-center",
    name: "Northpoint / Corporate Center",
    slug: "northpoint-corporate-center",
    city: "Santa Rosa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-rosa/northpoint-corporate-center/",
    centroid_lat: 38.418,
    centroid_lng: -122.75,
    area_type: "business_park",
    approximate_space_types: ["office", "medical", "flex"],
    profile: ["suburban_office", "professional_services", "medical", "highway_101", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-rosa/3550-round-barn-blvd/",
    ],
  },
  {
    id: "nb-montgomery-village-east-santa-rosa",
    name: "Montgomery Village / East Santa Rosa",
    slug: "montgomery-village-east-santa-rosa",
    city: "Santa Rosa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-rosa/montgomery-village-east-santa-rosa/",
    centroid_lat: 38.45,
    centroid_lng: -122.69,
    area_type: "commercial_corridor",
    approximate_space_types: ["retail", "office", "medical"],
    profile: ["retail", "medical", "local_services", "east_santa_rosa", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-rosa/2527-guernville-road/",
    ],
  },
  {
    id: "nb-downtown-petaluma",
    name: "Downtown Petaluma",
    slug: "downtown-petaluma",
    city: "Petaluma",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/petaluma/downtown-petaluma/",
    centroid_lat: 38.235,
    centroid_lng: -122.641,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["downtown", "creative_office", "professional_services", "local_retail", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/petaluma/389-mcdowell-blvd-s/",
      "/commercial-real-estate/building/CA/petaluma/401-kenilworth-dr/",
    ],
  },
  {
    id: "nb-petaluma-marina-lakeville",
    name: "Petaluma Marina / Lakeville",
    slug: "petaluma-marina-lakeville",
    city: "Petaluma",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/petaluma/petaluma-marina-lakeville/",
    centroid_lat: 38.23,
    centroid_lng: -122.61,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "flex", "retail"],
    profile: ["waterfront_adjacent", "office_flex", "creative_office", "lakeville_corridor", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/petaluma/755-baywood-dr/",
    ],
  },
  {
    id: "nb-north-mcdowell-petaluma",
    name: "North McDowell",
    slug: "north-mcdowell",
    city: "Petaluma",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/petaluma/north-mcdowell/",
    centroid_lat: 38.262,
    centroid_lng: -122.665,
    area_type: "commercial_corridor",
    approximate_space_types: ["medical", "office", "retail"],
    profile: ["medical", "office", "retail", "auto_oriented", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/petaluma/389-mcdowell-blvd-s/",
    ],
  },
  {
    id: "nb-south-petaluma-industrial",
    name: "South Petaluma / Industrial",
    slug: "south-petaluma-industrial",
    city: "Petaluma",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/petaluma/south-petaluma-industrial/",
    centroid_lat: 38.218,
    centroid_lng: -122.603,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["light_industrial", "production", "service_commercial", "logistics", "sonoma_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/petaluma/755-baywood-dr/",
    ],
  },
  {
    id: "nb-rohnert-park-commercial-core",
    name: "Rohnert Park Commercial Core",
    slug: "rohnert-park-commercial-core",
    city: "Rohnert Park",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/rohnert-park/rohnert-park-commercial-core/",
    centroid_lat: 38.339,
    centroid_lng: -122.714,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["retail", "local_services", "office", "highway_101", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-rohnert-park-redwood-drive-industrial",
    name: "Redwood Drive / Industrial",
    slug: "redwood-drive-industrial",
    city: "Rohnert Park",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/rohnert-park/redwood-drive-industrial/",
    centroid_lat: 38.353,
    centroid_lng: -122.715,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["light_industrial", "service_commercial", "warehouse_flex", "highway_101", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-downtown-windsor",
    name: "Downtown Windsor",
    slug: "downtown-windsor",
    city: "Windsor",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/windsor/downtown-windsor/",
    centroid_lat: 38.547,
    centroid_lng: -122.817,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["downtown", "local_retail", "professional_services", "northern_sonoma", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-shiloh-airport-boulevard",
    name: "Shiloh / Airport Boulevard",
    slug: "shiloh-airport-boulevard",
    city: "Windsor",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/windsor/shiloh-airport-boulevard/",
    centroid_lat: 38.523,
    centroid_lng: -122.79,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["airport_access", "office_flex", "light_industrial", "highway_101", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-downtown-healdsburg",
    name: "Downtown Healdsburg",
    slug: "downtown-healdsburg",
    city: "Healdsburg",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/healdsburg/downtown-healdsburg/",
    centroid_lat: 38.611,
    centroid_lng: -122.87,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["boutique_office", "hospitality_adjacent", "wine_country_services", "local_retail", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-healdsburg-industrial-grove-street",
    name: "Healdsburg Industrial / Grove Street",
    slug: "healdsburg-industrial-grove-street",
    city: "Healdsburg",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/healdsburg/healdsburg-industrial-grove-street/",
    centroid_lat: 38.62,
    centroid_lng: -122.87,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["light_industrial", "wine_industry_support", "production", "service_commercial", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-downtown-sonoma",
    name: "Downtown Sonoma",
    slug: "downtown-sonoma",
    city: "Sonoma",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sonoma/downtown-sonoma/",
    centroid_lat: 38.292,
    centroid_lng: -122.458,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["boutique_office", "local_retail", "wine_country_services", "professional_services", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-sonoma-valley-commercial-core",
    name: "Sonoma Valley Commercial Core",
    slug: "sonoma-valley-commercial-core",
    city: "Sonoma",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/sonoma/sonoma-valley-commercial-core/",
    centroid_lat: 38.31,
    centroid_lng: -122.49,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "retail", "flex"],
    profile: ["wine_country_services", "local_services", "retail", "professional_services", "sonoma_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-downtown-napa",
    name: "Downtown Napa",
    slug: "downtown-napa",
    city: "Napa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/napa/downtown-napa/",
    centroid_lat: 38.297,
    centroid_lng: -122.286,
    area_type: "downtown_core",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["downtown", "professional_services", "hospitality_adjacent", "retail", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/napa/1300-first-street/",
      "/commercial-real-estate/building/CA/napa/1455-1465-1st-st/",
      "/commercial-real-estate/building/CA/napa/main-st-3rd-st/",
    ],
  },
  {
    id: "nb-soscol-gateway-south-napa",
    name: "Soscol Gateway / South Napa",
    slug: "soscol-gateway-south-napa",
    city: "Napa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/napa/soscol-gateway-south-napa/",
    centroid_lat: 38.285,
    centroid_lng: -122.274,
    area_type: "commercial_corridor",
    approximate_space_types: ["retail", "office", "flex"],
    profile: ["retail", "service_commercial", "showroom", "auto_oriented", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/napa/main-st-3rd-st/",
      "/commercial-real-estate/building/CA/napa/1455-1465-1st-st/",
    ],
  },
  {
    id: "nb-napa-airport-industrial",
    name: "Napa Airport Industrial",
    slug: "napa-airport-industrial",
    city: "Napa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/napa/napa-airport-industrial/",
    centroid_lat: 38.215,
    centroid_lng: -122.28,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["industrial", "flex", "logistics", "wine_production_support", "airport_access", "napa_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-napa-valley-commons",
    name: "Napa Valley Commons",
    slug: "napa-valley-commons",
    city: "Napa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/napa/napa-valley-commons/",
    centroid_lat: 38.236,
    centroid_lng: -122.265,
    area_type: "business_park",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["business_park", "office_flex", "industrial", "regional_operations", "napa_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-trancas-north-napa",
    name: "Trancas / North Napa",
    slug: "trancas-north-napa",
    city: "Napa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/napa/trancas-north-napa/",
    centroid_lat: 38.324,
    centroid_lng: -122.309,
    area_type: "commercial_corridor",
    approximate_space_types: ["medical", "retail", "office"],
    profile: ["medical", "retail", "local_services", "north_napa", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/napa/1300-first-street/",
    ],
  },
  {
    id: "nb-american-canyon-industrial",
    name: "American Canyon Industrial",
    slug: "american-canyon-industrial",
    city: "American Canyon",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/american-canyon/american-canyon-industrial/",
    centroid_lat: 38.18,
    centroid_lng: -122.255,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["logistics", "warehouse", "distribution", "light_manufacturing", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/american-canyon/5-middleton-way/",
    ],
  },
  {
    id: "nb-green-island-road-napa-junction",
    name: "Green Island Road / Napa Junction",
    slug: "green-island-road-napa-junction",
    city: "American Canyon",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/american-canyon/green-island-road-napa-junction/",
    centroid_lat: 38.177,
    centroid_lng: -122.27,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["industrial", "flex", "service_commercial", "highway_29", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/american-canyon/5-middleton-way/",
    ],
  },
  {
    id: "nb-broadway-highway-29-commercial-corridor",
    name: "Broadway / Highway 29 Commercial Corridor",
    slug: "broadway-highway-29-commercial-corridor",
    city: "American Canyon",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/american-canyon/broadway-highway-29-commercial-corridor/",
    centroid_lat: 38.17,
    centroid_lng: -122.253,
    area_type: "commercial_corridor",
    approximate_space_types: ["retail", "office", "industrial"],
    profile: ["retail", "service_commercial", "highway_29", "local_services", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/american-canyon/5-middleton-way/",
    ],
  },
  {
    id: "nb-yountville-commercial-core",
    name: "Yountville Commercial Core",
    slug: "yountville-commercial-core",
    city: "Yountville",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/yountville/yountville-commercial-core/",
    centroid_lat: 38.402,
    centroid_lng: -122.361,
    area_type: "downtown_core",
    approximate_space_types: ["retail", "office"],
    profile: ["hospitality", "restaurant", "boutique_retail", "wine_country_services", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/yountville/6480-washington-st/",
    ],
  },
  {
    id: "nb-downtown-st-helena",
    name: "Downtown St. Helena",
    slug: "downtown-st-helena",
    city: "St. Helena",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/st-helena/downtown-st-helena/",
    centroid_lat: 38.505,
    centroid_lng: -122.47,
    area_type: "downtown_core",
    approximate_space_types: ["retail", "office", "medical"],
    profile: ["boutique_office", "hospitality", "wine_country_services", "retail", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/st-helena/1345-railroad-ave/",
    ],
  },
  {
    id: "nb-st-helena-wine-country-commercial-core",
    name: "St. Helena Wine Country Commercial Core",
    slug: "st-helena-wine-country-commercial-core",
    city: "St. Helena",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/st-helena/st-helena-wine-country-commercial-core/",
    centroid_lat: 38.515,
    centroid_lng: -122.475,
    area_type: "commercial_corridor",
    approximate_space_types: ["retail", "office", "flex"],
    profile: ["wine_country_services", "hospitality_support", "local_services", "retail", "napa_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/st-helena/1345-railroad-ave/",
    ],
  },
  {
    id: "nb-downtown-calistoga",
    name: "Downtown Calistoga",
    slug: "downtown-calistoga",
    city: "Calistoga",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/calistoga/downtown-calistoga/",
    centroid_lat: 38.578,
    centroid_lng: -122.579,
    area_type: "downtown_core",
    approximate_space_types: ["retail", "office"],
    profile: ["hospitality", "wellness", "wine_country_services", "local_retail", "napa_county"],
    representative_building_paths: [],
  },
  {
    id: "nb-calistoga-commercial-core",
    name: "Calistoga Commercial Core",
    slug: "calistoga-commercial-core",
    city: "Calistoga",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/calistoga/calistoga-commercial-core/",
    centroid_lat: 38.582,
    centroid_lng: -122.58,
    area_type: "commercial_corridor",
    approximate_space_types: ["retail", "office", "flex"],
    profile: ["hospitality_support", "wellness", "local_services", "wine_country_services", "napa_county"],
    representative_building_paths: [],
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
      "/commercial-real-estate/building/CA/sacramento/300-capitol-mall/",
      "/commercial-real-estate/building/CA/sacramento/320-capitol-mall/",
      "/commercial-real-estate/building/CA/sacramento/980-ninth-street/",
      "/commercial-real-estate/building/CA/sacramento/555-capitol-mall/",
      "/commercial-real-estate/building/CA/sacramento/621-capitol-mall/",
      "/commercial-real-estate/building/CA/sacramento/770-l-st/",
      "/commercial-real-estate/building/CA/sacramento/400-capitol-mall/",
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
      "/commercial-real-estate/building/CA/sacramento/2480-natomas-park-dr/",
      "/commercial-real-estate/building/CA/sacramento/2484-natomas-park-dr/",
      "/commercial-real-estate/building/CA/sacramento/2485-natomas-park-dr/",
      "/commercial-real-estate/building/CA/sacramento/2700-gateway-oaks-dr/",
      "/commercial-real-estate/building/CA/sacramento/2850-gateway-oaks-dr/",
      "/commercial-real-estate/building/CA/sacramento/2275-gateway-oaks-dr/",
      "/commercial-real-estate/building/CA/sacramento/2295-gateway-oaks-dr/",
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
      "/commercial-real-estate/building/CA/rancho-cordova/10265-rockingham-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/10690-white-rock-rd/",
      "/commercial-real-estate/building/CA/rancho-cordova/11135-trade-center-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/11167-trade-center-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/11201-sun-center-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/11249-gold-country-blvd/",
      "/commercial-real-estate/building/CA/rancho-cordova/3075-prospect-park-dr/",
      "/commercial-real-estate/building/CA/rancho-cordova/3100-zinfandel-dr/",
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
    id: "sac-rocklin-commercial-core",
    name: "Rocklin",
    slug: "rocklin-commercial-core",
    city: "Rocklin",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/rocklin/rocklin-commercial-core/",
    centroid_lat: 38.8,
    centroid_lng: -121.24,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail", "flex", "industrial"],
    profile: ["suburban_office", "medical", "local_services", "industrial_flex", "i80", "placer_county"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/rocklin/2203-plaza-dr/",
      "/commercial-real-estate/building/CA/rocklin/2205-plaza-dr/",
      "/commercial-real-estate/building/CA/rocklin/2210-plaza-dr/",
      "/commercial-real-estate/building/CA/rocklin/2540-warren-dr/",
      "/commercial-real-estate/building/CA/rocklin/3706-atherton-rd/",
      "/commercial-real-estate/building/CA/rocklin/3825-atherton-rd/",
      "/commercial-real-estate/building/CA/rocklin/3835-atherton-rd/",
      "/commercial-real-estate/building/CA/rocklin/4011-alvis-ct/",
      "/commercial-real-estate/building/CA/rocklin/4780-rocklin-rd/",
      "/commercial-real-estate/building/CA/rocklin/5905-6015-pacific-street/",
      "/commercial-real-estate/building/CA/rocklin/6815-five-star-blvd/",
      "/commercial-real-estate/building/CA/rocklin/6960-destiny-dr/",
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
      "/commercial-real-estate/building/CA/elk-grove/10000-waterman-rd/",
      "/commercial-real-estate/building/CA/elk-grove/10237-iron-rock-way/",
      "/commercial-real-estate/building/CA/elk-grove/10280-iron-rock-way/",
      "/commercial-real-estate/building/CA/elk-grove/9092-elkmont-way/",
      "/commercial-real-estate/building/CA/elk-grove/9250-laguna-springs-dr/",
      "/commercial-real-estate/building/CA/elk-grove/9275-laguna-springs-dr/",
      "/commercial-real-estate/building/CA/elk-grove/9263-bendel-pl/",
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
    id: "sd-little-italy-columbia",
    name: "Little Italy / Columbia",
    slug: "little-italy-columbia",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/little-italy-columbia/",
    centroid_lat: 32.724,
    centroid_lng: -117.169,
    area_type: "downtown_edge",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["downtown_edge", "client_facing", "creative_services", "waterfront_access", "airport_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/1420-kettner-blvd/",
      "/commercial-real-estate/building/CA/san-diego/1025-w-laurel-st/",
      "/commercial-real-estate/building/CA/san-diego/402-w-broadway/",
    ],
  },
  {
    id: "sd-east-village",
    name: "East Village",
    slug: "east-village",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/east-village/",
    centroid_lat: 32.711,
    centroid_lng: -117.153,
    area_type: "downtown_edge",
    approximate_space_types: ["office", "retail", "coworking"],
    profile: ["downtown_edge", "mixed_use", "creative_services", "hospitality_adjacent", "urban_office"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/350-10th-avenue/",
      "/commercial-real-estate/building/CA/san-diego/845-15th-st/",
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
    id: "sd-del-mar-heights-carmel-valley",
    name: "Del Mar Heights / Carmel Valley",
    slug: "del-mar-heights-carmel-valley",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/del-mar-heights-carmel-valley/",
    centroid_lat: 32.947,
    centroid_lng: -117.235,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail"],
    profile: ["coastal_office", "professional_services", "client_facing", "north_city", "executive_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/12707-and-12777-high-bluff-drive/",
      "/commercial-real-estate/building/CA/del-mar/1150-camino-del-mar/",
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
    id: "sd-mira-mesa",
    name: "Mira Mesa",
    slug: "mira-mesa",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/mira-mesa/",
    centroid_lat: 32.916,
    centroid_lng: -117.142,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "flex", "industrial", "retail"],
    profile: ["office_flex", "industrial_flex", "service_commercial", "north_city", "workforce_access"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/8250-camino-santa-fe/",
      "/commercial-real-estate/building/CA/san-diego/8525-camino-santa-fe/",
      "/commercial-real-estate/building/CA/san-diego/9151-rehco-rd/",
      "/commercial-real-estate/building/CA/san-diego/9155-brown-deer-rd/",
      "/commercial-real-estate/building/CA/san-diego/10620-treena-st/",
    ],
  },
  {
    id: "sd-rancho-bernardo",
    name: "Rancho Bernardo",
    slug: "rancho-bernardo",
    city: "San Diego",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-diego/rancho-bernardo/",
    centroid_lat: 33.02,
    centroid_lng: -117.081,
    area_type: "business_park",
    approximate_space_types: ["office", "flex", "industrial"],
    profile: ["i15_corridor", "business_park", "rd_flex", "manufacturing", "suburban_office"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-diego/10845-10875-rancho-bernardo-rd/",
      "/commercial-real-estate/building/CA/san-diego/11305-11315-rancho-bernardo-rd/",
      "/commercial-real-estate/building/CA/san-diego/11403-w-bernardo-ct/",
      "/commercial-real-estate/building/CA/san-diego/11413-w-bernardo-ct/",
      "/commercial-real-estate/building/CA/san-diego/11415-w-bernardo-ct/",
      "/commercial-real-estate/building/CA/san-diego/16644-w-bernardo-dr/",
      "/commercial-real-estate/building/CA/san-diego/16870-w-bernardo-court/",
      "/commercial-real-estate/building/CA/san-diego/16955-via-del-campo/",
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
    id: "sd-carlsbad-business-park",
    name: "Carlsbad Business Park",
    slug: "carlsbad-business-park",
    city: "Carlsbad",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/carlsbad/carlsbad-business-park/",
    centroid_lat: 33.134,
    centroid_lng: -117.27,
    area_type: "business_park",
    approximate_space_types: ["office", "flex", "industrial", "life_science"],
    profile: ["north_county", "business_park", "rd_flex", "manufacturing", "palomar_airport"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/carlsbad/1815-aston-ave/",
      "/commercial-real-estate/building/CA/carlsbad/1900-aston-ave/",
      "/commercial-real-estate/building/CA/carlsbad/1902-wright-place/",
      "/commercial-real-estate/building/CA/carlsbad/1903-wright-pl/",
      "/commercial-real-estate/building/CA/carlsbad/1945-camino-vida-roble/",
      "/commercial-real-estate/building/CA/carlsbad/2300-faraday-ave/",
      "/commercial-real-estate/building/CA/carlsbad/2730-loker-ave-w/",
      "/commercial-real-estate/building/CA/carlsbad/2776-loker-ave-w/",
    ],
  },
  {
    id: "sd-bressi-ranch",
    name: "Bressi Ranch",
    slug: "bressi-ranch",
    city: "Carlsbad",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/carlsbad/bressi-ranch/",
    centroid_lat: 33.126,
    centroid_lng: -117.252,
    area_type: "business_park",
    approximate_space_types: ["office", "medical", "flex", "retail"],
    profile: ["north_county", "business_park", "medical", "office_flex", "retail_supported"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/carlsbad/5858-edison-pl/",
      "/commercial-real-estate/building/CA/carlsbad/5910-sea-lion-pl/",
      "/commercial-real-estate/building/CA/carlsbad/6123-innovation-way/",
      "/commercial-real-estate/building/CA/carlsbad/6150-yarrow-dr/",
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
    id: "sd-oceanside-industrial",
    name: "Oceanside Industrial",
    slug: "oceanside-industrial",
    city: "Oceanside",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/oceanside/oceanside-industrial/",
    centroid_lat: 33.207,
    centroid_lng: -117.315,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["north_county", "industrial_flex", "service_commercial", "highway_78", "contractor"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/oceanside/1919-apple-st/",
      "/commercial-real-estate/building/CA/oceanside/2821-oceanside-blvd/",
      "/commercial-real-estate/building/CA/oceanside/2960-oceanside-blvd/",
      "/commercial-real-estate/building/CA/oceanside/4101-oceanside-blvd/",
      "/commercial-real-estate/building/CA/oceanside/4755-oceanside-blvd/",
      "/commercial-real-estate/building/CA/oceanside/503-jones-rd/",
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
    id: "sd-vista-business-park",
    name: "Vista Business Park",
    slug: "vista-business-park",
    city: "Vista",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/vista/vista-business-park/",
    centroid_lat: 33.152,
    centroid_lng: -117.225,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["north_county", "industrial_flex", "business_park", "manufacturing", "warehouse"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/vista/1120-sycamore-ave/",
      "/commercial-real-estate/building/CA/vista/1235-activity-dr/",
      "/commercial-real-estate/building/CA/vista/2425-la-mirada-dr/",
      "/commercial-real-estate/building/CA/vista/2445-grand-ave/",
      "/commercial-real-estate/building/CA/vista/2630-business-park-dr/",
      "/commercial-real-estate/building/CA/vista/2640-progress-st/",
      "/commercial-real-estate/building/CA/vista/2980-scott-st/",
      "/commercial-real-estate/building/CA/vista/925-poinsettia-ave/",
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
  {
    id: "sd-poway-business-park",
    name: "Poway Business Park",
    slug: "poway-business-park",
    city: "Poway",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/poway/poway-business-park/",
    centroid_lat: 32.94,
    centroid_lng: -117.04,
    area_type: "business_park",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["i15_corridor", "business_park", "industrial_flex", "manufacturing", "contractor"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/poway/12120-tech-center-dr/",
      "/commercial-real-estate/building/CA/poway/12175-paine-pl/",
      "/commercial-real-estate/building/CA/poway/12251-iavelli-way/",
      "/commercial-real-estate/building/CA/poway/12700-stowe-dr/",
      "/commercial-real-estate/building/CA/poway/12900-gregg-ct/",
      "/commercial-real-estate/building/CA/poway/13025-13029-danielson-st/",
      "/commercial-real-estate/building/CA/poway/13200-danielson-st/",
      "/commercial-real-estate/building/CA/poway/13985-stowe-dr/",
      "/commercial-real-estate/building/CA/poway/14035-14055-kirkham-way/",
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
    id: "oc-john-wayne-airport-area",
    name: "John Wayne Airport Area",
    slug: "john-wayne-airport-area",
    city: "Irvine",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/irvine/john-wayne-airport-area/",
    centroid_lat: 33.686,
    centroid_lng: -117.86,
    area_type: "district",
    approximate_space_types: ["office", "medical", "flex"],
    profile: ["office", "airport_access", "professional_services", "client_facing", "central_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/irvine/17777-main-st/",
      "/commercial-real-estate/building/CA/irvine/17835-skypark-cir/",
      "/commercial-real-estate/building/CA/irvine/17875-von-karman-ave/",
      "/commercial-real-estate/building/CA/irvine/17901-vonkarman-avenue/",
      "/commercial-real-estate/building/CA/irvine/19800-macarthur-blvd/",
    ],
  },
  {
    id: "oc-university-research-park",
    name: "University Research Park",
    slug: "university-research-park",
    city: "Irvine",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/irvine/university-research-park/",
    centroid_lat: 33.645,
    centroid_lng: -117.84,
    area_type: "business_park",
    approximate_space_types: ["office", "flex", "life_science"],
    profile: ["rd_flex", "technology", "life_science", "uc_irvine", "business_park"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/irvine/1-corporate-park/",
      "/commercial-real-estate/building/CA/irvine/10-hughes/",
      "/commercial-real-estate/building/CA/irvine/1672-reynolds-ave/",
      "/commercial-real-estate/building/CA/irvine/530-technology-dr/",
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
    id: "oc-costa-mesa-business-center",
    name: "Costa Mesa Business Center",
    slug: "costa-mesa-business-center",
    city: "Costa Mesa",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/costa-mesa/costa-mesa-business-center/",
    centroid_lat: 33.658,
    centroid_lng: -117.91,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "retail", "medical"],
    profile: ["local_services", "creative_services", "professional_services", "coastal_central_oc"],
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
    id: "oc-anaheim-canyon",
    name: "Anaheim Canyon",
    slug: "anaheim-canyon",
    city: "Anaheim",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/anaheim/anaheim-canyon/",
    centroid_lat: 33.858,
    centroid_lng: -117.803,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["industrial_flex", "warehouse", "manufacturing", "logistics", "north_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/anaheim/1161-n-cosby-way/",
      "/commercial-real-estate/building/CA/anaheim/1181-n-kraemer-blvd/",
      "/commercial-real-estate/building/CA/anaheim/1230-n-jefferson-st/",
      "/commercial-real-estate/building/CA/anaheim/2671-la-palma-ave/",
      "/commercial-real-estate/building/CA/anaheim/3071-e-coronado-st/",
      "/commercial-real-estate/building/CA/anaheim/4222-e-la-palma-ave/",
      "/commercial-real-estate/building/CA/anaheim/4501-e-la-palma-ave/",
      "/commercial-real-estate/building/CA/anaheim/4640-e-la-palma-ave/",
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
    id: "oc-santa-ana-airport-area",
    name: "Santa Ana Airport Area",
    slug: "santa-ana-airport-area",
    city: "Santa Ana",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/santa-ana/santa-ana-airport-area/",
    centroid_lat: 33.708,
    centroid_lng: -117.862,
    area_type: "commercial_corridor",
    approximate_space_types: ["office", "industrial", "flex"],
    profile: ["airport_access", "industrial_flex", "service_commercial", "central_oc"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/santa-ana/1261-e-dyer-rd/",
      "/commercial-real-estate/building/CA/santa-ana/2900-s-harbor-blvd/",
      "/commercial-real-estate/building/CA/santa-ana/1018-e-chestnut-ave/",
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
    id: "oc-tustin-legacy",
    name: "Tustin Legacy",
    slug: "tustin-legacy",
    city: "Tustin",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/tustin/tustin-legacy/",
    centroid_lat: 33.705,
    centroid_lng: -117.827,
    area_type: "district",
    approximate_space_types: ["office", "medical", "retail", "flex"],
    profile: ["mixed_use", "office", "medical", "central_oc", "irvine_edge"],
    representative_building_paths: [],
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
    id: "oc-lake-forest-business-center",
    name: "Lake Forest Business Center",
    slug: "lake-forest-business-center",
    city: "Lake Forest",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/lake-forest/lake-forest-business-center/",
    centroid_lat: 33.638,
    centroid_lng: -117.684,
    area_type: "business_park",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["industrial_flex", "business_park", "south_oc", "rd_flex", "service_commercial"],
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
  { id: "phx-tempe-i10-industrial", name: "Tempe I-10 Industrial", slug: "tempe-i-10-industrial", city: "Tempe", state_abbr: "AZ", path: "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/", centroid_lat: 33.375, centroid_lng: -111.95, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "office_warehouse", "service_industrial", "central_phoenix_metro"], representative_building_paths: ["/commercial-real-estate/building/AZ/tempe/6840-s-harl-ave/"] },
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

const chicagoMetroDistrictDefinitions = [
  { id: "chi-loop", name: "Loop", slug: "loop", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/loop/", centroid_lat: 41.878, centroid_lng: -87.63, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "finance", "legal", "transit"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/1-s-dearborn-st/", "/commercial-real-estate/building/IL/chicago/111-w-jackson-blvd/", "/commercial-real-estate/building/IL/chicago/125-s-wacker-dr/", "/commercial-real-estate/building/IL/chicago/203-n-lasalle-st/", "/commercial-real-estate/building/IL/chicago/55-e-monroe-st/"] },
  { id: "chi-west-loop", name: "West Loop", slug: "west-loop", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/west-loop/", centroid_lat: 41.883, centroid_lng: -87.648, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["central_office", "commuter_access", "professional_services", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/10-south-riverside-plaza/", "/commercial-real-estate/building/IL/chicago/200-s-wacker-dr/", "/commercial-real-estate/building/IL/chicago/222-s-riverside-plz/", "/commercial-real-estate/building/IL/chicago/564-w-randolph-st/", "/commercial-real-estate/building/IL/chicago/625-w-adams-st/"] },
  { id: "chi-fulton-market", name: "Fulton Market", slug: "fulton-market", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/fulton-market/", centroid_lat: 41.887, centroid_lng: -87.653, area_type: "district", approximate_space_types: ["office", "coworking", "retail", "flex"], profile: ["innovation", "creative_office", "adaptive_reuse", "restaurant_adjacent"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/159-n-sangamon-st/", "/commercial-real-estate/building/IL/chicago/1612-w-fulton-st/", "/commercial-real-estate/building/IL/chicago/167-n-green-st/", "/commercial-real-estate/building/IL/chicago/220-n-green-st/"] },
  { id: "chi-river-north", name: "River North", slug: "river-north", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/river-north/", centroid_lat: 41.893, centroid_lng: -87.633, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["client_facing", "hospitality", "design", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/330-n-wabash-ave/", "/commercial-real-estate/building/IL/chicago/401-n-michigan-ave/", "/commercial-real-estate/building/IL/chicago/448-n-la-salle-st/", "/commercial-real-estate/building/IL/chicago/515-n-state-st/"] },
  { id: "chi-streeterville", name: "Streeterville", slug: "streeterville", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/streeterville/", centroid_lat: 41.895, centroid_lng: -87.62, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["medical", "lakefront", "client_facing", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/180-n-stetson-street/", "/commercial-real-estate/building/IL/chicago/401-n-michigan-ave/", "/commercial-real-estate/building/IL/chicago/605-n-michigan-ave/", "/commercial-real-estate/building/IL/chicago/875-n-michigan-ave/"] },
  { id: "chi-magnificent-mile", name: "Magnificent Mile", slug: "magnificent-mile", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/magnificent-mile/", centroid_lat: 41.895, centroid_lng: -87.624, area_type: "corridor", approximate_space_types: ["office", "retail", "coworking"], profile: ["retail_visibility", "hospitality", "client_facing", "brand"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/401-n-michigan-ave/", "/commercial-real-estate/building/IL/chicago/605-n-michigan-ave/", "/commercial-real-estate/building/IL/chicago/875-n-michigan-ave/", "/commercial-real-estate/building/IL/chicago/980-n-michigan-ave/"] },
  { id: "chi-south-loop", name: "South Loop", slug: "south-loop", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/south-loop/", centroid_lat: 41.861, centroid_lng: -87.625, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["downtown_edge", "education_adjacent", "mixed_use", "local_services"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/1134-s-delano-ct-w/", "/commercial-real-estate/building/IL/chicago/1331-s-michigan-ave/"] },
  { id: "chi-lincoln-park", name: "Lincoln Park", slug: "lincoln-park", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/lincoln-park/", centroid_lat: 41.921, centroid_lng: -87.651, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["neighborhood_commercial", "local_services", "medical", "education_adjacent"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/1500-n-halsted-st/", "/commercial-real-estate/building/IL/chicago/939-w-north-ave/"] },
  { id: "chi-wicker-park-bucktown", name: "Wicker Park / Bucktown", slug: "wicker-park-bucktown", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/wicker-park-bucktown/", centroid_lat: 41.91, centroid_lng: -87.677, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["creative_office", "boutique_office", "storefront", "local_services"], representative_building_paths: [] },
  { id: "chi-lincoln-yards", name: "Lincoln Yards", slug: "lincoln-yards", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/lincoln-yards/", centroid_lat: 41.916, centroid_lng: -87.654, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["emerging_innovation", "north_branch", "mixed_use", "life_science_adjacent"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/1500-n-halsted-st/", "/commercial-real-estate/building/IL/chicago/1918-n-mendell-st/"] },
  { id: "chi-goose-island", name: "Goose Island", slug: "goose-island", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/goose-island/", centroid_lat: 41.906, centroid_lng: -87.653, area_type: "industrial_area", approximate_space_types: ["flex", "industrial", "office"], profile: ["rd_flex", "production", "adaptive_industrial", "north_branch"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/1918-n-mendell-st/"] },
  { id: "chi-illinois-medical-district", name: "Illinois Medical District", slug: "illinois-medical-district", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/illinois-medical-district/", centroid_lat: 41.871, centroid_lng: -87.669, area_type: "district", approximate_space_types: ["medical", "office", "lab"], profile: ["medical", "life_science", "research", "institutional"], representative_building_paths: [] },
  { id: "chi-ohare-industrial", name: "O'Hare Industrial", slug: "ohare-industrial", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/ohare-industrial/", centroid_lat: 41.979, centroid_lng: -87.896, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "warehouse", "service_industrial"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/5440-n-cumberland-ave/", "/commercial-real-estate/building/IL/chicago/8623-w-bryn-mawr-ave/", "/commercial-real-estate/building/IL/chicago/8770-w-bryn-mawr-ave/"] },
  { id: "chi-elk-grove-village", name: "Elk Grove Village", slug: "elk-grove-village", city: "Elk Grove Village", state_abbr: "IL", path: "/commercial-real-estate/IL/elk-grove-village/elk-grove-village/", centroid_lat: 42.008, centroid_lng: -87.993, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_park", "warehouse", "manufacturing", "ohare_adjacent"], representative_building_paths: ["/commercial-real-estate/building/IL/elk-grove-village/1221-jarvis-ave/", "/commercial-real-estate/building/IL/elk-grove-village/1872-brummel-ave/", "/commercial-real-estate/building/IL/elk-grove-village/2301-lunt-ave/", "/commercial-real-estate/building/IL/elk-grove-village/801-chase-ave/"] },
  { id: "chi-schaumburg", name: "Schaumburg", slug: "schaumburg", city: "Schaumburg", state_abbr: "IL", path: "/commercial-real-estate/IL/schaumburg/schaumburg/", centroid_lat: 42.034, centroid_lng: -88.083, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["suburban_office", "medical", "retail_support", "office_flex"], representative_building_paths: ["/commercial-real-estate/building/IL/schaumburg/10-n-martingale-rd/", "/commercial-real-estate/building/IL/schaumburg/1100-e-woodfield-rd/", "/commercial-real-estate/building/IL/schaumburg/1375-e-woodfield-rd/", "/commercial-real-estate/building/IL/schaumburg/900-national-pkwy/"] },
  { id: "chi-franklin-park", name: "Franklin Park", slug: "franklin-park", city: "Franklin Park", state_abbr: "IL", path: "/commercial-real-estate/IL/franklin-park/franklin-park/", centroid_lat: 41.936, centroid_lng: -87.874, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "manufacturing", "freight", "ohare_adjacent"], representative_building_paths: ["/commercial-real-estate/building/IL/franklin-park/11130-king-st/"] },
  { id: "chi-melrose-park", name: "Melrose Park", slug: "melrose-park", city: "Melrose Park", state_abbr: "IL", path: "/commercial-real-estate/IL/melrose-park/melrose-park/", centroid_lat: 41.9, centroid_lng: -87.86, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["manufacturing", "warehouse", "service_industrial", "west_suburban"], representative_building_paths: [] },
  { id: "chi-bedford-park", name: "Bedford Park", slug: "bedford-park", city: "Bedford Park", state_abbr: "IL", path: "/commercial-real-estate/IL/bedford-park/bedford-park/", centroid_lat: 41.763, centroid_lng: -87.79, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "manufacturing", "freight", "midway_adjacent"], representative_building_paths: ["/commercial-real-estate/building/IL/bedford-park/6410-w-74th-st/"] },
  { id: "chi-cicero", name: "Cicero", slug: "cicero", city: "Cicero", state_abbr: "IL", path: "/commercial-real-estate/IL/cicero/cicero/", centroid_lat: 41.845, centroid_lng: -87.753, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "retail"], profile: ["service_industrial", "warehouse_flex", "contractor", "close_in"], representative_building_paths: ["/commercial-real-estate/building/IL/cicero/1400-s-laramie-ave/"] },
  { id: "chi-bridgeport-stockyards", name: "Bridgeport / Stockyards", slug: "bridgeport-stockyards", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/bridgeport-stockyards/", centroid_lat: 41.829, centroid_lng: -87.649, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "retail"], profile: ["industrial_transition", "food_production", "service_commercial", "adaptive_industrial"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/4130-s-morgan-st/"] },
  { id: "chi-back-of-the-yards", name: "Back of the Yards", slug: "back-of-the-yards", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/back-of-the-yards/", centroid_lat: 41.807, centroid_lng: -87.662, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["manufacturing", "food_production", "service_industrial", "south_side"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/4130-s-morgan-st/", "/commercial-real-estate/building/IL/chicago/4600-s-kolin-ave/"] },
  { id: "chi-calumet-south-chicago-industrial", name: "Calumet / South Chicago Industrial", slug: "calumet-south-chicago-industrial", city: "Chicago", state_abbr: "IL", path: "/commercial-real-estate/IL/chicago/calumet-south-chicago-industrial/", centroid_lat: 41.724, centroid_lng: -87.547, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["heavy_industrial", "logistics", "manufacturing", "southeast_chicago"], representative_building_paths: ["/commercial-real-estate/building/IL/chicago/1515-e-97th-pl/", "/commercial-real-estate/building/IL/chicago/8658-s-sacramento-ave/"] },
  { id: "chi-joliet", name: "Joliet", slug: "joliet", city: "Joliet", state_abbr: "IL", path: "/commercial-real-estate/IL/joliet/joliet/", centroid_lat: 41.526, centroid_lng: -88.081, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["logistics", "warehouse", "intermodal", "manufacturing"], representative_building_paths: ["/commercial-real-estate/building/IL/joliet/1151-e-laraway-rd/"] },
  { id: "chi-bolingbrook", name: "Bolingbrook", slug: "bolingbrook", city: "Bolingbrook", state_abbr: "IL", path: "/commercial-real-estate/IL/bolingbrook/bolingbrook/", centroid_lat: 41.699, centroid_lng: -88.068, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["i55_logistics", "warehouse", "office_flex", "service_industrial"], representative_building_paths: ["/commercial-real-estate/building/IL/bolingbrook/215-remington-blvd/", "/commercial-real-estate/building/IL/bolingbrook/396-remington-blvd/", "/commercial-real-estate/building/IL/bolingbrook/440-quadrangle-dr/"] },
  { id: "chi-romeoville", name: "Romeoville", slug: "romeoville", city: "Romeoville", state_abbr: "IL", path: "/commercial-real-estate/IL/romeoville/romeoville/", centroid_lat: 41.647, centroid_lng: -88.09, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["i55_logistics", "warehouse", "manufacturing", "industrial_park"], representative_building_paths: ["/commercial-real-estate/building/IL/romeoville/1200-n-schmidt-rd/", "/commercial-real-estate/building/IL/romeoville/1250-windham-pkwy/", "/commercial-real-estate/building/IL/romeoville/1295-windham-pkwy/", "/commercial-real-estate/building/IL/romeoville/187-southcreek-pkwy/"] },
  { id: "chi-oak-brook", name: "Oak Brook", slug: "oak-brook", city: "Oak Brook", state_abbr: "IL", path: "/commercial-real-estate/IL/oak-brook/oak-brook/", centroid_lat: 41.839, centroid_lng: -87.953, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "corporate", "professional_services", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/IL/oak-brook/1415-w-22nd-st/", "/commercial-real-estate/building/IL/oak-brook/1800-york-rd/", "/commercial-real-estate/building/IL/oak-brook/2625-butterfield-rd/", "/commercial-real-estate/building/IL/oak-brook/711-jorie-blvd/"] },
  { id: "chi-naperville", name: "Naperville", slug: "naperville", city: "Naperville", state_abbr: "IL", path: "/commercial-real-estate/IL/naperville/naperville/", centroid_lat: 41.751, centroid_lng: -88.153, area_type: "district", approximate_space_types: ["office", "medical", "retail", "flex"], profile: ["west_suburban", "professional_services", "medical", "business_park"], representative_building_paths: ["/commercial-real-estate/building/IL/naperville/1100-e-warrenville-rd/", "/commercial-real-estate/building/IL/naperville/1415-w-diehl-rd/", "/commercial-real-estate/building/IL/naperville/50-s-main-st/", "/commercial-real-estate/building/IL/naperville/535-e-diehl-rd/"] },
  { id: "chi-rosemont", name: "Rosemont", slug: "rosemont", city: "Rosemont", state_abbr: "IL", path: "/commercial-real-estate/IL/rosemont/rosemont/", centroid_lat: 41.986, centroid_lng: -87.873, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["airport_adjacent", "hospitality", "convention", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/IL/rosemont/5600-n-river-rd/"] },
  { id: "chi-evanston", name: "Evanston", slug: "evanston", city: "Evanston", state_abbr: "IL", path: "/commercial-real-estate/IL/evanston/evanston/", centroid_lat: 42.045, centroid_lng: -87.68, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["university_adjacent", "professional_services", "medical", "north_shore"], representative_building_paths: ["/commercial-real-estate/building/IL/evanston/1603-orrington-ave/"] },
  { id: "chi-skokie", name: "Skokie", slug: "skokie", city: "Skokie", state_abbr: "IL", path: "/commercial-real-estate/IL/skokie/skokie/", centroid_lat: 42.033, centroid_lng: -87.733, area_type: "district", approximate_space_types: ["office", "medical", "retail", "flex"], profile: ["north_suburban", "service_commercial", "medical", "light_flex"], representative_building_paths: ["/commercial-real-estate/building/IL/skokie/3500-oakton-st/", "/commercial-real-estate/building/IL/skokie/5250-old-orchard-rd/", "/commercial-real-estate/building/IL/skokie/5834-w-howard-st/"] },
  { id: "chi-northbrook", name: "Northbrook", slug: "northbrook", city: "Northbrook", state_abbr: "IL", path: "/commercial-real-estate/IL/northbrook/northbrook/", centroid_lat: 42.128, centroid_lng: -87.829, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["north_shore", "office", "medical", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/IL/northbrook/5-revere-drive-one-northbrook-place/", "/commercial-real-estate/building/IL/northbrook/707-skokie-blvd/"] },
  { id: "chi-deerfield", name: "Deerfield", slug: "deerfield", city: "Deerfield", state_abbr: "IL", path: "/commercial-real-estate/IL/deerfield/deerfield/", centroid_lat: 42.166, centroid_lng: -87.851, area_type: "district", approximate_space_types: ["office", "medical"], profile: ["corporate", "business_park", "medical", "north_suburban"], representative_building_paths: ["/commercial-real-estate/building/IL/deerfield/111-deer-lake-rd/", "/commercial-real-estate/building/IL/deerfield/1717-deerfield-rd/", "/commercial-real-estate/building/IL/deerfield/2801-lakeside-dr/", "/commercial-real-estate/building/IL/deerfield/3000-lakeside-dr/"] },
  { id: "chi-downers-grove", name: "Downers Grove", slug: "downers-grove", city: "Downers Grove", state_abbr: "IL", path: "/commercial-real-estate/IL/downers-grove/downers-grove/", centroid_lat: 41.808, centroid_lng: -88.011, area_type: "district", approximate_space_types: ["office", "medical", "flex"], profile: ["i88_office", "business_park", "professional_services", "office_flex"], representative_building_paths: ["/commercial-real-estate/building/IL/downers-grove/1431-opus-place/", "/commercial-real-estate/building/IL/downers-grove/2300-warrenville-rd/", "/commercial-real-estate/building/IL/downers-grove/3300-woodcreek-dr/"] },
  { id: "chi-lisle", name: "Lisle", slug: "lisle", city: "Lisle", state_abbr: "IL", path: "/commercial-real-estate/IL/lisle/lisle/", centroid_lat: 41.801, centroid_lng: -88.075, area_type: "district", approximate_space_types: ["office", "flex"], profile: ["i88_office", "business_park", "corporate_support", "office_flex"], representative_building_paths: ["/commercial-real-estate/building/IL/lisle/2200-cabot-dr/", "/commercial-real-estate/building/IL/lisle/2300-cabot-dr/", "/commercial-real-estate/building/IL/lisle/3030-warrenville-rd/", "/commercial-real-estate/building/IL/lisle/3333-warrenville-rd/"] },
];

const dcMetroDistrictDefinitions = [
  { id: "dc-downtown-dc", name: "Downtown DC", slug: "downtown-dc", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/downtown-dc/", centroid_lat: 38.902, centroid_lng: -77.033, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["government", "office", "law", "policy", "transit"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/1101-pennsylvania-ave-nw/", "/commercial-real-estate/building/DC/washington/1200-g-st-nw/", "/commercial-real-estate/building/DC/washington/1300-i-st-nw/", "/commercial-real-estate/building/DC/washington/700-k-st-nw/"] },
  { id: "dc-east-end-penn-quarter", name: "East End / Penn Quarter", slug: "east-end-penn-quarter", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/east-end-penn-quarter/", centroid_lat: 38.898, centroid_lng: -77.023, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["central_office", "hospitality", "association", "cultural"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/601-pennsylvania-avenue-nw-south-building/", "/commercial-real-estate/building/DC/washington/1101-pennsylvania-ave-nw/", "/commercial-real-estate/building/DC/washington/1200-g-st-nw/"] },
  { id: "dc-capitol-hill", name: "Capitol Hill", slug: "capitol-hill", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/capitol-hill/", centroid_lat: 38.889, centroid_lng: -77.009, area_type: "district", approximate_space_types: ["office", "retail"], profile: ["government_affairs", "policy", "association", "legal"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/20-f-st-nw/", "/commercial-real-estate/building/DC/washington/200-massachusetts-ave-nw/", "/commercial-real-estate/building/DC/washington/601-pennsylvania-avenue-nw-south-building/"] },
  { id: "dc-dupont-circle", name: "Dupont Circle", slug: "dupont-circle", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/dupont-circle/", centroid_lat: 38.91, centroid_lng: -77.044, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["boutique_office", "policy", "nonprofit", "embassy_adjacent"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/1701-rhode-island-ave-nw/", "/commercial-real-estate/building/DC/washington/2025-m-st-nw/", "/commercial-real-estate/building/DC/washington/1015-15th-st-nw/"] },
  { id: "dc-west-end", name: "West End", slug: "west-end", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/west-end/", centroid_lat: 38.905, centroid_lng: -77.052, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "medical", "professional_services", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/2025-m-st-nw/", "/commercial-real-estate/building/DC/washington/1701-rhode-island-ave-nw/"] },
  { id: "dc-georgetown", name: "Georgetown", slug: "georgetown", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/georgetown/", centroid_lat: 38.907, centroid_lng: -77.064, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["boutique_office", "retail_support", "university_adjacent", "client_facing"], representative_building_paths: [] },
  { id: "dc-noma", name: "NoMa", slug: "noma", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/noma/", centroid_lat: 38.907, centroid_lng: -77.004, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["transit_oriented", "modern_office", "association", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/609-h-st-ne/", "/commercial-real-estate/building/DC/washington/200-massachusetts-ave-nw/"] },
  { id: "dc-navy-yard", name: "Navy Yard", slug: "navy-yard", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/navy-yard/", centroid_lat: 38.875, centroid_lng: -77.005, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["waterfront", "government_adjacent", "modern_office", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/80-m-st-se/", "/commercial-real-estate/building/DC/washington/100-m-st-se/"] },
  { id: "dc-capitol-riverfront", name: "Capitol Riverfront", slug: "capitol-riverfront", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/capitol-riverfront/", centroid_lat: 38.874, centroid_lng: -77.007, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["waterfront", "modern_office", "mixed_use", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/100-m-st-se/", "/commercial-real-estate/building/DC/washington/80-m-st-se/"] },
  { id: "dc-k-street-corridor", name: "K Street Corridor", slug: "k-street-corridor", city: "Washington", state_abbr: "DC", path: "/commercial-real-estate/DC/washington/k-street-corridor/", centroid_lat: 38.902, centroid_lng: -77.041, area_type: "corridor", approximate_space_types: ["office", "coworking"], profile: ["law", "lobbying", "policy", "consulting"], representative_building_paths: ["/commercial-real-estate/building/DC/washington/1500-k-street-2nd-floor/", "/commercial-real-estate/building/DC/washington/1015-15th-street-nw-6th-floor/", "/commercial-real-estate/building/DC/washington/1100-15th-st-nw/"] },
  { id: "dc-rosslyn", name: "Rosslyn", slug: "rosslyn", city: "Arlington", state_abbr: "VA", path: "/commercial-real-estate/VA/arlington/rosslyn/", centroid_lat: 38.895, centroid_lng: -77.072, area_type: "district", approximate_space_types: ["office", "coworking"], profile: ["federal_contracting", "defense", "transit", "high_rise_office"], representative_building_paths: ["/commercial-real-estate/building/VA/arlington/1101-wilson-blvd/", "/commercial-real-estate/building/VA/arlington/1201-wilson-blvd/", "/commercial-real-estate/building/VA/arlington/1655-north-fort-myer-drive/"] },
  { id: "dc-ballston", name: "Ballston", slug: "ballston", city: "Arlington", state_abbr: "VA", path: "/commercial-real-estate/VA/arlington/ballston/", centroid_lat: 38.881, centroid_lng: -77.111, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["arlington_corridor", "technology", "research", "transit"], representative_building_paths: ["/commercial-real-estate/building/VA/arlington/4250-n-fairfax-dr/", "/commercial-real-estate/building/VA/arlington/901-n-glebe-rd/"] },
  { id: "dc-crystal-city", name: "Crystal City", slug: "crystal-city", city: "Arlington", state_abbr: "VA", path: "/commercial-real-estate/VA/arlington/crystal-city/", centroid_lat: 38.857, centroid_lng: -77.05, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["defense", "airport_adjacent", "federal_contracting", "national_landing"], representative_building_paths: [] },
  { id: "dc-pentagon-city", name: "Pentagon City", slug: "pentagon-city", city: "Arlington", state_abbr: "VA", path: "/commercial-real-estate/VA/arlington/pentagon-city/", centroid_lat: 38.862, centroid_lng: -77.059, area_type: "district", approximate_space_types: ["office", "retail"], profile: ["pentagon_adjacent", "retail_support", "mixed_use", "transit"], representative_building_paths: [] },
  { id: "dc-national-landing", name: "National Landing", slug: "national-landing", city: "Arlington", state_abbr: "VA", path: "/commercial-real-estate/VA/arlington/national-landing/", centroid_lat: 38.858, centroid_lng: -77.052, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["defense", "technology", "growth_market", "airport_adjacent"], representative_building_paths: [] },
  { id: "dc-tysons", name: "Tysons", slug: "tysons", city: "Tysons Corner", state_abbr: "VA", path: "/commercial-real-estate/VA/tysons-corner/tysons/", centroid_lat: 38.918, centroid_lng: -77.222, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["corporate", "consulting", "technology", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/VA/tysons-corner/7921-jones-branch-dr/", "/commercial-real-estate/building/VA/tysons-corner/8245-boone-blvd/", "/commercial-real-estate/building/VA/vienna/8000-towers-crescent-dr/", "/commercial-real-estate/building/VA/vienna/8300-boone-blvd/"] },
  { id: "dc-reston", name: "Reston", slug: "reston", city: "Reston", state_abbr: "VA", path: "/commercial-real-estate/VA/reston/reston/", centroid_lat: 38.958, centroid_lng: -77.357, area_type: "district", approximate_space_types: ["office", "flex", "coworking"], profile: ["technology", "cybersecurity", "government_contracting", "dulles_corridor"], representative_building_paths: ["/commercial-real-estate/building/VA/reston/11921-freedom-drive-two-fountain-square/", "/commercial-real-estate/building/VA/reston/11951-freedom-dr/", "/commercial-real-estate/building/VA/reston/12020-sunrise-valley-dr/", "/commercial-real-estate/building/VA/reston/1900-reston-metro-plaza/"] },
  { id: "dc-herndon", name: "Herndon", slug: "herndon", city: "Herndon", state_abbr: "VA", path: "/commercial-real-estate/VA/herndon/herndon/", centroid_lat: 38.969, centroid_lng: -77.386, area_type: "district", approximate_space_types: ["office", "flex"], profile: ["dulles_corridor", "technology", "office_flex", "airport_adjacent"], representative_building_paths: ["/commercial-real-estate/building/VA/herndon/13800-coppermine-rd/", "/commercial-real-estate/building/VA/herndon/251-exchange-pl/", "/commercial-real-estate/building/VA/herndon/570-herndon-pkwy/"] },
  { id: "dc-fairfax", name: "Fairfax", slug: "fairfax", city: "Fairfax", state_abbr: "VA", path: "/commercial-real-estate/VA/fairfax/fairfax/", centroid_lat: 38.857, centroid_lng: -77.331, area_type: "district", approximate_space_types: ["office", "medical", "flex"], profile: ["suburban_office", "medical", "government_contracting", "education_adjacent"], representative_building_paths: ["/commercial-real-estate/building/VA/fairfax/11350-random-hills-rd/", "/commercial-real-estate/building/VA/fairfax/2700-prosperity-ave/", "/commercial-real-estate/building/VA/fairfax/3949-pender-dr/", "/commercial-real-estate/building/VA/fairfax/8280-willow-oaks-corporate-dr/"] },
  { id: "dc-chantilly", name: "Chantilly", slug: "chantilly", city: "Chantilly", state_abbr: "VA", path: "/commercial-real-estate/VA/chantilly/chantilly/", centroid_lat: 38.894, centroid_lng: -77.431, area_type: "district", approximate_space_types: ["office", "flex", "industrial"], profile: ["defense", "aerospace", "office_flex", "dulles_access"], representative_building_paths: ["/commercial-real-estate/building/VA/chantilly/14100-sullyfield-cir/", "/commercial-real-estate/building/VA/chantilly/14101-sullyfield-cir/", "/commercial-real-estate/building/VA/chantilly/3901-stonecroft-blvd/", "/commercial-real-estate/building/VA/chantilly/4115-pleasant-valley-rd/"] },
  { id: "dc-dulles-corridor", name: "Dulles Corridor", slug: "dulles-corridor", city: "Herndon", state_abbr: "VA", path: "/commercial-real-estate/VA/herndon/dulles-corridor/", centroid_lat: 38.951, centroid_lng: -77.445, area_type: "corridor", approximate_space_types: ["office", "flex", "industrial"], profile: ["technology", "data_center_adjacent", "airport_access", "office_flex"], representative_building_paths: ["/commercial-real-estate/building/VA/herndon/13800-coppermine-rd/", "/commercial-real-estate/building/VA/chantilly/3901-stonecroft-blvd/", "/commercial-real-estate/building/VA/ashburn/20130-lakeview-center-plaza/"] },
  { id: "dc-ashburn", name: "Ashburn", slug: "ashburn", city: "Ashburn", state_abbr: "VA", path: "/commercial-real-estate/VA/ashburn/ashburn/", centroid_lat: 39.043, centroid_lng: -77.487, area_type: "district", approximate_space_types: ["office", "flex", "industrial"], profile: ["data_center", "technology", "cloud", "infrastructure"], representative_building_paths: ["/commercial-real-estate/building/VA/ashburn/19980-highland-vista-dr/", "/commercial-real-estate/building/VA/ashburn/20098-ashbrook-pl/", "/commercial-real-estate/building/VA/ashburn/20130-lakeview-center-plaza/", "/commercial-real-estate/building/VA/ashburn/44611-guilford-dr/"] },
  { id: "dc-alexandria", name: "Alexandria", slug: "alexandria", city: "Alexandria", state_abbr: "VA", path: "/commercial-real-estate/VA/alexandria/alexandria/", centroid_lat: 38.805, centroid_lng: -77.047, area_type: "district", approximate_space_types: ["office", "medical", "flex", "retail"], profile: ["local_office", "federal_adjacent", "professional_services", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/VA/alexandria/2000-duke-st/", "/commercial-real-estate/building/VA/alexandria/211-n-union-st-suite-100/", "/commercial-real-estate/building/VA/alexandria/4823-eisenhower-ave/", "/commercial-real-estate/building/VA/alexandria/5600-general-washington-dr/"] },
  { id: "dc-springfield", name: "Springfield", slug: "springfield", city: "Springfield", state_abbr: "VA", path: "/commercial-real-estate/VA/springfield/springfield/", centroid_lat: 38.789, centroid_lng: -77.187, area_type: "district", approximate_space_types: ["office", "flex", "industrial"], profile: ["i95_access", "office_flex", "service_industrial", "defense_adjacent"], representative_building_paths: ["/commercial-real-estate/building/VA/springfield/6608-electronic-dr/", "/commercial-real-estate/building/VA/springfield/7406-alban-station-ct/", "/commercial-real-estate/building/VA/springfield/8320-alban-road/"] },
  { id: "dc-bethesda", name: "Bethesda", slug: "bethesda", city: "Bethesda", state_abbr: "MD", path: "/commercial-real-estate/MD/bethesda/bethesda/", centroid_lat: 38.985, centroid_lng: -77.095, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["life_science", "medical", "client_facing", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/MD/bethesda/3-bethesda-metro-ctr/", "/commercial-real-estate/building/MD/bethesda/6701-democracy-blvd/", "/commercial-real-estate/building/MD/bethesda/7272-wisconsin-ave/"] },
  { id: "dc-silver-spring", name: "Silver Spring", slug: "silver-spring", city: "Silver Spring", state_abbr: "MD", path: "/commercial-real-estate/MD/silver-spring/silver-spring/", centroid_lat: 38.997, centroid_lng: -77.027, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["transit", "civic", "nonprofit", "medical"], representative_building_paths: ["/commercial-real-estate/building/MD/silver-spring/8403-colesville-rd/", "/commercial-real-estate/building/MD/silver-spring/12510-prosperity-dr/"] },
  { id: "dc-rockville", name: "Rockville", slug: "rockville", city: "Rockville", state_abbr: "MD", path: "/commercial-real-estate/MD/rockville/rockville/", centroid_lat: 39.084, centroid_lng: -77.152, area_type: "district", approximate_space_types: ["office", "medical", "flex", "lab"], profile: ["biotech", "life_science", "rd_flex", "i270"], representative_building_paths: ["/commercial-real-estate/building/MD/rockville/11810-grand-park-ave/", "/commercial-real-estate/building/MD/rockville/11820-parklawn-dr/", "/commercial-real-estate/building/MD/rockville/199-e-montgomery-ave/", "/commercial-real-estate/building/MD/rockville/9201-corporate-blvd/"] },
  { id: "dc-gaithersburg", name: "Gaithersburg", slug: "gaithersburg", city: "Gaithersburg", state_abbr: "MD", path: "/commercial-real-estate/MD/gaithersburg/gaithersburg/", centroid_lat: 39.143, centroid_lng: -77.201, area_type: "district", approximate_space_types: ["office", "medical", "flex", "lab"], profile: ["i270", "biotech", "life_science", "office_park"], representative_building_paths: ["/commercial-real-estate/building/MD/gaithersburg/9711-washingtonian-blvd/"] },
  { id: "dc-college-park", name: "College Park", slug: "college-park", city: "College Park", state_abbr: "MD", path: "/commercial-real-estate/MD/college-park/college-park/", centroid_lat: 38.989, centroid_lng: -76.936, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["university_adjacent", "research", "technology", "startup"], representative_building_paths: ["/commercial-real-estate/building/MD/college-park/7761-diamondback-dr/"] },
];

const bostonMetroDistrictDefinitions = [
  { id: "bos-downtown-boston", name: "Downtown Boston", slug: "downtown-boston", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/downtown-boston/", centroid_lat: 42.358, centroid_lng: -71.058, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "finance", "legal", "transit"], representative_building_paths: ["/commercial-real-estate/building/MA/boston/1-beacon-st/", "/commercial-real-estate/building/MA/boston/1-lincoln-st/", "/commercial-real-estate/building/MA/boston/101-arch-st/", "/commercial-real-estate/building/MA/boston/33-arch-st/"] },
  { id: "bos-financial-district", name: "Financial District", slug: "financial-district", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/financial-district/", centroid_lat: 42.356, centroid_lng: -71.054, area_type: "downtown_core", approximate_space_types: ["office", "coworking"], profile: ["finance", "legal", "insurance", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/MA/boston/101-federal-st/", "/commercial-real-estate/building/MA/boston/75-state-st/", "/commercial-real-estate/building/MA/boston/470-atlantic-ave/", "/commercial-real-estate/building/MA/boston/711-atlantic-ave/"] },
  { id: "bos-back-bay", name: "Back Bay", slug: "back-bay", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/back-bay/", centroid_lat: 42.35, centroid_lng: -71.081, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "professional_services", "retail_support", "medical_adjacent"], representative_building_paths: ["/commercial-real-estate/building/MA/boston/501-boylston-st/", "/commercial-real-estate/building/MA/boston/75-arlington-st/", "/commercial-real-estate/building/MA/boston/800-boylston-st/", "/commercial-real-estate/building/MA/boston/361-newbury-st/"] },
  { id: "bos-seaport", name: "Seaport", slug: "seaport", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/seaport/", centroid_lat: 42.35, centroid_lng: -71.043, area_type: "district", approximate_space_types: ["office", "coworking", "retail", "lab"], profile: ["modern_office", "waterfront", "innovation", "technology"], representative_building_paths: ["/commercial-real-estate/building/MA/boston/1-marina-park-dr/", "/commercial-real-estate/building/MA/boston/77-sleeper-st/", "/commercial-real-estate/building/MA/boston/470-atlantic-ave/"] },
  { id: "bos-south-boston", name: "South Boston", slug: "south-boston", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/south-boston/", centroid_lat: 42.338, centroid_lng: -71.044, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["waterfront_adjacent", "local_services", "mixed_use", "production_adjacent"], representative_building_paths: [] },
  { id: "bos-fenway", name: "Fenway", slug: "fenway", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/fenway/", centroid_lat: 42.343, centroid_lng: -71.1, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["medical_adjacent", "education_adjacent", "mixed_use", "local_services"], representative_building_paths: ["/commercial-real-estate/building/MA/boston/177-huntington-ave/"] },
  { id: "bos-government-center", name: "Government Center", slug: "government-center", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/government-center/", centroid_lat: 42.36, centroid_lng: -71.059, area_type: "district", approximate_space_types: ["office", "retail"], profile: ["civic", "legal", "public_sector", "transit"], representative_building_paths: ["/commercial-real-estate/building/MA/boston/100-cambridge-st/", "/commercial-real-estate/building/MA/boston/1-beacon-st/"] },
  { id: "bos-north-station", name: "North Station", slug: "north-station", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/north-station/", centroid_lat: 42.366, centroid_lng: -71.062, area_type: "district", approximate_space_types: ["office", "retail"], profile: ["transit", "arena_adjacent", "mixed_use", "downtown_edge"], representative_building_paths: ["/commercial-real-estate/building/MA/boston/90-canal-st/", "/commercial-real-estate/building/MA/boston/200-portland-st/"] },
  { id: "bos-kendall-square", name: "Kendall Square", slug: "kendall-square", city: "Cambridge", state_abbr: "MA", path: "/commercial-real-estate/MA/cambridge/kendall-square/", centroid_lat: 42.363, centroid_lng: -71.085, area_type: "district", approximate_space_types: ["office", "lab", "flex"], profile: ["life_science", "biotech", "research", "technology"], representative_building_paths: ["/commercial-real-estate/building/MA/cambridge/245-first-street/", "/commercial-real-estate/building/MA/cambridge/625-massachusetts-ave/"] },
  { id: "bos-east-cambridge", name: "East Cambridge", slug: "east-cambridge", city: "Cambridge", state_abbr: "MA", path: "/commercial-real-estate/MA/cambridge/east-cambridge/", centroid_lat: 42.371, centroid_lng: -71.083, area_type: "district", approximate_space_types: ["office", "lab", "retail"], profile: ["life_science", "mixed_office", "kendall_adjacent", "legal"], representative_building_paths: ["/commercial-real-estate/building/MA/cambridge/245-first-street/"] },
  { id: "bos-cambridge", name: "Cambridge", slug: "cambridge", city: "Cambridge", state_abbr: "MA", path: "/commercial-real-estate/MA/cambridge/cambridge/", centroid_lat: 42.374, centroid_lng: -71.11, area_type: "district", approximate_space_types: ["office", "lab", "retail"], profile: ["research", "technology", "life_science", "university_adjacent"], representative_building_paths: ["/commercial-real-estate/building/MA/cambridge/125-cambridge-park-dr/", "/commercial-real-estate/building/MA/cambridge/245-first-street/", "/commercial-real-estate/building/MA/cambridge/625-massachusetts-ave/", "/commercial-real-estate/building/MA/cambridge/one-mifflin-place/"] },
  { id: "bos-harvard-square", name: "Harvard Square", slug: "harvard-square", city: "Cambridge", state_abbr: "MA", path: "/commercial-real-estate/MA/cambridge/harvard-square/", centroid_lat: 42.373, centroid_lng: -71.119, area_type: "district", approximate_space_types: ["office", "retail"], profile: ["university_adjacent", "research", "boutique_office", "startup"], representative_building_paths: ["/commercial-real-estate/building/MA/cambridge/one-mifflin-place/", "/commercial-real-estate/building/MA/cambridge/625-massachusetts-ave/"] },
  { id: "bos-longwood-medical-area", name: "Longwood Medical Area", slug: "longwood-medical-area", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/longwood-medical-area/", centroid_lat: 42.338, centroid_lng: -71.105, area_type: "district", approximate_space_types: ["medical", "office", "lab"], profile: ["healthcare", "medical", "life_science", "research"], representative_building_paths: [] },
  { id: "bos-allston-brighton-innovation-corridor", name: "Allston / Brighton Innovation Corridor", slug: "allston-brighton-innovation-corridor", city: "Boston", state_abbr: "MA", path: "/commercial-real-estate/MA/boston/allston-brighton-innovation-corridor/", centroid_lat: 42.355, centroid_lng: -71.13, area_type: "corridor", approximate_space_types: ["office", "lab", "flex"], profile: ["emerging_innovation", "university_adjacent", "life_science_adjacent", "startup"], representative_building_paths: [] },
  { id: "bos-waltham", name: "Waltham", slug: "waltham", city: "Waltham", state_abbr: "MA", path: "/commercial-real-estate/MA/waltham/waltham/", centroid_lat: 42.376, centroid_lng: -71.235, area_type: "district", approximate_space_types: ["office", "medical", "flex", "lab"], profile: ["route128", "office", "biotech", "technology"], representative_building_paths: ["/commercial-real-estate/building/MA/waltham/303-wyman-st/"] },
  { id: "bos-watertown", name: "Watertown", slug: "watertown", city: "Watertown", state_abbr: "MA", path: "/commercial-real-estate/MA/watertown/watertown/", centroid_lat: 42.37, centroid_lng: -71.18, area_type: "district", approximate_space_types: ["office", "lab", "flex"], profile: ["life_science", "lab", "office_flex", "close_in"], representative_building_paths: [] },
  { id: "bos-burlington", name: "Burlington", slug: "burlington", city: "Burlington", state_abbr: "MA", path: "/commercial-real-estate/MA/burlington/burlington/", centroid_lat: 42.504, centroid_lng: -71.195, area_type: "district", approximate_space_types: ["office", "medical", "retail", "flex"], profile: ["route128", "technology", "corporate", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/MA/burlington/1500-district-ave/"] },
  { id: "bos-lexington", name: "Lexington", slug: "lexington", city: "Lexington", state_abbr: "MA", path: "/commercial-real-estate/MA/lexington/lexington/", centroid_lat: 42.447, centroid_lng: -71.225, area_type: "district", approximate_space_types: ["office", "lab", "flex"], profile: ["rd", "biotech", "defense", "route128"], representative_building_paths: [] },
  { id: "bos-bedford", name: "Bedford", slug: "bedford", city: "Bedford", state_abbr: "MA", path: "/commercial-real-estate/MA/bedford/bedford/", centroid_lat: 42.49, centroid_lng: -71.277, area_type: "district", approximate_space_types: ["office", "flex", "lab"], profile: ["rd", "defense", "technology", "office_flex"], representative_building_paths: [] },
  { id: "bos-woburn", name: "Woburn", slug: "woburn", city: "Woburn", state_abbr: "MA", path: "/commercial-real-estate/MA/woburn/woburn/", centroid_lat: 42.479, centroid_lng: -71.152, area_type: "industrial_area", approximate_space_types: ["office", "flex", "industrial"], profile: ["industrial_flex", "office_flex", "service_commercial", "i93"], representative_building_paths: [] },
  { id: "bos-newton", name: "Newton", slug: "newton", city: "Newton", state_abbr: "MA", path: "/commercial-real-estate/MA/newton/newton/", centroid_lat: 42.337, centroid_lng: -71.209, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["close_in_suburban", "professional_services", "medical", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/MA/newton/275-grove-st/"] },
  { id: "bos-needham", name: "Needham", slug: "needham", city: "Needham", state_abbr: "MA", path: "/commercial-real-estate/MA/needham/needham/", centroid_lat: 42.281, centroid_lng: -71.237, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "professional_services", "medical", "technology"], representative_building_paths: [] },
  { id: "bos-framingham", name: "Framingham", slug: "framingham", city: "Framingham", state_abbr: "MA", path: "/commercial-real-estate/MA/framingham/framingham/", centroid_lat: 42.279, centroid_lng: -71.417, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["metrowest", "professional_services", "medical", "local_services"], representative_building_paths: ["/commercial-real-estate/building/MA/framingham/945-concord-st/"] },
  { id: "bos-quincy", name: "Quincy", slug: "quincy", city: "Quincy", state_abbr: "MA", path: "/commercial-real-estate/MA/quincy/quincy/", centroid_lat: 42.252, centroid_lng: -71.002, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["south_metro", "office", "medical", "transit"], representative_building_paths: ["/commercial-real-estate/building/MA/quincy/859-willard-st/"] },
  { id: "bos-route-128-corridor", name: "Route 128 Corridor", slug: "route-128-corridor", city: "Waltham", state_abbr: "MA", path: "/commercial-real-estate/MA/waltham/route-128-corridor/", centroid_lat: 42.39, centroid_lng: -71.22, area_type: "corridor", approximate_space_types: ["office", "lab", "flex"], profile: ["route128", "office", "biotech", "technology", "rd_flex"], representative_building_paths: ["/commercial-real-estate/building/MA/waltham/303-wyman-st/", "/commercial-real-estate/building/MA/burlington/1500-district-ave/", "/commercial-real-estate/building/MA/newton/275-grove-st/"] },
  { id: "bos-route-495-corridor", name: "Route 495 Corridor", slug: "route-495-corridor", city: "Framingham", state_abbr: "MA", path: "/commercial-real-estate/MA/framingham/route-495-corridor/", centroid_lat: 42.28, centroid_lng: -71.52, area_type: "corridor", approximate_space_types: ["industrial", "flex", "office"], profile: ["outer_corridor", "industrial_flex", "logistics", "office_park"], representative_building_paths: ["/commercial-real-estate/building/MA/framingham/945-concord-st/"] },
  { id: "bos-braintree", name: "Braintree", slug: "braintree", city: "Braintree", state_abbr: "MA", path: "/commercial-real-estate/MA/braintree/braintree/", centroid_lat: 42.207, centroid_lng: -71.005, area_type: "district", approximate_space_types: ["office", "medical", "flex", "retail"], profile: ["south_suburban", "office_flex", "medical", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/MA/quincy/859-willard-st/"] },
  { id: "bos-chelsea", name: "Chelsea", slug: "chelsea", city: "Chelsea", state_abbr: "MA", path: "/commercial-real-estate/MA/chelsea/chelsea/", centroid_lat: 42.391, centroid_lng: -71.033, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["urban_industrial", "last_mile", "food_production", "airport_adjacent"], representative_building_paths: [] },
  { id: "bos-everett", name: "Everett", slug: "everett", city: "Everett", state_abbr: "MA", path: "/commercial-real-estate/MA/everett/everett/", centroid_lat: 42.408, centroid_lng: -71.054, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["urban_industrial", "service_commercial", "last_mile", "contractor"], representative_building_paths: [] },
  { id: "bos-wilmington", name: "Wilmington", slug: "wilmington", city: "Wilmington", state_abbr: "MA", path: "/commercial-real-estate/MA/wilmington/wilmington/", centroid_lat: 42.546, centroid_lng: -71.174, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["north_suburban", "industrial_flex", "office_flex", "i93"], representative_building_paths: [] },
  { id: "bos-mansfield", name: "Mansfield", slug: "mansfield", city: "Mansfield", state_abbr: "MA", path: "/commercial-real-estate/MA/mansfield/mansfield/", centroid_lat: 42.033, centroid_lng: -71.219, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["south_suburban", "industrial_flex", "logistics", "manufacturing"], representative_building_paths: [] },
];

const atlantaMetroDistrictDefinitions = [
  { id: "atl-downtown-atlanta", name: "Downtown Atlanta", slug: "downtown-atlanta", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/downtown-atlanta/", centroid_lat: 33.755, centroid_lng: -84.39, area_type: "downtown_core", approximate_space_types: ["office", "retail", "coworking"], profile: ["downtown", "office", "civic_business", "transit"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/191-peachtree-st/", "/commercial-real-estate/building/GA/atlanta/260-peachtree-st/"] },
  { id: "atl-midtown-atlanta", name: "Midtown Atlanta", slug: "midtown", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/midtown/", centroid_lat: 33.783, centroid_lng: -84.383, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["office", "transit", "mixed_use", "university_adjacent"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/715-peachtree-st-ne/", "/commercial-real-estate/building/GA/atlanta/756-w-peachtree-st-nw/", "/commercial-real-estate/building/GA/atlanta/1175-peachtree-st-ne/", "/commercial-real-estate/building/GA/atlanta/1201-peachtree-st-ne/", "/commercial-real-estate/building/GA/atlanta/1230-peachtree-street-northeast/", "/commercial-real-estate/building/GA/atlanta/1372-peachtree-st-ne/"] },
  { id: "atl-buckhead", name: "Buckhead", slug: "buckhead", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/buckhead/", centroid_lat: 33.849, centroid_lng: -84.367, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["client_facing", "executive_office", "retail_support", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/2827-peachtree/", "/commercial-real-estate/building/GA/atlanta/3324-peachtree-rd/", "/commercial-real-estate/building/GA/atlanta/3340-peachtree-rd-ne/", "/commercial-real-estate/building/GA/atlanta/3348-peachtree-rd-ne/", "/commercial-real-estate/building/GA/atlanta/3372-peachtree-road/", "/commercial-real-estate/building/GA/atlanta/monarch-plaza/"] },
  { id: "atl-west-midtown", name: "West Midtown", slug: "west-midtown", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/west-midtown/", centroid_lat: 33.79, centroid_lng: -84.414, area_type: "district", approximate_space_types: ["office", "industrial", "flex", "retail"], profile: ["creative_office", "adaptive_reuse", "showroom", "production_adjacent"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/1365-english-st-nw/", "/commercial-real-estate/building/GA/atlanta/2160-hills-ave-nw/"] },
  { id: "atl-old-fourth-ward", name: "Old Fourth Ward", slug: "old-fourth-ward", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/old-fourth-ward/", centroid_lat: 33.766, centroid_lng: -84.365, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["mixed_use", "creative_office", "local_services", "adaptive_reuse"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/725-ponce-de-leon-ave-ne/"] },
  { id: "atl-atlantic-station", name: "Atlantic Station", slug: "atlantic-station", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/atlantic-station/", centroid_lat: 33.793, centroid_lng: -84.397, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["mixed_use", "office", "retail_support", "midtown_edge"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/1365-english-st-nw/", "/commercial-real-estate/building/GA/atlanta/2160-hills-ave-nw/"] },
  { id: "atl-perimeter-center", name: "Perimeter Center", slug: "perimeter-center", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/perimeter-center/", centroid_lat: 33.929, centroid_lng: -84.343, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["suburban_office", "corporate", "freeway_access", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/10-glenlake-north/", "/commercial-real-estate/building/GA/atlanta/10-glenlake-south/", "/commercial-real-estate/building/GA/atlanta/1155-perimeter-ctr-w/", "/commercial-real-estate/building/GA/atlanta/1995-n-park-place/", "/commercial-real-estate/building/GA/atlanta/303-perimeter-ctr-n/", "/commercial-real-estate/building/GA/atlanta/5-concourse-pkwy/"] },
  { id: "atl-cumberland-galleria", name: "Cumberland / Galleria", slug: "cumberland-galleria", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/cumberland-galleria/", centroid_lat: 33.884, centroid_lng: -84.466, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["suburban_office", "freeway_access", "event_adjacent", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/2727-paces-ferry-rd-se/", "/commercial-real-estate/building/GA/atlanta/3330-cumberland-blvd/", "/commercial-real-estate/building/GA/atlanta/3350-riverwood-pkwy-se/", "/commercial-real-estate/building/GA/atlanta/400-galleria-pkwy-se/", "/commercial-real-estate/building/GA/atlanta/800-battery-avenue-southeast-suite-100/", "/commercial-real-estate/building/GA/atlanta/riverwood-100/"] },
  { id: "atl-central-perimeter", name: "Central Perimeter", slug: "central-perimeter", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/central-perimeter/", centroid_lat: 33.923, centroid_lng: -84.35, area_type: "corridor", approximate_space_types: ["office", "retail", "medical"], profile: ["suburban_office", "corporate", "ga400", "i285"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/10-glenlake-north/", "/commercial-real-estate/building/GA/atlanta/one-glenlake-parkway/", "/commercial-real-estate/building/GA/atlanta/1155-perimeter-ctr-w/"] },
  { id: "atl-lenox-phipps", name: "Lenox / Phipps", slug: "lenox-phipps", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/lenox-phipps/", centroid_lat: 33.846, centroid_lng: -84.362, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["client_facing", "retail_support", "buckhead_edge", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/3372-peachtree-road/", "/commercial-real-estate/building/GA/atlanta/3455-peachtree-rd-ne/", "/commercial-real-estate/building/GA/atlanta/3500-lenox-rd-ne/", "/commercial-real-estate/building/GA/atlanta/monarch-tower/"] },
  { id: "atl-hartsfield-jackson-airport-area", name: "Hartsfield-Jackson Airport Area", slug: "hartsfield-jackson-airport-area", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/hartsfield-jackson-airport-area/", centroid_lat: 33.64, centroid_lng: -84.428, area_type: "industrial_area", approximate_space_types: ["office", "industrial", "flex"], profile: ["airport_access", "logistics", "office", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/1000-hartsfield-centre-parkway/", "/commercial-real-estate/building/GA/atlanta/4751-best-road/"] },
  { id: "atl-south-atlanta-industrial", name: "South Atlanta Industrial", slug: "south-atlanta-industrial", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/south-atlanta-industrial/", centroid_lat: 33.64, centroid_lng: -84.45, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "logistics", "airport_access", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/4751-best-road/", "/commercial-real-estate/building/GA/atlanta/4281-old-dixie-hwy/", "/commercial-real-estate/building/GA/atlanta/6150-la-grange-blvd-sw/"] },
  { id: "atl-fulton-industrial", name: "Fulton Industrial Boulevard", slug: "fulton-industrial", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/fulton-industrial/", centroid_lat: 33.76, centroid_lng: -84.52, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "industrial", "truck_access"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/370-great-southwest-pkwy-sw/", "/commercial-real-estate/building/GA/atlanta/400-wharton-cir-sw/", "/commercial-real-estate/building/GA/atlanta/455-great-southwest-pkwy-sw/", "/commercial-real-estate/building/GA/atlanta/4795-fulton-industrial-blvd-sw/", "/commercial-real-estate/building/GA/atlanta/5215-westgate-dr-sw/", "/commercial-real-estate/building/GA/atlanta/5245-westgate-dr-sw/"] },
  { id: "atl-i85-northeast-norcross", name: "I-85 Northeast / Norcross", slug: "i-85-northeast-norcross", city: "Norcross", state_abbr: "GA", path: "/commercial-real-estate/GA/norcross/i-85-northeast-norcross/", centroid_lat: 33.94, centroid_lng: -84.21, area_type: "corridor", approximate_space_types: ["industrial", "flex", "office"], profile: ["i85", "warehouse", "office_flex", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/GA/norcross/3295-river-exchange-drive/", "/commercial-real-estate/building/GA/peachtree-corners/5051-peachtree-corners-cir/"] },
  { id: "atl-gwinnett-peachtree-corners", name: "Gwinnett / Peachtree Corners", slug: "gwinnett-peachtree-corners", city: "Peachtree Corners", state_abbr: "GA", path: "/commercial-real-estate/GA/peachtree-corners/gwinnett-peachtree-corners/", centroid_lat: 33.97, centroid_lng: -84.22, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["technology", "office_flex", "suburban_office", "i85"], representative_building_paths: ["/commercial-real-estate/building/GA/peachtree-corners/5051-peachtree-corners-cir/", "/commercial-real-estate/building/GA/duluth/3235-satellite-blvd-nw/", "/commercial-real-estate/building/GA/duluth/2180-satellite-blvd/"] },
  { id: "atl-stone-mountain-tucker", name: "Stone Mountain / Tucker", slug: "stone-mountain-tucker", city: "Tucker", state_abbr: "GA", path: "/commercial-real-estate/GA/tucker/stone-mountain-tucker/", centroid_lat: 33.84, centroid_lng: -84.2, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "service_commercial", "warehouse", "local_operations"], representative_building_paths: ["/commercial-real-estate/building/GA/tucker/2280-mountain-industrial-blvd/", "/commercial-real-estate/building/GA/tucker/4404-sentry-dr/", "/commercial-real-estate/building/GA/stone-mountain/5830-e-ponce-de-leon-ave/"] },
  { id: "atl-forest-park", name: "Forest Park", slug: "forest-park", city: "Forest Park", state_abbr: "GA", path: "/commercial-real-estate/GA/forest-park/forest-park/", centroid_lat: 33.622, centroid_lng: -84.369, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "retail"], profile: ["airport_access", "logistics", "warehouse", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/GA/forest-park/5324-georgia-highway-85/"] },
  { id: "atl-college-park", name: "College Park", slug: "college-park", city: "College Park", state_abbr: "GA", path: "/commercial-real-estate/GA/college-park/college-park/", centroid_lat: 33.653, centroid_lng: -84.449, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["airport_access", "logistics", "hospitality", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/1000-hartsfield-centre-parkway/", "/commercial-real-estate/building/GA/atlanta/4751-best-road/"] },
  { id: "atl-east-point", name: "East Point", slug: "east-point", city: "East Point", state_abbr: "GA", path: "/commercial-real-estate/GA/east-point/east-point/", centroid_lat: 33.68, centroid_lng: -84.44, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["airport_adjacent", "service_commercial", "local_office", "industrial_edge"], representative_building_paths: [] },
  { id: "atl-alpharetta", name: "Alpharetta", slug: "alpharetta", city: "Alpharetta", state_abbr: "GA", path: "/commercial-real-estate/GA/alpharetta/alpharetta/", centroid_lat: 34.075, centroid_lng: -84.294, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["corporate", "technology", "suburban_office", "north_fulton"], representative_building_paths: ["/commercial-real-estate/building/GA/alpharetta/555-north-point-ctr-e/", "/commercial-real-estate/building/GA/alpharetta/2300-lakeview-pkwy/", "/commercial-real-estate/building/GA/alpharetta/4550-n-point-pkwy/", "/commercial-real-estate/building/GA/alpharetta/2475-northwinds-parkway-one-northwinds/", "/commercial-real-estate/building/GA/alpharetta/4555-mansell-rd/", "/commercial-real-estate/building/GA/alpharetta/12600-deerfield-pkwy/"] },
  { id: "atl-avalon-north-fulton", name: "Avalon / North Fulton", slug: "avalon-north-fulton", city: "Alpharetta", state_abbr: "GA", path: "/commercial-real-estate/GA/alpharetta/avalon-north-fulton/", centroid_lat: 34.071, centroid_lng: -84.276, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["corporate", "technology", "retail_support", "north_fulton"], representative_building_paths: ["/commercial-real-estate/building/GA/alpharetta/555-north-point-ctr-e/", "/commercial-real-estate/building/GA/alpharetta/4550-n-point-pkwy/", "/commercial-real-estate/building/GA/alpharetta/4555-mansell-rd/"] },
  { id: "atl-sandy-springs", name: "Sandy Springs", slug: "sandy-springs", city: "Sandy Springs", state_abbr: "GA", path: "/commercial-real-estate/GA/sandy-springs/sandy-springs/", centroid_lat: 33.93, centroid_lng: -84.373, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "medical", "corporate", "ga400"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/10-glenlake-north/", "/commercial-real-estate/building/GA/atlanta/10-glenlake-south/", "/commercial-real-estate/building/GA/atlanta/one-glenlake-parkway/"] },
  { id: "atl-roswell", name: "Roswell", slug: "roswell", city: "Roswell", state_abbr: "GA", path: "/commercial-real-estate/GA/roswell/roswell/", centroid_lat: 34.023, centroid_lng: -84.361, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["local_office", "medical", "north_fulton", "service_commercial"], representative_building_paths: [] },
  { id: "atl-marietta", name: "Marietta", slug: "marietta", city: "Marietta", state_abbr: "GA", path: "/commercial-real-estate/GA/marietta/marietta/", centroid_lat: 33.953, centroid_lng: -84.55, area_type: "district", approximate_space_types: ["office", "industrial", "medical"], profile: ["local_office", "medical", "industrial_flex", "northwest_metro"], representative_building_paths: ["/commercial-real-estate/building/GA/marietta/1830-airport-industrial-park-dr/"] },
  { id: "atl-smyrna", name: "Smyrna", slug: "smyrna", city: "Smyrna", state_abbr: "GA", path: "/commercial-real-estate/GA/smyrna/smyrna/", centroid_lat: 33.884, centroid_lng: -84.515, area_type: "district", approximate_space_types: ["office", "retail", "industrial"], profile: ["northwest_metro", "local_office", "service_commercial", "cumberland_edge"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/2727-paces-ferry-rd-se/", "/commercial-real-estate/building/GA/atlanta/3350-riverwood-pkwy-se/"] },
  { id: "atl-decatur", name: "Decatur", slug: "decatur", city: "Decatur", state_abbr: "GA", path: "/commercial-real-estate/GA/decatur/decatur/", centroid_lat: 33.774, centroid_lng: -84.296, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["local_office", "medical", "professional_services", "walkable"], representative_building_paths: ["/commercial-real-estate/building/GA/decatur/120-w-trinity-pl/", "/commercial-real-estate/building/GA/decatur/one-west-court-square/", "/commercial-real-estate/building/GA/decatur/160-clairemont-ave/"] },
  { id: "atl-duluth", name: "Duluth", slug: "duluth", city: "Duluth", state_abbr: "GA", path: "/commercial-real-estate/GA/duluth/duluth/", centroid_lat: 34.002, centroid_lng: -84.144, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["gwinnett", "office_flex", "service_commercial", "i85"], representative_building_paths: ["/commercial-real-estate/building/GA/duluth/3235-satellite-blvd-nw/", "/commercial-real-estate/building/GA/duluth/2180-satellite-blvd/", "/commercial-real-estate/building/GA/duluth/11340-lakefield-dr/"] },
  { id: "atl-tyler-perry-studios-fort-mcpherson", name: "Tyler Perry Studios / Fort McPherson", slug: "tyler-perry-studios-fort-mcpherson", city: "Atlanta", state_abbr: "GA", path: "/commercial-real-estate/GA/atlanta/tyler-perry-studios-fort-mcpherson/", centroid_lat: 33.707, centroid_lng: -84.433, area_type: "district", approximate_space_types: ["office", "flex", "commercial"], profile: ["film", "production", "adaptive_reuse", "southwest_atlanta"], representative_building_paths: ["/commercial-real-estate/building/GA/atlanta/511-stephens-st-sw/"] },
];

const southFloridaDistrictDefinitions = [
  { id: "sofla-downtown-miami", name: "Downtown Miami", slug: "downtown-miami", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/downtown-miami/", centroid_lat: 25.775, centroid_lng: -80.19, area_type: "downtown_core", approximate_space_types: ["office", "retail", "coworking"], profile: ["downtown", "office", "civic_business", "transit"], representative_building_paths: ["/commercial-real-estate/building/FL/miami/201-s-biscayne-blvd/", "/commercial-real-estate/building/FL/miami/333-se-2nd-ave/"] },
  { id: "sofla-brickell", name: "Brickell", slug: "brickell", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/brickell/", centroid_lat: 25.762, centroid_lng: -80.192, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["finance", "client_facing", "high_rise_office", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/FL/miami/1221-brickell-ave/", "/commercial-real-estate/building/FL/miami/601-brickell-key-dr/", "/commercial-real-estate/building/FL/miami/78-sw-7th-st/", "/commercial-real-estate/building/FL/miami/80-sw-8th-st/", "/commercial-real-estate/building/FL/miami/801-brickell-ave/"] },
  { id: "sofla-wynwood", name: "Wynwood", slug: "wynwood", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/wynwood/", centroid_lat: 25.801, centroid_lng: -80.2, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["creative_office", "adaptive_reuse", "hospitality", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/FL/miami/218-nw-24th-st/", "/commercial-real-estate/building/FL/miami/360-nw-27th-st/"] },
  { id: "sofla-design-district", name: "Design District", slug: "design-district", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/design-district/", centroid_lat: 25.813, centroid_lng: -80.193, area_type: "district", approximate_space_types: ["retail", "office", "commercial"], profile: ["design", "retail_support", "creative_office", "hospitality"], representative_building_paths: [] },
  { id: "sofla-edgewater", name: "Edgewater", slug: "edgewater", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/edgewater/", centroid_lat: 25.803, centroid_lng: -80.188, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["mixed_use", "waterfront_adjacent", "downtown_edge", "local_services"], representative_building_paths: [] },
  { id: "sofla-coral-gables", name: "Coral Gables", slug: "coral-gables", city: "Coral Gables", state_abbr: "FL", path: "/commercial-real-estate/FL/coral-gables/coral-gables/", centroid_lat: 25.749, centroid_lng: -80.263, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "professional_services", "medical", "university_adjacent"], representative_building_paths: ["/commercial-real-estate/building/FL/coral-gables/1-alhambra-plaza/", "/commercial-real-estate/building/FL/coral-gables/2222-ponce-de-leon-blvd/", "/commercial-real-estate/building/FL/coral-gables/2332-galiano-st/", "/commercial-real-estate/building/FL/coral-gables/255-giralda-ave/"] },
  { id: "sofla-coconut-grove", name: "Coconut Grove", slug: "coconut-grove", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/coconut-grove/", centroid_lat: 25.729, centroid_lng: -80.24, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["client_facing", "boutique_office", "hospitality", "waterfront_adjacent"], representative_building_paths: [] },
  { id: "sofla-miami-beach", name: "Miami Beach", slug: "miami-beach", city: "Miami Beach", state_abbr: "FL", path: "/commercial-real-estate/FL/miami-beach/miami-beach/", centroid_lat: 25.79, centroid_lng: -80.13, area_type: "district", approximate_space_types: ["office", "retail", "hospitality"], profile: ["hospitality", "tourism", "retail_support", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/FL/miami-beach/1688-meridian-ave/", "/commercial-real-estate/building/FL/miami-beach/429-lenox-ave/", "/commercial-real-estate/building/FL/miami/1111-lincoln-rd/"] },
  { id: "sofla-doral", name: "Doral", slug: "doral", city: "Doral", state_abbr: "FL", path: "/commercial-real-estate/FL/doral/doral/", centroid_lat: 25.819, centroid_lng: -80.355, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["airport_access", "logistics", "office_flex", "warehouse"], representative_building_paths: ["/commercial-real-estate/building/FL/miami/8216-nw-14th-st/", "/commercial-real-estate/building/FL/miami/8333-nw-53rd-st/"] },
  { id: "sofla-blue-lagoon-airport-area", name: "Blue Lagoon / Airport Area", slug: "blue-lagoon", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/blue-lagoon/", centroid_lat: 25.783, centroid_lng: -80.29, area_type: "district", approximate_space_types: ["office", "coworking", "flex"], profile: ["airport_access", "office", "hospitality", "regional_business"], representative_building_paths: ["/commercial-real-estate/building/FL/miami/5201-blue-lagoon-dr/", "/commercial-real-estate/building/FL/miami/5202-blue-lagoon-dr/", "/commercial-real-estate/building/FL/miami/5203-blue-lagoon-dr/", "/commercial-real-estate/building/FL/miami/5204-blue-lagoon-dr/", "/commercial-real-estate/building/FL/miami/5205-blue-lagoon-dr/", "/commercial-real-estate/building/FL/miami/6303-blue-lagoon-dr/"] },
  { id: "sofla-medley", name: "Medley", slug: "medley", city: "Medley", state_abbr: "FL", path: "/commercial-real-estate/FL/medley/medley/", centroid_lat: 25.86, centroid_lng: -80.34, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "truck_access", "logistics"], representative_building_paths: ["/commercial-real-estate/building/FL/miami/8216-nw-14th-st/"] },
  { id: "sofla-hialeah-industrial", name: "Hialeah Industrial", slug: "hialeah-industrial", city: "Hialeah", state_abbr: "FL", path: "/commercial-real-estate/FL/hialeah/hialeah-industrial/", centroid_lat: 25.86, centroid_lng: -80.29, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial", "warehouse", "service_commercial", "airport_access"], representative_building_paths: [] },
  { id: "sofla-miami-lakes", name: "Miami Lakes", slug: "miami-lakes", city: "Miami Lakes", state_abbr: "FL", path: "/commercial-real-estate/FL/miami-lakes/miami-lakes/", centroid_lat: 25.91, centroid_lng: -80.31, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["suburban_office", "office_flex", "industrial_flex", "northwest_miami"], representative_building_paths: ["/commercial-real-estate/building/FL/miami-lakes/7900-oak-ln/"] },
  { id: "sofla-opa-locka-miami-gardens", name: "Opa-locka / Miami Gardens", slug: "opa-locka-miami-gardens", city: "Miami Gardens", state_abbr: "FL", path: "/commercial-real-estate/FL/miami-gardens/opa-locka-miami-gardens/", centroid_lat: 25.92, centroid_lng: -80.25, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_adjacent", "industrial_flex", "service_commercial", "northwest_miami"], representative_building_paths: [] },
  { id: "sofla-portmiami-downtown-logistics", name: "PortMiami / Downtown Logistics", slug: "portmiami-downtown-logistics", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/portmiami-downtown-logistics/", centroid_lat: 25.777, centroid_lng: -80.173, area_type: "industrial_area", approximate_space_types: ["industrial", "office", "flex"], profile: ["port", "logistics", "downtown_edge", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/FL/miami/201-s-biscayne-blvd/", "/commercial-real-estate/building/FL/miami/333-se-2nd-ave/"] },
  { id: "sofla-health-district-civic-center", name: "Health District / Civic Center", slug: "health-district-civic-center", city: "Miami", state_abbr: "FL", path: "/commercial-real-estate/FL/miami/health-district-civic-center/", centroid_lat: 25.79, centroid_lng: -80.213, area_type: "district", approximate_space_types: ["medical", "office", "lab"], profile: ["healthcare", "medical", "civic", "education_adjacent"], representative_building_paths: [] },
  { id: "sofla-university-of-miami-area", name: "University of Miami Area", slug: "university-of-miami-area", city: "Coral Gables", state_abbr: "FL", path: "/commercial-real-estate/FL/coral-gables/university-of-miami-area/", centroid_lat: 25.721, centroid_lng: -80.279, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["university_adjacent", "medical", "research", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/FL/coral-gables/1-alhambra-plaza/", "/commercial-real-estate/building/FL/coral-gables/2222-ponce-de-leon-blvd/"] },
  { id: "sofla-downtown-fort-lauderdale", name: "Downtown Fort Lauderdale", slug: "downtown-fort-lauderdale", city: "Fort Lauderdale", state_abbr: "FL", path: "/commercial-real-estate/FL/fort-lauderdale/downtown-fort-lauderdale/", centroid_lat: 26.122, centroid_lng: -80.143, area_type: "downtown_core", approximate_space_types: ["office", "retail", "coworking"], profile: ["downtown", "office", "legal", "waterfront_adjacent"], representative_building_paths: ["/commercial-real-estate/building/FL/fort-lauderdale/110-e-broward-blvd/", "/commercial-real-estate/building/FL/fort-lauderdale/501-e-las-olas-blvd/", "/commercial-real-estate/building/FL/fort-lauderdale/2598-e-sunrise-blvd/"] },
  { id: "sofla-cypress-creek", name: "Cypress Creek", slug: "cypress-creek", city: "Fort Lauderdale", state_abbr: "FL", path: "/commercial-real-estate/FL/fort-lauderdale/cypress-creek/", centroid_lat: 26.203, centroid_lng: -80.15, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["suburban_office", "office_flex", "industrial_flex", "i95"], representative_building_paths: ["/commercial-real-estate/building/FL/fort-lauderdale/6750-n-andrews-ave/"] },
  { id: "sofla-plantation", name: "Plantation", slug: "plantation", city: "Plantation", state_abbr: "FL", path: "/commercial-real-estate/FL/plantation/plantation/", centroid_lat: 26.127, centroid_lng: -80.253, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "medical", "professional_services", "broward"], representative_building_paths: ["/commercial-real-estate/building/FL/plantation/8201-peters-rd/", "/commercial-real-estate/building/FL/plantation/950-s-pine-island-rd/"] },
  { id: "sofla-sunrise", name: "Sunrise", slug: "sunrise", city: "Sunrise", state_abbr: "FL", path: "/commercial-real-estate/FL/sunrise/sunrise/", centroid_lat: 26.167, centroid_lng: -80.28, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["suburban_office", "sawgrass", "retail_support", "regional_business"], representative_building_paths: ["/commercial-real-estate/building/FL/sunrise/1560-sawgrass-corporate-pkwy/"] },
  { id: "sofla-miramar", name: "Miramar", slug: "miramar", city: "Miramar", state_abbr: "FL", path: "/commercial-real-estate/FL/miramar/miramar/", centroid_lat: 25.986, centroid_lng: -80.28, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["corporate", "logistics", "office_flex", "south_broward"], representative_building_paths: ["/commercial-real-estate/building/FL/miramar/3350-sw-148th-ave/"] },
  { id: "sofla-hollywood", name: "Hollywood", slug: "hollywood", city: "Hollywood", state_abbr: "FL", path: "/commercial-real-estate/FL/hollywood/hollywood/", centroid_lat: 26.011, centroid_lng: -80.15, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["local_office", "medical", "hospitality", "south_broward"], representative_building_paths: ["/commercial-real-estate/building/FL/hollywood/4000-hollywood-blvd/"] },
  { id: "sofla-pompano-beach", name: "Pompano Beach", slug: "pompano-beach", city: "Pompano Beach", state_abbr: "FL", path: "/commercial-real-estate/FL/pompano-beach/pompano-beach/", centroid_lat: 26.237, centroid_lng: -80.125, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "service_commercial", "marine", "north_broward"], representative_building_paths: [] },
  { id: "sofla-deerfield-beach", name: "Deerfield Beach", slug: "deerfield-beach", city: "Deerfield Beach", state_abbr: "FL", path: "/commercial-real-estate/FL/deerfield-beach/deerfield-beach/", centroid_lat: 26.318, centroid_lng: -80.1, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["north_broward", "industrial_flex", "office", "regional_access"], representative_building_paths: [] },
  { id: "sofla-west-palm-beach", name: "West Palm Beach", slug: "west-palm-beach", city: "West Palm Beach", state_abbr: "FL", path: "/commercial-real-estate/FL/west-palm-beach/west-palm-beach/", centroid_lat: 26.714, centroid_lng: -80.055, area_type: "downtown_core", approximate_space_types: ["office", "medical", "retail"], profile: ["downtown", "finance", "professional_services", "palm_beach"], representative_building_paths: ["/commercial-real-estate/building/FL/west-palm-beach/777-s-flagler-dr/", "/commercial-real-estate/building/FL/west-palm-beach/2054-vista-pkwy/"] },
  { id: "sofla-boca-raton", name: "Boca Raton", slug: "boca-raton", city: "Boca Raton", state_abbr: "FL", path: "/commercial-real-estate/FL/boca-raton/boca-raton/", centroid_lat: 26.368, centroid_lng: -80.128, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["corporate", "professional_services", "medical", "palm_beach"], representative_building_paths: ["/commercial-real-estate/building/FL/boca-raton/160-yamato-rd/", "/commercial-real-estate/building/FL/boca-raton/2255-glades-rd/", "/commercial-real-estate/building/FL/boca-raton/433-plaza-real/", "/commercial-real-estate/building/FL/boca-raton/10018-spanish-isles-blvd/"] },
  { id: "sofla-delray-beach", name: "Delray Beach", slug: "delray-beach", city: "Delray Beach", state_abbr: "FL", path: "/commercial-real-estate/FL/delray-beach/delray-beach/", centroid_lat: 26.461, centroid_lng: -80.073, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["local_office", "medical", "retail_support", "palm_beach"], representative_building_paths: ["/commercial-real-estate/building/FL/delray-beach/1615-1625-and-1690-s-congress-ave/"] },
  { id: "sofla-boynton-beach", name: "Boynton Beach", slug: "boynton-beach", city: "Boynton Beach", state_abbr: "FL", path: "/commercial-real-estate/FL/boynton-beach/boynton-beach/", centroid_lat: 26.531, centroid_lng: -80.09, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["local_office", "medical", "service_commercial", "palm_beach"], representative_building_paths: [] },
  { id: "sofla-palm-beach-gardens", name: "Palm Beach Gardens", slug: "palm-beach-gardens", city: "Palm Beach Gardens", state_abbr: "FL", path: "/commercial-real-estate/FL/palm-beach-gardens/palm-beach-gardens/", centroid_lat: 26.823, centroid_lng: -80.138, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["professional_services", "medical", "client_facing", "north_palm_beach"], representative_building_paths: ["/commercial-real-estate/building/FL/palm-beach-gardens/3801-pga-blvd/"] },
];

const philadelphiaMetroDistrictDefinitions = [
  { id: "phl-center-city", name: "Center City", slug: "center-city", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/center-city/", centroid_lat: 39.952, centroid_lng: -75.165, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "legal", "transit"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/100-s-juniper-st/", "/commercial-real-estate/building/PA/philadelphia/1500-market-street-east-tower/", "/commercial-real-estate/building/PA/philadelphia/1650-market-st/", "/commercial-real-estate/building/PA/philadelphia/1900-market-st/", "/commercial-real-estate/building/PA/philadelphia/2001-market-st/"] },
  { id: "phl-market-street-west", name: "Market Street West", slug: "market-street-west", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/market-street-west/", centroid_lat: 39.953, centroid_lng: -75.171, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["office", "finance", "legal", "transit"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/1500-market-street-east-tower/", "/commercial-real-estate/building/PA/philadelphia/1650-market-st/", "/commercial-real-estate/building/PA/philadelphia/1900-market-st/", "/commercial-real-estate/building/PA/philadelphia/2001-market-st/"] },
  { id: "phl-market-east", name: "Market East", slug: "market-east", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/market-east/", centroid_lat: 39.952, centroid_lng: -75.156, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["transit", "retail_support", "civic_business", "downtown_edge"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/100-s-juniper-st/", "/commercial-real-estate/building/PA/philadelphia/1100-ludlow-st/"] },
  { id: "phl-rittenhouse-square", name: "Rittenhouse Square", slug: "rittenhouse-square", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/rittenhouse-square/", centroid_lat: 39.949, centroid_lng: -75.171, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["client_facing", "professional_services", "retail_support", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/100-n-18th-st/", "/commercial-real-estate/building/PA/philadelphia/1900-market-st/", "/commercial-real-estate/building/PA/philadelphia/2001-market-st/"] },
  { id: "phl-old-city", name: "Old City", slug: "old-city", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/old-city/", centroid_lat: 39.952, centroid_lng: -75.144, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["historic", "boutique_office", "creative_office", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/325-chestnut-st/"] },
  { id: "phl-university-city", name: "University City", slug: "university-city", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/university-city/", centroid_lat: 39.953, centroid_lng: -75.192, area_type: "district", approximate_space_types: ["office", "lab", "medical"], profile: ["university_adjacent", "life_science", "healthcare", "research"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/2929-arch-st/", "/commercial-real-estate/building/PA/philadelphia/1-international-plaza/"] },
  { id: "phl-schuylkill-yards", name: "Schuylkill Yards", slug: "schuylkill-yards", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/schuylkill-yards/", centroid_lat: 39.956, centroid_lng: -75.186, area_type: "district", approximate_space_types: ["office", "lab", "retail"], profile: ["life_science", "innovation", "university_adjacent", "transit"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/2929-arch-st/", "/commercial-real-estate/building/PA/philadelphia/2001-market-st/"] },
  { id: "phl-navy-yard", name: "Navy Yard", slug: "navy-yard", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/navy-yard/", centroid_lat: 39.891, centroid_lng: -75.177, area_type: "district", approximate_space_types: ["office", "lab", "industrial", "flex"], profile: ["life_science", "office_flex", "industrial_flex", "waterfront"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/1-international-plaza/"] },
  { id: "phl-south-philadelphia", name: "South Philadelphia", slug: "south-philadelphia", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/south-philadelphia/", centroid_lat: 39.922, centroid_lng: -75.17, area_type: "district", approximate_space_types: ["industrial", "flex", "retail", "office"], profile: ["service_commercial", "industrial_flex", "local_services", "port_adjacent"], representative_building_paths: [] },
  { id: "phl-northern-liberties-fishtown", name: "Northern Liberties / Fishtown", slug: "northern-liberties-fishtown", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/northern-liberties-fishtown/", centroid_lat: 39.969, centroid_lng: -75.137, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["creative_office", "mixed_use", "hospitality", "local_services"], representative_building_paths: [] },
  { id: "phl-penn-medicine-chop-area", name: "Penn Medicine / CHOP Area", slug: "penn-medicine-chop-area", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/penn-medicine-chop-area/", centroid_lat: 39.948, centroid_lng: -75.195, area_type: "district", approximate_space_types: ["medical", "office", "lab"], profile: ["healthcare", "medical", "life_science", "university_adjacent"], representative_building_paths: ["/commercial-real-estate/building/PA/philadelphia/1-international-plaza/", "/commercial-real-estate/building/PA/philadelphia/2929-arch-st/"] },
  { id: "phl-port-south-industrial", name: "Philadelphia Port / South Philadelphia Industrial", slug: "philadelphia-port-south-philadelphia-industrial", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/philadelphia-port-south-philadelphia-industrial/", centroid_lat: 39.897, centroid_lng: -75.14, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["port", "logistics", "warehouse", "service_commercial"], representative_building_paths: [] },
  { id: "phl-northeast-industrial", name: "Northeast Philadelphia Industrial", slug: "northeast-philadelphia-industrial", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/northeast-philadelphia-industrial/", centroid_lat: 40.042, centroid_lng: -75.02, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "warehouse", "service_commercial", "i95"], representative_building_paths: [] },
  { id: "phl-i95-industrial-corridor", name: "I-95 Industrial Corridor", slug: "i-95-industrial-corridor", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/i-95-industrial-corridor/", centroid_lat: 39.98, centroid_lng: -75.08, area_type: "corridor", approximate_space_types: ["industrial", "flex"], profile: ["i95", "warehouse", "logistics", "service_commercial"], representative_building_paths: [] },
  { id: "phl-airport-area", name: "Airport Area", slug: "airport-area", city: "Philadelphia", state_abbr: "PA", path: "/commercial-real-estate/PA/philadelphia/airport-area/", centroid_lat: 39.874, centroid_lng: -75.242, area_type: "industrial_area", approximate_space_types: ["office", "industrial", "flex"], profile: ["airport_access", "logistics", "office_flex", "hospitality"], representative_building_paths: [] },
  { id: "phl-essington-tinicum", name: "Essington / Tinicum", slug: "essington-tinicum", city: "Essington", state_abbr: "PA", path: "/commercial-real-estate/PA/essington/essington-tinicum/", centroid_lat: 39.864, centroid_lng: -75.3, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_adjacent", "i95", "logistics", "service_commercial"], representative_building_paths: [] },
  { id: "phl-camden-waterfront-industrial", name: "Camden Waterfront / Industrial", slug: "camden-waterfront-industrial", city: "Camden", state_abbr: "NJ", path: "/commercial-real-estate/NJ/camden/camden-waterfront-industrial/", centroid_lat: 39.944, centroid_lng: -75.12, area_type: "industrial_area", approximate_space_types: ["office", "industrial", "flex"], profile: ["waterfront", "industrial_flex", "south_jersey", "port_adjacent"], representative_building_paths: [] },
  { id: "phl-king-of-prussia", name: "King of Prussia", slug: "king-of-prussia", city: "King of Prussia", state_abbr: "PA", path: "/commercial-real-estate/PA/king-of-prussia/king-of-prussia/", centroid_lat: 40.101, centroid_lng: -75.383, area_type: "district", approximate_space_types: ["office", "medical", "retail", "lab"], profile: ["suburban_office", "corporate", "life_science", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/PA/king-of-prussia/630-freedom-business-ctr-dr/"] },
  { id: "phl-conshohocken", name: "Conshohocken", slug: "conshohocken", city: "Conshohocken", state_abbr: "PA", path: "/commercial-real-estate/PA/conshohocken/conshohocken/", centroid_lat: 40.079, centroid_lng: -75.301, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "regional_access", "professional_services", "schuylkill_corridor"], representative_building_paths: ["/commercial-real-estate/building/PA/conshohocken/200-barr-harbor-dr/"] },
  { id: "phl-plymouth-meeting", name: "Plymouth Meeting", slug: "plymouth-meeting", city: "Plymouth Meeting", state_abbr: "PA", path: "/commercial-real-estate/PA/plymouth-meeting/plymouth-meeting/", centroid_lat: 40.102, centroid_lng: -75.275, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "medical", "regional_access", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/PA/plymouth-meeting/521-plymouth-rd/", "/commercial-real-estate/building/PA/plymouth-meeting/525-plymouth-rd/"] },
  { id: "phl-bala-cynwyd", name: "Bala Cynwyd", slug: "bala-cynwyd", city: "Bala Cynwyd", state_abbr: "PA", path: "/commercial-real-estate/PA/bala-cynwyd/bala-cynwyd/", centroid_lat: 40.007, centroid_lng: -75.22, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "client_facing", "main_line_edge", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/PA/bala-cynwyd/150-monument-rd/"] },
  { id: "phl-radnor", name: "Radnor", slug: "radnor", city: "Radnor", state_abbr: "PA", path: "/commercial-real-estate/PA/radnor/radnor/", centroid_lat: 40.043, centroid_lng: -75.36, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["main_line", "suburban_office", "corporate", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/PA/radnor/201-king-of-prussia-rd/"] },
  { id: "phl-malvern", name: "Malvern", slug: "malvern", city: "Malvern", state_abbr: "PA", path: "/commercial-real-estate/PA/malvern/malvern/", centroid_lat: 40.037, centroid_lng: -75.514, area_type: "district", approximate_space_types: ["office", "lab", "flex"], profile: ["suburban_office", "life_science", "technology", "route202"], representative_building_paths: ["/commercial-real-estate/building/PA/berwyn/1055-westlakes-dr/"] },
  { id: "phl-wayne", name: "Wayne", slug: "wayne", city: "Wayne", state_abbr: "PA", path: "/commercial-real-estate/PA/wayne/wayne/", centroid_lat: 40.044, centroid_lng: -75.388, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["main_line", "professional_services", "suburban_office", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/PA/radnor/201-king-of-prussia-rd/", "/commercial-real-estate/building/PA/berwyn/1055-westlakes-dr/"] },
  { id: "phl-fort-washington", name: "Fort Washington", slug: "fort-washington", city: "Fort Washington", state_abbr: "PA", path: "/commercial-real-estate/PA/fort-washington/fort-washington/", centroid_lat: 40.139, centroid_lng: -75.2, area_type: "district", approximate_space_types: ["office", "medical", "flex"], profile: ["suburban_office", "office_flex", "turnpike", "medical"], representative_building_paths: ["/commercial-real-estate/building/PA/fort-washington/500-w-office-center-dr/"] },
  { id: "phl-horsham", name: "Horsham", slug: "horsham", city: "Horsham", state_abbr: "PA", path: "/commercial-real-estate/PA/horsham/horsham/", centroid_lat: 40.178, centroid_lng: -75.128, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["office_flex", "suburban_office", "industrial_flex", "montgomery_county"], representative_building_paths: [] },
  { id: "phl-cherry-hill", name: "Cherry Hill", slug: "cherry-hill", city: "Cherry Hill", state_abbr: "NJ", path: "/commercial-real-estate/NJ/cherry-hill/cherry-hill/", centroid_lat: 39.928, centroid_lng: -75.025, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["south_jersey", "suburban_office", "medical", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/NJ/cherry-hill/923-haddonfield-rd/"] },
  { id: "phl-mount-laurel", name: "Mount Laurel", slug: "mount-laurel", city: "Mount Laurel", state_abbr: "NJ", path: "/commercial-real-estate/NJ/mount-laurel/mount-laurel/", centroid_lat: 39.934, centroid_lng: -74.89, area_type: "district", approximate_space_types: ["office", "medical", "flex"], profile: ["south_jersey", "suburban_office", "office_flex", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/NJ/mount-laurel/309-fellowship-road-east-gate-center/", "/commercial-real-estate/building/NJ/mount-laurel/804-e-gate-dr/"] },
];

const newJerseyMetroDistrictDefinitions = [
  { id: "nj-newark", name: "Newark", slug: "newark", city: "Newark", state_abbr: "NJ", path: "/commercial-real-estate/NJ/newark/newark/", centroid_lat: 40.735, centroid_lng: -74.173, area_type: "downtown_core", approximate_space_types: ["office", "retail", "coworking"], profile: ["downtown", "office", "transit_oriented", "regional_business"], representative_building_paths: ["/commercial-real-estate/building/NJ/newark/one-gateway-center/"] },
  { id: "nyc-jersey-city", name: "Jersey City", slug: "jersey-city", city: "Jersey City", state_abbr: "NJ", path: "/commercial-real-estate/NJ/jersey-city/jersey-city/", centroid_lat: 40.717, centroid_lng: -74.036, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["waterfront_office", "finance", "regional_alternative", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NJ/jersey-city/101-hudson-st/", "/commercial-real-estate/building/NJ/jersey-city/2500-plaza-five/"] },
  { id: "nyc-hoboken", name: "Hoboken", slug: "hoboken", city: "Hoboken", state_abbr: "NJ", path: "/commercial-real-estate/NJ/hoboken/hoboken/", centroid_lat: 40.744, centroid_lng: -74.032, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["waterfront_office", "local_services", "regional_alternative", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NJ/hoboken/221-river-st/"] },
  { id: "nj-meadowlands", name: "Meadowlands", slug: "meadowlands", city: "East Rutherford", state_abbr: "NJ", path: "/commercial-real-estate/NJ/east-rutherford/meadowlands/", centroid_lat: 40.806, centroid_lng: -74.071, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["suburban_office", "logistics", "regional_access", "meadowlands"], representative_building_paths: ["/commercial-real-estate/building/NJ/east-rutherford/1-meadowlands-plaza/"] },
  { id: "nj-secaucus", name: "Secaucus", slug: "secaucus", city: "Secaucus", state_abbr: "NJ", path: "/commercial-real-estate/NJ/secaucus/secaucus/", centroid_lat: 40.789, centroid_lng: -74.056, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["meadowlands", "office_flex", "logistics", "transit_oriented"], representative_building_paths: [] },
  { id: "nj-parsippany", name: "Parsippany", slug: "parsippany", city: "Parsippany", state_abbr: "NJ", path: "/commercial-real-estate/NJ/parsippany/parsippany/", centroid_lat: 40.858, centroid_lng: -74.426, area_type: "district", approximate_space_types: ["office", "medical", "coworking"], profile: ["suburban_office", "corporate", "i287", "regional_business"], representative_building_paths: ["/commercial-real-estate/building/NJ/parsippany/2001-route-46-waterview-plaza/", "/commercial-real-estate/building/NJ/parsippany/90-e-halsey-rd/"] },
  { id: "nj-morristown", name: "Morristown", slug: "morristown", city: "Morristown", state_abbr: "NJ", path: "/commercial-real-estate/NJ/morristown/morristown/", centroid_lat: 40.797, centroid_lng: -74.481, area_type: "downtown_core", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_downtown", "professional_services", "transit_oriented", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/NJ/morristown/55-madison-ave/"] },
  { id: "nj-short-hills", name: "Short Hills", slug: "short-hills", city: "Short Hills", state_abbr: "NJ", path: "/commercial-real-estate/NJ/short-hills/short-hills/", centroid_lat: 40.741, centroid_lng: -74.327, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "suburban_office", "professional_services", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/NJ/short-hills/51-john-f-kennedy-pkwy/", "/commercial-real-estate/building/NJ/short-hills/830-morris-turnpike/"] },
  { id: "nj-livingston", name: "Livingston", slug: "livingston", city: "Livingston", state_abbr: "NJ", path: "/commercial-real-estate/NJ/livingston/livingston/", centroid_lat: 40.786, centroid_lng: -74.329, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["medical", "local_services", "suburban_office", "professional_services"], representative_building_paths: [] },
  { id: "nj-rutherford", name: "Rutherford", slug: "rutherford", city: "Rutherford", state_abbr: "NJ", path: "/commercial-real-estate/NJ/rutherford/rutherford/", centroid_lat: 40.827, centroid_lng: -74.106, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["meadowlands_edge", "local_office", "regional_access", "professional_services"], representative_building_paths: [] },
  { id: "nj-port-newark-elizabeth", name: "Port Newark / Elizabeth", slug: "port-newark-elizabeth", city: "Newark", state_abbr: "NJ", path: "/commercial-real-estate/NJ/newark/port-newark-elizabeth/", centroid_lat: 40.676, centroid_lng: -74.151, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["port", "logistics", "warehouse", "container_freight"], representative_building_paths: [] },
  { id: "nj-elizabeth-industrial", name: "Elizabeth Industrial", slug: "elizabeth-industrial", city: "Elizabeth", state_abbr: "NJ", path: "/commercial-real-estate/NJ/elizabeth/elizabeth-industrial/", centroid_lat: 40.666, centroid_lng: -74.21, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "port_access", "airport_access", "logistics"], representative_building_paths: [] },
  { id: "nj-linden", name: "Linden", slug: "linden", city: "Linden", state_abbr: "NJ", path: "/commercial-real-estate/NJ/linden/linden/", centroid_lat: 40.622, centroid_lng: -74.245, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial", "manufacturing", "logistics", "port_access"], representative_building_paths: [] },
  { id: "nj-carteret", name: "Carteret", slug: "carteret", city: "Carteret", state_abbr: "NJ", path: "/commercial-real-estate/NJ/carteret/carteret/", centroid_lat: 40.583, centroid_lng: -74.229, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "turnpike", "logistics"], representative_building_paths: [] },
  { id: "nj-newark-airport-area", name: "Newark Airport Area", slug: "newark-airport-area", city: "Newark", state_abbr: "NJ", path: "/commercial-real-estate/NJ/newark/newark-airport-area/", centroid_lat: 40.69, centroid_lng: -74.177, area_type: "industrial_area", approximate_space_types: ["industrial", "office", "flex"], profile: ["airport_access", "logistics", "hospitality_support", "warehouse"], representative_building_paths: [] },
  { id: "nj-meadowlands-logistics", name: "Meadowlands Logistics", slug: "meadowlands-logistics", city: "Secaucus", state_abbr: "NJ", path: "/commercial-real-estate/NJ/secaucus/meadowlands-logistics/", centroid_lat: 40.803, centroid_lng: -74.071, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["logistics", "warehouse", "meadowlands", "truck_access"], representative_building_paths: ["/commercial-real-estate/building/NJ/east-rutherford/1-meadowlands-plaza/"] },
  { id: "nj-south-kearny-industrial", name: "South Kearny Industrial", slug: "south-kearny-industrial", city: "Kearny", state_abbr: "NJ", path: "/commercial-real-estate/NJ/kearny/south-kearny-industrial/", centroid_lat: 40.728, centroid_lng: -74.113, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial", "warehouse", "port_access", "truck_access"], representative_building_paths: [] },
  { id: "nj-edison", name: "Edison", slug: "edison", city: "Edison", state_abbr: "NJ", path: "/commercial-real-estate/NJ/edison/edison/", centroid_lat: 40.518, centroid_lng: -74.412, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["office_flex", "warehouse", "central_jersey", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/NJ/edison/110-fieldcrest-ave/"] },
  { id: "nj-woodbridge", name: "Woodbridge", slug: "woodbridge", city: "Woodbridge", state_abbr: "NJ", path: "/commercial-real-estate/NJ/woodbridge/woodbridge/", centroid_lat: 40.557, centroid_lng: -74.284, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["turnpike", "office_flex", "logistics", "regional_access"], representative_building_paths: [] },
  { id: "nj-piscataway", name: "Piscataway", slug: "piscataway", city: "Piscataway", state_abbr: "NJ", path: "/commercial-real-estate/NJ/piscataway/piscataway/", centroid_lat: 40.554, centroid_lng: -74.463, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["rd_flex", "industrial_flex", "central_jersey", "university_adjacent"], representative_building_paths: ["/commercial-real-estate/building/NJ/piscataway/30-knightsbridge-rd/"] },
  { id: "nj-exit-8a-logistics", name: "Exit 8A Logistics Corridor", slug: "exit-8a-logistics-corridor", city: "Monroe", state_abbr: "NJ", path: "/commercial-real-estate/NJ/monroe/exit-8a-logistics-corridor/", centroid_lat: 40.333, centroid_lng: -74.468, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "turnpike", "logistics"], representative_building_paths: [] },
  { id: "nj-cranbury", name: "Cranbury", slug: "cranbury", city: "Cranbury", state_abbr: "NJ", path: "/commercial-real-estate/NJ/cranbury/cranbury/", centroid_lat: 40.316, centroid_lng: -74.513, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["logistics", "warehouse", "office_flex", "central_jersey"], representative_building_paths: [] },
  { id: "nj-monroe", name: "Monroe", slug: "monroe", city: "Monroe", state_abbr: "NJ", path: "/commercial-real-estate/NJ/monroe/monroe/", centroid_lat: 40.336, centroid_lng: -74.433, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "turnpike", "central_jersey"], representative_building_paths: [] },
  { id: "nj-dayton", name: "Dayton", slug: "dayton", city: "Dayton", state_abbr: "NJ", path: "/commercial-real-estate/NJ/dayton/dayton/", centroid_lat: 40.378, centroid_lng: -74.512, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["warehouse", "distribution", "route_130", "central_jersey"], representative_building_paths: [] },
  { id: "nj-princeton", name: "Princeton", slug: "princeton", city: "Princeton", state_abbr: "NJ", path: "/commercial-real-estate/NJ/princeton/princeton/", centroid_lat: 40.357, centroid_lng: -74.668, area_type: "downtown_core", approximate_space_types: ["office", "lab", "medical"], profile: ["life_science", "university_adjacent", "professional_services", "suburban_office"], representative_building_paths: ["/commercial-real-estate/building/NJ/princeton/100-overlook-ctr/", "/commercial-real-estate/building/NJ/princeton/103-carnegie-ctr/", "/commercial-real-estate/building/NJ/princeton/princeton-forrestal-village-116-village-blvd/"] },
  { id: "nj-princeton-corridor", name: "Princeton Corridor", slug: "princeton-corridor", city: "Princeton", state_abbr: "NJ", path: "/commercial-real-estate/NJ/princeton/princeton-corridor/", centroid_lat: 40.34, centroid_lng: -74.62, area_type: "district", approximate_space_types: ["office", "lab", "flex"], profile: ["life_science", "pharma", "rd_flex", "suburban_office"], representative_building_paths: ["/commercial-real-estate/building/NJ/princeton/103-carnegie-ctr/", "/commercial-real-estate/building/NJ/princeton/princeton-forrestal-village-116-village-blvd/"] },
  { id: "nj-new-brunswick", name: "New Brunswick", slug: "new-brunswick", city: "New Brunswick", state_abbr: "NJ", path: "/commercial-real-estate/NJ/new-brunswick/new-brunswick/", centroid_lat: 40.486, centroid_lng: -74.444, area_type: "downtown_core", approximate_space_types: ["office", "medical", "lab"], profile: ["healthcare", "university_adjacent", "life_science", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NJ/new-brunswick/317-george-st/", "/commercial-real-estate/building/NJ/new-brunswick/37-easton-ave-2nd-floor/"] },
  { id: "nj-bridgewater", name: "Bridgewater", slug: "bridgewater", city: "Bridgewater", state_abbr: "NJ", path: "/commercial-real-estate/NJ/bridgewater/bridgewater/", centroid_lat: 40.595, centroid_lng: -74.617, area_type: "district", approximate_space_types: ["office", "lab", "medical"], profile: ["pharma", "suburban_office", "life_science", "i287"], representative_building_paths: ["/commercial-real-estate/building/NJ/bridgewater/1200-route-22-east/"] },
  { id: "nj-somerset", name: "Somerset", slug: "somerset", city: "Somerset", state_abbr: "NJ", path: "/commercial-real-estate/NJ/somerset/somerset/", centroid_lat: 40.499, centroid_lng: -74.522, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["pharma", "office_flex", "rd_flex", "central_jersey"], representative_building_paths: [] },
  { id: "nj-warren", name: "Warren", slug: "warren", city: "Warren", state_abbr: "NJ", path: "/commercial-real-estate/NJ/warren/warren/", centroid_lat: 40.634, centroid_lng: -74.5, area_type: "district", approximate_space_types: ["office", "medical"], profile: ["suburban_office", "client_facing", "i78", "professional_services"], representative_building_paths: [] },
  { id: "nj-iselin-metropark", name: "Iselin / Metropark", slug: "iselin-metropark", city: "Iselin", state_abbr: "NJ", path: "/commercial-real-estate/NJ/iselin/iselin-metropark/", centroid_lat: 40.568, centroid_lng: -74.328, area_type: "district", approximate_space_types: ["office", "coworking", "medical"], profile: ["transit_oriented", "office", "regional_business", "metropark"], representative_building_paths: ["/commercial-real-estate/building/NJ/iselin/33-wood-ave-s/"] },
  { id: "nj-holmdel", name: "Holmdel", slug: "holmdel", city: "Holmdel", state_abbr: "NJ", path: "/commercial-real-estate/NJ/holmdel/holmdel/", centroid_lat: 40.346, centroid_lng: -74.184, area_type: "district", approximate_space_types: ["office", "lab", "flex"], profile: ["suburban_campus", "technology", "life_science", "monmouth"], representative_building_paths: [] },
  { id: "phl-cherry-hill", name: "Cherry Hill", slug: "cherry-hill", city: "Cherry Hill", state_abbr: "NJ", path: "/commercial-real-estate/NJ/cherry-hill/cherry-hill/", centroid_lat: 39.928, centroid_lng: -75.025, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["south_jersey", "suburban_office", "medical", "retail_support"], representative_building_paths: ["/commercial-real-estate/building/NJ/cherry-hill/923-haddonfield-rd/"] },
  { id: "phl-mount-laurel", name: "Mount Laurel", slug: "mount-laurel", city: "Mount Laurel", state_abbr: "NJ", path: "/commercial-real-estate/NJ/mount-laurel/mount-laurel/", centroid_lat: 39.934, centroid_lng: -74.89, area_type: "district", approximate_space_types: ["office", "medical", "flex"], profile: ["south_jersey", "suburban_office", "office_flex", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/NJ/mount-laurel/309-fellowship-road-east-gate-center/", "/commercial-real-estate/building/NJ/mount-laurel/804-e-gate-dr/"] },
  { id: "phl-camden-waterfront-industrial", name: "Camden Waterfront / Industrial", slug: "camden-waterfront-industrial", city: "Camden", state_abbr: "NJ", path: "/commercial-real-estate/NJ/camden/camden-waterfront-industrial/", centroid_lat: 39.944, centroid_lng: -75.12, area_type: "industrial_area", approximate_space_types: ["office", "industrial", "flex"], profile: ["waterfront", "industrial_flex", "south_jersey", "port_adjacent"], representative_building_paths: [] },
  { id: "nj-moorestown", name: "Moorestown", slug: "moorestown", city: "Moorestown", state_abbr: "NJ", path: "/commercial-real-estate/NJ/moorestown/moorestown/", centroid_lat: 39.968, centroid_lng: -74.942, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["south_jersey", "office_flex", "regional_access", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/NJ/moorestown/1263-glen-ave/"] },
  { id: "nj-burlington-corridor", name: "Burlington Corridor", slug: "burlington-corridor", city: "Burlington", state_abbr: "NJ", path: "/commercial-real-estate/NJ/burlington/burlington-corridor/", centroid_lat: 40.074, centroid_lng: -74.844, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["south_jersey", "warehouse", "route_130", "logistics"], representative_building_paths: ["/commercial-real-estate/building/NJ/beverly/4259-us-130/"] },
];

const austinMetroDistrictDefinitions = [
  { id: "aus-downtown-austin", name: "Downtown Austin", slug: "downtown-austin", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/downtown-austin/", centroid_lat: 30.267, centroid_lng: -97.743, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "startup", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/TX/austin/100-congress-ave/", "/commercial-real-estate/building/TX/austin/111-congress-ave/"] },
  { id: "aus-cbd", name: "CBD", slug: "cbd", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/cbd/", centroid_lat: 30.269, centroid_lng: -97.742, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "formal_office", "finance", "legal"], representative_building_paths: ["/commercial-real-estate/building/TX/austin/100-congress-ave/", "/commercial-real-estate/building/TX/austin/111-congress-ave/"] },
  { id: "aus-rainey-street", name: "Rainey Street District", slug: "rainey-street-district", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/rainey-street-district/", centroid_lat: 30.258, centroid_lng: -97.738, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["mixed_use", "startup", "hospitality", "downtown_edge"], representative_building_paths: ["/commercial-real-estate/building/TX/austin/100-congress-ave/"] },
  { id: "aus-south-congress", name: "South Congress", slug: "south-congress", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/south-congress/", centroid_lat: 30.25, centroid_lng: -97.749, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["mixed_use", "retail_support", "creative_office", "local_services"], representative_building_paths: [] },
  { id: "aus-east-austin", name: "East Austin", slug: "east-austin", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/east-austin/", centroid_lat: 30.264, centroid_lng: -97.719, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["startup", "creative_office", "adaptive_reuse", "mixed_use"], representative_building_paths: [] },
  { id: "aus-domain", name: "The Domain", slug: "the-domain", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/the-domain/", centroid_lat: 30.402, centroid_lng: -97.726, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["tech", "suburban_office", "mixed_use", "corporate"], representative_building_paths: ["/commercial-real-estate/building/TX/austin/10900-stonelake-blvd/", "/commercial-real-estate/building/TX/austin/10505-boyer-blvd/"] },
  { id: "aus-north-austin", name: "North Austin", slug: "north-austin", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/north-austin/", centroid_lat: 30.378, centroid_lng: -97.711, area_type: "district", approximate_space_types: ["office", "flex", "industrial"], profile: ["tech", "office_flex", "suburban_office", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/TX/austin/10505-boyer-blvd/", "/commercial-real-estate/building/TX/austin/10900-stonelake-blvd/"] },
  { id: "aus-university-innovation", name: "University / Innovation District", slug: "university-innovation-district", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/university-innovation-district/", centroid_lat: 30.286, centroid_lng: -97.735, area_type: "district", approximate_space_types: ["office", "lab", "coworking"], profile: ["university_adjacent", "startup", "research", "innovation"], representative_building_paths: [] },
  { id: "aus-round-rock", name: "Round Rock", slug: "round-rock", city: "Round Rock", state_abbr: "TX", path: "/commercial-real-estate/TX/round-rock/round-rock/", centroid_lat: 30.508, centroid_lng: -97.679, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["suburban_office", "technology", "manufacturing", "regional_access"], representative_building_paths: ["/commercial-real-estate/building/TX/round-rock/1-chisolm-trail-road/", "/commercial-real-estate/building/TX/round-rock/106-e-old-settlers-blvd/"] },
  { id: "aus-cedar-park", name: "Cedar Park", slug: "cedar-park", city: "Cedar Park", state_abbr: "TX", path: "/commercial-real-estate/TX/cedar-park/cedar-park/", centroid_lat: 30.505, centroid_lng: -97.82, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "local_services", "medical", "northwest_growth"], representative_building_paths: ["/commercial-real-estate/building/TX/cedar-park/12800-anderson-mill-rd/"] },
  { id: "aus-georgetown", name: "Georgetown", slug: "georgetown", city: "Georgetown", state_abbr: "TX", path: "/commercial-real-estate/TX/georgetown/georgetown/", centroid_lat: 30.633, centroid_lng: -97.678, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["north_growth", "suburban_office", "light_industrial", "local_services"], representative_building_paths: [] },
  { id: "aus-pflugerville", name: "Pflugerville", slug: "pflugerville", city: "Pflugerville", state_abbr: "TX", path: "/commercial-real-estate/TX/pflugerville/pflugerville/", centroid_lat: 30.44, centroid_lng: -97.62, area_type: "district", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "logistics", "suburban_growth", "service_commercial"], representative_building_paths: [] },
  { id: "aus-leander", name: "Leander", slug: "leander", city: "Leander", state_abbr: "TX", path: "/commercial-real-estate/TX/leander/leander/", centroid_lat: 30.579, centroid_lng: -97.854, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["northwest_growth", "local_services", "suburban_office", "medical"], representative_building_paths: [] },
  { id: "aus-austin-airport-area", name: "Austin Airport Area", slug: "austin-airport-area", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/austin-airport-area/", centroid_lat: 30.203, centroid_lng: -97.666, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "industrial_flex", "service_commercial"], representative_building_paths: [] },
  { id: "aus-southeast-industrial", name: "Southeast Austin Industrial", slug: "southeast-austin-industrial", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/southeast-austin-industrial/", centroid_lat: 30.205, centroid_lng: -97.725, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "warehouse", "logistics", "service_commercial"], representative_building_paths: [] },
  { id: "aus-northeast-industrial", name: "Northeast Austin Industrial", slug: "northeast-austin-industrial", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/northeast-austin-industrial/", centroid_lat: 30.342, centroid_lng: -97.655, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "logistics", "office_flex", "service_commercial"], representative_building_paths: [] },
  { id: "aus-parmer-corridor", name: "Parmer Corridor", slug: "parmer-corridor", city: "Austin", state_abbr: "TX", path: "/commercial-real-estate/TX/austin/parmer-corridor/", centroid_lat: 30.432, centroid_lng: -97.694, area_type: "corridor", approximate_space_types: ["office", "industrial", "flex"], profile: ["technology", "semiconductor", "office_flex", "rd"], representative_building_paths: ["/commercial-real-estate/building/TX/austin/10900-stonelake-blvd/", "/commercial-real-estate/building/TX/austin/10505-boyer-blvd/"] },
  { id: "aus-samsung-taylor-corridor", name: "Samsung / Taylor Corridor", slug: "samsung-taylor-corridor", city: "Taylor", state_abbr: "TX", path: "/commercial-real-estate/TX/taylor/samsung-taylor-corridor/", centroid_lat: 30.571, centroid_lng: -97.409, area_type: "corridor", approximate_space_types: ["industrial", "flex", "office"], profile: ["semiconductor", "advanced_manufacturing", "industrial_flex", "regional_growth"], representative_building_paths: [] },
  { id: "aus-hutto", name: "Hutto", slug: "hutto", city: "Hutto", state_abbr: "TX", path: "/commercial-real-estate/TX/hutto/hutto/", centroid_lat: 30.542, centroid_lng: -97.546, area_type: "district", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "manufacturing", "suburban_growth", "service_commercial"], representative_building_paths: [] },
  { id: "aus-kyle", name: "Kyle", slug: "kyle", city: "Kyle", state_abbr: "TX", path: "/commercial-real-estate/TX/kyle/kyle/", centroid_lat: 29.989, centroid_lng: -97.877, area_type: "district", approximate_space_types: ["industrial", "flex", "retail"], profile: ["south_growth", "logistics", "industrial_flex", "local_services"], representative_building_paths: [] },
  { id: "aus-buda", name: "Buda", slug: "buda", city: "Buda", state_abbr: "TX", path: "/commercial-real-estate/TX/buda/buda/", centroid_lat: 30.085, centroid_lng: -97.841, area_type: "district", approximate_space_types: ["industrial", "flex", "retail"], profile: ["south_growth", "logistics", "industrial_flex", "service_commercial"], representative_building_paths: [] },
];

const houstonMetroDistrictDefinitions = [
  { id: "hou-downtown-houston", name: "Downtown Houston", slug: "downtown-houston", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/downtown-houston/", centroid_lat: 29.76, centroid_lng: -95.369, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "energy", "civic"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/801-louisiana-st/", "/commercial-real-estate/building/TX/houston/1201-fannin-st/"] },
  { id: "hou-cbd", name: "Houston CBD", slug: "houston-cbd", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/houston-cbd/", centroid_lat: 29.758, centroid_lng: -95.367, area_type: "district", approximate_space_types: ["office", "coworking"], profile: ["formal_office", "energy", "finance", "legal"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/801-louisiana-st/", "/commercial-real-estate/building/TX/houston/1201-fannin-st/"] },
  { id: "hou-midtown", name: "Midtown Houston", slug: "midtown-houston", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/midtown-houston/", centroid_lat: 29.742, centroid_lng: -95.376, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["mixed_use", "medical_adjacent", "local_services", "central"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/2000-crawford-st/"] },
  { id: "hou-montrose", name: "Montrose", slug: "montrose", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/montrose/", centroid_lat: 29.742, centroid_lng: -95.397, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["boutique_office", "creative_office", "local_services", "medical"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/4101-greenbriar-dr/"] },
  { id: "hou-eado", name: "EaDo", slug: "eado", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/eado/", centroid_lat: 29.747, centroid_lng: -95.349, area_type: "district", approximate_space_types: ["office", "retail", "flex"], profile: ["adaptive_reuse", "startup", "creative_office", "downtown_edge"], representative_building_paths: [] },
  { id: "hou-heights", name: "The Heights", slug: "the-heights", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/the-heights/", centroid_lat: 29.803, centroid_lng: -95.398, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["local_services", "boutique_office", "retail_support", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/1415-north-loop-w/"] },
  { id: "hou-greenway-plaza", name: "Greenway Plaza", slug: "greenway-plaza", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/greenway-plaza/", centroid_lat: 29.731, centroid_lng: -95.432, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["office", "client_facing", "central_west", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/3730-kirby-dr/", "/commercial-real-estate/building/TX/houston/4101-greenbriar-dr/"] },
  { id: "hou-upper-kirby", name: "Upper Kirby", slug: "upper-kirby", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/upper-kirby/", centroid_lat: 29.734, centroid_lng: -95.419, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["client_facing", "boutique_office", "retail_support", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/3730-kirby-dr/", "/commercial-real-estate/building/TX/houston/4801-woodway-dr/"] },
  { id: "hou-uptown-galleria", name: "Uptown / Galleria", slug: "uptown-galleria", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/uptown-galleria/", centroid_lat: 29.741, centroid_lng: -95.461, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["client_facing", "office", "retail_support", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/1980-post-oak-blvd/", "/commercial-real-estate/building/TX/houston/1700-post-oak-blvd/", "/commercial-real-estate/building/TX/houston/5847-san-felipe-st/"] },
  { id: "hou-river-oaks-district", name: "River Oaks District", slug: "river-oaks-district", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/river-oaks-district/", centroid_lat: 29.742, centroid_lng: -95.453, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["client_facing", "retail_support", "wealth", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/1700-post-oak-blvd/", "/commercial-real-estate/building/TX/houston/4801-woodway-dr/"] },
  { id: "hou-energy-corridor", name: "Energy Corridor", slug: "energy-corridor", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/energy-corridor/", centroid_lat: 29.785, centroid_lng: -95.634, area_type: "corridor", approximate_space_types: ["office", "flex"], profile: ["energy", "corporate", "campus", "west_houston"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/15730-park-row-dr/", "/commercial-real-estate/building/TX/houston/15740-park-row-dr/"] },
  { id: "hou-westchase", name: "Westchase", slug: "westchase", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/westchase/", centroid_lat: 29.729, centroid_lng: -95.56, area_type: "district", approximate_space_types: ["office", "flex", "retail"], profile: ["suburban_office", "energy", "office_flex", "west_houston"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/2500-wilcrest-dr/", "/commercial-real-estate/building/TX/houston/2323-s-voss-rd/"] },
  { id: "hou-memorial-city", name: "Memorial City", slug: "memorial-city", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/memorial-city/", centroid_lat: 29.781, centroid_lng: -95.544, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "medical", "retail_support", "west_houston"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/800-town-and-country-blvd/"] },
  { id: "hou-citycentre", name: "CityCentre", slug: "citycentre", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/citycentre/", centroid_lat: 29.78, centroid_lng: -95.561, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["mixed_use", "suburban_office", "retail_support", "west_houston"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/800-town-and-country-blvd/"] },
  { id: "hou-katy", name: "Katy", slug: "katy", city: "Katy", state_abbr: "TX", path: "/commercial-real-estate/TX/katy/katy/", centroid_lat: 29.785, centroid_lng: -95.824, area_type: "district", approximate_space_types: ["office", "medical", "retail", "industrial"], profile: ["west_growth", "suburban_office", "local_services", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/TX/katy/2717-commercial-center-blvd/", "/commercial-real-estate/building/TX/katy/29789-us-90/"] },
  { id: "hou-the-woodlands", name: "The Woodlands", slug: "the-woodlands", city: "The Woodlands", state_abbr: "TX", path: "/commercial-real-estate/TX/the-woodlands/the-woodlands/", centroid_lat: 30.165, centroid_lng: -95.461, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["corporate", "suburban_office", "healthcare", "north_growth"], representative_building_paths: ["/commercial-real-estate/building/TX/the-woodlands/10210-grogans-mill-rd/", "/commercial-real-estate/building/TX/the-woodlands/1790-hughes-landing-blvd/", "/commercial-real-estate/building/TX/the-woodlands/2002-timberloch-place/", "/commercial-real-estate/building/TX/the-woodlands/21-waterway-ave/", "/commercial-real-estate/building/TX/the-woodlands/9595-six-pines-dr/"] },
  { id: "hou-greenspoint", name: "Greenspoint", slug: "greenspoint", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/greenspoint/", centroid_lat: 29.945, centroid_lng: -95.412, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["airport_adjacent", "office_flex", "north_houston", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/340-350-n-sam-houston-pkwy-e/", "/commercial-real-estate/building/TX/houston/507-n-sam-houston-pkwy-e/"] },
  { id: "hou-texas-medical-center", name: "Texas Medical Center", slug: "texas-medical-center", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/texas-medical-center/", centroid_lat: 29.706, centroid_lng: -95.401, area_type: "district", approximate_space_types: ["medical", "office", "lab"], profile: ["healthcare", "life_science", "medical", "research"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/4101-greenbriar-dr/", "/commercial-real-estate/building/TX/houston/2000-crawford-st/"] },
  { id: "hou-medical-center-museum-district", name: "Medical Center / Museum District", slug: "medical-center-museum-district", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/medical-center-museum-district/", centroid_lat: 29.721, centroid_lng: -95.389, area_type: "district", approximate_space_types: ["medical", "office", "retail"], profile: ["healthcare", "medical", "institutional", "central"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/4101-greenbriar-dr/", "/commercial-real-estate/building/TX/houston/2000-crawford-st/"] },
  { id: "hou-pearland", name: "Pearland", slug: "pearland", city: "Pearland", state_abbr: "TX", path: "/commercial-real-estate/TX/pearland/pearland/", centroid_lat: 29.563, centroid_lng: -95.286, area_type: "district", approximate_space_types: ["office", "medical", "retail", "industrial"], profile: ["south_growth", "medical", "local_services", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/TX/pearland/11200-broadway-st/"] },
  { id: "hou-port-houston", name: "Port Houston", slug: "port-houston", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/port-houston/", centroid_lat: 29.735, centroid_lng: -95.265, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["port", "logistics", "warehouse", "petrochemical"], representative_building_paths: [] },
  { id: "hou-ship-channel-east-industrial", name: "Ship Channel / East Houston Industrial", slug: "ship-channel-east-houston-industrial", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/ship-channel-east-houston-industrial/", centroid_lat: 29.758, centroid_lng: -95.19, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["ship_channel", "petrochemical", "logistics", "manufacturing"], representative_building_paths: [] },
  { id: "hou-pasadena", name: "Pasadena", slug: "pasadena", city: "Pasadena", state_abbr: "TX", path: "/commercial-real-estate/TX/pasadena/pasadena/", centroid_lat: 29.691, centroid_lng: -95.209, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["petrochemical", "industrial_flex", "ship_channel", "service_commercial"], representative_building_paths: [] },
  { id: "hou-deer-park", name: "Deer Park", slug: "deer-park", city: "Deer Park", state_abbr: "TX", path: "/commercial-real-estate/TX/deer-park/deer-park/", centroid_lat: 29.705, centroid_lng: -95.123, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["petrochemical", "ship_channel", "industrial_services", "manufacturing"], representative_building_paths: [] },
  { id: "hou-baytown", name: "Baytown", slug: "baytown", city: "Baytown", state_abbr: "TX", path: "/commercial-real-estate/TX/baytown/baytown/", centroid_lat: 29.736, centroid_lng: -94.978, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "retail"], profile: ["petrochemical", "port_adjacent", "logistics", "manufacturing"], representative_building_paths: [] },
  { id: "hou-la-porte", name: "La Porte", slug: "la-porte", city: "La Porte", state_abbr: "TX", path: "/commercial-real-estate/TX/la-porte/la-porte/", centroid_lat: 29.665, centroid_lng: -95.019, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["ship_channel", "petrochemical", "port_adjacent", "industrial_services"], representative_building_paths: [] },
  { id: "hou-channelview", name: "Channelview", slug: "channelview", city: "Channelview", state_abbr: "TX", path: "/commercial-real-estate/TX/channelview/channelview/", centroid_lat: 29.776, centroid_lng: -95.114, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["ship_channel", "petrochemical", "logistics", "service_commercial"], representative_building_paths: [] },
  { id: "hou-north-industrial", name: "North Houston Industrial", slug: "north-houston-industrial", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/north-houston-industrial/", centroid_lat: 29.94, centroid_lng: -95.38, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "logistics", "airport_adjacent", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/507-n-sam-houston-pkwy-e/", "/commercial-real-estate/building/TX/houston/340-350-n-sam-houston-pkwy-e/"] },
  { id: "hou-northwest-industrial", name: "Northwest Houston Industrial", slug: "northwest-houston-industrial", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/northwest-houston-industrial/", centroid_lat: 29.86, centroid_lng: -95.52, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "warehouse", "logistics", "northwest"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/13201-northwest-freeway/", "/commercial-real-estate/building/TX/houston/7676-hillmont-st/", "/commercial-real-estate/building/TX/houston/5600-northwest-central-dr/"] },
  { id: "hou-south-industrial", name: "South Houston Industrial", slug: "south-houston-industrial", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/south-houston-industrial/", centroid_lat: 29.65, centroid_lng: -95.34, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "logistics", "hobby_access", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/2600-south-loop-w/"] },
  { id: "hou-hobby-airport-area", name: "Hobby Airport Area", slug: "hobby-airport-area", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/hobby-airport-area/", centroid_lat: 29.645, centroid_lng: -95.278, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "industrial_flex", "service_commercial"], representative_building_paths: [] },
  { id: "hou-bush-airport-area", name: "Bush Airport / IAH Area", slug: "bush-airport-iah-area", city: "Houston", state_abbr: "TX", path: "/commercial-real-estate/TX/houston/bush-airport-iah-area/", centroid_lat: 29.99, centroid_lng: -95.34, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "north_houston", "service_commercial"], representative_building_paths: ["/commercial-real-estate/building/TX/houston/507-n-sam-houston-pkwy-e/", "/commercial-real-estate/building/TX/houston/16770-imperial-valley-dr/"] },
  { id: "hou-sugar-land", name: "Sugar Land", slug: "sugar-land", city: "Sugar Land", state_abbr: "TX", path: "/commercial-real-estate/TX/sugar-land/sugar-land/", centroid_lat: 29.619, centroid_lng: -95.635, area_type: "district", approximate_space_types: ["office", "medical", "industrial", "retail"], profile: ["suburban_office", "medical", "southwest_growth", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/TX/sugar-land/12808-w-airport-blvd/", "/commercial-real-estate/building/TX/sugar-land/14090-southwest-freeway/", "/commercial-real-estate/building/TX/sugar-land/1601-industrial-blvd/", "/commercial-real-estate/building/TX/sugar-land/2245-texas-dr/", "/commercial-real-estate/building/TX/sugar-land/three-sugar-creek-center/"] },
  { id: "hou-stafford", name: "Stafford", slug: "stafford", city: "Stafford", state_abbr: "TX", path: "/commercial-real-estate/TX/stafford/stafford/", centroid_lat: 29.616, centroid_lng: -95.557, area_type: "district", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "southwest", "service_commercial", "office_flex"], representative_building_paths: [] },
  { id: "hou-missouri-city", name: "Missouri City", slug: "missouri-city", city: "Missouri City", state_abbr: "TX", path: "/commercial-real-estate/TX/missouri-city/missouri-city/", centroid_lat: 29.618, centroid_lng: -95.537, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["local_services", "southwest_growth", "medical", "retail_support"], representative_building_paths: [] },
  { id: "hou-cypress", name: "Cypress", slug: "cypress", city: "Cypress", state_abbr: "TX", path: "/commercial-real-estate/TX/cypress/cypress/", centroid_lat: 29.969, centroid_lng: -95.697, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["northwest_growth", "local_services", "medical", "suburban_office"], representative_building_paths: [] },
  { id: "hou-spring", name: "Spring", slug: "spring", city: "Spring", state_abbr: "TX", path: "/commercial-real-estate/TX/spring/spring/", centroid_lat: 30.079, centroid_lng: -95.417, area_type: "district", approximate_space_types: ["office", "medical", "industrial"], profile: ["north_growth", "suburban_office", "medical", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/TX/spring/24624-interstate-45-north/"] },
  { id: "hou-conroe", name: "Conroe", slug: "conroe", city: "Conroe", state_abbr: "TX", path: "/commercial-real-estate/TX/conroe/conroe/", centroid_lat: 30.312, centroid_lng: -95.456, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["north_growth", "industrial_flex", "local_services", "regional_access"], representative_building_paths: [] },
];

const nashvilleMetroDistrictDefinitions = [
  { id: "nash-downtown", name: "Downtown Nashville", slug: "downtown-nashville", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/downtown-nashville/", centroid_lat: 36.163, centroid_lng: -86.781, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["downtown", "office", "entertainment", "hospitality"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/150-4th-ave-n/", "/commercial-real-estate/building/TN/nashville/222-second-ave-s/", "/commercial-real-estate/building/TN/nashville/424-church-st/"] },
  { id: "nash-sobro", name: "SoBro", slug: "sobro", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/sobro/", centroid_lat: 36.157, centroid_lng: -86.775, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["entertainment", "hospitality", "downtown_edge", "creative_office"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/222-second-ave-s/", "/commercial-real-estate/building/TN/nashville/150-4th-ave-n/"] },
  { id: "nash-gulch", name: "The Gulch", slug: "the-gulch", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/the-gulch/", centroid_lat: 36.153, centroid_lng: -86.784, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["mixed_use", "creative_office", "hospitality", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/222-second-ave-s/"] },
  { id: "nash-midtown", name: "Midtown Nashville", slug: "midtown-nashville", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/midtown-nashville/", centroid_lat: 36.148, centroid_lng: -86.798, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["healthcare", "education", "office", "music"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/818-18th-ave-s/", "/commercial-real-estate/building/TN/nashville/3102-west-end-ave/"] },
  { id: "nash-music-row", name: "Music Row", slug: "music-row", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/music-row/", centroid_lat: 36.151, centroid_lng: -86.793, area_type: "district", approximate_space_types: ["office", "studio", "retail"], profile: ["music", "entertainment", "creative_office", "media"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/818-18th-ave-s/"] },
  { id: "nash-west-end", name: "West End", slug: "west-end", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/west-end/", centroid_lat: 36.144, centroid_lng: -86.811, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["healthcare", "education", "professional_services", "medical"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/3102-west-end-ave/", "/commercial-real-estate/building/TN/nashville/3200-west-end-ave/"] },
  { id: "nash-germantown", name: "Germantown", slug: "germantown", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/germantown/", centroid_lat: 36.176, centroid_lng: -86.786, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["mixed_use", "creative_office", "local_services", "hospitality"], representative_building_paths: [] },
  { id: "nash-east-nashville", name: "East Nashville", slug: "east-nashville", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/east-nashville/", centroid_lat: 36.178, centroid_lng: -86.742, area_type: "district", approximate_space_types: ["office", "retail", "commercial"], profile: ["creative_office", "local_services", "mixed_use", "small_business"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/901-woodland-st/"] },
  { id: "nash-vanderbilt-medical", name: "Vanderbilt / Medical District", slug: "vanderbilt-medical-district", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/vanderbilt-medical-district/", centroid_lat: 36.143, centroid_lng: -86.802, area_type: "district", approximate_space_types: ["medical", "office", "lab"], profile: ["healthcare", "education", "medical", "research"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/3102-west-end-ave/", "/commercial-real-estate/building/TN/nashville/3200-west-end-ave/"] },
  { id: "nash-healthcare-corridor", name: "Healthcare Corridor", slug: "healthcare-corridor", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/healthcare-corridor/", centroid_lat: 36.129, centroid_lng: -86.82, area_type: "corridor", approximate_space_types: ["medical", "office"], profile: ["healthcare", "medical", "professional_services", "institutional"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/40-burton-hills-blvd/", "/commercial-real-estate/building/TN/nashville/3102-west-end-ave/"] },
  { id: "nash-brentwood", name: "Brentwood", slug: "brentwood", city: "Brentwood", state_abbr: "TN", path: "/commercial-real-estate/TN/brentwood/brentwood/", centroid_lat: 36.033, centroid_lng: -86.782, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "healthcare", "professional_services", "corporate"], representative_building_paths: ["/commercial-real-estate/building/TN/brentwood/320-seven-springs-way/", "/commercial-real-estate/building/TN/brentwood/9005-overlook-blvd/"] },
  { id: "nash-franklin", name: "Franklin", slug: "franklin", city: "Franklin", state_abbr: "TN", path: "/commercial-real-estate/TN/franklin/franklin/", centroid_lat: 35.925, centroid_lng: -86.869, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "corporate", "healthcare", "south_growth"], representative_building_paths: ["/commercial-real-estate/building/TN/franklin/2550-meridian-blvd/", "/commercial-real-estate/building/TN/franklin/3401-mallory-ln/", "/commercial-real-estate/building/TN/franklin/725-cool-springs-blvd/"] },
  { id: "nash-cool-springs", name: "Cool Springs", slug: "cool-springs", city: "Franklin", state_abbr: "TN", path: "/commercial-real-estate/TN/franklin/cool-springs/", centroid_lat: 35.945, centroid_lng: -86.821, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["suburban_office", "corporate", "retail_support", "healthcare"], representative_building_paths: ["/commercial-real-estate/building/TN/franklin/725-cool-springs-blvd/", "/commercial-real-estate/building/TN/franklin/2550-meridian-blvd/"] },
  { id: "nash-green-hills", name: "Green Hills", slug: "green-hills", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/green-hills/", centroid_lat: 36.107, centroid_lng: -86.816, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["client_facing", "medical", "retail_support", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/40-burton-hills-blvd/"] },
  { id: "nash-bellevue", name: "Bellevue", slug: "bellevue", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/bellevue/", centroid_lat: 36.071, centroid_lng: -86.935, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["local_services", "west_growth", "medical", "retail_support"], representative_building_paths: [] },
  { id: "nash-hendersonville", name: "Hendersonville", slug: "hendersonville", city: "Hendersonville", state_abbr: "TN", path: "/commercial-real-estate/TN/hendersonville/hendersonville/", centroid_lat: 36.304, centroid_lng: -86.62, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["north_growth", "local_services", "medical", "retail_support"], representative_building_paths: [] },
  { id: "nash-mt-juliet", name: "Mt. Juliet", slug: "mt-juliet", city: "Mt. Juliet", state_abbr: "TN", path: "/commercial-real-estate/TN/mt-juliet/mt-juliet/", centroid_lat: 36.2, centroid_lng: -86.519, area_type: "district", approximate_space_types: ["industrial", "office", "retail"], profile: ["east_growth", "logistics", "local_services", "retail_support"], representative_building_paths: [] },
  { id: "nash-murfreesboro", name: "Murfreesboro", slug: "murfreesboro", city: "Murfreesboro", state_abbr: "TN", path: "/commercial-real-estate/TN/murfreesboro/murfreesboro/", centroid_lat: 35.846, centroid_lng: -86.392, area_type: "district", approximate_space_types: ["office", "medical", "industrial"], profile: ["south_growth", "regional_office", "medical", "industrial_flex"], representative_building_paths: ["/commercial-real-estate/building/TN/murfreesboro/2615-medical-center-pkwy/"] },
  { id: "nash-airport-area", name: "Nashville Airport Area", slug: "nashville-airport-area", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/nashville-airport-area/", centroid_lat: 36.126, centroid_lng: -86.678, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "office_flex", "hospitality_support"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/101-airpark-center-dr-e/", "/commercial-real-estate/building/TN/nashville/555-marriott-dr/"] },
  { id: "nash-southeast-industrial", name: "Southeast Nashville Industrial", slug: "southeast-nashville-industrial", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/southeast-nashville-industrial/", centroid_lat: 36.089, centroid_lng: -86.658, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "logistics", "warehouse", "manufacturing"], representative_building_paths: ["/commercial-real-estate/building/TN/nashville/101-airpark-center-dr-e/"] },
  { id: "nash-north-industrial", name: "North Nashville Industrial", slug: "north-nashville-industrial", city: "Nashville", state_abbr: "TN", path: "/commercial-real-estate/TN/nashville/north-nashville-industrial/", centroid_lat: 36.221, centroid_lng: -86.803, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "service_commercial", "warehouse", "northside"], representative_building_paths: [] },
  { id: "nash-la-vergne", name: "La Vergne", slug: "la-vergne", city: "La Vergne", state_abbr: "TN", path: "/commercial-real-estate/TN/la-vergne/la-vergne/", centroid_lat: 36.015, centroid_lng: -86.581, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "logistics", "manufacturing", "southeast_growth"], representative_building_paths: [] },
  { id: "nash-smyrna", name: "Smyrna", slug: "smyrna", city: "Smyrna", state_abbr: "TN", path: "/commercial-real-estate/TN/smyrna/smyrna/", centroid_lat: 35.982, centroid_lng: -86.518, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["manufacturing", "logistics", "industrial_flex", "southeast_growth"], representative_building_paths: ["/commercial-real-estate/building/TN/smyrna/2250-midway-ln/"] },
  { id: "nash-lebanon", name: "Lebanon", slug: "lebanon", city: "Lebanon", state_abbr: "TN", path: "/commercial-real-estate/TN/lebanon/lebanon/", centroid_lat: 36.208, centroid_lng: -86.292, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["logistics", "manufacturing", "east_growth", "industrial_flex"], representative_building_paths: [] },
  { id: "nash-gallatin", name: "Gallatin", slug: "gallatin", city: "Gallatin", state_abbr: "TN", path: "/commercial-real-estate/TN/gallatin/gallatin/", centroid_lat: 36.388, centroid_lng: -86.447, area_type: "district", approximate_space_types: ["industrial", "office", "retail"], profile: ["north_growth", "manufacturing", "local_services", "industrial_flex"], representative_building_paths: [] },
  { id: "nash-antioch", name: "Antioch", slug: "antioch", city: "Antioch", state_abbr: "TN", path: "/commercial-real-estate/TN/antioch/antioch/", centroid_lat: 36.06, centroid_lng: -86.672, area_type: "district", approximate_space_types: ["industrial", "retail", "office"], profile: ["southeast_growth", "service_commercial", "industrial_flex", "local_services"], representative_building_paths: [] },
  { id: "nash-clarksville", name: "Clarksville", slug: "clarksville", city: "Clarksville", state_abbr: "TN", path: "/commercial-real-estate/TN/clarksville/clarksville/", centroid_lat: 36.529, centroid_lng: -87.359, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["regional_market", "manufacturing", "military_adjacent", "local_services"], representative_building_paths: [] },
];

const sfEditorialDistrictDefinitions = [
  {
    id: "sf-bayview-industrial",
    name: "Bayview Industrial",
    slug: "bayview-industrial",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/bayview-industrial/",
    centroid_lat: 37.739,
    centroid_lng: -122.391,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex"],
    profile: ["warehouse", "distribution", "food_logistics", "contractor_service", "light_manufacturing", "operational_flex"],
    representative_building_paths: [],
  },
  {
    id: "sf-central-waterfront",
    name: "Central Waterfront",
    slug: "central-waterfront",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/central-waterfront/",
    centroid_lat: 37.752,
    centroid_lng: -122.386,
    area_type: "industrial_area",
    approximate_space_types: ["industrial", "flex", "office"],
    profile: ["production", "fabrication", "maker", "prototyping", "service_industrial", "maritime_support"],
    representative_building_paths: [],
  },
  {
    id: "sf-showplace-square",
    name: "Showplace Square",
    slug: "showplace-square",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/showplace-square/",
    centroid_lat: 37.77,
    centroid_lng: -122.402,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "flex", "retail"],
    profile: ["design_trade", "showroom", "creative_production", "office_showroom", "customer_facing_pdr"],
    representative_building_paths: [],
  },
  {
    id: "sf-potrero-hill",
    name: "Potrero Hill",
    slug: "potrero-hill",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/potrero-hill/",
    centroid_lat: 37.756,
    centroid_lng: -122.402,
    area_type: "district",
    approximate_space_types: ["office", "industrial", "flex"],
    profile: ["creative_office", "selective_production", "maker", "service_commercial", "office_production"],
    representative_building_paths: [],
  },
  {
    id: "sf-south-beach",
    name: "South Beach",
    slug: "south-beach",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/south-beach/",
    centroid_lat: 37.79094696,
    centroid_lng: -122.39863586,
    area_type: "district",
    approximate_space_types: ["office", "coworking", "retail"],
    profile: ["professional_services", "technology", "waterfront", "mixed_use"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-francisco/188-spear-st/",
      "/commercial-real-estate/building/CA/san-francisco/88-spear-st/",
      "/commercial-real-estate/building/CA/san-francisco/201-spear-st/",
      "/commercial-real-estate/building/CA/san-francisco/121-spear-st/",
      "/commercial-real-estate/building/CA/san-francisco/345-spear-st/",
      "/commercial-real-estate/building/CA/san-francisco/301-brannan-st/",
      "/commercial-real-estate/building/CA/san-francisco/185-berry-st/",
      "/commercial-real-estate/building/CA/san-francisco/425-1st-st/",
    ],
  },
  {
    id: "sf-mission-district",
    name: "Mission District",
    slug: "mission-district",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/mission-district/",
    centroid_lat: 37.75687408,
    centroid_lng: -122.41738892,
    area_type: "district",
    approximate_space_types: ["retail", "office", "coworking", "flex"],
    profile: ["nonprofit", "local_services", "creative_office", "neighborhood_commercial"],
    representative_building_paths: [
      "/commercial-real-estate/building/CA/san-francisco/1800-mission-st/",
      "/commercial-real-estate/building/CA/san-francisco/2900-18th-st/",
      "/commercial-real-estate/building/CA/san-francisco/1850-bryant-st/",
      "/commercial-real-estate/building/CA/san-francisco/2741-16th-st/",
      "/commercial-real-estate/building/CA/san-francisco/1880-mission-st/",
      "/commercial-real-estate/building/CA/san-francisco/3150-18th-st/",
      "/commercial-real-estate/building/CA/san-francisco/2400-16th-st/",
      "/commercial-real-estate/building/CA/san-francisco/2601-mission-st/",
    ],
  },
  {
    id: "sf-mission",
    name: "Mission",
    slug: "mission",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/mission/",
    centroid_lat: 37.759,
    centroid_lng: -122.414,
    area_type: "district",
    approximate_space_types: ["retail", "office", "coworking"],
    profile: ["local_services", "retail", "creative_office", "food_beverage"],
    representative_building_paths: [],
  },
  {
    id: "sf-richmond-district",
    name: "Richmond District",
    slug: "richmond",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/richmond/",
    centroid_lat: 37.78,
    centroid_lng: -122.477,
    area_type: "district",
    approximate_space_types: ["retail", "office"],
    profile: ["local_services", "medical", "retail", "neighborhood_commercial"],
    representative_building_paths: [],
  },
  {
    id: "sf-sunset-district",
    name: "Sunset District",
    slug: "sunset",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/sunset/",
    centroid_lat: 37.753,
    centroid_lng: -122.493,
    area_type: "district",
    approximate_space_types: ["retail", "office"],
    profile: ["local_services", "medical", "retail", "neighborhood_commercial"],
    representative_building_paths: [],
  },
  {
    id: "sf-presidio",
    name: "Presidio",
    slug: "presidio",
    city: "San Francisco",
    state_abbr: "CA",
    path: "/commercial-real-estate/CA/san-francisco/presidio/",
    centroid_lat: 37.798,
    centroid_lng: -122.466,
    area_type: "district",
    approximate_space_types: ["office", "coworking", "retail"],
    profile: ["campus_office", "creative_office", "institutional", "visitor_serving"],
    representative_building_paths: [],
  },
];

const nycMetroPhase1DistrictDefinitions = [
  { id: "nyc-financial-district", name: "Financial District", slug: "financial-district", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/financial-district/", centroid_lat: 40.707, centroid_lng: -74.011, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["finance", "legal", "professional_services", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/115-broadway/", "/commercial-real-estate/building/NY/new-york/14-wall-st/", "/commercial-real-estate/building/NY/new-york/140-broadway/", "/commercial-real-estate/building/NY/new-york/165-broadway/", "/commercial-real-estate/building/NY/new-york/80-broad-st/", "/commercial-real-estate/building/NY/new-york/85-broad-st/"] },
  { id: "nyc-world-trade-tribeca", name: "World Trade Center / Tribeca", slug: "world-trade-center-tribeca", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/world-trade-center-tribeca/", centroid_lat: 40.715, centroid_lng: -74.011, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["finance", "creative_office", "professional_services", "lower_manhattan"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/100-church-st/", "/commercial-real-estate/building/NY/new-york/11-park-pl/", "/commercial-real-estate/building/NY/new-york/53-beach-st/", "/commercial-real-estate/building/NY/new-york/200-vesey-st/", "/commercial-real-estate/building/NY/new-york/99-hudson-st/"] },
  { id: "nyc-hudson-yards", name: "Hudson Yards", slug: "hudson-yards", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/hudson-yards/", centroid_lat: 40.754, centroid_lng: -74.0, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["modern_office", "enterprise_environment", "mixed_use", "west_side"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/434-w-33rd-st/", "/commercial-real-estate/building/NY/new-york/5-penn-plaza/", "/commercial-real-estate/building/NY/new-york/368-9th-ave/"] },
  { id: "nyc-penn-district", name: "Penn District", slug: "penn-district", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/penn-district/", centroid_lat: 40.75, centroid_lng: -73.992, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["transit_oriented", "office", "midtown", "west_side"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/14-penn-plaza/", "/commercial-real-estate/building/NY/new-york/5-penn-plaza/", "/commercial-real-estate/building/NY/new-york/112-w-34th-st/", "/commercial-real-estate/building/NY/new-york/225-w-39th-st/"] },
  { id: "nyc-midtown", name: "Midtown", slug: "midtown", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/midtown/", centroid_lat: 40.756, centroid_lng: -73.985, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["office", "professional_services", "transit_oriented", "enterprise_environment"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/1177-avenue-of-the-americas/", "/commercial-real-estate/building/NY/new-york/1450-broadway/", "/commercial-real-estate/building/NY/new-york/1460-broadway/", "/commercial-real-estate/building/NY/new-york/1501-broadway/"] },
  { id: "nyc-midtown-west", name: "Midtown West", slug: "midtown-west", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/midtown-west/", centroid_lat: 40.759, centroid_lng: -73.992, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["office", "media", "hospitality", "west_side"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/1177-avenue-of-the-americas/", "/commercial-real-estate/building/NY/new-york/1450-broadway/", "/commercial-real-estate/building/NY/new-york/1460-broadway/", "/commercial-real-estate/building/NY/new-york/1501-broadway/", "/commercial-real-estate/building/NY/new-york/1740-broadway/"] },
  { id: "nyc-midtown-east", name: "Midtown East", slug: "midtown-east", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/midtown-east/", centroid_lat: 40.754, centroid_lng: -73.973, area_type: "district", approximate_space_types: ["office", "coworking"], profile: ["office", "finance", "professional_services", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/245-park-ave/", "/commercial-real-estate/building/NY/new-york/250-park-ave/", "/commercial-real-estate/building/NY/new-york/405-lexington-ave/", "/commercial-real-estate/building/NY/new-york/450-lexington-ave/", "/commercial-real-estate/building/NY/new-york/575-lexington-ave/"] },
  { id: "nyc-grand-central", name: "Grand Central", slug: "grand-central", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/grand-central/", centroid_lat: 40.752, centroid_lng: -73.977, area_type: "district", approximate_space_types: ["office", "coworking"], profile: ["transit_oriented", "office", "finance", "professional_services"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/230-park-ave/", "/commercial-real-estate/building/NY/new-york/245-park-ave/", "/commercial-real-estate/building/NY/new-york/450-lexington-ave/", "/commercial-real-estate/building/NY/new-york/600-third-ave/", "/commercial-real-estate/building/NY/new-york/100-park-ave/"] },
  { id: "nyc-plaza-district", name: "Plaza District", slug: "plaza-district", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/plaza-district/", centroid_lat: 40.763, centroid_lng: -73.973, area_type: "district", approximate_space_types: ["office", "coworking"], profile: ["prestige_office", "finance", "professional_services", "enterprise_environment"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/590-madison-ave/", "/commercial-real-estate/building/NY/new-york/one-rockefeller-plaza/", "/commercial-real-estate/building/NY/new-york/57-w-57th-st/", "/commercial-real-estate/building/NY/new-york/445-park-ave/", "/commercial-real-estate/building/NY/new-york/1325-avenue-of-the-americas/"] },
  { id: "nyc-times-square-theater", name: "Times Square / Theater District", slug: "times-square-theater-district", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/times-square-theater-district/", centroid_lat: 40.759, centroid_lng: -73.986, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["media", "hospitality", "office", "visitor_facing"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/1501-broadway/", "/commercial-real-estate/building/NY/new-york/1450-broadway/", "/commercial-real-estate/building/NY/new-york/1460-broadway/", "/commercial-real-estate/building/NY/new-york/135-w-41st-st/"] },
  { id: "nyc-flatiron", name: "Flatiron", slug: "flatiron", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/flatiron/", centroid_lat: 40.741, centroid_lng: -73.989, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["creative_office", "tech", "professional_services", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/287-park-ave-s/", "/commercial-real-estate/building/NY/new-york/41-madison-ave/", "/commercial-real-estate/building/NY/new-york/18-w-18th-st/", "/commercial-real-estate/building/NY/new-york/30-w-21st-st/", "/commercial-real-estate/building/NY/new-york/38-w-21st-st/"] },
  { id: "nyc-nomad", name: "NoMad", slug: "nomad", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/nomad/", centroid_lat: 40.745, centroid_lng: -73.988, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["office", "hospitality", "creative_office", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/1250-broadway/", "/commercial-real-estate/building/NY/new-york/135-madison-ave/", "/commercial-real-estate/building/NY/new-york/136-madison-ave/", "/commercial-real-estate/building/NY/new-york/27-e-28th-st/", "/commercial-real-estate/building/NY/new-york/401-park-ave-s/"] },
  { id: "nyc-chelsea", name: "Chelsea", slug: "chelsea", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/chelsea/", centroid_lat: 40.746, centroid_lng: -74.0, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["creative_office", "gallery", "tech", "mixed_use"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/125-w-25th-st/", "/commercial-real-estate/building/NY/new-york/275-seventh-avenue/", "/commercial-real-estate/building/NY/new-york/368-9th-ave/", "/commercial-real-estate/building/NY/new-york/413-w-14th-st/"] },
  { id: "nyc-soho", name: "SoHo", slug: "soho", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/soho/", centroid_lat: 40.724, centroid_lng: -74.0, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["creative_office", "showroom", "retail", "boutique_office"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/101-avenue-of-the-americas/", "/commercial-real-estate/building/NY/new-york/148-lafayette-st/", "/commercial-real-estate/building/NY/new-york/379-w-broadway/", "/commercial-real-estate/building/NY/new-york/408-broadway/", "/commercial-real-estate/building/NY/new-york/524-broadway/"] },
  { id: "nyc-union-square", name: "Union Square", slug: "union-square", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/union-square/", centroid_lat: 40.735, centroid_lng: -73.991, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["transit_oriented", "creative_office", "education", "retail"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/33-irving-pl/", "/commercial-real-estate/building/NY/new-york/411-lafayette-st/", "/commercial-real-estate/building/NY/new-york/154-w-14th-st/", "/commercial-real-estate/building/NY/new-york/71-5th-ave/", "/commercial-real-estate/building/NY/new-york/149-5th-ave/"] },
  { id: "nyc-downtown-brooklyn", name: "Downtown Brooklyn", slug: "downtown-brooklyn", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/downtown-brooklyn/", centroid_lat: 40.692, centroid_lng: -73.986, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["brooklyn_office", "transit_oriented", "education", "civic"], representative_building_paths: ["/commercial-real-estate/building/NY/brooklyn/195-montague-st/", "/commercial-real-estate/building/NY/brooklyn/77-sands-st/", "/commercial-real-estate/building/NY/new-york/41-flatbush-ave/"] },
  { id: "nyc-dumbo", name: "DUMBO", slug: "dumbo", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/dumbo/", centroid_lat: 40.704, centroid_lng: -73.989, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["waterfront", "creative_office", "brooklyn_office", "adaptive"], representative_building_paths: ["/commercial-real-estate/building/NY/brooklyn/175-pearl-street/", "/commercial-real-estate/building/NY/brooklyn/77-sands-st/"] },
  { id: "nyc-williamsburg", name: "Williamsburg", slug: "williamsburg", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/williamsburg/", centroid_lat: 40.711, centroid_lng: -73.957, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["creative_office", "hospitality", "retail", "brooklyn"], representative_building_paths: ["/commercial-real-estate/building/NY/brooklyn/134-n-4th-st/", "/commercial-real-estate/building/NY/new-york/109-south-5th-street/"] },
  { id: "nyc-brooklyn-navy-yard", name: "Brooklyn Navy Yard", slug: "brooklyn-navy-yard", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/brooklyn-navy-yard/", centroid_lat: 40.699, centroid_lng: -73.971, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "creative_production", "innovation", "manufacturing"], representative_building_paths: ["/commercial-real-estate/building/NY/brooklyn/1-dock-72-way/"] },
  { id: "nyc-long-island-city", name: "Long Island City", slug: "long-island-city", city: "Long Island City", state_abbr: "NY", path: "/commercial-real-estate/NY/long-island-city/long-island-city/", centroid_lat: 40.744, centroid_lng: -73.948, area_type: "district", approximate_space_types: ["office", "industrial", "flex"], profile: ["office", "industrial_flex", "studio", "queens"], representative_building_paths: ["/commercial-real-estate/building/NY/long-island-city/the-falchi-building-31-00-47th-avenue/"] },
  { id: "nyc-jersey-city", name: "Jersey City", slug: "jersey-city", city: "Jersey City", state_abbr: "NJ", path: "/commercial-real-estate/NJ/jersey-city/jersey-city/", centroid_lat: 40.717, centroid_lng: -74.036, area_type: "downtown_core", approximate_space_types: ["office", "coworking", "retail"], profile: ["waterfront_office", "finance", "regional_alternative", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NJ/jersey-city/101-hudson-st/", "/commercial-real-estate/building/NJ/jersey-city/2500-plaza-five/"] },
  { id: "nyc-hoboken", name: "Hoboken", slug: "hoboken", city: "Hoboken", state_abbr: "NJ", path: "/commercial-real-estate/NJ/hoboken/hoboken/", centroid_lat: 40.744, centroid_lng: -74.032, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["waterfront_office", "local_services", "regional_alternative", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NJ/hoboken/221-river-st/"] },
];

const nycMetroPhase2DistrictDefinitions = [
  { id: "nyc-meatpacking", name: "Meatpacking District", slug: "meatpacking-district", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/meatpacking-district/", centroid_lat: 40.741, centroid_lng: -74.006, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["creative_office", "fashion", "hospitality", "west_side"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/413-w-14th-st/"] },
  { id: "nyc-greenwich-village", name: "Greenwich Village", slug: "greenwich-village", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/greenwich-village/", centroid_lat: 40.733, centroid_lng: -74.001, area_type: "district", approximate_space_types: ["office", "coworking", "retail"], profile: ["creative_office", "education", "local_services", "boutique_office"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/609-greenwich-st/", "/commercial-real-estate/building/NY/new-york/154-w-14th-st/", "/commercial-real-estate/building/NY/new-york/33-irving-pl/"] },
  { id: "nyc-lower-east-side", name: "Lower East Side", slug: "lower-east-side", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/lower-east-side/", centroid_lat: 40.716, centroid_lng: -73.989, area_type: "district", approximate_space_types: ["office", "retail", "coworking"], profile: ["creative_office", "hospitality", "retail", "local_services"], representative_building_paths: [] },
  { id: "nyc-harlem-125th", name: "Harlem / 125th Street", slug: "harlem-125th-street", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/harlem-125th-street/", centroid_lat: 40.807, centroid_lng: -73.945, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["uptown_office", "retail", "transit_oriented", "local_services"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/8-w-126th-st/"] },
  { id: "nyc-ues-medical", name: "Upper East Side Medical Corridor", slug: "upper-east-side-medical-corridor", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/upper-east-side-medical-corridor/", centroid_lat: 40.764, centroid_lng: -73.957, area_type: "district", approximate_space_types: ["medical", "office", "retail"], profile: ["medical", "healthcare", "institutional", "client_facing"], representative_building_paths: ["/commercial-real-estate/building/NY/new-york/750-lexington-ave/"] },
  { id: "nyc-industry-city-sunset-park", name: "Industry City / Sunset Park", slug: "industry-city-sunset-park", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/industry-city-sunset-park/", centroid_lat: 40.655, centroid_lng: -74.007, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["industrial_flex", "creative_production", "warehouse", "brooklyn"], representative_building_paths: [] },
  { id: "nyc-red-hook", name: "Red Hook", slug: "red-hook", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/red-hook/", centroid_lat: 40.677, centroid_lng: -74.01, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "retail"], profile: ["waterfront_industrial", "warehouse", "creative_production", "brooklyn"], representative_building_paths: [] },
  { id: "nyc-gowanus", name: "Gowanus", slug: "gowanus", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/gowanus/", centroid_lat: 40.678, centroid_lng: -73.991, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["adaptive_industrial", "creative_production", "office_flex", "brooklyn"], representative_building_paths: [] },
  { id: "nyc-bushwick", name: "Bushwick", slug: "bushwick", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/bushwick/", centroid_lat: 40.695, centroid_lng: -73.917, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["creative_office", "production", "retail", "brooklyn"], representative_building_paths: [] },
  { id: "nyc-greenpoint", name: "Greenpoint", slug: "greenpoint", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/greenpoint/", centroid_lat: 40.73, centroid_lng: -73.954, area_type: "district", approximate_space_types: ["office", "industrial", "retail"], profile: ["waterfront", "creative_office", "industrial_flex", "brooklyn"], representative_building_paths: [] },
  { id: "nyc-crown-heights-healthcare", name: "Crown Heights / Brooklyn Healthcare Corridor", slug: "crown-heights-brooklyn-healthcare-corridor", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/crown-heights-brooklyn-healthcare-corridor/", centroid_lat: 40.668, centroid_lng: -73.944, area_type: "district", approximate_space_types: ["medical", "office", "retail"], profile: ["healthcare", "medical", "local_services", "brooklyn"], representative_building_paths: [] },
  { id: "nyc-astoria", name: "Astoria", slug: "astoria", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/astoria/", centroid_lat: 40.764, centroid_lng: -73.923, area_type: "district", approximate_space_types: ["office", "retail", "industrial"], profile: ["queens", "local_services", "creative_office", "studio"], representative_building_paths: [] },
  { id: "nyc-flushing", name: "Flushing", slug: "flushing", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/flushing/", centroid_lat: 40.759, centroid_lng: -73.83, area_type: "district", approximate_space_types: ["office", "retail", "medical"], profile: ["queens", "medical", "retail", "regional_services"], representative_building_paths: [] },
  { id: "nyc-jamaica", name: "Jamaica", slug: "jamaica", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/jamaica/", centroid_lat: 40.702, centroid_lng: -73.798, area_type: "district", approximate_space_types: ["office", "retail", "industrial"], profile: ["queens", "transit_oriented", "airport_access", "local_services"], representative_building_paths: [] },
  { id: "nyc-jfk-airport-area", name: "JFK Airport Area", slug: "jfk-airport-area", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/jfk-airport-area/", centroid_lat: 40.646, centroid_lng: -73.779, area_type: "industrial_area", approximate_space_types: ["industrial", "flex", "office"], profile: ["airport_access", "logistics", "warehouse", "queens"], representative_building_paths: [] },
  { id: "nyc-maspeth-middle-village-industrial", name: "Maspeth / Middle Village Industrial", slug: "maspeth-middle-village-industrial", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/maspeth-middle-village-industrial/", centroid_lat: 40.723, centroid_lng: -73.902, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "warehouse", "truck_access", "queens"], representative_building_paths: [] },
  { id: "nyc-ridgewood-industrial", name: "Ridgewood Industrial", slug: "ridgewood-industrial", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/ridgewood-industrial/", centroid_lat: 40.704, centroid_lng: -73.901, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["industrial_flex", "production", "queens", "brooklyn_edge"], representative_building_paths: [] },
  { id: "nyc-port-morris-mott-haven", name: "Port Morris / Mott Haven", slug: "port-morris-mott-haven", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/port-morris-mott-haven/", centroid_lat: 40.808, centroid_lng: -73.93, area_type: "industrial_area", approximate_space_types: ["industrial", "office", "retail"], profile: ["bronx", "industrial_transition", "creative_production", "waterfront"], representative_building_paths: [] },
  { id: "nyc-hunts-point", name: "Hunts Point", slug: "hunts-point", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/hunts-point/", centroid_lat: 40.811, centroid_lng: -73.884, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["food_distribution", "logistics", "warehouse", "bronx"], representative_building_paths: [] },
  { id: "nyc-bronx-terminal-south-bronx", name: "Bronx Terminal / South Bronx", slug: "bronx-terminal-south-bronx", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/bronx-terminal-south-bronx/", centroid_lat: 40.823, centroid_lng: -73.93, area_type: "district", approximate_space_types: ["office", "retail", "industrial"], profile: ["bronx", "transit_oriented", "retail_support", "local_services"], representative_building_paths: [] },
  { id: "nyc-staten-island-industrial", name: "Staten Island Industrial", slug: "staten-island-industrial", city: "New York", state_abbr: "NY", path: "/commercial-real-estate/NY/new-york/staten-island-industrial/", centroid_lat: 40.613, centroid_lng: -74.177, area_type: "industrial_area", approximate_space_types: ["industrial", "flex"], profile: ["logistics", "warehouse", "port_access", "outer_borough"], representative_building_paths: [] },
  { id: "nyc-white-plains", name: "White Plains", slug: "white-plains", city: "White Plains", state_abbr: "NY", path: "/commercial-real-estate/NY/white-plains/white-plains/", centroid_lat: 41.034, centroid_lng: -73.762, area_type: "downtown_core", approximate_space_types: ["office", "medical", "retail"], profile: ["regional_office", "suburban_downtown", "medical", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NY/white-plains/50-main-st/"] },
  { id: "nyc-stamford", name: "Stamford", slug: "stamford", city: "Stamford", state_abbr: "CT", path: "/commercial-real-estate/CT/stamford/stamford/", centroid_lat: 41.053, centroid_lng: -73.538, area_type: "downtown_core", approximate_space_types: ["office", "retail"], profile: ["regional_office", "finance", "transit_oriented", "connecticut_edge"], representative_building_paths: ["/commercial-real-estate/building/CT/stamford/1266-e-main-st/", "/commercial-real-estate/building/CT/stamford/263-tresser-blvd/"] },
  { id: "nyc-greenwich-ct", name: "Greenwich", slug: "greenwich", city: "Greenwich", state_abbr: "CT", path: "/commercial-real-estate/CT/greenwich/greenwich/", centroid_lat: 41.026, centroid_lng: -73.628, area_type: "district", approximate_space_types: ["office", "retail"], profile: ["client_facing", "finance", "regional_office", "connecticut_edge"], representative_building_paths: ["/commercial-real-estate/building/CT/greenwich/500-w-putnam-ave/"] },
  { id: "nyc-new-rochelle", name: "New Rochelle", slug: "new-rochelle", city: "New Rochelle", state_abbr: "NY", path: "/commercial-real-estate/NY/new-rochelle/new-rochelle/", centroid_lat: 40.912, centroid_lng: -73.783, area_type: "district", approximate_space_types: ["office", "medical", "retail"], profile: ["regional_office", "suburban_downtown", "local_services", "transit_oriented"], representative_building_paths: ["/commercial-real-estate/building/NY/new-rochelle/173-huguenot-st/"] },
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

function chicagoMetroDistrictPageFor(district) {
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
    geometry_quality: "chicago_metro_v1_commercial_graph",
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
    public_chicago_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function dcMetroDistrictPageFor(district) {
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
    geometry_quality: "dc_metro_v1_commercial_graph",
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
    public_dc_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function bostonMetroDistrictPageFor(district) {
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
    geometry_quality: "boston_metro_v1_commercial_graph",
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
    public_boston_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function atlantaMetroDistrictPageFor(district) {
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
    geometry_quality: "atlanta_metro_v1_commercial_graph",
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
    public_atlanta_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function southFloridaDistrictPageFor(district) {
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
    geometry_quality: "south_florida_v1_commercial_graph",
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
    public_south_florida_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function philadelphiaMetroDistrictPageFor(district) {
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
    geometry_quality: "philadelphia_metro_v1_commercial_graph",
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
    public_philadelphia_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function newJerseyMetroDistrictPageFor(district) {
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
    geometry_quality: "new_jersey_metro_v1_commercial_graph",
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
    public_new_jersey_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function austinMetroDistrictPageFor(district) {
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
    geometry_quality: "austin_metro_v1_commercial_graph",
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
    public_austin_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function houstonMetroDistrictPageFor(district) {
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
    geometry_quality: "houston_metro_v1_commercial_graph",
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
    public_houston_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function nashvilleMetroDistrictPageFor(district) {
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
    geometry_quality: "nashville_metro_v1_commercial_graph",
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
    public_nashville_metro_v1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function nycMetroPhase1DistrictPageFor(district) {
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
    geometry_quality: "nyc_metro_phase_1_commercial_graph",
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
    public_nyc_rollout: true,
    public_nyc_metro_phase_1: true,
    city_nav_priority: district.area_type === "downtown_core" ? 1 : 2,
  };
}

function nycMetroPhase2DistrictPageFor(district) {
  return {
    ...nycMetroPhase1DistrictPageFor(district),
    geometry_quality: "nyc_metro_phase_2_commercial_graph",
    public_nyc_metro_phase_1: false,
    public_nyc_metro_phase_2: true,
  };
}

function sfEditorialDistrictPageFor(district) {
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
    geometry_quality: "sf_editorial_district_map_v1",
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
    source_types: ["editorial_district_map_v1", "commercial_location_model"],
    suppress_nearby_neighborhoods: false,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_sf_editorial_district_map_v1: true,
    city_nav_priority: 4,
  };
}

function sfPublicDecisionPageFor(surface) {
  return {
    name: surface.name,
    slug: surface.slug,
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    canonical_neighborhood_path: surface.path,
    centroid_lat: "",
    centroid_lng: "",
    radius: "",
    geometry_quality: "sf_certified_decision_geography_v1",
    approximate_building_count: 0,
    approximate_space_types: surface.spaceTypes,
    approximate_semantic_signals: [],
    representative_buildings: [],
    commercial_area_id: surface.id,
    commercial_area_type: surface.areaType.replace(/\s+/g, "_"),
    commercial_area_type_label: surface.areaType,
    commercial_profile: surface.spaceTypes,
    source_confidence: "reviewed",
    source_types: ["certified_location_intelligence", "sf_public_decision_surfaces_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_sf_decision_surface_v1: true,
    city_nav_priority: surface.parent ? 2 : 3,
    meta_description: surface.lead,
    public_decision_surface: surface,
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
    .map((relationship) => {
      const canonicalBuilding = buildingByPath.get(relationship.building_path) || {};
      return normalizeRepresentativeBuilding({
        address: relationship.address,
        display_name: relationship.address || relationship.building_name,
        name: relationship.building_name,
        building_path: relationship.building_path,
        state_abbr: canonicalBuilding.state_abbr,
        city_slug: canonicalBuilding.city_slug,
        building_slug: canonicalBuilding.building_slug,
        semantic_source_building_id: canonicalBuilding.semantic_source_building_id,
        type: typeLabel(relationship.inferred_space_type_mix?.[0]?.space_type || "commercial"),
        size_label: "",
        primary_area_id: relationship.primary_area_id,
        relationship_confidence: relationship.confidence,
      });
    });
}

const representativeBuildingLimitByAreaId = {
  "sac-downtown-sacramento": 15,
  "sac-natomas": 15,
  "sac-rancho-cordova-commercial-core": 15,
  "sac-elk-grove-commercial-core": 15,
  "sac-rocklin-commercial-core": 15,
  "sb-north-san-jose": 15,
  "sb-santana-row-valley-fair": 12,
  "sb-san-jose-airport-golden-triangle": 12,
  "sb-moffett-park": 15,
  "sb-downtown-sunnyvale": 12,
  "sb-peery-park": 12,
  "sb-north-bayshore": 15,
  "sb-stanford-research-park": 15,
  "sb-cupertino-commercial-core": 12,
  "sb-menlo-park-commercial-core": 12,
  "sb-sand-hill-stanford-adjacent": 10,
  "sb-downtown-redwood-city": 15,
  "sb-downtown-san-mateo": 15,
  "i880-hayward-industrial": 12,
  "i880-union-city-industrial": 12,
  "i880-fremont-pacific-commons": 12,
  "i880-fremont-auto-mall-parkway": 12,
  "sb-warm-springs": 15,
  "sb-ardenwood": 15,
  "eb-downtown-berkeley": 15,
  "eb-emeryville-commercial-core": 15,
  "eb-west-berkeley": 15,
  "eb-alameda-waterfront-harbor-bay": 8,
  "eb-san-leandro-industrial": 12,
  "eb-richmond-industrial": 12,
  "eb-point-richmond-marina-bay": 8,
  "oak-hegenberger-corridor": 12,
  "oak-coliseum-industrial": 12,
  "oak-west-oakland": 12,
  "nb-downtown-mill-valley": 8,
  "nb-strawberry-mill-valley": 8,
  "nb-tam-junction": 8,
  "nb-kerner-east-san-rafael": 6,
  "nb-downtown-novato": 6,
  "nb-hamilton-landing-ignacio": 6,
  "nb-hamilton-landing": 6,
  "nb-ignacio": 6,
  "nb-bel-marin-keys": 6,
  "nb-larkspur-landing": 6,
  "nb-downtown-larkspur": 6,
  "nb-corte-madera-town-center": 6,
  "nb-downtown-sausalito": 6,
  "nb-sausalito-marinship-waterfront": 6,
  "nb-santa-rosa-airport-business-center": 6,
  "nb-santa-rosa-northpoint-corporate-center": 6,
  "nb-montgomery-village-east-santa-rosa": 6,
  "nb-downtown-petaluma": 6,
  "nb-petaluma-marina-lakeville": 6,
  "nb-north-mcdowell-petaluma": 6,
  "nb-south-petaluma-industrial": 6,
  "nb-rohnert-park-commercial-core": 6,
  "nb-rohnert-park-redwood-drive-industrial": 6,
  "nb-downtown-windsor": 6,
  "nb-shiloh-airport-boulevard": 6,
  "nb-downtown-healdsburg": 6,
  "nb-healdsburg-industrial-grove-street": 6,
  "nb-downtown-sonoma": 6,
  "nb-sonoma-valley-commercial-core": 6,
  "nb-downtown-napa": 8,
  "nb-soscol-gateway-south-napa": 8,
  "nb-napa-airport-industrial": 8,
  "nb-napa-valley-commons": 8,
  "nb-trancas-north-napa": 8,
  "nb-american-canyon-industrial": 8,
  "nb-green-island-road-napa-junction": 8,
  "nb-broadway-highway-29-commercial-corridor": 8,
  "nb-yountville-commercial-core": 6,
  "nb-downtown-st-helena": 6,
  "nb-st-helena-wine-country-commercial-core": 6,
  "nb-downtown-calistoga": 6,
  "nb-calistoga-commercial-core": 6,
};

function representativeBuildingsFromPaths(paths = [], areaId = "") {
  const limit = representativeBuildingLimitByAreaId[areaId] || 6;

  return paths
    .map((buildingPath) => buildingByPath.get(buildingPath))
    .filter(Boolean)
    .slice(0, limit)
    .map((building) =>
      normalizeRepresentativeBuilding({
        address: building.address,
        display_name: building.address || building.display_name || building.name,
        name: building.name,
        building_path: building.building_path,
        state_abbr: building.state_abbr,
        city_slug: building.city_slug,
        building_slug: building.building_slug,
        semantic_source_building_id: building.semantic_source_building_id,
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
const chicagoMetroPages = chicagoMetroDistrictDefinitions.map(chicagoMetroDistrictPageFor);
const dcMetroPages = dcMetroDistrictDefinitions.map(dcMetroDistrictPageFor);
const bostonMetroPages = bostonMetroDistrictDefinitions.map(bostonMetroDistrictPageFor);
const atlantaMetroPages = atlantaMetroDistrictDefinitions.map(atlantaMetroDistrictPageFor);
const southFloridaPages = southFloridaDistrictDefinitions.map(southFloridaDistrictPageFor);
const philadelphiaMetroPages = philadelphiaMetroDistrictDefinitions.map(philadelphiaMetroDistrictPageFor);
const newJerseyMetroPages = newJerseyMetroDistrictDefinitions.map(newJerseyMetroDistrictPageFor);
const austinMetroPages = austinMetroDistrictDefinitions.map(austinMetroDistrictPageFor);
const houstonMetroPages = houstonMetroDistrictDefinitions.map(houstonMetroDistrictPageFor);
const nashvilleMetroPages = nashvilleMetroDistrictDefinitions.map(nashvilleMetroDistrictPageFor);
const nycMetroPhase1Pages = nycMetroPhase1DistrictDefinitions.map(nycMetroPhase1DistrictPageFor);
const nycMetroPhase2Pages = nycMetroPhase2DistrictDefinitions.map(nycMetroPhase2DistrictPageFor);
const sfEditorialDistrictPages = sfEditorialDistrictDefinitions.map(sfEditorialDistrictPageFor);
const sfPublicDecisionPages = sfPublicDecisionSurfaces.surfaces.map(sfPublicDecisionPageFor);

const searchLedFoundationPages = [
  {
    name: "Antioch East 18th Industrial",
    slug: "antioch-east-18th-industrial",
    city: "Antioch",
    state_abbr: "CA",
    city_slug: "antioch",
    canonical_neighborhood_path: "/commercial-real-estate/CA/antioch/antioch-east-18th-industrial/",
    centroid_lat: "",
    centroid_lng: "",
    radius: "",
    geometry_quality: "search_led_foundation_v1",
    approximate_building_count: 0,
    approximate_space_types: ["industrial", "flex"],
    approximate_semantic_signals: ["Local Service Industrial", "Warehouse and Storage", "Contractor Operations", "Office / Warehouse"],
    representative_buildings: [],
    commercial_area_id: "antioch-east-18th-industrial",
    commercial_area_type: "industrial_area",
    commercial_area_type_label: "industrial area",
    commercial_profile: ["industrial", "warehouse", "contractor_service", "flex"],
    source_confidence: "medium",
    source_types: ["commercial_market_evidence", "commercial_location_knowledge_graph"],
    meta_description: "Understand when Antioch East 18th Industrial may fit local warehouse, contractor, service-industrial, storage, dispatch, or office/warehouse needs—and what to validate at a specific property.",
    foundation_without_buildings: true,
    public_market_evidence_record_ids: ["antioch-east-18th-industrial-foundation"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_search_led_foundation_v1: true,
    city_nav_priority: 2,
  },
  {
    name: "Indianapolis Airport Logistics",
    slug: "indianapolis-airport-logistics",
    city: "Indianapolis",
    state_abbr: "IN",
    city_slug: "indianapolis",
    canonical_neighborhood_path: "/commercial-real-estate/IN/indianapolis/indianapolis-airport-logistics/",
    centroid_lat: 39.72,
    centroid_lng: -86.28,
    radius: "",
    geometry_quality: "search_led_foundation_v1",
    approximate_building_count: 3,
    approximate_space_types: ["industrial", "warehouse", "flex"],
    approximate_semantic_signals: ["Warehouse", "Distribution", "Airport Logistics", "Service Industrial"],
    representative_buildings: representativeBuildingsFromPaths([
      "/commercial-real-estate/building/IN/indianapolis/558-airtech-parkway/",
      "/commercial-real-estate/building/IN/indianapolis/4557-w-bradbury-ave/",
      "/commercial-real-estate/building/IN/indianapolis/7601-winton-dr/",
    ], "in-indianapolis-airport-logistics"),
    commercial_area_id: "in-indianapolis-airport-logistics",
    commercial_area_type: "industrial_area",
    commercial_area_type_label: "industrial area",
    commercial_profile: ["warehouse", "distribution", "airport_logistics", "service_industrial"],
    source_confidence: "medium",
    source_types: ["rofo_building_corpus", "commercial_market_evidence", "editorial_graph_v1"],
    suppress_nearby_neighborhoods: true,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    public_search_led_foundation_v1: true,
    city_nav_priority: 2,
  },
];

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

for (const page of searchLedFoundationPages) {
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

for (const page of chicagoMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of dcMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of bostonMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of atlantaMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of southFloridaPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of philadelphiaMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of newJerseyMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of austinMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of houstonMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of nashvilleMetroPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of nycMetroPhase1Pages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of nycMetroPhase2Pages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of sfEditorialDistrictPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

for (const page of sfPublicDecisionPages) {
  const existingPage = allPagesByPath.get(page.canonical_neighborhood_path);
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...existingPage,
    ...page,
    commercial_area_id: existingPage?.commercial_area_id || page.commercial_area_id,
    commercial_area_type: existingPage?.commercial_area_type || page.commercial_area_type,
    commercial_area_type_label: existingPage?.commercial_area_type_label || page.commercial_area_type_label,
    representative_buildings: existingPage?.representative_buildings?.length
      ? existingPage.representative_buildings
      : page.representative_buildings,
    approximate_building_count: existingPage?.approximate_building_count || page.approximate_building_count,
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
  page.commercial_market_evidence = commercialMarketEvidenceByDistrict.get(page.slug) || null;
  if (page.commercial_market_evidence && page.public_market_evidence_record_ids?.length) {
    const publicRecordIds = new Set(page.public_market_evidence_record_ids);
    page.commercial_market_evidence = {
      ...page.commercial_market_evidence,
      records: page.commercial_market_evidence.records.filter((record) => publicRecordIds.has(record.id)),
    };
  }
  const canonicalBuildingIntelligence =
    commercialBuildingIntelligence.byDistrictPath[page.canonical_neighborhood_path] || [];
  if (canonicalBuildingIntelligence.length) {
    const canonicalRepresentativeBuildings = canonicalBuildingIntelligence
      .map((item) => buildingByPath.get(item.building_path))
      .filter(Boolean);

    page.commercial_building_intelligence = canonicalBuildingIntelligence;
    page.commercial_building_relationships = canonicalBuildingIntelligence.map((item) => ({
      building_path: item.building_path,
      editorial_role: item.editorial.editorialRole,
      representative_themes: item.editorial.representativeThemes,
      comparison_buildings: item.relationships.comparisonBuildings,
      nearby_buildings: item.relationships.nearbyBuildings,
      related_districts: item.relationships.relatedDistricts,
    }));

    if (canonicalRepresentativeBuildings.length) {
      page.representative_buildings = canonicalRepresentativeBuildings;
      page.approximate_building_count = canonicalRepresentativeBuildings.length;
    }
  }
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
  page.district_identity = page.public_decision_surface
    ? {
        eyebrow: page.public_decision_surface.areaType === "retail corridor" ? "Retail Location Guide" : "Location Guide",
        title: page.public_decision_surface.name,
        lead: page.public_decision_surface.lead,
        guide_label: page.public_decision_surface.classification,
      }
    : districtIdentityFor(page);
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
