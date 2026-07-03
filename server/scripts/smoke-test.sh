#!/usr/bin/env bash

set -euo pipefail

API_URL="${API_URL:-http://localhost:5000/api}"
TIMESTAMP="$(date +%s)"
EMAIL="smoke_${TIMESTAMP}@test.com"
PASSWORD="SmokePass123"
FULL_NAME="Smoke Test User"

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

request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local token="${4:-}"

  if [ -n "$body" ] && [ -n "$token" ]; then
    curl -fsS \
      -X "$method" \
      "${API_URL}${path}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${token}" \
      -d "$body"
    return
  fi

  if [ -n "$body" ]; then
    curl -fsS \
      -X "$method" \
      "${API_URL}${path}" \
      -H "Content-Type: application/json" \
      -d "$body"
    return
  fi

  if [ -n "$token" ]; then
    curl -fsS \
      -X "$method" \
      "${API_URL}${path}" \
      -H "Authorization: Bearer ${token}"
    return
  fi

  curl -fsS -X "$method" "${API_URL}${path}"
}

echo "Using API_URL=${API_URL}"

echo "1. GET /api/health"
request GET "/health"
echo

echo "2. POST /api/auth/register"
REGISTER_BODY="{\"fullName\":\"${FULL_NAME}\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}"
request POST "/auth/register" "$REGISTER_BODY"
echo

echo "3. POST /api/auth/login"
LOGIN_RESPONSE="$(request POST "/auth/login" "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")"
TOKEN="$(printf '%s' "$LOGIN_RESPONSE" | parse_token)"
echo "Token received."

echo "4. GET /api/auth/me"
request GET "/auth/me" "" "$TOKEN"
echo

echo "5. POST /api/meals"
MEAL_BODY='{"title":"Smoke Test Meal","description":"Created by smoke test","category":"lunch","calories":500,"protein":25,"carbs":60,"fat":15}'
request POST "/meals" "$MEAL_BODY" "$TOKEN"
echo

echo "6. GET /api/meals"
request GET "/meals" "" "$TOKEN"
echo

echo "7. PUT /api/goal"
GOAL_BODY='{"age":30,"heightCm":170,"weightKg":70,"gender":"female","activityLevel":"moderate","goalType":"maintain","bmr":1400,"maintenanceCalories":2100,"targetCalories":2100}'
request PUT "/goal" "$GOAL_BODY" "$TOKEN"
echo

echo "8. GET /api/goal"
request GET "/goal" "" "$TOKEN"
echo

echo "9. DELETE /api/goal"
request DELETE "/goal" "" "$TOKEN"
echo

echo "10. DELETE /api/meals"
request DELETE "/meals" "" "$TOKEN"
echo

echo "11. DELETE /api/auth/me"
request DELETE "/auth/me" "" "$TOKEN"
echo

echo "Smoke test completed successfully."
echo "AI photo upload is skipped; test it separately with multipart/form-data."
echo "Barcode lookup is skipped because it depends on the external Open Food Facts API."
