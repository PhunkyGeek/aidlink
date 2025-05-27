// app/fund/[objectId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { useAidRequest } from '@/hooks/useAidRequest';
import AidRequestDetails from '@/components/AidRequestDetails';
import SkeletonAidRequest from '@/components/SkeletonAidRequest';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;

export default function FundRequestPage() {
  const { objectId } = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const { request, loading } = useAidRequest(objectId as string);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFund = async () => {
    if (!currentAccount || !objectId || !amount) return;

    const donationAmount = Number(amount);
    if (Number.isNaN(donationAmount) || donationAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    if (!request?.title) {
      alert('Unable to retrieve aid request details.');
      return;
    }

    setSubmitting(true);

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::aid_vault::fund_request`,
      arguments: [tx.object(objectId as string), tx.pure.u64(donationAmount)],
    });

    signAndExecuteTransaction(
      { transaction: tx, chain: 'sui:testnet' },
      {
        onSuccess: () => {
          router.push(
            `/fund/success?amount=${donationAmount}&title=${encodeURIComponent(
              request.title
            )}`
          );
        },
        onError: () => alert('Funding failed!'),
        onSettled: () => setSubmitting(false),
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Fund Aid Request</h1>
        <SkeletonAidRequest />
      </div>
    );
  }
  if (!request) return <p className="text-center text-red-600">Request not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Fund Aid Request</h1>
      <AidRequestDetails request={request} />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Amount (SUI)
      </label>
      <input
        type="number"
        placeholder="e.g., 10"
        aria-label="Amount to donate"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border p-2 rounded mb-4"
        min="0.01"
        step="0.01"
        disabled={submitting}
      />

      <button
        onClick={handleFund}
        disabled={submitting}
        className={`w-full bg-purple-600 text-white py-2 px-4 rounded ${
          submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
        }`}
      >
        {submitting ? "Processing..." : "Fund Now"}
      </button>
    </div>
  );
}
