'use client';

import Link from 'next/link';
import Image from "next/image";
import { useUserStore } from '@/store/useUserStore';
import ThemeSwitch from './ThemeSwitch';
import UserMenu from './UserMenu';
import { RiMenuLine, RiMenuFoldLine, RiNotification2Line } from 'react-icons/ri';

type NavbarProps = {
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  isSidebarVisible?: boolean;
};

export default function Navbar({ onMenuClick, onSidebarToggle, isSidebarVisible }: NavbarProps) {
  const { address, role } = useUserStore();

  if (!address) return null; // Don't render navbar if not signed in

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-black border-b px-4 py-3 flex justify-between items-center shadow-sm w-full">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle (visible on all screens) */}
        <button
          onClick={onSidebarToggle}
          className="text-gray-700 dark:text-gray-300 hover:text-primary hidden md:block"
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
        >
          <RiMenuLine size={24} />
        </button>

        <Link href="/" className="flex items-center">
          <Image
            src="/navbar-logo.png"
            alt="AidLink Logo"
            width={140}
            height={40}
            className="h-auto w-auto max-w-[140px] md:max-w-[160px]"
            priority
          />
        </Link>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* <button className="text-gray-700 dark:text-gray-300 hover:text-primary">
          <RiNotification2Line size={20} />
        </button> */}
        <ThemeSwitch />
        <UserMenu address={address} role={role} />
      </div>
    </nav>
  );
}
