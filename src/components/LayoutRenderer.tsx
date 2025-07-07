// src/components/LayoutRenderer.tsx
'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import AuthGuard from '@/components/AuthGuard';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/Providers';

export default function LayoutRenderer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
