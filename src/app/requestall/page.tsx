'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStatusLabel } from '@/utils/statusMap';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/Navbar/SearchBar';
import { RiFileSearchFill, RiSearch2Fill, RiSearchFill, RiSearchLine, RiWallet3Fill } from 'react-icons/ri';

// Replace this with your actual fetch function
async function fetchAidRequests() {
  const res = await fetch('/api/requests'); // update if using Sui query
  if (!res.ok) throw new Error('Failed to fetch aid requests');
  return res.json();
}

export default function AidRequestPage() {
  const { data: requests = [], isLoading, isError, error } = useQuery({
    queryKey: ['aid-requests'],
    queryFn: fetchAidRequests,
  });

  const [search, setSearch] = useState('');

  const filteredRequests = requests.filter((req: any) => {
    const fields = req.data?.content?.fields || {};
    const query = search.toLowerCase();
    return (
      fields.title?.toLowerCase().includes(query) ||
      fields.location?.toLowerCase().includes(query) ||
      fields.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50 dark:bg-[#0c0c0c]">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600 dark:text-white">
        Aid Requests
      </h1>

      {/* Search Bar */}
      <div className="mb-8">
        <StandaloneSearchBar search={search} setSearch={setSearch} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-purple-500">Loading requests...</span>
        </div>
      ) : isError ? (
        <p className="text-center text-red-600">
          {error?.message || 'Failed to fetch requests.'}
        </p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-center text-gray-500">
          No matching aid requests found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req: any, index: number) => {
            const fields = req.data?.content?.fields || {};
            const cid = fields.media_cid;
            const mediaUrl = cid ? `https://${cid}.ipfs.w3s.link` : null;
            const status = fields.status;

            return (
              <div
                key={index}
                className="border rounded-lg shadow p-4 bg-white dark:bg-gray-900 flex flex-col"
              >
                {mediaUrl && (
                  <Image
                    src={mediaUrl}
                    alt="Aid Media"
                    width={400}
                    height={250}
                    className="rounded mb-3 object-cover"
                  />
                )}
                <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                  {fields.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  📍 {fields.location} • 🏷️ {fields.category}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Status: {getStatusLabel(status)}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {fields.description?.length > 100
                    ? fields.description.slice(0, 100) + '...'
                    : fields.description}
                </p>
                <Link
                  href={`/fund/${req.data.objectId}`}
                  className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Fund Request
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 🔍 Standalone Search Bar with props
function StandaloneSearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (val: string) => void;
}) {
  return (
    <div className="relative flex items-center justify-center w-full max-w-lg mx-auto">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title, location or category..."
        className="pl-10 pr-4 py-2 w-full rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500"
      />
      <RiSearchLine className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" size={18} />
    </div>
  );
}
