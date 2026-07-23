const fs = require("fs");
const path = require("path");

const root = process.cwd();
const errors = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function includes(file, pattern, message) {
  const text = read(file);
  assert(pattern.test(text), message);
}

const subjectsPath = "data/generated/field-photo-subjects.json";
assert(exists(subjectsPath), "Missing generated Field Photo subject index");
const subjects = exists(subjectsPath) ? JSON.parse(read(subjectsPath)).subjects || [] : [];
const subjectKeys = new Set();
for (const subject of subjects) {
  const key = `${subject.subjectType}:${subject.id}`;
  assert(!subjectKeys.has(key), `Duplicate subject ${key}`);
  subjectKeys.add(key);
  assert(["city", "district", "building"].includes(subject.subjectType), `Invalid subject type ${key}`);
  assert(subject.id && subject.name && subject.publicPath, `Incomplete subject ${key}`);
}

const city = subjects.find((subject) => subject.subjectType === "city" && subject.id === "sacramento-ca");
const district = subjects.find((subject) => subject.subjectType === "district" && subject.id === "sac-power-inn-industrial");
const building = subjects.find((subject) => subject.subjectType === "building" && subject.publicPath === "/commercial-real-estate/building/CA/sacramento/8583-elder-creek-rd/");
const lombardBuilding = subjects.find((subject) => subject.subjectType === "building" && subject.publicPath === "/commercial-real-estate/building/CA/san-francisco/1839-lombard-st/");
assert(city, "Missing Sacramento city test subject");
assert(district, "Missing Power Inn Industrial district test subject");
assert(building, "Missing 8583 Elder Creek Rd building test subject");
assert(lombardBuilding && lombardBuilding.id === "ca-san-francisco-1839-lombard-st", "Missing canonical 1839 Lombard St Field Photo subject");

const migration = "migrations/0001_field_photos.sql";
assert(exists(migration), "Missing Field Photos D1 migration");
includes(migration, /create table if not exists field_photos/i, "Migration does not create field_photos");
includes(migration, /subject_type text not null/i, "Migration missing subject_type");
includes(migration, /storage_key text not null/i, "Migration missing storage key");
includes(migration, /thumbnail_storage_key text not null/i, "Migration missing thumbnail storage key");
includes(migration, /idx_field_photos_subject/i, "Migration missing subject index");

[
  "functions/admin/field-photos.js",
  "functions/api/field-photos/_shared.js",
  "functions/api/field-photos/search.js",
  "functions/api/field-photos/recent.js",
  "functions/api/field-photos/upload.js",
  "functions/api/field-photos/action.js",
  "functions/api/field-photos/hero.js",
  "functions/api/field-photos/assets/[id].js",
  "js/field-photos-public.js",
  "_includes/partials/shared/editorial-photo-slot.njk",
].forEach((file) => assert(exists(file), `Missing ${file}`));

includes("functions/api/field-photos/_shared.js", /ADMIN_DASHBOARD_TOKEN/, "Admin auth token is not reused");
includes("functions/api/field-photos/_shared.js", /ROFO_PHOTOS/, "R2 binding helper is missing");
includes("functions/api/field-photos/_shared.js", /field-photo-subjects\.json/, "Generated canonical subject index is not imported");
includes("functions/api/field-photos/_shared.js", /publicHeroPhoto\(row\)/, "Public response helper is missing");
includes("functions/api/field-photos/_shared.js", /source_type.*rofo_original/s, "Rofo-owned provenance defaults are missing");
includes("functions/api/field-photos/upload.js", /archiveActiveHero/, "Upload does not supersede the active hero");
includes("functions/api/field-photos/upload.js", /validateUploadedFile\(publicImage\)/, "Public image upload is not validated through validateUploadedFile");
includes("functions/api/field-photos/upload.js", /validateUploadedFile\(thumbnailImage, \{ thumbnail: true \}\)/, "Thumbnail upload is not validated through validateUploadedFile");
includes("functions/api/field-photos/action.js", /action === "publish"/, "Publish action is missing");
includes("functions/api/field-photos/action.js", /action === "archive"/, "Archive action is missing");
includes("functions/api/field-photos/hero.js", /status = 'published'/, "Public hero endpoint can resolve non-published photos");
includes("functions/api/field-photos/assets/[id].js", /row\.status === "archived"/, "Archived assets are not blocked");

