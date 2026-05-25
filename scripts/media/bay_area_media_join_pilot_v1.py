#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bay Area Media Join Pilot V1

Python 2 compatible, standard-library-only scanner for the old Production APP
EC2 instance. It reads the repo's Bay Area representative-building CSV, scans
recovered building media paths, and writes a target-district media join output.

Read-only: does not move, delete, optimize, upload, rename, or modify media.
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
OUTPUT_DIR = "data/media/generated/bay_area_district_media_ec2"
REPRESENTATIVE_BUILDINGS = "data/peter/derived/bay_area_representative_buildings.csv"
BUILDING_SIGNALS = "data/peter/derived/building_signals.csv"
PROGRESS_EVERY = 50000
MAX_MEDIA_PER_BUILDING = 200

TARGETS = [
    ("downtown-oakland", "Downtown Oakland", "Oakland", ["Downtown Oakland"]),
    ("uptown-oakland", "Uptown Oakland", "Oakland", ["Uptown Oakland"]),
    ("jack-london-square", "Jack London Square", "Oakland", ["Jack London Square"]),
    ("financial-district-sf", "Financial District SF", "San Francisco", ["Financial District"]),
    ("downtown-palo-alto", "Downtown Palo Alto", "Palo Alto", ["Downtown Palo Alto"]),
    ("mission-bay", "Mission Bay", "San Francisco", ["Mission Bay"]),
    ("soma", "SoMa", "San Francisco", ["SOMA", "SoMa"]),
    ("south-san-francisco-biotech-corridor", "South San Francisco Biotech Corridor", "South San Francisco", ["South San Francisco Biotech Corridor"]),
]

MEDIA_RE = re.compile(r"^(\d+)_([A-Za-z0-9_-]+)(\.[^.]+)$")


def ensure_dir(path):
    if not os.path.isdir(path):
        os.makedirs(path)


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def read_csv(path):
    mode = "rb" if sys.version_info[0] < 3 else "r"
    kwargs = {} if sys.version_info[0] < 3 else {"newline": ""}
    with open(path, mode, **kwargs) as handle:
        reader = csv.DictReader(handle)
        return [row for row in reader]


def write_json(path, data):
    with codecs.open(path, "w", "utf-8") as handle:
        json.dump(data, handle, indent=2, sort_keys=True)
        handle.write(u"\n")


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


def build_target_maps(rep_rows):
    targets_by_slug = {}
    building_to_districts = {}
    wanted_ids = set()

    for slug, name, city, aliases in TARGETS:
        rows = [
            row for row in rep_rows
            if row.get("city") == city and row.get("neighborhood_name") in aliases
        ]
        targets_by_slug[slug] = {
            "slug": slug,
            "name": name,
            "city": city,
            "state_abbr": "CA",
            "aliases": aliases,
            "candidate_buildings": rows,
        }
        for row in rows:
            building_id = row.get("building_id")
            if not building_id:
                continue
            wanted_ids.add(building_id)
            building_to_districts.setdefault(building_id, []).append(slug)

    return targets_by_slug, building_to_districts, wanted_ids


def scan_media(root, wanted_ids, building_to_districts):
    matched_by_building = {}
    errors = []
    scanned = 0
    parsed = 0
    matched = 0

    if not os.path.exists(root):
        return matched_by_building, {
            "media_root": root,
            "exists": False,
            "isdir": False,
            "scanned_files": 0,
            "parsed_media_filenames": 0,
            "matched_media_files": 0,
            "errors": ["Path not found: %s" % root],
        }

    for current_dir, dir_names, file_names in os.walk(root):
        kept = []
        for dir_name in dir_names:
            full_dir = os.path.join(current_dir, dir_name)
            try:
                if not stat.S_ISLNK(os.lstat(full_dir).st_mode):
                    kept.append(dir_name)
            except OSError as error:
                if len(errors) < 100:
                    errors.append("%s: %s" % (full_dir, error))
        dir_names[:] = kept

        for file_name in file_names:
            scanned += 1
            if scanned % PROGRESS_EVERY == 0:
                print("Scanned %s media files; matched %s target files" % (scanned, matched), file=sys.stderr)

            parsed_name = parse_media_name(file_name)
            if not parsed_name:
                continue
            parsed += 1
            building_id = parsed_name["building_id"]
            if building_id not in wanted_ids:
                continue

            full_path = os.path.join(current_dir, file_name)
            try:
                st = os.lstat(full_path)
            except OSError as error:
                if len(errors) < 100:
                    errors.append("%s: %s" % (full_path, error))
                continue

            if not stat.S_ISREG(st.st_mode):
                continue

            record = {
                "building_id": building_id,
                "media_hash": parsed_name["media_hash"],
                "extension": parsed_name["extension"],
                "derivative": derivative_for_path(full_path),
                "origin": "buildings5",
                "source_path": relpath(full_path, root),
                "bytes": int(st.st_size),
                "mtime": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(st.st_mtime)),
            }
            bucket = matched_by_building.setdefault(building_id, [])
            if len(bucket) < MAX_MEDIA_PER_BUILDING:
                bucket.append(record)
            matched += 1

    return matched_by_building, {
        "media_root": root,
        "exists": os.path.exists(root),
        "isdir": os.path.isdir(root),
        "scanned_files": scanned,
        "parsed_media_filenames": parsed,
        "matched_media_files": matched,
        "matched_building_ids": len(matched_by_building),
        "errors": errors,
    }


