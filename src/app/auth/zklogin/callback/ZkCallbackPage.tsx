'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { handleZkLoginCallback } from '@/lib/zkLogin';
import { RolePrompt } from '@/components/RolePrompt';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

export default function ZkCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id, email, setRole } = useUserStore((state) => ({
    id: state.id,
    email: state.email,
    setRole: state.setRole,
  }));
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function processCallback() {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const token = params.get('id_token');
      const state = params.get('state');
      const redirect = searchParams.get('redirect') || '/';

      if (!token) {
        toast.error('No id_token found in zkLogin callback');
        router.replace('/auth/error');
        setIsProcessing(false);
        return;
      }

      let userId: string | undefined;
      let emailParam: string | undefined;

      if (state) {
        try {
          const stateObj = JSON.parse(state);
          userId = stateObj.userId;
          emailParam = stateObj.email;
        } catch (err) {
          console.warn('Failed to parse state:', err);
        }
      }

      try {
        const { role } = await handleZkLoginCallback({
          token,
          userId: userId || id,
          email: emailParam || email,
        });

        if (role) {
          setRole(role);
          const routeMap: Record<string, string> = {
            admin: '/admin/dashboard',
            validator: '/validator-dashboard',
            recipient: '/connect-walletr',
            donor: '/connect-wallet',
          };
          const destination = routeMap[role] || redirect;
          toast.success('zkLogin successful');
          router.replace(destination);
        } else {
          setIsProcessing(false); // RolePrompt will handle redirect
        }
      } catch (err: any) {
        console.error('zkLogin error:', err);
        toast.error(`zkLogin failed: ${err.message}`);
        router.replace('/auth/error');
        setIsProcessing(false);
      }
    }

    processCallback();
  }, [searchParams, router, id, email, setRole]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      {isProcessing && (
        <div className="text-center text-gray-100">
          <Spinner size="lg" className="text-purple-400 mb-2" />
          <p>Verifying zkLogin...</p>
        </div>
      )}
      <RolePrompt />
    </div>
  );
}