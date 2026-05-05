const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const SOURCE_URL = "https://www.highwoods.com/meet-highwoods/our-markets/atlanta";
const OUTPUT_PATH = path.join(ROOT, "raw/availability-intake/highwoods-atlanta.csv");

const COLUMNS = [
  "source_type",
  "source_name",
  "source_url",
  "source_date",
  "company",
  "contact_name",
  "contact_email",
  "contact_phone",
  "building_name",
  "address",
  "city",
  "state",
  "property_type",
  "available_spaces_count",
  "suite",
  "size_sf",
  "rent",
  "availability_notes",
  "image_url",
  "pdf_url",
  "confidence",
  "needs_review",
  "extracted_at",
];

const KNOWN_NON_PROPERTY_HEADINGS = new Set([
  "Atlanta",
  "Atlanta Properties",
  "Featured Properties",
  "Highwoods Headquarters",
  "Let's Connect",
  "Meet the Atlanta Team",
  "Need More Help?",
  "Office Space Calculator",
  "Our Markets",
  "Select a Market",
]);

function usage() {
  return [
    "Usage:",
    "  node scripts/intake/highwoods-atlanta.js",
    "  node scripts/intake/highwoods-atlanta.js --input path/to/highwoods-atlanta.html",
    "  node scripts/intake/highwoods-atlanta.js --skip-details",
  ].join("\n");
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/\s+/g, " ")
    .trim();
}

