// src/components/LayoutRenderer.tsx
'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import AuthGuard from '@/components/AuthGuard';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/Providers';
import { Wrench } from 'lucide-react'; // For loading indicator

export default function LayoutRenderer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true);
  }, []);

  if (!isClient) {
    // On the server, and for the initial client render (before useEffect runs),
    // render a consistent loading state. This ensures the server and client
    // HTML matches for this part of the tree.
    return (
      <Providers>
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex items-center gap-2">
            <Wrench className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xl font-semibold text-foreground">Loading HandyTask...</span>
          </div>
        </div>
        <Toaster />
      </Providers>
    );
  }

  // Client is now ready (isClient is true), proceed with rendering the actual layout.
  const standalonePages = ['/login'];
  const isStandalonePage = standalonePages.includes(pathname);

  return (
    <Providers>
      {isStandalonePage ? (
        <React.Fragment>{children}</React.Fragment>
      ) : (
        <AuthGuard>
          <AppLayout>{children}</AppLayout>
        </AuthGuard>
      )}
      <Toaster />
    </Providers>
  );
}
