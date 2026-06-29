import { supabase } from './supabase';

export interface GameSessionParams {
  progressorId: string;
  gameId: string;
  level: number;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: string | number;
}

/**
 * Universally submits telemetry data for completed game sessions and auto-unlocks levels.
 */
export async function submitGameSession(params: GameSessionParams) {
  try {
    // 1. Insert session results to game_sessions table
    const { error: insertError } = await supabase.from('game_sessions').insert([
      {
        progressor_id: params.progressorId,
        game_id: params.gameId,
        level: params.level,
        score: params.score,
        total_questions: params.totalQuestions,
        accuracy: params.accuracy,
        time_taken: String(params.timeTaken) // Ensures compatibility with text type in database
      }
    ]);

    if (insertError) {
      console.error('Failed to save game session telemetry:', insertError.message);
      return { success: false, error: insertError };
    }

    // 2. Perform progressor unlocked level array side-effect
    // Only update if they passed the level (accuracy > 70%) and progressorId is not "demo"
    if (params.accuracy > 70 && params.progressorId !== 'demo') {
      const primaryKey = `${params.gameId}-${params.level}`;
      
      // Determine alternative key spellings for bulletproof unlocking (e.g. sound-sync vs sound-synk)
      let alternateKey = '';
      if (params.gameId === 'sound-sync') {
        alternateKey = `sound-synk-${params.level}`;
      } else if (params.gameId === 'sound-synk') {
        alternateKey = `sound-sync-${params.level}`;
      }

      // Fetch existing completed_levels array
      const { data: profile, error: fetchError } = await supabase
        .from('progressors')
        .select('completed_levels')
        .eq('id', params.progressorId)
        .maybeSingle();

      if (fetchError) {
        console.error('Failed to fetch completed_levels for level unlock progression:', fetchError.message);
        return { success: true, warning: 'Telemetry inserted, but completed_levels retrieval failed.' };
      }

      let currentCompleted: string[] = [];
      if (profile?.completed_levels) {
        currentCompleted = Array.isArray(profile.completed_levels)
          ? profile.completed_levels.map(String)
          : [];
      }

      // Add keys if not already present
      const nextCompleted = [...currentCompleted];
      let updated = false;

      if (!nextCompleted.includes(primaryKey)) {
        nextCompleted.push(primaryKey);
        updated = true;
      }

      if (alternateKey && !nextCompleted.includes(alternateKey)) {
        nextCompleted.push(alternateKey);
        updated = true;
      }

      if (updated) {
        const { error: updateError } = await supabase
          .from('progressors')
          .update({ completed_levels: nextCompleted })
          .eq('id', params.progressorId);

        if (updateError) {
          console.error('Failed to update completed_levels in database:', updateError.message);
          return { success: true, warning: 'Telemetry inserted, but completed_levels update failed.' };
        }
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error during game session submission:', err);
    return { success: false, error: err };
  }
}
