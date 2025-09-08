import { useState } from 'react';
import type { DonationScope } from '../context/DonationContext';

export const useDonation = () => {
  const [donationScope, setDonationScope] = useState<DonationScope | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleDonationClick = (scope: DonationScope, amount?: number) => {
    setDonationScope(scope);
    if (amount) {
      setDonationAmount(amount);
    }
    setShowModal(true);
  };
  
  const handleDonationSuccess = (paymentIntent: any) => {
    console.log('Donation successful:', paymentIntent);
    setShowModal(false);
    setDonationScope(null);
    setIsProcessing(false);
  };
  
  const handleDonationError = (error: any) => {
    console.error('Donation error:', error);
    setIsProcessing(false);
  };
  
  const handleDonationCancel = () => {
    setShowModal(false);
    setDonationScope(null);
    setIsProcessing(false);
  };
  
  return {
    donationScope,
    showModal,
    donationAmount,
    isProcessing,
    setDonationAmount,
    setIsProcessing,
    handleDonationClick,
    handleDonationSuccess,
    handleDonationError,
    handleDonationCancel
  };
};
