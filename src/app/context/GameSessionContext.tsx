import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface GameSessionContextType {
  progressorId: string | null;
  name: string | null;
  completedLevels: string[];
  assignedLevels: string[];
  setProgressor: (progressorId: string) => Promise<void>;
  saveGameResult: (
    gameId: string,
    level: number,
    score: number,
    accuracy: number,
    timeTaken: string,
    totalQuestions: number
  ) => Promise<void>;
  updateSession: (id: string, name: string, completedLevels: string[], assignedLevels: string[]) => void;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progressorId, setProgressorId] = useState<string | null>(() => {
    return sessionStorage.getItem('voyage_progressor_id');
  });
  const [name, setName] = useState<string | null>(() => {
    return sessionStorage.getItem('voyage_progressor_name');
  });
  const [completedLevels, setCompletedLevels] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('voyage_completed_levels');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return (Array.isArray(parsed) ? parsed : []).map(l => String(l));
    } catch {
      return [];
    }
  });

  const [assignedLevels, setAssignedLevels] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('voyage_assigned_levels');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return (Array.isArray(parsed) ? parsed : []).map(l => String(l));
    } catch {
      return [];
    }
  });

  const updateSession = (id: string, newName: string, levels: any[], assigned: any[]) => {
    setProgressorId(id);
    setName(newName);
    const stringLevels = (Array.isArray(levels) ? levels : []).map(l => String(l));
    setCompletedLevels(stringLevels);
    const stringAssigned = (Array.isArray(assigned) ? assigned : []).map(l => String(l));
    setAssignedLevels(stringAssigned);
    sessionStorage.setItem('voyage_progressor_id', id);
    sessionStorage.setItem('voyage_progressor_name', newName);
    sessionStorage.setItem('voyage_completed_levels', JSON.stringify(stringLevels));
    sessionStorage.setItem('voyage_assigned_levels', JSON.stringify(stringAssigned));
  };

  const setProgressor = async (id: string) => {
    if (progressorId === id) return;

    try {
      const { data, error } = await supabase
        .from('progressors')
        .select('name, completed_levels, assigned_levels')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching progressor profile:', error.message);
        // Fallback to offline/mock progressor if not found in DB
        updateSession(id, 'Demo Progressor', [], []);
      } else if (data) {
        updateSession(id, data.name || '', data.completed_levels || [], data.assigned_levels || []);
      }
    } catch (err) {
      console.error('Failed to set progressor:', err);
      updateSession(id, 'Demo Progressor', [], []);
    }
  };

  const saveGameResult = async (
    gameId: string,
    level: number,
    score: number,
    accuracy: number,
    timeTaken: string,
    totalQuestions: number
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
            total_questions: totalQuestions,
          },
        ]);

      if (sessionError) {
        console.error('Failed to write game session to Supabase:', sessionError.message);
      }

      // 2. If score is passing (accuracy >= 60%), append to completedLevels and update progressors table
      if (accuracy >= 60) {
        const compositeKey = `${gameId}-${level}`;
        const updatedLevels = completedLevels.includes(compositeKey)
          ? completedLevels
          : [...completedLevels, compositeKey];

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
        assignedLevels,
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
