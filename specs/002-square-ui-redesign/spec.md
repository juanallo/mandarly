# Feature Specification: Square UI Redesign

**Feature Branch**: `002-square-ui-redesign`  
**Created**: 2026-01-19  
**Status**: Draft  
**Input**: User description: "Improve the app design using Square UI templates for a more polished kanban-style task management interface"

## Design References

### Primary Design Sources

| Reference | URL | Source Code |
|-----------|-----|-------------|
| Tasks Dashboard | https://square-ui-tasks.vercel.app/ | https://github.com/ln-dev7/square-ui/tree/master/templates/tasks |
| Task Management | https://square-ui-task-management.vercel.app/ | https://github.com/ln-dev7/square-ui/tree/master/templates/task-management |

### Screenshot 1: Tasks Dashboard (square-ui-tasks.vercel.app)

**Key elements to adopt:**
- **Header**: Page title "Tasks", search bar with "⌘K" hint, notification bell, theme toggle, GitHub link
- **Left Sidebar**: 
  - App branding "Square UI" at top
  - Team selector with member count ("Synclead - 16 Members")
  - Navigation items with icons (Dashboard, Tasks, etc.)
  - Bottom section: Help Center, Settings
  - User profile: Avatar, name, email
- **Stats Cards Row**: Tasks Due Today, Overdue Tasks, In Progress, Completed This Week - each with trend indicators (+20% vs Last Months)
- **Charts Section**: Revenue Flow bar chart, Burndown Chart line graph
- **Task Toolbar**: Search input, Filter button, Import/Export dropdown, "Add New" button
- **Kanban Columns**: Draft, Todo, Inprogress, Review, Completed - with count badges
- **Task Cards**: Priority badge (Urgent/Medium/Low), title, project name, due date, comment count, attachment count, assignee avatars

### Screenshot 2: Task Management (square-ui-task-management.vercel.app)

**Key elements to adopt:**
- **Header**: Page title, GitHub button, theme toggle, "Last update" timestamp, Share button
- **Subheader Toolbar**: Filter, Sort, Automate, Date picker, Import/Export, "Request task" button
- **Left Sidebar**:
  - App branding with dropdown
  - Search with "/" keyboard hint
  - Notifications with count badge (12)
  - Navigation sections: Main (Dashboard, Task, Projects), Workspace (Documents, Emails)
  - Bottom: Website link, Sub accounts, Billing, Availability
- **Kanban Columns**: Backlog, Todo, In Progress, Technical Review - with status icons and count
- **Task Cards**:
  - Status icon (colored circle)
  - Title and description
  - Category tags (Design, Product, Marketing)
  - Date, comments, attachments, progress indicator (1/4, 2/4)
  - Stacked assignee avatars
  - "+ Add task" button inline in each column

### Visual Style Guidelines

