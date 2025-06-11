'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { logout } from '@/lib/auth';
import { UserState } from '@/store/useUserStore';
import { RiLogoutBoxRLine, RiUser3Line, RiSettings4Line, RiMoneyDollarCircleLine, RiQuestionLine } from 'react-icons/ri';

// Use UserState interface directly from useUserStore
interface UserMenuProps extends Pick<UserState, 'id' | 'address' | 'role' | 'displayName' | 'photoURL'> {}

export default function UserMenu({ id, address, role, displayName, photoURL }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Display user icon or initials
  const displayIcon = () => {
    if (photoURL) {
      return (
        <Image
          src={photoURL}
          alt="Profile"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover border border-white"
        />
      );
    }

    const letter = ( role || '?').charAt(0).toUpperCase();

    return (
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-400 to-purple-600 text-white font-bold border border-white">
        {letter}
      </span>
    );
  };

  // Handle menu toggle
  const handleClick = () => {
    if (!id) {
      router.push('/auth/login');
    } else {
      setOpen((prev) => !prev);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/logout-loading');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/auth/logout-loading'); // Proceed to loading page even on error
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleClick}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-600 text-white text-sm font-bold flex items-center justify-center border border-white"
        title={id ? role ?? 'User' : 'Click to login'}
      >
        {displayIcon()}
      </button>

      {open && id && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-sm">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {(displayName || role || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 dark:text-white">{displayName || role}</span>
              {address && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">ID: {id.slice(0, 6)}</span>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <MenuItem icon={<RiUser3Line />} text="My Profile" onClick={() => router.push(`/profile/${id}`)} />
          <MenuItem icon={<RiSettings4Line />} text="Settings" onClick={() => router.push('/settings')} />
          <MenuItem icon={<RiMoneyDollarCircleLine />} text="Pricing" onClick={() => router.push('/pricing')} />
          <MenuItem icon={<RiQuestionLine />} text="FAQ" onClick={() => router.push('/faq')} />

          <div className="px-4 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 rounded-md py-2"
            >
              <RiLogoutBoxRLine /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// MenuItem component for dropdown items
interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

function MenuItem({ icon, text, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {icon}
      <span>{text}</span>
   </button>
  );
}