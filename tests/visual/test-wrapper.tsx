import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/sidebar-provider';
import '@/app/globals.css';

// Create a new query client for each test to avoid state leakage
export function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </SidebarProvider>
      </QueryClientProvider>
    );
  };
}
