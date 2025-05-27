'use client';

import { useState } from 'react';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';

interface MenuToggleProps {
  onToggle?: (isOpen: boolean) => void;
}

export default function MenuToggle({ onToggle }: MenuToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (onToggle) {
        onToggle(newState);
      }
      return newState;
    });
  };

  return (
    <button
      onClick={toggleMenu}
      className="block lg:hidden text-gray-700 dark:text-gray-300 hover:text-primary"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
    </button>
  );
}