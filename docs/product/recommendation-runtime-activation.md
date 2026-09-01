# Recommendation Intelligence runtime activation

Recommendation code, certification, and runtime availability are separate controls.

- Git deployment supplies reviewed evidence, resolvers, and eligibility code.
- The repository registry in `_data/recommendationActivationRegistry.js` defines the market/property/cohort combinations that an operator is allowed to activate.
- D1 table `recommendation_runtime_activations` stores current operational state. A record is accepted only when its key, market, property type, cohort, and certification ID exactly match the repository registry.

San Diego Industrial/Flex is the first runtime-controlled flow. Its key is `san-diego:industrial_flex:bounded`. The reviewed entry-context universe and source allowlist remain separate eligibility checks.

## Failure and precedence contract

When `RECOMMENDATION_ACTIVATIONS_DB`, `LOCATION_BRIEFS_DB`, or `LEADS_DB` is bound, D1 is authoritative. A missing, malformed, unknown, disabled, or unreadable activation record denies access. The legacy San Diego environment flag is ignored in that state.

When no runtime database binding exists, the legacy San Diego environment flag remains a compatibility fallback for local fixtures and older deployments. It is not the production operating control after migration.

`LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED` remains a stable deployment-level master kill switch. It must be ON for public controlled entry, but individual market rollout and rollback use D1. `LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED` remains independent and is not enabled by runtime activation.

## Operator commands

Status is read-only. The environment must be visible in output:

```sh
npm run activation:status -- --environment production
```

Production mutation requires both an explicit target and confirmation:

```sh
npm run activation:set -- san-diego industrial-flex on --environment production --confirm-production --actor operator
npm run activation:set -- san-diego industrial-flex off --environment production --confirm-production --actor operator
```

Each mutation prints environment, market, property type, cohort, certification state, previous state, new state, update time, and actor. Unknown or uncertified combinations are rejected before any database command runs.

No Pages build or deployment is involved in these state changes. Existing Briefs remain readable when a flow is OFF; only new controlled entry and creation are denied.
