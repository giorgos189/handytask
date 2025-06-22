
'use client';

import React, { useState } from 'react';
import { createUser, UserRole } from '@/auth/auth';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from 'lucide-react';

const CreateUserPage: React.FC = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !surname || !email || !role) {
      setError('Please fill in all required fields (Name, Surname, Email, Role).');
      return;
    }

    try {
      const newUser = {
        name,
        surname,
        phone,
        email,
        address,
        role,
        // The password field is not used by the mock `createUser` function.
        // In a real app, you would handle password creation securely.
      };
      // In a real app, this would be an async call to your backend
      // For now, we'll assume createUser is synchronous as per the mock
      createUser(newUser);

      toast({
        title: "User Created",
        description: `User ${name} ${surname} has been successfully created.`,
      });

      // Clear form
      setName('');
      setSurname('');
      setPhone('');
      setEmail('');
      setAddress('');
      setRole('employee');
      // Optionally redirect or provide further feedback
      // router.push('/admin/user-management'); // Example redirect

    } catch (err) {
      setError('Failed to create user. Please check the details and try again.');
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Create New User</CardTitle>
            </div>
            <CardDescription>Fill in the details below to add a new user to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)} required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Anytown, USA"
                />
              </div>
              
              <Button type="submit" className="w-full text-lg py-3">
                Create User
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

export default CreateUserPage;
