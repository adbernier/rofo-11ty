# Rofo Universal Space-Type Intelligence

Status: reviewed foundation (`universal-space-type-intelligence:v1`). Customer presentation is intentionally not wired in Sprint 6.

## Product model

Rofo uses three distinct capabilities:

1. Universal Space-Type Intelligence describes the durable questions, decision dimensions, requirement implications, tradeoffs, and investigation topics for a type of commercial space. It applies in every market.
2. Market / Location Intelligence adds reviewed local geography, access, commercial-environment, and representative-content evidence. Its presence does not by itself authorize ranking.
3. Recommendation Intelligence combines a canonical Requirement with reviewed local evidence through a calibrated, certified resolver that can compare locations and abstain.

The canonical machine-readable contract is `_data/universalSpaceTypeIntelligence.js`. `lib/intelligence/universal-space-type-intelligence.js` supplies a deterministic, non-customer-facing projection for validation and future Location Brief use.

Universal dimensions are questions and considerations, not local facts. They never assert local demand, access performance, rents, availability, zoning, building capability, or rankings.

## Repository audit and reuse

The foundation extracts universal concepts from the canonical Requirement and reviewed SF Office, Retail, Industrial, and Flex foundations. It does not copy SF geography or calibrated fit evidence.

- Universal: use patterns, employee/customer/operational access considerations, property capability topics, decision tradeoffs, verification boundaries, and investigation topics.
- Market-specific: district/submarket facts, access relationships, commercial character, representative environments, and local comparisons.
- Recommendation-specific: decision-universe eligibility, weights/composition, calibrated ranking, explanations, sensitivity behavior, abstention, certification, and production routing.

Business and use patterns reference existing canonical business identities and activity IDs. Industrial and Flex share the public `industrial_flex` property context but remain separate intelligence foundations.

## Requirement mapping and gaps

Mappings are explicit references to existing Requirement dimensions or activities. An activated mapping means Rofo understands that a consideration matters; it does not mean Rofo knows the local answer.

Current gaps reserved for Requirement Integration include:

- Office: private-office/collaboration mix, meeting-room needs, growth horizon, and floorplate preference.
- Retail: frontage/signage, customer entry, adjacency priority, direct customer-parking needs, and detailed food infrastructure.
- Industrial: dock/grade detail, clear height, column spacing, floor loading, yard/trailer detail, and exact utilities.
- Flex: office/production ratio, customer-facing priority, adaptability, and mixed-use loading/power detail.

These gaps do not change the interview in Sprint 6.

## Future Location Brief projection

The future contract has five bounded sections: `WHAT_MATTERS`, `UNDERSTOOD_REQUIREMENT`, `INVESTIGATION_TOPICS`, `PROPERTY_CONSIDERATIONS`, and `LOCATION_INTELLIGENCE_BOUNDARY`. The deterministic projector emits only universal considerations and signals. Sprint 7 should decide customer hierarchy, language, and graceful composition with existing Brief sections before wiring it.

## Behavior by market capability

In a non-certified market, Rofo may explain what matters, which supplied requirements activate those considerations, and what needs investigation. It must preserve local unknowns and must not rank or characterize locations.

In a certified market, universal intelligence is a substrate: `Requirement + universal foundation + reviewed market evidence -> certified recommendation resolver`. The local resolver remains authoritative; the universal projection does not score, vote, or reorder geography.

## Medical and specialized uses

Medical remains deferred. Safe universal topics are patient access, parking, accessibility, building systems, specialized improvements, and permitted-use verification. Existing Medical safety and abstention stay authoritative. Building systems, accessibility, code, and use compatibility remain verification topics, not conclusions.

## Provenance

The registry records reviewed Rofo product knowledge, the source Requirement/activity registry versions, and extraction lineage from the four certified SF foundations. Provenance is internal; no anonymous generated prose or local conclusion is promoted as universal knowledge.

## Mission Control and EOS

No Mission Control UI or EOS change is warranted. The four Ready universal foundations are platform capability, not another market workload or strategic-priority mechanism. Repository QA is sufficient evidence until an operator needs a platform-capability view for a real decision.

## Next bounded sprints

Sprint 7 — Location Brief Product Polish: decide and implement the customer-facing hierarchy for universal considerations, understood requirements, investigation topics, property considerations, and the local-intelligence boundary; preserve certified recommendation presentation and graceful non-certified behavior.

Sprint 8 — Requirement Integration: review the explicit gap inventory, add only high-value adaptive signals, preserve the canonical taxonomy, test ambiguity and Industrial-versus-Flex resolution, and avoid turning the interview into exhaustive property programming.
