"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockLogin } from '@/auth/auth'; // Assuming mockLogin is exported from auth.ts

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const user = await mockLogin(email, password);
      if (user) {
        // Assuming successful login sets the user in your mock auth system
        router.push('/'); // Redirect to home page on successful login
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginPage;