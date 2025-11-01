import React, { useState, useEffect } from 'react';
import type { User } from '../../types';

interface ProfileSettingsProps {
    user: User;
    onProfileUpdate: (updates: { displayName?: string; photoURL?: string; }) => Promise<void>;
}

const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
  <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50`}>
    <div className="p-6">
      <h3 className={`text-lg font-semibold text-gray-800 dark:text-white`}>{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    {children}
  </div>
);

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onProfileUpdate }) => {
    const [name, setName] = useState(user.name);
    const [photoURL, setPhotoURL] = useState(user.photoURL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isChanged = name !== user.name || photoURL !== user.photoURL;

    useEffect(() => {
        setName(user.name);
        setPhotoURL(user.photoURL);
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isChanged) return;
        
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            await onProfileUpdate({ displayName: name, photoURL });
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profile Settings</h2>
            <form onSubmit={handleSubmit}>
                <SettingCard 
                    title="Public Profile" 
                    description="This information will be displayed publicly."
                >
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                value={name}
                                onChange={e => setName(e.target.value)}
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
                            disabled={!isChanged || loading}
                            className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:bg-brand-400/50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </SettingCard>
            </form>
        </div>
    );
};

export default ProfileSettings;