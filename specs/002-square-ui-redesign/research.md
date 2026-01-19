# Research: Square UI Redesign

**Feature**: 002-square-ui-redesign  
**Date**: 2026-01-19

## Overview

This document captures research findings for implementing the Square UI redesign. The redesign is a **presentation layer update only** - no schema or data model changes.

## Square UI Component Analysis

### Source References

| Template | Live Demo | Source Code |
|----------|-----------|-------------|
| Tasks Dashboard | https://square-ui-tasks.vercel.app/ | https://github.com/ln-dev7/square-ui/tree/master/templates/tasks |
| Task Management | https://square-ui-task-management.vercel.app/ | https://github.com/ln-dev7/square-ui/tree/master/templates/task-management |

### Technology Stack Compatibility

Square UI is built with:
- **React/Next.js** - Compatible with our Next.js 16 setup
- **TypeScript** - Compatible with our TypeScript setup
- **Tailwind CSS** - Compatible with our Tailwind 4 setup
- **shadcn/ui** - We already use shadcn/ui components (cmdk, radix primitives)
- **Lucide React** - Already in our dependencies

**Decision**: Components can be adapted directly since the tech stack aligns.

### Component Mapping

| Square UI Component | Current Component | Action |
|---------------------|-------------------|--------|
| Sidebar (collapsible) | `src/components/layout/sidebar.tsx` | Enhance existing |
| Header | `src/components/layout/header.tsx` | Enhance existing |
| Task Cards | `src/components/tasks/task-card.tsx` | Enhance existing |
| Task Board (kanban) | `src/components/tasks/task-list.tsx` | Create new kanban-board.tsx |
| Stats Cards | `src/app/page.tsx` (inline) | Extract to component |
| Command Palette | `src/components/layout/command-search.tsx` | Already implemented |

## Key Component Patterns from Square UI

### 1. Collapsible Sidebar Pattern

**Features to implement:**
- Collapse toggle button
- Icon-only mode when collapsed
- Tooltip on hover for collapsed items
- Workspace branding section at top
- User profile section at bottom
- Grouped navigation sections

**State management:**
- Use React state with localStorage persistence for collapse state
- CSS transitions for smooth animation (200ms)

### 2. Enhanced Header Pattern

**Features to implement:**
- Page title (dynamic based on route)
- Breadcrumb navigation
- Search trigger button with keyboard hint
- Contextual action buttons
- Notification indicator
- User avatar

**Implementation approach:**
- Use Next.js `usePathname()` for breadcrumb generation
- Pass contextual actions as props or via context

### 3. Kanban Board Pattern

**Features to implement:**
- Horizontal scrolling columns
- Column headers with status name, icon, count
- Scrollable column content for overflow
- Task cards within columns

**Status-to-column mapping:**

| Status | Column Name | Color | Icon |
|--------|-------------|-------|------|
| pending | Pending | Gray | Circle |
| running | In Progress | Blue | Play |
| paused | Paused | Yellow | Pause |
| completed | Completed | Green | CheckCircle |
| failed | Failed | Red | XCircle |
| disconnected | Disconnected | Orange | Unplug |

### 4. Enhanced Task Card Pattern

**Display elements (using existing fields):**
- Status badge (color-coded)
- Description (title)
- Project name (as tag)
- Environment type (icon)
- AI vendor (badge)
- Created/completed date
- Error message (if failed)
- Branch name (if present)

### 5. Stats Card Pattern

**Trend calculation approach:**
- Compare current period to previous period
- Use `createdAt`, `completedAt` timestamps
- Calculate percentage change
- Show up/down indicator with color

## Responsive Design Strategy

| Breakpoint | Sidebar Behavior | Layout |
|------------|------------------|--------|
| Desktop (≥1024px) | Expanded by default, collapsible | Full sidebar + content |
| Tablet (768-1023px) | Collapsed by default | Icon sidebar + content |
| Mobile (<768px) | Hidden, drawer on hamburger | Full-width content |

## New Components to Create

1. **`kanban-board.tsx`** - Kanban layout for tasks by status
2. **`kanban-column.tsx`** - Individual status column
3. **`stats-card.tsx`** - Reusable stats card with trend
4. **`sidebar-toggle.tsx`** - Collapse/expand button
5. **`breadcrumbs.tsx`** - Breadcrumb navigation
6. **`user-nav.tsx`** - User profile dropdown in sidebar

## Existing Components to Modify

1. **`sidebar.tsx`** - Add collapse functionality, sections, user profile
2. **`header.tsx`** - Add breadcrumbs, contextual actions, user avatar
3. **`task-card.tsx`** - Enhanced visual styling
4. **`task-status-badge.tsx`** - Updated color scheme
5. **`page.tsx` (dashboard)** - Stats cards with trends

## CSS/Styling Decisions

**Color Palette (from Square UI screenshots):**
- Urgent/Failed: `#EF4444` (red-500)
- Running/In Progress: `#3B82F6` (blue-500)
- Completed/Success: `#22C55E` (green-500)
- Paused/Warning: `#EAB308` (yellow-500)
- Pending/Default: `#6B7280` (gray-500)

**Border Radius:** `0.5rem` (8px) for cards, `0.375rem` (6px) for badges

**Shadows:** `shadow-sm` for cards, `shadow-md` on hover

## Testing Strategy

**Unit Tests:**
- Sidebar collapse/expand behavior
- Kanban column filtering by status
- Stats card trend calculation
- Breadcrumb generation from path

**Integration Tests:**
- Full kanban board with task data
- Sidebar navigation
- Header contextual actions

**Visual Regression:**
- Consider adding Playwright visual tests for key layouts

## Dependencies

No new dependencies required. All functionality can be achieved with existing:
- `@radix-ui/*` primitives
- `tailwindcss-animate` for transitions
- `lucide-react` for icons
- `cmdk` for command palette

## Alternatives Considered

| Decision | Chosen | Alternative | Why Rejected |
|----------|--------|-------------|--------------|
| Kanban library | Custom implementation | react-beautiful-dnd | Drag-drop not in scope, adds complexity |
| Sidebar state | localStorage | Cookie | Simpler, no server needed |
| CSS animations | Tailwind transitions | Framer Motion | Already in stack, sufficient for needs |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regression in existing features | Medium | Keep existing components, enhance incrementally |
| Mobile responsiveness issues | Medium | Test on multiple viewports, use mobile-first CSS |
| Performance with many tasks in kanban | Low | Virtualization if >100 tasks per column |

## Conclusion

The Square UI redesign is achievable with our current tech stack. The implementation should:
1. Enhance existing components rather than replace
2. Create new components for kanban layout
3. Use existing shadcn/ui patterns for consistency
4. Focus on visual polish without schema changes
