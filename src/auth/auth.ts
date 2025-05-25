
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

// Mock user data - replace with actual database interaction
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin',
    surname: 'User',
    phone: '123-456-7890',
    email: 'admin@example.com'.toLowerCase(),
    address: '123 Admin St',
    role: 'admin',
  },
  {
    id: 'user-2',
    name: 'Employee',
    surname: 'One',
    phone: '098-765-4321',
    email: 'employee1@example.com'.toLowerCase(),
    address: '456 Employee Ave',
    role: 'employee',
  },
];

let currentUser: User | null = null;
let nextUserId = 3;

export const login = async (email: string, password: string): Promise<User | null> => {
  const normalizedEmail = email.toLowerCase();
  const user = mockUsers.find(u => u.email === normalizedEmail);

  if (user) {
    // Mock password check: In a real app, compare hashed password
    // For this mock, any password attempt is successful if email matches
    currentUser = user;
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const logout = (): void => {
  currentUser = null;
};

export type CreateUserInput = Omit<User, 'id' | 'email'> & { email: string; password?: string };

export const createUser = (userData: CreateUserInput): User => {
  const newUser: User = {
    id: `user-${nextUserId++}`,
    name: userData.name,
    surname: userData.surname,
    phone: userData.phone,
    email: userData.email.toLowerCase(),
    address: userData.address,
    role: userData.role,
  };
  mockUsers.push(newUser);
  // console.log('Mock createUser: New user added:', newUser);
  // console.log('Mock createUser: All users:', mockUsers);
  return newUser;
};

// New function to update user profile
export const updateUserProfile = (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'role' | 'email'>>
): boolean => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    // If the updated user is the current user, update currentUser as well
    if (currentUser && currentUser.id === userId) {
      currentUser = { ...currentUser, ...updates };
    }
    // console.log('Mock updateUserProfile: User updated:', mockUsers[userIndex]);
    return true;
  }
  return false;
};

// New mock function to change password
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return false; // User not found
  }
  // Mock password change:
  // In a real app, you would:
  // 1. Fetch the user's stored hashed password.
  // 2. Compare `currentPassword` with the stored hash.
  // 3. If it matches, hash `newPassword` and store it.
  // For this mock, we'll just log it and assume success if the user exists.
  // We don't actually store or use passwords in this mock.
  // console.log(`Mock changePassword: Attempt to change password for user ${userId}. Current: "${currentPassword}", New: "${newPassword}"`);
  
  // Simulate a check (e.g. currentPassword would be validated against a stored one)
  // For mock, we'll just say it's successful.
  // if (currentPassword !== "mockpassword") { // Example of a mock check
  //   console.log("Mock changePassword: Current password incorrect (mock check).");
  //   return false;
  // }

  // console.log(`Mock changePassword: Password for user ${userId} would be updated.`);
  return true; // Assume success for mock
};
