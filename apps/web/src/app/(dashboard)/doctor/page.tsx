"use client";

import { useState } from "react";
import {
    Users, Activity, Calendar, Zap, ArrowUpRight, Loader2, 
    MessageCircle, Search, Clock, ChevronRight, UserPlus, Star,
    TrendingUp, FileText, CheckCircle2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function DoctorDashboard() {
    // Data placeholders
    const { data: metrics, isLoading: isMetricsLoading } = trpc.analytics.getDashboardMetrics.useQuery() as any;
    const { data: chartData, isLoading: isChartLoading } = trpc.analytics.getRevenueChart.useQuery() as any;
    const { data: profile } = trpc.settings.getProfile.useQuery() as any;

    if (isMetricsLoading || isChartLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#05050a]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
            {/* Header / Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 space-y-2">
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-[1.1]" style={{ fontFamily: "var(--font-display)" }}>
                        Managing your <span className="text-[#b8ff00] bg-[#05050a] px-3 rounded-xl inline-block rotate-[-1deg]">practice</span>,<br />enhanced by AI.
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-md">Hello, Dr. {profile?.user?.name.split(' ')[0] || 'Doctor'}. You have 8 consultations scheduled for today.</p>
                </div>
                <div className="lg:col-span-4 flex justify-end gap-3">
                    <button
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-3 text-[13px] font-bold text-[#05050a] transition-all hover:premium-shadow active:scale-95"
                    >
                        <Calendar className="h-4 w-4" /> Schedule
                    </button>
                    <button
                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-5 py-3 text-[13px] font-bold text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
                    >
                        <Zap className="h-4 w-4" />
                        Start OPD
                    </button>
                </div>
            </div>

            {/* The "Primary" Stats Card */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Consultation Volume / Revenue */}
                <div className="xl:col-span-8 premium-card rounded-[32px] p-8 md:p-10 flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Patient Volume (Weekly)</p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-[54px] font-black tracking-tighter text-[#05050a]">124</h2>
                                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-lg px-2 py-1 text-[12px] font-bold animate-pulse">
                                    <TrendingUp className="h-3 w-3 mr-1" /> Over Target
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                            {['1D', '1W', '1M', 'ALL'].map(t => (
                                <button key={t} className={cn(
                                    "px-4 py-1.5 text-[11px] font-black rounded-lg transition-all",
                                    t === '1W' ? "bg-white text-[#05050a] shadow-sm" : "text-[#8a8a8a] hover:text-[#05050a]"
                                )}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="doctorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#b8ff00" stopOpacity={0.25} />
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
                                    cursor={{ stroke: '#05050a', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#05050a] text-white p-4 rounded-2xl shadow-2xl border border-white/10">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0] mb-1">{payload[0].payload.date}</p>
                                                    <p className="text-[18px] font-black text-[#b8ff00]">{payload[0].value} patients</p>
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
                                    fill="url(#doctorRev)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Active Patients Summary */}
                    <div className="premium-card rounded-[32px] p-8 flex flex-col justify-between flex-1 relative overflow-hidden group">
                        <Users className="absolute -right-6 -bottom-6 h-32 w-32 text-black/[0.02] transition-transform group-hover:scale-110" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Unique Patients</p>
                            <h3 className="text-[42px] font-black tracking-tighter text-[#05050a]">542</h3>
                        </div>
                        <div className="pt-6">
                            <div className="flex items-center gap-1 text-[12px] font-bold text-emerald-500 mb-4">
                                <Star className="h-4 w-4 text-[#b8ff00] fill-[#b8ff00]" />
                                <span>4.9 Avg. Rating</span>
                            </div>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-sm">
                                        <div className="h-full w-full bg-[#05050a] text-[#b8ff00] flex items-center justify-center">P</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Productivity Insight */}
                    <div className="bg-[#05050a] rounded-[32px] p-8 text-white flex flex-col justify-between h-[200px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <Clock className="h-8 w-8 text-[#b8ff00]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Efficiency Insight</p>
                            <p className="text-[15px] font-bold leading-snug">Average consultation time: <span className="text-[#b8ff00]">12 mins</span>. You are on track for today's OPD.</p>
                        </div>
                        <button className="text-[11px] font-black uppercase tracking-widest text-[#b8ff00] flex items-center gap-2 group-hover:gap-3 transition-all">
                            Efficiency Report <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Next Patients & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Next in Queue */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Next in Queue</h3>
                        <button className="text-[12px] font-bold text-[#b0b0b0] hover:text-[#05050a] transition-colors">View All</button>
                    </div>
                    <div className="premium-card rounded-[32px] overflow-hidden">
                        <div className="divide-y divide-black/[0.04]">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 px-8 py-6 transition-colors hover:bg-black/[0.01] group">
                                    <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-[#b8ff00] font-black text-[12px] shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                                        P{i}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[15px] font-black text-[#05050a] truncate">Patient #{i + 1240}</span>
                                        <span className="text-[12px] font-medium text-[#8a8a8a] truncate">General Follow-up • Follow-up</span>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-1">
                                        <Badge className="bg-[#b8ff00]/10 text-[#05050a] border border-[#b8ff00]/20 rounded-lg text-[10px] uppercase font-black">Video</Badge>
                                        <span className="text-[11px] font-bold text-[#b0b0b0]">{10 + i}:30 AM</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Doctor Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-[20px] font-black tracking-tight text-[#05050a] px-2" style={{ fontFamily: "var(--font-display)" }}>Clinical Logic</h3>

                    <div className="space-y-4">
                        <button
                            className="w-full premium-card rounded-[24px] p-6 flex items-center gap-5 transition-all text-left group"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-[#b8ff00]/10 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-[#05050a]">Add New Patient</span>
                                <span className="text-[12px] font-medium text-[#8a8a8a]">Manual entry for office visits</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 text-[#b0b0b0]" />
                        </button>

                        <button
                            className="w-full premium-card rounded-[24px] p-6 flex items-center gap-5 transition-all text-left group"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-[#05050a]">Prescription Templates</span>
                                <span className="text-[12px] font-medium text-[#8a8a8a]">Speed up your documentation</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 text-[#b0b0b0]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
