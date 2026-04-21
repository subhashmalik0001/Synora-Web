"use client";

import { useState } from "react";
import {
    Activity, Heart, Thermometer, Droplets, ArrowUpRight, Loader2, 
    Zap, Plus, History, ChevronRight, Info, Target, Calendar,
    Settings, Shield, Sparkles, Wind
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, LineChart, Line
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function VitalsPage() {
    const [period, setPeriod] = useState('1W');
    
    // Data placeholders
    const { data: chartData, isLoading } = trpc.analytics.getRevenueChart.useQuery() as any;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#05050a]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        Vitals
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-sm">Precision tracking of your vital life signals. Log daily for better AI health insights.</p>
                </div>
                <button
                    className="flex items-center gap-2 rounded-xl bg-[#05050a] px-6 py-4 text-[14px] font-black text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-[1.05] active:scale-95"
                >
                    <Plus className="h-5 w-5" strokeWidth={3} />
                    LOG NEW VITALS
                </button>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Vitals History */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Primary Chart: Heart Rate Trend */}
                    <div className="premium-card rounded-[32px] p-8 md:p-10 flex flex-col gap-10">
                         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Heart Rate Trend (BPM)</p>
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-[54px] font-black tracking-tighter text-[#05050a]">72</h2>
                                    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-lg px-2 py-1 text-[12px] font-bold">
                                        <Activity className="h-3 w-3 mr-1" /> Resting
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                                {['1D', '1W', '1M'].map(t => (
                                    <button key={t} className={cn(
                                        "px-4 py-1.5 text-[11px] font-black rounded-lg transition-all",
                                        period === t ? "bg-white text-[#05050a] shadow-sm" : "text-[#8a8a8a] hover:text-[#05050a]"
                                    )} onClick={() => setPeriod(t)}>{t}</button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradientBP" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#d0d0d0', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip 
                                        cursor={{ stroke: '#05050a', strokeWidth: 1 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-[#05050a] text-white p-3 rounded-xl shadow-2xl border border-white/10">
                                                        <p className="text-[10px] font-bold text-[#b0b0b0]">{payload[0].payload.date}</p>
                                                        <p className="text-[16px] font-black text-red-500">{payload[0].value} BPM</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#ef4444" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#gradientBP)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Vitals Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Blood Oxygen */}
                        <div className="premium-card rounded-[32px] p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Wind className="h-6 w-6" />
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[10px] font-black">98% SPO2</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Blood Oxygen</p>
                                <h3 className="text-[28px] font-black text-[#05050a]">Steady Range</h3>
                            </div>
                            <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[98%] rounded-full" />
                            </div>
                        </div>

                        {/* Temperature */}
                        <div className="premium-card rounded-[32px] p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Thermometer className="h-6 w-6" />
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[10px] font-black">NORMAL</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Body Temp</p>
                                <h3 className="text-[28px] font-black text-[#05050a]">98.6 °F</h3>
                            </div>
                            <p className="text-[11px] font-medium text-[#8a8a8a]">Last sync: 20 mins ago via Apple Health</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Logging & Recent Logs */}
                <div className="xl:col-span-4 space-y-6">
                    <h3 className="text-[20px] font-black tracking-tight text-[#05050a] px-2" style={{ fontFamily: "var(--font-display)" }}>Recent Logs</h3>
                    
                    <div className="premium-card rounded-[32px] overflow-hidden">
                        <div className="divide-y divide-black/[0.04]">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-5 transition-all hover:bg-black/[0.01] group">
                                    <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-[#b8ff00] group-hover:scale-110 transition-transform">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[14px] font-black text-[#05050a]">Log #{i+240}</span>
                                        <span className="text-[11px] font-bold text-[#b0b0b0]">Oct {24-i}, 2023 • Morning</span>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <span className="text-[13px] font-black text-[#05050a]">118/79</span>
                                        <p className="text-[9px] font-bold text-[#8a8a8a]">SYS/DIA</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-[#d0d0d0] group-hover:text-black transition-colors" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 text-[11px] font-black uppercase tracking-widest text-[#8a8a8a] bg-black/[0.01] hover:bg-black/[0.03] transition-all">
                            View All Logs
                        </button>
                    </div>

                    <div className="bg-[#b8ff00] rounded-[32px] p-8 text-[#05050a] relative overflow-hidden group border border-black/5 shadow-xl shadow-[#b8ff00]/10">
                         <div className="relative z-10 space-y-4">
                            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-[#b8ff00]">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h4 className="text-[20px] font-black tracking-tight leading-tight">Connect Devices</h4>
                            <p className="text-[13px] font-bold leading-relaxed opacity-70 italic">
                                Sync with Apple Health, Google Fit, or Oura to automate vital tracking.
                            </p>
                            <button className="w-full bg-black text-white py-3 rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                                CONNECT NOW
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
