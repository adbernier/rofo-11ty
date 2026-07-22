import fieldPhotoSubjects from "../../../data/generated/field-photo-subjects.json";

export const FIELD_PHOTO_IMAGE_TYPES = {
  city: ["skyline", "city_environment", "downtown_streetscape", "landmark_context", "other"],
  district: ["district_environment", "streetscape", "district_entrance", "representative_roadway", "landmark", "other"],
  building: ["exterior", "entrance", "loading", "parking", "streetscape_context", "other"],
};

const VALID_SUBJECT_TYPES = new Set(["city", "district", "building"]);
const VALID_STATUSES = new Set(["draft", "published", "archived"]);
const VALID_MIME_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);
const MAX_PUBLIC_IMAGE_BYTES = 1_200_000;
const MAX_THUMBNAIL_BYTES = 350_000;

export function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function clean(value, max = 1000) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

export function requireAdmin(request, env) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) return { ok: false, response: jsonResponse({ ok: false, error: "Admin token is not configured" }, 500) };
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  const token = url.searchParams.get("token") || request.headers.get("x-admin-token") || bearer || "";
  if (token !== configuredToken) return { ok: false, response: jsonResponse({ ok: false, error: "Forbidden" }, 403) };
  return { ok: true, token };
}

export function getPhotoDb(env) {
  return env.FIELD_PHOTOS_DB || env.LEADS_DB || null;
}

export function getPhotoBucket(env) {
  return env.ROFO_PHOTOS || null;
}

export async function ensureFieldPhotosTable(db) {
  if (!db) throw new Error("FIELD_PHOTOS_DB or LEADS_DB D1 binding is required.");
  await db.prepare(`
    create table if not exists field_photos (
      id text primary key,
      subject_type text not null check (subject_type in ('city', 'district', 'building')),
      subject_id text not null,
      subject_name text not null,
      market_id text,
      image_role text not null default 'hero',
      image_type text not null,
      status text not null check (status in ('draft', 'published', 'archived')),
      public_url text not null,
      thumbnail_url text not null,
      storage_key text not null,
      thumbnail_storage_key text not null,
      width integer not null,
      height integer not null,
      file_size integer not null,
      mime_type text not null,
      caption text not null,
      alt_text text not null,
      source_type text not null default 'rofo_original',
      rights_status text not null default 'owned',
      photographer text not null,
      attribution text not null default 'Photo © Rofo',
      captured_at text,
      uploaded_at text not null,
      published_at text,
      archived_at text,
      superseded_by text,
      created_by text,
      updated_at text not null
    )
  `).run();
  await db.prepare("create index if not exists idx_field_photos_subject on field_photos(subject_type, subject_id, image_role, status)").run();
  await db.prepare("create index if not exists idx_field_photos_recent on field_photos(uploaded_at)").run();
  await db.prepare("create index if not exists idx_field_photos_market on field_photos(market_id, status)").run();
}

export function allSubjects() {
  return Array.isArray(fieldPhotoSubjects.subjects) ? fieldPhotoSubjects.subjects : [];
}

export function findSubject(subjectType, subjectId) {
  const type = clean(subjectType, 40);
  const id = clean(subjectId, 240);
  if (!VALID_SUBJECT_TYPES.has(type) || !id) return null;
  return allSubjects().find((subject) => subject.subjectType === type && subject.id === id) || null;
}

export function searchSubjects({ subjectType = "", query = "", limit = 20 }) {
  const type = clean(subjectType, 40);
  const q = clean(query, 120).toLowerCase();
  const max = Math.max(1, Math.min(50, Number(limit) || 20));
  return allSubjects()
    .filter((subject) => (!type || subject.subjectType === type) && (!q || [
      subject.name,
      subject.city,
      subject.state,
      subject.context,
      subject.id,
      subject.address,
      subject.districtName,
    ].filter(Boolean).join(" ").toLowerCase().includes(q)))
    .slice(0, max);
}

