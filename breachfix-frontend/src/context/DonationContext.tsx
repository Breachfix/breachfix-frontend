import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface DonationScope {
  kind: 'verse' | 'chapter' | 'book';
  lang: string;
  source: string;
  bookNumber: number;
  chapter: number;
  verse?: number;
}

interface DonationContextType {
  currentScope: DonationScope | null;
  setDonationScope: (scope: DonationScope) => void;
  showDonationModal: boolean;
  setShowDonationModal: (show: boolean) => void;
  donationAmount: number;
  setDonationAmount: (amount: number) => void;
  resetDonation: () => void;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

interface DonationProviderProps {
  children: ReactNode;
}

export const DonationProvider: React.FC<DonationProviderProps> = ({ children }) => {
  const [currentScope, setCurrentScope] = useState<DonationScope | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(10);

  const setDonationScope = (scope: DonationScope) => {
    setCurrentScope(scope);
    setShowDonationModal(true);
  };

  const resetDonation = () => {
    setCurrentScope(null);
    setShowDonationModal(false);
    setDonationAmount(10);
  };

  return (
    <DonationContext.Provider
      value={{
        currentScope,
        setDonationScope,
        showDonationModal,
        setShowDonationModal,
        donationAmount,
        setDonationAmount,
        resetDonation
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

export const useDonation = (): DonationContextType => {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
};
