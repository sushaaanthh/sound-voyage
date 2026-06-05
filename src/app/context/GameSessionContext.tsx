import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface GameSessionContextType {
  progressorId: string | null;
  name: string | null;
  completedLevels: number[];
  setProgressor: (progressorId: string) => Promise<void>;
  saveGameResult: (
    gameId: string,
    level: number,
    score: number,
    accuracy: number,
    timeTaken: string
  ) => Promise<void>;
  updateSession: (id: string, name: string, completedLevels: number[]) => void;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progressorId, setProgressorId] = useState<string | null>(() => {
    return sessionStorage.getItem('voyage_progressor_id');
  });
  const [name, setName] = useState<string | null>(() => {
    return sessionStorage.getItem('voyage_progressor_name');
  });
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    const saved = sessionStorage.getItem('voyage_completed_levels');
    return saved ? JSON.parse(saved) : [];
  });

  const updateSession = (id: string, newName: string, levels: number[]) => {
    setProgressorId(id);
    setName(newName);
    setCompletedLevels(levels);
    sessionStorage.setItem('voyage_progressor_id', id);
    sessionStorage.setItem('voyage_progressor_name', newName);
    sessionStorage.setItem('voyage_completed_levels', JSON.stringify(levels));
  };

  const setProgressor = async (id: string) => {
    if (progressorId === id) return;

    try {
      const { data, error } = await supabase
        .from('progressors')
        .select('name, completed_levels')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching progressor profile:', error.message);
        // Fallback to offline/mock progressor if not found in DB
        updateSession(id, 'Demo Progressor', []);
      } else if (data) {
        updateSession(id, data.name || '', data.completed_levels || []);
      }
    } catch (err) {
      console.error('Failed to set progressor:', err);
      updateSession(id, 'Demo Progressor', []);
    }
  };

  const saveGameResult = async (
    gameId: string,
    level: number,
    score: number,
    accuracy: number,
    timeTaken: string
  ) => {
    const activeId = progressorId || 'demo';
    
    try {
      // 1. Write the session result to the game_sessions table
      const { error: sessionError } = await supabase
        .from('game_sessions')
        .insert([
          {
            progressor_id: activeId,
            game_id: gameId,
            level: level,
            score: score,
            accuracy: accuracy,
            time_taken: timeTaken,
          },
        ]);

      if (sessionError) {
        console.error('Failed to write game session to Supabase:', sessionError.message);
      }

      // 2. If score is passing (accuracy >= 60%), append to completedLevels and update progressors table
      if (accuracy >= 60) {
        const updatedLevels = completedLevels.includes(level)
          ? completedLevels
          : [...completedLevels, level].sort((a, b) => a - b);

        setCompletedLevels(updatedLevels);
        sessionStorage.setItem('voyage_completed_levels', JSON.stringify(updatedLevels));

        if (activeId !== 'demo') {
          const { error: progressorError } = await supabase
            .from('progressors')
            .update({ completed_levels: updatedLevels })
            .eq('id', activeId);

          if (progressorError) {
            console.error('Failed to update progressor levels in Supabase:', progressorError.message);
          }
        }
      }
    } catch (err) {
      console.error('Failed to save game result:', err);
    }
  };

  return (
    <GameSessionContext.Provider
      value={{
        progressorId,
        name,
        completedLevels,
        setProgressor,
        saveGameResult,
        updateSession,
      }}
    >
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
