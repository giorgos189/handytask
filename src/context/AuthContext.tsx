'use client';

import type { User as AuthUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { app, db } from '@/lib/firebase';
import type { User } from '@/auth/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Wrench } from 'lucide-react';

const auth = getAuth(app);

interface AuthContextType {
  authUser: AuthUser | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User);
          } else {
            // This can happen if a user is created in Auth but their Firestore doc fails to create
            console.warn("User exists in Auth but not in Firestore. Logging out.");
            await auth.signOut();
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          setUser(null);
        }
      } else {
        setAuthUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { authUser, user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
