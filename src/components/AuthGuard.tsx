'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, type UserRole } from '@/auth/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<{ isLoading: boolean; isAuthorized: boolean }>({
    isLoading: true,
    isAuthorized: false,
  });

  useEffect(() => {
    const user = getCurrentUser();
    let authorized = false;
    let shouldRedirect = false;
    const redirectPath = '/login';

    // This AuthGuard is intended for protected routes.
    // RootLayout logic should prevent this from running on standalone pages like /login.
    if (!user) {
      shouldRedirect = true;
    } else if (requiredRole && user.role !== requiredRole) {
      shouldRedirect = true;
    } else {
      authorized = true;
    }

    if (shouldRedirect) {
      // Only redirect if not already on the target path to avoid loops.
      // This is an extra safety, as RootLayout should handle this.
      if (pathname !== redirectPath) {
        router.push(redirectPath);
      }
      // If redirecting, authorization remains false.
      setAuthStatus({ isLoading: false, isAuthorized: false });
    } else {
      setAuthStatus({ isLoading: false, isAuthorized: authorized });
    }

  }, [router, requiredRole, pathname]);

  if (authStatus.isLoading) {
    // Display a loading message or spinner
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (authStatus.isAuthorized) {
    return <>{children}</>;
  }

  // If not loading and not authorized, a redirect is in progress or has occurred.
  // Returning null here prevents rendering children, which is correct.
  return null;
};

export default AuthGuard;
