import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserState {
  address: string | null;
  role: 'donor' | 'recipient' | 'validator' | 'admin' | null;
  displayName?: string | null;
  photoURL?: string | null;
  setAddress: (address: string | null) => void;
  setRole: (role: UserState['role']) => void;
  setProfile: (name: string | null, photo: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      address: null,
      role: null,
      displayName: null,
      photoURL: null,
      setAddress: (address) => set({ address }),
      setRole: (role) => set({ role }),
      setProfile: (name, photo) => set({ displayName: name, photoURL: photo }),
      clearUser: () => set({ address: null, role: null, displayName: null, photoURL: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        address: state.address,
        role: state.role,
        displayName: state.displayName,
        photoURL: state.photoURL,
      }),
    }
  )
);
