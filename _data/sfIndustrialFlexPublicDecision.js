const basePath = "/commercial-real-estate/CA/san-francisco/";

const districts = [
  {
    id: "bayview-industrial",
    name: "Bayview Industrial",
    path: `${basePath}bayview-industrial/`,
    industrialNeed: "Warehouse, distribution, food, contractor, fleet, and city-serving operations",
    flexNeed: "Operational flex combining office, storage, dispatch, production, or service functions",
    industrialSummary: "San Francisco's broadest operational industrial geography, with the strongest local context for city-serving warehouse, distribution, food, contractor, fleet, and service-industrial requirements.",
    flexSummary: "The most operational flex choice when the office component supports storage, dispatch, production, service vehicles, or city-serving logistics rather than leading the requirement.",
  },
  {
    id: "central-waterfront",
    name: "Central Waterfront",
    path: `${basePath}central-waterfront/`,
    industrialNeed: "Urban production, fabrication, maker, prototyping, and practical flex",
    flexNeed: "Production/flex, prototyping, product development, and office-production hybrids",
    industrialSummary: "A protected urban PDR environment for production, fabrication, maker, service-industrial, prototyping, and practical flex users that need operational space without Bayview's logistics emphasis.",
    flexSummary: "A production-led flex environment for businesses that combine product development, fabrication, assembly, prototyping, service, and office functions.",
  },
  {
    id: "dogpatch",
    name: "Dogpatch",
    path: `${basePath}dogpatch/`,
    industrialNeed: "Adaptive creative, R&D-support, and office-production environments",
    flexNeed: "Adaptive creative flex, office/R&D, and Mission Bay-adjacent product teams",
    industrialSummary: "A more mixed-use and adaptive northern alternative, better suited to creative production, R&D support, and office-heavy industrial reuse than warehouse or fleet operations.",
    flexSummary: "The stronger choice when adaptive character, neighborhood context, Mission Bay adjacency, and office/R&D use matter more than a protected operational PDR setting.",
  },
  {
    id: "showplace-square",
    name: "Showplace Square / Design District",
    path: "",
    industrialNeed: "Showroom, design trade, and customer-facing PDR",
    flexNeed: "Showroom/design-oriented flex with customer and trade-partner visits",
    industrialSummary: "The primary decision identity for San Francisco's overlapping showroom and design-trade geography, where customer-facing PDR matters more than warehouse logistics or fabrication depth.",
    flexSummary: "A showroom-led flex environment for design, trade, display, creative-office, and customer-facing operating models.",
  },
  {
    id: "northeast-mission",
    name: "Northeast Mission production context",
    path: `${basePath}mission-district/`,
    industrialNeed: "Smaller urban production, repair, food, and service uses",
    flexNeed: "Smaller maker, service, and office-production formats",
    industrialSummary: "A bounded PDR and production edge around the northeast Mission—not a claim that the entire Mission District is industrial—with smaller maker, repair, food, and service-commercial patterns.",
    flexSummary: "A selective smaller-format context where neighborhood identity and production or service use overlap, subject to mixed-use and residential adjacency.",
  },
  {
    id: "soma",
    name: "SoMa",
    path: `${basePath}soma/`,
    industrialNeed: "Office-heavy adaptive production and commercial reuse",
    flexNeed: "Office-heavy adaptive flex and creative-commercial workspace",
    industrialSummary: "A selective office-heavy adaptive alternative; it should not be mistaken for San Francisco's primary warehouse, loading, or service-industrial geography.",
    flexSummary: "Useful when creative office and adaptive building character lead the requirement, with production, showroom, or storage functions remaining secondary and building-specific.",
  },
];

module.exports = {
  industrial: {
    eyebrow: "San Francisco industrial decision guide",
    title: "Choose the geography around the operation",
    introduction: "Industrial space in San Francisco is not one market. Start with what the business must do—receive goods, dispatch vehicles, fabricate products, host customers, or combine office and production—then compare only the districts that can plausibly support that operating model.",
    entries: districts.map((district) => ({ label: district.industrialNeed, ...district, summary: district.industrialSummary })),
    validation: ["Loading configuration and truck circulation", "Clear height, power, ventilation, and building systems where relevant", "Permitted use and any specialized operating approvals", "Parking, service vehicles, yards, and outdoor storage", "Environmental history, shoreline or flood exposure, and neighboring uses", "Suite condition and current availability through a live market investigation"],
  },
  flex: {
    eyebrow: "San Francisco flex decision guide",
    title: "Decide what must flex—and what must operate",
    introduction: "Flex can mean an office with some storage, a production space with administrative functions, a showroom, or a practical service facility. San Francisco's flex geographies are materially different, so the office-to-operational balance should drive the location decision.",
    entries: districts.filter((district) => district.id !== "northeast-mission").map((district) => ({ label: district.flexNeed, ...district, summary: district.flexSummary })),
    validation: ["Office-to-operational area ratio", "Loading, receiving, circulation, and customer access", "Power, ventilation, clear height, and specialized infrastructure", "Permitted production, R&D, showroom, storage, or service use", "Parking and employee commute requirements", "Buildout scope, suite condition, and current availability"],
  },
};
