import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Bible: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  const bibleOptions = [
    {
      title: 'Read Bible',
      description: 'Access 25+ languages with multiple translations. Read, search, and compare parallel texts across different versions.',
      icon: '📖',
      path: '/bible/read',
      color: 'from-blue-600 to-blue-800',
      available: true,
      features: ['25+ Languages', 'Parallel Text', 'Advanced Search', 'Cross-Language Comparison']
    },
    {
      title: 'Submit Edits',
      description: 'Propose text corrections, translation improvements, and grammar fixes with a comprehensive 2-stage review workflow.',
      icon: '✏️',
      path: '/bible/edit',
      color: 'from-green-600 to-green-800',
      available: isAuthenticated,
      features: ['2-Stage Review', 'Edit Types', 'Priority Levels', 'Conflict Detection']
    },
    {
      title: 'My Edits',
      description: 'Track your submitted edits through the complete workflow: draft → review1 → review2 → approved/rejected.',
      icon: '📝',
      path: '/bible/my-edits',
      color: 'from-purple-600 to-purple-800',
      available: isAuthenticated,
      features: ['Workflow Tracking', 'Edit History', 'Status Updates', 'Review Notes']
    },
    {
      title: 'Admin Panel',
      description: 'Manage the complete edit workflow with bulk operations, reviewer assignment, and comprehensive analytics.',
      icon: '⚙️',
      path: '/bible/admin',
      color: 'from-red-600 to-red-800',
      available: isAuthenticated && user?.role === 'admin',
      features: ['Bulk Operations', 'Reviewer Assignment', 'System Analytics', 'Quality Control']
    }
  ];

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-netflix-white mb-4">AllBibles</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Production-grade Bible API system with 25+ languages, comprehensive edit workflow, 
            and enterprise-ready features including parallel text comparison and advanced search.
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Production Ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              25+ Languages
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Enterprise Workflow
            </span>
          </div>
        </div>

        {/* Bible Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {bibleOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {option.available ? (
                <Link to={option.path}>
                  <div className={`bg-gradient-to-br ${option.color} rounded-lg p-6 h-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
                    <div className="text-4xl mb-4">{option.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                    <p className="text-gray-200 text-sm leading-relaxed mb-4">{option.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {option.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 h-full opacity-50">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">{option.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{option.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {option.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">
                    {option.title === 'Submit Edits' || option.title === 'My Edits' ? 'Login required' : 'Admin access required'}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Language Support Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-netflix-white mb-6">Multi-Language Support</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Access Bible content in 25+ languages with multiple translation sources, 
            enabling comprehensive cross-language study and comparison.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">🇺🇸</div>
              <h3 className="text-sm font-semibold text-white">English</h3>
              <p className="text-gray-400 text-xs">KJV, NIV, ESV</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🇧🇮</div>
              <h3 className="text-sm font-semibold text-white">Kirundi</h3>
              <p className="text-gray-400 text-xs">BY67</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🇫🇷</div>
              <h3 className="text-sm font-semibold text-white">French</h3>
              <p className="text-gray-400 text-xs">LSG, BDS</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🇪🇸</div>
              <h3 className="text-sm font-semibold text-white">Spanish</h3>
              <p className="text-gray-400 text-xs">RVR, NVI</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🇩🇪</div>
              <h3 className="text-sm font-semibold text-white">German</h3>
              <p className="text-gray-400 text-xs">LUT, ELB</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="text-sm font-semibold text-white">+20 More</h3>
              <p className="text-gray-400 text-xs">Languages</p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-netflix-white mb-8 text-center">Enterprise Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Global Search</h3>
              <p className="text-gray-400 text-sm">Search across 25+ languages with advanced filtering and cross-language results.</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">📖</div>
              <h3 className="text-lg font-semibold text-white mb-2">Parallel Text</h3>
              <p className="text-gray-400 text-sm">Compare multiple translations side-by-side for comprehensive study.</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-white mb-2">2-Stage Review</h3>
              <p className="text-gray-400 text-sm">Enterprise workflow with conflict detection and transaction safety.</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-400 text-sm">Comprehensive metrics, performance tracking, and system health monitoring.</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
              <p className="text-gray-400 text-sm">Input validation, rate limiting, and complete audit trail for compliance.</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
              <p className="text-gray-400 text-sm">Caching layer, database optimization, and strategic indexing.</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="text-lg font-semibold text-white mb-2">Change Management</h3>
              <p className="text-gray-400 text-sm">Cross-language verse linking and comprehensive variant management.</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-white mb-2">Bulk Operations</h3>
              <p className="text-gray-400 text-sm">Admin tools for bulk approval, reviewer assignment, and deadline management.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bible;
