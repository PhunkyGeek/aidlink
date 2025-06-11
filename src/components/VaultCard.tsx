'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FileText, CheckCircle, DollarSign, MapPin } from 'lucide-react';
import { AidRequest } from '../../types/aid-request';

interface VaultCardProps extends Omit<AidRequest, 'createdAt' | 'updatedAt' | 'recipientId' | 'suiTransactionDigest'> {}

export default function VaultCard({
  id,
  title,
  description,
  recipientAddress,
  amount,
  totalFunded,
  requestId,
  mediaCid,
  location,
  category,
  status,
}: VaultCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'funded':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = (funded: number, amount: number) => {
    return Math.min(Math.round((funded / amount) * 100), 100);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 flex flex-col">
      {mediaCid && (
        <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
          <Image
            src={`https://ipfs.io/ipfs/${mediaCid}`}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.jpg';
            }}
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2 text-gray-100">{title}</h2>

      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon(status)}
        <span className="text-sm capitalize text-gray-300">{status}</span>
      </div>

      {description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{description}</p>
      )}

      <div className="text-sm text-gray-400 space-y-1 mb-3">
        <p className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {location || 'N/A'}
        </p>
        <p className="flex items-center gap-1">
          <FileText className="w-3 h-3" /> {category || 'N/A'}
        </p>
        <p className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {totalFunded.toLocaleString()} / {amount.toLocaleString()} SUI
        </p>
      </div>

      <div className="mt-2">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{
              width: `${getProgressPercentage(totalFunded, amount)}%`,
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {getProgressPercentage(totalFunded, amount)}% funded
        </p>
      </div>

      <Link
        href={`/requests/${id}`}
        className="mt-auto inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center transition-all"
      >
        View Aid Request
      </Link>
    </div>
  );
}
