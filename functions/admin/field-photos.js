import { escapeHtml } from "../api/leads/_shared.js";
import { FIELD_PHOTO_IMAGE_TYPES } from "../api/field-photos/_shared.js";

function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function tokenParam(token) {
  return `token=${encodeURIComponent(token)}`;
}

function renderPage({ token, env }) {
  const imageTypesJson = JSON.stringify(FIELD_PHOTO_IMAGE_TYPES);
  const storageConfigured = Boolean((env.FIELD_PHOTOS_DB || env.LEADS_DB) && env.ROFO_PHOTOS);
  const defaultPhotographer = escapeHtml(env.FIELD_PHOTOS_DEFAULT_PHOTOGRAPHER || env.ADMIN_DISPLAY_NAME || "Alan Bernier");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Field Photos | Rofo Admin</title>
  <style>
    :root { color-scheme: light; --ink: #172033; --muted: #627084; --line: #dbe3ef; --bg: #f5f7fb; --card: #fff; --blue: #2457d6; --good: #0f7a4f; --bad: #b42318; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--bg); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1080px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 48px; }
    a { color: var(--blue); font-weight: 800; text-decoration: none; }
    .back-link { display: inline-flex; margin-bottom: 16px; }
    .admin-nav { display: flex; gap: 8px; flex-wrap: wrap; margin: 18px 0 22px; }
    .button-link, button { border: 1px solid var(--line); border-radius: 10px; background: #fff; color: var(--ink); font: inherit; font-weight: 800; min-height: 44px; padding: 11px 14px; cursor: pointer; }
    .button-link--active, .primary { border-color: var(--blue); background: var(--blue); color: #fff; }
    button:disabled { opacity: .55; cursor: wait; }
    h1 { margin: 0; font-size: clamp(2rem, 7vw, 3.5rem); line-height: 1; letter-spacing: 0; }
    h2 { margin: 0 0 10px; font-size: 1.25rem; }
    p { color: var(--muted); line-height: 1.5; }
    .hero { display: grid; gap: 12px; margin-bottom: 18px; }
    .panel { border: 1px solid var(--line); border-radius: 14px; background: var(--card); padding: 18px; box-shadow: 0 14px 40px rgba(15, 23, 42, .05); }
    .grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr); gap: 18px; align-items: start; }
    label, legend { display: block; margin: 0 0 7px; font-weight: 900; }
    fieldset { border: 0; padding: 0; margin: 0 0 18px; }
    input, select, textarea { width: 100%; min-height: 48px; border: 1px solid var(--line); border-radius: 10px; padding: 12px; font: inherit; background: #fff; }
    textarea { min-height: 92px; resize: vertical; }
    .segmented { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .segmented label, .radio-row label, .check-row label { margin: 0; }
    .segmented input, .radio-row input, .check-row input { width: auto; min-height: 0; }
    .choice { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; border: 1px solid var(--line); border-radius: 10px; background: #fff; font-weight: 900; }
    .choice:has(input:checked) { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(36,87,214,.12); }
    .results { display: grid; gap: 8px; margin-top: 8px; }
    .result { width: 100%; text-align: left; border: 1px solid var(--line); border-radius: 10px; background: #fff; padding: 12px; }
    .result strong, .photo-card strong { display: block; color: var(--ink); }
    .result span, .small { display: block; color: var(--muted); font-size: .9rem; line-height: 1.4; }
    .status { min-height: 24px; font-weight: 800; color: var(--muted); }
    .status.is-error { color: var(--bad); }
    .status.is-ok { color: var(--good); }
    .preview { display: grid; gap: 12px; }
    .preview img, .photo-card img { width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: #eef2f7; }
    .preview-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .meta-box { border: 1px solid var(--line); border-radius: 10px; padding: 10px; }
    .meta-box span { display: block; color: var(--muted); font-size: .8rem; font-weight: 800; text-transform: uppercase; }
    .meta-box strong { display: block; margin-top: 3px; }
    .rights { border: 1px solid #cde7d8; border-radius: 10px; background: #f0fbf5; padding: 12px; }
    .rights strong { display: block; color: var(--good); }
    .photo-list { display: grid; gap: 12px; }
    .photo-card { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 12px; align-items: start; border: 1px solid var(--line); border-radius: 12px; padding: 12px; background: #fff; }
    .photo-card img { aspect-ratio: 4 / 3; object-fit: cover; }
    .photo-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    .photo-actions button, .photo-actions a { min-height: 38px; padding: 8px 10px; border-radius: 8px; }
    .muted { color: var(--muted); }
    .hidden { display: none !important; }
    @media (max-width: 780px) {
      main { width: min(100% - 20px, 680px); padding-top: 18px; }
      .grid { grid-template-columns: 1fr; }
      .panel { padding: 15px; }
      .segmented { grid-template-columns: 1fr; }
      .preview-meta { grid-template-columns: 1fr; }
      .photo-card { grid-template-columns: 88px minmax(0, 1fr); }
    }
  </style>
</head>
<body>
  <main>
    <a class="back-link" href="/admin/operations?${tokenParam(token)}">Back to Operations</a>
    <nav class="admin-nav" aria-label="Admin navigation">
      <a class="button-link" href="/admin/operations?${tokenParam(token)}">Operations</a>
      <a class="button-link button-link--active" href="/admin/field-photos?${tokenParam(token)}">Field Photos</a>
      <a class="button-link" href="/admin/publisher?${tokenParam(token)}">Publisher</a>
      <a class="button-link" href="/admin/leads?${tokenParam(token)}">Leads</a>
    </nav>

    <header class="hero">
      <h1>Field Photos</h1>
      <p>Upload Rofo-owned city, district, and building photos from a phone. The browser optimizes the image before upload; R2 stores the files and D1 stores the publishing record.</p>
    </header>

    ${storageConfigured ? "" : `<section class="panel"><h2>Storage setup required</h2><p>Configure a D1 binding through <code>FIELD_PHOTOS_DB</code> or <code>LEADS_DB</code>, plus the <code>ROFO_PHOTOS</code> R2 binding before the first upload.</p></section>`}

    <div class="grid">
      <section class="panel" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Upload a Field Photo</h2>
        <form id="field-photo-form">
          <input type="hidden" name="token" value="${escapeHtml(token)}">
          <input type="hidden" id="selected-subject-id" name="subjectId">

          <fieldset>
            <legend>1. Subject type</legend>
            <div class="segmented">
              <label class="choice"><input type="radio" name="subjectType" value="city"> City</label>
              <label class="choice"><input type="radio" name="subjectType" value="district"> District</label>
              <label class="choice"><input type="radio" name="subjectType" value="building" checked> Building</label>
            </div>
          </fieldset>

          <div>
            <label for="subject-search">2. Subject search</label>
            <input id="subject-search" type="search" autocomplete="off" placeholder="Search city, district, or building">
            <div id="subject-results" class="results" role="listbox" aria-label="Subject search results"></div>
          </div>

          <div style="margin-top: 18px;">
            <label for="photo-input">3. Photo</label>
            <input id="photo-input" name="photo" type="file" accept="image/*">
            <p class="small">The original phone image stays out of the repository. Field Mode strips EXIF by drawing the photo through canvas before upload.</p>
          </div>

          <div style="margin-top: 18px;">
            <label for="image-type">4. Image type</label>
            <select id="image-type" name="imageType"></select>
          </div>

          <div style="margin-top: 18px;">
            <label for="caption">5. Caption</label>
            <textarea id="caption" name="caption"></textarea>
          </div>

          <div style="margin-top: 18px;">
            <label for="alt-text">6. Alt text</label>
            <textarea id="alt-text" name="altText"></textarea>
          </div>

          <fieldset style="margin-top: 18px;">
            <legend>7. Publish status</legend>
            <div class="segmented">
              <label class="choice"><input type="radio" name="status" value="published" checked> Publish now</label>
              <label class="choice"><input type="radio" name="status" value="draft"> Save as draft</label>
            </div>
          </fieldset>

          <div class="rights">
            <strong>Rofo-owned photo</strong>
            <span>Only upload photos taken for Rofo or photos Rofo has permission to publish.</span>
            <span class="small">Photographer default: ${defaultPhotographer}. Public credit: Photo © Rofo.</span>
          </div>

          <p id="form-status" class="status" role="status" aria-live="polite"></p>
          <button id="submit-button" class="primary" type="submit" disabled>Upload and publish</button>
        </form>
      </section>

      <aside class="panel" aria-labelledby="preview-heading">
        <h2 id="preview-heading">Preview</h2>
        <div id="preview-empty" class="muted">Choose a subject and photo to review the optimized image.</div>
        <div id="preview" class="preview hidden">
          <img id="preview-image" alt="">
          <div class="preview-meta">
            <div class="meta-box"><span>Subject</span><strong id="preview-subject"></strong></div>
            <div class="meta-box"><span>Output</span><strong id="preview-output"></strong></div>
            <div class="meta-box"><span>File size</span><strong id="preview-size"></strong></div>
            <div class="meta-box"><span>Credit</span><strong>Photo © Rofo</strong></div>
          </div>
          <p id="preview-caption" class="small"></p>
        </div>
      </aside>
    </div>

    <section class="panel" style="margin-top: 18px;" aria-labelledby="recent-heading">
      <h2 id="recent-heading">Recent Photos</h2>
      <p id="coverage-summary" class="small"></p>
      <div id="recent-list" class="photo-list">
        <p class="muted">No Rofo field photos have been uploaded yet.</p>
      </div>
    </section>
  </main>

  <script>
    const TOKEN = ${JSON.stringify(token)};
    const IMAGE_TYPES = ${imageTypesJson};
    const DEFAULT_QUALITY = 0.82;
    const PUBLIC_MAX_EDGE = 1600;
    const THUMB_MAX_EDGE = 480;
    const state = { subject: null, publicBlob: null, thumbBlob: null, width: 0, height: 0, uploading: false };

    const form = document.getElementById("field-photo-form");
    const searchInput = document.getElementById("subject-search");
    const resultsEl = document.getElementById("subject-results");
    const imageTypeEl = document.getElementById("image-type");
    const photoInput = document.getElementById("photo-input");
    const captionEl = document.getElementById("caption");
    const altTextEl = document.getElementById("alt-text");
    const statusEl = document.getElementById("form-status");
    const submitButton = document.getElementById("submit-button");
    const preview = document.getElementById("preview");
    const previewEmpty = document.getElementById("preview-empty");
    const previewImage = document.getElementById("preview-image");
    const previewSubject = document.getElementById("preview-subject");
    const previewOutput = document.getElementById("preview-output");
    const previewSize = document.getElementById("preview-size");
    const previewCaption = document.getElementById("preview-caption");
    const recentList = document.getElementById("recent-list");
    const coverageSummary = document.getElementById("coverage-summary");

    function selectedSubjectType() {
      return new FormData(form).get("subjectType") || "building";
    }

    function labelize(value) {
      return String(value || "").replace(/_/g, " ").replace(/\\b\\w/g, (char) => char.toUpperCase());
    }

    function setStatus(message, type = "") {
      statusEl.textContent = message || "";
      statusEl.className = "status" + (type ? " is-" + type : "");
    }

    function updateImageTypes() {
      const type = selectedSubjectType();
      imageTypeEl.innerHTML = (IMAGE_TYPES[type] || []).map((item) => '<option value="' + item + '">' + labelize(item) + '</option>').join("");
      updateDefaults();
    }

    function defaultCaption(subject) {
      if (!subject) return "";
      if (subject.subjectType === "city") return subject.name + " commercial environment.";
      if (subject.subjectType === "district") return "Streetscape in " + subject.city + "'s " + subject.name + " district.";
      const district = subject.districtName ? subject.city + "'s " + subject.districtName + " district" : subject.city + ", " + subject.state;
      return "Exterior of " + subject.name + " in " + district + ".";
    }

    function defaultAlt(subject) {
      if (!subject) return "";
      if (subject.subjectType === "city") return subject.name + ", " + subject.state + " commercial environment";
      if (subject.subjectType === "district") return subject.name + " commercial district in " + subject.city + ", " + subject.state;
      return "Commercial building exterior at " + subject.name + " in " + subject.city + ", " + subject.state;
    }

    function updateDefaults() {
      if (!state.subject) return;
      if (!captionEl.value.trim()) captionEl.value = defaultCaption(state.subject);
      if (!altTextEl.value.trim()) altTextEl.value = defaultAlt(state.subject);
      renderPreview();
    }

    async function searchSubjects() {
      const q = searchInput.value.trim();
      if (q.length < 2) {
        resultsEl.innerHTML = "";
        return;
      }
      const params = new URLSearchParams({ token: TOKEN, subjectType: selectedSubjectType(), q });
      const response = await fetch("/api/field-photos/search?" + params.toString());
      const data = await response.json();
      resultsEl.innerHTML = (data.subjects || []).map((subject) => {
        const lines = String(subject.searchLabel || subject.name).split("\\n");
        return '<button class="result" type="button" data-subject-id="' + subject.id + '">' +
          '<strong>' + escapeHtml(lines[0]) + '</strong><span>' + escapeHtml(lines.slice(1).join(" ")) + '</span>' +
          '</button>';
      }).join("") || '<p class="small">No matching subjects.</p>';
      resultsEl.querySelectorAll("button[data-subject-id]").forEach((button) => {
        button.addEventListener("click", () => {
          state.subject = (data.subjects || []).find((subject) => subject.id === button.dataset.subjectId);
          document.getElementById("selected-subject-id").value = state.subject.id;
          searchInput.value = state.subject.name;
          resultsEl.innerHTML = "";
          captionEl.value = "";
          altTextEl.value = "";
          updateDefaults();
          updateSubmitState();
        });
      });
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }

    function fileSizeLabel(bytes) {
      if (!bytes) return "0 KB";
      return bytes > 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + " MB" : Math.round(bytes / 1024) + " KB";
    }

    function canvasToBlob(canvas, type, quality) {
      return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    }

    async function processImage(file, maxEdge) {
      const url = URL.createObjectURL(file);
      try {
        const image = new Image();
        image.decoding = "async";
        image.src = url;
        await image.decode();
        const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.drawImage(image, 0, 0, width, height);
        let type = "image/webp";
        let blob = await canvasToBlob(canvas, type, DEFAULT_QUALITY);
        if (!blob) {
          type = "image/jpeg";
          blob = await canvasToBlob(canvas, type, DEFAULT_QUALITY);
        }
        if (!blob) throw new Error("Browser could not process this image.");
        return { blob, width, height, type };
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    async function handlePhotoChange() {
      const file = photoInput.files && photoInput.files[0];
      state.publicBlob = null;
      state.thumbBlob = null;
      if (!file) {
        renderPreview();
        updateSubmitState();
        return;
      }
      setStatus("Optimizing image...");
      try {
        const publicImage = await processImage(file, PUBLIC_MAX_EDGE);
        const thumb = await processImage(file, THUMB_MAX_EDGE);
        state.publicBlob = publicImage.blob;
        state.thumbBlob = thumb.blob;
        state.width = publicImage.width;
        state.height = publicImage.height;
        setStatus("Image optimized.", "ok");
        renderPreview();
      } catch (error) {
        setStatus(error.message || "Image processing failed.", "error");
      }
      updateSubmitState();
    }

    function renderPreview() {
      if (!state.subject || !state.publicBlob) {
        preview.classList.add("hidden");
        previewEmpty.classList.remove("hidden");
        return;
      }
      preview.classList.remove("hidden");
      previewEmpty.classList.add("hidden");
      previewImage.src = URL.createObjectURL(state.publicBlob);
      previewImage.alt = altTextEl.value || defaultAlt(state.subject);
      previewSubject.textContent = state.subject.name + " · " + labelize(state.subject.subjectType);
      previewOutput.textContent = state.width + " × " + state.height;
      previewSize.textContent = fileSizeLabel(state.publicBlob.size);
      previewCaption.textContent = (captionEl.value || defaultCaption(state.subject)) + " Photo © Rofo";
    }

    function updateSubmitState() {
      submitButton.disabled = state.uploading || !state.subject || !state.publicBlob || !state.thumbBlob;
    }

    async function uploadPhoto(event) {
      event.preventDefault();
      if (state.uploading || !state.subject || !state.publicBlob || !state.thumbBlob) return;
      state.uploading = true;
      updateSubmitState();
      setStatus("Uploading photo...");
      const formData = new FormData(form);
      formData.set("subjectId", state.subject.id);
      formData.set("publicImage", state.publicBlob, "field-photo.webp");
      formData.set("thumbnailImage", state.thumbBlob, "field-photo-thumb.webp");
      formData.set("width", String(state.width));
      formData.set("height", String(state.height));
      try {
        const response = await fetch("/api/field-photos/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Upload failed.");
        setStatus(data.photo.status === "published" ? "Photo uploaded and published." : "Photo saved as draft.", "ok");
        form.reset();
        state.subject = null;
        state.publicBlob = null;
        state.thumbBlob = null;
        updateImageTypes();
        renderPreview();
        loadRecent();
      } catch (error) {
        setStatus(error.message || "Upload failed.", "error");
      } finally {
        state.uploading = false;
        updateSubmitState();
      }
    }

    async function loadRecent() {
      const response = await fetch("/api/field-photos/recent?token=" + encodeURIComponent(TOKEN));
      const data = await response.json();
      if (!data.ok) return;
      const coverage = data.coverage || {};
      coverageSummary.textContent = "Visual coverage: Cities " + (coverage.city || 0) + ", districts " + (coverage.district || 0) + ", buildings " + (coverage.building || 0) + ".";
      const photos = data.photos || [];
      if (!photos.length) {
        recentList.innerHTML = '<p class="muted">No Rofo field photos have been uploaded yet.<br>Take a photo of a city, district, or representative building to begin the visual library.</p>';
        return;
      }
      recentList.innerHTML = photos.map((photo) => '<article class="photo-card">' +
        '<img src="' + photo.thumbnailUrl + '" alt="">' +
        '<div><strong>' + escapeHtml(photo.subjectName) + '</strong>' +
        '<span class="small">' + labelize(photo.subjectType) + ' · ' + escapeHtml(photo.marketId || "") + ' · ' + labelize(photo.imageType) + ' · ' + labelize(photo.status) + '</span>' +
        '<label class="small" for="caption-' + photo.id + '">Caption</label><textarea id="caption-' + photo.id + '">' + escapeHtml(photo.caption) + '</textarea>' +
        '<label class="small" for="alt-' + photo.id + '">Alt text</label><textarea id="alt-' + photo.id + '">' + escapeHtml(photo.altText) + '</textarea>' +
        '<div class="photo-actions">' +
          '<button type="button" data-action="update" data-id="' + photo.id + '">Save text</button>' +
          (photo.status !== "published" ? '<button type="button" data-action="publish" data-id="' + photo.id + '">Publish</button>' : '') +
          (photo.status !== "archived" ? '<button type="button" data-action="archive" data-id="' + photo.id + '">Archive</button>' : '') +
          (photo.publicPath ? '<a class="button-link" href="' + photo.publicPath + '">Public page</a>' : '') +
        '</div></div></article>').join("");
      recentList.querySelectorAll("button[data-action]").forEach((button) => {
        button.addEventListener("click", () => runPhotoAction(button.dataset.id, button.dataset.action));
      });
    }

    async function runPhotoAction(id, action) {
      const payload = { id, action };
      if (action === "update") {
        payload.caption = document.getElementById("caption-" + id).value;
        payload.altText = document.getElementById("alt-" + id).value;
      }
      const response = await fetch("/api/field-photos/action?token=" + encodeURIComponent(TOKEN), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.ok) {
        alert(data.error || "Photo action failed.");
        return;
      }
      loadRecent();
    }

    let searchTimer = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(searchSubjects, 180);
    });
    form.addEventListener("change", (event) => {
      if (event.target.name === "subjectType") {
        state.subject = null;
        document.getElementById("selected-subject-id").value = "";
        captionEl.value = "";
        altTextEl.value = "";
        resultsEl.innerHTML = "";
        searchInput.value = "";
        updateImageTypes();
        updateSubmitState();
      }
    });
    imageTypeEl.addEventListener("change", updateDefaults);
    photoInput.addEventListener("change", handlePhotoChange);
    captionEl.addEventListener("input", renderPreview);
    altTextEl.addEventListener("input", renderPreview);
    form.addEventListener("submit", uploadPhoto);
    updateImageTypes();
    loadRecent();
  </script>
</body>
</html>`;
}

export async function onRequestGet({ request, env }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) return adminResponse("Admin token is not configured.", 500);
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (token !== configuredToken) return adminResponse("Forbidden", 403);
  return adminResponse(renderPage({ token, env }));
}
