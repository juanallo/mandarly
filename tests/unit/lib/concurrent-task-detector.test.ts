import { describe, it, expect } from 'vitest';
import {
  detectConcurrentTasks,
  getActiveEnvironments,
} from '@/lib/concurrent-task-detector';
import type { TaskWithProject } from '@/lib/api/schemas';
import type { EnvironmentConfig } from '@/types';

// Helper to create mock tasks
function createMockTask(overrides: Partial<TaskWithProject> = {}): TaskWithProject {
  return {
    id: 'task-1',
    description: 'Test task',
    status: 'running',
    projectId: null,
    environmentType: 'local',
    environmentConfig: { type: 'local' },
    aiVendor: 'claude',
    presetId: null,
    parentTaskId: null,
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    errorMessage: null,
    branchName: null,
    project: null,
    ...overrides,
  };
}

describe('Concurrent Task Detector', () => {
  describe('detectConcurrentTasks', () => {
    describe('no conflicts', () => {
      it('returns no conflict when no existing tasks', () => {
        const result = detectConcurrentTasks(
          { environmentConfig: { type: 'local' } },
          []
        );
        expect(result.hasConflict).toBe(false);
        expect(result.conflictingTasks).toBeUndefined();
        expect(result.message).toBeUndefined();
      });

      it('returns no conflict when existing tasks are not running', () => {
        const existingTasks = [
          createMockTask({ status: 'completed' }),
          createMockTask({ status: 'failed' }),
          createMockTask({ status: 'pending' }),
        ];

        const result = detectConcurrentTasks(
          { environmentConfig: { type: 'local' } },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });

      it('returns no conflict for local environments (they never conflict)', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentConfig: { type: 'local' },
          }),
        ];

        const result = detectConcurrentTasks(
          { environmentConfig: { type: 'local' } },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });

      it('returns no conflict for different worktree paths', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/a' },
          }),
        ];

        const result = detectConcurrentTasks(
          { environmentConfig: { type: 'worktree', path: '/path/b' } },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });

      it('returns no conflict for different remote hosts', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'remote',
            environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server-a.com' },
          }),
        ];

        const result = detectConcurrentTasks(
          { environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server-b.com' } },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });

      it('returns no conflict for different branches on same worktree', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'branch-a',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'branch-b',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });

      it('returns no conflict when one has branch and other does not', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'feature-branch',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: null,
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });

      it('returns no conflict for different environment types', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
          }),
        ];

        const result = detectConcurrentTasks(
          { environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'example.com' } },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });
    });

    describe('with conflicts', () => {
      it('detects conflict for same worktree path and same branch', () => {
        const existingTasks = [
          createMockTask({
            id: 'existing-task',
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'feature-branch',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'feature-branch',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(true);
        expect(result.conflictingTasks).toHaveLength(1);
        expect(result.conflictingTasks?.[0].id).toBe('existing-task');
        expect(result.message).toContain('1 task is already running');
        expect(result.message).toContain('worktree');
      });

      it('detects conflict for same worktree with both null branches', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: null,
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: null,
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(true);
        expect(result.message).toContain('default branch');
      });

      it('detects conflict for same remote host and port', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'remote',
            environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com', port: 22 },
            branchName: 'main',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com', port: 22 },
            branchName: 'main',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(true);
        expect(result.message).toContain('remote host');
      });

      it('detects conflict with paused tasks', () => {
        const existingTasks = [
          createMockTask({
            status: 'paused',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'feature-branch',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'feature-branch',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(true);
      });

      it('detects multiple conflicting tasks', () => {
        const existingTasks = [
          createMockTask({
            id: 'task-1',
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          }),
          createMockTask({
            id: 'task-2',
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          }),
          createMockTask({
            id: 'task-3',
            status: 'paused',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(true);
        expect(result.conflictingTasks).toHaveLength(3);
        expect(result.message).toContain('3 tasks are already running');
      });

      it('ignores non-running/non-paused tasks when detecting conflicts', () => {
        const existingTasks = [
          createMockTask({
            id: 'running-task',
            status: 'running',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          }),
          createMockTask({
            id: 'completed-task',
            status: 'completed',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          }),
          createMockTask({
            id: 'failed-task',
            status: 'failed',
            environmentType: 'worktree',
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'worktree', path: '/path/worktree' },
            branchName: 'main',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(true);
        expect(result.conflictingTasks).toHaveLength(1);
        expect(result.conflictingTasks?.[0].id).toBe('running-task');
      });
    });

    describe('remote port matching', () => {
      it('no conflict when same host but different ports', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'remote',
            environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com', port: 22 },
            branchName: 'main',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com', port: 2222 },
            branchName: 'main',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(false);
      });

      it('conflict when same host and undefined ports', () => {
        const existingTasks = [
          createMockTask({
            status: 'running',
            environmentType: 'remote',
            environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com' },
            branchName: 'main',
          }),
        ];

        const result = detectConcurrentTasks(
          {
            environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com' },
            branchName: 'main',
          },
          existingTasks
        );
        expect(result.hasConflict).toBe(true);
      });
    });
  });

  describe('getActiveEnvironments', () => {
    it('returns empty array for no tasks', () => {
      const result = getActiveEnvironments([]);
      expect(result).toEqual([]);
    });

    it('returns empty array for non-running tasks', () => {
      const tasks = [
        createMockTask({ status: 'completed' }),
        createMockTask({ status: 'failed' }),
        createMockTask({ status: 'pending' }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toEqual([]);
    });

    it('groups local environments correctly', () => {
      const tasks = [
        createMockTask({
          status: 'running',
          environmentConfig: { type: 'local' },
          branchName: null,
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].environmentType).toBe('local');
      expect(result[0].environmentKey).toBe('local');
      expect(result[0].branchName).toBeNull();
      expect(result[0].taskCount).toBe(1);
    });

    it('groups worktree environments by path and branch', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          status: 'running',
          environmentType: 'worktree',
          environmentConfig: { type: 'worktree', path: '/path/a' },
          branchName: 'main',
        }),
        createMockTask({
          id: 'task-2',
          status: 'running',
          environmentType: 'worktree',
          environmentConfig: { type: 'worktree', path: '/path/a' },
          branchName: 'main',
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].environmentType).toBe('worktree');
      expect(result[0].environmentKey).toBe('worktree:/path/a');
      expect(result[0].branchName).toBe('main');
      expect(result[0].taskCount).toBe(2);
    });

    it('separates worktree environments with different branches', () => {
      const tasks = [
        createMockTask({
          status: 'running',
          environmentType: 'worktree',
          environmentConfig: { type: 'worktree', path: '/path/a' },
          branchName: 'main',
        }),
        createMockTask({
          status: 'running',
          environmentType: 'worktree',
          environmentConfig: { type: 'worktree', path: '/path/a' },
          branchName: 'develop',
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toHaveLength(2);
    });

    it('separates worktree environments with different paths', () => {
      const tasks = [
        createMockTask({
          status: 'running',
          environmentType: 'worktree',
          environmentConfig: { type: 'worktree', path: '/path/a' },
          branchName: 'main',
        }),
        createMockTask({
          status: 'running',
          environmentType: 'worktree',
          environmentConfig: { type: 'worktree', path: '/path/b' },
          branchName: 'main',
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toHaveLength(2);
    });

    it('groups remote environments by host and port', () => {
      const tasks = [
        createMockTask({
          status: 'running',
          environmentType: 'remote',
          environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com', port: 22 },
          branchName: 'main',
        }),
        createMockTask({
          status: 'paused',
          environmentType: 'remote',
          environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com', port: 22 },
          branchName: 'main',
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].environmentType).toBe('remote');
      expect(result[0].environmentKey).toBe('remote:server.com:22');
      expect(result[0].taskCount).toBe(2);
    });

    it('uses default port 22 when port is undefined for remote', () => {
      const tasks = [
        createMockTask({
          status: 'running',
          environmentType: 'remote',
          environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com' },
          branchName: null,
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result[0].environmentKey).toBe('remote:server.com:22');
    });

    it('includes paused tasks in active environments', () => {
      const tasks = [
        createMockTask({
          status: 'paused',
          environmentConfig: { type: 'local' },
          branchName: 'feature',
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].taskCount).toBe(1);
    });

    it('handles mixed environment types', () => {
      const tasks = [
        createMockTask({
          status: 'running',
          environmentType: 'local',
          environmentConfig: { type: 'local' },
          branchName: null,
        }),
        createMockTask({
          status: 'running',
          environmentType: 'worktree',
          environmentConfig: { type: 'worktree', path: '/path/a' },
          branchName: 'main',
        }),
        createMockTask({
          status: 'paused',
          environmentType: 'remote',
          environmentConfig: { type: 'remote', connectionType: 'ssh', host: 'server.com' },
          branchName: 'develop',
        }),
      ];
      const result = getActiveEnvironments(tasks);
      expect(result).toHaveLength(3);
      
      const envTypes = result.map(e => e.environmentType);
      expect(envTypes).toContain('local');
      expect(envTypes).toContain('worktree');
      expect(envTypes).toContain('remote');
    });
  });
});
