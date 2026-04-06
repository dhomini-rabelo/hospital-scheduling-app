#!/bin/bash

BASE_URL="http://localhost:5000"
PASSED=0
FAILED=0

TODAY=$(date -u +%Y-%m-%d)
TOMORROW=$(date -u -d "+1 day" +%Y-%m-%d)
DAY_AFTER=$(date -u -d "+2 days" +%Y-%m-%d)
FAR_FUTURE=$(date -u -d "+30 days" +%Y-%m-%d)

# Monday-based dates for auto-fill tests
DOW=$(date -u +%u)
THIS_MONDAY=$(date -u -d "-$((DOW - 1)) days" +%Y-%m-%d)
NEXT_MONDAY=$(date -u -d "$THIS_MONDAY + 7 days" +%Y-%m-%d)
A_TUESDAY=$(date -u -d "$THIS_MONDAY + 1 day" +%Y-%m-%d)
FAR_MONDAY=$(date -u -d "$THIS_MONDAY + 21 days" +%Y-%m-%d)

# Next week dates (Mon-Sun) for auto-fill
WEEK_DAY_0=$NEXT_MONDAY
WEEK_DAY_1=$(date -u -d "$NEXT_MONDAY + 1 day" +%Y-%m-%d)
WEEK_DAY_2=$(date -u -d "$NEXT_MONDAY + 2 days" +%Y-%m-%d)
WEEK_DAY_3=$(date -u -d "$NEXT_MONDAY + 3 days" +%Y-%m-%d)
WEEK_DAY_4=$(date -u -d "$NEXT_MONDAY + 4 days" +%Y-%m-%d)
WEEK_DAY_5=$(date -u -d "$NEXT_MONDAY + 5 days" +%Y-%m-%d)
WEEK_DAY_6=$(date -u -d "$NEXT_MONDAY + 6 days" +%Y-%m-%d)

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
      { "name": "Julia Alves", "profession": "NURSE", "specialty": "EMERGENCY" },
      { "name": "Dr. Rafael Souza", "profession": "DOCTOR", "specialty": "NEUROLOGY" },
      { "name": "Dr. Fernando Dias", "profession": "DOCTOR", "specialty": "ORTHOPEDICS" },
      { "name": "Camila Rocha", "profession": "NURSE", "specialty": "GENERAL_WARD" }
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
DOCTOR_SWAP_NEURO_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '6p' | cut -d'"' -f4)
DOCTOR_SWAP_ORTHO_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '7p' | cut -d'"' -f4)
NURSE_SWAP_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '8p' | cut -d'"' -f4)
echo "Doctor IDs: $DOCTOR_1_ID, $DOCTOR_2_ID, $DOCTOR_3_ID"
echo "Nurse IDs: $NURSE_1_ID, $NURSE_2_ID"
echo "Swap Doctor IDs: $DOCTOR_SWAP_NEURO_ID, $DOCTOR_SWAP_ORTHO_ID"
echo "Swap Nurse ID: $NURSE_SWAP_ID"

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
    \"scheduleRequirementIds\": [\"00000000-0000-0000-0000-000000000000\"]
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
    \"structure\": []
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SET — update existing entry (change structure)
# ==========================================
log_test "PUT /schedule-entries — update existing entry structure"

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
    \"scheduleRequirementIds\": [\"$REQ_ID\"]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

# ==========================================
# AUTO-FILL-GAPS — fill ENTRY_1 with team members
# ==========================================
log_test "POST /schedule-entries/:entryId/auto-fill-gaps — fill ENTRY_1"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$ENTRY_1_ID/auto-fill-gaps")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

# ==========================================
# DISCOVER — identify which members were assigned
# ==========================================
log_test "DISCOVER — list ENTRY_1 to identify assigned members"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries?startDate=$TODAY&endDate=$TODAY")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

# Determine which NEURO doctor was assigned
if echo "$BODY" | grep -q "$DOCTOR_1_ID"; then
  ASSIGNED_NEURO_ID=$DOCTOR_1_ID
  UNASSIGNED_NEURO_ID=$DOCTOR_SWAP_NEURO_ID
else
  ASSIGNED_NEURO_ID=$DOCTOR_SWAP_NEURO_ID
  UNASSIGNED_NEURO_ID=$DOCTOR_1_ID
fi

# Find an assigned non-NEURO doctor
ASSIGNED_OTHER_DOCTOR_ID=""
if echo "$BODY" | grep -q "$DOCTOR_2_ID"; then
  ASSIGNED_OTHER_DOCTOR_ID=$DOCTOR_2_ID
