// ✅ components/AidCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getStatusLabel } from '@/utils/statusMap';

interface AidCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  media_cid?: string;
  status: number;
  linkTo?: string; // Optional override for link destination
}

export default function AidCard({
  id,
  title,
  description,
  location,
  category,
  media_cid,
  status,
  linkTo = `/fund/${id}`,
}: AidCardProps) {
  return (
    <div className="border rounded-lg shadow p-4 bg-white flex flex-col">
      {media_cid && (
        <Image
          src={`https://${media_cid}.ipfs.w3s.link`}
          alt="Aid Media"
          width={400}
          height={250}
          className="rounded mb-3 object-cover"
        />
      )}
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-gray-600 mb-1">📍 {location} • 🏷️ {category}</p>
      <p className="text-sm text-gray-500 mb-3">Status: {getStatusLabel(status)}</p>
      <p className="text-gray-700 mb-4">
        {description.length > 100 ? description.slice(0, 100) + '...' : description}
      </p>
      <Link
        href={linkTo}
        className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Fund Request
      </Link>
    </div>
  );
}
