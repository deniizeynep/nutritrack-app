#!/usr/bin/env bash

set -euo pipefail

API_URL="${API_URL:-http://localhost:5000/api}"
PHOTO_PATH="${PHOTO_PATH:-}"
TIMESTAMP="$(date +%s)"
EMAIL="ai_test_${TIMESTAMP}@test.com"
PASSWORD="SmokePass123"
FULL_NAME="AI Upload Test User"

if [ -z "$PHOTO_PATH" ]; then
  echo "PHOTO_PATH is required."
  echo "Example: PHOTO_PATH=\"$HOME/Downloads/food.jpg\" npm run test:ai-upload"
  exit 1
fi

if [ ! -f "$PHOTO_PATH" ]; then
  echo "PHOTO_PATH does not point to a file: $PHOTO_PATH"
  exit 1
fi

PHOTO_EXTENSION="${PHOTO_PATH##*.}"
PHOTO_EXTENSION="$(printf '%s' "$PHOTO_EXTENSION" | tr '[:upper:]' '[:lower:]')"

case "$PHOTO_EXTENSION" in
  jpg | jpeg)
    PHOTO_MIME_TYPE="image/jpeg"
    ;;
  png)
    PHOTO_MIME_TYPE="image/png"
    ;;
  webp)
    PHOTO_MIME_TYPE="image/webp"
    ;;
  *)
    echo "Unsupported photo extension: .$PHOTO_EXTENSION"
    echo "Supported formats: .jpg, .jpeg, .png, .webp"
    exit 1
    ;;
esac

parse_token() {
  node -e '
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      const json = JSON.parse(data);
      if (!json.token) {
        process.exit(1);
      }
      console.log(json.token);
    });
  '
}

json_request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local token="${4:-}"

  if [ -n "$token" ]; then
    curl -fsS \
      -X "$method" \
      "${API_URL}${path}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${token}" \
      -d "$body"
    return
  fi

  curl -fsS \
    -X "$method" \
    "${API_URL}${path}" \
    -H "Content-Type: application/json" \
    -d "$body"
}

echo "Using API_URL=${API_URL}"
echo "Using PHOTO_PATH=${PHOTO_PATH}"
echo "Using PHOTO_MIME_TYPE=${PHOTO_MIME_TYPE}"

echo "1. Verify unauthenticated upload returns 401"
UNAUTH_STATUS="$(curl -sS -o /tmp/nutritrack_ai_unauth.json -w "%{http_code}" \
  -X POST \
  "${API_URL}/ai/analyze-food" \
  -F "photo=@${PHOTO_PATH};type=${PHOTO_MIME_TYPE}")"

if [ "$UNAUTH_STATUS" != "401" ]; then
  echo "Expected 401 without token, got ${UNAUTH_STATUS}."
  cat /tmp/nutritrack_ai_unauth.json
  exit 1
fi
echo "Unauthenticated upload correctly returned 401."

echo "2. POST /api/auth/register"
REGISTER_BODY="{\"fullName\":\"${FULL_NAME}\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}"
json_request POST "/auth/register" "$REGISTER_BODY"
echo

echo "3. POST /api/auth/login"
LOGIN_RESPONSE="$(json_request POST "/auth/login" "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")"
TOKEN="$(printf '%s' "$LOGIN_RESPONSE" | parse_token)"
echo "Token received."

cleanup() {
  if [ -n "${TOKEN:-}" ]; then
    echo "Cleaning up test account."
    curl -fsS \
      -X DELETE \
      "${API_URL}/auth/me" \
      -H "Authorization: Bearer ${TOKEN}" >/dev/null || true
  fi
}
trap cleanup EXIT

echo "4. POST /api/ai/analyze-food with multipart photo"
UPLOAD_RESPONSE_FILE="/tmp/nutritrack_ai_upload.json"
UPLOAD_STATUS="$(curl -sS -o "$UPLOAD_RESPONSE_FILE" -w "%{http_code}" \
  -X POST \
  "${API_URL}/ai/analyze-food" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "photo=@${PHOTO_PATH};type=${PHOTO_MIME_TYPE}")"

echo "Status: ${UPLOAD_STATUS}"
cat "$UPLOAD_RESPONSE_FILE"
echo

if [ "$UPLOAD_STATUS" != "200" ]; then
  echo "Expected AI upload to return 200, got ${UPLOAD_STATUS}."
  exit 1
fi

node -e '
  const fs = require("fs");
  const json = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const required = ["foodName", "calories", "protein", "carbs", "fat", "confidence", "source"];
  for (const key of required) {
    if (json[key] === undefined) {
      console.error(`Missing field: ${key}`);
      process.exit(1);
    }
  }
  if (!json.foodName.tr || !json.foodName.en) {
    console.error("Missing foodName translations.");
    process.exit(1);
  }
  if (!["mock", "ai"].includes(json.source)) {
    console.error(`Unexpected source: ${json.source}`);
    process.exit(1);
  }
' "$UPLOAD_RESPONSE_FILE"

echo "AI upload test completed successfully."
