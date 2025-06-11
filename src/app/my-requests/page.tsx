'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  MapPin,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Firestore, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useUserStore } from '@/store/useUserStore';

// Define AidRequest interface to match the reference schema
interface AidRequest {
  id: string;
  requestId: string;
  recipientId: string;
  recipientAddress: string;
  title: string;
  description: string;
  mediaCid: string;
  location: string;
  category: string;
  amount: number;
  totalFunded: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Funded' | 'Completed' | 'Error';
  suiObjectId: string | null;
  suiTransactionDigest: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  requesterName?: string;
  flagged?: boolean;
}

export default function MyRequestsPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { id, address, role } = useUserStore();
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  // Validate authentication and role
  useEffect(() => {
    if (!db) {
      toast.error('Firebase not initialized');
      router.push('/login');
      return;
    }

    if (!id && !address || !currentAccount || role !== 'recipient') {
      toast.error('Please connect a wallet');
      router.push('/login');
      return;
    }

    // Fetch requests
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const identifiers = [id, address].filter(Boolean) as string[];
        if (identifiers.length === 0) {
          throw new Error('No user identifier available');
        }
        const requestsQuery = query(
          collection(db as Firestore, 'requests'),
          where('recipientId', 'in', identifiers)
        );
        const querySnapshot = await getDocs(requestsQuery);
        const requestsData: AidRequest[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Validate and convert Timestamp to Date
          const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now();
          const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now();
          return {
            id: doc.id,
            requestId: data.requestId || '',
            recipientId: data.recipientId || '',
            recipientAddress: data.recipientAddress || '',
            title: data.title || 'Untitled',
            description: data.description || '',
            mediaCid: data.mediaCid || '',
            location: data.location || '',
            category: data.category || '',
            amount: Number(data.amount) || 0,
            totalFunded: Number(data.totalFunded) || 0,
            status: data.status || 'Pending',
            suiObjectId: data.suiObjectId || null,
            suiTransactionDigest: data.suiTransactionDigest || null,
            createdAt,
            updatedAt,
            requesterName: data.requesterName || undefined,
            flagged: data.flagged || false,
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
  }, [id, address, role, currentAccount, router]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || request.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'pending':
        return <Clock className='w-4 h-4 text-yellow-500' />;
      case 'rejected':
        return <AlertCircle className='w-4 h-4 text-red-500' />;
      case 'funded':
        return <DollarSign className='w-4 h-4 text-purple-500' />;
      case 'completed':
        return <CheckCircle className='w-4 h-4 text-teal-500' />;
      case 'error':
        return <AlertCircle className='w-4 h-4 text-orange-500' />;
      default:
        return <FileText className='w-4 h-4 text-gray-400' />;
    }
  };

  const getProgressPercentage = (funded: number, amount: number) => {
    return amount > 0 ? Math.min(Math.round((funded / amount) * 100), 100) : 0;
  };

  const formatDate = (timestamp: Timestamp | null): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        <header className='mb-8'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3'>
            <FileText className='w-8 h-8 text-purple-400' />
            My Aid Requests
          </h1>
          <p className='text-gray-400'>
            View and manage all your submitted aid requests
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-gray-800 rounded-xl p-5 border-l-4 border-purple-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Total Requests</p>
                <p className='text-2xl font-bold'>{requests.length}</p>
              </div>
              <FileText className='w-8 h-8 text-purple-400' />
            </div>
          </div>
          <div className='bg-gray-800 rounded-xl p-5 border-l-4 border-green-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Approved</p>
                <p className='text-2xl font-bold'>
                  {requests.filter((r) => r.status === 'Approved').length}
                </p>
              </div>
              <CheckCircle className='w-8 h-8 text-green-400' />
            </div>
          </div>
          <div className='bg-gray-800 rounded-xl p-2 py-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Pending</p>
                <p className='text-2xl font-bold'>
                  {requests.filter((r) => r.status === 'Pending').length}
                </p>
              </div>
              <Clock className='w-2 h-2' />
            </div>
          </div>
          <div className='bg-gray-800 rounded-xl p-5 border-l-4 border-red-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Rejected</p>
                <p className='text-2xl font-bold'>
                  {requests.filter((r) => r.status === 'Rejected').length}
                </p>
              </div>
              <AlertCircle className='w-8 h-8 text-red-400' />
            </div>
          </div>
        </div>

        <div className='bg-gray-800 rounded-xl p-4 mb-8'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search requests'
                className='w-full bg-gray-900 text-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className='flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2'>
              <Filter className='text-gray-400' />
              <select
                name='status-filter'
                className='bg-transparent text-gray-100 focus:outline-none text-sm'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='approved'>Approved</option>
                <option value='rejected'>Rejected</option>
                <option value='funded'>Funded</option>
                <option value='completed'>Completed</option>
                <option value='error'>Error</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className='text-center py-12'>
            <FileText className='mx-auto w-12 h-12 text-gray-500 mb-4' />
            <h3 className='text-lg font-medium text-gray-300'>
              No requests found
            </h3>
            <p className='text-gray-500 mt-1'>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => router.push('/submit-aid')}
              className='mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2'
            >
              <PlusCircle className='w-5 h-5' />
              Submit New Request
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className='bg-gray-800 rounded-xl overflow-hidden border border-gray-700 transition-all duration-200 hover:border-gray-600'
              >
                <div
                  className='p-4 sm:p-6 cursor-pointer flex justify-between items-center'
                  onClick={() => toggleExpand(request.id)}
                >
                  <div className='flex items-center gap-4'>
                    {request.mediaCid && (
                      <div className='hidden sm:block relative h-16 w-16 rounded-lg overflow-hidden'>
                        <Image
                          src={`https://ipfs.io/ipfs/${request.mediaCid}`}
                          alt={request.title}
                          fill
                          className='object-cover'
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium text-lg'>{request.title}</h3>
                        {getStatusIcon(request.status)}
                      </div>
                      <div className='flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400'>
                        <span className='flex items-center gap-1'>
                          <MapPin className='w-3 h-3' />
                          {request.location || 'N/A'}
                        </span>
                        <span className='flex items-center gap-1'>
                          <FileText className='w-3 h-3' />
                          {request.category || 'N/A'}
                        </span>
                        <span className='flex items-center gap-1'>
                          <DollarSign className='w-3 h-3' />
                          {request.totalFunded.toLocaleString()} /{' '}
                          {request.amount.toLocaleString()} SUI
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='text-gray-400'>
                    {expandedRequest === request.id ? (
                      <ChevronUp className='w-5 h-5' />
                    ) : (
                      <ChevronDown className='w-5 h-5' />
                    )}
                  </div>
                </div>

                {expandedRequest === request.id && (
                  <div className='px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-700'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <h4 className='font-medium mb-2 text-gray-300'>
                          Funding Progress
                        </h4>
                        <div className='w-full bg-gray-700 rounded-full h-2.5'>
                          <div
                            className='bg-purple-600 h-2.5 rounded-full'
                            style={{
                              width: `${getProgressPercentage(
                                request.totalFunded,
                                request.amount
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className='text-sm text-gray-400 mt-2'>
                          {getProgressPercentage(
                            request.totalFunded,
                            request.amount
                          )}
                          % funded
                        </p>
                      </div>
                      <div>
                        <h4 className='font-medium mb-2 text-gray-300'>
                          Details
                        </h4>
                        <div className='grid grid-cols-2 gap-2 text-sm'>
                          <div>
                            <p className='text-gray-400'>Status</p>
                            <p className='capitalize'>{request.status}</p>
                          </div>
                          <div>
                            <p className='text-gray-400'>Date Submitted</p>
                            <p>{formatDate(request.createdAt)}</p>
                          </div>
                          <div>
                            <p className='text-gray-400'>Category</p>
                            <p>{request.category || 'N/A'}</p>
                          </div>
                          <div>
                            <p className='text-gray-400'>Location</p>
                            <p>{request.location || 'N/A'}</p>
                          </div>
                          <div className='col-span-2'>
                            <p className='text-gray-400'>Transaction</p>
                            {request.suiTransactionDigest ? (
                              <a
                                href={`https://suiscan.xyz/testnet/tx/${request.suiTransactionDigest}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-purple-400 hover:underline truncate block'
                              >
                                {request.suiTransactionDigest}
                              </a>
                            ) : (
                              <p>N/A</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='mt-4'>
                      <h4 className='font-medium mb-2 text-gray-300'>
                        Description
                      </h4>
                      <p className='text-sm text-gray-400'>
                        {request.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className='mt-4 flex gap-3'>
                      <button
                        onClick={() => router.push(`/requests/${request.id}`)}
                        className='text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg'
                      >
                        View Details
                      </button>
                      <button className='text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg'>
                        Share Request
                      </button>
                      {request.status === 'Pending' && (
                        <button className='text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg'>
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}