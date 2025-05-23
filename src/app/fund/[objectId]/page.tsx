// ✅ app/fund/[objectId]/page.tsx (updated and complete)
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit';
import {
  SuiClient,
  getFullnodeUrl,
  type SuiObjectResponse,
} from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

export default function FundRequestPage() {
  const { objectId } = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [objectData, setObjectData] = useState<SuiObjectResponse | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchObject() {
      if (!objectId) return;

      try {
        const data = await client.getObject({
          id: objectId as string,
          options: { showContent: true },
        });
        setObjectData(data);
      } catch (error) {
        console.error('Error fetching object:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchObject();
  }, [objectId]);

  const handleFund = async () => {
    if (!currentAccount || !objectId || !amount) return;

    const donationAmount = Number(amount);
    if (Number.isNaN(donationAmount) || donationAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    const fields = (objectData?.data?.content as any)?.fields;
    if (!fields?.title) {
      alert('Unable to retrieve aid request details.');
      return;
    }

    setSubmitting(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: '0x<YOUR_PACKAGE_ID>::aid_vault::fund_request',
        arguments: [tx.object(objectId as string), tx.pure.u64(donationAmount)],
      });

      signAndExecuteTransaction(
        { transaction: tx, chain: 'sui:testnet' },
        {
          onSuccess: () => {
            router.push(
              `/fund/success?amount=${donationAmount}&title=${encodeURIComponent(
                fields.title
              )}`
            );
          },
          onError: () => {
            alert('Funding failed!');
          },
          onSettled: () => setSubmitting(false),
        }
      );
    } catch (err) {
      console.error('Funding error:', err);
      alert('An error occurred during funding.');
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center">Loading request...</p>;

  const content = objectData?.data?.content;
  if (!content || content.dataType !== 'moveObject') {
    return (
      <p className="text-center text-red-600">
        Invalid or unsupported object type.
      </p>
    );
  }

  const fields = (content as any).fields;
  const mediaUrl = fields.media_cid
    ? `https://${fields.media_cid}.ipfs.w3s.link`
    : null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Fund Aid Request</h1>
      <p className="text-lg font-semibold mb-1">{fields.title}</p>
      <p className="text-sm text-gray-600 mb-2">
        📍 {fields.location} | 🏷️ {fields.category}
      </p>
      {mediaUrl && (
        <img
          src={mediaUrl}
          alt="Media"
          className="w-full h-64 object-cover rounded mb-3"
        />
      )}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{fields.description}</p>

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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? 'Processing...' : 'Fund Now'}
      </button>
    </div>
  );
}
