// src/utils/api.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/environment';

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

// Type definitions for AllBibles API
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

interface AllBibleEdit {
  id: string;
  languageCode: string;
  sourceCode: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  currentText: string;
  suggestedText: string;
  reason?: string;
  references?: string[];
  editType?: 'text_correction' | 'translation_improvement' | 'grammar_fix' | 'typo_correction' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  proposerId: string;
  state: 'draft' | 'review1' | 'review2' | 'approved' | 'rejected';
  reviewerId?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  reference: string;
  languageSource: string;
}

interface AllBibleChangeLink {
  languageCode: string;
  sourceCode: string;
  text: string;
  confidence: number;
}

interface AllBibleParallelText {
  language: string;
  text?: any;
  success: boolean;
  error?: string;
  metadata?: {
    code3: string;
    name: string;
  };
}

interface AllBibleChangedVerse {
  reference: string;
  bookNumber: number;
  kjvText: string;
  changeSummary: string;
  affectedDoctrine: string;
  analysis: string;
  batchData: {
    Batch: number;
    Error: string;
    Danger: string;
    Evidence: string;
    Explanation: string;
    Current: string;
    Suggestion: string;
  };
  translations: Array<{
    language: string;
    current: string;
    suggestion: string;
  }>;
}

interface AllBibleTranslation {
  language: string;
  current: string;
  suggestion: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  updatedBy: string;
  updatedAt: string;
}

interface AllBibleHealthStatus {
  success: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  responseTime: string;
  database: {
    status: string;
    ping: string | { success: boolean; responseTime: string };
    collections: Record<string, number | any>;
    connectionState?: number;
  };
  cache?: {
    type: string;
    keys?: number;
    status?: string;
    stats?: Record<string, any>;
    operations?: Record<string, boolean>;
  };
  uptime?: number;
  memory?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  indexes?: {
    status: string;
    indexes: Record<string, any[]>;
  };
  performance?: {
    last24Hours: Record<string, number>;
    editStates: Record<string, number>;
    topLanguages: Array<{ _id: string; count: number }>;
  };
}






// Type definitions for Favorites API





// Canonical book codes mapping (ISO 15924 compliant)
export const CANONICAL_BOOK_CODES: { [key: string]: string } = {
  // Old Testament
  'genesis': 'GEN', 'itanguriro': 'GEN',
  'exodus': 'EXO', 'kuvako': 'EXO',
  'leviticus': 'LEV', 'levitiko': 'LEV',
  'numbers': 'NUM', 'gutebutsa': 'NUM',
  'deuteronomy': 'DEU', 'gusubira': 'DEU',
  'joshua': 'JOS', 'yosuwa': 'JOS',
  'judges': 'JDG', 'abacamanza': 'JDG',
  'ruth': 'RUT', 'ruti': 'RUT',
  '1-samuel': '1SA', '1-samweli': '1SA',
  '2-samuel': '2SA', '2-samweli': '2SA',
  '1-kings': '1KI', '1-ntare': '1KI',
  '2-kings': '2KI', '2-ntare': '2KI',
  '1-chronicles': '1CH', '1-nyakanga': '1CH',
  '2-chronicles': '2CH', '2-nyakanga': '2CH',
  'ezra': 'EZR', 'ezira': 'EZR',
  'nehemiah': 'NEH', 'neyemiya': 'NEH',
  'esther': 'EST', 'esteri': 'EST',
  'job': 'JOB', 'iyobu': 'JOB',
  'psalms': 'PSA', 'inzobere': 'PSA',
  'proverbs': 'PRO', 'imigani': 'PRO',
  'ecclesiastes': 'ECC', 'umusiguzi': 'ECC',
  'song-of-solomon': 'SNG', 'indirimbo': 'SNG',
  'isaiah': 'ISA', 'yesaya': 'ISA',
  'jeremiah': 'JER', 'yeremiya': 'JER',
  'lamentations': 'LAM', 'indirimbo-za-yeremiya': 'LAM',
  'ezekiel': 'EZK', 'hezekeli': 'EZK',
  'daniel': 'DAN', 'daniyeli': 'DAN',
  'hosea': 'HOS', 'hoseya': 'HOS',
  'joel': 'JOL', 'yoeli': 'JOL',
  'amos': 'AMO', 'amosi': 'AMO',
  'obadiah': 'OBA', 'obadiya': 'OBA',
  'jonah': 'JON', 'yona': 'JON',
  'micah': 'MIC', 'mika': 'MIC',
  'nahum': 'NAH', 'nahumu': 'NAH',
  'habakkuk': 'HAB', 'habakuku': 'HAB',
  'zephaniah': 'ZEP', 'sefaniya': 'ZEP',
  'haggai': 'HAG', 'hagayi': 'HAG',
  'zechariah': 'ZEC', 'zakariya': 'ZEC',
  'malachi': 'MAL', 'malaki': 'MAL',
  // New Testament
  'matthew': 'MAT', 'matayo': 'MAT',
  'mark': 'MRK', 'mariko': 'MRK',
  'luke': 'LUK', 'luka': 'LUK',
  'john': 'JHN', 'yohana': 'JHN',
  'acts': 'ACT', 'ibikorwa': 'ACT',
  'romans': 'ROM', 'abaroma': 'ROM',
  '1-corinthians': '1CO', '1-korinto': '1CO',
  '2-corinthians': '2CO', '2-korinto': '2CO',
  'galatians': 'GAL', 'abagalatia': 'GAL',
  'ephesians': 'EPH', 'abefeso': 'EPH',
  'philippians': 'PHP', 'abafilipi': 'PHP',
  'colossians': 'COL', 'abakolosayi': 'COL',
  '1-thessalonians': '1TH', '1-tesalonika': '1TH',
  '2-thessalonians': '2TH', '2-tesalonika': '2TH',
  '1-timothy': '1TI', '1-timoteo': '1TI',
  '2-timothy': '2TI', '2-timoteo': '2TI',
  'titus': 'TIT', 'tito': 'TIT',
  'philemon': 'PHM', 'filemoni': 'PHM',
  'hebrews': 'HEB', 'abaheburayo': 'HEB',
  'james': 'JAS', 'yako': 'JAS',
  '1-peter': '1PE', '1-petero': '1PE',
  '2-peter': '2PE', '2-petero': '2PE',
  '1-john': '1JN', '1-yohana': '1JN',
  '2-john': '2JN', '2-yohana': '2JN',
  '3-john': '3JN', '3-yohana': '3JN',
  'jude': 'JUD', 'yuda': 'JUD',
  'revelation': 'REV', 'izaburi': 'REV'
};

// Helper function to get canonical book code from slug
export const getCanonicalBookCode = (bookSlug: string): string => {
  return CANONICAL_BOOK_CODES[bookSlug.toLowerCase()] || bookSlug.toUpperCase();
};

// Helper function to format reference in canonical format
export const formatCanonicalReference = (bookCode: string, chapter: number, verse?: number): string => {
  return verse ? `${bookCode} ${chapter}:${verse}` : `${bookCode} ${chapter}`;
};

// Helper function to format reference in numeric format
export const formatNumericReference = (bookNumber: number, chapter: number, verse?: number): string => {
  return verse ? `${bookNumber}:${chapter}:${verse}` : `${bookNumber}:${chapter}`;
};

