"use client";

import { useEmgStream } from '@/hooks/emg/useEmgStream';
import { EMGControlPanel } from '@/components/emg/EMGControlPanel';
import { EMGFatigueGauge } from '@/components/emg/EMGFatigueGauge';
import { EMGLiveChart } from '@/components/emg/EMGLiveChart';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { analyzeEMGHealth, EMGHealthInsight } from '@/lib/emg/emg-ai';

export default function EMGHealthPage() {
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const patientId = profile?.user?.id || '';

  const {
    mode, setMode, isConnected, isSessionActive, currentSignal,
    fatigueLevel, strainDetected, history, durationSeconds, connectionError,
    connect, disconnect, startSession, stopSession
  } = useEmgStream();

  const [insight, setInsight] = useState<EMGHealthInsight | null>(null);

  // Auto-analyze when session ends or history reaches certain milestones
  useEffect(() => {
    if (!isSessionActive && history.length > 0) {
      const fatigueIndex = history[history.length - 1]?.fatigueIndex || 0;
      const avgFatigue = history.reduce((a, b) => a + b.fatigueIndex, 0) / history.length;
      const peaks = history.filter(h => h.normalized > 0.7).map(h => h.normalized);
      
      analyzeEMGHealth({
        fatigueLevel,
        fatigueIndex,
        strainDetected,
        peakSignals: peaks,
        sessionDurationSeconds: durationSeconds,
        averageFatigueIndex: avgFatigue
      }).then(setInsight);
    }
  }, [isSessionActive, history.length]);

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
            EMG Monitor
        </h1>
        <p className="text-[15px] font-medium text-[#8a8a8a] max-w-sm">
            Live clinical-grade surface electromyography monitoring and fatigue analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Col: Live Data */}
        <div className="xl:col-span-8 space-y-8">
          
          <div className="premium-card rounded-[32px] p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden bg-[#05050a] text-white">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a8a8a]">Live Muscle Signal (EMG)</p>
                    <div className="flex items-baseline gap-4">
                        <h2 className="text-[54px] font-black tracking-tighter text-[#b8ff00]">{currentSignal}</h2>
                        <span className="text-[14px] font-black text-[#8a8a8a]">mV Normalized</span>
                    </div>
                </div>
                {strainDetected && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Strain Detected</span>
                    </div>
                )}
            </div>

            <div className="h-[300px] w-full relative z-10">
                <EMGLiveChart history={history} />
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b8ff00] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
          </div>

          {/* Analysis / AI Panel */}
          {insight && (
            <div className="premium-card rounded-[32px] p-8 space-y-6 border border-black/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-[#b8ff00]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-[20px] font-black tracking-tight text-[#05050a]">AI Health Insight</h3>
              </div>
              <p className="text-[15px] font-medium text-[#05050a] leading-relaxed">
                {insight.muscleHealthStatus}
              </p>
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#8a8a8a]">Recommendations</p>
                <ul className="space-y-2">
                  {insight.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-center gap-2 text-[14px] font-bold text-[#05050a]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#b8ff00]" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Controls & Gauges */}
        <div className="xl:col-span-4 space-y-8">
            <EMGControlPanel
                mode={mode}
                isConnected={isConnected}
                isSessionActive={isSessionActive}
                patientId={patientId}
                connectionError={connectionError}
                onSetMode={setMode}
                onConnect={connect}
                onDisconnect={disconnect}
                onStartSession={startSession}
                onStopSession={stopSession}
            />

            <div className="premium-card rounded-[32px] p-8 space-y-6">
                <h3 className="text-[14px] font-black uppercase tracking-widest text-[#05050a]">Fatigue Analysis</h3>
                <EMGFatigueGauge fatigueLevel={fatigueLevel} fatigueIndex={history[history.length - 1]?.fatigueIndex || 0} />
                
                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#8a8a8a]">Session Duration</span>
                    <span className="text-[14px] font-black text-[#05050a]">{Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
