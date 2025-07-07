'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/auth/auth';
import { Wrench } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loading) return; // Wait until auth state is confirmed

    if (!user) {
      // If not logged in, redirect to login page
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // If role is required and doesn't match, redirect to home
      router.push('/');
    }
  }, [user, loading, router, requiredRole, pathname]);

  if (loading) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
         <div className="flex items-center gap-2">
            <Wrench className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xl font-semibold text-foreground">Loading...</span>
          </div>
       </div>
    );
  }

  if (user && (!requiredRole || user.role === requiredRole)) {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
};

export default AuthGuard;