// AllBibles Helper Functions
export const AllBiblesHelpers = {
  // Format reference for AllBibles API
  formatReference: (bookNumber: number, chapter: number, verse?: number): string => {
    return verse ? `${bookNumber}:${chapter}:${verse}` : `${bookNumber}:${chapter}`;
  },

  // Parse reference from string format
  parseReference: (reference: string): { bookNumber: number; chapter: number; verse?: number } => {
    const parts = reference.split(':');
    if (parts.length < 2) {
      throw new Error('Invalid reference format. Expected "bookNumber:chapter" or "bookNumber:chapter:verse"');
    }
    
    const bookNumber = parseInt(parts[0]);
    const chapter = parseInt(parts[1]);
    const verse = parts[2] ? parseInt(parts[2]) : undefined;
    
    if (isNaN(bookNumber) || isNaN(chapter) || (verse !== undefined && isNaN(verse))) {
      throw new Error('Invalid reference format. All parts must be numbers.');
    }
    
    return { bookNumber, chapter, verse };
  },

  // Validate language code (2 or 3 letters)
  validateLanguageCode: (code: string): boolean => {
    return /^[a-z]{2,3}$/i.test(code);
  },

  // Validate source code
  validateSourceCode: (code: string): boolean => {
    return /^[a-z0-9]{2,10}$/i.test(code);
  },

  // Validate book number (1-66)
  validateBookNumber: (bookNumber: number): boolean => {
    return bookNumber >= 1 && bookNumber <= 66;
  },

  // Get book name from number
  getBookName: (bookNumber: number): string => {
    const bookNames: { [key: number]: string } = {
      1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
      6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
      11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
      16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
      21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
      26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
      31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
      36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi', 40: 'Matthew',
      41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts', 45: 'Romans',
      46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians', 50: 'Philippians',
      51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
      56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter',
      61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude', 66: 'Revelation'
    };
    return bookNames[bookNumber] || `Book ${bookNumber}`;
  },

  // Check if AllBibles API is enabled
  isEnabled: (): boolean => {
    return API_CONFIG.ALL_BIBLES_ENABLED;
  },

  // Get cache TTL
  getCacheTTL: (): number => {
    return API_CONFIG.ALL_BIBLES_CACHE_TTL;
  },

  // Get max parallel languages
  getMaxParallelLanguages: (): number => {
    return API_CONFIG.ALL_BIBLES_MAX_PARALLEL_LANGUAGES;
  },

  // Format edit type for display
  formatEditType: (editType: string): string => {
    const typeMap: { [key: string]: string } = {
      'text_correction': 'Text Correction',
      'translation_improvement': 'Translation Improvement',
      'grammar_fix': 'Grammar Fix',
      'typo_correction': 'Typo Correction',
      'other': 'Other'
    };
    return typeMap[editType] || editType;
  },

  // Format priority for display
  formatPriority: (priority: string): string => {
    const priorityMap: { [key: string]: string } = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical'
    };
    return priorityMap[priority] || priority;
  },

  // Format edit state for display
  formatEditState: (state: string): string => {
    const stateMap: { [key: string]: string } = {
      'draft': 'Draft',
      'review1': 'First Review',
      'review2': 'Second Review',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return stateMap[state] || state;
  },

  // Get edit state color for UI
  getEditStateColor: (state: string): string => {
    const colorMap: { [key: string]: string } = {
      'draft': 'gray',
      'review1': 'yellow',
      'review2': 'orange',
      'approved': 'green',
      'rejected': 'red'
    };
    return colorMap[state] || 'gray';
  },

  // Calculate word count from text
  calculateWordCount: (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  // Truncate text for display
  truncateText: (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Format timestamp for display
  formatTimestamp: (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime: (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }
};

// Environment configuration
const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  API_KEY: import.meta.env.VITE_INTERNAL_API_KEY,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  // AllBibles specific configuration
  ALL_BIBLES_ENABLED: ENV.ALLBIBLES_ENABLE_PARALLEL, // Use environment config
  ALL_BIBLES_CACHE_TTL: parseInt(import.meta.env.VITE_ALL_BIBLES_CACHE_TTL || '300'), // 5 minutes default
  ALL_BIBLES_MAX_PARALLEL_LANGUAGES: parseInt(import.meta.env.VITE_ALL_BIBLES_MAX_PARALLEL_LANGUAGES || '10'),
};

// Validate required environment variables
if (!API_CONFIG.API_KEY) {
  console.error("Missing VITE_INTERNAL_API_KEY in .env file.");
}

// Create axios instance with default configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    },
  });

  return instance;
};

// Request interceptor to add authentication and logging
const setupRequestInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request for debugging (only in development)
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        
        // Log stack trace for undefined movie calls to help debug
        if (config.url?.includes('/media/movies/undefined')) {
          console.error('🔍 UNDEFINED MOVIE ID DETECTED! Stack trace:', new Error().stack);
        }
      }

      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );
};

