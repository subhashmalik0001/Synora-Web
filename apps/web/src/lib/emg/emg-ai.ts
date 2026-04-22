// src/lib/emg/emg-ai.ts
import { trpc } from '../trpc';
// Since we are running in the frontend mostly, we'll wrap the TRPC call or just use a helper function 
// that can be called from components which already have TRPC context.
// Alternatively, we can use the server-side AI client directly if we have an API route.
// Let's create a standalone function that calls a custom API route, or we can just use the existing chat route.
// For now, we'll implement a hybrid: Rule-based fallback if AI is unavailable.

export interface EMGHealthInsight {
  muscleHealthStatus: string;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
  recoveryTime: string;
  source: 'ai' | 'rule-based';
}

export async function analyzeEMGHealth(data: {
  fatigueLevel: string;
  fatigueIndex: number;
  strainDetected: boolean;
  peakSignals: number[];
  sessionDurationSeconds: number;
  averageFatigueIndex: number;
}): Promise<EMGHealthInsight> {
  // In a real scenario, this would POST to a Next.js API route that uses the Gemini client.
  // For immediate offline-first responsiveness, we use rule-based heuristics 
  // that mimic what the AI would return for common scenarios.

  const { fatigueLevel, fatigueIndex, strainDetected, peakSignals, averageFatigueIndex } = data;
  
  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  let status = "Muscle activity is well within normal thresholds.";
  let recs = ["Continue normal activity", "Maintain hydration"];
  let recovery = "No extra recovery needed";

  if (strainDetected || peakSignals.length > 5) {
    riskLevel = 'high';
    status = "Frequent abnormal spikes detected. High risk of muscle strain or hypertonicity.";
    recs = ["Stop activity immediately", "Apply cold compress", "Rest for 24-48 hours", "Consult a physician if pain persists"];
    recovery = "48-72 hours";
  } else if (fatigueLevel === 'high' || averageFatigueIndex > 0.6) {
    riskLevel = 'high';
    status = "Severe muscle fatigue detected. Neuromuscular efficiency is significantly reduced.";
    recs = ["End current session", "Focus on active recovery (light stretching)", "Replenish electrolytes"];
    recovery = "24-48 hours";
  } else if (fatigueLevel === 'moderate' || averageFatigueIndex > 0.3) {
    riskLevel = 'moderate';
    status = "Moderate muscle fatigue accumulating. Performance may begin to drop.";
    recs = ["Reduce intensity by 20-30%", "Incorporate longer rest intervals", "Ensure proper form"];
    recovery = "12-24 hours";
  }

  // Artificial delay to simulate AI processing time for the UI
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    muscleHealthStatus: status,
    riskLevel,
    recommendations: recs,
    recoveryTime: recovery,
    source: 'rule-based' // Replace with 'ai' when connected to Gemini backend
  };
}
