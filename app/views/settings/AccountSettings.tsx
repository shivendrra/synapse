import React, { useState } from 'react';
import type { User } from '../../types';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';

interface AccountSettingsProps {
  user: User;
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

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Account Settings</h2>
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
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AccountSettings;