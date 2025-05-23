import type { Role } from './getUserRole';

export function redirectBasedOnRole(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'validator':
      return '/validator-dashboard';
    case 'recipient':
      return '/submit-aid';
    case 'donor':
    default:
      return '/requests';
  }
}
