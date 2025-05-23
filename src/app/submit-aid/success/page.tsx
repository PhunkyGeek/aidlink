'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, History, PlusCircle, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* <Image
        src="/aid-request-bg.png"
        alt="Success Background"
        fill
        priority
        className="absolute object-cover z-0"
      /> */}

      <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
          className="w-full max-w-2xl bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-700"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: 1, duration: 0.6 }}
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            </motion.div>
            
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Request Submitted!
              </h1>
              <p className="text-gray-300 text-base sm:text-lg max-w-md mx-auto">
                Your aid request has been successfully submitted and is pending approval.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              <button
                onClick={() => router.push('/connect-walletr')}
                className="flex items-center justify-center gap-2 bg-black hover:bg-black-700 text-white px-4 py-3 sm:px-5 sm:py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => router.push('/submit-aid')}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 sm:px-5 sm:py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                <span>New Request</span>
              </button>

              <button
                onClick={() => router.push('/my-requests')}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 sm:px-5 sm:py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 sm:col-span-2 lg:col-span-1"
              >
                <History className="w-5 h-5" />
                <span>View History</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}