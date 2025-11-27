import React, { useEffect, useMemo, useState } from 'react';
import type { Playlist, Subscription } from '../types';

interface SidebarProps {
  location: string;
  onNavigate: (path: string) => void;
  playlists: Playlist[];
  likedSongsPlaylist: Playlist | null;
  onSelectPlaylist: (playlistId: string) => void;
  selectedPlaylistId: string | null;
  onCreatePlaylist: () => void;
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onNavigateToChannel: (channelId: string) => void;
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
    location, onNavigate, playlists,
    onSelectPlaylist, selectedPlaylistId,
    onCreatePlaylist, likedSongsPlaylist,
    subscriptions, onNavigateToChannel
}) => {
    const [subscriptionSortOrder, setSubscriptionSortOrder] = useState<'default' | 'alphabetical'>('default');
    const pathOnly = location.split('?')[0];
    const currentPath = pathOnly.split('/')[1] || 'home';

    const sortedSubscriptions = useMemo(() => {
        if (subscriptionSortOrder === 'alphabetical') {
            return [...subscriptions].sort((a, b) => a.title.localeCompare(b.title));
        }
        return subscriptions; // Default order
    }, [subscriptions, subscriptionSortOrder]);


    return (
    <>
      <div className="text-2xl font-bold text-brand-600">Synapse</div>
      
      <nav>
        <ul className="space-y-2">
          <li><NavItem label="Home" icon="home" isActive={currentPath === 'home'} onClick={() => onNavigate('/')} /></li>
          <li><NavItem label="Search" icon="search" isActive={currentPath === 'search'} onClick={() => onNavigate('/search')} /></li>
          <li><NavItem label="Your Library" icon="library_music" isActive={currentPath === 'library'} onClick={() => onNavigate('/library')} /></li>
          <li><NavItem label="Subscriptions" icon="subscriptions" isActive={currentPath === 'subscriptions'} onClick={() => onNavigate('/subscriptions')} /></li>
        </ul>
      </nav>

      <div className="flex-1 overflow-y-auto border-t border-gray-800 pt-4 flex flex-col">
          {likedSongsPlaylist && (
              <button 
                onClick={() => onSelectPlaylist(likedSongsPlaylist.id)}
                className={`flex items-center w-full px-4 py-2 text-sm text-left rounded-md transition-colors duration-200 mb-2 ${
                    currentPath === 'library' && selectedPlaylistId === likedSongsPlaylist.id 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
                <span className="font-semibold">Liked Songs</span>
              </button>
          )}

        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center px-4 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Playlists</span>
            <button onClick={onCreatePlaylist} className="p-1 text-gray-400 hover:text-white" title="Create playlist">
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>
          <ul className="space-y-1">
            {playlists.map(p => (
              <li key={p.id}>
                <button 
                  onClick={() => onSelectPlaylist(p.id)}
                  className={`w-full text-left text-sm px-4 py-1.5 rounded-md truncate transition-colors ${
                    currentPath === 'library' && selectedPlaylistId === p.id 
                    ? 'text-white bg-gray-800' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {subscriptions.length > 0 && (
            <div className="border-t border-gray-800 mt-4 pt-4">
                <div className="flex justify-between items-center px-4 mb-2">
                    <span className="text-xs font-semibold uppercase text-gray-500">Subscriptions</span>
                    <button onClick={() => setSubscriptionSortOrder(prev => prev === 'default' ? 'alphabetical' : 'default')} className="p-1 text-gray-400 hover:text-white" title="Sort subscriptions">
                        <span className="material-symbols-outlined text-lg">{subscriptionSortOrder === 'default' ? 'sort' : 'sort_by_alpha'}</span>
                    </button>
                </div>
                <ul className="space-y-1">
                    {sortedSubscriptions.map(sub => (
                        <li key={sub.channelId}>
                            <button onClick={() => onNavigateToChannel(sub.channelId)} className="w-full flex items-center px-4 py-1.5 text-left text-sm rounded-md text-gray-400 hover:text-white hover:bg-gray-800/50">
                                <img src={sub.thumbnail} alt={sub.title} className="w-6 h-6 rounded-full mr-3"/>
                                <span className="truncate">{sub.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </>
  );
};

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { isOpen, onClose } = props;

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
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white p-4 space-y-4 border-r border-gray-800">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile Sidebar */}
      <div 
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="fixed inset-0 bg-black/60"
          onClick={onClose}
          aria-hidden="true"
        ></div>
        <div 
          className={`fixed top-0 left-0 bottom-0 w-64 bg-gray-900 text-white p-4 space-y-4 border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <SidebarContent {...props} />
        </div>
      </div>
    </>
  );
};

export { Sidebar };
