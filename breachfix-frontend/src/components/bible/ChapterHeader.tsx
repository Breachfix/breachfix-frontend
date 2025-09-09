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
}

const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  bookName,
  chapterNumber,
  language,
  source,
  bookNumber,
  onDonationClick,
  donationEnabled = false,
  userId
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
      className="bg-gradient-to-r from-breachfix-emerald/90 to-teal-600/90 border-l-4 border-breachfix-gold p-6 mb-6 rounded-xl shadow-2xl backdrop-blur-sm border border-breachfix-gold/30"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-heading-md font-bold text-breachfix-white">
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
          <p className="text-breachfix-white text-body-sm opacity-90">
            {language.toUpperCase()} • {source} Translation
          </p>
        </div>
        
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
      
      {donationEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 bg-breachfix-gold bg-opacity-20 border border-breachfix-gold rounded-lg"
        >
          <p className="text-body-sm text-breachfix-navy">
            💡 <strong>Help fund accurate translation</strong> and research for this chapter. 
            Your support enables detailed analysis and improved translations.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChapterHeader;
