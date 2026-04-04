#!/bin/bash

BASE_URL="http://localhost:5000"
PASSED=0
FAILED=0

TODAY=$(date -u +%Y-%m-%d)
TOMORROW=$(date -u -d "+1 day" +%Y-%m-%d)
DAY_AFTER=$(date -u -d "+2 days" +%Y-%m-%d)
FAR_FUTURE=$(date -u -d "+30 days" +%Y-%m-%d)

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
# SETUP — create team members for testing
# ==========================================
log_test "SETUP — create team members"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/team-members" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "name": "Dr. Ana Silva", "profession": "DOCTOR", "specialty": "NEUROLOGY" },
      { "name": "Dr. Carlos Lima", "profession": "DOCTOR", "specialty": "CARDIOLOGY" },
      { "name": "Dr. Pedro Costa", "profession": "DOCTOR", "specialty": "GENERAL" },
      { "name": "Maria Santos", "profession": "NURSE", "specialty": "ICU" },
      { "name": "Julia Alves", "profession": "NURSE", "specialty": "EMERGENCY" }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 201 "$BODY"

DOCTOR_1_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '1p' | cut -d'"' -f4)
DOCTOR_2_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
DOCTOR_3_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)
NURSE_1_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '4p' | cut -d'"' -f4)
NURSE_2_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '5p' | cut -d'"' -f4)
echo "Doctor IDs: $DOCTOR_1_ID, $DOCTOR_2_ID, $DOCTOR_3_ID"
echo "Nurse IDs: $NURSE_1_ID, $NURSE_2_ID"

# ==========================================
# SETUP — create schedule requirements for testing
# ==========================================
log_test "SETUP — create schedule requirement (weekday)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "dateReference": "weekday",
    "requirements": [
      {
        "profession": "DOCTOR",
        "requiredCount": 3,
        "specialtyRequirements": [
          { "specialty": "NEUROLOGY", "requiredCount": 1 }
        ]
      },
      {
        "profession": "NURSE",
        "requiredCount": 2,
        "specialtyRequirements": []
      }
    ]
  }')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 201 "$BODY"

REQ_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Requirement ID: $REQ_ID"

# ==========================================
# SET — create schedule entries with schedule requirements
# ==========================================
log_test "PUT /schedule-entries — set entries for today + tomorrow with scheduleRequirementIds"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$TODAY\", \"$TOMORROW\"],
    \"structure\": [
      {
        \"profession\": \"DOCTOR\",
        \"requiredCount\": 3,
        \"specialtyRequirements\": [
          { \"specialty\": \"NEUROLOGY\", \"requiredCount\": 1 }
        ]
      },
      {
        \"profession\": \"NURSE\",
        \"requiredCount\": 2,
        \"specialtyRequirements\": []
      }
    ],
    \"teamMemberIds\": [\"$DOCTOR_1_ID\", \"$DOCTOR_2_ID\", \"$NURSE_1_ID\", \"$NURSE_2_ID\"],
    \"scheduleRequirementIds\": [\"$REQ_ID\"]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

ENTRY_COUNT=$(echo "$BODY" | grep -o '"id":"[^"]*"' | wc -l)
echo "Entries created: $ENTRY_COUNT"

ENTRY_1_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '1p' | cut -d'"' -f4)
ENTRY_2_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
echo "Entry IDs: $ENTRY_1_ID, $ENTRY_2_ID"

# ==========================================
# SET — date outside allowed range should fail
# ==========================================
log_test "PUT /schedule-entries — date outside range should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$FAR_FUTURE\"],
    \"structure\": [
      { \"profession\": \"DOCTOR\", \"requiredCount\": 1, \"specialtyRequirements\": [] }
    ],
    \"teamMemberIds\": []
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SET — non-existent team member should fail
# ==========================================
log_test "PUT /schedule-entries — non-existent team member should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$TODAY\"],
    \"structure\": [
      { \"profession\": \"DOCTOR\", \"requiredCount\": 1, \"specialtyRequirements\": [] }
    ],
    \"teamMemberIds\": [\"00000000-0000-0000-0000-000000000000\"]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SET — non-existent schedule requirement should fail
# ==========================================
log_test "PUT /schedule-entries — non-existent schedule requirement should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$DAY_AFTER\"],
    \"structure\": [
      { \"profession\": \"DOCTOR\", \"requiredCount\": 1, \"specialtyRequirements\": [] }
    ],
    \"teamMemberIds\": [],
    \"scheduleRequirementIds\": [\"00000000-0000-0000-0000-000000000000\"]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SET — team member profession not in structure should fail
# ==========================================
log_test "PUT /schedule-entries — profession not in structure should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$DAY_AFTER\"],
    \"structure\": [
      { \"profession\": \"DOCTOR\", \"requiredCount\": 1, \"specialtyRequirements\": [] }
    ],
    \"teamMemberIds\": [\"$NURSE_1_ID\"]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SET — too many of a profession should fail
# ==========================================
log_test "PUT /schedule-entries — exceeding profession count should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$DAY_AFTER\"],
    \"structure\": [
      { \"profession\": \"DOCTOR\", \"requiredCount\": 1, \"specialtyRequirements\": [] }
    ],
    \"teamMemberIds\": [\"$DOCTOR_1_ID\", \"$DOCTOR_2_ID\"]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SET — empty structure should fail
