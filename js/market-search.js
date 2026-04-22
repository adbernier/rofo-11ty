let rofoMarkets = null;
let rofoMarketsPromise = null;

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m];
  });
}

async function loadRofoMarkets() {
  if (rofoMarkets) return rofoMarkets;

  if (!rofoMarketsPromise) {
    rofoMarketsPromise = fetch("/data/markets.json", { cache: "force-cache" })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load /data/markets.json: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        rofoMarkets = data.map(item => ({
          city: item.l.split(",")[0]?.trim() || "",
          state: item.l.split(",")[1]?.trim() || "",
          label: item.l,
          path: item.p
        }));
        return rofoMarkets;
      })
      .catch(error => {
        console.error("Market search data failed to load:", error);
        rofoMarketsPromise = null;
        return [];
      });
  }

  return rofoMarketsPromise;
}

function renderSearchResults(resultsBox, matches) {
  if (!matches.length) {
    resultsBox.innerHTML = "";
    resultsBox.classList.remove("is-open");
    return;
  }

  resultsBox.innerHTML = matches.map(item => `
    <a class="search-results__item" href="${item.path}">
      ${escapeHtml(item.label)}
      <span class="search-results__meta">Go to market page</span>
    </a>
  `).join("");

  resultsBox.classList.add("is-open");
}

function bindMarketSearch(inputId, resultsId) {
  const input = document.getElementById(inputId);
  const resultsBox = document.getElementById(resultsId);

  if (!input || !resultsBox) return;

  async function runSearch(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      renderSearchResults(resultsBox, []);
      return;
    }

    const markets = await loadRofoMarkets();

    const matches = markets
      .filter(item =>
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q)
      )
      .slice(0, 8);

    renderSearchResults(resultsBox, matches);
  }

  input.addEventListener("input", async function(e) {
    await runSearch(e.target.value);
  });

  input.addEventListener("focus", async function(e) {
    await loadRofoMarkets();

    if (e.target.value.trim()) {
      await runSearch(e.target.value);
    }
  });

  input.addEventListener("keydown", async function(e) {
    if (e.key === "Enter") {
      const q = input.value.trim().toLowerCase();
      if (!q) return;

      const markets = await loadRofoMarkets();

      const firstMatch = markets.find(item =>
        item.city.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q)
      );

      if (firstMatch) {
        window.location.href = firstMatch.path;
      }
    }
  });

  document.addEventListener("click", function(e) {
    if (!e.target.closest("[data-market-search]")) {
      resultsBox.classList.remove("is-open");
    }
  });
}

bindMarketSearch("headerMarketSearch", "headerMarketResults");
bindMarketSearch("heroMarketSearch", "heroMarketResults");