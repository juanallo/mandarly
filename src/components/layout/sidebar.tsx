'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, FolderKanban, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarToggle } from './sidebar-toggle';
import { useSidebarContext } from '@/components/sidebar-provider';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
];

const settingsNavigation = [
  { name: 'Presets', href: '/presets', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarContext();

  const renderNavLink = (item: typeof mainNavigation[0]) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    
    const linkContent = (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          isCollapsed && 'justify-center'
        )}
        aria-label={item.name}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{item.name}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.name} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.name}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider>
      <div 
        className={cn(
          'flex h-screen flex-col border-r bg-white transition-all duration-200',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Workspace Branding */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">Mandarly</h1>
          )}
          <SidebarToggle 
            collapsed={isCollapsed} 
            onToggle={toggleSidebar}
            className={cn(isCollapsed && 'mx-auto')}
          />
        </div>
        
        {/* New Task Button */}
        <div className="p-4">
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/tasks/new">
                  <Button size="icon" className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New Task</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/tasks/new">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </Link>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-6 px-4 pb-4" role="navigation">
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Main
              </h3>
            )}
            {mainNavigation.map(renderNavLink)}
          </div>

          {/* Settings Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Settings
              </h3>
            )}
            {settingsNavigation.map(renderNavLink)}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}
