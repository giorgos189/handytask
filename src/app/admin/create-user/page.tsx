'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, createUser, UserRole } from '@/auth/auth'; // Adjust the import path as necessary
import AuthGuard from '../../components/AuthGuard';
import { useRouter } from 'next/navigation';

const CreateUserPage: React.FC = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('employee'); // Default role
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation (can be enhanced)
    if (!name || !surname || !email || !role) {
      setError('Please fill in all required fields (Name, Surname, Email, Role).');
      return;
    }

    try {
      // Mock user creation - replace with actual backend call later
      const newUser = {
        name,
        surname,
        phone,
        email,
        address,
        role,
        password: 'mockpassword' // In a real app, handle password securely
      };
      createUser(newUser); // Use the mock createUser function

      // Clear form and show success message or redirect
      alert('User created successfully!');
      setName('');
      setSurname('');
      setPhone('');
      setEmail('');
      setAddress('');
      setRole('employee');

    } catch (err) {
      setError('Failed to create user.');
      console.error(err);
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create New User</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname:</label>
            <input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone:</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create User
          </button>
        </form>
      </div>
    </AuthGuard>
  );
};

export default CreateUserPage;