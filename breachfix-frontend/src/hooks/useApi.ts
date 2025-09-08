// src/hooks/useApi.ts
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../utils/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Type definitions for Bible API
interface Book {
  slug: string;
  name: string;
  chapters: number;
  order: number;
}

interface Chapter {
  success: boolean;
  lang: string;
  bookSlug: string;
  bookName: string;
  chapter: number;
  verses: Verse[];
}

interface Verse {
  verse: number;
  text: string;
}

interface SearchResult {
  bookSlug: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

// Type definitions for Accounts API
interface Account {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  type: 'standard' | 'kids' | 'adult';
  avatar?: string;
  roles: AccountRole[];
  auditLogs: AuditLog[];
  createdAt: string;
  updatedAt: string;
}

interface AccountRole {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: string;
  addedBy: string;
}

interface AuditLog {
  action: string;
  date: string;
  meta: Record<string, any>;
}

interface AccountAnalytics {
  totalAccounts: number;
  activeAccounts: number;
  lockedAccounts: number;
  deletedAccounts: number;
  accountsByType: {
    standard: number;
    kids: number;
    adult: number;
  };
  recentActivity: AuditLog[];
}

// Type definitions for Favorites API
interface Favorite {
  _id: string;
  userId: string;
  mediaId: string;
  type: 'movie' | 'tvshow' | 'episode';
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  platform: string;
  accountId?: string;
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FavoriteStatus {
  isFavorited: boolean;
  favoriteId?: string;
  favoritedAt?: string;
}

interface FavoriteStats {
  total: number;
  byType: {
    movie: number;
    tvshow: number;
    episode: number;
  };
  byPlatform: {
    media: number;
    [key: string]: number;
  };
  recentActivity: Favorite[];
}

interface FavoritesResponse {
  success: boolean;
  favorites: Favorite[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}


interface UseApiOptions<TData> {
  enabled?: boolean; // Controls whether the query runs
  refetchInterval?: number; // Refetch data every N milliseconds
  initialData?: TData; // Initial data for the query
  staleTime?: number; // How long until data is considered stale
  retry?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries
}

// A generic hook for making GET requests with React Query
export const useApi = <TData = unknown>(
  queryKey: string[], // Unique key for caching, often the endpoint string
  endpoint: string,
  options?: UseApiOptions<TData>
) => {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      return await ApiService.get<TData>(endpoint);
    },
    staleTime: options?.staleTime || 1000 * 60 * 5, // Default 5 minutes
    retry: options?.retry || 3,
    retryDelay: options?.retryDelay || 1000,
    enabled: options?.enabled !== false, // Default to true
    refetchInterval: options?.refetchInterval,
    initialData: options?.initialData,
  });
};

// Bible-specific hooks for better type safety and organization
export const useBibleApi = {
  useBooks: (lang: string = 'en', options?: UseApiOptions<{ success: boolean; lang: string; books: Book[] }>) => {
    return useQuery<{ success: boolean; lang: string; books: Book[] }, Error>({
      queryKey: ['bible-books', lang],
      queryFn: () => ApiService.bible.getBooks(lang),
      staleTime: 1000 * 60 * 10,
      ...options,
    });
  },
  useChapter: (bookSlug: string, chapter: number, lang: string = 'en', options?: UseApiOptions<Chapter>) => {
    return useQuery<Chapter, Error>({
      queryKey: ['bible-chapter', bookSlug, chapter.toString(), lang],
      queryFn: () => ApiService.bible.getChapter(bookSlug, chapter, lang),
      staleTime: 1000 * 60 * 5,
      enabled: !!bookSlug && !!chapter,
      ...options,
    });
  },
  useVerse: (bookSlug: string, chapter: number, verse: number, lang: string = 'en', options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-verse', bookSlug, chapter.toString(), verse.toString(), lang],
      queryFn: () => ApiService.bible.getVerse(bookSlug, chapter, verse, lang),
      staleTime: 1000 * 60 * 5,
      enabled: !!bookSlug && !!chapter && !!verse,
      ...options,
    });
  },
  useSearch: (query: string, lang: string = 'en', options?: UseApiOptions<{ success: boolean; lang: string; query: string; results: SearchResult[] }>) => {
    return useQuery<{ success: boolean; lang: string; query: string; results: SearchResult[] }, Error>({
      queryKey: ['bible-search', query, lang],
      queryFn: () => ApiService.bible.search(query, lang),
      staleTime: 1000 * 60 * 2,
      enabled: !!query && query.length > 2,
      ...options,
    });
  },
  // Numeric canonical operations
  useVerseByNumber: (lang: string, bookNumber: number, chapter: number, verse: number, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-verse-num', lang, bookNumber, chapter, verse],
      queryFn: () => ApiService.bible.getVerseByNumber(lang, bookNumber, chapter, verse),
      staleTime: 1000 * 60 * 5,
      enabled: !!lang && !!bookNumber && !!chapter && !!verse,
      ...options,
    });
  },
  useChapterByNumber: (lang: string, bookNumber: number, chapter: number, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-chapter-num', lang, bookNumber, chapter],
      queryFn: () => ApiService.bible.getChapterByNumber(lang, bookNumber, chapter),
      staleTime: 1000 * 60 * 5,
      enabled: !!lang && !!bookNumber && !!chapter,
      ...options,
    });
  },
  useParallelText: (bookNumber: number, chapter: number, verse: number, baseLang: string, parallelLang: string, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-parallel', bookNumber, chapter, verse, baseLang, parallelLang],
      queryFn: () => ApiService.bible.getParallelText(bookNumber, chapter, verse, baseLang, parallelLang),
      staleTime: 1000 * 60 * 5,
      enabled: !!bookNumber && !!chapter && !!verse && !!baseLang && !!parallelLang,
      ...options,
    });
  },
  // Unified Cross-Language API (Recommended)
  useVerseByReference: (reference: string, lang: string = 'en', targetLang?: string, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-verse-ref', reference, lang, targetLang],
      queryFn: () => ApiService.bible.getVerseByReference(reference, lang, targetLang),
      staleTime: 1000 * 60 * 5,
      enabled: !!reference && !!lang,
      ...options,
    });
  },
  useChapterByReference: (reference: string, lang: string = 'en', targetLang?: string, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-chapter-ref', reference, lang, targetLang],
      queryFn: () => ApiService.bible.getChapterByReference(reference, lang, targetLang),
      staleTime: 1000 * 60 * 5,
      enabled: !!reference && !!lang,
      ...options,
    });
  },
  useVerseRange: (reference: string, range: number, sourceLang: string = 'en', targetLangs?: string[], options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-verse-range', reference, range, sourceLang, targetLangs],
      queryFn: () => ApiService.bible.getVerseRange(reference, range, sourceLang, targetLangs),
      staleTime: 1000 * 60 * 5,
      enabled: !!reference && !!range && !!sourceLang,
      ...options,
    });
  },
  useAvailableLanguages: (reference: string, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-available-languages', reference],
      queryFn: () => ApiService.bible.getAvailableLanguages(reference),
      staleTime: 1000 * 60 * 10,
      enabled: !!reference,
      ...options,
    });
  },
  useBookInfo: (bookCode: string, lang?: string, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-book-info', bookCode, lang],
      queryFn: () => ApiService.bible.getBookInfo(bookCode, lang),
      staleTime: 1000 * 60 * 10,
      enabled: !!bookCode,
      ...options,
    });
  },
  useVerseByCanonical: (bookCode: string, chapter: number, verse: number, lang: string = 'en', targetLang?: string, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-verse-canonical', bookCode, chapter, verse, lang, targetLang],
      queryFn: () => ApiService.bible.getVerseByCanonical(bookCode, chapter, verse, lang, targetLang),
      staleTime: 1000 * 60 * 5,
      enabled: !!bookCode && !!chapter && !!verse && !!lang,
      ...options,
    });
  },
  useChapterByCanonical: (bookCode: string, chapter: number, lang: string = 'en', targetLang?: string, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-chapter-canonical', bookCode, chapter, lang, targetLang],
      queryFn: () => ApiService.bible.getChapterByCanonical(bookCode, chapter, lang, targetLang),
      staleTime: 1000 * 60 * 5,
      enabled: !!bookCode && !!chapter && !!lang,
      ...options,
    });
  },
  useCrossLanguageSearch: (query: string, sourceLang: string = 'en', targetLangs?: string[], limit: number = 20, options?: UseApiOptions<any>) => {
    return useQuery<any, Error>({
      queryKey: ['bible-cross-search', query, sourceLang, targetLangs, limit],
      queryFn: () => ApiService.bible.crossLanguageSearch(query, sourceLang, targetLangs, limit),
      staleTime: 1000 * 60 * 2,
      enabled: !!query && query.length > 2 && !!sourceLang,
      ...options,
    });
  },
};

