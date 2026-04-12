
import csv, json, re, sys, os
from collections import Counter, defaultdict

def slugify(text):
    text = str(text or "").strip().lower()
    text = re.sub(r"&", " and ", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text

def clean_str(x):
    return "" if x is None else str(x).strip()

def parse_bool(x):
    return clean_str(x).lower() == "true"

def parse_num(x):
    s = re.sub(r"[^0-9.]", "", clean_str(x))
    if not s:
        return 0
    try:
        return int(float(s))
    except Exception:
        return 0

def normalize_space_type(raw, is_exec):
    if is_exec:
        return "coworking"
    raw = clean_str(raw).lower()
    if not raw:
        return ""
    if "cowork" in raw or "executive" in raw:
        return "coworking"
    if "retail" in raw:
        return "retail"
    if "industrial" in raw:
        return "industrial"
    if "flex" in raw:
        return "flex"
    if "office" in raw:
        return "office"
    if "live/work" in raw or "live work" in raw:
        return "office"
    if "land" in raw:
        return "land"
    return raw

def size_label(size):
    if not size:
        return ""
    if size < 1500:
        return "Small spaces"
    if size < 5000:
        return "Small to mid-size spaces"
    if size < 15000:
        return "Mid-size spaces"
    if size < 50000:
        return "Large spaces"
    return "Large-format spaces"

def first_url(*vals):
    for v in vals:
        s = clean_str(v)
        if not s:
            continue
        parts = [p.strip() for p in re.split(r'[\s,]+', s) if p.strip()]
        for p in parts:
            if p.startswith("http"):
                return p
    return ""

def normalize_row(row, company):
    is_exec = parse_bool(row.get('is_exec_suite'))
    address = clean_str(row.get('property_address'))
    city = clean_str(row.get('property_city')).title()
    state = clean_str(row.get('property_state')).upper()
    name = clean_str(row.get('property_name'))
    property_id = clean_str(row.get('property_id'))
    building_slug = slugify(address or name)
    city_slug = slugify(city)
    legacy_path = f"/building/{state}/{city_slug}/{building_slug}" + (f"-{property_id}" if property_id else "") + ".html"
    return {
        "source_company": company,
        "property_id": property_id,
        "name": name,
        "address": address,
        "city": city,
        "state_abbr": state,
        "postal": clean_str(row.get('property_postal')),
        "property_size": parse_num(row.get('property_size')),
        "property_year_built": clean_str(row.get('property_year_built')),
        "property_description": clean_str(row.get('property_description')),
        "raw_space_type": clean_str(row.get('space_type')),
        "space_type": normalize_space_type(row.get('space_type'), is_exec),
        "space_suite": clean_str(row.get('space_suite')),
        "space_size": parse_num(row.get('space_size')),
        "space_description": clean_str(row.get('space_description')),
        "lease_category": clean_str(row.get('lease_category')),
        "lease_type": clean_str(row.get('lease_type')),
        "lease_rate": clean_str(row.get('lease_rate')),
        "is_exec_suite": is_exec,
        "is_divisible": parse_bool(row.get('is_divisible')),
        "is_sublease": parse_bool(row.get('is_sublease')),
        "sublease_date": clean_str(row.get('sublease_date')),
        "hero_image": first_url(row.get('property_image_urls'), row.get('space_image_urls')),
        "city_slug": city_slug,
        "building_slug": building_slug,
        "building_path": legacy_path,
    }

def build_building(rows):
    rows = sorted(rows, key=lambda r: (r['space_size'], r['property_size']), reverse=True)
    primary = rows[0]
    names = [r['name'] for r in rows if r['name']]
    name = Counter(names).most_common(1)[0][0] if names else primary['address']
    space_types = sorted({r['space_type'] for r in rows if r['space_type']})
    raw_space_types = sorted({r['raw_space_type'] for r in rows if r['raw_space_type']})
    source_companies = sorted({r['source_company'] for r in rows})
    hero = next((r['hero_image'] for r in rows if r['hero_image']), "")
    teaser = next((r['property_description'] for r in rows if r['property_description']), "") or \
             next((r['space_description'] for r in rows if r['space_description']), "")
    primary_space_type = primary['space_type'] or (Counter([r['space_type'] for r in rows if r['space_type']]).most_common(1)[0][0] if [r['space_type'] for r in rows if r['space_type']] else "")
    return {
        "name": name,
        "address": primary['address'],
        "city": primary['city'],
        "state_abbr": primary['state_abbr'],
        "postal": primary['postal'],
        "city_slug": primary['city_slug'],
        "building_slug": primary['building_slug'],
        "building_path": f"/commercial-real-estate/building/{primary['state_abbr']}/{primary['city_slug']}/{primary['building_slug']}.html",
        "property_size": primary['property_size'],
        "property_year_built": primary['property_year_built'],
        "teaser": teaser[:320].strip(),
        "hero_image": hero,
        "size": primary['space_size'],
        "size_label": size_label(primary['space_size']),
        "primary_space_type": primary_space_type,
        "type": primary_space_type.title() if primary_space_type else "Commercial",
        "space_types": space_types,
        "raw_space_types": raw_space_types,
        "source_companies": source_companies,
        "primary_source": primary['source_company'],
        "source_count": len(rows),
        "is_exec_suite_present": any(r['is_exec_suite'] for r in rows),
    }

def process_file(path, company):
    with open(path, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        return [normalize_row(row, company) for row in reader]

def main():
    if len(sys.argv) < 4 or len(sys.argv[1:]) % 2 != 1:
        print("Usage: python process_rofo_exports.py <output_dir> <csv1> <company1> [<csv2> <company2> ...]")
        sys.exit(1)

    output_dir = sys.argv[1]
    os.makedirs(output_dir, exist_ok=True)

    args = sys.argv[2:]
    listings = []
    for i in range(0, len(args), 2):
        csv_path, company = args[i], args[i+1]
        listings.extend(process_file(csv_path, company))

    grouped = defaultdict(list)
    for row in listings:
        key = f"{row['address'].lower().strip()}|{row['city'].lower().strip()}|{row['state_abbr']}"
        grouped[key].append(row)

    buildings = [build_building(rows) for rows in grouped.values()]
    buildings.sort(key=lambda b: (b['state_abbr'], b['city'], b['address']))

    city_groups = defaultdict(list)
    for b in buildings:
        city_groups[(b['city'], b['state_abbr'])].append(b)

    cities = []
    for (city, state), rows in sorted(city_groups.items()):
        counts = Counter()
        for b in rows:
            for t in b['space_types']:
                counts[t] += 1
        cities.append({
            "city": city,
            "state_abbr": state,
            "city_slug": slugify(city),
            "building_count": len(rows),
            "primary_space_types": [t for t, _ in counts.most_common()],
            "supported_space_types": sorted(counts.keys()),
            "space_type_counts": dict(counts),
        })

    with open(os.path.join(output_dir, "raw-listings.json"), "w") as f:
        json.dump(listings, f, indent=2)
    with open(os.path.join(output_dir, "normalized-buildings.json"), "w") as f:
        json.dump(buildings, f, indent=2)
    with open(os.path.join(output_dir, "derived-cities.json"), "w") as f:
        json.dump(cities, f, indent=2)

    print(f"Wrote {len(listings)} raw listings, {len(buildings)} buildings, and {len(cities)} cities to {output_dir}")

if __name__ == "__main__":
    main()
