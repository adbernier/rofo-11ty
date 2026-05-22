#!/bin/sh
set -eu

DISTRICT_SLUG="${DISTRICT_SLUG:-soma}"
MANIFEST="${MANIFEST:-data/media/generated/district_media_review_workspace_v1/image-export-manifest.json}"
SOURCE_ARCHIVE="${SOURCE_ARCHIVE:-/ebs2/rofo/content/buildings5/orig}"
STAGE_ROOT="${STAGE_ROOT:-/home/ec2-user/district-review-export}"
STAGE_OWNER="${STAGE_OWNER:-ec2-user}"
PYTHON_BIN="${PYTHON_BIN:-/usr/bin/python}"

if [ ! -f "$MANIFEST" ]; then
  echo "Missing manifest: $MANIFEST" >&2
  exit 1
fi

if [ ! -d "$SOURCE_ARCHIVE" ]; then
  echo "Missing source archive: $SOURCE_ARCHIVE" >&2
  exit 1
fi

if [ "$DISTRICT_SLUG" = "" ]; then
  echo "Set DISTRICT_SLUG to a district slug or all." >&2
  exit 1
fi

TMP_LIST="${TMPDIR:-/tmp}/rofo-district-review-stage-$DISTRICT_SLUG-$$.tsv"
trap 'rm -f "$TMP_LIST"' EXIT

"$PYTHON_BIN" - "$MANIFEST" "$DISTRICT_SLUG" <<'PY' > "$TMP_LIST"
import json
import sys

manifest_path, district_slug = sys.argv[1:3]
with open(manifest_path, "r") as handle:
    manifest = json.load(handle)

districts = manifest.get("districts", {})
if district_slug == "all":
    selected = sorted(districts.keys())
else:
    if district_slug not in districts:
        sys.stderr.write("District not found in manifest: %s\n" % district_slug)
        sys.exit(1)
    selected = [district_slug]

seen = set()
for slug in selected:
    for image in districts.get(slug, {}).get("images", []):
        filename = image.get("filename")
        if not filename:
            continue
        key = "%s\t%s" % (slug, filename)
        if key in seen:
            continue
        seen.add(key)
        sys.stdout.write("%s\t%s\n" % (slug, filename))
PY

if [ ! -s "$TMP_LIST" ]; then
  echo "No image filenames found for DISTRICT_SLUG=$DISTRICT_SLUG in $MANIFEST" >&2
  exit 1
fi

mkdir -p "$STAGE_ROOT"

copied=0
missing=0
failed=0

while IFS="$(printf '\t')" read -r slug filename; do
  [ -n "$slug" ] || continue
  [ -n "$filename" ] || continue

  source_path="$SOURCE_ARCHIVE/$filename"
  target_dir="$STAGE_ROOT/$slug"
  target_path="$target_dir/$filename"

  mkdir -p "$target_dir"

  if sudo test -f "$source_path"; then
    if sudo cp -p "$source_path" "$target_path"; then
      copied=$((copied + 1))
    else
      failed=$((failed + 1))
      echo "failed: $source_path" >&2
    fi
  else
    missing=$((missing + 1))
    echo "missing: $source_path" >&2
  fi
done < "$TMP_LIST"

sudo chown -R "$STAGE_OWNER:$STAGE_OWNER" "$STAGE_ROOT"

echo "district=$DISTRICT_SLUG copied=$copied missing=$missing failed=$failed stage_root=$STAGE_ROOT"
