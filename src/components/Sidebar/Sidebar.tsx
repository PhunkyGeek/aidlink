'use client';

import { useUserStore } from '@/store/useUserStore';
import AdminSidebar from './AdminSidebar';
import ValidatorSidebar from './ValidatorSidebar';
import RecipientSidebar from './RecipientSidebar';
import DonorSidebar from './DonorSidebar';
import Image from 'next/image';

export default function Sidebar() {
  const { role } = useUserStore();

  const renderSidebarContent = () => {
    switch (role) {
      case 'admin':
        return <AdminSidebar />;
      case 'validator':
        return <ValidatorSidebar />;
      case 'recipient':
        return <RecipientSidebar />;
      case 'donor':
        return <DonorSidebar />;
      default:
        return null;
    }
  };

  return (
    <aside className="flex flex-col h-full relative bg-black text-white overflow-hidden">
      {/* Main Role-based Sidebar */}
      <div className="flex-1 overflow-y-auto">
        {renderSidebarContent()}
      </div>

      {/* Fixed Footer Background Image */}
      <div className="relative w-full h-70">
        <Image
          src="/sidebar-background.png"
          alt="Sidebar footer background"
          layout="fill"
          objectFit="contain"
          className="opacity-90"
          priority
        />
      </div>
    </aside>
  );
}
