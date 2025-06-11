'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction, Commands, BuildTransactionOptions, TransactionDataBuilder } from '@mysten/sui/transactions';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getStatusLabel } from '@/utils/statusMap';
import { Spinner } from '@/components/ui/Spinner';
import { SuiAidRequest } from '../../../types/aid-request';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

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

export default function ValidatorDashboard() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [requests, setRequests] = useState<SuiAidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const requestsPerPage = 9;
  const router = useRouter();

  useEffect(() => {
    if (!PACKAGE_ID) {
      toast.error('Configuration error: Package ID is not defined.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchAidRequests() {
      if (!currentAccount?.address || !PACKAGE_ID) {
        setLoading(false);
        return;
      }

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
            const fields = (rawContent as any).fields;
            return {
              id: obj.data!.objectId,
              title: fields.title || '',
              description: fields.description || '',
              location: fields.location || '',
              category: fields.category || '',
              mediaCid: fields.media_cid || undefined,
              status: fields.status ?? 0,
            } as SuiAidRequest;
          });

        setRequests(filtered);
        setTotalPages(Math.ceil(filtered.length / requestsPerPage));
      } catch (err) {
        console.error('Error fetching requests:', err);
        const errorMessage = err instanceof Error && err.message.includes('network')
          ? 'Network error: Unable to connect to the blockchain.'
          : 'Failed to fetch aid requests. Please try again.';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchAidRequests();
  }, [currentAccount]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!currentAccount) {
      toast.error('Please connect your wallet.');
      return;
    }
    if (!PACKAGE_ID) {
      toast.error('Invalid configuration: Package ID missing.');
      return;
    }
    if (!/^0x[0-9a-fA-F]{64}$/.test(id)) {
      toast.error('Invalid request ID.');
      return;
    }

    setSubmitting({ id, action });

    try {
      const tx = new Transaction();
      tx.addBuildPlugin(objectCachePlugin);

      tx.add(Commands.MoveCall({
        target: `${PACKAGE_ID}::aid_request::mark_${action}ed`,
        arguments: [tx.object(id)],
      }));

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
          account: currentAccount,
        },
        {
          onSuccess: () => {
            toast.success(`Request ${action}ed successfully`);
            setRequests((prev) => prev.filter((r) => r.id !== id));
            setTotalPages(Math.ceil((requests.length - 1) / requestsPerPage));
            if (action === 'approve') router.push('/validator-dashboard/success');
          },
          onError: (error) => {
            const errorMessage = error.message.includes('Rejected')
              ? `Transaction rejected by wallet: ${error.message}`
              : `Failed to ${action} request: ${error.message}`;
            toast.error(errorMessage);
          },
          onSettled: () => setSubmitting(null),
        }
      );
    } catch (err) {
      console.error(`Error during ${action}:`, err);
      toast.error(`Unexpected error during ${action}: ${(err as Error).message}`);
      setSubmitting(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const paginatedRequests = requests.slice(
    (page - 1) * requestsPerPage,
    page * requestsPerPage
  );

  return (
    <ProtectedRoute allowedRoles={['validator']}>
      <div className="max-w-6xl mx-auto p-6 bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Validator Dashboard</h1>
        {loading ? (
          <div className="flex justify-center">
            <Spinner size="lg" className="text-gray-400" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-400">No pending requests.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-700 rounded-lg shadow p-4 bg-gray-800 flex flex-col justify-between"
                  role="article"
                  aria-labelledby={`request-title-${req.id}`}
                >
                  {req.mediaCid && (
                    <Image
                      src={`https://${req.mediaCid}.ipfs.w3s.link`}
                      alt={`Media for ${req.title}`}
                      width={400}
                      height={250}
                      className="rounded mb-3 object-cover"
                    />
                  )}
                  <div>
                    <h2
                      id={`request-title-${req.id}`}
                      className="text-xl font-semibold mb-1 text-gray-100"
                    >
                      {req.title}
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                      📍 {req.location || 'Unknown'} • 🏷️ {req.category || 'Uncategorized'}
                    </p>
                    <p className="text-gray-300 mb-2">
                      {req.description && req.description.length > 100
                        ? req.description.slice(0, 100) + '...'
                        : req.description || 'No description provided'}
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Status: {getStatusLabel(req.status)}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleAction(req.id, 'approve')}
                      onKeyDown={(e) => e.key === 'Enter' && handleAction(req.id, 'approve')}
                      disabled={submitting?.id === req.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                      aria-label={`Approve request ${req.title}`}
                    >
                      {submitting?.id === req.id && submitting.action === 'approve' ? (
                        <Spinner size="sm" className="text-white" />
                      ) : (
                        'Approve'
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'reject')}
                      onKeyDown={(e) => e.key === 'Enter' && handleAction(req.id, 'reject')}
                      disabled={submitting?.id === req.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                      aria-label={`Reject request ${req.title}`}
                    >
                      {submitting?.id === req.id && submitting.action === 'reject' ? (
                        <Spinner size="sm" className="text-white" />
                      ) : (
                        'Reject'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-100">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}