// Response interceptor for error handling and token refresh
const setupResponseInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses (only in development)
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized errors with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Attempt to refresh the token
          const refreshResponse = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh-token`,
            { refreshToken },
            { 
              headers: { 'x-api-key': API_CONFIG.API_KEY },
              timeout: API_CONFIG.TIMEOUT 
            }
          );

          const { accessToken } = refreshResponse.data.tokens;
          localStorage.setItem('authToken', accessToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      console.error('❌ Response Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });

      return Promise.reject(error);
    }
  );
};

// Create and configure the main API instance
const api = createApiInstance();
setupRequestInterceptor(api);
setupResponseInterceptor(api);

// API service class for better organization and type safety
class ApiService {
  private static instance: AxiosInstance = api;

  // Generic GET request
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Health check method
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.instance.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Media API methods
  static media = {
    // General media endpoints
    getEpisodeContext: (episodeId: string) => 
      ApiService.get(`/media/episode/${episodeId}/context`),
    
    assignGenresToAllMedia: () => 
      ApiService.post('/media/genres/assign'),

    // Movie endpoints
    movies: {
      getAll: (params?: {
        limit?: number;
        page?: number;
        skip?: number;
        genre?: string;
        language?: string;
        isFree?: boolean;
        isFeatured?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        search?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/movies?${queryParams.toString()}`);
      },

      getById: (id: string) => 
        ApiService.get(`/media/movies/${id}`),

      create: (movieData: any) => 
        ApiService.post('/media/movies', movieData),

      update: (id: string, movieData: any) => 
        ApiService.put(`/media/movies/${id}`, movieData),

      delete: (id: string) => 
        ApiService.delete(`/media/movies/${id}`),

          // Hero content
    getHeroContent: () => 
      ApiService.get('/media/movies/hero-content'),

    getRandomHeroContent: () => 
      ApiService.get('/media/movies/hero-content/random'),

    // Featured content
    getFeatured: (params?: {
      limit?: number;
      genre?: string;
      language?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, value.toString());
        });
      }
      return ApiService.get(`/media/movies?${queryParams.toString()}&isFeatured=true`);
    },

      // getTrending endpoint is not implemented in backend yet
      // Use getAll with sortBy: 'views' instead
      getTrending: (limit?: number, _days?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        params.append('sortBy', 'views');
        params.append('sortOrder', 'desc');
        return ApiService.get(`/media/movies?${params.toString()}`);
      },

      // getSimilar endpoint is not implemented in backend yet
      // Use getAll with genre filtering instead
      getSimilar: (_movieId: string, limit?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        // For now, return empty array since similar movies logic is not implemented
        return Promise.resolve({ movies: [], total: 0 });
      },

      // Social features
      toggleLike: (movieId: string) => 
        ApiService.post(`/media/movies/${movieId}/like`),

      toggleFavorite: (movieId: string) => 
        ApiService.post(`/media/movies/${movieId}/favorite`),

      rateMovie: (movieId: string, rating: number) => 
        ApiService.post(`/media/movies/${movieId}/rate`, { rating }),

      // Analytics
      trackView: (movieId: string) => 
        ApiService.post(`/media/movies/${movieId}/view`),

      getAnalytics: (movieId: string) => 
        ApiService.get(`/media/movies/${movieId}/analytics`),

      // Payment and transactions
      createCheckout: (movieId: string, checkoutData: any) => 
        ApiService.post(`/media/movies/${movieId}/checkout`, checkoutData),

      handlePaymentSuccess: (sessionId: string) => 
        ApiService.post(`/media/movies/payment/success/${sessionId}`),

      getUserTransactions: () => 
        ApiService.get('/media/movies/transactions/user'),

      getCreatorTransactions: () => 
        ApiService.get('/media/movies/transactions/creator'),

      getTransactionStats: (movieId: string) => 
        ApiService.get(`/media/movies/${movieId}/transactions/stats`),

      // Creator dashboard
      getCreatorDashboard: () => 
        ApiService.get('/media/movies/dashboard/creator'),

      getContentManagement: () => 
        ApiService.get('/media/movies/dashboard/content'),
    },

    // TV Shows endpoints
    tvshows: {
      getAll: (params?: {
        limit?: number;
        page?: number;
        skip?: number;
        genre?: string;
        language?: string;
        isFree?: boolean;
        isFeatured?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        search?: string;
        status?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/tvshows?${queryParams.toString()}`);
      },

      getById: (id: string) => 
        ApiService.get(`/media/tvshows/${id}`),

      create: (tvShowData: any) => 
        ApiService.post('/media/tvshows', tvShowData),

      update: (id: string, tvShowData: any) => 
        ApiService.put(`/media/tvshows/${id}`, tvShowData),

      delete: (id: string) => 
        ApiService.delete(`/media/tvshows/${id}`),

      // Discovery routes
      // getTrending endpoint returns 500 error - use getAll with sorting instead
      getTrending: (limit?: number, _days?: number) => { // _days parameter renamed to suppress unused warning
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        params.append('sortBy', 'views');
        params.append('sortOrder', 'desc');
        return ApiService.get(`/media/tvshows?${params.toString()}`);
      },

      // Featured content
      getFeatured: (params?: {
        limit?: number;
        genre?: string;
        language?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        queryParams.append('isFeatured', 'true');
        return ApiService.get(`/media/tvshows?${queryParams.toString()}`);
      },

      getRecent: (limit?: number, days?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (days) params.append('days', days.toString());
        return ApiService.get(`/media/tvshows/recent?${params.toString()}`);
      },

      getTopRated: (limit?: number, minRatings?: number, genre?: string, language?: string) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (minRatings) params.append('minRatings', minRatings.toString());
        if (genre) params.append('genre', genre);
        if (language) params.append('language', language);
        return ApiService.get(`/media/tvshows/top-rated?${params.toString()}`);
      },

      getByGenre: (genre: string, params?: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        minRating?: number;
        language?: string;
        status?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/tvshows/discover/genre/${genre}?${queryParams.toString()}`);
      },

      // getSimilar endpoint might not be implemented in backend yet
      getSimilar: (_id: string, limit?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        // For now, return empty array since similar TV shows logic might not be implemented
        return Promise.resolve({ tvshows: [], total: 0 });
      },

      getByCategory: (category: string, limit?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        return ApiService.get(`/media/tvshows/category/${category}?${params.toString()}`);
      },

      getRecommendations: (limit?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        return ApiService.get(`/media/tvshows/recommendations?${params.toString()}`);
      },

      // Search routes
      search: (query: string, params?: {
        limit?: number;
        page?: number;
        genre?: string;
        language?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        const queryParams = new URLSearchParams({ q: query });
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/tvshows/search?${queryParams.toString()}`);
      },

      advancedSearch: (searchCriteria: any, limit?: number, page?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (page) params.append('page', page.toString());
        return ApiService.post(`/media/tvshows/search/advanced?${params.toString()}`, searchCriteria);
      },

      getSearchSuggestions: (query: string, limit?: number) => {
        const params = new URLSearchParams({ q: query });
        if (limit) params.append('limit', limit.toString());
        return ApiService.get(`/media/tvshows/search/suggestions?${params.toString()}`);
      },

      getPopularSearchTerms: (limit?: number, days?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (days) params.append('days', days.toString());
        return ApiService.get(`/media/tvshows/search/popular?${params.toString()}`);
      },

      // Access routes
      checkAccess: (tvShowId: string) => 
        ApiService.get(`/media/tvshows/${tvShowId}/access`),

      checkBulkAccess: (tvShowIds: string[]) => 
        ApiService.post('/media/tvshows/access/bulk', { tvShowIds }),

      getUserAccessible: (params?: {
        limit?: number;
        page?: number;
        genre?: string;
        language?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/tvshows/user/accessible?${queryParams.toString()}`);
      },

      getPurchaseOptions: (tvShowId: string) => 
        ApiService.get(`/media/tvshows/${tvShowId}/purchase-options`),
    },

    // Episodes endpoints
    episodes: {
      getAll: (params?: {
        limit?: number;
        page?: number;
        skip?: number;
        tvShowId?: string;
        seasonNumber?: number;
        approvalStatus?: string;
        genre?: string;
        isFree?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/episodes?${queryParams.toString()}`);
      },

      getById: (id: string) => 
        ApiService.get(`/media/episodes/${id}`),

      create: (episodeData: any) => 
        ApiService.post('/media/episodes', episodeData),

      update: (id: string, episodeData: any) => 
        ApiService.put(`/media/episodes/${id}`, episodeData),

      delete: (id: string) => 
        ApiService.delete(`/media/episodes/${id}`),

      // Discovery routes
      getTrending: (params?: {
        limit?: number;
        days?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/episodes/trending?${queryParams.toString()}`);
      },

      getFeatured: (params?: {
        limit?: number;
        genre?: string;
        language?: string;
        tvShowId?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/episodes/featured?${queryParams.toString()}`);
      },

      getByTVShow: (tvShowId: string, params?: {
        seasonNumber?: number;
        limit?: number;
        page?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/episodes/tvshow/${tvShowId}?${queryParams.toString()}`);
      },

      search: (query: string, params?: {
        limit?: number;
        page?: number;
        tvShowId?: string;
        seasonNumber?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/episodes/search/${query}?${queryParams.toString()}`);
      },

      getByGenre: (genre: string, params?: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/episodes/genre/${genre}?${queryParams.toString()}`);
      },

      getSimilar: (id: string, params?: {
        limit?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/episodes/similar/${id}?${queryParams.toString()}`);
      },

      checkAccess: (episodeId: string) => 
        ApiService.get(`/media/episodes/${episodeId}/access`),

      // Social features
      toggleLike: (episodeId: string) => 
        ApiService.post(`/media/episodes/${episodeId}/like`),

      toggleFavorite: (episodeId: string) => 
        ApiService.post(`/media/episodes/${episodeId}/favorite`),

      rateEpisode: (episodeId: string, rating: number) => 
        ApiService.post(`/media/episodes/${episodeId}/rate`, { rating }),

      // Analytics
      trackView: (episodeId: string) => 
        ApiService.post(`/media/episodes/${episodeId}/view`),

      getAnalytics: (episodeId: string) => 
        ApiService.get(`/media/episodes/${episodeId}/analytics`),

      // Payment and transactions
      createCheckout: (episodeId: string, checkoutData: any) => 
        ApiService.post(`/media/episodes/${episodeId}/checkout`, checkoutData),

      handlePaymentSuccess: (sessionId: string) => 
        ApiService.post(`/media/episodes/payment/success/${sessionId}`),

      getTransactionStats: (episodeId: string) => 
        ApiService.get(`/media/episodes/${episodeId}/transactions/stats`),

      // Creator dashboard
      getCreatorDashboard: () => 
        ApiService.get('/media/episodes/dashboard/creator'),

      getContentManagement: () => 
        ApiService.get('/media/episodes/dashboard/content'),
    },

    // Genres endpoints
    genres: {
      getAll: () => 
        ApiService.get('/media/genres'),

      getByType: (mediaType: string) => 
        ApiService.get(`/media/genres/type/${mediaType}`),

      getMediaByGenre: (genre: string) => 
        ApiService.get(`/media/genres/${genre}`),

      getMediaByGenreAndType: (genre: string, mediaType: string) => 
        ApiService.get(`/media/genres/${genre}/type/${mediaType}`),

      addToMedia: (genreData: any) => 
        ApiService.post('/media/genres/add', genreData),

      updateOnMedia: (mediaType: string, id: string, genreData: any) => 
        ApiService.put(`/media/genres/${mediaType}/${id}`, genreData),

      deleteFromMedia: (mediaType: string, id: string, genreData: any) => 
        ApiService.delete(`/media/genres/${mediaType}/${id}`, { data: genreData }),

      assignToAllMedia: () => 
        ApiService.patch('/media/genres/assign'),
    },

    // Hero content endpoints
    hero: {
      getContent: () => 
        ApiService.get('/media/hero'),

      getRandomContent: () => 
        ApiService.get('/media/hero/random'),
    },

    // Content injection endpoints
    injection: {
      injectMovieFromYouTube: (youtubeData: any) => 
        ApiService.post('/media/injection/movie', youtubeData),

      injectTVShowFromYouTube: (youtubeData: any) => 
        ApiService.post('/media/injection/tvshow', youtubeData),
    },

    // Upload endpoints
    upload: {
      // Direct uploads
      uploadPoster: (file: File) => {
        const formData = new FormData();
        formData.append('posterFile', file);
        return ApiService.post('/media/upload/poster', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      uploadActorProfile: (file: File) => {
        const formData = new FormData();
        formData.append('profileFile', file);
        return ApiService.post('/media/upload/actor-profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      uploadCompanyLogo: (file: File) => {
        const formData = new FormData();
        formData.append('profileFile', file);
        return ApiService.post('/media/upload/company-logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      uploadUserProfile: (file: File) => {
        const formData = new FormData();
        formData.append('profileFile', file);
        return ApiService.post('/media/upload/user-profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      uploadAccountAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatarFile', file);
        return ApiService.post('/media/upload/account-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      uploadTrailer: (file: File) => {
        const formData = new FormData();
        formData.append('trailerFile', file);
        return ApiService.post('/media/upload/trailer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      uploadVideo: (file: File) => {
        const formData = new FormData();
        formData.append('movieFile', file);
        return ApiService.post('/media/upload/video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      // Presigned uploads
      generatePresignedURL: (uploadData: any) => 
        ApiService.post('/media/upload/presign', uploadData),

      finalizeUpload: (finalizeData: any) => 
        ApiService.post('/media/upload/finalize', finalizeData),

      processUploadedVideo: (processData: any) => 
        ApiService.post('/media/upload/process', processData),

      // File management
      deleteUploadedFile: (type: string, fileType: string, id: string) => 
        ApiService.delete(`/media/upload/${type}/${fileType}/${id}`),

      getUploadStatus: (type: string, id: string) => 
        ApiService.get(`/media/upload/${type}/${id}/status`),
    },

    // Progress tracking endpoints
    progress: {
      saveProgress: (progressData: any) => 
        ApiService.post('/media/progress', progressData),

      getProgress: (contentId: string) => 
        ApiService.get(`/media/progress/${contentId}`),

      getAllProgress: (params?: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/progress?${queryParams.toString()}`);
      },

      deleteProgress: (contentId: string) => 
        ApiService.delete(`/media/progress/${contentId}`),

      deleteAllProgress: () => 
        ApiService.delete('/media/progress'),

      getContinueWatching: (params?: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/progress/continue-watching?${queryParams.toString()}`);
      },

      getRecentlyCompleted: (params?: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/progress/completed?${queryParams.toString()}`);
      },

      getSeriesProgress: (seriesId: string) => 
        ApiService.get(`/media/progress/series/${seriesId}`),

      getWatchStats: () => 
        ApiService.get('/media/progress/stats'),

      markAsWatched: (contentId: string, watchedData: any) => 
        ApiService.post(`/media/progress/${contentId}/mark-watched`, watchedData),

      bulkUpdateProgress: (bulkData: any) => 
        ApiService.post('/media/progress/bulk-update', bulkData),

      healthCheck: () => 
        ApiService.get('/media/progress/health'),
    },

    // Reviews endpoints
    reviews: {
      // Public routes
      getEntityReviews: (entityType: string, id: string, params?: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        rating?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/${entityType}/${id}/reviews?${queryParams.toString()}`);
      },

      getEntityReviewStats: (entityType: string, id: string) => 
        ApiService.get(`/media/${entityType}/${id}/reviews/stats`),

      // Authenticated routes
      createOrUpdateReview: (reviewData: any) => 
        ApiService.post('/media/reviews', reviewData),

      getMyReviews: (params?: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        return ApiService.get(`/media/reviews/mine?${queryParams.toString()}`);
      },

      // Admin routes
      publishReview: (reviewId: string) => 
        ApiService.patch(`/media/admin/reviews/${reviewId}/publish`),

      hideReview: (reviewId: string) => 
        ApiService.patch(`/media/admin/reviews/${reviewId}/hide`),

      deleteReview: (reviewId: string) => 
        ApiService.delete(`/media/admin/reviews/${reviewId}`),
    },
  };

  // Bible API methods (Legacy - maintained for backward compatibility)
  static bible = {
    // Basic reading operations
    getBooks: (lang: string = 'en') => 
      ApiService.get<{ success: boolean; lang: string; books: Book[] }>(`/bible/books?lang=${lang}`),
    
    getChapter: (bookSlug: string, chapter: number, lang: string = 'en') => 
      ApiService.get<Chapter>(`/bible/chapters/${bookSlug}/${chapter}?lang=${lang}`),
    
    getVerse: (bookSlug: string, chapter: number, verse: number, lang: string = 'en') => 
      ApiService.get(`/bible/verses/${bookSlug}/${chapter}/${verse}?lang=${lang}`),
    
    search: (query: string, lang: string = 'en') => 
      ApiService.get<{ success: boolean; lang: string; query: string; results: SearchResult[] }>(`/bible/search?q=${encodeURIComponent(query)}&lang=${lang}`),

    // Numeric canonical operations
    getVerseByNumber: (lang: string, bookNumber: number, chapter: number, verse: number) =>
      ApiService.get(`/bible/num/verse/${lang}/${bookNumber}/${chapter}/${verse}`),
    
    getChapterByNumber: (lang: string, bookNumber: number, chapter: number) =>
      ApiService.get(`/bible/num/chapter/${lang}/${bookNumber}/${chapter}`),
    
    getParallelText: (bookNumber: number, chapter: number, verse: number, baseLang: string, parallelLang: string) =>
      ApiService.get(`/bible/xlang/num/parallel/${bookNumber}/${chapter}/${verse}?baseLang=${baseLang}&parallelLang=${parallelLang}`),

    // Unified Cross-Language API (Recommended)
    // Query-based reference endpoints
    getVerseByReference: (reference: string, lang: string = 'en', targetLang?: string) => {
      const params = new URLSearchParams({ reference, lang });
      if (targetLang) params.append('targetLang', targetLang);
      return ApiService.get(`/bible/ref/verse?${params.toString()}`);
    },

    getChapterByReference: (reference: string, lang: string = 'en', targetLang?: string) => {
      const params = new URLSearchParams({ reference, lang });
      if (targetLang) params.append('targetLang', targetLang);
      return ApiService.get(`/bible/ref/chapter?${params.toString()}`);
    },

    getVerseRange: (reference: string, range: number, sourceLang: string = 'en', targetLangs?: string[]) => {
      const params = new URLSearchParams({ reference, range: range.toString(), sourceLang });
      if (targetLangs) params.append('targetLangs', targetLangs.join(','));
      return ApiService.get(`/bible/ref/range?${params.toString()}`);
    },

    getAvailableLanguages: (reference: string) =>
      ApiService.get(`/bible/ref/languages?reference=${encodeURIComponent(reference)}`),

    // RESTful path-based endpoints
    getBookInfo: (bookCode: string, lang?: string) => {
      const params = lang ? `?lang=${lang}` : '';
      return ApiService.get(`/bible/ref/book/${bookCode}${params}`);
    },

    getVerseByCanonical: (bookCode: string, chapter: number, verse: number, lang: string = 'en', targetLang?: string) => {
      const params = new URLSearchParams({ lang });
      if (targetLang) params.append('targetLang', targetLang);
      return ApiService.get(`/bible/ref/${bookCode}/${chapter}/${verse}?${params.toString()}`);
    },

    getChapterByCanonical: (bookCode: string, chapter: number, lang: string = 'en', targetLang?: string) => {
      const params = new URLSearchParams({ lang });
      if (targetLang) params.append('targetLang', targetLang);
      return ApiService.get(`/bible/ref/${bookCode}/${chapter}?${params.toString()}`);
    },

    // Cross-language search
    crossLanguageSearch: (query: string, sourceLang: string = 'en', targetLangs?: string[], limit: number = 20) => {
      const params = new URLSearchParams({ 
        query, 
        sourceLang, 
        limit: limit.toString() 
      });
      if (targetLangs) params.append('targetLangs', targetLangs.join(','));
      return ApiService.get(`/bible/search/cross?${params.toString()}`);
    },
  };

  // AllBibles API methods (Production-grade Bible API system)
  static allBibles = {
    // Language Management
    languages: {
      getAll: () => 
        ApiService.get<{ success: boolean; count: number; languages: AllBibleLanguage[] }>('/all-bibles/languages'),
    },

    // Source Management
    sources: {
      getByLanguage: (langCode: string) => 
        ApiService.get<{ success: boolean; languageCode: string; count: number; sources: AllBibleSource[] }>(`/all-bibles/${langCode}/sources`),
    },

    // Book Management
    books: {
      getAll: (langCode: string, sourceCode: string) => 
        ApiService.get<{ success: boolean; languageCode: string; sourceCode: string; count: number; books: AllBibleBook[] }>(`/all-bibles/${langCode}/${sourceCode}/books`),
      
      getById: (langCode: string, sourceCode: string, bookNumber: number) => 
        ApiService.get<{ success: boolean; languageCode: string; sourceCode: string; book: AllBibleBook }>(`/all-bibles/${langCode}/${sourceCode}/books/${bookNumber}`),
    },

    // Text Retrieval
    text: {
      getSpecific: (langCode: string, sourceCode: string, params: {
        bookNumber?: number;
        chapter?: number;
        verse?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params.bookNumber) queryParams.append('bookNumber', params.bookNumber.toString());
        if (params.chapter) queryParams.append('chapter', params.chapter.toString());
        if (params.verse) queryParams.append('verse', params.verse.toString());
        return ApiService.get<{ 
          success: boolean; 
          languageCode: string; 
          sourceCode: string; 
          bookNumber?: number; 
          chapter?: number; 
          verse?: number; 
          count: number; 
          texts: AllBibleText[];
          changeLinks?: {
            exists: boolean;
            reference: string;
            variants: AllBibleChangeLink[];
          };
        }>(`/all-bibles/${langCode}/${sourceCode}/text?${queryParams.toString()}`);
      },

      getAll: (langCode: string, sourceCode: string, params?: {
        limit?: number;
        offset?: number;
        bookNumber?: number;
        chapter?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.bookNumber) queryParams.append('bookNumber', params.bookNumber.toString());
        if (params?.chapter) queryParams.append('chapter', params.chapter.toString());
        return ApiService.get<{ 
          success: boolean; 
          languageCode: string; 
          sourceCode: string; 
          count: number; 
          totalCount: number; 
          offset: number; 
          limit: number; 
          filters: { bookNumber: number | null; chapter: number | null }; 
          texts: AllBibleText[] 
        }>(`/all-bibles/${langCode}/${sourceCode}/all-text?${queryParams.toString()}`);
      },
    },

    // Statistics
    stats: {
      getByLanguageSource: (langCode: string, sourceCode: string) => 
        ApiService.get<{ success: boolean; languageCode: string; sourceCode: string; stats: { totalBooks: number; totalChapters: number; totalVerses: number; totalWords: number } }>(`/all-bibles/${langCode}/${sourceCode}/stats`),
    },

    // Search Functionality
    search: {
      // Language/Source specific search
      byLanguageSource: (langCode: string, sourceCode: string, query: string, params?: {
        limit?: number;
        offset?: number;
      }) => {
        const queryParams = new URLSearchParams({ q: query });
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        return ApiService.get<{ 
          success: boolean; 
          languageCode: string; 
          sourceCode: string; 
          query: string; 
          count: number; 
          results: Array<{
            bookNumber: number;
            chapter: number;
            verse: number;
            text: string;
            wordCount: number;
          }>;
        }>(`/all-bibles/${langCode}/${sourceCode}/search?${queryParams.toString()}`);
      },

      // Global cross-language search
      global: (query: string, params?: {
        limit?: number;
        offset?: number;
        language?: string;
        source?: string;
        bookNumber?: number;
        chapter?: number;
        includeMetadata?: boolean;
      }) => {
        const queryParams = new URLSearchParams({ q: query });
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.language) queryParams.append('language', params.language);
        if (params?.source) queryParams.append('source', params.source);
        if (params?.bookNumber) queryParams.append('bookNumber', params.bookNumber.toString());
        if (params?.chapter) queryParams.append('chapter', params.chapter.toString());
        if (params?.includeMetadata !== undefined) queryParams.append('includeMetadata', params.includeMetadata.toString());
        return ApiService.get<{ 
          success: boolean; 
          query: string; 
          count: number; 
          totalCount: number; 
          offset: number; 
          limit: number; 
          filters: { 
            language: string | null; 
            source: string | null; 
            bookNumber: number | null; 
            chapter: number | null; 
          }; 
          metadata?: {
            languages: Record<string, { code3: string; name: string }>;
            sources: Record<string, { name: string; notes: string }>;
          };
          results: Array<{
            bookNumber: number;
            chapter: number;
            verse: number;
            text: string;
            wordCount: number;
            language: { code3: string; name: string };
            source: { code: string; name: string; notes: string };
            changed: { exists: boolean };
          }>;
        }>(`/all-bibles/global/search?${queryParams.toString()}`);
      },
    },

    // Parallel Text
    parallel: {
      // Two-language parallel text
      getTwoLanguage: (bookNumber: number, chapter: number, verse: number, baseLang: string, parallelLang: string) => 
        ApiService.get<{ 
          success: boolean; 
          reference: string; 
          baseText: { language: string; text: string }; 
          parallelText: { language: string; text: string }; 
        }>(`/all-bibles/parallel/${bookNumber}/${chapter}/${verse}?baseLang=${baseLang}&parallelLang=${parallelLang}`),

      // Multiple language parallel text (2-10 languages)
      getMultiple: (bookNumber: number, chapter: number, verse: number, baseLang: string, parallelLangs: string[]) => {
        if (parallelLangs.length < 2 || parallelLangs.length > 10) {
          throw new Error('Parallel languages must be between 2 and 10');
        }
        const queryParams = new URLSearchParams({ 
          baseLang, 
          parallelLangs: parallelLangs.join(',') 
        });
        return ApiService.get<{ 
          success: boolean; 
          bookNumber: number; 
          chapter: number; 
          verse: number; 
          base: { 
            language: string; 
            text?: any; 
            success: boolean;
            error?: string;
            metadata?: { code3: string; name: string }; 
          }; 
          parallels: AllBibleParallelText[]; 
          summary: { 
            totalLanguages: number; 
            successfulBase: number;
            successfulParallels: number; 
            failedBase: number;
            failedParallels: number; 
            totalSuccessful: number;
            totalFailed: number;
          }; 
        }>(`/all-bibles/multiple-parallel/${bookNumber}/${chapter}/${verse}?${queryParams.toString()}`);
      },
    },

    // Change Links
    changeLinks: {
      getByReference: (bookNumber: number, chapter: number, verse: number) => 
        ApiService.get<{ 
          success: boolean; 
          reference: string; 
          exists: boolean; 
          variants: AllBibleChangeLink[]; 
        }>(`/all-bibles/links/${bookNumber}/${chapter}/${verse}`),
    },
  };

  // AllBibles Edit Workflow (Production-grade edit system)
  static allBibleEdits = {
    // Submit Edit
    submit: (data: {
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
    }) => 
      ApiService.post<{ 
        success: boolean; 
        message: string; 
        edit: AllBibleEdit; 
      }>('/all-bibles/edits', data),

    // Submit Edit with Numeric Reference
    submitNumeric: (langCode: string, bookNumber: number, chapter: number, verse: number, data: {
      suggestedText: string;
      reason?: string;
      references?: string[];
      editType?: 'text_correction' | 'translation_improvement' | 'grammar_fix' | 'typo_correction' | 'other';
      priority?: 'low' | 'medium' | 'high' | 'critical';
    }) => 
      ApiService.post<{ 
        success: boolean; 
        message: string; 
        edit: AllBibleEdit; 
      }>(`/all-bibles/edits/num/${langCode}/${bookNumber}/${chapter}/${verse}`, data),

    // Get User's Edits
    getMine: () => 
      ApiService.get<{ 
        success: boolean; 
        count: number; 
        edits: AllBibleEdit[]; 
      }>('/all-bibles/edits/mine'),

    // Get Specific Edit
    getById: (editId: string) => 
      ApiService.get<{ 
        success: boolean; 
        edit: AllBibleEdit; 
      }>(`/all-bibles/edits/${editId}`),

    // Submit Edit for Review
    submitForReview: (editId: string) => 
      ApiService.patch<{ 
        success: boolean; 
        message: string; 
        edit: { id: string; state: string; reference: string }; 
      }>(`/all-bibles/edits/${editId}/submit`),

    // Withdraw Edit
    withdraw: (editId: string) => 
      ApiService.delete<{ 
        success: boolean; 
        message: string; 
        editId: string; 
        userId: string; 
      }>(`/all-bibles/edits/${editId}`),

    // Get Edit Statistics
    getStats: () => 
      ApiService.get<{ 
        success: boolean; 
        totalEdits: number; 
        stats: Record<string, number>; 
      }>('/all-bibles/edits/stats'),
  };

  // AllBibles Admin Operations
  static allBibleAdmin = {
    // System Statistics
    getSystemStats: () => 
      ApiService.get<{ 
        success: boolean; 
        overall: { 
          languages: number; 
          sources: number; 
          books: number; 
          verses: number; 
        }; 
        changed: { 
          totalChangedVerses: number; 
          totalTranslations: number; 
        }; 
        languageDistribution: Array<{ _id: string; sourceCount: number }>; 
      }>('/all-bibles/admin/stats'),

    // Edit Management
    edits: {
      getPending: () => 
        ApiService.get<{ 
          success: boolean; 
          message: string; 
          count: number; 
          edits: AllBibleEdit[]; 
        }>('/all-bibles/admin/edits/pending'),

      approve: (editId: string, note?: string) => 
        ApiService.patch<{ 
          success: boolean; 
          message: string; 
          editId: string; 
        }>(`/all-bibles/admin/edits/${editId}/approve`, { note }),

      reject: (editId: string, reason: string) => 
        ApiService.patch<{ 
          success: boolean; 
          message: string; 
          editId: string; 
          reason: string; 
        }>(`/all-bibles/admin/edits/${editId}/reject`, { reason }),

      assignReviewer: (editId: string, reviewerId: string) => 
        ApiService.patch<{ 
          success: boolean; 
          message: string; 
          editId: string; 
          reviewerId: string; 
        }>(`/all-bibles/admin/edits/${editId}/assign-reviewer`, { reviewerId }),

      setDeadline: (editId: string, deadline: string) => 
        ApiService.patch<{ 
          success: boolean; 
          message: string; 
          editId: string; 
          deadline: string; 
        }>(`/all-bibles/admin/edits/${editId}/deadline`, { deadline }),

      bulkApprove: (editIds: string[]) => 
        ApiService.post<{ 
          success: boolean; 
          message: string; 
          results: Array<{ editId: string; status: string; edit?: AllBibleEdit; error?: string }>; 
        }>('/all-bibles/admin/edits/bulk-approve', { editIds }),

      bulkReject: (editIds: string[], reason: string) => 
        ApiService.post<{ 
          success: boolean; 
          message: string; 
          results: Array<{ editId: string; status: string; edit?: AllBibleEdit; error?: string }>; 
        }>('/all-bibles/admin/edits/bulk-reject', { editIds, reason }),

      findDuplicates: (window?: number) => 
        ApiService.get<{ 
          success: boolean; 
          duplicates: Array<{ 
            _id: { languageCode: string; sourceCode: string; bookNumber: number; chapter: number; verse: number }; 
            edits: Array<{ id: string; suggestion: string; createdAt: string }>; 
            count: number; 
          }>; 
        }>(`/all-bibles/admin/edits/duplicates${window ? `?window=${window}` : ''}`),

      getStats: () => 
        ApiService.get<{ 
          success: boolean; 
          stats: Record<string, any>; 
        }>('/all-bibles/admin/edits/stats'),

      delete: (editId: string) => 
        ApiService.delete<{ 
          success: boolean; 
          message: string; 
          deletedEdit?: {
            id: string;
            state: string;
            languageCode: string;
            sourceCode: string;
            bookNumber: number;
            chapter: number;
            verse: number;
          };
        }>(`/all-bibles/admin/edits/${editId}`),
    },

    // Edit History
    getEditHistory: (bookNumber: number, chapter: number, verse: number) => 
      ApiService.get<{ 
        success: boolean; 
        message: string; 
        reference: string; 
      }>(`/all-bibles/admin/history/${bookNumber}/${chapter}/${verse}`),

    // Changed Verse Management
    changed: {
      getBooks: () => 
        ApiService.get<{ 
          success: boolean; 
          count: number; 
          books: Array<{ 
            bookNumber: number; 
            name: string; 
            chapters: number; 
            languageCode: string; 
            sourceCode: string; 
          }>; 
        }>('/all-bibles/admin/changed/books'),

      getVerses: (params?: {
        limit?: number;
        offset?: number;
        bookNumber?: number;
        language?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.bookNumber) queryParams.append('bookNumber', params.bookNumber.toString());
        if (params?.language) queryParams.append('language', params.language);
        return ApiService.get<{ 
          success: boolean; 
          count: number; 
          books: Array<{ 
            bookNumber: number; 
            name: string; 
            chapters: number; 
            languageCode: string; 
            sourceCode: string; 
          }>; 
        }>(`/all-bibles/admin/changed/verses?${queryParams.toString()}`);
      },
    },
  };

  // AllBibles Changed Verse Management
  static allBibleChanged = {
    // Changed Books
    books: {
      getAll: () => 
        ApiService.get<{ 
          success: boolean; 
          count: number; 
          books: Array<{ 
            bookNumber: number; 
            name: string; 
            chapters: number; 
            languageCode: string; 
            sourceCode: string; 
          }>; 
        }>('/all-bibles/changed/books'),

      getById: (bookNumber: number) => 
        ApiService.get<{ 
          success: boolean; 
          book: { 
            bookNumber: number; 
            name: string; 
            chapters: number; 
            languageCode: string; 
            sourceCode: string; 
            changedVerses: { 
              count: number; 
              verses: Array<{ 
                reference: string; 
                kjvText: string; 
                changeSummary: string; 
                affectedDoctrine: string; 
                batchData: { 
                  Batch: number; 
                  Error: string; 
                  Danger: string; 
                  Evidence: string; 
                  Explanation: string; 
                  Current: string; 
                  Suggestion: string; 
                }; 
              }>; 
            }; 
          }; 
        }>(`/all-bibles/changed/books/${bookNumber}`),
    },

    // Changed Verses
    verses: {
      getAll: (params?: {
        limit?: number;
        offset?: number;
        bookNumber?: number;
        language?: string;
      }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.bookNumber) queryParams.append('bookNumber', params.bookNumber.toString());
        if (params?.language) queryParams.append('language', params.language);
        return ApiService.get<{ 
          success: boolean; 
          count: number; 
          totalCount: number; 
          offset: number; 
          limit: number; 
          results: AllBibleChangedVerse[]; 
        }>(`/all-bibles/changed/verses?${queryParams.toString()}`);
      },

      getByReference: (reference: string) => 
        ApiService.get<{ 
          success: boolean; 
          reference: string; 
          changed: { 
            exists: boolean; 
            refs?: string[]; 
            summary?: string; 
            kjvBaseline?: string; 
            affectedDoctrine?: string; 
            analysis?: string; 
            modernVersionsCited?: string[]; 
            spiritOfProphecy?: string; 
            batchData?: { 
              Batch: number; 
              Error: string; 
              Danger: string; 
              Evidence: string; 
              Explanation: string; 
              Current: string; 
              Suggestion: string; 
            }; 
            translations?: Array<{ 
              language: string; 
              current: string; 
              suggestion: string; 
            }>; 
          }; 
        }>(`/all-bibles/changed/verses/${reference}`),
    },

    // Asterisk System - Check if verses should show asterisks
    asterisk: {
      // Analyze verse with current text and changed verse data
      analyzeVerse: (bookNumber: number, chapter: number, verse: number, language: string, source: string) => 
        ApiService.get<{ 
          success: boolean; 
          reference: string; 
          language: string; 
          source: string; 
          currentText: string; 
          hasChanges: boolean; 
          showAsterisk: boolean; 
          changedVerse?: {
            summary: string; 
            kjvBaseline: string; 
            affectedDoctrine: string[]; 
            analysis: string; 
            modernVersionsCited: string[]; 
            spiritOfProphecy: string; 
            batchData: {
              Batch: number; 
              Error: string; 
              Danger: string; 
              Evidence: string; 
              Explanation: string; 
              Current: string; 
              Suggestion: string; 
            }; 
            translation?: {
              language: string; 
              source: string; 
              current: string; 
              suggestion: string; 
              hasSuggestion: boolean; 
            } | null; 
          } | null; 
        }>(`/all-bibles/analyze/${bookNumber}/${chapter}/${verse}?language=${language}&source=${source}`),

      // Check multiple verses for asterisks (bulk operation)
      checkBulk: (verses: Array<{
        bookNumber: number;
        chapter: number;
        verse: number;
        language: string;
        source: string;
      }>) => 
        ApiService.post<{ 
          success: boolean; 
          count: number; 
          results: Array<{
            reference: string; 
            hasChanges: boolean; 
            showAsterisk: boolean; 
            changeSummary?: string; 
            affectedDoctrine?: string[]; 
            translation?: {
              language: string; 
              source: string; 
              current: string; 
              suggestion: string; 
              hasSuggestion: boolean; 
            } | null; 
          }>; 
        }>('/all-bibles/changed/check-bulk', { verses }),

      // Get detailed change information for asterisk click
      getChangeDetails: (reference: string) => 
        ApiService.get<{ 
          success: boolean; 
          changed: {
            reference: string; 
            bookNumber: number; 
            chapter: number; 
            verse: number; 
            kjvText: string; 
            modernText: string; 
            changeType: 'addition' | 'deletion' | 'modification' | 'replacement'; 
            changeDescription: string; 
            affectedDoctrine: string[]; 
            confidence: number; 
            sources: Array<{
              language: string; 
              source: string; 
              text: string; 
              hasSuggestion: boolean; 
              suggestion: string; 
            }>; 
          }; 
        }>(`/all-bibles/changed/verses/${reference}`),
    },

    // Translations
    translations: {
      getByReference: (reference: string) => 
        ApiService.get<{ 
          success: boolean; 
          reference: string; 
          count: number; 
          translations: AllBibleTranslation[]; 
        }>(`/all-bibles/changed/translations/${reference}`),

      getByReferenceAndLanguage: (reference: string, language: string) => 
        ApiService.get<{ 
          success: boolean; 
          reference: string; 
          language: string; 
          translation: AllBibleTranslation; 
        }>(`/all-bibles/changed/translations/${reference}/${language}`),

      update: (reference: string, language: string, data: {
        current: string;
        suggestion: string;
        notes?: string;
        status?: 'pending' | 'approved' | 'rejected';
      }) => 
        ApiService.put<{ 
          success: boolean; 
          message: string; 
          translation: AllBibleTranslation; 
        }>(`/all-bibles/changed/translations/${reference}/${language}`, data),
    },

    // Statistics
    getStats: () => 
      ApiService.get<{ 
        success: boolean; 
        totalChangedVerses: number; 
        totalTranslations: number; 
        uniqueLanguages: number; 
        languages: string[]; 
        bookDistribution: Array<{ _id: number; count: number }>; 
      }>('/all-bibles/changed/stats'),

    // Search
    search: (query: string, params?: {
      limit?: number;
      offset?: number;
      bookNumber?: number;
      language?: string;
    }) => {
      const queryParams = new URLSearchParams({ q: query });
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.bookNumber) queryParams.append('bookNumber', params.bookNumber.toString());
      if (params?.language) queryParams.append('language', params.language);
      return ApiService.get<{ 
        success: boolean; 
        count: number; 
        totalCount: number; 
        offset: number; 
        limit: number; 
        results: AllBibleChangedVerse[]; 
      }>(`/all-bibles/changed/search?${queryParams.toString()}`);
    },

    // Featured Verse - Auto-rotating featured changed verse
    featured: {
      getFeatured: () => 
        ApiService.get<{ 
          success: boolean; 
          featured: {
            reference: string; 
            bookName: string; 
            rotationIndex: number; 
            totalVerses: number; 
            nextRotation: string; 
            exists: boolean; 
            refs: string[]; 
            summary: string; 
            kjvBaseline: string; 
            affectedDoctrine: string; 
            analysis: string; 
            modernVersionsCited: string[]; 
            spiritOfProphecy: {
              quote: string; 
              citation: string; 
            }; 
            batchData: {
              batch: number; 
              error: string; 
              danger: string; 
              evidence: string | null; 
              explanation: string; 
            }; 
            translations: any[]; 
          }; 
        }>('/all-bibles/changed/featured'),

      getNext: (currentIndex?: number) => {
        const params = new URLSearchParams();
        if (currentIndex !== undefined) {
          params.append('currentIndex', currentIndex.toString());
        }
        return ApiService.get<{ 
          success: boolean; 
          featured: {
            reference: string; 
            bookName: string; 
            rotationIndex: number; 
            totalVerses: number; 
            nextRotation: string; 
            exists: boolean; 
            refs: string[]; 
            summary: string; 
            kjvBaseline: string; 
            affectedDoctrine: string; 
            analysis: string; 
            modernVersionsCited: string[]; 
            spiritOfProphecy: {
              quote: string; 
              citation: string; 
            }; 
            batchData: {
              batch: number; 
              error: string; 
              danger: string; 
              evidence: string | null; 
              explanation: string; 
            }; 
            translations: any[]; 
          }; 
        }>(`/all-bibles/changed/featured/next?${params.toString()}`);
      },
    },
  };

  // AllBibles Health & Monitoring
  static allBibleHealth = {
    // Basic Health Check
    getBasic: () => 
      ApiService.get<AllBibleHealthStatus>('/all-bibles/health'),

    // Detailed System Status
    getDetailed: () => 
      ApiService.get<AllBibleHealthStatus>('/all-bibles/health/detailed'),

    // Performance Metrics
    getMetrics: () => 
      ApiService.get<{ 
        success: boolean; 
        metrics: { 
          last24Hours: Record<string, number>; 
          editStates: Record<string, number>; 
          topLanguages: Array<{ _id: string; count: number }>; 
          system: { 
            uptime: number; 
            memory: { rss: number; heapTotal: number; heapUsed: number }; 
            cpu: { user: number; system: number }; 
          }; 
        }; 
      }>('/all-bibles/health/metrics'),
  };

  // Legacy Edit-specific methods (maintained for backward compatibility)
  static edits = {
    // Submit a new edit (slug-based)
    submit: (data: {
      lang: string;
      bookSlug: string;
      chapter: number;
      verse: number;
      proposedText: string;
    }) => this.post('/bible/edits', data),

    // Submit a Bible edit using numeric canonical reference
    submitNumeric: (lang: string, bookNumber: number, chapter: number, verse: number, data: {
      proposedText: string;
      reason?: string;
    }) => this.post(`/bible/edits/num/${lang}/${bookNumber}/${chapter}/${verse}`, data),

    // Get user's edits
    getMine: (lang: string = 'en', state?: string, page?: number, limit?: number) => {
      const params = new URLSearchParams({ lang });
      if (state) params.append('state', state);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      return this.get(`/bible/edits/mine?${params.toString()}`);
    },

    // Get specific edit
    getById: (editId: string) => this.get(`/bible/edits/${editId}`),

    // Withdraw edit
    withdraw: (editId: string) => this.delete(`/bible/edits/${editId}`),
  };

  // Admin-specific methods
  static admin = {
    // Get pending edits
    getPendingEdits: (lang?: string, bookSlug?: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (lang) params.append('lang', lang);
      if (bookSlug) params.append('bookSlug', bookSlug);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      return this.get(`/bible/admin/edits/pending?${params.toString()}`);
    },

    // Approve edit
    approveEdit: (editId: string, note?: string) => 
      this.patch(`/bible/admin/edits/${editId}/approve`, { note }),

    // Reject edit
    rejectEdit: (editId: string, note?: string) => 
      this.patch(`/bible/admin/edits/${editId}/reject`, { note }),

    // Get edit history
    getEditHistory: (bookSlug: string, chapter: number, verse: number, lang?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (lang) params.append('lang', lang);
      if (limit) params.append('limit', limit.toString());
      return this.get(`/bible/admin/history/${bookSlug}/${chapter}/${verse}?${params.toString()}`);
    },

    // Import Bible data
    importData: (data: { lang: string; jsonData: any }) => 
      this.post('/bible/admin/import', data),

    // Validate Bible data
    validateData: (data: { jsonData: any }) => 
      this.post('/bible/admin/validate', data),
  };

  // Accounts API - Sub-account management with role-based access control
  static accounts = {
    // Core Account Operations
    getAll: () => 
      this.get('/account/accounts'),

    getById: (accountId: string) => 
      this.get(`/account/accounts/${accountId}`),

    create: (data: {
      name: string;
      pin: string;
      type?: 'standard' | 'kids' | 'adult';
    }) => 
      this.post('/account/accounts', data),

    update: (accountId: string, data: {
      name?: string;
      type?: 'standard' | 'kids' | 'adult';
    }) => 
      this.put(`/account/accounts/${accountId}`, data),

    delete: (accountId: string) => 
      this.delete(`/account/accounts/${accountId}`),

    reactivate: (accountId: string) => 
      this.put(`/account/accounts/${accountId}/reactivate`),

    purge: (accountId: string) => 
      this.delete(`/account/accounts/${accountId}/purge`),

    // Security & PIN Management
    validatePin: (data: {
      accountId: string;
      pin: string;
    }) => 
      this.post('/account/accounts/validate-pin', data),

    changePin: (accountId: string, data: {
      currentPin: string;
      newPin: string;
    }) => 
      this.put(`/account/accounts/${accountId}/pin`, data),

    unlock: (accountId: string) => 
      this.put(`/account/accounts/${accountId}/unlock`),

    // Role Management
    getUserRole: (accountId: string, targetUserId: string) => 
      this.get(`/account/accounts/${accountId}/roles/${targetUserId}`),

    addUserRole: (accountId: string, data: {
      targetUserId: string;
      role: 'owner' | 'editor' | 'viewer';
    }) => 
      this.post(`/account/accounts/${accountId}/roles`, data),

    updateUserRole: (accountId: string, targetUserId: string, data: {
      role: 'owner' | 'editor' | 'viewer';
    }) => 
      this.put(`/account/accounts/${accountId}/roles/${targetUserId}`, data),

    removeUserRole: (accountId: string, targetUserId: string) => 
      this.delete(`/account/accounts/${accountId}/roles/${targetUserId}`),

    // Avatar Upload Management (using unified media uploads)
    uploadAvatar: (accountId: string, file: File) => {
      const formData = new FormData();
      formData.append('avatarFile', file);
      return this.post(`/media/upload/account-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { accountId }
      });
    },

    // Admin & Analytics
    getAnalytics: () => 
      this.get('/account/accounts/analytics'),

    getLockedAccounts: () => 
      this.get('/account/accounts/locked'),

    getDeletedAccounts: (params?: {
      page?: number;
      limit?: number;
      includeInactive?: boolean;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.includeInactive) queryParams.append('includeInactive', params.includeInactive.toString());
      return this.get(`/account/accounts/deleted?${queryParams.toString()}`);
    },

      // Legacy & Compatibility
      getProfile: () => 
        this.get('/account/me'),
    }


  // Favorites API - User favorites management with account support
  static favorites = {
    // Core favorites operations
    addToFavorites: (data: {
      mediaId: string;
      type: 'movie' | 'tvshow' | 'episode';
      title: string;
      description?: string;
      thumbnailUrl?: string;
      videoUrl?: string;
      platform?: string;
      accountId?: string;
      metadata?: Record<string, any>;
    }) => 
      ApiService.post('/favorites', data),

    getFavorites: (params?: {
      platform?: string;
      accountId?: string;
      type?: string;
      limit?: number;
      skip?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, value.toString());
        });
      }
      return ApiService.get(`/favorites?${queryParams.toString()}`);
    },

    removeFromFavorites: (favoriteId: string) => 
      ApiService.delete(`/favorites/${favoriteId}`),

    // Check favorite status
    checkFavoriteStatus: (mediaId: string, params?: {
      accountId?: string;
      platform?: string;
      type?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, value.toString());
        });
      }
      return ApiService.get(`/favorites/check/${mediaId}?${queryParams.toString()}`);
    },

    // Additional endpoints
    getFavoriteStats: (params?: {
      accountId?: string;
      platform?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, value.toString());
        });
      }
      return ApiService.get(`/favorites/stats?${queryParams.toString()}`);
    },

    bulkCheckFavoriteStatus: (data: {
      mediaIds: string[];
      accountId?: string;
      platform?: string;
      type?: string;
    }) => 
      ApiService.post('/favorites/bulk-check', data),

    getRecentFavorites: (params?: {
      limit?: number;
      platform?: string;
      accountId?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, value.toString());
        });
      }
      return ApiService.get(`/favorites/recent?${queryParams.toString()}`);
    },

    getFavoriteById: (favoriteId: string) => 
      ApiService.get(`/favorites/${favoriteId}`),
  };
}

