import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const DonationSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment intent ID from URL parameters
    const paymentIntentId = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Donation!
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Your generous contribution helps support Bible translation work and makes a real difference.
          </p>

          {/* Payment Details */}
          {paymentIntent && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    ${(paymentIntent.amount / 100).toFixed(2)} {paymentIntent.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold capitalize">
                    {paymentIntent.status}
                  </span>
                </div>
                {paymentIntent.id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs text-gray-500">
                      {paymentIntent.id.substring(0, 20)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li>• You'll receive a receipt via email</li>
              <li>• Your donation will be used to support Bible translation</li>
              <li>• You can track the impact of your contribution</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/bible"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Continue Reading Bible
            </Link>
            
            <Link
              to="/donation-test"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Make Another Donation
            </Link>
            
            <Link
              to="/"
              className="w-full flex justify-center py-3 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Return to Home
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions about your donation?{' '}
              <a href="mailto:support@example.com" className="text-green-600 hover:text-green-700">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;
