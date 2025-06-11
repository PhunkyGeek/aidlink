import { useSignTransaction, useSuiClient } from '@mysten/dapp-kit';
import { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import toast from 'react-hot-toast';

export function useTransactionExecution() {
  const client = useSuiClient();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const executeTransaction = async (txb: Transaction): Promise<SuiTransactionBlockResponse> => {
    try {
      const signature = await signTransaction({ transaction: txb });
      const res = await client.executeTransactionBlock({
        transactionBlock: signature.bytes,
        signature: signature.signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      toast.success('Successfully executed transaction!');
      return res;
    } catch (e: any) {
      toast.error(`Failed to execute transaction: ${e.message}`);
      throw e;
    }
  };

  return executeTransaction;
}