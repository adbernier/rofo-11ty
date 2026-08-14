module.exports = {
  experimentId: "tempe-industrial-decision-surface",
  eyebrow: "Tempe industrial location guide",
  title: "Is Tempe the right Phoenix-area industrial location?",
  introduction:
    "Start with how the operation needs to work. Tempe can suit businesses that need practical industrial or flex space with I-10 and central/east Valley access, while airport-oriented logistics or more specialized industrial requirements may point elsewhere.",
  entries: [
    {
      id: "tempe-i-10-industrial",
      label: "Central access + practical operations",
      name: "Tempe I-10 Industrial",
      path: "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/",
      summary:
        "A starting point for service-industrial, office/warehouse, and smaller or mid-format operating requirements where Tempe geography and I-10 access matter. Loading, circulation, yard, and permitted use still depend on the property.",
    },
    {
      id: "phoenix-airport-sky-harbor-area",
      label: "Airport access + regional reach",
      name: "Phoenix Airport / Sky Harbor Area",
      path: "/commercial-real-estate/AZ/phoenix/phoenix-airport-sky-harbor-area/",
      summary:
        "Compare this area when airport proximity, logistics support, and broader regional access matter more than a Tempe-centered customer or employee geography.",
    },
    {
      id: "mesa-gateway-east-mesa",
      label: "Specialized East Valley operations",
      name: "Mesa Gateway / East Mesa",
      path: "/commercial-real-estate/AZ/mesa/mesa-gateway-east-mesa/",
      summary:
        "Compare Mesa Gateway when aerospace, advanced manufacturing, industrial/flex, logistics, or a more specialized East Valley operating environment leads the requirement.",
    },
  ],
  representativeEnvironment: {
    label: "Representative environment",
    name: "6840 S Harl Ave",
    path: "/commercial-real-estate/building/AZ/tempe/6840-s-harl-ave/",
    summary:
      "One concrete Tempe I-10 office/warehouse reference—not evidence of current availability or a verified match for loading, power, yard, or permitted-use needs.",
  },
  validation: [
    "Loading configuration, truck access, circulation, and parking",
    "Power, yard or outdoor storage, and permitted use",
    "Office-to-warehouse ratio and the building format the operation requires",
    "Whether customer and employee geography favors Tempe or another Valley location",
  ],
  recommendation: {
    prompt: "Not sure whether Tempe or another Phoenix-area industrial location fits your operation?",
    label: "Get My Recommendation",
    path: "/find-locations/?city=Tempe&state=AZ&spaceType=Industrial%20%2F%20Warehouse&source=tempe_industrial_decision_surface",
  },
};
