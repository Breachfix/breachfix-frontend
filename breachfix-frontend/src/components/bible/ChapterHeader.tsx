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
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
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
          <p className="text-gray-600 text-sm">
            {language.toUpperCase()} • {source} Translation
          </p>
        </div>
        
        {donationEnabled && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDonationClick}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <Heart size={16} />
            <span className="text-sm font-medium">Support Chapter</span>
          </motion.button>
        )}
      </div>
      
      {donationEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg"
        >
          <p className="text-sm text-gray-700">
            💡 <strong>Help fund accurate translation</strong> and research for this chapter. 
            Your support enables detailed analysis and improved translations.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChapterHeader;
