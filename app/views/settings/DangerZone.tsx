import React, { useState } from 'react';
import DeleteAccountModal from '../../components/modals/DeleteAccountModal';

interface DangerZoneProps {
  // Fix: Changed return type to Promise<void> to match expected prop type in DeleteAccountModal
  onAccountDelete: () => Promise<void>;
  authProvider: string;
}

const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode; danger?: boolean }> = ({ title, description, children, danger = false }) => (
  <div className={`rounded-lg border ${danger ? 'border-brand-600/30' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900/50`}>
    <div className="p-6">
      <h3 className={`text-lg font-semibold ${danger ? 'text-brand-600' : 'text-gray-800 dark:text-white'}`}>{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-4 rounded-b-lg">
      {children}
    </div>
  </div>
);

const DangerZone: React.FC<DangerZoneProps> = ({ onAccountDelete, authProvider }) => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Security</h2>
        <SettingCard title="Delete Account" description="Permanently delete your account and all associated data. This action is irreversible." danger>
            <button 
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700"
            >
            Delete Account
            </button>
        </SettingCard>

        <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={onAccountDelete}
            authProvider={authProvider}
        />
    </div>
  );
};

export default DangerZone;