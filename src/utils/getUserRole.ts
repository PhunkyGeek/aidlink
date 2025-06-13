import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export type Role = 'admin' | 'validator' | 'donor' | 'recipient';

export async function getUserRole(userId: string): Promise<Role | null> {
  if (!userId || typeof userId !== 'string') {
    toast.error('Invalid user ID');
    return null;
  }

  if (!db) {
    toast.error('Database service unavailable');
    throw new Error('Firestore is not initialized');
  }

  try {
    const docRef = doc(db, 'users', userId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.role || null;
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching user role:', error);
    toast.error(`Failed to fetch role: ${error.message}`);
    return null;
  }
}

export async function setUserRole(userId: string, role: Role): Promise<void> {
  if (!userId || typeof userId !== 'string') {
    toast.error('Invalid user ID');
    throw new Error('Invalid user ID');
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
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { role, updatedAt: new Date() }, { merge: true });
    toast.success(`Role set to ${role}`);
  } catch (error: any) {
    console.error('Error setting role:', error);
    toast.error(`Failed to set role: ${error.message}`);
    throw error;
  }
}