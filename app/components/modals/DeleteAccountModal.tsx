import React, { useState } from 'react';
import { deleteUserAccount, reauthenticateUser } from '../../services/firebase';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  authProvider: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm, authProvider }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 for confirmation, 2 for password (if needed)

  const needsReauth = authProvider === 'password';

  const handleClose = () => {
    // Reset state on close
    setConfirmationText('');
    setPassword('');
    setError(null);
    setLoading(false);
    setStep(1);
    onClose();
  };

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      if (needsReauth && step === 2) {
        await reauthenticateUser(password);
      }
      await onConfirm(); // This will trigger delete and logout in App.tsx
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsReauth) {
      setStep(2);
    } else {
      handleDelete();
    }
  };
  
  const handlePasswordConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    handleDelete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-red-500 mb-2">Delete Account</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleInitialConfirm}>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This is a permanent action and cannot be undone. All your playlists and account data will be lost.
              Please type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button
                type="submit"
                disabled={confirmationText !== 'DELETE'}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400/50 disabled:cursor-not-allowed"
              >
                {needsReauth ? 'Continue' : 'Delete My Account'}
              </button>
            </div>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handlePasswordConfirm}>
             <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              For your security, please re-enter your password to confirm account deletion.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              autoFocus
            />
             <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400/50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;