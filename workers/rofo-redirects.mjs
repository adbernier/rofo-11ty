const STATE_ABBREVIATIONS = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
  ]);

  function redirectTo(url, pathname) {
    const target = new URL(url);
    target.hostname = "www.rofo.com";
    target.pathname = pathname;
    target.search = url.search;
    return Response.redirect(target.toString(), 301);
  }

  export default {
    async fetch(request) {
      const url = new URL(request.url);
      const path = url.pathname;

      // Skip static assets like /assets/app.css, /images/logo.png, and /sitemap.xml.
      if (
        path.startsWith("/assets") ||
        path.startsWith("/images") ||
        path.startsWith("/js") ||
        path.startsWith("/css") ||
        path === "/favicon.ico" ||
        path === "/robots.txt" ||
        path === "/sitemap.xml"
      ) {
        return fetch(request);
      }

      // Handle mobile subdomain (m.rofo.com) in one hop, like /AL/Cullman.
      if (url.hostname.startsWith("m.rofo.com")) {
        const mobileLegacyCityMatch = path.match(/^\/([A-Za-z]{2})\/([^\/]+)\/?$/);

        if (mobileLegacyCityMatch) {
          const state = mobileLegacyCityMatch[1].toUpperCase();

          if (STATE_ABBREVIATIONS.has(state)) {
            const city = mobileLegacyCityMatch[2].toLowerCase();
            return redirectTo(url, `/commercial-real-estate/${state}/${city}/`);
          }
        }

        // Handle mobile subdomain (m.rofo.com) building URL like /building/CA/Oakland/example.html.
        const mobileBuildingMatch = path.match(
          /^\/building\/([A-Za-z]{2})\/([^\/]+)\/.+$/
        );

        if (mobileBuildingMatch) {
          const state = mobileBuildingMatch[1].toUpperCase();

          if (STATE_ABBREVIATIONS.has(state)) {
            const city = mobileBuildingMatch[2].toLowerCase();
            return redirectTo(url, `/commercial-real-estate/${state}/${city}/`);
          }
        }

        // Handle mobile subdomain (m.rofo.com) current paths like /commercial-real-estate/ca/Emeryville/office-space/.
        const mobileCommercialRealEstateMatch = path.match(
          /^\/commercial-real-estate\/([A-Za-z]{2})\/([^\/]+)(\/.*)?$/
        );

        if (mobileCommercialRealEstateMatch) {
          const state = mobileCommercialRealEstateMatch[1].toUpperCase();

          if (STATE_ABBREVIATIONS.has(state)) {
            const city = mobileCommercialRealEstateMatch[2].toLowerCase();
            const rest = mobileCommercialRealEstateMatch[3] || "/";
            return redirectTo(url, `/commercial-real-estate/${state}/${city}${rest}`);
          }
        }

        return redirectTo(url, path);
      }

      // Normalize lowercase state paths like /commercial-real-estate/ny/new-york/.
      const lowercaseStateMatch = path.match(
        /^\/commercial-real-estate\/([a-z]{2})(\/.*)?$/
      );

      if (lowercaseStateMatch) {
        const state = lowercaseStateMatch[1].toUpperCase();

        if (STATE_ABBREVIATIONS.has(state)) {
          const rest = lowercaseStateMatch[2] || "/";
          return redirectTo(url, `/commercial-real-estate/${state}${rest}`);
        }
      }

      // Legacy city paths like /NV/Fallon
      const legacyMatch = path.match(/^\/([A-Z]{2})\/([^\/]+)\/?$/);

      if (legacyMatch && STATE_ABBREVIATIONS.has(legacyMatch[1])) {
        const state = legacyMatch[1];
        const city = legacyMatch[2].toLowerCase();

        return redirectTo(url, `/commercial-real-estate/${state}/${city}/`);
      }

      // Mixed-case new city paths like /commercial-real-estate/NV/Fallon
      const newMatch = path.match(
        /^\/commercial-real-estate\/([A-Z]{2})\/([^\/]+)\/?$/
      );

      if (newMatch && STATE_ABBREVIATIONS.has(newMatch[1])) {
        const state = newMatch[1];
        const city = newMatch[2].toLowerCase();
        const canonicalPath = `/commercial-real-estate/${state}/${city}/`;

        if (path !== canonicalPath) {
          return redirectTo(url, canonicalPath);
        }
      }

      // Old city buildings index like /commercial-real-estate/OH/amelia/buildings/
      const buildingsIndexMatch = path.match(
        /^\/commercial-real-estate\/([A-Z]{2})\/([^\/]+)\/buildings\/?$/
      );

      if (buildingsIndexMatch && STATE_ABBREVIATIONS.has(buildingsIndexMatch[1])) {
        const state = buildingsIndexMatch[1];
        const city = buildingsIndexMatch[2].toLowerCase();

        return redirectTo(url, `/commercial-real-estate/${state}/${city}/`);
      }

      // Old listing URL like /listings/OR/Portland/50-SW-2nd-Ave-52772.html
      const listingMatch = path.match(/^\/listings\/([A-Z]{2})\/([^\/]+)\/.+$/);

      if (listingMatch && STATE_ABBREVIATIONS.has(listingMatch[1])) {
        const state = listingMatch[1];
        const city = listingMatch[2].toLowerCase();

        return redirectTo(url, `/commercial-real-estate/${state}/${city}/`);
      }

      // Old listing URL like /commercial-real-estate/listings/OR/Beaverton/example.html
      const commercialListingMatch = path.match(
        /^\/commercial-real-estate\/listings\/([A-Z]{2})\/([^\/]+)\/.+$/
      );

      if (commercialListingMatch && STATE_ABBREVIATIONS.has(commercialListingMatch[1])) {
        const state = commercialListingMatch[1];
        const city = commercialListingMatch[2].toLowerCase();

        return redirectTo(url, `/commercial-real-estate/${state}/${city}/`);
      }

      // Legacy user page like /commercial-real-estate/user/sean/1
      if (path.match(/^\/commercial-real-estate\/user\/.+$/)) {
        return new Response("Gone", { status: 410 });
      }

      // Legacy company detail page like /commercial-real-estate/company/test/123
      if (path.match(/^\/commercial-real-estate\/company\/[^\/]+\/[^\/]+\/?$/)) {
        return new Response("Gone", { status: 410 });
      }

      // Fix building .html redirect (single hop) like /commercial-real-estate/building/AL/Atmore/1-Jack-Springs-Rd-302810.html
      const buildingHtmlMatch = path.match(
        /^\/commercial-real-estate\/building\/([A-Z]{2})\/([^\/]+)\/[^\/]+\.html$/
      );

      if (buildingHtmlMatch && STATE_ABBREVIATIONS.has(buildingHtmlMatch[1])) {
        const state = buildingHtmlMatch[1];
        const city = buildingHtmlMatch[2].toLowerCase();

        return redirectTo(url, `/commercial-real-estate/${state}/${city}/`);
      }

      return fetch(request);
    }
  };
