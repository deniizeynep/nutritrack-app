#!/usr/bin/env bash

set -euo pipefail

API_URL="${API_URL:-http://localhost:5000/api}"
BARCODE="${BARCODE:-5449000000996}"
UNSUPPORTED_BARCODE="9781234567897"

echo "Using API_URL=${API_URL}"
echo "Using BARCODE=${BARCODE}"

echo "1. GET /api/barcode/${BARCODE}"
BARCODE_STATUS="$(curl -sS -o /tmp/nutritrack_barcode.json -w "%{http_code}" \
  "${API_URL}/barcode/${BARCODE}" || true)"
echo "Status: ${BARCODE_STATUS}"
cat /tmp/nutritrack_barcode.json
echo

if [ "$BARCODE_STATUS" != "200" ]; then
  echo "Warning: food barcode lookup did not return 200. This may happen if Open Food Facts is unavailable or the product is missing."
fi

echo "2. GET /api/barcode/${UNSUPPORTED_BARCODE} unsupported scenario"
UNSUPPORTED_STATUS="$(curl -sS -o /tmp/nutritrack_barcode_unsupported.json -w "%{http_code}" \
  "${API_URL}/barcode/${UNSUPPORTED_BARCODE}")"
echo "Status: ${UNSUPPORTED_STATUS}"
cat /tmp/nutritrack_barcode_unsupported.json
echo

if [ "$UNSUPPORTED_STATUS" != "422" ]; then
  echo "Expected unsupported barcode to return 422, got ${UNSUPPORTED_STATUS}."
  exit 1
fi

echo "Barcode test completed successfully."
