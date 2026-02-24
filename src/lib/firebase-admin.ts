// src/lib/firebase-admin.ts
// Server-side Firebase Admin SDK initialization.
// Requires FIREBASE_SERVICE_ACCOUNT_KEY env variable (JSON string of service account).
// To obtain: Firebase Console → Project Settings → Service Accounts → Generate new private key.

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    return initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err);
    return null;
  }
}

const adminApp = initAdminApp();

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const isAdminConfigured = adminApp !== null;
