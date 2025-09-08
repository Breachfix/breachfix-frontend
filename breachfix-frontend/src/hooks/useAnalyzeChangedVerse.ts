import { useState, useEffect } from 'react';

interface ChangedVerseData {
  reference: string;
  language: string;
  source: string;
  currentText: string;
  changedVerse?: {
    kjvBaseline?: string;
    translation?: { suggestion?: string };
    summary?: string;
    analysis?: string;
    affectedDoctrine?: string[];
    batchData?: { 
      Error?: string; 
      Danger?: string; 
      Evidence?: string; 
      Explanation?: string; 
    };
    spiritOfProphecy?: string;
    modernVersionsCited?: string[];
  };
}

export function useAnalyzeChangedVerse({ 
  lang, 
  source, 
  book, 
  chapter, 
  verse 
}: { 
  lang: string; 
  source: string; 
  book: number; 
  chapter: number; 
  verse: number; 
}) {
  const [data, setData] = useState<ChangedVerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lang || !source || !book || !chapter || !verse) {
      setData(null);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetch(`${import.meta.env.VITE_API_BASE_URL}/all-bibles/analyze/${book}/${chapter}/${verse}?language=${lang}&source=${source}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((responseData) => {
        if (responseData.success && responseData.data) {
          setData(responseData.data);
        } else {
          throw new Error(responseData.message || 'No data returned from analysis');
        }
      })
      .catch((err) => {
        console.error('Failed to analyze verse:', err);
        setError(err?.message || 'Failed to load verse analysis');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lang, source, book, chapter, verse]);

  return { data, loading, error };
}
