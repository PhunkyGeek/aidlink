'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import VaultCard from '@/components/VaultCard';
import { doc, Firestore, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// import { getStatusLabel } from '@/utils/statusMap';

interface VaultCardData {
  id: string;
  title: string;
  description: string;
  recipientAddress: string;
  amount: number;
  totalFunded: number;
  requestId: string;
  mediaCid?: string;
  location: string;
  category: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Funded' | 'Completed' | 'Error';
  suiObjectId: string | null;
}

interface SuiObjectData {
  data?: {
    objectId: string;
    type: string;
    content: {
      fields: {
        title: string;
        description: string;
        recipient: string;
        amount: number;
        total_funded: number;
        request_id: string;
        media_cid?: string;
        location: string;
        category: string;
        status: number;
      };
    };
  };
}

export default function DonationsPage() {
  const account = useCurrentAccount();
  const [vaults, setVaults] = useState<VaultCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data, isLoading } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address || '',
    options: { showContent: true },
  });

  useEffect(() => {
    const fetchVaultsAndMetadata = async () => {
      if (!db) {
        console.warn('Firestore is not initialized.');
        setError('Unable to fetch donations. Please try again later.');
        setLoading(false);
        return;
      }

      if (!data?.data) {
        setLoading(false);
        return;
      }

      try {
        const filteredVaults = (data.data as SuiObjectData[]).filter(
          (obj) => obj.data?.type.includes('aid_vault::AidVault')
        );

        const statusMap: Record<number, VaultCardData['status']> = {
          0: 'Pending',
          1: 'Approved',
          2: 'Rejected',
          3: 'Funded',
          4: 'Completed',
        };

        const formattedVaults: VaultCardData[] = await Promise.all(
          filteredVaults.map(async (vault) => {
            const fields = vault.data!.content.fields;

            // Fetch metadata from Firestore
            let metadata: Partial<VaultCardData> = {};
            try {
              const requestDoc = await getDoc(doc(db as Firestore, 'requests', fields.request_id));
              if (requestDoc.exists()) {
                const docData = requestDoc.data();
                metadata = {
                  title: docData.title,
                  description: docData.description,
                  mediaCid: docData.mediaCid,
                  category: docData.category,
                  location: docData.location,
                  suiObjectId: docData.suiObjectId,
                };
              }
            } catch (err) {
              console.warn('Metadata fetch failed for request:', fields.request_id, err);
            }

            return {
              id: fields.request_id,
              title: metadata.title || fields.title || 'Untitled',
              description: metadata.description || fields.description || 'No description provided.',
              recipientAddress: fields.recipient,
              amount: fields.amount / 1_000_000_000, // Convert MIST to SUI
              totalFunded: (fields.total_funded ?? 0) / 1_000_000_000, // Convert MIST to SUI
              requestId: fields.request_id,
              mediaCid: metadata.mediaCid || fields.media_cid,
              location: metadata.location || fields.location || 'Unknown',
              category: metadata.category || fields.category || 'Uncategorized',
              status: statusMap[fields.status] || 'Error',
              suiObjectId: metadata.suiObjectId || null,
            };
          })
        );

        setVaults(formattedVaults);
      } catch (err) {
        console.error('Error fetching vaults:', err);
        setError('Failed to fetch your donations.');
      } finally {
        setLoading(false);
      }
    };

    fetchVaultsAndMetadata();
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-100">My Donations</h1>

      {loading || isLoading ? (
        <div className="text-center text-gray-400">Loading donations...</div>
      ) : error ? (
        <div className="text-center text-red-400">{error}</div>
      ) : vaults.length === 0 ? (
        <div className="text-center text-gray-400">You haven’t made any donations yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <VaultCard key={vault.id} {...vault} />
          ))}
        </div>
      )}
    </div>
  );
}