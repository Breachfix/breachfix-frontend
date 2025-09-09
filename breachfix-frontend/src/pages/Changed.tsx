import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllBiblesApi } from '../hooks/useApi';
import ChangedReasons from '../components/changed/ChangedReasons';
import ChangedFeatured from '../components/changed/ChangedFeatured';
import ChangedDetail from '../components/changed/ChangedDetail';

const Changed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Extract query parameters
  const lang = searchParams.get('lang');
  const source = searchParams.get('source');
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const verse = searchParams.get('verse');
  
  // Check if we have all required params for verse detail view
  const hasVerseParams = lang && source && book && chapter && verse;
  
  // Fetch languages and books for lookups
  const { data: languagesResponse } = useAllBiblesApi.languages.useGetAll();
  const { data: booksResponse } = useAllBiblesApi.books.useGetAll(
    lang || 'eng',
    source || 'kjv',
    { enabled: !!lang && !!source }
  );
  
  const languages = languagesResponse?.languages || [];
  const books = booksResponse?.books || [];
  
  // Memoized lookups
  const selectedBook = books.find((b: any) => b.number === parseInt(book || '0'));
  
  // Language name mapping for better display
  const languageNameMap: { [key: string]: string } = {
    'esp': 'Spanish',
    'fij': 'Fijian', 
    'fin': 'Finnish',
    'kin': 'Kinyarwanda',
    'lug': 'Luganda',
    'nya': 'Chichewa',
    'prt': 'Portuguese',
    'ron': 'Romanian',
    'sna': 'Shona',
    'tgl': 'Tagalog',
    'xha': 'Xhosa'
  };
  
  const getFullLanguageName = (languageCode: string, metadataName?: string) => {
    if (metadataName) return metadataName;
    const lang = languages.find((l: any) => l.code3 === languageCode);
    if (lang) {
      return languageNameMap[languageCode.toLowerCase()] || lang.name;
    }
    return languageCode;
  };
  
  const handleBackToReasons = () => {
    navigate('/bible/changed');
  };
  
  const handleViewInReader = () => {
    if (hasVerseParams) {
      navigate(`/bible?lang=${lang}&source=${source}&book=${book}&chapter=${chapter}&verse=${verse}`);
    }
  };
  
  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };


  
  return (
    <div className="min-h-screen bg-breachfix-navy relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-breachfix-navy via-breachfix-dark to-breachfix-navy opacity-50 -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,209,102,0.1),transparent_50%)] -z-10"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-breachfix-gold rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse -z-10" style={{animationDelay: '2s'}}></div>

      {/* Futuristic Header */}
      <div className="relative z-10 bg-gradient-to-r from-breachfix-navy via-breachfix-dark to-breachfix-navy border-b border-breachfix-gold border-opacity-30 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center relative"
          >
            {/* Glowing Title */}
            <div className="relative inline-block">
              <h1 className="text-5xl md:text-7xl font-bold text-breachfix-white mb-6 relative z-10">
                <span className="bg-gradient-to-r from-breachfix-gold via-yellow-400 to-breachfix-gold bg-clip-text text-transparent animate-pulse">
                  CHANGED
                </span>
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-breachfix-gold via-yellow-400 to-breachfix-gold blur-lg opacity-30 animate-pulse"></div>
            </div>
            
            {/* Futuristic Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-breachfix-white max-w-4xl mx-auto leading-relaxed mb-8"
            >
              <span className="text-breachfix-gold font-semibold">Advanced Translation Analysis</span> — 
              Preserving divine truth through cutting-edge research and transparent documentation
            </motion.p>

            {/* Futuristic Stats */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                  >
                    <div className="bg-breachfix-dark border border-breachfix-gold border-opacity-30 rounded-2xl p-6 backdrop-blur-sm hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-breachfix-gold/20">
                      <div className="text-3xl font-bold text-breachfix-gold mb-2">100s</div>
                      <div className="text-breachfix-white text-sm">Verses Analyzed</div>
                    </div>
                    <div className="bg-breachfix-dark border border-amber-400 border-opacity-30 rounded-2xl p-6 backdrop-blur-sm hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
                      <div className="text-3xl font-bold text-amber-400 mb-2">20+</div>
                      <div className="text-breachfix-white text-sm">Languages Supported</div>
                    </div>
                    <div className="bg-breachfix-dark border border-breachfix-gold border-opacity-30 rounded-2xl p-6 backdrop-blur-sm hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-breachfix-gold/20">
                      <div className="text-3xl font-bold text-breachfix-gold mb-2">100%</div>
                      <div className="text-breachfix-white text-sm">Holy Spirit Inspired Accuracy</div>
                    </div>
                  </motion.div>
          </motion.div>
        </div>
      </div>

      
      
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {hasVerseParams ? (
            <motion.div
              key="verse-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Breadcrumbs */}
              <nav className="mb-6">
                <div className="flex items-center space-x-2 text-body-sm text-breachfix-gray">
                  <button
                    onClick={handleBackToReasons}
                    className="hover:text-breachfix-white transition-colors"
                  >
                    Changed
                  </button>
                  <span>/</span>
                  <span>{getFullLanguageName(lang || '')}</span>
                  <span>/</span>
                  <span>{selectedBook?.name} {chapter}:{verse}</span>
                </div>
              </nav>
              
              {/* Futuristic Verse Header */}
              <div className="bg-breachfix-dark border border-breachfix-gold border-opacity-30 rounded-2xl p-6 mb-6 backdrop-blur-sm relative overflow-hidden hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-breachfix-gold/20">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-breachfix-gold/5 via-transparent to-amber-500/5 opacity-50"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-breachfix-gold via-amber-400 to-breachfix-gold animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-heading-md font-bold text-breachfix-white mb-2 relative">
                        <span className="bg-gradient-to-r from-breachfix-gold to-amber-400 bg-clip-text text-transparent">
                          {selectedBook?.name} {chapter}:{verse}
                        </span>
                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-breachfix-gold to-amber-400 opacity-60"></div>
                      </h2>
                      <div className="flex gap-2">
                        <span className="bg-breachfix-gold text-breachfix-navy px-3 py-1 rounded-full text-body-sm font-semibold shadow-lg shadow-breachfix-gold/30 hover:shadow-breachfix-gold/50 transition-all duration-300">
                          {getFullLanguageName(lang || '')}
                        </span>
                        <span className="bg-amber-500 text-breachfix-navy px-3 py-1 rounded-full text-body-sm font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300">
                          {source?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(108, 117, 125, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBackToReasons}
                        className="bg-breachfix-gray hover:bg-gray-500 text-breachfix-white px-4 py-2 rounded-lg transition-all duration-300 border border-breachfix-gray border-opacity-30 hover:border-opacity-60"
                      >
                        ← Back to Reasons
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 209, 102, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewInReader}
                        className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-4 py-2 rounded-lg transition-all duration-300 border border-breachfix-gold border-opacity-30 hover:border-opacity-60 shadow-lg shadow-breachfix-gold/30 hover:shadow-breachfix-gold/50"
                      >
                        📖 View in Reader
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(42, 157, 143, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyLink}
                        className="bg-amber-500 hover:bg-amber-400 text-breachfix-navy px-4 py-2 rounded-lg transition-all duration-300 border border-amber-400 border-opacity-30 hover:border-opacity-60 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                      >
                        🔗 Copy Link
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Verse Detail Content */}
              <ChangedDetail
                lang={lang || ''}
                source={source || ''}
                book={parseInt(book || '0')}
                chapter={parseInt(chapter || '0')}
                verse={parseInt(verse || '0')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
                 {/* Featured Verse */}
         <div className="relative z-20">
           <ChangedFeatured />
         </div>

             


              {/* Why Change? Landing Content */}
              <ChangedReasons />
              
              
              
              {/* Video Snippets */}
              {/* <ChangedVideos /> */}
              
              {/* Books & Resources */}
              {/* <ChangedBooks /> */}
              
              {/* Futuristic CTA */}
              <div className="text-center mt-12 relative">
                {/* Animated Border */}
                <div className="border-t border-breachfix-gold border-opacity-30 pt-8 relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-breachfix-gold to-transparent animate-pulse"></div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    <h4 className="text-body-lg font-semibold text-breachfix-white mb-6 relative">
                      <span className="bg-gradient-to-r from-breachfix-gold to-amber-400 bg-clip-text text-transparent">
                        Continue Your Spiritual Journey
                      </span>
                    </h4>
                    
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 0 30px rgba(255, 209, 102, 0.6)",
                        textShadow: "0 0 10px rgba(13, 27, 42, 0.8)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/bible/read')}
                      className="relative bg-gradient-to-r from-breachfix-gold to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-breachfix-navy px-8 py-4 rounded-lg text-body-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-breachfix-gold border-opacity-30 hover:border-opacity-60 overflow-hidden group"
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-breachfix-gold opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-breachfix-gold via-yellow-400 to-breachfix-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-xl">📖</span>
                        Enter the Digital Bible
                        <span className="text-xl">✨</span>
                      </span>
                    </motion.button>
                    
                    {/* Futuristic Decorative Elements */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-breachfix-gold rounded-full animate-ping"></div>
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Changed;
