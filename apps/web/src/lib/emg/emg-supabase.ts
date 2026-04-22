// src/lib/emg/emg-supabase.ts
import { createClient } from '../supabase/browser';

const supabase = createClient();

export interface EMGBatchReading {
  signal_value: number;
  normalized_value: number;
  fatigue_index: number;
}

export async function createEmgSession(patientId: string, activityType: string = 'general'): Promise<string> {
  const { data, error } = await supabase
    .from('emg_sessions')
    .insert({
      patient_id: patientId,
      activity_type: activityType,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create EMG session:', error);
    throw error;
  }
  
  return data.id;
}

export async function insertEmgBatch(sessionId: string, readings: EMGBatchReading[]): Promise<void> {
  if (!readings || readings.length === 0) return;

  const payload = readings.map((r) => ({
    session_id: sessionId,
    signal_value: r.signal_value,
    normalized_value: r.normalized_value,
    fatigue_index: r.fatigue_index,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('emg_readings').insert(payload);

  if (error) {
    console.error('Failed to insert EMG batch:', error);
    // Silent fail in production to prevent blocking the stream
  }
}

export async function endEmgSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('emg_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to end EMG session:', error);
  }
}

export async function getLatestEmgSummary(patientId: string): Promise<any> {
  const { data, error } = await supabase
    .from('emg_sessions')
    .select('*')
    .eq('patient_id', patientId)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // not found is OK
    console.error('Failed to fetch latest EMG summary:', error);
    return null;
  }
  return data;
}
