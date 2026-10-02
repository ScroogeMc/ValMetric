import React from 'react';

interface GamerAvatarProps {
  size?: number;
  className?: string;
  name?: string;
}

export const GamerAvatar: React.FC<GamerAvatarProps> = ({ 
  size = 44, 
  className = '',
  name = 'Phantom'
}) => {
  return (
    <div 
      className={`relative rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-[#28282C] border border-white/10 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        className="w-full h-full text-zinc-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="18" r="8" fill="#52525B" />
        <path 
          d="M10 40 C10 30, 16 28, 24 28 C32 28, 38 30, 38 40" 
          fill="#3F3F46" 
        />
        {/* Subtle minimal headphones outline */}
        <path 
          d="M14 20 C14 12, 34 12, 34 20" 
          stroke="#A1A1AA" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <rect x="12" y="18" width="4" height="8" rx="2" fill="#71717A" />
        <rect x="32" y="18" width="4" height="8" rx="2" fill="#71717A" />
      </svg>
    </div>
  );
};
