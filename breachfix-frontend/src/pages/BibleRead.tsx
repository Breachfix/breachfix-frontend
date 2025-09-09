import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAllBiblesApi } from '../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import VerseDisplay from '../components/bible/VerseDisplay';
import { useAuthStore } from '../context/AuthContext';
import ChapterHeader from '../components/bible/ChapterHeader';
import DonationModal from '../components/donations/DonationModal';
import { useDonation } from '../hooks/useDonation';
import { ParallelTextDisplay } from '../components/bible/ParallelTextDisplay';

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


const BibleRead: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleDonationClick, handleDonationSuccess, handleDonationError, showModal, donationScope, handleDonationCancel } = useDonation();
  const { isAuthenticated } = useAuthStore();
  
  // Get URL parameters
  const urlLang = searchParams.get('lang');
  const urlSource = searchParams.get('source');
  const urlBook = searchParams.get('book');
  const urlChapter = searchParams.get('chapter');
  const urlVerse = searchParams.get('verse');
  
  // Load initial state from URL params first, then localStorage, then defaults
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => 
    urlLang || localStorage.getItem('bibleRead_selectedLanguage') || 'eng'
  );
  const [selectedSource, setSelectedSource] = useState<string>(() => 
    urlSource || localStorage.getItem('bibleRead_selectedSource') || ''
  );
  const [selectedBookNumber, setSelectedBookNumber] = useState<number>(() => 
    parseInt(urlBook || localStorage.getItem('bibleRead_selectedBookNumber') || '1', 10)
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(() => 
    parseInt(urlChapter || localStorage.getItem('bibleRead_selectedChapter') || '1', 10)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'current' | 'global'>(() => 
    (localStorage.getItem('bibleRead_searchScope') as 'current' | 'global') || 'current'
  );
  const [activeTab, setActiveTab] = useState<'read' | 'search' | 'parallel'>(() => 
    (localStorage.getItem('bibleRead_activeTab') as 'read' | 'search' | 'parallel') || 'read'
  );
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(() => {
    const urlVerseNum = urlVerse ? parseInt(urlVerse, 10) : null;
    const stored = localStorage.getItem('bibleRead_highlightedVerse');
    return urlVerseNum || (stored ? parseInt(stored, 10) : null);
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open for better UX
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'indent'>(() => 
    (localStorage.getItem('bibleRead_textAlignment') as 'left' | 'center' | 'indent') || 'left'
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [isValidatingCombination, setIsValidatingCombination] = useState(false);
  const [asteriskData, setAsteriskData] = useState<{ [key: string]: boolean }>({});
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedChangeReference, setSelectedChangeReference] = useState<string | null>(null);

  // Languages and sources that should NOT show asterisks or donations
  // English (KJV only), French, Hebrew, Greek are considered "good" versions
  const excludedLanguages = ['fra', 'heb', 'grc']; // French, Hebrew, Greek
  const excludedSources = ['kjv', 'kjf', 'mt', 'tr1894']; // KJV, KJF, Masoretic Text, Textus Receptus

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

  // Save search scope to localStorage
  useEffect(() => {
    localStorage.setItem('bibleRead_searchScope', searchScope);
  }, [searchScope]);

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
    // English KJV should not show asterisks, but other English versions should
    if (selectedLanguage === 'eng' && selectedSource === 'kjv') {
      return false;
    }
    return !excludedLanguages.includes(selectedLanguage) && !excludedSources.includes(selectedSource);
  }, [selectedLanguage, selectedSource]);

  // Check if donations should be enabled for current language/source
  const shouldEnableDonations = useMemo(() => {
    // English KJV should not show donations, but other English versions should
    if (selectedLanguage === 'eng' && selectedSource === 'kjv') {
      return false;
    }
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

  // Global search for cross-language results
  const { data: globalSearchResponse, isLoading: globalSearchLoading, error: globalSearchError } = useAllBiblesApi.search.useGlobal(
    searchQuery,
    { 
      limit: 100, 
      includeMetadata: true,
      ...(searchScope === 'current' && selectedLanguage ? { language: selectedLanguage } : {})
    },
    { enabled: !!searchQuery && searchQuery.length > 2 && activeTab === 'search' && (searchScope === 'current' || (searchScope === 'global' && isAuthenticated)) }
  );


  // Extract data from responses
  const languages = languagesResponse?.languages || [];
  const sources = sourcesResponse?.sources || [];
  const books = booksResponse?.books || [];
  const chapterTexts = chapterResponse?.texts || [];

  // Debug logging
  console.log('Languages loaded:', languages.length, languages);
  console.log('Current selectedLanguage:', selectedLanguage);
  console.log('Languages loading:', languagesLoading);
  console.log('Sources loaded:', sources.length, sources);
  console.log('Current selectedSource:', selectedSource);

  // Debug selectedLanguage changes
  useEffect(() => {
    console.log('selectedLanguage state changed to:', selectedLanguage);
  }, [selectedLanguage]);

  // Debug select rendering
  useEffect(() => {
    console.log('Rendering select with value:', selectedLanguage);
  }, [selectedLanguage]);
  const globalSearchResults = globalSearchResponse?.results || [];

  // Memoized book lookups for performance
  const selectedBook = useMemo(() => 
    books.find((b: AllBibleBook) => b.number === selectedBookNumber),
    [books, selectedBookNumber]
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


  // Handle URL parameter changes - simplified approach
  useEffect(() => {
    console.log('URL params effect triggered:', { urlLang, urlSource, urlBook, urlChapter, urlVerse, selectedLanguage, selectedSource, selectedBookNumber, selectedChapter, highlightedVerse });
    
    // Only update if URL params differ from current state
    if (urlLang && urlLang !== selectedLanguage) {
      console.log('Updating language from URL:', urlLang);
      console.log('Previous language:', selectedLanguage, 'Previous source:', selectedSource);
      setSelectedLanguage(urlLang);
      localStorage.setItem('bibleRead_selectedLanguage', urlLang);
      // Always reset source when language changes to prevent invalid combinations
      setSelectedSource('');
      localStorage.removeItem('bibleRead_selectedSource');
      
      // Clear comparison state when switching languages
      // This ensures users start fresh in the new language
      setHighlightedVerse(null);
      localStorage.removeItem('bibleRead_highlightedVerse');
      
      console.log('Source and comparison state cleared for new language:', urlLang);
    }
    if (urlSource && urlSource !== selectedSource) {
      console.log('Updating source from URL:', urlSource);
      setSelectedSource(urlSource);
      localStorage.setItem('bibleRead_selectedSource', urlSource);
    }
    if (urlBook && parseInt(urlBook, 10) !== selectedBookNumber) {
      console.log('Updating book from URL:', urlBook);
      setSelectedBookNumber(parseInt(urlBook, 10));
      localStorage.setItem('bibleRead_selectedBookNumber', urlBook);
    }
    if (urlChapter && parseInt(urlChapter, 10) !== selectedChapter) {
      console.log('Updating chapter from URL:', urlChapter);
      setSelectedChapter(parseInt(urlChapter, 10));
      localStorage.setItem('bibleRead_selectedChapter', urlChapter);
    }
    if (urlVerse) {
      const verseNum = parseInt(urlVerse, 10);
      if (verseNum !== highlightedVerse) {
        console.log('Updating verse from URL:', urlVerse);
        setHighlightedVerse(verseNum);
        localStorage.setItem('bibleRead_highlightedVerse', urlVerse);
      }
    }
    
    // If we have URL parameters for book/chapter/verse, switch to Read Bible tab
    if (urlBook || urlChapter || urlVerse) {
      setActiveTab('read');
      localStorage.setItem('bibleRead_activeTab', 'read');
    }
  }, [urlLang, urlSource, urlBook, urlChapter, urlVerse, selectedLanguage, selectedSource, selectedBookNumber, selectedChapter, highlightedVerse]);

  // Auto-select first available source when language changes and no source is selected
  useEffect(() => {
    console.log('Auto-selection effect triggered:', { selectedLanguage, sourcesLength: sources.length, selectedSource, sources: sources.map(s => s.code) });
    if (selectedLanguage && sources.length > 0 && !selectedSource) {
      // Select first available source for the current language
      const firstSource = sources[0].code;
      console.log('Auto-selecting first source for language:', selectedLanguage, '->', firstSource);
      setSelectedSource(firstSource);
      localStorage.setItem('bibleRead_selectedSource', firstSource);
    }
  }, [selectedLanguage, sources, selectedSource]);

  // Clear any invalid source combinations
  useEffect(() => {
    console.log('Invalid source check effect triggered:', { selectedLanguage, selectedSource, sourcesLength: sources.length, sources: sources.map(s => s.code) });
    if (selectedLanguage && selectedSource && sources.length > 0) {
      // Check if the current source is valid for the current language
      const isValidSource = sources.some(s => s.code === selectedSource);
      console.log('Source validation:', { selectedSource, isValidSource, availableSources: sources.map(s => s.code) });
      if (!isValidSource) {
        console.log('Invalid source combination detected:', selectedLanguage, selectedSource);
        console.log('Available sources for this language:', sources.map(s => s.code));
        // Source is not valid for this language, reset it
        setSelectedSource('');
        localStorage.removeItem('bibleRead_selectedSource');
        console.log('Invalid source cleared');
      }
    }
  }, [selectedLanguage, selectedSource, sources]);

  // Load reading progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('bible-reading-progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      if (progress.languageCode === selectedLanguage && progress.sourceCode === selectedSource) {
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
      const progress = {
        languageCode: selectedLanguage,
        sourceCode: selectedSource,
        bookNumber: selectedBookNumber,
        chapter: selectedChapter,
        lastReadAt: new Date().toISOString(),
      };
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
    console.log('Second auto-selection effect triggered:', { sourcesLength: sources.length, selectedSource, selectedLanguage, sources: sources.map(s => s.code) });
    if (sources.length > 0 && !selectedSource) {
      // Prefer specific sources for known languages
      let preferredSource = '';
      if (selectedLanguage === 'eng') {
        preferredSource = sources.find(s => s.code === 'kjv')?.code || sources[0].code;
      } else if (selectedLanguage === 'esp') {
        preferredSource = sources.find(s => s.code === 'rvr')?.code || sources[0].code;
      } else if (selectedLanguage === 'fra') {
        preferredSource = sources.find(s => s.code === 'lsg')?.code || sources[0].code;
      } else {
        preferredSource = sources[0].code;
      }
      
      console.log('Auto-selecting source:', preferredSource, 'for language:', selectedLanguage);
      console.log('Available sources:', sources.map(s => s.code));
      
      setSelectedSource(preferredSource);
      localStorage.setItem('bibleRead_selectedSource', preferredSource);
    }
  }, [sources, selectedSource, selectedLanguage]);

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
    console.log('Language change requested:', languageCode);
    
    // Use simple navigation like the Bible landing page for reliability
    // This ensures clean state and eliminates race conditions
    window.location.href = `/bible/read?lang=${languageCode}`;
  };

  const handleSourceChange = async (sourceCode: string) => {
    console.log('Source change requested:', sourceCode);
    
    // Simple state update for source changes (no URL sync needed)
    setSelectedSource(sourceCode);
    localStorage.setItem('bibleRead_selectedSource', sourceCode);
    setHighlightedVerse(null);
    clearApiError(); // Clear any previous errors
    
    // Validate the combination if both language and source are selected
    if (selectedLanguage && sourceCode) {
      await validateLanguageSourceCombination(selectedLanguage, sourceCode);
    }
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
      // Check if user is trying to use global search without authentication
      if (searchScope === 'global' && !isAuthenticated) {
        navigate('/login?redirect=' + encodeURIComponent('/bible/read'));
        return;
      }
      
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
      <div className="min-h-screen bg-breachfix-navy flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-heading-lg text-breachfix-white mb-4">Error Loading Bible</h1>
          <p className="text-breachfix-gray text-body-sm mb-6">
            Failed to load Bible data. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-6 py-3 rounded-lg transition-colors duration-200"
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
          className="w-10 h-10 border-4 border-breachfix-gold border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bible-reading-container relative min-h-screen bg-breachfix-navy overflow-hidden">
      {/* Page-wide Amber-to-Blue Radiating Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/8 via-amber-400/4 to-transparent opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/6 via-transparent to-breachfix-gold/6 opacity-25"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-amber-400/4 via-transparent to-breachfix-gold/4 opacity-20"></div>
      
      {/* Floating Fire Particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-40" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-breachfix-gold rounded-full animate-ping opacity-50" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-35" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-breachfix-gold rounded-full animate-ping opacity-45" style={{animationDelay: '3s'}}></div>
      <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-amber-400 rounded-full animate-ping opacity-30" style={{animationDelay: '4s'}}></div>
      <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-breachfix-gold rounded-full animate-ping opacity-40" style={{animationDelay: '5s'}}></div>
      {/* Welcome Message */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-breachfix-gold text-breachfix-navy px-6 py-4 rounded-lg shadow-lg relative"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📖</div>
              <div>
                <h3 className="font-semibold">Welcome to Bible Reading</h3>
                <p className="text-sm opacity-90">Select a book and start your journey</p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="ml-4 text-breachfix-white hover:text-breachfix-gray"
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
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-breachfix-gold text-breachfix-navy px-6 py-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-semibold">Success!</h3>
                <p className="text-sm opacity-90">{showSuccessMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(null)}
                className="ml-4 text-breachfix-white hover:text-breachfix-gray"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Page Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden bg-breachfix-gray p-2 rounded-lg"
              >
                <svg className="w-6 h-6 text-breachfix-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-breachfix-white">Read Bible</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Selector - Smaller */}
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  console.log('Select onChange triggered:', e.target.value);
                  handleLanguageChange(e.target.value);
                }}
                className="bg-breachfix-gray text-breachfix-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-breachfix-gold text-sm"
                disabled={languagesLoading}
              >
                {languages.map((lang: AllBibleLanguage) => (
                  <option key={lang.code3} value={lang.code3}>
                    {languageNameMap[lang.code3.toLowerCase()] || lang.name}
                  </option>
                ))}
              </select>
              
              {/* Source Selector - Keep same size */}
              <select
                value={selectedSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="bg-breachfix-gray text-breachfix-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-breachfix-gold"
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
            </div>
            
            {/* API Error Display */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-red-600 bg-opacity-20 border border-red-400 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-red-400 font-semibold mb-1">Invalid Language/Source Combination</h4>
                    <p className="text-red-100 text-sm mb-2">{apiError}</p>
                    <div className="text-red-200 text-xs">
                      <p className="mb-1"><strong>Tip:</strong> Each language has specific source translations available.</p>
                      <p>Try selecting a different source or language combination.</p>
                    </div>
                  </div>
                  <button
                    onClick={clearApiError}
                    className="text-red-400 hover:text-red-100 transition-colors"
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
                  <svg className="w-4 h-4 text-breachfix-gray mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-breachfix-white text-xs">
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
                        <span className="text-breachfix-gray text-xs">+{sources.length - 5} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          
          {/* Futuristic Search Bar */}
          <motion.form 
            onSubmit={handleSearch} 
            className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              {/* Search Scope Selector */}
              <div className="flex flex-wrap gap-2">
                <span className="text-amber-100 text-sm font-medium self-center">Search in:</span>
                <button
                  type="button"
                  onClick={() => setSearchScope('current')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchScope === 'current'
                      ? 'bg-amber-500 text-breachfix-navy shadow-lg shadow-amber-500/30'
                      : 'bg-amber-900/30 text-amber-200 hover:bg-amber-800/40 border border-amber-400/30'
                  }`}
                >
                  Current Language ({getLanguageByCode(selectedLanguage)?.name || selectedLanguage})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) {
                      setSearchScope('global');
                    } else {
                      navigate('/login?redirect=' + encodeURIComponent('/bible/read'));
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                    searchScope === 'global'
                      ? 'bg-amber-500 text-breachfix-navy shadow-lg shadow-amber-500/30'
                      : isAuthenticated
                      ? 'bg-amber-900/30 text-amber-200 hover:bg-amber-800/40 border border-amber-400/30'
                      : 'bg-amber-900/20 text-amber-300 cursor-pointer hover:bg-amber-800/30 border border-amber-400/20'
                  }`}
                  title={!isAuthenticated ? 'Login Required - Click to sign in' : 'Search across all languages and versions'}
                >
                  All Languages
                  {!isAuthenticated && (
                    <span className="ml-2 text-xs bg-amber-500 text-breachfix-navy px-2 py-1 rounded-full animate-pulse">
                      Login Required
                    </span>
                  )}
                </button>
              </div>
              
              {/* Futuristic Search Input */}
              <div className="relative">
            <div className="flex gap-4">
                  <div className="flex-1 relative group">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-breachfix-gold/10 rounded-lg opacity-50"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Typing Animation Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent rounded-lg animate-pulse opacity-30"></div>
                    
                              <input
                  type="text"
                  placeholder={
                    searchScope === 'current' 
                      ? `Search in ${getLanguageByCode(selectedLanguage)?.name || selectedLanguage} (all versions)...`
                      : "Search across all languages and versions..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                      className="relative z-10 w-full bg-amber-900/30 text-amber-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-amber-800/40 border border-amber-400/30 hover:border-amber-400/50 transition-all duration-300 placeholder-amber-300/70"
                    />
                    
                    {/* Animated Cursor Effect */}
                    {searchQuery && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-amber-400 animate-pulse"></div>
                    )}
                  </div>
                  
                  <motion.button
                type="submit"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 193, 7, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-amber-500 to-breachfix-gold hover:from-amber-400 hover:to-yellow-400 text-breachfix-navy px-6 py-3 rounded-lg transition-all duration-300 border border-amber-400 border-opacity-50 hover:border-opacity-80 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 font-semibold relative overflow-hidden group"
              >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">🔍</span>
                Search
                    </span>
                  </motion.button>
              </div>
                
                {/* Floating Particles Effect */}
                <div className="absolute -top-2 -left-2 w-1 h-1 bg-amber-400 rounded-full animate-ping opacity-60"></div>
                <div className="absolute -bottom-2 -right-2 w-1 h-1 bg-breachfix-gold rounded-full animate-ping opacity-60" style={{animationDelay: '1s'}}></div>
            </div>
            </div>
          </motion.form>

          {/* Tab Navigation */}
          <div className="flex border-b border-netflix-gray mb-6">
            <button
              onClick={() => setActiveTab('read')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'read'
                  ? 'text-breachfix-gold border-b-2 border-breachfix-gold'
                  : 'text-breachfix-white hover:text-breachfix-white'
              }`}
            >
              Read Bible
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'search'
                  ? 'text-breachfix-gold border-b-2 border-breachfix-gold'
                  : 'text-breachfix-white hover:text-breachfix-white'
              }`}
            >
              Search Results
            </button>
            <button
              onClick={() => setActiveTab('parallel')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'parallel'
                  ? 'text-breachfix-gold border-b-2 border-breachfix-gold'
                  : 'text-breachfix-white hover:text-breachfix-white'
              }`}
            >
              Parallel Text
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Book Selection Sidebar - Always visible on desktop, collapsible on mobile */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-40 flex-shrink-0`}>
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-body-sm font-bold text-breachfix-white">Books</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-breachfix-gray hover:text-breachfix-white transition-colors"
                  >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
                </div>
                
              {/* All Books - Unified List */}
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-breachfix-gold scrollbar-track-transparent">
                <div className="space-y-1">
                  {/* Old Testament Section */}
                  <div className="sticky top-0 bg-breachfix-navy py-1 mb-2">
                    <h3 className="text-caption font-semibold text-breachfix-gold uppercase tracking-wide">Old Testament</h3>
                  </div>
                    {oldTestamentBooks.map((book: AllBibleBook) => (
                      <motion.button
                        key={book.number}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBookChange(book.number)}
                      className={`w-full text-left px-2 py-1 rounded-md transition-all duration-200 text-xs ${
                          selectedBookNumber === book.number
                          ? 'bg-breachfix-gold text-breachfix-navy font-semibold shadow-sm'
                          : 'text-breachfix-white hover:bg-amber-500 hover:bg-opacity-20 hover:text-amber-300'
                        }`}
                      >
                        {book.name}
                      </motion.button>
                    ))}
                  
                  {/* New Testament Section */}
                  <div className="sticky top-0 bg-breachfix-navy py-1 mb-2 mt-4">
                    <h3 className="text-xs font-semibold text-breachfix-gold uppercase tracking-wide">New Testament</h3>
                  </div>
                    {newTestamentBooks.map((book: AllBibleBook) => (
                      <motion.button
                        key={book.number}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBookChange(book.number)}
                      className={`w-full text-left px-2 py-1 rounded-md transition-all duration-200 text-xs ${
                          selectedBookNumber === book.number
                          ? 'bg-breachfix-gold text-breachfix-navy font-semibold shadow-sm'
                          : 'text-breachfix-white hover:bg-amber-500 hover:bg-opacity-20 hover:text-amber-300'
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
          <div className="flex-1 min-w-0 bg-gradient-to-b from-breachfix-navy/50 to-breachfix-dark/30 rounded-lg p-6 backdrop-blur-sm">
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
                      donationEnabled={shouldEnableDonations}
                      userId={undefined} // TODO: Get from auth context
                      textAlignment={textAlignment}
                      onTextAlignmentChange={setTextAlignment}
                    />
                    
                    {/* Show Books Button - only visible on mobile when sidebar is hidden */}
                      {!sidebarOpen && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSidebarOpen(true)}
                        className="lg:hidden bg-breachfix-gray hover:bg-breachfix-gray text-breachfix-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          Show Books
                        </motion.button>
                      )}
                    
                    {/* Subtle indicator when sidebar is hidden on mobile */}
                    {!sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:hidden text-breachfix-gray text-sm mb-4 flex items-center gap-2"
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
                              ? 'bg-breachfix-gold text-breachfix-navy'
                              : 'bg-breachfix-gray text-breachfix-white hover:bg-breachfix-gold hover:bg-opacity-20 hover:text-breachfix-navy'
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
                    <h2 className="text-2xl font-bold text-breachfix-white mb-4">Select a Book to Begin Reading</h2>
                    <p className="text-breachfix-gray text-lg mb-6">
                      Choose a book from the sidebar to start your Bible reading journey
                    </p>
                    {!sidebarOpen && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
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
                      className="w-8 h-8 border-4 border-breachfix-gold border-t-transparent rounded-full"
                    />
                  </div>
                ) : chapterError ? (
                  <div className="text-center py-12">
                    <div className="text-breachfix-gold text-xl mb-4">Error loading chapter</div>
                    <p className="text-breachfix-gray">Please try selecting a different chapter</p>
                  </div>
                ) : chapterTexts.length > 0 ? (
                  <div className="bible-chapter-container rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden bg-breachfix-navy">
                    {/* Extended Fire Effects - Radiating from borders inward */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-breachfix-gold/10 opacity-40"></div>
                    <div className="absolute inset-4 bg-gradient-to-r from-amber-500/8 via-amber-400/3 to-breachfix-gold/8 opacity-30"></div>
                    <div className="absolute inset-8 bg-gradient-to-r from-amber-500/5 via-amber-400/2 to-breachfix-gold/5 opacity-20"></div>
                    
                    {/* Outer Fire Borders */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-70 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 via-breachfix-gold to-amber-400 opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-400 via-breachfix-gold to-amber-400 opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    
                    {/* Inner Fire Borders - Extended inward */}
                    <div className="absolute top-4 left-4 w-[calc(100%-2rem)] h-1 bg-gradient-to-r from-amber-400/60 via-breachfix-gold/60 to-amber-400/60 opacity-50 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    <div className="absolute bottom-4 left-4 w-[calc(100%-2rem)] h-1 bg-gradient-to-r from-amber-400/60 via-breachfix-gold/60 to-amber-400/60 opacity-50 animate-pulse" style={{animationDelay: '1.3s'}}></div>
                    <div className="absolute top-4 left-4 w-1 h-[calc(100%-2rem)] bg-gradient-to-b from-amber-400/60 via-breachfix-gold/60 to-amber-400/60 opacity-40 animate-pulse" style={{animationDelay: '0.8s'}}></div>
                    <div className="absolute top-4 right-4 w-1 h-[calc(100%-2rem)] bg-gradient-to-b from-amber-400/60 via-breachfix-gold/60 to-amber-400/60 opacity-40 animate-pulse" style={{animationDelay: '1.8s'}}></div>
                    
                    {/* Corner Fire Effects */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-70"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-breachfix-gold rounded-full animate-ping opacity-70" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-70" style={{animationDelay: '1s'}}></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-breachfix-gold rounded-full animate-ping opacity-70" style={{animationDelay: '1.5s'}}></div>
                    
                    {/* Inner Corner Fire Effects */}
                    <div className="absolute top-2 left-2 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-50" style={{animationDelay: '0.2s'}}></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-breachfix-gold rounded-full animate-ping opacity-50" style={{animationDelay: '0.7s'}}></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-50" style={{animationDelay: '1.2s'}}></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 bg-breachfix-gold rounded-full animate-ping opacity-50" style={{animationDelay: '1.7s'}}></div>
                    <div className="prose prose-invert max-w-none relative z-10">
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
                            donationEnabled={shouldEnableDonations}
                            showPartnerBadge={shouldEnableDonations}
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
                                  setActiveTab('parallel');
                                }}
                                className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium shadow-lg"
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
                    <div className="text-breachfix-gray text-xl mb-4">Select a chapter to read</div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-breachfix-gray text-xl mb-4">Select a book to start reading</div>
                    <p className="text-breachfix-gray">Choose from the Old or New Testament</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-breachfix-white">
                  Search Results for "{searchQuery}"
                </h2>
                  <div className="text-sm text-breachfix-gray">
                    {searchScope === 'current' && `Searching in ${getLanguageByCode(selectedLanguage)?.name || selectedLanguage} (all versions)`}
                    {searchScope === 'global' && 'Searching across all languages and versions'}
                  </div>
                </div>
                
                {globalSearchLoading ? (
                  <div className="flex justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-breachfix-gold border-t-transparent rounded-full"
                    />
                  </div>
                ) : globalSearchError ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 text-xl mb-4">Error searching</div>
                    <p className="text-breachfix-gray">Please try a different search term or change your search scope</p>
                  </div>
                ) : globalSearchResults.length > 0 ? (
                  <div className="space-y-4">
                    {/* Show results based on search scope */}
                    
                    {/* Current language results (all versions) */}
                    {searchScope === 'current' && globalSearchResults.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-breachfix-white mb-4">
                          {getLanguageByCode(selectedLanguage)?.name} (All Versions)
                        </h3>
                        {globalSearchResults
                          .filter((result: AllBibleSearchResult) => result.language?.code === selectedLanguage)
                          .map((result: AllBibleSearchResult, index: number) => (
                      <motion.div
                              key={`current-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                            className="bg-netflix-dark-gray rounded-lg p-6 mb-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                                <h4 className="text-lg font-semibold text-breachfix-gold">
                                {getBookByNumber(result.bookNumber)?.name} {result.chapter}:{result.verse}
                              </h4>
                                <div className="text-right">
                                  <span className="text-amber-400 text-sm font-medium">
                                    {result.source?.code?.toUpperCase()}
                                  </span>
                                  <span className="text-breachfix-gray text-sm block">
                                    {result.wordCount} words
                                  </span>
                                </div>
                              </div>
                              <p className="text-breachfix-white leading-relaxed">
                                {result.text}
                              </p>
                          <button
                            onClick={() => {
                                  setSelectedBookNumber(result.bookNumber);
                              setSelectedChapter(result.chapter);
                              setActiveTab('read');
                              setSidebarOpen(false);
                            }}
                                className="mt-3 bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                              >
                                Go to Verse
                              </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Global results */}
                    {searchScope === 'global' && globalSearchResults.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-breachfix-white mb-4">All Languages</h3>
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
                                <h4 className="text-lg font-semibold text-breachfix-gold">
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
                                className="text-breachfix-gold hover:text-red-400 text-sm"
                          >
                            View Chapter
                          </button>
                        </div>
                            <p className="text-breachfix-white leading-relaxed">{result.text}</p>
                            {result.changed?.exists && (
                              <button
                                onClick={() => navigate(`/bible/changed?lang=${result.language?.code3 || selectedLanguage}&source=${result.source?.code || selectedSource}&book=${result.bookNumber}&chapter=${result.chapter}&verse=${result.verse}`)}
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
                    <div className="text-breachfix-gray text-xl mb-4">No results found</div>
                    <p className="text-breachfix-gray">Try a different search term or change your search scope</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-breachfix-gray text-xl mb-4">Enter a search term</div>
                    <p className="text-breachfix-gray">Choose your search scope and search for specific words or phrases in the Bible</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parallel' && (
              <ParallelTextDisplay
                selectedBookNumber={selectedBookNumber}
                selectedChapter={selectedChapter}
                selectedLanguage={selectedLanguage}
                highlightedVerse={highlightedVerse}
                onClearSelection={() => setHighlightedVerse(null)}
              />
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
              <h3 className="text-xl font-bold text-breachfix-white">
                Changed Verse Details - {selectedVerseAnalysis.reference}
              </h3>
              <button
                onClick={() => setShowChangeModal(false)}
                className="text-breachfix-gray hover:text-breachfix-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Warning Message */}
              <div className="bg-red-600 bg-opacity-20 border border-red-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-2">Verse Altered in Modern Translations</h4>
                    <p className="text-red-100 text-sm">
                      This verse has been changed or altered in modern Bible translations. 
                      The original KJV text may differ significantly from what you're reading.
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Original KJV Text</h4>
                  <div className="bg-breachfix-gray p-4 rounded text-breachfix-white">
                    {selectedVerseAnalysis.changedVerse?.kjvBaseline || 'Original text not available'}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Current Translation ({selectedVerseAnalysis.language?.toUpperCase()} - {selectedVerseAnalysis.source?.toUpperCase()})</h4>
                  <div className="bg-breachfix-gray p-4 rounded text-breachfix-white">
                    {selectedVerseAnalysis.currentText || 'Current text not available'}
                  </div>
                </div>
              </div>

              {/* Suggested Translation */}
              {selectedVerseAnalysis.changedVerse?.translation?.suggestion && (
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Suggested Correction</h4>
                  <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-4 rounded text-breachfix-white">
                    {selectedVerseAnalysis.changedVerse.translation.suggestion}
                  </div>
                </div>
              )}

              {/* Change Summary */}
              {selectedVerseAnalysis.changedVerse?.summary && (
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Change Summary</h4>
                  <div className="bg-breachfix-gray p-4 rounded text-breachfix-white">
                    {selectedVerseAnalysis.changedVerse.summary}
                  </div>
                </div>
              )}

              {/* Analysis */}
              {selectedVerseAnalysis.changedVerse?.analysis && (
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Analysis</h4>
                  <div className="bg-breachfix-gray p-4 rounded text-breachfix-white">
                    {selectedVerseAnalysis.changedVerse.analysis}
                  </div>
                </div>
              )}

              {/* Affected Doctrine */}
              {selectedVerseAnalysis.changedVerse?.affectedDoctrine && selectedVerseAnalysis.changedVerse.affectedDoctrine.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Affected Doctrine</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVerseAnalysis.changedVerse.affectedDoctrine.map((doctrine: any, index: number) => (
                      <span key={index} className="bg-yellow-600 text-breachfix-white px-3 py-1 rounded text-sm">
                        {doctrine}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch Data */}
              {selectedVerseAnalysis.changedVerse?.batchData && (
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Detailed Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-breachfix-gray p-4 rounded">
                      <h5 className="text-red-400 font-semibold mb-2">Error</h5>
                      <p className="text-breachfix-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Error}</p>
                    </div>
                    <div className="bg-breachfix-gray p-4 rounded">
                      <h5 className="text-orange-400 font-semibold mb-2">Danger</h5>
                      <p className="text-breachfix-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Danger}</p>
                    </div>
                    <div className="bg-breachfix-gray p-4 rounded">
                      <h5 className="text-blue-400 font-semibold mb-2">Evidence</h5>
                      <p className="text-breachfix-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Evidence}</p>
                    </div>
                    <div className="bg-breachfix-gray p-4 rounded">
                      <h5 className="text-amber-400 font-semibold mb-2">Explanation</h5>
                      <p className="text-breachfix-white text-sm">{selectedVerseAnalysis.changedVerse.batchData.Explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Spirit of Prophecy */}
              {selectedVerseAnalysis.changedVerse?.spiritOfProphecy && (
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Spirit of Prophecy</h4>
                  <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-4 rounded text-breachfix-white">
                    {selectedVerseAnalysis.changedVerse.spiritOfProphecy}
                  </div>
                </div>
              )}

              {/* Modern Versions Cited */}
              {selectedVerseAnalysis.changedVerse?.modernVersionsCited && selectedVerseAnalysis.changedVerse.modernVersionsCited.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-breachfix-white mb-4">Modern Versions Cited</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVerseAnalysis.changedVerse.modernVersionsCited.map((version: any, index: number) => (
                      <span key={index} className="bg-breachfix-gray text-breachfix-white px-3 py-1 rounded text-sm">
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
                className="px-4 py-2 text-breachfix-white hover:text-breachfix-white transition-colors duration-200"
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

