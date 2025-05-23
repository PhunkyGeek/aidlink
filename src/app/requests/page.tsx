"use client";

import { useState } from 'react';
import Link from 'next/link';
import { RiEyeFill, RiExternalLinkLine } from 'react-icons/ri';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletConnect } from "@/components/WalletConnect";
import RecentAidActivity from "@/components/RecentAidActivity";

export default function RequestsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const account = useCurrentAccount();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section with Wallet Connect */}
        <section className="text-center mb-12">
          <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-700">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              {account ? 'Explore Aid Requests below' : 'Connect Your Wallet'}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              {account 
                ? 'Discover and support meaningful causes in your community'
                : 'Connect your wallet to view and contribute to aid requests'}
            </p>
            
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        </section>

        {/* Recent Aid Activity - Only shows when wallet connected */}
        {(
          <RecentAidActivity 
            refreshing={refreshing} 
            setRefreshing={setRefreshing} 
          />
        )}

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/requestall"
            className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg transition-all hover:scale-[1.02]"
          >
            <RiEyeFill className="mr-2 text-lg" />
            View All Requests
            <RiExternalLinkLine className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}