function csvEscape(value) {
  const string = String(value ?? "");
  if (/[",\n\r]/.test(string)) {
    return `"${string.replace(/"/g, '""')}"`;
  }
  return string;
}

function writeCsv(rows) {
  const lines = [
    COLUMNS.join(","),
    ...rows.map((row) => COLUMNS.map((column) => csvEscape(row[column] || "")).join(",")),
  ];
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${lines.join("\n")}\n`);
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

async function getSourceHtml() {
  const inputPath = getArgValue("--input");
  if (process.argv.includes("--help")) {
    console.log(usage());
    process.exit(0);
  }

  if (inputPath) {
    return fs.readFileSync(path.resolve(ROOT, inputPath), "utf8");
  }

  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent": "Rofo availability intake review bot; contact: https://www.rofo.com/contact/",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Highwoods request failed with ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Rofo availability intake review bot; contact: https://www.rofo.com/contact/",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function extractMarketSummary(text) {
  const propertiesMatch = text.match(/\bAtlanta\s+(\d+)\s+Properties\b/i) || text.match(/\b(\d+)\s+Properties\b/i);
  const spacesMatch = text.match(/\b(\d+)\s+Available Spaces\b/i);

  return {
    marketName: "Atlanta",
    propertiesCount: propertiesMatch ? propertiesMatch[1] : "",
    availableSpacesCount: spacesMatch ? spacesMatch[1] : "",
  };
}

function extractContacts(text) {
  const contactPattern = /([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3})\s+((?:Sr\.\s+)?(?:Vice President and Market Leader|Director of Leasing|Director of Asset Management))\s+(\d{3}-\d{3}-\d{4})\s+([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
  const contacts = [];
  let match;

  while ((match = contactPattern.exec(text))) {
    contacts.push({
      name: cleanText(match[1]),
      title: cleanText(match[2]),
      phone: match[3],
      email: match[4],
    });
  }

  return contacts;
}

function uniqueContacts(contacts) {
  const seen = new Set();
  return contacts.filter((contact) => {
    const key = `${contact.name}|${contact.email}|${contact.phone}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shouldSkipPropertyName(name) {
  if (!name || KNOWN_NON_PROPERTY_HEADINGS.has(name)) return true;
  if (/^(Show All|Show Available|Download PDF|Contact Us|Find Your Space)$/i.test(name)) return true;
  if (/Available Spaces?$|Join the waiting list/i.test(name)) return true;
  return false;
}

function extractProperties(html) {
  const propertyPattern = /<h3[^>]*>\s*(?:<a[^>]*href="([^"]+)"[^>]*>)?\s*([^<]+?)\s*(?:<\/a>)?\s*<\/h3>\s*(?:<a[^>]*href="([^"]+)"[^>]*>\s*)?(?:(\d+)\s+Available Spaces?|Join the waiting list)?/gi;
  const properties = [];
  const seen = new Set();
  let match;

  while ((match = propertyPattern.exec(html))) {
    const name = stripTags(match[2]);
    if (shouldSkipPropertyName(name)) continue;

    const href = match[1] || match[3] || "";
    const hasPropertySignal = /\/find-your-space\/detail\//i.test(href) || Boolean(match[4]);
    if (!hasPropertySignal) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const sourceUrl = href
      ? new URL(decodeHtml(href), SOURCE_URL).toString()
      : SOURCE_URL;

    properties.push({
      name,
      sourceUrl,
      availableSpacesCount: match[4] || "",
      availabilityNotes: match[4] ? "" : "Availability count was not visible on the market page or property is waitlist only.",
    });
  }

  return properties;
}

function confidenceForProperty(property) {
  let score = 0.45;
  if (property.name) score += 0.15;
  if (property.address) score += 0.1;
  if (property.suite) score += 0.1;
  if (property.sizeSf) score += 0.1;
  if (property.availableSpacesCount) score += 0.2;
  if (property.pdfUrl) score += 0.05;
  if (property.imageUrl) score += 0.05;
  if (property.sourceUrl && property.sourceUrl !== SOURCE_URL) score += 0.1;
  return Math.min(score, 0.98).toFixed(2);
}

function extractMetaContent(html, nameOrProperty) {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+(?:name|property)=["']${escaped}["']\\s+content=["']([^"']*)["']`, "i");
  const match = html.match(pattern);
  return match ? cleanText(match[1]) : "";
}

function firstAbsoluteUrl(html, pattern) {
  const match = html.match(pattern);
  if (!match) return "";
  return new URL(decodeHtml(match[1]), SOURCE_URL).toString();
}

function extractDetailAddress(html) {
  const match = html.match(/<h2[^>]*>[^<]+<\/h2>\s*<address>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
  if (!match) return "";
  return stripTags(match[1]).replace(/\s+/g, " ").trim();
}

function extractDetailPropertyName(html, fallback) {
  const match = html.match(/<section class="Feature[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/i);
  return match ? stripTags(match[1]) : fallback;
}

function extractDetailAvailableSpacesCount(html) {
  const match = html.match(/<a href="#AvailableSpaceListing">\s*(\d+)\s+available spaces?\s*<\/a>/i);
  return match ? match[1] : "";
}

function extractDetailImageUrl(html) {
  return extractMetaContent(html, "og:image")
    || firstAbsoluteUrl(html, /<div class="slick-slide photo">\s*<img\s+src="([^"]+)"/i)
    || firstAbsoluteUrl(html, /<img[^>]+src="([^"]+)"[^>]*>/i);
}

function extractBuildingPdfUrl(html) {
  const navMatch = html.match(/<nav class="Page--detail-nav">([\s\S]*?)<\/nav>/i);
  if (!navMatch) return "";
  return firstAbsoluteUrl(navMatch[1], /<a\s+href="([^"]+\.pdf[^"]*)"[^>]*>/i);
}

function extractDescriptionNote(html) {
  const description = extractMetaContent(html, "description");
  return description ? `Detail page description: ${description}` : "";
}

function normalizeSf(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function extractLabelValue(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<span class="h14">\\s*${escaped}\\s*<\\/span>\\s*(?:<br\\s*\\/?>\\s*)?([\\s\\S]*?)(?=<\\/div>)`, "i");
  const match = block.match(pattern);
  return match ? stripTags(match[1]) : "";
}

function extractSuiteBlocks(html) {
  const sectionStart = html.indexOf('id="AvailableSpaceListing"');
  if (sectionStart === -1) return [];
  const sectionEnd = html.indexOf("</section>", sectionStart);
  const section = html.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);
  const suiteMatches = [...section.matchAll(/<h3 class="h20 u-inline">\s*Suite\s*([\s\S]*?)<\/h3>/gi)];

  return suiteMatches.map((match, index) => {
    const blockStart = match.index;
    const blockEnd = index + 1 < suiteMatches.length ? suiteMatches[index + 1].index : section.length;
    const block = section.slice(blockStart, blockEnd);
    const suiteNumber = stripTags(match[1]);
    const status = /Available\s*now/i.test(stripTags(block)) ? "Available now" : "";
    const propertyType = extractLabelValue(block, "Space Type:") || extractLabelValue(block, "Space Type");
    const currentSf = normalizeSf(extractLabelValue(block, "Current"));
    const floorPlanUrl = firstAbsoluteUrl(block, /<a\s+href="([^"]+\.pdf[^"]*)"[^>]*>/i);
    const tourUrlMatch = block.match(/data-tour-url="([^"]+)"/i);
    const tourUrl = tourUrlMatch ? decodeHtml(tourUrlMatch[1]) : "";

    return {
      suite: suiteNumber ? `Suite ${suiteNumber}` : "",
      propertyType,
      sizeSf: currentSf,
      pdfUrl: floorPlanUrl,
      status,
      tourUrl,
    };
  }).filter((suite) => suite.suite);
}

function extractDetailData(property, html) {
  const text = stripTags(html);
  const contacts = uniqueContacts(extractContacts(text));
  const suites = extractSuiteBlocks(html);
  const descriptionNote = extractDescriptionNote(html);
  const buildingPdfUrl = extractBuildingPdfUrl(html);
  const imageUrl = extractDetailImageUrl(html);
  const availableSpacesCount = extractDetailAvailableSpacesCount(html) || property.availableSpacesCount;

  return {
    sourceUrl: property.sourceUrl,
    name: extractDetailPropertyName(html, property.name),
    address: extractDetailAddress(html),
    availableSpacesCount,
    propertyType: suites.find((suite) => suite.propertyType)?.propertyType || "Office",
    imageUrl,
    pdfUrl: buildingPdfUrl,
    descriptionNote,
    contacts,
    suites,
  };
}

async function enrichProperties(properties) {
  if (process.argv.includes("--skip-details")) return properties;

  const enriched = [];
  for (const property of properties) {
    if (!property.sourceUrl || property.sourceUrl === SOURCE_URL) {
      enriched.push(property);
      continue;
    }

    try {
      const html = await fetchHtml(property.sourceUrl);
      enriched.push({ ...property, detail: extractDetailData(property, html) });
    } catch (error) {
      enriched.push({
        ...property,
        availabilityNotes: [property.availabilityNotes, `Detail page fetch failed: ${error.message}`].filter(Boolean).join(" "),
      });
    }
  }
  return enriched;
}

function buildAvailabilityNotes({ property, detail, suite, summaryNotes }) {
  const propertyNote = detail?.availableSpacesCount ? "" : property.availabilityNotes;
  return [
    suite?.status || "",
    suite?.tourUrl ? `Virtual tour visible: ${suite.tourUrl}` : "",
    propertyNote || "",
    detail?.descriptionNote || "",
    `Market source: ${SOURCE_URL}.`,
    summaryNotes,
  ].filter(Boolean).join(" ");
}

function buildRows({ properties, contacts, marketSummary, extractedAt }) {
  const fallbackContact = contacts.find((contact) => /leasing/i.test(contact.title)) || contacts[0] || {};
  const summaryNotes = [
    marketSummary.propertiesCount ? `${marketSummary.propertiesCount} Atlanta properties visible on source page.` : "",
    marketSummary.availableSpacesCount ? `${marketSummary.availableSpacesCount} available spaces visible at market level.` : "",
  ].filter(Boolean).join(" ");

  const propertyRows = properties.flatMap((property) => {
    const detail = property.detail || null;
    const detailContact = detail?.contacts?.find((contact) => /leasing/i.test(contact.title)) || detail?.contacts?.[0] || fallbackContact;
    const suites = detail?.suites?.length ? detail.suites : [null];

    return suites.map((suite) => {
      const rowProperty = {
        ...property,
        address: detail?.address || "",
        suite: suite?.suite || "",
        sizeSf: suite?.sizeSf || "",
        availableSpacesCount: detail?.availableSpacesCount || property.availableSpacesCount,
        pdfUrl: suite ? suite.pdfUrl || "" : detail?.pdfUrl || "",
        imageUrl: detail?.imageUrl || "",
        sourceUrl: detail?.sourceUrl || property.sourceUrl || SOURCE_URL,
      };

      return {
        source_type: "landlord_website",
        source_name: "Highwoods Atlanta market page",
        source_url: rowProperty.sourceUrl,
        source_date: "",
        company: "Highwoods Properties",
        contact_name: detailContact.name || "",
        contact_email: detailContact.email || "",
        contact_phone: detailContact.phone || "",
        building_name: detail?.name || property.name,
        address: rowProperty.address,
        city: "Atlanta",
        state: "GA",
        property_type: suite?.propertyType || detail?.propertyType || "Office",
        available_spaces_count: rowProperty.availableSpacesCount,
        suite: rowProperty.suite,
        size_sf: rowProperty.sizeSf,
        rent: "",
        availability_notes: buildAvailabilityNotes({ property, detail, suite, summaryNotes }),
        image_url: rowProperty.imageUrl,
        pdf_url: rowProperty.pdfUrl,
        confidence: confidenceForProperty(rowProperty),
        needs_review: "true",
        extracted_at: extractedAt,
      };
    });
  });

  if (propertyRows.length) return propertyRows;

  return [{
    source_type: "landlord_website",
    source_name: "Highwoods Atlanta market page",
    source_url: SOURCE_URL,
    source_date: "",
    company: "Highwoods Properties",
    contact_name: fallbackContact.name || "",
    contact_email: fallbackContact.email || "",
    contact_phone: fallbackContact.phone || "",
    building_name: "",
    address: "",
    city: "Atlanta",
    state: "GA",
    property_type: "Office",
    available_spaces_count: marketSummary.availableSpacesCount,
    suite: "",
    size_sf: "",
    rent: "",
    availability_notes: summaryNotes || "Market page fetched, but building-level availability was not extracted.",
    image_url: "",
    pdf_url: "",
    confidence: "0.35",
    needs_review: "true",
    extracted_at: extractedAt,
  }];
}

async function main() {
  const html = await getSourceHtml();
  const text = stripTags(html);
  const extractedAt = new Date().toISOString();
  const marketSummary = extractMarketSummary(text);
  const contacts = extractContacts(text);
  const properties = await enrichProperties(extractProperties(html));
  const rows = buildRows({ properties, contacts, marketSummary, extractedAt });

  writeCsv(rows);

  console.log(`Wrote ${rows.length} review rows to ${path.relative(ROOT, OUTPUT_PATH)}.`);
  console.log(`Market: ${marketSummary.marketName}`);
  if (marketSummary.propertiesCount) console.log(`Properties visible: ${marketSummary.propertiesCount}`);
  if (marketSummary.availableSpacesCount) console.log(`Available spaces visible: ${marketSummary.availableSpacesCount}`);
  if (contacts.length) console.log(`Contacts extracted: ${contacts.length}`);
  if (!process.argv.includes("--skip-details")) console.log("Detail enrichment: enabled");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
