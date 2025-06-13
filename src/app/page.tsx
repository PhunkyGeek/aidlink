'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RiLoginBoxLine, RiUserHeartLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import { initiateZkLogin } from '@/lib/zkLogin';

function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="animate-grow-shrink">
        <Image
          src="/navbar-logo.png"
          alt="AidLink Logo"
          width={200}
          height={200}
          className="object-contain"
        />
      </div>
      <style jsx>{`
        .animate-grow-shrink {
          animation: growShrink 2s ease-in-out infinite;
        }
        @keyframes growShrink {
          0%, 100% {
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const { id, role } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (id && role) {
      if (role === 'donor') {
        router.replace('/connect-wallet');
      } else if (role === 'recipient') {
        router.replace('/connect-walletr');
      }
    }
  }, [id, role, router]);

  return (
    <div className="relative h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Loader */}
      <Loader />

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/studio-bg.jpg"
          alt="Studio background"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-8 md:px-12 lg:px-16 pt-8 sm:pt-12 md:pt-16">
        <div className="bg-black/50 backdrop-blur-xs rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
            AidLink
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8">
            Community-Powered Aid. On Chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              href="/auth/register"
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-purple-800 transition flex items-center justify-center gap-2"
            >
              <RiUserHeartLine className="text-xl" />
              Become a Donor/Recipient
            </Link>
            <Link
              href="/auth/login"
              className="flex-1 border border-white text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-white hover:text-black transition flex items-center justify-center gap-2"
            >
              <RiLoginBoxLine className="text-xl" />
              Already a Donor/Recipient
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="relative z-10 flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 py-4 text-sm text-white mt-auto">
        <Link href="/" className="hover:underline">
          Skip
        </Link>
        <button
          onClick={async () => {
            try {
              await initiateZkLogin();
            } catch (error) {
              toast.error(`Failed to initiate zkLogin: ${String(error)}`);
            }
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition"
        >
          Sign In
        </button>
      </footer>
    </div>
  );
}