elif echo "$BODY" | grep -q "$DOCTOR_3_ID"; then
  ASSIGNED_OTHER_DOCTOR_ID=$DOCTOR_3_ID
elif echo "$BODY" | grep -q "$DOCTOR_SWAP_ORTHO_ID"; then
  ASSIGNED_OTHER_DOCTOR_ID=$DOCTOR_SWAP_ORTHO_ID
fi

# Find an unassigned non-NEURO doctor (for specialty mismatch test)
UNASSIGNED_NON_NEURO_DOCTOR_ID=""
if ! echo "$BODY" | grep -q "$DOCTOR_SWAP_ORTHO_ID"; then
  UNASSIGNED_NON_NEURO_DOCTOR_ID=$DOCTOR_SWAP_ORTHO_ID
elif ! echo "$BODY" | grep -q "$DOCTOR_2_ID"; then
  UNASSIGNED_NON_NEURO_DOCTOR_ID=$DOCTOR_2_ID
elif ! echo "$BODY" | grep -q "$DOCTOR_3_ID"; then
  UNASSIGNED_NON_NEURO_DOCTOR_ID=$DOCTOR_3_ID
fi

# Find an assigned nurse
ASSIGNED_NURSE_ID=""
if echo "$BODY" | grep -q "$NURSE_1_ID"; then
  ASSIGNED_NURSE_ID=$NURSE_1_ID
elif echo "$BODY" | grep -q "$NURSE_2_ID"; then
  ASSIGNED_NURSE_ID=$NURSE_2_ID
elif echo "$BODY" | grep -q "$NURSE_SWAP_ID"; then
  ASSIGNED_NURSE_ID=$NURSE_SWAP_ID
fi

# Find an unassigned nurse (for profession mismatch test)
UNASSIGNED_NURSE_ID=""
if ! echo "$BODY" | grep -q "$NURSE_1_ID"; then
  UNASSIGNED_NURSE_ID=$NURSE_1_ID
elif ! echo "$BODY" | grep -q "$NURSE_2_ID"; then
  UNASSIGNED_NURSE_ID=$NURSE_2_ID
else
  UNASSIGNED_NURSE_ID=$NURSE_SWAP_ID
fi

echo "Assigned NEURO doctor: $ASSIGNED_NEURO_ID"
echo "Unassigned NEURO doctor: $UNASSIGNED_NEURO_ID"
echo "Assigned other doctor: $ASSIGNED_OTHER_DOCTOR_ID"
echo "Unassigned non-NEURO doctor: $UNASSIGNED_NON_NEURO_DOCTOR_ID"
echo "Assigned nurse: $ASSIGNED_NURSE_ID"
echo "Unassigned nurse: $UNASSIGNED_NURSE_ID"

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
# AUTO-FILL — error: weekStartDate is not a Monday
# ==========================================
log_test "POST /schedule-entries/auto-fill — not a Monday should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/auto-fill" \
  -H "Content-Type: application/json" \
  -d "{
    \"weekStartDate\": \"$A_TUESDAY\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# AUTO-FILL — error: weekStartDate outside allowed range
# ==========================================
log_test "POST /schedule-entries/auto-fill — outside range should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/auto-fill" \
  -H "Content-Type: application/json" \
  -d "{
    \"weekStartDate\": \"$FAR_MONDAY\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# AUTO-FILL — setup: create entries for next week (Mon-Sun)
# ==========================================
log_test "AUTO-FILL SETUP — create 7 entries for next week (no team members)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$WEEK_DAY_0\", \"$WEEK_DAY_1\", \"$WEEK_DAY_2\", \"$WEEK_DAY_3\", \"$WEEK_DAY_4\", \"$WEEK_DAY_5\", \"$WEEK_DAY_6\"],
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
    \"teamMemberIds\": []
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

AUTOFILL_ENTRY_1_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '1p' | cut -d'"' -f4)
AUTOFILL_ENTRY_2_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
AUTOFILL_ENTRY_3_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)
AUTOFILL_ENTRY_4_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '4p' | cut -d'"' -f4)
AUTOFILL_ENTRY_5_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '5p' | cut -d'"' -f4)
AUTOFILL_ENTRY_6_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '6p' | cut -d'"' -f4)
AUTOFILL_ENTRY_7_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | sed -n '7p' | cut -d'"' -f4)
echo "Auto-fill entry IDs: $AUTOFILL_ENTRY_1_ID, $AUTOFILL_ENTRY_2_ID, ..., $AUTOFILL_ENTRY_7_ID"

