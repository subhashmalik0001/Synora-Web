"use client";

import { Usb, Play, Square, FlaskConical, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { EMGMode } from '@/hooks/emg/useEmgStream';

interface Props {
  mode: EMGMode;
  isConnected: boolean;
  isSessionActive: boolean;
  patientId: string;
  connectionError?: string | null;
  onSetMode: (m: EMGMode) => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onStartSession: (patientId: string, activityType: string) => Promise<void>;
  onStopSession: () => Promise<any>;
}

export function EMGControlPanel({
  mode, isConnected, isSessionActive, patientId, connectionError,
  onSetMode, onConnect, onDisconnect, onStartSession, onStopSession,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [activityType, setActivityType] = useState('general');

  const handle = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 premium-card p-6 rounded-[32px]">
      <h3 className="text-[14px] font-black uppercase tracking-widest text-[#05050a]">Hardware Control</h3>
      
      {/* Mode toggle */}
      <div className="flex gap-2 p-1.5 bg-black/[0.03] rounded-xl">
        <button
          onClick={() => onSetMode('serial')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
            mode === 'serial' ? "bg-[#05050a] text-[#b8ff00]" : "text-[#8a8a8a] hover:text-[#05050a]"
          )}
        >
          <Usb className="w-4 h-4" /> Wired USB
        </button>
        <button
          onClick={() => onSetMode('simulation')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
            mode === 'simulation' ? "bg-[#05050a] text-[#b8ff00]" : "text-[#8a8a8a] hover:text-[#05050a]"
          )}
        >
          <FlaskConical className="w-4 h-4" /> Simulate
        </button>
      </div>

      {/* Activity type */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Activity Context</label>
        <select
            value={activityType}
            onChange={e => setActivityType(e.target.value)}
            className="w-full rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-[13px] font-bold text-[#05050a] outline-none focus:border-[#05050a] focus:ring-0 transition-all appearance-none"
        >
            <option value="general">General Activity</option>
            <option value="exercise">High Intensity (Exercise)</option>
            <option value="rehabilitation">Rehabilitation</option>
            <option value="rest">Resting Baseline</option>
        </select>
      </div>

      {/* Connect / Disconnect */}
      <div className="flex flex-col gap-2 pt-2">
        {!isConnected ? (
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#05050a] py-4 text-[13px] font-black uppercase tracking-widest text-[#b8ff00] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            onClick={() => handle(onConnect)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Usb className="w-5 h-5" />}
            Connect Device
          </button>
        ) : (
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#05050a] bg-white py-4 text-[13px] font-black uppercase tracking-widest text-[#05050a] hover:bg-black/[0.02] active:scale-95 transition-all disabled:opacity-50"
            onClick={() => handle(onDisconnect)}
            disabled={loading}
          >
            Disconnect
          </button>
        )}
        {connectionError && (
          <div className="rounded-lg bg-red-50 p-3 mt-2 border border-red-100">
            <p className="text-[11px] font-bold text-red-600 leading-tight">{connectionError}</p>
          </div>
        )}
      </div>

      {/* Start / Stop session */}
      {isConnected && (
        <div className="flex gap-2">
          {!isSessionActive ? (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#b8ff00] py-4 text-[13px] font-black uppercase tracking-widest text-[#05050a] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(184,255,0,0.3)] disabled:opacity-50"
              onClick={() => handle(() => onStartSession(patientId, activityType))}
              disabled={loading || !patientId}
            >
              <Play className="w-5 h-5" fill="currentColor" /> Start Session
            </button>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 py-4 text-[13px] font-black uppercase tracking-widest text-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
              onClick={() => handle(onStopSession)}
              disabled={loading}
            >
              <Square className="w-5 h-5" fill="currentColor" /> Stop Session
            </button>
          )}
        </div>
      )}
    </div>
  );
}
