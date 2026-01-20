'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center space-x-2">
        {/* Home icon for first item if it's the root */}
        {items[0]?.href === '/' && (
          <li className="flex items-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
            {items.length > 1 && (
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            )}
          </li>
        )}

        {/* Render remaining items */}
        {items.slice(items[0]?.href === '/' ? 1 : 0).map((item, index, arr) => {
          const isLast = index === arr.length - 1;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isLast
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm font-medium',
                    isLast ? 'text-gray-900' : 'text-gray-500'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items from a pathname
 * 
 * @param pathname - Current path (e.g., "/tasks/123")
 * @param overrides - Optional overrides for specific paths
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbs(
  pathname: string,
  overrides?: Record<string, string>
): BreadcrumbItem[] {
  if (pathname === '/') {
    return [{ label: 'Dashboard', href: '/', current: true }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Use override if available, otherwise capitalize segment
    const label = overrides?.[currentPath] || 
      (segment === 'new' ? 'New' :
       segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

    const item: BreadcrumbItem = {
      label,
    };

    if (!isLast) {
      item.href = currentPath;
    } else {
      item.current = true;
    }

    items.push(item);
  });

  return items;
}
