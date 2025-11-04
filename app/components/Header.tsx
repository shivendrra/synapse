import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  onBack: () => void;
  onForward: () => void;
  onToggleSidebar: () => void;
  navigate: (path: string) => void;
  location: string;
}

const Header: React.FC<HeaderProps> = ({ 
  user, onLogout, toggleTheme, theme, 
  onBack, onForward,
  onToggleSidebar, navigate,
  location
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(window.history.length > 1);
  const [canGoForward, setCanGoForward] = useState(false); // Hard to track reliably without a full router
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // A simple way to check navigation state on path change.
  useEffect(() => {
    // This is a proxy and not 100% reliable for forward state.
    setCanGoBack(window.history.length > 1);
  }, [location]);

  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <button onClick={onToggleSidebar} className="p-2 rounded-full md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <button onClick={onBack} className="hidden md:block p-2 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <button onClick={onForward} className="hidden md:block p-2 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
         <button onClick={() => navigate('/search')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">search</span>
        </button>

        <div className="hidden md:block">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
            <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
            <span className="hidden sm:inline text-sm font-medium text-gray-800 dark:text-gray-200">{user.displayName}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
              <button onClick={() => { navigate(`/${user.username}`); setDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</button>
              <button onClick={() => { navigate('/settings'); setDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1 md:hidden"></div>
              <div className="flex md:hidden items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                <span>Theme</span>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  onLogout();
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;