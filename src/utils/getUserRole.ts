import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // You'll need to expose Firestore from firebase.ts
import toast from 'react-hot-toast';

export type Role = 'admin' | 'validator' | 'donor' | 'recipient';

export async function getUserRole(address: string): Promise<Role> {
  const docRef = doc(db, 'userRoles', address);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    if (data.role === 'admin' && data.createdManually !== true) {
      toast.error('Admin access denied. Not manually created.');
    }
    return data.role as Role;
  }

  toast.error('No role found. Defaulting to donor.');
  return 'donor'; // Fallback
}

export async function setUserRole(address: string, role: Role): Promise<void> {
  const docRef = doc(db, 'userRoles', address);
  const snapshot = await getDoc(docRef);

  // Do NOT overwrite admin
  if (snapshot.exists() && snapshot.data().role === 'admin') return;

  await setDoc(docRef, { role }, { merge: true });
}

