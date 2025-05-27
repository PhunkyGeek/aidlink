import Image from 'next/image';
import Link from 'next/link';

export interface VaultCardProps {
  id: string;
  title: string;
  recipient: string;
  amount: string;
  requestId: string;
  mediaUrl?: string;
}

export default function VaultCard({
  id,
  title,
  recipient,
  amount,
  requestId,
  mediaUrl,
}: VaultCardProps) {
  return (
    <div
      key={id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {mediaUrl && (
        <Image
          src={mediaUrl}
          alt="Donation media"
          width={400}
          height={250}
          unoptimized
          className="rounded mb-3 object-cover"
        />
      )}
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        🎯 Recipient: {recipient}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        💰 Amount Donated: {Number(amount) / 1_000_000} SUI
      </p>
      <Link
        href={`/fund/${requestId}`}
        className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
      >
        View Aid Request
      </Link>
    </div>
  );
}