// Export the configured axios instance for backward compatibility
export default api;

// Export the API service for new implementations
export { ApiService };

// Export AllBibles types for use in components
export type {
  AllBibleLanguage,
  AllBibleSource,
  AllBibleBook,
  AllBibleText,
  AllBibleEdit,
  AllBibleChangeLink,
  AllBibleParallelText,
  AllBibleChangedVerse,
  AllBibleTranslation,
  AllBibleHealthStatus
};

/*
 * AllBibles API Usage Examples
 * 
 * // Basic Bible Reading
 * const languages = await ApiService.allBibles.languages.getAll();
 * const sources = await ApiService.allBibles.sources.getByLanguage('eng');
 * const books = await ApiService.allBibles.books.getAll('eng', 'kjv');
 * const verse = await ApiService.allBibles.text.getSpecific('eng', 'kjv', { bookNumber: 1, chapter: 1, verse: 1 });
 * 
 * // Search
 * const searchResults = await ApiService.allBibles.search.byLanguageSource('eng', 'kjv', 'love', { limit: 10 });
 * const globalSearch = await ApiService.allBibles.search.global('peace', { limit: 50 });
 * 
 * // Parallel Text
 * const parallel = await ApiService.allBibles.parallel.getTwoLanguage(1, 1, 1, 'eng', 'run');
 * const multiple = await ApiService.allBibles.parallel.getMultiple(1, 1, 1, 'eng', ['run', 'fra', 'spa']);
 * 
 * // Edit Submission
 * const edit = await ApiService.allBibleEdits.submit({
 *   languageCode: 'eng',
 *   sourceCode: 'kjv',
 *   bookNumber: 1,
 *   chapter: 1,
 *   verse: 1,
 *   suggestedText: 'In the beginning God created the heavens and the earth.',
 *   reason: 'Grammar correction',
 *   editType: 'grammar_fix',
 *   priority: 'medium'
 * });
 * 
 * // Admin Operations
 * const pendingEdits = await ApiService.allBibleAdmin.edits.getPending();
 * await ApiService.allBibleAdmin.edits.approve('edit123', 'Looks good');
 * 
 * // Changed Verses
 * const changedBooks = await ApiService.allBibleChanged.books.getAll();
 * const changedVerse = await ApiService.allBibleChanged.verses.getByReference('1:1:1');
 * 
 * // Health Monitoring
 * const health = await ApiService.allBibleHealth.getBasic();
 * const metrics = await ApiService.allBibleHealth.getMetrics();
 * 
 * // Helper Functions
 * const reference = AllBiblesHelpers.formatReference(1, 1, 1); // "1:1:1"
 * const bookName = AllBiblesHelpers.getBookName(1); // "Genesis"
 * const isValid = AllBiblesHelpers.validateLanguageCode('eng'); // true
 * const wordCount = AllBiblesHelpers.calculateWordCount('Hello world'); // 2
 */