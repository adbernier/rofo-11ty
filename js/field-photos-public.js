(function () {
  const slots = Array.from(document.querySelectorAll("[data-photo-subject-type][data-photo-subject-id]"));
  if (!slots.length) return;

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

  slots.forEach((slot) => {
    const params = new URLSearchParams({
      subjectType: slot.dataset.photoSubjectType,
      subjectId: slot.dataset.photoSubjectId,
    });
    fetch(`/api/field-photos/hero?${params.toString()}`, { credentials: "omit" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data && data.ok && data.photo) renderPhoto(slot, data.photo);
      })
      .catch(() => {});
  });
}());
