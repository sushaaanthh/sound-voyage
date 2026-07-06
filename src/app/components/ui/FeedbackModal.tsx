import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FeedbackModalProps {
  status: 'correct' | 'wrong' | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ status }) => {
  const isCorrect = status === 'correct';

  return (
    <AnimatePresence>
      {status && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
          {/* Card Container with Float-in / Float-out & Fade animations */}
          <motion.div
            key="feedback-modal-card"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -25 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-[400px] p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center text-center bg-white border ${
              isCorrect ? 'border-green-100 dark:border-green-900/30' : 'border-red-50 dark:border-red-900/30'
            }`}
          >
            {/* Concentric Rings & Icon Wrapper */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-5">

              {/* Outer Ring - Softest */}
              <div
                className={`absolute inset-0 rounded-full opacity-40 ${
                  isCorrect ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'
                }`}
              ></div>

              {/* Middle Ring - Slightly darker */}
              <div
                className={`absolute inset-3.5 rounded-full opacity-60 ${
                  isCorrect ? 'bg-green-200 dark:bg-green-800/50' : 'bg-red-200 dark:bg-red-800/50'
                }`}
              ></div>

              {/* Inner Icon Circle (Pure white with a crisp shadow) */}
              <div className="relative z-10 w-[4.5rem] h-[4.5rem] bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center">
                {isCorrect ? (
                  <Check className="w-8 h-8 text-green-500 stroke-[3.5]" />
                ) : (
                  <X className="w-8 h-8 text-red-500 stroke-[3.5]" />
                )}
              </div>

              {/* 4 Sparkles exactly matching the reference design layout */}
              <Sparkles
                className={`absolute top-2 left-2 w-4 h-4 opacity-70 ${
                  isCorrect ? 'text-green-300 dark:text-green-400' : 'text-red-300 dark:text-red-400'
                }`}
              />
              <Sparkles
                className={`absolute top-6 right-0 w-3 h-3 opacity-60 ${
                  isCorrect ? 'text-green-300 dark:text-green-400' : 'text-red-300 dark:text-red-400'
                }`}
              />
              <Sparkles
                className={`absolute bottom-5 left-1 w-3 h-3 opacity-60 ${
                  isCorrect ? 'text-green-300 dark:text-green-400' : 'text-red-300 dark:text-red-400'
                }`}
              />
              <Sparkles
                className={`absolute bottom-1 right-3 w-5 h-5 opacity-80 ${
                  isCorrect ? 'text-green-300 dark:text-green-400' : 'text-red-300 dark:text-red-400'
                }`}
              />
            </div>

            {/* Typography */}
            <h3 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight font-poppins">
              {isCorrect ? 'Correct Answer!' : 'Keep Trying!'}
            </h3>

            <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed">
              {isCorrect
                ? "Great job! You've got it right. Keep up the awesome work!"
                : "You're making progress. A little more practice and you'll get it!"}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;