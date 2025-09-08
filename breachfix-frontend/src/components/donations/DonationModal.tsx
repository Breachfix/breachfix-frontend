import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import DonationCard from './DonationCard';
import type { DonationScope } from '../../context/DonationContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: DonationScope | null;
  amount?: number;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
}

const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  scope,
  amount: _amount = 10,
  onSuccess,
  onError
}) => {
  if (!scope) return null;

  const getScopeTitle = () => {
    switch (scope.kind) {
      case 'verse':
        return `Support ${scope.lang.toUpperCase()} ${scope.source} ${scope.bookNumber}:${scope.chapter}:${scope.verse}`;
      case 'chapter':
        return `Support ${scope.lang.toUpperCase()} ${scope.source} ${scope.bookNumber}:${scope.chapter}`;
      case 'book':
        return `Support ${scope.lang.toUpperCase()} ${scope.source} Book ${scope.bookNumber}`;
      default:
        return 'Support Bible Translation';
    }
  };

  const getScopeDescription = () => {
    switch (scope.kind) {
      case 'verse':
        return 'Help fund accurate translation and research for this specific verse';
      case 'chapter':
        return 'Help fund accurate translation and research for this chapter';
      case 'book':
        return 'Help fund accurate translation and research for this book';
      default:
        return 'Help fund accurate Bible translation and research';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Support Bible Translation
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <DonationCard
                  title={getScopeTitle()}
                  description={getScopeDescription()}
                  scope={scope}
                  suggestedAmounts={[5, 10, 25, 50, 100]}
                  customAmount={true}
                  onDonationSuccess={onSuccess}
                  onDonationError={onError}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;
