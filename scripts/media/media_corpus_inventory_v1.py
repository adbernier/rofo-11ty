#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Rofo Media Corpus Inventory V1

Python 2 compatible, standard-library-only inventory script for the old
Production APP EC2 instance.

This script is read-only. It does not move, delete, optimize, upload, or modify
media files.
"""

from __future__ import print_function

import codecs
import errno
import heapq
import json
import os
import re
import stat
import sys
import time


try:
    text_type = unicode  # noqa: F821  pylint: disable=undefined-variable
except NameError:
    text_type = str

DEFAULT_OUTPUT_DIR = "/home/ec2-user/media_inventory_output"
DEFAULT_SAMPLE_LIMIT = 250
DEFAULT_LARGEST_LIMIT = 50

ROOTS = [
    {
        "key": "buildings5",
        "label": "Building media",
        "path": "/ebs2/rofo/content/buildings5",
        "known_size": "620G",
        "known_notes": [
            "Confirmed total volume: 620G",
            "Confirmed orig volume: 342G",
            "Confirmed orig files: 337,050",
            "Confirmed distinct building IDs represented in orig: 175,670",
        ],
    },
    {
        "key": "listings4",
        "label": "Listing media",
        "path": "/ebs2/rofo/content/listings4",
        "known_size": "84G",
        "known_notes": ["Confirmed total volume: 84G"],
    },
    {
        "key": "pdfs",
        "label": "PDF media",
        "path": "/ebs1/rofo/www/content/pdfs",
        "known_size": "2.7G",
        "known_notes": ["Confirmed total volume: 2.7G"],
    },
]

DERIVATIVE_FOLDERS = set(["orig", "standard", "thumb", "smthumb"])
BUILDING_FILE_RE = re.compile(r"^(\d+)_([A-Za-z0-9_-]+)(\.[^.]+)$")


def safe_unicode(value):
    if isinstance(value, text_type):
        return value
    if value is None:
        return u""
    try:
        return value.decode("utf-8")
    except Exception:
        try:
            return value.decode("latin-1")
        except Exception:
            return text_type(value)


def ensure_dir(path):
    if not os.path.isdir(path):
        os.makedirs(path)


def write_text(path, text):
    with codecs.open(path, "w", "utf-8") as handle:
        handle.write(safe_unicode(text))
        if not text.endswith("\n"):
            handle.write(u"\n")


def write_json(path, data):
    with codecs.open(path, "w", "utf-8") as handle:
        json.dump(data, handle, indent=2, sort_keys=True)
        handle.write(u"\n")


def fmt_int(value):
    try:
        raw = str(int(value))
    except Exception:
        return str(value)
    parts = []
    while raw:
        parts.append(raw[-3:])
        raw = raw[:-3]
    return ",".join(reversed(parts))


def parse_cli_args(argv):
    args = {
        "output_dir": DEFAULT_OUTPUT_DIR,
        "sample_limit": DEFAULT_SAMPLE_LIMIT,
        "largest_limit": DEFAULT_LARGEST_LIMIT,
    }
    index = 1
    while index < len(argv):
        arg = argv[index]
        if arg == "--output-dir" and index + 1 < len(argv):
            args["output_dir"] = argv[index + 1]
            index += 2
        elif arg == "--sample-limit" and index + 1 < len(argv):
            args["sample_limit"] = int(argv[index + 1])
            index += 2
        elif arg == "--largest-limit" and index + 1 < len(argv):
            args["largest_limit"] = int(argv[index + 1])
            index += 2
        elif arg in ("-h", "--help"):
            print("Usage: /usr/bin/python scripts/media/media_corpus_inventory_v1.py [--output-dir PATH] [--sample-limit N] [--largest-limit N]")
            sys.exit(0)
        else:
            print("Unknown argument: %s" % arg, file=sys.stderr)
            sys.exit(2)
    return args


def fmt_bytes(num_bytes):
    try:
        value = float(num_bytes)
    except Exception:
        return "0 B"
    units = ["B", "KB", "MB", "GB", "TB", "PB"]
    index = 0
    while value >= 1024.0 and index < len(units) - 1:
        value /= 1024.0
        index += 1
    if index == 0 or value >= 10:
        return "%d %s" % (round(value), units[index])
    return "%.1f %s" % (value, units[index])


def increment(mapping, key, amount=1):
    mapping[key] = mapping.get(key, 0) + amount


def top_items(mapping, limit):
    return sorted(mapping.items(), key=lambda item: item[1], reverse=True)[:limit]


def markdown_table(headers, rows):
    if not rows:
        return "_None._"
    lines = []
    lines.append("| %s |" % " | ".join(headers))
    lines.append("| %s |" % " | ".join(["---"] * len(headers)))
    for row in rows:
        lines.append("| %s |" % " | ".join([safe_unicode(cell) for cell in row]))
    return "\n".join(lines)


def relpath(path, root):
    try:
        return os.path.relpath(path, root)
    except Exception:
        if path.startswith(root):
            return path[len(root):].lstrip(os.sep)
        return path


def derivative_for_path(file_path, root_path):
    relative = relpath(file_path, root_path)
    first = relative.split(os.sep)[0] if relative else ""
    if first in DERIVATIVE_FOLDERS:
        return first
    return "unclassified"


def parse_media_name(file_name):
    match = BUILDING_FILE_RE.match(file_name)
    ext = os.path.splitext(file_name)[1].lower() or "[none]"
    if not match:
        return {
            "matches_building_pattern": False,
            "building_id": None,
            "hash": None,
            "extension": ext,
        }
    return {
        "matches_building_pattern": True,
        "building_id": match.group(1),
        "hash": match.group(2),
        "extension": match.group(3).lower(),
    }


def iso_time(timestamp):
    try:
        return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp))
    except Exception:
        return None


def init_summary(root_config):
    return {
        "key": root_config["key"],
        "label": root_config["label"],
        "path": root_config["path"],
        "known_size": root_config.get("known_size"),
        "known_notes": root_config.get("known_notes", []),
        "accessible": False,
        "started_at": iso_time(time.time()),
        "finished_at": None,
        "file_count": 0,
        "directory_count": 0,
        "total_bytes": 0,
        "extension_counts": {},
        "extension_bytes": {},
        "derivative_counts": {},
        "derivative_bytes": {},
        "building_id_counts": {},
        "building_orig_counts": {},
        "pattern_matches": 0,
        "pattern_misses": 0,
        "oldest": None,
        "newest": None,
        "largest_files": [],
        "samples": [],
        "permission_errors": [],
        "stat_errors": [],
        "walk_errors": [],
        "debug": {
            "exists": None,
            "isdir": None,
            "listdir_ok": False,
            "listdir_error": None,
            "listdir_sample": [],
            "walk_yielded": False,
        },
    }


def update_oldest_newest(summary, rel_file, mtime):
    record = {"path": rel_file, "mtime": iso_time(mtime), "mtime_epoch": mtime}
    if summary["oldest"] is None or mtime < summary["oldest"]["mtime_epoch"]:
        summary["oldest"] = record
    if summary["newest"] is None or mtime > summary["newest"]["mtime_epoch"]:
        summary["newest"] = record


def update_largest(summary, record, limit):
    heap = summary["_largest_heap"]
    item = (record["bytes"], record["path"], record)
    if len(heap) < limit:
        heapq.heappush(heap, item)
    elif record["bytes"] > heap[0][0]:
        heapq.heapreplace(heap, item)


def on_walk_error(summary):
    def handler(error):
        path = getattr(error, "filename", None) or str(error)
        message = "%s: %s" % (path, error)
        if getattr(error, "errno", None) in (errno.EACCES, errno.EPERM):
            if len(summary["permission_errors"]) < 100:
                summary["permission_errors"].append(message)
        else:
            if len(summary["walk_errors"]) < 100:
                summary["walk_errors"].append(message)
    return handler


def scan_root(root_config, sample_limit, largest_limit):
    summary = init_summary(root_config)
    root_path = root_config["path"]
    summary["_largest_heap"] = []

    summary["debug"]["exists"] = os.path.exists(root_path)
    summary["debug"]["isdir"] = os.path.isdir(root_path)

    if summary["debug"]["exists"]:
        try:
            entries = os.listdir(root_path)
            summary["debug"]["listdir_ok"] = True
            summary["debug"]["listdir_sample"] = entries[:20]
        except OSError as error:
            summary["debug"]["listdir_error"] = str(error)
            if getattr(error, "errno", None) in (errno.EACCES, errno.EPERM):
                if len(summary["permission_errors"]) < 100:
                    summary["permission_errors"].append("%s: %s" % (root_path, error))
            else:
                if len(summary["walk_errors"]) < 100:
                    summary["walk_errors"].append("%s: %s" % (root_path, error))

    if not summary["debug"]["exists"]:
        summary["walk_errors"].append("Path not found: %s" % root_path)
        summary["finished_at"] = iso_time(time.time())
        summary.pop("_largest_heap", None)
        return summary

    for current_dir, dir_names, file_names in os.walk(root_path, onerror=on_walk_error(summary)):
        summary["debug"]["walk_yielded"] = True
        summary["directory_count"] += 1

        # Avoid following symlinked directories. This keeps traversal bounded.
        kept_dirs = []
        for dir_name in dir_names:
            full_dir = os.path.join(current_dir, dir_name)
            try:
                mode = os.lstat(full_dir).st_mode
                if not stat.S_ISLNK(mode):
                    kept_dirs.append(dir_name)
            except OSError as error:
                if len(summary["stat_errors"]) < 100:
                    summary["stat_errors"].append("%s: %s" % (full_dir, error))
        dir_names[:] = kept_dirs

        for file_name in file_names:
            file_path = os.path.join(current_dir, file_name)
            try:
                st = os.lstat(file_path)
            except OSError as error:
                if len(summary["stat_errors"]) < 100:
                    summary["stat_errors"].append("%s: %s" % (file_path, error))
                continue

            if not stat.S_ISREG(st.st_mode):
                continue

            parsed = parse_media_name(file_name)
            derivative = derivative_for_path(file_path, root_path)
            rel_file = relpath(file_path, root_path)
            size = int(st.st_size)

            summary["file_count"] += 1
            summary["total_bytes"] += size
            if summary["file_count"] % 50000 == 0:
                print(
                    "[%s] scanned %s files (%s)" % (
                        summary["key"],
                        fmt_int(summary["file_count"]),
                        fmt_bytes(summary["total_bytes"]),
                    ),
                    file=sys.stderr,
                )
            increment(summary["extension_counts"], parsed["extension"])
            increment(summary["extension_bytes"], parsed["extension"], size)
            increment(summary["derivative_counts"], derivative)
            increment(summary["derivative_bytes"], derivative, size)
            update_oldest_newest(summary, rel_file, st.st_mtime)

            largest_record = {
                "path": rel_file,
                "bytes": size,
                "size": fmt_bytes(size),
                "extension": parsed["extension"],
                "derivative": derivative,
                "mtime": iso_time(st.st_mtime),
            }
            update_largest(summary, largest_record, largest_limit)

            if len(summary["samples"]) < sample_limit:
                sample = dict(largest_record)
                if parsed["building_id"]:
                    sample["building_id"] = parsed["building_id"]
                summary["samples"].append(sample)

            if parsed["matches_building_pattern"]:
                summary["pattern_matches"] += 1
                building_id = parsed["building_id"]
                increment(summary["building_id_counts"], building_id)
                if derivative == "orig":
                    increment(summary["building_orig_counts"], building_id)
            else:
                summary["pattern_misses"] += 1

    summary["accessible"] = bool(summary["debug"]["exists"] and summary["debug"]["walk_yielded"])
    largest = [item[2] for item in summary["_largest_heap"]]
    largest.sort(key=lambda item: item["bytes"], reverse=True)
    summary["largest_files"] = largest
    summary["finished_at"] = iso_time(time.time())
    summary.pop("_largest_heap", None)
    return summary


def compact_summary(summary):
    distinct_buildings = len(summary["building_id_counts"])
    average_files = None
    if distinct_buildings:
        average_files = float(summary["pattern_matches"]) / float(distinct_buildings)

    return {
        "key": summary["key"],
        "label": summary["label"],
        "path": summary["path"],
        "known_size": summary["known_size"],
        "accessible": summary["accessible"],
        "started_at": summary["started_at"],
        "finished_at": summary["finished_at"],
        "file_count": summary["file_count"],
        "directory_count": summary["directory_count"],
        "total_bytes": summary["total_bytes"],
        "total_size": fmt_bytes(summary["total_bytes"]),
        "extension_counts": summary["extension_counts"],
        "extension_bytes": summary["extension_bytes"],
        "derivative_counts": summary["derivative_counts"],
        "derivative_bytes": summary["derivative_bytes"],
        "distinct_building_ids": distinct_buildings,
        "distinct_building_ids_with_orig": len(summary["building_orig_counts"]),
        "average_files_per_building_id": round(average_files, 2) if average_files is not None else None,
        "pattern_matches": summary["pattern_matches"],
        "pattern_misses": summary["pattern_misses"],
        "oldest": summary["oldest"],
        "newest": summary["newest"],
        "largest_files": summary["largest_files"],
        "top_building_ids": [
            {"building_id": key, "file_count": value, "orig_count": summary["building_orig_counts"].get(key, 0)}
            for key, value in top_items(summary["building_id_counts"], 50)
        ],
        "sample_count": len(summary["samples"]),
        "permission_error_count": len(summary["permission_errors"]),
        "stat_error_count": len(summary["stat_errors"]),
        "walk_error_count": len(summary["walk_errors"]),
        "debug": summary["debug"],
        "permission_errors": summary["permission_errors"],
        "stat_errors": summary["stat_errors"],
        "walk_errors": summary["walk_errors"],
    }


def generate_summary_report(compact_roots):
    lines = []
    lines.append("# Rofo Media Corpus Inventory V1")
    lines.append("")
    lines.append("This is a read-only inventory of recovered Rofo production media mounted on the Production APP EC2 instance.")
    lines.append("")
    lines.append("No files were moved, deleted, optimized, uploaded, renamed, or modified.")
    lines.append("")
    lines.append("## Corpus Roots")
    lines.append("")
    lines.append(markdown_table(
        ["Corpus", "Path", "Accessible", "Files", "Size", "Known size", "Distinct building IDs"],
        [
            [
                root["key"],
                root["path"],
                "yes" if root["accessible"] else "no",
                fmt_int(root["file_count"]),
                root["total_size"],
                root.get("known_size") or "",
                fmt_int(root["distinct_building_ids"]),
            ]
            for root in compact_roots
        ],
    ))
    lines.append("")
    lines.append("## Filesystem Debug")
    lines.append("")
    lines.append("This section records direct filesystem checks for each configured root. Accessibility is based on actual traversal behavior, not `os.access()`.")
    lines.append("")
    lines.append(markdown_table(
        ["Corpus", "exists", "isdir", "listdir ok", "listdir sample", "walk yielded", "walk errors"],
        [
            [
                root["key"],
                str(root["debug"].get("exists")),
                str(root["debug"].get("isdir")),
                str(root["debug"].get("listdir_ok")),
                ", ".join([safe_unicode(item) for item in root["debug"].get("listdir_sample", [])[:8]]),
                str(root["debug"].get("walk_yielded")),
                fmt_int(root["walk_error_count"]),
            ]
            for root in compact_roots
        ],
    ))
    lines.append("")
    lines.append("## Confirmed Baseline")
    lines.append("")
    lines.append("- `buildings5`: 620G total.")
    lines.append("- `buildings5/orig`: 342G total.")
    lines.append("- `buildings5/orig`: 337,050 files.")
    lines.append("- `buildings5/orig`: 175,670 distinct building IDs represented.")
    lines.append("- `listings4`: 84G total.")
    lines.append("- `pdfs`: 2.7G total.")
    lines.append("- Known image derivatives: `orig`, `standard`, `thumb`, `smthumb`.")
    lines.append("- Filename convention appears to be `{building_id}_{hash}.{ext}`.")
    lines.append("")
    lines.append("## Building ID Coverage")
    lines.append("")
    lines.append(markdown_table(
        ["Corpus", "Pattern matches", "Pattern misses", "Distinct building IDs", "IDs with orig", "Avg files per ID"],
        [
            [
                root["key"],
                fmt_int(root["pattern_matches"]),
                fmt_int(root["pattern_misses"]),
                fmt_int(root["distinct_building_ids"]),
                fmt_int(root["distinct_building_ids_with_orig"]),
                str(root["average_files_per_building_id"] or ""),
            ]
            for root in compact_roots
        ],
    ))
    lines.append("")
    lines.append("## Oldest And Newest Files")
    lines.append("")
    lines.append(markdown_table(
        ["Corpus", "Oldest", "Oldest path", "Newest", "Newest path"],
        [
            [
                root["key"],
                root["oldest"]["mtime"] if root["oldest"] else "",
                root["oldest"]["path"] if root["oldest"] else "",
                root["newest"]["mtime"] if root["newest"] else "",
                root["newest"]["path"] if root["newest"] else "",
            ]
            for root in compact_roots
        ],
    ))
    lines.append("")
    lines.append("## Strategic Assessment")
    lines.append("")
    lines.append("The recovered media corpus is a high-value long-term asset for Rofo's commercial geography platform. The `orig` building media should be treated as the preservation source. Generated derivatives such as `standard`, `thumb`, and `smthumb` are useful for legacy compatibility, but should eventually be regenerated from originals through a controlled image pipeline.")
    lines.append("")
    lines.append("The corpus should support representative commercial district imagery, district identity visualization, corridor-level editorial geography, and building environment understanding. It should not be treated as a measure of inventory completeness or current availability.")
    lines.append("")
    lines.append("## Recommended Next Step")
    lines.append("")
    lines.append("Create Media-to-Building Join V1: connect `{building_id}_{hash}` media files to canonical building records, city/state, addresses, district candidates, and representative-image review status. This join should happen before any R2 upload or public imagery workflow.")
    lines.append("")
    return "\n".join(lines)


def generate_extension_report(compact_roots):
    lines = ["# Media Extension Breakdown", ""]
    for root in compact_roots:
        lines.append("## %s" % root["key"])
        lines.append("")
        if not root["accessible"]:
            lines.append("Not accessible.")
            lines.append("")
            continue
        rows = []
        for ext, count in top_items(root["extension_counts"], 100):
            rows.append([ext, fmt_int(count), fmt_bytes(root["extension_bytes"].get(ext, 0))])
        lines.append(markdown_table(["Extension", "Files", "Bytes"], rows))
        lines.append("")
    return "\n".join(lines)


def generate_derivative_report(compact_roots):
    lines = ["# Media Derivative Folder Summary", ""]
    for root in compact_roots:
        lines.append("## %s" % root["key"])
        lines.append("")
        if not root["accessible"]:
            lines.append("Not accessible.")
            lines.append("")
            continue
        rows = []
        for derivative, count in top_items(root["derivative_counts"], 50):
            rows.append([derivative, fmt_int(count), fmt_bytes(root["derivative_bytes"].get(derivative, 0))])
        lines.append(markdown_table(["Derivative folder", "Files", "Bytes"], rows))
        lines.append("")
    return "\n".join(lines)


def generate_building_report(compact_roots):
    lines = ["# Media Building ID Coverage", ""]
    for root in compact_roots:
        lines.append("## %s" % root["key"])
        lines.append("")
        if not root["accessible"]:
            lines.append("Not accessible.")
            lines.append("")
            continue
        lines.append("- Pattern matches: %s" % fmt_int(root["pattern_matches"]))
        lines.append("- Pattern misses: %s" % fmt_int(root["pattern_misses"]))
        lines.append("- Distinct building IDs: %s" % fmt_int(root["distinct_building_ids"]))
        lines.append("- Distinct building IDs with `orig`: %s" % fmt_int(root["distinct_building_ids_with_orig"]))
        lines.append("- Average files per building ID: %s" % (root["average_files_per_building_id"] or ""))
        lines.append("")
        rows = []
        for item in root["top_building_ids"]:
            rows.append([item["building_id"], fmt_int(item["file_count"]), fmt_int(item["orig_count"])])
        lines.append(markdown_table(["Building ID", "Files", "Orig files"], rows))
        lines.append("")
    return "\n".join(lines)


def generate_largest_files_report(compact_roots):
    lines = ["# Media Largest Files", ""]
    for root in compact_roots:
        lines.append("## %s" % root["key"])
        lines.append("")
        if not root["accessible"]:
            lines.append("Not accessible.")
            lines.append("")
            continue
        rows = []
        for item in root["largest_files"]:
            rows.append([item["path"], item["size"], item["extension"], item["derivative"], item["mtime"] or ""])
        lines.append(markdown_table(["Path", "Size", "Extension", "Derivative", "Modified"], rows))
        lines.append("")
    return "\n".join(lines)


def main():
    args = parse_cli_args(sys.argv)

    ensure_dir(args["output_dir"])

    summaries = []
    compact_roots = []
    for root_config in ROOTS:
        print("Scanning %s: %s" % (root_config["key"], root_config["path"]), file=sys.stderr)
        summary = scan_root(root_config, args["sample_limit"], args["largest_limit"])
        summaries.append(summary)
        compact = compact_summary(summary)
        compact_roots.append(compact)

        write_json(
            os.path.join(args["output_dir"], "%s_sample_manifest.json" % root_config["key"]),
            {
                "generated_at": iso_time(time.time()),
                "key": root_config["key"],
                "path": root_config["path"],
                "accessible": summary["accessible"],
                "samples": summary["samples"],
            },
        )

    summary_payload = {
        "generated_at": iso_time(time.time()),
        "script": "scripts/media/media_corpus_inventory_v1.py",
        "python_version": sys.version,
        "roots": compact_roots,
    }

    write_json(os.path.join(args["output_dir"], "media_corpus_inventory_v1_summary.json"), summary_payload)
    write_text(os.path.join(args["output_dir"], "media_corpus_inventory_v1.md"), generate_summary_report(compact_roots))
    write_text(os.path.join(args["output_dir"], "media_extension_breakdown.md"), generate_extension_report(compact_roots))
    write_text(os.path.join(args["output_dir"], "media_derivative_folder_summary.md"), generate_derivative_report(compact_roots))
    write_text(os.path.join(args["output_dir"], "media_building_coverage_summary.md"), generate_building_report(compact_roots))
    write_text(os.path.join(args["output_dir"], "media_largest_files.md"), generate_largest_files_report(compact_roots))

    print("Wrote media inventory output to %s" % args["output_dir"], file=sys.stderr)


if __name__ == "__main__":
    main()
