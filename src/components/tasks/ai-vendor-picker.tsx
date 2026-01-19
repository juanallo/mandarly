'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIVendor } from '@/types';

const AI_VENDORS = [
  { id: 'claude', name: 'Claude', description: 'Anthropic Claude' },
  { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI ChatGPT' },
  { id: 'gemini', name: 'Gemini', description: 'Google Gemini' },
  { id: 'cursor', name: 'Cursor', description: 'Cursor IDE' },
  { id: 'copilot', name: 'Copilot', description: 'GitHub Copilot' },
  { id: 'windsurf', name: 'Windsurf', description: 'Codeium Windsurf' },
  { id: 'cody', name: 'Cody', description: 'Sourcegraph Cody' },
  { id: 'aider', name: 'Aider', description: 'Aider CLI' },
  { id: 'other', name: 'Other', description: 'Custom/Other AI' },
] as const;

interface AIVendorPickerProps {
  value: AIVendor;
  onChange: (vendor: AIVendor) => void;
}

export function AIVendorPicker({ value, onChange }: AIVendorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        {AI_VENDORS.map((vendor) => (
          <button
            key={vendor.id}
            type="button"
            onClick={() => onChange(vendor.id as AIVendor)}
            className={cn(
              'relative flex flex-col items-start justify-between rounded-lg border-2 p-4 transition-all hover:bg-accent',
              value === vendor.id
                ? 'border-primary bg-accent'
                : 'border-muted'
            )}
          >
            {value === vendor.id && (
              <div className="absolute right-2 top-2">
                <div className="rounded-full bg-primary p-1">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{vendor.name}</p>
              <p className="text-xs text-muted-foreground">{vendor.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
