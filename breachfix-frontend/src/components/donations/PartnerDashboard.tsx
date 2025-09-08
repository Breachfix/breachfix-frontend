import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, DollarSign, Calendar, BookOpen } from 'lucide-react';
import { usePaymentTracking } from '../../hooks/usePaymentTracking';

const PartnerDashboard: React.FC = () => {
  const { userPayments, getTotalDonated, getDonationCount, loading } = usePaymentTracking();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-breachfix-gold"></div>
      </div>
    );
  }

  const totalDonated = getTotalDonated();
  const donationCount = getDonationCount();

  if (donationCount === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-breachfix-gray mb-2">No donations yet</h3>
        <p className="text-breachfix-gray">Start supporting Bible translation work today!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-breachfix-white p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8" />
            <div>
              <p className="text-green-100 text-sm">Total Donated</p>
              <p className="text-2xl font-bold">${(totalDonated / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-breachfix-white p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8" />
            <div>
              <p className="text-blue-100 text-sm">Donations Made</p>
              <p className="text-2xl font-bold">{donationCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-breachfix-white p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8" />
            <div>
              <p className="text-purple-100 text-sm">Partner Status</p>
              <p className="text-2xl font-bold">Active</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Donations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-breachfix-dark rounded-lg shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Your Support History
        </h3>
        
        <div className="space-y-4">
          {userPayments
            .filter(payment => payment.status === 'succeeded')
            .slice(0, 10)
            .map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-breachfix-gray bg-opacity-20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {payment.scope.kind === 'verse' 
                        ? `Verse ${payment.scope.verse}`
                        : payment.scope.kind === 'chapter'
                        ? `Chapter ${payment.scope.chapter}`
                        : `Book ${payment.scope.bookNumber}`
                      }
                    </p>
                    <p className="text-sm text-breachfix-gray">
                      {payment.scope.lang.toUpperCase()} • {payment.scope.source}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ${(payment.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-breachfix-gray flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PartnerDashboard;
