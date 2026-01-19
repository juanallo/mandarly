'use client';

import { CommandSearch } from './command-search';
import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  /** @deprecated Use actions instead */
  action?: React.ReactNode;
}

export function Header({ title, breadcrumbs, actions, action, className }: HeaderProps) {
  const contextualActions = actions || action;

  return (
    <div
      className={cn(
        'flex h-16 items-center justify-between border-b bg-white px-6',
        className
      )}
    >
      {/* Left side: Title and Breadcrumbs */}
      <div className="flex flex-col gap-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <>
            <Breadcrumbs items={breadcrumbs} className="mb-1" />
            <h2 className="text-xl font-semibold truncate">{title}</h2>
          </>
        ) : (
          <h2 className="text-2xl font-semibold truncate">{title}</h2>
        )}
      </div>

      {/* Right side: Search, Notifications, Avatar, Actions */}
      <div className="flex items-center gap-4">
        {/* Command Search with keyboard hint */}
        <CommandSearch />

        {/* Notification indicator (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          data-notification
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Avatar (placeholder) */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
          data-avatar
          role="button"
          aria-label="User menu"
        >
          <User className="h-4 w-4 text-gray-600" />
        </div>

        {/* Contextual Actions */}
        {contextualActions && (
          <div className="flex items-center gap-2 border-l pl-4">
            {contextualActions}
          </div>
        )}
      </div>
    </div>
  );
}
