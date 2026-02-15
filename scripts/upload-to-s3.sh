#!/bin/bash
#
# Upload Drupal static files to S3
#
# Prerequisites:
#   - AWS CLI installed and configured (aws configure)
#   - S3 bucket created
#
# Usage:
#   ./scripts/upload-to-s3.sh <path-to-files-tar-gz> <s3-bucket-name>
#
# Example:
#   ./scripts/upload-to-s3.sh "../kerio.com migration 2026/k3_live_2026-01-12T22-35-03_UTC_files.tar.gz" kerio-static-files

set -e

FILES_ARCHIVE="$1"
S3_BUCKET="$2"

if [ -z "$FILES_ARCHIVE" ] || [ -z "$S3_BUCKET" ]; then
  echo "Usage: $0 <path-to-files-tar-gz> <s3-bucket-name>"
  echo ""
  echo "Example:"
  echo "  $0 '../kerio.com migration 2026/k3_live_2026-01-12T22-35-03_UTC_files.tar.gz' kerio-static-files"
  exit 1
fi

if [ ! -f "$FILES_ARCHIVE" ]; then
  echo "Error: File not found: $FILES_ARCHIVE"
  exit 1
fi

TEMP_DIR=$(mktemp -d)
echo "Extracting archive to $TEMP_DIR..."
tar -xzf "$FILES_ARCHIVE" -C "$TEMP_DIR"

echo ""
echo "Uploading to s3://$S3_BUCKET/..."
aws s3 sync "$TEMP_DIR/files_live/" "s3://$S3_BUCKET/files_live/" \
  --no-progress \
  --size-only

UPLOADED=$(aws s3 ls "s3://$S3_BUCKET/files_live/" --recursive --summarize | tail -1)
echo ""
echo "Upload complete!"
echo "$UPLOADED"

echo ""
echo "Cleaning up temp directory..."
rm -rf "$TEMP_DIR"

echo ""
echo "Done! Files are now available at:"
echo "  https://$S3_BUCKET.s3.amazonaws.com/files_live/<filename>"