def main():
    ensure_dir(OUTPUT_DIR)
    rep_rows = read_csv(REPRESENTATIVE_BUILDINGS)
    building_rows = read_csv(BUILDING_SIGNALS)
    building_by_id = dict((row.get("building_id"), row) for row in building_rows)

    targets_by_slug, building_to_districts, wanted_ids = build_target_maps(rep_rows)
    matched_by_building, scan_summary = scan_media(MEDIA_ROOT, wanted_ids, building_to_districts)

    district_files = []
    all_candidates = []
    for slug, target in targets_by_slug.items():
        buildings = []
        for row in target["candidate_buildings"]:
            building_id = row.get("building_id")
            canonical = building_by_id.get(building_id, {})
            media = matched_by_building.get(building_id, [])
            building = {
                "building_id": building_id,
                "building_name": row.get("building_name") or canonical.get("name") or "",
                "address": row.get("address") or canonical.get("address") or "",
                "city": target["city"],
                "state_abbr": "CA",
                "listing_count": int(float(row.get("listing_count") or 0)),
                "historical_activity_bucket": row.get("activity_bucket") or canonical.get("activity_bucket") or "",
                "district_assignment_confidence": row.get("assignment_confidence") or "",
                "district_assignment_distance_km": float(row.get("assignment_distance_km") or 0),
                "media_count": len(media),
                "original_media_count": len([item for item in media if item.get("derivative") == "orig"]),
                "derivative_media_count": len([item for item in media if item.get("derivative") != "orig"]),
                "media_assets": media,
                "representative_image_candidate": True,
                "representative_image_candidate_status": "media_matched_review_candidate" if media else "building_supported_needs_media_match",
                "confidence_level": "high" if media and row.get("assignment_confidence") == "high" else "medium",
                "review_notes": "Human visual review required before public use." if media else "No recovered media matched in this EC2 scan output.",
            }
            buildings.append(building)
            with_district = dict(building)
            with_district["district_slug"] = slug
            with_district["district_name"] = target["name"]
            all_candidates.append(with_district)

        output = {
            "version": "v1",
            "generated_at": now_iso(),
            "public_ready": False,
            "district": {
                "slug": slug,
                "name": target["name"],
                "city": target["city"],
                "state_abbr": "CA",
            },
            "coverage_summary": {
                "representative_candidate_count": len(buildings),
                "media_matched_representative_building_count": len([item for item in buildings if item["media_count"] > 0]),
                "observed_media_asset_count": sum(item["media_count"] for item in buildings),
            },
            "buildings": buildings,
        }
        file_name = "%s.json" % slug
        district_files.append(file_name)
        write_json(os.path.join(OUTPUT_DIR, file_name), output)

    write_json(os.path.join(OUTPUT_DIR, "representative_image_candidates.json"), {
        "version": "v1",
        "generated_at": now_iso(),
        "public_ready": False,
        "candidates": all_candidates,
    })
    write_json(os.path.join(OUTPUT_DIR, "bay_area_media_coverage_summary.json"), {
        "version": "v1",
        "generated_at": now_iso(),
        "public_ready": False,
        "scan_summary": scan_summary,
        "target_district_count": len(targets_by_slug),
        "target_building_id_count": len(wanted_ids),
        "district_files": district_files,
    })
    write_json(os.path.join(OUTPUT_DIR, "_manifest.json"), {
        "version": "v1",
        "generated_at": now_iso(),
        "public_ready": False,
        "files": district_files + ["representative_image_candidates.json", "bay_area_media_coverage_summary.json"],
        "notes": [
            "Read-only EC2 media join pilot.",
            "Does not publish, optimize, upload, move, or delete media.",
            "Human review required before public imagery use.",
        ],
    })

    print("Wrote Bay Area EC2 media join outputs to %s" % OUTPUT_DIR, file=sys.stderr)


if __name__ == "__main__":
    main()
