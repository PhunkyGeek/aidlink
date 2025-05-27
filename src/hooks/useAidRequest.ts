// hooks/useAidRequest.ts
import { useEffect, useState } from 'react';
import { SuiClient, getFullnodeUrl, type SuiObjectResponse } from '@mysten/sui/client';
import { AidRequest } from '../../types/aid-request';


const client = new SuiClient({ url: getFullnodeUrl('testnet') });

export function useAidRequest(objectId: string | undefined) {
  const [request, setRequest] = useState<AidRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!objectId) return;

    const fetchRequest = async () => {
      try {
        const res: SuiObjectResponse = await client.getObject({
          id: objectId,
          options: { showContent: true },
        });

        const content = res.data?.content;
        if (content?.dataType === 'moveObject') {
          const fields = (content as any).fields;
          const parsed: AidRequest = {
            id: objectId,
            title: fields.title,
            location: fields.location,
            category: fields.category,
            description: fields.description,
            mediaCid: fields.media_cid,
          };
          setRequest(parsed);
        }
      } catch (err) {
        console.error('Error loading aid request:', err);
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [objectId]);

  return { request, loading };
}
