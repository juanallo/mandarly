'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { generateBreadcrumbs } from './breadcrumbs';
import { useSidebarContext } from '@/components/sidebar-provider';
import { cn } from '@/lib/utils';

// Map pathnames to page titles
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/tasks/new': 'New Task',
  '/projects': 'Projects',
  '/presets': 'Presets',
};

// Map pathnames to breadcrumb label overrides
const breadcrumbOverrides: Record<string, string> = {
  '/tasks/new': 'New Task',
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarContext();

  // Determine page title
  const title = pageTitles[pathname] || 
    pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 
    'Page';

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(pathname, breadcrumbOverrides);
  
  // Show breadcrumbs if there's more than one item (not just the current page)
  const showBreadcrumbs = breadcrumbs.length > 1;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header 
          title={title}
          breadcrumbs={showBreadcrumbs ? breadcrumbs : undefined}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
