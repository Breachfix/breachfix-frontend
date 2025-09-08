import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { ApiService } from '../../utils/api';
import DonationButton from '../donations/DonationButton';
import { useDonation } from '../../hooks/useDonation';

interface ChangedDetailProps {
  lang: string;
  source: string;
  book: number;
  chapter: number;
  verse: number;
}

const ChangedDetail: React.FC<ChangedDetailProps> = ({ lang, source, book, chapter, verse }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleDonationSuccess, handleDonationError } = useDonation();

  useEffect(() => {
    if (!lang || !source || !book || !chapter || !verse) return;
    
    setLoading(true);
    setError(null);
    
    ApiService.allBibleChanged.asterisk.analyzeVerse(book, chapter, verse, lang, source)
      .then((response) => {
        setData(response);
      })
      .catch((err) => {
        console.error('Failed to analyze verse:', err);
        setError(err?.message || 'Failed to load verse analysis');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lang, source, book, chapter, verse]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-400 text-xl mb-4">⚠️ Error Loading Verse</div>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <p className="text-gray-400 text-xs">
            This verse may not have change analysis available, or there was a connection issue.
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-gray-400 text-xl mb-4">No Analysis Available</div>
          <p className="text-gray-300 text-sm">
            This verse doesn't have change analysis data available.
          </p>
        </div>
      </div>
    );
  }

  const { changedVerse } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Warning Message */}
      <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-red-400 font-semibold mb-2">Verse Altered in Modern Translations</h4>
            <p className="text-red-300 text-sm">
              This verse has been changed or altered in modern Bible translations. 
              The original KJV text may differ significantly from what you're reading.
            </p>
          </div>
        </div>
      </div>

      {/* Text Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-green-400 mb-4">Original KJV Text</h4>
          <div className="bg-netflix-gray p-4 rounded-lg">
            <p className="text-white leading-relaxed">
              {changedVerse?.kjvBaseline || 'Original text not available'}
            </p>
          </div>
        </div>
        
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-blue-400 mb-4">
            Current Translation ({lang.toUpperCase()} - {source.toUpperCase()})
          </h4>
          <div className="bg-netflix-gray p-4 rounded-lg">
            <p className="text-white leading-relaxed">
              {data.currentText || 'Current text not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Correction */}
      {changedVerse?.translation?.suggestion && (
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4">Suggested Correction</h4>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-4 rounded-lg">
            <p className="text-white leading-relaxed">
              {changedVerse.translation.suggestion}
            </p>
          </div>
        </div>
      )}

      {/* Change Summary */}
      {changedVerse?.summary && (
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Change Summary</h4>
          <div className="bg-netflix-gray p-4 rounded-lg">
            <p className="text-white leading-relaxed">
              {changedVerse.summary}
            </p>
          </div>
        </div>
      )}

      {/* Analysis */}
      {changedVerse?.analysis && (
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Analysis</h4>
          <div className="bg-netflix-gray p-4 rounded-lg">
            <p className="text-white leading-relaxed">
              {changedVerse.analysis}
            </p>
          </div>
        </div>
      )}

      {/* Affected Doctrine */}
      {changedVerse?.affectedDoctrine && Array.isArray(changedVerse.affectedDoctrine) && changedVerse.affectedDoctrine.length > 0 && (
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Affected Doctrine</h4>
          <div className="flex flex-wrap gap-2">
            {changedVerse.affectedDoctrine.map((doctrine: string, index: number) => (
              <span key={index} className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
                {doctrine}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Batch Data */}
      {changedVerse?.batchData && (
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Detailed Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {changedVerse.batchData?.Error && (
              <div className="bg-red-900 bg-opacity-20 border border-red-500 p-4 rounded-lg">
                <h5 className="text-red-400 font-semibold mb-2">Error</h5>
                <p className="text-white text-sm">{changedVerse.batchData.Error}</p>
              </div>
            )}
            {changedVerse.batchData?.Danger && (
              <div className="bg-orange-900 bg-opacity-20 border border-orange-500 p-4 rounded-lg">
                <h5 className="text-orange-400 font-semibold mb-2">Danger</h5>
                <p className="text-white text-sm">{changedVerse.batchData.Danger}</p>
              </div>
            )}
            {changedVerse.batchData?.Evidence && (
              <div className="bg-blue-900 bg-opacity-20 border border-blue-500 p-4 rounded-lg">
                <h5 className="text-blue-400 font-semibold mb-2">Evidence</h5>
                <p className="text-white text-sm">{changedVerse.batchData.Evidence}</p>
              </div>
            )}
            {changedVerse.batchData?.Explanation && (
              <div className="bg-green-900 bg-opacity-20 border border-green-500 p-4 rounded-lg">
                <h5 className="text-green-400 font-semibold mb-2">Explanation</h5>
                <p className="text-white text-sm">{changedVerse.batchData.Explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spirit of Prophecy */}
      {changedVerse?.spiritOfProphecy && (
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-4">Spirit of Prophecy</h4>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-4 rounded-lg">
            <blockquote className="text-white leading-relaxed italic">
              "{changedVerse.spiritOfProphecy}"
            </blockquote>
          </div>
        </div>
      )}

      {/* Modern Versions Cited */}
      {changedVerse?.modernVersionsCited && Array.isArray(changedVerse.modernVersionsCited) && changedVerse.modernVersionsCited.length > 0 && (
        <div className="bg-netflix-dark-gray rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Modern Versions Cited</h4>
          <div className="flex flex-wrap gap-2">
            {changedVerse.modernVersionsCited.map((version: string, index: number) => (
              <span key={index} className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                {version}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Donation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl p-6 border border-green-500"
      >
        <div className="flex items-center gap-3 mb-4">
          <Heart className="text-green-400" size={24} />
          <h4 className="text-lg font-semibold text-green-400">Support Translation Research</h4>
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          This verse analysis represents hours of research and comparison across multiple Bible versions. 
          Your donation helps fund continued research, accurate translations, and the development of tools 
          that help believers understand God's Word more clearly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <DonationButton
            scope={{
              kind: 'verse',
              lang: lang,
              source: source,
              bookNumber: book,
              chapter: chapter,
              verse: verse
            }}
            amount={25}
            label="Support This Research"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            onSuccess={handleDonationSuccess}
            onError={handleDonationError}
          />
          
          <div className="text-sm text-gray-400">
            <p>💡 <strong>Suggested:</strong> $25 helps fund 1 hour of research</p>
            <p>🎯 <strong>Impact:</strong> Your support enables accurate Bible translation</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChangedDetail;
