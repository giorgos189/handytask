export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
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
    email: 'admin@example.com',
    address: '123 Admin St',
    role: 'admin',
  },
  {
    id: 'user-2',
    name: 'Employee',
    surname: 'One',
    phone: '098-765-4321',
    email: 'employee1@example.com',
    address: '456 Employee Ave',
    role: 'employee',
  },
];

let currentUser: User | null = null;

export const login = async (email: string, password: string): Promise<User | null> => {
  // In a real application, you would verify the password against a hashed version
  // For this mock, we'll just check the email
  const user = mockUsers.find(u => u.email === email);

  if (user) {
    // In a real application, this would be a secure token or session
    currentUser = user;
    return user;
  }

  return null; // Indicate login failure
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Mock logout function (optional but good to include)
export const logout = (): void => {
  currentUser = null;
};