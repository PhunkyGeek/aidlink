import { useEffect, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SuiAidRequest } from '../../types/aid-request';
import { Timestamp } from 'firebase/firestore';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

export function useAidRequest(objectId: string | undefined) {
  const [request, setRequest] = useState<SuiAidRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!objectId) {
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      try {
        const res = await client.getObject({
          id: objectId,
          options: { showContent: true },
        });

        const content = res.data?.content;
        if (content?.dataType === 'moveObject') {
          const fields = (content as any).fields;
          const parsed: SuiAidRequest = {
            id: objectId,
            title: fields.title || '',
            location: fields.location || '',
            category: fields.category || '',
            description: fields.description || '',
            mediaCid: fields.media_cid || undefined,
            status: fields.status ?? 0,
          };
          setRequest(parsed);
        } else {
          setRequest(null);
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