# ==========================================
log_test "PUT /schedule-entries — empty structure should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$DAY_AFTER\"],
    \"structure\": [],
    \"teamMemberIds\": []
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SET — update existing entry (change team members)
# ==========================================
log_test "PUT /schedule-entries — update existing entry (add doctor 3)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$TODAY\"],
    \"structure\": [
      {
        \"profession\": \"DOCTOR\",
        \"requiredCount\": 3,
        \"specialtyRequirements\": [
          { \"specialty\": \"NEUROLOGY\", \"requiredCount\": 1 }
        ]
      },
      {
        \"profession\": \"NURSE\",
        \"requiredCount\": 2,
        \"specialtyRequirements\": []
      }
    ],
    \"teamMemberIds\": [\"$DOCTOR_1_ID\", \"$DOCTOR_2_ID\", \"$DOCTOR_3_ID\", \"$NURSE_1_ID\", \"$NURSE_2_ID\"],
    \"scheduleRequirementIds\": [\"$REQ_ID\"]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

# ==========================================
# LIST — get entries for date range
# ==========================================
log_test "GET /schedule-entries — list entries for today + tomorrow"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries?startDate=$TODAY&endDate=$TOMORROW")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

LIST_COUNT=$(echo "$BODY" | grep -o '"date"' | wc -l)
echo "Entries in range: $LIST_COUNT"

HAS_TEAM_MEMBERS=$(echo "$BODY" | grep -o '"teamMembers"' | head -1)
if [ -n "$HAS_TEAM_MEMBERS" ]; then
  echo "✅ Response includes teamMembers aggregate data"
else
  echo "❌ Response missing teamMembers aggregate data"
  FAILED=$((FAILED + 1))
fi

HAS_SCHEDULE_REQUIREMENTS=$(echo "$BODY" | grep -o '"scheduleRequirements"' | head -1)
if [ -n "$HAS_SCHEDULE_REQUIREMENTS" ]; then
  echo "✅ Response includes scheduleRequirements aggregate data"
else
  echo "❌ Response missing scheduleRequirements aggregate data"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# LIST — missing query params should fail
# ==========================================
log_test "GET /schedule-entries — missing params should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# OVERVIEW — get overview for today
# ==========================================
log_test "GET /schedule-overview — overview for today"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-overview?date=$TODAY")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_STRUCTURE=$(echo "$BODY" | grep -o '"structureFulfillment"')
HAS_REQUIREMENTS=$(echo "$BODY" | grep -o '"requirementsFulfillment"')
HAS_ENTRIES=$(echo "$BODY" | grep -o '"entries"')
HAS_TOTAL=$(echo "$BODY" | grep -o '"totalAssigned"')
HAS_OVERVIEW_SCHEDULE_REQS=$(echo "$BODY" | grep -o '"scheduleRequirements"')

if [ -n "$HAS_STRUCTURE" ] && [ -n "$HAS_REQUIREMENTS" ] && [ -n "$HAS_ENTRIES" ] && [ -n "$HAS_TOTAL" ] && [ -n "$HAS_OVERVIEW_SCHEDULE_REQS" ]; then
  echo "✅ Overview has all expected fields (including scheduleRequirements)"
else
  echo "❌ Overview missing fields"
  FAILED=$((FAILED + 1))
fi

echo "Overview response: $BODY" | head -c 500
echo ""

# ==========================================
# OVERVIEW — overview for date with no entry
# ==========================================
log_test "GET /schedule-overview — date with no entry"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-overview?date=$DAY_AFTER")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_NULL_STRUCTURE=$(echo "$BODY" | grep -o '"structureFulfillment":null')
if [ -n "$HAS_NULL_STRUCTURE" ]; then
  echo "✅ structureFulfillment is null for missing entry"
else
  echo "❌ Expected null structureFulfillment"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# OVERVIEW — missing date param should fail
# ==========================================
log_test "GET /schedule-overview — missing date should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-overview")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# DELETE — delete single entry
# ==========================================
log_test "DELETE /schedule-entries/:id — delete tomorrow's entry"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-entries/$ENTRY_2_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 204 "$BODY"

# ==========================================
# DELETE — non-existent should fail
# ==========================================
log_test "DELETE /schedule-entries/:id — non-existent should fail 404"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-entries/00000000-0000-0000-0000-000000000000")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# VERIFY — list should show only today's entry
# ==========================================
log_test "VERIFY — list should show 1 entry after delete"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries?startDate=$TODAY&endDate=$TOMORROW")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

REMAINING=$(echo "$BODY" | grep -o '"date"' | wc -l)
if [ "$REMAINING" -eq 1 ]; then
  echo "✅ Only 1 entry remaining after delete"
else
  echo "❌ Expected 1 entry, got $REMAINING"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# CLEANUP — delete remaining schedule entry
# ==========================================
log_test "CLEANUP — delete remaining schedule entry"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-entries/$ENTRY_1_ID")
DEL_STATUS=$(echo "$RESPONSE" | tail -1)
echo "Deleted entry $ENTRY_1_ID — status: $DEL_STATUS"

# ==========================================
# CLEANUP — delete schedule requirement
# ==========================================
log_test "CLEANUP — delete schedule requirement"

RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-requirements/$REQ_ID")
DEL_STATUS=$(echo "$RESPONSE" | tail -1)
echo "Deleted requirement $REQ_ID — status: $DEL_STATUS"

# ==========================================
# CLEANUP — delete team members
# ==========================================
log_test "CLEANUP — delete team members"

for MEMBER_ID in $DOCTOR_1_ID $DOCTOR_2_ID $DOCTOR_3_ID $NURSE_1_ID $NURSE_2_ID; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/team-members/$MEMBER_ID")
  DEL_STATUS=$(echo "$RESPONSE" | tail -1)
  echo "Deleted $MEMBER_ID — status: $DEL_STATUS"
done

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
