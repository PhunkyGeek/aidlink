// ✅ components/ToastProvider.tsx
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: 'bg-white text-black dark:bg-gray-800 dark:text-white px-4 py-2 rounded shadow',
        success: {
          icon: '✅',
        },
        error: {
          icon: '❌',
        },
      }}
    />
  );
}