// Edit-specific hooks
export const useEditApi = {
  // Hook for fetching user's edits
  useMyEdits: (lang: string = 'en', state?: string, options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['bible-my-edits', lang, state],
      queryFn: () => ApiService.edits.getMine(lang, state),
      staleTime: 1000 * 60 * 2, // 2 minutes for edits
      ...options,
    });
  },

  // Hook for submitting a Bible edit
  useSubmitEdit: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (editData: {
        lang: string;
        bookSlug: string;
        chapter: number;
        verse: number;
        proposedText: string;
      }) => ApiService.edits.submit(editData),
      onSuccess: () => {
        // Invalidate and refetch user's edits
        queryClient.invalidateQueries({ queryKey: ['bible-my-edits'] });
      },
    });
  },

  // Hook for submitting a Bible edit using numeric canonical reference
  useSubmitNumericEdit: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (editData: {
        lang: string;
        bookNumber: number;
        chapter: number;
        verse: number;
        proposedText: string;
        reason?: string;
      }) => ApiService.edits.submitNumeric(
        editData.lang,
        editData.bookNumber,
        editData.chapter,
        editData.verse,
        {
          proposedText: editData.proposedText,
          reason: editData.reason,
        }
      ),
      onSuccess: () => {
        // Invalidate and refetch user's edits
        queryClient.invalidateQueries({ queryKey: ['bible-my-edits'] });
      },
    });
  },

  // Hook for withdrawing an edit
  useWithdrawEdit: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (editId: string) => ApiService.edits.withdraw(editId),
      onSuccess: () => {
        // Invalidate and refetch user's edits
        queryClient.invalidateQueries({ queryKey: ['bible-my-edits'] });
      },
    });
  },
};

// Admin-specific hooks
export const useAdminApi = {
  // Hook for fetching pending edits
  usePendingEdits: (lang?: string, options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['bible-pending-edits', lang],
      queryFn: () => ApiService.admin.getPendingEdits(lang),
      staleTime: 1000 * 60 * 2, // 2 minutes for pending edits
      ...options,
    });
  },
};

