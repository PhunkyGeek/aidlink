'use client';

import { useState, useRef, useEffect } from 'react';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const clearSearch = () => {
    setSearch('');
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!inputRef.current?.parentElement?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative hidden md:flex items-center justify-center w-full max-w-md mx-auto">
      {!isOpen ? (
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary"
        >
          <RiSearchLine size={16} />
          <span>Search...</span>
        </button>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-50 py-1.5 w-full rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring focus:ring-primary"
          />
          <RiSearchLine className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" size={16} />
          <button
            onClick={clearSearch}
            className="absolute right-2 top-2 text-gray-500 hover:text-red-600"
          >
            <RiCloseLine size={16} />
          </button>
        </>
      )}
    </div>
  );
}
