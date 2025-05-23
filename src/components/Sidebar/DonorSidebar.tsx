'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiAddFill, RiHandHeartLine, RiSearchLine, RiWallet3Fill } from 'react-icons/ri';

const navItems = [
  { name: 'All Requests', href: '/requests', icon: <RiSearchLine className="text-xl" /> },
  { name: 'My Donations', href: '/donations', icon: <RiHandHeartLine className="text-xl" /> },
];

export default function DonorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black dark:black border-r border-black dark:black p-4">
      {/* <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Donor Panel</h2> */}

      {/* Connect Button */}
      <Link
        href="/connect-wallet"
        className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black py-2 px-4 rounded-xl mt-6 mb-4 hover:opacity-70 transition"
      >
        <RiAddFill className="text-black text-2xl" />
        Connect Wallet
      </Link>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 pl-12 rounded-xl text-sm font-medium transition-colors
              ${
                pathname === item.href
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
