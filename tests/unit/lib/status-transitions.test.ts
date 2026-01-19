import { describe, it, expect } from 'vitest';

// Unit test for status state machine transitions
// This test is written FIRST per TDD approach
describe('Status Transitions', () => {
  it('should allow transition from pending to running', () => {
    // Will fail until isValidTransition is implemented
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('pending', 'running')).toBe(true);
  });

  it('should allow transition from running to completed', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('running', 'completed')).toBe(true);
  });

  it('should allow transition from running to failed', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('running', 'failed')).toBe(true);
  });

  it('should allow transition from running to paused', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('running', 'paused')).toBe(true);
  });

  it('should allow transition from running to disconnected', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('running', 'disconnected')).toBe(true);
  });

  it('should allow transition from paused to running', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('paused', 'running')).toBe(true);
  });

  it('should allow transition from disconnected to running', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('disconnected', 'running')).toBe(true);
  });

  it('should allow transition from disconnected to failed', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('disconnected', 'failed')).toBe(true);
  });

  it('should reject transition from pending to completed', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('pending', 'completed')).toBe(false);
  });

  it('should reject transition from pending to failed', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('pending', 'failed')).toBe(false);
  });

  it('should reject transition from completed to running', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('completed', 'running')).toBe(false);
  });

  it('should reject transition from failed to running', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('failed', 'running')).toBe(false);
  });

  it('should reject transition from pending to paused', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('pending', 'paused')).toBe(false);
  });

  it('should reject transition from pending to disconnected', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    expect(isValidTransition('pending', 'disconnected')).toBe(false);
  });

  it('should return list of valid next states from pending', () => {
    const { getValidNextStates } = require('@/lib/status-transitions');
    
    const validStates = getValidNextStates('pending');
    expect(validStates).toContain('running');
    expect(validStates).toHaveLength(1);
  });

  it('should return list of valid next states from running', () => {
    const { getValidNextStates } = require('@/lib/status-transitions');
    
    const validStates = getValidNextStates('running');
    expect(validStates).toContain('completed');
    expect(validStates).toContain('failed');
    expect(validStates).toContain('paused');
    expect(validStates).toContain('disconnected');
    expect(validStates).toHaveLength(4);
  });

  it('should return list of valid next states from paused', () => {
    const { getValidNextStates } = require('@/lib/status-transitions');
    
    const validStates = getValidNextStates('paused');
    expect(validStates).toContain('running');
    expect(validStates).toHaveLength(1);
  });

  it('should return list of valid next states from disconnected', () => {
    const { getValidNextStates } = require('@/lib/status-transitions');
    
    const validStates = getValidNextStates('disconnected');
    expect(validStates).toContain('running');
    expect(validStates).toContain('failed');
    expect(validStates).toHaveLength(2);
  });

  it('should return empty list for terminal states (completed)', () => {
    const { getValidNextStates } = require('@/lib/status-transitions');
    
    const validStates = getValidNextStates('completed');
    expect(validStates).toHaveLength(0);
  });

  it('should return empty list for terminal states (failed)', () => {
    const { getValidNextStates } = require('@/lib/status-transitions');
    
    const validStates = getValidNextStates('failed');
    expect(validStates).toHaveLength(0);
  });

  it('should validate multiple transitions in sequence', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    // Valid sequence: pending -> running -> paused -> running -> completed
    expect(isValidTransition('pending', 'running')).toBe(true);
    expect(isValidTransition('running', 'paused')).toBe(true);
    expect(isValidTransition('paused', 'running')).toBe(true);
    expect(isValidTransition('running', 'completed')).toBe(true);
  });

  it('should handle disconnected recovery sequence', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    // Valid sequence: pending -> running -> disconnected -> running -> completed
    expect(isValidTransition('pending', 'running')).toBe(true);
    expect(isValidTransition('running', 'disconnected')).toBe(true);
    expect(isValidTransition('disconnected', 'running')).toBe(true);
    expect(isValidTransition('running', 'completed')).toBe(true);
  });

  it('should handle disconnected failure sequence', () => {
    const { isValidTransition } = require('@/lib/status-transitions');
    
    // Valid sequence: pending -> running -> disconnected -> failed
    expect(isValidTransition('pending', 'running')).toBe(true);
    expect(isValidTransition('running', 'disconnected')).toBe(true);
    expect(isValidTransition('disconnected', 'failed')).toBe(true);
  });
});
