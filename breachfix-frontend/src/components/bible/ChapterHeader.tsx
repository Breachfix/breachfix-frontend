import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import PartnerBadge from '../donations/PartnerBadge';

interface ChapterHeaderProps {
  bookName: string;
  chapterNumber: number;
  language: string;
  source: string;
  bookNumber: number;
  onDonationClick?: (scope: {
    kind: 'chapter';
    lang: string;
    source: string;
    bookNumber: number;
    chapter: number;
  }) => void;
  donationEnabled?: boolean;
  userId?: string;
  textAlignment?: 'left' | 'center' | 'indent';
  onTextAlignmentChange?: (alignment: 'left' | 'center' | 'indent') => void;
}

const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  bookName,
  chapterNumber,
  language,
  source,
  bookNumber,
  onDonationClick,
  donationEnabled = false,
  userId,
  textAlignment = 'left',
  onTextAlignmentChange
}) => {
  const handleDonationClick = () => {
    if (onDonationClick) {
      onDonationClick({
        kind: 'chapter',
        lang: language,
        source: source,
        bookNumber: bookNumber,
        chapter: chapterNumber
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-800 via-breachfix-navy to-amber-900 border border-amber-400 border-opacity-40 p-4 mb-4 rounded-xl shadow-2xl backdrop-blur-sm relative overflow-hidden"
    >
      {/* Temple-Inspired Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-breachfix-gold/5 opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-breachfix-gold to-amber-400 animate-pulse"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-heading-md font-bold text-amber-100">
              {bookName} Chapter {chapterNumber}
            </h2>
            <PartnerBadge
              scope={{
                kind: 'chapter',
                lang: language,
                source: source,
                bookNumber: bookNumber,
                chapter: chapterNumber
              }}
              userId={userId}
              size="sm"
              showText={true}
            />
          </div>
          <p className="text-amber-200 text-body-sm opacity-90">
            {language.toUpperCase()} • {source} Translation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Text Alignment Selector */}
          {onTextAlignmentChange && (
            <select
              value={textAlignment}
              onChange={(e) => onTextAlignmentChange(e.target.value as 'left' | 'center' | 'indent')}
              className="bg-amber-900/50 text-amber-100 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm border border-amber-400/30"
            >
              <option value="left">Left Aligned</option>
              <option value="center">Centered</option>
              <option value="indent">Indented</option>
            </select>
          )}
          
          {donationEnabled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDonationClick}
              className="flex items-center gap-2 px-4 py-2 bg-breachfix-gold text-breachfix-navy rounded-lg hover:bg-yellow-500 transition-colors shadow-md"
            >
              <Heart size={16} />
              <span className="text-body-sm font-medium">Support Chapter</span>
            </motion.button>
          )}
        </div>
      </div>
      
      {donationEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg relative z-10"
        >
          <p className="text-body-sm text-amber-100">
            💡 <strong>Help fund accurate translation</strong> and research for this chapter. 
            Your support enables detailed analysis and improved translations.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChapterHeader;