// AllBibles API hooks (Production-grade Bible API system)
export const useAllBiblesApi = {
  // Language Management
  languages: {
    useGetAll: (options?: UseApiOptions<{ success: boolean; count: number; languages: any[] }>) => {
      return useQuery({
        queryKey: ['all-bibles-languages'],
        queryFn: () => ApiService.allBibles.languages.getAll(),
        staleTime: 1000 * 60 * 30, // 30 minutes for languages
        ...options,
      });
    },
  },

  // Source Management
  sources: {
    useGetByLanguage: (langCode: string, options?: UseApiOptions<{ success: boolean; languageCode: string; count: number; sources: any[] }>) => {
      return useQuery({
        queryKey: ['all-bibles-sources', langCode],
        queryFn: () => ApiService.allBibles.sources.getByLanguage(langCode),
        staleTime: 1000 * 60 * 15, // 15 minutes for sources
        enabled: !!langCode,
        ...options,
      });
    },
  },

  // Book Management
  books: {
    useGetAll: (langCode: string, sourceCode: string, options?: UseApiOptions<{ success: boolean; languageCode: string; sourceCode: string; count: number; books: any[] }>) => {
      return useQuery({
        queryKey: ['all-bibles-books', langCode, sourceCode],
        queryFn: () => ApiService.allBibles.books.getAll(langCode, sourceCode),
        staleTime: 1000 * 60 * 20, // 20 minutes for books
        enabled: !!langCode && !!sourceCode,
        ...options,
      });
    },

    useGetById: (langCode: string, sourceCode: string, bookNumber: number, options?: UseApiOptions<{ success: boolean; languageCode: string; sourceCode: string; book: any }>) => {
      return useQuery({
        queryKey: ['all-bibles-book', langCode, sourceCode, bookNumber],
        queryFn: () => ApiService.allBibles.books.getById(langCode, sourceCode, bookNumber),
        staleTime: 1000 * 60 * 20, // 20 minutes for book details
        enabled: !!langCode && !!sourceCode && !!bookNumber,
        ...options,
      });
    },
  },

  // Text Retrieval
  text: {
    useGetSpecific: (langCode: string, sourceCode: string, params: { bookNumber?: number; chapter?: number; verse?: number }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bibles-text-specific', langCode, sourceCode, params],
        queryFn: () => ApiService.allBibles.text.getSpecific(langCode, sourceCode, params),
        staleTime: 1000 * 60 * 10, // 10 minutes for text
        enabled: !!langCode && !!sourceCode && (!!params.bookNumber || !!params.chapter || !!params.verse),
        ...options,
      });
    },

    useGetAll: (langCode: string, sourceCode: string, params?: { limit?: number; offset?: number; bookNumber?: number; chapter?: number }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bibles-text-all', langCode, sourceCode, params],
        queryFn: () => ApiService.allBibles.text.getAll(langCode, sourceCode, params),
        staleTime: 1000 * 60 * 5, // 5 minutes for all text
        enabled: !!langCode && !!sourceCode,
        ...options,
      });
    },
  },

  // Statistics
  stats: {
    useGetByLanguageSource: (langCode: string, sourceCode: string, options?: UseApiOptions<{ success: boolean; languageCode: string; sourceCode: string; stats: any }>) => {
      return useQuery({
        queryKey: ['all-bibles-stats', langCode, sourceCode],
        queryFn: () => ApiService.allBibles.stats.getByLanguageSource(langCode, sourceCode),
        staleTime: 1000 * 60 * 15, // 15 minutes for stats
        enabled: !!langCode && !!sourceCode,
        ...options,
      });
    },
  },

  // Search Functionality
  search: {
    useByLanguageSource: (langCode: string, sourceCode: string, query: string, params?: { limit?: number; offset?: number }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bibles-search-lang-source', langCode, sourceCode, query, params],
        queryFn: () => ApiService.allBibles.search.byLanguageSource(langCode, sourceCode, query, params),
        staleTime: 1000 * 60 * 2, // 2 minutes for search results
        enabled: !!langCode && !!sourceCode && !!query && query.length > 2,
        ...options,
      });
    },

    useGlobal: (query: string, params?: { limit?: number; offset?: number; language?: string; source?: string; bookNumber?: number; chapter?: number; includeMetadata?: boolean }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bibles-search-global', query, params],
        queryFn: () => ApiService.allBibles.search.global(query, params),
        staleTime: 1000 * 60 * 2, // 2 minutes for global search
        enabled: !!query && query.length > 2,
        ...options,
      });
    },
  },

  // Parallel Text
  parallel: {
    useGetTwoLanguage: (bookNumber: number, chapter: number, verse: number, baseLang: string, parallelLang: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bibles-parallel-two', bookNumber, chapter, verse, baseLang, parallelLang],
        queryFn: () => ApiService.allBibles.parallel.getTwoLanguage(bookNumber, chapter, verse, baseLang, parallelLang),
        staleTime: 1000 * 60 * 10, // 10 minutes for parallel text
        enabled: !!bookNumber && !!chapter && !!verse && !!baseLang && !!parallelLang,
        ...options,
      });
    },

    useGetMultiple: (bookNumber: number, chapter: number, verse: number, baseLang: string, parallelLangs: string[], options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bibles-parallel-multiple', bookNumber, chapter, verse, baseLang, parallelLangs],
        queryFn: () => ApiService.allBibles.parallel.getMultiple(bookNumber, chapter, verse, baseLang, parallelLangs),
        staleTime: 1000 * 60 * 10, // 10 minutes for multiple parallel text
        enabled: !!bookNumber && !!chapter && !!verse && !!baseLang && parallelLangs.length >= 2,
        ...options,
      });
    },
  },

  // Change Links
  changeLinks: {
    useGetByReference: (bookNumber: number, chapter: number, verse: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bibles-change-links', bookNumber, chapter, verse],
        queryFn: () => ApiService.allBibles.changeLinks.getByReference(bookNumber, chapter, verse),
        staleTime: 1000 * 60 * 15, // 15 minutes for change links
        enabled: !!bookNumber && !!chapter && !!verse,
        ...options,
      });
    },
  },
};

// AllBibles Edit Workflow hooks
export const useAllBibleEditsApi = {
  useSubmitEdit: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: {
        languageCode: string;
        sourceCode: string;
        bookNumber: number;
        chapter: number;
        verse: number;
        suggestedText: string;
        reason?: string;
        references?: string[];
        editType?: 'text_correction' | 'translation_improvement' | 'grammar_fix' | 'typo_correction' | 'other';
        priority?: 'low' | 'medium' | 'high' | 'critical';
      }) => ApiService.allBibleEdits.submit(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-bible-edits-mine'] });
      },
    });
  },

  useSubmitNumericEdit: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: {
        langCode: string;
        bookNumber: number;
        chapter: number;
        verse: number;
        suggestedText: string;
        reason?: string;
        references?: string[];
        editType?: 'text_correction' | 'translation_improvement' | 'grammar_fix' | 'typo_correction' | 'other';
        priority?: 'low' | 'medium' | 'high' | 'critical';
      }) => ApiService.allBibleEdits.submitNumeric(data.langCode, data.bookNumber, data.chapter, data.verse, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-bible-edits-mine'] });
      },
    });
  },

  useGetMine: (options?: UseApiOptions<{ success: boolean; count: number; edits: any[] }>) => {
    return useQuery({
      queryKey: ['all-bible-edits-mine'],
      queryFn: () => ApiService.allBibleEdits.getMine(),
      staleTime: 1000 * 60 * 2, // 2 minutes for user edits
      ...options,
    });
  },

  useGetById: (editId: string, options?: UseApiOptions<{ success: boolean; edit: any }>) => {
    return useQuery({
      queryKey: ['all-bible-edit', editId],
      queryFn: () => ApiService.allBibleEdits.getById(editId),
      staleTime: 1000 * 60 * 5, // 5 minutes for edit details
      enabled: !!editId,
      ...options,
    });
  },

  useSubmitForReview: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (editId: string) => ApiService.allBibleEdits.submitForReview(editId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-bible-edits-mine'] });
      },
    });
  },

  useWithdraw: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (editId: string) => ApiService.allBibleEdits.withdraw(editId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-bible-edits-mine'] });
      },
    });
  },

  useGetStats: (options?: UseApiOptions<{ success: boolean; totalEdits: number; stats: Record<string, number> }>) => {
    return useQuery({
      queryKey: ['all-bible-edits-stats'],
      queryFn: () => ApiService.allBibleEdits.getStats(),
      staleTime: 1000 * 60 * 5, // 5 minutes for edit stats
      ...options,
    });
  },
};

