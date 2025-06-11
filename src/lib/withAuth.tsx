// 'use client';

// import { useUserStore } from '@/store/useUserStore';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import type { JSX } from 'react';

// export function withAuth<P extends JSX.IntrinsicAttributes>(Component: React.ComponentType<P>) {
//   return function AuthenticatedComponent(props: P) {
//     const { address } = useUserStore();
//     const router = useRouter();

//     useEffect(() => {
//       if (!address) router.replace('/auth/login');
//     }, [address, router]);

//     if (!address) {
//       return (
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
//         </div>
//       );
//     }

//     return <Component {...props} />;
//   };
// }
