import React, { useState } from 'react';
import type { User } from '../../types';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import DeleteAccountModal from '../../components/modals/DeleteAccountModal';

interface AccountSettingsProps {
  user: User;
  onConnectYouTube: () => void;
  onDisconnectYouTube: () => void;
  onAccountDelete: () => void;
}

const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode; danger?: boolean }> = ({ title, description, children, danger = false }) => (
  <div className={`rounded-lg border ${danger ? 'border-red-500/30' : 'border-gray-200 dark:border-gray-700'} bg-gray-100 dark:bg-gray-900/30`}>
    <div className="p-6">
      <h3 className={`text-lg font-semibold ${danger ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-4 rounded-b-lg">
      {children}
    </div>
  </div>
);

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onConnectYouTube, onDisconnectYouTube, onAccountDelete }) => {
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <SettingCard title="Email Address" description="Your email address is used for signing in and account-related communications.">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.email}</p>
      </SettingCard>

      {user.authProvider === 'password' && (
        <SettingCard title="Password" description="Change your password to keep your account secure.">
          <button 
            onClick={() => setPasswordModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700"
          >
            Change Password
          </button>
        </SettingCard>
      )}

      <SettingCard title="Connected Accounts" description="Manage third-party accounts connected to Synapse.">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-600" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
              <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
            </svg>
            <span className="font-semibold">{user.channelId || 'YouTube'}</span>
          </div>
          {user.youtubeToken ? (
            <button
              onClick={onDisconnectYouTube}
              className="px-3 py-1 text-xs font-semibold text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnectYouTube}
              className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </SettingCard>

      <SettingCard title="Delete Account" description="Permanently delete your account and all associated data. This action is irreversible." danger>
        <button 
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Delete Account
        </button>
      </SettingCard>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onAccountDelete}
        // FIX: Pass the user's authProvider to the modal, as it's a required prop.
        authProvider={user.authProvider}
      />
    </div>
  );
};

export default AccountSettings;
