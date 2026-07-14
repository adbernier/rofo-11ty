const handbookBase = "/commercial-real-estate/lease-guide/";

function topic(slug, data) {
  return {
    slug,
    url: `${handbookBase}${slug}/`,
    ...data,
  };
}

const categories = [
  {
    id: "commercial-leasing",
    label: "Commercial Leasing",
    description: "Understand the basic process before comparing spaces or signing a lease.",
  },
  {
    id: "location-strategy",
    label: "Location Strategy",
    description: "Choose the right geography before spending time on individual buildings.",
  },
  {
    id: "space-types",
    label: "Space Types",
    description: "Match the space to how the business actually operates.",
  },
  {
    id: "costs-budgeting",
    label: "Costs & Budgeting",
    description: "Compare total occupancy cost, not just the advertised rent.",
  },
  {
    id: "lease-types",
    label: "Lease Types",
    description: "Know what is included, what is passed through, and where costs can change.",
  },
  {
    id: "negotiation",
    label: "Negotiation",
    description: "Understand the business terms before the lease document arrives.",
  },
  {
    id: "touring-comparing",
    label: "Touring & Comparing Space",
    description: "Use tours to test fit, not just collect options.",
  },
  {
    id: "working-with-brokers",
    label: "Working With Brokers",
    description: "Use local expertise at the right point in the decision.",
  },
  {
    id: "glossary",
    label: "Glossary",
    description: "Plain-language definitions for commercial leasing terms.",
  },
];

