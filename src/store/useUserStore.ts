import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

// Define role type for consistency
type Role = 'donor' | 'recipient' | 'validator' | 'admin';

export interface UserState {
  id: string | null;
  email: string | null;
  address: string | null;
  role: Role | null;
  displayName: string | null;
  photoURL: string | null;
  isConnected: boolean;
  setId: (id: string | null) => void;
  setEmail: (email: string | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setAddress: (address: string | null) => void;
  setRole: (role: Role | null) => void;
  setProfile: (name: string | null, photo: string | null) => void;
  setUser: (user: { id?: string | null; email?: string | null; address?: string | null; role?: Role | null; displayName?: string | null; photoURL?: string | null }) => void;
  clearUser: () => void;
}

// Check for browser environment
const isBrowser = typeof window !== 'undefined';

// Custom storage with error handling and SSR safety
const storage: StateStorage = {
  getItem: (name: string): string | null => {
    if (!isBrowser) return null;
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
    if (!isBrowser) return;
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
    if (!isBrowser) return;
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
      id: null,
      email: null,
      address: null,
      role: null,
      displayName: null,
      photoURL: null,
      isConnected: false,
      setId: (id) => set({ id }),
      setEmail: (email) => set({ email }),
      setIsConnected: (isConnected) => set({ isConnected }),
      setAddress: (address) => set({ address }),
      setRole: (role) => {
        if (role && !['donor', 'recipient', 'validator', 'admin'].includes(role)) {
          toast.error(`Invalid role: ${role}`);
          return;
        }
        set({ role });
      },
      setProfile: (name, photo) => set({ displayName: name, photoURL: photo }),
      setUser: ({ id, email, address, role, displayName, photoURL }) => {
        if (role && !['donor', 'recipient', 'validator', 'admin'].includes(role)) {
          toast.error(`Invalid role: ${role}`);
          return;
        }
        set({ id, email, address, role, displayName, photoURL });
      },
      clearUser: () => set({ id: null, email: null, address: null, role: null, displayName: null, photoURL: null, isConnected: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        id: state.id,
        email: state.email,
        address: state.address,
        role: state.role,
        displayName: state.displayName,
        photoURL: state.photoURL,
      }),
      version: 1,
      skipHydration: !isBrowser,
    }
  )
);