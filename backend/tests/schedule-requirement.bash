#!/bin/bash

BASE_URL="http://localhost:5000"
PASSED=0
FAILED=0

log_test() {
  echo ""
  echo "=========================================="
  echo "TEST: $1"
  echo "=========================================="
}

log_result() {
  local status_code=$1
  local expected_status=$2
  local response_body=$3

  echo "Expected status: $expected_status"
  echo "Received status: $status_code"
  echo "Response: $response_body"

  if [ "$status_code" -eq "$expected_status" ]; then
    echo "✅ PASSED"
    PASSED=$((PASSED + 1))
  else
    echo "❌ FAILED"
    FAILED=$((FAILED + 1))
  fi
}

# ==========================================
# CREATE — happy path with multiple professions and specialty breakdowns
# ==========================================
log_test "POST /schedule-requirements — create weekday requirement"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "weekday",
    "requirements": [
      {
        "profession": "DOCTOR",
        "requiredCount": 5,
        "specialtyRequirements": [
          { "specialty": "NEUROLOGY", "requiredCount": 2 },
          { "specialty": "CARDIOLOGY", "requiredCount": 1 }
        ]
      },
      {
        "profession": "NURSE",
        "requiredCount": 3,
        "specialtyRequirements": [
          { "specialty": "ICU", "requiredCount": 1 }
        ]
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 201 "$BODY"

WEEKDAY_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created ID: $WEEKDAY_ID"

IS_ENABLED=$(echo "$BODY" | grep -o '"isEnabled":true')
if [ -n "$IS_ENABLED" ]; then
  echo "✅ isEnabled is true by default"
else
  echo "❌ isEnabled should be true by default"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# CREATE — second requirement (weekend)
# ==========================================
log_test "POST /schedule-requirements — create weekend requirement"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "weekend",
    "requirements": [
      {
        "profession": "DOCTOR",
        "requiredCount": 2,
        "specialtyRequirements": []
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 201 "$BODY"

WEEKEND_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created ID: $WEEKEND_ID"

# ==========================================
# CREATE — duplicate dateReference (should fail 409)
# ==========================================
log_test "POST /schedule-requirements — duplicate dateReference should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "weekday",
    "requirements": [
      {
        "profession": "DOCTOR",
        "requiredCount": 1,
        "specialtyRequirements": []
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 409 "$BODY"

# ==========================================
# CREATE — specialty sum exceeds profession count (should fail 400)
# ==========================================
log_test "POST /schedule-requirements — specialty sum > requiredCount should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "monday",
    "requirements": [
      {
        "profession": "DOCTOR",
        "requiredCount": 2,
        "specialtyRequirements": [
          { "specialty": "NEUROLOGY", "requiredCount": 2 },
          { "specialty": "CARDIOLOGY", "requiredCount": 1 }
        ]
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# CREATE — invalid specialty for profession (should fail 400)
# ==========================================
log_test "POST /schedule-requirements — invalid specialty for profession should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "monday",
    "requirements": [
      {
        "profession": "NURSE",
        "requiredCount": 3,
        "specialtyRequirements": [
          { "specialty": "NEUROLOGY", "requiredCount": 1 }
        ]
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# CREATE — invalid profession (should fail 400 via Zod)
# ==========================================
log_test "POST /schedule-requirements — invalid profession should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "monday",
    "requirements": [
      {
        "profession": "WIZARD",
        "requiredCount": 1,
        "specialtyRequirements": []
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# CREATE — empty requirements array (should fail 400 via Zod min(1))
# ==========================================
log_test "POST /schedule-requirements — empty requirements should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "monday",
    "requirements": []
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# LIST — get all schedule requirements
# ==========================================
log_test "GET /schedule-requirements — list all"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-requirements")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

# ==========================================
# UPDATE — update requirements for weekday
# ==========================================
log_test "PUT /schedule-requirements/:id — update requirements"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-requirements/$WEEKDAY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": [
      {
        "profession": "DOCTOR",
        "requiredCount": 8,
        "specialtyRequirements": [
          { "specialty": "NEUROLOGY", "requiredCount": 3 },
          { "specialty": "CARDIOLOGY", "requiredCount": 2 }
        ]
      },
      {
        "profession": "NURSE",
        "requiredCount": 4,
        "specialtyRequirements": []
      },
      {
        "profession": "TECHNICIAN",
        "requiredCount": 2,
        "specialtyRequirements": [
          { "specialty": "RADIOLOGY", "requiredCount": 1 }
        ]
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

# ==========================================
# UPDATE — non-existent ID (should fail 404)
# ==========================================
log_test "PUT /schedule-requirements/:id — non-existent should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-requirements/00000000-0000-0000-0000-000000000000" \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": [
      {
        "profession": "DOCTOR",
        "requiredCount": 1,
        "specialtyRequirements": []
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# DISABLE — disable weekday requirement
# ==========================================
log_test "PATCH /schedule-requirements/:id/disable — disable requirement"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/schedule-requirements/$WEEKDAY_ID/disable")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

IS_DISABLED=$(echo "$BODY" | grep -o '"isEnabled":false')
if [ -n "$IS_DISABLED" ]; then
  echo "✅ isEnabled is false after disable"
else
  echo "❌ isEnabled should be false after disable"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# ENABLE — re-enable weekday requirement
# ==========================================
log_test "PATCH /schedule-requirements/:id/enable — enable requirement"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/schedule-requirements/$WEEKDAY_ID/enable")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

IS_ENABLED=$(echo "$BODY" | grep -o '"isEnabled":true')
if [ -n "$IS_ENABLED" ]; then
  echo "✅ isEnabled is true after enable"
else
  echo "❌ isEnabled should be true after enable"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# ENABLE — non-existent ID (should fail 404)
# ==========================================
log_test "PATCH /schedule-requirements/:id/enable — non-existent should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/schedule-requirements/00000000-0000-0000-0000-000000000000/enable")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# DISABLE — non-existent ID (should fail 404)
# ==========================================
log_test "PATCH /schedule-requirements/:id/disable — non-existent should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/schedule-requirements/00000000-0000-0000-0000-000000000000/disable")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# DELETE — delete weekend requirement
# ==========================================
log_test "DELETE /schedule-requirements/:id — delete weekend"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-requirements/$WEEKEND_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 204 "$BODY"

# ==========================================
# DELETE — non-existent ID (should fail 404)
# ==========================================
log_test "DELETE /schedule-requirements/:id — non-existent should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-requirements/00000000-0000-0000-0000-000000000000")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# CLEANUP — delete remaining weekday requirement
# ==========================================
log_test "CLEANUP — delete weekday requirement"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-requirements/$WEEKDAY_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 204 "$BODY"

# ==========================================
# VERIFY CLEANUP — list should be empty
# ==========================================
log_test "VERIFY CLEANUP — list should return empty array"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-requirements")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

if [ "$BODY" = "[]" ]; then
  echo "✅ Cleanup verified — no remaining records"
else
  echo "❌ Cleanup failed — records still exist"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# SUMMARY
# ==========================================
echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total:  $((PASSED + FAILED))"
echo "=========================================="

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
