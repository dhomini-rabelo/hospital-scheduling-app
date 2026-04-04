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
# CREATE — batch create multiple team members
# ==========================================
log_test "POST /team-members — batch create (Doctor + Nurse)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "name": "Dr. Ana Silva", "profession": "DOCTOR", "specialty": "NEUROLOGY" },
      { "name": "Dr. Carlos Lima", "profession": "DOCTOR", "specialty": "CARDIOLOGY" },
      { "name": "Maria Santos", "profession": "NURSE", "specialty": "ICU" }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 201 "$BODY"

DOCTOR_1_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '1p' | cut -d'"' -f4)
DOCTOR_2_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
NURSE_1_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)
echo "Created IDs: $DOCTOR_1_ID, $DOCTOR_2_ID, $NURSE_1_ID"

# ==========================================
# CREATE — single team member
# ==========================================
log_test "POST /team-members — create single technician"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "name": "João Ferreira", "profession": "TECHNICIAN", "specialty": "RADIOLOGY" }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 201 "$BODY"

TECH_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created ID: $TECH_ID"

# ==========================================
# CREATE — invalid specialty for profession (should fail 400)
# ==========================================
log_test "POST /team-members — invalid specialty for profession should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "name": "Bad Entry", "profession": "NURSE", "specialty": "NEUROLOGY" }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# CREATE — invalid profession (should fail 400 via Zod)
# ==========================================
log_test "POST /team-members — invalid profession should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "name": "Bad Entry", "profession": "WIZARD", "specialty": "MAGIC" }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# CREATE — empty items array (should fail 400)
# ==========================================
log_test "POST /team-members — empty items should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{ "items": [] }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# CREATE — missing name (should fail 400)
# ==========================================
log_test "POST /team-members — missing name should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "profession": "DOCTOR", "specialty": "GENERAL" }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# CREATE — batch atomicity: one bad item should fail all
# ==========================================
log_test "POST /team-members — batch atomicity (one invalid should fail all)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "name": "Good Doctor", "profession": "DOCTOR", "specialty": "GENERAL" },
      { "name": "Bad Nurse", "profession": "NURSE", "specialty": "NEUROLOGY" }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# LIST — get all team members
# ==========================================
log_test "GET /team-members — list all"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/team-members")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
echo "Total members: $COUNT"

# ==========================================
# LIST — filter by profession
# ==========================================
log_test "GET /team-members?profession=DOCTOR — filter by profession"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/team-members?profession=DOCTOR")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

DOCTOR_COUNT=$(echo "$BODY" | grep -o '"profession":"DOCTOR"' | wc -l)
if [ "$DOCTOR_COUNT" -eq 2 ]; then
  echo "✅ Filtered correctly — 2 doctors"
else
  echo "❌ Expected 2 doctors, got $DOCTOR_COUNT"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# LIST — filter by profession (NURSE)
# ==========================================
log_test "GET /team-members?profession=NURSE — filter by NURSE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/team-members?profession=NURSE")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

NURSE_COUNT=$(echo "$BODY" | grep -o '"profession":"NURSE"' | wc -l)
if [ "$NURSE_COUNT" -eq 1 ]; then
  echo "✅ Filtered correctly — 1 nurse"
else
  echo "❌ Expected 1 nurse, got $NURSE_COUNT"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# UPDATE — update name
# ==========================================
log_test "PUT /team-members/:id — update name"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/team-members/$DOCTOR_1_ID" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Dr. Ana Silva Costa" }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

UPDATED_NAME=$(echo "$BODY" | grep -o '"name":"Dr. Ana Silva Costa"')
if [ -n "$UPDATED_NAME" ]; then
  echo "✅ Name updated correctly"
else
  echo "❌ Name not updated"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# UPDATE — update profession and specialty together
# ==========================================
log_test "PUT /team-members/:id — update profession and specialty"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/team-members/$NURSE_1_ID" \
  -H "Content-Type: application/json" \
  -d '{ "profession": "NURSE", "specialty": "EMERGENCY" }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

UPDATED_SPECIALTY=$(echo "$BODY" | grep -o '"specialty":"EMERGENCY"')
if [ -n "$UPDATED_SPECIALTY" ]; then
  echo "✅ Specialty updated correctly"
else
  echo "❌ Specialty not updated"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# UPDATE — invalid specialty for current profession (should fail 400)
# ==========================================
log_test "PUT /team-members/:id — invalid specialty for profession should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/team-members/$DOCTOR_1_ID" \
  -H "Content-Type: application/json" \
  -d '{ "specialty": "ICU" }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# UPDATE — non-existent ID (should fail 404)
# ==========================================
log_test "PUT /team-members/:id — non-existent should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/team-members/00000000-0000-0000-0000-000000000000" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Ghost" }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# DELETE — delete technician
# ==========================================
log_test "DELETE /team-members/:id — delete technician"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/team-members/$TECH_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 204 "$BODY"

# ==========================================
# DELETE — non-existent ID (should fail 404)
# ==========================================
log_test "DELETE /team-members/:id — non-existent should fail"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/team-members/00000000-0000-0000-0000-000000000000")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# CLEANUP — delete remaining team members
# ==========================================
log_test "CLEANUP — delete remaining team members"

for MEMBER_ID in $DOCTOR_1_ID $DOCTOR_2_ID $NURSE_1_ID; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/team-members/$MEMBER_ID")
  DEL_STATUS=$(echo "$RESPONSE" | tail -1)
  echo "Deleted $MEMBER_ID — status: $DEL_STATUS"
done

# ==========================================
# VERIFY CLEANUP — list should be empty
# ==========================================
log_test "VERIFY CLEANUP — list should return empty array"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/team-members")

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
