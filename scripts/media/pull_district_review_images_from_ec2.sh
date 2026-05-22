#!/bin/sh
set -eu

DISTRICT_SLUG="${DISTRICT_SLUG:-soma}"
REMOTE_STAGE_ROOT="${REMOTE_STAGE_ROOT:-/home/ec2-user/district-review-export}"
LOCAL_IMAGE_ROOT="${LOCAL_IMAGE_ROOT:-data/media/generated/district_media_review_workspace_v1/images}"

if [ "${EC2_HOST:-}" = "" ]; then
  echo "Set EC2_HOST, for example: EC2_HOST=ec2-user@your-ec2-host" >&2
  exit 1
fi

if [ "${EC2_KEY:-}" = "" ]; then
  echo "Set EC2_KEY to the SSH private key path." >&2
  exit 1
fi

if [ ! -f "$EC2_KEY" ]; then
  echo "Missing EC2_KEY file: $EC2_KEY" >&2
  exit 1
fi

case "$DISTRICT_SLUG" in
  all|[a-z0-9-]*)
    ;;
  *)
    echo "DISTRICT_SLUG must be all or a lowercase slug containing letters, numbers, and hyphens." >&2
    exit 1
    ;;
esac

mkdir -p "$LOCAL_IMAGE_ROOT"

if [ "$DISTRICT_SLUG" = "all" ]; then
  ssh -i "$EC2_KEY" "$EC2_HOST" "test -d '$REMOTE_STAGE_ROOT' && tar -C '$REMOTE_STAGE_ROOT' -cf - ." |
    tar -C "$LOCAL_IMAGE_ROOT" -xf -
else
  mkdir -p "$LOCAL_IMAGE_ROOT/$DISTRICT_SLUG"
  ssh -i "$EC2_KEY" "$EC2_HOST" "test -d '$REMOTE_STAGE_ROOT/$DISTRICT_SLUG' && tar -C '$REMOTE_STAGE_ROOT' -cf - '$DISTRICT_SLUG'" |
    tar -C "$LOCAL_IMAGE_ROOT" -xf -
fi

echo "pulled district=$DISTRICT_SLUG remote=$EC2_HOST:$REMOTE_STAGE_ROOT local=$LOCAL_IMAGE_ROOT"
