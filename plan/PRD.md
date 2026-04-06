---
version: 1.3.0
owner: dhomini-rabelo
status: draft
last_updated: 2026-04-05
dependencies: []
llm_directives:
  temperature: 0.2
  persona: >
    You are an expert senior software engineer. Your task is to analyze these
    requirements and generate clean, efficient, and well-documented code that
    adheres to all specified constraints. You MUST NOT deviate from the technical
    constraints or functional requirements without explicit approval.
---

# PRD: Hospital Staff Scheduling App

## 1. Overview & Goals

### 1.1 Product Summary

A hospital staff scheduling application that enables administrators to manage a roster of hospital staff, define minimum staffing requirements per profession and specialty, and automatically generate weekly schedules. The application features an AI-powered chat interface that allows users to perform all scheduling actions through natural language commands instead of traditional UI controls. Staff are scheduled at the day level (which team members work each day of the week), and the system ensures all department staffing rules are satisfied. Staffing rules are defined against date references (e.g., weekday, weekend, monday, 1st of the month) and specify both total profession counts and specialty sub-requirements.

### 1.2 Business Goals

* **Goal-001**: Enable hospital administrators to generate a fully compliant weekly schedule automatically based on staffing rules and available team members
* **Goal-002**: Reduce manual scheduling effort by providing an AI chat interface for natural language control of all features
* **Goal-003**: Ensure minimum staffing requirements are always met and visually flagged when they are not

### 1.3 Key Entities

The system is built around the following core entities:

* **Team Member**: A hospital staff member with a name, profession, specialty, and active/inactive status. Represents anyone who can be scheduled (doctors, nurses, technicians, support staff).
* **Date Reference**: A label used to categorize days for staffing rules. Examples: "weekday", "weekend", "monday", "1st of the month". Date references are user-defined labels that are matched against calendar dates when evaluating schedule requirements.
* **Schedule Requirement**: A staffing rule that defines how many staff of a given profession are needed for a specific date reference, and optionally how many of those must be from specific specialties. Schedule requirements can be enabled or disabled. Example: "5 Doctors on weekdays — of which 2 must be Neurologists and 1 must be a Cardiologist."
* **Schedule Entry**: A single assignment of a team member to a specific date. The collection of all entries for a week forms the weekly schedule.

### 1.4 Professions & Specialties

The system supports the following hospital roles:

| Profession | Specialties |
|------------|-------------|
| Doctor | Neurology, Cardiology, Orthopedics, Pediatrics, Emergency, General |
| Nurse | ICU, Emergency, General Ward, Pediatric |
| Technician | Radiology, Lab, Pharmacy |
| Support Staff | Receptionist, Cleaning, Security |

---

## 2. Technical Constraints & Environment

**CRITICAL**: These constraints are immutable. All generated code MUST comply.

* **Languages**: TypeScript 5.0+ across the entire stack
* **Frontend**: React 18+ with Vite as build tool
* **Backend**: Express.js on Node.js
* **Database**: SQLite (local, file-based) — keep it simple, no external DB servers
* **Styling**: Tailwind CSS
* **AI Integration**: LLM API for the chat interface (Claude API via Anthropic SDK)
* **Monorepo**: Frontend and backend coexist in the same repository (already structured as `frontend/` and `backend/`)
* **Linting**: ESLint (already configured in the project)
* **Forbidden Libraries/Patterns**:
  * `eval()` or `exec()` anywhere in the codebase
  * No heavy ORMs — except Prisma, which is the chosen ORM for this project
  * No server-side rendering — the frontend is a single-page application (SPA)

---

## 3. User Personas & Roles

* **Persona-Admin**: A hospital scheduling administrator responsible for managing the staff roster, configuring staffing requirements, and generating weekly schedules. This is the sole user of the application. They need a clear, efficient interface to define rules, generate schedules, make quick adjustments, and verify coverage. They value speed and the ability to control everything via the AI chat without needing to navigate complex UIs.

