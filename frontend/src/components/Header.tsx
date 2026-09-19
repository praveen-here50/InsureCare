'use client';

import Link from 'next/link';
import { MdMenu, MdNotifications, MdAccountCircle } from 'react-icons/md';

interface HeaderProps {
  onToggleMobile?: () => void;
}

export default function Header({ onToggleMobile = () => {} }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold text-indigo-600">InsureCare</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700" onClick={onToggleMobile}>
            <MdMenu className="h-5 w-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 relative">
            <MdNotifications className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center bg-red-500 rounded-full text-xs font-medium text-white">
              3
            </span>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <MdAccountCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}