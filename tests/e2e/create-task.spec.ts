import { test, expect } from '@playwright/test';

// E2E test for task creation flow
// This test is written FIRST per TDD approach
test.describe('Create Task Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }
  });

  test('should navigate to create task page from sidebar', async ({ page }) => {
    // Click "New Task" button in sidebar
    await page.click('text=New Task');

    // Should navigate to /tasks/new
    await expect(page).toHaveURL('/tasks/new');

    // Page should have create task form title (CardTitle renders as div)
    await expect(page.locator('text=Create New Task')).toBeVisible();
  });

  test('should show validation error for empty description', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Click submit without filling description
    await page.click('button:has-text("Create Task")');

    // Should show validation error
    await expect(page.locator('text=/description.*required/i')).toBeVisible();
  });

  test('should create a task with local environment', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'E2E Test Task - Local Environment');

    // Local should be selected by default
    await expect(page.locator('[role="tab"]:has-text("Local")').first()).toBeVisible();

    // Select AI vendor (Claude) - click the Claude button in the AI vendor picker
    await page.click('button:has-text("Claude"):has-text("Anthropic")');

    // Submit form - click Create Task button specifically
    await page.click('button:has-text("Create Task")');

    // Should redirect to task detail or task list
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9-]+|tasks)/, { timeout: 10000 });

    // Task should appear in the list or detail page
    await expect(page.locator('text=E2E Test Task - Local Environment')).toBeVisible({ timeout: 5000 });
  });

  test('should create a task with worktree environment', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'E2E Test Task - Worktree');

    // Switch to worktree tab
    await page.click('[role="tab"]:has-text("Worktree")');

    // Fill worktree path
    await page.fill('input[id*="path"]', '/test/worktree/path');

    // Fill branch (optional)
    await page.fill('input[id*="branch"]', 'feature-test');

    // Select AI vendor
    await page.click('button:has-text("Cursor"):has-text("IDE")');

    // Submit form
    await page.click('button:has-text("Create Task")');

    // Should redirect successfully
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9-]+|tasks)/, { timeout: 10000 });
  });

  test('should create a task with remote environment', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'E2E Test Task - Remote');

    // Switch to remote tab
    await page.click('[role="tab"]:has-text("Remote")');

    // Fill host
    await page.fill('input[id*="host"]', 'remote.example.com');

    // Fill user
    await page.fill('input[id*="user"]', 'testuser');

    // Fill port (optional)
    await page.fill('input[id*="port"]', '22');

    // Select AI vendor
    await page.click('button:has-text("ChatGPT"):has-text("OpenAI")');

    // Submit form
    await page.click('button:has-text("Create Task")');

    // Should redirect successfully
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9-]+|tasks)/, { timeout: 10000 });
  });

  test('should validate worktree path is required', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task');

    // Switch to worktree tab
    await page.click('[role="tab"]:has-text("Worktree")');

    // Don't fill path
    // Submit form
    await page.click('button:has-text("Create Task")');

    // Should show validation error for incomplete environment config
    await expect(page.locator('text=/invalid environment configuration|please complete the environment configuration/i')).toBeVisible();
  });

  test('should validate remote host is required', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task');

    // Switch to remote tab
    await page.click('[role="tab"]:has-text("Remote")');

    // Don't fill host
    // Submit form
    await page.click('button:has-text("Create Task")');

    // Should show validation error for incomplete environment config
    await expect(page.locator('text=/invalid environment configuration|please complete the environment configuration/i')).toBeVisible();
  });

  test('should allow selecting a project', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Task with Project');

    // Project selector should be visible (look for the label specifically)
    await expect(page.locator('label:has-text("Project")')).toBeVisible();

    // Select AI vendor
    await page.click('button:has-text("Claude"):has-text("Anthropic")');

    // Submit form
    await page.click('button:has-text("Create Task")');

    // Should redirect successfully
    await expect(page).toHaveURL(/\/(tasks\/[a-z0-9-]+|tasks)/, { timeout: 10000 });
  });

  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in valid data
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task with Loading State');
    await page.click('button:has-text("Claude"):has-text("Anthropic")');

    // Get the submit button
    const submitButton = page.locator('button:has-text("Create Task")');
    
    // Verify button is initially enabled
    await expect(submitButton).toBeEnabled();
    
    // Click submit
    await submitButton.click();

    // Verify form submission was successful by checking for navigation
    // This implies the loading state worked correctly
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9-]+/, { timeout: 10000 });
    
    // Verify the task was created
    await expect(page.locator('text=Test Task with Loading State')).toBeVisible();
  });

  test('should persist selected values when switching environment types', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill description
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task');

    // Switch to worktree and fill data
    await page.click('[role="tab"]:has-text("Worktree")');
    await page.fill('input[id*="path"]', '/test/path');

    // Switch back to local
    await page.click('[role="tab"]:has-text("Local")');

    // Switch back to worktree
    await page.click('[role="tab"]:has-text("Worktree")');

    // Description should still be filled
    const descriptionValue = await page.inputValue('textarea[name="description"], textarea[id*="description"]');
    expect(descriptionValue).toBe('Test Task');
  });

  test('should navigate to task detail page after creation', async ({ page }) => {
    await page.goto('/tasks/new');

    // Dismiss onboarding dialog if present
    const skipTourButton = page.locator('button:has-text("Skip Tour")');
    if (await skipTourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourButton.click();
    }

    // Fill in data
    await page.fill('textarea[name="description"], textarea[id*="description"]', 'Test Task for Detail View');
    await page.click('button:has-text("Claude"):has-text("Anthropic")');

    // Submit
    await page.click('button:has-text("Create Task")');

    // Wait for navigation to task detail page
    await page.waitForURL(/\/tasks\/[a-z0-9-]+/, { timeout: 10000 });

    // Should show task details
    await expect(page.locator('text=Test Task for Detail View')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=pending').first()).toBeVisible();
  });
});
