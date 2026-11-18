import React from 'react';

export interface AudioWaveProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'main' | 'option';
}

export const AudioWaveMask: React.FC<AudioWaveProps> = ({
  className = '',
  onClick,
  variant = 'main',
}) => {
  const isMain = variant === 'main';

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center ${
        isMain ? 'gap-1.5 sm:gap-2 h-16 sm:h-20' : 'gap-1 h-8'
      } ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      title={onClick ? 'Click to play audio' : undefined}
    >
      {isMain ? (
        <>
          <div className="w-1.5 h-6 bg-[#FF6347] rounded-full animate-pulse opacity-75" style={{ animationDelay: '50ms' }}></div>
          <div className="w-1.5 h-10 bg-[#FF6347] rounded-full animate-pulse opacity-90" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-8 bg-[#FF6347] rounded-full animate-pulse opacity-80" style={{ animationDelay: '250ms' }}></div>
          <div className="w-1.5 h-14 bg-[#FF6347] rounded-full animate-pulse opacity-100" style={{ animationDelay: '350ms' }}></div>
          <div className="w-1.5 h-6 bg-[#FF6347] rounded-full animate-pulse opacity-65" style={{ animationDelay: '450ms' }}></div>
          <div className="w-1.5 h-16 bg-[#FF6347] rounded-full animate-pulse opacity-100" style={{ animationDelay: '100ms' }}></div>
          <div className="w-1.5 h-10 bg-[#FF6347] rounded-full animate-pulse opacity-85" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1.5 h-12 bg-[#FF6347] rounded-full animate-pulse opacity-95" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1.5 h-8 bg-[#FF6347] rounded-full animate-pulse opacity-75" style={{ animationDelay: '400ms' }}></div>
          <div className="w-1.5 h-16 bg-[#FF6347] rounded-full animate-pulse opacity-100" style={{ animationDelay: '500ms' }}></div>
          <div className="w-1.5 h-14 bg-[#FF6347] rounded-full animate-pulse opacity-90" style={{ animationDelay: '600ms' }}></div>
          <div className="w-1.5 h-8 bg-[#FF6347] rounded-full animate-pulse opacity-70" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-16 bg-[#FF6347] rounded-full animate-pulse opacity-100" style={{ animationDelay: '250ms' }}></div>
          <div className="w-1.5 h-10 bg-[#FF6347] rounded-full animate-pulse opacity-80" style={{ animationDelay: '350ms' }}></div>
          <div className="w-1.5 h-12 bg-[#FF6347] rounded-full animate-pulse opacity-95" style={{ animationDelay: '450ms' }}></div>
          <div className="w-1.5 h-6 bg-[#FF6347] rounded-full animate-pulse opacity-65" style={{ animationDelay: '550ms' }}></div>
          <div className="w-1.5 h-14 bg-[#FF6347] rounded-full animate-pulse opacity-90" style={{ animationDelay: '100ms' }}></div>
          <div className="w-1.5 h-10 bg-[#FF6347] rounded-full animate-pulse opacity-85" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1.5 h-16 bg-[#FF6347] rounded-full animate-pulse opacity-100" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1.5 h-8 bg-[#FF6347] rounded-full animate-pulse opacity-75" style={{ animationDelay: '400ms' }}></div>
          <div className="w-1.5 h-12 bg-[#FF6347] rounded-full animate-pulse opacity-90" style={{ animationDelay: '500ms' }}></div>
          <div className="w-1.5 h-6 bg-[#FF6347] rounded-full animate-pulse opacity-70" style={{ animationDelay: '600ms' }}></div>
        </>
      ) : (
        <>
          <div className="w-1.5 h-3 bg-[#FF6347] rounded-full animate-pulse opacity-75" style={{ animationDelay: '100ms' }}></div>
          <div className="w-1.5 h-6 bg-[#FF6347] rounded-full animate-pulse opacity-95" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1.5 h-4 bg-[#FF6347] rounded-full animate-pulse opacity-80" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1.5 h-8 bg-[#FF6347] rounded-full animate-pulse opacity-100" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-5 bg-[#FF6347] rounded-full animate-pulse opacity-85" style={{ animationDelay: '250ms' }}></div>
          <div className="w-1.5 h-7 bg-[#FF6347] rounded-full animate-pulse opacity-90" style={{ animationDelay: '350ms' }}></div>
          <div className="w-1.5 h-3 bg-[#FF6347] rounded-full animate-pulse opacity-65" style={{ animationDelay: '450ms' }}></div>
          <div className="w-1.5 h-6 bg-[#FF6347] rounded-full animate-pulse opacity-85" style={{ animationDelay: '550ms' }}></div>
        </>
      )}
    </div>
  );
};
