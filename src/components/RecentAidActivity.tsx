'use client';

import { useState } from 'react';
import { 
  RiRefreshLine,
  RiHeartAddLine,
  RiShareLine
} from 'react-icons/ri';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Layers, 
  DollarSign 
} from 'lucide-react';
import { motion } from 'framer-motion';

type AidRequest = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  targetAmount: number;
  fundedAmount: number;
  location: string;
  createdAt: string;
  imageUrl?: string;
};

export default function RecentAidActivity({ 
  refreshing, 
  setRefreshing 
}: { 
  refreshing: boolean; 
  setRefreshing: (val: boolean) => void 
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data - replace with your actual data fetching
  const mockRequests: AidRequest[] = [
    {
      id: 'req-001',
      title: 'Emergency Food Relief',
      description: 'Providing meals for 500 families affected by floods',
      status: 'approved',
      category: 'Food',
      targetAmount: 5000,
      fundedAmount: 0,
      location: 'Lagos, Nigeria',
      createdAt: '2023-10-15T14:30:00Z',
      // imageUrl: '/food-aid.jpg'
    },
    {
      id: 'req-002',
      title: 'School Renovation Project',
      description: 'Rebuilding classrooms for rural primary school',
      status: 'pending',
      category: 'Education',
      targetAmount: 8000,
      fundedAmount: 1200,
      location: 'Nairobi, Kenya',
      createdAt: '2023-10-18T09:15:00Z'
    },
    {
      id: 'req-003',
      title: 'Medical Supplies',
      description: 'Essential medicines for community clinic',
      status: 'approved',
      category: 'Health',
      targetAmount: 3500,
      fundedAmount: 3500,
      location: 'Accra, Ghana',
      createdAt: '2023-10-10T16:45:00Z',
      // imageUrl: '/medical-aid.jpg'
    }
  ];

  const filteredRequests = statusFilter === 'all' 
    ? mockRequests 
    : mockRequests.filter(req => req.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getProgressPercentage = (funded: number, target: number) => {
    return Math.min(Math.round((funded / target) * 100), 100);
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <RiRefreshLine className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Recent Aid Requests
        </h2>
        <button 
          onClick={() => setRefreshing(true)}
          className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          <RiRefreshLine className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 transition-all ${
                statusFilter === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } capitalize`}
            >
              {tab === 'all' ? 'All' : tab}
              {tab !== 'all' && getStatusIcon(tab)}
            </button>
          ))}
        </div>

        {/* Request Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              No requests match your filters
            </div>
          ) : (
            filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-purple-500 transition-colors"
              >
                {request.imageUrl && (
                  <div className="relative h-40 w-full">
                    <img 
                      src={request.imageUrl} 
                      alt={request.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1">{request.title}</h3>
                    <span className="flex items-center gap-1 text-sm">
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{request.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{request.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span>{request.category}</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Funded</span>
                        <span>
                          ${request.fundedAmount.toLocaleString()} of ${request.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${getProgressPercentage(request.fundedAmount, request.targetAmount)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1">
                      <RiHeartAddLine className="w-4 h-4" />
                      Fund
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1">
                      <RiShareLine className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}