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
import { getStatusLabel } from '@/utils/statusMap';

export const dynamic = 'force-dynamic';

export default function RequestsPage() {
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
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
        console.error('Error syncing requests:', error);
        toast.error('Failed to sync requests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [address, role, router]);

  async function toggleFlag(id: string, flagged: boolean) {
    if (!db) {
      toast.error('Database service unavailable');
      return;
    }

    try {
      const ref = doc(db, 'aidRequests', id);
      await updateDoc(ref, { flagged: !flagged });
      toast.success(`Request ${flagged ? 'unflagged' : 'flagged'}`);
    } catch (error: any) {
      console.error('Error toggling flag:', error);
      toast.error('Failed to toggle flag: ' + error.message);
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
        <h1 className="text-2xl font-bold text-purple-400">All Aid Requests</h1>

        <div className="bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-purple-400 mb-4">Manage Requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-400">No requests found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Title</th>
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
                    <td className="py-2">{r.title || 'N/A'}</td>
                    <td className="py-2">{r.requesterName || 'Unknown'}</td>
                    <td className="py-2">
                      {r.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="py-2">{r.location || 'N/A'}</td>
                    <td className="py-2 capitalize">{getStatusLabel(r.status)}</td>
                    <td className="py-2">{r.flagged ? 'Yes' : 'No'}</td>
                    <td className="py-2 space-x-2">
                      <button
                        onClick={() => toggleFlag(r.id, r.flagged ?? false)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        {r.flagged ? 'Unflag' : 'Flag'}
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