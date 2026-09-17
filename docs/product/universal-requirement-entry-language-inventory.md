# Universal Requirement Entry Language

## Executive Answer

Rofo has seven genuinely different entry contexts, but only three underlying destinations: the current Requirement/Location Brief journey, its legacy Business Profile fallback, and direct legacy lead/availability forms. Most prominent public links—including the homepage, header, market, city, property-type, district, comparison, building, insight, and example-Brief links—use different copy but enter through `/best-fit-locations/`. That router preserves context and sends eligible searches to `/location-requirement/`; ineligible or incomplete contexts go to `/find-locations/`.

`Tell us what you need` is a sound universal action for starting a new Requirement. Sacramento's full promise is not universal because `recommend where to start` is only guaranteed where reviewed local Recommendation Intelligence is enabled. The smallest honest universal promise is:

> Rofo will help define the right space for your business, identify where to start when reviewed local guidance is available, and create your Location Brief.

That wording is truthful but slightly procedural. A clearer customer-facing contract is to keep the universal promise focused on the outcomes Rofo always delivers, then add one certified-market sentence where applicable:

- **Universal CTA:** Tell us what you need
- **Universal promise:** Rofo will help define what your business needs and create a Location Brief for the search.
- **Certified-market addition:** Where Rofo has reviewed local intelligence, we'll also recommend where to start and explain why.
- **Optional reassurance:** No account required. Do not make a universal duration claim until timing is governed.

This should be a product-language contract, not an SEO contract. Titles, H1s, market descriptions, and query-specific opening copy should remain page-specific.

## Current Entry Surfaces

The inventory groups repeated renderings by shared implementation rather than counting every page instance.

| Entry experience | Representative surface and route | Current headline/proposition | Primary / secondary action | After click and context | Account / journey | Clarity |
|---|---|---|---|---|---|---|
| 1. Blank new search | Homepage `/`; global header | `Find the right place to locate your business.` Homepage explains analysis, recommendations, and a Location Brief. | `See My Best-Fit Locations`; no adjacent secondary action in hero | `/best-fit-locations/` with `source=homepage` or `header` and `sourcePath`; controlled router chooses current Requirement or fallback | No account. Current journey when globally eligible; otherwise fallback variant | **Partly clear.** Benefit is visible, but the CTA does not say Rofo will ask questions and sounds like an immediate result. |
| 2. Educational/example entry | `/how-rofo-works/`, `/why-rofo/`, `/example-location-brief/`, insight and lease-guide pages | Product explanation or sample Brief | Usually `See My Best-Fit Locations`; often `View an Example Location Brief` / `How Rofo works` | Same router; preserves `source`, `sourcePath`, and sometimes SF market | No account. Usually current or fallback based on context | **Clear to partly clear.** Surrounding education explains the deliverable; CTA still implies a faster reveal than the interview actually provides. |
| 3. Market/city entry | City and market pages; e.g. `/commercial-real-estate/IN/indianapolis/` | Shared recommendation prompt varies by city; fallback copy is `Find commercial locations that fit your business` | `See My Best-Fit Locations`; `How Rofo works` | Router receives city, state, optional `marketId`, source `city`/`market_guide`, source path | No account. Market-prefilled current journey if enabled; fallback otherwise | **Partly clear.** The proposition explains comparison in mature contexts, but `Business Profile` and `Best-Fit` obscure the concrete output. |
| 4. Property-type entry | SF Office, Phoenix/Indianapolis/San Diego Industrial and other space-type routes | SEO/H1 and market-specific operating context; shared mobile card says `Create your Business Profile` / `Get a location recommendation before you search for space.` | Usually `See My Best-Fit Locations`; Sacramento alone currently uses `Tell us what you need` plus the Location Brief promise | Router receives city/state, `marketId` where supplied, space type, `source=space_type`, source path, `journey=new` | No account. Current journey for enabled market/type; fallback otherwise | Sacramento **clear**. Most others **partly clear**: they promise “best fit” but do not describe the interview or shared Brief. |
| 5. District/comparison/building-context entry | District pages, comparison pages, Building Briefs | Examples: `Is [district] right for your business?`, `Which location is the better fit?`, `Could this building fit your business?` | Usually `See My Best-Fit Locations`; some SF district surfaces say `Create My Location Brief` | Router carries city/state, district or comparison pair, building/source path, space type where known, optional market/district IDs | No account. Same current journey when eligible, with richer entry context; fallback otherwise | **Partly clear.** The question is relevant, but some building copy overpromises property evaluation that the current product does not actually perform. |
| 6. Unsupported/investigation entry | Example: Howell, MI Flex from a generic city/property-type/header entry | Generic `Find commercial locations that fit your business` or page-specific legacy content | Usually `See My Best-Fit Locations` | Router marks the context ineligible and sends it to `/find-locations/` with `v2Fallback`; legacy Business Profile can organize the search and submit a lead | No account to begin. Variant—not the same certified Recommendation/Brief path | **Unclear to partly clear.** `Best-Fit Locations` implies local recommendations even when the honest outcome is investigation required. |
| 7. Existing-search continuation | Location Brief edit/resume and post-Brief research | `Does this sound right?`, `Change something`, `Put Rofo to work finding it` | `Change something`; `Put Rofo to work →`; subsequent `Start My Space Search` | Edit returns to `/location-requirement/?journey=edit&brief=…`; continuation carries Requirement/Brief identity into research and lead submission | No account. Existing Requirement revision or fulfillment continuation—not a new entry | **Clear.** Language reflects the stage and should not be standardized to the new-search CTA. |

