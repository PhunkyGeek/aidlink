'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function TestFirestorePage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const snapshot = await getDocs(collection(db, 'userRoles'));
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(docs);
    }
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Firestore Data</h1>
      <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
