import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ApiService } from '../../utils/api';

interface ChangedFeaturedProps {
  onFeaturedVerseChange?: (data: any) => void;
}

const ChangedFeatured: React.FC<ChangedFeaturedProps> = ({ onFeaturedVerseChange: _onFeaturedVerseChange }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerse, setCurrentVerse] = useState({ book: 43, chapter: 1, verse: 18 });
  const [currentRotationIndex, setCurrentRotationIndex] = useState<number | null>(null);

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
    // Auto-refresh every minute to get the new featured verse
    const interval = setInterval(() => {
      fetchFeaturedVerse();
    }, 60000); // 60 seconds = 1 minute

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
        <div className="bg-gradient-to-r from-bridge-navy to-bridge-emerald rounded-2xl p-8">
          <div className="flex justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-center text-bridge-white text-sm">
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
        <div className="bg-gradient-to-r from-bridge-navy to-bridge-emerald rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-bridge-white mb-4">
              BreachFix Verse
            </h2>
            <p className="text-bridge-white mb-4">
              Loading a verse where translation changes affect doctrine...
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchNextFeaturedVerse();
              }}
              className="bg-bridge-gold hover:bg-yellow-500 text-bridge-navy px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              🎲 Try Another Verse
            </motion.button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-bridge-navy to-bridge-emerald rounded-2xl p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-bridge-white mb-2">
            BreachFix Verse
          </h2>
          <p className="text-bridge-white mb-4">
            A real example of how translation changes can affect doctrine
          </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      fetchNextFeaturedVerse();
                    }}
                    className="bg-bridge-gold hover:bg-yellow-500 text-bridge-navy px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    🎲 New Verse
                  </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verse Comparison */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-bridge-white mb-4">
              {featuredVerse.reference}
            </h3>
            
            <div className="bg-bridge-dark rounded-lg p-4">
              <h4 className="text-bridge-gold font-semibold mb-2">Original KJV Text</h4>
              <p className="text-bridge-white leading-relaxed">
                {featuredVerse.kjvBaseline}
              </p>
            </div>
            
            <div className="bg-red-600 bg-opacity-20 border border-red-400 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Modern Change</h4>
              <p className="text-bridge-white leading-relaxed">
                {featuredVerse.modernNote}
              </p>
            </div>
          </div>

          {/* Spirit of Prophecy & Analysis */}
          <div className="space-y-4">
            <div className="bg-bridge-emerald bg-opacity-30 border border-bridge-emerald rounded-lg p-4">
              <h4 className="text-bridge-emerald font-semibold mb-2">Spirit of Prophecy</h4>
              <blockquote className="text-bridge-white leading-relaxed text-sm italic mb-2">
                "{typeof featuredVerse.spiritOfProphecy === 'string' 
                  ? featuredVerse.spiritOfProphecy 
                  : featuredVerse.spiritOfProphecy?.quote || 'Spirit of Prophecy quote not available'}"
              </blockquote>
              {typeof featuredVerse.spiritOfProphecy === 'object' && featuredVerse.spiritOfProphecy?.citation && (
                <cite className="text-bridge-emerald text-xs">
                  — {featuredVerse.spiritOfProphecy.citation}
                </cite>
              )}
            </div>
            
            <div className="bg-bridge-dark rounded-lg p-4">
              <h4 className="text-bridge-gold font-semibold mb-2">What Changed & Why</h4>
              <p className="text-bridge-white leading-relaxed text-sm">
                {featuredVerse.changeSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Real Data Sections */}
        {featuredVerse.affectedDoctrine && Array.isArray(featuredVerse.affectedDoctrine) && featuredVerse.affectedDoctrine.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-bridge-gold mb-3">Affected Doctrine</h4>
            <div className="flex flex-wrap gap-2">
              {featuredVerse.affectedDoctrine.map((doctrine: string, index: number) => (
                <span key={index} className="bg-bridge-gold text-bridge-navy px-3 py-1 rounded-full text-sm">
                  {doctrine}
                </span>
              ))}
            </div>
          </div>
        )}

        {featuredVerse.batchData && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-bridge-white mb-3">Detailed Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredVerse.batchData.Error && (
                <div className="bg-red-600 bg-opacity-20 border border-red-400 p-3 rounded-lg">
                  <h5 className="text-red-400 font-semibold mb-1 text-sm">Error</h5>
                  <p className="text-bridge-white text-xs">{featuredVerse.batchData.Error}</p>
                </div>
              )}
              {featuredVerse.batchData.Danger && (
                <div className="bg-orange-900 bg-opacity-20 border border-orange-500 p-3 rounded-lg">
                  <h5 className="text-orange-400 font-semibold mb-1 text-sm">Danger</h5>
                  <p className="text-bridge-white text-xs">{featuredVerse.batchData.Danger}</p>
                </div>
              )}
              {featuredVerse.batchData.Evidence && (
                <div className="bg-bridge-emerald bg-opacity-20 border border-bridge-emerald p-3 rounded-lg">
                  <h5 className="text-bridge-gold font-semibold mb-1 text-sm">Evidence</h5>
                  <p className="text-bridge-white text-xs">{featuredVerse.batchData.Evidence}</p>
                </div>
              )}
              {featuredVerse.batchData.Explanation && (
                <div className="bg-green-900 bg-opacity-20 border border-green-500 p-3 rounded-lg">
                  <h5 className="text-bridge-gold font-semibold mb-1 text-sm">Explanation</h5>
                  <p className="text-bridge-white text-xs">{featuredVerse.batchData.Explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {featuredVerse.modernVersionsCited && Array.isArray(featuredVerse.modernVersionsCited) && featuredVerse.modernVersionsCited.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-bridge-white mb-3">Modern Versions Cited</h4>
            <div className="flex flex-wrap gap-2">
              {featuredVerse.modernVersionsCited.map((version: string, index: number) => (
                <span key={index} className="bg-bridge-gray text-bridge-white px-3 py-1 rounded-full text-sm">
                  {version}
                </span>
              ))}
            </div>
          </div>
        )}

      </motion.div>
    </section>
  );
};

export default ChangedFeatured;
