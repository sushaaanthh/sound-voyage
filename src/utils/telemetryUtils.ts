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

export async function submitGameSession(params: GameSessionParams) {
  try {
    if (params.progressorId === 'demo') {
      return { success: true };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: { message: 'Authentication required' } };
    }

    const { data: profile, error: profileError } = await supabase
      .from('progressors')
      .select('auth_user_id')
      .eq('id', params.progressorId)
      .maybeSingle();

    if (profileError || !profile) {
      return { success: false, error: { message: 'Progressor not found' } };
    }

    if (profile.auth_user_id !== user.id) {
      return { success: false, error: { message: 'Unauthorized: not your progressor' } };
    }

    const clampedAccuracy = Math.max(0, Math.min(100, params.accuracy));
    const clampedScore = Math.max(0, params.score);
    const clampedTotalQuestions = Math.max(1, params.totalQuestions);

    const { error: insertError } = await supabase.from('game_sessions').insert([
      {
        progressor_id: params.progressorId,
        game_id: params.gameId,
        level: Math.max(1, params.level),
        score: clampedScore,
        total_questions: clampedTotalQuestions,
        accuracy: clampedAccuracy,
        time_taken: String(params.timeTaken)
      }
    ]);

    if (insertError) {
      console.error('Failed to save game session telemetry:', insertError.message);
      return { success: false, error: insertError };
    }

    if (clampedAccuracy > 70) {
      const primaryKey = `${params.gameId}-${params.level}`;

      let alternateKey = '';
      if (params.gameId === 'sound-sync') {
        alternateKey = `sound-synk-${params.level}`;
      } else if (params.gameId === 'sound-synk') {
        alternateKey = `sound-sync-${params.level}`;
      }

      const { data: currentProfile, error: fetchError } = await supabase
        .from('progressors')
        .select('completed_levels')
        .eq('id', params.progressorId)
        .maybeSingle();

      if (fetchError) {
        console.error('Failed to fetch completed_levels for level unlock progression:', fetchError.message);
        return { success: true, warning: 'Telemetry inserted, but completed_levels retrieval failed.' };
      }

      let currentCompleted: string[] = [];
      if (currentProfile?.completed_levels) {
        currentCompleted = Array.isArray(currentProfile.completed_levels)
          ? currentProfile.completed_levels.map(String)
          : [];
      }

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
