import React, { createContext, useContext, useState } from 'react';

export interface SessionProgress {
  patientId: string;
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
  setPatient: (patientId: string) => void;
  completeLevel: (
    gameId: string,
    level: number,
    score: number,
    accuracy: number,
    timeTaken: string
  ) => void;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<SessionProgress | null>(null);

  const setPatient = (patientId: string) => {
    if (progress && progress.patientId === patientId) return;

    const saved = sessionStorage.getItem(`voyage_progress_${patientId}`);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }

    const newProgress: SessionProgress = {
      patientId,
      completedLevels: {},
      scores: {},
    };
    setProgress(newProgress);
    sessionStorage.setItem(`voyage_progress_${patientId}`, JSON.stringify(newProgress));
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
      `voyage_progress_${progress.patientId}`,
      JSON.stringify(updatedProgress)
    );
  };

  return (
    <GameSessionContext.Provider value={{ progress, setPatient, completeLevel }}>
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
