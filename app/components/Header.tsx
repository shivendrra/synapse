import React, { useState } from 'react';
import type { User } from '../types';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onSearch: (query: string) => void;
  onToggleSidebar: () => void;
  onNavigate: (view: { name: 'Profile' | 'Settings' }) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, onLogout, toggleTheme, theme, 
  onBack, onForward, canGoBack, canGoForward,
  onSearch, onToggleSidebar, onNavigate
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center justify-between p-4 bg-gray-100 dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="flex items-center space-x-2 justify-start">
        <button onClick={onToggleSidebar} className="p-2 rounded-full md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <button onClick={onBack} disabled={!canGoBack} className="hidden md:block p-2 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <button onClick={onForward} disabled={!canGoForward} className="hidden md:block p-2 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
      
      <div className="flex justify-center px-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-outlined text-xl">search</span>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end space-x-2 md:space-x-4">
        <div className="hidden md:block">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
            <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
            <span className="hidden sm:inline text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
          </button>
          {dropdownOpen && (
            <div 
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
              <button onClick={() => { onNavigate({ name: 'Profile' }); setDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</button>
              <button onClick={() => { onNavigate({ name: 'Settings' }); setDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</button>
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