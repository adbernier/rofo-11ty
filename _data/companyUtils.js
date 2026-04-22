function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getBuildingsForCompany(buildings, companySlug) {
  const slug = normalize(companySlug);
  return (buildings || []).filter(
    (b) => normalize(b.featured_company_slug) === slug
  );
}

function getBuildingsForCompanyInCity(buildings, companySlug, cityStateSlug) {
  const slug = normalize(companySlug);
  const citySlug = normalize(cityStateSlug);

  return (buildings || []).filter(
    (b) =>
      normalize(b.featured_company_slug) === slug &&
      normalize(b.city_state_slug) === citySlug
  );
}

module.exports = {
  getBuildingsForCompany,
  getBuildingsForCompanyInCity
};