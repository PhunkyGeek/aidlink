import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

// Define role type for consistency
type Role = 'donor' | 'recipient' | 'validator' | 'admin';

export interface UserState {
  address: string | null;
  role: Role | null;
  displayName: string | null;
  photoURL: string | null;
  setAddress: (address: string | null) => void;
  setRole: (role: Role | null) => void;
  setProfile: (name: string | null, photo: string | null) => void;
  setUser: (user: { address: string | null; role: Role | null; displayName?: string | null; photoURL?: string | null }) => void;
  clearUser: () => void;
}

// Check for browser environment
const isBrowser = typeof window !== 'undefined';

// Custom storage with error handling and SSR safety
const storage: StateStorage = {
  getItem: (name: string): string | null => {
    if (!isBrowser) return null; // Skip on server
    try {
      return localStorage.getItem(name) ?? null;
    } catch (error) {
      if (isBrowser) {
        toast.error('Failed to load user data from storage');
        console.error('Storage getItem error:', error);
      }
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (!isBrowser) return; // Skip on server
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      if (isBrowser) {
        toast.error('Failed to save user data to storage');
        console.error('Storage setItem error:', error);
      }
    }
  },
  removeItem: (name: string): void => {
    if (!isBrowser) return; // Skip on server
    try {
      localStorage.removeItem(name);
    } catch (error) {
      if (isBrowser) {
        console.error('Storage removeItem error:', error);
      }
    }
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      address: null,
      role: null,
      displayName: null,
      photoURL: null,
      setAddress: (address) => set({ address }),
      setRole: (role) => {
        if (role && !['donor', 'recipient', 'validator', 'admin'].includes(role)) {
          toast.error(`Invalid role: ${role}`);
          return;
        }
        set({ role });
      },
      setProfile: (name, photo) => set({ displayName: name, photoURL: photo }),
      setUser: ({ address, role, displayName, photoURL }) => {
        if (role && !['donor', 'recipient', 'validator', 'admin'].includes(role)) {
          toast.error(`Invalid role: ${role}`);
          return;
        }
        set({ address, role, displayName, photoURL });
      },
      clearUser: () => set({ address: null, role: null, displayName: null, photoURL: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        address: state.address,
        role: state.role,
        displayName: state.displayName,
        photoURL: state.photoURL,
      }),
      version: 1,
      skipHydration: !isBrowser, // Skip hydration on server
    }
  )
);