A separate legacy surface must remain outside the shared Requirement-entry contract: older neighborhood pages without the modern decision model expose `Request availability report` and submit directly to `/api/leads/submit`. They request contact, space, size, and timing rather than create the current Requirement. This is a genuinely different product path.

## CTA Families

| Current CTA family | Breadth and destination | Accuracy |
|---|---|---|
| `See My Best-Fit Locations` | Dominant family: homepage/header, education, city/market, most property-type pages, shared mobile and recommendation cards, district/comparison/building/insight/example surfaces. Usually `/best-fit-locations/`. | **Partly clear.** It communicates the hoped-for result but not the customer action or Location Brief. It is too strong for unsupported contexts. |
| `Tell us what you need` | Sacramento Industrial hero and recommendation action only. Same controlled router and current journey. | **Clear.** Accurately describes the immediate action without promising instant inventory or recommendations. |
| `Create My Location Brief` | Requirement completion; `/find-locations/` configuration; some district forms/cards; prototype surfaces. | **Clear** at the end of the Requirement interview. **Partly clear** as a cold entry because customers may not yet know what a Location Brief is. |
| `Create your Business Profile` / `Create Your Personalized Location Brief` | Shared mobile prompt headings, fallback flow, and Business Brief promotion; usually paired with a different button label. | **Partly clear.** `Business Profile` is an internal product noun and sounds like account setup. |
| `Request availability report` | Legacy neighborhood pages lacking the commercial-location model; direct lead form. | **Clear about a different journey**, although its availability promise should not be conflated with the Requirement product. |
| `Put Rofo to work` / `Start My Space Search` | Confirmed Location Brief continuation and research request. | **Clear and stage-appropriate.** Not a new Requirement CTA. |
| `Start a new search`, `Change something`, `Edit my search` | Existing-search management. | **Clear.** These should remain variants because they preserve or replace known state. |

The exact breadth is template-driven rather than safely reducible to a stable page count. `See My Best-Fit Locations` appears in the global header and at least six shared page families, plus market-specific data contracts; changing one string would not cover all instances.

## Genuine Journey Variants

1. **New blank Requirement.** Only source/source path are known. Rofo must ask market and property type.
2. **Market-prefilled Requirement.** City/state and sometimes canonical market ID are carried forward.
3. **Market + property-type Requirement.** This is the strongest common acquisition entry and carries market, type, source, and source path.
4. **District/comparison/building-context Requirement.** The same interview begins with additional geographic context; that context is not proof the district/building fits.
5. **Existing Requirement edit/resume.** Prior answers and Brief identity are restored; the proper action is `Change something`, not `Tell us what you need`.
6. **Unsupported/investigation path.** Rofo can capture needs and organize expert investigation but cannot promise reviewed local recommendations.
7. **Location Brief continuation.** The Requirement is already complete; the action starts human-assisted search rather than another interview.

