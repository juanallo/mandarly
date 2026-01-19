import { test, expect } from '@playwright/test';

// E2E test for task creation flow
// This test is written FIRST per TDD approach
test.describe('Create Task Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should navigate to create task page from sidebar', async ({ page }) => {
    // Click "New Task" button in sidebar
    await page.click('text=New Task');

    // Should navigate to /tasks/new
    await expect(page).toHaveURL('/tasks/new');

    // Page should have create task form
    await expect(page.locator('h1, h2').filter({ hasText: /create task/i })).toBeVisible();
  });

  test('should show validation error for empty description', async ({ page }) => {
    await page.goto('/tasks/new');

    // Click submit without filling description
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/description.*required/i')).toBeVisible();
  });

  test('should create a task with local environment', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'E2E Test Task - Local Environment');

    // Local should be selected by default
    await expect(page.locator('text=Local').first()).toBeVisible();

    // Select AI vendor (Claude)
    await page.click('text=Claude');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to task detail or task list
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9]+|tasks)/);

    // Task should appear in the list (if redirected to list)
    // Or task details should be visible (if redirected to detail)
    const hasTaskInList = await page.locator('text=E2E Test Task - Local Environment').isVisible().catch(() => false);
    const hasTaskDetail = await page.locator('h1, h2').filter({ hasText: /E2E Test Task/i }).isVisible().catch(() => false);
    
    expect(hasTaskInList || hasTaskDetail).toBe(true);
  });

  test('should create a task with worktree environment', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'E2E Test Task - Worktree');

    // Switch to worktree tab
    await page.click('text=Worktree');

    // Fill worktree path
    await page.fill('input[name*="path"], input[id*="path"]', '/test/worktree/path');

    // Fill branch (optional)
    await page.fill('input[name*="branch"], input[id*="branch"]', 'feature-test');

    // Select AI vendor
    await page.click('text=Cursor');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect successfully
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9]+|tasks)/);
  });

  test('should create a task with remote environment', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'E2E Test Task - Remote');

    // Switch to remote tab
    await page.click('text=Remote');

    // Fill host
    await page.fill('input[name*="host"], input[id*="host"]', 'remote.example.com');

    // Select connection type (SSH should be default)
    // Fill user
    await page.fill('input[name*="user"], input[id*="user"]', 'testuser');

    // Fill port (optional)
    await page.fill('input[name*="port"], input[id*="port"]', '22');

    // Select AI vendor
    await page.click('text=ChatGPT');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect successfully
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9]+|tasks)/);
  });

  test('should validate worktree path is required', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task');

    // Switch to worktree
    await page.click('text=Worktree');

    // Don't fill path
    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/path.*required/i')).toBeVisible();
  });

  test('should validate remote host is required', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task');

    // Switch to remote
    await page.click('text=Remote');

    // Don't fill host
    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/host.*required/i')).toBeVisible();
  });

  test('should allow selecting a project', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Task with Project');

    // Project selector should be visible
    await expect(page.locator('label:has-text("Project")')).toBeVisible();

    // Select AI vendor
    await page.click('text=Claude');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect successfully
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9]+|tasks)/);
  });

  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in valid data
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task with Loading');
    await page.click('text=Claude');

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should show loading state (disabled or loading text)
    const isDisabled = await submitButton.isDisabled();
    const hasLoadingText = await submitButton.locator('text=/loading|creating|saving/i').isVisible().catch(() => false);
    
    expect(isDisabled || hasLoadingText).toBe(true);
  });

  test('should persist selected values when switching environment types', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task');

    // Switch to worktree and fill data
    await page.click('text=Worktree');
    await page.fill('input[name*="path"], input[id*="path"]', '/test/path');

    // Switch back to local
    await page.click('text=Local');

    // Switch back to worktree
    await page.click('text=Worktree');

    // Description should still be filled
    const descriptionValue = await page.inputValue('textarea[name="description"], textarea[id*="description"]');
    expect(descriptionValue).toBe('Test Task');
  });

  test('should navigate to task detail page after creation', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in data
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task for Detail View');
    await page.click('text=Claude');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/\/tasks\/[a-z0-9]+/, { timeout: 5000 });

    // Should show task details
    await expect(page.locator('text=Test Task for Detail View')).toBeVisible();
    await expect(page.locator('text=pending', { exact: false })).toBeVisible();
  });
});
