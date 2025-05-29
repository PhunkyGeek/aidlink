// ✅ app/components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiDashboardLine, RiTeamLine, RiShieldUserLine, RiFileListLine } from 'react-icons/ri';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <RiDashboardLine  className="text-xl" /> },
  { name: 'Users', href: '/admin/users', icon: <RiTeamLine  className="text-xl" /> },
  { name: 'Validators', href: '/admin/validators', icon: <RiShieldUserLine  className="text-xl" /> },
  { name: 'Requests', href: '/admin/requests', icon: <RiFileListLine  className="text-xl" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-black p-4">
      <h2 className="text-lg font-bold text-gray-800 dark:text-purple-600 mt-6 mb-6">ADMINISTRATOR</h2>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${pathname === item.href
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
