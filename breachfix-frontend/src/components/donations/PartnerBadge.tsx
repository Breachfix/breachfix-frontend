import React from 'react';
import PartnershipIndicator from './PartnershipIndicator';

interface PartnerBadgeProps {
  scope: {
    kind: 'verse' | 'chapter' | 'book';
    lang: string;
    source: string;
    bookNumber: number;
    chapter: number;
    verse?: number;
  };
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const PartnerBadge: React.FC<PartnerBadgeProps> = ({
  scope,
  userId,
  size = 'md',
  showText = true,
  className = ''
}) => {
  return (
    <PartnershipIndicator
      scope={scope}
      userId={userId}
      size={size}
      showText={showText}
      className={className}
    />
  );
};

export default PartnerBadge;
