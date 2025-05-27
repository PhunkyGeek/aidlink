import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { initiateZkLogin } from '@/lib/zkLogin';

export function useZkLoginHandler() {
  const [zkLoading, setZkLoading] = useState(false);

  const handleZkLogin = async (role: string | null) => {
    const toastId = toast.loading('Redirecting to Sui Wallet...');
    setZkLoading(true);
    try {
      await initiateZkLogin(); // Will redirect
    } catch (err) {
      toast.error('zkLogin failed.');
      console.error(err);
    } finally {
      toast.dismiss(toastId);
      setZkLoading(false);
    }
  };

  return { zkLoading, handleZkLogin };
}
