'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

type UserRole = {
  id: string;
  role: string;
  email: string;
};

export default function TestFirestorePage() {
  const [data, setData] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!db) {
        toast.error('Firebase configuration error: Database not initialized.');
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, 'userRoles'));
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          role: doc.data().role as string,
          email: doc.data().email as string,
        }));
        setData(docs);
      } catch (error: any) {
        console.error('Failed to fetch userRoles:', error);
        toast.error('Failed to fetch user roles: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-purple-400">Test Firestore Data</h1>
      {loading ? (
        <div className="flex justify-center">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-gray-400">No user roles found.</p>
      ) : (
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}