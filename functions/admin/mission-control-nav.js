export const MISSION_CONTROL_NAV_ITEMS = [
  { id: "today", label: "Today", path: "/admin/eos" },
  { id: "markets", label: "Markets", path: "/admin/eos", params: { queue: "markets" } },
  { id: "intelligence", label: "Intelligence", path: "/admin/eos", params: { queue: "intelligence" } },
  { id: "publisher", label: "Publisher", path: "/admin/publisher" },
  { id: "compass", label: "Compass", path: "/admin/compass" },
  { id: "field", label: "Field", path: "/admin/field-photos" },
  { id: "leads", label: "Leads", path: "/admin/operations" },
  { id: "archive", label: "Archive", path: "/admin/eos", params: { queue: "archive" } },
];

function fallbackEscapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function missionControlUrl(item, token) {
  const query = new URLSearchParams();
  if (token) query.set("token", token);
  Object.entries(item.params || {}).forEach(([key, value]) => query.set(key, value));
  const queryString = query.toString();
  return queryString ? `${item.path}?${queryString}` : item.path;
}

export function renderMissionControlNav({ token, active = "", escapeHtml = fallbackEscapeHtml } = {}) {
  return `
    <nav class="mission-control-nav" aria-label="Mission Control navigation">
      <div class="mission-control-nav__scroll">
        ${MISSION_CONTROL_NAV_ITEMS.map((item) => `
          <a class="mission-control-nav__link${item.id === active ? " mission-control-nav__link--active" : ""}" href="${escapeHtml(missionControlUrl(item, token))}"${item.id === active ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>
        `).join("")}
      </div>
    </nav>
  `;
}

export function renderMissionControlHeader({ token, active, title, description, escapeHtml = fallbackEscapeHtml } = {}) {
  return `
    <header class="mission-control-header">
      <div class="mission-control-header__copy">
        <span class="mission-control-kicker">Mission Control</span>
        <h1>${escapeHtml(title || "Today")}</h1>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
      </div>
      ${renderMissionControlNav({ token, active, escapeHtml })}
    </header>
  `;
}

export const MISSION_CONTROL_NAV_CSS = `
    .mission-control-header { display: grid; gap: 16px; margin-bottom: 24px; }
    .mission-control-header__copy { display: grid; gap: 7px; max-width: 900px; }
    .mission-control-kicker { color: var(--muted); font-size: 0.72rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
    .mission-control-header h1 { margin: 0; }
    .mission-control-header p { margin: 0; max-width: 860px; }
    .mission-control-nav { margin: 0; }
    .mission-control-nav__scroll { display: flex; flex-wrap: wrap; gap: 8px; }
    .mission-control-nav__link { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 0 12px; border: 1px solid var(--border, #dbe3ef); border-radius: 999px; background: #fff; color: var(--ink, #172033); font-size: 0.88rem; font-weight: 850; text-decoration: none; white-space: nowrap; }
    .mission-control-nav__link--active { border-color: #bfdbfe; background: #eff6ff; color: #1d4ed8; }
    @media (max-width: 640px) {
      .mission-control-nav { margin-left: calc((100vw - 100%) / -2); margin-right: calc((100vw - 100%) / -2); overflow: hidden; }
      .mission-control-nav__scroll { flex-wrap: nowrap; overflow-x: auto; padding: 0 max(12px, calc((100vw - 100%) / 2)) 6px; scrollbar-width: none; }
      .mission-control-nav__scroll::-webkit-scrollbar { display: none; }
      .mission-control-nav__link { min-height: 42px; padding: 0 14px; }
    }
`;
