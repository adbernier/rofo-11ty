#!/bin/sh
set -eu

DISTRICT_SLUG="${DISTRICT_SLUG:-downtown-oakland}"
MANIFEST="data/media/generated/district_media_review_workspace_v1/image-export-manifest.json"
TARGET_ROOT="data/media/generated/district_media_review_workspace_v1/images"
EC2_HOST="${EC2_HOST:-}"
REMOTE_READ_PREFIX="${REMOTE_READ_PREFIX:-sudo cat}"

if [ -z "$EC2_HOST" ]; then
  echo "Set EC2_HOST, for example: EC2_HOST=ec2-user@example.compute.amazonaws.com sh $0" >&2
  exit 1
fi

if [ ! -f "$MANIFEST" ]; then
  echo "Missing manifest: $MANIFEST" >&2
  exit 1
fi

command -v node >/dev/null 2>&1 || {
  echo "This local Mac helper requires node to read the workspace manifest." >&2
  exit 1
}

quote_remote_path() {
  printf "%s" "$1" | sed "s/'/'\\''/g; s/^/'/; s/$/'/"
}

TARGET_DIR="$TARGET_ROOT/$DISTRICT_SLUG"
mkdir -p "$TARGET_DIR"
TMP_LIST="${TMPDIR:-/tmp}/rofo-district-images-$DISTRICT_SLUG-$$.tsv"
trap 'rm -f "$TMP_LIST"' EXIT

node - "$MANIFEST" "$DISTRICT_SLUG" > "$TMP_LIST" <<'NODE'
const fs = require("fs");
const manifestPath = process.argv[2];
const districtSlug = process.argv[3];
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const district = manifest.districts && manifest.districts[districtSlug];

if (!district) {
  console.error("District not found in manifest: " + districtSlug);
  process.exit(1);
}

for (const image of district.images || []) {
  if (!image.source_absolute_path || !image.filename) continue;
  process.stdout.write(image.source_absolute_path + "\t" + image.filename + "\n");
}
NODE

copied=0
missing=0

while IFS="$(printf '\t')" read -r source filename; do
  [ -n "$source" ] || continue
  [ -n "$filename" ] || continue
  target="$TARGET_DIR/$filename"
  remote_path=$(quote_remote_path "$source")
  if ssh "$EC2_HOST" "test -f $remote_path"; then
    if ssh "$EC2_HOST" "$REMOTE_READ_PREFIX $remote_path" > "$target.tmp"; then
      mv "$target.tmp" "$target"
      copied=$((copied + 1))
    else
      rm -f "$target.tmp"
      missing=$((missing + 1))
      echo "failed: $source" >&2
    fi
  else
    missing=$((missing + 1))
    echo "missing: $source" >&2
  fi
done < "$TMP_LIST"

echo "district=$DISTRICT_SLUG copied=$copied missing=$missing target=$TARGET_DIR"
