'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useUserStore } from '@/store/useUserStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { AidRequest } from '../../../../types/aid-request';

export const dynamic = 'force-dynamic';

export default function RequestsPage() {
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, role, displayName } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!db) {
      toast.error('Database service unavailable');
      router.replace('/login');
      return;
    }

    if (!address || role !== 'admin') {
      toast.error('Unauthorized access');
      router.replace('/login');
      return;
    }

    setLoading(true);
    const requestsQuery = query(collection(db, 'aidRequests'));

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as AidRequest));
        setRequests(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load requests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router, address, role]);

  async function flagRequest(id: string) {
    if (!db) {
      toast.error('Database service unavailable');
      return;
    }

    try {
      const ref = doc(db, 'aidRequests', id);
      await updateDoc(ref, { flagged: true });
      toast.success('Request flagged');
    } catch (error: any) {
      console.error('Error flagging request:', error);
      toast.error('Failed to flag request: ' + error.message);
    }
  }

  async function deleteRequest(id: string) {
    if (!db) {
      toast.error('Database service unavailable');
      return;
    }

    try {
      const ref = doc(db, 'aidRequests', id);
      await deleteDoc(ref);
      toast.success('Request deleted');
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request: ' + error.message);
    }
  }

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
        <h1 className="text-2xl font-bold text-purple-400">
          All Aid Requests
        </h1>

        <div className="bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-purple-400 mb-4">
            Manage Requests
          </h2>
          {requests.length === 0 ? (
            <p className="text-gray-400">No requests found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Requester</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Flagged</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="py-2">{r.requesterName || 'Unknown'}</td>
                    <td className="py-2">
                      {r.createdAt?.seconds
                        ? new Date(r.createdAt.seconds * 1000).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-2">{r.location || 'N/A'}</td>
                    <td className="py-2 capitalize">{getStatusText(r.status)}</td>
                    <td className="py-2">{r.flagged ? 'Yes' : 'No'}</td>
                    <td className="py-2 space-x-2">
                      <button
                        onClick={() => flagRequest(r.id)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        Flag
                      </button>
                      <button
                        onClick={() => deleteRequest(r.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
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