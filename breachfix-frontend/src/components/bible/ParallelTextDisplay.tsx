import React from 'react';
import { motion } from 'framer-motion';
import { useParallelText } from '../../hooks/useParallelText';

interface ParallelTextDisplayProps {
  selectedBookNumber: number;
  selectedChapter: number;
  selectedLanguage: string;
  highlightedVerse: number | null;
  onClearSelection: () => void;
}

export const ParallelTextDisplay: React.FC<ParallelTextDisplayProps> = ({
  selectedBookNumber,
  selectedChapter,
  selectedLanguage,
  highlightedVerse,
  onClearSelection,
}) => {
  const {
    parallelLanguages,
    parallelVerse,
    filteredParallelLanguages,
    languages,
    parallelTexts,
    baseText,
    parallelSummary,
    languagesLoading,
    parallelLoading,
    languagesError,
    parallelError,
    handleParallelLanguageToggle,
    tryDifferentVerse,
    clearParallelSelection,
    setVerseForComparison,
    getFullLanguageName,
  } = useParallelText({
    selectedBookNumber,
    selectedChapter,
    selectedLanguage,
    highlightedVerse,
  });

  if (languagesLoading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-breachfix-gold border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (languagesError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-xl mb-4">Error loading languages</div>
        <p className="text-breachfix-gray">{languagesError.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-breachfix-white mb-4">
        Parallel Text Comparison
      </h2>

      {/* Parallel Language Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-breachfix-white mb-3">Select Languages to Compare</h3>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(languages) && languages.map((lang: any) => (
            <motion.button
              key={lang.code3}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleParallelLanguageToggle(lang.code3)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                parallelLanguages.includes(lang.code3)
                  ? 'bg-breachfix-gold text-breachfix-navy'
                  : 'bg-breachfix-gray text-breachfix-white hover:bg-breachfix-gold hover:bg-opacity-20 hover:text-breachfix-navy'
              }`}
              disabled={lang.code3 === selectedLanguage}
            >
              {getFullLanguageName(lang.code3) || lang.name}
              {lang.code3 === selectedLanguage && (
                <span className="ml-2 text-xs text-breachfix-navy font-semibold">(Base)</span>
              )}
            </motion.button>
          ))}
        </div>
        <p className="text-breachfix-gray text-sm mt-2">
          Selected languages: {parallelLanguages.length} | 
          Filtered for comparison: {filteredParallelLanguages.length}
          {filteredParallelLanguages.length === 0 && (
            <span className="text-red-400 ml-2">⚠️ No languages available for comparison</span>
          )}
        </p>
        <p className="text-breachfix-gray text-xs mt-1">
          💡 Note: Some verses may not be available in all languages. Try different verses if you encounter errors.
        </p>
      </div>

      {/* Verse Selection and Display */}
      {!parallelVerse && !highlightedVerse ? (
        <div className="text-center py-12">
          <div className="text-breachfix-gray text-xl mb-4">Select a verse to compare</div>
          <p className="text-breachfix-gray mb-4">Click on a verse in the reading tab to see parallel translations, or select a verse below:</p>
          
          {/* Verse Selector */}
          <div className="mt-6 max-w-md mx-auto">
            <label className="block text-sm font-medium text-breachfix-white mb-2">
              Select Verse Number:
            </label>
            <div className="space-y-4">
              {/* Verse Input with Increment/Decrement */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const currentVerse = parallelVerse || highlightedVerse || 1;
                    const newVerse = Math.max(1, currentVerse - 1);
                    setVerseForComparison(newVerse);
                  }}
                  className="bg-breachfix-gray hover:bg-breachfix-gray/80 text-breachfix-white px-4 py-2 rounded transition-colors duration-200 font-bold text-lg"
                  title="Previous verse"
                >
                  ←
                </button>
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={parallelVerse || highlightedVerse || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setVerseForComparison(0);
                      } else {
                        const verse = parseInt(value, 10);
                        if (!isNaN(verse) && verse >= 1 && verse <= 200) {
                          setVerseForComparison(verse);
                        }
                      }
                    }}
                    className="w-full bg-breachfix-gray text-breachfix-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-breachfix-gold text-center font-semibold"
                    placeholder="Enter verse number"
                  />
                  <div className="text-xs text-breachfix-gray text-center mt-1">
                    Range: 1-200
                  </div>
                </div>
                <button
                  onClick={() => {
                    const currentVerse = parallelVerse || highlightedVerse || 0;
                    const newVerse = Math.min(200, currentVerse + 1);
                    setVerseForComparison(newVerse);
                  }}
                  className="bg-breachfix-gray hover:bg-breachfix-gray/80 text-breachfix-white px-4 py-2 rounded transition-colors duration-200 font-bold text-lg"
                  title="Next verse"
                >
                  →
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const currentVerse = parallelVerse || highlightedVerse;
                    if (currentVerse && currentVerse > 0) {
                      setVerseForComparison(currentVerse);
                    }
                  }}
                  disabled={!parallelVerse && !highlightedVerse}
                  className="flex-1 bg-breachfix-gold hover:bg-yellow-500 disabled:bg-breachfix-gray disabled:text-breachfix-gray text-breachfix-white px-4 py-2 rounded transition-colors duration-200 font-medium"
                >
                  🔄 Refresh Comparison
                </button>
                <button
                  onClick={() => {
                    clearParallelSelection();
                    onClearSelection();
                  }}
                  className="bg-breachfix-gray hover:bg-breachfix-gray/80 text-breachfix-white px-4 py-2 rounded transition-colors duration-200 font-medium"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : parallelLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-breachfix-gold border-t-transparent rounded-full"
          />
        </div>
      ) : parallelError ? (
        <div className="text-center py-12">
          <div className="text-breachfix-gold text-xl mb-4">Error loading parallel text</div>
          <div className="bg-red-600 bg-opacity-20 border border-red-400 rounded-lg p-4 max-w-md mx-auto mb-4">
            <p className="text-red-100 text-sm mb-2">
              <strong>Error:</strong> {parallelError?.message || 'Unknown error occurred'}
            </p>
            <p className="text-breachfix-gray text-xs">
              This usually means the verse doesn't exist in one or more of the selected languages.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-breachfix-gray">Try one of these solutions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => tryDifferentVerse('first')}
                className="bg-breachfix-emerald hover:bg-teal-600 text-breachfix-white px-4 py-2 rounded text-sm transition-colors duration-200"
              >
                Try Verse 1
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => tryDifferentVerse('previous')}
                className="bg-breachfix-gray hover:bg-gray-700 text-breachfix-white px-4 py-2 rounded text-sm transition-colors duration-200"
              >
                Previous Verse
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => tryDifferentVerse('next')}
                className="bg-breachfix-gray hover:bg-gray-700 text-breachfix-white px-4 py-2 rounded text-sm transition-colors duration-200"
              >
                Next Verse
              </motion.button>
            </div>
          </div>
        </div>
      ) : (baseText || parallelTexts.length > 0) ? (
        <div className="space-y-4">
          {/* Summary Header */}
          <div className="bg-breachfix-gold bg-opacity-10 border border-breachfix-gold rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-breachfix-gold mb-2">
                  📖 Verse {parallelVerse || highlightedVerse || 1}
                </h3>
                <p className="text-breachfix-white">
                  {parallelSummary ? (
                    <>
                      Comparing translations across {parallelSummary.totalLanguages} languages
                      <span className="ml-2 text-green-400">
                        ({parallelSummary.totalSuccessful} available, {parallelSummary.totalFailed} missing)
                      </span>
                    </>
                  ) : (
                    `Comparing translations across ${parallelTexts.length} languages`
                  )}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  clearParallelSelection();
                  onClearSelection();
                }}
                className="bg-breachfix-gray hover:bg-gray-500 text-breachfix-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Clear Selection
              </motion.button>
            </div>
          </div>
          
          {/* Base Language Text */}
          {baseText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className={`rounded-lg p-6 mb-4 ${
                baseText.success 
                  ? 'bg-green-900 bg-opacity-20 border border-green-500' 
                  : 'bg-red-600 bg-opacity-20 border border-red-400'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-green-400">
                  {getFullLanguageName(baseText.language, baseText.metadata?.name) || 'Base Language'}
                  {baseText.success ? (
                    <span className="ml-2 text-xs bg-breachfix-emerald px-2 py-1 rounded">Available</span>
                  ) : (
                    <span className="ml-2 text-xs bg-breachfix-gold px-2 py-1 rounded">Not Available</span>
                  )}
                </h4>
                <span className="text-breachfix-gray text-sm">
                  {baseText.metadata?.code3?.toUpperCase() || baseText.language?.toUpperCase() || 'N/A'}
                </span>
              </div>
              {baseText.success ? (
                <p className="text-breachfix-white leading-relaxed text-lg">
                  {typeof baseText.text === 'string' ? baseText.text : baseText.text?.text || 'No text available'}
                </p>
              ) : (
                <p className="text-red-100 italic">
                  {baseText.error || 'Text not available in this language'}
                </p>
              )}
            </motion.div>
          )}
          
          {/* Parallel Language Texts */}
          {parallelTexts.map((parallel: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-lg p-6 ${
                parallel.success 
                  ? 'bg-netflix-dark-gray' 
                  : 'bg-red-600 bg-opacity-20 border border-red-400'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-breachfix-gold">
                  {getFullLanguageName(parallel.language, parallel.metadata?.name) || 'Unknown Language'}
                  {parallel.success ? (
                    <span className="ml-2 text-xs bg-breachfix-emerald px-2 py-1 rounded">Available</span>
                  ) : (
                    <span className="ml-2 text-xs bg-breachfix-gold px-2 py-1 rounded">Not Available</span>
                  )}
                </h4>
                <span className="text-breachfix-gray text-sm">
                  {parallel.metadata?.code3?.toUpperCase() || parallel.language?.toUpperCase() || 'N/A'}
                </span>
              </div>
              {parallel.success ? (
                <p className="text-breachfix-white leading-relaxed text-lg">
                  {typeof parallel.text === 'string' ? parallel.text : parallel.text?.text || 'No text available'}
                </p>
              ) : (
                <p className="text-red-100 italic">
                  {parallel.error || 'Text not available in this language'}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                {parallel.success && (
                  <button
                    onClick={() => {
                      const currentVerse = parallelVerse || highlightedVerse || 1;
                      const url = `/bible/read?lang=${parallel.language}&book=${selectedBookNumber}&chapter=${selectedChapter}&verse=${currentVerse}`;
                      window.location.href = url;
                    }}
                    className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                    title={`Read ${getFullLanguageName(parallel.language, parallel.metadata?.name)} from this chapter`}
                  >
                    📖 Read from this language
                  </button>
                )}
                {(parallel.changed?.exists || (typeof parallel.text === 'object' && parallel.text?.changed?.exists)) && (
                  <button
                    onClick={() => {
                      const url = `/bible/changed?lang=${parallel.language}&book=${selectedBookNumber}&chapter=${selectedChapter}&verse=${highlightedVerse || 1}`;
                      window.location.href = url;
                    }}
                    className="text-orange-400 hover:text-orange-300 text-xs bg-orange-900 bg-opacity-30 hover:bg-orange-900 hover:bg-opacity-50 px-2 py-1 rounded inline-block transition-colors duration-200"
                  >
                    Changed
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-breachfix-gray text-xl mb-4">No parallel translations available</div>
          <p className="text-breachfix-gray">Try selecting a different verse or language</p>
        </div>
      )}
    </div>
  );
};
