import React, { useState } from 'react';
import { useAuthStore } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { motion } from 'framer-motion';
import MovieCard from '../components/media/MovieCard';


interface Favorite {
  _id: string;
  contentId: string;
  contentType: 'movie' | 'tvshow' | 'episode';
  title: string;
  description: string;
  posterFileUrl: string;
  thumbnail_url_s3?: string;
  genres: string[];
  isFree: boolean;
  price?: number;
  rating?: number;
  duration?: number;
  createdAt: string;
}

interface WatchHistory {
  _id: string;
  contentId: string;
  contentType: 'movie' | 'tvshow' | 'episode';
  title: string;
  posterFileUrl: string;
  thumbnail_url_s3?: string;
  watchedAt: string;
  progress: number; // percentage watched
}

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: (user as any)?.bio || ''
  });

  // Fetch user favorites
  const { data: favorites, isLoading: favoritesLoading } = useApi<Favorite[]>(
    ['user-favorites'],
    '/favorites?type=all',
    { enabled: isAuthenticated, staleTime: 1000 * 60 * 5 }
  );

  // Fetch watch history
  const { data: watchHistory, isLoading: historyLoading } = useApi<WatchHistory[]>(
    ['user-watch-history'],
    '/favorites/watch-history',
    { enabled: isAuthenticated, staleTime: 1000 * 60 * 5 }
  );


  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bridge-navy flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-bridge-white mb-4">Please log in to view your profile</h1>
          <p className="text-bridge-gray">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bridge-navy">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-bridge-dark rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <img
              src={user?.profileUrl || `https://placehold.co/120x120/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-netflix-red"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/120x120/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`;
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-bridge-white mb-2">{user?.username}</h1>
              <p className="text-bridge-white mb-1">{user?.email}</p>
              <p className="text-bridge-gray text-sm capitalize">Role: {user?.role}</p>
              {(user as any)?.bio && <p className="text-bridge-white mt-2">{(user as any).bio}</p>}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-netflix-gray mb-8">
          {[
            { key: 'profile', label: 'Profile' },
            { key: 'favorites', label: 'My List' },
            { key: 'history', label: 'Watch History' },
            { key: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-bridge-white hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'profile' && (
            <div className="bg-bridge-dark rounded-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-bridge-white">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <label className="block text-bridge-white mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleInputChange}
                      className="w-full bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    />
                  </div>
                  <div>
                    <label className="block text-bridge-white mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    />
                  </div>
                  <div>
                    <label className="block text-bridge-white mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-netflix-gray hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-bridge-gray">Username:</span>
                    <p className="text-white">{user?.username}</p>
                  </div>
                  <div>
                    <span className="text-bridge-gray">Email:</span>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-bridge-gray">Role:</span>
                    <p className="text-white capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <span className="text-bridge-gray">Member since:</span>
                    <p className="text-white">{new Date((user as any)?.createdAt || '').toLocaleDateString()}</p>
                  </div>
                  {(user as any)?.bio && (
                    <div>
                      <span className="text-bridge-gray">Bio:</span>
                      <p className="text-white">{(user as any).bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold text-bridge-white mb-6">My List</h2>
              {favoritesLoading ? (
                <div className="flex justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                  />
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {favorites.map((favorite) => (
                    <MovieCard
                      key={favorite._id}
                      movie={{...favorite, language: 'English'}}
                      baseUrl={favorite.contentType === 'movie' ? '/movies' : '/tvshows'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-bridge-gray text-xl mb-4">No favorites yet</div>
                  <p className="text-gray-500">Start adding movies and TV shows to your list</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold text-bridge-white mb-6">Watch History</h2>
              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                  />
                </div>
              ) : watchHistory && watchHistory.length > 0 ? (
                <div className="space-y-4">
                  {watchHistory.map((item) => (
                    <div key={item._id} className="bg-bridge-dark rounded-lg p-4 flex items-center space-x-4">
                      <img
                        src={item.posterFileUrl || item.thumbnail_url_s3 || `https://placehold.co/80x120/141414/ffffff?text=${item.title}`}
                        alt={item.title}
                        className="w-20 h-28 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        <p className="text-bridge-gray text-sm capitalize">{item.contentType}</p>
                        <p className="text-bridge-gray text-sm">
                          Watched {new Date(item.watchedAt).toLocaleDateString()}
                        </p>
                        <div className="w-full bg-netflix-gray rounded-full h-2 mt-2">
                          <div
                            className="bg-netflix-red h-2 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-bridge-gray text-xs">{item.progress}% watched</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-bridge-gray text-xl mb-4">No watch history</div>
                  <p className="text-gray-500">Start watching content to see your history here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-bridge-dark rounded-lg p-8">
              <h2 className="text-2xl font-bold text-bridge-white mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-bridge-white mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-bridge-white">
                      <input type="checkbox" defaultChecked className="rounded focus:ring-2 focus:ring-netflix-red" />
                      Email notifications
                    </label>
                    <label className="flex items-center gap-3 text-bridge-white">
                      <input type="checkbox" defaultChecked className="rounded focus:ring-2 focus:ring-netflix-red" />
                      Push notifications
                    </label>
                    <label className="flex items-center gap-3 text-bridge-white">
                      <input type="checkbox" className="rounded focus:ring-2 focus:ring-netflix-red" />
                      Marketing emails
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-bridge-white mb-4">Privacy</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-bridge-white">
                      <select className="bg-netflix-gray text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red">
                        <option value="public">Public Profile</option>
                        <option value="private">Private Profile</option>
                      </select>
                      Profile visibility
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-bridge-white mb-4">Security</h3>
                  <div className="space-y-3">
                    <button className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200">
                      Change Password
                    </button>
                    <button className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200">
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                </div>

                <div className="border-t border-netflix-gray pt-6">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
