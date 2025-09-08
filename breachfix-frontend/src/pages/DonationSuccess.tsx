import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, Star } from 'lucide-react';

const DonationSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment intent ID from URL parameters
    const paymentIntentId = searchParams.get('payment_intent');
    
    if (paymentIntentId) {
      // In a real app, you might want to verify the payment with your backend
      setPaymentIntent({
        id: paymentIntentId,
        amount: 1000, // This would come from your backend
        currency: 'usd',
        status: 'succeeded'
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-breachfix-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-breachfix-gold mx-auto mb-4"></div>
          <p className="text-breachfix-white">Processing your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-breachfix-navy to-breachfix-emerald flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          {/* Success Icon with Animation */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-breachfix-gold bg-opacity-20 mb-6"
          >
            <CheckCircle className="h-12 w-12 text-breachfix-gold" />
          </motion.div>

          {/* Success Message */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-breachfix-white mb-4"
          >
            🎉 Thank You for Your Generous Donation!
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-breachfix-white mb-6"
          >
            You are now a <span className="font-bold text-breachfix-gold">Partner in Bible Translation</span>! 
            Your contribution directly supports accurate translation work and helps believers worldwide.
          </motion.p>

          {/* Partner Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-breachfix-white px-6 py-3 rounded-full font-semibold mb-8"
          >
            <Star className="h-5 w-5" />
            <span>Translation Partner</span>
            <Heart className="h-5 w-5" />
          </motion.div>

          {/* Payment Details */}
          {paymentIntent && (
            <div className="bg-breachfix-dark rounded-lg shadow p-6 mb-6 border border-breachfix-gray">
              <h3 className="text-lg font-semibold text-breachfix-white mb-4">Donation Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-breachfix-gray">Amount:</span>
                  <span className="font-semibold">
                    ${(paymentIntent.amount / 100).toFixed(2)} {paymentIntent.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-breachfix-gray">Status:</span>
                  <span className="text-breachfix-emerald font-semibold capitalize">
                    {paymentIntent.status}
                  </span>
                </div>
                {paymentIntent.id && (
                  <div className="flex justify-between">
                    <span className="text-breachfix-gray">Transaction ID:</span>
                    <span className="font-mono text-xs text-breachfix-gray">
                      {paymentIntent.id.substring(0, 20)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-breachfix-emerald bg-opacity-20 rounded-lg p-6 mb-6 border border-breachfix-emerald">
            <h3 className="text-lg font-semibold text-breachfix-emerald mb-3">What's Next?</h3>
            <ul className="text-left text-breachfix-white space-y-2">
              <li>• You'll receive a receipt via email</li>
              <li>• Your donation will be used to support Bible translation</li>
              <li>• You can track the impact of your contribution</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/bible"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-breachfix-white bg-breachfix-emerald hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Continue Reading Bible
            </Link>
            
            <Link
              to="/donation-test"
              className="w-full flex justify-center py-3 px-4 border border-breachfix-gray rounded-md shadow-sm text-sm font-medium text-breachfix-gray bg-breachfix-dark hover:bg-breachfix-gray hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-breachfix-emerald transition-colors"
            >
              Make Another Donation
            </Link>
            
            <Link
              to="/"
              className="w-full flex justify-center py-3 px-4 text-sm font-medium text-breachfix-gray hover:text-breachfix-white transition-colors"
            >
              Return to Home
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-breachfix-gray">
              Questions about your donation?{' '}
              <a href="mailto:support@example.com" className="text-breachfix-emerald hover:text-teal-600">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DonationSuccess;
