#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Original Image Index V1

Python 2 compatible, standard-library-only indexer for Rofo's recovered
building original image archive.

Read-only: does not move, delete, optimize, upload, rename, or modify files.
"""

from __future__ import print_function

import codecs
import csv
import errno
import json
import os
import re
import stat
import sys
import time


ORIG_ROOT = "/ebs2/rofo/content/buildings5/orig"
EC2_OUTPUT_DIR = "/home/ec2-user/original_image_index_v1_output"
REPO_OUTPUT_DIR = "data/media/generated/original_image_index_v1"
REPO_REPORT_PATH = "data/media/reports/original_image_index_v1.md"

PROGRESS_EVERY = 50000
TOP_BUILDING_LIMIT = 100
LARGEST_FILE_LIMIT = 100
INVALID_SAMPLE_LIMIT = 1000

BUILDING_ID_RE = re.compile(r"^([0-9]+)_")
HASH_PART_RE = re.compile(r"^[0-9]+_([A-Za-z0-9_-]+)\.[^.]+$")
ACCEPTED_IMAGE_EXTENSIONS = set([".jpg", ".jpeg", ".png", ".gif", ".webp"])


def ensure_dir(path):
    if not os.path.isdir(path):
        os.makedirs(path)


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def iso_time(timestamp):
    try:
        return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp))
    except Exception:
        return None


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


def fmt_bytes(value):
    try:
        amount = float(value or 0)
    except Exception:
        amount = 0.0
    units = ["B", "KB", "MB", "GB", "TB"]
    index = 0
    while amount >= 1024.0 and index < len(units) - 1:
        amount /= 1024.0
        index += 1
    if index == 0 or amount >= 10:
        return "%d %s" % (round(amount), units[index])
    return "%.1f %s" % (amount, units[index])


def parse_args(argv):
    output_dir = EC2_OUTPUT_DIR
    repo_mirror = False
    root = ORIG_ROOT
    index = 1
    while index < len(argv):
        arg = argv[index]
        if arg == "--output-dir" and index + 1 < len(argv):
            output_dir = argv[index + 1]
            index += 2
        elif arg == "--root" and index + 1 < len(argv):
            root = argv[index + 1]
            index += 2
        elif arg == "--repo-mirror":
            repo_mirror = True
            index += 1
        elif arg in ("-h", "--help"):
            print("Usage: /usr/bin/python scripts/media/original_image_index_v1.py [--output-dir PATH] [--root PATH] [--repo-mirror]")
            sys.exit(0)
        else:
            print("Unknown argument: %s" % arg, file=sys.stderr)
            sys.exit(2)
    return root, output_dir, repo_mirror


def write_json(path, data):
    with codecs.open(path, "w", "utf-8") as handle:
        json.dump(data, handle, indent=2, sort_keys=True)
        handle.write(u"\n")


def write_json_compact(path, data):
    with codecs.open(path, "w", "utf-8") as handle:
        json.dump(data, handle, sort_keys=True, separators=(",", ":"))
        handle.write(u"\n")


def write_text(path, text):
    with codecs.open(path, "w", "utf-8") as handle:
        handle.write(text)
        if not text.endswith("\n"):
            handle.write(u"\n")


def markdown_table(headers, rows):
    if not rows:
        return "_None._"
    lines = ["| %s |" % " | ".join(headers), "| %s |" % " | ".join(["---"] * len(headers))]
    for row in rows:
        lines.append("| %s |" % " | ".join([str(value) for value in row]))
    return "\n".join(lines)


def parse_media_filename(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ACCEPTED_IMAGE_EXTENSIONS:
        return None
    match = BUILDING_ID_RE.match(filename)
    if not match:
        return None
    hash_match = HASH_PART_RE.match(filename)
    return {
        "building_id": match.group(1),
        "hash_part": hash_match.group(1) if hash_match else None,
        "extension": ext,
    }


def relpath(path, root):
    try:
        return os.path.relpath(path, root)
    except Exception:
        if path.startswith(root):
            return path[len(root):].lstrip(os.sep)
        return path


def update_largest(largest, record):
    largest.append(record)
    largest.sort(key=lambda item: item["size_bytes"], reverse=True)
    if len(largest) > LARGEST_FILE_LIMIT:
        del largest[LARGEST_FILE_LIMIT:]


def scan_originals(root):
    index = {}
    extension_counts = {}
    extension_bytes = {}
    invalid = []
    largest = []
    errors = []
    unsupported_extension_samples = []
    unsupported_extension_count = 0
    total_files = 0
    total_bytes = 0
    pattern_matches = 0
    pattern_misses = 0
    oldest = None
    newest = None

    exists = os.path.exists(root)
    isdir = os.path.isdir(root)
    listdir_sample = []
    listdir_error = None

    if exists:
        try:
            listdir_sample = os.listdir(root)[:20]
        except OSError as error:
            listdir_error = str(error)
            errors.append("%s: %s" % (root, error))

    if not exists:
        errors.append("Path not found: %s" % root)
        return {
            "index": index,
            "extension_counts": extension_counts,
            "extension_bytes": extension_bytes,
            "invalid": invalid,
            "largest": largest,
            "summary": {
                "generated_at": now_iso(),
                "root": root,
                "exists": exists,
                "isdir": isdir,
                "listdir_sample": listdir_sample,
                "listdir_error": listdir_error,
                "total_original_images": 0,
                "distinct_building_ids": 0,
                "total_bytes": 0,
                "total_size": "0 B",
                "pattern_matches": 0,
                "pattern_misses": 0,
                "unsupported_extension_count": 0,
                "unsupported_extension_samples": [],
                "oldest": None,
                "newest": None,
                "errors": errors,
            },
        }

    for current_dir, dir_names, file_names in os.walk(root):
        kept_dirs = []
        for dirname in dir_names:
            full_dir = os.path.join(current_dir, dirname)
            try:
                if not stat.S_ISLNK(os.lstat(full_dir).st_mode):
                    kept_dirs.append(dirname)
            except OSError as error:
                if len(errors) < 100:
                    errors.append("%s: %s" % (full_dir, error))
        dir_names[:] = kept_dirs

        for filename in file_names:
            full_path = os.path.join(current_dir, filename)
            try:
                st = os.lstat(full_path)
            except OSError as error:
                if len(errors) < 100:
                    errors.append("%s: %s" % (full_path, error))
                continue
            if not stat.S_ISREG(st.st_mode):
                continue

            size = int(st.st_size)
            ext = os.path.splitext(filename)[1].lower() or "[none]"
            if ext not in ACCEPTED_IMAGE_EXTENSIONS:
                unsupported_extension_count += 1
                if len(unsupported_extension_samples) < INVALID_SAMPLE_LIMIT:
                    unsupported_extension_samples.append({
                        "filename": filename,
                        "relative_path": relpath(full_path, root),
                        "absolute_path": full_path,
                        "extension": ext,
                        "size_bytes": size,
                        "mtime": iso_time(st.st_mtime),
                    })
                continue

            total_files += 1
            total_bytes += size
            if total_files % PROGRESS_EVERY == 0:
                print("Indexed %s original images (%s)" % (fmt_int(total_files), fmt_bytes(total_bytes)), file=sys.stderr)

            parsed = parse_media_filename(filename)
            relative_path = relpath(full_path, root)
            extension_counts[ext] = extension_counts.get(ext, 0) + 1
            extension_bytes[ext] = extension_bytes.get(ext, 0) + size

            time_record = {
                "filename": filename,
                "relative_path": relative_path,
                "mtime": iso_time(st.st_mtime),
                "mtime_epoch": st.st_mtime,
            }
            if oldest is None or st.st_mtime < oldest["mtime_epoch"]:
                oldest = time_record
            if newest is None or st.st_mtime > newest["mtime_epoch"]:
                newest = time_record

            file_record = {
                "filename": filename,
                "relative_path": relative_path,
                "absolute_path": full_path,
                "extension": ext,
                "size_bytes": size,
                "mtime": iso_time(st.st_mtime),
            }

            if parsed:
                pattern_matches += 1
                file_record["building_id"] = parsed["building_id"]
                file_record["hash_part"] = parsed["hash_part"]
                index.setdefault(parsed["building_id"], []).append(file_record)
            else:
                pattern_misses += 1
                if len(invalid) < INVALID_SAMPLE_LIMIT:
                    invalid.append(file_record)

            update_largest(largest, file_record)

    return {
        "index": index,
        "extension_counts": extension_counts,
        "extension_bytes": extension_bytes,
        "invalid": invalid,
        "largest": largest,
        "summary": {
            "generated_at": now_iso(),
            "root": root,
            "exists": exists,
            "isdir": isdir,
            "listdir_sample": listdir_sample,
            "listdir_error": listdir_error,
            "total_original_images": total_files,
            "distinct_building_ids": len(index),
            "total_bytes": total_bytes,
            "total_size": fmt_bytes(total_bytes),
            "pattern_matches": pattern_matches,
            "pattern_misses": pattern_misses,
            "unsupported_extension_count": unsupported_extension_count,
            "unsupported_extension_samples": unsupported_extension_samples,
            "oldest": oldest,
            "newest": newest,
            "errors": errors,
        },
    }


def top_buildings(index):
    rows = []
    for building_id, images in index.items():
        total_bytes = sum([item.get("size_bytes", 0) for item in images])
        rows.append({
            "building_id": building_id,
            "original_image_count": len(images),
            "total_bytes": total_bytes,
            "total_size": fmt_bytes(total_bytes),
            "sample_image": images[0]["relative_path"] if images else None,
        })
    rows.sort(key=lambda item: (item["original_image_count"], item["total_bytes"]), reverse=True)
    return rows[:TOP_BUILDING_LIMIT]


def extension_breakdown(extension_counts, extension_bytes):
    rows = []
    for ext, count in extension_counts.items():
        rows.append({
            "extension": ext,
            "count": count,
            "bytes": extension_bytes.get(ext, 0),
            "size": fmt_bytes(extension_bytes.get(ext, 0)),
        })
    rows.sort(key=lambda item: item["count"], reverse=True)
    return rows


def summary_report(summary, top_rows, extensions, largest, invalid):
    lines = []
    lines.append("# Original Image Index V1")
    lines.append("")
    lines.append("This is a read-only index of original Rofo building images in `/ebs2/rofo/content/buildings5/orig`. It is preservation and discovery infrastructure only; it does not publish, upload, optimize, delete, move, or modify media.")
    lines.append("")
    lines.append("## Scan Summary")
    lines.append("")
    lines.append(markdown_table(
        ["Metric", "Value"],
        [
            ["Root", summary["root"]],
            ["Exists", summary["exists"]],
            ["Is directory", summary["isdir"]],
            ["Total original images", fmt_int(summary["total_original_images"])],
            ["Distinct building IDs", fmt_int(summary["distinct_building_ids"])],
            ["Total size", summary["total_size"]],
            ["Pattern matches", fmt_int(summary["pattern_matches"])],
            ["Pattern misses", fmt_int(summary["pattern_misses"])],
            ["Unsupported extension files skipped", fmt_int(summary.get("unsupported_extension_count", 0))],
            ["Oldest file", summary["oldest"]["mtime"] if summary["oldest"] else ""],
            ["Newest file", summary["newest"]["mtime"] if summary["newest"] else ""],
            ["Errors captured", fmt_int(len(summary.get("errors", [])))],
        ],
    ))
    lines.append("")
    lines.append("## Confirmed Archive Context")
    lines.append("")
    lines.append("- Expected originals path: `/ebs2/rofo/content/buildings5/orig`.")
    lines.append("- The `orig` directory is expected to contain flat files directly under that path, for example `2871369_8eb82639636133058541cbc82b68604a.jpg`.")
    lines.append("- Building IDs are parsed from the filename prefix before the first underscore, using `^([0-9]+)_`; for example `2871369_...jpg` maps to building ID `2871369`.")
    lines.append("- Accepted original image extensions are `.jpg`, `.jpeg`, `.png`, `.gif`, and `.webp`, matched case-insensitively.")
    lines.append("- Previously confirmed original building images: 337,050.")
    lines.append("- Previously confirmed original image volume: 342GB.")
    lines.append("- Previously confirmed distinct building IDs with originals: 175,670.")
    lines.append("")
    lines.append("## Extension Distribution")
    lines.append("")
    lines.append(markdown_table(
        ["Extension", "Images", "Size"],
        [[item["extension"], fmt_int(item["count"]), item["size"]] for item in extensions[:25]],
    ))
    lines.append("")
    lines.append("## Top Buildings By Original Image Count")
    lines.append("")
    lines.append(markdown_table(
        ["Building ID", "Original images", "Size", "Sample image"],
        [[item["building_id"], fmt_int(item["original_image_count"]), item["total_size"], item["sample_image"]] for item in top_rows[:25]],
    ))
    lines.append("")
    lines.append("## Largest Original Files")
    lines.append("")
    lines.append(markdown_table(
        ["Filename", "Building ID", "Size", "Relative path"],
        [[item.get("filename", ""), item.get("building_id", ""), fmt_bytes(item.get("size_bytes", 0)), item.get("relative_path", "")] for item in largest[:25]],
    ))
    lines.append("")
    lines.append("## Invalid Filename Pattern Samples")
    lines.append("")
    lines.append(markdown_table(
        ["Filename", "Relative path", "Size"],
        [[item.get("filename", ""), item.get("relative_path", ""), fmt_bytes(item.get("size_bytes", 0))] for item in invalid[:25]],
    ))
    lines.append("")
    lines.append("## Strategic Use")
    lines.append("")
    lines.append("This index should become the stable lookup layer for district media discovery, representative imagery review, preview extraction, accepted image export, and future curated R2 upload planning. Future workflows should query this index instead of repeatedly scanning the full 3.3M-file `buildings5` corpus.")
    lines.append("")
    lines.append("## Guardrails")
    lines.append("")
    lines.append("- This is not a public image feed.")
    lines.append("- Do not expose absolute archive paths publicly.")
    lines.append("- Do not treat image count as public district or building coverage.")
    lines.append("- Human review remains required before representative imagery is accepted for any public use.")
    lines.append("")
    lines.append("## EC2 Command")
    lines.append("")
    lines.append("Run on the Production APP EC2 instance from the repo root:")
    lines.append("")
    lines.append("```bash")
    lines.append("/usr/bin/python scripts/media/original_image_index_v1.py")
    lines.append("```")
    lines.append("")
    lines.append("To also mirror the generated index into the repo working tree for review:")
    lines.append("")
    lines.append("```bash")
    lines.append("/usr/bin/python scripts/media/original_image_index_v1.py --repo-mirror")
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def write_outputs(output_dir, result):
    ensure_dir(output_dir)
    index = result["index"]
    summary = result["summary"]
    extensions = extension_breakdown(result["extension_counts"], result["extension_bytes"])
    top_rows = top_buildings(index)

    write_json_compact(os.path.join(output_dir, "original_images_by_building_id.json"), index)
    write_json(os.path.join(output_dir, "original_image_index_summary.json"), {
        "version": "v1",
        "summary": summary,
        "top_buildings_by_original_image_count": top_rows,
    })
    write_json(os.path.join(output_dir, "original_image_extension_breakdown.json"), {
        "version": "v1",
        "extensions": extensions,
    })
    write_json(os.path.join(output_dir, "original_image_largest_files.json"), {
        "version": "v1",
        "largest_files": result["largest"],
    })
    write_json(os.path.join(output_dir, "invalid_filename_pattern_report.json"), {
        "version": "v1",
        "invalid_sample_count": len(result["invalid"]),
        "invalid_filename_samples": result["invalid"],
        "unsupported_extension_count": result["summary"].get("unsupported_extension_count", 0),
        "unsupported_extension_samples": result["summary"].get("unsupported_extension_samples", []),
    })
    write_text(
        os.path.join(output_dir, "original_image_index_v1.md"),
        summary_report(summary, top_rows, extensions, result["largest"], result["invalid"]),
    )


def mirror_repo_report(result):
    ensure_dir(REPO_OUTPUT_DIR)
    ensure_dir(os.path.dirname(REPO_REPORT_PATH))
    write_outputs(REPO_OUTPUT_DIR, result)
    summary = result["summary"]
    extensions = extension_breakdown(result["extension_counts"], result["extension_bytes"])
    top_rows = top_buildings(result["index"])
    write_text(REPO_REPORT_PATH, summary_report(summary, top_rows, extensions, result["largest"], result["invalid"]))


def main():
    root, output_dir, repo_mirror = parse_args(sys.argv)
    print("Indexing original images from %s" % root, file=sys.stderr)
    result = scan_originals(root)
    write_outputs(output_dir, result)
    print("Wrote Original Image Index V1 output to %s" % output_dir, file=sys.stderr)
    if repo_mirror:
        mirror_repo_report(result)
        print("Mirrored output to %s and %s" % (REPO_OUTPUT_DIR, REPO_REPORT_PATH), file=sys.stderr)


if __name__ == "__main__":
    main()
