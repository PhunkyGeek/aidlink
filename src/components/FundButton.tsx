// src/components/FundButton.tsx
import { useUserStore } from '@/store/useUserStore';
import { fundAid } from '@/lib/contracts';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

export function FundButton({ aidId, amount }: { aidId: string; amount: number }) {
  const { address } = useUserStore();
  const [isFunding, setIsFunding] = useState(false);

  const handleFund = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }
    setIsFunding(true);
    try {
      await fundAid({ aidId, amount, walletAddress: address });
      toast.success('Aid funded successfully!');
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <Button onClick={handleFund} disabled={isFunding}>
      {isFunding ? <Spinner size="sm" /> : 'Fund'}
    </Button>
  );
}