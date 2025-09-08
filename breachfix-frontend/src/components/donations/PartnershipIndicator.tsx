import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Users } from 'lucide-react';
import { usePaymentTracking } from '../../hooks/usePaymentTracking';

interface PartnershipIndicatorProps {
  scope: {
    kind: 'verse' | 'chapter' | 'book';
    lang: string;
    source: string;
    bookNumber: number;
    chapter: number;
    verse?: number;
  };
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showStats?: boolean;
  className?: string;
}

const PartnershipIndicator: React.FC<PartnershipIndicatorProps> = ({
  scope,
  userId,
  size = 'md',
  showText = true,
  showStats = false,
  className = ''
}) => {
  const { checkPartnershipStatus, hasSupported } = usePaymentTracking();
  const [isPartner, setIsPartner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerCount, setPartnerCount] = useState(0);
  const isCheckingRef = useRef(false);

  // Memoize the scope to prevent unnecessary re-renders
  const memoizedScope = useMemo(() => scope, [
    scope.kind,
    scope.lang,
    scope.source,
    scope.bookNumber,
    scope.chapter,
    scope.verse
  ]);

  useEffect(() => {
    // Prevent multiple simultaneous checks for the same scope
    if (isCheckingRef.current) {
      return;
    }

    const checkStatus = async () => {
      isCheckingRef.current = true;
      setIsLoading(true);
      
      try {
        // For verse-level partnerships, use a more conservative approach
        // Only check if the user is likely to be a partner (has made donations before)
        if (memoizedScope.kind === 'verse') {
          // For verses, we'll use a simpler approach - just check local storage first
          const localPartnerStatus = hasSupported(memoizedScope);
          if (localPartnerStatus) {
            setIsPartner(true);
            setPartnerCount(1);
            setIsLoading(false);
            isCheckingRef.current = false;
            return;
          }
          
          // For verses, we'll skip the API call for now to reduce load
          // This can be enabled later when we have a batch API endpoint
          setIsPartner(false);
          setIsLoading(false);
          isCheckingRef.current = false;
          return;
        }
        
        // For chapter and book level, check partnership status from backend
        const partnerStatus = await checkPartnershipStatus(memoizedScope, userId);
        setIsPartner(partnerStatus);
        
        // If user is a partner, we could also fetch partner count for this scope
        // This would require a new API endpoint
        if (partnerStatus) {
          // For now, we'll use a placeholder
          setPartnerCount(1);
        }
      } catch (error) {
        console.error('Failed to check partnership status:', error);
        // Fallback to local check
        setIsPartner(hasSupported(memoizedScope));
      } finally {
        setIsLoading(false);
        isCheckingRef.current = false;
      }
    };

    checkStatus();
  }, [memoizedScope, userId, checkPartnershipStatus, hasSupported]);

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        {showText && <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>}
      </div>
    );
  }

  if (!isPartner) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-breachfix-white rounded-full font-semibold shadow-lg ${sizeClasses[size]} ${className}`}
    >
      <Star className="h-3 w-3" size={iconSizes[size]} />
      {showText && (
        <>
          <span>Partner</span>
          <Heart className="h-3 w-3" size={iconSizes[size]} />
        </>
      )}
      {showStats && partnerCount > 0 && (
        <div className="flex items-center gap-1 ml-1">
          <Users className="h-3 w-3" size={iconSizes[size]} />
          <span className="text-xs">{partnerCount}</span>
        </div>
      )}
    </motion.div>
  );
};

export default PartnershipIndicator;