---

## 4. Functional Requirements / User Stories

**IMPORTANT**: Each user story and acceptance criterion has a unique, machine-readable ID.

### **US-001**: Manage Team Members ✅ COMPLETED

* **As a**: Persona-Admin
* **I want to**: Add, edit, and remove hospital staff members with their profession and specialty
* **So that**: I have an up-to-date roster of available staff for scheduling

**Acceptance Criteria**:

* **AC-001-A**: The system MUST allow creating one or more team members at once through a batch creation form. Each team member entry includes: name, profession (Doctor, Nurse, Technician, Support Staff), and specialty (from the valid specialties for the chosen profession). The form MUST allow adding multiple rows before submitting them all in a single request.
* **AC-001-B**: The system MUST validate that the selected specialty is valid for the chosen profession for every team member in the batch
* **AC-001-C**: The system MUST allow editing a team member's name, profession, and specialty
* **AC-001-D**: The system MUST allow deleting a team member from the roster
* **AC-001-E**: The system MUST display all team members in a list, filterable by profession
* **AC-001-F**: The system MUST persist all team member data in SQLite
* **AC-001-G**: The Team Members page MUST be accessible via the sidebar navigation
* **AC-001-H**: The backend API MUST accept an array of team members in a single POST request and create all of them atomically (all succeed or all fail)

### **US-002**: Define Schedule Requirements ✅ COMPLETED

* **As a**: Persona-Admin
* **I want to**: Configure how many staff of each profession are needed per date reference, and how many of those must be from specific specialties
* **So that**: The auto-fill algorithm knows the minimum staffing levels to satisfy

**Acceptance Criteria**:

* **AC-002-A**: The system MUST allow creating a schedule requirement with: profession, date reference (e.g., weekday, weekend, monday, 1st of the month), and required count (positive integer representing total staff of that profession needed)
* **AC-002-B**: The system MUST allow specifying specialty sub-requirements within a schedule requirement, defining how many of the total required staff must be from a specific specialty (e.g., "of 5 Doctors, 2 must be Neurologists and 1 must be a Cardiologist")
* **AC-002-C**: The system MUST prevent duplicate rules for the same combination of profession and date reference
* **AC-002-D**: The system MUST validate that the sum of specialty sub-requirements does not exceed the total required count for the profession
* **AC-002-E**: The system MUST allow editing the required count and specialty sub-requirements of an existing schedule requirement
* **AC-002-F**: The system MUST allow deleting a schedule requirement
* **AC-002-G**: The system MUST allow enabling or disabling a schedule requirement. Disabled requirements are ignored by the auto-fill algorithm and schedule validation but remain persisted for future use
* **AC-002-H**: The system MUST display all current schedule requirements in a table format, with a clear visual indicator for disabled requirements
* **AC-002-I**: The system MUST persist all schedule requirements in SQLite
* **AC-002-J**: The Schedule Requirements page MUST be accessible via the sidebar navigation

### **US-003**: View & Create Schedules ✅ COMPLETED

* **As a**: Persona-Admin
* **I want to**: See a daily schedule overview for the current and next week, and create schedules by selecting date ranges and staffing structures
* **So that**: I can verify staffing coverage, identify gaps, and build schedules with full control over which requirements and staffing levels apply

**Acceptance Criteria**:

#### Mini Calendar Navigation

* **AC-003-A**: The system MUST display a mini calendar at the top of the schedule page showing all dates for the current week (Monday through Sunday)
* **AC-003-B**: The mini calendar MUST be horizontally scrollable to reveal the next week's dates (Monday through Sunday of the following week)
* **AC-003-C**: The mini calendar MUST always have exactly one selected day. The default selected day is today (or the nearest available day)
* **AC-003-D**: The system MUST restrict schedule viewing and manipulation to only the current week and the next week. No past weeks or weeks beyond next week are accessible