Different language is justified for variants 5 and 7. Variant 6 needs one honest qualification. Variants 1–4 share the same immediate customer action and should use one primary entry contract with contextual page copy around it.

## Sacramento Proposition Truth Test

### Define the right space

**Supported with a wording caveat.** The current Requirement asks about business/use, property type, approximate size or attendance where supplied, work/operating pattern, location intent, operational features, priorities, and flexibility. The six-section Brief translates these into `Likely space` and explicitly exposes missing information. Rofo defines the search assignment; it does not verify that a particular available space is right. `Help define what your business needs` is more precise universally than `define the right space`.

### Recommend where to start

**Not universal.** It is true for activated, certified market/property-type flows when the Requirement resolves within their bounded universe. Even there, abstention can be the correct result for unresolved or unsupported needs. In Howell, Rofo can create a Requirement and Brief, identify verification questions, and route expert investigation, but it cannot truthfully promise a reviewed starting-area recommendation.

### Create your Location Brief

**True for the current public Requirement experience.** The journey creates the durable human-readable search without requiring an account. The fallback `/find-locations/` still uses older Business Profile/Location Brief semantics and lead submission, so implementation standardization should verify that every migrated cold-entry surface reaches the v2 Brief path before making this promise mechanically everywhere.

## Unsupported-Market Boundary

Rofo always can:

- ask what the business and operation need;
- preserve the resulting search context;
- express known needs and important gaps in a Location Brief or fulfillment context;
- identify matters that require local investigation;
- pass the assignment to expert help.

Rofo cannot always:

- rank or recommend districts;
- explain reviewed local tradeoffs;
- provide a confident local starting point.

Therefore `recommend where to start` belongs to an enabled-intelligence addition, not the unconditional universal sentence. The unsupported-market experience should say that Rofo will organize what needs investigation, not disguise investigation as a recommendation.

## Clarity Audit

For an infrequent CRE customer:

- **Sacramento Industrial: clear.** The action, reason to answer, and deliverable are explicit. It does not resemble listing search. Account status is not stated because the optional reassurance was correctly omitted when the two-minute claim could not be verified.
- **Homepage and product education: partly clear.** The Location Brief is explained, but `See My Best-Fit Locations` suggests immediate output rather than an interview.
- **Certified market/property-type pages: partly clear.** Local context is strong; the CTA does not consistently explain that Rofo first learns the business and creates a shared search.
- **District/comparison pages: partly clear.** Contextual questions are useful, but `best fit` can overstate what happens before the Requirement is known.
- **Building pages: partly clear to unclear.** `Could this building fit your business?` and copy saying Rofo will “evaluate whether this building fits” exceed the current location-first product's property facts.
- **Unsupported markets: unclear.** The same best-fit label masks an investigation outcome.
- **Legacy availability forms: clear about a lead request, but different from the product model.** They should not be relabeled without migrating behavior.
- **Brief continuation: clear.** It appropriately tells the user Rofo will carry the established assignment forward.

Across most cold-entry surfaces, the customer can infer what Rofo wants and why, but is not consistently told what will be produced or whether the interaction is an interview rather than listings search. “No account required” is true for Location Brief creation but is not consistently stated.

## Internal Language Leakage

- **Business Profile** is the largest entry-language leak. It is meaningful internally but can sound like account creation or a company directory profile. The customer is actually describing a real-estate search.
- **Best-Fit Locations** is product shorthand rather than a transparent action. It also overstates the unsupported-market outcome.
- **Location intelligence** is acceptable as a supporting badge only when the adjacent copy explains what the customer receives; alone it is abstract.
- **Requirement** and **Recommendation Intelligence** are appropriately absent from most cold-entry copy and should remain internal.
- **Investigation state** is not shown verbatim, but unsupported routing is insufficiently explained before the click.
- **Location Brief** is a useful product noun when immediately defined as the plain-English search assignment. It should remain.

## SEO vs Product Language

Three layers should stay separate:

