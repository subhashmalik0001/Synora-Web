"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ProcessedEMG } from '@/lib/emg/emg-processing';

interface Props {
  history: ProcessedEMG[];
}

export function EMGLiveChart({ history }: Props) {
  const data = useMemo(() =>
    history.slice(-100).map((h, i) => ({
      t: i,
      signal: Math.round(h.normalized * 100),
    })),
    [history]
  );

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="signalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b8ff00" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#b8ff00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            contentStyle={{ background: '#05050a', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 900, color: '#b8ff00' }}
            itemStyle={{ color: '#b8ff00' }}
            formatter={(v: number) => [`${v}%`, 'Signal']}
            labelFormatter={() => ''}
            cursor={{ stroke: 'rgba(184, 255, 0, 0.2)', strokeWidth: 2 }}
          />
          <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: 'STRAIN THRESHOLD', fill: '#ef4444', fontSize: 10, fontWeight: 900 }} />
          <ReferenceLine y={50} stroke="#b0b0b0" strokeDasharray="3 3" strokeOpacity={0.2} label={{ position: 'insideTopLeft', value: 'BASELINE', fill: '#b0b0b0', fontSize: 10, fontWeight: 900 }} />
          <Line
            type="step"
            dataKey="signal"
            stroke="#b8ff00"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            fill="url(#signalGrad)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
