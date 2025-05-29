'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  RiUser3Line,
  RiHandCoinLine,
  RiShieldUserLine,
  RiFileList3Line,
  RiArrowUpDownLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';
import { AidRequest } from '../../../../types/aid-request';

// Disable SSG
export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, donors: 0, validators: 0, requests: 0 });
  const [recentRequests, setRecentRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);
  const { address, role, displayName } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!auth || !db) {
      toast.error('Authentication or database service unavailable');
      router.replace('/login');
      return;
    }

    if (!address || role !== 'admin') {
      // toast.error('Unauthorized access');
      router.replace('/login');
      return;
    }

    setLoading(true);
    const userRolesQuery = query(collection(db, 'userRoles'));
    const aidRequestsQuery = query(collection(db, 'aidRequests'));

    const unsubscribeUserRoles = onSnapshot(
      userRolesQuery,
      (snapshot) => {
        let users = 0,
          donors = 0,
          validators = 0;
        snapshot.forEach((doc) => {
          users++;
          const userRole = doc.data().role;
          if (userRole === 'donor') donors++;
          if (userRole === 'validator') validators++;
        });
        setStats((prev) => ({ ...prev, users, donors, validators }));
      },
      (error) => {
        console.error('Error fetching user roles:', error);
        toast.error('Failed to load user data');
      }
    );

    const unsubscribeAidRequests = onSnapshot(
      aidRequestsQuery,
      (snapshot) => {
        const requests = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as AidRequest))
          .sort((a, b) =>
            sortAsc
              ? (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)
              : (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
          );
        setStats((prev) => ({ ...prev, requests: requests.length }));
        setRecentRequests(requests.slice(0, 5));
      },
      (error) => {
        console.error('Error fetching aid requests:', error);
        toast.error('Failed to load requests');
      }
    );

    setLoading(false);
    return () => {
      unsubscribeUserRoles();
      unsubscribeAidRequests();
    };
  }, [sortAsc, router, address, role]);

  const getStatusText = (status: number | undefined): string => {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Approved';
      case 2:
        return 'Funded';
      case 3:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gray-900 text-gray-100">
        <h1 className="text-2xl font-bold text-purple-500">
          Welcome back, {displayName || 'Admin'} 👋
        </h1>
        <p className="text-sm text-gray-400">
          Your platform is growing fast. Keep it up!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Users"
            value={stats.users}
            color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            icon={<RiUser3Line />}
          />
          <StatCard
            title="Donors"
            value={stats.donors}
            color="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            icon={<RiHandCoinLine />}
          />
          <StatCard
            title="Validators"
            value={stats.validators}
            color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
            icon={<RiShieldUserLine />}
          />
          <StatCard
            title="Requests"
            value={stats.requests}
            color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            icon={<RiFileList3Line />}
          />
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-500">
              Recent Aid Requests
            </h2>
            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-300"
            >
              <RiArrowUpDownLine />
              Sort by Date ({sortAsc ? 'Asc' : 'Desc'})
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2">Requester</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Funded</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-2">{req.requesterName || 'Unknown'}</td>
                  <td className="py-2">
                    {req.createdAt?.seconds
                      ? new Date(req.createdAt.seconds * 1000).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="py-2">{req.location || 'N/A'}</td>
                  <td className="py-2 capitalize">{getStatusText(req.status)}</td>
                  <td className="py-2">
                    {req.fundedAmount !== undefined ? `${req.fundedAmount} SUI` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg p-4 flex items-center justify-between shadow ${color}`}>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="text-3xl opacity-40">{icon}</div>
    </div>
  );
}