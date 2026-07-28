# EOS Portfolio Resolver

The EOS Portfolio Resolver layer converts record-level Publisher opportunities into coherent, reviewable bodies of editorial work.

Publisher remains the source of readiness and constraint discovery. Portfolio Resolvers decide what belongs together. EOS converts resolved portfolios into Campaigns, Initiatives, Missions, and Execution Packets. Mission Control presents those Missions as the executable path.

## Responsibility Model

```text
Publisher
Portfolio Resolver
EOS
Mission Control
Codex or Manual Execution
SER v1 Review
```

- Publisher identifies missing readiness, incomplete Building Briefs, recommendation QA gaps, and other measurable work.
- Portfolio Resolvers group compatible Work Items into the largest safe editorial unit.
- EOS ranks resolved portfolios and turns them into Missions with compatible Execution Packets.
- Mission Control shows Campaign progress and lets the operator commence one bounded Mission.
- Work Items remain hidden by default and visible only in Mission detail.

## Resolver Contract

A resolver returns deterministic portfolio records:

- `portfolioId`
- `portfolioTitle`
- `marketId`
- `marketName`
- `programId`
- `campaignId`
- `districtId`
- `districtName`
- `ecosystem`
- `workItems`
- `workItemCount`
- `completedCount`
- `remainingCount`
- `missionSize`
- `estimatedReviewability`
- `groupingRationale`
- `splitRationale`
- `sourceOverlap`
- `validationPath`
- `confidence`
- `eligibleForExecution`
- `fallbackReason`, when work cannot be safely bundled

Resolvers do not create a second mission system. Executable portfolios map back to the existing EOS Mission queue, and each Mission owns one Execution Packet.

## Building Profile Portfolio Resolver v1

The first production resolver is `building-profile-portfolio-resolver-v1`.

It groups eligible Building Brief work items when they share:

- operational market
- canonical district
- ecosystem or space type
- Building Profile source-data files
- Building Brief validation path
- editorial purpose

The resolver uses active Publisher work items, Commercial Building Intelligence, Representative Building Intelligence, and operational market ownership. It does not infer grouping from weak title matching when canonical district, city, or ecosystem metadata exists.

## Mission Size

Building Profile portfolios follow the Mission Control sizing model:

- Small: 30-60 minutes.
- Standard: 60-120 minutes.
- Large: 2-4 hours and the upper bound for one SER.

The target portfolio size is roughly 8-12 buildings when the district, ecosystem, source files, and validation path are coherent. Smaller portfolios are valid when fewer compatible buildings remain. Larger groups split deterministically at the configured upper bound rather than becoming mega missions.

## Fallback Behavior

A candidate remains ungrouped when:

- it lacks a canonical public building URL
- it does not resolve to canonical building intelligence
- ownership, district, ecosystem, or building identity cannot be determined
- it is a duplicate of another active candidate
- too few compatible candidates remain after splitting

Ungrouped work remains visible in the Opportunity Inventory as compatibility fallback. Resolved portfolio Work Items are reserved out of generic mission bundling so Mission Control does not create duplicate primary Commence Work actions for the same building work.

## Campaign Integration

Building Profiles Campaigns now report:

- total profile target
- completed profile count
- resolved portfolio count
- estimated resolved missions remaining
- ungrouped fallback count
- next portfolio Mission
- hidden Work Item count

This lets Mission Control present market progress at portfolio scale while keeping individual buildings inside the Execution Packet.

## Future Resolver Roadmap

Commercial Market Evidence already behaves like a resolver: one district collection becomes one Mission and evidence records remain hidden Work Items.

Future resolvers should follow the same contract:

- Photography: district route, field session, or streetscape collection.
- Recommendation QA: market and space-type scenario suite.
- Knowledge Graph: district cluster or ecosystem foundation.
- Publisher: coherent readiness missions where a resolver boundary improves ownership.

Resolvers should remain deterministic and should not use runtime AI for grouping.
