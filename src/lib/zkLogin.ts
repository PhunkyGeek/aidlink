import { jwtToAddress, generateRandomness } from '@mysten/sui/zklogin';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole, Role } from '@/utils/getUserRole';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CLIENT_ID = process.env.NEXT_PUBLIC_ZKLOGIN_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI || 'http://localhost:3000/auth/zklogin/callback';
const USER_SALT_LOCAL_STORAGE_KEY = 'zk_salt';

export async function initiateZkLogin(userId?: string, email?: string): Promise<void> {
  try {
    if (!CLIENT_ID) {
      throw new Error('Missing NEXT_PUBLIC_ZKLOGIN_CLIENT_ID');
    }
    if (!REDIRECT_URI) {
      throw new Error('Missing NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI');
    }

    const salt = generateRandomness();
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_SALT_LOCAL_STORAGE_KEY, salt);
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: salt,
    });

    if (userId || email) {
      const state = JSON.stringify({ userId, email });
      params.append('state', state);
    }

    const loginURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    loginURL.search = params.toString();

    console.debug('zkLogin OAuth URL:', loginURL.toString()); // Remove in production
    window.location.assign(loginURL.toString());
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to initiate zkLogin: ${errorMessage}`);
  }
}

export async function getUserSalt(): Promise<string> {
  if (typeof window !== 'undefined') {
    let salt = localStorage.getItem(USER_SALT_LOCAL_STORAGE_KEY);
    if (!salt) {
      salt = generateRandomness();
      localStorage.setItem(USER_SALT_LOCAL_STORAGE_KEY, salt);
    }
    return salt;
  }
  throw new Error('User salt generation not supported in this environment');
}

export async function handleZkLoginCallback({
  token,
  userId,
  email,
}: {
  token: string;
  userId?: string | null;
  email?: string | null;
}): Promise<{ role: Role | null; docId: string }> {
  try {
    if (!token) throw new Error('Missing id_token in callback');
    if (!db) throw new Error('Firestore database not initialized');

    const salt = await getUserSalt();
    const address = jwtToAddress(token, salt);

    let docId = userId;
    let userData: any = { address, isConnected: true, updatedAt: new Date() };

    if (email && !userId) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        docId = userDoc.id;
      }
    }

    if (!docId) {
      docId = address;
      userData.createdAt = new Date();
    }

    const userDoc = await getDoc(doc(db, 'users', docId));
    if (userDoc.exists()) {
      const existingData = userDoc.data();
      userData = {
        ...userData,
        userId: docId,
        email: existingData.email || email || null,
        displayName: existingData.displayName || null,
        photoURL: existingData.photoURL || null,
        role: existingData.role || null,
      };
    } else {
      userData = {
        ...userData,
        userId: docId,
        email: email || null,
        displayName: null,
        photoURL: null,
        role: null,
        createdAt: userData.createdAt,
      };
    }

    await setDoc(doc(db, 'users', docId), userData, { merge: true });

    const { setId, setEmail, setAddress, setProfile } = useUserStore.getState();
    setId(docId);
    setEmail(userData.email);
    setAddress(address);
    setProfile(userData.displayName, userData.photoURL);

    if (typeof window !== 'undefined') {
      localStorage.setItem('zk_token', token);
      localStorage.setItem('zk_address', address);
    }

    return { role: userData.role, docId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`ZkLogin callback failed: ${errorMessage}`);
  }
}