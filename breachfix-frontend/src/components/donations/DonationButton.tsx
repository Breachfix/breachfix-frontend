import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ApiService } from '../../utils/api';
import { usePaymentTracking } from '../../hooks/usePaymentTracking';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here');

interface DonationButtonProps {
  scope: {
    kind: 'chapter' | 'verse' | 'book';
    lang: string;
    source: string;
    bookNumber: number;
    chapter: number;
    verse?: number;
  };
  amount: number;
  currency?: string;
  label?: string;
  className?: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
}

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  label: string;
  scope: DonationButtonProps['scope'];
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret: _clientSecret,
  amount,
  currency,
  label,
  scope,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { recordPayment } = usePaymentTracking();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donation-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setError(error.message || 'An error occurred during payment');
        onError(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Record the payment
        try {
          await recordPayment({
            scope,
            amount,
            currency,
            paymentIntentId: paymentIntent.id,
            status: 'succeeded'
          });
        } catch (recordError) {
          console.error('Failed to record payment:', recordError);
          // Don't fail the payment if recording fails
        }
        
        onSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Complete Your Donation</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Donating for:</p>
          <p className="font-medium">{label}</p>
          <p className="text-lg font-bold text-green-600">
            {currency.toUpperCase()} ${(amount / 100).toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <PaymentElement />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Donate ${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DonationButton: React.FC<DonationButtonProps> = ({
  scope,
  amount,
  currency = 'usd',
  label = 'Donate',
  className = '',
  onSuccess,
  onError
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDonationClick = async () => {
    setIsLoading(true);
    
    try {
      // Create donation intent
      const response = await ApiService.post('/all-bibles/donations/intent', {
        scope,
        amount: amount * 100, // Convert to cents
        currency: currency.toLowerCase(),
        returnUrl: `${window.location.origin}/donation-success`
      });

      if (response.success && response.clientSecret) {
        setClientSecret(response.clientSecret);
        setPaymentData({
          amount: response.amount,
          currency: response.currency,
          label: response.label
        });
        setShowPaymentForm(true);
      } else {
        throw new Error('Failed to create donation intent');
      }
    } catch (error) {
      console.error('Error creating donation intent:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setShowPaymentForm(false);
    setClientSecret(null);
    setPaymentData(null);
    onSuccess?.(paymentIntent);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    onError?.(error);
  };

  const handleCancel = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
    setPaymentData(null);
  };

  return (
    <>
      <button
        onClick={handleDonationClick}
        disabled={isLoading}
        className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? 'Loading...' : label}
      </button>

      {showPaymentForm && clientSecret && paymentData && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            clientSecret={clientSecret}
            amount={paymentData.amount}
            currency={paymentData.currency}
            label={paymentData.label}
            scope={scope}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handleCancel}
          />
        </Elements>
      )}
    </>
  );
};

export default DonationButton;
