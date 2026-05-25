#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bay Area Media Discovery V2

Python 2 compatible, standard-library-only workflow for discovering recovered
building media coverage across a broader Bay Area commercial district corpus.

Read-only: does not move, delete, optimize, upload, rename, publish, or modify
media files.
"""

from __future__ import print_function

import codecs
import csv
import json
import os
import re
import stat
import sys
import time


MEDIA_ROOT = "/ebs2/rofo/content/buildings5"
OUTPUT_DIR = "data/media/generated/bay_area_media_discovery_v2"
REPORT_PATH = "data/media/reports/bay_area_media_discovery_v2.md"

BUILDING_SIGNALS = "data/peter/derived/building_signals.csv"
DISTRICT_ASSIGNMENTS = "data/peter/derived/bay_area_building_neighborhood_assignments.csv"
REPRESENTATIVE_BUILDINGS = "data/peter/derived/bay_area_representative_buildings.csv"

PROGRESS_EVERY = 50000
MAX_MEDIA_RECORDS_PER_BUILDING = 100
MAX_UNMATCHED_ID_SAMPLES = 500

MEDIA_RE = re.compile(r"^(\d+)_([A-Za-z0-9_-]+)(\.[^.]+)$")

DISTRICTS = [
    {
        "slug": "downtown-oakland",
        "name": "Downtown Oakland",
        "city": "Oakland",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["Downtown Oakland", "Downtown", "City Center", "Old Oakland"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv neighborhood consolidation",
        "district_assignment_confidence": "high",
    },
    {
        "slug": "uptown-oakland",
        "name": "Uptown Oakland",
        "city": "Oakland",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["Uptown Oakland", "Northgate", "Northgate - Waverly", "Grand Avenue", "Lake Merritt", "Lakeside"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv Uptown/Northgate proxy",
        "district_assignment_confidence": "medium",
    },
    {
        "slug": "jack-london-square",
        "name": "Jack London Square",
        "city": "Oakland",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["Jack London Square"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv explicit district label",
        "district_assignment_confidence": "high",
    },
    {
        "slug": "financial-district-sf",
        "name": "Financial District SF",
        "city": "San Francisco",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["Financial District", "Downtown", "Embarcadero"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv downtown SF consolidation",
        "district_assignment_confidence": "medium",
    },
    {
        "slug": "soma",
        "name": "SoMa",
        "city": "San Francisco",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["SOMA", "South of Market", "South Park"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv SoMa/South of Market consolidation",
        "district_assignment_confidence": "medium",
    },
    {
        "slug": "mission-bay",
        "name": "Mission Bay",
        "city": "San Francisco",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["Mission Bay", "China Basin"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv Mission Bay/China Basin consolidation",
        "district_assignment_confidence": "medium",
    },
    {
        "slug": "downtown-palo-alto",
        "name": "Downtown Palo Alto",
        "city": "Palo Alto",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["Downtown Palo Alto", "University South"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv University South downtown proxy",
        "district_assignment_confidence": "medium",
    },
    {
        "slug": "mountain-view-tech-corridor",
        "name": "Mountain View Tech Corridor",
        "city": "Mountain View",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["Mountain View", "North Whisman", "Whisman Station", "Rex Manor", "Jackson Park", "Cuesta Park"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv Mountain View corridor consolidation",
        "district_assignment_confidence": "medium",
    },
    {
        "slug": "south-san-francisco-biotech-corridor",
        "name": "South SF Biotech Corridor",
        "city": "South San Francisco",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["South San Francisco Biotech Corridor", "Oyster Point", "Lindenville", "The East Side"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv Oyster Point/Lindenville corridor consolidation",
        "district_assignment_confidence": "medium",
    },
    {
        "slug": "emeryville",
        "name": "Emeryville",
        "city": "Emeryville",
        "state_abbr": "CA",
        "assignment_neighborhoods": [],
        "assignment_source": "building_signals.csv city fallback; no district assignment rows found",
        "district_assignment_confidence": "low",
        "city_fallback": True,
    },
    {
        "slug": "west-oakland-industrial-corridor",
        "name": "West Oakland Industrial Corridor",
        "city": "Oakland",
        "state_abbr": "CA",
        "assignment_neighborhoods": ["West Oakland", "Prescott", "Clawson", "West Grand", "Upper Mandela", "McClymonds"],
        "assignment_source": "bay_area_building_neighborhood_assignments.csv West Oakland industrial corridor consolidation",
        "district_assignment_confidence": "medium",
    },
]


def ensure_dir(path):
    if not os.path.isdir(path):
        os.makedirs(path)


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def read_csv(path):
    if sys.version_info[0] < 3:
        handle = open(path, "rb")
    else:
        handle = open(path, "r", newline="")
    try:
        reader = csv.DictReader(handle)
        return [row for row in reader]
    finally:
        handle.close()


def write_json(path, data):
    with codecs.open(path, "w", "utf-8") as handle:
        json.dump(data, handle, indent=2, sort_keys=True)
        handle.write(u"\n")


def write_text(path, text):
    with codecs.open(path, "w", "utf-8") as handle:
        handle.write(text)
        if not text.endswith("\n"):
            handle.write(u"\n")


def fmt_int(value):
    try:
        raw = str(int(value))
    except Exception:
        return str(value)
    pieces = []
    while raw:
        pieces.append(raw[-3:])
        raw = raw[:-3]
    return ",".join(reversed(pieces))


def slugify(value):
    value = (value or "").lower()
    output = []
    previous_dash = False
    for char in value:
        if char.isalnum():
            output.append(char)
            previous_dash = False
        elif not previous_dash:
            output.append("-")
            previous_dash = True
    return "".join(output).strip("-")


def building_path_candidate(row):
    address = row.get("address") or row.get("building_name") or row.get("name") or ""
    city = row.get("city") or ""
    state = row.get("state") or row.get("state_abbr") or "CA"
    if not address or not city:
        return None
    return "/commercial-real-estate/building/%s/%s/%s/" % (state, slugify(city), slugify(address))


def parse_media_name(file_name):
    match = MEDIA_RE.match(file_name)
    if not match:
        return None
    return {
        "building_id": match.group(1),
        "media_hash": match.group(2),
        "extension": match.group(3).lower(),
    }


def derivative_for_path(file_path):
    parts = file_path.split(os.sep)
    for part in parts:
        if part in ("orig", "standard", "thumb", "smthumb"):
            return part
    return "unknown"


def relpath(path, root):
    try:
        return os.path.relpath(path, root)
    except Exception:
        if path.startswith(root):
            return path[len(root):].lstrip(os.sep)
        return path


def numeric(value):
    try:
        return float(value or 0)
    except Exception:
        return 0.0


def building_record_confidence(row):
    if not row:
        return "none"
    if row.get("has_geo") == "True" and numeric(row.get("listing_count")) > 0 and (row.get("address") or row.get("name")):
        return "high"
    if row.get("has_geo") == "True" or row.get("address") or row.get("name"):
        return "medium"
    return "low"


def make_building_summary(building_id, canonical, assignment, district):
    canonical = canonical or {}
    assignment = assignment or {}
    city = canonical.get("city") or assignment.get("city") or district["city"]
    state = canonical.get("state") or assignment.get("state") or district.get("state_abbr") or "CA"
    return {
        "building_id": building_id,
        "building_name": assignment.get("building_name") or canonical.get("name") or "",
        "address": canonical.get("address") or "",
        "city": city,
        "state_abbr": state,
        "canonical_building_path": building_path_candidate(canonical or assignment),
        "canonical_building_path_source": "derived_from_address_slug_candidate",
        "building_record_confidence": building_record_confidence(canonical),
        "listing_count": int(numeric(canonical.get("listing_count") or 0)),
        "historical_activity_bucket": canonical.get("activity_bucket") or "",
        "district_slug": district["slug"],
        "district_name": district["name"],
        "district_assignment_source": district["assignment_source"],
        "district_assignment_confidence": assignment.get("assignment_confidence") or district["district_assignment_confidence"],
        "district_assignment_distance_km": numeric(assignment.get("assignment_distance_km") or 0),
        "assignment_neighborhood": assignment.get("neighborhood_name") or ("city_fallback" if district.get("city_fallback") else ""),
        "media_count": 0,
        "original_media_count": 0,
        "derivative_media_count": 0,
        "extension_counts": {},
        "derivative_counts": {},
        "media_assets": [],
        "representative_image_candidate": True,
        "representative_image_score_placeholder": None,
        "representative_image_review_status": "needs_media_match",
        "public_ready": False,
    }


def add_media_to_building(summary, record):
    summary["media_count"] += 1
    ext = record["extension"]
    derivative = record["derivative"]
    summary["extension_counts"][ext] = summary["extension_counts"].get(ext, 0) + 1
    summary["derivative_counts"][derivative] = summary["derivative_counts"].get(derivative, 0) + 1
    if derivative == "orig":
        summary["original_media_count"] += 1
    else:
        summary["derivative_media_count"] += 1
    if len(summary["media_assets"]) < MAX_MEDIA_RECORDS_PER_BUILDING:
        summary["media_assets"].append(record)
    summary["representative_image_review_status"] = "media_matched_needs_visual_review"


def build_district_candidates(buildings, assignments, representative_rows):
    building_by_id = dict((row.get("building_id"), row) for row in buildings if row.get("building_id"))
    rep_ids_by_district = {}
    for row in representative_rows:
        key = (row.get("city"), row.get("neighborhood_name"))
        rep_ids_by_district.setdefault(key, set()).add(row.get("building_id"))

    district_buildings = {}
    building_to_districts = {}

    for district in DISTRICTS:
        records = {}
        neighborhoods = set(district["assignment_neighborhoods"])

        if district.get("city_fallback"):
            for building_id, canonical in building_by_id.items():
                if canonical.get("city") == district["city"] and canonical.get("state") == district["state_abbr"]:
                    records[building_id] = make_building_summary(building_id, canonical, {}, district)
        else:
            for assignment in assignments:
                if assignment.get("city") != district["city"] or assignment.get("state") != district["state_abbr"]:
                    continue
                if assignment.get("neighborhood_name") not in neighborhoods:
                    continue
                building_id = assignment.get("building_id")
                if not building_id:
                    continue
                canonical = building_by_id.get(building_id, {})
                records[building_id] = make_building_summary(building_id, canonical, assignment, district)

        for alias in district["assignment_neighborhoods"]:
            for building_id in rep_ids_by_district.get((district["city"], alias), set()):
                if not building_id:
                    continue
                canonical = building_by_id.get(building_id, {})
                if building_id not in records:
                    records[building_id] = make_building_summary(building_id, canonical, {"neighborhood_name": alias, "city": district["city"], "state": "CA", "assignment_confidence": "high"}, district)
                records[building_id]["representative_export_seed"] = True

        district_buildings[district["slug"]] = records
        for building_id in records:
            building_to_districts.setdefault(building_id, []).append(district["slug"])

    return district_buildings, building_to_districts, building_by_id


def scan_media(root, building_to_districts, district_buildings, building_by_id):
    scan = {
        "media_root": root,
        "exists": os.path.exists(root),
        "isdir": os.path.isdir(root),
        "scanned_files": 0,
        "parsed_media_filenames": 0,
        "matched_media_files": 0,
        "matched_building_ids": 0,
        "unmatched_media_building_id_count": 0,
        "canonical_non_target_media_building_id_count": 0,
        "errors": [],
    }
    matched_ids = set()
    unmatched_ids = set()
    canonical_non_target_ids = set()

    if not scan["exists"]:
        scan["errors"].append("Path not found: %s" % root)
        return scan, unmatched_ids, canonical_non_target_ids

    for current_dir, dir_names, file_names in os.walk(root):
        kept_dirs = []
        for dir_name in dir_names:
            full_dir = os.path.join(current_dir, dir_name)
            try:
                if not stat.S_ISLNK(os.lstat(full_dir).st_mode):
                    kept_dirs.append(dir_name)
            except OSError as error:
                if len(scan["errors"]) < 100:
                    scan["errors"].append("%s: %s" % (full_dir, error))
        dir_names[:] = kept_dirs

        for file_name in file_names:
            scan["scanned_files"] += 1
            if scan["scanned_files"] % PROGRESS_EVERY == 0:
                print(
                    "Scanned %s media files; matched %s target media files" % (
                        fmt_int(scan["scanned_files"]),
                        fmt_int(scan["matched_media_files"]),
                    ),
                    file=sys.stderr,
                )

            parsed = parse_media_name(file_name)
            if not parsed:
                continue
            scan["parsed_media_filenames"] += 1
            building_id = parsed["building_id"]
            district_slugs = building_to_districts.get(building_id)

            if not district_slugs:
                if building_id in building_by_id:
                    canonical_non_target_ids.add(building_id)
                else:
                    unmatched_ids.add(building_id)
                continue

            full_path = os.path.join(current_dir, file_name)
            try:
                st = os.lstat(full_path)
            except OSError as error:
                if len(scan["errors"]) < 100:
                    scan["errors"].append("%s: %s" % (full_path, error))
                continue
            if not stat.S_ISREG(st.st_mode):
                continue

            record = {
                "building_id": building_id,
                "media_hash": parsed["media_hash"],
                "extension": parsed["extension"],
                "derivative": derivative_for_path(full_path),
                "origin": "buildings5",
                "source_path": relpath(full_path, root),
                "bytes": int(st.st_size),
                "mtime": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(st.st_mtime)),
            }
            for slug in district_slugs:
                add_media_to_building(district_buildings[slug][building_id], record)
            matched_ids.add(building_id)
            scan["matched_media_files"] += 1

    scan["matched_building_ids"] = len(matched_ids)
    scan["unmatched_media_building_id_count"] = len(unmatched_ids)
    scan["canonical_non_target_media_building_id_count"] = len(canonical_non_target_ids)
    return scan, unmatched_ids, canonical_non_target_ids


def score_candidate(building):
    score = 0
    score += min(building["original_media_count"], 10) * 5
    score += min(building["derivative_media_count"], 10)
    score += min(int(building.get("listing_count") or 0), 100) / 10.0
    if building.get("district_assignment_confidence") == "high":
        score += 10
    elif building.get("district_assignment_confidence") == "medium":
        score += 5
    if building.get("building_record_confidence") == "high":
        score += 5
    if building.get("representative_export_seed"):
        score += 5
    return round(score, 2)


def sorted_buildings(records):
    buildings = records.values()
    for building in buildings:
        building["representative_image_score_placeholder"] = score_candidate(building)
    return sorted(
        buildings,
        key=lambda item: (
            item["media_count"],
            item["original_media_count"],
            item["representative_image_score_placeholder"],
            item.get("listing_count") or 0,
        ),
        reverse=True,
    )


def district_manifest(district, records):
    buildings = sorted_buildings(records)
    media_matched = [item for item in buildings if item["media_count"] > 0]
    return {
        "version": "v2",
        "generated_at": now_iso(),
        "public_ready": False,
        "district": {
            "slug": district["slug"],
            "name": district["name"],
            "city": district["city"],
            "state_abbr": district["state_abbr"],
        },
        "assignment_rules": {
            "assignment_neighborhoods": district["assignment_neighborhoods"],
            "assignment_source": district["assignment_source"],
            "district_assignment_confidence": district["district_assignment_confidence"],
            "city_fallback": bool(district.get("city_fallback")),
        },
        "coverage_summary": {
            "candidate_building_count": len(buildings),
            "media_matched_building_count": len(media_matched),
            "media_asset_count": sum(item["media_count"] for item in buildings),
            "original_media_asset_count": sum(item["original_media_count"] for item in buildings),
            "under_covered": len(media_matched) == 0,
        },
        "buildings": buildings[:500],
    }


def markdown_table(headers, rows):
    if not rows:
        return "_None._"
    lines = ["| %s |" % " | ".join(headers), "| %s |" % " | ".join(["---"] * len(headers))]
    for row in rows:
        lines.append("| %s |" % " | ".join([str(value) for value in row]))
    return "\n".join(lines)


def generate_report(manifests, scan):
    rows = []
    for manifest in manifests:
        summary = manifest["coverage_summary"]
        rows.append([
            manifest["district"]["name"],
            fmt_int(summary["candidate_building_count"]),
            fmt_int(summary["media_matched_building_count"]),
            fmt_int(summary["media_asset_count"]),
            fmt_int(summary["original_media_asset_count"]),
            "yes" if summary["under_covered"] else "no",
        ])

    strongest = sorted(
        manifests,
        key=lambda item: (
            item["coverage_summary"]["media_matched_building_count"],
            item["coverage_summary"]["original_media_asset_count"],
            item["coverage_summary"]["candidate_building_count"],
        ),
        reverse=True,
    )[:8]

    lines = []
    lines.append("# Bay Area Media Discovery V2")
    lines.append("")
    lines.append("This is a read-only discovery workflow for connecting recovered Rofo building media to broader Bay Area commercial district candidates. It does not publish imagery, upload to R2, optimize files, create thumbnails, generate galleries, or modify production media.")
    lines.append("")
    lines.append("## Workflow")
    lines.append("")
    lines.append("media filename -> building_id -> canonical building record -> city/state -> Bay Area district/corridor candidate -> representative-image candidate")
    lines.append("")
    lines.append("## V1 Production Baseline")
    lines.append("")
    lines.append("- V1 EC2 scan processed 3,322,483 media files.")
    lines.append("- V1 confirmed 337,050 original building images.")
    lines.append("- V1 confirmed 175,670 distinct building IDs with original images.")
    lines.append("- V1 representative pilot checked 80 target building IDs, matched 10 building IDs, and found 83 media files.")
    lines.append("")
    lines.append("## Scan Status")
    lines.append("")
    lines.append(markdown_table(
        ["Metric", "Value"],
        [
            ["Media root", scan["media_root"]],
            ["Exists", scan["exists"]],
            ["Is directory", scan["isdir"]],
            ["Scanned files", fmt_int(scan["scanned_files"])],
            ["Parsed media filenames", fmt_int(scan["parsed_media_filenames"])],
            ["Matched target media files", fmt_int(scan["matched_media_files"])],
            ["Matched target building IDs", fmt_int(scan["matched_building_ids"])],
            ["Unmatched media building IDs", fmt_int(scan["unmatched_media_building_id_count"])],
            ["Canonical non-target media building IDs", fmt_int(scan["canonical_non_target_media_building_id_count"])],
        ],
    ))
    lines.append("")
    lines.append("## District Media Coverage")
    lines.append("")
    lines.append(markdown_table(
        ["District", "Candidate buildings", "Media-matched buildings", "Media assets", "Original assets", "Under-covered"],
        rows,
    ))
    lines.append("")
    lines.append("## Strongest Visual Coverage Candidates")
    lines.append("")
    lines.append(markdown_table(
        ["District", "Media-matched buildings", "Original assets", "Candidate buildings"],
        [
            [
                item["district"]["name"],
                fmt_int(item["coverage_summary"]["media_matched_building_count"]),
                fmt_int(item["coverage_summary"]["original_media_asset_count"]),
                fmt_int(item["coverage_summary"]["candidate_building_count"]),
            ]
            for item in strongest
        ],
    ))
    lines.append("")
    lines.append("## Interpretation")
    lines.append("")
    if scan["scanned_files"] == 0:
        lines.append("This local run did not scan the mounted production media root, so the generated manifests show candidate district/building coverage but no observed image matches. Run this script on the Production APP EC2 instance to populate actual media coverage.")
    else:
        lines.append("Districts with stronger media-matched building counts should move first into human visual review. Districts with candidate building depth but low media coverage should remain in discovery until additional media sources or assignment rules are reviewed.")
    lines.append("")
    lines.append("## Guardrails")
    lines.append("")
    lines.append("- Media coverage is not a public inventory metric.")
    lines.append("- Representative imagery remains a reviewed presentation layer, not the intelligence source.")
    lines.append("- Historical media does not imply current availability, rents, vacancy, ownership, or listing status.")
    lines.append("- `representative_image_score_placeholder` is internal prioritization only and must not appear publicly.")
    lines.append("")
    lines.append("## Next Step")
    lines.append("")
    lines.append("Run V2 on EC2, review the strongest district/building image clusters, then create a human visual QA queue for candidate originals before any R2 migration or public image integration.")
    lines.append("")
    lines.append("Command:")
    lines.append("")
    lines.append("```bash")
    lines.append("/usr/bin/python scripts/media/bay_area_media_discovery_v2.py")
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def main():
    ensure_dir(OUTPUT_DIR)
    ensure_dir(os.path.dirname(REPORT_PATH))

    buildings = read_csv(BUILDING_SIGNALS)
    assignments = read_csv(DISTRICT_ASSIGNMENTS)
    representative_rows = read_csv(REPRESENTATIVE_BUILDINGS)

    district_buildings, building_to_districts, building_by_id = build_district_candidates(
        buildings,
        assignments,
        representative_rows,
    )

    scan, unmatched_ids, canonical_non_target_ids = scan_media(
        MEDIA_ROOT,
        building_to_districts,
        district_buildings,
        building_by_id,
    )

    manifests = []
    all_buildings = []
    all_candidates = []
    for district in DISTRICTS:
        manifest = district_manifest(district, district_buildings[district["slug"]])
        manifests.append(manifest)
        write_json(os.path.join(OUTPUT_DIR, "%s.json" % district["slug"]), manifest)
        all_buildings.extend(manifest["buildings"])
        all_candidates.extend([item for item in manifest["buildings"] if item["media_count"] > 0 or item.get("representative_export_seed")])

    coverage = {
        "version": "v2",
        "generated_at": now_iso(),
        "public_ready": False,
        "scan_summary": scan,
        "district_count": len(manifests),
        "target_building_id_count": len(building_to_districts),
        "districts": [
            {
                "district": manifest["district"],
                "coverage_summary": manifest["coverage_summary"],
                "assignment_rules": manifest["assignment_rules"],
            }
            for manifest in manifests
        ],
    }

    write_json(os.path.join(OUTPUT_DIR, "_manifest.json"), {
        "version": "v2",
        "generated_at": now_iso(),
        "public_ready": False,
        "files": [district["slug"] + ".json" for district in DISTRICTS] + [
            "bay_area_district_media_coverage.json",
            "building_media_summaries.json",
            "representative_image_candidates.json",
            "unmatched_media_building_ids.json",
        ],
        "notes": [
            "Read-only discovery output.",
            "No images are published or modified.",
            "Human visual review is required before any public use.",
        ],
    })
    write_json(os.path.join(OUTPUT_DIR, "bay_area_district_media_coverage.json"), coverage)
    write_json(os.path.join(OUTPUT_DIR, "building_media_summaries.json"), {
        "version": "v2",
        "generated_at": now_iso(),
        "public_ready": False,
        "buildings": sorted(all_buildings, key=lambda item: (item["media_count"], item["original_media_count"], item["representative_image_score_placeholder"]), reverse=True)[:5000],
    })
    write_json(os.path.join(OUTPUT_DIR, "representative_image_candidates.json"), {
        "version": "v2",
        "generated_at": now_iso(),
        "public_ready": False,
        "candidates": sorted(all_candidates, key=lambda item: (item["media_count"], item["original_media_count"], item["representative_image_score_placeholder"]), reverse=True)[:2000],
    })
    write_json(os.path.join(OUTPUT_DIR, "unmatched_media_building_ids.json"), {
        "version": "v2",
        "generated_at": now_iso(),
        "unmatched_media_building_id_count": len(unmatched_ids),
        "canonical_non_target_media_building_id_count": len(canonical_non_target_ids),
        "unmatched_media_building_id_samples": sorted(list(unmatched_ids))[:MAX_UNMATCHED_ID_SAMPLES],
        "canonical_non_target_media_building_id_samples": sorted(list(canonical_non_target_ids))[:MAX_UNMATCHED_ID_SAMPLES],
    })
    write_text(REPORT_PATH, generate_report(manifests, scan))

    print("Wrote Bay Area Media Discovery V2 outputs to %s" % OUTPUT_DIR, file=sys.stderr)
    print("Wrote report to %s" % REPORT_PATH, file=sys.stderr)


if __name__ == "__main__":
    main()
