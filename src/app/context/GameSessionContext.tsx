import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../../lib/supabase';

export interface SessionProgress {
  explorerId: string;
  completedLevels: {
    [gameId: string]: number[];
  };
  scores: {
    [gameId: string]: {
      [level: number]: { score: number; accuracy: number; timeTaken: string };
    };
  };
}

interface GameSessionContextType {
  progress: SessionProgress | null;
  setExplorer: (explorerId: string) => void;
  completeLevel: (
    gameId: string,
    level: number,
    score: number,
    accuracy: number,
    timeTaken: string
  ) => void;
  updateProgress: (newProgress: SessionProgress) => void;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<SessionProgress | null>(null);

  const setExplorer = (explorerId: string) => {
    if (progress && progress.explorerId === explorerId) return;

    const saved = sessionStorage.getItem(`voyage_progress_${explorerId}`);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }

    const newProgress: SessionProgress = {
      explorerId,
      completedLevels: {},
      scores: {},
    };
    setProgress(newProgress);
    sessionStorage.setItem(`voyage_progress_${explorerId}`, JSON.stringify(newProgress));
  };

  const updateProgress = (newProgress: SessionProgress) => {
    setProgress(newProgress);
    sessionStorage.setItem(`voyage_progress_${newProgress.explorerId}`, JSON.stringify(newProgress));
  };

  const completeLevel = (
    gameId: string,
    level: number,
    score: number,
    accuracy: number,
    timeTaken: string
  ) => {
    if (!progress) return;

    const completed = progress.completedLevels[gameId] || [];
    const updatedCompleted = completed.includes(level)
      ? completed
      : [...completed, level].sort((a, b) => a - b);

    const gameScores = progress.scores[gameId] || {};
    const updatedScores = {
      ...gameScores,
      [level]: { score, accuracy, timeTaken },
    };

    const updatedProgress: SessionProgress = {
      ...progress,
      completedLevels: {
        ...progress.completedLevels,
        [gameId]: updatedCompleted,
      },
      scores: {
        ...progress.scores,
        [gameId]: updatedScores,
      },
    };

    setProgress(updatedProgress);
    sessionStorage.setItem(
      `voyage_progress_${progress.explorerId}`,
      JSON.stringify(updatedProgress)
    );

    // Sync back to Supabase database if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('explorers')
          .update({ progress_data: JSON.stringify(updatedProgress) })
          .eq('auth_user_id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to sync progress to Supabase:', error);
            }
          });
      }
    });
  };

  return (
    <GameSessionContext.Provider value={{ progress, setExplorer, completeLevel, updateProgress }}>
      {children}
    </GameSessionContext.Provider>
  );
};

export const useGameSession = () => {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
};
