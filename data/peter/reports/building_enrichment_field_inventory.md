# Building Enrichment Field Inventory

This audit reviews the Peter legacy exports for fields that can support static building enrichment and semantic extraction.

## Available Raw CSV Files

| file | columns | column_names |
| --- | --- | --- |
| rofo_broker_houses.csv | 9 | broker_house_id, company, website, description, main_contact_user_id, main_office_id, allowed_members, feed_allowed, featured |
| rofo_buildings.csv | 24 | building_id, name, street_number, street_name, address, city_id, city, state, zip, county_id, county, metro, lat, lng, building_size, floors, units, min_size, max_size, broker_house_id, listing_count, has_association, redirect_id, updated_at |
| rofo_data_dictionary.csv | 3 | file_name, field_name, description |
| rofo_export_readme.csv | 4 | file_name, date_exported, source_table_or_query, notes_and_caveats |
| rofo_leads.csv | 19 | lead_id, created_at, lead_type, tenant_user_id, listing_id, building_id, city_id, city, state, county, space_type, size_needed, timing, message_text, listing_contact_user_id, referral_user_id, source, source_id, status |
| rofo_listings.csv | 20 | listing_id, building_id, contact_user_id, city_id, city, state, county, square_footage, space_type, lease_type, listing_type, price_selection, price_type, price_sqft, sqft_price, status, source, external_url, created_at, updated_at |
| rofo_market_summary.csv | 10 | city_id, city, state, county, metro, building_count, listing_count, lead_count, distinct_brokers, distinct_landlords |
| rofo_relationships_leads.csv | 8 | lead_id, tenant_user_id, listing_id, building_id, city_id, listing_contact_user_id, referral_user_id, source_table |
| rofo_relationships_listing_buildings.csv | 5 | listing_id, building_id, contact_user_id, city_id, source_table |
| rofo_users.csv | 11 | user_id, name, email, phone, company, role, city, state, county, created_at, last_active |

## Most Useful Enrichment Fields

