
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string; // Will be stored in lowercase
  address: string;
  role: UserRole;
}

const AUTH_KEY = 'handytask-user';
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

export const login = async (email: string, password: string): Promise<User | null> => {
  const normalizedEmail = email.toLowerCase();
  
  try {
    const q = query(usersCollection, where("email", "==", normalizedEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no user is found and it's the default admin, create it on first login.
      if (normalizedEmail === 'admin@example.com') {
        const adminData = {
          name: 'Admin',
          surname: 'User',
          phone: '123-456-7890',
          email: normalizedEmail,
          address: '123 Admin St',
          role: 'admin' as UserRole,
        };
        // Use setDoc with a specific ID to be safe on first run
        const userRef = doc(db, 'users', 'admin-user-placeholder-id');
        await setDoc(userRef, adminData);
        const newUser = { id: userRef.id, ...adminData };

        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
        }
        return newUser;
      }
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const user = docToUser(userDoc);

    // Mock password check - any password works
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error("Firebase login error:", error);
    console.error("Login failed. This might be due to Firestore security rules. Please ensure your rules allow reads on the 'users' collection. For development, you can use rules that allow all reads and writes.");
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null; // No localStorage on the server
  }
  const userJson = localStorage.getItem(AUTH_KEY);
  if (!userJson) {
    return null;
  }
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
};

export type CreateUserInput = Omit<User, 'id'>;

export const createUser = async (userData: CreateUserInput): Promise<User | null> => {
  const userToCreate = {
    ...userData,
    email: userData.email.toLowerCase(),
  };
  try {
    const docRef = await addDoc(usersCollection, userToCreate);
    return {
      id: docRef.id,
      ...userToCreate,
    };
  } catch (error) {
    console.error("Error creating user: ", error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'role' | 'email'>>
): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, updates);
    const loggedInUser = getCurrentUser();
    if (loggedInUser && loggedInUser.id === userId) {
      const updatedUserInStorage = { ...loggedInUser, ...updates };
       if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUserInStorage));
      }
    }
    return true;
  } catch (error) {
    console.error("Error updating user profile: ", error);
    return false;
  }
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  // This remains a mock since we are not storing passwords in Firestore.
  // In a real Firebase Auth scenario, you'd use Firebase's own methods for this.
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return false;
    }
    return true; 
  } catch (error) {
    console.error("Error changing password (mock check): ", error);
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
