import React from 'react';

export const AudioWaveMask: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 h-8 ${className}`}>
      <div className="w-1.5 h-4 bg-[#FF6347] rounded-full animate-pulse opacity-75"></div>
      <div className="w-1.5 h-8 bg-[#FF6347] rounded-full animate-pulse opacity-100" style={{ animationDelay: '150ms' }}></div>
      <div className="w-1.5 h-5 bg-[#FF6347] rounded-full animate-pulse opacity-80" style={{ animationDelay: '300ms' }}></div>
      <div className="w-1.5 h-7 bg-[#FF6347] rounded-full animate-pulse opacity-90" style={{ animationDelay: '450ms' }}></div>
      <div className="w-1.5 h-3 bg-[#FF6347] rounded-full animate-pulse opacity-60" style={{ animationDelay: '600ms' }}></div>
      <div className="w-1.5 h-6 bg-[#FF6347] rounded-full animate-pulse opacity-85" style={{ animationDelay: '750ms' }}></div>
      <div className="w-1.5 h-4 bg-[#FF6347] rounded-full animate-pulse opacity-70" style={{ animationDelay: '900ms' }}></div>
    </div>
  );
};
