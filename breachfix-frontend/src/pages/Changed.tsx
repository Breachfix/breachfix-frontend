import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllBiblesApi } from '../hooks/useApi';
import ChangedReasons from '../components/changed/ChangedReasons';
import ChangedFeatured from '../components/changed/ChangedFeatured';
import ChangedVideos from '../components/changed/ChangedVideos';
import ChangedBooks from '../components/changed/ChangedBooks';
import ChangedDetail from '../components/changed/ChangedDetail';

const Changed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [featuredVerseData, setFeaturedVerseData] = useState<any>(null);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  
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
    navigate('/changed');
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

  const handleDonationAmount = (amount: number) => {
    setSelectedDonationAmount(amount);
    setCustomAmount(''); // Clear custom amount when selecting preset
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      setSelectedDonationAmount(amount);
      // Here you would integrate with your payment processor
      console.log(`Processing donation of $${amount}`);
      // For now, just show an alert
      alert(`Thank you for your donation of $${amount}! This will help support our translation work.`);
    }
  };

  const handlePresetDonation = (amount: number) => {
    // Here you would integrate with your payment processor
    console.log(`Processing donation of $${amount}`);
    // For now, just show an alert
    alert(`Thank you for your donation of $${amount}! This will help support our translation work.`);
  };
  
  return (
    <div className="min-h-screen bg-netflix-black">

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
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <button
                    onClick={handleBackToReasons}
                    className="hover:text-white transition-colors"
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
              <div className="bg-netflix-dark-gray rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedBook?.name} {chapter}:{verse}
                    </h2>
                    <div className="flex gap-2">
                      <span className="bg-netflix-red text-white px-3 py-1 rounded-full text-sm">
                        {getFullLanguageName(lang || '')}
                      </span>
                      <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                        {source?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBackToReasons}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Back to Reasons
                    </button>
                    <button
                      onClick={handleViewInReader}
                      className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      View in Reader
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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

             


              {/* Why Change? Landing Content */}
              <ChangedReasons />
              
              
              
              {/* Video Snippets */}
              {/* <ChangedVideos /> */}
              
              {/* Books & Resources */}
              {/* <ChangedBooks /> */}
              
              {/* CTA */}
              <div className="text-center mt-12">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Support Translation Work
                  </h3>
                  <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                    Help us bring accurate Bible translations to more languages. Your support enables us to research, 
                    analyze, and provide faithful translations that preserve doctrinal truth.
                  </p>
                  
                  {/* Donation Amounts */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
                    {[25, 50, 100, 250].map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetDonation(amount)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                          selectedDonationAmount === amount
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-green-400'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        }`}
                      >
                        ${amount}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Custom Amount */}
                  <div className="mb-6">
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedDonationAmount(null); // Clear preset selection
                      }}
                      className="bg-netflix-dark-gray border border-gray-600 text-white px-4 py-2 rounded-lg mr-2 focus:outline-none focus:border-netflix-red"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCustomDonation}
                      disabled={!customAmount || parseFloat(customAmount) <= 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        !customAmount || parseFloat(customAmount) <= 0
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Donate
                    </motion.button>
                  </div>
                  
                  {/* Translation Impact */}
                  <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Your Impact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">$25</div>
                        <div className="text-gray-300">Supports 1 verse analysis</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">$100</div>
                        <div className="text-gray-300">Funds 1 chapter research</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">$500</div>
                        <div className="text-gray-300">Enables 1 book translation</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Live Example Button */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    See Translation Changes in Action
                  </h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (featuredVerseData) {
                        // Use the current featured verse data
                        const [book, chapter, verse] = featuredVerseData.reference.split(':').map(Number);
                        // Use English and KJV as the base for comparison since the featured verse shows KJV baseline
                        navigate(`/changed?lang=eng&source=kjv&book=${book}&chapter=${chapter}&verse=${verse}`);
                      } else {
                        // Fallback to a known changed verse (John 1:18)
                        navigate('/changed?lang=eng&source=kjv&book=43&chapter=1&verse=18');
                      }
                    }}
                    className="bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {featuredVerseData ? `Analyze ${featuredVerseData.bookName}` : 'See a Live Example'}
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
