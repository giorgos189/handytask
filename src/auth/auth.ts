
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
  {
    id: 'user-3', // Was nextUserId = 3, ensuring consistency if createUser was called
    name: 'Handy',
    surname: 'Andy',
    phone: '555-000-1111',
    email: 'employee2@example.com'.toLowerCase(),
    address: '789 Worker Rd',
    role: 'employee',
  },
  {
    id: 'user-4',
    name: 'Test',
    surname: 'Employee',
    phone: '555-000-2222',
    email: 'employee3@example.com'.toLowerCase(),
    address: '101 Job St',
    role: 'employee',
  }
];

let currentUser: User | null = null;
let nextUserId = 5; // Adjusted nextUserId due to added mock user

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
  return newUser;
};

export const updateUserProfile = (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'role' | 'email'>>
): boolean => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, email: mockUsers[userIndex].email }; // Ensure email is not changed
    if (currentUser && currentUser.id === userId) {
      currentUser = { ...currentUser, ...updates };
    }
    return true;
  }
  return false;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return false; 
  }
  // Mock password change logic (no actual hashing or storage)
  return true; 
};

export const getAllUsers = (): User[] => {
  return [...mockUsers]; // Return a copy
};

export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(user => user.role === role);
};