1. **Page-specific acquisition language:** title, H1, opening paragraph, district/market distinctions, and query intent such as `Sacramento Industrial Space` or `San Francisco Office Space`. Keep these specific.
2. **Shared product promise:** what Rofo will do after engagement—understand the need and create a Location Brief, with local recommendations where reviewed intelligence exists.
3. **Shared entry action:** `Tell us what you need` for new Requirement starts.

Standardizing layers 2 and 3 should not alter titles, metadata, canonicals, H1s, or market evidence. The Sacramento intervention remains the only measured SEO change.

## Proposed Shared Entry Contract

### Universal

- **Primary CTA:** `Tell us what you need`
- **Short promise:** `Rofo will help define what your business needs and create a Location Brief for the search.`
- **Optional reassurance:** `No account required.` only on surfaces confirmed to enter v2 directly. Do not claim a duration without measured/governed support.

### Certified-market variant

Add one sentence, driven by existing eligibility rather than market-specific prose:

> With reviewed local guidance for this search, Rofo can also recommend where to start and explain why.

The page may phrase that idea naturally within its existing market-specific hero. The behavioral condition—not one exact sentence—is the shared contract.

### Unsupported-market variant

> Where reviewed local guidance isn't available, Rofo will organize what matters and what needs local investigation.

### Keep page-specific

- SEO title and meta description;
- H1 and query-specific opening copy;
- market, district, property-type, and operational distinctions;
- contextual questions such as whether two districts should be compared;
- edit/resume, Brief confirmation, and continuation actions;
- legacy availability language until its underlying behavior is deliberately migrated.

## Six Example Applications

These examples demonstrate the contract; they are not proposed edits to SEO titles or market intelligence.

### Sacramento Industrial

**Page context:** Industrial and Warehouse Space in Sacramento, CA

**Promise:** Rofo will help define what your operation needs and create a Location Brief for the search. With reviewed Sacramento Industrial guidance, Rofo can also recommend where to start and explain why.

**CTA:** Tell us what you need

### Phoenix Industrial

**Page context:** Industrial, Warehouse and Flex Space in Phoenix, AZ

**Promise:** Rofo will help define what your operation needs and create a Location Brief for the search. With reviewed Phoenix Industrial/Flex guidance, Rofo can also recommend where to start and explain why.

**CTA:** Tell us what you need

### Indianapolis Industrial

**Page context:** Industrial and Warehouse Space in Indianapolis, IN

**Promise:** Rofo will help define what your operation needs and create a Location Brief for the search. With reviewed Indianapolis Industrial/Flex guidance, Rofo can also recommend where to start and explain why.

**CTA:** Tell us what you need

### North Orange County Industrial/Flex

**Page context:** Preserve the existing Anaheim Canyon/Fullerton Industrial/Flex context and bounded geography.

**Promise:** Rofo will help define what your operation needs and create a Location Brief for the search. With reviewed North Orange County Industrial/Flex guidance, Rofo can also recommend where to start and explain why.

**CTA:** Tell us what you need

### San Francisco Office

**Page context:** Preserve `Office Space in San Francisco, CA` and existing district intelligence.

**Promise:** Rofo will help define what your workplace needs and create a Location Brief for the search. With reviewed San Francisco Office guidance, Rofo can also recommend where to start and explain why.

**CTA:** Tell us what you need

### Howell, MI Flex — unsupported/investigation

**Page context:** Preserve Howell/Flex acquisition wording; do not imply reviewed local district coverage.

**Promise:** Rofo will help define what your operation needs and create a Location Brief for the search. Where reviewed local guidance isn't available, Rofo will organize what matters and what needs local investigation.

**CTA:** Tell us what you need

## Implementation Scope

This is a small language-contract decision but a medium migration because entry labels are decentralized.

Likely shared files/contracts:

- `_includes/header.njk`
- `_includes/partials/shared/recommendation-prompt-card.njk`
- `_includes/partials/shared/search-profile-mobile-entry.njk`
- `_includes/partials/space-type/hero.njk`
- `_includes/partials/building/product-transition-card.njk`
- the shared public-decision recommendation data contract used by market/property-type pages
- `functions/best-fit-locations.js` only if presentation needs a reliable public eligibility signal; routing semantics need not change

