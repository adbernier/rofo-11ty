const rofoMarkets = window.rofoMarkets || [];

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

  function runSearch(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      renderSearchResults(resultsBox, []);
      return;
    }

    const matches = rofoMarkets
      .filter(item =>
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q)
      )
      .slice(0, 8);

    renderSearchResults(resultsBox, matches);
  }

  input.addEventListener("input", function(e) {
    runSearch(e.target.value);
  });

  input.addEventListener("focus", function(e) {
    if (e.target.value.trim()) {
      runSearch(e.target.value);
    }
  });

  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      const q = input.value.trim().toLowerCase();
      const firstMatch = rofoMarkets.find(item =>
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