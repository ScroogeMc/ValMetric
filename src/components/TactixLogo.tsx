import React from 'react';

interface TactixLogoProps {
  size?: number;
  className?: string;
}

export const TactixLogo: React.FC<TactixLogoProps> = ({ size = 24, className = '' }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-lg bg-white/10 border border-white/10 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Deferential Minimalist Geometric Focal Glyph */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="w-4 h-4 text-white"
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" strokeOpacity="0.4" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    </div>
  );
};
