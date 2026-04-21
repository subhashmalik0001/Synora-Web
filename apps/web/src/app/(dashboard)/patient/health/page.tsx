"use client";

import { useState } from "react";
import {
    Activity, TrendingUp, TrendingDown, ArrowUpRight, Loader2, 
    Heart, Droplets, Thermometer, Zap, Sparkles, ChevronRight,
    Info, Target, Calendar
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function HealthAnalyticsPage() {
    const [period, setPeriod] = useState('1M');
    
    // Data placeholders
    const { data: metrics, isLoading } = trpc.analytics.getDashboardMetrics.useQuery() as any;
    const { data: chartData } = trpc.analytics.getRevenueChart.useQuery() as any;

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
                        Biometrics
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-sm">Deep-dive into your physiological data and AI-driven health projections.</p>
                </div>
                <div className="flex gap-1 bg-black/5 p-1.5 rounded-2xl border border-black/5">
                    {['1W', '1M', '3M', 'YTD', 'ALL'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setPeriod(t)}
                            className={cn(
                                "px-5 py-2 text-[11px] font-black rounded-xl transition-all",
                                period === t ? "bg-white text-[#05050a] shadow-sm" : "text-[#b0b0b0] hover:text-[#05050a]"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Row: Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Heart Rate', value: '72', unit: 'BPM', status: 'optimal', icon: Heart, color: 'text-red-500' },
                    { label: 'Blood Glucose', value: '94', unit: 'mg/dL', status: 'optimal', icon: Droplets, color: 'text-blue-500' },
                    { label: 'Avg Sleep', value: '7.4', unit: 'Hrs', status: 'warning', icon: Activity, color: 'text-[#b8ff00]' },
                    { label: 'Body Temp', value: '98.6', unit: '°F', status: 'optimal', icon: Thermometer, color: 'text-orange-500' },
                ].map((m, i) => (
                    <div key={i} className="premium-card rounded-[32px] p-8 space-y-4 group hover:border-[#b8ff00] transition-all">
                        <div className="flex items-center justify-between">
                            <div className={cn("h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center", m.color.replace('text-', 'bg-').replace('500', '500/10'))}>
                                <m.icon className={cn("h-6 w-6", m.color)} />
                            </div>
                            <Badge className={cn(
                                "rounded-lg px-2.5 py-1 text-[10px] uppercase font-black tracking-widest border border-transparent shadow-sm",
                                m.status === 'optimal' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                            )}>
                                {m.status}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">{m.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-[36px] font-black tracking-tighter text-[#05050a]">{m.value}</h3>
                                <span className="text-[14px] font-bold text-[#8a8a8a]">{m.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Wellness Score Trend */}
                <div className="xl:col-span-8 premium-card rounded-[32px] p-8 md:p-10 flex flex-col gap-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Wellness Evolution</h3>
                            <p className="text-[12px] font-medium text-[#8a8a8a]">Composite score based on lab reports, vitals, and lifestyle.</p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[14px]">
                            <TrendingUp className="h-4 w-4" />
                            <span>+4.2%</span>
                        </div>
                    </div>

                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientBio" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#b8ff00" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#b8ff00" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#d0d0d0', fontSize: 11, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{ stroke: '#05050a', strokeWidth: 1 }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#05050a] text-white p-4 rounded-2xl shadow-2xl border border-white/10">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0] mb-1">{payload[0].payload.date}</p>
                                                    <p className="text-[18px] font-black text-[#b8ff00]">{payload[0].value} Score</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#05050a" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#gradientBio)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: AI Projections & Goals */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Activity Goal */}
                    <div className="bg-[#05050a] rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between h-[280px]">
                        <Zap className="absolute -right-8 -bottom-8 h-40 w-40 text-white/[0.03]" />
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Daily Flux</p>
                                <span className="text-[11px] font-black text-[#b8ff00]">80% REACHED</span>
                            </div>
                            <h3 className="text-[32px] font-black tracking-tight leading-tight">6,400 <span className="text-[14px] text-white/40 font-bold">/ 8,000 STEPS</span></h3>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#b8ff00] w-[80%] rounded-full shadow-[0_0_15px_rgba(184,255,0,0.4)]" />
                            </div>
                        </div>
                        <div className="pt-8 relative z-10">
                            <p className="text-[13px] font-medium text-white/60">Estimated calorie burn: <span className="text-white font-bold">420 kcal</span></p>
                            <button className="mt-4 flex items-center gap-2 text-[12px] font-black text-[#b8ff00] uppercase tracking-widest">
                                Manage Goals <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* AI Advisory */}
                    <div className="premium-card rounded-[32px] p-8 flex flex-col gap-6 group hover:border-[#b8ff00] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#b8ff00]/10 flex items-center justify-center text-[#05050a]">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h4 className="text-[16px] font-black text-[#05050a]">Proactive Advice</h4>
                        </div>
                        <p className="text-[14px] font-medium text-[#8a8a8a] leading-relaxed">
                            Your <span className="text-[#05050a] font-bold underline decoration-[#b8ff00] decoration-2">Vitamin D</span> trends show a slight decline compared to last month. Consider 15 mins of midday sun.
                        </p>
                        <button className="mt-auto flex items-center gap-2 text-[12px] font-black text-[#05050a] uppercase tracking-widest border-t border-black/5 pt-4 group-hover:gap-3 transition-all">
                            Full Analysis <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Biomarker Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[24px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Bio-Marker Distribution</h3>
                    <button className="flex items-center gap-2 text-[12px] font-extrabold text-[#b0b0b0] hover:text-[#05050a] transition-colors">
                        <Info className="h-4 w-4" /> REFERENCE RANGES
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Cholesterol', value: 180, max: 200, unit: 'mg/dL', status: 'normal' },
                        { name: 'Hemoglobin', value: 14.2, max: 17, unit: 'g/dL', status: 'normal' },
                        { name: 'Creatinine', value: 1.1, max: 1.3, unit: 'mg/dL', status: 'alert' }
                    ].map((bio, i) => (
                        <div key={i} className="premium-card rounded-[32px] p-8 space-y-6 flex flex-col">
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] font-black text-[#05050a]">{bio.name}</span>
                                <Badge className={cn(
                                    "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                                    bio.status === 'normal' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                )}>
                                    {bio.status}
                                </Badge>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-[28px] font-black text-[#05050a]">{bio.value} <span className="text-[12px] text-[#8a8a8a]">{bio.unit}</span></span>
                                    <span className="text-[11px] font-bold text-[#b0b0b0]">Limit: {bio.max}</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/5 rounded-full relative">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-1000", bio.status === 'normal' ? "bg-[#b8ff00]" : "bg-red-500")}
                                        style={{ width: `${(bio.value / bio.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <button className="mt-4 text-[11px] font-bold text-[#b0b0b0] hover:text-[#05050a] transition-colors flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Historical Data
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
