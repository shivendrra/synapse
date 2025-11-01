import React, { useState } from 'react';
import type { User } from '../types';
import ProfileSettings from './settings/ProfileSettings';
import AccountSettings from './settings/AccountSettings';
import ConnectionSettings from './settings/ConnectionSettings';
import DangerZone from './settings/DangerZone';

interface SettingsProps {
  user: User;
  onConnectYouTube: () => void;
  onDisconnectYouTube: () => void;
  onAccountDelete: () => void;
  onProfileUpdate: (updates: { displayName?: string; photoURL?: string; }) => Promise<void>;
}

type SettingView = 'Profile' | 'Account' | 'Connections' | 'Security';

const Settings: React.FC<SettingsProps> = (props) => {
  const [currentView, setCurrentView] = useState<SettingView>('Profile');

  const NavItem: React.FC<{ label: SettingView; icon: string }> = ({ label, icon }) => (
    <li>
      <button
        onClick={() => setCurrentView(label)}
        className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          currentView === label
            ? 'text-white bg-brand-600'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
        }`}
      >
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
      <aside className="md:w-1/4 lg:w-1/5">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Settings</h1>
        <nav>
          <ul className="space-y-2">
            <NavItem label="Profile" icon="badge" />
            <NavItem label="Account" icon="manage_accounts" />
            <NavItem label="Connections" icon="link" />
            <NavItem label="Security" icon="shield" />
          </ul>
        </nav>
      </aside>
      
      <main className="flex-1">
        {currentView === 'Profile' && <ProfileSettings user={props.user} onProfileUpdate={props.onProfileUpdate} />}
        {currentView === 'Account' && <AccountSettings user={props.user} />}
        {currentView === 'Connections' && <ConnectionSettings user={props.user} onConnectYouTube={props.onConnectYouTube} onDisconnectYouTube={props.onDisconnectYouTube} />}
        {currentView === 'Security' && <DangerZone onAccountDelete={props.onAccountDelete} authProvider={props.user.authProvider} />}
      </main>
    </div>
  );
};

export default Settings;