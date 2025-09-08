import React, { useState } from 'react';
import { useMediaApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Favorites: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkCheckModal, setShowBulkCheckModal] = useState(false);

  // Favorites data hooks
  const { data: favoritesData, isLoading: favoritesLoading } = useMediaApi.favorites.useGetFavorites({
    accountId: selectedAccount || undefined,
    type: filterType || undefined,
    limit: 50
  });

  const { data: stats } = useMediaApi.favorites.useGetFavoriteStats({
    accountId: selectedAccount || undefined
  });

  const { data: recentFavorites } = useMediaApi.favorites.useGetRecentFavorites({
    limit: 10,
    accountId: selectedAccount || undefined
  });

  // Mutation hooks
  const addToFavorites = useMediaApi.favorites.useAddToFavorites();
  const removeFromFavorites = useMediaApi.favorites.useRemoveFromFavorites();
  const bulkCheckStatus = useMediaApi.favorites.useBulkCheckFavoriteStatus();

  // Accounts data for account selection
  const { data: accountsData } = useMediaApi.accounts.useGetAll();

  // Form states
  const [addForm, setAddForm] = useState({
    mediaId: '',
    type: 'movie' as 'movie' | 'tvshow' | 'episode',
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    platform: 'media',
    accountId: '',
    metadata: {}
  });

  const [bulkCheckForm, setBulkCheckForm] = useState({
    mediaIds: '',
    accountId: '',
    platform: 'media',
    type: ''
  });

  const [bulkCheckResults, setBulkCheckResults] = useState<any>(null);

  // Handle adding to favorites
  const handleAddToFavorites = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addToFavorites.mutateAsync(addForm);
      setShowAddModal(false);
      setAddForm({
        mediaId: '',
        type: 'movie',
        title: '',
        description: '',
        thumbnailUrl: '',
        videoUrl: '',
        platform: 'media',
        accountId: '',
        metadata: {}
      });
      alert('Item added to favorites successfully!');
    } catch (error: any) {
      alert(`Failed to add to favorites: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle removing from favorites
  const handleRemoveFromFavorites = async (favoriteId: string) => {
    if (confirm('Are you sure you want to remove this item from favorites?')) {
      try {
        await removeFromFavorites.mutateAsync(favoriteId);
        alert('Item removed from favorites successfully!');
      } catch (error: any) {
        alert(`Failed to remove from favorites: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Handle bulk check
  const handleBulkCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mediaIds = bulkCheckForm.mediaIds.split(',').map(id => id.trim()).filter(id => id);
      const result = await bulkCheckStatus.mutateAsync({
        mediaIds,
        accountId: bulkCheckForm.accountId || undefined,
        platform: bulkCheckForm.platform,
        type: bulkCheckForm.type || undefined
      });
      setBulkCheckResults(result);
    } catch (error: any) {
      alert(`Bulk check failed: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-breachfix-navy flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-breachfix-white mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please log in to access your favorites.</p>
        </div>
      </div>
    );
  }

  if (favoritesLoading) {
    return (
      <div className="min-h-screen bg-breachfix-navy flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const favorites = favoritesData?.favorites || [];

  return (
    <div className="min-h-screen bg-breachfix-navy text-breachfix-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Favorites</h1>
          <p className="text-gray-400">Manage your favorite movies, TV shows, and episodes</p>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Favorites</h3>
              <p className="text-3xl font-bold text-netflix-red">{stats.total || 0}</p>
            </div>
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Movies</h3>
              <p className="text-3xl font-bold text-blue-500">{stats.byType?.movie || 0}</p>
            </div>
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">TV Shows</h3>
              <p className="text-3xl font-bold text-green-500">{stats.byType?.tvshow || 0}</p>
            </div>
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Episodes</h3>
              <p className="text-3xl font-bold text-yellow-500">{stats.byType?.episode || 0}</p>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Account Filter */}
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-semibold mb-2">Filter by Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2 bg-netflix-dark-gray rounded border border-gray-600 text-white"
            >
              <option value="">All Accounts</option>
              {accountsData?.accounts?.map((account: any) => (
                <option key={account._id} value={account._id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-semibold mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 bg-netflix-dark-gray rounded border border-gray-600 text-white"
            >
              <option value="">All Types</option>
              <option value="movie">Movies</option>
              <option value="tvshow">TV Shows</option>
              <option value="episode">Episodes</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Add Favorite
            </button>
            <button
              onClick={() => setShowBulkCheckModal(true)}
              className="bg-netflix-gray hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Bulk Check
            </button>
          </div>
        </div>

        {/* Recent Favorites */}
        {recentFavorites && recentFavorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recently Added</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentFavorites.slice(0, 6).map((favorite: any) => (
                <motion.div
                  key={favorite._id}
                  className="bg-netflix-dark-gray rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{favorite.title}</h3>
                      <p className="text-sm text-gray-400 capitalize">{favorite.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      favorite.type === 'movie' ? 'bg-blue-500' :
                      favorite.type === 'tvshow' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {favorite.type}
                    </span>
                  </div>
                  
                  {favorite.thumbnailUrl && (
                    <img
                      src={favorite.thumbnailUrl}
                      alt={favorite.title}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  
                  {favorite.description && (
                    <p className="text-sm text-breachfix-white mb-3 line-clamp-2">
                      {favorite.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {new Date(favorite.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleRemoveFromFavorites(favorite._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Favorites */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            All Favorites ({favorites.length})
          </h2>
          
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No favorites found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Your First Favorite
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite: any) => (
                <motion.div
                  key={favorite._id}
                  className="bg-netflix-dark-gray rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold line-clamp-2">{favorite.title}</h3>
                      <p className="text-sm text-gray-400 capitalize">{favorite.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
                      favorite.type === 'movie' ? 'bg-blue-500' :
                      favorite.type === 'tvshow' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {favorite.type}
                    </span>
                  </div>
                  
                  {favorite.thumbnailUrl && (
                    <img
                      src={favorite.thumbnailUrl}
                      alt={favorite.title}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}
                  
                  {favorite.description && (
                    <p className="text-sm text-breachfix-white mb-3 line-clamp-3">
                      {favorite.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-xs text-gray-400 mb-3">
                    <p><span className="font-semibold">Platform:</span> {favorite.platform}</p>
                    {favorite.accountId && (
                      <p><span className="font-semibold">Account:</span> {favorite.accountId}</p>
                    )}
                    <p><span className="font-semibold">Added:</span> {new Date(favorite.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveFromFavorites(favorite._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm"
                    >
                      Remove
                    </button>
                    {favorite.videoUrl && (
                      <Link
                        to={`/watch/${favorite.type}/${favorite.mediaId}`}
                        className="flex-1 bg-netflix-red hover:bg-red-700 text-white py-2 rounded text-sm text-center"
                      >
                        Watch
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Favorite Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-netflix-dark-gray p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add to Favorites</h2>
              <form onSubmit={handleAddToFavorites} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Media ID</label>
                  <input
                    type="text"
                    value={addForm.mediaId}
                    onChange={(e) => setAddForm({ ...addForm, mediaId: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value as any })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    required
                  >
                    <option value="movie">Movie</option>
                    <option value="tvshow">TV Show</option>
                    <option value="episode">Episode</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={addForm.thumbnailUrl}
                    onChange={(e) => setAddForm({ ...addForm, thumbnailUrl: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Video URL</label>
                  <input
                    type="url"
                    value={addForm.videoUrl}
                    onChange={(e) => setAddForm({ ...addForm, videoUrl: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Account (Optional)</label>
                  <select
                    value={addForm.accountId}
                    onChange={(e) => setAddForm({ ...addForm, accountId: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                  >
                    <option value="">No Account</option>
                    {accountsData?.accounts?.map((account: any) => (
                      <option key={account._id} value={account._id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-netflix-red hover:bg-red-700 text-white py-2 rounded font-semibold"
                    disabled={addToFavorites.isPending}
                  >
                    {addToFavorites.isPending ? 'Adding...' : 'Add to Favorites'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Check Modal */}
        {showBulkCheckModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-netflix-dark-gray p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Bulk Check Favorite Status</h2>
              <form onSubmit={handleBulkCheck} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Media IDs (comma-separated)</label>
                  <textarea
                    value={bulkCheckForm.mediaIds}
                    onChange={(e) => setBulkCheckForm({ ...bulkCheckForm, mediaIds: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    rows={4}
                    placeholder="mediaId1, mediaId2, mediaId3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Account (Optional)</label>
                  <select
                    value={bulkCheckForm.accountId}
                    onChange={(e) => setBulkCheckForm({ ...bulkCheckForm, accountId: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                  >
                    <option value="">No Account</option>
                    {accountsData?.accounts?.map((account: any) => (
                      <option key={account._id} value={account._id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Type (Optional)</label>
                  <select
                    value={bulkCheckForm.type}
                    onChange={(e) => setBulkCheckForm({ ...bulkCheckForm, type: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                  >
                    <option value="">All Types</option>
                    <option value="movie">Movie</option>
                    <option value="tvshow">TV Show</option>
                    <option value="episode">Episode</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                    disabled={bulkCheckStatus.isPending}
                  >
                    {bulkCheckStatus.isPending ? 'Checking...' : 'Check Status'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkCheckModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              
              {/* Bulk Check Results */}
              {bulkCheckResults && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Results</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {Object.entries(bulkCheckResults).map(([mediaId, status]: [string, any]) => (
                      <div key={mediaId} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span className="text-sm truncate">{mediaId}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          status.isFavorited ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          {status.isFavorited ? 'Favorited' : 'Not Favorited'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
