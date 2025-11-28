import React, { useState, useEffect } from 'react';
import type { User, Playlist } from '../types';
import { getChannelDetails } from '../services/youtube';
import { getUserByUsername, getPlaylists } from '../services/firebase';

interface ProfileProps {
  username: string;
  currentUser: User | null;
  onSelectPlaylist: (playlistId: string) => void;
  navigate: (path: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ username, currentUser, onSelectPlaylist, navigate }) => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.username === profileUser?.username;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      setProfileUser(null);
      setUserPlaylists([]);

      try {
        const user = await getUserByUsername(username);
        if (user) {
          setProfileUser(user);
          const playlists = await getPlaylists(user.uid);
          setUserPlaylists(playlists);
        } else {
          setError("User not found.");
        }
      } catch (err: any) {
        console.error(err);
        setError(`Failed to load profile data. ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  if (loading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!profileUser) {
    return <div className="text-center p-10">This profile could not be found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <img src={profileUser.photoURL} alt={profileUser.displayName} className="w-24 h-24 rounded-full" />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{profileUser.displayName}</h1>
          <p className="text-md text-gray-500 dark:text-gray-400">@{profileUser.username}</p>
        </div>
        {isOwnProfile && (
          <button onClick={() => navigate('/settings')} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700">
            Account Settings
          </button>
        )}
      </div>

      {/* Playlists */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Public Playlists</h2>
        {userPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userPlaylists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className="p-4 rounded-lg text-left bg-gray-200 dark:bg-gray-900/50 hover:bg-gray-300 dark:hover:bg-gray-800 transition-all duration-200 transform hover:-translate-y-1"
              >
                <h3 className="font-bold truncate">{playlist.name}</h3>
                <p className="text-sm opacity-80">{playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">This user hasn't created any public playlists yet.</p>
        )}
      </div>

    </div>
  );
};

export default Profile;