#### Schedule Overview (Main Component)

* **AC-003-E**: Below the mini calendar, the system MUST display a complete schedule overview for the selected day
* **AC-003-F**: The schedule overview MUST show which enabled schedule requirements are fulfilled and which are not fulfilled for the selected day
* **AC-003-G**: The schedule overview MUST display the total count of doctors scheduled and a breakdown by specialty for the selected day
* **AC-003-H**: The schedule overview MUST display the total count of each profession scheduled for the selected day
* **AC-003-I**: The schedule overview MUST list the selected (assigned) team members for the selected day
* **AC-003-J**: The schedule overview MUST clearly indicate staffing gaps — where the assigned staff count does not meet the enabled schedule requirements for any profession or specialty

#### Schedule Creation Form

* **AC-003-K**: The system MUST provide a form for the admin to create a new schedule
* **AC-003-L**: The schedule creation form MUST include a date range selector. The date range MUST be constrained to dates within the current week and the next week only
* **AC-003-M**: The schedule creation form MUST allow the admin to select which schedule requirements to apply to the new schedule
* **AC-003-N**: The schedule creation form MUST allow the admin to define the staffing structure: how many of each profession and how many of each specialty within a profession are needed
* **AC-003-O**: The system MUST persist the created schedule entries in SQLite

#### General

* **AC-003-P**: The Schedule View MUST be the default landing page of the application
* **AC-003-Q**: The Schedule View page MUST be accessible via the sidebar navigation

### **US-004**: Auto-fill Schedule ✅ COMPLETED

* **As a**: Persona-Admin
* **I want to**: Automatically generate a week's schedule based on the defined requirements and available team members
* **So that**: I don't have to manually assign each staff member to each day

**Acceptance Criteria**:

* **AC-004-A**: The system MUST auto-fill the schedule for a selected week based on all enabled schedule requirements
* **AC-004-B**: The system MUST only assign team members whose profession and specialty match the requirement being filled
* **AC-004-C**: The system MUST distribute assignments fairly across eligible team members to avoid scheduling the same person every single day
* **AC-004-D**: The system MUST report to the user when requirements cannot be fully met due to insufficient staff, indicating which profession/specialty is short-staffed
* **AC-004-E**: The system MUST persist the generated schedule entries in SQLite
* **AC-004-F**: The system MUST clear any existing schedule entries for the target week before generating new ones

### **US-005**: Swap Staff and Auto-fill Gaps ✅ COMPLETED

* **As a**: Persona-Admin
* **I want to**: Remove a team member from a specific day and have the system fill the gap
* **So that**: I can handle last-minute changes without regenerating the entire week's schedule

**Acceptance Criteria**:

* **AC-005-A**: The system MUST allow removing a specific team member from a specific day in the schedule
* **AC-005-B**: After removal, the system MUST automatically assign a replacement from eligible team members (matching profession and specialty)
* **AC-005-C**: The system MUST allow the user to manually pick a replacement from a list of eligible team members instead of auto-assigning
* **AC-005-D**: The system MUST update the persisted schedule after the swap

### **US-006**: AI Chat Interface

* **As a**: Persona-Admin
* **I want to**: Use natural language commands in a chat widget to control all scheduling features, with a validation step before any action is executed
* **So that**: I can manage everything conversationally while staying in full control of what changes are applied to the system

**Acceptance Criteria**:

#### Chat Widget

* **AC-006-A**: The system MUST provide a floating chat widget in the bottom-right corner of the screen, accessible from all pages of the application
* **AC-006-B**: The chat widget MUST be collapsible (toggle open/close) and MUST persist its conversation state while navigating between pages
* **AC-006-C**: The chat MUST support natural language commands for all system actions: team member management, schedule requirement management, schedule creation, auto-fill, and staff swaps

#### Tool Execution with User Validation