Explicit migrations would still be needed for hard-coded homepage, education, example-Brief, insight, lease-guide, comparison, and market decision-data labels. The Requirement-completion, edit/resume, Brief continuation, and direct legacy availability forms should not be changed by a cold-entry migration.

Expected breadth: approximately five shared presentation/data contracts plus roughly eight hard-coded page families. Exact page output breadth is large because the shared partials appear across generated city, property-type, district, comparison, and building pages.

Risks:

- **SEO:** low if titles, metadata, H1s, and page-specific copy are excluded; higher if a bulk replacement touches them.
- **Attribution:** low if hrefs and query parameters remain byte-for-byte unchanged. A visual-only label migration must preserve `source`, `sourcePath`, city/state, market/type, district, and journey parameters.
- **Product truth:** highest risk. Certified versus investigation copy must follow runtime eligibility/default-deny behavior, not a manually maintained list in templates.
- **Context:** low if only labels/supporting prose change; regression QA should compare all generated entry URLs before and after.
- **Legacy behavior:** high if direct availability forms are mislabeled as Requirement creation.

Required QA would assert shared CTA wording by journey type, certified/unsupported promise selection, unchanged URLs and attribution parameters, no account claim only where supported, no universal timing claim, unchanged SEO metadata/H1s, mobile/desktop readability, and representative current/fallback routing.

## Recommendation

Standardization is justified for **new Requirement starts**, not for every Rofo button. Adopt `Tell us what you need` as the shared cold-entry action and define the guaranteed output as a Location Brief that captures what the business needs. Add recommendation language only when existing eligibility proves reviewed local guidance is available; use investigation language otherwise.

Before implementation, choose whether eligible/fallback promise selection happens before the router or only on the destination. The safest small implementation is to keep acquisition pages on the universal promise, let certified pages retain their page-specific local-intelligence explanation, and make `/location-requirement/` versus `/find-locations/` explicitly set expectations after routing. Do not fold legacy availability forms, existing-search editing, or `Put Rofo to work` into this change.

## Implementation Status

Implemented locally and pending operator review. The final shared cold-entry contract is:

- **Primary CTA:** `Tell us what you need`
- **Universal promise:** `Rofo will help you define what you're looking for and create a Location Brief for your search.`
- **Optional reassurance:** `No account required.` on the shared recommendation prompt, whose destinations require no account.
- **Duration:** no duration claim.

Certified pages retain their existing market-specific recommendation and local-intelligence context around this universal contract. No static presentation-layer allowlist was added: the shared promise does not guarantee a recommendation, while existing runtime/default-deny routing continues to decide whether a search enters the current Requirement experience or the fallback path. Blank and investigation contexts therefore receive only the universal promise.

Migrated surface families:

- homepage cold-entry actions and hero promise;
- global header new-search action;
- shared recommendation prompt cards used by city, market, district, and comparison contexts;
- shared mobile property-type entry;
- shared local decision-guide action and promise;
- shared business-brief entry;
- SF commercial-geography cold entry;
- education, insight, lease-guide, example-Brief, and SF-insights cold entries;
- market/property-type decision data labels and market-snapshot entry labels.

Intentionally excluded:

- Requirement completion (`Create My Location Brief`), because the customer has already supplied the need;
- Brief confirmation, edit/resume, and `Start a new search`, because these manage existing state;
- `Put Rofo to work` and `Start My Space Search`, because these continue a confirmed search;
- `Request availability report` and direct neighborhood availability forms, because they are legacy lead/availability actions;
- building-fit and building-comparison actions, because their stated customer job is evaluating a particular building and the inventory found that promise needs separate product review;
- the internal heading `Create your Business Profile` inside the legacy `/find-locations/` experience, because it is destination-stage UI rather than a cold-entry CTA and changing it would expand this sprint into fallback-journey behavior.

Sacramento Industrial retains its approved CTA, supporting promise, title, metadata, baseline, checkpoint, and decision-window record unchanged. Its copy remains the page-specific measured intervention rather than being overwritten by the universal wording.

QA verifies representative certified, blank/investigation, edit/continuation, and legacy paths; unchanged href/query context; preservation of the Sacramento experiment; absence of availability or inventory promises; unchanged SEO metadata/H1 contracts; customer-language lint; production build; and whitespace validity.
