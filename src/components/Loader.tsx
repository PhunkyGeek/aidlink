'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true); // Start fade-out
      setTimeout(() => setIsVisible(false), 500); // Match fade-out duration
    }, 10000); // 10 seconds

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