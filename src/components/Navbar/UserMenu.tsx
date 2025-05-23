'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { RiLogoutBoxRLine, RiUser3Line, RiSettings4Line, RiMoneyDollarCircleLine, RiQuestionLine } from 'react-icons/ri';

type Props = {
  address: string | null;
  role: string | null;
  name?: string | null;
  imageUrl?: string | null;
};

export default function UserMenu({ address, role, name, imageUrl }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const displayIcon = () => {
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-white"
        />
      );
    }

    const letter = (name || role || '?').charAt(0).toUpperCase();

    return (
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-400 to-purple-600 text-white font-bold border border-white">
        {letter}
      </span>
    );
  };

  const handleClick = () => {
    if (!address) {
      router.push('/login');
    } else {
      setOpen((prev) => !prev);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleClick}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-600 text-white text-sm font-bold flex items-center justify-center border border-white"
        title={address ? role ?? 'User' : 'Click to login'}
      >
        {displayIcon()}
      </button>

      {open && address && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-sm">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {(name || role || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 dark:text-white">{name || role}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <MenuItem icon={<RiUser3Line />} text="My Profile" onClick={() => router.push('/profile')} />
          <MenuItem icon={<RiSettings4Line />} text="Settings" onClick={() => router.push('/settings')} />
          <MenuItem icon={<RiMoneyDollarCircleLine />} text="Pricing" onClick={() => router.push('/pricing')} />
          <MenuItem icon={<RiQuestionLine />} text="FAQ" onClick={() => router.push('/faq')} />

          <div className="px-4 py-2">
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
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

function MenuItem({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick: () => void }) {
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
