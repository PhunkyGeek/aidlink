'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiEyeFill, RiExternalLinkLine } from 'react-icons/ri';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { auth, db } from '@/lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { WalletConnect } from '@/components/WalletConnect';
import RecentAidActivity from '@/components/RecentAidActivity';
import { getStatusLabel } from '@/utils/statusMap';
import Image from 'next/image';
import { Clock, CheckCircle, DollarSign, MapPin, FileText } from 'lucide-react';
import { AidRequest } from '../../../types/aid-request';

export default function RequestsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const account = useCurrentAccount();
  const router = useRouter();

  // Fetch all approved requests
  useEffect(() => {
    if (!db) {
      toast.error('Firestore database is not initialized');
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      try {
        if (!db) {
          throw new Error('Firestore database is not initialized');
        }
        const requestsQuery = query(
          collection(db, 'requests'),
          where('status', '==', getStatusLabel(1)) // Filter for Approved status
        );
        const querySnapshot = await getDocs(requestsQuery);
        const requestsData: AidRequest[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            requestId: data.requestId,
            recipientId: data.recipientId,
            recipientAddress: data.recipientAddress,
            title: data.title,
            description: data.description,
            mediaCid: data.mediaCid || '',
            location: data.location || '',
            category: data.category || '',
            amount: data.amount,
            totalFunded: data.totalFunded,
            status: data.status,
            suiObjectId: data.suiObjectId,
            suiTransactionDigest: data.suiTransactionDigest,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          };
        });
        setRequests(requestsData);
      } catch (error: any) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load requests: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [db]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth || !db) {
      toast.error('Firebase not initialized');
      // router.push('/login');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || !account) {
        toast.error('Please connect wallet to fund request');
        // router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [account, router]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'funded':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = (funded: number, amount: number) => {
    return Math.min(Math.round((funded / amount) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section with Wallet Connect */}
        <section className="text-center mb-12">
          <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-700">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              {account ? 'Explore Aid Requests' : 'Connect Your Wallet'}
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

        {/* Recent Aid Activity */}
        {account && (
          <RecentAidActivity refreshing={refreshing} setRefreshing={setRefreshing} />
        )}

        {/* Requests List */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Approved Aid Requests</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No approved requests found</h3>
              <p className="text-gray-500 mt-1">Check back later for new opportunities to contribute</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  {request.mediaCid && (
                    <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
                      <Image
                        src={`https://ipfs.io/ipfs/${request.mediaCid}`}
                        alt={request.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                  )}
                  <h3 className="font-medium text-lg mb-2">{request.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(request.status)}
                    <span className="text-sm capitalize">{request.status}</span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {request.location || 'N/A'}
                    </p>
                    <p className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {request.category || 'N/A'}
                    </p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {request.totalFunded.toLocaleString()} / {request.amount.toLocaleString()} SUI
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{
                          width: `${getProgressPercentage(request.totalFunded, request.amount)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {getProgressPercentage(request.totalFunded, request.amount)}% funded
                    </p>
                  </div>
                  <Link
                    href={`/requests/${request.id}`}
                    className="mt-4 inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    View Details
                    <RiExternalLinkLine className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

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