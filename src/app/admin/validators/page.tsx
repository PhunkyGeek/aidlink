// ✅ app/admin/validators/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { withRole } from '@/lib/withRole';
import { withAuth } from '@/lib/withAuth';

function ValidatorsPage() {
  const [validators, setValidators] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchValidators();
  }, []);

  async function fetchValidators() {
    const snapshot = await getDocs(collection(db, 'validators'));
    setValidators(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    if (editingId) {
      const ref = doc(db, 'validators', editingId);
      await updateDoc(ref, { email });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'validators'), {
        email,
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }

    setEmail('');
    fetchValidators();
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, 'validators', id));
    fetchValidators();
  }

  function handleEdit(v: any) {
    setEmail(v.email);
    setEditingId(v.id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Validators</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="Validator email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm flex-1"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
        >
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Current Validators</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
              <th className="pb-2">Email</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {validators.map((v) => (
              <tr key={v.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2">{v.email}</td>
                <td className="py-2 capitalize">{v.status}</td>
                <td className="py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(v)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
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
export default withAuth(withRole(ValidatorsPage, 'admin'));