export function defaultCaption(subject, imageType = "") {
  if (!subject) return "";
  if (subject.subjectType === "city") {
    return `${subject.name} commercial environment.`;
  }
  if (subject.subjectType === "district") {
    return `${imageType === "streetscape" ? "Streetscape" : "Commercial environment"} in ${subject.city}'s ${subject.name} district.`;
  }
  const district = subject.districtName ? `${subject.city}'s ${subject.districtName} district` : `${subject.city}, ${subject.state}`;
  return `${imageType === "entrance" ? "Entrance" : "Exterior"} of ${subject.name} in ${district}.`;
}

export function defaultAltText(subject, imageType = "") {
  if (!subject) return "";
  if (subject.subjectType === "city") return `${subject.name}, ${subject.state} commercial environment`;
  if (subject.subjectType === "district") return `${subject.name} commercial district in ${subject.city}, ${subject.state}`;
  const typeLabel = imageType ? imageType.replace(/_/g, " ") : "commercial building";
  return `${typeLabel} at ${subject.name} in ${subject.city}, ${subject.state}`;
}

export function validateImageType(subjectType, imageType) {
  const allowed = FIELD_PHOTO_IMAGE_TYPES[subjectType] || [];
  return allowed.includes(imageType) ? imageType : "";
}

export function validateStatus(status) {
  return VALID_STATUSES.has(status) ? status : "";
}

export function validateUploadedFile(file, { thumbnail = false } = {}) {
  if (!file || typeof file.arrayBuffer !== "function") return "Missing image file.";
  if (!VALID_MIME_TYPES.has(file.type)) return "Unsupported image format.";
  const max = thumbnail ? MAX_THUMBNAIL_BYTES : MAX_PUBLIC_IMAGE_BYTES;
  if (Number(file.size || 0) < 1) return "Image file is empty.";
  if (Number(file.size || 0) > max) return `Optimized ${thumbnail ? "thumbnail" : "image"} is too large.`;
  return "";
}

export function safePhotoRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    marketId: row.market_id || "",
    imageRole: row.image_role,
    imageType: row.image_type,
    status: row.status,
    publicUrl: row.public_url,
    thumbnailUrl: row.thumbnail_url,
    width: Number(row.width || 0),
    height: Number(row.height || 0),
    fileSize: Number(row.file_size || 0),
    mimeType: row.mime_type,
    caption: row.caption,
    altText: row.alt_text,
    attribution: row.attribution || "Photo © Rofo",
    uploadedAt: row.uploaded_at,
    publishedAt: row.published_at || "",
    publicPath: findSubject(row.subject_type, row.subject_id)?.publicPath || "",
  };
}

export function publicHeroPhoto(row) {
  if (!row) return null;
  return {
    imageUrl: row.public_url,
    width: Number(row.width || 0),
    height: Number(row.height || 0),
    caption: row.caption,
    altText: row.alt_text,
    attribution: row.attribution || "Photo © Rofo",
  };
}

export async function archiveActiveHero(db, { subjectType, subjectId, replacementId, now }) {
  await db.prepare(`
    update field_photos
    set status = 'archived',
        archived_at = ?,
        superseded_by = ?,
        updated_at = ?
    where subject_type = ?
      and subject_id = ?
      and image_role = 'hero'
      and status = 'published'
      and id != ?
  `).bind(now, replacementId, now, subjectType, subjectId, replacementId).run();
}

export function storageKeyFor({ id, subjectType, subjectId, variant, extension = "webp" }) {
  const safeSubject = clean(subjectId, 220).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `field-photos/${subjectType}/${safeSubject}/${id}-${variant}.${extension}`;
}

export function photoAssetUrl(id, variant = "public") {
  const params = new URLSearchParams({ variant });
  return `/api/field-photos/assets/${encodeURIComponent(id)}?${params.toString()}`;
}

export function photographerFor(env) {
  return clean(env.FIELD_PHOTOS_DEFAULT_PHOTOGRAPHER || env.ADMIN_DISPLAY_NAME || "Alan Bernier", 120);
}

export async function getPhotoById(db, id) {
  return db.prepare("select * from field_photos where id = ?").bind(id).first();
}
