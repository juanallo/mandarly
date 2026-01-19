import { describe, it, expect } from 'vitest';
import {
  validateEnvironmentConfig,
  validateWorktreePath,
  validateRemoteConfig,
  isEnvironmentStale,
  getStaleEnvironmentWarning,
} from '@/lib/environment-validator';
import type { EnvironmentConfig } from '@/types';

describe('Environment Validator', () => {
  describe('validateEnvironmentConfig', () => {
    it('returns valid for local environment', () => {
      const config: EnvironmentConfig = { type: 'local' };
      const result = validateEnvironmentConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('validates worktree environment with valid path', () => {
      const config: EnvironmentConfig = {
        type: 'worktree',
        path: '/path/to/worktree',
      };
      const result = validateEnvironmentConfig(config);
      expect(result.isValid).toBe(true);
    });

    it('rejects worktree environment with empty path', () => {
      const config: EnvironmentConfig = {
        type: 'worktree',
        path: '',
      };
      const result = validateEnvironmentConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Worktree path is required');
    });

    it('validates remote environment with valid host', () => {
      const config: EnvironmentConfig = {
        type: 'remote',
        connectionType: 'ssh',
        host: 'server.example.com',
      };
      const result = validateEnvironmentConfig(config);
      expect(result.isValid).toBe(true);
    });

    it('rejects remote environment with invalid host', () => {
      const config: EnvironmentConfig = {
        type: 'remote',
        connectionType: 'ssh',
        host: '',
      };
      const result = validateEnvironmentConfig(config);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateWorktreePath', () => {
    it('returns valid for non-empty path', () => {
      const result = validateWorktreePath('/path/to/worktree');
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for empty string', () => {
      const result = validateWorktreePath('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Worktree path is required');
    });

    it('returns invalid for whitespace-only path', () => {
      const result = validateWorktreePath('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Worktree path is required');
    });

    it('accepts paths with special characters', () => {
      const result = validateWorktreePath('/path/with spaces/and-dashes_underscores');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateRemoteConfig', () => {
    it('returns valid for valid hostname', () => {
      const result = validateRemoteConfig('example.com');
      expect(result.isValid).toBe(true);
    });

    it('returns valid for valid IP address', () => {
      const result = validateRemoteConfig('192.168.1.1');
      expect(result.isValid).toBe(true);
    });

    it('returns valid for hostname with subdomain', () => {
      const result = validateRemoteConfig('server.subdomain.example.com');
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for empty host', () => {
      const result = validateRemoteConfig('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Remote host is required');
    });

    it('returns invalid for whitespace-only host', () => {
      const result = validateRemoteConfig('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Remote host is required');
    });

    it('returns invalid for invalid hostname with special characters', () => {
      const result = validateRemoteConfig('invalid@host!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid hostname or IP address');
    });

    it('returns valid for port within range', () => {
      const result = validateRemoteConfig('example.com', 22);
      expect(result.isValid).toBe(true);
    });

    it('returns valid for port at minimum (1)', () => {
      const result = validateRemoteConfig('example.com', 1);
      expect(result.isValid).toBe(true);
    });

    it('returns valid for port at maximum (65535)', () => {
      const result = validateRemoteConfig('example.com', 65535);
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for port below range', () => {
      const result = validateRemoteConfig('example.com', 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Port must be between 1 and 65535');
    });

    it('returns invalid for port above range', () => {
      const result = validateRemoteConfig('example.com', 65536);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Port must be between 1 and 65535');
    });

    it('returns invalid for negative port', () => {
      const result = validateRemoteConfig('example.com', -1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Port must be between 1 and 65535');
    });

    it('accepts undefined port', () => {
      const result = validateRemoteConfig('example.com', undefined);
      expect(result.isValid).toBe(true);
    });

    it('validates simple hostname', () => {
      const result = validateRemoteConfig('localhost');
      expect(result.isValid).toBe(true);
    });

    it('validates hostname with hyphens', () => {
      const result = validateRemoteConfig('my-server-01');
      expect(result.isValid).toBe(true);
    });
  });

  describe('isEnvironmentStale', () => {
    it('returns false for local environment', () => {
      const config: EnvironmentConfig = { type: 'local' };
      const result = isEnvironmentStale(config);
      expect(result).toBe(false);
    });

    it('returns false for worktree environment', () => {
      const config: EnvironmentConfig = {
        type: 'worktree',
        path: '/path/to/worktree',
      };
      const result = isEnvironmentStale(config);
      expect(result).toBe(false);
    });

    it('returns false for remote environment', () => {
      const config: EnvironmentConfig = {
        type: 'remote',
        connectionType: 'ssh',
        host: 'example.com',
      };
      const result = isEnvironmentStale(config);
      expect(result).toBe(false);
    });
  });

  describe('getStaleEnvironmentWarning', () => {
    it('returns null for local environment', () => {
      const config: EnvironmentConfig = { type: 'local' };
      const result = getStaleEnvironmentWarning(config);
      expect(result).toBeNull();
    });

    it('returns null for valid worktree environment', () => {
      const config: EnvironmentConfig = {
        type: 'worktree',
        path: '/path/to/worktree',
      };
      const result = getStaleEnvironmentWarning(config);
      expect(result).toBeNull();
    });

    it('returns error message for invalid worktree path', () => {
      const config: EnvironmentConfig = {
        type: 'worktree',
        path: '',
      };
      const result = getStaleEnvironmentWarning(config);
      expect(result).toBe('Worktree path is required');
    });

    it('returns null for remote environment', () => {
      const config: EnvironmentConfig = {
        type: 'remote',
        connectionType: 'ssh',
        host: 'example.com',
      };
      const result = getStaleEnvironmentWarning(config);
      expect(result).toBeNull();
    });
  });
});
