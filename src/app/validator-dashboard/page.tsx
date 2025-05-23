'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getStatusLabel } from '@/utils/statusMap';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

type AidRequestFields = {
  title: string;
  description: string;
  media_cid: string;
  location: string;
  category: string;
  status: number;
};

export default function ValidatorDashboard() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAidRequests() {
      if (!currentAccount?.address) return;

      try {
        const res = await client.getOwnedObjects({
          owner: currentAccount.address,
          options: { showContent: true },
        });

        const filtered = res.data
          .filter((obj) => {
            const content = obj.data?.content;
            return (
              content?.dataType === 'moveObject' &&
              content.type.includes('aid_request::AidRequest') &&
              'fields' in content &&
              (content as any).fields.status === 0
            );
          })
          .map((obj) => {
            const rawContent = obj.data!.content!;
            const fields = (rawContent as any).fields as AidRequestFields;
            return {
              id: obj.data!.objectId,
              title: fields.title,
              description: fields.description,
              location: fields.location,
              category: fields.category,
              media_cid: fields.media_cid,
              status: fields.status,
            };
          });

        setRequests(filtered);
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAidRequests();
  }, [currentAccount]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!currentAccount) return;
    setSubmitting(id);

    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::aid_request::mark_${action}ed`,
      arguments: [tx.object(id)],
    });

    signAndExecuteTransaction(
      { transaction: tx, chain: 'sui:testnet' },
      {
        onSuccess: () => {
          toast.success(`Request ${action}ed successfully`);
          setRequests((prev) => prev.filter((r) => r.id !== id));
          if (action === 'approve') router.push('/validator-dashboard/success');
        },
        onError: () => toast.error(`Failed to ${action} request.`),
        onSettled: () => setSubmitting(null),
      }
    );
  };

  return (
    <ProtectedRoute allowedRoles={['validator']}>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Validator Dashboard</h1>
        {loading ? (
          <p className="text-center">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="border rounded-lg shadow p-4 bg-white flex flex-col justify-between"
              >
                {req.media_cid && (
                  <Image
                    src={`https://${req.media_cid}.ipfs.w3s.link`}
                    alt="Aid Media"
                    width={400}
                    height={250}
                    className="rounded mb-3 object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold mb-1">{req.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {req.location} • 🏷️ {req.category}
                  </p>
                  <p className="text-gray-700 mb-2">
                    {req.description.length > 100
                      ? req.description.slice(0, 100) + '...'
                      : req.description}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Status: {getStatusLabel(req.status)}
                  </p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={submitting === req.id}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={submitting === req.id}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