// AllBibles Admin Operations hooks
export const useAllBibleAdminApi = {
  useGetSystemStats: (options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['all-bible-admin-system-stats'],
      queryFn: () => ApiService.allBibleAdmin.getSystemStats(),
      staleTime: 1000 * 60 * 10, // 10 minutes for system stats
      ...options,
    });
  },

  edits: {
    useGetPending: (options?: UseApiOptions<{ success: boolean; message: string; count: number; edits: any[] }>) => {
      return useQuery({
        queryKey: ['all-bible-admin-edits-pending'],
        queryFn: () => ApiService.allBibleAdmin.edits.getPending(),
        staleTime: 1000 * 60 * 2, // 2 minutes for pending edits
        ...options,
      });
    },

    useApprove: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ editId, note }: { editId: string; note?: string }) => ApiService.allBibleAdmin.edits.approve(editId, note),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['all-bible-admin-edits-pending'] });
        },
      });
    },

    useReject: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ editId, reason }: { editId: string; reason: string }) => ApiService.allBibleAdmin.edits.reject(editId, reason),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['all-bible-admin-edits-pending'] });
        },
      });
    },

    useBulkApprove: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (editIds: string[]) => ApiService.allBibleAdmin.edits.bulkApprove(editIds),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['all-bible-admin-edits-pending'] });
        },
      });
    },

    useBulkReject: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ editIds, reason }: { editIds: string[]; reason: string }) => ApiService.allBibleAdmin.edits.bulkReject(editIds, reason),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['all-bible-admin-edits-pending'] });
        },
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (editId: string) => ApiService.allBibleAdmin.edits.delete(editId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['all-bible-admin-edits-pending'] });
        },
      });
    },

    useGetStats: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-admin-edits-stats'],
        queryFn: () => ApiService.allBibleAdmin.edits.getStats(),
        staleTime: 1000 * 60 * 5, // 5 minutes for admin edit stats
        ...options,
      });
    },
  },

  useGetEditHistory: (bookNumber: number, chapter: number, verse: number, options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['all-bible-admin-edit-history', bookNumber, chapter, verse],
      queryFn: () => ApiService.allBibleAdmin.getEditHistory(bookNumber, chapter, verse),
      staleTime: 1000 * 60 * 10, // 10 minutes for edit history
      enabled: !!bookNumber && !!chapter && !!verse,
      ...options,
    });
  },
};

// AllBibles Changed Verse Management hooks
export const useAllBibleChangedApi = {
  books: {
    useGetAll: (options?: UseApiOptions<{ success: boolean; count: number; books: any[] }>) => {
      return useQuery({
        queryKey: ['all-bible-changed-books'],
        queryFn: () => ApiService.allBibleChanged.books.getAll(),
        staleTime: 1000 * 60 * 15, // 15 minutes for changed books
        ...options,
      });
    },

    useGetById: (bookNumber: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-changed-book', bookNumber],
        queryFn: () => ApiService.allBibleChanged.books.getById(bookNumber),
        staleTime: 1000 * 60 * 15, // 15 minutes for changed book details
        enabled: !!bookNumber,
        ...options,
      });
    },
  },

  verses: {
    useGetAll: (params?: { limit?: number; offset?: number; bookNumber?: number; language?: string }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-changed-verses', params],
        queryFn: () => ApiService.allBibleChanged.verses.getAll(params),
        staleTime: 1000 * 60 * 5, // 5 minutes for changed verses
        ...options,
      });
    },

    useGetByReference: (reference: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-changed-verse', reference],
        queryFn: () => ApiService.allBibleChanged.verses.getByReference(reference),
        staleTime: 1000 * 60 * 10, // 10 minutes for changed verse details
        enabled: !!reference,
        ...options,
      });
    },
  },

  translations: {
    useGetByReference: (reference: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-changed-translations', reference],
        queryFn: () => ApiService.allBibleChanged.translations.getByReference(reference),
        staleTime: 1000 * 60 * 10, // 10 minutes for translations
        enabled: !!reference,
        ...options,
      });
    },

    useGetByReferenceAndLanguage: (reference: string, language: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-changed-translation', reference, language],
        queryFn: () => ApiService.allBibleChanged.translations.getByReferenceAndLanguage(reference, language),
        staleTime: 1000 * 60 * 10, // 10 minutes for specific translation
        enabled: !!reference && !!language,
        ...options,
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ reference, language, data }: { reference: string; language: string; data: any }) => 
          ApiService.allBibleChanged.translations.update(reference, language, data),
        onSuccess: (_, { reference }) => {
          queryClient.invalidateQueries({ queryKey: ['all-bible-changed-translations', reference] });
        },
      });
    },
  },

  // Asterisk System hooks
  asterisk: {
    useAnalyzeVerse: (bookNumber: number, chapter: number, verse: number, language: string, source: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-asterisk-analyze', bookNumber, chapter, verse, language, source],
        queryFn: () => ApiService.allBibleChanged.asterisk.analyzeVerse(bookNumber, chapter, verse, language, source),
        staleTime: 1000 * 60 * 10, // 10 minutes for verse analysis
        enabled: !!bookNumber && !!chapter && !!verse && !!language && !!source,
        ...options,
      });
    },

    useCheckBulk: (verses: Array<{ bookNumber: number; chapter: number; verse: number; language: string; source: string }>, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-asterisk-bulk', verses],
        queryFn: () => ApiService.allBibleChanged.asterisk.checkBulk(verses),
        staleTime: 1000 * 60 * 10, // 10 minutes for bulk asterisk check
        enabled: verses.length > 0,
        ...options,
      });
    },

    useGetChangeDetails: (reference: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['all-bible-asterisk-details', reference],
        queryFn: () => ApiService.allBibleChanged.asterisk.getChangeDetails(reference),
        staleTime: 1000 * 60 * 15, // 15 minutes for change details
        enabled: !!reference,
        ...options,
      });
    },
  },

  useGetStats: (options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['all-bible-changed-stats'],
      queryFn: () => ApiService.allBibleChanged.getStats(),
      staleTime: 1000 * 60 * 15, // 15 minutes for changed stats
      ...options,
    });
  },

  useSearch: (query: string, params?: { limit?: number; offset?: number; bookNumber?: number; language?: string }, options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['all-bible-changed-search', query, params],
      queryFn: () => ApiService.allBibleChanged.search(query, params),
      staleTime: 1000 * 60 * 2, // 2 minutes for changed search
      enabled: !!query && query.length > 2,
      ...options,
    });
  },
};

