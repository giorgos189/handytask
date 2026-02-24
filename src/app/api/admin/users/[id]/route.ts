// src/app/api/admin/users/[id]/route.ts
// API route for admin-only user operations.
// PATCH  → update user's password (requires Firebase Admin SDK)
// DELETE → delete user from Firebase Auth + Firestore (requires Firebase Admin SDK)
//
// Authorization: caller must supply a valid Firebase ID token (Bearer) belonging to an admin user.

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, isAdminConfigured } from '@/lib/firebase-admin';

const notConfigured = () =>
  NextResponse.json(
    {
      error:
        'Firebase Admin SDK is not configured. Set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.',
    },
    { status: 501 }
  );

async function verifyAdminCaller(request: NextRequest): Promise<string | null> {
  if (!adminAuth || !adminDb) return null;

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const callerDoc = await adminDb.collection('users').doc(decoded.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

// PATCH /api/admin/users/[id]
// Body: { password: string }  → set a new password for the target user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminConfigured) return notConfigured();

  const callerUid = await verifyAdminCaller(request);
  if (!callerUid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { password } = body as { password?: string };

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters.' },
      { status: 400 }
    );
  }

  try {
    await adminAuth!.updateUser(id, { password });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/users PATCH] Error updating password:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update password.' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
// Removes the user from Firebase Auth AND the Firestore users collection.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminConfigured) return notConfigured();

  const callerUid = await verifyAdminCaller(request);
  if (!callerUid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (callerUid === id) {
    return NextResponse.json({ error: 'Admins cannot delete their own account.' }, { status: 400 });
  }

  try {
    // Delete from Firebase Auth
    await adminAuth!.deleteUser(id);
    // Delete from Firestore
    await adminDb!.collection('users').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/users DELETE] Error deleting user:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to delete user.' }, { status: 500 });
  }
}
