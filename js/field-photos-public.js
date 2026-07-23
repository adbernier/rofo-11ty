(function () {
  const slots = Array.from(document.querySelectorAll("[data-photo-subject-type][data-photo-subject-id]"));
  const buildingImages = Array.from(document.querySelectorAll("img[data-building-photo-subject-id]"));
  if (!slots.length && !buildingImages.length) return;
  const photoRequests = new Map();

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
    if (!photo || !photo.imageUrl) return;
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
  }

  function fetchHeroPhoto(subjectType, subjectId) {
    const key = `${subjectType}:${subjectId}`;
    if (!photoRequests.has(key)) {
      const params = new URLSearchParams({ subjectType, subjectId });
      photoRequests.set(key, fetch(`/api/field-photos/hero?${params.toString()}`, { credentials: "omit" })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => data && data.ok ? data.photo : null)
        .catch(() => null));
    }
    return photoRequests.get(key);
  }

  function renderBuildingImage(image, photo) {
    if (!photo || !photo.imageUrl) return;
    image.src = photo.imageUrl;
    if (photo.altText) image.alt = photo.altText;
    image.dataset.buildingPhotoLoaded = "true";
  }

  slots.forEach((slot) => {
    fetchHeroPhoto(slot.dataset.photoSubjectType, slot.dataset.photoSubjectId)
      .then((photo) => renderPhoto(slot, photo));
  });

  buildingImages.forEach((image) => {
    fetchHeroPhoto("building", image.dataset.buildingPhotoSubjectId)
      .then((photo) => renderBuildingImage(image, photo));
  });
}());
