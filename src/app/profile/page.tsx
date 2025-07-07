
// src/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { updateUserProfile, changePassword } from '@/auth/auth';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Lock, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth(); // Use auth context
  const { toast } = useToast();

  // Profile details form state
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setSurname(user.surname);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    if (!user) return;

    if (!name.trim() || !surname.trim()) {
      setProfileError('Name and Surname cannot be empty.');
      return;
    }
    setIsProfileSaving(true);
    try {
      const success = await updateUserProfile(user.id, { name, surname, phone, address });
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated. Changes will be reflected after next login.",
        });
      } else {
        setProfileError('Failed to update profile. Please try again.');
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setProfileError('An unexpected error occurred. Please try again.');
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!user) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    setIsPasswordSaving(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        toast({
          title: "Password Changed",
          description: "Your password has been successfully updated.",
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError('Failed to change password. This can happen if your current password is incorrect.');
         toast({
          title: "Error",
          description: "Failed to change password. Check your current password.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setPasswordError('An unexpected error occurred while changing password.');
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <AuthGuard>
        <div className="flex h-screen w-full items-center justify-center">Loading profile...</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 space-y-10">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <UserCircle className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Edit Profile</CardTitle>
            </div>
            <CardDescription>Update your personal information. Email is read-only.</CardDescription>
          </CardHeader>
          <CardContent>
            {profileError && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {profileError}
              </div>
            )}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isProfileSaving} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Last Name</Label>
                  <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required disabled={isProfileSaving} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Read-only)</Label>
                <Input id="email" type="email" value={user.email} readOnly disabled className="bg-muted/50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" disabled={isProfileSaving} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" disabled={isProfileSaving} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isProfileSaving}>
                {isProfileSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Profile Changes</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
             <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Change Password</CardTitle>
            </div>
            <CardDescription>Update your login password.</CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {passwordError}
              </div>
            )}
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isPasswordSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isPasswordSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isPasswordSaving} />
              </div>
              <Button type="submit" className="w-full" disabled={isPasswordSaving}>
                {isPasswordSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" /> Change Password</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