* **AC-006-D**: When the AI determines an action to perform, it MUST NOT execute the action immediately. Instead, it MUST present a validation request in the chat as a message with an "Review Action" button
* **AC-006-E**: Clicking the "Review Action" button MUST open an expanded card/panel within the chat showing the tool call details: the tool name, and a structured, human-readable presentation of the tool input parameters
* **AC-006-F**: Each tool name MUST have a specific visual data presentation tailored to its action type, so the user can easily understand what will happen. For example: a team member creation tool shows the member's name/profession/specialty in a profile-like card; an auto-fill tool shows the target week and applied requirements; a swap tool shows a "before → after" visual with the two team members and the date
* **AC-006-G**: The validation card MUST include an "Approve" button and a "Reject" button
* **AC-006-H**: If the user approves, the system MUST execute the tool call against the backend API and display a success or error message in the chat
* **AC-006-I**: If the user rejects, the system MUST NOT execute the action and MUST display an acknowledgment message in the chat (e.g., "Action cancelled.")
* **AC-006-J**: The AI MAY propose multiple tool calls in a single response. Each tool call MUST be independently reviewable and approvable/rejectable by the user

#### AI Capabilities

* **AC-006-K**: The chat MUST interpret commands for team member management (e.g., "Add a neurologist doctor named Dr. Ana Silva")
* **AC-006-L**: The chat MUST interpret commands for schedule requirements (e.g., "We need 3 neuro doctors on weekdays and 5 on weekends")
* **AC-006-M**: The chat MUST interpret commands to trigger schedule auto-fill (e.g., "Fill the schedule for this week")
* **AC-006-N**: The chat MUST interpret commands to swap staff (e.g., "Replace Dr. Silva with Dr. Costa on Monday")
* **AC-006-O**: The chat MUST display clear responses confirming the action taken or asking for clarification when the command is ambiguous

#### Contextual AI Entry Points

* **AC-006-P**: Each main page MUST include a contextual button that opens the chat widget with a pre-filled, page-specific prompt and the textarea focused for immediate typing. The buttons and prompts are:
  * **Team Members page**: Button labeled "Manage with AI" — opens chat with: `I want to make the following changes on the staff:\n\n - ` (example)
  * **Schedule Requirements page**: Button labeled "Configure with AI" — opens chat with: `I need the following staffing rules:\n\n - ` (example)
  * **Schedule page**: Button labeled "Schedule with AI" — opens chat with: `For the schedule of the week of [current week start date]:\n\n - ` (example)
* **AC-006-Q**: If the chat widget is already open when a contextual button is clicked, the system MUST replace the current textarea content with the new pre-filled prompt and focus the textarea

#### Real-time UI Sync

* **AC-006-R**: The UI MUST update in real-time to reflect changes made via approved chat actions (e.g., if a team member is added via chat, the Team Members page must reflect it without a manual refresh)

### **US-007**: Application Layout and Navigation ✅ COMPLETED

* **As a**: Persona-Admin
* **I want to**: Navigate between pages using a persistent left sidebar
* **So that**: I can quickly access all sections of the application

**Acceptance Criteria**:

* **AC-007-A**: The application MUST display a fixed left sidebar on all pages
* **AC-007-B**: The sidebar MUST contain navigation links to: Schedule (default), Schedule Requirements, and Team Members
* **AC-007-C**: The sidebar MUST visually indicate which page is currently active
* **AC-007-D**: The main content area MUST render to the right of the sidebar
* **AC-007-E**: The Schedule page MUST be the default route (/)

---

## 5. Non-Functional Requirements (NFRs)

### Performance

* **NFR-Perf-001**: The auto-fill algorithm MUST complete schedule generation for one week in < 2 seconds for a roster of up to 200 team members
* **NFR-Perf-002**: All API endpoints MUST respond in < 500ms under normal single-user load

### Security

* **NFR-Sec-001**: All API endpoints MUST use parameterized queries to prevent SQL injection
* **NFR-Sec-002**: AI chat user input MUST be sanitized before being sent to the LLM API

