'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/auth/auth';

interface AuthGuardProps {
 children: React.ReactNode;
 requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (requiredRole && user.role !== requiredRole) {
      router.push('/login'); // Or a different unauthorized page
    }
  }, [router, requiredRole]);

  const user = getCurrentUser();
  if (user && (!requiredRole || user.role === requiredRole)) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard;
