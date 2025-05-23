'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withRole } from '@/lib/withRole';
import { withAuth } from '@/lib/withAuth';
import {
  RiUser3Line,
  RiHandCoinLine,
  RiShieldUserLine,
  RiFileList3Line,
  RiArrowUpDownLine,
} from 'react-icons/ri';

function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, donors: 0, validators: 0, requests: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const usersSnap = await getDocs(collection(db, 'userRoles'));
      const requestsSnap = await getDocs(collection(db, 'aidRequests'));

      let users = 0,
        donors = 0,
        validators = 0;
      usersSnap.forEach((doc) => {
        users++;
        const role = doc.data().role;
        if (role === 'donor') donors++;
        if (role === 'validator') validators++;
      });

      type AidRequest = {
        id: string;
        requesterName?: string;
        location?: string;
        status?: string;
        fundedAmount?: number;
        createdAt?: { seconds: number; nanoseconds: number };
      };
      
      const requests: AidRequest[] = requestsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      

      // Apply sorting
      requests.sort((a, b) =>
        sortAsc
          ? (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)
          : (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      );
      

      setStats({ users, donors, validators, requests: requests.length });
      setRecentRequests(requests.slice(0, 5));
      setLoading(false);
    }

    fetchData();
  }, [sortAsc]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, Admin 👋</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">Your platform is growing fast. Keep it up!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Users" value={stats.users} color="bg-blue-100 text-blue-700" icon={<RiUser3Line />} />
        <StatCard title="Donors" value={stats.donors} color="bg-green-100 text-green-700" icon={<RiHandCoinLine />} />
        <StatCard title="Validators" value={stats.validators} color="bg-yellow-100 text-yellow-700" icon={<RiShieldUserLine />} />
        <StatCard title="Requests" value={stats.requests} color="bg-purple-100 text-purple-700" icon={<RiFileList3Line />} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Aid Requests</h2>
          <button
            onClick={() => setSortAsc((prev) => !prev)}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
          >
            <RiArrowUpDownLine />
            Sort by Date ({sortAsc ? 'Asc' : 'Desc'})
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
              <th className="pb-2">Requester</th>
              <th className="pb-2">Created</th>
              <th className="pb-2">Location</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Funded</th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((req) => (
              <tr key={req.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2">{req.requesterName || 'Unknown'}</td>
                <td className="py-2">{new Date(req.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                <td className="py-2">{req.location || 'N/A'}</td>
                <td className="py-2 capitalize">{req.status}</td>
                <td className="py-2">{req.status === 'Funded' ? `$${req.fundedAmount}` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

// ✅ Enforce login and admin role
export default withAuth(withRole(AdminDashboardPage, 'admin'));
