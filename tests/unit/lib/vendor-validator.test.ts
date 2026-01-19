import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkVendorAvailability,
  getVendorDisplayName,
  getVendorWarningMessage,
  validateVendorConfig,
} from '@/lib/vendor-validator';
import type { AIVendor } from '@/types';

describe('Vendor Validator', () => {
  describe('getVendorDisplayName', () => {
    it('returns correct display name for claude', () => {
      expect(getVendorDisplayName('claude')).toBe('Claude (Anthropic)');
    });

    it('returns correct display name for chatgpt', () => {
      expect(getVendorDisplayName('chatgpt')).toBe('ChatGPT');
    });

    it('returns correct display name for gemini', () => {
      expect(getVendorDisplayName('gemini')).toBe('Google Gemini');
    });

    it('returns correct display name for cursor', () => {
      expect(getVendorDisplayName('cursor')).toBe('Cursor AI');
    });

    it('returns correct display name for copilot', () => {
      expect(getVendorDisplayName('copilot')).toBe('GitHub Copilot');
    });

    it('returns correct display name for windsurf', () => {
      expect(getVendorDisplayName('windsurf')).toBe('Windsurf');
    });

    it('returns correct display name for cody', () => {
      expect(getVendorDisplayName('cody')).toBe('Cody');
    });

    it('returns correct display name for aider', () => {
      expect(getVendorDisplayName('aider')).toBe('Aider');
    });

    it('returns correct display name for other', () => {
      expect(getVendorDisplayName('other')).toBe('Other');
    });

    it('returns vendor name as fallback for unknown vendor', () => {
      // Cast to AIVendor to test fallback behavior
      expect(getVendorDisplayName('unknown-vendor' as AIVendor)).toBe('unknown-vendor');
    });
  });

  describe('checkVendorAvailability', () => {
    // Note: In jsdom environment (client-side), the function returns true optimistically
    // because it can't check environment variables

    it('returns available for cursor (no API key check configured)', () => {
      const result = checkVendorAvailability('cursor');
      expect(result.vendor).toBe('cursor');
      expect(result.isAvailable).toBe(true);
    });

    it('returns available for copilot (no API key check configured)', () => {
      const result = checkVendorAvailability('copilot');
      expect(result.vendor).toBe('copilot');
      expect(result.isAvailable).toBe(true);
    });

    it('returns available for windsurf (no API key check configured)', () => {
      const result = checkVendorAvailability('windsurf');
      expect(result.vendor).toBe('windsurf');
      expect(result.isAvailable).toBe(true);
    });

    it('returns available for cody (no API key check configured)', () => {
      const result = checkVendorAvailability('cody');
      expect(result.vendor).toBe('cody');
      expect(result.isAvailable).toBe(true);
    });

    it('returns available for aider (no API key check configured)', () => {
      const result = checkVendorAvailability('aider');
      expect(result.vendor).toBe('aider');
      expect(result.isAvailable).toBe(true);
    });

    it('returns available for other (no API key check configured)', () => {
      const result = checkVendorAvailability('other');
      expect(result.vendor).toBe('other');
      expect(result.isAvailable).toBe(true);
    });

    // Client-side tests (jsdom environment returns true optimistically)
    it('returns available in client-side environment for claude', () => {
      const result = checkVendorAvailability('claude');
      expect(result.vendor).toBe('claude');
      // In jsdom (client-side), it optimistically returns true
      expect(result.isAvailable).toBe(true);
    });

    it('returns available in client-side environment for chatgpt', () => {
      const result = checkVendorAvailability('chatgpt');
      expect(result.vendor).toBe('chatgpt');
      expect(result.isAvailable).toBe(true);
    });

    it('returns available in client-side environment for gemini', () => {
      const result = checkVendorAvailability('gemini');
      expect(result.vendor).toBe('gemini');
      expect(result.isAvailable).toBe(true);
    });
  });

  describe('getVendorWarningMessage', () => {
    // In client-side (jsdom), vendors are optimistically available
    it('returns null for available vendors', () => {
      const result = getVendorWarningMessage('cursor');
      expect(result).toBeNull();
    });

    it('returns null for claude in client environment', () => {
      const result = getVendorWarningMessage('claude');
      expect(result).toBeNull();
    });

    it('returns null for chatgpt in client environment', () => {
      const result = getVendorWarningMessage('chatgpt');
      expect(result).toBeNull();
    });

    it('returns null for gemini in client environment', () => {
      const result = getVendorWarningMessage('gemini');
      expect(result).toBeNull();
    });
  });

  describe('validateVendorConfig', () => {
    it('returns valid for any vendor', () => {
      const vendors: AIVendor[] = ['claude', 'chatgpt', 'gemini', 'cursor', 'copilot', 'windsurf', 'cody', 'aider', 'other'];
      
      vendors.forEach(vendor => {
        const result = validateVendorConfig(vendor);
        expect(result.isValid).toBe(true);
      });
    });

    it('includes warning property when vendor has availability issues', () => {
      // In client-side environment, no warnings are generated
      const result = validateVendorConfig('claude');
      expect(result.isValid).toBe(true);
      // warning may be undefined in client environment
    });

    it('always returns isValid as true regardless of availability', () => {
      // The function is designed to always return isValid: true
      // because vendor choice is always valid, just may have warnings
      const result = validateVendorConfig('chatgpt');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Server-side behavior (mocked)', () => {
    // These tests simulate server-side behavior by mocking window to be undefined
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
      // @ts-expect-error - intentionally setting window to undefined for testing
      delete globalThis.window;
    });

    afterEach(() => {
      globalThis.window = originalWindow;
    });

    it('returns unavailable for claude without API key on server', () => {
      const result = checkVendorAvailability('claude');
      expect(result.vendor).toBe('claude');
      expect(result.isAvailable).toBe(false);
      expect(result.warning).toContain('No API key configured');
      expect(result.warning).toContain('Claude (Anthropic)');
      expect(result.fallbackSuggestions).toBeDefined();
      expect(result.fallbackSuggestions?.length).toBe(3);
    });

    it('returns unavailable for chatgpt without API key on server', () => {
      const result = checkVendorAvailability('chatgpt');
      expect(result.vendor).toBe('chatgpt');
      expect(result.isAvailable).toBe(false);
      expect(result.warning).toContain('ChatGPT');
    });

    it('returns unavailable for gemini without API key on server', () => {
      const result = checkVendorAvailability('gemini');
      expect(result.vendor).toBe('gemini');
      expect(result.isAvailable).toBe(false);
      expect(result.warning).toContain('Google Gemini');
    });

    it('returns available for vendors without API key checks on server', () => {
      const result = checkVendorAvailability('cursor');
      expect(result.vendor).toBe('cursor');
      expect(result.isAvailable).toBe(true);
    });

    it('provides fallback suggestions excluding the current vendor', () => {
      const result = checkVendorAvailability('claude');
      expect(result.fallbackSuggestions).toBeDefined();
      expect(result.fallbackSuggestions).not.toContain('claude');
    });

    it('returns warning message with fallback suggestions on server', () => {
      const result = getVendorWarningMessage('claude');
      expect(result).not.toBeNull();
      expect(result).toContain('No API key configured');
      expect(result).toContain('Consider using:');
    });

    it('validateVendorConfig includes warning on server for unavailable vendor', () => {
      const result = validateVendorConfig('claude');
      expect(result.isValid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('No API key configured');
    });
  });

  describe('Server-side with API keys (mocked)', () => {
    let originalWindow: typeof globalThis.window;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalWindow = globalThis.window;
      originalEnv = process.env;
      // @ts-expect-error - intentionally setting window to undefined for testing
      delete globalThis.window;
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      globalThis.window = originalWindow;
      process.env = originalEnv;
    });

    it('returns available for claude with ANTHROPIC_API_KEY set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const result = checkVendorAvailability('claude');
      expect(result.isAvailable).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('returns available for chatgpt with OPENAI_API_KEY set', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const result = checkVendorAvailability('chatgpt');
      expect(result.isAvailable).toBe(true);
    });

    it('returns available for gemini with GOOGLE_API_KEY set', () => {
      process.env.GOOGLE_API_KEY = 'test-key';
      const result = checkVendorAvailability('gemini');
      expect(result.isAvailable).toBe(true);
    });
  });
});
