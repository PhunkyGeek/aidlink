// 'use client';

// import { useUserStore } from '@/store/useUserStore';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import type { JSX } from 'react';
// import { db } from '@/lib/firebase';
// import { doc, Firestore, getDoc } from 'firebase/firestore';

// export function withRole<P extends JSX.IntrinsicAttributes>(
//   WrappedComponent: React.ComponentType<P>,
//   allowedRole: string
// ) {
//   return function RoleProtectedComponent(props: P) {
//     const { role, address } = useUserStore();
//     const router = useRouter();
//     const [checking, setChecking] = useState(true);

//     useEffect(() => {
//       async function validateAccess() {
//         if (!role || !address) return;

//         // Additional check: if role is admin, validate against Firestore
//         if (role === 'admin') {
//           const snapshot = await getDoc(doc(db as Firestore, 'userRoles', address));
//           const isManual = snapshot.exists() && snapshot.data()?.createdManually === true;

//           if (!isManual) {
//             router.replace('/');
//             return;
//           }
//         }

//         if (role !== allowedRole) {
//           router.replace('/');
//           return;
//         }

//         setChecking(false);
//       }

//       validateAccess();
//     }, [role, address, router]);

//     if (checking || role !== allowedRole) {
//       return (
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       );
//     }

//     return <WrappedComponent {...props} />;
//   };
// }
