import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import DeleteAccountModal from '../components/modals/DeleteAccountModal';
import { isUsernameAvailable } from '../services/firebase';

interface SettingsProps {
  user: User;
  onConnectYouTube: () => void;
  onDisconnectYouTube: () => void;
  onAccountDelete: () => Promise<void>;
  onProfileUpdate: (updates: { username?: string; displayName?: string; photoURL?: string; }) => Promise<void>;
  showYouTubePlaylists: boolean;
  onToggleYouTubePlaylists: () => void;
}

const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode; danger?: boolean }> = ({ title, description, children, danger = false }) => (
  <div className={`rounded-lg border ${danger ? 'border-red-500/30' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900/50`}>
    <div className="p-6">
      <h3 className={`text-lg font-semibold ${danger ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    {children}
  </div>
);

const Settings: React.FC<SettingsProps> = (props) => {
  // Fix: Removed 'authProvider' from destructuring. It's part of the 'user' object.
  const { user, onProfileUpdate, onAccountDelete } = props;

  // Modals
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Profile state
  const [username, setUsername] = useState(user.username);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [photoURL, setPhotoURL] = useState(user.photoURL);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isProfileChanged = username !== user.username || displayName !== user.displayName || photoURL !== user.photoURL;

  useEffect(() => {
    setUsername(user.username);
    setDisplayName(user.displayName);
    setPhotoURL(user.photoURL);
  }, [user]);

  useEffect(() => {
    if (username === user.username) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
      setUsernameStatus('idle'); // or an invalid state
      return;
    }

    setUsernameStatus('checking');
    const debounceCheck = setTimeout(async () => {
      const available = await isUsernameAvailable(username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(debounceCheck);
  }, [username, user.username]);


  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileChanged) return;
    if (usernameStatus === 'taken' || usernameStatus === 'checking') return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await onProfileUpdate({ username, displayName, photoURL });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const usernameHint = () => {
    switch (usernameStatus) {
      case 'checking': return <p className="text-xs text-gray-500 mt-1">Checking availability...</p>;
      case 'available': return <p className="text-xs text-green-500 mt-1">Username is available!</p>;
      case 'taken': return <p className="text-xs text-red-500 mt-1">Username is taken.</p>;
      default:
        if (username.length > 0 && !/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
          return <p className="text-xs text-red-500 mt-1">3-15 characters, letters, numbers, and underscores only.</p>
        }
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Settings</h1>
      <div className="space-y-10">

        {/* Profile Settings */}
        <form onSubmit={handleSubmitProfile}>
          <SettingCard
            title="Public Profile"
            description="This information will be displayed publicly on your profile page."
          >
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-sm"
                />
                {usernameHint()}
              </div>
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL</label>
                <input
                  type="text"
                  id="photoURL"
                  value={photoURL}
                  onChange={e => setPhotoURL(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-sm"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-4 rounded-b-lg text-right">
              <button
                type="submit"
                disabled={!isProfileChanged || loading || usernameStatus === 'taken' || usernameStatus === 'checking'}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:bg-brand-400/50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </SettingCard>
        </form>

        {/* Account Settings */}
        <div className="space-y-6">
          <SettingCard title="Email Address" description="Your email address is used for signing in and account-related communications.">
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.email}</p>
            </div>
          </SettingCard>
          {user.authProvider === 'password' && (
            <SettingCard title="Password" description="Change your password to keep your account secure.">
              <div className="px-6 py-4">
                <button onClick={() => setPasswordModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700">Change Password</button>
              </div>
            </SettingCard>
          )}
        </div>

        {/* Connections */}
        <div className="space-y-6">
          <SettingCard title="Connected Accounts" description="Manage third-party accounts connected to Synapse.">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-brand-600" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
                <span className="font-semibold">{user.channelId || 'YouTube'}</span>
              </div>
              {user.youtubeToken ? <button onClick={props.onDisconnectYouTube} className="px-3 py-1 text-xs font-semibold text-brand-600 border border-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-colors">Disconnect</button> : <button onClick={props.onConnectYouTube} className="px-3 py-1 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors">Connect</button>}
            </div>
          </SettingCard>
          {user.youtubeToken && (
            <SettingCard title="YouTube Integration" description="Control how Synapse interacts with your YouTube account.">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Sync Playlists & Subscriptions</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Show your YouTube content in the app.</p>
                </div>
                <button onClick={props.onToggleYouTubePlaylists} className={`${props.showYouTubePlaylists ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`} role="switch" aria-checked={props.showYouTubePlaylists}>
                  <span aria-hidden="true" className={`${props.showYouTubePlaylists ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>
            </SettingCard>
          )}
        </div>

        {/* Danger Zone */}
        <div>
          <SettingCard title="Danger Zone" description="Permanently delete your account and all associated data. This action is irreversible." danger>
            <div className="px-6 py-4">
              <button onClick={() => setDeleteModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Delete Account</button>
            </div>
          </SettingCard>
        </div>

      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={onAccountDelete} authProvider={user.authProvider} />
    </div>
  );
};

export default Settings;