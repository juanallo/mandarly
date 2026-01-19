import type { TaskStatus } from '@/types';

// Define the state machine for task status transitions
type StatusTransitionMap = {
  [key in TaskStatus]: TaskStatus[];
};

const STATUS_TRANSITIONS: StatusTransitionMap = {
  pending: ['running'],
  running: ['completed', 'failed', 'paused', 'disconnected'],
  paused: ['running'],
  disconnected: ['running', 'failed'],
  completed: [], // Terminal state
  failed: [], // Terminal state
};

/**
 * Check if a status transition is valid according to the state machine
 */
export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  const validTransitions = STATUS_TRANSITIONS[from];
  return validTransitions.includes(to);
}

/**
 * Get all valid next states from the current status
 */
export function getValidNextStates(current: TaskStatus): TaskStatus[] {
  return STATUS_TRANSITIONS[current];
}

/**
 * Validate a status transition and throw an error if invalid
 */
export function validateTransition(from: TaskStatus, to: TaskStatus): void {
  if (!isValidTransition(from, to)) {
    throw new Error(
      `Invalid status transition: ${from} -> ${to}. Valid transitions from ${from}: ${STATUS_TRANSITIONS[from].join(', ') || 'none'}`
    );
  }
}

/**
 * Check if a status is a terminal state (no further transitions)
 */
export function isTerminalStatus(status: TaskStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Get a human-readable description of the status
 */
export function getStatusDescription(status: TaskStatus): string {
  const descriptions: Record<TaskStatus, string> = {
    pending: 'Task is queued and waiting to start',
    running: 'Task is currently being executed',
    completed: 'Task finished successfully',
    failed: 'Task encountered an error and stopped',
    paused: 'Task was paused by user',
    disconnected: 'Task lost connection to execution environment',
  };
  
  return descriptions[status];
}

/**
 * Get the action label for transitioning to a status
 */
export function getTransitionLabel(from: TaskStatus, to: TaskStatus): string {
  const labels: Record<string, string> = {
    'pending->running': 'Start',
    'running->completed': 'Complete',
    'running->failed': 'Fail',
    'running->paused': 'Pause',
    'running->disconnected': 'Mark Disconnected',
    'paused->running': 'Resume',
    'disconnected->running': 'Resume',
    'disconnected->failed': 'Mark Failed',
  };
  
  const key = `${from}->${to}`;
  return labels[key] || to;
}
