module.exports = Object.freeze({
  schemaVersion: "recommendation-activation-registry:v1",
  flows: Object.freeze({
    "san-diego:industrial_flex:bounded": Object.freeze({
      activationKey: "san-diego:industrial_flex:bounded",
      marketId: "san-diego",
      propertyType: "industrial_flex",
      propertyTypeAliases: Object.freeze(["industrial-flex", "industrial_flex"]),
      cohort: "bounded",
      certificationId: "san-diego-industrial-flex-v1",
      certificationStatus: "certified_for_bounded_real_user_cohort",
      entryContextIds: Object.freeze(["miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa", "sorrento-valley"]),
    }),
  }),
});
