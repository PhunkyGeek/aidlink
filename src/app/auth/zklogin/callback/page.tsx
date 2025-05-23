import { Suspense } from 'react';
import ZkCallbackClient from './ZkCallbackClient';

export default function ZkCallbackPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Processing ZK Login...</div>}>
      <ZkCallbackClient />
    </Suspense>
  );
}