# ==========================================
# AUTO-FILL — happy path: auto-fill the week
# ==========================================
log_test "POST /schedule-entries/auto-fill — fill next week"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/auto-fill" \
  -H "Content-Type: application/json" \
  -d "{
    \"weekStartDate\": \"$NEXT_MONDAY\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_ENTRIES=$(echo "$BODY" | grep -o '"entries"')
HAS_GAP_REPORT=$(echo "$BODY" | grep -o '"gapReport"')
HAS_HAS_GAPS=$(echo "$BODY" | grep -o '"hasGaps"')

if [ -n "$HAS_ENTRIES" ] && [ -n "$HAS_GAP_REPORT" ] && [ -n "$HAS_HAS_GAPS" ]; then
  echo "✅ Auto-fill response has entries, gapReport, and hasGaps fields"
else
  echo "❌ Auto-fill response missing expected fields"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# AUTO-FILL-GAPS — error: non-existent entry
# ==========================================
log_test "POST /schedule-entries/:entryId/auto-fill-gaps — non-existent should fail 404"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/00000000-0000-0000-0000-000000000000/auto-fill-gaps")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# AUTO-FILL-GAPS — happy path: fully-filled entry
# ==========================================
log_test "POST /schedule-entries/:entryId/auto-fill-gaps — fully-filled entry (no gaps)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$ENTRY_1_ID/auto-fill-gaps")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_ENTRY=$(echo "$BODY" | grep -o '"entry"')
HAS_GAP_REPORT=$(echo "$BODY" | grep -o '"gapReport"')
HAS_NO_GAPS=$(echo "$BODY" | grep -o '"hasGaps":false')

if [ -n "$HAS_ENTRY" ] && [ -n "$HAS_GAP_REPORT" ]; then
  echo "✅ Auto-fill-gaps response has entry and gapReport fields"
else
  echo "❌ Auto-fill-gaps response missing expected fields"
  FAILED=$((FAILED + 1))
fi

if [ -n "$HAS_NO_GAPS" ]; then
  echo "✅ hasGaps is false for fully-filled entry"
else
  echo "❌ Expected hasGaps to be false"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# AUTO-FILL-GAPS — happy path: partially-filled entry
# ==========================================
log_test "AUTO-FILL-GAPS SETUP — create partial entry for DAY_AFTER"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/schedule-entries" \
  -H "Content-Type: application/json" \
  -d "{
    \"dates\": [\"$DAY_AFTER\"],
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
    ]
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

PARTIAL_ENTRY_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Partial entry ID: $PARTIAL_ENTRY_ID"

log_test "POST /schedule-entries/:entryId/auto-fill-gaps — empty entry (fill from scratch)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$PARTIAL_ENTRY_ID/auto-fill-gaps")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_ENTRY=$(echo "$BODY" | grep -o '"entry"')
HAS_GAP_REPORT=$(echo "$BODY" | grep -o '"gapReport"')
HAS_PROFESSION_GAPS=$(echo "$BODY" | grep -o '"professionGaps"')

if [ -n "$HAS_ENTRY" ] && [ -n "$HAS_GAP_REPORT" ] && [ -n "$HAS_PROFESSION_GAPS" ]; then
  echo "✅ Auto-fill-gaps response has entry, gapReport, and professionGaps fields"
else
  echo "❌ Auto-fill-gaps response missing expected fields"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# SWAP CANDIDATES — error: non-existent entry
# ==========================================
log_test "GET /schedule-entries/:entryId/swap-candidates/:teamMemberId — non-existent entry 404"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries/00000000-0000-0000-0000-000000000000/swap-candidates/$ASSIGNED_NEURO_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# SWAP CANDIDATES — error: team member not assigned to entry
# ==========================================
log_test "GET /swap-candidates — team member not assigned should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap-candidates/$UNASSIGNED_NEURO_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SWAP CANDIDATES — happy path: doctor (specialty slot)
# ==========================================
log_test "GET /swap-candidates — candidates for assigned NEURO doctor (specialty slot)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap-candidates/$ASSIGNED_NEURO_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_SWAP_CONTEXT=$(echo "$BODY" | grep -o '"swapContext"')
HAS_CANDIDATES=$(echo "$BODY" | grep -o '"candidates"')

if [ -n "$HAS_SWAP_CONTEXT" ] && [ -n "$HAS_CANDIDATES" ]; then
  echo "✅ Swap candidates response has swapContext and candidates fields"
else
  echo "❌ Swap candidates response missing expected fields"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# SWAP CANDIDATES — happy path: nurse (general slot)
