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
    <div className="min-h-screen bg-breachfix-navy">

         {/* Featured Verse */}
         <ChangedFeatured />
      {/* Header/Hero
      <div className="bg-gradient-to-r from-netflix-red to-red-800 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Changed
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Why we highlight translation changes—to keep the truth at the center.
            </p>
          </motion.div>
        </div>
      </div> */}
      
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
              
              {/* Verse Header */}
              <div className="bg-breachfix-dark rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-heading-md font-bold text-breachfix-white mb-2">
                      {selectedBook?.name} {chapter}:{verse}
                    </h2>
                    <div className="flex gap-2">
                      <span className="bg-breachfix-gold text-breachfix-navy px-3 py-1 rounded-full text-body-sm">
                        {getFullLanguageName(lang || '')}
                      </span>
                      <span className="bg-breachfix-gray text-breachfix-white px-3 py-1 rounded-full text-body-sm">
                        {source?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBackToReasons}
                      className="bg-breachfix-gray hover:bg-gray-500 text-breachfix-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Back to Reasons
                    </button>
                    <button
                      onClick={handleViewInReader}
                      className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      View in Reader
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="bg-breachfix-emerald hover:bg-teal-600 text-breachfix-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Copy Link
                    </button>
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
         <ChangedFeatured />

             


              {/* Why Change? Landing Content */}
              <ChangedReasons />
              
              
              
              {/* Video Snippets */}
              {/* <ChangedVideos /> */}
              
              {/* Books & Resources */}
              {/* <ChangedBooks /> */}
              
              {/* CTA */}
              <div className="text-center mt-12">
                {/* Back to Bible Reader Button */}
                <div className="border-t border-breachfix-gray pt-6">
                  <h4 className="text-body-lg font-semibold text-breachfix-white mb-4">
                    Continue Reading the Bible
                  </h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/bible/read')}
                    className="bg-gradient-to-r from-breachfix-gold to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-breachfix-navy px-8 py-4 rounded-lg text-body-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Go Back to Read
                  </motion.button>
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
