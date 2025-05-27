'use client';

import { useEffect, useState } from 'react';
import {
  useCurrentAccount,
  useSuiClientQuery,
} from '@mysten/dapp-kit';
import type { VaultCardProps as VaultCardData } from '@/components/VaultCard';
import VaultCard from '@/components/VaultCard';

// Type for a raw on-chain object
interface SuiObjectData {
  data?: {
    objectId: string;
    type: string;
    content: {
      fields: {
        title: string;
        recipient: string;
        amount: string;
        request_id: string;
        media_cid?: string;
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
    const fetchData = async () => {
      try {
        if (!data?.data) return;

        const filteredVaults = (data.data as SuiObjectData[]).filter(
          (obj) => obj.data?.type.includes('aid_vault::AidVault')
        );

        const formatted: VaultCardData[] = filteredVaults.map((vault) => {
          const fields = vault.data!.content.fields;
          const mediaUrl = fields.media_cid
            ? `https://${fields.media_cid}.ipfs.w3s.link`
            : '';

          return {
            id: vault.data!.objectId,
            title: fields.title,
            recipient: fields.recipient,
            amount: fields.amount,
            requestId: fields.request_id,
            mediaUrl,
          };
        });

        setVaults(formatted);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch your donations.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">My Donations</h1>

      {loading || isLoading ? (
        <p className="text-center">Loading donations...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : vaults.length === 0 ? (
        <p className="text-center">You haven’t made any donations yet.</p>
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
