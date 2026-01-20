import { beforeMount, afterMount } from '@playwright/experimental-ct-react/hooks';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/sidebar-provider';

// Create a new query client for each test to avoid state leakage
let queryClient: QueryClient;

beforeMount(async ({ App, hooksConfig }) => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <App />
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
});

afterMount(async () => {
  // Cleanup if needed
  if (queryClient) {
    queryClient.clear();
  }
});
