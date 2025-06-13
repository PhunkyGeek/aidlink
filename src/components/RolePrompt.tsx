'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { setUserRole } from '@/utils/getUserRole';
import toast from 'react-hot-toast';

export function RolePrompt() {
  const { role, id } = useUserStore();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [showRolePrompt, setShowRolePrompt] = useState(false);

  useEffect(() => {
    if (role === null && id && !hasRedirected.current) {
      setShowRolePrompt(true);
    } else if (role && !hasRedirected.current) {
      hasRedirected.current = true;
      const routeMap: Record<string, string> = {
        admin: '/admin/dashboard',
        validator: '/validator-dashboard',
        recipient: '/connect-walletr',
        donor: '/connect-wallet',
      };
      const destination = routeMap[role] || '/';
      toast.success(`Logged in as ${role}. Redirecting...`);
      router.replace(destination);
    }
  }, [role, id, router]);

  const handleRoleSelection = async (selectedRole: 'donor' | 'recipient') => {
    if (!id) {
      toast.error('User ID not found');
      router.replace('/auth/error');
      return;
    }
    try {
      await setUserRole(id, selectedRole);
      useUserStore.getState().setRole(selectedRole);
      setShowRolePrompt(false);
      hasRedirected.current = true;
      const routeMap: Record<string, string> = {
        admin: '/admin/dashboard',
        validator: '/validator-dashboard',
        recipient: '/connect-walletr',
        donor: '/connect-wallet',
      };
      const destination = routeMap[selectedRole] || '/';
      toast.success(`Logged in as ${selectedRole}. Redirecting...`);
      router.replace(destination);
    } catch (err: any) {
      console.error('Error setting role:', err);
      toast.error(`Failed to set role: ${err.message}`);
      router.replace('/auth/error');
    }
  };

  return showRolePrompt ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full space-y-4 text-center shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Select your role
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This helps us personalize your experience.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleRoleSelection('donor')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Donor
          </button>
          <button
            onClick={() => handleRoleSelection('recipient')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Recipient
          </button>
        </div>
      </div>
    </div>
  ) : null;
}