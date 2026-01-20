'use client';

import { CommandSearch } from './command-search';
import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';
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
      <div className="flex flex-col min-w-0 pt-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <>
            <Breadcrumbs items={breadcrumbs} className="mb-0" />
            <h2 className="text-xl font-semibold truncate mt-0.5">{title}</h2>
          </>
        ) : (
          <h2 className="text-2xl font-semibold truncate">{title}</h2>
        )}
      </div>

      {/* Right side: Search and Actions */}
      <div className="flex items-center gap-4">
        {/* Command Search with keyboard hint */}
        <CommandSearch />

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
