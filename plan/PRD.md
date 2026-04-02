---
version: 1.0.0
owner: dhomini-rabelo
status: draft
last_updated: 2026-04-01
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

A hospital staff scheduling application that enables administrators to manage a roster of hospital staff, define minimum staffing requirements per profession and specialty, and automatically generate weekly schedules. The application features an AI-powered chat interface that allows users to perform all scheduling actions through natural language commands instead of traditional UI controls. Staff are scheduled at the day level (which team members work each day of the week), and the system ensures all department staffing rules are satisfied.

### 1.2 Business Goals

* **Goal-001**: Enable hospital administrators to generate a fully compliant weekly schedule automatically based on staffing rules and available team members
* **Goal-002**: Reduce manual scheduling effort by providing an AI chat interface for natural language control of all features
* **Goal-003**: Ensure minimum staffing requirements are always met and visually flagged when they are not

### 1.3 Key Entities

The system is built around the following core entities:

* **Team Member**: A hospital staff member with a name, profession, specialty, and active/inactive status. Represents anyone who can be scheduled (doctors, nurses, technicians, support staff).
* **Schedule Requirement**: A staffing rule that defines how many staff of a given profession and specialty are needed per day type (weekday vs weekend). Example: "3 Neurologist Doctors on weekdays, 5 on weekends."
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

### **US-001**: Manage Team Members

* **As a**: Persona-Admin
* **I want to**: Add, edit, and remove hospital staff members with their profession and specialty
* **So that**: I have an up-to-date roster of available staff for scheduling

**Acceptance Criteria**:

* **AC-001-A**: The system MUST allow creating a team member with: name, profession (Doctor, Nurse, Technician, Support Staff), and specialty (from the valid specialties for the chosen profession)
* **AC-001-B**: The system MUST validate that the selected specialty is valid for the chosen profession
* **AC-001-C**: The system MUST allow editing a team member's name, profession, and specialty
* **AC-001-D**: The system MUST allow deleting a team member from the roster
* **AC-001-E**: The system MUST display all team members in a list, filterable by profession
* **AC-001-F**: The system MUST persist all team member data in SQLite
* **AC-001-G**: The Team Members page MUST be accessible via the sidebar navigation

### **US-002**: Define Schedule Requirements

* **As a**: Persona-Admin
* **I want to**: Configure how many staff of each profession and specialty are needed per day type (weekday vs weekend)
* **So that**: The auto-fill algorithm knows the minimum staffing levels to satisfy

**Acceptance Criteria**:

* **AC-002-A**: The system MUST allow creating a schedule requirement with: profession, specialty, day type (weekday or weekend), and required count (positive integer)
* **AC-002-B**: The system MUST prevent duplicate rules for the same combination of profession, specialty, and day type
* **AC-002-C**: The system MUST allow editing the required count of an existing schedule requirement
* **AC-002-D**: The system MUST allow deleting a schedule requirement
* **AC-002-E**: The system MUST display all current schedule requirements in a table format
* **AC-002-F**: The system MUST persist all schedule requirements in SQLite
* **AC-002-G**: The Schedule Requirements page MUST be accessible via the sidebar navigation

### **US-003**: View Weekly Schedule

* **As a**: Persona-Admin
* **I want to**: See a weekly calendar showing which team members are assigned to each day
* **So that**: I can verify staffing coverage and identify gaps

**Acceptance Criteria**:

* **AC-003-A**: The system MUST display a weekly view with 7 day columns (Monday through Sunday)
* **AC-003-B**: Each day column MUST show the assigned team members, grouped by profession and specialty
* **AC-003-C**: The system MUST allow navigating to the previous and next week
* **AC-003-D**: The system MUST visually highlight days where the assigned staff count does not meet the schedule requirements for any profession/specialty
* **AC-003-E**: The Schedule View MUST be the default landing page of the application
* **AC-003-F**: The Schedule View page MUST be accessible via the sidebar navigation

### **US-004**: Auto-fill Schedule

* **As a**: Persona-Admin
* **I want to**: Automatically generate a week's schedule based on the defined requirements and available team members
* **So that**: I don't have to manually assign each staff member to each day

**Acceptance Criteria**:

* **AC-004-A**: The system MUST auto-fill the schedule for a selected week based on all active schedule requirements
* **AC-004-B**: The system MUST only assign team members whose profession and specialty match the requirement being filled
* **AC-004-C**: The system MUST distribute assignments fairly across eligible team members to avoid scheduling the same person every single day
* **AC-004-D**: The system MUST report to the user when requirements cannot be fully met due to insufficient staff, indicating which profession/specialty is short-staffed
* **AC-004-E**: The system MUST persist the generated schedule entries in SQLite
* **AC-004-F**: The system MUST clear any existing schedule entries for the target week before generating new ones

### **US-005**: Swap Staff and Auto-fill Gaps

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
* **I want to**: Use natural language commands in a chat box to control all scheduling features
* **So that**: I can manage everything conversationally without navigating through forms and buttons

**Acceptance Criteria**:

* **AC-006-A**: The system MUST provide a collapsible chat panel accessible from all pages of the application
* **AC-006-B**: The chat MUST interpret commands for team member management (e.g., "Add a neurologist doctor named Dr. Ana Silva")
* **AC-006-C**: The chat MUST interpret commands for schedule requirements (e.g., "We need 3 neuro doctors on weekdays and 5 on weekends")
* **AC-006-D**: The chat MUST interpret commands to trigger schedule auto-fill (e.g., "Fill the schedule for this week")
* **AC-006-E**: The chat MUST interpret commands to swap staff (e.g., "Replace Dr. Silva with Dr. Costa on Monday")
* **AC-006-F**: The chat MUST display clear responses confirming the action taken or asking for clarification when the command is ambiguous
* **AC-006-G**: The UI MUST update in real-time to reflect changes made via the chat interface

### **US-007**: Application Layout and Navigation

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
AC-001-A through AC-001-G, AC-002-A through AC-002-G, AC-003-A through AC-003-F, AC-004-A through AC-004-F, AC-005-A through AC-005-D, AC-006-A through AC-006-G, AC-007-A through AC-007-E

### Non-Functional Requirements
NFR-Perf-001, NFR-Perf-002, NFR-Sec-001, NFR-Sec-002, NFR-Use-001, NFR-Use-002

### KPIs
KPI-001, KPI-002, KPI-003, KPI-004

---

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-04-01 | dhomini-rabelo | Initial draft |
