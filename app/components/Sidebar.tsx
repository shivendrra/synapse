import React, { useEffect, useRef } from 'react';
import type { Playlist } from '../types';

interface SidebarProps {
  currentView: 'Home' | 'Search' | 'Library' | 'Channel' | 'Profile';
  onNavigate: (view: 'Home' | 'Search' | 'Library') => void;
  playlists: Playlist[];
  onSelectPlaylist: (playlistId: string) => void;
  selectedPlaylistId: string | null;
  onCreatePlaylist: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive
        ? 'text-white bg-brand-600'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="ml-3">{label}</span>
  </button>
);

const SidebarContent: React.FC<Omit<SidebarProps, 'isOpen' | 'onClose'>> = ({
    currentView, onNavigate, playlists,
    onSelectPlaylist, selectedPlaylistId,
    onCreatePlaylist
}) => (
    <>
      <div className="text-2xl font-bold text-brand-500">Synapse</div>
      
      <nav>
        <ul className="space-y-2">
          <li><NavItem label="Home" icon="home" isActive={currentView === 'Home'} onClick={() => onNavigate('Home')} /></li>
          <li><NavItem label="Search" icon="search" isActive={currentView === 'Search'} onClick={() => onNavigate('Search')} /></li>
          <li><NavItem label="Your Library" icon="library_music" isActive={currentView === 'Library'} onClick={() => onNavigate('Library')} /></li>
        </ul>
      </nav>

      <div className="flex-1 overflow-y-auto border-t border-gray-800 pt-4 flex flex-col">
        <div className="flex justify-between items-center px-4 mb-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Playlists</h2>
            <button onClick={onCreatePlaylist} className="p-1 text-gray-400 hover:text-white" title="Create Playlist">
                <span className="material-symbols-outlined">add</span>
            </button>
        </div>
        <ul className="space-y-1 flex-1 overflow-y-auto">
          {playlists.map(playlist => (
            <li key={playlist.id}>
              <button 
                onClick={() => onSelectPlaylist(playlist.id)}
                className={`w-full text-left px-4 py-2 text-sm truncate rounded-md transition-colors duration-200 ${
                  currentView === 'Library' && selectedPlaylistId === playlist.id 
                    ? 'text-white bg-gray-800' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {playlist.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
);

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { isOpen, onClose } = props;
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-black text-white p-4 space-y-8">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        ></div>
        <aside 
          ref={sidebarRef}
          className={`relative z-10 flex flex-col w-64 h-full bg-black text-white p-4 space-y-8 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Sidebar"
        >
          <SidebarContent {...props} />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;