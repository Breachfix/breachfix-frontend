import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Bible: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  const bibleOptions = [
    {
      title: 'Read Bible',
      description: 'Read the Scriptures in supported languages with clean typography, search, and parallel text where available.',
      icon: '📖',
      path: '/bible/read',
      color: 'from-breachfix-emerald to-teal-700',
      available: true,
      features: ['25+ Languages', 'Parallel Text', 'Advanced Search', 'Cross-Language Comparison']
    },
    {
      title: 'Changed Verses',
      description: 'Explore translation changes and improvements across different Bible versions. See why we highlight changes to keep truth at the center.',
      icon: '🔄',
      path: '/bible/changed',
      color: 'from-breachfix-gold to-yellow-700',
      available: true,
      features: ['Translation Changes', 'Change Analysis', 'BreachFix Verses', 'Free Access']
    },
    {
      title: 'Submit Edits',
      description: 'Propose text corrections, translation improvements, and grammar fixes with a comprehensive 2-stage review workflow.',
      icon: '✏️',
      path: '/bible/edit',
      color: 'from-breachfix-gold to-yellow-600',
      available: isAuthenticated,
      features: ['2-Stage Review', 'Edit Types', 'Priority Levels', 'Conflict Detection']
    },
    {
      title: 'My Edits',
      description: 'Track your submitted edits through the complete workflow: draft → review1 → review2 → approved/rejected.',
      icon: '📝',
      path: '/bible/my-edits',
      color: 'from-breachfix-sage to-green-600',
      available: isAuthenticated,
      features: ['Workflow Tracking', 'Edit History', 'Status Updates', 'Review Notes']
    },
    {
      title: 'Admin Panel',
      description: 'Manage the complete edit workflow with bulk operations, reviewer assignment, and comprehensive analytics.',
      icon: '⚙️',
      path: '/bible/admin',
      color: 'from-breachfix-emerald to-emerald-700',
      available: isAuthenticated && user?.role === 'admin',
      features: ['Bulk Operations', 'Reviewer Assignment', 'System Analytics', 'Quality Control']
    }
  ];

  return (
    <div className="min-h-screen bg-breachfix-navy">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0"
               style={{
                 backgroundImage:
                   'radial-gradient(circle at 1px 1px, rgba(255,209,102,.2) 1px, transparent 1px)',
                 backgroundSize: '22px 22px'
               }}
          />
        </motion.div>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-breachfix-white mb-4">
            AllBibles by BreachFix
          </h1>
          <p className="text-base md:text-lg text-breachfix-gray max-w-3xl mx-auto">
            A clean, trustworthy Bible reading experience with accurate editions, thoughtful tools,
            and a workflow for carefully repairing breached verses—faithful to source texts.
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm text-breachfix-gray">
            <span className="inline-flex items-center rounded-md px-3 py-1 text-xs font-medium bg-breachfix-emerald/20 text-breachfix-emerald">
              <span className="w-2 h-2 bg-breachfix-emerald rounded-full mr-2"></span>
              Stable
            </span>
            <span className="inline-flex items-center rounded-md px-3 py-1 text-xs font-medium bg-breachfix-gold/20 text-breachfix-gold">
              <span className="w-2 h-2 bg-breachfix-gold rounded-full mr-2"></span>
              KJV & Core Originals
            </span>
            <span className="inline-flex items-center rounded-md px-3 py-1 text-xs font-medium bg-breachfix-sage/20 text-breachfix-sage">
              <span className="w-2 h-2 bg-breachfix-sage rounded-full mr-2"></span>
              Repair Workflow
            </span>
          </div>
          <motion.div
            className="mx-auto mt-6 h-1 w-40 rounded-full bg-gradient-to-r from-breachfix-emerald via-breachfix-gold to-breachfix-sage"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
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
                  <div className={`bg-gradient-to-br ${option.color} rounded-xl p-6 h-full cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-breachfix-gold/20`}>
                    <div className="text-4xl mb-4">{option.icon}</div>
                    <h3 className="text-lg font-bold text-breachfix-white mb-2">{option.title}</h3>
                    <p className="text-breachfix-white/90 text-sm leading-relaxed mb-4">{option.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {option.features.map((feature, idx) => (
                        <span key={idx} className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-breachfix-gold/20 text-breachfix-gold">{feature}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ) : (
                <div 
                  className="bg-breachfix-dark/50 rounded-lg p-6 h-full opacity-50 border border-breachfix-gray/20 cursor-pointer hover:opacity-70 hover:border-breachfix-gold/30 transition-all duration-200 group relative"
                  onClick={() => {
                    if (option.title === 'Submit Edits' || option.title === 'My Edits') {
                      // Redirect to login for user features
                      window.location.href = '/login?redirect=' + encodeURIComponent(option.path);
                    } else {
                      // Redirect to login for admin features
                      window.location.href = '/login?redirect=' + encodeURIComponent(option.path) + '&admin=true';
                    }
                  }}
                  title={option.title === 'Submit Edits' || option.title === 'My Edits' ? 'Login Required - Click to sign in' : 'Admin Access Required - Click to sign in'}
                >
                  <div className="text-4xl mb-4 group-hover:text-breachfix-gold transition-colors">{option.icon}</div>
                  <h3 className="text-lg font-bold text-breachfix-gray mb-2 group-hover:text-breachfix-white transition-colors">{option.title}</h3>
                  <p className="text-breachfix-gray/70 text-sm leading-relaxed mb-4 group-hover:text-breachfix-gray transition-colors">{option.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {option.features.map((feature, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-breachfix-gray/20 text-breachfix-gray group-hover:bg-breachfix-gold/20 group-hover:text-breachfix-gold transition-colors">{feature}</span>
                    ))}
                  </div>
                  <div className="text-xs text-breachfix-gray/60 group-hover:text-breachfix-gold transition-colors">
                    {option.title === 'Submit Edits' || option.title === 'My Edits' ? 'Login required - Click to sign in' : 'Admin access required - Click to sign in'}
                  </div>
                  
                  {/* Hover tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-breachfix-navy text-breachfix-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-breachfix-gold/30">
                    {option.title === 'Submit Edits' || option.title === 'My Edits' ? 'Login Required' : 'Admin Access Required'}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-breachfix-navy"></div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Language Support Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-breachfix-white mb-6">Language Support</h2>
          <p className="text-breachfix-gray mb-8 max-w-3xl mx-auto">
            We support 23 languages with their primary Bible translations, including source texts in Greek, Hebrew, and Arabic. 
            Each language typically has one main translation version, with English KJV as our primary reference. 
            We focus on quality over quantity—supporting fewer, well-verified translations rather than many untested versions.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {/* Afrikaans */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=afr'}
              title="Click to read Bible in Afrikaans"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇿🇦</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Afrikaans</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Arabic */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=ara'}
              title="Click to read Bible in Arabic"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇸🇦</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">العربية</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Source Text</p>
            </div>

            {/* English */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=eng&source=kjv'}
              title="Click to read Bible in English (KJV)"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇺🇸</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">English</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">KJV (Primary)</p>
            </div>

            {/* Spanish */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=esp&source=rvr'}
              title="Click to read Bible in Spanish (RVR)"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇪🇸</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Español</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">RVR</p>
            </div>

            {/* Fijian */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=fij'}
              title="Click to read Bible in Fijian"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇫🇯</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Vosa Vakaviti</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Finnish */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=fin'}
              title="Click to read Bible in Finnish"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇫🇮</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Suomi</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* French */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=fra&source=lsg'}
              title="Click to read Bible in French (LSG)"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇫🇷</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Français</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">LSG</p>
            </div>

            {/* Greek (Ancient) */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=grc'}
              title="Click to read Bible in Greek (Ancient)"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇬🇷</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Greek (Ancient)</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Source Text</p>
            </div>

            {/* Hebrew */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=heb'}
              title="Click to read Bible in Hebrew"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇮🇱</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Hebrew</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Source Text</p>
            </div>

            {/* Kinyarwanda */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=kin'}
              title="Click to read Bible in Kinyarwanda"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇷🇼</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Kinyarwanda</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Luganda */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=lug'}
              title="Click to read Bible in Luganda"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇺🇬</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Luganda</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Southern Ndebele */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=nbl'}
              title="Click to read Bible in Southern Ndebele"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇿🇦</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Southern Ndebele</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Chichewa */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=nya'}
              title="Click to read Bible in Chichewa"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇲🇼</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Chichewa</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Punjabi */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=pan'}
              title="Click to read Bible in Punjabi"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇮🇳</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Punjabi</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Portuguese */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=prt'}
              title="Click to read Bible in Portuguese"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇵🇹</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Português</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Romanian */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=ron'}
              title="Click to read Bible in Romanian"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇷🇴</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Română</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Kirundi */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=run'}
              title="Click to read Bible in Kirundi"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇧🇮</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Kirundi</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Shona */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=sna'}
              title="Click to read Bible in Shona"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇿🇼</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Shona</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Somali */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=som'}
              title="Click to read Bible in Somali"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇸🇴</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Somali</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Swahili */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=swa'}
              title="Click to read Bible in Swahili"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇹🇿</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Swahili</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Tagalog */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=tgl'}
              title="Click to read Bible in Tagalog"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇵🇭</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Tagalog</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Xhosa */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=xha'}
              title="Click to read Bible in Xhosa"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇿🇦</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Xhosa</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>

            {/* Zulu */}
            <div 
              className="bg-breachfix-dark/50 rounded-lg p-3 text-center border border-breachfix-gold/20 cursor-pointer hover:bg-breachfix-dark/70 hover:border-breachfix-gold/40 hover:scale-105 transition-all duration-200 group"
              onClick={() => window.location.href = '/bible/read?lang=zul'}
              title="Click to read Bible in Zulu"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🇿🇦</div>
              <h3 className="text-sm font-semibold text-breachfix-white group-hover:text-breachfix-gold transition-colors">Zulu</h3>
              <p className="text-breachfix-gray text-xs group-hover:text-breachfix-white transition-colors">Available</p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-breachfix-white mb-8 text-center">Enterprise Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">Global Search</h3>
              <p className="text-breachfix-gray text-sm">Search supported editions with precise filters and parallel views (where available).</p>
            </div>
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">📖</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">Parallel Text</h3>
              <p className="text-breachfix-gray text-sm">Compare multiple translations side-by-side for comprehensive study.</p>
            </div>
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">2-Stage Review</h3>
              <p className="text-breachfix-gray text-sm">Enterprise workflow with conflict detection and transaction safety.</p>
            </div>
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">Analytics</h3>
              <p className="text-breachfix-gray text-sm">Comprehensive metrics, performance tracking, and system health monitoring.</p>
            </div>
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">Security</h3>
              <p className="text-breachfix-gray text-sm">Input validation, rate limiting, and complete audit trail for compliance.</p>
            </div>
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">Performance</h3>
              <p className="text-breachfix-gray text-sm">Caching layer, database optimization, and strategic indexing.</p>
            </div>
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">Change Management</h3>
              <p className="text-breachfix-gray text-sm">Cross-language verse linking and comprehensive variant management.</p>
            </div>
            <div className="bg-breachfix-dark/50 rounded-lg p-6 text-center border border-breachfix-gold/20">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-breachfix-white mb-2">Bulk Operations</h3>
              <p className="text-breachfix-gray text-sm">Admin tools for bulk approval, reviewer assignment, and deadline management.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bible;