### Usability

* **NFR-Use-001**: The UI MUST be usable on desktop screens with a minimum width of 1024px
* **NFR-Use-002**: The weekly schedule calendar MUST be fully visible without horizontal scrolling on a 1280px-wide viewport

---

## 6. Out of Scope (Non-Goals)

**CRITICAL**: The following features will NOT be included in this version to prevent scope creep and agent hallucination.

* User authentication and authorization — this is a single-user desktop application
* Multiple shifts per day (morning, afternoon, night) — scheduling is at the day level only
* Per-day availability patterns for team members (e.g., "available only Mon/Wed/Fri")
* Drag-and-drop schedule editing in the calendar UI
* Notifications, email alerts, or push notifications
* Mobile-responsive design — desktop-first and desktop-only
* Reporting, analytics, or dashboard metrics
* Multi-hospital or multi-location support
* Recurring schedule templates or schedule copying between weeks
* Time-off, vacation, or leave management
* Integration with external calendar systems (Google Calendar, Outlook, etc.)
* Real-time multi-user collaboration
* Print or export schedule to PDF/CSV
* Department entity as a separate manageable resource — the specialty field on team members serves this purpose

---

## 7. Success Metrics & Analytics

### Key Performance Indicators (KPIs)

* **KPI-001**: The auto-fill algorithm MUST generate a valid and complete weekly schedule when sufficient staff exists to meet all requirements (Goal-001)
* **KPI-002**: The AI chat MUST correctly interpret and execute the 5 core command types: add/edit/remove team member, set/update schedule requirement, auto-fill schedule, swap staff member, and query schedule state (Goal-002)
* **KPI-003**: The schedule view MUST accurately reflect 100% of assignments stored in the database at all times (Goal-003)
* **KPI-004**: Days that fail to meet staffing requirements MUST be visually flagged in the schedule view (Goal-003)

---

## Appendix A: Cross-Reference Index

### User Stories
US-001, US-002, US-003, US-004, US-005, US-006, US-007

### Acceptance Criteria
AC-001-A through AC-001-H, AC-002-A through AC-002-J, AC-003-A through AC-003-Q, AC-004-A through AC-004-F, AC-005-A through AC-005-D, AC-006-A through AC-006-R, AC-007-A through AC-007-E

### Non-Functional Requirements
NFR-Perf-001, NFR-Perf-002, NFR-Sec-001, NFR-Sec-002, NFR-Use-001, NFR-Use-002

### KPIs
KPI-001, KPI-002, KPI-003, KPI-004

---

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-04-01 | dhomini-rabelo | Initial draft |
| 1.1.0 | 2026-04-04 | dhomini-rabelo | Marked US-001 as completed. Replaced "day type" with "date reference" as a flexible label (weekday, weekend, monday, 1st of the month, etc.). Reworked schedule requirements: now define total profession count per date reference with optional specialty sub-requirements. Added ability to enable/disable schedule requirements. |
| 1.2.0 | 2026-04-04 | dhomini-rabelo | Marked US-002 as completed. Rewrote US-003 from a weekly grid view to a day-focused view with: mini calendar (current + next week only), daily schedule overview (requirement fulfillment, profession/specialty counts, assigned members, gaps), and a schedule creation form (date range, applied requirements, staffing structure). |
| 1.3.0 | 2026-04-05 | dhomini-rabelo | Marked US-003, US-004, US-005, and US-007 as completed. Rewrote US-006 (AI Chat Interface): changed from immediate-execution chat to a tool-validation flow — the AI proposes actions, the user reviews tool inputs in a structured visual card with tool-specific data presentation, and explicitly approves or rejects each action before execution. Chat widget moved to a floating bottom-right position. Added contextual AI entry points: each page gets a button ("Manage with AI", "Configure with AI", "Schedule with AI") that opens the chat with a pre-filled, page-specific prompt. |
