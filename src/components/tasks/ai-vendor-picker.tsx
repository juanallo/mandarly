'use client';

import { useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AIVendor } from '@/types';

const AI_VENDORS = [
  { id: 'claude', name: 'Claude', description: 'Anthropic - Advanced reasoning' },
  { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI - General purpose' },
  { id: 'gemini', name: 'Gemini', description: 'Google - Multimodal AI' },
  { id: 'cursor', name: 'Cursor', description: 'IDE with AI pair programming' },
  { id: 'copilot', name: 'Copilot', description: 'GitHub - Code completion' },
  { id: 'windsurf', name: 'Windsurf', description: 'Codeium - Fast coding assistant' },
  { id: 'cody', name: 'Cody', description: 'Sourcegraph - Code intelligence' },
  { id: 'aider', name: 'Aider', description: 'CLI - Terminal-based AI' },
  { id: 'other', name: 'Other', description: 'Custom/Other AI tool' },
] as const;

interface AIVendorPickerProps {
  value: AIVendor;
  onChange: (vendor: AIVendor) => void;
}

export function AIVendorPicker({ value, onChange }: AIVendorPickerProps) {
  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>AI Vendor*</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Select the AI tool or service you&apos;ll use to execute this task. Each vendor has different strengths for various coding tasks.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
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
    </TooltipProvider>
  );
}
