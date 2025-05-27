// ✅ app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withRole } from '@/lib/withRole';
import { withAuth } from '@/lib/withAuth';
import { UserRole } from '@/utils/getUserRole';

function UsersPage() {
  const [users, setUsers] = useState<UserRole[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const snapshot = await getDocs(collection(db, 'userRoles'));
      const users: UserRole[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<UserRole, 'id'>),
      }));
      setUsers(users);
    }
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">All Users & Donors</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Users by Role</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
              <th className="pb-2">Address</th>
              <th className="pb-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2">{user.id}</td>
                <td className="py-2 capitalize">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Enforce login first, then role-based access
export default withAuth(withRole(UsersPage, 'admin'));
