'use client';

import { useState } from 'react';
import { RiMenuLine } from 'react-icons/ri';

export default function MenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
    // Placeholder: Hook into a sidebar toggle or emit event if needed
  };

  return (
    <button
      onClick={toggleMenu}
      className="block lg:hidden text-gray-700 dark:text-gray-300 hover:text-primary"
    >
      <RiMenuLine size={24} />
    </button>
  );
}
