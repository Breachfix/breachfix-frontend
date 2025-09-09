import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ApiService } from '../../utils/api';
import DonationButton from '../donations/DonationButton';
import { useDonation } from '../../hooks/useDonation';

interface ChangedFeaturedProps {
  onFeaturedVerseChange?: (data: any) => void;
}

const ChangedFeatured: React.FC<ChangedFeaturedProps> = ({ onFeaturedVerseChange: _onFeaturedVerseChange }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerse, setCurrentVerse] = useState({ book: 43, chapter: 1, verse: 18 });
  const [currentRotationIndex, setCurrentRotationIndex] = useState<number | null>(null);
  const { handleDonationSuccess, handleDonationError } = useDonation();

  // Book number to name mapping
  const bookNames: { [key: number]: string } = {
    1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
    6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
    11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles", 15: "Ezra",
    16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms", 20: "Proverbs",
    21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah", 24: "Jeremiah", 25: "Lamentations",
    26: "Ezekiel", 27: "Daniel", 28: "Hosea", 29: "Joel", 30: "Amos",
    31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum", 35: "Habakkuk",
    36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi", 40: "Matthew",
    41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
    46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians", 49: "Ephesians", 50: "Philippians",
    51: "Colossians", 52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy",
    56: "Titus", 57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter",
    61: "2 Peter", 62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude", 66: "Revelation"
  };

  // Function to fetch the featured verse (auto-rotating every minute)
  const fetchFeaturedVerse = async () => {
    try {
      setIsLoading(true);
      // Call the new featured endpoint that auto-rotates every minute
      const data = await ApiService.allBibleChanged.featured.getFeatured();
      
      console.log('Featured verse response:', data);
      
      if (data?.success && data?.featured) {
        const featured = data.featured;
        
        // Parse the reference to get book, chapter, verse
        const [book, chapter, verse] = featured.reference.split(':').map(Number);
        setCurrentVerse({ book, chapter, verse });
        
        // Track the current rotation index
        setCurrentRotationIndex(featured.rotationIndex);
        
        // Set the data directly from the featured response
        setData({
          success: true,
          reference: featured.bookName,
          changedVerse: {
            kjvBaseline: featured.kjvBaseline,
            summary: featured.summary,
            analysis: featured.analysis,
            affectedDoctrine: featured.affectedDoctrine ? featured.affectedDoctrine.split(', ') : [],
            spiritOfProphecy: featured.spiritOfProphecy,
            batchData: featured.batchData,
            modernVersionsCited: featured.modernVersionsCited || []
          }
        });
      } else {
        console.warn('No featured verse found in API response');
        setData(null);
      }
    } catch (error) {
      console.error('Failed to fetch featured verse:', error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch the next featured verse (manual rotation)
  const fetchNextFeaturedVerse = async () => {
    try {
      setIsLoading(true);
      // Call the next featured endpoint with current rotation index
      const data = await ApiService.allBibleChanged.featured.getNext(currentRotationIndex || undefined);
      
      console.log('Next featured verse response:', data);
      
      if (data?.success && data?.featured) {
        const featured = data.featured;
        
        // Parse the reference to get book, chapter, verse
        const [book, chapter, verse] = featured.reference.split(':').map(Number);
        setCurrentVerse({ book, chapter, verse });
        
        // Track the new rotation index
        setCurrentRotationIndex(featured.rotationIndex);
        
        // Set the data directly from the featured response
        setData({
          success: true,
          reference: featured.bookName,
          changedVerse: {
            kjvBaseline: featured.kjvBaseline,
            summary: featured.summary,
            analysis: featured.analysis,
            affectedDoctrine: featured.affectedDoctrine ? featured.affectedDoctrine.split(', ') : [],
            spiritOfProphecy: featured.spiritOfProphecy,
            batchData: featured.batchData,
            modernVersionsCited: featured.modernVersionsCited || []
          }
        });
      } else {
        console.warn('No next featured verse found in API response');
        setData(null);
      }
    } catch (error) {
      console.error('Failed to fetch next featured verse:', error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    // Fetch the featured verse on component mount
    fetchFeaturedVerse();
  }, []);

  useEffect(() => {
    // Auto-refresh every 7 minutes to get the new featured verse
    const interval = setInterval(() => {
      fetchFeaturedVerse();
    }, 420000); // 420 seconds = 7 minutes

    return () => clearInterval(interval);
  }, []);

  // Use real API data only - no fallback to ensure we only show actual changed verses
  const featuredVerse = data?.success && data.changedVerse ? {
    reference: data.reference || `${bookNames[currentVerse.book]} ${currentVerse.chapter}:${currentVerse.verse}`,
    kjvBaseline: data.changedVerse.kjvBaseline || 'Original text not available',
    modernNote: data.changedVerse.summary || 'Change summary not available',
    spiritOfProphecy: data.changedVerse.spiritOfProphecy || 'Spirit of Prophecy quote not available',
    changeSummary: data.changedVerse.analysis || 'Analysis not available',
    affectedDoctrine: data.changedVerse.affectedDoctrine || [],
    batchData: data.changedVerse.batchData || null,
    modernVersionsCited: data.changedVerse.modernVersionsCited || []
  } : null;

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="bg-gradient-to-r from-breachfix-navy to-breachfix-emerald rounded-2xl p-8">
          <div className="flex justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-center text-breachfix-white text-sm">
            Loading featured verse...
          </p>
        </div>
      </section>
    );
  }

  // Only render if we have real API data
  if (!featuredVerse) {
    return (
      <section className="mb-12">
        <div className="bg-gradient-to-r from-breachfix-navy to-breachfix-emerald rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-breachfix-white mb-4">
              BreachFix Verse
            </h2>
            <p className="text-breachfix-white mb-4">
              Loading a verse where translation changes affect doctrine...
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchNextFeaturedVerse();
              }}
              className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              🎲 Try Another Verse
            </motion.button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 relative z-30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-br from-amber-900 via-breachfix-navy to-amber-800 rounded-2xl p-8 border border-amber-400 border-opacity-40 backdrop-blur-sm relative overflow-hidden hover:border-opacity-70 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/30"
      >
        {/* Temple-Inspired Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-breachfix-gold/10 opacity-60 -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 animate-pulse -z-10 shadow-lg shadow-amber-500/50"></div>
        
        {/* Pillar of Fire Effect */}
        <div className="absolute top-4 right-4 w-3 h-20 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full opacity-60 animate-pulse shadow-lg shadow-amber-500/40 -z-10"></div>
        <div className="absolute top-6 right-6 w-1 h-16 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-full opacity-80 animate-pulse -z-10"></div>
        
        {/* Temple Gold Veins */}
        <div className="absolute inset-0 opacity-20 -z-10">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-breachfix-gold to-transparent animate-pulse"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="text-center mb-8 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-bold mb-4 relative"
          >
            <span className="bg-gradient-to-r from-amber-300 via-breachfix-gold to-amber-400 bg-clip-text text-transparent animate-pulse">
              The Sacred Word
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-80 shadow-lg shadow-amber-500/50"></div>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-amber-100 mb-6 text-lg leading-relaxed"
          >
            "The words of the LORD are pure words: as silver tried in a furnace of earth, purified seven times." — Psalm 12:6
          </motion.p>
          
                  <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255, 193, 7, 0.6)",
              textShadow: "0 0 10px rgba(255, 193, 7, 0.8)"
            }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      fetchNextFeaturedVerse();
                    }}
            className="bg-gradient-to-r from-amber-500 to-breachfix-gold hover:from-amber-400 hover:to-yellow-400 text-breachfix-navy px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 border border-amber-400 border-opacity-50 hover:border-opacity-80 shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              Discover Another Sacred Verse
              <span className="text-lg">✨</span>
            </span>
                  </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Sacred Verse Comparison */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="space-y-6"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-2xl font-bold text-amber-100 mb-6 relative text-center"
            >
              <span className="bg-gradient-to-r from-amber-300 via-breachfix-gold to-amber-400 bg-clip-text text-transparent">
              {featuredVerse.reference}
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-80 shadow-lg shadow-amber-500/50"></div>
            </motion.h3>
            
            {/* Original KJV - Temple Gold */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-gradient-to-br from-amber-900/30 to-breachfix-navy/50 border border-amber-400 border-opacity-40 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-70 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-breachfix-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h4 className="text-amber-300 font-bold mb-3 text-lg relative z-10 flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                Original Sacred Text
                <span className="text-sm text-amber-400">(KJV)</span>
              </h4>
              <p className="text-amber-50 leading-relaxed text-base relative z-10 font-medium">
                {featuredVerse.kjvBaseline}
              </p>
            </motion.div>
            
            {/* Modern Change - Pillar of Fire */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-gradient-to-br from-orange-900/30 to-amber-800/50 border border-orange-400 border-opacity-40 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-70 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h4 className="text-orange-300 font-bold mb-3 text-lg relative z-10 flex items-center gap-2">
                <span className="text-xl">🔥</span>
                Modern Translation
                <span className="text-sm text-orange-400">(Changed)</span>
              </h4>
              <p className="text-orange-50 leading-relaxed text-base relative z-10 font-medium">
                {featuredVerse.modernNote}
              </p>
            </motion.div>
          </motion.div>

          {/* Spirit of Prophecy & Sacred Analysis */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="space-y-6"
          >
            {/* Spirit of Prophecy - Divine Inspiration */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="bg-gradient-to-br from-breachfix-gold/20 to-amber-800/30 border border-breachfix-gold border-opacity-50 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-80 transition-all duration-500 hover:shadow-xl hover:shadow-breachfix-gold/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-breachfix-gold/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-breachfix-gold via-amber-400 to-breachfix-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h4 className="text-breachfix-gold font-bold mb-4 text-lg relative z-10 flex items-center gap-2">
                <span className="text-xl">✨</span>
                Spirit of Prophecy
                <span className="text-sm text-amber-400">(Divine Inspiration)</span>
              </h4>
              <blockquote className="text-amber-50 leading-relaxed text-base italic mb-3 relative z-10 font-medium">
                "{typeof featuredVerse.spiritOfProphecy === 'string' 
                  ? featuredVerse.spiritOfProphecy 
                  : featuredVerse.spiritOfProphecy?.quote || 'Spirit of Prophecy quote not available'}"
              </blockquote>
              {typeof featuredVerse.spiritOfProphecy === 'object' && featuredVerse.spiritOfProphecy?.citation && (
                <cite className="text-amber-300 text-sm relative z-10 font-semibold">
                  — {featuredVerse.spiritOfProphecy.citation}
                </cite>
              )}
            </motion.div>
            
            {/* Sacred Analysis - Purified Seven Times */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="bg-gradient-to-br from-breachfix-navy/50 to-amber-900/30 border border-amber-400 border-opacity-40 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-70 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-breachfix-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h4 className="text-amber-300 font-bold mb-4 text-lg relative z-10 flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                Sacred Analysis
                <span className="text-sm text-amber-400">(Purified Seven Times)</span>
              </h4>
              <p className="text-amber-50 leading-relaxed text-base relative z-10 font-medium">
                {featuredVerse.changeSummary}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Additional Real Data Sections */}
        {featuredVerse.affectedDoctrine && Array.isArray(featuredVerse.affectedDoctrine) && featuredVerse.affectedDoctrine.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-breachfix-gold mb-3">Affected Doctrine</h4>
            <div className="flex flex-wrap gap-2">
              {featuredVerse.affectedDoctrine.map((doctrine: string, index: number) => (
                <span key={index} className="bg-breachfix-gold text-breachfix-navy px-3 py-1 rounded-full text-sm">
                  {doctrine}
                </span>
              ))}
            </div>
          </div>
        )}

        {featuredVerse.batchData && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-breachfix-white mb-3">Detailed Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredVerse.batchData.Error && (
                <div className="bg-breachfix-gold bg-opacity-20 border border-breachfix-gold border-opacity-30 p-3 rounded-lg backdrop-blur-sm hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-breachfix-gold/20">
                  <h5 className="text-breachfix-gold font-semibold mb-1 text-sm">Error</h5>
                  <p className="text-breachfix-white text-xs">{featuredVerse.batchData.Error}</p>
                </div>
              )}
              {featuredVerse.batchData.Danger && (
                <div className="bg-breachfix-gold bg-opacity-20 border border-breachfix-gold border-opacity-30 p-3 rounded-lg backdrop-blur-sm hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-breachfix-gold/20">
                  <h5 className="text-breachfix-gold font-semibold mb-1 text-sm">Danger</h5>
                  <p className="text-breachfix-white text-xs">{featuredVerse.batchData.Danger}</p>
                </div>
              )}
              {featuredVerse.batchData.Evidence && (
                <div className="bg-breachfix-gold bg-opacity-20 border border-breachfix-gold border-opacity-30 p-3 rounded-lg backdrop-blur-sm hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-breachfix-gold/20">
                  <h5 className="text-breachfix-gold font-semibold mb-1 text-sm">Evidence</h5>
                  <p className="text-breachfix-white text-xs">{featuredVerse.batchData.Evidence}</p>
                </div>
              )}
              {featuredVerse.batchData.Explanation && (
                <div className="bg-breachfix-gold bg-opacity-20 border border-breachfix-gold border-opacity-30 p-3 rounded-lg backdrop-blur-sm hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-breachfix-gold/20">
                  <h5 className="text-breachfix-gold font-semibold mb-1 text-sm">Explanation</h5>
                  <p className="text-breachfix-white text-xs">{featuredVerse.batchData.Explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {featuredVerse.modernVersionsCited && Array.isArray(featuredVerse.modernVersionsCited) && featuredVerse.modernVersionsCited.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-breachfix-white mb-3">Modern Versions Cited</h4>
            <div className="flex flex-wrap gap-2">
              {featuredVerse.modernVersionsCited.map((version: string, index: number) => (
                <span key={index} className="bg-breachfix-gray text-breachfix-white px-3 py-1 rounded-full text-sm">
                  {version}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sacred Donation Section - Temple Offering */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="mt-10 bg-gradient-to-br from-amber-800 via-breachfix-navy to-amber-900 rounded-2xl p-8 border border-amber-400 border-opacity-50 backdrop-blur-sm relative overflow-hidden hover:border-opacity-80 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/40"
        >
          {/* Temple Offering Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-breachfix-gold/10 opacity-60 -z-10"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 animate-pulse -z-10 shadow-lg shadow-amber-500/60"></div>
          
          {/* Sacred Flame Effects */}
          <div className="absolute top-6 left-6 w-2 h-12 bg-gradient-to-b from-yellow-300 to-amber-600 rounded-full opacity-70 animate-pulse shadow-lg shadow-amber-500/50 -z-10"></div>
          <div className="absolute top-8 left-8 w-1 h-8 bg-gradient-to-b from-yellow-200 to-amber-500 rounded-full opacity-90 animate-pulse -z-10"></div>
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="text-3xl">🏛️</div>
            <h4 className="text-2xl font-bold text-amber-100 relative">
              <span className="bg-gradient-to-r from-amber-300 via-breachfix-gold to-amber-400 bg-clip-text text-transparent">
                Support the Sacred Work
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-80 shadow-lg shadow-amber-500/50"></div>
            </h4>
          </div>
          
          <p className="text-amber-100 mb-8 leading-relaxed text-lg relative z-10 font-medium">
            "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver." — 2 Corinthians 9:7
            <br /><br />
            This sacred analysis represents extensive research across multiple Bible versions and historical sources. 
            Your offering helps fund continued research, accurate translations, and the development of tools that help 
            believers understand God's Word more clearly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center relative z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            <DonationButton
              scope={{
                kind: 'verse',
                lang: 'eng',
                source: 'kjv',
                bookNumber: currentVerse.book,
                chapter: currentVerse.chapter,
                verse: currentVerse.verse
              }}
              amount={15}
                label="Support Sacred Research"
                className="bg-gradient-to-r from-amber-500 to-breachfix-gold hover:from-amber-400 hover:to-yellow-400 text-breachfix-navy px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 border border-amber-400 border-opacity-50 hover:border-opacity-80 shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 flex items-center gap-3"
              onSuccess={handleDonationSuccess}
              onError={handleDonationError}
            />
            </motion.div>
            
            <div className="text-amber-100 space-y-2">
              <p className="text-lg">🏛️ <strong>Sacred Verse:</strong> {bookNames[currentVerse.book]} {currentVerse.chapter}:{currentVerse.verse}</p>
              <p className="text-lg">⚖️ <strong>Divine Impact:</strong> Your offering enables detailed translation analysis</p>
              <p className="text-sm text-amber-200">"The words of the LORD are pure words: as silver tried in a furnace of earth, purified seven times." — Psalm 12:6</p>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default ChangedFeatured;
