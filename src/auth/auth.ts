import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as fbUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';


export type UserRole = 'admin' | 'employee';

export interface User {
  id: string; // This will be the Firebase Auth UID
  name: string;
  surname: string;
  phone: string;
  email: string; // Will be stored in lowercase
  address: string;
  role: UserRole;
}

const usersCollection = collection(db, 'users');

// Helper to convert Firestore doc to User object
const docToUser = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    surname: data.surname,
    phone: data.phone,
    email: data.email,
    address: data.address,
    role: data.role,
  };
};

export type CreateUserInput = Omit<User, 'id'>;

export const createUser = async (userData: CreateUserInput, password: string): Promise<User> => {
  const normalizedEmail = userData.email.toLowerCase();

  // Create a temporary, secondary Firebase app instance to create the new user.
  // This prevents the main app's auth state from being updated to the new user.
  const tempAppName = `temp-user-creation-${Date.now()}`;
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);

  try {
    // Step 1: Create user in Firebase Authentication using the temporary auth instance
    const userCredential = await createUserWithEmailAndPassword(tempAuth, normalizedEmail, password);
    const authUser = userCredential.user;

    // Step 2: Create user profile in Firestore
    const newUser: User = {
      ...userData,
      id: authUser.uid, // Use UID from Auth as the document ID
      email: normalizedEmail,
    };
    
    const userDocRef = doc(db, "users", authUser.uid);
    await setDoc(userDocRef, {
        name: newUser.name,
        surname: newUser.surname,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
    });
    return newUser;
  } catch (error) {
    // If Firestore creation fails, we should ideally delete the Firebase Auth user
    // to prevent orphaned auth users.
    console.error("Error creating user profile in Firestore: ", error);
    // Rethrow the original error to be handled by the UI
    throw error;
  } finally {
    // Step 3: Clean up the temporary app instance
    await deleteApp(tempApp);
  }
};


export const login = async (email: string, password: string): Promise<User> => {
  const normalizedEmail = email.toLowerCase();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("User profile not found in the database.");
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error: any) {
    // If user not found and it's the admin email, create the admin user.
    // Firebase may return 'auth/invalid-credential' for non-existent users now.
    if ((error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && normalizedEmail === 'admin@example.com') {
      console.log('Admin user not found, creating new admin...');
      const adminData = {
        name: 'Admin',
        surname: 'User',
        phone: '123-456-7890',
        email: normalizedEmail,
        address: '123 Admin St',
        role: 'admin' as UserRole,
      };
      const newAdmin = await createUser(adminData, password);
      // Now login the newly created admin
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return newAdmin;
    }
    console.error("Firebase login error:", error);
    // Re-throw the original error to be handled by the UI
    throw error;
  }
};


export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'role' | 'email'>>
): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating user profile: ", error);
    return false;
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("No user is currently signed in or user has no email.");
    }
    
    try {
        // Re-authenticate the user to ensure they are the rightful owner
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // If re-authentication is successful, update the password
        await fbUpdatePassword(user, newPassword);
        return true;
    } catch (error) {
        console.error("Error changing password: ", error);
        // We can inspect the error code to give more specific feedback
        // For example, 'auth/wrong-password'
        return false;
    }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map(docToUser);
  } catch (error) {
    console.error("Error getting all users: ", error);
    return [];
  }
};

export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  try {
    const q = query(usersCollection, where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToUser);
  } catch (error) {
    console.error(`Error getting users by role ${role}: `, error);
    return [];
  }
};
