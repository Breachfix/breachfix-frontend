import React, { useState } from 'react';
import { useAllBiblesApi, useAllBibleEditsApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Interfaces for the AllBibles API
interface AllBibleLanguage {
  code3: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AllBibleSource {
  code: string;
  name?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AllBibleBook {
  number: number;
  name: string;
  chapters: number;
  createdAt: string;
  updatedAt: string;
}

interface AllBibleText {
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
  wordCount?: number;
  changed?: {
    exists: boolean;
    summary?: string;
    kjvBaseline?: string;
  };
}

const BibleEdit: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('eng');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedBookNumber, setSelectedBookNumber] = useState<number>(0);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<{ bookNumber: number; chapter: number; verse: number; text: string } | null>(null);
  const [editText, setEditText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editType, setEditType] = useState<'text_correction' | 'translation_improvement' | 'grammar_fix' | 'typo_correction' | 'other'>('text_correction');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isValidatingCombination, setIsValidatingCombination] = useState(false);

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

  // Use the new AllBibles edit mutation hook
  const submitEdit = useAllBibleEditsApi.useSubmitNumericEdit();

  // Fetch languages using the new AllBibles API
  const { data: languagesResponse, isLoading: languagesLoading } = useAllBiblesApi.languages.useGetAll();

  // Fetch sources for selected language
  const { data: sourcesResponse, isLoading: sourcesLoading } = useAllBiblesApi.sources.useGetByLanguage(
    selectedLanguage,
    { enabled: !!selectedLanguage }
  );

  // Fetch books for selected language and source
  const { data: booksResponse, isLoading: booksLoading } = useAllBiblesApi.books.useGetAll(
    selectedLanguage,
    selectedSource,
    { enabled: !!selectedLanguage && !!selectedSource }
  );

  // Fetch chapter content using the new AllBibles API
  const { data: chapterResponse, isLoading: chapterLoading } = useAllBiblesApi.text.useGetSpecific(
    selectedLanguage,
    selectedSource,
    { bookNumber: selectedBookNumber, chapter: selectedChapter },
    { enabled: !!selectedLanguage && !!selectedSource && !!selectedBookNumber && !!selectedChapter }
  );

  // Extract data from responses
  const languages = languagesResponse?.languages || [];
  const sources = sourcesResponse?.sources || [];
  const books = booksResponse?.books || [];
  const chapterTexts = chapterResponse?.texts || [];

  // Auto-select first available source when sources are loaded
  React.useEffect(() => {
    if (sources.length > 0 && !selectedSource) {
      setSelectedSource(sources[0].code);
    }
  }, [sources, selectedSource]);

  // Validate language/source combination
  const validateLanguageSourceCombination = async (languageCode: string, sourceCode: string) => {
    if (!languageCode || !sourceCode) return true;
    
    setIsValidatingCombination(true);
    setApiError(null);
    
    try {
      // Try to fetch books for this combination
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/all-bibles/${languageCode}/${sourceCode}/books`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Invalid combination: ${languageCode}/${sourceCode}`);
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid language/source combination';
      setApiError(errorMessage);
      return false;
    } finally {
      setIsValidatingCombination(false);
    }
  };

  // Clear API error when user changes selection
  const clearApiError = () => {
    setApiError(null);
  };

  // Handler functions
  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setSelectedSource(''); // Reset source - will be set when sources load
    setSelectedBookNumber(0);
    setSelectedChapter(1);
    setSelectedVerse(null);
    clearApiError(); // Clear any previous errors
  };

  const handleSourceChange = async (sourceCode: string) => {
    setSelectedSource(sourceCode);
    setSelectedBookNumber(0);
    setSelectedChapter(1);
    setSelectedVerse(null);
    clearApiError(); // Clear any previous errors
    
    // Validate the combination if both language and source are selected
    if (selectedLanguage && sourceCode) {
      await validateLanguageSourceCombination(selectedLanguage, sourceCode);
    }
  };

  const handleBookChange = (bookNumber: number) => {
    setSelectedBookNumber(bookNumber);
    setSelectedChapter(1);
    setSelectedVerse(null);
  };

  const handleChapterChange = (chapterNumber: number) => {
    setSelectedChapter(chapterNumber);
    setSelectedVerse(null);
  };

  const handleEditVerse = (verse: { bookNumber: number; chapter: number; verse: number; text: string }) => {
    setSelectedVerse(verse);
    setEditText(verse.text);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!selectedVerse || !editText.trim()) return;

    try {
      await submitEdit.mutateAsync({
        langCode: selectedLanguage,
        bookNumber: selectedVerse.bookNumber,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        suggestedText: editText.trim(),
        reason: editReason.trim() || undefined,
        editType,
        priority: editPriority
      });

      setShowEditModal(false);
      setSelectedVerse(null);
      setEditText('');
      setEditReason('');
      alert('Edit submitted successfully! It will be reviewed by an administrator.');
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('You need to complete identity verification before submitting edits.');
      } else if (error.response?.status === 409) {
        alert('You already have a pending edit for this verse.');
      } else {
        alert('Failed to submit edit. Please try again.');
      }
    }
  };

  const getBookChapters = (bookNumber: number) => {
    const book = books.find((b: AllBibleBook) => b.number === bookNumber);
    return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [];
  };

  // Group books by testament (Old Testament: first 39 books, New Testament: last 27 books)
  const oldTestamentBooks = books.slice(0, 39);
  const newTestamentBooks = books.slice(39);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-netflix-white mb-4">Authentication Required</h1>
          <p className="text-gray-400 text-lg mb-6">
            You need to be logged in to submit Bible edits.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (languagesLoading || sourcesLoading || booksLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-netflix-white">Submit Bible Edit</h1>
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                disabled={languagesLoading}
              >
                {languages.map((lang: AllBibleLanguage) => (
                  <option key={lang.code3} value={lang.code3}>
                    {languageNameMap[lang.code3.toLowerCase()] || lang.name} ({lang.code3.toUpperCase()})
                  </option>
                ))}
              </select>
              
              {/* Source Selector */}
              <select
                value={selectedSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                disabled={sourcesLoading}
              >
                {sources.map((source: AllBibleSource) => (
                  <option key={source.code} value={source.code}>
                    {source.name || source.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            {/* API Error Display */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-red-400 font-semibold mb-1">Invalid Language/Source Combination</h4>
                    <p className="text-red-300 text-sm mb-2">{apiError}</p>
                    <div className="text-red-200 text-xs">
                      <p className="mb-1"><strong>Tip:</strong> Each language has specific source translations available.</p>
                      <p>Try selecting a different source or language combination.</p>
                    </div>
                  </div>
                  <button
                    onClick={clearApiError}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Validation Loading Indicator */}
            {isValidatingCombination && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                  />
                  <span className="text-blue-300 text-sm">Validating language/source combination...</span>
                </div>
              </motion.div>
            )}
            
            {/* Helpful Language/Source Info */}
            {selectedLanguage && sources.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-gray-300 text-xs">
                    <p className="mb-1">
                      <strong>{languageNameMap[selectedLanguage.toLowerCase()] || selectedLanguage.toUpperCase()}</strong> has {sources.length} translation{sources.length !== 1 ? 's' : ''} available:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {sources.slice(0, 5).map((source) => (
                        <span key={source.code} className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {source.name || source.code.toUpperCase()}
                        </span>
                      ))}
                      {sources.length > 5 && (
                        <span className="text-gray-400 text-xs">+{sources.length - 5} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Book Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-netflix-dark-gray rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-netflix-white mb-4">Books</h2>
              
              {/* Old Testament */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">Old Testament</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {oldTestamentBooks.map((book: AllBibleBook) => (
                    <motion.button
                      key={book.number}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBookChange(book.number)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                        selectedBookNumber === book.number
                          ? 'bg-netflix-red text-white'
                          : 'text-gray-300 hover:bg-netflix-gray hover:text-white'
                      }`}
                    >
                      {book.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* New Testament */}
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-3">New Testament</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {newTestamentBooks.map((book: AllBibleBook) => (
                    <motion.button
                      key={book.number}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBookChange(book.number)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                        selectedBookNumber === book.number
                          ? 'bg-netflix-red text-white'
                          : 'text-gray-300 hover:bg-netflix-gray hover:text-white'
                      }`}
                    >
                      {book.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Chapter Selection */}
            {selectedBookNumber && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-netflix-white">
                    {books.find((b: AllBibleBook) => b.number === selectedBookNumber)?.name} - Chapter {selectedChapter}
                  </h2>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {getBookChapters(selectedBookNumber).map((chapterNum) => (
                    <motion.button
                      key={chapterNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChapterChange(chapterNum)}
                      className={`px-3 py-1 rounded transition-colors duration-200 ${
                        selectedChapter === chapterNum
                          ? 'bg-netflix-red text-white'
                          : 'bg-netflix-gray text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {chapterNum}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Chapter Content */}
            {chapterLoading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                />
              </div>
            ) : chapterTexts.length > 0 ? (
              <div className="bg-netflix-dark-gray rounded-lg p-6 md:p-8">
                <div className="prose prose-invert max-w-none">
                  {chapterTexts.map((verse: AllBibleText) => (
                    <motion.div
                      key={verse.verse}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: verse.verse * 0.05 }}
                      className="mb-4 transition-all duration-300 rounded-lg p-3 hover:bg-netflix-gray hover:bg-opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-netflix-red font-bold mr-2 flex-shrink-0 text-lg">
                          {verse.verse}.
                        </span>
                        <span className="text-white leading-relaxed flex-1 text-lg">
                          {verse.text}
                        </span>
                        {verse.changed?.exists && (
                          <span className="text-orange-400 text-xs bg-orange-900 bg-opacity-30 px-2 py-1 rounded">
                            Changed
                          </span>
                        )}
                        <button
                          onClick={() => handleEditVerse({
                            bookNumber: verse.bookNumber,
                            chapter: verse.chapter,
                            verse: verse.verse,
                            text: verse.text
                          })}
                          className="text-netflix-red hover:text-red-400 text-sm bg-netflix-gray hover:bg-gray-600 px-3 py-1 rounded transition-colors duration-200"
                        >
                          Edit
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : selectedBookNumber ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">Select a chapter to edit</div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">Select a book to start editing</div>
                <p className="text-gray-500">Choose from the Old or New Testament</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedVerse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-netflix-dark-gray rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-netflix-white mb-4">
                Edit Verse {selectedVerse.bookNumber}:{selectedVerse.chapter}:{selectedVerse.verse}
              </h3>
              
              <div className="space-y-4">
                {/* Original Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Text
                  </label>
                  <div className="bg-netflix-gray p-3 rounded text-gray-300">
                    {selectedVerse.text}
                  </div>
                </div>

                {/* Edit Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Edit Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full bg-netflix-gray text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  >
                    <option value="text_correction">Text Correction</option>
                    <option value="translation_improvement">Translation Improvement</option>
                    <option value="grammar_fix">Grammar Fix</option>
                    <option value="typo_correction">Typo Correction</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full bg-netflix-gray text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Suggested Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Suggested Text
                  </label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-netflix-gray text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    rows={4}
                    placeholder="Enter your suggested text..."
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="w-full bg-netflix-gray text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    rows={3}
                    placeholder="Explain why this edit is needed..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVerse(null);
                    setEditText('');
                    setEditReason('');
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEdit}
                  disabled={!editText.trim() || submitEdit.isPending}
                  className="bg-netflix-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors duration-200"
                >
                  {submitEdit.isPending ? 'Submitting...' : 'Submit Edit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleEdit;