'use client';

import { useEffect, useState } from 'react';
import {
  useCurrentAccount,
  useSuiClientQuery,
} from '@mysten/dapp-kit';
import Image from 'next/image';
import Link from 'next/link';

interface VaultCard {
  id: string;
  title: string;
  recipient: string;
  amount: string;
  requestId: string;
  mediaUrl?: string;
}

export default function DonationsPage() {
  const account = useCurrentAccount();
  const [vaults, setVaults] = useState<VaultCard[]>([]);
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

        const filteredVaults = data.data.filter((obj: any) =>
          obj.data?.type.includes('aid_vault::AidVault')
        );

        const formatted: VaultCard[] = filteredVaults.map((vault: any) => {
          const fields = vault.data.content.fields;
          const mediaUrl = fields?.media_cid
            ? `https://${fields.media_cid}.ipfs.w3s.link`
            : '';

          return {
            id: vault.data.objectId,
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
            <div
              key={vault.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {vault.mediaUrl && (
                <Image
                  src={vault.mediaUrl}
                  alt="Donation media"
                  width={400}
                  height={250}
                  className="rounded mb-3 object-cover"
                />
              )}
              <h2 className="text-xl font-semibold mb-1">{vault.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                🎯 Recipient: {vault.recipient}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                💰 Amount Donated: {vault.amount}
              </p>
              <Link
                href={`/fund/${vault.requestId}`}
                className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
              >
                View Aid Request
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
