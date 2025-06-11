import Image from 'next/image';
import { BaseAidRequest } from '../../types/aid-request';

export default function AidRequestDetails({ request }: { request: BaseAidRequest }) {
  const mediaUrl = request.mediaCid
    ? `https://${request.mediaCid}.ipfs.w3s.link`
    : null;

  return (
    <div className="mb-6">
      <p className="text-lg font-semibold mb-1 text-gray-100">{request.title || 'Untitled'}</p>
      <p className="text-sm text-gray-400 mb-2">
        📍 {request.location || 'Unknown'} | 🏷️ {request.category || 'Uncategorized'}
      </p>
      {mediaUrl && (
        <Image
          src={mediaUrl}
          alt={`Media for ${request.title || 'Aid Request'}`}
          className="w-full h-64 object-cover rounded mb-3"
          width={640}
          height={256}
        />
      )}
      <p className="text-gray-300 mb-4 whitespace-pre-wrap">{request.description || 'No description provided'}</p>
    </div>
  );
}