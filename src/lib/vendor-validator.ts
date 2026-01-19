import type { AIVendor } from '@/types';

export interface VendorAvailability {
  vendor: AIVendor;
  isAvailable: boolean;
  warning?: string;
  fallbackSuggestions?: AIVendor[];
}

/**
 * Checks if an AI vendor is potentially available
 * In a real implementation, this would check API keys, quotas, etc.
 */
export function checkVendorAvailability(vendor: AIVendor): VendorAvailability {
  // In a real implementation, we would:
  // 1. Check if API key exists for this vendor
  // 2. Verify rate limits/quotas
  // 3. Check service status
  
  // For now, we'll use a simplified check based on environment variables
  const hasApiKey = checkVendorApiKey(vendor);

  if (!hasApiKey) {
    return {
      vendor,
      isAvailable: false,
      warning: `No API key configured for ${getVendorDisplayName(vendor)}`,
      fallbackSuggestions: getFallbackVendors(vendor),
    };
  }

  return {
    vendor,
    isAvailable: true,
  };
}

/**
 * Checks if an API key exists for a vendor (simplified check)
 */
function checkVendorApiKey(vendor: AIVendor): boolean {
  if (typeof window !== 'undefined') {
    // Client-side: Can't check environment variables
    return true; // Optimistically assume available
  }

  // Server-side: Check environment variables (simplified - in production would check all vendors)
  const envVarMap: Partial<Record<AIVendor, string>> = {
    claude: 'ANTHROPIC_API_KEY',
    chatgpt: 'OPENAI_API_KEY',
    gemini: 'GOOGLE_API_KEY',
  };

  const envVar = envVarMap[vendor];
  if (!envVar) {
    // No check configured for this vendor, assume available
    return true;
  }
  
  return !!process.env[envVar];
}

/**
 * Gets a user-friendly display name for a vendor
 */
export function getVendorDisplayName(vendor: AIVendor): string {
  const names: Partial<Record<AIVendor, string>> = {
    claude: 'Claude (Anthropic)',
    chatgpt: 'ChatGPT',
    gemini: 'Google Gemini',
    cursor: 'Cursor AI',
    copilot: 'GitHub Copilot',
    windsurf: 'Windsurf',
    cody: 'Cody',
    aider: 'Aider',
    other: 'Other',
  };

  return names[vendor] || vendor;
}

/**
 * Suggests fallback vendors when the primary choice is unavailable
 */
function getFallbackVendors(vendor: AIVendor): AIVendor[] {
  // Return other vendors as fallbacks
  const allVendors: AIVendor[] = ['claude', 'chatgpt', 'gemini', 'cursor', 'copilot', 'windsurf', 'cody', 'aider', 'other'];
  return allVendors.filter(v => v !== vendor).slice(0, 3); // Return top 3 alternatives
}

/**
 * Gets a warning message for unavailable vendors
 */
export function getVendorWarningMessage(vendor: AIVendor): string | null {
  const availability = checkVendorAvailability(vendor);
  
  if (!availability.isAvailable) {
    let message = availability.warning || 'Vendor may not be available';
    
    if (availability.fallbackSuggestions && availability.fallbackSuggestions.length > 0) {
      const suggestions = availability.fallbackSuggestions
        .map(v => getVendorDisplayName(v))
        .join(', ');
      message += `. Consider using: ${suggestions}`;
    }
    
    return message;
  }

  return null;
}

/**
 * Validates vendor configuration and returns any warnings
 */
export function validateVendorConfig(vendor: AIVendor): {
  isValid: boolean;
  warning?: string;
} {
  const availability = checkVendorAvailability(vendor);

  return {
    isValid: true, // Always valid choice, just may have warnings
    warning: availability.warning,
  };
}
