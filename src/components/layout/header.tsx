'use client';

import { CommandSearch } from './command-search';

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flex items-center gap-4">
        <CommandSearch />
        {action}
      </div>
    </div>
  );
}
