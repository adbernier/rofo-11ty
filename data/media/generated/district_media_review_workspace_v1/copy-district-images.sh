#!/bin/sh
set -eu

DISTRICT_SLUG="${DISTRICT_SLUG:-downtown-oakland}"
MANIFEST="data/media/generated/district_media_review_workspace_v1/image-export-manifest.json"
TARGET_ROOT="data/media/generated/district_media_review_workspace_v1/images"
PYTHON_BIN="${PYTHON_BIN:-/usr/bin/python}"

if [ ! -f "$MANIFEST" ]; then
  echo "Missing manifest: $MANIFEST" >&2
  exit 1
fi

"$PYTHON_BIN" - "$MANIFEST" "$DISTRICT_SLUG" "$TARGET_ROOT" <<'PY'
import json
import os
import shutil
import sys

manifest_path, district_slug, target_root = sys.argv[1:4]
with open(manifest_path, "r") as handle:
    manifest = json.load(handle)

district = manifest.get("districts", {}).get(district_slug)
if not district:
    sys.stderr.write("District not found in manifest: %s\n" % district_slug)
    sys.exit(1)

target_dir = os.path.join(target_root, district_slug)
if not os.path.isdir(target_dir):
    os.makedirs(target_dir)

copied = 0
missing = 0
for image in district.get("images", []):
    source = image.get("source_absolute_path")
    filename = image.get("filename")
    if not source or not filename:
        continue
    target = os.path.join(target_dir, filename)
    if not os.path.exists(source):
        missing += 1
        sys.stderr.write("missing: %s\n" % source)
        continue
    if not os.path.exists(target):
        shutil.copy2(source, target)
        copied += 1

print("district=%s copied=%s missing=%s target=%s" % (district_slug, copied, missing, target_dir))
PY
