import React from 'react';

/**
 * OfferLabel — Discount / offer badge for products
 * Props:
 * - discount: number (e.g. 20 for 20%)
 * - type: 'percent' | 'flat' | 'badge'  (default 'percent')
 * - text: string (custom text, overrides auto-generated)
 * - size: 'sm' | 'md' | 'lg'
 */
export default function OfferLabel({ discount = 0, type = 'percent', text, size = 'md' }) {
  if (!discount && !text) return null;

  const sizeMap = {
    sm: { padding: '2px 8px', fontSize: '0.68rem' },
    md: { padding: '3px 10px', fontSize: '0.75rem' },
    lg: { padding: '5px 14px', fontSize: '0.85rem' },
  };

  const displayText =
    text || (type === 'percent'
      ? `${discount}% OFF`
      : type === 'flat'
        ? `₹${discount} OFF`
        : 'OFFER');

  return (
    <span className="offer-label" style={sizeMap[size]}>
      {displayText}
    </span>
  );
}

