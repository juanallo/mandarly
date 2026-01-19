# Quickstart: Square UI Redesign

**Feature**: 002-square-ui-redesign  
**Date**: 2026-01-19

## Prerequisites

- Node.js 18+
- pnpm or npm
- Existing Mandarly app running (`npm run dev`)

## Development Setup

```bash
# Ensure you're on the feature branch
git checkout 002-square-ui-redesign

# Install dependencies (no new dependencies needed)
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Implementation Order

Follow this order to implement the redesign incrementally:

### Phase 1: Layout Foundation (P1 Features)

1. **Enhanced Sidebar** (`src/components/layout/sidebar.tsx`)
   - Add collapse state with localStorage persistence
   - Add workspace branding section
   - Group navigation items
   - Add user profile section at bottom
   - Add collapse toggle button

2. **Enhanced Header** (`src/components/layout/header.tsx`)
   - Add breadcrumb navigation
   - Add contextual action buttons
   - Add notification indicator (placeholder)
   - Add user avatar

3. **Create Breadcrumbs Component** (`src/components/layout/breadcrumbs.tsx`)
   - Parse current pathname
   - Generate clickable breadcrumb trail

### Phase 2: Kanban Board (P1 Feature)

4. **Create Kanban Board** (`src/components/tasks/kanban-board.tsx`)
   - Container for columns
   - Horizontal scroll on overflow

5. **Create Kanban Column** (`src/components/tasks/kanban-column.tsx`)
   - Column header with status, icon, count
   - Scrollable task list

6. **Update Tasks Page** (`src/app/tasks/page.tsx`)
   - Replace grid layout with kanban board
   - Add view toggle (kanban vs list)

### Phase 3: Enhanced Cards (P2 Features)

7. **Stats Card Component** (`src/components/dashboard/stats-card.tsx`)
   - Value display
   - Trend indicator (up/down arrow)
   - Comparison text

8. **Enhanced Task Card** (`src/components/tasks/task-card.tsx`)
   - Updated status badges with icons
   - Project tag display
   - Environment icon
   - AI vendor badge
   - Improved layout

9. **Dashboard Enhancement** (`src/app/page.tsx`)
   - Use new stats card component
   - Add trend data display

### Phase 4: Polish (P3 Features)

10. **Mobile Responsiveness**
    - Sidebar drawer for mobile
    - Hamburger menu in header
    - Responsive kanban columns

11. **Command Palette Enhancement** (already implemented)
    - Verify styling matches new design

## File Structure After Implementation

```
src/components/
├── layout/
│   ├── sidebar.tsx          # Enhanced (collapsible)
│   ├── header.tsx            # Enhanced (breadcrumbs, actions)
│   ├── breadcrumbs.tsx       # NEW
│   ├── user-nav.tsx          # NEW (sidebar profile)
│   ├── command-search.tsx    # Existing
│   └── empty-state.tsx       # Existing
├── dashboard/
│   └── stats-card.tsx        # NEW
├── tasks/
│   ├── kanban-board.tsx      # NEW
│   ├── kanban-column.tsx     # NEW
│   ├── task-card.tsx         # Enhanced
│   ├── task-status-badge.tsx # Enhanced
│   └── ... (existing)
└── ui/
    └── ... (existing shadcn components)
```

## Testing Checklist

### Unit Tests

```bash
# Run specific test file
npm test -- src/components/layout/sidebar.test.tsx
npm test -- src/components/tasks/kanban-board.test.tsx
```

**Tests to write:**
- [ ] Sidebar collapse/expand toggle
- [ ] Sidebar state persistence
- [ ] Kanban column renders correct tasks
- [ ] Stats card trend calculation
- [ ] Breadcrumb path parsing

### Integration Tests

```bash
# Run integration tests
npm test -- tests/integration/
```

**Tests to write:**
- [ ] Kanban board with full task data
- [ ] Sidebar navigation works
- [ ] Header actions trigger correctly

### E2E Tests

```bash
# Run Playwright tests
npm run e2e
```

**Tests to write:**
- [ ] Full page visual regression
- [ ] Mobile responsive behavior
- [ ] Keyboard navigation (Cmd+K)

## Design Reference Quick Links

- **Tasks Dashboard**: https://square-ui-tasks.vercel.app/
- **Task Management**: https://square-ui-task-management.vercel.app/
- **Source Code**: https://github.com/ln-dev7/square-ui/tree/master/templates/tasks

## Color Reference

```css
/* Status Colors */
--status-pending: #6B7280;     /* gray-500 */
--status-running: #3B82F6;     /* blue-500 */
--status-paused: #EAB308;      /* yellow-500 */
--status-completed: #22C55E;   /* green-500 */
--status-failed: #EF4444;      /* red-500 */
--status-disconnected: #F97316; /* orange-500 */
```

## Common Issues

### Sidebar collapse not persisting
- Check localStorage access in `useEffect`
- Ensure key is unique: `"mandarly-sidebar-collapsed"`

### Kanban columns not showing tasks
- Verify status values match exactly: `pending`, `running`, `paused`, `completed`, `failed`, `disconnected`
- Check task filtering logic

### Breadcrumbs not updating
- Ensure `usePathname()` is used correctly
- Check for client-side navigation

## Next Steps

After implementation, run the full test suite and visual review:

```bash
npm test
npm run e2e
npm run build
```

Then create a PR with screenshots comparing before/after designs.