// AllBibles Health & Monitoring hooks
export const useAllBibleHealthApi = {
  useGetBasic: (options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['all-bible-health-basic'],
      queryFn: () => ApiService.allBibleHealth.getBasic(),
      staleTime: 1000 * 60 * 2, // 2 minutes for basic health
      ...options,
    });
  },

  useGetDetailed: (options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['all-bible-health-detailed'],
      queryFn: () => ApiService.allBibleHealth.getDetailed(),
      staleTime: 1000 * 60 * 5, // 5 minutes for detailed health
      ...options,
    });
  },

  useGetMetrics: (options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['all-bible-health-metrics'],
      queryFn: () => ApiService.allBibleHealth.getMetrics(),
      staleTime: 1000 * 60 * 5, // 5 minutes for metrics
      ...options,
    });
  },
};

// Media API hooks
export const useMediaApi = {
  // General media hooks
  useEpisodeContext: (episodeId: string, options?: UseApiOptions<any>) => {
    return useQuery({
      queryKey: ['media-episode-context', episodeId],
      queryFn: () => ApiService.media.getEpisodeContext(episodeId),
      staleTime: 1000 * 60 * 5,
      enabled: !!episodeId,
      ...options,
    });
  },

  // Health check hook
  health: {
    useCheck: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['health'],
        queryFn: () => ApiService.healthCheck(),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },
  },

  // Movie hooks
  movies: {
    useAll: (params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movies', params],
        queryFn: () => ApiService.media.movies.getAll(params),
        staleTime: 1000 * 60 * 2,
        ...options,
      });
    },

    useById: (id: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movie', id],
        queryFn: () => ApiService.media.movies.getById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
        ...options,
      });
    },

    useHeroContent: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movies-hero'],
        queryFn: () => ApiService.media.movies.getHeroContent(),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    useRandomHeroContent: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movies-hero-random'],
        queryFn: () => ApiService.media.movies.getRandomHeroContent(),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    // Featured content
    useGetFeatured: (params?: {
      limit?: number;
      genre?: string;
      language?: string;
    }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movies-featured', params],
        queryFn: () => ApiService.media.movies.getFeatured(params),
        staleTime: 1000 * 60 * 10, // 10 minutes
        ...(options as any),
      });
    },

    useTrending: (limit?: number, days?: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movies-trending', limit, days],
        queryFn: () => ApiService.media.movies.getTrending(limit, days),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    useSimilar: (movieId: string, limit?: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movies-similar', movieId, limit],
        queryFn: () => ApiService.media.movies.getSimilar(movieId, limit),
        staleTime: 1000 * 60 * 5,
        enabled: !!movieId,
        ...options,
      });
    },

    // Mutations
    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (movieData: any) => ApiService.media.movies.create(movieData),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
        },
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => 
          ApiService.media.movies.update(id, data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
          queryClient.invalidateQueries({ queryKey: ['media-movie', id] });
        },
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => ApiService.media.movies.delete(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
        },
      });
    },

    // Social features
    useToggleLike: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (movieId: string) => ApiService.media.movies.toggleLike(movieId),
        onSuccess: (_, movieId) => {
          queryClient.invalidateQueries({ queryKey: ['media-movie', movieId] });
        },
      });
    },

    useToggleFavorite: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (movieId: string) => ApiService.media.movies.toggleFavorite(movieId),
        onSuccess: (_, movieId) => {
          queryClient.invalidateQueries({ queryKey: ['media-movie', movieId] });
        },
      });
    },

    useRate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ movieId, rating }: { movieId: string; rating: number }) => 
          ApiService.media.movies.rateMovie(movieId, rating),
        onSuccess: (_, { movieId }) => {
          queryClient.invalidateQueries({ queryKey: ['media-movie', movieId] });
        },
      });
    },

    // Analytics
    useTrackView: () => {
      return useMutation({
        mutationFn: (movieId: string) => ApiService.media.movies.trackView(movieId),
      });
    },

    useAnalytics: (movieId: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-movie-analytics', movieId],
        queryFn: () => ApiService.media.movies.getAnalytics(movieId),
        staleTime: 1000 * 60 * 2,
        enabled: !!movieId,
        ...options,
      });
    },
  },

  // TV Shows hooks
  tvshows: {
    useAll: (params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows', params],
        queryFn: () => ApiService.media.tvshows.getAll(params),
        staleTime: 1000 * 60 * 2,
        ...options,
      });
    },

    useById: (id: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshow', id],
        queryFn: () => ApiService.media.tvshows.getById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
        ...options,
      });
    },

    useTrending: (limit?: number, days?: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-trending', limit, days],
        queryFn: () => ApiService.media.tvshows.getTrending(limit, days),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    useFeatured: (params?: {
      limit?: number;
      genre?: string;
      language?: string;
    }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-featured', params],
        queryFn: () => ApiService.media.tvshows.getFeatured(params),
        staleTime: 1000 * 60 * 5,
        ...(options as any),
      });
    },

    useRecent: (limit?: number, days?: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-recent', limit, days],
        queryFn: () => ApiService.media.tvshows.getRecent(limit, days),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    useTopRated: (limit?: number, minRatings?: number, genre?: string, language?: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-top-rated', limit, minRatings, genre, language],
        queryFn: () => ApiService.media.tvshows.getTopRated(limit, minRatings, genre, language),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    useByGenre: (genre: string, params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-genre', genre, params],
        queryFn: () => ApiService.media.tvshows.getByGenre(genre, params),
        staleTime: 1000 * 60 * 5,
        enabled: !!genre,
        ...options,
      });
    },

    useSimilar: (id: string, limit?: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-similar', id, limit],
        queryFn: () => ApiService.media.tvshows.getSimilar(id, limit),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
        ...options,
      });
    },

    useSearch: (query: string, params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-search', query, params],
        queryFn: () => ApiService.media.tvshows.search(query, params),
        staleTime: 1000 * 60 * 2,
        enabled: !!query && query.length >= 2,
        ...options,
      });
    },

    useSearchSuggestions: (query: string, limit?: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-search-suggestions', query, limit],
        queryFn: () => ApiService.media.tvshows.getSearchSuggestions(query, limit),
        staleTime: 1000 * 60 * 2,
        enabled: !!query && query.length >= 2,
        ...options,
      });
    },

    usePopularSearchTerms: (limit?: number, days?: number, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-tvshows-popular-search', limit, days],
        queryFn: () => ApiService.media.tvshows.getPopularSearchTerms(limit, days),
        staleTime: 1000 * 60 * 10,
        ...options,
      });
    },

    // Mutations
    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (tvShowData: any) => ApiService.media.tvshows.create(tvShowData),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-tvshows'] });
        },
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => 
          ApiService.media.tvshows.update(id, data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['media-tvshows'] });
          queryClient.invalidateQueries({ queryKey: ['media-tvshow', id] });
        },
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => ApiService.media.tvshows.delete(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-tvshows'] });
        },
      });
    },
  },

  // Episodes hooks
  episodes: {
    useAll: (params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes', params],
        queryFn: () => ApiService.media.episodes.getAll(params),
        staleTime: 1000 * 60 * 2,
        ...options,
      });
    },

    useById: (id: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episode', id],
        queryFn: () => ApiService.media.episodes.getById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
        ...options,
      });
    },

    useByTVShow: (tvShowId: string, params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes-tvshow', tvShowId, params],
        queryFn: () => ApiService.media.episodes.getByTVShow(tvShowId, params),
        staleTime: 1000 * 60 * 5,
        enabled: !!tvShowId,
        ...options,
      });
    },

    // Featured content
    useGetFeatured: (params?: {
      limit?: number;
      genre?: string;
      language?: string;
      tvShowId?: string;
    }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes-featured', params],
        queryFn: () => ApiService.media.episodes.getFeatured(params),
        staleTime: 1000 * 60 * 10, // 10 minutes
        ...(options as any),
      });
    },

    // Trending episodes
    useGetTrending: (params?: {
      limit?: number;
      days?: number;
    }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes-trending', params],
        queryFn: () => ApiService.media.episodes.getTrending(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...(options as any),
      });
    },

    // Episodes by genre
    useGetByGenre: (genre: string, params?: {
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes-genre', genre, params],
        queryFn: () => ApiService.media.episodes.getByGenre(genre, params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!genre,
        ...(options as any),
      });
    },

    // Similar episodes
    useGetSimilar: (id: string, params?: {
      limit?: number;
    }, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes-similar', id, params],
        queryFn: () => ApiService.media.episodes.getSimilar(id, params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!id,
        ...(options as any),
      });
    },

    // Check episode access
    useCheckAccess: (episodeId: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes-access', episodeId],
        queryFn: () => ApiService.media.episodes.checkAccess(episodeId),
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: !!episodeId,
        ...(options as any),
      });
    },

    useSearch: (query: string, params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-episodes-search', query, params],
        queryFn: () => ApiService.media.episodes.search(query, params),
        staleTime: 1000 * 60 * 2,
        enabled: !!query && query.length >= 2,
        ...options,
      });
    },

    // Mutations
    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (episodeData: any) => ApiService.media.episodes.create(episodeData),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-episodes'] });
        },
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => 
          ApiService.media.episodes.update(id, data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['media-episodes'] });
          queryClient.invalidateQueries({ queryKey: ['media-episode', id] });
        },
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => ApiService.media.episodes.delete(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-episodes'] });
        },
      });
    },
  },

  // Genres hooks
  genres: {
    useAll: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-genres'],
        queryFn: () => ApiService.media.genres.getAll(),
        staleTime: 1000 * 60 * 10, // 10 minutes for genres
        ...options,
      });
    },

    useByType: (mediaType: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-genres-type', mediaType],
        queryFn: () => ApiService.media.genres.getByType(mediaType),
        staleTime: 1000 * 60 * 10,
        enabled: !!mediaType,
        ...options,
      });
    },

    useMediaByGenre: (genre: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-genre-media', genre],
        queryFn: () => ApiService.media.genres.getMediaByGenre(genre),
        staleTime: 1000 * 60 * 5,
        enabled: !!genre,
        ...options,
      });
    },

    useMediaByGenreAndType: (genre: string, mediaType: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-genre-media-type', genre, mediaType],
        queryFn: () => ApiService.media.genres.getMediaByGenreAndType(genre, mediaType),
        staleTime: 1000 * 60 * 5,
        enabled: !!genre && !!mediaType,
        ...options,
      });
    },

    // Mutations
    useAddToMedia: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (genreData: any) => ApiService.media.genres.addToMedia(genreData),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-genres'] });
        },
      });
    },

    useUpdateOnMedia: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ mediaType, id, data }: { mediaType: string; id: string; data: any }) => 
          ApiService.media.genres.updateOnMedia(mediaType, id, data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-genres'] });
        },
      });
    },

    useDeleteFromMedia: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ mediaType, id, data }: { mediaType: string; id: string; data: any }) => 
          ApiService.media.genres.deleteFromMedia(mediaType, id, data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-genres'] });
        },
      });
    },

    useAssignToAllMedia: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: () => ApiService.media.genres.assignToAllMedia(),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-genres'] });
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
          queryClient.invalidateQueries({ queryKey: ['media-tvshows'] });
          queryClient.invalidateQueries({ queryKey: ['media-episodes'] });
        },
      });
    },
  },

  // Hero content hooks
  hero: {
    useContent: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-hero-content'],
        queryFn: () => ApiService.media.hero.getContent(),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    useRandomContent: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-hero-random'],
        queryFn: () => ApiService.media.hero.getRandomContent(),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },
  },

  // Progress tracking hooks
  progress: {
    useProgress: (contentId: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-progress', contentId],
        queryFn: () => ApiService.media.progress.getProgress(contentId),
        staleTime: 1000 * 60 * 2,
        enabled: !!contentId,
        ...options,
      });
    },

    useAllProgress: (params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-progress-all', params],
        queryFn: () => ApiService.media.progress.getAllProgress(params),
        staleTime: 1000 * 60 * 2,
        ...options,
      });
    },

    useContinueWatching: (params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-progress-continue', params],
        queryFn: () => ApiService.media.progress.getContinueWatching(params),
        staleTime: 1000 * 60 * 2,
        ...options,
      });
    },

    useRecentlyCompleted: (params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-progress-completed', params],
        queryFn: () => ApiService.media.progress.getRecentlyCompleted(params),
        staleTime: 1000 * 60 * 2,
        ...options,
      });
    },

    useSeriesProgress: (seriesId: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-progress-series', seriesId],
        queryFn: () => ApiService.media.progress.getSeriesProgress(seriesId),
        staleTime: 1000 * 60 * 2,
        enabled: !!seriesId,
        ...options,
      });
    },

    useWatchStats: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-progress-stats'],
        queryFn: () => ApiService.media.progress.getWatchStats(),
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },

    // Mutations
    useSaveProgress: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (progressData: any) => ApiService.media.progress.saveProgress(progressData),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: ['media-progress', variables.contentId] });
          queryClient.invalidateQueries({ queryKey: ['media-progress-all'] });
          queryClient.invalidateQueries({ queryKey: ['media-progress-continue'] });
        },
      });
    },

    useDeleteProgress: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (contentId: string) => ApiService.media.progress.deleteProgress(contentId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-progress'] });
          queryClient.invalidateQueries({ queryKey: ['media-progress-all'] });
          queryClient.invalidateQueries({ queryKey: ['media-progress-continue'] });
        },
      });
    },

    useDeleteAllProgress: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: () => ApiService.media.progress.deleteAllProgress(),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-progress'] });
        },
      });
    },

    useMarkAsWatched: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ contentId, data }: { contentId: string; data: any }) => 
          ApiService.media.progress.markAsWatched(contentId, data),
        onSuccess: (_, { contentId }) => {
          queryClient.invalidateQueries({ queryKey: ['media-progress', contentId] });
          queryClient.invalidateQueries({ queryKey: ['media-progress-all'] });
          queryClient.invalidateQueries({ queryKey: ['media-progress-completed'] });
        },
      });
    },

    useBulkUpdateProgress: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (bulkData: any) => ApiService.media.progress.bulkUpdateProgress(bulkData),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-progress'] });
        },
      });
    },
  },

  // Reviews hooks
  reviews: {
    useEntityReviews: (entityType: string, id: string, params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-reviews', entityType, id, params],
        queryFn: () => ApiService.media.reviews.getEntityReviews(entityType, id, params),
        staleTime: 1000 * 60 * 2,
        enabled: !!entityType && !!id,
        ...options,
      });
    },

    useEntityReviewStats: (entityType: string, id: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-reviews-stats', entityType, id],
        queryFn: () => ApiService.media.reviews.getEntityReviewStats(entityType, id),
        staleTime: 1000 * 60 * 5,
        enabled: !!entityType && !!id,
        ...options,
      });
    },

    useMyReviews: (params?: any, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-reviews-mine', params],
        queryFn: () => ApiService.media.reviews.getMyReviews(params),
        staleTime: 1000 * 60 * 2,
        ...options,
      });
    },

    // Mutations
    useCreateOrUpdateReview: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (reviewData: any) => ApiService.media.reviews.createOrUpdateReview(reviewData),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: ['media-reviews', variables.entityType, variables.entityId] });
          queryClient.invalidateQueries({ queryKey: ['media-reviews-stats', variables.entityType, variables.entityId] });
          queryClient.invalidateQueries({ queryKey: ['media-reviews-mine'] });
        },
      });
    },

    // Admin mutations
    usePublishReview: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (reviewId: string) => ApiService.media.reviews.publishReview(reviewId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-reviews'] });
        },
      });
    },

    useHideReview: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (reviewId: string) => ApiService.media.reviews.hideReview(reviewId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-reviews'] });
        },
      });
    },

    useDeleteReview: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (reviewId: string) => ApiService.media.reviews.deleteReview(reviewId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-reviews'] });
        },
      });
    },
  },

  // Upload hooks
  upload: {
    useUploadPoster: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (file: File) => ApiService.media.upload.uploadPoster(file),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
        },
      });
    },

    useUploadVideo: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (file: File) => ApiService.media.upload.uploadVideo(file),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
        },
      });
    },

    useUploadTrailer: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (file: File) => ApiService.media.upload.uploadTrailer(file),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
        },
      });
    },

    useGeneratePresignedURL: () => {
      return useMutation({
        mutationFn: (uploadData: any) => ApiService.media.upload.generatePresignedURL(uploadData),
      });
    },

    useFinalizeUpload: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (finalizeData: any) => ApiService.media.upload.finalizeUpload(finalizeData),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['media-movies'] });
          queryClient.invalidateQueries({ queryKey: ['media-tvshows'] });
        },
      });
    },

    useUploadStatus: (type: string, id: string, options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['media-upload-status', type, id],
        queryFn: () => ApiService.media.upload.getUploadStatus(type, id),
        staleTime: 1000 * 30, // 30 seconds for upload status
        enabled: !!type && !!id,
        refetchInterval: 5000, // Poll every 5 seconds
        ...options,
      });
    },
  },

  // Accounts API hooks
  accounts: {
    // Core Account Operations
    useGetAll: (options?: UseApiOptions<{ accounts: Account[]; total: number }>) => {
      return useQuery({
        queryKey: ['accounts-all'],
        queryFn: () => ApiService.accounts.getAll(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
      });
    },

    useGetById: (accountId: string, options?: UseApiOptions<Account>) => {
      return useQuery({
        queryKey: ['accounts-by-id', accountId],
        queryFn: () => ApiService.accounts.getById(accountId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!accountId,
        ...options,
      });
    },

    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (data: { name: string; pin: string; type?: 'standard' | 'kids' | 'adult' }) => 
          ApiService.accounts.create(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
        },
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ accountId, data }: { accountId: string; data: { name?: string; type?: 'standard' | 'kids' | 'adult' } }) => 
          ApiService.accounts.update(accountId, data),
        onSuccess: (_, { accountId }) => {
          queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
          queryClient.invalidateQueries({ queryKey: ['accounts-by-id', accountId] });
        },
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (accountId: string) => ApiService.accounts.delete(accountId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
        },
      });
    },

    useReactivate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (accountId: string) => ApiService.accounts.reactivate(accountId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
        },
      });
    },

    usePurge: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (accountId: string) => ApiService.accounts.purge(accountId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
        },
      });
    },

    // Security & PIN Management
    useValidatePin: () => {
      return useMutation({
        mutationFn: (data: { accountId: string; pin: string }) => 
          ApiService.accounts.validatePin(data),
      });
    },

    useChangePin: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ accountId, data }: { accountId: string; data: { currentPin: string; newPin: string } }) => 
          ApiService.accounts.changePin(accountId, data),
        onSuccess: (_, { accountId }) => {
          queryClient.invalidateQueries({ queryKey: ['accounts-by-id', accountId] });
        },
      });
    },

    useUnlock: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (accountId: string) => ApiService.accounts.unlock(accountId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
        },
      });
    },

    // Role Management
    useGetUserRole: (accountId: string, targetUserId: string, options?: UseApiOptions<AccountRole>) => {
      return useQuery({
        queryKey: ['accounts-user-role', accountId, targetUserId],
        queryFn: () => ApiService.accounts.getUserRole(accountId, targetUserId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!accountId && !!targetUserId,
        ...options,
      });
    },

    useAddUserRole: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ accountId, data }: { accountId: string; data: { targetUserId: string; role: 'owner' | 'editor' | 'viewer' } }) => 
          ApiService.accounts.addUserRole(accountId, data),
        onSuccess: (_, { accountId }) => {
          queryClient.invalidateQueries({ queryKey: ['accounts-by-id', accountId] });
          queryClient.invalidateQueries({ queryKey: ['accounts-user-role', accountId] });
        },
      });
    },

    useUpdateUserRole: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ accountId, targetUserId, data }: { accountId: string; targetUserId: string; data: { role: 'owner' | 'editor' | 'viewer' } }) => 
          ApiService.accounts.updateUserRole(accountId, targetUserId, data),
        onSuccess: (_, { accountId }) => {
          queryClient.invalidateQueries({ queryKey: ['accounts-by-id', accountId] });
          queryClient.invalidateQueries({ queryKey: ['accounts-user-role', accountId] });
        },
      });
    },

    useRemoveUserRole: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ accountId, targetUserId }: { accountId: string; targetUserId: string }) => 
          ApiService.accounts.removeUserRole(accountId, targetUserId),
        onSuccess: (_, { accountId }) => {
          queryClient.invalidateQueries({ queryKey: ['accounts-by-id', accountId] });
          queryClient.invalidateQueries({ queryKey: ['accounts-user-role', accountId] });
        },
      });
    },

    // Avatar Upload
    useUploadAvatar: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ accountId, file }: { accountId: string; file: File }) => 
          ApiService.accounts.uploadAvatar(accountId, file),
        onSuccess: (_, { accountId }) => {
          queryClient.invalidateQueries({ queryKey: ['accounts-by-id', accountId] });
        },
      });
    },

    // Admin & Analytics
    useGetAnalytics: (options?: UseApiOptions<AccountAnalytics>) => {
      return useQuery({
        queryKey: ['accounts-analytics'],
        queryFn: () => ApiService.accounts.getAnalytics(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        ...options,
      });
    },

    useGetLockedAccounts: (options?: UseApiOptions<Account[]>) => {
      return useQuery({
        queryKey: ['accounts-locked'],
        queryFn: () => ApiService.accounts.getLockedAccounts(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
      });
    },

    useGetDeletedAccounts: (params?: { page?: number; limit?: number; includeInactive?: boolean }, options?: UseApiOptions<{ accounts: Account[]; total: number }>) => {
      return useQuery({
        queryKey: ['accounts-deleted', params],
        queryFn: () => ApiService.accounts.getDeletedAccounts(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
      });
    },

    // Legacy & Compatibility
    useGetProfile: (options?: UseApiOptions<any>) => {
      return useQuery({
        queryKey: ['accounts-profile'],
        queryFn: () => ApiService.accounts.getProfile(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
      });
    },
  },

  // Favorites API hooks
  favorites: {
    // Core favorites operations
    useGetFavorites: (params?: {
      platform?: string;
      accountId?: string;
      type?: string;
      limit?: number;
      skip?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }, options?: UseApiOptions<FavoritesResponse>) => {
      return useQuery({
        queryKey: ['favorites-all', params],
        queryFn: () => ApiService.favorites.getFavorites(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
      });
    },

    useGetFavoriteById: (favoriteId: string, options?: UseApiOptions<Favorite>) => {
      return useQuery({
        queryKey: ['favorites-by-id', favoriteId],
        queryFn: () => ApiService.favorites.getFavoriteById(favoriteId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!favoriteId,
        ...options,
      });
    },

    useAddToFavorites: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (data: {
          mediaId: string;
          type: 'movie' | 'tvshow' | 'episode';
          title: string;
          description?: string;
          thumbnailUrl?: string;
          videoUrl?: string;
          platform?: string;
          accountId?: string;
          metadata?: Record<string, any>;
        }) => ApiService.favorites.addToFavorites(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['favorites-all'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-stats'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-recent'] });
        },
      });
    },

    useRemoveFromFavorites: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (favoriteId: string) => ApiService.favorites.removeFromFavorites(favoriteId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['favorites-all'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-stats'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-recent'] });
        },
      });
    },

    // Check favorite status
    useCheckFavoriteStatus: (mediaId: string, params?: {
      accountId?: string;
      platform?: string;
      type?: string;
    }, options?: UseApiOptions<FavoriteStatus>) => {
      return useQuery({
        queryKey: ['favorites-status', mediaId, params],
        queryFn: () => ApiService.favorites.checkFavoriteStatus(mediaId, params),
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: !!mediaId,
        ...options,
      });
    },

    // Additional endpoints
    useGetFavoriteStats: (params?: {
      accountId?: string;
      platform?: string;
    }, options?: UseApiOptions<FavoriteStats>) => {
      return useQuery({
        queryKey: ['favorites-stats', params],
        queryFn: () => ApiService.favorites.getFavoriteStats(params),
        staleTime: 1000 * 60 * 10, // 10 minutes
        ...options,
      });
    },

    useBulkCheckFavoriteStatus: () => {
      return useMutation({
        mutationFn: (data: {
          mediaIds: string[];
          accountId?: string;
          platform?: string;
          type?: string;
        }) => ApiService.favorites.bulkCheckFavoriteStatus(data),
      });
    },

    useGetRecentFavorites: (params?: {
      limit?: number;
      platform?: string;
      accountId?: string;
    }, options?: UseApiOptions<Favorite[]>) => {
      return useQuery({
        queryKey: ['favorites-recent', params],
        queryFn: () => ApiService.favorites.getRecentFavorites(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
      });
    },

    // Toggle favorite (convenience hook)
    useToggleFavorite: () => {
      const queryClient = useQueryClient();
      const addToFavorites = useMediaApi.favorites.useAddToFavorites();
      const removeFromFavorites = useMediaApi.favorites.useRemoveFromFavorites();

      return useMutation({
        mutationFn: async ({ mediaId, isFavorited, favoriteId, ...data }: {
          mediaId: string;
          isFavorited: boolean;
          favoriteId?: string;
          type: 'movie' | 'tvshow' | 'episode';
          title: string;
          description?: string;
          thumbnailUrl?: string;
          videoUrl?: string;
          platform?: string;
          accountId?: string;
          metadata?: Record<string, any>;
        }) => {
          if (isFavorited && favoriteId) {
            return await removeFromFavorites.mutateAsync(favoriteId);
          } else {
            return await addToFavorites.mutateAsync({ mediaId, ...data });
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['favorites-all'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-stats'] });
          queryClient.invalidateQueries({ queryKey: ['favorites-recent'] });
        },
      });
    },
  },
};
