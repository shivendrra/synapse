import React from 'react';
import type { User } from '../../types';

interface ConnectionSettingsProps {
  user: User;
  onConnectYouTube: () => void;
  onDisconnectYouTube: () => void;
  showYouTubePlaylists: boolean;
  onToggleYouTubePlaylists: () => void;
}

const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
  <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50`}>
    <div className="p-6">
      <h3 className={`text-lg font-semibold text-gray-800 dark:text-white`}>{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-4 rounded-b-lg">
      {children}
    </div>
  </div>
);

const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ user, onConnectYouTube, onDisconnectYouTube, showYouTubePlaylists, onToggleYouTubePlaylists }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Connections</h2>
      <SettingCard title="Connected Accounts" description="Manage third-party accounts connected to Synapse.">
      <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-brand-600" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
              <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
          </svg>
          <span className="font-semibold">{user.channelId || 'YouTube'}</span>
          </div>
          {user.youtubeToken ? (
          <button
              onClick={onDisconnectYouTube}
              className="px-3 py-1 text-xs font-semibold text-brand-600 border border-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-colors"
          >
              Disconnect
          </button>
          ) : (
          <button
              onClick={onConnectYouTube}
              className="px-3 py-1 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
          >
              Connect
          </button>
          )}
      </div>
      </SettingCard>

      {user.youtubeToken && (
        <SettingCard 
            title="YouTube Integration" 
            description="Control how Synapse interacts with your YouTube account."
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Sync Playlists</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Show your YouTube playlists in the library.</p>
                </div>
                <button
                    onClick={onToggleYouTubePlaylists}
                    className={`${showYouTubePlaylists ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={showYouTubePlaylists}
                >
                    <span
                        aria-hidden="true"
                        className={`${showYouTubePlaylists ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>
        </SettingCard>
      )}
    </div>
  );
};

export default ConnectionSettings;