import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../utils/api';

// Global cache shared across all instances of the hook
const globalPartnershipCache = new Map<string, { isPartner: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global request deduplication - prevents multiple simultaneous requests for the same scope
const pendingRequests = new Map<string, Promise<boolean>>();

// Rate limiter to prevent too many requests
let lastRequestTime = 0;
const REQUEST_DELAY = 100; // 100ms between requests

// Maximum number of requests per second
const MAX_REQUESTS_PER_SECOND = 10;
let requestCount = 0;
let requestWindowStart = Date.now();

export interface PaymentRecord {
  id: string;
  scope: {
    kind: 'verse' | 'chapter' | 'book';
    lang: string;
    source: string;
    bookNumber: number;
    chapter: number;
    verse?: number;
  };
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  createdAt: string;
  paymentIntentId: string;
}

export const usePaymentTracking = () => {
  const [userPayments, setUserPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's payment history
  const fetchUserPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get from backend API first
      const response = await ApiService.get('/all-bibles/donations/stats');
      if (response?.success && response?.payments) {
        setUserPayments(response.payments);
      } else {
        // Fallback to localStorage
        const storedPayments = localStorage.getItem('userPayments');
        if (storedPayments) {
          setUserPayments(JSON.parse(storedPayments));
        }
      }
    } catch (err) {
      console.error('Failed to fetch user payments:', err);
      // Fallback to localStorage on error
      const storedPayments = localStorage.getItem('userPayments');
      if (storedPayments) {
        setUserPayments(JSON.parse(storedPayments));
      }
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  // Record a new payment
  const recordPayment = async (paymentData: {
    scope: PaymentRecord['scope'];
    amount: number;
    currency: string;
    paymentIntentId: string;
    status: PaymentRecord['status'];
  }) => {
    try {
      const newPayment: PaymentRecord = {
        id: Date.now().toString(),
        ...paymentData,
        createdAt: new Date().toISOString()
      };

      // Add to local state
      setUserPayments(prev => [newPayment, ...prev]);

      // Store in localStorage (temporary solution)
      const updatedPayments = [newPayment, ...userPayments];
      localStorage.setItem('userPayments', JSON.stringify(updatedPayments));

      // TODO: Send to backend API
      // await ApiService.post('/payments/record', newPayment);

      return newPayment;
    } catch (err) {
      console.error('Failed to record payment:', err);
      throw err;
    }
  };

  // Check if user has supported a specific scope
  const hasSupported = useCallback((scope: PaymentRecord['scope']): boolean => {
    return userPayments.some(payment => 
      payment.status === 'succeeded' &&
      payment.scope.kind === scope.kind &&
      payment.scope.lang === scope.lang &&
      payment.scope.source === scope.source &&
      payment.scope.bookNumber === scope.bookNumber &&
      payment.scope.chapter === scope.chapter &&
      (scope.verse ? payment.scope.verse === scope.verse : true)
    );
  }, [userPayments]);

  // Check partnership status from backend API with global caching and rate limiting
  const checkPartnershipStatus = useCallback(async (scope: PaymentRecord['scope'], userId?: string) => {
    // Create a cache key for this scope
    const cacheKey = `${scope.kind}-${scope.lang}-${scope.source}-${scope.bookNumber}-${scope.chapter}-${scope.verse || 'no-verse'}-${userId || 'anonymous'}`;
    
    // Check if we have a recent cached result (within 5 minutes)
    const cached = globalPartnershipCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`🎯 Using cached partnership status for ${cacheKey}:`, cached.isPartner);
      return cached.isPartner;
    }

    // Check if there's already a pending request for this scope
    if (pendingRequests.has(cacheKey)) {
      console.log(`⏳ Waiting for pending request for ${cacheKey}`);
      return await pendingRequests.get(cacheKey)!;
    }

    console.log(`🔄 Fetching partnership status for ${cacheKey}`);
    
    // Rate limiting - check requests per second
    if (now - requestWindowStart >= 1000) {
      // Reset the window
      requestCount = 0;
      requestWindowStart = now;
    }
    
    if (requestCount >= MAX_REQUESTS_PER_SECOND) {
      // Wait until the next second
      const waitTime = 1000 - (now - requestWindowStart);
      console.log(`⏸️ Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Add delay between requests
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
    }
    
    lastRequestTime = Date.now();
    requestCount++;
    
    // Create the request promise
    const requestPromise = (async () => {
      try {
        const params: any = {
          kind: scope.kind,
          lang: scope.lang,
          source: scope.source,
          bookNumber: scope.bookNumber,
          chapter: scope.chapter,
          userId: userId
        };

        // Only include verse parameter if it's defined (for verse-level donations)
        if (scope.verse !== undefined) {
          params.verse = scope.verse;
        }

        const response = await ApiService.get('/all-bibles/donations/partnership', {
          params
        });
        
        const isPartner = response?.success && response?.isPartner;
        
        // Cache the result globally
        globalPartnershipCache.set(cacheKey, {
          isPartner,
          timestamp: now
        });
        
        console.log(`✅ Cached partnership status for ${cacheKey}:`, isPartner);
        return isPartner;
      } catch (err) {
        console.error('Failed to check partnership status:', err);
        // Fallback to local check
        const isPartner = hasSupported(scope);
        
        // Cache the fallback result too
        globalPartnershipCache.set(cacheKey, {
          isPartner,
          timestamp: now
        });
        
        console.log(`⚠️ Cached fallback partnership status for ${cacheKey}:`, isPartner);
        return isPartner;
      } finally {
        // Remove from pending requests when done
        pendingRequests.delete(cacheKey);
      }
    })();

    // Store the promise to prevent duplicate requests
    pendingRequests.set(cacheKey, requestPromise);
    
    return await requestPromise;
  }, [hasSupported]);

  // Get total amount donated
  const getTotalDonated = (): number => {
    return userPayments
      .filter(payment => payment.status === 'succeeded')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  // Get donation count
  const getDonationCount = (): number => {
    return userPayments.filter(payment => payment.status === 'succeeded').length;
  };

  // Clear partnership cache (useful when user makes a new donation)
  const clearPartnershipCache = useCallback(() => {
    globalPartnershipCache.clear();
    pendingRequests.clear();
    lastRequestTime = 0;
    console.log('🧹 Cleared global partnership cache, pending requests, and rate limiter');
  }, []);

  // Get cache statistics for debugging
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const validEntries = Array.from(globalPartnershipCache.entries()).filter(
      ([_, value]) => (now - value.timestamp) < CACHE_DURATION
    );
    return {
      totalEntries: globalPartnershipCache.size,
      validEntries: validEntries.length,
      expiredEntries: globalPartnershipCache.size - validEntries.length
    };
  }, []);

  // Load payments on mount
  useEffect(() => {
    fetchUserPayments();
  }, []);

  return {
    userPayments,
    loading,
    error,
    recordPayment,
    hasSupported,
    checkPartnershipStatus,
    clearPartnershipCache,
    getCacheStats,
    getTotalDonated,
    getDonationCount,
    fetchUserPayments
  };
};
