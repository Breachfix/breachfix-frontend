import React from 'react';
import { motion } from 'framer-motion';
import type { AllBibleText } from '../../utils/api';
import PartnerBadge from '../donations/PartnerBadge';

interface VerseDisplayProps {
  verse: AllBibleText;
  isHighlighted: boolean;
  showAsterisk: boolean;
  onVerseClick: (verseNumber: number) => void;
  onAsteriskClick: (bookNumber: number, chapter: number, verse: number) => void;
  onDonationClick?: (scope: {
    kind: 'verse';
    lang: string;
    source: string;
    bookNumber: number;
    chapter: number;
    verse: number;
  }) => void;
  donationEnabled?: boolean;
  showPartnerBadge?: boolean;
  selectedLanguage: string;
  selectedSource: string;
  selectedBookNumber: number;
  selectedChapter: number;
  userId?: string;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({
  verse,
  isHighlighted,
  showAsterisk,
  onVerseClick,
  onAsteriskClick,
  onDonationClick,
  donationEnabled = false,
  showPartnerBadge = true,
  selectedLanguage,
  selectedSource,
  selectedBookNumber,
  selectedChapter,
  userId
}) => {
  const handleDonationClick = () => {
    if (onDonationClick) {
      onDonationClick({
        kind: 'verse',
        lang: selectedLanguage,
        source: selectedSource,
        bookNumber: selectedBookNumber,
        chapter: selectedChapter,
        verse: verse.verse
      });
    }
  };

  return (
    <motion.div
      key={verse.verse}
      onClick={() => onVerseClick(verse.verse)}
      className={`cursor-pointer transition-all duration-300 p-3 rounded-lg ${
        isHighlighted 
          ? 'bg-gradient-to-r from-breachfix-gold/20 to-breachfix-gold/10 border-l-4 border-breachfix-gold shadow-lg backdrop-blur-sm' 
          : 'hover:bg-breachfix-emerald/10 hover:shadow-md hover:backdrop-blur-sm'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        {/* Verse Number */}
        <span className={`bible-verse-number text-body-sm min-w-[2rem] ${
          isHighlighted ? 'text-breachfix-gold' : 'text-breachfix-emerald'
        }`}>
          {verse.verse}
        </span>
        
        {/* Verse Text */}
        <div className="flex-1">
          <p className={`bible-verse-text ${
            isHighlighted ? 'text-breachfix-white font-medium' : 'text-breachfix-white/90'
          }`}>
            {verse.text}
          </p>
        </div>
        
        {/* Partner Badge, Asterisk and Donation Button */}
        <div className="flex items-center gap-2">
          {/* Partner Badge */}
          {showPartnerBadge && isHighlighted && (
            <PartnerBadge
              scope={{
                kind: 'verse',
                lang: selectedLanguage,
                source: selectedSource,
                bookNumber: selectedBookNumber,
                chapter: selectedChapter,
                verse: verse.verse
              }}
              userId={userId}
              size="sm"
              showText={false}
            />
          )}
          
          {showAsterisk && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAsteriskClick(selectedBookNumber, selectedChapter, verse.verse);
              }}
              className="text-breachfix-gold hover:text-yellow-500 font-bold text-body-sm"
              title="This verse has translation changes"
            >
              *
            </button>
          )}
          
          {donationEnabled && isHighlighted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDonationClick();
              }}
              className="px-2 py-1 text-caption bg-breachfix-emerald text-breachfix-white rounded hover:bg-teal-600 transition-colors"
              title="Support this verse"
            >
              💝
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerseDisplay;
