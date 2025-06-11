'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { useUserStore } from '@/store/useUserStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { Validator } from '../../../../types/validator';

export const dynamic = 'force-dynamic';

export default function ValidatorsPage() {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
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
    const validatorsQuery = query(collection(db, 'validators'));

    const unsubscribe = onSnapshot(
      validatorsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Validator));
        setValidators(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching validators:', error);
        toast.error('Failed to load validators');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router, address, role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!db) {
      toast.error('Database service unavailable');
      return;
    }

    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      if (editingId) {
        const ref = doc(db, 'validators', editingId);
        await updateDoc(ref, { email });
        toast.success('Validator updated');
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'validators'), {
          email,
          status: 'active',
          createdAt: serverTimestamp(),
        });
        toast.success('Validator added');
      }
      setEmail('');
    } catch (error: any) {
      console.error('Error saving validator:', error);
      toast.error('Failed to save validator: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!db) {
      toast.error('Database service unavailable');
      return;
    }

    try {
      const ref = doc(db, 'validators', id);
      await deleteDoc(ref);
      toast.success('Validator deleted');
    } catch (error: any) {
      console.error('Error deleting validator:', error);
      toast.error('Failed to delete validator: ' + error.message);
    }
  }

  function handleEdit(v: Validator) {
    setEmail(v.email);
    setEditingId(v.id);
  }

  const getStatusText = (status: string | undefined): string => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
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
        <h1 className="text-2xl font-bold text-purple-400">Manage Validators</h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="Validator email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 text-sm flex-1 focus:border-purple-400 focus:ring focus:ring-purple-400/20"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
          >
            {editingId ? 'Update' : 'Add'}
          </button>
        </form>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-purple-400 mb-4">Current Validators</h2>
          {validators.length === 0 ? (
            <p className="text-gray-400">No validators found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {validators.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="py-2">{v.email}</td>
                    <td className="py-2 capitalize">{getStatusText(v.status)}</td>
                    <td className="py-2">
                      {v.createdAt?.seconds
                        ? new Date(v.createdAt.seconds * 1000).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(v)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
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