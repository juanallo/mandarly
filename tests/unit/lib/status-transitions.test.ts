import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  getValidNextStates,
  validateTransition,
  isTerminalStatus,
  getStatusDescription,
  getTransitionLabel,
} from '@/lib/status-transitions';

// Unit test for status state machine transitions
// This test is written FIRST per TDD approach
describe('Status Transitions', () => {
  it('should allow transition from pending to running', () => {
    expect(isValidTransition('pending', 'running')).toBe(true);
  });

  it('should allow transition from running to completed', () => {
    expect(isValidTransition('running', 'completed')).toBe(true);
  });

  it('should allow transition from running to failed', () => {
    expect(isValidTransition('running', 'failed')).toBe(true);
  });

  it('should allow transition from running to paused', () => {
    expect(isValidTransition('running', 'paused')).toBe(true);
  });

  it('should allow transition from running to disconnected', () => {
    expect(isValidTransition('running', 'disconnected')).toBe(true);
  });

  it('should allow transition from paused to running', () => {
    expect(isValidTransition('paused', 'running')).toBe(true);
  });

  it('should allow transition from disconnected to running', () => {
    expect(isValidTransition('disconnected', 'running')).toBe(true);
  });

  it('should allow transition from disconnected to failed', () => {
    expect(isValidTransition('disconnected', 'failed')).toBe(true);
  });

  it('should reject transition from pending to completed', () => {
    expect(isValidTransition('pending', 'completed')).toBe(false);
  });

  it('should reject transition from pending to failed', () => {
    expect(isValidTransition('pending', 'failed')).toBe(false);
  });

  it('should reject transition from completed to running', () => {
    expect(isValidTransition('completed', 'running')).toBe(false);
  });

  it('should reject transition from failed to running', () => {
    expect(isValidTransition('failed', 'running')).toBe(false);
  });

  it('should reject transition from pending to paused', () => {
    expect(isValidTransition('pending', 'paused')).toBe(false);
  });

  it('should reject transition from pending to disconnected', () => {
    expect(isValidTransition('pending', 'disconnected')).toBe(false);
  });

  it('should return list of valid next states from pending', () => {
    const validStates = getValidNextStates('pending');
    expect(validStates).toContain('running');
    expect(validStates).toHaveLength(1);
  });

  it('should return list of valid next states from running', () => {
    const validStates = getValidNextStates('running');
    expect(validStates).toContain('completed');
    expect(validStates).toContain('failed');
    expect(validStates).toContain('paused');
    expect(validStates).toContain('disconnected');
    expect(validStates).toHaveLength(4);
  });

  it('should return list of valid next states from paused', () => {
    const validStates = getValidNextStates('paused');
    expect(validStates).toContain('running');
    expect(validStates).toHaveLength(1);
  });

  it('should return list of valid next states from disconnected', () => {
    const validStates = getValidNextStates('disconnected');
    expect(validStates).toContain('running');
    expect(validStates).toContain('failed');
    expect(validStates).toHaveLength(2);
  });

  it('should return empty list for terminal states (completed)', () => {
    const validStates = getValidNextStates('completed');
    expect(validStates).toHaveLength(0);
  });

  it('should return empty list for terminal states (failed)', () => {
    const validStates = getValidNextStates('failed');
    expect(validStates).toHaveLength(0);
  });

  it('should validate multiple transitions in sequence', () => {
    // Valid sequence: pending -> running -> paused -> running -> completed
    expect(isValidTransition('pending', 'running')).toBe(true);
    expect(isValidTransition('running', 'paused')).toBe(true);
    expect(isValidTransition('paused', 'running')).toBe(true);
    expect(isValidTransition('running', 'completed')).toBe(true);
  });

  it('should handle disconnected recovery sequence', () => {
    // Valid sequence: pending -> running -> disconnected -> running -> completed
    expect(isValidTransition('pending', 'running')).toBe(true);
    expect(isValidTransition('running', 'disconnected')).toBe(true);
    expect(isValidTransition('disconnected', 'running')).toBe(true);
    expect(isValidTransition('running', 'completed')).toBe(true);
  });

  it('should handle disconnected failure sequence', () => {
    // Valid sequence: pending -> running -> disconnected -> failed
    expect(isValidTransition('pending', 'running')).toBe(true);
    expect(isValidTransition('running', 'disconnected')).toBe(true);
    expect(isValidTransition('disconnected', 'failed')).toBe(true);
  });

  describe('validateTransition', () => {
    it('should not throw for valid transition', () => {
      expect(() => validateTransition('pending', 'running')).not.toThrow();
    });

    it('should throw for invalid transition', () => {
      expect(() => validateTransition('pending', 'completed')).toThrow(
        'Invalid status transition: pending -> completed'
      );
    });

    it('should include valid transitions in error message', () => {
      expect(() => validateTransition('running', 'pending')).toThrow(
        /Valid transitions from running:/
      );
    });

    it('should handle terminal states in error message', () => {
      expect(() => validateTransition('completed', 'running')).toThrow(
        /none/
      );
    });
  });

  describe('isTerminalStatus', () => {
    it('should return true for completed status', () => {
      expect(isTerminalStatus('completed')).toBe(true);
    });

    it('should return true for failed status', () => {
      expect(isTerminalStatus('failed')).toBe(true);
    });

    it('should return false for pending status', () => {
      expect(isTerminalStatus('pending')).toBe(false);
    });

    it('should return false for running status', () => {
      expect(isTerminalStatus('running')).toBe(false);
    });

    it('should return false for paused status', () => {
      expect(isTerminalStatus('paused')).toBe(false);
    });

    it('should return false for disconnected status', () => {
      expect(isTerminalStatus('disconnected')).toBe(false);
    });
  });

  describe('getStatusDescription', () => {
    it('should return description for pending', () => {
      expect(getStatusDescription('pending')).toBe('Task is queued and waiting to start');
    });

    it('should return description for running', () => {
      expect(getStatusDescription('running')).toBe('Task is currently being executed');
    });

    it('should return description for completed', () => {
      expect(getStatusDescription('completed')).toBe('Task finished successfully');
    });

    it('should return description for failed', () => {
      expect(getStatusDescription('failed')).toBe('Task encountered an error and stopped');
    });

    it('should return description for paused', () => {
      expect(getStatusDescription('paused')).toBe('Task was paused by user');
    });

    it('should return description for disconnected', () => {
      expect(getStatusDescription('disconnected')).toBe('Task lost connection to execution environment');
    });
  });

  describe('getTransitionLabel', () => {
    it('should return Start for pending -> running', () => {
      expect(getTransitionLabel('pending', 'running')).toBe('Start');
    });

    it('should return Complete for running -> completed', () => {
      expect(getTransitionLabel('running', 'completed')).toBe('Complete');
    });

    it('should return Fail for running -> failed', () => {
      expect(getTransitionLabel('running', 'failed')).toBe('Fail');
    });

    it('should return Pause for running -> paused', () => {
      expect(getTransitionLabel('running', 'paused')).toBe('Pause');
    });

    it('should return Mark Disconnected for running -> disconnected', () => {
      expect(getTransitionLabel('running', 'disconnected')).toBe('Mark Disconnected');
    });

    it('should return Resume for paused -> running', () => {
      expect(getTransitionLabel('paused', 'running')).toBe('Resume');
    });

    it('should return Resume for disconnected -> running', () => {
      expect(getTransitionLabel('disconnected', 'running')).toBe('Resume');
    });

    it('should return Mark Failed for disconnected -> failed', () => {
      expect(getTransitionLabel('disconnected', 'failed')).toBe('Mark Failed');
    });

    it('should return target status for unknown transition', () => {
      expect(getTransitionLabel('pending', 'failed')).toBe('failed');
    });
  });
});
