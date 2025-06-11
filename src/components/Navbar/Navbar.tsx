'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUserStore, UserState } from '@/store/useUserStore';
import ThemeSwitch from './ThemeSwitch';
import UserMenu from './UserMenu';
import { RiMenuLine, RiMenuFoldLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

// Define Navbar props for sidebar and menu toggling
interface NavbarProps {
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  isSidebarVisible?: boolean;
}

// Map roles to routes for logo navigation
const getLogoRoute = (role: UserState['role']): string => {
  if (role && !['donor', 'recipient', 'validator', 'admin'].includes(role)) {
    toast.error(`Invalid user role: ${role}`);
  }
  switch (role) {
    case 'donor':
      return '/connect-wallet';
    case 'recipient':
      return '/connect-walletr';
    case 'validator':
      return '/validator-dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
};

export default function Navbar({ onMenuClick, onSidebarToggle, isSidebarVisible }: NavbarProps) {
  // Use UserState directly from store
  const { id, address, role } = useUserStore();

  // Don't render navbar if user is not signed in (no Firestore ID)
  if (!id) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-black border-b px-4 py-3 flex justify-between items-center shadow-sm w-full">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle (visible on medium screens and up) */}
        <button
          onClick={onSidebarToggle}
          className="text-gray-700 dark:text-gray-300 hover:text-primary hidden md:block"
          aria-label={isSidebarVisible ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarVisible ? (
            <RiMenuFoldLine size={24} />
          ) : (
            <RiMenuLine size={24} />
          )}
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="text-gray-700 dark:text-gray-300 hover:text-primary md:hidden"
          aria-label="Toggle mobile menu"
        >
          <RiMenuLine size={24} />
        </button>

        <Link href={getLogoRoute(role)} className="flex items-center" aria-label="AidLink Home">
          <Image
            src="/navbar-logo.png"
            alt="AidLink Logo"
            width={140}
            height={40}
            className="h-auto w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px]"
            priority
          />
        </Link>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <ThemeSwitch />
        {/* Pass all relevant user state to UserMenu */}
        <UserMenu
          id={id}
          address={address}
          role={role}
          displayName={useUserStore.getState().displayName}
          photoURL={useUserStore.getState().photoURL}
        />
      </div>
    </nav>
  );
}