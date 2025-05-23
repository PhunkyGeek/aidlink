// ✅ app/validator-dashboard/success/page.tsx
'use client';

import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function ValidatorSuccessPage() {
  useEffect(() => {
    document.title = 'Approval Success | AidLink';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Approval Successful</h1>
        <p className="text-gray-700 mb-6">
          The aid request has been successfully approved. You can continue reviewing other pending requests or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/validator-dashboard"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Return Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
