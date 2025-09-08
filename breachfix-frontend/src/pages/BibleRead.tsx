import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllBiblesApi } from '../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import VerseDisplay from '../components/bible/VerseDisplay';
import ChapterHeader from '../components/bible/ChapterHeader';
import DonationModal from '../components/donations/DonationModal';
import { useDonation } from '../hooks/useDonation';

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

interface AllBibleSearchResult {
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
  wordCount: number;
  language?: { code: string; code3: string; name: string };
  source?: { code: string; name: string; notes: string };
  changed?: { exists: boolean };
}

interface ReadingProgress {
  languageCode: string;
  sourceCode: string;
  bookNumber: number;
  chapter: number;
  lastReadAt: string;
}

const BibleRead: React.FC = () => {
  const navigate = useNavigate();
  const { handleDonationClick, handleDonationSuccess, handleDonationError, showModal, donationScope, handleDonationCancel } = useDonation();
  
  // Load initial state from localStorage or use defaults
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => 
    localStorage.getItem('bibleRead_selectedLanguage') || 'eng'
  );
  const [selectedSource, setSelectedSource] = useState<string>(() => 
    localStorage.getItem('bibleRead_selectedSource') || ''
  );
  const [selectedBookNumber, setSelectedBookNumber] = useState<number>(() => 
    parseInt(localStorage.getItem('bibleRead_selectedBookNumber') || '1', 10)
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(() => 
    parseInt(localStorage.getItem('bibleRead_selectedChapter') || '1', 10)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'read' | 'search' | 'parallel'>(() => 
    (localStorage.getItem('bibleRead_activeTab') as 'read' | 'search' | 'parallel') || 'read'
  );
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(() => {
    const stored = localStorage.getItem('bibleRead_highlightedVerse');
    return stored ? parseInt(stored, 10) : null;
  });
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'indent'>(() => 
    (localStorage.getItem('bibleRead_textAlignment') as 'left' | 'center' | 'indent') || 'left'
  );
  const [parallelLanguages, setParallelLanguages] = useState<string[]>(() => {
    const stored = localStorage.getItem('bibleRead_parallelLanguages');
    return stored ? JSON.parse(stored) : ['run', 'fra'];
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isValidatingCombination, setIsValidatingCombination] = useState(false);
  const [asteriskData, setAsteriskData] = useState<{ [key: string]: boolean }>({});
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedChangeReference, setSelectedChangeReference] = useState<string | null>(null);
  const [parallelVerse, setParallelVerse] = useState<number | null>(() => {
    const stored = localStorage.getItem('bibleRead_parallelVerse');
    return stored ? parseInt(stored, 10) : null;
  });

  // Languages and sources that should NOT show asterisks
  const excludedLanguages = ['eng', 'fra', 'heb', 'grc'];
  const excludedSources = ['kjv', 'kjf', 'mt', 'tr1894'];

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bibleRead_selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('bibleRead_selectedSource', selectedSource);
  }, [selectedSource]);

  useEffect(() => {
    localStorage.setItem('bibleRead_selectedBookNumber', selectedBookNumber.toString());
  }, [selectedBookNumber]);

  useEffect(() => {
    localStorage.setItem('bibleRead_selectedChapter', selectedChapter.toString());
  }, [selectedChapter]);

  useEffect(() => {
    localStorage.setItem('bibleRead_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (highlightedVerse) {
      localStorage.setItem('bibleRead_highlightedVerse', highlightedVerse.toString());
    } else {
      localStorage.removeItem('bibleRead_highlightedVerse');
    }
  }, [highlightedVerse]);

  useEffect(() => {
    localStorage.setItem('bibleRead_textAlignment', textAlignment);
  }, [textAlignment]);

  useEffect(() => {
    localStorage.setItem('bibleRead_parallelLanguages', JSON.stringify(parallelLanguages));
  }, [parallelLanguages]);

  useEffect(() => {
    if (parallelVerse) {
      localStorage.setItem('bibleRead_parallelVerse', parallelVerse.toString());
    } else {
      localStorage.removeItem('bibleRead_parallelVerse');
    }
  }, [parallelVerse]);

  // Filter out the selected language from parallel languages to avoid API conflicts
  const filteredParallelLanguages = useMemo(() => 
    parallelLanguages.filter(lang => lang !== selectedLanguage),
    [parallelLanguages, selectedLanguage]
  );

  // Fetch languages using the new AllBibles API
  const { data: languagesResponse, isLoading: languagesLoading, error: languagesError } = useAllBiblesApi.languages.useGetAll();

  // Fetch sources for selected language
  const { data: sourcesResponse, isLoading: sourcesLoading, error: sourcesError } = useAllBiblesApi.sources.useGetByLanguage(
    selectedLanguage,
    { enabled: !!selectedLanguage }
  );

  // Fetch books for selected language and source
  const { data: booksResponse, isLoading: booksLoading, error: booksError } = useAllBiblesApi.books.useGetAll(
    selectedLanguage,
    selectedSource,
    { enabled: !!selectedLanguage && !!selectedSource }
  );

  // Fetch chapter content using the new AllBibles API
  const { data: chapterResponse, isLoading: chapterLoading, error: chapterError } = useAllBiblesApi.text.useGetSpecific(
    selectedLanguage,
    selectedSource,
    { bookNumber: selectedBookNumber, chapter: selectedChapter },
    { enabled: !!selectedLanguage && !!selectedSource && !!selectedBookNumber && !!selectedChapter }
  );

  // Check if current language/source should show asterisks
  const shouldShowAsterisks = useMemo(() => {
    return !excludedLanguages.includes(selectedLanguage) && !excludedSources.includes(selectedSource);
  }, [selectedLanguage, selectedSource]);

  // State to store verse analysis data
  const [verseAnalysisData, setVerseAnalysisData] = useState<{ [key: string]: any }>({});

  // Check asterisks for current chapter verses using individual queries
  useEffect(() => {
    if (!shouldShowAsterisks || !chapterResponse?.verses) {
      setVerseAnalysisData({});
      setAsteriskData({});
      return;
    }

    // Create analysis promises for all verses
    const analysisPromises = chapterResponse.verses.map(async (verse: any) => {
      const reference = `${selectedBookNumber}:${selectedChapter}:${verse.verse}`;
      try {
        const response = await fetch(
          `/api/v3/all-bibles/analyze/${selectedBookNumber}/${selectedChapter}/${verse.verse}?language=${selectedLanguage}&source=${selectedSource}`
        );
        const data = await response.json();
        return { reference, data };
      } catch (error) {
        console.error(`Failed to analyze verse ${reference}:`, error);
        return { reference, data: null };
      }
    });

    // Execute all analysis requests
    Promise.all(analysisPromises).then((results) => {
      const newAnalysisData: { [key: string]: any } = {};
      const newAsteriskData: { [key: string]: boolean } = {};
      
      results.forEach(({ reference, data }) => {
        if (data) {
          newAnalysisData[reference] = data;
          if (data.showAsterisk) {
            newAsteriskData[reference] = true;
          }
        }
      });
      
      setVerseAnalysisData(newAnalysisData);
      setAsteriskData(newAsteriskData);
    }).catch((error) => {
      console.error('Failed to analyze verses:', error);
    });
  }, [shouldShowAsterisks, chapterResponse?.verses, selectedBookNumber, selectedChapter, selectedLanguage, selectedSource]);

  // Note: We now use selectedVerseAnalysis instead of changeDetails

  // Search verses using the new AllBibles API
  const { data: searchResponse, isLoading: searchLoading, error: searchError } = useAllBiblesApi.search.useByLanguageSource(
    selectedLanguage,
    selectedSource,
    searchQuery,
    { limit: 50 },
    { enabled: !!selectedLanguage && !!selectedSource && !!searchQuery && searchQuery.length > 2 }
  );

  // Global search for cross-language results
  const { data: globalSearchResponse, isLoading: globalSearchLoading, error: globalSearchError } = useAllBiblesApi.search.useGlobal(
    searchQuery,
    { limit: 100, includeMetadata: true },
    { enabled: !!searchQuery && searchQuery.length > 2 && activeTab === 'search' }
  );

  // Parallel text for selected verse
  const { data: parallelResponse, isLoading: parallelLoading, error: parallelError } = useAllBiblesApi.parallel.useGetMultiple(
    selectedBookNumber,
    selectedChapter,
    parallelVerse || highlightedVerse || 1, // Use parallelVerse first, then highlightedVerse, then fallback to 1
    selectedLanguage,
    filteredParallelLanguages,
    { enabled: !!selectedBookNumber && !!selectedChapter && filteredParallelLanguages.length >= 1 }
  );

  // Extract data from responses
  const languages = languagesResponse?.languages || [];
  const sources = sourcesResponse?.sources || [];
  const books = booksResponse?.books || [];
  const chapterTexts = chapterResponse?.texts || [];
  const searchResults = searchResponse?.results || [];
  const globalSearchResults = globalSearchResponse?.results || [];
  const parallelTexts = parallelResponse?.parallels || [];
  const baseText = parallelResponse?.base;
  const parallelSummary = parallelResponse?.summary;

  // Memoized book lookups for performance
  const selectedBook = useMemo(() => 
    books.find((b: AllBibleBook) => b.number === selectedBookNumber),
    [books, selectedBookNumber]
  );

  const readingProgressBook = useMemo(() => 
    readingProgress ? books.find((b: AllBibleBook) => b.number === readingProgress.bookNumber) : null,
    [books, readingProgress]
  );

  // Memoized book lookup function for search results
  const getBookByNumber = useMemo(() => {
    const bookMap = new Map(books.map(book => [book.number, book]));
    return (bookNumber: number) => bookMap.get(bookNumber);
  }, [books]);

  // Memoized book name lookup for search
  const getBookByName = useMemo(() => {
    const nameMap = new Map(books.map(book => [book.name.toLowerCase(), book]));
    return (bookName: string) => {
      // First try exact match
      let book = nameMap.get(bookName.toLowerCase());
      if (book) return book;
      
      // Then try partial match
      return books.find((b: AllBibleBook) => 
        b.name.toLowerCase().includes(bookName.toLowerCase())
      );
    };
  }, [books]);

  // Memoized language lookup
  const getLanguageByCode = useMemo(() => {
    const languageMap = new Map(languages.map(lang => [lang.code3, lang]));
    return (code3: string) => languageMap.get(code3);
  }, [languages]);

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

  // Helper function to get full language name
  const getFullLanguageName = (languageCode: string, metadataName?: string) => {
    if (metadataName) return metadataName;
    const lang = getLanguageByCode(languageCode);
    if (lang) {
      // Use mapped name if available, otherwise use the name from API
      return languageNameMap[languageCode.toLowerCase()] || lang.name;
    }
    return languageCode;
  };

  // Load reading progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('bible-reading-progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      if (progress.languageCode === selectedLanguage && progress.sourceCode === selectedSource) {
        setReadingProgress(progress);
        setSelectedBookNumber(progress.bookNumber);
        setSelectedChapter(progress.chapter);
        setShowWelcome(false);
      }
    }
  }, [selectedLanguage, selectedSource]);

  // Load text alignment preference from localStorage
  useEffect(() => {
    const savedAlignment = localStorage.getItem('bible-text-alignment');
    if (savedAlignment && ['left', 'center', 'indent'].includes(savedAlignment)) {
      setTextAlignment(savedAlignment as 'left' | 'center' | 'indent');
    }
  }, []);

  // Save text alignment preference
  useEffect(() => {
    localStorage.setItem('bible-text-alignment', textAlignment);
  }, [textAlignment]);

  // Save reading progress
  useEffect(() => {
    if (selectedBookNumber && selectedChapter && selectedLanguage && selectedSource) {
      const progress: ReadingProgress = {
        languageCode: selectedLanguage,
        sourceCode: selectedSource,
        bookNumber: selectedBookNumber,
        chapter: selectedChapter,
        lastReadAt: new Date().toISOString(),
      };
      setReadingProgress(progress);
      localStorage.setItem('bible-reading-progress', JSON.stringify(progress));
    }
  }, [selectedBookNumber, selectedChapter, selectedLanguage, selectedSource]);

  // Auto-hide welcome message
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Auto-select first available source when sources are loaded
  useEffect(() => {
    if (sources.length > 0 && !selectedSource) {
      setSelectedSource(sources[0].code);
    }
  }, [sources, selectedSource]);

  const handleChapterChange = (chapterNumber: number) => {
    setSelectedChapter(chapterNumber);
    setHighlightedVerse(null);
    // Hide sidebar when chapter is selected
    setSidebarOpen(false);
  };

  const handleBookChange = (bookNumber: number) => {
    setSelectedBookNumber(bookNumber);
    setSelectedChapter(1);
    setHighlightedVerse(null);
    // Keep sidebar open when selecting a book to allow chapter selection
  };

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setSelectedSource(''); // Reset source - will be set when sources load
    // Keep current book and chapter position - don't reset to Genesis
    // setSelectedBookNumber(1); // Removed - maintain current position
    // setSelectedChapter(1); // Removed - maintain current position
    setHighlightedVerse(null);
    clearApiError(); // Clear any previous errors
  };

  const handleSourceChange = async (sourceCode: string) => {
    setSelectedSource(sourceCode);
    // Keep current book and chapter position - don't reset to Genesis
    // setSelectedBookNumber(1); // Removed - maintain current position
    // setSelectedChapter(1); // Removed - maintain current position
    setHighlightedVerse(null);
    clearApiError(); // Clear any previous errors
    
    // Validate the combination if both language and source are selected
    if (selectedLanguage && sourceCode) {
      await validateLanguageSourceCombination(selectedLanguage, sourceCode);
    }
  };

  const handleParallelLanguageToggle = (languageCode: string) => {
    setParallelLanguages(prev => {
      if (prev.includes(languageCode)) {
        // Remove language if already selected
        return prev.filter(lang => lang !== languageCode);
      } else {
        // Add language if not selected
        return [...prev, languageCode];
      }
    });
  };

  const tryDifferentVerse = (direction: 'previous' | 'next' | 'first') => {
    if (!highlightedVerse) return;
    
    let newVerse = highlightedVerse;
    switch (direction) {
      case 'previous':
        newVerse = Math.max(1, highlightedVerse - 1);
        break;
      case 'next':
        newVerse = highlightedVerse + 1;
        break;
      case 'first':
        newVerse = 1;
        break;
    }
    
    setHighlightedVerse(newVerse);
  };

  const getBookChapters = (bookNumber: number) => {
    const book = getBookByNumber(bookNumber);
    return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [];
  };

  // Parse Bible reference from search query (e.g., "matthew 7:7", "genesis 1:1", "matthew 7")
  const parseBibleReference = (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    
    // Pattern to match: bookname chapter:verse or bookname chapter verse
    const patterns = [
      /^([a-z]+)\s+(\d+):(\d+)$/, // matthew 7:7
      /^([a-z]+)\s+(\d+)\s+(\d+)$/, // matthew 7 7
      /^([a-z]+)\s+chapter\s+(\d+)\s+verse\s+(\d+)$/i, // matthew chapter 7 verse 7
      /^([a-z]+)\s+(\d+)$/, // matthew 7 (just book and chapter)
      /^([a-z]+)\s+chapter\s+(\d+)$/i, // matthew chapter 7
    ];

    for (const pattern of patterns) {
      const match = trimmedQuery.match(pattern);
      if (match) {
        const bookName = match[1];
        const chapter = parseInt(match[2]);
        const verse = match[3] ? parseInt(match[3]) : null;

        // Find the book by name
        const book = getBookByName(bookName);

        if (book && chapter > 0) {
          return {
            bookNumber: book.number,
            bookName: book.name,
            chapter,
            verse,
            isValid: true,
            hasVerse: !!verse
          };
        }
      }
    }

    return { isValid: false };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // First, try to parse as a Bible reference
      const reference = parseBibleReference(searchQuery);
      
      if (reference.isValid) {
        // Navigate directly to the specific verse or chapter
        if (reference.bookNumber && reference.chapter) {
          setSelectedBookNumber(reference.bookNumber);
          setSelectedChapter(reference.chapter);
          setActiveTab('read');
          setSidebarOpen(false);
          
          // Clear search query after navigation
          setSearchQuery('');
          
          // Show success message
          const successMessage = `Navigated to ${reference.bookName} ${reference.chapter}${reference.hasVerse ? `:${reference.verse}` : ''}`;
          setShowSuccessMessage(successMessage);
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setShowSuccessMessage(null);
          }, 3000);
          
          return;
        }
      }
      
      // If not a Bible reference, perform text search
      setActiveTab('search');
    }
  };

  const handleVerseClick = (verseNumber: number) => {
    setHighlightedVerse(verseNumber);
    
    // Scroll to verse if needed
    const verseElement = verseRefs.current[verseNumber];
    if (verseElement) {
      verseElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }

    // Auto-hide highlight after 7 seconds, but only if not on parallel tab
    if (activeTab !== 'parallel') {
      setTimeout(() => {
        setHighlightedVerse(null);
      }, 7000);
    }
  };

  const handleCompareInParallel = () => {
    if (highlightedVerse) {
      setParallelVerse(highlightedVerse); // Set the verse for parallel comparison
      setActiveTab('parallel');
      // The parallel text will automatically load for the highlighted verse
    }
  };

  // Handle asterisk click to show change details
  const handleAsteriskClick = (bookNumber: number, chapter: number, verse: number) => {
    const reference = `${bookNumber}:${chapter}:${verse}`;
    setSelectedChangeReference(reference);
    setShowChangeModal(true);
  };

  // Get the verse analysis data for the selected reference
  const selectedVerseAnalysis = useMemo(() => {
    if (!selectedChangeReference) return null;
    return verseAnalysisData[selectedChangeReference] || null;
  }, [selectedChangeReference, verseAnalysisData]);

  // Check if a verse should show an asterisk
  const shouldShowAsterisk = (bookNumber: number, chapter: number, verse: number) => {
    if (!shouldShowAsterisks) return false;
    const reference = `${bookNumber}:${chapter}:${verse}`;
    return asteriskData[reference] || false;
  };

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

  // Group books by testament (Old Testament: first 39 books, New Testament: last 27 books)
  const { oldTestamentBooks, newTestamentBooks } = useMemo(() => ({
    oldTestamentBooks: books.slice(0, 39),
    newTestamentBooks: books.slice(39)
  }), [books]);

  // Handle errors
  if (languagesError || sourcesError || booksError) {
    return (
      <div className="min-h-screen bg-bridge-navy flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-bridge-white mb-4">Error Loading Bible</h1>
          <p className="text-gray-400 text-lg mb-6">
            Failed to load Bible data. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Retry
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
    <div className="min-h-screen bg-bridge-navy">
      {/* Welcome Message */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📖</div>
              <div>
                <h3 className="font-semibold">Welcome to Bible Reading</h3>
                <p className="text-sm opacity-90">Select a book and start your journey</p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-semibold">Success!</h3>
                <p className="text-sm opacity-90">{showSuccessMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden bg-netflix-gray p-2 rounded-lg"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-bridge-white">Read Bible</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Changed Link */}
              <button
                onClick={() => navigate('/changed')}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Changed
              </button>
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                disabled={languagesLoading}
              >
                {languages.map((lang: AllBibleLanguage) => (
                  <option key={lang.code3} value={lang.code3}>
                    {languageNameMap[lang.code3.toLowerCase()] || lang.name} ({lang.code3?.toUpperCase() || 'N/A'})
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
                {sourcesLoading ? (
                  <option value="">Loading sources...</option>
                ) : sources.length === 0 ? (
                  <option value="">No sources available</option>
                ) : (
                  sources.map((source: AllBibleSource) => (
                    <option key={source.code} value={source.code}>
                      {source.name || source.code.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
              
              {/* Text Alignment Selector */}
              <select
                value={textAlignment}
                onChange={(e) => setTextAlignment(e.target.value as 'left' | 'center' | 'indent')}
                className="bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="left">Left Aligned</option>
                <option value="center">Centered</option>
                <option value="indent">Indented</option>
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
                  <div className="text-bridge-white text-xs">
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
          
          {/* Reading Progress */}
          {readingProgress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-900 bg-opacity-20 border border-green-500 rounded-lg p-4 mb-6 cursor-pointer hover:bg-green-900 hover:bg-opacity-30 transition-colors duration-200"
              onClick={() => {
                setSelectedBookNumber(readingProgress.bookNumber);
                setSelectedChapter(readingProgress.chapter);
                setSidebarOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-green-400">📍</div>
                <div>
                  <p className="text-green-400 font-semibold">Continue Reading</p>
                  <p className="text-bridge-white text-sm">
                    {readingProgressBook?.name} - Chapter {readingProgress.chapter}
                  </p>
                </div>
                <div className="ml-auto text-green-400 text-sm">Click to continue →</div>
              </div>
            </motion.div>
          )}
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
                              <input
                  type="text"
                  placeholder="Search Bible verses or enter reference (e.g., 'matthew 7:7', 'genesis 1', 'john 3')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
                />
              <button
                type="submit"
                className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>

          {/* Tab Navigation */}
          <div className="flex border-b border-netflix-gray mb-6">
            <button
              onClick={() => setActiveTab('read')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'read'
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-bridge-white hover:text-white'
              }`}
            >
              Read Bible
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'search'
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-bridge-white hover:text-white'
              }`}
            >
              Search Results
            </button>
            <button
              onClick={() => setActiveTab('parallel')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'parallel'
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-bridge-white hover:text-white'
              }`}
            >
              Parallel Text
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Book Selection Sidebar - completely hidden when closed */}
          {sidebarOpen && (
            <div className="lg:col-span-1">
              <div className="bg-netflix-dark-gray rounded-lg p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-bridge-white">Books</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Old Testament */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-bridge-white mb-3">Old Testament</h3>
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
                            : 'text-bridge-white hover:bg-netflix-gray hover:text-white'
                        }`}
                      >
                        {book.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* New Testament */}
                <div>
                  <h3 className="text-lg font-semibold text-bridge-white mb-3">New Testament</h3>
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
                            : 'text-bridge-white hover:bg-netflix-gray hover:text-white'
                        }`}
                      >
                        {book.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - takes full width when sidebar is hidden */}
          <div className={`${sidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {activeTab === 'read' && (
              <div>
                {/* Chapter Selection */}
                {selectedBookNumber ? (
                  <div className="mb-6">
                    <ChapterHeader
                      bookName={selectedBook?.name || 'Unknown Book'}
                      chapterNumber={selectedChapter}
                      language={selectedLanguage}
                      source={selectedSource}
                      bookNumber={selectedBookNumber}
                      onDonationClick={handleDonationClick}
                      donationEnabled={true}
                      userId={undefined} // TODO: Get from auth context
                    />
                    
                    {/* Show Books Button - only visible when sidebar is hidden */}
                    {!sidebarOpen && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarOpen(true)}
                        className="bg-netflix-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Show Books
                      </motion.button>
                    )}
                    
                    {/* Subtle indicator when sidebar is hidden */}
                    {!sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-400 text-sm mb-4 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span>Books sidebar hidden - click "Show Books" to browse other books</span>
                      </motion.div>
                    )}
                    
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
                              : 'bg-netflix-gray text-bridge-white hover:bg-gray-600'
                          }`}
                        >
                          {chapterNum}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6">📖</div>
                    <h2 className="text-2xl font-bold text-bridge-white mb-4">Select a Book to Begin Reading</h2>
                    <p className="text-gray-400 text-lg mb-6">
                      Choose a book from the sidebar to start your Bible reading journey
                    </p>
                    {!sidebarOpen && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarOpen(true)}
                        className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                      >
                        <span>📚</span>
                        Browse Books
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Chapter Content */}
                {selectedBookNumber && (chapterLoading ? (
                  <div className="flex justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                    />
                  </div>
                ) : chapterError ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 text-xl mb-4">Error loading chapter</div>
                    <p className="text-gray-500">Please try selecting a different chapter</p>
                  </div>
                ) : chapterTexts.length > 0 ? (
                  <div className="bg-netflix-dark-gray rounded-lg p-6 md:p-8">
                    <div className="prose prose-invert max-w-none">
                      {chapterTexts.map((verse: AllBibleText) => (
                        <motion.div
                          key={verse.verse}
                          ref={(el) => {
                            verseRefs.current[verse.verse] = el;
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: verse.verse * 0.05 }}
                        >
                          <VerseDisplay
                            verse={verse}
                            isHighlighted={highlightedVerse === verse.verse}
                            showAsterisk={shouldShowAsterisk(selectedBookNumber, selectedChapter, verse.verse)}
                            onVerseClick={handleVerseClick}
                            onAsteriskClick={handleAsteriskClick}
                            onDonationClick={handleDonationClick}
                            donationEnabled={true}
                            selectedLanguage={selectedLanguage}
                            selectedSource={selectedSource}
                            selectedBookNumber={selectedBookNumber}
                            selectedChapter={selectedChapter}
                            userId={undefined} // TODO: Get from auth context
                          />
                          
                          {/* Compare in Parallel Button - appears when verse is highlighted */}
                          {highlightedVerse === verse.verse && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="mt-3 flex justify-center"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompareInParallel();
                                }}
                                className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium shadow-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Compare in Parallel
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : selectedBookNumber ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-xl mb-4">Select a chapter to read</div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-xl mb-4">Select a book to start reading</div>
                    <p className="text-gray-500">Choose from the Old or New Testament</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <h2 className="text-2xl font-bold text-bridge-white mb-4">
                  Search Results for "{searchQuery}"
                </h2>
                
                {searchLoading || globalSearchLoading ? (
                  <div className="flex justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                    />
                  </div>
                ) : searchError || globalSearchError ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 text-xl mb-4">Error searching</div>
                    <p className="text-gray-500">Please try a different search term</p>
                  </div>
                ) : (searchResults.length > 0 || globalSearchResults.length > 0) ? (
                  <div className="space-y-4">
                    {/* Language-specific results */}
                    {searchResults.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-bridge-white mb-4">
                          {getLanguageByCode(selectedLanguage)?.name} ({selectedSource.toUpperCase()})
                        </h3>
                        {searchResults.map((result: AllBibleSearchResult, index: number) => (
                          <motion.div
                            key={`lang-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-netflix-dark-gray rounded-lg p-6 mb-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-lg font-semibold text-netflix-red">
                                {getBookByNumber(result.bookNumber)?.name} {result.chapter}:{result.verse}
                              </h4>
                              <button
                                onClick={() => {
                                  setSelectedBookNumber(result.bookNumber);
                                  setSelectedChapter(result.chapter);
                                  setActiveTab('read');
                                  setSidebarOpen(false);
                                }}
                                className="text-netflix-red hover:text-red-400 text-sm"
                              >
                                View Chapter
                              </button>
                            </div>
                            <p className="text-white leading-relaxed">{result.text}</p>
                            {result.changed?.exists && (
                              <button
                                onClick={() => navigate(`/changed?lang=${selectedLanguage}&source=${selectedSource}&book=${result.bookNumber}&chapter=${result.chapter}&verse=${result.verse}`)}
                                className="text-orange-400 hover:text-orange-300 text-xs bg-orange-900 bg-opacity-30 hover:bg-orange-900 hover:bg-opacity-50 px-2 py-1 rounded mt-2 inline-block transition-colors duration-200"
                              >
                                Changed
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Global results */}
                    {globalSearchResults.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-bridge-white mb-4">All Languages</h3>
                        {globalSearchResults.map((result: AllBibleSearchResult, index: number) => (
                          <motion.div
                            key={`global-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-netflix-dark-gray rounded-lg p-6 mb-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-lg font-semibold text-netflix-red">
                                  {result.language?.name} - {result.source?.name} - {result.bookNumber}:{result.chapter}:{result.verse}
                                </h4>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedLanguage(result.language?.code3 || selectedLanguage);
                                  setSelectedSource(result.source?.code || selectedSource);
                                  setSelectedBookNumber(result.bookNumber);
                                  setSelectedChapter(result.chapter);
                                  setActiveTab('read');
                                  setSidebarOpen(false);
                                }}
                                className="text-netflix-red hover:text-red-400 text-sm"
                              >
                                View Chapter
                              </button>
                            </div>
                            <p className="text-white leading-relaxed">{result.text}</p>
                            {result.changed?.exists && (
                              <button
                                onClick={() => navigate(`/changed?lang=${result.language?.code3 || selectedLanguage}&source=${result.source?.code || selectedSource}&book=${result.bookNumber}&chapter=${result.chapter}&verse=${result.verse}`)}
                                className="text-orange-400 hover:text-orange-300 text-xs bg-orange-900 bg-opacity-30 hover:bg-orange-900 hover:bg-opacity-50 px-2 py-1 rounded mt-2 inline-block transition-colors duration-200"
                              >
                                Changed
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-xl mb-4">No results found</div>
                    <p className="text-gray-500">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-xl mb-4">Enter a search term</div>
                    <p className="text-gray-500">Search for specific words or phrases in the Bible</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parallel' && (
              <div>
                <h2 className="text-2xl font-bold text-bridge-white mb-4">
                  Parallel Text Comparison
                </h2>

                {/* Parallel Language Selector */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-bridge-white mb-3">Select Languages to Compare</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang: AllBibleLanguage) => (
                      <motion.button
                        key={lang.code3}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleParallelLanguageToggle(lang.code3)}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                          parallelLanguages.includes(lang.code3)
                            ? 'bg-netflix-red text-white'
                            : 'bg-netflix-gray text-bridge-white hover:bg-gray-600'
                        }`}
                        disabled={lang.code3 === selectedLanguage}
                      >
                        {languageNameMap[lang.code3.toLowerCase()] || lang.name} ({lang.code3?.toUpperCase()})
                        {lang.code3 === selectedLanguage && (
                          <span className="ml-2 text-xs opacity-75">(Base)</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Selected languages: {parallelLanguages.length} | 
                    Filtered for comparison: {filteredParallelLanguages.length}
                    {filteredParallelLanguages.length === 0 && (
                      <span className="text-red-400 ml-2">⚠️ No languages available for comparison</span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    💡 Note: Some verses may not be available in all languages. Try different verses if you encounter errors.
                  </p>
                </div>
                
                {!parallelVerse && !highlightedVerse ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-xl mb-4">Select a verse to compare</div>
                    <p className="text-gray-500 mb-4">Click on a verse in the reading tab to see parallel translations, or select a verse below:</p>
                    
                    {/* Verse Selector */}
                    <div className="mt-6 max-w-md mx-auto">
                      <label className="block text-sm font-medium text-bridge-white mb-2">
                        Select Verse Number:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={parallelVerse || ''}
                          onChange={(e) => {
                            const verse = parseInt(e.target.value, 10);
                            if (verse > 0) {
                              setParallelVerse(verse);
                            }
                          }}
                          className="flex-1 bg-netflix-gray text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                          placeholder="Enter verse number"
                        />
                        <button
                          onClick={() => {
                            if (parallelVerse) {
                              // Verse is already set, just refresh
                            }
                          }}
                          className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200"
                        >
                          Compare
                        </button>
                      </div>
                    </div>
                    <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4 max-w-md mx-auto">
                      <h4 className="text-blue-400 font-semibold mb-2">How to use Parallel Text:</h4>
                      <ol className="text-bridge-white text-sm text-left space-y-1">
                        <li>1. Select languages above</li>
                        <li>2. Go to "Read Bible" tab</li>
                        <li>3. Click on any verse number</li>
                        <li>4. Return to "Parallel Text" tab</li>
                        <li>5. See translations in all selected languages</li>
                      </ol>
                    </div>
                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setHighlightedVerse(1)}
                        className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                      >
                        <span>📖</span>
                        Compare First Verse
                      </motion.button>
                    </div>
                  </div>
                ) : parallelLoading ? (
                  <div className="flex justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                    />
                  </div>
                ) : parallelError ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 text-xl mb-4">Error loading parallel text</div>
                    <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 max-w-md mx-auto mb-4">
                      <p className="text-red-300 text-sm mb-2">
                        <strong>Error:</strong> {parallelError?.message || 'Unknown error occurred'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        This usually means the verse doesn't exist in one or more of the selected languages.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500">Try one of these solutions:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => tryDifferentVerse('first')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                        >
                          Try Verse 1
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => tryDifferentVerse('previous')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                        >
                          Previous Verse
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => tryDifferentVerse('next')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                        >
                          Next Verse
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ) : (baseText || parallelTexts.length > 0) ? (
                  <div className="space-y-4">
                    <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-400 mb-2">
                            {selectedBook?.name} {selectedChapter}:{highlightedVerse}
                          </h3>
                          <p className="text-bridge-white">
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
                          onClick={() => setHighlightedVerse(null)}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
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
                            : 'bg-red-900 bg-opacity-20 border border-red-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold text-green-400">
                            {getFullLanguageName(baseText.language, baseText.metadata?.name) || 'Base Language'}
                            {baseText.success ? (
                              <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded">Available</span>
                            ) : (
                              <span className="ml-2 text-xs bg-red-600 px-2 py-1 rounded">Not Available</span>
                            )}
                          </h4>
                          <span className="text-gray-400 text-sm">
                            {baseText.metadata?.code3?.toUpperCase() || baseText.language?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                        {baseText.success ? (
                          <p className="text-white leading-relaxed text-lg">
                            {typeof baseText.text === 'string' ? baseText.text : baseText.text?.text || 'No text available'}
                          </p>
                        ) : (
                          <p className="text-red-300 italic">
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
                            : 'bg-red-900 bg-opacity-20 border border-red-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold text-netflix-red">
                            {getFullLanguageName(parallel.language, parallel.metadata?.name) || 'Unknown Language'}
                            {parallel.success ? (
                              <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded">Available</span>
                            ) : (
                              <span className="ml-2 text-xs bg-red-600 px-2 py-1 rounded">Not Available</span>
                            )}
                          </h4>
                          <span className="text-gray-400 text-sm">
                            {parallel.metadata?.code3?.toUpperCase() || parallel.language?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                        {parallel.success ? (
                          <p className="text-white leading-relaxed text-lg">{typeof parallel.text === 'string' ? parallel.text : parallel.text?.text || 'No text available'}</p>
                        ) : (
                          <p className="text-red-300 italic">
                            {parallel.error || 'Text not available in this language'}
                          </p>
                        )}
                        {(parallel.changed?.exists || (typeof parallel.text === 'object' && parallel.text?.changed?.exists)) && (
                          <button
                            onClick={() => navigate(`/changed?lang=${parallel.language}&source=${selectedSource}&book=${selectedBookNumber}&chapter=${selectedChapter}&verse=${highlightedVerse || 1}`)}
                            className="text-orange-400 hover:text-orange-300 text-xs bg-orange-900 bg-opacity-30 hover:bg-orange-900 hover:bg-opacity-50 px-2 py-1 rounded mt-2 inline-block transition-colors duration-200"
                          >
                            Changed
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-xl mb-4">No parallel translations available</div>
                    <p className="text-gray-500">Try selecting a different verse or language</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Details Modal */}
      {showChangeModal && selectedVerseAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-netflix-dark-gray rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-bridge-white">
                Changed Verse Details - {selectedVerseAnalysis.reference}
              </h3>
              <button
                onClick={() => setShowChangeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Warning Message */}
              <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Original KJV Text</h4>
                  <div className="bg-netflix-gray p-4 rounded text-white">
                    {selectedVerseAnalysis.changedVerse?.kjvBaseline || 'Original text not available'}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Current Translation ({selectedVerseAnalysis.language?.toUpperCase()} - {selectedVerseAnalysis.source?.toUpperCase()})</h4>
                  <div className="bg-netflix-gray p-4 rounded text-white">
                    {selectedVerseAnalysis.currentText || 'Current text not available'}
                  </div>
                </div>
              </div>

              {/* Suggested Translation */}
              {selectedVerseAnalysis.changedVerse?.translation?.suggestion && (
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Suggested Correction</h4>
                  <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-4 rounded text-white">
                    {selectedVerseAnalysis.changedVerse.translation.suggestion}
                  </div>
                </div>
              )}

              {/* Change Summary */}
              {selectedVerseAnalysis.changedVerse?.summary && (
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Change Summary</h4>
                  <div className="bg-netflix-gray p-4 rounded text-white">
                    {selectedVerseAnalysis.changedVerse.summary}
                  </div>
                </div>
              )}

              {/* Analysis */}
              {selectedVerseAnalysis.changedVerse?.analysis && (
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Analysis</h4>
                  <div className="bg-netflix-gray p-4 rounded text-white">
                    {selectedVerseAnalysis.changedVerse.analysis}
                  </div>
                </div>
              )}

              {/* Affected Doctrine */}
              {selectedVerseAnalysis.changedVerse?.affectedDoctrine && selectedVerseAnalysis.changedVerse.affectedDoctrine.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Affected Doctrine</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVerseAnalysis.changedVerse.affectedDoctrine.map((doctrine: any, index: number) => (
                      <span key={index} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                        {doctrine}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch Data */}
              {selectedVerseAnalysis.changedVerse?.batchData && (
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Detailed Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-netflix-gray p-4 rounded">
                      <h5 className="text-red-400 font-semibold mb-2">Error</h5>
                      <p className="text-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Error}</p>
                    </div>
                    <div className="bg-netflix-gray p-4 rounded">
                      <h5 className="text-orange-400 font-semibold mb-2">Danger</h5>
                      <p className="text-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Danger}</p>
                    </div>
                    <div className="bg-netflix-gray p-4 rounded">
                      <h5 className="text-blue-400 font-semibold mb-2">Evidence</h5>
                      <p className="text-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Evidence}</p>
                    </div>
                    <div className="bg-netflix-gray p-4 rounded">
                      <h5 className="text-green-400 font-semibold mb-2">Explanation</h5>
                      <p className="text-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Spirit of Prophecy */}
              {selectedVerseAnalysis.changedVerse?.spiritOfProphecy && (
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Spirit of Prophecy</h4>
                  <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-4 rounded text-white">
                    {selectedVerseAnalysis.changedVerse.spiritOfProphecy}
                  </div>
                </div>
              )}

              {/* Modern Versions Cited */}
              {selectedVerseAnalysis.changedVerse?.modernVersionsCited && selectedVerseAnalysis.changedVerse.modernVersionsCited.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-bridge-white mb-4">Modern Versions Cited</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVerseAnalysis.changedVerse.modernVersionsCited.map((version: any, index: number) => (
                      <span key={index} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
                        {version}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowChangeModal(false)}
                className="px-4 py-2 text-bridge-white hover:text-white transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal
        isOpen={showModal}
        onClose={handleDonationCancel}
        scope={donationScope}
        onSuccess={handleDonationSuccess}
        onError={handleDonationError}
      />
    </div>
  );
};

export default BibleRead;

