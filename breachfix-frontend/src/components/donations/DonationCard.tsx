import React from 'react';
import DonationButton from './DonationButton';

interface DonationCardProps {
  title: string;
  description: string;
  scope: {
    kind: 'chapter' | 'verse' | 'book';
    lang: string;
    source: string;
    bookNumber: number;
    chapter: number;
    verse?: number;
  };
  suggestedAmounts?: number[];
  customAmount?: boolean;
  className?: string;
  onDonationSuccess?: (paymentIntent: any) => void;
  onDonationError?: (error: any) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({
  title,
  description,
  scope,
  suggestedAmounts = [5, 10, 25, 50],
  customAmount = true,
  className = '',
  onDonationSuccess,
  onDonationError
}) => {
  const [customAmountValue, setCustomAmountValue] = React.useState<number>(10);
  const [selectedAmount, setSelectedAmount] = React.useState<number>(10);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmountValue(amount);
  };

  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setCustomAmountValue(value);
    setSelectedAmount(value);
  };

  const formatReference = () => {
    const { bookNumber, chapter, verse, lang, source } = scope;
    const bookName = getBookName(bookNumber);
    
    if (verse) {
      return `${bookName} ${chapter}:${verse} (${lang.toUpperCase()} · ${source.toUpperCase()})`;
    }
    return `${bookName} ${chapter} (${lang.toUpperCase()} · ${source.toUpperCase()})`;
  };

  const getBookName = (bookNumber: number): string => {
    const bookNames: { [key: number]: string } = {
      1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
      6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
      11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
      16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
      21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
      26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
      31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
      36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi', 40: 'Matthew',
      41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts', 45: 'Romans',
      46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians', 50: 'Philippians',
      51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
      56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter',
      61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude', 66: 'Revelation'
    };
    return bookNames[bookNumber] || `Book ${bookNumber}`;
  };

  return (
    <div className={`bg-breachfix-dark rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-breachfix-gray mb-3">{description}</p>
        <div className="text-sm text-breachfix-gray bg-breachfix-gray bg-opacity-20 p-2 rounded">
          <strong>Reference:</strong> {formatReference()}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">Select Amount</h4>
        
        {/* Suggested amounts */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {suggestedAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              className={`p-3 border rounded-lg text-center transition-colors ${
                selectedAmount === amount
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className="font-semibold">${amount}</span>
            </button>
          ))}
        </div>

        {/* Custom amount */}
        {customAmount && (
          <div className="mb-4">
            <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-breachfix-gray">$</span>
              <input
                id="custom-amount"
                type="number"
                min="1"
                step="0.01"
                value={customAmountValue}
                onChange={handleCustomAmountChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter amount"
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <DonationButton
          scope={scope}
          amount={selectedAmount}
          onSuccess={onDonationSuccess}
          onError={onDonationError}
          className="w-full"
        />
      </div>

      <div className="mt-4 text-xs text-breachfix-gray">
        <p>• Secure payment powered by Stripe</p>
        <p>• Your donation helps support Bible translation work</p>
        <p>• You'll receive a receipt via email</p>
      </div>
    </div>
  );
};

export default DonationCard;