const articles = [
  topic("how-commercial-leasing-works", {
    title: "How Commercial Leasing Works",
    category: "commercial-leasing",
    readingTime: "5 minute read",
    summary: "Commercial leasing usually moves from needs definition to market search, tours, proposal, negotiation, lease review, buildout, and move-in. The sequence matters because early assumptions shape every later decision.",
    keyQuestion: "What actually happens between starting a search and moving into commercial space?",
    rofoPerspective: "The biggest leasing mistakes usually happen before a lease is drafted. Start by defining the business decision, then compare locations and buildings.",
    sections: [
      {
        heading: "What it means",
        body: "Commercial leasing is the process of finding space, agreeing on business terms, reviewing a lease, preparing the space, and moving in. It is not one decision. It is a sequence of decisions about location, size, layout, cost, timing, flexibility, and risk.",
      },
      {
        heading: "Why it matters",
        body: "A business can waste weeks touring spaces that were never realistic if the process starts with listings instead of requirements. Good leasing decisions usually begin with the business profile: what the company does, who needs access, how the space will be used, and what constraints matter.",
      },
      {
        heading: "Common mistakes",
        body: "Common mistakes include comparing only advertised rent, touring before budget is clear, ignoring location tradeoffs, underestimating buildout time, and waiting too long to involve legal or market expertise.",
      },
      {
        heading: "Related topics",
        body: "The next useful topics are timeline, location strategy, lease types, Letters of Intent, tenant improvements, and broker roles.",
      },
    ],
    relatedTopics: ["commercial-leasing-timeline", "choosing-the-right-commercial-location", "letters-of-intent-explained", "how-commercial-brokers-help"],
    faqs: [
      {
        question: "What is the first step in leasing commercial space?",
        answer: "The first step is defining the business requirements: location, use, size, budget, timing, access needs, and must-have building features.",
      },
      {
        question: "Should a business tour space before knowing its budget?",
        answer: "It can, but it often wastes time. Budget should include base rent, operating expenses, buildout, utilities, parking, and moving costs.",
      },
    ],
  }),
  topic("choosing-the-right-commercial-location", {
    title: "Choosing the Right Commercial Location",
    category: "location-strategy",
    readingTime: "6 minute read",
    summary: "The right building rarely fixes the wrong geography. Location affects customers, employees, hiring, parking, delivery routes, brand perception, and long-term flexibility.",
    keyQuestion: "How should a business decide where to look before comparing buildings?",
    rofoPerspective: "Start with geography. A cheaper building in the wrong district can become expensive if it hurts customers, employees, operations, or recruiting.",
    sections: [
      {
        heading: "What it means",
        body: "Choosing a commercial location means deciding which market, district, corridor, or submarket fits the business before narrowing to buildings. The decision should reflect how the business works, not just where available space happens to be listed.",
      },
      {
        heading: "Why it matters",
        body: "Location changes who can reach the business, how employees commute, how customers perceive the company, and whether the building format fits the use. Office, retail, medical, industrial, and flex users often need very different geographies.",
      },
      {
        heading: "Common mistakes",
        body: "Businesses often compare buildings before comparing districts. They may also overvalue a familiar address, ignore parking or transit, or choose a central location that is not actually convenient for customers or employees.",
      },
      {
        heading: "How to compare locations",
        body: "Compare commute patterns, customer access, parking, transit, visibility, nearby amenities, building inventory, operating requirements, and whether the district supports the business type.",
      },
    ],
    relatedTopics: ["how-commercial-leasing-works", "how-to-compare-commercial-spaces", "how-commercial-brokers-help"],
    faqs: [
      {
        question: "Should location or building come first?",
        answer: "Usually location should come first. The right district or corridor narrows the search and prevents time spent on poor-fit buildings.",
      },
      {
        question: "What makes a location good for a business?",
        answer: "A good location supports the business model, customers, employees, operations, budget, and future plans. It is not the same for every company.",
      },
    ],
  }),
  topic("how-much-space-does-my-business-need", {
    title: "How Much Space Does My Business Need?",
    category: "space-types",
    readingTime: "5 minute read",
    summary: "Space need depends on how the business operates, not just headcount. Layout, storage, customer visits, equipment, growth, and hybrid work can all change the answer.",
    keyQuestion: "How should a business estimate square footage before leasing space?",
    sourceNote: "Consolidates and reframes the older office-space sizing guidance into the handbook model.",
    rofoPerspective: "Do not start with a generic square-foot-per-person rule. Start with how the space needs to function on a normal business day.",
    sections: [
      {
        heading: "What it means",
        body: "Estimating space means translating business activity into a real estate requirement. An office may need desks, meeting rooms, reception, storage, quiet rooms, or collaboration areas. A retail or medical user may need customer areas, back-of-house space, and circulation. Industrial and flex users may need loading, storage, production, or vehicle areas.",
      },
      {
        heading: "Why it matters",
        body: "Too much space wastes money. Too little space creates operational friction. The right amount should support today while leaving enough flexibility for the lease term.",
      },
      {
        heading: "Common mistakes",
        body: "Common mistakes include planning only for today's headcount, ignoring shared areas, underestimating storage, overlooking growth, and assuming every building layout uses square footage equally well.",
      },
      {
        heading: "How to think about it",
        body: "Define the daily activities that need to happen in the space. Then estimate people, rooms, customer areas, storage, equipment, circulation, growth, and any special requirements. Compare layouts, not just square footage.",
      },
    ],
    relatedTopics: ["tenant-improvements", "how-to-compare-commercial-spaces", "commercial-leasing-timeline"],
    faqs: [
      {
        question: "Is square footage the same as usable space?",
        answer: "No. Buildings can measure and allocate space differently. Layout efficiency often matters as much as total square footage.",
      },
      {
        question: "Should a business lease extra space for growth?",
        answer: "Sometimes, but not blindly. Growth assumptions should be realistic and weighed against rent, term, flexibility, and the cost of moving again.",
      },
    ],
  }),
  topic("nnn-vs-gross-vs-modified-gross-leases", {
    title: "NNN vs Gross vs Modified Gross Leases",
    category: "lease-types",
    readingTime: "6 minute read",
    summary: "Lease structure determines what rent includes and what costs are passed through. Two spaces with similar asking rents can have very different total occupancy costs.",
    keyQuestion: "What is the difference between gross, modified gross, and NNN leases?",
    sourceNote: "Consolidates the older gross-vs-NNN blog guidance into canonical handbook language.",
    rofoPerspective: "Do not compare base rent in isolation. Compare total occupancy cost and how much of that cost can change over time.",
    sections: [
      {
        heading: "What it means",
        body: "A gross lease generally includes more property expenses in the quoted rent. A triple net, or NNN, lease usually requires the tenant to pay base rent plus a share of taxes, insurance, and common area maintenance. A modified gross lease sits between those structures and depends on the negotiated terms.",
      },
      {
        heading: "Why it matters",
        body: "Lease structure affects monthly cost, predictability, and risk. A lower base rent under a NNN lease may cost more than a higher gross rent once expenses are added.",
      },
      {
        heading: "Common mistakes",
        body: "The common mistake is comparing spaces by asking rent only. Businesses should ask what is included, what is estimated, what can increase, and whether there are caps, stops, or reconciliations.",
      },
      {
        heading: "Questions to ask",
        body: "Ask whether the lease is gross, modified gross, or NNN; which expenses are included; how CAM is calculated; whether estimates are reconciled; and how future increases are handled.",
      },
    ],
    relatedTopics: ["cam-charges-explained", "commercial-leasing-timeline", "letters-of-intent-explained"],
    faqs: [
      {
        question: "Is a gross lease always better than an NNN lease?",
        answer: "No. A gross lease can be simpler, but the best structure depends on total cost, market norms, the property, and the tenant's tolerance for variable expenses.",
      },
      {
        question: "What does NNN stand for?",
        answer: "NNN means triple net. It usually refers to property taxes, insurance, and common area maintenance passed through to the tenant.",
      },
    ],
  }),
  topic("cam-charges-explained", {
    title: "CAM Charges Explained",
    category: "costs-budgeting",
    readingTime: "5 minute read",
    summary: "CAM charges are common area maintenance costs. They can include shared property expenses and can materially change the true cost of a space.",
    keyQuestion: "What are CAM charges and why do they matter?",
    rofoPerspective: "CAM is not a footnote. For many leases, it is part of the real rent decision.",
    sections: [
      {
        heading: "What it means",
        body: "CAM stands for common area maintenance. It usually refers to shared property costs such as landscaping, parking lot maintenance, common utilities, repairs, janitorial service, management, and other building or center expenses.",
      },
      {
        heading: "Why it matters",
        body: "CAM can change the monthly cost of a lease. It may be estimated upfront and reconciled later. If a business only looks at base rent, it may underestimate the true occupancy cost.",
      },
      {
        heading: "Common mistakes",
        body: "Businesses often fail to ask what is included in CAM, whether costs are controllable, whether there are caps, and how prior-year expenses compare with current estimates.",
      },
      {
        heading: "What to validate",
        body: "Ask for current CAM estimates, historical CAM expenses if available, what categories are included, how expenses are allocated, and whether any items are excluded or capped.",
      },
    ],
    relatedTopics: ["nnn-vs-gross-vs-modified-gross-leases", "tenant-improvements", "letters-of-intent-explained"],
    faqs: [
      {
        question: "Are CAM charges negotiable?",
        answer: "Some parts may be negotiable, but it depends on the property and lease structure. Caps, exclusions, audit rights, and definitions are often more important than the label.",
      },
      {
        question: "Are CAM charges the same as rent?",
        answer: "They are not base rent, but they are part of the tenant's occupancy cost and should be evaluated with rent.",
      },
    ],
  }),
  topic("letters-of-intent-explained", {
    title: "Letters of Intent Explained",
    category: "negotiation",
    readingTime: "5 minute read",
    summary: "A Letter of Intent outlines the main business terms before the lease is drafted. It is where many important economics and obligations first take shape.",
    keyQuestion: "What is a commercial lease Letter of Intent?",
    rofoPerspective: "Treat the LOI seriously. It may be non-binding in parts, but it sets the direction for the lease negotiation.",
    sections: [
      {
        heading: "What it means",
        body: "A Letter of Intent, often called an LOI, summarizes proposed lease terms such as premises, size, rent, term, commencement date, tenant improvement allowance, free rent, renewal options, deposits, and contingencies.",
      },
      {
        heading: "Why it matters",
        body: "The LOI is usually the first written version of the deal. If important issues are skipped, they can become harder to negotiate later when the lease document arrives.",
      },
      {
        heading: "Common mistakes",
        body: "Common mistakes include focusing only on rent, ignoring buildout responsibilities, leaving timing vague, failing to address operating expenses, and assuming legal review can fix every business issue later.",
      },
      {
        heading: "What to validate",
        body: "Validate rent structure, total cost, delivery condition, tenant improvements, timing, options, signage, parking, use clauses, assignment rights, and any conditions that must be satisfied before signing a lease.",
      },
    ],
    relatedTopics: ["tenant-improvements", "nnn-vs-gross-vs-modified-gross-leases", "how-commercial-brokers-help"],
    faqs: [
      {
        question: "Is a Letter of Intent legally binding?",
        answer: "Often many business terms are non-binding, but some provisions can be binding. A qualified attorney should review the language.",
      },
      {
        question: "Who prepares the LOI?",
        answer: "A broker often prepares the first draft, but the tenant should understand every business term before it is sent.",
      },
    ],
  }),
  topic("tenant-improvements", {
    title: "Tenant Improvements",
    category: "costs-budgeting",
    readingTime: "5 minute read",
    summary: "Tenant improvements are changes made to prepare a space for the tenant's use. They can affect cost, timing, lease economics, and whether a space is practical.",
    keyQuestion: "What are tenant improvements and who pays for them?",
    rofoPerspective: "A space is not ready just because it is available. Buildout cost and timing can decide whether the deal works.",
    sections: [
      {
        heading: "What it means",
        body: "Tenant improvements, or TIs, are physical changes needed for the tenant's use. They may include walls, flooring, lighting, restrooms, HVAC work, electrical upgrades, plumbing, reception areas, private offices, exam rooms, or warehouse improvements.",
      },
      {
        heading: "Why it matters",
        body: "Buildout can be one of the largest variables in a lease. It affects move-in timing, capital needs, landlord contributions, and the final business economics.",
      },
      {
        heading: "Common mistakes",
        body: "Businesses often underestimate cost, assume the landlord will pay for everything, ignore permitting time, or tour spaces without understanding what changes are required.",
      },
      {
        heading: "What to validate",
        body: "Validate delivery condition, tenant improvement allowance, who controls the work, permit timing, cost overrun responsibility, ownership of improvements, and whether the space can legally support the intended use.",
      },
    ],
    relatedTopics: ["letters-of-intent-explained", "commercial-leasing-timeline", "how-to-compare-commercial-spaces"],
    faqs: [
      {
        question: "Does the landlord pay for tenant improvements?",
        answer: "Sometimes. The landlord may provide an allowance, deliver the space in a certain condition, or require the tenant to pay some or all costs.",
      },
      {
        question: "Can tenant improvements delay move-in?",
        answer: "Yes. Design, pricing, permits, construction, inspections, and supply issues can all affect timing.",
      },
    ],
  }),
  topic("commercial-leasing-timeline", {
    title: "Commercial Leasing Timeline",
    category: "commercial-leasing",
    readingTime: "5 minute read",
    summary: "Commercial leasing can take weeks or months depending on market options, negotiations, legal review, buildout, permits, and move-in requirements.",
    keyQuestion: "When should a business start looking for commercial space?",
    rofoPerspective: "Start earlier than feels necessary. Time gives a business more leverage, more options, and fewer forced compromises.",
    sections: [
      {
        heading: "What it means",
        body: "The leasing timeline includes requirements definition, market search, tours, proposal or LOI, negotiation, lease review, buildout planning, permits if needed, and move-in. The process varies by space type and complexity.",
      },
      {
        heading: "Why it matters",
        body: "Waiting too long can force a tenant to accept a poor-fit location, weak economics, or a rushed buildout. Starting early creates room to compare options and negotiate carefully.",
      },
      {
        heading: "Common mistakes",
        body: "Businesses often underestimate legal review, landlord response time, construction planning, permit requirements, internet installation, furniture lead times, and internal decision-making.",
      },
      {
        heading: "Planning guidance",
        body: "Simple office or small retail searches may move faster. Medical, restaurant, industrial, lab, or heavily improved spaces usually need more time because use, buildout, code, and equipment issues are more complex.",
      },
    ],
    relatedTopics: ["how-commercial-leasing-works", "tenant-improvements", "letters-of-intent-explained"],
    faqs: [
      {
        question: "How long does commercial leasing take?",
        answer: "It depends on the size, market, use, negotiation, and buildout. Simple deals can move in weeks; more complex deals can take months.",
      },
      {
        question: "When should a tenant start looking?",
        answer: "As early as practical, especially if the business has a hard move date, specialized use, or buildout requirements.",
      },
    ],
  }),
  topic("how-to-compare-commercial-spaces", {
    title: "How to Compare Commercial Spaces",
    category: "touring-comparing",
    readingTime: "6 minute read",
    summary: "Comparing spaces means comparing total fit: location, layout, cost, access, timing, condition, risk, and how well the building supports the business.",
    keyQuestion: "How should a business compare two commercial spaces?",
    sourceNote: "Consolidates and reframes older office evaluation guidance into a broader handbook topic.",
    rofoPerspective: "A tour should test assumptions. Do not ask only whether the space looks good. Ask whether it makes the business easier to operate.",
    sections: [
      {
        heading: "What it means",
        body: "Comparing commercial spaces means looking beyond appearance. The right comparison includes geography, building quality, layout efficiency, rent structure, operating expenses, buildout needs, timing, parking, access, and lease flexibility.",
      },
      {
        heading: "Why it matters",
        body: "Two spaces with similar square footage or rent can produce very different business outcomes. A better layout, stronger location, or simpler buildout can be worth more than a lower advertised rate.",
      },
      {
        heading: "Common mistakes",
        body: "Common mistakes include comparing rent instead of total occupancy cost, ignoring layout efficiency, overlooking parking or delivery access, underestimating improvements, and treating every tour as equal.",
      },
      {
        heading: "What to compare",
        body: "Compare location fit, customer and employee access, usable layout, building condition, cost structure, improvement scope, lease term, expansion options, operating risk, and the questions a broker or attorney still needs to validate.",
      },
    ],
    relatedTopics: ["choosing-the-right-commercial-location", "nnn-vs-gross-vs-modified-gross-leases", "tenant-improvements"],
    faqs: [
      {
        question: "Is the cheapest space usually the best choice?",
        answer: "No. A cheaper space can cost more if it creates operational problems, requires major improvements, or sits in the wrong location.",
      },
      {
        question: "What should a business bring to a tour?",
        answer: "Bring a clear requirements list, budget assumptions, layout needs, timing constraints, and questions about cost, condition, and access.",
      },
    ],
  }),
  topic("how-commercial-brokers-help", {
    title: "How Commercial Brokers Help",
    category: "working-with-brokers",
    readingTime: "5 minute read",
    summary: "A good commercial broker helps validate the market, uncover options, compare tradeoffs, negotiate terms, and manage the path from search to lease.",
    keyQuestion: "What does a commercial real estate broker actually do?",
    rofoPerspective: "Use a broker for market judgment, not just access to listings. The right broker helps pressure-test the decision before the lease is signed.",
    sections: [
      {
        heading: "What it means",
        body: "A commercial broker helps tenants understand the market, identify spaces, arrange tours, compare options, prepare proposals, negotiate business terms, and coordinate with landlords, attorneys, architects, and contractors.",
      },
      {
        heading: "Why it matters",
        body: "Commercial leasing is local and deal-specific. A broker who knows the market can help a business understand pricing, landlord behavior, availability, concessions, timing, and which spaces are worth serious attention.",
      },
      {
        heading: "Common mistakes",
        body: "Businesses sometimes involve a broker too late, choose one without relevant space-type or market experience, or treat the broker as a listing search rather than an advisor.",
      },
      {
        heading: "What to ask",
        body: "Ask which markets and space types the broker knows, how they will compare options, what recent tenant activity they have seen, how they handle conflicts, and what information is needed before tours begin.",
      },
    ],
    relatedTopics: ["choosing-the-right-commercial-location", "letters-of-intent-explained", "commercial-leasing-timeline"],
    faqs: [
      {
        question: "Does every tenant need a broker?",
        answer: "Not always, but many tenants benefit from local market knowledge, negotiation support, and help avoiding poor-fit options.",
      },
      {
        question: "When should a business involve a broker?",
        answer: "After the basic requirement is clear and before spending significant time touring or negotiating directly with landlords.",
      },
    ],
  }),
  topic("common-commercial-leasing-mistakes", {
    title: "Common Commercial Leasing Mistakes",
    category: "commercial-leasing",
    readingTime: "6 minute read",
    summary: "Most leasing mistakes come from moving too quickly, comparing the wrong things, or discovering cost and operational issues too late.",
    keyQuestion: "What should a business avoid when leasing commercial space?",
    rofoPerspective: "A good leasing process reduces surprises. The goal is not to find space quickly. The goal is to avoid committing to the wrong space.",
    sections: [
      {
        heading: "What it means",
        body: "Commercial leasing mistakes are usually decision mistakes: choosing the wrong location, misunderstanding cost, underestimating buildout, signing too long a term, or failing to validate whether the space can support the business.",
      },
      {
        heading: "Why it matters",
        body: "A lease can affect cash flow, hiring, customer access, operations, and flexibility for years. Fixing a bad lease decision is usually harder than slowing down before signing.",
      },
      {
        heading: "Mistakes to watch for",
        body: "Watch for comparing only rent, ignoring CAM or NNN costs, touring without priorities, choosing a location based only on familiarity, underestimating tenant improvements, missing timeline constraints, and failing to get legal review.",
      },
      {
        heading: "How to avoid them",
        body: "Define requirements early, compare districts before buildings, calculate total occupancy cost, document assumptions in the LOI, validate buildout and timing, and use broker and legal expertise where the decision carries real risk.",
      },
    ],
    relatedTopics: ["how-commercial-leasing-works", "choosing-the-right-commercial-location", "nnn-vs-gross-vs-modified-gross-leases", "tenant-improvements"],
    faqs: [
      {
        question: "What is the biggest mistake tenants make?",
        answer: "One of the biggest mistakes is comparing spaces before defining the business requirements and total budget.",
      },
      {
        question: "Can a bad commercial lease be fixed later?",
        answer: "Sometimes, but it can be expensive or difficult. It is better to identify location, cost, use, and timing issues before signing.",
      },
    ],
  }),
];

const articleMap = articles.reduce((map, article) => {
  map[article.slug] = article;
  return map;
}, {});

module.exports = {
  title: "Commercial Leasing Guide",
  subtitle: "A practical handbook for businesses leasing commercial space.",
  description: "Understand commercial leasing, location strategy, lease types, costs, negotiations, brokers, and common mistakes before choosing a space.",
  baseUrl: handbookBase,
  categories,
  articles,
  articleMap,
  glossary: [
    { term: "NNN lease", definition: "A lease where the tenant usually pays base rent plus taxes, insurance, and common area maintenance." },
    { term: "CAM", definition: "Common area maintenance charges for shared property expenses." },
    { term: "Letter of Intent", definition: "A document outlining proposed lease business terms before the lease is drafted." },
    { term: "Tenant improvements", definition: "Changes made to prepare a space for the tenant's use." },
    { term: "Occupancy cost", definition: "The full cost of occupying a space, including rent and other recurring expenses." },
  ],
};
