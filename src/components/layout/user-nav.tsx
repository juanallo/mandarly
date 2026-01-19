'use client';

import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserNavProps {
  collapsed?: boolean;
  className?: string;
}

export function UserNav({ collapsed = false, className }: UserNavProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
        <User className="h-4 w-4 text-gray-600" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">User</span>
          <span className="text-xs text-gray-500">user@example.com</span>
        </div>
      )}
    </div>
  );
}
