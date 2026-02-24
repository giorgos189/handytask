'use client';

// src/app/admin/manage-users/page.tsx
// Admin-only page: list all users, edit their profile, change password, delete.

import React, { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getAllUsers, adminUpdateUser, deleteUserFromFirestore, type User, type UserRole } from '@/auth/auth';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Pencil, Trash2, KeyRound, Loader2, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
}

async function apiSetPassword(targetUid: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const token = await getIdToken();
  if (!token) return { ok: false, error: 'Not authenticated.' };

  const res = await fetch(`/api/admin/users/${targetUid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error ?? 'Failed to update password.' };
  return { ok: true };
}

async function apiDeleteUser(targetUid: string): Promise<{ ok: boolean; error?: string; notConfigured?: boolean }> {
  const token = await getIdToken();
  if (!token) return { ok: false, error: 'Not authenticated.' };

  const res = await fetch(`/api/admin/users/${targetUid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (res.status === 501) return { ok: false, notConfigured: true, error: data.error };
  if (!res.ok) return { ok: false, error: data.error ?? 'Failed to delete user.' };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface EditDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: User) => void;
}

function EditUserDialog({ user, open, onClose, onSaved }: EditDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [surname, setSurname] = useState(user.surname);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state when the target user changes
  useEffect(() => {
    setName(user.name);
    setSurname(user.surname);
    setPhone(user.phone ?? '');
    setAddress(user.address ?? '');
    setRole(user.role);
    setError(null);
  }, [user]);

  const handleSave = async () => {
    setError(null);
    if (!name.trim() || !surname.trim()) {
      setError('Name and Surname are required.');
      return;
    }
    setSaving(true);
    try {
      const success = await adminUpdateUser(user.id, { name, surname, phone, address, role });
      if (success) {
        toast({ title: 'User Updated', description: `${name} ${surname} has been updated.` });
        onSaved({ ...user, name, surname, phone, address, role });
        onClose();
      } else {
        setError('Failed to update user. Please try again.');
      }
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Editing <strong>{user.email}</strong>. Email cannot be changed here.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>
        )}

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-name">First Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-surname">Last Name</Label>
              <Input
                id="edit-surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={saving}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Optional"
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

interface PasswordDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

function ChangePasswordDialog({ user, open, onClose }: PasswordDialogProps) {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewPassword('');
      setConfirm('');
      setError(null);
    }
  }, [open]);

  const handleSendReset = async () => {
    setSaving(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: 'Reset Email Sent',
        description: `A password reset email was sent to ${user.email}.`,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Failed to send reset email.');
    } finally {
      setSaving(false);
    }
  };

  const handleDirectSet = async () => {
    setError(null);
    if (!newPassword || !confirm) {
      setError('Both fields are required.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      const result = await apiSetPassword(user.id, newPassword);
      if (result.ok) {
        toast({ title: 'Password Updated', description: `Password for ${user.email} has been changed.` });
        onClose();
      } else if (result.error?.includes('FIREBASE_SERVICE_ACCOUNT_KEY') || result.error?.includes('not configured')) {
        // Admin SDK not set up — fall back to reset email
        setError(
          'Direct password change requires the Firebase Admin SDK to be configured. ' +
          'Use "Send Reset Email" to let the user reset their own password.'
        );
      } else {
        setError(result.error ?? 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Set a new password for <strong>{user.email}</strong>, or send them a reset link.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>
        )}

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="new-pass">New Password</Label>
            <Input
              id="new-pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              disabled={saving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-pass">Confirm Password</Label>
            <Input
              id="confirm-pass"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSendReset} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Send Reset Email
          </Button>
          <Button onClick={handleDirectSet} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Set Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const ManageUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const all = await getAllUsers();
    // Sort: admins first, then alphabetically by surname
    all.sort((a, b) => {
      if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
      return a.surname.localeCompare(b.surname);
    });
    setUsers(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSaved = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // Try API route first (removes from Auth + Firestore)
    const apiResult = await apiDeleteUser(deleteTarget.id);

    if (apiResult.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast({ title: 'User Deleted', description: `${deleteTarget.email} has been removed.` });
      setDeleteTarget(null);
    } else if (apiResult.notConfigured) {
      // Fallback: delete Firestore doc only; user will be locked out on next sign-in
      const fsOk = await deleteUserFromFirestore(deleteTarget.id);
      if (fsOk) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        toast({
          title: 'User Profile Deleted',
          description:
            'The user profile was removed from Firestore. Their Firebase Auth account remains but they will be locked out on next sign-in. Configure FIREBASE_SERVICE_ACCOUNT_KEY to fully delete the account.',
        });
        setDeleteTarget(null);
      } else {
        toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Error', description: apiResult.error ?? 'Failed to delete user.', variant: 'destructive' });
    }

    setDeleting(false);
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Manage Users</CardTitle>
                  <CardDescription>View, edit, reset passwords, and remove users.</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading users…</span>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No users found.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {u.name} {u.surname}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditTarget(u)}
                              title="Edit user"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="ml-1 hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPasswordTarget(u)}
                              title="Change password"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              <span className="ml-1 hidden sm:inline">Password</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget(u)}
                              disabled={u.id === currentUser?.id}
                              title={u.id === currentUser?.id ? 'Cannot delete your own account' : 'Delete user'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="ml-1 hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      {editTarget && (
        <EditUserDialog
          user={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleUserSaved}
        />
      )}

      {/* Change password dialog */}
      {passwordTarget && (
        <ChangePasswordDialog
          user={passwordTarget}
          open={!!passwordTarget}
          onClose={() => setPasswordTarget(null)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget?.email}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
};

export default ManageUsersPage;