From both references, adopt:
- **Color Palette**: Status colors per research.md (failed=#EF4444, running=#3B82F6, completed=#22C55E, paused=#EAB308, pending=#6B7280, disconnected=#F97316)
- **Typography**: Clean sans-serif, clear hierarchy
- **Shadows**: Subtle card shadows for depth
- **Border Radius**: Rounded corners (8-12px)
- **Spacing**: Generous whitespace, consistent padding
- **Icons**: Lucide-style line icons

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Tasks in Kanban Board (Priority: P1)

As a user, I want to see my tasks organized in a kanban board with status columns so I can quickly understand task distribution and workflow state at a glance.

**Why this priority**: The kanban board is the core visual improvement and directly addresses task visibility. It transforms the current list view into an intuitive visual workflow that matches modern task management expectations.

**Independent Test**: Can be fully tested by viewing the tasks page and confirming tasks appear in distinct columns by status. Delivers immediate value by providing better task organization visualization.

**Acceptance Scenarios**:

1. **Given** a user has tasks in various statuses (pending, running, paused, completed, failed), **When** they navigate to the tasks page, **Then** they see a horizontal kanban board with columns for each status containing the relevant tasks.
2. **Given** a kanban board is displayed, **When** the user views a status column, **Then** they see a column header with the status name and a count badge showing total tasks in that status.
3. **Given** tasks exist in the system, **When** viewing the kanban board, **Then** task cards display key information: description, project name, status badge, environment type, AI vendor, and creation date.

---

### User Story 2 - Enhanced Left Pane Sidebar (Priority: P1)

As a user, I want a modern collapsible left pane sidebar with workspace branding, organized navigation sections, and a user profile area so I can navigate the app efficiently while having context about the current workspace.

**Why this priority**: The sidebar is visible on every page and directly impacts navigation experience. An enhanced sidebar with workspace info, organized sections, and user profile improves usability and provides important context.

**Independent Test**: Can be tested by navigating between pages and toggling the sidebar. Delivers value by improving navigation clarity and screen utilization.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** they view the sidebar, **Then** they see a workspace/app logo at the top, followed by organized navigation sections with clear icons and labels.
2. **Given** the sidebar is expanded, **When** the user clicks the collapse toggle, **Then** the sidebar collapses to icon-only mode, freeing up horizontal space.
3. **Given** the sidebar is collapsed, **When** the user hovers over an icon, **Then** a tooltip displays the navigation item name.
4. **Given** the user views the sidebar, **When** they scroll to the bottom, **Then** they see a user profile section with avatar, name, and settings access.
5. **Given** the sidebar has navigation sections, **When** the user views the sidebar, **Then** they see grouped items (e.g., Main: Dashboard/Tasks/Projects, Settings: Presets/Help).

---

### User Story 3 - Application Header Bar (Priority: P1)

As a user, I want a persistent header bar across all pages with page title, breadcrumbs, search access, and quick actions so I can understand my current location and access common functions quickly.

**Why this priority**: The header provides essential navigation context and quick access to common actions. It's visible on every page and directly impacts user orientation and productivity.

**Independent Test**: Can be tested by navigating to any page and verifying header elements display correctly with appropriate content.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** they view the header, **Then** they see the current page title prominently displayed.
2. **Given** the user is on a nested page (e.g., task detail), **When** they view the header, **Then** they see breadcrumb navigation showing the page hierarchy (e.g., Tasks > Task #123).
3. **Given** the user is on any page, **When** they view the header, **Then** they see a search/command trigger button with keyboard shortcut hint (Cmd+K).
4. **Given** the user is on a page with primary actions, **When** they view the header, **Then** they see contextual action buttons (e.g., "New Task" on tasks page).
5. **Given** the header is displayed, **When** the user views the right side, **Then** they see notification indicator and user avatar for quick profile access.

---

### User Story 4 - Improved Dashboard Stats Cards (Priority: P2)

As a user, I want dashboard stats cards that show trends and comparative data so I can understand performance changes over time.

**Why this priority**: Dashboard improvements enhance the landing experience but are secondary to core task visualization and navigation improvements.

**Independent Test**: Can be tested by viewing the dashboard and confirming stats cards display current values with trend indicators.

**Acceptance Scenarios**:

1. **Given** the user navigates to the dashboard, **When** stats cards are displayed, **Then** each card shows the current value, a trend indicator (up/down), and a comparison value (e.g., "vs last week").
2. **Given** the dashboard is loading, **When** data is being fetched, **Then** skeleton placeholders maintain the card layout.
3. **Given** task data exists, **When** viewing the "Tasks Due Today" card, **Then** it displays an accurate count with visual emphasis.

---

### User Story 5 - Rich Task Cards (Priority: P2)

As a user, I want task cards with enhanced visual design including better status indicators, environment badges, and improved information density so I can scan tasks quickly.

**Why this priority**: Enhanced task cards improve the detail view but build upon the kanban layout (P1). Better card design increases information accessibility without sacrificing clarity.

**Independent Test**: Can be tested by viewing any task card and confirming visual elements are present and correctly styled.

**Acceptance Scenarios**:

1. **Given** a task has a status, **When** the task card is displayed, **Then** a color-coded status badge (running = blue, completed = green, failed = red, pending = gray, paused = yellow) is visible.
2. **Given** a task is displayed in a card, **When** viewing the card, **Then** the description, project name, environment type, AI vendor, and timestamps are clearly visible with appropriate icons.
3. **Given** a task has an error, **When** the error badge is shown, **Then** it uses distinct styling (red background) to draw attention.
4. **Given** a task belongs to a project, **When** viewing the card, **Then** the project name is displayed as a tag/badge for quick identification.

---

### User Story 6 - Command Palette / Quick Search (Priority: P3)

As a user, I want a keyboard-accessible command palette so I can quickly navigate to any page or search for tasks without using the mouse.

**Why this priority**: Power-user feature that enhances productivity but is not essential for basic functionality.

**Independent Test**: Can be tested by pressing the keyboard shortcut and searching for items.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** they press Cmd+K (Mac) or Ctrl+K (Windows), **Then** a command palette modal opens with a search input.
2. **Given** the command palette is open, **When** the user types a search term, **Then** matching navigation items and recent tasks appear as suggestions.
3. **Given** search results are displayed, **When** the user selects a result with keyboard or click, **Then** they navigate to that destination and the palette closes.

---

### Edge Cases

- What happens when a status column has zero tasks? The column displays with an empty state message.
- How does the kanban board handle a large number of tasks in one column? The column becomes scrollable with a visible scrollbar.
- What happens when the sidebar is collapsed and the screen width is narrow? The sidebar remains collapsed and navigation relies on icons.
- How does the command palette behave with no matching results? It displays "No results found" message.
- What happens on mobile devices? The sidebar becomes a slide-out drawer accessible via hamburger menu in the header.
- How does the header behave with long page titles? The title truncates with ellipsis to maintain header layout.
- What happens when there are no notifications? The notification indicator is hidden or shows zero state.

## Requirements *(mandatory)*

### Functional Requirements

**Kanban Board:**
- **FR-001**: System MUST display tasks in a kanban board layout with status-based columns (Pending, Running, Paused, Completed, Failed, Disconnected).
- **FR-002**: Each kanban column header MUST display the status name, status icon, and a count badge.
- **FR-003**: Task cards on the kanban board MUST show: description, project name (as tag), status badge, environment type icon, AI vendor badge, and creation date.

**Left Pane Sidebar:**
- **FR-004**: System MUST provide a collapsible left pane sidebar that can toggle between expanded (icon + label) and collapsed (icon only) modes.
- **FR-005**: Sidebar MUST display workspace/app branding with logo at the top.
- **FR-006**: Sidebar MUST organize navigation into logical sections (Main navigation, Settings/Configuration).
- **FR-007**: Sidebar MUST display a user profile section at the bottom with avatar, name, and quick settings access.
- **FR-008**: System MUST persist sidebar collapse state across page navigations within a session.
- **FR-009**: Sidebar MUST include a toggle button to collapse/expand.

**Application Header:**
- **FR-010**: System MUST display a persistent header bar on all pages.
- **FR-011**: Header MUST display the current page title prominently.
- **FR-012**: Header MUST display breadcrumb navigation for nested pages (e.g., Tasks > Task Details).
- **FR-013**: Header MUST include a search/command palette trigger button with keyboard shortcut hint.
- **FR-014**: Header MUST display contextual action buttons relevant to the current page.
- **FR-015**: Header MUST include notification indicator and user avatar on the right side.

**Dashboard & Cards:**
- **FR-016**: Dashboard stats cards MUST display current values with visual trend indicators comparing to previous period data.
- **FR-017**: Task cards MUST display status with color-coded visual indicators (running=blue, completed=green, failed=red, pending=gray, paused=yellow).

**Command Palette:**
- **FR-018**: System MUST provide a command palette accessible via keyboard shortcut (Cmd+K / Ctrl+K).

**General:**
- **FR-019**: System MUST maintain responsive design across desktop, tablet, and mobile viewports.
- **FR-020**: System MUST apply consistent styling from the Square UI design language (shadows, border radius, color palette, typography).
- **FR-021**: On mobile viewports, sidebar MUST convert to a slide-out drawer accessible via hamburger menu in the header.

### Key Entities

- **Task**: AI-assisted task with status, priority, environment, vendor, and project association.
- **Project**: Container for related tasks.
- **Dashboard Stats**: Aggregated metrics including totals, today's counts, and trend comparisons.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify task status distribution within 3 seconds of viewing the kanban board.
- **SC-002**: Sidebar toggle action completes in under 200ms with smooth animation.
- **SC-003**: Command palette opens within 150ms of keyboard shortcut press.
- **SC-004**: All pages maintain visual consistency with the Square UI design language.
- **SC-005**: Dashboard loads completely (including stats cards with trends) within 2 seconds on standard connection.
- **SC-006**: 100% of existing functionality remains accessible through the new interface (no feature regression).
- **SC-007**: Users can identify their current page location within 1 second via header breadcrumbs.
- **SC-008**: Mobile drawer sidebar opens/closes with smooth animation in under 300ms.
- **SC-009**: Header contextual actions are accessible within 1 click from any page.

## Assumptions

- **No schema changes**: The existing data model (tasks, projects, statuses) remains exactly as-is. This is strictly a presentation layer update.
- The Square UI components from the referenced templates will be adapted for visual styling only, mapped to existing data fields.
- Trend data for dashboard stats will be calculated based on existing timestamp fields (createdAt, completedAt).
- The design will use the existing Tailwind CSS and shadcn/ui foundation, enhanced with Square UI visual patterns.
- Task status values (pending, running, paused, completed, failed) map directly to kanban columns.
- Existing task fields (description, project, environment, AI vendor, timestamps) will be displayed with enhanced visual styling.