| file_name | field_name | field_type | completeness | average_length | max_length | why_useful | sample_values |
| --- | --- | --- | --- | --- | --- | --- | --- |
| rofo_broker_houses.csv | company | structured | 100.0% | 22.6 | 128 | Broker or company identity can help attribute sources and identify operator brands. | TRI Commercial \| Cornish & Carey Commercial \| Colliers International |
| rofo_broker_houses.csv | website | structured | 0.4% | 36.4 | 66 | Sparse source URL field for broker houses. | www.colliersparrish.com \| http://www.mckennaco.com/ \| http://www.pyramidbrokerage.com/ |
| rofo_broker_houses.csv | description | free text | 0.4% | 660.0 | 1899 | Only broker/company level rich prose in the raw CSV exports. | Colliers International is a leading commercial real estate services provider and a member firm of Colliers International Property Consultants, an affiliation of independent compani \| McKenna & Company is a full-service commercial property management company, offering a range of solutions for our clients. We manage assets valued at more than $100 million, repres \| A global office space provider for executive suites, coworking spaces and short term office space rentals. Regus also provides virtual office space solutions. |
| rofo_buildings.csv | name | semi-structured | 42.9% | 28.3 | 255 | Building names can reveal towers, centers, plazas, suites, and branded properties. | 27451 Industrial \| 915 Ralston \| Southampton Shopping Center |
| rofo_buildings.csv | address | structured | 100.0% | 18.6 | 166 | Core building identity and future matching key. | 27451-27509 Industrial Blvd \| 915 Ralston Ave \| 800 Southampton Rd |
| rofo_buildings.csv | county | structured | 13.0% | 8.6 | 20 | Useful for market routing and county-level context where present. | Alameda \| San Mateo \| Santa Clara |
| rofo_buildings.csv | metro | structured | 12.9% | 28.7 | 46 | Useful for market clustering where present. | San Francisco-Oakland-Fremont, CA \| San Jose-Sunnyvale-Santa Clara, CA \| Vallejo, CA |
| rofo_buildings.csv | building_size | structured | 100.0% | 1.1 | 10 | Structured size signal for scale and tenant fit. | 0 \| 52295 \| 5227 |
| rofo_buildings.csv | floors | structured | 100.0% | 1.0 | 4 | Structured verticality signal, helpful for tower versus low-rise inference. | 0 \| 15 \| 3 |
| rofo_buildings.csv | units | structured | 100.0% | 1.0 | 5 | Structured multi-tenant signal. | 0 \| 2 \| 1 |
| rofo_buildings.csv | min_size | structured | 100.0% | 1.1 | 8 | Historical space-size signal, not live availability. | 0 \| 18000 \| 1460 |
| rofo_buildings.csv | max_size | structured | 100.0% | 1.3 | 9 | Historical space-size signal, not live availability. | 0 \| 3500 \| 854 |
| rofo_buildings.csv | listing_count | structured | 100.0% | 1.0 | 5 | Historical leasing activity intensity, not live availability. | 0 \| 6 \| 101 |
| rofo_buildings.csv | has_association | structured | 100.0% | 1.0 | 1 | Whether building was associated with listings or tour requests. | 0 \| 1 |
| rofo_listings.csv | square_footage | structured | 100.0% | 5.4 | 11 | Historical size signal at listing level, not live availability. | 2900.0 \| 565.0 \| 3109.0 |
| rofo_listings.csv | space_type | structured | 100.0% | 1.1 | 2 | Numeric legacy space type. Useful after mapping validation. | 2 \| 1 \| 3 |
| rofo_listings.csv | lease_type | structured | 100.0% | 1.0 | 1 | Numeric legacy lease type. Useful after mapping validation. | 1 \| 2 \| 0 |
| rofo_listings.csv | listing_type | structured | 100.0% | 4.7 | 5 | Lease versus sale classification. | LEASE \| SALE |
| rofo_listings.csv | price_type | structured | 99.0% | 3.0 | 4 | Structured rent basis signal, useful only as historical context. | NNN \| FS \| IG |
| rofo_listings.csv | source | structured | 100.0% | 3.0 | 3 | Feed/source signal, currently LMS or USR in this export. | LMS \| USR |
| rofo_listings.csv | external_url | semi-structured | 5.9% | 56.2 | 255 | Sparse URL source field. Could indicate source system but is not rich text. | www.524unionstreet.com \| http://www.readisuite.com/pages/locations_townsend.shtml \| http://www.readisuite.com/pages/locations_mission.shtml |
| rofo_leads.csv | lead_type | structured | 100.0% | 7.7 | 10 | Lead source context: building, listing, or space need. | listing \| building \| space_need |
| rofo_leads.csv | space_type | structured | 100.0% | 1.0 | 2 | Numeric tenant-request space type. Useful after mapping validation. | 3 \| 1 \| 2 |
| rofo_leads.csv | size_needed | structured | 100.0% | 3.6 | 10 | Tenant-request size signal. | 5000 \| 1000 \| 1447 |
| rofo_leads.csv | timing | structured | 100.0% | 19.0 | 19 | Tenant intent timing. | 2010-02-18 18:31:17 \| 2010-02-18 19:11:20 \| 2010-02-18 19:54:13 |
| rofo_leads.csv | message_text | free text | 77.3% | 99.1 | 60899 | Largest rich text field. Tenant-written needs can reveal fit, use, operational requirements, and spam/noise. | Looking for a building for our autobody repair business, trying to keep rent below $2600.00/month. Buidling that includes paint booth is ideal, must be able to put booth in buildin \| ZipFly is a design and photography studio (www.zipfly.net). We're a 2-person studio - and work with contractors on-site, depending on the project. About our idea space: - Berkeley, \| Hi, Micah We are interested not in leasing or renting but helping your prospects move in your office building. Please gladly give us a call or recommend us to your clients for move |
| rofo_leads.csv | source | structured | 100.0% | 4.8 | 6 | Site, mobile, or pdf source context. | site \| mobile \| pdf |
| rofo_leads.csv | status | structured | 100.0% | 3.0 | 9 | Lead state from legacy export. | new \| qualified \| status_-1 |
| rofo_market_summary.csv | building_count | structured | 100.0% | 1.6 | 5 | Market depth signal. | 3579 \| 462 \| 435 |
| rofo_market_summary.csv | listing_count | structured | 100.0% | 1.7 | 5 | Historical listing activity intensity by market. | 2322 \| 136 \| 463 |
| rofo_market_summary.csv | lead_count | structured | 100.0% | 1.2 | 4 | Historical tenant demand signal by market. | 1256 \| 54 \| 126 |
| rofo_market_summary.csv | distinct_brokers | structured | 100.0% | 1.6 | 4 | Market participant density signal. | 1081 \| 56 \| 291 |
| rofo_market_summary.csv | distinct_landlords | structured | 100.0% | 1.0 | 1 | Market owner/operator density signal. | 0 \| 1 |
| cities_from_legacy.csv | c_description | free text | 2.6% | 3164.2 | 9249 | Legacy city description, if populated. | <strong>Redwood City:</strong><br /> <br /> Redwood City is a community of just over 75,000 people, a center of high-tech industry, and the mid-point of the beautiful San Francisco \| The commercial real estate market in Alameda, CA, has experienced a steady recovery post pandemic, with office leasing activity showing signs of revitalization. Vacancy rates have  \| <strong><a href="http://www.rofo.com/CA/Oakland/Retail">Retail space</a> in Oakland:</strong> Oakland has been consistently considered an under retailed area by national analysts a |
| cities_from_legacy.csv | c_use_description | structured | 100.0% | 1.0 | 1 | Legacy boolean-like city description usage flag, not a rich semantic field. | 0 \| 1 |
| neighborhoods_from_legacy.csv | n_description | free text | 0.9% | 265.4 | 2769 | Legacy neighborhood description, if populated. | Find the best <a href="http://www.rofo.com/CA/San-Francisco">office space listings in San Francisco</a> for your business.&nbsp; Search the active listings and post your needs on R \| Find the best <a href="http://www.rofo.com/CA/San-Francisco">office space listings in San Francisco</a> for your business.&nbsp; Search the active listings and post your needs on R \| Find the best <a href="http://www.rofo.com/CA/San-Francisco">office space listings in San Francisco</a> for your business.&nbsp; Search the active listings and post your needs on R |
| neighborhoods_from_legacy.csv | n_summary | free text | 0.5% | 426.4 | 768 | Legacy neighborhood summary, if populated. | Find commercial real estate listings and office space for rent in the Pacific Heights area of San Francisco. Pacific Heights is located in one of the most scenic settings, offering \| Find commercial real estate listings and office space for rent in the Mission District area of San Francisco. The Mission District was named after San Francisco's oldest building,  \| Find commercial real estate listings and office space for rent in the Cow Hollow area of San Francisco. The Cow Hollow neighborhood was once used for cow grazing and a settlement f |

## Key Finding

The current `rofo_listings.csv` export does not include broker-written listing descriptions, highlights, amenities, or marketing remarks. That limits building-level semantic extraction from listing copy. The strongest available free-text field is `rofo_leads.csv.message_text`, which describes tenant needs rather than building attributes. Structured building and listing fields remain useful for historical activity, size, space-type, price-basis, and source signals.
