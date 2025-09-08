import React, { useState } from 'react';
import { useAuthStore } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

interface Content {
  _id: string;
  title: string;
  contentType: 'movie' | 'tvshow' | 'episode';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  creator: string;
}

interface SystemStats {
  totalUsers: number;
  totalContent: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'settings'>('dashboard');

  // Fetch system statistics
  const { data: stats } = useApi<SystemStats>(
    ['admin-stats'],
    '/admin/stats',
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  // Fetch users
  const { data: users, isLoading: usersLoading } = useApi<{ users: User[]; total: number }>(
    ['admin-users'],
    '/admin/users?page=1&limit=20',
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  // Fetch content
  const { data: content, isLoading: contentLoading } = useApi<{ content: Content[]; total: number }>(
    ['admin-content'],
    '/admin/content?type=all&status=pending&page=1&limit=20',
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-breachfix-navy flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-breachfix-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-breachfix-navy">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-breachfix-white mb-4">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your platform and monitor system performance</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-netflix-gray mb-8">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'users', label: 'Users' },
            { key: 'content', label: 'Content' },
            { key: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-breachfix-white hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-netflix-dark-gray rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-breachfix-white">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="bg-blue-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-netflix-dark-gray rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Content</p>
                      <p className="text-2xl font-bold text-breachfix-white">{stats?.totalContent || 0}</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-netflix-dark-gray rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-breachfix-white">${stats?.totalRevenue || 0}</p>
                    </div>
                    <div className="bg-yellow-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-netflix-dark-gray rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Subscriptions</p>
                      <p className="text-2xl font-bold text-breachfix-white">{stats?.activeSubscriptions || 0}</p>
                    </div>
                    <div className="bg-purple-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <div className="bg-netflix-dark-gray rounded-lg p-6">
                <h2 className="text-xl font-bold text-breachfix-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-netflix-gray rounded">
                    <div className="bg-green-500 p-2 rounded-full">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white">New user registered</p>
                      <p className="text-gray-400 text-sm">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-netflix-gray rounded">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white">Content approved</p>
                      <p className="text-gray-400 text-sm">15 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-breachfix-white">User Management</h2>
                <button className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200">
                  Add User
                </button>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-gray-400 border-b border-netflix-gray">
                      <tr>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.users?.map((user) => (
                        <tr key={user._id} className="border-b border-netflix-gray">
                          <td className="py-3 px-4 text-white">{user.username}</td>
                          <td className="py-3 px-4 text-breachfix-white">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-breachfix-white">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-400 hover:text-blue-300">Edit</button>
                              <button className="text-red-400 hover:text-red-300">Suspend</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-breachfix-white">Content Management</h2>
                <div className="flex space-x-2">
                  <button className="bg-netflix-gray hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200">
                    Pending
                  </button>
                  <button className="bg-netflix-gray hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200">
                    Approved
                  </button>
                  <button className="bg-netflix-gray hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200">
                    Rejected
                  </button>
                </div>
              </div>

              {contentLoading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-gray-400 border-b border-netflix-gray">
                      <tr>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Creator</th>
                        <th className="py-3 px-4">Submitted</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content?.content?.map((item) => (
                        <tr key={item._id} className="border-b border-netflix-gray">
                          <td className="py-3 px-4 text-white">{item.title}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white capitalize">
                              {item.contentType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.status === 'approved' ? 'bg-green-500 text-white' :
                              item.status === 'rejected' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-white'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-breachfix-white">{item.creator}</td>
                          <td className="py-3 px-4 text-breachfix-white">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="text-green-400 hover:text-green-300">Approve</button>
                              <button className="text-red-400 hover:text-red-300">Reject</button>
                              <button className="text-blue-400 hover:text-blue-300">View</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h2 className="text-xl font-bold text-breachfix-white mb-6">System Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-breachfix-white mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-breachfix-white">Maintenance Mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-breachfix-white">User Registration</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-breachfix-white mb-4">Content Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-breachfix-white mb-2">Max Upload Size (MB)</label>
                      <input
                        type="number"
                        defaultValue="1024"
                        className="w-full bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-breachfix-white mb-2">Allowed File Types</label>
                      <input
                        type="text"
                        defaultValue="mp4, avi, mov, mkv"
                        className="w-full bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-netflix-gray">
                  <button className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded transition-colors duration-200">
                    Save Settings
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

export default Admin;
