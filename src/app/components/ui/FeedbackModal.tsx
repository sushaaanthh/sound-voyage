import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export interface FeedbackModalProps {
  status: 'correct' | 'wrong' | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ status }) => {
  if (!status) return null;

  const isCorrect = status === 'correct';

  return (
    {/* Task 1: The Overlay & Container */}
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
      {/* Card Container */}
      <div
        className={`w-[400px] p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center text-center transform transition-all duration-300 scale-100 opacity-100 ${
          isCorrect
            ? 'bg-gradient-to-b from-[#f2fbf5] to-white border border-green-100 dark:from-green-950/80 dark:to-card dark:border-green-900/50'
            : 'bg-gradient-to-b from-[#fff5f5] to-white border border-red-50 dark:from-rose-950/80 dark:to-card dark:border-rose-900/50'
        }`}
      >
        {/* Task 2: Concentric Rings & Icon */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          {/* Outer Ring - Lightest */}
          <div
            className={`absolute inset-0 rounded-full ${
              isCorrect ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'
            }`}
          ></div>

          {/* Middle Ring */}
          <div
            className={`absolute inset-4 rounded-full ${
              isCorrect ? 'bg-green-100/50 dark:bg-green-800/40' : 'bg-red-100/50 dark:bg-red-800/40'
            }`}
          ></div>

          {/* Inner Icon Circle (White with slight shadow) */}
          <div className="relative z-10 w-16 h-16 bg-white dark:bg-card rounded-full shadow-sm flex items-center justify-center">
            {isCorrect ? (
              <Check className="w-8 h-8 text-[#4ade80] stroke-[3]" />
            ) : (
              <X className="w-8 h-8 text-[#f87171] stroke-[3]" />
            )}
          </div>

          {/* Sparkles / Decorative Stars */}
          <Sparkles
            className={`absolute top-0 left-2 w-4 h-4 ${
              isCorrect ? 'text-green-300 dark:text-green-400' : 'text-red-300 dark:text-red-400'
            }`}
          />
          <Sparkles
            className={`absolute bottom-4 right-0 w-5 h-5 ${
              isCorrect ? 'text-green-300 dark:text-green-400' : 'text-red-300 dark:text-red-400'
            }`}
          />
        </div>

        {/* Task 3: Typography */}
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-3 tracking-tight font-poppins">
          {isCorrect ? 'Correct Answer!' : 'Keep Trying!'}
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[260px] leading-relaxed font-sans">
          {isCorrect
            ? "Great job! You've got it right. Keep up the awesome work!"
            : "You're making progress. A little more practice and you'll get it!"}
        </p>
      </div>
    </div>
  );
};

export default FeedbackModal;
