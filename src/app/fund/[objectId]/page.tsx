'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction, Commands, BuildTransactionOptions, TransactionDataBuilder } from '@mysten/sui/transactions';
import { useState } from 'react';
import { useAidRequest } from '@/hooks/useAidRequest';
import AidRequestDetails from '@/components/AidRequestDetails';
import SkeletonAidRequest from '@/components/SkeletonAidRequest';
import toast from 'react-hot-toast';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

// Simple object cache plugin for transaction building
const objectCache = new Map<string, { objectId: string; version: string; digest: string }>();
function objectCachePlugin(
  transactionData: TransactionDataBuilder,
  _options: BuildTransactionOptions,
  next: () => Promise<void>,
) {
  for (const input of transactionData.inputs) {
    if (!input.UnresolvedObject) continue;

    const cached = objectCache.get(input.UnresolvedObject.objectId);
    if (!cached) continue;

    if (cached.version && !input.UnresolvedObject.version) {
      input.UnresolvedObject.version = cached.version;
    }

    if (cached.digest && !input.UnresolvedObject.digest) {
      input.UnresolvedObject.digest = cached.digest;
    }
  }

  return next();
}

export default function FundRequestPage() {
  const { objectId } = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { request, loading } = useAidRequest(objectId as string);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFund = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!objectId || typeof objectId !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(objectId)) {
      toast.error('Invalid request ID');
      return;
    }

    const donationAmount = Number(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (!request?.title) {
      toast.error('Unable to retrieve aid request details');
      return;
    }

    if (!PACKAGE_ID) {
      toast.error('Contract configuration missing');
      return;
    }

    setSubmitting(true);

    try {
      const tx = new Transaction();
      tx.addBuildPlugin(objectCachePlugin);

      tx.add(Commands.MoveCall({
        target: `${PACKAGE_ID}::aid_vault::fund_request`,
        arguments: [tx.object(objectId), tx.pure.u64(BigInt(donationAmount * 1_000_000_000))], // Convert SUI to MIST
      }));

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
          account: currentAccount,
        },
        {
          onSuccess: () => {
            toast.success('Funding successful!');
            router.push(
              `/fund/success?amount=${donationAmount}&title=${encodeURIComponent(request.title)}`
            );
          },
          onError: (error) => {
            console.error('Funding error:', error);
            toast.error('Funding failed: ' + error.message);
          },
          onSettled: () => setSubmitting(false),
        }
      );
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed: ' + error.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-purple-400">Fund Aid Request</h1>
        <SkeletonAidRequest />
      </div>
    );
  }

  if (!request) {
    return <p className="text-center text-red-400">Request not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-purple-400">Fund Aid Request</h1>
      <AidRequestDetails request={request} />

      <label className="block text-sm font-medium text-gray-300 mb-1">
        Amount (SUI)
      </label>
      <input
        type="number"
        placeholder="e.g., 10"
        aria-label="Amount to donate"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-900 text-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-400/20 mb-4"
        min="0.01"
        step="0.01"
        disabled={submitting}
      />

      <button
        onClick={handleFund}
        disabled={submitting || !currentAccount}
        className={`w-full bg-purple-600 text-white py-2 px-4 rounded-md ${
          submitting || !currentAccount
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-purple-700'
        }`}
      >
        {submitting ? 'Processing...' : 'Fund Now'}
      </button>
    </div>
  );
}