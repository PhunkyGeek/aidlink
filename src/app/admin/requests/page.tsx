// ✅ app/admin/requests/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { withRole } from '@/lib/withRole';
import { withAuth } from '@/lib/withAuth';
import { AidRequest } from '../../../../types/aid-request';

function RequestsPage() {
  const [requests, setRequests] = useState<AidRequest[]>([]);


  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const snapshot = await getDocs(collection(db, 'aidRequests'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRequests(data);
  }

  async function flagRequest(id: string) {
    const ref = doc(db, 'aidRequests', id);
    await updateDoc(ref, { flagged: true });
    fetchRequests();
  }

  async function deleteRequest(id: string) {
    const ref = doc(db, 'aidRequests', id);
    await deleteDoc(ref);
    fetchRequests();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        All Aid Requests
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Manage Requests
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
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
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="py-2">{r.requesterName || "Unknown"}</td>
                <td className="py-2">
                  {r.createdAt?.seconds
                    ? new Date(r.createdAt.seconds * 1000).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="py-2">{r.location || "N/A"}</td>
                <td className="py-2 capitalize">{r.status}</td>
                <td className="py-2">{r.flagged ? "Yes" : "No"}</td>
                <td className="py-2 space-x-2">
                  <button
                    onClick={() => flagRequest(r.id)}
                    className="text-yellow-600 hover:underline"
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => deleteRequest(r.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Enforce login first, then role-based access
export default withAuth(withRole(RequestsPage, 'admin'));
