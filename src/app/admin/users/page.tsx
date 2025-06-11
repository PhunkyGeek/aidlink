'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { Role } from '@/utils/getUserRole';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { RiArrowUpDownLine } from 'react-icons/ri';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  address?: string;
  role: Role;
  email?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const { address, role } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!db) {
      toast.error('Database service unavailable');
      router.replace('/error');
      return;
    }

    if (!address || role !== 'admin') {
      toast.error('Unauthorized access');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    const usersQuery = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const userData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as User))
          .sort((a, b) =>
            sortAsc
              ? a.role.localeCompare(b.role)
              : b.role.localeCompare(a.role)
          );
        setUsers(userData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sortAsc, address, role, router]);

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
        <h1 className="text-2xl font-bold text-purple-400">All Users & Donors</h1>

        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-400">Users by Role</h2>
            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
            >
              <RiArrowUpDownLine />
              Sort by Role ({sortAsc ? 'Asc' : 'Desc'})
            </button>
          </div>
          {users.length === 0 ? (
            <p className="text-gray-400">No users found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Address</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="py-2 font-mono text-sm">{user.address || user.id}</td>
                    <td className="py-2 capitalize">{user.role || 'None'}</td>
                    <td className="py-2">{user.email || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}