import { useState, useEffect, useMemo } from 'react';
import { useAllBiblesApi } from './useApi';

interface UseParallelTextProps {
  selectedBookNumber: number;
  selectedChapter: number;
  selectedLanguage: string;
  highlightedVerse: number | null;
}

export const useParallelText = ({
  selectedBookNumber,
  selectedChapter,
  selectedLanguage,
  highlightedVerse,
}: UseParallelTextProps) => {
  // Parallel text state
  const [parallelLanguages, setParallelLanguages] = useState<string[]>(() => {
    const stored = localStorage.getItem('bibleRead_parallelLanguages');
    return stored ? JSON.parse(stored) : ['run', 'fra'];
  });
  
  const [parallelVerse, setParallelVerse] = useState<number | null>(() => {
    const stored = localStorage.getItem('bibleRead_parallelVerse');
    return stored ? parseInt(stored, 10) : null;
  });

  // Persist parallel languages to localStorage
  useEffect(() => {
    localStorage.setItem('bibleRead_parallelLanguages', JSON.stringify(parallelLanguages));
  }, [parallelLanguages]);

  // Persist parallel verse to localStorage
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
  const { 
    data: languages = [], 
    isLoading: languagesLoading, 
    error: languagesError 
  } = useAllBiblesApi.languages.useGetAll();

  // Parallel text for selected verse
  const { 
    data: parallelResponse, 
    isLoading: parallelLoading, 
    error: parallelError 
  } = useAllBiblesApi.parallel.useGetMultiple(
    selectedBookNumber,
    selectedChapter,
    parallelVerse || highlightedVerse || 1,
    selectedLanguage,
    filteredParallelLanguages,
    { enabled: !!selectedBookNumber && !!selectedChapter && filteredParallelLanguages.length >= 1 }
  );

  // Extract data from responses
  const parallelTexts = parallelResponse?.parallels || [];
  const baseText = parallelResponse?.base;
  const parallelSummary = parallelResponse?.summary;

  // Language name mapping
  const languageNameMap: { [key: string]: string } = {
    'eng': 'English',
    'run': 'Kirundi',
    'fra': 'French',
    'spa': 'Spanish',
    'deu': 'German',
    'por': 'Portuguese',
    'ita': 'Italian',
    'rus': 'Russian',
    'ara': 'Arabic',
    'heb': 'Hebrew',
    'grc': 'Greek',
    'lat': 'Latin',
    'zho': 'Chinese',
    'jpn': 'Japanese',
    'kor': 'Korean',
    'hin': 'Hindi',
    'swa': 'Swahili',
    'amh': 'Amharic',
    'yor': 'Yoruba',
    'ibo': 'Igbo',
    'hau': 'Hausa',
    'ful': 'Fulani',
    'wol': 'Wolof',
    'bam': 'Bambara',
    'lin': 'Lingala',
    'kin': 'Kinyarwanda',
    'lug': 'Luganda',
    'ach': 'Acholi',
    'lwo': 'Luo',
    'tes': 'Teso',
    'kik': 'Kikuyu',
    'kam': 'Kamba',
    'mer': 'Meru',
    'emb': 'Embu',
    'thr': 'Tharaka',
    'mij': 'Mijikenda',
    'gir': 'Giriama',
    'dav': 'Dawida',
    'duj': 'Duruma',
    'rab': 'Raba',
  };

  const getFullLanguageName = (code: string, fallbackName?: string) => {
    return languageNameMap[code?.toLowerCase()] || fallbackName || code?.toUpperCase() || 'Unknown';
  };

  const handleParallelLanguageToggle = (languageCode: string) => {
    setParallelLanguages(prev => {
      if (prev.includes(languageCode)) {
        return prev.filter(lang => lang !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const tryDifferentVerse = (direction: 'first' | 'previous' | 'next') => {
    const currentVerse = parallelVerse || highlightedVerse || 1;
    let newVerse: number;

    switch (direction) {
      case 'first':
        newVerse = 1;
        break;
      case 'previous':
        newVerse = Math.max(1, currentVerse - 1);
        break;
      case 'next':
        newVerse = Math.min(200, currentVerse + 1);
        break;
      default:
        newVerse = currentVerse;
    }

    setParallelVerse(newVerse);
  };

  const clearParallelSelection = () => {
    setParallelVerse(null);
  };

  const setVerseForComparison = (verse: number) => {
    setParallelVerse(verse);
  };

  return {
    // State
    parallelLanguages,
    parallelVerse,
    filteredParallelLanguages,
    
    // Data
    languages,
    parallelTexts,
    baseText,
    parallelSummary,
    
    // Loading states
    languagesLoading,
    parallelLoading,
    
    // Errors
    languagesError,
    parallelError,
    
    // Actions
    handleParallelLanguageToggle,
    tryDifferentVerse,
    clearParallelSelection,
    setVerseForComparison,
    setParallelVerse,
    
    // Utilities
    getFullLanguageName,
    languageNameMap,
  };
};