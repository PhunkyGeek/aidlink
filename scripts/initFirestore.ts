import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

async function initFirestore() {
  if (!db) {
    throw new Error('Firestore not initialized. Check firebase.ts configuration and environment variables.');
  }

  try {
    // Users
    const userId = 'test-user-uid';
    await setDoc(doc(db, 'users', userId), {
      userId,
      email: 'test@example.com',
      address: '0xTestSuiAddress',
      isConnected: true,
      role: 'recipient',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Requests
    const requestId = uuidv4();
    await setDoc(doc(db, 'requests', requestId), {
      requestId,
      recipientId: userId,
      recipientAddress: '0xTestSuiAddress',
      title: 'Test Aid Request',
      description: 'Sample description',
      mediaCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      location: 'Test Location',
      category: 'Food',
      amount: 10.5,
      totalFunded: 0,
      status: 'Pending',
      suiTransactionDigest: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Donations
    const donationId = uuidv4();
    await setDoc(doc(db, `requests/${requestId}/donations`, donationId), {
      donationId,
      donorId: 'test-donor-uid',
      donorAddress: '0xTestDonorAddress',
      amount: 5.0,
      suiTransactionDigest: null,
      createdAt: new Date(),
    });

    // UserRoles
    await setDoc(doc(db, 'userRoles', '0xTestSuiAddress'), {
      role: 'recipient',
    });

    console.log('Firestore schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firestore schema:', error);
    throw error;
  }
}

initFirestore().catch((error) => {
  console.error('Script execution failed:', error);
  process.exit(1);
});