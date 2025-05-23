'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function FundSuccessClient() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');
  const title = searchParams.get('title');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Donation Successful | AidLink';
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I just donated on AidLink!',
          text: `I supported "${title}" with ${amount} SUI on AidLink. Join me in making a difference!`,
          url: window.location.origin + '/requests',
        });
      } catch (err) {
        console.warn('Share dismissed or failed:', err);
      }
    } else {
      alert('Sharing is not supported on this device.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <div className="max-w-xl mx-auto p-6 text-center bg-white shadow-lg rounded-xl animate-fade-in">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Thank You!</h1>
        <p className="text-lg text-gray-700 mb-4">
          You successfully donated <strong>{amount} SUI</strong> to <em>{title}</em>. Your support is deeply appreciated.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/requests"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            View More Requests
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Return Home
          </Link>
          <button
            onClick={handleShare}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Share
          </button>
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
