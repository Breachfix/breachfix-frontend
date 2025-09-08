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
      className={`cursor-pointer transition-all duration-300 p-2 rounded-lg ${
        isHighlighted 
          ? 'bg-blue-100 border-l-4 border-blue-500' 
          : 'hover:bg-gray-50'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        {/* Verse Number */}
        <span className="text-sm font-semibold text-gray-600 min-w-[2rem]">
          {verse.verse}
        </span>
        
        {/* Verse Text */}
        <div className="flex-1">
          <p className="text-gray-800 leading-relaxed">
            {verse.text}
          </p>
        </div>
        
        {/* Partner Badge, Asterisk and Donation Button */}
        <div className="flex items-center gap-2">
          {/* Partner Badge */}
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
          
          {showAsterisk && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAsteriskClick(selectedBookNumber, selectedChapter, verse.verse);
              }}
              className="text-red-500 hover:text-red-700 font-bold text-lg"
              title="This verse has translation changes"
            >
              *
            </button>
          )}
          
          {donationEnabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDonationClick();
              }}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
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
