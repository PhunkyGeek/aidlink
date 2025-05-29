import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export type Role = 'admin' | 'validator' | 'donor' | 'recipient';

export type UserRole = {
  id: string;
  role: Role;
  createdManually?: boolean;
};

export async function getUserRole(address: string): Promise<Role> {
  if (!address || typeof address !== 'string') {
    toast.error('Invalid wallet address');
    return 'donor';
  }

  if (!db) {
    toast.error('Database service unavailable');
    throw new Error('Firestore is not initialized');
  }

  try {
    const docRef = doc(db, 'userRoles', address);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as UserRole;
      if (data.role === 'admin' && data.createdManually !== true) {
        toast.error('Admin access denied: Not manually created');
        return 'donor';
      }
      return data.role;
    }

    toast.error('No role found: Defaulting to donor');
    return 'donor';
  } catch (error: any) {
    console.error('Error fetching user role:', error);
    toast.error(`Failed to fetch role: ${error.message}`);
    return 'donor';
  }
}

export async function setUserRole(address: string, role: Role): Promise<void> {
  if (!address || typeof address !== 'string') {
    toast.error('Invalid wallet address');
    throw new Error('Invalid address');
  }

  if (!Object.values(['admin', 'validator', 'donor', 'recipient']).includes(role)) {
    toast.error('Invalid role');
    throw new Error('Invalid role');
  }

  if (!db) {
    toast.error('Database service unavailable');
    throw new Error('Firestore is not initialized');
  }

  try {
    const docRef = doc(db, 'userRoles', address);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists() && snapshot.data().role === 'admin') {
      toast.error('Cannot overwrite admin role');
      return;
    }

    await setDoc(docRef, { role }, { merge: true });
    toast.success(`Role set to ${role}`);
  } catch (error: any) {
    console.error('Error setting role:', error);
    toast.error(`Failed to set role: ${error.message}`);
    throw error;
  }
}