# ==========================================
log_test "GET /swap-candidates — candidates for assigned nurse (general slot)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap-candidates/$ASSIGNED_NURSE_ID")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_SWAP_CONTEXT=$(echo "$BODY" | grep -o '"swapContext"')
HAS_CANDIDATES=$(echo "$BODY" | grep -o '"candidates"')

if [ -n "$HAS_SWAP_CONTEXT" ] && [ -n "$HAS_CANDIDATES" ]; then
  echo "✅ Swap candidates response has swapContext and candidates fields"
else
  echo "❌ Swap candidates response missing expected fields"
  FAILED=$((FAILED + 1))
fi

# ==========================================
# SWAP — error: non-existent entry
# ==========================================
log_test "POST /schedule-entries/:entryId/swap — non-existent entry should fail 404"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/00000000-0000-0000-0000-000000000000/swap" \
  -H "Content-Type: application/json" \
  -d "{
    \"removeTeamMemberId\": \"$ASSIGNED_NEURO_ID\",
    \"addTeamMemberId\": \"$UNASSIGNED_NEURO_ID\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 404 "$BODY"

# ==========================================
# SWAP — error: removeTeamMemberId not assigned
# ==========================================
log_test "POST /swap — remove member not assigned should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap" \
  -H "Content-Type: application/json" \
  -d "{
    \"removeTeamMemberId\": \"$UNASSIGNED_NEURO_ID\",
    \"addTeamMemberId\": \"$ASSIGNED_NEURO_ID\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SWAP — error: addTeamMemberId already assigned
# ==========================================
log_test "POST /swap — add member already assigned should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap" \
  -H "Content-Type: application/json" \
  -d "{
    \"removeTeamMemberId\": \"$ASSIGNED_NEURO_ID\",
    \"addTeamMemberId\": \"$ASSIGNED_OTHER_DOCTOR_ID\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SWAP — error: profession mismatch
# ==========================================
log_test "POST /swap — profession mismatch should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap" \
  -H "Content-Type: application/json" \
  -d "{
    \"removeTeamMemberId\": \"$ASSIGNED_NEURO_ID\",
    \"addTeamMemberId\": \"$UNASSIGNED_NURSE_ID\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SWAP — error: specialty mismatch on specialty slot
# ==========================================
log_test "POST /swap — specialty mismatch should fail 400"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap" \
  -H "Content-Type: application/json" \
  -d "{
    \"removeTeamMemberId\": \"$ASSIGNED_NEURO_ID\",
    \"addTeamMemberId\": \"$UNASSIGNED_NON_NEURO_DOCTOR_ID\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 400 "$BODY"

# ==========================================
# SWAP — happy path: swap NEURO doctor for another NEURO doctor
# ==========================================
log_test "POST /swap — swap assigned NEURO for unassigned NEURO (both NEUROLOGY)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/schedule-entries/$ENTRY_1_ID/swap" \
  -H "Content-Type: application/json" \
  -d "{
    \"removeTeamMemberId\": \"$ASSIGNED_NEURO_ID\",
    \"addTeamMemberId\": \"$UNASSIGNED_NEURO_ID\"
  }")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -1)
log_result "$STATUS" 200 "$BODY"

HAS_ENTRY=$(echo "$BODY" | grep -o '"entry"')
if [ -n "$HAS_ENTRY" ]; then
  echo "✅ Swap response has entry field"
else
  echo "❌ Swap response missing entry field"
  FAILED=$((FAILED + 1))
fi

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
# CLEANUP — delete remaining schedule entries
# ==========================================
log_test "CLEANUP — delete remaining schedule entries"

for ENTRY_ID in $ENTRY_1_ID $PARTIAL_ENTRY_ID $AUTOFILL_ENTRY_1_ID $AUTOFILL_ENTRY_2_ID $AUTOFILL_ENTRY_3_ID $AUTOFILL_ENTRY_4_ID $AUTOFILL_ENTRY_5_ID $AUTOFILL_ENTRY_6_ID $AUTOFILL_ENTRY_7_ID; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/schedule-entries/$ENTRY_ID")
  DEL_STATUS=$(echo "$RESPONSE" | tail -1)
  echo "Deleted entry $ENTRY_ID — status: $DEL_STATUS"
done

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

for MEMBER_ID in $DOCTOR_1_ID $DOCTOR_2_ID $DOCTOR_3_ID $NURSE_1_ID $NURSE_2_ID $DOCTOR_SWAP_NEURO_ID $DOCTOR_SWAP_ORTHO_ID $NURSE_SWAP_ID; do
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
