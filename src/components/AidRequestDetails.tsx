// components/AidRequestDetails.tsx
import Image from 'next/image';
import { AidRequest } from '../../types/aid-request';

export default function AidRequestDetails({ request }: { request: AidRequest }) {
  const mediaUrl = request.mediaCid
    ? `https://${request.mediaCid}.ipfs.w3s.link`
    : null;

  return (
    <>
      <p className="text-lg font-semibold mb-1">{request.title}</p>
      <p className="text-sm text-gray-600 mb-2">
        📍 {request.location} | 🏷️ {request.category}
      </p>
      {mediaUrl && (
        <Image
          src={mediaUrl}
          alt="Aid Request Media"
          className="w-full h-64 object-cover rounded mb-3"
          width={640}
          height={256}
        />
      )}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{request.description}</p>
    </>
  );
}