const publicHelper = read("functions/api/field-photos/_shared.js");
const publicHeroMatch = publicHelper.match(/export function publicHeroPhoto\(row\) \{([\s\S]*?)\n\}/);
assert(publicHeroMatch, "Unable to inspect public hero response helper");
if (publicHeroMatch) {
  const body = publicHeroMatch[1];
  ["storage_key", "thumbnail_storage_key", "photographer", "rights_status", "source_type", "created_by"].forEach((field) => {
    assert(!body.includes(field), `Public response exposes private metadata: ${field}`);
  });
}

includes("functions/admin/field-photos.js", /accept="image\/\*"/, "Admin upload input accepts image files");
includes("functions/admin/field-photos.js", /Rofo-owned photo/, "Rights disclosure is missing");
includes("functions/admin/field-photos.js", /PUBLIC_MAX_EDGE = 1600/, "Browser public image max edge is not 1600");
includes("functions/admin/field-photos.js", /THUMB_MAX_EDGE = 480/, "Browser thumbnail max edge is not 480");
includes("functions/admin/field-photos.js", /DEFAULT_QUALITY = 0\.82/, "Browser WebP quality target is not documented in code");
includes("functions/admin/field-photos.js", /PUBLIC_TARGET_BYTES = 1100000/, "Browser public image target is not 1,100,000 bytes");
includes("functions/admin/field-photos.js", /THUMB_TARGET_BYTES = 300000/, "Browser thumbnail target is not 300,000 bytes");
includes("functions/admin/field-photos.js", /COMPRESSION_QUALITIES = \[0\.82, 0\.76, 0\.70, 0\.64, 0\.58\]/, "Adaptive compression quality ladder is missing");
includes("functions/admin/field-photos.js", /blob\.size <= targetBytes/, "Adaptive compression does not stop when blob is under target bytes");
includes("functions/admin/field-photos.js", /processImage\(file, PUBLIC_MAX_EDGE, PUBLIC_TARGET_BYTES\)/, "Public image processing does not use the public target byte size");
includes("functions/admin/field-photos.js", /processImage\(file, THUMB_MAX_EDGE, THUMB_TARGET_BYTES\)/, "Thumbnail processing does not use the thumbnail target byte size");
includes("functions/admin/field-photos.js", /encodeCanvasWithinTarget\(canvas, "image\/jpeg", targetBytes\)/, "JPEG fallback is not preserved");
includes("_includes/partials/shared/building-card.njk", /data-building-photo-subject-id/, "Standard building cards do not expose canonical building photo subject IDs");
includes("_includes/partials/shared/building-card-compact.njk", /data-building-photo-subject-id/, "Compact building cards do not expose canonical building photo subject IDs");
includes("_includes/partials/shared/building-card-compact.njk", /building\.fieldPhotoSubjectId/, "Compact building cards do not prefer resolved Field Photo subject IDs");
includes("_includes/partials/shared/building-card-compact.njk", /class="building-card-compact__image"/, "Compact building cards do not expose an image hydration target");
includes("_includes/partials/shared/building-card-compact.njk", /building-card-compact__content/, "Compact building cards do not render content beneath the image");
includes("_includes/partials/shared/building-card-compact.njk", /data-building-photo-credit/, "Compact building cards do not include conditional photo credit markup");
assert(!/building-card-compact__overlay/.test(read("_includes/partials/shared/building-card-compact.njk")), "Compact building cards still render image-overlay markup");
assert(!/building-card__overlay/.test(read("_includes/partials/shared/building-card.njk")), "Standard building cards still render image-overlay markup");
assert(!/building-card-compact__overlay|building-card__overlay/.test(read("assets/css/system.css")), "Building card overlay CSS is still active");
includes("js/field-photos-public.js", /img\[data-building-photo-subject-id\]/, "Public Field Photo loader does not scan building card images");
includes("js/field-photos-public.js", /image\.src = photo\.imageUrl/, "Public Field Photo loader does not replace building card image sources");
includes("js/field-photos-public.js", /image\.removeAttribute\("srcset"\)/, "Public Field Photo loader does not clear stale srcset values");
includes("js/field-photos-public.js", /data-building-photo-card/, "Public Field Photo loader does not look up the containing building photo card");
includes("js/field-photos-public.js", /data-building-photo-credit/, "Public Field Photo loader does not hydrate below-image photo credits");
includes("js/field-photos-public.js", /credit\.hidden = false/, "Public Field Photo loader does not reveal populated photo credits");
includes("js/field-photos-public.js", /data-building-photo-caption/, "Public Field Photo loader does not hydrate building hero captions");
includes("js/field-photos-public.js", /building_slot_consolidated/, "Building profile Field Photo slots are not consolidated into the hero image");
includes("js/field-photos-public.js", /ROFO_FIELD_PHOTO_DIAGNOSTICS/, "Field Photo runtime diagnostics are missing");
includes("_data/neighborhoodPages.js", /fieldPhotoSubjectId/, "District representative building data does not preserve resolved Field Photo subject IDs");
includes("_data/recommendationRepresentativeBuildings.js", /fieldPhotoSubjectId/, "Representative building card data does not retain Field Photo subject IDs");
includes("pages/recommendations.njk", /fieldPhotosPublic: true/, "Recommendation page does not load public Field Photo propagation");
includes("pages/recommendations.njk", /building\.image or '\/images\/placeholders\/building-c\.svg'/, "Static representative building cards do not provide a fallback image hydration target");
includes("city-buildings.njk", /fieldPhotosPublic: true/, "City building index pages do not load public Field Photo propagation");
includes("company.njk", /fieldPhotosPublic: true/, "Company building-card pages do not load public Field Photo propagation");
includes("pages/commercial-real-estate/market-guide.njk", /fieldPhotosPublic: true/, "Market guide building-card pages do not load public Field Photo propagation");
includes("pages/space-type.njk", /fieldPhotosPublic: true/, "Space-type representative building pages do not load public Field Photo propagation");
includes("js/recommendation-context.js", /hydrateBuildingCardImage/, "Dynamic representative building cards do not hydrate uploaded Field Photos");
includes("js/recommendation-context.js", /building\.image \|\| "\/images\/placeholders\/building-c\.svg"/, "Dynamic representative building cards do not provide a fallback image hydration target");
includes("building.njk", /class="hero-image"[\s\S]*data-building-photo-subject-id/, "Building page hero image is not the Field Photo hydration target");
includes("building.njk", /hero-photo-caption[\s\S]*data-building-photo-credit/, "Building page hero does not provide below-image caption and credit targets");
assert(!/hero-overlay/.test(read("building.njk")), "Building page still renders a white hero image overlay");
assert(!/fieldPhotoPlacement = "building-profile"/.test(read("building.njk")), "Building page still renders a separate Field Photo slot below the hero image");

