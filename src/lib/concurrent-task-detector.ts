import type { EnvironmentConfig } from '@/types';
import type { TaskWithProject } from '@/lib/api/schemas';

export interface ConcurrentTaskConflict {
  hasConflict: boolean;
  conflictingTasks?: TaskWithProject[];
  message?: string;
}

/**
 * Detects if there are running tasks that conflict with the proposed task
 * Conflict occurs when:
 * - Tasks share the same environment (exact match for worktree path or remote host)
 * - Tasks target the same branch (or both have no branch specified)
 * - At least one task is in a running state
 */
export function detectConcurrentTasks(
  proposedConfig: {
    environmentConfig: EnvironmentConfig;
    branchName?: string | null;
  },
  existingTasks: TaskWithProject[]
): ConcurrentTaskConflict {
  const runningTasks = existingTasks.filter(task =>
    task.status === 'running' || task.status === 'paused'
  );

  const conflictingTasks = runningTasks.filter(task =>
    hasSameEnvironment(proposedConfig.environmentConfig, task.environmentConfig) &&
    hasSameBranch(proposedConfig.branchName, task.branchName)
  );

  if (conflictingTasks.length === 0) {
    return { hasConflict: false };
  }

  const message = generateConflictMessage(
    proposedConfig,
    conflictingTasks
  );

  return {
    hasConflict: true,
    conflictingTasks,
    message,
  };
}

/**
 * Checks if two environment configurations are the same
 */
function hasSameEnvironment(config1: EnvironmentConfig, config2: EnvironmentConfig): boolean {
  if (config1.type !== config2.type) {
    return false;
  }

  if (config1.type === 'worktree' && config2.type === 'worktree') {
    return config1.path === config2.path;
  }

  if (config1.type === 'remote' && config2.type === 'remote') {
    return config1.host === config2.host && config1.port === config2.port;
  }

  // Local environments don't conflict (each task runs independently)
  return false;
}

/**
 * Checks if two tasks target the same branch (or both have no branch)
 */
function hasSameBranch(branch1: string | null | undefined, branch2: string | null | undefined): boolean {
  const b1 = branch1 || null;
  const b2 = branch2 || null;

  // Both null/undefined - they conflict (no branch specified)
  if (b1 === null && b2 === null) {
    return true;
  }

  // One is null, other isn't - no conflict
  if (b1 === null || b2 === null) {
    return false;
  }

  // Both have values - conflict if they're the same
  return b1 === b2;
}

/**
 * Generates a user-friendly conflict message
 */
function generateConflictMessage(
  proposedConfig: {
    environmentConfig: EnvironmentConfig;
    branchName?: string | null;
  },
  conflictingTasks: TaskWithProject[]
): string {
  const count = conflictingTasks.length;
  const envType = proposedConfig.environmentConfig.type;
  const branch = proposedConfig.branchName || 'default branch';

  let message = `${count} ${count === 1 ? 'task is' : 'tasks are'} already running `;

  if (envType === 'worktree') {
    message += `in the same worktree`;
  } else if (envType === 'remote') {
    message += `on the same remote host`;
  } else {
    message += `in the same environment`;
  }

  message += ` on ${branch}. `;
  message += `Running concurrent tasks in the same environment may cause conflicts.`;

  return message;
}

/**
 * Gets a list of environment-branch combinations currently in use
 */
export function getActiveEnvironments(tasks: TaskWithProject[]): Array<{
  environmentType: string;
  environmentKey: string;
  branchName: string | null;
  taskCount: number;
}> {
  const runningTasks = tasks.filter(task =>
    task.status === 'running' || task.status === 'paused'
  );

  const envMap = new Map<string, {
    environmentType: string;
    environmentKey: string;
    branchName: string | null;
    taskCount: number;
  }>();

  for (const task of runningTasks) {
    const envKey = getEnvironmentKey(task.environmentConfig);
    const branch = task.branchName || null;
    const mapKey = `${envKey}:${branch}`;

    if (envMap.has(mapKey)) {
      const entry = envMap.get(mapKey)!;
      entry.taskCount++;
    } else {
      envMap.set(mapKey, {
        environmentType: task.environmentConfig.type,
        environmentKey: envKey,
        branchName: branch,
        taskCount: 1,
      });
    }
  }

  return Array.from(envMap.values());
}

/**
 * Gets a unique key for an environment configuration
 */
function getEnvironmentKey(config: EnvironmentConfig): string {
  if (config.type === 'worktree') {
    return `worktree:${config.path}`;
  }

  if (config.type === 'remote') {
    return `remote:${config.host}:${config.port || 22}`;
  }

  return 'local';
}
