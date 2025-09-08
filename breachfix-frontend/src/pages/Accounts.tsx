import React, { useState } from 'react';
import { useMediaApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Accounts: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Account data hooks
  const { data: accountsData, isLoading: accountsLoading } = useMediaApi.accounts.useGetAll();
  const { data: selectedAccountData } = useMediaApi.accounts.useGetById(selectedAccount || '', {
    enabled: !!selectedAccount
  });

  // Mutation hooks
  const createAccount = useMediaApi.accounts.useCreate();
  const updateAccount = useMediaApi.accounts.useUpdate();
  const deleteAccount = useMediaApi.accounts.useDelete();
  const reactivateAccount = useMediaApi.accounts.useReactivate();
  const validatePin = useMediaApi.accounts.useValidatePin();
  const changePin = useMediaApi.accounts.useChangePin();
  const addUserRole = useMediaApi.accounts.useAddUserRole();
  const uploadAvatar = useMediaApi.accounts.useUploadAvatar();

  // Admin hooks
  const { data: analytics } = useMediaApi.accounts.useGetAnalytics();

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    pin: '',
    type: 'standard' as 'standard' | 'kids' | 'adult'
  });

  const [pinForm, setPinForm] = useState({
    accountId: '',
    pin: '',
    currentPin: '',
    newPin: ''
  });

  const [roleForm, setRoleForm] = useState({
    targetUserId: '',
    role: 'viewer' as 'owner' | 'editor' | 'viewer'
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Handle account creation
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount.mutateAsync(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', pin: '', type: 'standard' });
      alert('Account created successfully!');
    } catch (error: any) {
      alert(`Failed to create account: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle PIN validation
  const handleValidatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await validatePin.mutateAsync({
        accountId: pinForm.accountId,
        pin: pinForm.pin
      });
      alert(`PIN validation: ${result.message}`);
    } catch (error: any) {
      alert(`PIN validation failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle PIN change
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePin.mutateAsync({
        accountId: pinForm.accountId,
        data: {
          currentPin: pinForm.currentPin,
          newPin: pinForm.newPin
        }
      });
      setShowPinModal(false);
      setPinForm({ accountId: '', pin: '', currentPin: '', newPin: '' });
      alert('PIN changed successfully!');
    } catch (error: any) {
      alert(`Failed to change PIN: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle role management
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    
    try {
      await addUserRole.mutateAsync({
        accountId: selectedAccount,
        data: {
          targetUserId: roleForm.targetUserId,
          role: roleForm.role
        }
      });
      setShowRoleModal(false);
      setRoleForm({ targetUserId: '', role: 'viewer' });
      alert('Role added successfully!');
    } catch (error: any) {
      alert(`Failed to add role: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !avatarFile) return;

    try {
      await uploadAvatar.mutateAsync({
        accountId: selectedAccount,
        file: avatarFile
      });
      setShowAvatarModal(false);
      setAvatarFile(null);
      alert('Avatar uploaded successfully!');
    } catch (error: any) {
      alert(`Failed to upload avatar: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-netflix-white mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please log in to access account management.</p>
        </div>
      </div>
    );
  }

  if (accountsLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const accounts = accountsData?.accounts || [];

  return (
    <div className="min-h-screen bg-netflix-black text-netflix-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Account Management</h1>
          <p className="text-gray-400">Manage your sub-accounts with role-based access control</p>
        </div>

        {/* Analytics Dashboard */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Accounts</h3>
              <p className="text-3xl font-bold text-netflix-red">{analytics.totalAccounts}</p>
            </div>
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Active Accounts</h3>
              <p className="text-3xl font-bold text-green-500">{analytics.activeAccounts}</p>
            </div>
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Locked Accounts</h3>
              <p className="text-3xl font-bold text-yellow-500">{analytics.lockedAccounts}</p>
            </div>
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Deleted Accounts</h3>
              <p className="text-3xl font-bold text-red-500">{analytics.deletedAccounts}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Create New Account
          </button>
          <button
            onClick={() => setShowPinModal(true)}
            className="bg-netflix-gray hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            PIN Management
          </button>
          <button
            onClick={() => setShowRoleModal(true)}
            className="bg-netflix-gray hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Manage Roles
          </button>
          <button
            onClick={() => setShowAvatarModal(true)}
            className="bg-netflix-gray hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Upload Avatar
          </button>
        </div>

        {/* Accounts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account: any) => (
            <motion.div
              key={account._id}
              className="bg-netflix-dark-gray rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setSelectedAccount(account._id)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{account.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  account.isActive ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                }`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="font-semibold">Type:</span> {account.type}</p>
                <p><span className="font-semibold">Roles:</span> {account.roles.length}</p>
                <p><span className="font-semibold">Created:</span> {new Date(account.createdAt).toLocaleDateString()}</p>
              </div>

              {account.avatar && (
                <img
                  src={account.avatar}
                  alt={`${account.name} avatar`}
                  className="w-16 h-16 rounded-full mx-auto mt-4"
                />
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAccount.mutate({
                      accountId: account._id,
                      data: { name: `${account.name} (Updated)` }
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this account?')) {
                      deleteAccount.mutate(account._id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
                {!account.isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reactivateAccount.mutate(account._id);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Account Details */}
        {selectedAccountData && (
          <div className="mt-8 bg-netflix-dark-gray rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Account Details: {selectedAccountData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">ID:</span> {selectedAccountData._id}</p>
                  <p><span className="font-semibold">Type:</span> {selectedAccountData.type}</p>
                  <p><span className="font-semibold">Status:</span> {selectedAccountData.isActive ? 'Active' : 'Inactive'}</p>
                  <p><span className="font-semibold">Created:</span> {new Date(selectedAccountData.createdAt).toLocaleString()}</p>
                  <p><span className="font-semibold">Updated:</span> {new Date(selectedAccountData.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Roles ({selectedAccountData.roles.length})</h3>
                <div className="space-y-2">
                  {selectedAccountData.roles.map((role: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                      <span className="text-sm">{role.userId}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        role.role === 'owner' ? 'bg-red-500' :
                        role.role === 'editor' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {role.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            {selectedAccountData.auditLogs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedAccountData.auditLogs.slice(-5).map((log: any, index: number) => (
                    <div key={index} className="bg-gray-800 p-2 rounded text-sm">
                      <span className="font-semibold">{log.action}</span>
                      <span className="text-gray-400 ml-2">{new Date(log.date).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-netflix-dark-gray p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Create New Account</h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Account Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">PIN (4 digits)</label>
                  <input
                    type="password"
                    value={createForm.pin}
                    onChange={(e) => setCreateForm({ ...createForm, pin: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Account Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="kids">Kids</option>
                    <option value="adult">Adult</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-netflix-red hover:bg-red-700 text-white py-2 rounded font-semibold"
                    disabled={createAccount.isPending}
                  >
                    {createAccount.isPending ? 'Creating...' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PIN Management Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-netflix-dark-gray p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">PIN Management</h2>
              <form onSubmit={handleValidatePin} className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Validate PIN</h3>
                <div>
                  <label className="block text-sm font-semibold mb-2">Account ID</label>
                  <input
                    type="text"
                    value={pinForm.accountId}
                    onChange={(e) => setPinForm({ ...pinForm, accountId: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">PIN</label>
                  <input
                    type="password"
                    value={pinForm.pin}
                    onChange={(e) => setPinForm({ ...pinForm, pin: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                  disabled={validatePin.isPending}
                >
                  {validatePin.isPending ? 'Validating...' : 'Validate PIN'}
                </button>
              </form>

              <form onSubmit={handleChangePin} className="space-y-4">
                <h3 className="text-lg font-semibold">Change PIN</h3>
                <div>
                  <label className="block text-sm font-semibold mb-2">Current PIN</label>
                  <input
                    type="password"
                    value={pinForm.currentPin}
                    onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">New PIN</label>
                  <input
                    type="password"
                    value={pinForm.newPin}
                    onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
                    disabled={changePin.isPending}
                  >
                    {changePin.isPending ? 'Changing...' : 'Change PIN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Role Management Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-netflix-dark-gray p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Manage Roles</h2>
              <form onSubmit={handleAddRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Account ID</label>
                  <input
                    type="text"
                    value={selectedAccount || ''}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    placeholder="Enter account ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">User ID</label>
                  <input
                    type="text"
                    value={roleForm.targetUserId}
                    onChange={(e) => setRoleForm({ ...roleForm, targetUserId: e.target.value })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Role</label>
                  <select
                    value={roleForm.role}
                    onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value as any })}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-netflix-red hover:bg-red-700 text-white py-2 rounded font-semibold"
                    disabled={addUserRole.isPending}
                  >
                    {addUserRole.isPending ? 'Adding...' : 'Add Role'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Avatar Upload Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-netflix-dark-gray p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Upload Avatar</h2>
              <form onSubmit={handleAvatarUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Account ID</label>
                  <input
                    type="text"
                    value={selectedAccount || ''}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    placeholder="Enter account ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Avatar File</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Max size: 10MB. Supported: JPEG, PNG, WebP</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-netflix-red hover:bg-red-700 text-white py-2 rounded font-semibold"
                    disabled={uploadAvatar.isPending || !avatarFile}
                  >
                    {uploadAvatar.isPending ? 'Uploading...' : 'Upload Avatar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;