const neighborhoodPages = require(path.join(root, "_data/neighborhoodPages.js"));
const marinaPage = neighborhoodPages.find((page) => page.canonical_neighborhood_path === "/commercial-real-estate/CA/san-francisco/marina-district/");
const lombardCard = marinaPage?.representative_buildings?.find((item) => item.building_path === "/commercial-real-estate/building/CA/san-francisco/1839-lombard-st/");
assert(lombardCard, "Marina District page is missing the 1839 Lombard St representative building card");
assert(lombardCard?.fieldPhotoSubjectId === "ca-san-francisco-1839-lombard-st", "Marina District 1839 Lombard card has the wrong Field Photo subject ID");
assert(lombardCard?.fieldPhotoSubjectId !== "ca-undefined-undefined", "District representative building card still emits an undefined Field Photo subject ID");

includes("city.njk", /fieldPhotoSubjectType = "city"[\s\S]*editorial-photo-slot/, "City page missing Field Photo slot");
includes("pages/commercial-real-estate/neighborhood.njk", /fieldPhotoSubjectType = "district"[\s\S]*editorial-photo-slot/, "District page missing Field Photo slot");
includes("building.njk", /data-building-photo-subject-id="{{ fieldPhotoSubjectId }}"/, "Building page missing hero image Field Photo hydration target");
includes("_includes/base.njk", /field-photos-public\.js/, "Public Field Photo loader is not conditionally included");
includes("assets/css/system.css", /\.editorial-photo__figure/, "Public Field Photo CSS is missing");

const wrangler = read("wrangler.jsonc");
includes("wrangler.jsonc", /"binding": "ROFO_PHOTOS"/, "wrangler.jsonc missing ROFO_PHOTOS binding");
warn(/"bucket_name": "rofo-photos"/.test(wrangler), "R2 bucket name should be reviewed before production deploy");

const admin = read("functions/admin/field-photos.js");
assert(!/GPS|near me|AI image|watermark/i.test(admin), "Out-of-scope Field Mode feature appears in admin page");

console.log("Field Mode QA");
console.log(`Subjects: ${subjects.length}`);
console.log(`Test city: ${city ? city.name : "missing"}`);
console.log(`Test district: ${district ? district.name : "missing"}`);
console.log(`Test building: ${building ? building.name : "missing"}`);
console.log(`Errors: ${errors.length ? errors.join("; ") : "none"}`);
console.log(`Warnings: ${warnings.length ? warnings.join("; ") : "none"}`);

if (errors.length) process.exit(1);
