'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

type UserRole = {
  id: string;
  role: string;
  email: string;
  // Add more fields if applicable
};

export default function TestFirestorePage() {
  const [data, setData] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snapshot = await getDocs(collection(db, 'userRoles'));
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserRole[];
        setData(docs);
      } catch (error) {
        console.error('Failed to fetch userRoles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Firestore Data</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
  
}
