(function () {
  const slots = Array.from(document.querySelectorAll("[data-photo-subject-type][data-photo-subject-id]"));
  const buildingImages = () => Array.from(document.querySelectorAll("img[data-building-photo-subject-id]"));
  if (!slots.length && !buildingImages().length) return;
  const photoRequests = new Map();
  const diagnostics = [];

  function recordDiagnostic(status, detail) {
    const entry = { status, detail: detail || {}, timestamp: new Date().toISOString() };
    diagnostics.push(entry);
    window.ROFO_FIELD_PHOTO_DIAGNOSTICS = diagnostics;
    if (window.ROFO_FIELD_PHOTO_DEBUG && window.console) {
      console.info("[Field Photos]", status, detail || {});
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function renderPhoto(slot, photo) {
    if (!photo || !photo.imageUrl) {
      recordDiagnostic("slot_no_photo", {
        subjectType: slot.dataset.photoSubjectType,
        subjectId: slot.dataset.photoSubjectId,
      });
      return;
    }
    const width = Number(photo.width || 0);
    const height = Number(photo.height || 0);
    slot.innerHTML = `
      <figure class="editorial-photo__figure">
        <img
          src="${escapeHtml(photo.imageUrl)}"
          alt="${escapeHtml(photo.altText || photo.caption || "Rofo field photo")}"
          ${width ? `width="${width}"` : ""}
          ${height ? `height="${height}"` : ""}
          loading="lazy"
          decoding="async"
        >
        <figcaption>
          ${photo.caption ? `<span>${escapeHtml(photo.caption)}</span>` : ""}
          <small>${escapeHtml(photo.attribution || "Photo © Rofo")}</small>
        </figcaption>
      </figure>
    `;
    slot.hidden = false;
    recordDiagnostic("slot_rendered", {
      subjectType: slot.dataset.photoSubjectType,
      subjectId: slot.dataset.photoSubjectId,
    });
  }

  function fetchHeroPhoto(subjectType, subjectId) {
    if (!subjectType || !subjectId) {
      recordDiagnostic("missing_subject", { subjectType, subjectId });
      return Promise.resolve(null);
    }
    const key = `${subjectType}:${subjectId}`;
    if (!photoRequests.has(key)) {
      const params = new URLSearchParams({ subjectType, subjectId });
      recordDiagnostic("request_started", { subjectType, subjectId });
      photoRequests.set(key, fetch(`/api/field-photos/hero?${params.toString()}`, { credentials: "omit" })
        .then((response) => {
          if (!response.ok) {
            recordDiagnostic("endpoint_error", { subjectType, subjectId, status: response.status });
            return null;
          }
          return response.json();
        })
        .then((data) => {
          const photo = data && data.ok ? data.photo : null;
          recordDiagnostic(photo && photo.imageUrl ? "photo_returned" : "endpoint_no_photo", { subjectType, subjectId });
          return photo;
        })
        .catch((error) => {
          recordDiagnostic("endpoint_exception", { subjectType, subjectId, message: error && error.message });
          return null;
        }));
    }
    return photoRequests.get(key);
  }

  function renderBuildingImage(image, photo) {
    if (!image) {
      recordDiagnostic("image_target_missing");
      return;
    }
    if (!photo || !photo.imageUrl) {
      recordDiagnostic("image_no_photo", { subjectId: image.dataset.buildingPhotoSubjectId });
      return;
    }
    image.src = photo.imageUrl;
    image.removeAttribute("srcset");
    if (photo.altText) image.alt = photo.altText;
    image.dataset.buildingPhotoLoaded = "true";
    recordDiagnostic("image_replaced", { subjectId: image.dataset.buildingPhotoSubjectId });
  }

  function findBuildingImage(subjectId) {
    return buildingImages().find((image) => image.dataset.buildingPhotoSubjectId === subjectId) || null;
  }

  function hydrateBuildingImage(image) {
    if (!image || image.dataset.buildingPhotoHydrating === "true" || image.dataset.buildingPhotoLoaded === "true") return;
    image.dataset.buildingPhotoHydrating = "true";
    fetchHeroPhoto("building", image.dataset.buildingPhotoSubjectId)
      .then((photo) => renderBuildingImage(image, photo))
      .finally(() => {
        image.dataset.buildingPhotoHydrating = "false";
      });
  }

  function scanBuildingImages() {
    buildingImages().forEach(hydrateBuildingImage);
  }

  slots.forEach((slot) => {
    const subjectType = slot.dataset.photoSubjectType;
    const subjectId = slot.dataset.photoSubjectId;
    fetchHeroPhoto(subjectType, subjectId)
      .then((photo) => {
        if (subjectType === "building" && slot.dataset.photoPlacement === "building-profile") {
          const targetImage = findBuildingImage(subjectId);
          if (targetImage) {
            renderBuildingImage(targetImage, photo);
            slot.hidden = true;
            slot.innerHTML = "";
            recordDiagnostic("building_slot_consolidated", { subjectId });
            return;
          }
        }
        renderPhoto(slot, photo);
      });
  });

  scanBuildingImages();
  if (window.MutationObserver) {
    const observer = new MutationObserver(scanBuildingImages);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}());
