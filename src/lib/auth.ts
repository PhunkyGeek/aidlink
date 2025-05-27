// ✅ lib/auth.ts
import { useUserStore } from '@/store/useUserStore';
import { Role } from '@/utils/getUserRole';

export function isLoggedIn(): boolean {
  const { address } = useUserStore.getState();
  return Boolean(address);
}

export function hasRole(requiredRole: Role): boolean {
  const { role } = useUserStore.getState();
  return role === requiredRole;
}

export function hasAnyRole(roles: Role[]): boolean {
  const { role } = useUserStore.getState();
  return roles.includes(role as Role);
} 

export function logout() {
  const { clearUser } = useUserStore.getState();
  clearUser();
} 

// Optional: add helper for redirecting based on role
// export function getDashboardRoute(role: Role): string {
//   switch (role) {
//     case 'validator': return '/validator-dashboard';
//     case 'admin': return '/admin';
//     case 'recipient': return '/submit-aid';
//     default: return '/requests';
//   }
// }
