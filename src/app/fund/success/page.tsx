import { Suspense } from 'react';
import FundSuccessClient from './FundSuccessClient';

export default function FundSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <FundSuccessClient />
    </Suspense>
  );
}
