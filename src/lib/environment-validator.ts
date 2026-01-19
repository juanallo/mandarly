import type { EnvironmentConfig } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  warning?: string;
  error?: string;
}

/**
 * Validates environment configuration for potential issues
 * Note: Path existence checks are simplified for client-side usage
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): ValidationResult {
  if (config.type === 'worktree') {
    return validateWorktreePath(config.path);
  }

  if (config.type === 'remote') {
    return validateRemoteConfig(config.host, config.port);
  }

  // Local environment is always valid
  return { isValid: true };
}

/**
 * Validates that a worktree path is provided
 * Note: Actual existence check would need server-side API call
 */
export function validateWorktreePath(path: string): ValidationResult {
  if (!path || path.trim() === '') {
    return {
      isValid: false,
      error: 'Worktree path is required',
    };
  }

  // Basic validation - actual path existence would be checked server-side
  return { isValid: true };
}

/**
 * Validates remote configuration for basic correctness
 */
export function validateRemoteConfig(host: string, port?: number): ValidationResult {
  if (!host || host.trim() === '') {
    return {
      isValid: false,
      error: 'Remote host is required',
    };
  }

  // Basic hostname validation
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

  if (!hostnameRegex.test(host) && !ipRegex.test(host)) {
    return {
      isValid: false,
      error: 'Invalid hostname or IP address',
    };
  }

  // Validate port if provided
  if (port !== undefined) {
    if (port < 1 || port > 65535) {
      return {
        isValid: false,
        error: 'Port must be between 1 and 65535',
      };
    }
  }

  return { isValid: true };
}

/**
 * Checks if an environment configuration is potentially stale
 * Note: This is a simplified check; real implementation would query server
 */
export function isEnvironmentStale(config: EnvironmentConfig): boolean {
  // In a real implementation, this would check with the server
  // For now, we'll return false and rely on server-side validation
  return false;
}

/**
 * Gets a user-friendly warning message for stale environments
 */
export function getStaleEnvironmentWarning(config: EnvironmentConfig): string | null {
  if (config.type === 'worktree') {
    const validation = validateWorktreePath(config.path);
    if (!validation.isValid || validation.warning) {
      return validation.warning || validation.error || 'Environment may not be accessible';
    }
  }

  return null;
}
