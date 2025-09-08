import React, { useState } from 'react';
import DonationCard from '../components/donations/DonationCard';
import DonationButton from '../components/donations/DonationButton';

const DonationTest: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDonationSuccess = (paymentIntent: any) => {
    setSuccessMessage(`Thank you! Your donation of $${(paymentIntent.amount / 100).toFixed(2)} was successful.`);
    setErrorMessage(null);
    console.log('Donation successful:', paymentIntent);
  };

  const handleDonationError = (error: any) => {
    setErrorMessage(`Donation failed: ${error.message || 'An error occurred'}`);
    setSuccessMessage(null);
    console.error('Donation error:', error);
  };

  // Test data for different Bible references
  const testScopes = [
    {
      title: "Support John 3:16 Translation",
      description: "Help improve the translation of this beloved verse in multiple languages.",
      scope: {
        kind: 'verse' as const,
        lang: 'run',
        source: 'by67',
        bookNumber: 43,
        chapter: 3,
        verse: 16
      }
    },
    {
      title: "Support Genesis Chapter 1",
      description: "Contribute to the translation work for the creation story.",
      scope: {
        kind: 'chapter' as const,
        lang: 'run',
        source: 'by67',
        bookNumber: 1,
        chapter: 1
      }
    },
    {
      title: "Support Psalms Translation",
      description: "Help translate the entire book of Psalms.",
      scope: {
        kind: 'book' as const,
        lang: 'run',
        source: 'by67',
        bookNumber: 19,
        chapter: 1
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Donation System Test Page
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the donation functionality with different Bible references and amounts. 
            This page demonstrates how the donation system integrates with your Bible translation work.
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testScopes.map((test, index) => (
            <DonationCard
              key={index}
              title={test.title}
              description={test.description}
              scope={test.scope}
              suggestedAmounts={[5, 10, 25, 50]}
              customAmount={true}
              onDonationSuccess={handleDonationSuccess}
              onDonationError={handleDonationError}
            />
          ))}
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Test Buttons</h2>
          <p className="text-gray-600 mb-6">
            Test individual donation buttons with different amounts and references.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">John 3:16</h3>
              <DonationButton
                scope={{
                  kind: 'verse',
                  lang: 'run',
                  source: 'by67',
                  bookNumber: 43,
                  chapter: 3,
                  verse: 16
                }}
                amount={10}
                onSuccess={handleDonationSuccess}
                onError={handleDonationError}
                className="w-full"
              />
            </div>

            <div className="text-center">
              <h3 className="font-semibold mb-2">Genesis 1</h3>
              <DonationButton
                scope={{
                  kind: 'chapter',
                  lang: 'run',
                  source: 'by67',
                  bookNumber: 1,
                  chapter: 1
                }}
                amount={25}
                onSuccess={handleDonationSuccess}
                onError={handleDonationError}
                className="w-full"
              />
            </div>

            <div className="text-center">
              <h3 className="font-semibold mb-2">Psalms</h3>
              <DonationButton
                scope={{
                  kind: 'book',
                  lang: 'run',
                  source: 'by67',
                  bookNumber: 19,
                  chapter: 1
                }}
                amount={50}
                onSuccess={handleDonationSuccess}
                onError={handleDonationError}
                className="w-full"
              />
            </div>

            <div className="text-center">
              <h3 className="font-semibold mb-2">Custom Amount</h3>
              <DonationButton
                scope={{
                  kind: 'verse',
                  lang: 'run',
                  source: 'by67',
                  bookNumber: 43,
                  chapter: 3,
                  verse: 16
                }}
                amount={15}
                onSuccess={handleDonationSuccess}
                onError={handleDonationError}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h2>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. Environment Setup:</strong> Make sure your .env file has the correct Stripe keys</p>
            <p><strong>2. Backend Running:</strong> Ensure your backend server is running on port 7001</p>
            <p><strong>3. Test Cards:</strong> Use Stripe test card numbers (4242 4242 4242 4242)</p>
            <p><strong>4. API Endpoints:</strong> The system will call /api/v3/all-bibles/donations/intent</p>
            <p><strong>5. Success Flow:</strong> After successful payment, you'll see a success message</p>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">API Configuration</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
            <p><strong>Stripe Key:</strong> {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set'}</p>
            <p><strong>Internal API Key:</strong> {import.meta.env.VITE_INTERNAL_API_KEY ? 'Set' : 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationTest;
