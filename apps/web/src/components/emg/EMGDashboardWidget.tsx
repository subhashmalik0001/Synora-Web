"use client";

import { useEffect, useState } from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLatestEmgSummary } from '@/lib/emg/emg-supabase';
// Import session or user context depending on Synora's auth (we can pass patientId as prop to keep it simple and reusable)

export function EMGDashboardWidget({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!patientId) return;
    getLatestEmgSummary(patientId).then(setSummary).catch(() => {});
  }, [patientId]);

  return (
    <div
      onClick={() => router.push('/patient/emg')}
      className="flex items-center gap-4 p-6 bg-white border border-black/5 rounded-[32px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm hover:shadow-xl hover:shadow-black/5 group"
    >
      <div className="h-12 w-12 rounded-2xl bg-[#b8ff00]/10 flex items-center justify-center text-[#9acd32] group-hover:bg-[#b8ff00] group-hover:text-[#05050a] transition-colors">
        <Activity className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-[14px] font-black tracking-tight text-[#05050a]">EMG Muscle Monitor</p>
        {summary ? (
          <p className="text-[11px] font-bold text-[#8a8a8a] truncate">
            Last session: {new Date(summary.started_at).toLocaleDateString()} • {summary.activity_type}
          </p>
        ) : (
          <p className="text-[11px] font-bold text-[#8a8a8a]">No sessions yet — tap to start</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-[#d0d0d0] group-hover:text-[#05050a] transition-colors shrink-0" />
    </div>
  );
}
